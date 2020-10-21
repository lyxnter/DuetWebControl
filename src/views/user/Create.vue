<template>
  <div>
    <Toolbar :handle-submit="onSendForm" :handle-reset="resetForm">
      <template slot="left">
        <v-toolbar-title v-if="item" class="hidden-md-and-down">
          <h1><v-icon large>mdi-cctv</v-icon>{{$t('profile.accessory.accessories')}}</h1>
        </v-toolbar-title>
      </template>
    </Toolbar>
    <AccessoryForm ref="createForm" :values="item" :errors="violations" />
    <Loading :visible="isLoading" />
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { createHelpers } from 'vuex-map-fields';
import AccessoryForm from '../../components/accessory/Form';
import Loading from '../../components/Loading';
import Toolbar from '../../components/Toolbar';
import CreateMixin from '../../mixins/CreateMixin';

const servicePrefix = 'User';

const { mapFields } = createHelpers({
  getterType: 'accessory/getField',
  mutationType: 'accessory/updateField'
});

export default {
  name: 'AccessoryCreate',
  servicePrefix,
  mixins: [CreateMixin],
  components: {
    Loading,
    Toolbar,
    AccessoryForm
  },
  data() {
    return {
      item: {}
    };
  },
  computed: {
    ...mapFields(['error', 'isLoading', 'created', 'violations'])
  },
  methods: {
    ...mapActions('accessory', ['create', 'reset'])
  }
};
</script>
