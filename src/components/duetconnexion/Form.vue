<template>
  <v-form>
    <v-container fluid>
      <v-row>
        <!-- todo : fix the dateTime format, not supported by default on vuetify -->
        <v-col cols="12" sm="6" md="6">
          <InputDate
            v-model="item.date"
            :label="$t('date')"
            :error-messages="dateErrors"
            required
          />
        </v-col>

        <v-col cols="12" sm="6" md="6">
          <v-text-field
            v-model="item.ipRequest"
            :error-messages="ipRequestErrors"
            :label="$t('ipRequest')"
            required
            @input="$v.item.ipRequest.$touch()"
            @blur="$v.item.ipRequest.$touch()"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" sm="6" md="6">
          <v-text-field
            v-model="item.result"
            :error-messages="resultErrors"
            :label="$t('result')"
            required
            @input="$v.item.result.$touch()"
            @blur="$v.item.result.$touch()"
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
  name: 'DuetConnexionForm',
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
        date: null,
        ipRequest: null,
        result: null,
    };
  },
  computed: {

    // eslint-disable-next-line
    item() {
      return this.initialValues || this.values;
    },

    dateErrors() {
      const errors = [];

      if (!this.$v.item.date.$dirty) return errors;

      has(this.violations, 'date') && errors.push(this.violations.date);

      !this.$v.item.date.required && errors.push(this.$t('Field is required'));

      return errors;
    },
    ipRequestErrors() {
      const errors = [];

      if (!this.$v.item.ipRequest.$dirty) return errors;

      has(this.violations, 'ipRequest') && errors.push(this.violations.ipRequest);

      !this.$v.item.ipRequest.required && errors.push(this.$t('Field is required'));

      return errors;
    },
    resultErrors() {
      const errors = [];

      if (!this.$v.item.result.$dirty) return errors;

      has(this.violations, 'result') && errors.push(this.violations.result);

      !this.$v.item.result.required && errors.push(this.$t('Field is required'));

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
      date: {
        required,
        date,
      },
      ipRequest: {
        required,
      },
      result: {
        required,
      },
    }
  }
};
</script>
