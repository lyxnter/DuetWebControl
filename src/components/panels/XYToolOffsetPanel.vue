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

path {
	fill: #0002;
	transition: 0.25s
}

path:hover {
	fill: #0008;
}

path:active {
	fill: #FFF8;
}

text {
	fill: #FFF4;
	transition: 0.25s
}

text:hover {
	fill: #FFFF;
}

.v-divider {
	margin: 5px 0 10px;
}
</style>

<template class="panel panel-default">
	<v-expansion-panel :value="isLocal?-1:0" class="z_probe_offset">
		<v-expansion-panel-content>
			<template v-slot:header>
				<div>
					{{ $t('panel.toolOffset.captionXY') }}
				</div>
			</template>
			<v-card>
				<v-card-text class="panel-body">
					<v-flex style="display: inline-flex; width: 100%;" v-if="false">
						<span class="input-group-text" id="basic-addon1" style="font-size: 18px; margin-top: 16px; margin-right: 20px;"> {{ $t('panel.toolOffset.tool') }} : </span>
						<v-select v-model="select" id="hname" :items="tools" :rules="[]" required style="width: 80%" @change="loadToolMatrix">
						</v-select>
					</v-flex>
					<div style=" padding: 25px; margin: 10px 0; background: #4D4D4D;">
						<v-layout row>
							<v-btn-toggle v-model="selectedTool" style="width: 70%;margin-top: 10px; margin-bottom: 20px">
								<v-btn active  @click="targetTool(-1)" id="-1">
									<strong style="color: white;"> None </strong>
								</v-btn>
								<v-btn v-for="(tool) in toolHeads.filter(tool => !tool.hide)" :key="tool.t" :style="{'font-size': (isLocal?'larger':'')}" @click="targetTool(tool.t)">
									<strong style="color: white;"> T{{tool.t}}</strong>
									<span style="color: darkgray;" v-for="sec in tool.sec" :key="sec">
										, T{{toolHeads[sec].t}}
									</span>
								</v-btn>
							</v-btn-toggle>
							<v-spacer></v-spacer>
							<v-btn color="grey darken-3" @click="saveOffset" :disabled="!edit"><v-icon>save</v-icon>{{ $t('dialog.fileEdit.save') }}</v-btn>
						</v-layout>
						<div style="width: 480px; height: 480px; margin: 0 auto; overflow: hidden;">
							<div id="scaleableDiv" @click="videoDivClick" style="transform: scale(1)">
								<img style="background: url(/img/ressources/noSignal.gif); background-position-x: center; overflow: hidden; margin-left: 50%; position: relative; min-height: 420px" height="480" id="webcam">
								<!--video id="video" style="margin-left: -187px; position: relative; bottom: 486px;" width="853" height="480" autoplay ></video-->
							</div>
							<svg @click="videoDivClick" v-if="showTarget" height="480" style="position: relative; left: 0px; bottom: 486px;" width="480">
								<circle cx="240" cy="240" fill="none" stroke="black" r="1.5" stroke-width="1"></circle>
								<circle cx="240" cy="240" fill="none" stroke="white" r="1" stroke-width="1"></circle>

								<line x1="240" x2="240" y1="224" y2="236" stroke="black" stroke-width="2"></line>
								<line x1="240" x2="240" y1="225" y2="235" stroke="white" stroke-width="1.5"></line>
								<line x1="240" x2="240" y1="254" y2="246" stroke="black" stroke-width="2"></line>
								<line x1="240" x2="240" y1="255" y2="245" stroke="white" stroke-width="1.5"></line>
								<line y1="240" y2="240" x1="224" x2="236" stroke="black" stroke-width="2"></line>
								<line y1="240" y2="240" x1="225" x2="235" stroke="white" stroke-width="1.5"></line>
								<line y1="240" y2="240" x1="254" x2="246" stroke="black" stroke-width="2"></line>
								<line y1="240" y2="240" x1="255" x2="245" stroke="white" stroke-width="1.5"></line>

								<!--line x1="236" x2="229" y1="244" y2="251" stroke="black" stroke-width="3"></line>
								<line x1="236" x2="229" y1="244" y2="251" stroke="white" stroke-width="2"></line>
								<line x1="244" x2="251" y1="244" y2="251" stroke="black" stroke-width="3"></line>
								<line x1="244" x2="251" y1="244" y2="251" stroke="white" stroke-width="2"></line-->
								<text x="225" y="25" font-family="Sans-Serif" font-size="24" style="fill: lime; background: black"> Y+ </text>
								<text x="225" y="475" font-family="Sans-Serif" font-size="24" style="fill: lime; background: black"> Y- </text>
								<text y="246" x="8" font-family="Sans-Serif" font-size="24" style="fill: red; background: black"> X- </text>
								<text y="247" x="447" font-family="Sans-Serif" font-size="24" style="fill: red; background: black"> X+ </text>
								<text x="215" y="180" font-family="Sans-Serif" font-size="18" style="fill: white; background: black"> +0.1 </text>
								<text x="220" y="320" font-family="Sans-Serif" font-size="18" style="fill: white; background: black"> -0.1 </text>
								<text  x="145" y="245" font-family="Sans-Serif" font-size="18" style="fill: white; background: black"> -0.1 </text>
								<text x="295" y="245" font-family="Sans-Serif" font-size="18" style="fill: white; background: black"> +0.1 </text>
								<text x="215" y="130" font-family="Sans-Serif" font-size="18" style="fill: white; background: black"> +0.5 </text>
								<text x="220" y="370" font-family="Sans-Serif" font-size="18" style="fill: white; background: black"> -0.5 </text>
								<text  x="105" y="245" font-family="Sans-Serif" font-size="18" style="fill: white; background: black"> -0.5 </text>
								<text x="350" y="245" font-family="Sans-Serif" font-size="18" style="fill: white; background: black"> +0.5 </text>
								<text x="215" y="80" font-family="Sans-Serif" font-size="18" style="fill: white; background: black"> +5.0 </text>
								<text x="220" y="420" font-family="Sans-Serif" font-size="18" style="fill: white; background: black"> -5.0 </text>
								<text  x="55" y="245" font-family="Sans-Serif" font-size="18" style="fill: white; background: black"> -5.0 </text>
								<text x="400" y="245" font-family="Sans-Serif" font-size="18" style="fill: white; background: black"> +5.0 </text>
								<path d="M 169 169 q 71 -58 142 0 l -35 35 q -35 -29 -72 0" stroke="white" ax="y" dir="u" sc="0.1" ></path>
								<path d="M 311 169 q 58 71 0 142 l -35 -35 q 29 -35 0 -72" stroke="white" ax="x" dir="u" sc="0.1" ></path>
								<path d="M 311 311 q -71 58 -142 0 l 35 -35 q 35 29 72 0" stroke="white" ax="y" dir="d" sc="0.1" ></path>
								<path d="M 169 311 q -58 -71 0 -142 l 35 35 q -29 35 0 72" stroke="white" ax="x" dir="d" sc="0.1" ></path>
								<path d="M 134 134 q 106 -89 212 0 l -35 35 q -71 -58 -142 0" stroke="white" ax="y" dir="u" sc="0.5" ></path>
								<path d="M 346 134 q 90 106 0 211 l -35 -35 q 59 -71 0 -141" stroke="white" ax="x" dir="u" sc="0.5" ></path>
								<path d="M 346 345 q -106 89 -212 0 l 35 -34 q 71 58 142 0" stroke="white" ax="y" dir="d" sc="0.5" ></path>
								<path d="M 134 345 q -89 -106 0 -211 l 35 35 q -59 71 0 141" stroke="white" ax="x" dir="d" sc="0.5" ></path>
								<path d="M 99 99 q 141 -120 283 0 l -35 35 q -106 -89 -212 0" stroke="white" ax="y" dir="u" sc="5" ></path>
								<path d="M 382 99 q 120 141 0 280 l -36 -34 q 90 -106 0 -211" stroke="white" ax="x" dir="u" sc="5" ></path>
								<path d="M 382 380 q -141 120 -282 0 l 35 -34 q 106 89 211 0" stroke="white" ax="y" dir="d" sc="5" ></path>
								<path d="M 100 380 q -120 -141 -1 -281 l 35 34 q -90 106 0 211" stroke="white" ax="x" dir="d" sc="5" ></path>
							</svg>
						</div>
						<v-slider v-model="zoom" append-icon="zoom_in" prepend-icon="zoom_out" @click:append="zoomIn" @click:prepend="zoomOut" min="1" max="2.5" step="0.25" hide-details thumb-label="">
						</v-slider>
						<v-slider v-if="focus.id" v-model="focus.value" append-icon="filter_hdr" prepend-icon="local_florist" :min="focus.min" :step="1" :max="focus.max" @click:append="focusFar" @click:prepend="focusNear" hide-details thumb-label="">
						</v-slider>
						<!--v-slider v-if="exposure.id" v-model="exposure.value" append-icon="brightness_7" prepend-icon="brightness_2" :min="exposure.min" :step="5" :max="exposure.max" @click:append="exposurePlus" @click:prepend="exposureMinus" hide-details thumb-label="">
					</v-slider-->
				</div>
				<v-expansion-panel :value="-1" class="z_probe_offset" style="margin-top: 10px">
					<v-expansion-panel-content style="background: #4D4D4D">
						<template v-slot:header>
							<div>
								{{ $t('panel.settingsNetwork.advanced' )}}
							</div>
						</template>
						<v-card style="background: #4D4D4D">
							<v-card-text class="panel-body">
								<v-layout row wrap>
									<v-flex v-for="(tool, index) in toolHeads" :key="tool.t" xl4 lg4 md4 sm6 xs12>
										<v-layout column style="border-right: 1px solid #333; border-bottom: 1px solid #222; margin: 5px; text-align: center; background: #5A5A5A;" v-if="!tool.hide">
											<v-layout style="font-size: larger;" row>
												<span v-html="$t('panel.toolOffset.offset', [''])"></span>&nbsp;<strong @click="targetTool(tool.t)" :id="tool.t"> T{{tool.t}}</strong>
												<span style="color: darkgray;" v-for="sec in tool.sec" :key="sec">
													, T{{toolHeads[sec].t}}
												</span>
											</v-layout>
											<v-divider></v-divider>
											<v-layout column>
												<v-layout row>
													<span v-html="$t('panel.toolOffset.offset', ['X'])"></span>&nbsp; <input v-if="!isLocal" class="tool_offset" autocomplete="off" type="number" :value="(relative?(tool.x-toolHeads[0].x):tool.x)" step="0.01" off="x" :tnum="index" v-bind:class="{disabled: (index == 0)}" @blur="handleToolOffsetBlurEvent" @keyup.enter="handleToolOffsetBlurEvent"/>&nbsp;{{ isLocal? '' : 'mm' }}
												</v-layout>
												<number-control v-if="isLocal" v-model.number="tool.x" ref="input" :min="-100" :max="100" :step="0.05" @keydown.native="onkeydown" @keyup.enter="toolOffsetEvent($event, index, tool)" @change="toolOffsetEvent($event, index, tool, 'x')" @blur="toolOffsetEvent($event, index, tool)" :title="'Tool ' + tool.t + ' X offset'" prompt="Please enter target tool offset" :loading="false" :disabled="false" :precision="2" ></number-control>
												<v-layout row v-if="!isLocal">
													<v-tooltip bottom>
														<template v-slot:activator="{ on }">
															<v-btn class="btn_tilt" off="x" :tnum="index" dir="d" v-on="on" @click="handleBtnOffsetEvent" v-bind:class="{'v-btn--disabled': (index == 0 && relative)}">
																<span class="content">-0.01mm</span>
																<v-icon> arrow_left </v-icon>
															</v-btn>
														</template>
														<span> Offsets the tool head by a tiny amount in the X direction (G10 Px Xyy) </span>
													</v-tooltip>
													<v-tooltip bottom>
														<template v-slot:activator="{ on }">
															<v-btn class="btn_tilt" off="x" :tnum="index" dir="u" v-on="on" @click="handleBtnOffsetEvent" v-bind:class="{'v-btn--disabled': (index == 0 && relative)}">
																<span class="content">+0.01mm</span>
																<v-icon> arrow_right </v-icon>
															</v-btn>
														</template>
														<span> Offsets the tool head by a tiny amount in the X direction (G10 Px Xyy) </span>
													</v-tooltip><br/>
												</v-layout>
											</v-layout>
											<v-layout column>
												<v-layout row>
													<span v-html="$t('panel.toolOffset.offset', ['Y'])"></span>&nbsp; <input v-if="!isLocal" class="tool_offset" autocomplete="off" type="number" :value="(relative?(tool.y-toolHeads[0].y):tool.y)" step="0.01" off="y" :tnum="index" tsec="{2}" @blur="handleToolOffsetBlurEvent" @keyup.enter="handleToolOffsetBlurEvent"/>&nbsp;{{ isLocal? '' : 'mm' }}
												</v-layout>
												<number-control v-if="isLocal" v-model.number="tool.y" ref="input" :min="-100" :max="100" :step="0.05" @keydown.native="onkeydown" @keyup.enter="toolOffsetEvent($event, index, tool)" @change="toolOffsetEvent($event, index, tool, 'y')" @blur="toolOffsetEvent($event, index, tool)" :title="'Tool '+tool.t+' Y offset'" prompt="Please enter target tool offset" :loading="false" :disabled="false" :precision="2"></number-control>
												<v-layout v-if="!isLocal" row>
													<v-tooltip bottom>
														<template v-slot:activator="{ on }">
															<v-btn class="btn_tilt" off="y" :tnum="index" dir="d" v-on="on" @click="handleBtnOffsetEvent" v-bind:class="{'v-btn--disabled': (index == 0 && relative)}">
																<span class="content">-0.01mm</span>
																<v-icon> arrow_left </v-icon>
															</v-btn>
														</template>
														<span> Offsets the tool head by a tiny amount in the Y direction (G10 Px Yyy) </span>
													</v-tooltip>
													<v-tooltip bottom>
														<template v-slot:activator="{ on }">
															<v-btn class="btn_tilt" off="y" :tnum="index" dir="u" v-on="on" @click="handleBtnOffsetEvent" v-bind:class="{'v-btn--disabled': (index == 0 && relative)}">
																<span class="content">+0.01mm</span>
																<v-icon> arrow_right </v-icon>
															</v-btn>
														</template>
														<span> Offsets the tool head by a tiny amount in the Y direction (G10 Px Xyy) </span>
													</v-tooltip>
												</v-layout>
											</v-layout>
										</v-layout>
									</v-flex>
									<!--div style="width: max-content; margin: 0 auto">
									<v-btn :onclick="'window.open(location.protocol+\'//'+selectedMachine+':8080/control.htm\', \'control\', \'width=500, height=600\')'" style="background: #212121;" :style="{'font-size': (isLocal ? 'larger' : '')}">
									{{ $t('panel.webcam.advanced' )}}
								</v-btn>
							</div-->
						</v-layout>
					</v-card-text>
				</v-card>
			</v-expansion-panel-content>
		</v-expansion-panel>
	</v-card-text>
</v-card>
</v-expansion-panel-content>
</v-expansion-panel>
</template>
<script>
'use strict'

import { mapActions, mapState, mapMutations } from 'vuex'
import axios from 'axios'

export default {
	data () {
		return {
			select: undefined,
			relative: false,
			b4: "",
			tools: [],
			toolHeads: [],
			backTool: [],
			toolPath: {},
			xyToolOffset: undefined,
			curTool: undefined,
			selectedTool: undefined,
			offset: {x: 0, y: 0},
			zoom: 1,
			exposure: { min: 0, max: 100, value: 0},
			focus: { min: 0, max: 100, value: 0},
			//Object.keys(table).forEach(index => !isNaN(index) ? console.log(index + ": " + table[index]): null)
			resolutions4_3: {0: "160x120", 1: "320x240", 2: "640x480", 3: "800x600", 4: "960x720", 5: "1024x576", 6: "1600x896",
			"240p": "320x240", "480p": "640x480", "720p": "960x720"},
			resolutions16_9: {0: "160x90", 1: "176x144", 2: "320x180", 3: "352x288", 4: "432x240", 5: "640x360", 6: "800x448", 7: "864x480", 8: "1280x720", 9: "1920x1080",
			'144p': "176x144", '240p': "432x240", '360p': "640x360", '480p': "864x480", '720p': "1280x720", '1080p': "1920x1080"},
			framerates: {'2fps': 2, '5fps': 5, '10fps': 10, '15fps': 15, '25fps': 25, '30fps': 30},
			selectF: undefined,
			selectR: undefined,
			timeoutVideo: undefined,
			axios: undefined,
			showTarget: false,
			camData: {},
			webcam: {
				devs: {},
				active: -1,
			}
		}
	},
	computed: {
		...mapState(['settings', 'selectedMachine', 'isLocal']),
		...mapState('machine/model', ['move']),
		...mapState({
			name: state => state.machine.model.network.name,
		}),
		edit: function() {
			console.log(this.curTool);
			return this.curTool >= 0;
		},
	},
	methods: {
		...mapActions('machine', ['getFileList', 'sendCode', 'download', 'upload']),
		...mapMutations('settings', ['update']),
		targetTool:async function(tool) {

			let myTool = this.toolHeads.filter((item) => item.t == this.curTool )[0]
			console.log(myTool)
			let that = this;
			this.move.axes.filter(axe => axe.letter != "Z").forEach(async function(axe) {
				if (myTool && that.toolHeads.indexOf(myTool) > 0) {
					myTool[axe.letter.toLowerCase()] = (parseFloat(myTool[axe.letter.toLowerCase()]) - (parseFloat(axe.machinePosition)-that.offset[axe.letter.toLowerCase()])).toFixed(2)
				} else {
					that.offset[axe.letter.toLowerCase()] = parseFloat(axe.machinePosition).toFixed(2);
				}
			})

			if (myTool && that.toolHeads.indexOf(myTool) > 0) {
				await that.sendCode("G10 P" + that.curTool + " X" + parseFloat(myTool.x).toFixed(2) + " Y" + parseFloat(myTool.y).toFixed(2));
			}

			myTool = this.toolHeads.filter((item) => item.t == tool)[0]
			console.log(myTool, this.toolHeads)
			if (myTool && this.toolHeads.indexOf(myTool) > 0) {
				await this.sendCode("G10 P" + tool + " X" + parseFloat(myTool.x).toFixed(2) + " Y" + parseFloat(myTool.y).toFixed(2));
			}
			await this.sendCode("G1 X0 Y0 Z150 F3600");
			if (this.curTool != tool)
			{
				await this.sendCode("T" + tool);
			}
			await this.sendCode("G1 X" + this.offset.x + " Y" + this.offset.y + " Z150 F3600");
			await this.sendCode("G1 X" + this.offset.x + " Y" + this.offset.y + " Z130 F600");
			this.curTool = tool;
		},
		preloadToolMatrices: async function() {
			console.log('load the cfg file');
			try {
				this.tools = [];
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
				files = files.filter(file => file.name.includes("Toolmatrix"))
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
						//console.log(file);
						toolName = file.name.substring(11);
						if (toolName.includes("."))
						toolName = toolName.substring(0, toolName.lastIndexOf("."));
						if(that.toolPath[toolName] === undefined)
						that.toolPath[toolName] = {};
						if(that.toolPath[toolName].matrix === undefined) {
							that.tools.push(toolName);
						}
						that.toolPath[toolName].matrix = path.substring(path.lastIndexOf("/")+1)+"/"+file.name;

						that.tools = that.tools.sort();
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
		loadToolMatrix: async function() {
			//isHF = false;
			let targetMatrix = this.select.toString();
			//console.log(this.toolPath[targetMatrix])
			this.b4 = [];
			let toolHeads = [];
			let filename = ("0:/macros/_Toolheads/"+this.toolPath[targetMatrix].matrix);
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
							if ((toolHeads[toolNum] == undefined) || (toolHeads[toolNum+1] == undefined && toolHeads[toolNum].t !== parseInt(line[j].substring(1)))) {
								toolNum++;
								//console.log("G10: tool " + parseInt(line[j].substring(1)) +" found");
								toolHeads[toolNum] = {};
								toolHeads[toolNum].t = parseInt(line[j].substring(1))
							}
						} else if(line[j].includes("U")) { // axis U-W
							//console.log("offset X of tool " + toolHeads[toolNum].t + " = "+ parseFloat(line[j].substring(1)));
							toolHeads[toolNum].u = parseFloat(line[j].substring(1));
						} else if(line[j].includes("V")) {
							//console.log("offset Y of tool " + toolHeads[toolNum].t + " = "+ parseFloat(line[j].substring(1)));
							toolHeads[toolNum].v = parseFloat(line[j].substring(1));
						} else if(line[j].includes("W")) {
							//console.log("offset Z of tool " + toolHeads[toolNum].t + " = "+ parseFloat(line[j].substring(1)));
							toolHeads[toolNum].w = parseFloat(line[j].substring(1));
						} else if(line[j].includes("X")) { // axis X-Z
							//console.log("offset X of tool " + toolHeads[toolNum].t + " = "+ parseFloat(line[j].substring(1)));
							toolHeads[toolNum].x = parseFloat(line[j].substring(1)).toFixed(2);
						} else if(line[j].includes("Y")) {
							//console.log("offset Y of tool " + toolHeads[toolNum].t + " = "+ parseFloat(line[j].substring(1)));
							toolHeads[toolNum].y = parseFloat(line[j].substring(1)).toFixed(2);
						} else if(line[j].includes("Z")) {
							//console.log("offset Z of tool " + toolHeads[toolNum].t + " = "+ parseFloat(line[j].substring(1)));
							toolHeads[toolNum].z = parseFloat(line[j].substring(1));
						} else if(line[j].includes("S")) {
							//console.log("default active temp of tool " + toolHeads[toolNum].t + " = " + parseFloat(line[j].substring(1)));
							toolHeads[toolNum].s = parseFloat(line[j].substring(1));
						} else if(line[j].includes("R")) {
							//console.log("default stanby temp of tool " + toolHeads[toolNum].t + " = " + parseFloat(line[j].substring(1)));
							toolHeads[toolNum].r = parseFloat(line[j].substring(1));
						}
					} else if (line[0] === "M563") {
						if (line[j].includes("P")) {
							if ((toolHeads[toolNum] == undefined) || (toolHeads[toolNum+1] == undefined && toolHeads[toolNum].t !== parseInt(line[j].substring(1)))) {
								toolNum++;
								//console.log("M563: tool " + parseInt(line[j].substring(1)) +" found");
								toolHeads[toolNum] = {};
								toolHeads[toolNum].t = parseInt(line[j].substring(1))
							}
						} else if ( line[j].includes("S")) {
							var open = -1;
							var close = -1;
							do {
								if (open < 0) {
									open = line[j].indexOf("\"");
									if (open < line[j].lastIndexOf("\"")){ // IE there is a second " after the first one ex( "A+B")
										close = line[j].lastIndexOf("\"");
										toolHeads[toolNum].e = line[j].substring(open+1, close)
									} else {
										toolHeads[toolNum].e = line[j].substring(open+1);
									}
								} else if (line[j].indexOf("\"") >= 0){ // we found the closing "
									close  = line[j].indexOf("\"");
									toolHeads[toolNum].e += " " + line[j].substring(0,close)
								} else {
									toolHeads[toolNum].e += " " + line[j]
								}
								j++;
							} while (close < 0);
							j--;
							//console.log("tool " + toolHeads[toolNum].t +" named: " + toolHeads[toolNum].e);
						} else if (line[j].includes("D")) {
							//console.log("tool " + toolHeads[toolNum].t + " drive " + parseFloat(line[j].substring(1)));
							var drives = line[j].substring(1).split(":")
							for(var k = 0; k < drives.length; k++)
							drives[k] = parseFloat(drives[k]);
							toolHeads[toolNum].d = drives;
						} else if (line[j].includes("H")) {
							//console.log("tool " + toolHeads[toolNum].t + " heater " + parseFloat(line[j].substring(1)));
							var heaters = line[j].substring(1).split(":")
							for(k = 0; k < heaters.length; k++)
							heaters[k] = parseFloat(heaters[k]);
							toolHeads[toolNum].h = heaters;
						} else if (line[j].includes("F")) {
							//console.log("fan " + parseFloat(line[j].substring(1)) + "maped to tool " + toolHeads[toolNum].t);
							toolHeads[toolNum].f = parseFloat(line[j].substring(1));
						} else if (line[j].includes("L")) {
							toolHeads[toolNum].l = parseFloat(line[j].substring(1));
						}
					}
				}
			}
			this.makeTools(toolHeads);
			//console.log("done")
			//console.log(toolHeads);
		},
		handleBtnOffsetEvent: async function(e) {
			let that = e.target;
			console.log("btnOffset clicked")
			while (that.nodeName.toLowerCase() !== "button") {
				that = that.parentElement;
			}
			e.preventDefault();
			if(!that.classList.contains("v-btn--disabled") && this.tools.length > 0)
			{
				that.classList.add("v-btn--disabled")
				let attr = that.attributes;
				var first = 0;
				while (this.tools[first] === undefined && this.tools.length > 0)
				{
					first++;
				}
				var offset = (parseFloat(that.innerText) + parseFloat(this.toolHeads[attr.tnum.value][attr.off.value]))
				clearTimeout(this.xyToolOffset);
				//console.log(offset);
				this.toolHeads[attr.tnum.value][attr.off.value] = offset.toFixed(2);
				await this.sendCode("G10 P" + attr.tnum.value + " X" + this.toolHeads[attr.tnum.value].x + " Y" + this.toolHeads[attr.tnum.value].y +" S0 R0");
				//await this.sendCode("G1 X0 Y0 Z150 F1200");
				if (this.curTool !== attr.tnum.value){
					await this.sendCode("T" + attr.tnum.value);
					this.curTool = attr.tnum.value;
				}
				//await this.sendCode("G1 X0 Y0 Z130 F1200");
				this.xyToolOffset = setTimeout(this.sendToolMatrix, 1000, attr.tnum.value)
				that.classList.remove("v-btn--disabled")
			}
		},
		handleToolOffsetBlurEvent: async function(e) {
			e.preventDefault();
			let that = e.target;
			//console.log("inputField blured")
			//console.log(e.target)
			while (that.nodeName.toLowerCase() !== "input") {
				that = that.parentElement;
			}
			let attr = that.attributes;
			var first = 0;
			while (this.tools[first] === undefined && this.tools.length > 0)
			{
				first++;
			}
			var offset = parseFloat(that.value);
			clearTimeout(this.xyToolOffset);
			this.toolHeads[attr.tnum.value][attr.off.value] = (offset + (this.relative? this.toolHeads[first][attr.off.value] : 0)).toFixed(2)
			await this.sendCode("G10 P" + attr.tnum.value + " X" + this.toolHeads[attr.tnum.value].x + " Y" + this.toolHeads[attr.tnum.value].y +" S0 R0");

			if (this.curTool !== attr.tnum.value){
				await this.sendCode("T" + attr.tnum.value);
				this.curTool = attr.tnum.value;
			}
			//await this.sendCode("G1 X0 Y0 Z130 F100");
			this.xyToolOffset = setTimeout(this.sendToolMatrix, 1000, attr.tnum.value)

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
						if (tools[j].d !== undefined && drives !== undefined) {
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
		sendToolMatrix: async function(/*targetMatrix*/) {
			//console.log("sending new tool matrix");
			var out = "";
			//console.trace();
			console.log(this.toolHeads)
			console.log(this.backTools)
			for (var i = 0; i < this.toolHeads.length; i++)
			{
				out += (this.b4[i] == undefined?"":this.b4[i]) + "\n";
				let str = "M563 P"+ this.toolHeads[i].t + " S\"" + this.toolHeads[i].e + "\" D" + this.toolHeads[i].d + (this.toolHeads[i].h ? " H" + this.toolHeads[i].h : "")
				out += str.padEnd(40, ' ') + "; Define tool " + this.toolHeads[i].t + "\n";
				str = "G10 P" +  this.toolHeads[i].t +
				" X" + (parseFloat(this.toolHeads[i].x) /*- (i == 0 ? 0 : this.offset.x)*/).toFixed(2) +
				" Y" + (parseFloat(this.toolHeads[i].y) /*- (i == 0 ? 0 : this.offset.y)*/).toFixed(2) +
				" Z" + parseFloat(this.toolHeads[i].z).toFixed(2)
				out += str.padEnd(40, ' ') + "; Set tool " + this.toolHeads[i].t + " axis offsets\n"
				if (this.toolHeads[i].h) {
					str = "G10 P" + this.toolHeads[i].t + " R" + this.toolHeads[i].r + " S" + this.toolHeads[i].s
					out += str.padEnd(40, ' ') + "; Set initial tool " + this.toolHeads[i].t + " active and standby temperatures to " + this.toolHeads[i].s + "/" + this.toolHeads[i].r + "°C\n";
				}
			}
			out += (this.b4[this.toolHeads.length] == undefined? "" : this.b4[this.toolHeads.length] );
			//console.log(this.tools);
			let filename = "0:/macros/_Toolheads/" + this.toolPath[this.select].matrix;
			let data =  out;
			//console.log(data);
			const content = new Blob([data]);
			try {
				this.upload({ filename: filename, content });
				this.$makeNotification('success',
				this.$t("panel.toolOffset.dialog.title"),
				this.$t("panel.toolOffset.dialog.sucess"),
				5000);
				this.preloadToolMatrices()
				this.curTool = -1;
			} catch (e) {
				this.$makeNotification('error',
				this.$t("panel.toolOffset.dialog.title"),
				this.$t("panel.toolOffset.dialog.error", [(e.err == 1 ? "no such file" : "not mounted")]),
				5000);
				console.error(e);// TODO Optionally ask user to save file somewhere else
			}
		},
		toolOffsetEvent: function(off, index, tool, axis) {
			console.log(off, index, tool, axis)
			clearTimeout(this.xyToolOffset);
			console.log(off,tool)
			this.toolHeads[index][axis] = off
			console.log(this.toolHeads)
			this.xyToolOffset = setTimeout(this.sendToolMatrix, 1000, index)
		},
		videoDivClick: async function(e) {
			//console.log(e)
			console.log('mouse clicked');
			let attr = e.target.attributes
			console.log(attr.ax, attr.dir, attr.sc)
			if (attr.ax && attr.dir && attr.sc)
			await this.sendCode("G91\n\
			G1 " + attr.ax.value.toUpperCase() + (attr.dir.value == 'd' ? -10 : 10) + " F3600\n\
			G1 " + attr.ax.value.toUpperCase() +
			(attr.dir.value == 'd' ?
			(10+parseFloat(attr.sc.value)) :
			-10-attr.sc.value ) + " F600\n\
			G90")
			let myTool = this.toolHeads.filter((item) => item.t == this.curTool )[0]
			console.log(myTool[attr.ax.value])
		},
		zoomIn: async function() {
			//console.log(e)
			this.zoom = (this.zoom + 0.25) || 4
		},
		zoomOut: async function() {
			//console.log(e)
			this.zoom = (this.zoom - 0.25) || 1
		},
		exposureMinus: async function() {
			//console.log(e)
			this.exposure.value -= 5
		},
		exposurePlus: async function() {
			//console.log(e)
			this.exposure.value += 5
		},
		focusNear: async function() {
			//console.log(e)
			this.focus.value -= 5
		},
		focusFar: async function() {
			//console.log(e)
			this.focus.value += 5
		},
		saveOffset: function() {
			console.log(this.toolHeads)
			console.log(this.curTool)
			let myTool = this.toolHeads.filter((item) => item.t == this.curTool )[0]
			console.log(myTool)
			//let pre  = ""
			//let post  = ""
			this.move.axes.filter(axe => axe.letter != "Z").forEach(axe => {
				//pre += axe.letter + " " + (parseFloat(myTool[axe.letter.toLowerCase()])).toFixed(2) + ", ";
				//post += axe.letter + " " + (parseFloat(myTool[axe.letter.toLowerCase()]) - parseFloat(axe.machinePosition)).toFixed(2) + ", "
				if (myTool != this.toolHeads[0]) {
					myTool[axe.letter.toLowerCase()] = (parseFloat(myTool[axe.letter.toLowerCase()]) - (parseFloat(axe.machinePosition)-this.offset[axe.letter.toLowerCase()])).toFixed(2)
				} else {
					this.offset[axe.letter.toLowerCase()] = parseFloat(axe.machinePosition).toFixed(2);
				}
			})
			console.log(this.offset);
			//console.log(pre + " => " + post);
			//X -18.86, Y 10.71, Z -136.00
			if (myTool != this.toolHeads[0]) {
				this.sendToolMatrix();
			} else {
				this.$makeNotification('success',
				this.$t("panel.toolOffset.dialog.title"),
				this.$t("panel.toolOffset.dialog.sucess"),
				5000);
			}
		},
		getWebcamParams: async function() {
			//let protocol = location.protocol;
			if (!this.axios) {
				//let protocol = location.protocol;
				this.axios = await axios.create({
					baseURL:ENTRYPOINT+`/`,
					//cancelToken: BaseConnector.getCancelSource().token,
					timeout: 8000,	// default session timeout in RepRapFirmware
					withCredentials: true,
				});
			}

			let result = await this.axios.get('/duet/action/pc_webcam', {
				withCredentials: true,
				params: {
					info: "",
				}
			});
			result = result.data
			//console.log(result);
			let controls = result.controls.filter(item => item.name.includes("Exposure") || item.name.includes("Focus"))
			//let format = result.formats.filter(item => item.current == "true")[0];

			let exposures = controls.filter(item => item.name.includes("Exposure"))
			this.exposure = exposures.filter(item => item.name.toLowerCase().includes("absolute"))[0]
			this.exposure.value = (this.exposure.max-this.exposure.min)-this.exposure.value
			this.exposure.auto = exposures.filter(item => !item.name.toLowerCase().includes("absolute"))
			//console.log(this.exposure);

			let focuses = controls.filter(item => item.name.includes("Focus"))
			let tmpFocus = focuses.filter(item => item.name.toLowerCase().includes("absolute"))[0]
			this.focus = (tmpFocus != undefined ? tmpFocus : this.focus)
			this.focus.value = (this.focus.max-this.focus.min)-this.focus.value
			this.focus.auto = focuses.filter(item => !item.name.toLowerCase().includes("absolute"))
		}
	},
	mounted: async function() {
		setTimeout(this.preloadToolMatrices, 1000*Math.random());
		var xhr =  new XMLHttpRequest();
		xhr.timeout = 2000;
		let that = this;


		xhr.onload = function() {
			let img = new Image()
			img.src = 'http://'+that.selectedMachine+':8080/?action=snapshot&dummy='+Math.random()
			img.onload = () => {
				if(document.getElementById('scaleableDiv') && document.getElementById('webcam')) {
					//console.log(img.width + 'x' + img.height);
					document.getElementById('scaleableDiv').parentElement.style.display= "";
					document.getElementById('webcam').style.left = -((480/img.height)*img.width)/2 + "px";
				}
			}
			if (document.getElementById('scaleableDiv') && document.getElementById('webcam')) {
				document.getElementById('webcam').style.transform = "rotate(180deg) scale(1, -1)";
				document.getElementById('webcam').src = 'http://'+that.selectedMachine+':8080/?action=stream&dummy=' + Math.random()
			}
			that.showTarget = true;
		}

		xhr.ontimeout = function() {
			//console.log(this.width + 'x' + this.height);
			document.getElementById('webcam').style.left = "-210px";
			//if (document.getElementById('webcam').src == "") {
			document.getElementById('webcam').style.transform = "";
			document.getElementById('webcam').src = ''

			that.showTarget = false;
		}

		setInterval(async function(that) {
			if (document.getElementById('scaleableDiv') && document.getElementById('webcam') && document.getElementById('webcam').src == "") {
				if (that.webcam.active < 0 || !that.showTarget) {
					if (!that.axios) {
						//let protocol = location.protocol;
						that.axios = await axios.create({
							baseURL:ENTRYPOINT+`/`,
							//cancelToken: BaseConnector.getCancelSource().token,
							timeout: 8000,	// default session timeout in RepRapFirmware
							withCredentials: true,
						});
					}

					let rep = await that.axios.get('/duet/action/pc_webcam', {
						withCredentials: true,
						//params: {fra: 5, res: that.resolutions16_9['480p']}
					});
					that.webcam.devs = rep.data.dev.filter((item, index)=> index%2 == 0);
					that.webcam.active = 0;
				} else {
					that.webcam.active++
				}
			}
			xhr.open('GET', 'http://'+that.selectedMachine+':8080/?action=snapshot&dummy='+Math.random(), true);
			xhr.send(null);
		}, 5000, that);

		if (document.getElementById('scaleableDiv') && document.getElementById('webcam')) {
			document.getElementById('webcam').style.left = "-240px"
			document.getElementById('webcam').style['min-width'] = "420px";
			document.getElementById('scaleableDiv').parentElement.style.display= "none";
			//console.log(xhr)
		}
	},
	watch: {
		toolHeads: {
			deep: true,
			handler: function(/*newVal*/){
				//console.trace();
				//console.log(newVal);
			}
		},
		/*exposure: {
		deep: true,
		handler: async function(post, pre) {
		//console.log(pre, post)
		//let protocol = location.protocol;
		if (pre.dest) {
		if (!this.axios) {
		//let protocol = location.protocol;
		this.axios = await axios.create({
		baseURL:`http://`+this.selectedMachine+`/`,
		//cancelToken: BaseConnector.getCancelSource().token,
		timeout: 8000,	// default session timeout in RepRapFirmware
		withCredentials: true,
	});
}

await this.exposure.auto.forEach((item) => {
this.axios.get('/pc_webcam', {
withCredentials: true,
params: {
action: "command",
dest: item.dest,
plugin: 0,
id: item.id,
group: item.group,
value: item.type == 2 ? 0 : 1//item.menu.indexOf("Manual Mode")
}
})
});

this.axios.get('/pc_webcam', {
withCredentials: true,
params: {
action: "command",
dest: this.exposure.dest,
plugin: 0,
id: this.exposure.id,
group: this.exposure.group,
value: ((this.exposure.max - this.exposure.min) - this.exposure.value)
}
})
}
}
},*/
		focus: {
			deep: true,
			handler: async function(post, pre) {
				//console.log(pre, post)
				if (pre.dest && post) {
					if (!this.axios) {
						//let protocol = location.protocol;
						this.axios = await axios.create({
							baseURL:ENTRYPOINT+`/`,
							//cancelToken: BaseConnector.getCancelSource().token,
							timeout: 8000,	// default session timeout in RepRapFirmware
							withCredentials: true,
						});
					}

					await this.focus.auto.forEach((item) => {
						this.axios.get('/duet/action/pc_webcam', {
							withCredentials: true,
							params: {
								action: "command",
								dest: item.dest,
								plugin: 0,
								id: item.id,
								group: item.group,
								value: item.type == 2 ? 0 : 1//item.menu.indexOf("Manual Mode")
							}
						})
					});

					this.axios.get('/duet/action/pc_webcam', {
						withCredentials: true,
						params: {
							action: "command",
							dest: this.focus.dest,
							plugin: 0,
							id: this.focus.id,
							group: this.focus.group,
							value: ((this.focus.max - this.focus.min) - this.focus.value)
						}
					})
				}
			}
		},
		webcam: {
			deep: true,
			handler: async function() {
				//console.log(pre, post)
				if (this.webcam.devs[this.webcam.active] && document.getElementById('scaleableDiv') && document.getElementById('webcam')){
					if (!this.axios){
						this.axios = await axios.create({
							baseURL:ENTRYPOINT+`/`,
							//cancelToken: BaseConnector.getCancelSource().token,
							timeout: 8000,	// default session timeout in RepRapFirmware
							withCredentials: true,
						});
					}
					this.axios.get('/duet/action/pc_webcam', {
						withCredentials: true,
						params: {
							dev: this.webcam.devs[this.webcam.active],
							fra: this.settings.webcam.framerate,
							res: this.settings.webcam.resolution
						}
					});
					setTimeout(that => {
						that.getWebcamParams();
						document.getElementById('webcam').src == ""
						document.getElementById('webcam').style.left = "-240px"
					} , 3000, this)
				}
			}
		},
		zoom: async function(post) {
			//console.log(pre, post)
			if (document.getElementById('scaleableDiv') && document.getElementById('webcam')) {
				let event = document.getElementById('scaleableDiv')
				if (!this.axios){
					this.axios = await axios.create({
						baseURL:ENTRYPOINT+`/`,
						//cancelToken: BaseConnector.getCancelSource().token,
						timeout: 8000,	// default session timeout in RepRapFirmware
						withCredentials: true,
					});
				}
				this.axios.get('/duet/action/pc_webcam', {
					withCredentials: true,
					params: {fra: this.framerates['5fps'], res: this.resolutions16_9['480p']}
				});
				//console.log('480p')
				event.style.transform = "scale(" + post + ")"
			}
		}
	}
}
</script>
