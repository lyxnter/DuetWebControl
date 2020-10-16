<template>
  <div class="duetgcode-list">
    <Toolbar :handle-add="addHandler" />

    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex sm12>
          <h1>DuetGcode List</h1>
        </v-flex>
        <v-flex lg12>
          <DataFilter :handle-filter="onSendFilter" :handle-reset="resetFilter">
            <DuetGcodeFilterForm
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
            :loading-text="$t('Loading...')"
            :options.sync="options"
            :server-items-length="totalItems"
            class="elevation-1"
            item-key="@id"
            show-select
            @update:options="onUpdateOptions"
          >
                <template slot="item.dateStart" slot-scope="{ item }">
                  {{ formatDateTime(item['dateStart'], 'long') }}
                </template>
                <template slot="item.dateEnd" slot-scope="{ item }">
                  {{ formatDateTime(item['dateEnd'], 'long') }}
                </template>
                <template slot="item.sequence" slot-scope="{ item }">
                  {{ $n(item['sequence']) }}
                </template>

            <ActionCell
              slot="item.action"
              slot-scope="props"
              :handle-show="() => showHandler(props.item)"
              :handle-edit="() => editHandler(props.item)"
              :handle-delete="() => deleteHandler(props.item)"
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
import DuetGcodeFilterForm from '../../components/duetgcode/Filter';
import DataFilter from '../../components/DataFilter';
import Toolbar from '../../components/Toolbar';

export default {
  name: 'DuetGcodeList',
  servicePrefix: 'DuetGcode',
  mixins: [ListMixin],
  components: {
    Toolbar,
    ActionCell,
    DuetGcodeFilterForm,
    DataFilter
  },
  data() {
    return {
      headers: [
        { text: 'dateStart', value: 'dateStart' },
        { text: 'dateEnd', value: 'dateEnd' },
        { text: 'command', value: 'command' },
        { text: 'sequence', value: 'sequence' },
        {
          text: 'Actions',
          value: 'action',
          sortable: false
        }
      ],
      selected: []
    };
  },
  computed: {
    ...mapGetters('duetgcode', {
      items: 'list'
    }),
    ...mapFields('duetgcode', {
      deletedItem: 'deleted',
      error: 'error',
      isLoading: 'isLoading',
      resetList: 'resetList',
      totalItems: 'totalItems',
      view: 'view'
    })
  },
  methods: {
    ...mapActions('duetgcode', {
      getPage: 'fetchAll',
      deleteItem: 'del'
    })
  }
};
</script>
