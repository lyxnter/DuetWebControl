<template>
  <div class="duetfile-list">
    <Toolbar :handle-add="addHandler" />

    <v-container grid-list-xl fluid>
      <v-layout row wrap>
        <v-flex sm12>
          <h1>DuetFile List</h1>
        </v-flex>
        <v-flex lg12>
          <DataFilter :handle-filter="onSendFilter" :handle-reset="resetFilter">
            <DuetFileFilterForm
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
                <template slot="item.fileSize" slot-scope="{ item }">
                  {{ $n(item['fileSize']) }}
                </template>
                <template slot="item.updatedAt" slot-scope="{ item }">
                  {{ formatDateTime(item['updatedAt'], 'long') }}
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
import DuetFileFilterForm from '../../components/duetfile/Filter';
import DataFilter from '../../components/DataFilter';
import Toolbar from '../../components/Toolbar';

export default {
  name: 'DuetFileList',
  servicePrefix: 'DuetFile',
  mixins: [ListMixin],
  components: {
    Toolbar,
    ActionCell,
    DuetFileFilterForm,
    DataFilter
  },
  data() {
    return {
      headers: [
        { text: 'contentUrl', value: 'contentUrl' },
        { text: 'duetFile', value: 'duetFile' },
        { text: 'fileName', value: 'fileName' },
        { text: 'fileSize', value: 'fileSize' },
        { text: 'updatedAt', value: 'updatedAt' },
        { text: 'mimeType', value: 'mimeType' },
        { text: 'originalName', value: 'originalName' },
        { text: 'filePathSD', value: 'filePathSD' },
        { text: 'transfertSD', value: 'transfertSD' },
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
    ...mapGetters('duetfile', {
      items: 'list'
    }),
    ...mapFields('duetfile', {
      deletedItem: 'deleted',
      error: 'error',
      isLoading: 'isLoading',
      resetList: 'resetList',
      totalItems: 'totalItems',
      view: 'view'
    })
  },
  methods: {
    ...mapActions('duetfile', {
      getPage: 'fetchAll',
      deleteItem: 'del'
    })
  }
};
</script>
