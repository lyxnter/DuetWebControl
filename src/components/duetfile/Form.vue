<template>
  <v-form>
    <v-container fluid>
      <v-row>
        <v-col cols="12" sm="6" md="6">
          <v-text-field
            v-model="item.contentUrl"
            :error-messages="contentUrlErrors"
            :label="$t('contentUrl')"
            @input="$v.item.contentUrl.$touch()"
            @blur="$v.item.contentUrl.$touch()"
          />
        </v-col>

        <v-col cols="12" sm="6" md="6">
          <v-text-field
            v-model="item.duetFile"
            :error-messages="duetFileErrors"
            :label="$t('duetFile')"
            @input="$v.item.duetFile.$touch()"
            @blur="$v.item.duetFile.$touch()"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" sm="6" md="6">
          <v-text-field
            v-model="item.fileName"
            :error-messages="fileNameErrors"
            :label="$t('fileName')"
            @input="$v.item.fileName.$touch()"
            @blur="$v.item.fileName.$touch()"
          />
        </v-col>

        <v-col cols="12" sm="6" md="6">
          <v-text-field
            v-model.number="item.fileSize"
            :error-messages="fileSizeErrors"
            :label="$t('fileSize')"
            @input="$v.item.fileSize.$touch()"
            @blur="$v.item.fileSize.$touch()"
          />
        </v-col>
      </v-row>

      <v-row>
        <!-- todo : fix the dateTime format, not supported by default on vuetify -->
        <v-col cols="12" sm="6" md="6">
          <InputDate
            v-model="item.updatedAt"
            :label="$t('updatedAt')"
            :error-messages="updatedAtErrors"
            required
          />
        </v-col>

        <v-col cols="12" sm="6" md="6">
          <v-text-field
            v-model="item.mimeType"
            :error-messages="mimeTypeErrors"
            :label="$t('mimeType')"
            @input="$v.item.mimeType.$touch()"
            @blur="$v.item.mimeType.$touch()"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" sm="6" md="6">
          <v-text-field
            v-model="item.originalName"
            :error-messages="originalNameErrors"
            :label="$t('originalName')"
            @input="$v.item.originalName.$touch()"
            @blur="$v.item.originalName.$touch()"
          />
        </v-col>

        <v-col cols="12" sm="6" md="6">
          <v-text-field
            v-model="item.filePathSD"
            :error-messages="filePathSDErrors"
            :label="$t('filePathSD')"
            @input="$v.item.filePathSD.$touch()"
            @blur="$v.item.filePathSD.$touch()"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" sm="6" md="6">
          <v-checkbox
            v-model="item.transfertSD"
            :error-messages="transfertSDErrors"
            :label="$t('transfertSD')"
            required
            @input="$v.item.transfertSD.$touch()"
            @blur="$v.item.transfertSD.$touch()"
          />
        </v-col>

        <v-col cols="12"></v-col>
      </v-row>

    </v-container>
  </v-form>
</template>

<script>
import has from 'lodash/has';
import { validationMixin } from 'vuelidate';
import { required } from 'vuelidate/lib/validators';

import InputDate from '../InputDate';
import { date } from '../../validators/date';

export default {
  name: 'DuetFileForm',
  mixins: [validationMixin],
  components: {
    InputDate,
  },
  props: {
    values: {
      type: Object,
      required: true
    },

    errors: {
      type: Object,
      default: () => {}
    },

    initialValues: {
      type: Object,
      default: () => {}
    }
  },
  mounted() {
  },
  data() {
    return {
        contentUrl: null,
        duetFile: null,
        fileName: null,
        fileSize: null,
        updatedAt: null,
        mimeType: null,
        originalName: null,
        filePathSD: null,
        transfertSD: null,
    };
  },
  computed: {

    // eslint-disable-next-line
    item() {
      return this.initialValues || this.values;
    },

    contentUrlErrors() {
      const errors = [];

      if (!this.$v.item.contentUrl.$dirty) return errors;

      has(this.violations, 'contentUrl') && errors.push(this.violations.contentUrl);


      return errors;
    },
    duetFileErrors() {
      const errors = [];

      if (!this.$v.item.duetFile.$dirty) return errors;

      has(this.violations, 'duetFile') && errors.push(this.violations.duetFile);


      return errors;
    },
    fileNameErrors() {
      const errors = [];

      if (!this.$v.item.fileName.$dirty) return errors;

      has(this.violations, 'fileName') && errors.push(this.violations.fileName);


      return errors;
    },
    fileSizeErrors() {
      const errors = [];

      if (!this.$v.item.fileSize.$dirty) return errors;

      has(this.violations, 'fileSize') && errors.push(this.violations.fileSize);


      return errors;
    },
    updatedAtErrors() {
      const errors = [];

      if (!this.$v.item.updatedAt.$dirty) return errors;

      has(this.violations, 'updatedAt') && errors.push(this.violations.updatedAt);

      !this.$v.item.updatedAt.required && errors.push(this.$t('Field is required'));

      return errors;
    },
    mimeTypeErrors() {
      const errors = [];

      if (!this.$v.item.mimeType.$dirty) return errors;

      has(this.violations, 'mimeType') && errors.push(this.violations.mimeType);


      return errors;
    },
    originalNameErrors() {
      const errors = [];

      if (!this.$v.item.originalName.$dirty) return errors;

      has(this.violations, 'originalName') && errors.push(this.violations.originalName);


      return errors;
    },
    filePathSDErrors() {
      const errors = [];

      if (!this.$v.item.filePathSD.$dirty) return errors;

      has(this.violations, 'filePathSD') && errors.push(this.violations.filePathSD);


      return errors;
    },
    transfertSDErrors() {
      const errors = [];

      if (!this.$v.item.transfertSD.$dirty) return errors;

      has(this.violations, 'transfertSD') && errors.push(this.violations.transfertSD);

      !this.$v.item.transfertSD.required && errors.push(this.$t('Field is required'));

      return errors;
    },

    violations() {
      return this.errors || {};
    }
  },
  methods: {
  },
  validations: {
    item: {
      contentUrl: {
      },
      duetFile: {
      },
      fileName: {
      },
      fileSize: {
      },
      updatedAt: {
        required,
        date,
      },
      mimeType: {
      },
      originalName: {
      },
      filePathSD: {
      },
      transfertSD: {
        required,
      },
    }
  }
};
</script>
