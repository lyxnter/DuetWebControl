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

    <div v-if="item" class="table-duetconnexion-show">
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
            
              <td><strong>{{ $t('ipRequest') }}</strong></td>
              <td>
                                    {{ item['ipRequest'] }}
              </td>
            </tr>
            
            <tr>
              <td><strong>{{ $t('result') }}</strong></td>
              <td>
                                    {{ item['result'] }}
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

const servicePrefix = 'DuetConnexion';

export default {
  name: 'DuetConnexionShow',
  servicePrefix,
  components: {
      Loading,
      Toolbar
  },
  mixins: [ShowMixin],
  computed: {
    ...mapFields('duetconnexion', {
      isLoading: 'isLoading'
    }),
    ...mapGetters('duetconnexion', ['find'])
  },
  methods: {
    ...mapActions('duetconnexion', {
      deleteItem: 'del',
      reset: 'reset',
      retrieve: 'load'
    })
  }
};
</script>
