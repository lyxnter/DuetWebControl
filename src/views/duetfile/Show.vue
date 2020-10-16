<template>
  <div>
    <Toolbar :handle-delete="del">
      <template slot="left">
        <v-toolbar-title v-if="item">{{
          `${$options.servicePrefix} ${item['@id']}`
        }}</v-toolbar-title>
      </template>
    </Toolbar>

    <br />

    <div v-if="item" class="table-duetfile-show">
      <v-simple-table>
        <template slot="default">
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>

              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>{{ $t('contentUrl') }}</strong></td>
              <td>
                                    {{ item['contentUrl'] }}
              </td>
            
              <td><strong>{{ $t('duetFile') }}</strong></td>
              <td>
                                    {{ item['duetFile'] }}
              </td>
            </tr>
            
            <tr>
              <td><strong>{{ $t('fileName') }}</strong></td>
              <td>
                                    {{ item['fileName'] }}
              </td>
            
              <td><strong>{{ $t('fileSize') }}</strong></td>
              <td>
                {{ $n(item['fileSize']) }}              </td>
            </tr>
            
            <tr>
              <td><strong>{{ $t('updatedAt') }}</strong></td>
              <td>
                {{ formatDateTime(item['updatedAt'], 'long') }}              </td>
            
              <td><strong>{{ $t('mimeType') }}</strong></td>
              <td>
                                    {{ item['mimeType'] }}
              </td>
            </tr>
            
            <tr>
              <td><strong>{{ $t('originalName') }}</strong></td>
              <td>
                                    {{ item['originalName'] }}
              </td>
            
              <td><strong>{{ $t('filePathSD') }}</strong></td>
              <td>
                                    {{ item['filePathSD'] }}
              </td>
            </tr>
            
            <tr>
              <td><strong>{{ $t('transfertSD') }}</strong></td>
              <td>
                                    {{ item['transfertSD'] }}
              </td>
            
              <td></td>
            </tr>
            
          </tbody>
        </template>
      </v-simple-table>
    </div>

    <Loading :visible="isLoading" />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { mapFields } from 'vuex-map-fields';
import Loading from '../../components/Loading';
import ShowMixin from '../../mixins/ShowMixin';
import Toolbar from '../../components/Toolbar';

const servicePrefix = 'DuetFile';

export default {
  name: 'DuetFileShow',
  servicePrefix,
  components: {
      Loading,
      Toolbar
  },
  mixins: [ShowMixin],
  computed: {
    ...mapFields('duetfile', {
      isLoading: 'isLoading'
    }),
    ...mapGetters('duetfile', ['find'])
  },
  methods: {
    ...mapActions('duetfile', {
      deleteItem: 'del',
      reset: 'reset',
      retrieve: 'load'
    })
  }
};
</script>
