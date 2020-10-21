import isObject from 'lodash/isObject';
import { ENTRYPOINT } from '../config/entrypoint';
import SubmissionError from '../error/SubmissionError';
import { normalize } from './hydra';

const MIME_TYPE = 'application/ld+json';

const makeParamArray = (key, arr) =>
  arr.map(val => `${key}[]=${val}`).join('&');

export default function(id, options = {}) {

 const entryPoint = ENTRYPOINT + (ENTRYPOINT.endsWith('/') ? '' : '/');
 options.credentials = 'include';
 if (options.file) {
   var formdata = new FormData();
   formdata.append("file", options.file.file);
   options.body = formdata;
   options.redirect = 'follow';
 } else if (options.download) {
   options.redirect = 'follow';
 } else {
   if ('undefined' === typeof options.headers) options.headers = new Headers();


   if (null === options.headers.get('Connection')) options.headers.set('Connection', 'keep-alive');

   if (null === options.headers.get('Accept'))
     options.headers.set('Accept', MIME_TYPE);

   if (
     'undefined' !== options.body &&
     !(options.body instanceof FormData) &&
     null === options.headers.get('Content-Type')
   )
     options.headers.set('Content-Type', MIME_TYPE);

   if (options.params) {
     let queryString = Object.keys(options.params)
       .map(key =>
         Array.isArray(options.params[key])
           ? makeParamArray(key, options.params[key])
           : `${key}=${options.params[key]}`
       )
       .join('&');
     id = `${id}?${queryString}`;
   }



   const payload = options.body && JSON.parse(options.body);
   if (isObject(payload) && payload['@id'])
     options.body = JSON.stringify(normalize(payload));


   //options.headers.set('Access-Control-Allow-Credentials', true);
 }

  return global.fetch(new URL(id, entryPoint), options).then(response => {
    if (response.ok) {
      return response;
    }
    if (response.status == 403) {

      console.log('pas les droits');
    }
    return response.json().then(
      json => {
        const error =
          json['hydra:description'] ||
          json['hydra:title'] ||
          json['message'] ||
          'An error occurred.';
        if (!json.violations) throw Error(error);

        let errors = { _error: error };
        json.violations.forEach(violation =>
          errors[violation.propertyPath]
            ? (errors[violation.propertyPath] +=
            '\n' + errors[violation.propertyPath])
            : (errors[violation.propertyPath] = violation.message)
        );
        throw new SubmissionError(errors);
      },
      () => {
        throw new Error(response.statusText || 'An error occurred.');
      }
    );
  });
}
