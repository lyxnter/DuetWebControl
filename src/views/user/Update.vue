<template>
  <div>
    <Toolbar
      :handle-submit="onSendForm"
      :handle-reset="resetForm"
      :handle-delete="del"
      >
        <template slot="left">
          <v-toolbar-title v-if="item" class="hidden-md-and-down">
            <h1><v-icon large>mdi-cctv</v-icon>{{ item['name'] }}</h1>
          </v-toolbar-title>
        </template>
    </Toolbar>
    <AccessoryForm
      ref="updateForm"
      v-if="item"
      :values="item"
      :errors="violations"
    />
    <Loading :visible="isLoading || deleteLoading" />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { mapFields } from 'vuex-map-fields';
import AccessoryForm from '../../components/accessory/Form.vue';
import Loading from '../../components/Loading';
import Toolbar from '../../components/Toolbar';
import UpdateMixin from '../../mixins/UpdateMixin';

const servicePrefix = 'Accessory';

export default {
  name: 'AccessoryUpdate',
  servicePrefix,
  mixins: [UpdateMixin],
  components: {
    Loading,
    Toolbar,
    AccessoryForm
  },

  computed: {
    ...mapFields('accessory', {
      deleteLoading: 'isLoading',
      isLoading: 'isLoading',
      error: 'error',
      updated: 'updated',
      violations: 'violations'
    }),
    ...mapGetters('accessory', ['find'])

  },

  methods: {
    ...mapActions('accessory', {
      deleteItem: 'del',
      retrieve: 'load',
      update: 'update',
    })
  }
};
</script>
