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
            v-model.number="item.type"
            :error-messages="typeErrors"
            :label="$t('type')"
            required
            @input="$v.item.type.$touch()"
            @blur="$v.item.type.$touch()"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" sm="6" md="6">
          <v-text-field
            v-model.number="item.sequence"
            :error-messages="sequenceErrors"
            :label="$t('sequence')"
            required
            @input="$v.item.sequence.$touch()"
            @blur="$v.item.sequence.$touch()"
          />
        </v-col>

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
      </v-row>

      <v-row>
        <v-col cols="12" sm="6" md="6">
          <v-text-field
            v-model.number="item.cpuServerMin"
            :error-messages="cpuServerMinErrors"
            :label="$t('cpuServerMin')"
            step="0.1"
            @input="$v.item.cpuServerMin.$touch()"
            @blur="$v.item.cpuServerMin.$touch()"
          />
        </v-col>

        <v-col cols="12" sm="6" md="6">
          <v-text-field
            v-model.number="item.cpuServerMax"
            :error-messages="cpuServerMaxErrors"
            :label="$t('cpuServerMax')"
            step="0.1"
            @input="$v.item.cpuServerMax.$touch()"
            @blur="$v.item.cpuServerMax.$touch()"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" sm="6" md="6">
          <v-text-field
            v-model.number="item.cpuServerCur"
            :error-messages="cpuServerCurErrors"
            :label="$t('cpuServerCur')"
            step="0.1"
            @input="$v.item.cpuServerCur.$touch()"
            @blur="$v.item.cpuServerCur.$touch()"
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
  name: 'DuetStatutForm',
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
        type: null,
        sequence: null,
        result: null,
        cpuServerMin: null,
        cpuServerMax: null,
        cpuServerCur: null,
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
    typeErrors() {
      const errors = [];

      if (!this.$v.item.type.$dirty) return errors;

      has(this.violations, 'type') && errors.push(this.violations.type);

      !this.$v.item.type.required && errors.push(this.$t('Field is required'));

      return errors;
    },
    sequenceErrors() {
      const errors = [];

      if (!this.$v.item.sequence.$dirty) return errors;

      has(this.violations, 'sequence') && errors.push(this.violations.sequence);

      !this.$v.item.sequence.required && errors.push(this.$t('Field is required'));

      return errors;
    },
    resultErrors() {
      const errors = [];

      if (!this.$v.item.result.$dirty) return errors;

      has(this.violations, 'result') && errors.push(this.violations.result);

      !this.$v.item.result.required && errors.push(this.$t('Field is required'));

      return errors;
    },
    cpuServerMinErrors() {
      const errors = [];

      if (!this.$v.item.cpuServerMin.$dirty) return errors;

      has(this.violations, 'cpuServerMin') && errors.push(this.violations.cpuServerMin);


      return errors;
    },
    cpuServerMaxErrors() {
      const errors = [];

      if (!this.$v.item.cpuServerMax.$dirty) return errors;

      has(this.violations, 'cpuServerMax') && errors.push(this.violations.cpuServerMax);


      return errors;
    },
    cpuServerCurErrors() {
      const errors = [];

      if (!this.$v.item.cpuServerCur.$dirty) return errors;

      has(this.violations, 'cpuServerCur') && errors.push(this.violations.cpuServerCur);


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
      type: {
        required,
      },
      sequence: {
        required,
      },
      result: {
        required,
      },
      cpuServerMin: {
      },
      cpuServerMax: {
      },
      cpuServerCur: {
      },
    }
  }
};
</script>
