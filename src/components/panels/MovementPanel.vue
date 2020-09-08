<style>
.move-btn {
	padding-left: 0;
	padding-right: 0;
	min-width: 0;
}

.center-menu-item > div {
	justify-content: center;
}

.local {
	font-size: large;
}
</style>

<template>
	<v-card>
		<v-card-title class="pt-2 pb-0" :class="{local: isLocal}">
			<code-btn color="primary darken-1" small code="G28" :title="$t('button.home.titleAll')" class="ml-0 hidden-sm-and-down" :disabled="disabled">
				{{ $t('button.home.captionAll') }}
			</code-btn>
			<code-btn color="primary darken-1" small code="M98 P0:/macros/_Machine/_Park position" :title="'Move the toolhead into it\'s parking position'" class="ml-0 hidden-sm-and-down" :disabled="disabled">
				{{ $t('button.parkHead.caption') }}
			</code-btn>

			<v-spacer class="hidden-sm-and-down"></v-spacer>

			<v-icon small class="mr-1">swap_horiz</v-icon>
			{{ $t('panel.movement.caption') }}

			<v-spacer></v-spacer>

			<v-menu offset-y left :disabled="uiFrozen || disabled" v-tab-control :close-on-content-click="false">
				<template slot="activator">
					<v-btn color="primary darken-1" small class="mx-0" :disabled="uiFrozen">
						{{ $t('panel.movement.compensation') }} <v-icon>arrow_drop_down</v-icon>
					</v-btn>
				</template>

				<v-card>
					<v-list>
						<template v-if="move.compensation">
							<v-list-tile class="center-menu-item">
								{{ $t('panel.movement.compensationInUse', [move.compensation]) }}
							</v-list-tile>
							<v-divider></v-divider>
						</template>
						<v-list-tile @click="getTool.toUpperCase().startsWith('CAL') ? sendCode('G32') : null" :disabled="!getTool.toUpperCase().startsWith('CAL')">
							<v-icon class="mr-1">view_module</v-icon> {{ $t('panel.movement.runDelta') }}
						</v-list-tile>
						<v-list-tile :disabled="tools.length == 0" @click="nozzleHeightCalib">
							<v-icon class="mr-1">vertical_align_bottom</v-icon> {{ $t('panel.movement.runNozzleHeight') }}
						</v-list-tile>
						<v-expansion-panel :value="-1" style="margin-bottom: 15px">
							<v-expansion-panel-content style="background: #ffffff0f">
								<template v-slot:header style="padding: 0">
									<span style="font-size: normal;">
										{{ $t('panel.settingsNetwork.advanced' )}}
									</span>
								</template>
								<v-card style="background: #4d4d4d; padding: 0 20px">
									<v-list-tile :disabled="!move.compensation || move.compensation.indexOf('Point') === -1" @click="sendCode('M561')">
										<v-icon class="mr-1">clear</v-icon> {{ $t('panel.movement.disableBedCompensation') }}
									</v-list-tile>
									<v-divider></v-divider>
									<v-list style="background: #4d4d4d;">
										<v-list-tile @click="sendCode('G29')" :disabled="!getTool.toUpperCase().startsWith('CAL')">
											<v-icon class="mr-1">grid_on</v-icon> {{ $t('panel.movement.runMesh') }}
										</v-list-tile>
										<v-list-tile :disabled="!getTool.toUpperCase().startsWith('CAL')" @click="showMeshEditDialog = true">
											<v-icon class="mr-1">view_module</v-icon> {{ $t('panel.movement.editMesh') }}
										</v-list-tile>
										<v-list-tile @click="sendCode('G29 S1')">
											<v-icon class="mr-1">save</v-icon> {{ $t('panel.movement.loadMesh') }}
										</v-list-tile>
										<v-list-tile @click="$router.push('/Heightmap')">
											<v-icon class="mr-1">grid_on</v-icon> {{ $t('panel.movement.showHeightmap') }}
										</v-list-tile>
										<v-list-tile :disabled="move.compensation !== 'Mesh'" @click="sendCode('G29 S2')">
											<v-icon class="mr-1">grid_off</v-icon> {{ $t('panel.movement.disableMeshCompensation') }}
										</v-list-tile>
									</v-list>
								</v-card>
							</v-expansion-panel-content>
						</v-expansion-panel>
					</v-list>
				</v-card>
			</v-menu>
		</v-card-title>

		<v-card-text class="pt-0 pb-2">
			<!-- Mobile home buttons -->
			<v-layout justify-center row wrap class="hidden-md-and-up">
				<v-flex>
					<v-layout row>
						<code-btn color="primary darken-1" code="G28" :title="$t('button.home.titleAll')" v-bind:class="{local: isLocal}" block :disabled="disabled">
							{{ $t('button.home.captionAll') }}
						</code-btn>
						<code-btn color="primary darken-1"  code="M98 P0:/macros/_Machine/_Park position" :title="'Move the toolhead into it\'s parking position'" v-bind:class="{local: isLocal}" block style="margin: 6px" :disabled="disabled">
							{{ $t('button.parkHead.caption') }}
						</code-btn>
					</v-layout>
				</v-flex>
				<v-flex v-for="axis in displayedAxes.filter(() => move.geometry.type != 'delta')" :key="axis.letter">
					<code-btn :color="axis.homed ? 'primary darken-1' : 'warning'" :disabled="uiFrozen" :title="$t('button.home.title', [axis.letter])" :code="`G28 ${axis.letter}`" block>
						{{ $t('button.home.caption', [axis.letter]) }}
					</code-btn>
				</v-flex>
			</v-layout>

			<v-layout row>
				<!-- Regular home buttons -->
				<v-flex shrink class="hidden-sm-and-down" v-if="move.geometry.type !== 'delta'">
					<v-layout column>
						<v-flex v-for="axis in displayedAxes" :key="axis.letter">
							<code-btn :color="axis.homed ? 'primary darken-1' : 'warning'" :disabled="uiFrozen || disabled" :title="$t('button.home.title', [axis.letter])" :code="`G28 ${axis.letter}`" class="ml-0">
								{{ $t('button.home.caption', [axis.letter]) }}
							</code-btn>
						</v-flex>
					</v-layout>
				</v-flex>

				<!-- Jog control -->
				<v-flex>
					<v-layout row wrap>
						<!-- Decreasing movements -->
						<v-flex>
							<v-layout row>
								<!-- Decreasing movements -->
								<v-flex v-for="index in numMoveSteps" :key="-index" :class="getMoveCellClass(index - 1)">
									<v-layout column>
										<v-flex v-for="axis in displayedAxes" :key="axis.letter">
											<code-btn :code="`G91\nG1 ${axis.letter}${-moveSteps(axis.letter)[index - 1]} F${Math.round(moveFeedrate * 60)}\nG90`" no-wait @contextmenu.prevent="showMoveStepDialog(axis.letter, index - 1)" block class="move-btn"  v-bind:class="{local: isLocal}" :disabled="disabled">
												<v-icon>keyboard_arrow_left</v-icon> {{ axis.letter + -moveSteps(axis.letter)[index - 1] }}
											</code-btn>
										</v-flex>
									</v-layout>
								</v-flex>
							</v-layout>
						</v-flex>

						<v-flex shrink class="hidden-sm-and-down px-1"></v-flex>

						<!-- Increasing movements -->
						<v-flex>
							<v-layout row>
								<v-flex v-for="index in numMoveSteps" :key="index" :class="getMoveCellClass(numMoveSteps - index)">
									<v-layout column>
										<v-flex v-for="axis in displayedAxes" :key="axis.letter">
											<code-btn :code="`G91\nG1 ${axis.letter}${moveSteps(axis.letter)[numMoveSteps - index]} F${Math.round(moveFeedrate * 60)}\nG90`" no-wait @contextmenu.prevent="showMoveStepDialog(axis.letter, numMoveSteps - index)" block class="move-btn"  v-bind:class="{local: isLocal}" :disabled="disabled">
												{{ axis.letter + '+' + moveSteps(axis.letter)[numMoveSteps - index] }} <v-icon>keyboard_arrow_right</v-icon>
											</code-btn>
										</v-flex>
									</v-layout>
								</v-flex>
							</v-layout>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
		</v-card-text>

		<mesh-edit-dialog :shown.sync="showMeshEditDialog"></mesh-edit-dialog>
		<input-dialog :shown.sync="moveStepDialog.shown" :title="$t('dialog.changeMoveStep.title')" :prompt="$t('dialog.changeMoveStep.prompt')" :preset="moveStepDialog.preset" is-numeric-value @confirmed="moveStepDialogConfirmed"></input-dialog>

		<v-alert v-if="unhomedAxes.length" :value="true" type="warning">
			{{ $tc('panel.movement.axesNotHomed', unhomedAxes.length) }}
			<strong>
				{{ unhomedAxes.map(axis => axis.letter).reduce((a, b) => `${a}, ${b}`) }}
			</strong>
		</v-alert>

		<v-alert :value="!move.axes.length" type="info">
			{{ $t('panel.movement.noAxes') }}
		</v-alert>
	</v-card>
</template>

<script>
'use strict'

import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'

export default {
	computed: {
		...mapGetters(['isConnected', 'uiFrozen']),
		...mapState('machine/model', ['move', 'tools', 'state']),
		...mapState('machine/settings', ['moveFeedrate']),
		...mapState(['isLocal']),
		...mapGetters('machine/settings', ['moveSteps', 'numMoveSteps']),
		displayedAxes() { return this.move.axes.filter(axis => axis.visible); },
		unhomedAxes() { return this.move.axes.filter(axis => axis.visible && !axis.homed); },
		...mapState({
			name: state => state.machine.model.network.name,
			getTool: state => state.user.loadedTool,
		}),
		...mapState('machine/model', {
			disabled: (state) => {state = state.state; return ['updating', 'halted', 'pausing', 'resuming', 'processing', 'simulating', 'busy', 'changingTool'].indexOf(state.status) >= 0},
		}),
		//['updating', 'off', 'halted', 'pausing', 'paused', 'resuming', 'processing', 'simulating', 'busy', 'changingTool', 'idle']
	},
	data() {
		return {
			dropdownShown: false,
			showMeshEditDialog: false,
			moveStepDialog: {
				shown: false,
				axis: 'X',
				index: 0,
				preset: 0
			},
			b4: "",
			toolHeads: "",
		}
	},
	methods: {
		...mapActions('machine', ['getFileList', 'sendCode', 'download', 'upload']),
		...mapMutations('machine/settings', ['setMoveStep']),
		getMoveCellClass(index) {
			let classes = '';
			if (index === 0 || index === 5) {
				classes += 'hidden-lg-and-down';
			}
			if (index > 1 && index < 4 && index % 2 === 1) {
				classes += 'hidden-md-and-down';
			}
			return classes;
		},
		showMoveStepDialog(axis, index) {
			this.moveStepDialog.axis = axis;
			this.moveStepDialog.index = index;
			this.moveStepDialog.preset = this.moveSteps(this.moveStepDialog.axis)[this.moveStepDialog.index];
			this.moveStepDialog.shown = true;
		},
		moveStepDialogConfirmed(value) {
			this.setMoveStep({ axis: this.moveStepDialog.axis, index: this.moveStepDialog.index, value });
		},
		nozzleHeightCalib: async function() {
			console.log("Running Nozzle Height");
			const files = await this.getFileList("0:/macros/_Toolheads");

			let params = this.name.substr(8).split('_')
			let name = params[0];
			let appro = params.length == 4 ? params[1] : '';
			let model = params.length == 4 ? params[2].split("~")[0] : ''
			//		let opt = params.length == 4 && params[2].split("~").length == 2 ? params[2].split("~")[1] : ''
			let vers = params.length == 4 ? params[3].substring(1, params[3].length) : params[1].substring(1, params[1].length)

			let tools = files.filter(tool => tool.name.includes(name) && tool.name.includes(appro) && tool.name.includes(model) && tool.name.includes(vers))

			/*console.log(name)
			console.log(appro)
			console.log(model)
			console.log(opt)
			console.log(vers)

			console.log(tools.length ? tools : "");
			*/
			let that = this;
			tools.forEach(function(item) {
				if (item.isDirectory)
				{
					console.log(item);
					that.preloadToolMatrix(item.directory + "/" + item.name)
				}
			});
		},
		preloadToolMatrix: async function(path){
			try {
				let files = await this.getFileList(path);
				//console.log(this.name)
				let config = files.filter(file => file.name.startsWith("Toolmatrix_") && !file.isDirectory)
				if (config.length > 1) {
					let name = (this.name.lastIndexOf("~")>0?this.name.substr(this.name.lastIndexOf("~")+1, 2):"");
					config = config.filter(file => file.name.includes(name))
				}
				console.log('config', config);
				files = files.filter(file => file.name.startsWith("_Nozzle height calibration") && !file.isDirectory)
				if (files.length > 1) {
					let name = (this.name.lastIndexOf("~")>0?this.name.substr(this.name.lastIndexOf("~")+1, 2):"");
					files = files.filter(file => file.name.includes(name) )
				}
				console.log('nozzle macro', files);
				let that = this;
				files.forEach(function (file) {
					if(file != undefined && file.name.startsWith("_Nozzle height calibration")) {
						that.sendCode('M98 P' + files[0].directory + "/" + files[0].name)
					}
				});
				//console.log(that.state.status)
				let inter = setInterval(async function(that) {
					//console.log(that.state.status)
					if(that.state.status == 'idle') {
						clearInterval(inter)
						that.saveToolOffset(config[0].directory + '/' + config[0].name)
					}
				}, 1000, that)
			} catch(e) {
				console.error(e);
			}
		},
		saveToolOffset: async function(filename) {
			this.b4 = [];
			this.toolHeads = [];
			let result = await this.download({ filename, type: 'text', showSuccess: false });
			let data = result.split("\n");
			this.b4[0] = "";
			let indexB4 = 0;
			var lines = [];
			let toolNum = -1;
			for( var i = 0; i < data.length; i++)
			{
				if (data[i].includes("G10") || data[i].includes("M563")) {
					lines.push(data[i]);
					if (this.b4[indexB4] != "") {
						indexB4 ++ ;
						this.b4[indexB4] = "";
					}
				} else if (data[i] !== "" && data[i] !== "\n"){
					this.b4[indexB4] += data[i] + "\n";
				}
			}
			for (i = 0; i < lines.length; i++)
			{
				var line = lines[i].substring(0, lines[i].indexOf(";")).split(" ");
				for( var j = 0; j < line.length; j++)
				{
					if (line[0] === "G10"){
						if (line[j].includes("P")) { //Tool number
							if ((this.toolHeads[toolNum] == undefined) || (this.toolHeads[toolNum+1] == undefined && this.toolHeads[toolNum].t !== parseInt(line[j].substring(1)))) {
								toolNum++;
								//console.log("G10: tool " + parseInt(line[j].substring(1)) +" found");
								this.toolHeads[toolNum] = {};
								this.toolHeads[toolNum].t = parseInt(line[j].substring(1))
								this.toolHeads[toolNum].offsets = []
							}
						} else if(line[j].includes("X")) { // axis X-Z
							//console.log("offset X of tool " + this.toolHeads[toolNum].t + " = "+ parseFloat(line[j].substring(1)));
							this.toolHeads[toolNum].offsets[0] = parseFloat(line[j].substring(1)).toFixed(2);
						} else if(line[j].includes("Y")) {
							//console.log("offset Y of tool " + this.toolHeads[toolNum].t + " = "+ parseFloat(line[j].substring(1)));
							this.toolHeads[toolNum].offsets[1] = parseFloat(line[j].substring(1)).toFixed(2);
						} else if(line[j].includes("Z")) {
							//console.log("offset Z of tool " + this.toolHeads[toolNum].t + " = "+ parseFloat(line[j].substring(1)));
							this.toolHeads[toolNum].offsets[2] = parseFloat(line[j].substring(1)).toFixed(2);
						} else if(line[j].includes("S")) {
							//console.log("default active temp of tool " + this.toolHeads[toolNum].t + " = " + parseFloat(line[j].substring(1)));
							this.toolHeads[toolNum].s = parseFloat(line[j].substring(1)).toFixed(2);
						} else if(line[j].includes("R")) {
							//console.log("default stanby temp of tool " + this.toolHeads[toolNum].t + " = " + parseFloat(line[j].substring(1)));
							this.toolHeads[toolNum].r = parseFloat(line[j].substring(1)).toFixed(2);
						}
					} else if (line[0] === "M563") {
						if (line[j].includes("P")) {
							if ((this.toolHeads[toolNum] == undefined) || (this.toolHeads[toolNum+1] == undefined && this.toolHeads[toolNum].t !== parseInt(line[j].substring(1)))) {
								toolNum++;
								//console.log("M563: tool " + parseInt(line[j].substring(1)) +" found");
								this.toolHeads[toolNum] = {};
								this.toolHeads[toolNum].t = parseInt(line[j].substring(1))
								this.toolHeads[toolNum].offsets = []
							}
						} else if ( line[j].includes("S")) {
							var open = -1;
							var close = -1;
							do {
								if (open < 0) {
									open = line[j].indexOf("\"");
									if (open < line[j].lastIndexOf("\"")){ // IE there is a second " after the first one ex( "A+B")
										close = line[j].lastIndexOf("\"");
										this.toolHeads[toolNum].e = line[j].substring(open+1, close)
									} else {
										this.toolHeads[toolNum].e = line[j].substring(open+1);
									}
								} else if (line[j].indexOf("\"") >= 0){ // we found the closing "
									close  = line[j].indexOf("\"");
									this.toolHeads[toolNum].e += " " + line[j].substring(0,close)
								} else {
									this.toolHeads[toolNum].e += " " + line[j]
								}
								j++;
							} while (close < 0);
							j--;
							//console.log("tool " + this.toolHeads[toolNum].t +" named: " + this.toolHeads[toolNum].e);
						} else if (line[j].includes("D")) {
							//console.log("tool " + this.toolHeads[toolNum].t + " drive " + parseFloat(line[j].substring(1)));
							var drives = line[j].substring(1).split(":")
							for(var k = 0; k < drives.length; k++)
							drives[k] = parseFloat(drives[k]);
							this.toolHeads[toolNum].d = drives;
						} else if (line[j].includes("H")) {
							//console.log("tool " + this.toolHeads[toolNum].t + " heater " + parseFloat(line[j].substring(1)));
							var heaters = line[j].substring(1).split(":")
							for(k = 0; k < heaters.length; k++)
							heaters[k] = parseFloat(heaters[k]);
							this.toolHeads[toolNum].h = heaters;
						} else if (line[j].includes("F")) {
							//console.log("fan " + parseFloat(line[j].substring(1)) + "maped to tool " + this.toolHeads[toolNum].t);
							this.toolHeads[toolNum].f = parseFloat(line[j].substring(1));
						} else if (line[j].includes("L")) {
							this.toolHeads[toolNum].l = parseFloat(line[j].substring(1));
						}
					}
				}
			}
			this.sendToolMatrix(filename)
		},
		sendToolMatrix: function(filename) {
			//console.log("sending new tool matrix");
			var out = "";
			//console.trace();
			console.log(this.toolHeads)
			for (var i = 0; i < this.toolHeads.length; i++)
			{
				let tool = this.toolHeads[i];
				let sysTool = this.tools.filter((head) => tool.t == head.number)[0]
				out += (this.b4[i] == undefined?"":this.b4[i]);
				out += "\n"
				let str = "M563 P" + tool.t + " S\"" + tool.e + "\"" +
				(tool.d ? " D" + (typeof(tool.d) == typeof([]) ?  tool.d.join(':') : tool.d) : '') +
				(tool.h ? " H" + (typeof(tool.h) == typeof([]) ?  tool.h.join(':') : tool.d) : '')
				out += str.padEnd(40, ' ') + "; Define tool " + tool.t + "\n";
				str = "G10 P" + tool.t +
				( sysTool.offsets[0] != undefined ? " X" + parseFloat(sysTool.offsets[0]).toFixed(2) : '' ) +
				( sysTool.offsets[0] != undefined ? " Y" + parseFloat(sysTool.offsets[1]).toFixed(2) : '' ) +
				( sysTool.offsets[0] != undefined ? " Z" + parseFloat(sysTool.offsets[2]).toFixed(2) : '' )
				out += str.padEnd(40, ' ') + "; Set tool " + tool.t + " axis offsets\n"
				if (tool.h) {
					str = "G10 P" + tool.t + " R" + tool.r + " S" + tool.s
					out += str.padEnd(40, ' ') + "; Set initial tool " + tool.t +
					" active and standby temperatures to " + tool.s + "/" + tool.r + "°C\n";
				}
			}
			out += (this.b4[this.toolHeads.length] == undefined? "" : this.b4[this.toolHeads.length] );
			//console.log(this.tools);
			//let filename = "0:/macros/_Toolheads/" + this.toolPath[this.select].matrix;
			let data =  out;
			//console.log(filename, data);
			const content = new Blob([data]);
			try {
				this.upload({ filename: filename, content });
				this.$makeNotification('success',
				this.$t("panel.toolOffset.dialog.title"),
				this.$t("panel.toolOffset.dialog.sucess"),
				5000);
			} catch (e) {
				this.$makeNotification('error',
				this.$t("panel.toolOffset.dialog.title"),
				this.$t("panel.toolOffset.dialog.error", [(e.err == 1 ? "no such file" : "not mounted")]),
				5000);
				console.error(e);// TODO Optionally ask user to save file somewhere else
			}
		},
	},
	watch: {
		isConnected() {
			// Hide dialogs when the connection is interrupted
			this.showMeshEditDialog = false;
			this.moveStepDialog.shown = false;
		}
	}
}
</script>
