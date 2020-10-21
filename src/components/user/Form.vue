<template>
  <v-form>
    <v-container fluid>
      <v-row>
        <v-col cols="12" sm="6" md="6">
          <v-text-field
            v-model="item.name"
            :error-messages="nameErrors"
            :label="$t('profile.accessory.name')"
            required
            @input="$v.item.name.$touch()"
            @blur="$v.item.name.$touch()"
          />
        </v-col>

        <v-col cols="12" sm="6" md="6">
          <v-text-field
            v-model="item.model"
            :error-messages="modelErrors"
            :label="$t('profile.accessory.model')"
            required
            @input="$v.item.model.$touch()"
            @blur="$v.item.model.$touch()"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" sm="6" md="6">
          <v-text-field
            v-model="item.version"
            :error-messages="versionErrors"
            :label="$t('profile.accessory.version')"
            required
            @input="$v.item.version.$touch()"
            @blur="$v.item.version.$touch()"
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

export default {
  name: 'AccessoryForm',
  mixins: [validationMixin],
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
        name: null,
        model: null,
        version: null,
    };
  },
  computed: {

    // eslint-disable-next-line
    item() {
      return this.initialValues || this.values;
    },

    nameErrors() {
      const errors = [];

      if (!this.$v.item.name.$dirty) return errors;

      has(this.violations, 'name') && errors.push(this.violations.name);

      !this.$v.item.name.required && errors.push(this.$t('global.field_required'));

      return errors;
    },
    modelErrors() {
      const errors = [];

      if (!this.$v.item.model.$dirty) return errors;

      has(this.violations, 'model') && errors.push(this.violations.model);

      !this.$v.item.model.required && errors.push(this.$t('global.field_required'));

      return errors;
    },
    versionErrors() {
      const errors = [];

      if (!this.$v.item.version.$dirty) return errors;

      has(this.violations, 'version') && errors.push(this.violations.version);

      !this.$v.item.version.required && errors.push(this.$t('global.field_required'));

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
      name: {
        required,
      },
      model: {
        required,
      },
      version: {
        required,
      },
    }
  }
};
</script>
