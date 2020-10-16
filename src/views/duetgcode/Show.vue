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

    <div v-if="item" class="table-duetgcode-show">
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
              <td><strong>{{ $t('dateStart') }}</strong></td>
              <td>
                {{ formatDateTime(item['dateStart'], 'long') }}              </td>
            
              <td><strong>{{ $t('dateEnd') }}</strong></td>
              <td>
                {{ formatDateTime(item['dateEnd'], 'long') }}              </td>
            </tr>
            
            <tr>
              <td><strong>{{ $t('command') }}</strong></td>
              <td>
                                    {{ item['command'] }}
              </td>
            
              <td><strong>{{ $t('sequence') }}</strong></td>
              <td>
                {{ $n(item['sequence']) }}              </td>
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

const servicePrefix = 'DuetGcode';

export default {
  name: 'DuetGcodeShow',
  servicePrefix,
  components: {
      Loading,
      Toolbar
  },
  mixins: [ShowMixin],
  computed: {
    ...mapFields('duetgcode', {
      isLoading: 'isLoading'
    }),
    ...mapGetters('duetgcode', ['find'])
  },
  methods: {
    ...mapActions('duetgcode', {
      deleteItem: 'del',
      reset: 'reset',
      retrieve: 'load'
    })
  }
};
</script>
