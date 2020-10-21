<style scoped>
/* This container is needed to position the front and back side */
.v-card__text{
	position: relative;
	width: 100%;
	height: 100%;
	text-align: center;
	transition: transform 0.5s;
	transform-style: preserve-3d;
	padding: 5px;
}

.v-icon {
	font-size: 18px;
}

p {
	margin-top:15px;
	margin-bottom: auto;
}

.v-input--switch, .v-btn {
	margin: 6px 5px;
}

.toff {
	padding: 0 10px;
	text-align: center;
	border-right: 1px solid darkgray;
	display: inline-block;
	min-width: 200px;
}
.toff input, .tool_angle {
	width: 50px;
	height: 20px;
	text-align: center;
	border: 1px solid black;
	border-radius: 4px;
}

.layout.row {
	margin: 0 auto;
}
</style>
<template>
	<v-expansion-panel :value="isLocal?-1:0" class="z_probe_offset">
		<v-expansion-panel-content>
			<template v-slot:header>
				<div>
					{{ $t('panel.toolAngle.caption') }}
				</div>
			</template>
			<v-card>
				<v-card-text v-if="filePath.length > 0">

					<v-btn @click="sendCode('T0\nG1 X0 Y0 Z95 F3600\nG1 X0 Y0 Z80 F600'); confirmAngleDialog.shown = true; confirmAngleDialog.callback = autoCalibrate">
						{{$t('panel.toolAngle.auto')}}
					</v-btn>

					<div :style="{height: chart ? '200px' : '0px' }">
						<canvas ref="chart"></canvas>
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
										<v-flex v-for="(tool, index) in filePath" v-bind:key="index" :tool="tool" xl3 lg4 md4 sm6 xs12>
											<v-layout v-if="tool.data" column style="border-right: 1px solid #333; border-bottom: 1px solid #222; margin: 5px; text-align: center; background: #5A5A5A;">
												<v-layout style="font-size: larger;" row>
													<span :id="tool.id" v-html="$t('panel.toolAngle.angle', [tool.id])"></span>
												</v-layout>
												<v-divider></v-divider>
												<v-layout v-if="tool.data.active" column>
													<v-layout row>
														{{$t('panel.toolAngle.active')}}&nbsp;<input v-if="!isLocal" class="tool_angle" autocomplete="off" type="number" :value="tool.data.active.s" step="1" off="active" :tnum="index" @blur="handleToolOffsetBlurEvent" @keyup.enter="handleToolOffsetBlurEvent" @focus="sendCode('M280 P7 S'+tool.data.active.s)" />&nbsp;{{ isLocal ? '' : '°' }}
													</v-layout>
													<number-control v-if="isLocal" v-model.number="tool.data.active.s" ref="input" :min="0" :max="180" :step="1" @keydown.native="onkeydown" @keyup.enter="toolAngleEvent($event, index, 'active')" @change="toolAngleEvent($event, index, 'active')" @blur="toolAngleEvent($event, index, 'active')" title="Tool n angle" prompt="Please enter target tool angle" :loading="false" :disabled="false" @focus="sendCode('M280 P7 S'+tool.data.active.s)"></number-control>
													<v-layout row v-if="!isLocal">
														<v-tooltip bottom>
															<template v-slot:activator="{ on }">
																<v-btn class="btn_tilt" off="active" :tnum="index" dir="d" v-on="on" @click="handleBtnOffsetEvent">
																	<v-icon> arrow_back </v-icon>
																	<span class="content">-1.00°</span>
																</v-btn>
															</template>
															<span> Offsets the tool head by a tiny amount in the X direction (G10 Px Xyy) </span>
														</v-tooltip>
														<v-tooltip bottom>
															<template v-slot:activator="{ on }">
																<v-btn class="btn_tilt" off="active" :tnum="index" dir="u" v-on="on" @click="handleBtnOffsetEvent">
																	<span class="content">+1.00°</span>
																	<v-icon> arrow_forward </v-icon>
																</v-btn>
															</template>
															<span> Offsets the tool head by a tiny amount in the X direction (G10 Px Xyy) </span>
														</v-tooltip><br/>
													</v-layout>
												</v-layout>
												<v-layout column v-if="tool.data.unactive">
													<v-layout row>
														{{$t('panel.toolAngle.standby')}}&nbsp;<input v-if="!isLocal" class="tool_angle" autocomplete="off" type="number" :value="tool.data.unactive.s" step="1" off="unactive" :tnum="index" @blur="handleToolOffsetBlurEvent" @keyup.enter="handleToolOffsetBlurEvent" @focus="sendCode('M280 P7 S'+tool.data.active.s)" />&nbsp;{{ isLocal ? '' : '°' }}
													</v-layout>
													<number-control v-if="isLocal" v-model.number="tool.data.unactive.s" ref="input" :min="0" :max="180" :step="1" @keydown.native="onkeydown" @keyup.enter="toolAngleEvent($event, index, 'unactive')" @change="toolAngleEvent($event, index, 'unactive')" @blur="toolAngleEvent($event, index, 'unactive')" title="Tool n angle" prompt="Please enter target tool angle" :loading="false" :disabled="false"></number-control>
													<v-layout v-if="!isLocal" row>
														<v-tooltip bottom>
															<template v-slot:activator="{ on }">
																<v-btn class="btn_tilt" off="unactive" :tnum="index" dir="d" v-on="on" @click="handleBtnOffsetEvent">
																	<v-icon> arrow_back </v-icon>
																	<span class="content">-1.00°</span>
																</v-btn>
															</template>
															<span> Offsets the tool head by a tiny amount in the X direction (G10 Px Xyy) </span>
														</v-tooltip>
														<v-tooltip bottom>
															<template v-slot:activator="{ on }">
																<v-btn class="btn_tilt" off="unactive" :tnum="index" dir="u" v-on="on" @click="handleBtnOffsetEvent">
																	<span class="content">+1.00°</span>
																	<v-icon> arrow_forward </v-icon>
																</v-btn>
															</template>
															<span> Offsets the tool head by a tiny amount in the X direction (G10 Px Xyy) </span>
														</v-tooltip><br/>
													</v-layout>
													<v-layout column>
														<v-btn @click="sendCode('T'+ tool.number +'\nG1 X0 Y0 Z95 F3600\nG1 X0 Y0 Z80 F600'); confirmAngleDialog.shown = true; confirmAngleDialog.callback = autoCalibrate.bind(null, tool.number)">
															{{$t('panel.toolAngle.run', [tool.id])}}
														</v-btn>
														<v-btn @click="moveIntoPosition(tool.number)" v-html="$t('panel.toolAngle.move', [tool.id])"></v-btn>
													</v-layout>
												</v-layout>
											</v-layout>
										</v-flex>
									</v-layout>
								</v-card-text>
							</v-card>
						</v-expansion-panel-content>
					</v-expansion-panel>
				</v-card-text>
			</v-card>
			<confirm-dialog :shown.sync="confirmAngleDialog.shown" :question="confirmAngleDialog.question" :prompt="confirmAngleDialog.prompt" @confirmed="confirmAngleDialog.callback"></confirm-dialog>
		</v-expansion-panel-content>
	</v-expansion-panel>
</template>
<script>
'use strict'

import Chart from 'chart.js'

import { mapActions, mapState } from 'vuex'
export default {
	data () {
		return {
			tAngle: undefined,
			filePath:  [{id: "E0" , data: {active: { m: 280, p: 7, s: 0 }, unactive: { m: 280, p: 7, s: 1 }}},
			{id: "E1" , data: {active: { m: 280, p: 7, s: 2 }, unactive: { m: 280, p: 7, s: 3 }}},
			{id: "E2" , data: {active: { m: 280, p: 7, s: 4 }, unactive: { m: 280, p: 7, s: 5 }}}],
			chart: undefined,
			toolPath: {},
			confirmAngleDialog: {
				question: "Nivellement des buses",
				prompt: "Branchez la jauge outil et positionnez-la sous la buse",
				callback: function(){alert("Wrong callback")},
				shown: false,
			},
			toolHeads:{},
		}
	},
	computed: {
		...mapState(['isLocal', 'connectDialogShown', 'passwordRequired', 'selectedMachine', 'isConnecting']),
		...mapState({
			name: state => state.machine.model.network.name,
		}),
		...mapState('machine/model', ['heat', 'tools']),
	},
	methods: {
		...mapActions('machine', ['getFileList', 'sendCode', 'download', 'upload']),
		preloadToolMatrices: async function() {
			//console.log('load the cfg file');
			try {
				this.toolHeads = [];
				// Load file list and create missing props
				let name = this.name.substr(8, this.name.substr(8).indexOf('_'));
				let vers = this.name.substr(this.name.lastIndexOf('v')+1);
				//console.log(name, vers)
				let files = await this.getFileList("0:/macros/_Toolheads");
				//console.log(files)
				files = files.filter((file) => file.name.includes(name) && file.name.includes(vers))
				//console.log(files)
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
				//console.log(files.toSource());
				files = files.filter(file => file.name.includes("active"))
				//console.log(files.toSource());
				let that = this;
				var toolName;
				let inter = setInterval(function(files) {
					if (files == undefined || files.length <= 1) {
						clearInterval(inter);
					}
					let file = files.shift();
					//console.log(file);
					if(file != undefined){
						//console.log(file.toSource());
						toolName = file.directory.substring(file.directory.lastIndexOf("/")+1);
						if (toolName.match(/\.([a-zA-Z])+$/))
						toolName = toolName.substring(0, toolName.lastIndexOf("."));
						if(that.toolPath[toolName] === undefined)
						that.toolPath[toolName] = {};
						if(that.toolPath[toolName].matrix === undefined) {
							that.toolHeads.push(toolName);
						}
						that.toolPath[toolName].matrix = path.substring(path.lastIndexOf("/")+1)+"/"+file.name;

						that.toolHeads = that.toolHeads.sort();
						let name = (that.name.lastIndexOf("~")>0 ? that.name.substring(8, that.name.lastIndexOf("~"), 2):"")
						//console.log(toolName, name)
						if(toolName.includes(name)){
							that.select = toolName
							//console.log(toolName, name)
							that.loadServoAngle(toolName);
						}
					}
				}, 125, files);
				//this.loadServoAngle(toolName);
				//$("#hname").prop("value", toolName);
				//$("#hname").data("tool" , toolName);
			} catch(e) {
				console.error(e);
			}
		},
		loadServoAngle: async function(dir) {
			//console.log('load the servo angle');
			try {
				// Load file list and create missing props
				//console.log(dir)
				const files = await this.getFileList("0:/macros/_Toolheads/"+dir);
				let tools = files.filter(tool => tool.name.includes("active"))
				//console.log(tools.length ? tools : "");
				let that = this;
				this.filePath = []
				await tools.forEach(function(item, index) {
					//console.log(item)
					if (!item.isDirectory)
					{
						//console.log(index);
						setTimeout(that.preloadServoAngle, 500*index, item);
					}
				});
			} catch(e) {
				console.error(e);
			}
		},
		preloadServoAngle: async function(path){
			try {
				let servoPath = path.directory + "/" + path.name;
				const result = await this.download({ filename: servoPath, type: 'text', showSuccess: false });
				let name = path.name.split(" ");
				let data = result.split(" ");
				//console.log(servoPath)
				//console.log(result)
				var item = {};
				item.id = name[0]
				item.data = {}
				item.data[name[1]] = {}
				item.number = (this.tools.filter(tool => tool.name == item.id))[0].number
				for( var i = 0; i < data.length; i++) {
					if (data[i].startsWith("P"))
					item.data[name[1]].p = parseInt(data[i].substring(1));
					else if (data[i].startsWith("S"))
					item.data[name[1]].s = parseInt(data[i].substring(1));
					else if (data[i].startsWith("M"))
					item.data[name[1]].m = parseInt(data[i].substring(1));
				}
				let tool = this.filePath.filter(tool => tool.id == item.id)[0]
				this.filePath = this.filePath.filter(tool => tool.id != item.id)
				if (tool != undefined)
				tool.data[name[1]] = item.data[name[1]]
				else
				tool = item
				//console.log(tool)
				this.filePath.push(tool)
				this.filePath.sort((a, b) => (a.id < b.id ? -1 : (a.id > b.id ? 1 : 0)))
				//console.log(this.filePath)
			} catch(e) {
				console.error(e);
			}
		},
		moveIntoPosition: async function(tool){
			this.sendCode("T"+tool+"\nG1 X0 Y-150 Z300 F3000")
		},
		handleBtnOffsetEvent: async function(e) {
			let that = e.target;
			//console.log("btnOffset clicked")
			while (that.nodeName.toLowerCase() !== "button") {
				that = that.parentElement;
			}
			e.preventDefault();
			if(!that.classList.contains("v-btn--disabled"))
			{
				that.classList.add("v-btn--disabled")
				let attr = that.attributes;
				//console.log(attr)
				var first = attr.tnum.nodeValue
				var act = attr.off.nodeValue
				var angle = (attr.dir.nodeValue == "d" ? -1 : 1)+ this.filePath[first].data[act].s
				//console.log(angle)
				clearTimeout(this.toolAngle);
				this.filePath[first].data[act].s = angle
				//that.innerText = this.filePath[first].data[act].s;
				await this.sendCode("M280 P7 S" + this.filePath[first].data[act].s);

				var input = Array.from(document.getElementsByClassName("tool_angle")).filter(input => input.attributes.off.nodeValue === act && input.attributes.tnum.nodeValue === first)[0]
				//console.log(input)
				input.value = angle

				this.toolAngle = setTimeout(this.sendToolAngle, 1000, first, act)
				that.classList.remove("v-btn--disabled")
			}
		},
		handleToolOffsetBlurEvent: async function(e) {
			let that = e.target;
			//console.log("inputOffset blured")
			while (that.nodeName.toLowerCase() !== "input") {
				that = that.parentElement;
			}
			e.preventDefault();
			let attr = that.attributes;
			//console.log(attr)
			var first = attr.tnum.nodeValue
			var act = attr.off.nodeValue
			var angle = parseInt(that.value)
			//console.log(angle)
			clearTimeout(this.toolAngle);
			this.filePath[first].data[act].s = angle

			await this.sendCode("M280 P7 S" + this.filePath[first].data[act].s);

			//console.log(first, act)
			this.toolAngle = setTimeout(this.sendToolAngle, 1000, first, act)
		},
		sendToolAngle: async function(first, act) {
			var filename = ("E" + first + " " + act +" servo")
			let name = (this.name.lastIndexOf("~")>0 ? this.name.substring(8, this.name.lastIndexOf("~"), 2):"")
			let vers = this.name.substr(this.name.lastIndexOf('v')-1);
			name += vers
			//console.log(name);
			//let tools = files.filter(tool => tool.name.includes(name))
			var filepath = "0:/macros/_Toolheads/" + name + "/" + filename
			var out = "M280 P7 S" + this.filePath[first].data[act].s
			//console.log(filepath, out)
			const content = new Blob([out]);
			try {
				this.upload({ filename: filepath, content });
				this.$makeNotification('success',
				this.$t("panel.toolOffset.dialog.title"),
				this.$t("panel.toolOffset.dialog.sucess"),
				2000);
			} catch (e) {
				console.log("Error: " + (e.err == 1 ? "no such file" : "not mounted"));
				console.error(e);// TODO Optionally ask user to save file somewhere else
			}
		},
		toolAngleEvent: async function(temp, index, active) {
			//console.log(temp, index, active)

			clearTimeout(this.toolAngle);
			this.filePath[index].data[active].s = temp;
			this.sendCode("M280 P7 S" + this.filePath[index].data[active].s);
			this.toolAngle = setTimeout(this.sendToolAngle, 1000, index, active)

		},
		autoCalibrate: async function(curT = -1) {
			// Create the chart
			this.chart = Chart.Line(this.$refs.chart, {
				options: this.options,
				data: {
					datasets: [{
						borderColor: 'rgba(253, 189, 28, 0.8)', //'rgba(0, 129, 214, 0.8)',
						backgroundColor: 'rgba(253, 189, 28, 0.8)', //'rgba(0, 129, 214, 0.8)',
						fill: false,
						//label: this.$t('chart.layer.layerTime')
					}]
				}
			});

			//console.log(this.chart)

			this.applyDarkTheme(this.darkTheme);

			//console.log(this.filePath)
			let that = this;
			let response;
			//console.log(response);
			let index = -1;
			if (curT > -1)
			index = this.filePath.findIndex(tool => tool.number == curT)
			for (let i = (index > -1 ? index : 0);
			i <= (index > -1 ? index : this.filePath.length-1); i++){
				let tool = this.filePath[i]
				let tnum = tool.number
				let tAngle = tool.data.active.s
				//let code
				//console.log(tool)
				//console.log(tnum)
				//console.log(tAngle);
				let angle = Math.max(0, tAngle-11) ;
				//angle = (angle%2? angle+1 : angle)
				let minZ = {angle: [], offset: 0}
				let offZ;
				response = await that.sendCode({code: "G10 P"+tnum, log: false});
				response = response.split('\n')[0]
				response = response.substr(response.indexOf('Z')+1)
				response = response.substr(0, response.indexOf(' '))
				let tOff = parseFloat(response);
				//console.log(tOff)
				do {
					angle += 1;
					//console.log(angle);
					await that.sendCode({code: "T-1\nG10 P"+tnum+" Z0\nT"+tnum, log: false})
					await that.sendCode({code: "G1 X0 Y0 Z"+(70-tOff)+" F3600\nG1 X0 Y0 Z"+(55-tOff)+" F600", log: false})
					await that.sendCode({code: "M280 P7 S" + angle + "\nG4 S1", log: false})
					await that.sendCode({code: "M585 Z-"+((55-tOff)-40)+" E8 L1 F100 S1\nG1 X0 Y0 Z"+(70-tOff)+" F1800", log: false})
					response = await that.sendCode({code: "G10 P"+tnum, log: false});
					await that.sendCode({code: "G4 S2", log: false});
					if (response == "")
					{
						//minZ = {angle: -1, offset: 0};
						//break;
						response = await that.sendCode({code: "G4 S10", log: false})
						if (response == "")
						{
							angle -= 2;
						}
						//console.log(response);
					}
					response = response.split('\n')[0]
					response = response.substr(response.indexOf('Z')+1)
					response = response.substr(0, response.indexOf(' '))
					offZ = parseFloat(response)
					if (offZ < minZ.offset-0.02)
					{
						minZ.offset = offZ
						minZ.angle = []
					}
					if (offZ <= minZ.offset) {
						minZ.angle.push(angle)
					}
					if (!isNaN(offZ) && !isNaN(angle)) {
						this.chart.data.labels.push(angle)
						this.chart.data.datasets[0].data.push({x: angle, y: offZ})
						//console.log(this.chart.data.datasets[0]);
						this.chart.update();
					}
				} while (angle < Math.min(180, tAngle+10));
				this.chart.data.datasets[0].data.push({x: angle, y: NaN})
				//console.log(minZ);
				await that.sendCode({code: "G4 S10", log: false})
				const avgAngle = arr => arr.reduce((a,b) => a + b, 0) / arr.length
				tool.data.active.s = Math.round(avgAngle(minZ.angle))
				this.sendToolAngle(tool.id.substr(1), 'active')
			}
			await that.sendCode({code: "T999\nG28", log: false})
			this.nozzleHeightCalib();
			this.chart.destroy()
			this.chart = undefined;
		},
		nozzleHeightCalib: async function() {
			console.log("Running Nozzle Height");
			const files = await this.getFileList("0:/macros/_Toolheads");
			let name = this.name.substr(8, 5);
			let tools = files.filter(tool => tool.name.includes(name))
			//console.log(name)
			//console.log(tools.length ? tools : "");
			let that = this;
			tools.forEach(function(item) {
				if (item.isDirectory)
				{
					//console.log(item);
					that.preloadNozzleHeight(item.directory + "/" + item.name)
				}
			});
		},
		preloadNozzleHeight: async function(path){
			try {
				let files = await this.getFileList(path);
				let name = (this.name.lastIndexOf("~")>0?this.name.substr(this.name.lastIndexOf("~")+1, 2):"");
				//console.log(name)
				files = files.filter(file => file.name.includes("Nozzle") && file.name.includes(name))
				//console.log(files);
				let that = this;
				files.forEach(function (file) {
					if(file != undefined && file.name.includes("Nozzle")) {
						that.sendCode('M98 P' + files[0].directory + "/" + files[0].name)
					}
				});
			} catch(e) {
				console.error(e);
			}
		},
		applyDarkTheme(active) {
			const ticksColor = active ? '#FFF' : '#666';
			this.chart.config.options.scales.xAxes[0].ticks.minor.fontColor = ticksColor;
			this.chart.config.options.scales.xAxes[0].ticks.major.fontColor = ticksColor;
			this.chart.config.options.scales.yAxes[0].ticks.major.fontColor = ticksColor;
			this.chart.config.options.scales.yAxes[0].ticks.minor.fontColor = ticksColor;

			const gridLineColor = active ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';
			this.chart.config.options.scales.xAxes[0].gridLines.color = gridLineColor;
			this.chart.config.options.scales.yAxes[0].gridLines.color = gridLineColor;
			this.chart.config.options.scales.yAxes[0].gridLines.zeroLineColor = gridLineColor;

			this.chart.update();
		}
	},
	mounted() {
		// Create new chart options. Don't use data for the following because it should not be reactive
		//const that = this;
		this.options = {
			elements: {
				line: {
					tension: 0
				},
				point: {
					pointRadius: 0,
				}
			},
			legend: {
				display: false
			},
			maintainAspectRatio: false,
			scales: {
				xAxes: [
					{
						gridLines: {
							color: 'rgba(0,0,0,0.2)',
							display: true
						},
						ticks: {
							minor: {
								fontColor: 'rgba(0,0,0,0.87)',
								fontFamily: 'Roboto,sans-serif'
							},
							major: {
								fontColor: 'rgba(0,0,0,0.87)',
								fontFamily: 'Roboto,sans-serif'
							},
							beginAtZero: true,
							maxRotation: 0,
							stepSize: 5
						}
					}
				],
				yAxes: [
					{
						gridLines: {
							color: 'rgba(0,0,0,0.87)',
							zeroLineColor: 'rgba(0,0,0,0.2)',
							display: true
						},
						ticks: {
							minor: {
								fontColor: 'rgba(0,0,0,0.87)',
								fontFamily: 'Roboto,sans-serif'
							},
							major: {
								fontColor: 'rgba(0,0,0,0.87)',
								fontFamily: 'Roboto,sans-serif'
							},
							beginAtZero: false,
							stepSize: 0.5,
							//suggestedMax: 5,
						}
					}
				]
			},
			// panning and zooming is not supported until the panning feature of chartjs-plugin-zoom is fixed
		};

		setTimeout(this.preloadToolMatrices, 1000*Math.random());
	},
}
</script>
