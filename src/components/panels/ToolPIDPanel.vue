<style scoped>
.toff {
	padding: 0 10px;
	text-align: center;
	border-right: 1px solid darkgray;
	display: inline-block;
	min-width: 200px;
}
.toff input, .tool_offset {
	width: 50px;
	height: 20px;
	text-align: center;
	border: 1px solid black;
	border-radius: 4px;
}

.layout.row {
	margin: 0 auto;
}

.v-divider {
	margin: 5px 0px 10px;
}
</style>

<template class="panel panel-default">
	<v-expansion-panel :value="isLocal?-1:0" class="z_probe_offset">
		<v-expansion-panel-content>
			<template v-slot:header>
				<div>
					{{ $t('panel.toolPID.caption') }}
				</div>
			</template>
			<v-card>
				<v-card-text class="panel-body">
					<v-flex v-if="false" style="display: inline-flex; width: 100%;">
						<span class="input-group-text" id="basic-addon1" style="font-size: 18px; margin-top: 16px; margin-right: 20px;"> {{ $t('panel.toolPID.tool') }} : </span>
						<v-select v-model="select" id="hname" :items="myTools" :rules="[]" required style="width: 80%" @change="loadToolMatrix">
						</v-select>
					</v-flex>
					<br/>
					<v-layout row wrap>
						<v-flex v-for="(tool, index) in toolHeads.filter((tool) => tool.h && tool.h < 7)" :key="tool.h" xl3 lg4 md4 sm6 xs12>
							<v-layout column style="border-right: 1px solid #333; border-bottom: 1px solid #222; margin: 5px; text-align: center; background: #505050;" v-if="!tool.hide">
								<v-layout style="font-size: larger;" row>
									<span v-html="$t('panel.toolPID.pid', ['T' + tools.filter(head => head.heaters.includes(tool.h))[0].number])"></span>&nbsp;<strong @click="targetTool" :id="tool.h"></strong> (H{{ tool.h }})
								</v-layout>
								<v-divider></v-divider>
								<v-layout column>
									<v-layout row>
										<span v-html="$t('panel.toolPID.calibration')"></span>&nbsp; <input v-if="!isLocal" class="tool_offset" :id="'temp_off_T' + tool.h" autocomplete="off" type="number" v-model.number="tool.t" step="5" att="t" :hnum="tool.h" @blur="toolOffsetBlurEvent" @keyup.enter="toolOffsetBlurEvent"/>&nbsp;{{ isLocal? '' : '°C' }}
									</v-layout>
									<number-control v-if="isLocal" v-model.number="tool.t" ref="input" :min="0" :max="500" :step="5" @keydown.native="onkeydown" @keyup.enter="toolOffsetEvent($event, index, tool)" @change="toolOffsetEvent($event, index, tool, 't')" @blur="toolOffsetEvent($event, index, tool)" :title="'Tool ' + tool.h + ' calibration T°'" prompt="Please enter calibration temperature" :loading="false" :disabled="heat.heaters[tool.h].state >= 3"></number-control>
									<v-layout row v-if="!isLocal">
										<v-tooltip bottom>
											<template v-slot:activator="{ on }">
												<v-btn class="btn_tilt" att="t" :hnum="tool.h" dir="d" v-on="on" @click="offsetEvent" v-bind:class="{'v-btn--disabled': heat.heaters[tool.h].state >= 3}">
													<v-icon> arrow_drop_down </v-icon>
													<span class="content">-5°</span>
												</v-btn>
											</template>
											<span> Offsets the tool head by a tiny amount in the X direction (G10 Px Xyy) </span>
										</v-tooltip>
										<v-tooltip bottom>
											<template v-slot:activator="{ on }">
												<v-btn class="btn_tilt" att="t" :hnum="tool.h" dir="u" v-on="on" @click="offsetEvent" v-bind:class="{'v-btn--disabled': heat.heaters[tool.h].state >= 3}">
													<v-icon style="transform:rotate(180deg)"> arrow_drop_down </v-icon>
													<span class="content">+5°</span>
												</v-btn>
											</template>
											<span> Offsets the tool head by a tiny amount in the X direction (G10 Px Xyy) </span>
										</v-tooltip><br/>
									</v-layout>
								</v-layout>
								<v-expansion-panel :value="-1" style="margin-bottom: 15px">
									<v-expansion-panel-content style="background: #5a5a5a">
										<template v-slot:header>{{ $t('panel.settingsNetwork.advanced' )}}</template>
										<v-card style="background: #5a5a5a">
											<v-card-text class="panel-body">
												<v-layout row>
													<span v-html="$t('panel.toolPID.pwm')"></span>&nbsp; <input v-if="!isLocal" class="tool_offset" :id="'temp_off_P' + tool.h" autocomplete="off" type="number" v-model.number="tool['s*100']" step="1" att="s" :hnum="tool.h" @blur="toolOffsetBlurEvent" @keyup.enter="toolOffsetBlurEvent"/>&nbsp;{{ isLocal? '' : '%' }}
												</v-layout>
												<number-control v-if="isLocal" v-model.number="tool['s*100']" ref="input" :min="0" :max="100" :step="1" @keydown.native="onkeydown" @keyup.enter="toolOffsetEvent($event, index, tool)" @change="toolOffsetEvent($event, index, tool, 's')" @blur="toolOffsetEvent($event, index, tool)" :title="'Tool ' + tool.h + ' PWM'" prompt="Please enter calibration PWM" :loading="false" :disabled="heat.heaters[tool.h].state >= 3"></number-control>
												<v-layout row v-if="!isLocal">
													<v-tooltip bottom>
														<template v-slot:activator="{ on }">
															<v-btn class="btn_tilt" att="s" :hnum="tool.h" dir="d" v-on="on" @click="offsetEvent" v-bind:class="{'v-btn--disabled': heat.heaters[tool.h].state >= 3 || tool['s*100'] <= 10}">
																<v-icon> arrow_drop_down </v-icon>
																<span class="content">-1%</span>
															</v-btn>
														</template>
														<span> Offsets the tool head by a tiny amount in the X direction (G10 Px Xyy) </span>
													</v-tooltip>
													<v-tooltip bottom>
														<template v-slot:activator="{ on }">
															<v-btn class="btn_tilt" att="s" :hnum="tool.h" dir="u" v-on="on" @click="offsetEvent" v-bind:class="{'v-btn--disabled': heat.heaters[tool.h].state >= 3 || tool['s*100'] >= 100}">
																<v-icon style="transform:rotate(180deg)"> arrow_drop_down </v-icon>
																<span class="content">+1%</span>
															</v-btn>
														</template>
														<span> Offsets the tool head by a tiny amount in the X direction (G10 Px Xyy) </span>
													</v-tooltip><br/>
												</v-layout>

											</v-card-text>
										</v-card>
									</v-expansion-panel-content>
								</v-expansion-panel>
								<v-layout column>
									<v-btn :hnum="tool.h" @click="tunePid" :disabled="heat.heaters[tool.h].state >= 3">
										<v-icon></v-icon>
										<span class="content">{{ $t('panel.toolPID.run') }}</span>
									</v-btn>
									<v-btn :hnum="tool.h" @click="savePid" :disabled="heat.heaters[tool.h].state >= 3">
										<v-icon></v-icon>
										<span class="content">{{ $t('panel.toolPID.save') }}</span>
									</v-btn>
								</v-layout>
							</v-layout>
						</v-flex>
						<v-flex xl3 lg4 md4 sm6 xs12 v-if="bed != {} && heat.heaters[bed.h]">
							<v-layout column style="border-right: 1px solid #333; border-bottom: 1px solid #222; margin: 5px; text-align: center; background: #505050;" v-if="!bed.hide">
								<v-layout style="font-size: larger;" row>
									<span v-html="$t('panel.toolPID.pid', ['Bed'])"></span>&nbsp;<strong></strong>(H{{bed.h}})
								</v-layout>
								<v-divider></v-divider>
								<v-layout column>
									<v-layout row>
										<span v-html="$t('panel.toolPID.calibration')"></span>&nbsp;
										<input v-if="!isLocal" class="tool_offset" :id="'temp_off_T_B'" autocomplete="off" type="number" v-model="bed.t" step="5" att="t" :hnum="0" @blur="toolOffsetBlurEvent" @keyup.enter="toolOffsetBlurEvent"/>&nbsp;{{ isLocal? '' : '°C' }}
									</v-layout>
									<number-control v-if="isLocal" v-model.number="bed.t" ref="input" :min="0" :max="500" :step="5" @keydown.native="onkeydown" @keyup.enter="toolOffsetEvent($event, 0, bed)" @change="toolOffsetEvent($event, 0, bed, 't')" @blur="toolOffsetEvent($event, 0, bed)" :title="'Tool ' + bed.h + ' calibration T°'" prompt="Please enter calibration temperature" :loading="false" :disabled="heat.heaters[bed.h].state >= 3"></number-control>
									<v-layout row v-if="!isLocal">
										<v-tooltip bottom>
											<template v-slot:activator="{ on }">
												<v-btn class="btn_tilt" att="t" :hnum="0" dir="d" v-on="on" @click="offsetEvent" v-bind:class="{'v-btn--disabled': heat.heaters[bed.h].state >= 3}">
													<v-icon> arrow_drop_down </v-icon>
													<span class="content">-5°</span>
												</v-btn>
											</template>
											<span> Offsets the bed head by a tiny amount in the X direction (G10 Px Xyy) </span>
										</v-tooltip>
										<v-tooltip bottom>
											<template v-slot:activator="{ on }">
												<v-btn class="btn_tilt" att="t" :hnum="0" dir="u" v-on="on" @click="offsetEvent" v-bind:class="{'v-btn--disabled': heat.heaters[bed.h].state >= 3}">
													<v-icon style="transform:rotate(180deg)"> arrow_drop_down </v-icon>
													<span class="content">+5°</span>
												</v-btn>
											</template>
											<span> Offsets the bed head by a tiny amount in the X direction (G10 Px Xyy) </span>
										</v-tooltip><br/>
									</v-layout>
								</v-layout>
								<v-expansion-panel :value="-1" style="margin-bottom: 15px">
									<v-expansion-panel-content style="background: #5a5a5a">
										<template v-slot:header>{{ $t('panel.settingsNetwork.advanced' )}}</template>
										<v-card style="background: #5a5a5a">
											<v-card-text class="panel-body">
												<v-layout row>
													<span v-html="$t('panel.toolPID.pwm')"></span>&nbsp;
													<input v-if="!isLocal" class="tool_offset" :id="'temp_off_P_B'" autocomplete="off" type="number" v-model.number="bed['s*100']" step="1" att="s" :hnum="0" @blur="toolOffsetBlurEvent" @keyup.enter="toolOffsetBlurEvent"/>&nbsp;{{ isLocal? '' : '%' }}
												</v-layout>
												<number-control v-if="isLocal" v-model.number="bed['s*100']" ref="input" :min="0" :max="100" :step="1" @keydown.native="onkeydown" @keyup.enter="toolOffsetEvent($event, 0, bed)" @change="toolOffsetEvent($event, 0, bed, 's')" @blur="toolOffsetEvent($event, 0, bed)" :title="'Tool ' + bed.h + ' PWM'" prompt="Please enter calibration PWM" :loading="false" :disabled="heat.heaters[bed.h].state >= 3"></number-control>
												<v-layout row v-if="!isLocal">
													<v-tooltip bottom>
														<template v-slot:activator="{ on }">
															<v-btn class="btn_tilt" att="s" :hnum="0" dir="d" v-on="on" @click="offsetEvent" v-bind:class="{'v-btn--disabled': heat.heaters[bed.h].state >= 3 || bed['s*100'] <= 10}">
																<v-icon> arrow_drop_down </v-icon>
																<span class="content">-1%</span>
															</v-btn>
														</template>
														<span> Offsets the bed head by a tiny amount in the X direction (G10 Px Xyy) </span>
													</v-tooltip>
													<v-tooltip bottom>
														<template v-slot:activator="{ on }">
															<v-btn class="btn_tilt" att="s" :hnum="0" dir="u" v-on="on" @click="offsetEvent" v-bind:class="{'v-btn--disabled': heat.heaters[bed.h].state >= 3|| bed['s*100'] >= 100}">
																<v-icon style="transform:rotate(180deg)"> arrow_drop_down </v-icon>
																<span class="content">+1%</span>
															</v-btn>
														</template>
														<span> Offsets the bed head by a tiny amount in the X direction (G10 Px Xyy) </span>
													</v-tooltip><br/>
												</v-layout>

											</v-card-text>
										</v-card>
									</v-expansion-panel-content>
								</v-expansion-panel>
								<v-layout column>
									<v-btn :hnum="0" @click="tunePid" :disabled="heat.heaters[bed.h].state >= 3">
										<v-icon></v-icon>
										<span class="content">{{ $t('panel.toolPID.run') }}</span>
									</v-btn>
									<v-btn :hnum="0" @click="savePid" :disabled="heat.heaters[bed.h].state >= 3">
										<v-icon></v-icon>
										<span class="content">{{ $t('panel.toolPID.save') }}</span>
									</v-btn>
								</v-layout>
							</v-layout>
						</v-flex>
						<v-flex xl3 lg4 md4 sm6 xs12 v-if="chamber != {} && heat.heaters[chamber.h]">
							<v-layout column style="border-right: 1px solid #333; border-bottom: 1px solid #222; margin: 5px; text-align: center; background: #505050;" v-if="!chamber.hide">
								<v-layout style="font-size: larger;" row>
									<span v-html="$t('panel.toolPID.pid', ['Chamber'])"></span>&nbsp;<strong></strong>(H{{chamber.h}})
								</v-layout>
								<v-divider></v-divider>
								<v-layout column>
									<v-layout row>
										<span v-html="$t('panel.toolPID.calibration')"></span>&nbsp;
										<input v-if="!isLocal" class="tool_offset" :id="'temp_off_T_C'" autocomplete="off" type="number" v-model="chamber.t" step="5" att="t" :hnum="4" @blur="toolOffsetBlurEvent" @keyup.enter="toolOffsetBlurEvent"/>
										&nbsp;{{ isLocal? '' : '°C' }}
									</v-layout>
									<number-control v-if="isLocal" v-model.number="chamber.t" ref="input" :min="0" :max="100" :step="5" @keydown.native="onkeydown" @keyup.enter="toolOffsetEvent($event, 4, chamber)" @change="toolOffsetEvent($event, 4, chamber, 't')" @blur="toolOffsetEvent($event, 4, chamber)" :title=" chamber + ' calibration T°'" prompt="Please enter calibration temperature" :loading="false" :disabled="heat.heaters[chamber.h].state >= 3"></number-control>
									<v-layout row v-if="!isLocal">
										<v-tooltip bottom>
											<template v-slot:activator="{ on }">
												<v-btn class="btn_tilt" att="t" :hnum="4" dir="d" v-on="on" @click="offsetEvent" v-bind:class="{'v-btn--disabled': heat.heaters[chamber.h].state >= 3}">
													<v-icon> arrow_drop_down </v-icon>
													<span class="content">-1°</span>
												</v-btn>
											</template>
											<span> Offsets the chamber head by a tiny amount in the X direction (G10 Px Xyy) </span>
										</v-tooltip>
										<v-tooltip bottom>
											<template v-slot:activator="{ on }">
												<v-btn class="btn_tilt" att="t" :hnum="4" dir="u" v-on="on" @click="offsetEvent" v-bind:class="{'v-btn--disabled': heat.heaters[chamber.h].state >= 3  || chamber['s*100'] <= 10}">
													<v-icon style="transform:rotate(180deg)"> arrow_drop_down </v-icon>
													<span class="content">+1°</span>
												</v-btn>
											</template>
											<span> Offsets the chamber head by a tiny amount in the X direction (G10 Px Xyy) </span>
										</v-tooltip><br/>
									</v-layout>
								</v-layout>
								<v-layout column>
									<v-btn :hnum="4" @click="tunePid" :disabled="heat.heaters[chamber.h].state >= 3">
										<v-icon></v-icon>
										<span class="content">{{ $t('panel.toolPID.run') }}</span>
									</v-btn>
									<v-btn :hnum="4" @click="savePid" :disabled="heat.heaters[chamber.h].state >= 3  || bed['s*100'] >= 100">
										<v-icon></v-icon>
										<span class="content">{{ $t('panel.toolPID.save') }}</span>
									</v-btn>
								</v-layout>
							</v-layout>
						</v-flex>
					</v-layout>
				</v-card-text>
			</v-card>
		</v-expansion-panel-content>
	</v-expansion-panel>
</template>
<script>
'use strict'

import { mapActions, mapState } from 'vuex'
import { log } from '../../plugins/logging.js'
export default {
	data () {
		return {
			select: undefined,
			relative: false,
			b4: "",
			bed: {},
			chamber: {},
			myTools: [],
			toolHeads: [],
			backTool: [],
			toolPath: {},
			pidToolCalib: undefined,
			currTool: undefined,
			pidTuning: {
				HeaterMode: {
					idle: 0,
					tuning0: 1,
					tuning1: 2,
					tuning2: 3,
					tuning3: 4,
				},
				MaxTuningTempReadings: 1024,
				SecondsToMillis: 1000,
				millis: () => {return new Date() - 0},
				heater: {name: 'chamber', num: 4},

				tuningReadingsTaken: 0,
				tuningPhaseStartTime: undefined,
				tuningBeginTime: undefined,
				tuningTargetTemp: 50,
				HeatSampleIntervalMillis: 250,
				tuningReadingInterval: 250,
				tuningTempReadings: [],
				tuningVoltageAccumulator: 0.0,
				voltageSamplesTaken: 0,
				tuningHeatingTime: 0,
				tuningHeaterOffTemp: 0,
				mode: 1,
				chamberNotif: undefined,
			}
		}
	},
	computed: {
		...mapState(['isLocal']),
		...mapState('machine/model', ['heat', 'state', 'spindles', 'tools', 'electronics']),
		...mapState({
			name: state => state.machine.model.network.name,
			GetPwmFrequency: tool => tool.s,
		}),
	},
	methods: {
		...mapActions('machine', ['getFileList', 'sendCode', 'download', 'upload']),
		preloadToolMatrices: async function() {
			try {
				this.myTools = [];
				// Load file list and create missing props
				const files = await this.getFileList("0:/macros/_Toolheads");
				//let name = this.name.substr(8, 5);
				//console.log(tools)
				let that = this;
				let inter = setInterval(function(files){
					if (files.length == 1) {
						clearInterval(inter);
					}
					let item = files.shift();
					if (item.isDirectory)
					{
						//console.log(item);
						that.preloadToolMatrix(item.directory + "/" + item.name)
					}
				}, 500, files);

			} catch(e) {
				console.error(e);
			}
		},
		preloadToolMatrix: async function(path){
			try {
				let files = await this.getFileList(path);
				files = files.filter(file => file.name.includes("Load"))
				//console.log(files);
				let that = this;
				var toolName;
				let inter = setInterval(function(files) {
					if (files == undefined || files.length <= 1) {
						clearInterval(inter);
					}
					let file = files.shift();
					//console.log(file);
					if(file != undefined){
						//console.log(file.name);
						toolName = file.name.substring(6);
						if (toolName.includes("."))
						toolName = toolName.substring(0, toolName.lastIndexOf("."));
						//console.log(that)
						if(!that.toolPath)
						that.toolPath = {};
						if(that.toolPath[toolName] === undefined)
						that.toolPath[toolName] = {};
						if(that.toolPath[toolName].matrix === undefined) {
							that.myTools.push(toolName);
						}
						that.toolPath[toolName].matrix = path.substring(path.lastIndexOf("/")+1)+"/"+file.name;

						that.myTools = that.myTools.sort();
						//console.log(that.tools.toSource())
						if(that.name.includes(toolName)){
							that.select = toolName
							that.loadToolMatrix(toolName);
						}
					}
				}, 125, files);
				//this.loadToolMatrix(toolName);
				//$("#hname").prop("value", toolName);
				//$("#hname").data("tool" , toolName);
			} catch(e) {
				console.error(e);
			}
		},
		loadToolMatrix: async function(Toolmatrix) {
			//console.log(Toolmatrix)
			//isHF = false;
			//console.log(this.toolPath[targetMatrix])
			this.b4 = [];
			let toolHeads = [];
			let filename
			let targetMatrix
			if(Toolmatrix) {
				targetMatrix = this.select.toString();
				filename = ("0:/macros/_Toolheads/"+this.toolPath[targetMatrix].matrix);
			} else {
				filename = ("0:/sys/config-override.g")
			}
			let result = await this.download({ filename, type: 'text', showSuccess: false });
			let data = result.split("\n");
			this.b4[0] = "";
			let indexB4 = 0;
			var lines = [];
			let toolNum = -1;
			for( var i = 0; i < data.length; i++)
			{
				if (data[i].includes("M307")) {
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
				var line = lines[i].substring(0, (lines[i].indexOf(";")>0?lines[i].indexOf(";"):undefined)).split(" ");
				for( var j = 0; j < line.length; j++)
				{
					//M307 H1 A340.0 C140.0 D5.5 S1.00 V0.0 B0
					if ((toolHeads[toolNum] == undefined)) {
						toolHeads[toolNum] = {};
					}
					if (line[j].includes("H")) { //Tool number
						if ((toolHeads[toolNum] == undefined) || (toolHeads[toolNum+1] == undefined && toolHeads[toolNum].h !== parseInt(line[j].substring(1)))) {
							toolNum++;
							//console.log("Heater " + parseInt(line[j].substring(1)) +" found");
							toolHeads[toolNum] = {};
							toolHeads[toolNum].h = parseInt(line[j].substring(1))
						}
					} else if(line[j].includes("A")) { // A/PWM + curT° = max T°
						//console.log("gain of heater " + toolHeads[toolNum].h + " = "+ parseFloat(line[j].substring(1)));
						toolHeads[toolNum].a = parseFloat(line[j].substring(1));
					} else if(line[j].includes("B")) {
						//console.log("Bang-Bang mode of tool " + toolHeads[toolNum].h + " = "+ parseFloat(line[j].substring(1)));
						toolHeads[toolNum].b = parseFloat(line[j].substring(1));
					} else if(line[j].includes("C")) { // time to reach 63.2% of target T° - dead time
						//console.log("heating time of heater " + toolHeads[toolNum].h + " = "+ parseFloat(line[j].substring(1)));
						toolHeads[toolNum].c = parseFloat(line[j].substring(1));
					} else if(line[j].includes("D")) { // time between new target and change
						//console.log("dead time of heater " + toolHeads[toolNum].h + " = "+ parseFloat(line[j].substring(1)));
						toolHeads[toolNum].d = parseFloat(line[j].substring(1));
					} else if(line[j].includes("F")) {
						//console.log("Frequency of heater " + toolHeads[toolNum].h + " = "+ parseFloat(line[j].substring(1)));
						toolHeads[toolNum].f = parseFloat(line[j].substring(1));
					} else if(line[j].includes("I")) { // axis X-Z
						//console.log("Inversion state of heater " + toolHeads[toolNum].h + " = "+ parseFloat(line[j].substring(1)));
						toolHeads[toolNum].i = parseFloat(line[j].substring(1)).toFixed(2);
					} else if(line[j].includes("T")) { // axis X-Z
						//console.log("Calibration T° " + toolHeads[toolNum].h + " = "+ parseFloat(line[j].substring(1)));
						toolHeads[toolNum].t = parseFloat(line[j].substring(1)).toFixed(2);
					} else if(line[j].includes("V")) {
						//console.log("calibration voltage of heater " + toolHeads[toolNum].h + " = "+ parseFloat(line[j].substring(1)));
						toolHeads[toolNum].v = parseFloat(line[j].substring(1)).toFixed(2);
					} else if(line[j].includes("S")) { // PWM frequency Between 0 and 1
						//console.log("Max frequency of heater " + toolHeads[toolNum].h + " = " + parseFloat(line[j].substring(1)));
						toolHeads[toolNum].s = parseFloat(line[j].substring(1));
						toolHeads[toolNum]['s*100'] = Math.round(toolHeads[toolNum].s*100)
					}
				}
			}
			if(Toolmatrix) {
				this.makeTools(toolHeads);
			} else {
				//console.log(this.b4)
				//console.log(toolHeads);
				for (i = 0; i < toolHeads.length; i++)
				{
					if (toolHeads[i].h == 0) {
						this.bed = toolHeads[i]
						this.bed.t = (this.bed.t ? this.bed.t : 120)
						this.bed.b4 = this.b4;
					} else if (toolHeads[i].h == 4) {
						this.chamber = toolHeads[i]
						this.chamber.t = (this.chamber.t ? this.chamber.t : 50)
						this.chamber.b4 = this.b4;
					}
				}
			}
		},
		makeTools: function(tools) {
			var isSec = [];
			var first = 0;
			while (tools[first] === undefined && tools.length > 0)
			{
				first++;
			}
			for(var i = 0; i < tools.length; i++) {
				if (tools[i] !== undefined && isSec[i] === undefined) {
					var heaters = tools[i].h;
					var drives = tools[i].d;
					var tsec = [];
					for (var j = i+1; j < tools.length; j++) {
						if (tools[j] === undefined)
						break;
						var wasSec = false;
						if (tools[j].h !== undefined) {
							for( var a = 0; a < tools[j].h.length; a++) {
								if (heaters.includes(tools[j].h[a])) {
									tsec.push(j);
									isSec[j] = true;
									wasSec = true;
								}
							}
						}
						if (wasSec)
						break;
						if (tools[j].d !== undefined) {
							for( a = 0; a < tools[j].d.length; a++) {
								if (drives.includes(tools[j].d[a])) {
									tsec.push(j);
									isSec[j] = true;
								}
							}
						}
					}
					if(tsec.length)
					tools[i].sec = tsec;
				}
			}
			tools.forEach((tool, index) => tool.hide = isSec[index])
			//console.log(tools);
			this.toolHeads = tools;
			this.backTools = tools;
		},
		sendToolMatrix: function(targetMatrix) {
			//console.log("sending new tool matrix: ", targetMatrix);
			var out
			if (targetMatrix) {
				out = (this.b4[0] == undefined?"":this.b4[0]+"\n");
			} else {
				//console.log(this.bed.b4, this.chamber.b4)
				out = (this.bed.b4[0] == undefined?"":this.bed.b4[0]+"\n");
			}
			//console.trace();
			//console.log(this.toolHeads)
			//console.log(this.backTools)
			//console.log(this.b4)
			if (targetMatrix) {
				for (var i = 0; i < this.toolHeads.length; i++)
				{
					let keys = Object.keys(this.toolHeads[i])
					//console.log(this.toolHeads[i])
					let inOut = ""
					inOut += "M307 H" + this.toolHeads[i].h + " ";
					keys.forEach((key) => {
						//console.log(key.toUpperCase() + ": " + this.toolHeads[i][key])
						if (key.length == 1 && (key != 'h')){
							inOut += key.toUpperCase() + "" + this.toolHeads[i][key] + " "
						}
					})
					inOut += "; Set PID parameter for heater " + this.toolHeads[i].h + "\n";
					//console.log(inOut)
					out += inOut;
				}
			} else {
				let keys = Object.keys(this.bed)
				//console.log(this.toolHeads[i])
				inOut = ""
				inOut += "M307 H" + this.bed.h + " ";
				keys.forEach((key) => {
					//console.log(key.toUpperCase() + ": " + this.toolHeads[i][key])
					if (key.length == 1 && (key != 'h')){
						inOut += key.toUpperCase() + "" + this.bed[key] + " "
					}
				})
				inOut += "; Set PID parameter for heater " + this.bed.h + "\n";
				//console.log(inOut)
				out += inOut;
				keys = Object.keys(this.chamber)
				//console.log(this.toolHeads[i])
				let inOut = ""
				inOut += "M307 H" + this.chamber.h + " ";
				keys.forEach((key) => {
					//console.log(key.toUpperCase() + ": " + this.toolHeads[i][key])
					if (key.length == 1 && (key != 'h')){
						inOut += key.toUpperCase() + "" + this.chamber[key] + " "
					}
				})
				inOut += "; Set PID parameter for heater " + this.chamber.h + "\n";
				//console.log(inOut)
				out += inOut;
			}
			let filename
			if (targetMatrix) {
				out += (this.b4[1] == undefined?"":"\n"+this.b4[1]);
				out += "M307 H7 A-1 C-1 D-1\n"
				out += (this.b4[2] == undefined?"":this.b4[2]+"\n");
				out += (this.b4[this.toolHeads.length] == undefined? "" : "\n"+this.b4[this.toolHeads.length] );
				//console.log(this.tools);
				filename = "0:/macros/_Toolheads/" + this.toolPath[this.select].matrix;
			} else {
				out += (this.bed.b4[1] == undefined?"":"\n"+this.bed.b4[1]);
				//console.log(this.tools);
				filename = "0:/sys/config-override.g";
			}
			let data = out;
			const content = new Blob([data]);
			try {
				this.upload({ filename: filename, content });
				//console.log(filename, data);
				//console.log("file saved");
			} catch (e) {
				console.log("Error: " + (e.err == 1 ? "no such file" : "not mounted"));
				console.error(e);// TODO Optionally ask user to save file somewhere else
			}
		},
		targetTool:async function(e) {
			let that = e.target;
			if (that.id != this.curTool) {
				await this.sendCode({code: "G10 P" + that.id + " X" + this.toolHeads[that.id].x + " Y" + this.toolHeads[that.id].y, log: false});
				await this.sendCode({code:"G1 X0 Y0 Z150 F600",log: false});
				await this.sendCode({code:"T" + that.id, log: false});
				await this.sendCode({code:"G1 X0 Y0 Z130 F600", log: false});
				this.curTool = that.id;
			} else {
				await this.sendCode({code:"G1 X0 Y0 Z150 F600", log: false});
				await this.sendCode({code:"T-1", log: false})
				await this.sendCode({code:"G1 X0 Y0 Z150 F600", log: false});
				this.curTool = -1;
			}
		},
		offsetEvent: async function(e) {
			let that = e.target;
			//console.log("btnOffset clicked")
			while (that.nodeName.toLowerCase() !== "button") {
				that = that.parentElement;
			}
			e.preventDefault();
			let value = 'a'
			for (let i = 0; i < that.innerText.length && isNaN(parseInt(value)); i++){
				value = parseInt(that.innerText.substr(i))
			}
			//console.log(value)
			if(!that.classList.contains("v-btn--disabled") && this.myTools.length > 0)
			{
				that.classList.add("v-btn--disabled")
				let attr = that.attributes;
				//var first = 0;
				//console.log(attr)
				console.log('Am I running')
				let oldVal, newVal;
				if (attr.hnum.value > 0 && attr.hnum.value < 4) {
					oldVal = parseFloat(this.toolHeads[attr.hnum.value-1][attr.att.value])
				} else {
					console.log('Can I change temperatures')
					if (attr.hnum.value == 0) {
						oldVal = parseFloat(this.bed[attr.att.value])
					} else if (attr.hnum.value == 4) {
						oldVal = parseFloat(this.chamber[attr.att.value])
					}
				}
				newVal = oldVal + (attr.att.value == 't' ? value : value/100)
				//console.log(oldVal, newVal)
				if (attr.hnum.value > 0 && attr.hnum.value < 4) {
					this.toolHeads[attr.hnum.value-1][attr.att.value] = (attr.att.value == 't' ? newVal : newVal.toFixed(2));

					if (attr.att.value == 's'){
						this.toolHeads[attr.hnum.value-1]['s*100'] = newVal*100;
					}
				} else {
					if (attr.hnum.value == 0) {
						console.log('I was bed ', this.bed.t)
						if (attr.att.value == 's'){
							this.bed.s = newVal.toFixed(2);
							this.bed['s*100'] = newVal*100;
						} else if (attr.att.value == 't') {
							this.bed.t = newVal
							this.$nextTick(() => console.log(document.getElementById('temp_off_T_B').value = this.bed.t))
						} else {
							this.bed[attr.att.value] = newVal
						}
						console.log('now I\'m bed ', this.bed.t)
					} else if (attr.hnum.value == 4) {
						console.log('I was chamber ', this.chamber.t)
						this.chamber[attr.att.value] = (attr.att.value == 't' ? newVal : newVal.toFixed(2));
						if (attr.att.value == 's'){
							this.chamber.s = newVal.toFixed(2);
							this.chamber['s*100'] = newVal*100;
						} else if (attr.att.value == 't') {
							this.chamber.t = newVal
							this.$nextTick(() => console.log(document.getElementById('temp_off_T_C').value = this.chamber.t))
						} else {
							this.chamber[attr.att.value] = newVal
						}
						console.log('now I\'m chamber ', this.chamber.t)
					}
				}
				that.classList.remove("v-btn--disabled")
			}
		},
		toolOffsetBlurEvent: async function(e) {
			e.preventDefault();
			let that = e.target;
			console.log("inputField blured")
			console.log(e.target)
			while (that.nodeName.toLowerCase() !== "input") {
				that = that.parentElement;
			}
			let attr = that.attributes;
			if (attr.att.value == 's'){
				this.toolHeads[attr.hnum.value-1].s = (that.value/100).toFixed(2);
				this.toolHeads[attr.hnum.value-1]['s*100'] = that.value;
				if (attr.hnum.value == 0)
				{
					this.bed.s = (that.value/100).toFixed(2);
					this.bed['s*100'] = that.value
				}
			} else {
				if (attr.hnum.value == 0)
				{
					this.bed.t = that.value

				} else if (attr.hnum.value == 4) {
					this.chamber.t = that.value
				}
			}
			console.log(attr.att.value == 't' ? that.value : (that.value/100))
			this.toolHeads[attr.hnum.value-1][attr.att.value] = (attr.att.value == 't' ? that.value : (that.value/100))
		},
		toolOffsetEvent: function(off, index, tool, axis) {
			console.log(off, index, tool, axis)
			clearTimeout(this.pidToolCalib);
			console.log(off, tool)
			if (this.toolHeads[index]) {
				this.toolHeads[index][axis] = axis=="s" ? off / 100 : off
			}
			tool[axis] = axis=="s" ? off / 100 : off
			if (axis == 's'){
				if (this.toolHeads[index]) {
					this.toolHeads[index]['s*100'] = off;
				}
				tool['s*100'] = off;
			}
			console.log(this.toolHeads)
			//this.pidToolCalib = setTimeout(this.sendToolMatrix, 1000, index)
		},
		tunePid: async function(e) {
			let that = e.target;
			console.log("tunePid clicked")
			while (that.nodeName.toLowerCase() !== "button") {
				that = that.parentElement;
			}
			e.preventDefault();
			if(!that.classList.contains("v-btn--disabled") && this.myTools.length > 0)
			{
				that.classList.add("v-btn--disabled")
				let attr = that.attributes;
				var first = 0;
				while (this.myTools[first] === undefined && this.myTools.length > 0)
				{
					first++;
				}
				let tool = this.toolHeads.filter(tool => tool.h == attr.hnum.value)[0]
				tool = (this.bed.h == attr.hnum.value? this.bed : tool)
				tool = (this.chamber.h == attr.hnum.value? this.chamber : tool)
				console.log(tool)
				clearTimeout(this.pidToolCalib);

				//await this.sendCode("G10 P" + attr.hnum.value + " X" + this.toolHeads[attr.hnum.value].x + " Y" + this.toolHeads[attr.hnum.value].y +" S0 R0");
				//await this.sendCode({code: "G1 X0 Y0 Z150 F1200", log: false });

				if (this.curTool !== parseInt(tool.h)-1){
					let offTemps = '-273.15';
					this.sendCode(`G10 P` + (parseInt(tool.h)-1) + ` S${offTemps} R${offTemps}`);
					await this.sendCode({code: "T" + (parseInt(tool.h)-1), log: false });
					this.curTool = parseInt(tool.h)-1;
				}
				console.log('M303 H' + tool.h + ' P' + (typeof(tool.s)=="string"?(tool.s):(tool.s).toFixed(2)) + ' S' + tool.t)
				if (this.chamber.h != attr.hnum.value) {
					await this.sendCode({code: "M303 H" + tool.h + " P" + tool.s + " S" + tool.t, log: false});
				} else {
					this.tuneManually()
					this.chamberNotif = log('info', 'Tuning chamber', "Auto tune phase 0, waiting for temperature to stabilize");
				}
				//this.pidToolCalib = setTimeout(this.sendToolMatrix, 1000, attr.hnum.value)
				that.classList.remove("v-btn--disabled")
			}
		},
		savePid:async function (e) {
			let that = e.target;
			//console.log("savePid clicked")
			while (that.nodeName.toLowerCase() !== "button") {
				that = that.parentElement;
			}
			e.preventDefault();
			if(!that.classList.contains("v-btn--disabled") && this.myTools.length > 0)
			{
				that.classList.add("v-btn--disabled")
				clearTimeout(this.pidToolCalib);
				let attr = that.attributes;
				let tool = this.toolHeads.filter(tool => tool.h == attr.hnum.value)[0]
				tool = (this.bed.h == attr.hnum.value ? this.bed : tool)
				tool = (this.chamber.h == attr.hnum.value ? this.chamber : tool)
				//console.log('M307 H' + tool.h)
				let response = await this.sendCode({code: 'M307 H' + tool.h, log: false});
				response = response.split('\n')[0].split(/[:,] /)
				//console.log(response);
				for (let i = 0; i < response.length; i++) {
					//console.log(response[i].substr(response[i].lastIndexOf(' ')))
					let value = parseFloat(response[i].substr(response[i].lastIndexOf(' ')));
					switch (response[i].substr(0, response[i].indexOf(' '))){
						case 'Heater' :
						value = parseFloat(response[i].substr(response[i].indexOf(' ')));
						//console.log(tool.h, value)
						if (tool.h != value)
						return;
						break;
						case 'gain':
						tool.a = value;
						break;
						case 'mode':
						tool.b = (response[i].substr(response[i].lastIndexOf(' ')) != 'PID'? 0 : 1)
						break;
						case 'time':
						tool.c = value;
						break;
						case 'frequency':
						if (!isNaN(value)) {
							tool.f = value
						}
						break;
						case 'inverted':
						tool.i = (response[i].substr(response[i].lastIndexOf(' ')) == 'yes'? 1 : 0)
						break;
						case 'calibration':
						tool.v = value;
						break;
						case 'dead':
						tool.d = value;
						break;
						case 'max':
						tool.s = value*100;
						break;
					}
				}
				//console.log(tool)
				this.toolHeads[attr.hnum.value] = tool;
				if ((this.chamber.h != attr.hnum.value) && (this.bed.h != attr.hnum.value)) {
					this.pidToolCalib = setTimeout(this.sendToolMatrix, 1000, attr.hnum.value)
				} else {
					this.pidToolCalib = setTimeout(this.sendToolMatrix, 1000)
				}
				that.classList.remove("v-btn--disabled")
			}
		},
		tuneManually: async function() {
			this.doTuningStep();
			if (this.pidTuning.mode != this.pidTuning.HeaterMode.idle) {
				setTimeout(this.tuneManually, this.pidTuning.tuningReadingInterval)
			}
		},
		doTuningStep: function() {
			let temperature = this.heat.heaters[this.chamber.h].current;
			let vin = this.electronics.vIn.current;
			//console.log(this.pidTuning)
			if (this.pidTuning.tuningReadingsTaken == 0)
			{
				this.pidTuning.tuningPhaseStartTime = this.pidTuning.millis();
				if (this.pidTuning.mode == this.pidTuning.HeaterMode.tuning0)
				{
					this.pidTuning.tuningBeginTime = this.pidTuning.tuningPhaseStartTime;
				}
			}

			else if (this.pidTuning.millis() - this.pidTuning.tuningPhaseStartTime < this.pidTuning.tuningReadingsTaken * this.pidTuning.tuningReadingInterval)
			{
				return;		// not due yet
			}

			// See if we have room to store the new reading, and if not, double the sample interval
			if (this.pidTuning.tuningReadingsTaken == this.pidTuning.MaxTuningTempReadings)
			{
				// Double the sample interval
				this.pidTuning.tuningReadingsTaken /= 2;
				for (var i = 1; i < this.pidTuning.tuningReadingsTaken; ++i)
				{
					this.pidTuning.tuningTempReadings[i] = this.pidTuning.tuningTempReadings[i * 2];
				}
				this.pidTuning.tuningReadingInterval *= 2;
				console.log("doubled reading interval " + this.pidTuning.tuningReadingInterval/this.pidTuning.SecondsToMillis + "s")
			}

			this.pidTuning.tuningTempReadings[this.pidTuning.tuningReadingsTaken] = temperature;
			++this.pidTuning.tuningReadingsTaken;

			switch(this.pidTuning.mode)
			{
				case this.pidTuning.HeaterMode.tuning0:
				// Waiting for initial temperature to settle after any thermostatic fans have turned on
				if (this.ReadingsStable(10000/this.pidTuning.HeatSampleIntervalMillis, 2.0))			// expect temperature to be stable within a 2C band for 6 seconds
				{
					// Starting temperature is stable, so move on
					this.pidTuning.tuningReadingsTaken = 1;
					this.pidTuning.tuningVoltageAccumulator = 0.0;
					this.pidTuning.voltageSamplesTaken = 0;
					this.pidTuning.tuningTempReadings[0] = this.pidTuning.tuningStartTemp = temperature;
					this.pidTuning.timeSetHeating = this.pidTuning.tuningPhaseStartTime = this.pidTuning.millis();
					//if (heater.num == 0)
					this.sendCode("M143 H0 S200\nM140 S120")										// turn on heater at specified power
					//else if (heater.num == 4)
					this.sendCode("M143 H4 S160\nM141 S100")										// turn on heater at specified power
					this.pidTuning.tuningReadingInterval = this.pidTuning.HeatSampleIntervalMillis;			// reset sampling interval
					this.pidTuning.mode = this.pidTuning.HeaterMode.tuning1;
					this.chamberNotif = log('info', 'Tuning chamber', "Auto tune phase 1, heater on");
					return;
				}
				if (this.pidTuning.millis() - this.pidTuning.tuningPhaseStartTime < 20000)
				{
					// Allow up to 20 seconds for starting temperature to settle
					return;
				}
				alert( "Auto tune cancelled because starting temperature is not stable\n");
				this.sendCode("M140 S0")
				this.sendCode("M141 S0")
				this.pidTuning.mode = this.pidTuning.HeaterMode.idle
				break;

				case this.pidTuning.HeaterMode.tuning1:
				// Heating up
				{
					const isBedOrChamberHeater = true;
					const heatingTime = this.pidTuning.millis() - this.pidTuning.tuningPhaseStartTime;
					const extraTimeAllowed = (isBedOrChamberHeater) ? 600.0 : 30.0;
					if (heatingTime > ((60 + extraTimeAllowed) * this.pidTuning.SecondsToMillis) && (temperature - this.pidTuning.tuningStartTemp) < 3.0)
					{
						alert("Auto tune cancelled because temperature is not increasing\n");
						this.sendCode("M140 S0")
						this.sendCode("M141 S0")
						this.pidTuning.mode = this.pidTuning.HeaterMode.idle
						break;
					}

					const timeoutMinutes = (isBedOrChamberHeater) ? 60 : 7;
					if (heatingTime >= timeoutMinutes * 60 * this.pidTuning.SecondsToMillis)
					{
						alert("Auto tune cancelled because target temperature was not reached\n");
						this.sendCode("M140 S0")
						this.sendCode("M141 S0")
						this.pidTuning.mode = this.pidTuning.HeaterMode.idle
						break;
					}

					this.pidTuning.tuningVoltageAccumulator += vin;
					++this.pidTuning.voltageSamplesTaken;
					//console.log(temperature);
					if (temperature > this.chamber.t)							// if reached target
					{
						this.pidTuning.tuningHeatingTime = heatingTime;

						// Move on to next phase
						this.pidTuning.tuningReadingsTaken = 1;
						this.pidTuning.tuningHeaterOffTemp = this.pidTuning.tuningTempReadings[0] = temperature;
						this.pidTuning.tuningPhaseStartTime = this.pidTuning.millis();
						this.pidTuning.tuningReadingInterval = this.pidTuning.HeatSampleIntervalMillis;			// reset sampling interval
						this.pidTuning.mode = this.pidTuning.HeaterMode.tuning2;
						this.pidTuning.lastPwm = 0.0;
						//SetHeater(0.0);
						this.chamberNotif = log('info', 'Tuning chamber', "Auto tune phase 2, heater off");
						this.sendCode("M140 S0")
						this.sendCode("M141 S0")
					}
				}
				return;

				case this.pidTuning.HeaterMode.tuning2:
				// Heater turned off, looking for peak temperature
				{
					const peakIndex = this.GetPeakTempIndex();
					if (peakIndex < 0)
					{
						if ( this.pidTuning.millis() - this.pidTuning.tuningPhaseStartTime < 60 * 1000)			// allow 1 minute for the bed temperature reach peak temperature
						{
							return;			// still waiting for peak temperature
						}
						alert("Auto tune cancelled because temperature is not falling\n");
						this.pidTuning.mode = this.pidTuning.HeaterMode.idle
					}
					else if (peakIndex == 0)
					{
						alert("Auto tune cancelled because temperature peak was not identified\n");
						this.pidTuning.mode = this.pidTuning.HeaterMode.idle
					}
					else
					{
						this.pidTuning.tuningPeakTemperature = this.pidTuning.tuningTempReadings[peakIndex];
						this.pidTuning.tuningPeakDelay = peakIndex * this.pidTuning.tuningReadingInterval;

						// Move on to next phase
						this.pidTuning.tuningReadingsTaken = 1;
						this.pidTuning.tuningTempReadings[0] = temperature;
						this.pidTuning.tuningPhaseStartTime = this.pidTuning.millis();
						this.pidTuning.tuningReadingInterval = this.pidTuning.HeatSampleIntervalMillis;			// reset sampling interval
						this.pidTuning.mode = this.pidTuning.HeaterMode.tuning3;
						this.chamberNotif = log('info', 'Tuning chamber', "Auto tune phase 3, peak temperature was " + this.pidTuning.tuningPeakTemperature);
						return;
					}
				}
				break;

				case this.pidTuning.HeaterMode.tuning3:
				{
					// Heater is past the peak temperature and cooling down. Wait until it is part way back to the starting temperature so we can measure the cooling rate.
					// In the case of a bed that shows a reservoir effect, the choice of how far we wait for it to cool down will effect the result.
					// If we wait for it to cool down by 50% then we get a short time constant and a low gain, which causes overshoot. So try a bit more.
					const coolDownProportion = 0.66;
					if (temperature > ( this.pidTuning.tuningTempReadings[0] * (1.0 - coolDownProportion)) + (this.pidTuning.tuningStartTemp * coolDownProportion))
					{
						return;
					}
					this.CalculateModel();
				}
				break;

				default:
				// Should not happen, but if it does then quit
				break;
			}

			// If we get here, we have finished
			this.sendCode("M140 S0");
			this.sendCode("M141 S0");
			this.pidTuning.mode = this.pidTuning.HeaterMode.idle;
			//SwitchOff();								// sets mode and lastPWM, also deletesthis.pidTuning.tuningTempReadings
		},
		ReadingsStable: function(numReadings, maxDiff) {
			if ( this.pidTuning.tuningTempReadings == undefined || this.pidTuning.tuningReadingsTaken < numReadings)
			{
				return false;
			}

			var minReading = this.pidTuning.tuningTempReadings[this.pidTuning.tuningReadingsTaken - numReadings];
			var maxReading = minReading;
			for (var i = this.pidTuning.tuningReadingsTaken - numReadings + 1; i < this.pidTuning.tuningReadingsTaken; ++i)
			{
				const t = this.pidTuning.tuningTempReadings[i];
				if (t < minReading) { minReading = t; }
				if (t > maxReading) { maxReading = t; }
			}

			return maxReading - minReading <= maxDiff;
		},
		GetPeakTempIndex: function() {

			// Check we have enough readings to look for the peak
			if (this.pidTuning.tuningReadingsTaken < 15)
			{
				return -1;							// too few readings
			}

			// Look for the peak
			var peakIndex = this.IdentifyPeak(1);
			if (peakIndex < 0)
			{
				peakIndex = this.IdentifyPeak(3);
				if (peakIndex < 0)
				{
					peakIndex = this.IdentifyPeak(5);
					if (peakIndex < 0)
					{
						peakIndex = this.IdentifyPeak(7);
						if (peakIndex < 0)
						{
							return 0;					// more than one peak
						}
					}
				}
			}

			// If we have found one peak and it's not too near the end of the readings, return it
			return (peakIndex + 3 < this.pidTuning.tuningReadingsTaken) ? Math.max(peakIndex, 1) : -1;
		},
		IdentifyPeak: function(numToAverage) {
			var firstPeakIndex = -1, lastSameIndex = -1;
			var peakTempTimesN = -999.0;
			for (var i = 0; i + numToAverage <= this.pidTuning.tuningReadingsTaken; ++i)
			{
				var peak = 0.0;
				for (var j = 0; j < numToAverage; ++j)
				{
					peak += this.pidTuning.tuningTempReadings[i + j];
				}
				if (peak > peakTempTimesN)
				{
					if (i == lastSameIndex + 1)
					{
						firstPeakIndex = lastSameIndex = i;	// readings still going up or staying the same, so advance the first peak index
						peakTempTimesN = peak;
					}
					else
					{
						return -1;						// error, more than one peak
					}
				}
				else if (peak == peakTempTimesN)		// exact equality can occur because the floating point value is computed from an integral value
				{
					lastSameIndex = i;
				}
			}
			return firstPeakIndex + (numToAverage - 1)/2;
		},
		CalculateModel: function() {
			const tc = ((this.pidTuning.tuningReadingsTaken - 1) * this.pidTuning.tuningReadingInterval) / (1000.0 * Math.log((this.pidTuning.tuningTempReadings[0] - this.pidTuning.tuningStartTemp)/(this.pidTuning.tuningTempReadings[this.pidTuning.tuningReadingsTaken - 1] - this.pidTuning.tuningStartTemp)));
			const heatingTime = (this.pidTuning.tuningHeatingTime - this.pidTuning.tuningPeakDelay) * 0.001;
			const gain = (this.pidTuning.tuningHeaterOffTemp - this.pidTuning.tuningStartTemp)/(1.0 - Math.exp(-heatingTime/tc));

			// There are two ways of calculating the dead time:
			// 1. Based on the delay to peak temperature after we turned the heater off. Adding 0.5sec and then taking 65% of the result is about right.
			// 2. Based on the peak temperature compared to the temperature at which we turned the heater off.
			// Try #2 because it is easier to identify the peak temperature than the delay to peak temperature. It can be slightly to aggressive, so add 30%.
			const tda = (this.pidTuning.tuningPeakDelay + 500) * 0.00065;		// take the dead time as 65% of the delay to peak rounded up to a half second
			const tdb = tc * Math.log((gain + this.pidTuning.tuningStartTemp - this.pidTuning.tuningHeaterOffTemp)/(gain + this.pidTuning.tuningStartTemp - this.pidTuning.tuningPeakTemperature)) * 1.3;

			var tuned = true//SetModel(gain, tc, tdb, tuningPwm, tuningVoltageAccumulator/voltageSamplesTaken, true, false, model.GetPwmFrequency());
			if (tuned)
			{
				this.chamberNotif = log('info', 'Tuning chamber',
				"Auto tune heater " + this.pidTuning.heater.num + " completed in " + ((this.pidTuning.millis() - this.pidTuning.tuningBeginTime)/this.pidTuning.SecondsToMillis) + " sec\n" +
				"Use M307 H" + this.pidTuning.heater.num + " to see the result, or M500 to save the result in config-override.g" + "Auto tune of heater " + this.pidTuning.heater.num + " success (A=" + gain.toFixed(1) + ", C=" + tc.toFixed(1) + ", D=" + tdb.toFixed(1) + ")");
				console.log(
					"Auto tune heater " + this.pidTuning.heater.num + " completed in " + ((this.pidTuning.millis() - this.pidTuning.tuningBeginTime)/this.pidTuning.SecondsToMillis) + " sec\n" +
					"Use M307 H" + this.pidTuning.heater.num + " to see the result, or M500 to save the result in config-override.g");
					console.log("Auto tune of heater " + this.pidTuning.heater.num + " success (A=" + gain.toFixed(1) + ", C=" + tc.toFixed(1) + ", D=" + tdb.toFixed(1) + ")");
					console.log(tda, tdb);
					this.chamber.a = gain.toFixed(1);
					this.chamber.c = tc.toFixed(1);
					this.chamber.d = Math.abs(tdb).toFixed(1);
					this.chamber.v = (this.pidTuning.tuningVoltageAccumulator/this.pidTuning.voltageSamplesTaken).toFixed(2)
					let keys = Object.keys(this.chamber)
					//console.log(this.toolHeads[i])
					let inOut = ""
					inOut += "M307 H" + this.chamber.h + " ";
					keys.forEach((key) => {
						//console.log(key.toUpperCase() + ": " + this.toolHeads[i][key])
						if (key.length == 1 && (key != 'h')){
							inOut += key.toUpperCase() + "" + this.chamber[key] + " "
						}
					})
					console.log(inOut)
					this.sendCode(inOut);
				}
				else
				{
					console.log( "Auto tune of heater " + this.pidTuning.heater.num + " failed due to bad curve fit (A=" + gain + ", C=" + tc + ", D=" + tdb + ")\n");
				}
				this.pidTuning.mode = this.pidTuning.HeaterMode.idle;
			}
		},
		mounted() {
			//console.log('load the cfg file');
			setTimeout(this.preloadToolMatrices, 1000*Math.random());
			this.loadToolMatrix();
		},
		watch: {
			toolHeads: {
				deep: true,
				handler: function(){
					//console.trace();
					//console.log(newVal);
				}
			}
		}
	}
	</script>
