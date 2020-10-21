<template>
  <div>
    <Toolbar :handle-edit="() => editHandler(item)" >
      <template slot="left">
        <v-toolbar-title v-if="item" class="hidden-md-and-down">
          <h1><v-icon large>mdi-account-group</v-icon>{{ item['prenom'] }} {{ item['nom'] }}</h1>
        </v-toolbar-title>
      </template>
    </Toolbar>

    <br />

    <div v-if="item" class="table-user-show">
      <v-simple-table>
        <template slot="default">
          <thead>
            <tr>
              <th>{{ $t('global.field') }}</th>
              <th>{{ $t('global.value') }}</th>

              <th>{{ $t('global.field') }}</th>
              <th>{{ $t('global.value') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>{{ $t('administration.user.name') }}</strong></td>
              <td>
                                    {{ item['prenom'] }}
              </td>

              <td><strong>{{ $t('administration.user.surname') }}</strong></td>
              <td>
                                    {{ item['nom'] }}
              </td>
            </tr>

            <tr>
              <td><strong>{{ $t('administration.user.email') }}</strong></td>
              <td>
                                    {{ item['email'] }}
              </td>

              <td><strong>{{ $t('administration.user.enabled') }}</strong></td>
              <td>
                                    {{ item['enabled'] }}
              </td>
            </tr>

            <tr>
              <td><strong>{{ $t('administration.user.create') }}</strong></td>
              <td>
                      {{ formatDateTime(item['dateCreation'], 'long') }}
              </td>

              <td><strong>{{ $t('administration.user.lastlogin') }}</strong></td>
              <td>
                      {{ formatDateTime(item['lastLogin'], 'long') }}
              </td>
            </tr>
            <tr>
              <td><strong>{{ $t('administration.user.passwordrequestedat') }}</strong></td>
              <td>
                      {{ formatDateTime(item['passwordRequestedAt'], 'long') }}
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

const servicePrefix = 'Accessory';

export default {
  name: 'AccessoryShow',
  servicePrefix,
  components: {
      Loading,
      Toolbar
  },
  mixins: [ShowMixin],
  computed: {
    ...mapFields('accessory', {
      isLoading: 'isLoading'
    }),
    ...mapGetters('accessory', ['find'])
  },
  methods: {
    ...mapActions('accessory', {
      deleteItem: 'del',
      reset: 'reset',
      update: 'update',
      retrieve: 'load'
    })
  }
};
</script>
