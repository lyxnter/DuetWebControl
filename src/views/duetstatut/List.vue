<template>
  <div class="duetstatut-list">
    <Toolbar :handle-add="addHandler" />

    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex sm12>
          <h1>DuetStatut List</h1>
        </v-flex>
        <v-flex lg12>
          <DataFilter :handle-filter="onSendFilter" :handle-reset="resetFilter">
            <DuetStatutFilterForm
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
                <template slot="item.date" slot-scope="{ item }">
                  {{ formatDateTime(item['date'], 'long') }}
                </template>
                <template slot="item.type" slot-scope="{ item }">
                  {{ $n(item['type']) }}
                </template>
                <template slot="item.sequence" slot-scope="{ item }">
                  {{ $n(item['sequence']) }}
                </template>
                <template slot="item.cpuServerMin" slot-scope="{ item }">
                  {{ $n(item['cpuServerMin']) }}
                </template>
                <template slot="item.cpuServerMax" slot-scope="{ item }">
                  {{ $n(item['cpuServerMax']) }}
                </template>
                <template slot="item.cpuServerCur" slot-scope="{ item }">
                  {{ $n(item['cpuServerCur']) }}
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
import DuetStatutFilterForm from '../../components/duetstatut/Filter';
import DataFilter from '../../components/DataFilter';
import Toolbar from '../../components/Toolbar';

export default {
  name: 'DuetStatutList',
  servicePrefix: 'DuetStatut',
  mixins: [ListMixin],
  components: {
    Toolbar,
    ActionCell,
    DuetStatutFilterForm,
    DataFilter
  },
  data() {
    return {
      headers: [
        { text: 'date', value: 'date' },
        { text: 'type', value: 'type' },
        { text: 'sequence', value: 'sequence' },
        { text: 'result', value: 'result' },
        { text: 'cpuServerMin', value: 'cpuServerMin' },
        { text: 'cpuServerMax', value: 'cpuServerMax' },
        { text: 'cpuServerCur', value: 'cpuServerCur' },
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
    ...mapGetters('duetstatut', {
      items: 'list'
    }),
    ...mapFields('duetstatut', {
      deletedItem: 'deleted',
      error: 'error',
      isLoading: 'isLoading',
      resetList: 'resetList',
      totalItems: 'totalItems',
      view: 'view'
    })
  },
  methods: {
    ...mapActions('duetstatut', {
      getPage: 'fetchAll',
      deleteItem: 'del'
    })
  }
};
</script>
