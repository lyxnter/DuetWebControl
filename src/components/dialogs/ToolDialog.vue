<template>
	<v-dialog v-model="shown" persistent width="480">
		<v-card>
			<v-card-title>
				<span class="headline"> {{ $t('loadTool.enableTool') }} </span>
			</v-card-title>

			<v-card-text>
				<template v-if="loading">
					<v-progress-linear indeterminate></v-progress-linear>
				</template>
				<v-tabs v-if="!loading" grow>
					<v-tabs-slider color="primary"></v-tabs-slider>
					<v-tab v-for="(material, key) in tools" :key="key" :class="{selected: false && material.selected}">
						<div style="width: 50px; height: 50px; margin: 0 auto">
							<img :src="material.ico" width="50px" height="50px" alt="">
						</div>
						{{ material.tech }}
					</v-tab>
					<v-tab-item v-for="(material, key) in tools" :key="key">
						<v-list v-if="!loading">
							<v-list-item v-for="(tool, index) in material.tools" :key="index" @click.stop.prevent="tool.selected != tool.selected" :class="{'toolLocal': isLocal, selected: tool.selected}">
								<div @click.stop.prevent="tool.selected = !tool.selected" style="width: 100%; padding: 10px">
									<div style="width: 10%; display: inline-block; text-align: center">
										<v-icon class="mr-1">
											{{ 'radio_button_unchecked' }}
										</v-icon>
										<v-icon class="mr-1" :style="'position: absolute;left: 8%;top: 25%;color: hsl(43, 98%, 50%);font-size: 18px;'">
											{{ tool.selected ? 'done' : '' }}
										</v-icon>
									</div>
									<div style="width: 15%; display: inline-block">
										{{ tool.name }}
									</div>
									<div style="width: 15%; display: inline-block">
										{{ tool.appro }}
									</div>
									<div style="width: 15%; display: inline-block">
										{{ tool.model }}
									</div>
									<div style="width: 15%; display: inline-block">
										{{ tool.opt }}
									</div>
									<div style="width: 15%; display: inline-block">
										{{ tool.version }}
									</div>
									<!--div style="display: inline-block" @click.stop.prevent="deleteTool(key, index)">
										<v-icon class="mr-1" :style="'position: absolute;right: 5%;top: 25%;color: darkgray;'">
											{{ 'delete' }}
										</v-icon>
									</div-->
								</div>
							</v-list-item>
						</v-list>
					</v-tab-item>
				</v-tabs>
			</v-card-text>

			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn color="primary" @click="dismissed" flat>
					{{ $t('generic.cancel') }}
				</v-btn>
				<v-btn color="primary" @click="confirmed" flat>
					{{ $t('generic.ok') }}
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
'use strict'

import { mapState, mapActions, mapMutations } from 'vuex'

import Path from '../../utils/path.js'

export default {
	props: {
		shown: {
			type: Boolean,
			required: true
		},
	},
	computed: {
		...mapState({isLocal: state => state.isLocal,}),
	},
	data() {
		return {
			tool: undefined,
			tools: [],
			loading: false,
			load: true,
			item: false,
		}
	},
	methods: {
		...mapActions('machine', ['sendCode', 'getFileList', 'download', 'upload']),
		...mapMutations('machine', ['setTool']),
		...mapState({
			getTool: state => state.user.loadedTool,
		}),
		async confirmed() {
			await this.uploadConfig();
			this.$emit('confirmed');
			this.$emit('update:shown', false);
		},
		dismissed() {
			this.$emit('dismissed');
			this.$emit('update:shown', false);
		},
		async loadTools() {
			if (this.loading) {
				return;
			}

			this.loading = true
			try {
				this.tools = [];
				let result = await this.download({filename: Path.sys+"/selectedTools.json", showSuccess: false, showProgress: false});
				if (result) this.tools = result;
				//console.log(this.tools)
				const response = await this.getFileList(Path.macros+"/_Toolheads");
				//console.log(response)
				if (response){
					let tools = response.filter(item => item.isDirectory).map(item => item.directory+"/"+item.name);
					//console.log(tools);
					let len = tools.length;
					let that = this;
					for (var i = 0; i < len; i++){
						let response = await this.getFileList(tools[i]);
						response.forEach(
							function (tool) {
								var material = (tools[i].substr(tools[i].lastIndexOf('/')+1,3));
								if (that.tools.length == 0 || that.tools.filter(tool => tool.tech == material).length == 0) {
									that.tools.push({
										"selected": false,
										"ico": "/img/ressources/Medium_universe_" + material + ".svg",
										"tech": material,
										"tools" : [],
									});
									console.log("new material : " + material, tool);
								}
								var materialIndex = that.tools.findIndex(tool => tool.tech == material)
								if (tool.name.startsWith("_Load")) {
									let path = tool.directory + "/" + tool.name
									if (that.tools[materialIndex].tools.filter(item => item.path == path).length == 0) {
										let params = tool.name.substr(6).split('_')
										let name = params[0];
										let appro = params.length == 4 ? params[1] : '';
										let model = params.length == 4 ? params[2].split("~")[0] : ''
										let opt = params.length == 4 && params[2].split("~").length == 2 ? params[2].split("~")[1] : ''
										let version = params.length == 4 ? params[3].substring(1, params[3].length-2) : params[1].substring(1, params[1].length-2)
										console.log(path)
										console.log(name)
										console.log(appro)
										console.log(model)
										console.log(opt)
										console.log(version)
										that.tools[materialIndex].tools.push({
											"selected": false,
											"path": path,
											"version": version,
											"name": name,
											"io":name.length > 3 ? name.substr(3) : "",
											"opt": opt,
											"model":  model,
											"appro": appro,
										})
									}

								}
							});
						}
					}
				} catch (e) {
					console.log(e)
				}
				this.loading = false;
			},
			async uploadConfig() {
				let json = JSON.stringify(this.tools)
				//console.log(json);
				try {
					await this.upload({ filename: Path.sys+"/selectedTools.json", content: json });
				} catch(e) {
					console.log("Error: " + (e.err == 1 ? "no such file" : "not mounted"));
					console.error(e);// TODO Optionally ask user to save file somewhere else
				}
			},
			deleteTool: function(mater, tool) {
				console.log(mater, tool)
				console.log(this[tool]);
				this.tools[mater].tools.splice(tool,1)
			}
		},
		mounted() {
			//setTimeout(this.loadTools, 1000 + Math.random() * 1000);
		},
		watch: {
			shown(to) {
				if (to) {
					// Load tools when this dialog is shown
					this.loadTools();
				}
			},
			tools: {
				deep: true,
				handler() {
					//console.log(this.tools)
					if(this.tools){
						this.tools.forEach((material) => {
							material.selected = !material.tools.every(tool => !tool.selected)
						});
					}
				}
			}
		}
	}
	</script>
	<style scoped>
	table {
		border-collapse: collapse;
	}
	thead, tr {
		text-align: center;
		border: 1px solid #000;
		font-size: large;
	}

	tr {
		height: 64px
	}

	.v-input {
		width: 32px;
		margin: 16px;
		text-align: center;
	}

	tr:hover {
		background: #888;
	}

	.selected {
		background: #636363;
	}
	</style>
