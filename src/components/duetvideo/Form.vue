<template>
  <v-form>
    <v-container fluid>
    </v-container>
  </v-form>
</template>

<script>
import { validationMixin } from 'vuelidate';


export default {
  name: 'DuetVideoForm',
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
    };
  },
  computed: {

    // eslint-disable-next-line
    item() {
      return this.initialValues || this.values;
    },


    violations() {
      return this.errors || {};
    }
  },
  methods: {
  },
  validations: {
    item: {
    }
  }
};
</script>
