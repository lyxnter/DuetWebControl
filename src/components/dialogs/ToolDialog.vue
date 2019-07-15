<template>
	<v-dialog v-model="shown" persistent width="480">
		<v-card>
			<v-card-title>
				<span class="headline">{{ $t(!load ? 'dialog.tool.titleUnload' : 'dialog.tool.titleLoad') }}</span>
			</v-card-title>

			<v-card-text>
				{{ $t('dialog.tool.prompt') }}

				<v-progress-linear indeterminate v-if="loading"></v-progress-linear>
				<v-list v-if="!loading">
					<v-list-tile v-for="tool in tools" :key="tool.name" @click="toolClick(tool)">
						<img :src="tool.ico" style="width: 40px; margin-right:15px" > {{ load ? tool.name.substring(6) : tool.name.substring(8) }}
					</v-list-tile>
				</v-list>
			</v-card-text>

			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn color="blue darken-1" flat @click="hide">{{ $t('generic.cancel') }}</v-btn>
				<v-spacer></v-spacer>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
'use strict'

import { mapState, mapActions, mapMutations } from 'vuex'

import { DisconnectedError } from '../../utils/errors.js'
import Path from '../../utils/path.js'

export default {
	props: {
		shown: {
			type: Boolean,
			required: true
		},
		load: {
			type: Boolean,
			required: true,
		}

	},
	computed: {
	},
	data() {
		return {
			tool: undefined,
			tools: [],
			loading: false,
		}
	},
	methods: {
		...mapActions('machine', ['sendCode', 'getFileList']),
		...mapMutations('machine', ['setTool']),
		...mapState({
			getTool: state => state.user.loadedTool,
		}),
		async loadTools() {
			if (this.loading) {
				return;
			}

			this.loading = true
			try {
				this.tools = [];
				const response = await this.getFileList(Path.macros+"/_Tools");
				let tools = response.filter(item => item.isDirectory).map(item => item.name);
				console.log(tools);
				let len = tools.length;
				let that = this;
				console.log(this.getTool())
				for (var i = 0; i < len; i++){
					let response = await this.getFileList(Path.macros+"/_Tools/"+tools[i]);
					response.forEach(
						function (tool) {
							if (tool.name.includes("Filament")) {
								tool.ico = "/img/ressources/Medium_universe_FIL.svg"
							} else if (tool.name.includes("Liquid")) {
								tool.ico = "/img/ressources/Medium_universe_LIQ.svg"
							}  else if (tool.name.includes("Paste")) {
								tool.ico = "/img/ressources/Medium_universe_PAS.svg"
							} else {
								tool.ico = "/img/ressources/file.png"
							}
							(that.load ? tool.name.includes("_Load") : tool.name.includes("_Unload")) ?
							that.tools.push({
								'path': Path.macros+"/_Tools/"+tools[i],
								'name': tool.name,
								'ico' : tool.ico,
							}) : undefined;
						});
				}
				console.log(this.tools);
			} catch (e) {
				if (!(e instanceof DisconnectedError)) {
					console.warn(e);
					this.$log('error', this.$t('error.toolsLoadFailed'), e.message);
				}
				this.hide();
			}
			this.loading = false;
		},
		toolClick(tool) {
			this.hide();
			//console.log(tool);
			let code = 'M98 P"' + tool.path + '/' + tool.name + '"';
			//console.log(code);
			this.sendCode(code);
			let myTool = tool.name;
			if (tool.name.lastIndexOf(".") > 0){
				myTool = myTool.substring(this.load?6:8,myTool.lastIndexOf("."));
				console.log(myTool);
			} else {
			 	myTool = myTool.substring(this.load?6:8);
				console.log(myTool)
			}
			this.$store.commit('setTool', this.load ? myTool : '');

			this.$emit('tool_loaded', tool)
		},
		hide() {
			this.$emit('update:shown', false);
		}
	},
	watch: {
		shown(to) {
			if (to) {
				// Load tools when this dialog is shown
				this.loadTools();
			}
		}
	}
}
</script>
