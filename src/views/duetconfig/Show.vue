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

    <div v-if="item" class="table-duetconfig-show">
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
              <td><strong>{{ $t('date') }}</strong></td>
              <td>
                {{ formatDateTime(item['date'], 'long') }}              </td>
            
              <td><strong>{{ $t('enable') }}</strong></td>
              <td>
                                    {{ item['enable'] }}
              </td>
            </tr>
            
            <tr>
              <td><strong>{{ $t('configAdditional') }}</strong></td>
              <td>
                                    {{ item['configAdditional'] }}
              </td>
            
              <td><strong>{{ $t('config') }}</strong></td>
              <td>
                                    {{ item['config'] }}
              </td>
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

const servicePrefix = 'DuetConfig';

export default {
  name: 'DuetConfigShow',
  servicePrefix,
  components: {
      Loading,
      Toolbar
  },
  mixins: [ShowMixin],
  computed: {
    ...mapFields('duetconfig', {
      isLoading: 'isLoading'
    }),
    ...mapGetters('duetconfig', ['find'])
  },
  methods: {
    ...mapActions('duetconfig', {
      deleteItem: 'del',
      reset: 'reset',
      retrieve: 'load'
    })
  }
};
</script>
