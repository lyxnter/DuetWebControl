<template>
  <v-container fluid>
  </v-container>
</template>

<script>

export default {
  name: 'DuetStatutFilter',
  props: {
    values: {
      type: Object,
      required: true
    }
  },
  data() {
    return {};
  },
  mounted() {
  },

  computed: {
    // eslint-disable-next-line
    item() {
      return this.initialValues || this.values;
    }
  },
  methods: {
  }
};
</script>
