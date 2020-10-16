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
          <v-checkbox
            v-model="item.enable"
            :error-messages="enableErrors"
            :label="$t('enable')"
            required
            @input="$v.item.enable.$touch()"
            @blur="$v.item.enable.$touch()"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" sm="6" md="6">
          <v-text-field
            v-model="item.configAdditional"
            :error-messages="configAdditionalErrors"
            :label="$t('configAdditional')"
            @input="$v.item.configAdditional.$touch()"
            @blur="$v.item.configAdditional.$touch()"
          />
        </v-col>

        <v-col cols="12" sm="6" md="6">
          <v-text-field
            v-model="item.config"
            :error-messages="configErrors"
            :label="$t('config')"
            @input="$v.item.config.$touch()"
            @blur="$v.item.config.$touch()"
          />
        </v-col>
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
  name: 'DuetConfigForm',
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
        enable: null,
        configAdditional: null,
        config: null,
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
    enableErrors() {
      const errors = [];

      if (!this.$v.item.enable.$dirty) return errors;

      has(this.violations, 'enable') && errors.push(this.violations.enable);

      !this.$v.item.enable.required && errors.push(this.$t('Field is required'));

      return errors;
    },
    configAdditionalErrors() {
      const errors = [];

      if (!this.$v.item.configAdditional.$dirty) return errors;

      has(this.violations, 'configAdditional') && errors.push(this.violations.configAdditional);


      return errors;
    },
    configErrors() {
      const errors = [];

      if (!this.$v.item.config.$dirty) return errors;

      has(this.violations, 'config') && errors.push(this.violations.config);


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
      enable: {
        required,
      },
      configAdditional: {
      },
      config: {
      },
    }
  }
};
</script>
