<template>
	<v-layout column>
		<v-flex>
			<h1>{{$t('menu.control.command')}} </h1>
			<div>
			<template>
			  <v-data-table
			    :headers="headers"
			    :items="commands"
					:pagination.sync="pagination"
			    class="elevation-1"
			  >
			    <template v-slot:items="props">
			      <td>{{ formatDateTime(props.item.dateStart, 'long') }}</td>
			      <td >{{ props.item.command }}</td>

			    </template>
			  </v-data-table>
			</template>
		</div>
		</v-flex>
	</v-layout>
</template>

<script>
'use strict'

import { mapState, mapActions } from 'vuex'
import { formatDateTime, formatDate } from '../../utils/dates';

export default {
	computed: {
		...mapState({
			isLocal: state => state.isLocal,
			}),
		},
		methods: {
			...mapActions('machine', ['getCommandList']),
			formatDateTime,
			formatDate,
			async loadCommand() {
				this.commands = await this.getCommandList();
			}
		},
		mounted() {
			this.loadCommand();
		},
		data () {
		 return {
			 pagination: {
				 sortBy: 'dateStart',
				 descending: true,
				 rowsPerPage: 25,
			 },
			 headers: [
				 {
					 text: 'Date',
					 align: 'left',
					 value: 'dateStart'
				 },
				 { text: 'Commande', value: 'command' },
			 ],
			 commands: [
			 ]
		 }
	 }
	}
</script>
