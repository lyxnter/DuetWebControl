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

    <div v-if="item" class="table-duetstatut-show">
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
            
              <td><strong>{{ $t('type') }}</strong></td>
              <td>
                {{ $n(item['type']) }}              </td>
            </tr>
            
            <tr>
              <td><strong>{{ $t('sequence') }}</strong></td>
              <td>
                {{ $n(item['sequence']) }}              </td>
            
              <td><strong>{{ $t('result') }}</strong></td>
              <td>
                                    {{ item['result'] }}
              </td>
            </tr>
            
            <tr>
              <td><strong>{{ $t('cpuServerMin') }}</strong></td>
              <td>
                {{ $n(item['cpuServerMin']) }}              </td>
            
              <td><strong>{{ $t('cpuServerMax') }}</strong></td>
              <td>
                {{ $n(item['cpuServerMax']) }}              </td>
            </tr>
            
            <tr>
              <td><strong>{{ $t('cpuServerCur') }}</strong></td>
              <td>
                {{ $n(item['cpuServerCur']) }}              </td>
            
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

const servicePrefix = 'DuetStatut';

export default {
  name: 'DuetStatutShow',
  servicePrefix,
  components: {
      Loading,
      Toolbar
  },
  mixins: [ShowMixin],
  computed: {
    ...mapFields('duetstatut', {
      isLoading: 'isLoading'
    }),
    ...mapGetters('duetstatut', ['find'])
  },
  methods: {
    ...mapActions('duetstatut', {
      deleteItem: 'del',
      reset: 'reset',
      retrieve: 'load'
    })
  }
};
</script>
