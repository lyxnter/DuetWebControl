import moment from 'moment';

const formatDate = function(date) {
  if (!date) return null;

  return moment(date).format('DD/MM/YYYY');
};

const formatDateTime = function(date) {
  if (!date) return null;

  return moment(date).format('DD/MM/YYYY HH:mm');
};

export { formatDateTime,formatDate };
