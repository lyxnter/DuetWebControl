<template>
  <v-form>
    <v-container fluid>
      <v-row>
        <!-- todo : fix the dateTime format, not supported by default on vuetify -->
        <v-col cols="12" sm="6" md="6">
          <InputDate
            v-model="item.dateStart"
            :label="$t('dateStart')"
            :error-messages="dateStartErrors"
            required
          />
        </v-col>

        <!-- todo : fix the dateTime format, not supported by default on vuetify -->
        <v-col cols="12" sm="6" md="6">
          <InputDate
            v-model="item.dateEnd"
            :label="$t('dateEnd')"
            :error-messages="dateEndErrors"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" sm="6" md="6">
          <v-text-field
            v-model="item.command"
            :error-messages="commandErrors"
            :label="$t('command')"
            required
            @input="$v.item.command.$touch()"
            @blur="$v.item.command.$touch()"
          />
        </v-col>

        <v-col cols="12" sm="6" md="6">
          <v-text-field
            v-model.number="item.sequence"
            :error-messages="sequenceErrors"
            :label="$t('sequence')"
            @input="$v.item.sequence.$touch()"
            @blur="$v.item.sequence.$touch()"
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
  name: 'DuetGcodeForm',
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
        dateStart: null,
        dateEnd: null,
        command: null,
        sequence: null,
    };
  },
  computed: {

    // eslint-disable-next-line
    item() {
      return this.initialValues || this.values;
    },

    dateStartErrors() {
      const errors = [];

      if (!this.$v.item.dateStart.$dirty) return errors;

      has(this.violations, 'dateStart') && errors.push(this.violations.dateStart);

      !this.$v.item.dateStart.required && errors.push(this.$t('Field is required'));

      return errors;
    },
    dateEndErrors() {
      const errors = [];

      if (!this.$v.item.dateEnd.$dirty) return errors;

      has(this.violations, 'dateEnd') && errors.push(this.violations.dateEnd);


      return errors;
    },
    commandErrors() {
      const errors = [];

      if (!this.$v.item.command.$dirty) return errors;

      has(this.violations, 'command') && errors.push(this.violations.command);

      !this.$v.item.command.required && errors.push(this.$t('Field is required'));

      return errors;
    },
    sequenceErrors() {
      const errors = [];

      if (!this.$v.item.sequence.$dirty) return errors;

      has(this.violations, 'sequence') && errors.push(this.violations.sequence);


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
      dateStart: {
        required,
        date,
      },
      dateEnd: {
        date,
      },
      command: {
        required,
      },
      sequence: {
      },
    }
  }
};
</script>
