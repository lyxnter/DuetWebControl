<template>
  <div class="user-list">
    <Toolbar :handle-add="addHandler" />

    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex sm12>
          <h1><v-icon large>mdi-account-group</v-icon>{{$t('administration.user.users')}}</h1>
        </v-flex>
        <v-flex lg12>
          <DataFilter :handle-filter="onSendFilter" :handle-reset="resetFilter">
            <UserFilterForm
              ref="filterForm"
              :values="filters"
              slot="filter"
            />
          </DataFilter>

          <br />

          <v-data-table
            v-model="selected"
            :headers="headers"
            :items="items"
            :items-per-page.sync="options.itemsPerPage"
            :loading="isLoading"
            :loading-text="$t('global.loading')"
            :options.sync="options"
            :server-items-length="totalItems"
            class="elevation-1"
            item-key="@id"
            show-select
            @update:options="onUpdateOptions"
          >

            <ActionCell
              slot="item.action"
              slot-scope="props"
              :handle-show="() => showHandler(props.item)"
              :handle-edit="() => editHandler(props.item)"
            ></ActionCell>
          </v-data-table>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { mapFields } from 'vuex-map-fields';
import ListMixin from '../../mixins/ListMixin';
import ActionCell from '../../components/ActionCell';
import UserFilterForm from '../../components/user/Filter';
import DataFilter from '../../components/DataFilter';
import Toolbar from '../../components/Toolbar';

export default {
  name: 'UserList',
  servicePrefix: 'User',
  mixins: [ListMixin],
  components: {
    Toolbar,
    ActionCell,
    UserFilterForm,
    DataFilter
  },
  data() {
    return {
      headers: [
        { text: this.$t('administration.user.name'), value: 'prenom' },
        { text: this.$t('administration.user.surname'), value: 'nom' },
        { text: this.$t('administration.user.email'), value: 'email' },
        {
          text: this.$t('global.actions'),
          value: 'action',
          sortable: false
        }
      ],
      selected: []
    };
  },
  computed: {
    ...mapGetters('user', {
      items: 'list'
    }),
    ...mapFields('user', {
      deletedItem: 'deleted',
      error: 'error',
      isLoading: 'isLoading',
      resetList: 'resetList',
      totalItems: 'totalItems',
      view: 'view'
    })
  },
  methods: {
    ...mapActions('user', {
      getPage: 'fetchAll',
      deleteItem: 'del'
    })
  }
};
</script>
