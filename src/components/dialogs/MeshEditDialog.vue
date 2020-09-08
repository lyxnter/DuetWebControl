<style scoped>
.v-list__tile__title {
	height: auto;
}

.v-list__tile__content:hover {
	font-size: 19px;
	background: rgba(255,255,255,0.08);
}

</style>
<template>
	<v-layout row justify-center>
		<v-dialog v-model="shown" max-width="600px">
			<v-card>
				<v-form ref="form" @submit.prevent="apply">
					<v-card-title>
						<span class="headline">{{ $t('dialog.meshEdit.title') }}</span>
					</v-card-title>
					<v-card-text>
						<v-tabs v-model="outer" grow>
							<v-tabs-slider color="primary"></v-tabs-slider>
							<v-tab key="0_presets">
								<span style="font-size: large;">
									<v-icon class="mr-1">view_module</v-icon> {{ $t('panel.movement.runAdvanced') }}
								</span>
							</v-tab>
							<v-tab key="1_custom">
								<span style="font-size: large;">
									<v-icon class="mr-1">edit</v-icon> {{ $t('dialog.meshEdit.new') }}
								</span>
							</v-tab>
							<v-tab-item key="0_presets">
								<v-card style="background: #4d4d4d; padding: 0 20px">
									<v-list-tile>
										<div style="display: inline-block; width: 25px; height: 25px; margin: 10px 5px -5px 17px ;overflow: hidden; border-radius: 50%; margin-bottom: 0px;">
										</div>
										<div style="width: 15%; display: inline-block; text-align: center"> Calibration </div>
										<div style="width: 15%; display: inline-block; text-align: center">{{ $t('panel.tools.chamber', ['']) }}</div>
										<div style="width: 15%; display: inline-block; text-align: center">{{ $t('panel.tools.bed', ['']) }}</div>
										<div style="width: 20%; display: inline-block; text-align: center">{{ $t('dialog.meshEdit.diameter') }}</div>
									</v-list-tile>
									<v-list-tile @click="getTool.toUpperCase().startsWith('CAL') ? sendCode('G32') : null" :disabled="!getTool.toUpperCase().startsWith('CAL')">
										<v-list-tile-content>
											<v-list-tile-title>
												<div style="display: inline-block; border: 1px solid white; width: 25px; height: 25px; margin: 0 5px -5px 10px ;overflow: hidden; border-radius: 50%; margin-bottom: 0px;">
													<img src="/img/ressources/grid-icon.png" alt="" width="25px" height="25px" style="width: 60px; margin-left: -5px; height: 60px; margin-top: -5px; filter: invert(100%); background: #B0B0B0">
												</div>
												<div style="width: 15%; display: inline-block; text-align: center"> OFF </div>
												<div style="width: 15%; display: inline-block; text-align: center">{{ 'Off' }}</div>
												<div style="width: 15%; display: inline-block; text-align: center">{{ 'Off' }}</div>
												<div style="width: 20%; display: inline-block; text-align: center">{{ 380 }}mm</div>
											</v-list-tile-title>
										</v-list-tile-content>
									</v-list-tile>
									<v-list-tile v-for="calibration in calibrations.filter(a => !a.custom)"
										:key="calibration.path"
										@click="getTool.toUpperCase().startsWith('CAL') ? sendCode('M98 P' + calibration.path) : null"
										:disabled="!getTool.toUpperCase().startsWith('CAL')">
										<v-list-tile-content>
											<v-list-tile-title>
												<div style="display: inline-block; border: 1px solid white; width: 25px; height: 25px; margin: 0 5px -5px 10px ;overflow: hidden; border-radius: 50%; margin-bottom: 0px;">
													<img src="/img/ressources/grid-icon.png" alt="" width="25px" height="25px" style="width: 60px; margin-left: -5px; height: 60px; margin-top: -5px; filter: invert(100%); background: #B0B0B0">
												</div>
												<div style="width: 15%; display: inline-block; text-align: center">{{ calibration.name.substr(calibration.name.lastIndexOf('_')+1) }}</div>
												<div style="width: 15%; display: inline-block; text-align: center">{{ calibration.chamber }}°C</div>
												<div style="width: 15%; display: inline-block; text-align: center">{{ calibration.bed }}°C</div>
												<div style="width: 20%; display: inline-block; text-align: center">{{ 380 }}mm</div>
											</v-list-tile-title>
										</v-list-tile-content>
									</v-list-tile>
									<v-divider></v-divider>
									<v-list-tile v-for="calibration in calibrations.filter(a => a.custom)"
										:key="calibration.path"
										@click="getTool.toUpperCase().startsWith('CAL') ? sendCode('M98 P' + calibration.path) : null"
										:disabled="!getTool.toUpperCase().startsWith('CAL')">
										<v-list-tile-content>
											<v-list-tile-title>
												<div v-if="calibration.name.split('_')[1] == 'C'" style="display: inline-block; border: 1px solid white; width: 25px; height: 25px; margin: 0 5px -5px 10px ;overflow: hidden; border-radius: 50%; margin-bottom: 0px;">
													<img src="/img/ressources/grid-icon.png" alt="" width="25px" height="25px" style="width: 60px; margin-left: -5px; height: 60px; margin-top: -5px; filter: invert(100%); background: #B0B0B0">
												</div>
												<div v-else style="display: inline-block; border: 1px solid white; width: 25px; height: 25px; margin: 0 5px -5px 10px ;overflow: hidden; margin-bottom: 0px;">
													<img src="/img/ressources/grid-icon.png" alt="" width="25px" height="25px" style="width: 60px; margin-left: -4px; height: 60px; margin-top: -4px; filter: invert(100%); background: #B0B0B0">
												</div>
												<div style="width: 15%; display: inline-block; text-align: center">{{ calibration.name.substr(calibration.name.lastIndexOf('_')+1) }}</div>
												<div style="width: 15%; display: inline-block; text-align: center">{{ calibration.chamber }}°C</div>
												<div style="width: 15%; display: inline-block; text-align: center">{{ calibration.bed }}°C</div>
												<div style="width: 20%; display: inline-block; text-align: center">{{ calibration.diameter }}mm</div>
												<v-btn icon class="grey darken-1" v-on:click.stop="editContent(calibration)">
													<v-icon> edit </v-icon>
												</v-btn>
												<v-btn icon class="grey darken-1" v-on:click.stop="confirmDelete(calibration)">
													<v-icon> delete </v-icon>
												</v-btn>
											</v-list-tile-title>
										</v-list-tile-content>
									</v-list-tile>
								</v-card>
							</v-tab-item>
							<v-tab-item key="1_custom">
								<v-tabs v-model="active" grow>
									<v-tabs-slider color="primary"></v-tabs-slider>
									<v-tab key="cartesian" style="font-size: medium">
										<div style="border: 1px solid white; width: 50px; height: 50px; margin: 5px auto ;overflow: hidden; margin-bottom: 10px;">
											<img src="/img/ressources/grid-icon.png" alt="" width="50px" height="50px" style="width: 120px; margin-left: -12px; height: 120px; margin-top: -12px; filter: invert(100%); background: #B0B0B0">
										</div>
										{{ $t('dialog.meshEdit.rectangle') }}
									</v-tab>
									<v-tab key="delta" style="font-size: medium">
										<div style="border: 1px solid white; width: 50px; height: 50px; margin: 5px auto ;overflow: hidden; border-radius: 50%; margin-bottom: 10px;">
											<img src="/img/ressources/grid-icon.png" alt="" width="50px" height="50px" style="width: 120px; margin-left: -12px; height: 120px; margin-top: -11px; filter: invert(100%); background: #B0B0B0">
										</div>
										{{ $t('dialog.meshEdit.circle') }}
									</v-tab>
									<v-tab-item key="cartesian">
										<v-layout wrap>
											<v-flex xs12 sm6 md6>
												<v-text-field type="number" :label="$t('dialog.meshEdit.startCoordinate', ['X'])" v-model.number="minX" required></v-text-field>
											</v-flex>
											<v-flex xs12 sm6 md6>
												<v-text-field type="number" :label="$t('dialog.meshEdit.endCoordinate', ['X'])" v-model.number="maxX" required></v-text-field>
											</v-flex>
											<v-flex xs12 sm6 md6>
												<v-text-field type="number" :label="$t('dialog.meshEdit.startCoordinate', ['Y'])" v-model.number="minY" required></v-text-field>
											</v-flex>
											<v-flex xs12 sm6 md6>
												<v-text-field type="number" :label="$t('dialog.meshEdit.endCoordinate', ['Y'])" v-model.number="maxY" required></v-text-field>
											</v-flex>
											<v-flex xs12 sm6 md6>
												<v-text-field type="number" :label="$t('dialog.meshEdit.spacingDirection', ['X'])" v-model.number="spacingX" required></v-text-field>
											</v-flex>
											<v-flex xs12 sm6 md6>
												<v-text-field type="number" :label="$t('dialog.meshEdit.spacingDirection', ['Y'])" v-model.number="spacingY" required></v-text-field>
											</v-flex>
										</v-layout>
									</v-tab-item>
									<v-tab-item key="delta">
										<v-layout wrap>
											<v-flex xs12 sm6 md6>
												<v-text-field type="number" :label="$t('dialog.meshEdit.radius')" v-model.number="diameter" required></v-text-field>
											</v-flex>
											<v-flex xs12 sm6 md6>
												<v-text-field type="number" :label="$t('dialog.meshEdit.spacing')" v-model.number="spacing" :rules="[isValid]" required></v-text-field>
											</v-flex>
										</v-layout>
									</v-tab-item>
								</v-tabs>
								<v-layout wrap>
									<v-flex xs12 sm6 md6>
										<v-text-field type="number" :label="$t('dialog.meshEdit.bed')" v-model.number="bedTemp" required></v-text-field>
									</v-flex>
									<v-flex xs12 sm6 md6>
										<v-text-field type="number" :label="$t('dialog.meshEdit.chamber')" v-model.number="chamberTemp" required></v-text-field>
									</v-flex>
								</v-layout>
							</v-tab-item>
						</v-tabs>
					</v-card-text>
					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn v-if="outer" color="primary darken-1" flat @click="generateMacros()">
							<v-icon class="mr-1">save</v-icon>
							{{ $t('dialog.fileEdit.save') }}
						</v-btn>
						<v-btn color="primary darken-1" flat @click="hide">{{ $t('generic.close') }}</v-btn>
					</v-card-actions>
				</v-form>
			</v-card>
		</v-dialog>
		<confirm-dialog :shown.sync="deleteDialog.shown" :question="deleteDialog.question" :prompt="deleteDialog.prompt" @confirmed="doDelete" :item="deleteDialog.item"></confirm-dialog>
	</v-layout>
</template>

<script>
'use strict'

import i18n from '../../i18n'

import { mapState, mapActions } from 'vuex'

export default {
	computed: {
		...mapState('machine/model', {
			geometry: state => state.move.geometry.type
		}),
		...mapState({
			name: state => state.machine.model.network.name,
			getTool: state => state.user.loadedTool,
		})
	},
	data() {
		return {
			active: 1,
			outer: 0,

			diameter: 300,
			spacing: 15,

			minX: 0,
			maxX: 200,
			minY: 0,
			maxY: 200,
			spacingX: 20,
			spacingY: 20,

			bedTemp: 0,
			chamberTemp: 0,

			calibrations: [],
			deleteDialog: {
				question: '',
				prompt: '',
				item: undefined,
				shown: false
			},
		}
	},
	props: {
		shown: {
			type: Boolean,
			required: true
		}
	},
	methods: {
		...mapActions('machine', ['getFileList', 'sendCode', 'upload', 'delete', 'download']),
		apply() {
			if (this.$refs.form.validate()) {
				this.hide();

				this.sendCode(`M141 S${this.chamberTemp}\nM190 R${this.bedTemp}\nM191 S${this.chamberTemp}`);
				// foutre le BL touch maintenant
				if (this.geometry === 'delta') {
					this.sendCode(`M557 R${this.diameter/2} S${this.spacing}`);
				} else {
					this.sendCode(`M557 X${this.minX}:${this.maxX} Y${this.minY}:${this.maxY} S${this.spacingX}:${this.spacingY}`);
				}
			}
		},
		isValid() {
			let radius = Math.floor( ( this.diameter/2 - 0.1 ) / this.spacing ) * this.spacing
			let x = {min: -radius, max: radius+0.1}
			let y = {min: -radius, max: radius+0.1}
			let nbX = (x.max - x.min > 1 && this.spacing > 0.1) ? Math.floor((x.max - x.min)/this.spacing) + 1 : 0
			let nbY = (y.max - y.min > 1 && this.spacing > 0.1) ? Math.floor((y.max - y.min)/this.spacing) + 1 : 0
			let nbPts = nbX * nbY
			return nbPts <= 441 ? nbPts <= 441 : 'Too many points'
		},
		hide() {
			this.$emit('update:shown', false);
		},
		loadCalibFiles: async function() {
			let files = await this.getFileList("0:/macros/_Toolheads");

			let params = this.name.substr(8).split('_')
			let name = params[0];
			let appro = params.length == 4 ? params[1] : '';
			let model = params.length == 4 ? params[2].split("~")[0] : ''
			//		let opt = params.length == 4 && params[2].split("~").length == 2 ? params[2].split("~")[1] : ''
			let vers = params.length == 4 ? params[3].substring(1, params[3].length) : params[1].substring(1, params[1].length)

			let tools = files.filter(tool => tool.name.includes(name) && tool.name.includes(appro) && tool.name.includes(model) && tool.name.includes(vers) && tool.name.includes("CAL"))

			/*
			console.log(name)
			console.log(appro)
			console.log(model)
			//console.log(opt)
			console.log(vers)

			console.log(tools.length ? tools : "");
			*/

			let that = this;
			tools.forEach(async function(item) {
				if (item.isDirectory)
				{
					//console.log(item);
					files = await that.getFileList(item.directory + '/' + item.name);
					//console.log(files)
					tools = files.filter(item => item.isDirectory && (item.name.includes('Presets') || item.name.includes('Custom calibrations')))
					//console.log(tools)
					that.calibrations = []
					tools.forEach(async function(item) {
						if (item.isDirectory)
						{
							//console.log(item);
							files = await that.getFileList(item.directory + '/' + item.name);
							//console.log(files)
							tools = files.filter(item => !item.isDirectory && item.name.includes('machine'))
							//console.log(tools)
							tools.forEach(item => {
								//console.log(item)
								let calib = {
									name: item.name.split('_')[1] == 'C' || item.name.split('_')[1] == 'R' ? item.name.substr(0, 9) : item.name.substr(0, 10),
									path: item.directory + "/" + item.name,
									chamber: item.name.split('_')[2].substr(1),
									bed: item.name.split('_')[1] == 'C' || item.name.split('_')[1] == 'R' ? item.name.split('_')[3].substr(1) : item.name.split('_')[3].substr(1, item.name.split('_')[3].length-3),
									diameter: item.name.split('_')[1] == 'C' || item.name.split('_')[1] == 'R' ? item.name.split('_')[4].substr(1, item.name.split('_')[4].length-3) : null,
									custom: item.name.split('_')[1] == 'C' || item.name.split('_')[1] == 'R'
								};
								that.calibrations.push(calib)
							});
							//console.log(
							that.calibrations.sort((a,b) =>
							{
								if (!a.custom && b.custom) {
									return -1;
								}
								if (a.custom && !b.custom) {
									return 1;
								}
								if (a.custom && b.custom) {
									if (a.name > b.name) {
										return 1;
									}
									if (a.name < b.name) {
										return -1
									}
									return (a.chamber > b.chamber)
								}
								return (a.chamber > b.chamber)
							})//)
						}
					});
				}
			});
		},
		generateCalibration() {
			let output = ( this.active == 1 ? `;machine_C_C${this.chamberTemp}_B${this.bedTemp}_D${this.diameter}\n\n` : `;machine_R_C${this.chamberTemp}_B${this.bedTemp}_D` + (this.maxX - this.minX) + "," + (this.maxY - this.minY) +`\n\n`)
			output += `M291 P"Voulez vous lancer la procedure calibration geometrique?" R"Calibration automatique" S3\n\n`
			output += "; Preheat chamber\n"
			output += `M98 P"/macros/_Toolheads/CAL_v1.2.0/Custom calibrations/heat/0_Preheat_Chamber_${this.chamberTemp}.g"\n\n`
			output += "; Geometric calibration\n"
			output += "M98 P\"/macros/_Toolheads/CAL_v1.2.0/0_Geometric calibration.g\"\n\n"
			output += "; Preheat bed\n"
			output += `M98 P"/macros/_Toolheads/CAL_v1.2.0/Custom calibrations/heat/1_Preheat_Bed_${this.bedTemp}.g"\n\n`
			output += "; Mesh calibration\n"
			output += `M98 P"/macros/_Toolheads/CAL_v1.2.0/Custom calibrations/` + ( this.active == 1 ? `1_Mesh calibration ${this.diameter}.g"\n` : `1_Mesh calibration ` + (this.maxX - this.minX) + "," + (this.maxY - this.minY) +`.g"\n`)
			output += "M291 P\"Calibration terminee, correction surfacique activee\" R\"Calibration automatique\" S1\n\n"
			output += `M374 P"/macros/_Toolheads/CAL_v1.2.0/Custom surfaces/` + ( this.active == 1 ? `heightmap_C_C${this.chamberTemp}_B${this.bedTemp}_D${this.diameter}.csv"\n` : `heightmap_R_C${this.chamberTemp}_B${this.bedTemp}_D` + (this.maxX - this.minX) + "," + (this.maxY - this.minY) +`.csv"\n`)
			output += `G29 S1 P"/macros/_Toolheads/CAL_v1.2.0/Custom surfaces/` + ( this.active == 1 ? `heightmap_C_C${this.chamberTemp}_B${this.bedTemp}_D${this.diameter}.csv"\n` : `heightmap_R_C${this.chamberTemp}_B${this.bedTemp}_D` + (this.maxX - this.minX) + "," + (this.maxY - this.minY) +`.csv"\n`)
			//console.log(output)
			return output;
		},
		generateGeometric(radius, passes, nbOut, nbIn) {
			if ((nbOut + nbIn) > 30) {
				return "";
			}
			if ((nbOut + nbIn) < 3) {
				return "";
			}
			let output = "; Geometric calibration\n\nM291 P\"Calibration geometrique en cours\" R\"Calibration automatique\" S1\n"
			output += "G29 S2".padEnd(50, ' ') + "; Clear any bed transform\n"
			output += "G28".padEnd(50, ' ') + "; Home all towers\n"
			output += "M98 P/macros/_Toolheads/CAL_v1.2.0/Sensor/Alarm release & Touch SW\n"
			output += "M98 P/macros/_Toolheads/CAL_v1.2.0/Sensor/Retract\n"
			output += "M98 P/macros/_Toolheads/CAL_v1.2.0/Sensor/Deploy".padEnd(50, ' ') + "; Deploy probe - BL Touch\n"
			output += "M290 R0 S0".padEnd(50, ' ') + "; clear babystepping \n\n"
			for( let pass = 1; pass <= passes; pass++) {
				output += "; Pass " + (pass < 10 ? '0' + pass : pass) + "\n"
				output += "G1 X0 Y0 Z20 F7000".padEnd(50, ' ') + "; Approach tool - BL Touch\n"
				output += "G30".padEnd(50, ' ') + "; Probe the bed at the current XY position. When the probe is triggered, set the Z coordinate to the probe trigger height\n"
				output += "; Probe outer ring\n"
				for( let i = 0 ; i < nbOut; i ++) {
					output += ("G30 P" + i + " X" + (Math.sin((2*Math.PI)/nbOut * i)*radius).toFixed(2) + " Y" + (Math.cos((2*Math.PI)/nbOut * i)*radius).toFixed(2) + " Z-99999 H0\n");
				}
				output += "; Probe inner ring\n"
				for (let j = 0; j < nbIn; j++) {
					output += ("G30 P" + (nbOut+j) + " X" + (Math.sin((2*Math.PI)/nbIn * j)*radius/2).toFixed(2) + " Y" + (Math.cos((2*Math.PI)/nbIn * j)*radius/2).toFixed(2) + " Z-99999 H0\n")
				}
				output += "; Probe center\n"
				let line = "G30 P" + (nbOut+nbIn) + " X0 Y0 Z-99999 S" + Math.min(8 , (nbOut+nbIn))
				output += line.padEnd(50, ' ') + "; Compute " + (nbOut+nbIn+1) + " points using " + Math.min(8 , (nbOut+nbIn)) + " factors calibration (endstop switch positions, delta radius, X and Y towers position, X and Y tilt angles)\n"
				output += "M500".padEnd(50, ' ') + "; Save geometric calibration in config-override.g\n"
				output += "G28".padEnd(50, ' ') + "; home all towers\n\n"
			}
			output += "M291 P\"Calibration geometrique terminee\" R\"Calibration geometrique\" S1\n"
			console.log(output)
			return output
		},
		generateMesh() {
			let output = ( this.active == 1 ? `; 1_Mesh calibration ${this.diameter} \n\n` : `; 1_Mesh calibration ` + (this.maxX - this.minX) + "," + (this.maxY - this.minY) +`\n\n`)
			output += "M291 P\"Calibration surfacique en cours\" R\"Calibration automatique\" S1\n"
			output += "M471 S\"/sys/heightmap.csv\" T\"/sys/heightmap.csv.bak\" D1\n\n"
			output += "G29 S2".padEnd(50, ' ') + "; Clear any bed transform\n"
			output += "G28".padEnd(50, ' ') + "; Home all towers\n"
			output += "M290 R0 S0".padEnd(50, ' ') + "; clear babystepping \n"
			output += "M98 P/macros/_Toolheads/CAL_v1.2.0/Sensor/Alarm release & Touch SW\n"
			output += "M98 P/macros/_Toolheads/CAL_v1.2.0/Sensor/Retract\n"
			output += "M98 P/macros/_Toolheads/CAL_v1.2.0/Sensor/Deploy".padEnd(50, ' ') + "; Deploy probe - BL Touch\n"
			let line = "G1 " + ( this.active == 1 ? "X0 Y0" : "X" + ((this.maxX + this.minX)/2).toFixed(2) + " Y" + ((this.maxY + this.minY)/2).toFixed(2)) + " Z20 F7000"
			output += line.padEnd(50, ' ') + "; Approach tool - BL Touch\n"
			output += "G30".padEnd(50, ' ') + "; Probe the bed at the current XY position. When the probe is triggered, set the Z coordinate to the probe trigger height\n"
			line =  ( this.active == 1 ? `M557 R${this.diameter/2} S${this.spacing}` : `M557 X${this.minX}:${this.maxX} Y${this.minY}:${this.maxY} S${this.spacingX}:${this.spacingY}`)
			output += line.padEnd(50, ' ') + "; Define mesh compensation grid\n"
			output += "G29 S0".padEnd(50, ' ') + "; Proceed mesh compensation by probing, saving heightmap.csv correction map file and displaying the matrix\n"
			output += "G29 S1".padEnd(50, ' ') + "; Activate meshgrid compensation\n"
			output += "G28".padEnd(50, ' ') + "; home all towers\n\n"
			output += "M280 P7 S90 I0".padEnd(50, ' ') + "; Retract probe - BL Touch\n"
			//console.log(output)
			return output;
		},
		generateHeat: function() {
			let result = []
			let output = `;0_Preheat_Chamber_${this.chamberTemp}\n\n`
			output += "M291 P\"Prechauffe Chambre en cours merci de retirer le plateau puis validez\" R\"Pre-chauffe\" S2\n\n"
			output += `M191 S${this.chamberTemp}`.padEnd(40, ' ') + `; Pre-heat heated chamber to ${this.chamberTemp}°C\n`
			output += "M291 P\"<ul><li>''OK': Attendre la stabilisation géometrique (60 min)<li>''Cancel': sauter la stabilisation</ul>\" R\"Attendre la stabilisation\" S3\n"
			output += "G4 S3600\n"
			//console.log(output)
			let content = new Blob([output]);
			try {
				result.push(this.upload({ filename: `/macros/_Toolheads/CAL_v1.2.0/Custom calibrations/heat/0_Preheat_Chamber_${this.chamberTemp}.g`, content, showProgress: false, showSuccess: false }))
			} catch (e) {
				this.$makeNotification('error',
				this.$t("panel.toolOffset.dialog.title"),
				this.$t("panel.toolOffset.dialog.error", [(e.err == 1 ? "no such file" : "not mounted")]),
				5000);
				console.error(e);// TODO Optionally ask user to save file somewhere else
			}

			output = `;1_Preheat_Bed_${this.bedTemp}\n\n`
			output += "M291 P\"Prechauffe Plateau en cours merci de remettre le plateau puis validez\" R\"Pre-chauffe\" S2\n\n"
			output += `M190 S${this.bedTemp}`.padEnd(40, ' ') + `; Pre-heat heated bed to ${this.bedTemp}°C\n`
			output += "M291 P\"<ul><li>''OK': Attendre la stabilisation surfacique (60 min)<li>''Cancel': sauter la stabilisation</ul>\" R\"Attendre la stabilisation\" S3\n"
			output += "G4 S3600\n"

			content = new Blob([output]);
			try {
				result.push(this.upload({ filename: `/macros/_Toolheads/CAL_v1.2.0/Custom calibrations/heat/1_Preheat_Bed_${this.bedTemp}.g`, content, showProgress: false, showSuccess: false}))
			} catch (e) {
				this.$makeNotification('error',
				this.$t("panel.toolOffset.dialog.title"),
				this.$t("panel.toolOffset.dialog.error", [(e.err == 1 ? "no such file" : "not mounted")]),
				5000);
				console.error(e);// TODO Optionally ask user to save file somewhere else
			}
			return result;
		},
		generateMacros: async function() {
			let promises = []
			let filename = "/macros/_Toolheads/CAL_v1.2.0/Custom calibrations/"
			let output = this.generateCalibration();
			let content = new Blob([output]);
			try {
				let name = ( this.active == 1 ? `machine_C_C${this.chamberTemp}_B${this.bedTemp}_D${this.diameter}.g` : `machine_R_C${this.chamberTemp}_B${this.bedTemp}_D` + (this.maxX - this.minX) + "," + (this.maxY - this.minY) +`.g`)
				promises.push(this.upload({ filename: filename + name, content, showProgress: false, showSuccess: false }))
			} catch (e) {
				this.$makeNotification('error',
				this.$t("panel.toolOffset.dialog.title"),
				this.$t("panel.toolOffset.dialog.error", [(e.err == 1 ? "no such file" : "not mounted")]),
				5000);
				console.error(e);// TODO Optionally ask user to save file somewhere else
			}
			//this.generateGeometric(190, 3, 12, 6);
			output = this.generateMesh();
			content = new Blob([output]);
			try {
				let name = ( this.active == 1 ? `1_Mesh calibration ${this.diameter}.g` : `1_Mesh calibration ` + (this.maxX - this.minX) + "," + (this.maxY - this.minY) +`.g`)
				promises.push(this.upload({ filename: filename + name, content, showProgress: false, showSuccess: false }))
			} catch (e) {
				this.$makeNotification('error',
				this.$t("panel.toolOffset.dialog.title"),
				this.$t("panel.toolOffset.dialog.error", [(e.err == 1 ? "no such file" : "not mounted")]),
				5000);
				console.error(e);// TODO Optionally ask user to save file somewhere else
			}
			let result = this.generateHeat()
			result.forEach(promise => promises.push(promise));
			Promise.all(promises).then(
				res => {
					//console.log(res);
					this.$makeNotification('success',
					this.$t("dialog.meshEdit.title"),
					this.$t("dialog.meshEdit.success"),
					5000)
					this.loadCalibFiles()
				}
			)
		},
		editContent: async function(calibration) {
			let self = this
			//console.log(calibration)
			this.bedTemp = calibration.bed
			this.chamberTemp = calibration.chamber
			this.download("/macros/_Toolheads/CAL_v1.2.0/Custom calibrations/1_Mesh calibration " + calibration.diameter + ".g").then(res => {
				//console.log(res)
				let lines = res.split('\n')
				for (let i = 0 ; i < lines.length; i++){
					let words = lines[i].split(' ');
					//console.log(words);
					switch (words[0]) {
						case 'M557':
						for (let j = 0; j < words.length; j++) {
							let letter = words[j].substr(0,1).toUpperCase()
							let params
							switch (letter)
							{
								case 'R':
								this.diameter = parseFloat(words[j].substr(1)) * 2
								break;
								case 'S':
								params = words[j].substr(1).toUpperCase().split(':')
								if (params.length == 1) {
									this.spacing = params[0]
								} else {
									this.spacingX = params[0]
									this.spacingY = params[1]
								}
								break;
								case 'X': // define the probing area in Xmin - xMax
								case 'Y': // define the probing area in Ymin - yMax
								params = words[j].substr(1).toUpperCase().split(':')
								this['min' + letter] = params[0]
								this['max' + letter] = params[1]
								break;
							}
						}
					}
				}
				self.outer = 1
				setTimeout(() => {self.active = ( calibration.name.split('_')[1] != 'C' ? 0 : 1 ) }, 100)
			})
		},
		doDelete: async function() {
			await this.delete(this.deleteDialog.path)
			this.loadCalibFiles()
		},
		async confirmDelete(items) {
			//console.log(items)
			this.deleteDialog.question = i18n.t('dialog.delete.title', [items.name]);
			this.deleteDialog.prompt = i18n.t('dialog.delete.prompt');
			this.deleteDialog.prompt += "<li><div style=\"text-overflow: ellipsis;overflow: hidden;max-width: 420px;width: max-content;\">" + items.path.substr(items.path.lastIndexOf('/')+1) + "</div></li>";
			this.deleteDialog.prompt += "</ul>";
			this.deleteDialog.shown = true;
			this.deleteDialog.path = items.path
		},
	},
	mounted: async function() {
		this.loadCalibFiles()
	},
	watch: {
		shown() {
			if (this.shown) {
				this.loadCalibFiles()
			}
		}
	}
}
</script>
