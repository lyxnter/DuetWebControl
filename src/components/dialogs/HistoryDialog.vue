<template>
	<v-dialog v-model="shown" persistent >
		<v-card  >
			<v-card-title>
				<div class="headline">
			  	<v-card-text>{{ title }}</v-card-text>
				</div>
			</v-card-title>

		<template>
			<v-card-title>
				<v-text-field
					v-model="search"
					append-icon="search"
					label="Search"
					single-line
					hide-details
				></v-text-field>
			</v-card-title>
		  <v-data-table
		    :headers="headers"
		    :items="list"
				:search="search"
				:loading="isloading"
				disable-initial-sort="true"
		    class="elevation-1"
		  >
			<v-progress-linear v-slot:progress color="primary"  indeterminate ></v-progress-linear>
		    <template v-slot:items="props">
		      <td>{{ props.item.id }}</td>
		      <td>{{ props.item.execDate }}</td>
		      <td>
						<v-icon color="success" v-if="props.item.result==1" class="mr-1">assignment_turned_in</v-icon>
						<v-icon color="warning" v-if="props.item.result==2" class="mr-1">assignment_late</v-icon>
						<v-icon color="error" v-if="props.item.result==3" class="mr-1">assignment_late</v-icon>
					</td>
		      <td>{{ props.item.reason }}</td>
		      <td><v-btn icon @click="playVideo(props.item.timelapsePath)" :value="props.item.timelapsePath"><v-icon>video_call</v-icon></v-btn></td>


		      <td>{{ props.item.logFolder }}</td>
		    </template>
				<template v-slot:no-data>
					<v-alert :value="false" color="darken-1" icon="warning">
						{{ $t('$vuetify.noDataText') }}
					</v-alert>
				</template>
		  </v-data-table>
		</template>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn v-bind:color="'primary'+' darken-1'" flat @click="dismissed">{{ $t('generic.close') }}</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
import {  mapState, mapActions } from 'vuex'

	'use strict'
	export default {
		computed: {
			...mapState('machine/model', ['state']),
			...mapState({selectedMachine: state => state.selectedMachine}),
		},
		data () {
      return {
				search: '',
        headers: [
          { text: this.$t('list.history.id'),value: 'id'  },
          { text: this.$t('list.history.date'), value: 'execDate' },
          { text: this.$t('list.history.result'), value: 'result' },
          { text: this.$t('list.history.reasons'), value: 'reason' },
          { text: this.$t('list.history.timelapse'), value: 'timelapsePath' },
          { text: this.$t('list.history.logs'), value: 'logFolder' }
        ],
				list: this.list,
		   	isloading: true,
      }
		},
		props: {
			title: {
				type: String,
				required: true
			},
			prompt: {
				type: String,
				required: true
			},
			shown: {
				type: Boolean,
				required: true
			},
			item: {
				type: Object,
				required: false
			},

		},
		...mapState('machine/model', ['state']),
		...mapState({selectedMachine: state => state.selectedMachine}),
		methods: {
			...mapActions('machine', ['getFileHistory']),
			dismissed() {
				this.$emit('update:shown', false);
			},
			async refreshData() {
			  this.isloading = true;
				this.list= await this.getFileHistory(this.item.id);
				this.isloading = false;
			},
			playVideo(url) {
				window.open("https://" + this.selectedMachine + url);
			},
		},
		watch: {
			shown(val) {
				if (!val) return
				this.refreshData();
			},

		}

	}
</script>

<style>

</style>
