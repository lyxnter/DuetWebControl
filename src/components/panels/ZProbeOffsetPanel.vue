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
	text-transform: none !important;
}

</style>
<template>
	<v-expansion-panel :value="isLocal?-1:0" class="z_probe_offset">
		<v-expansion-panel-content>
			<template v-slot:header>
				<div>
					{{ $t('panel.toolOffset.captionZ') }}
				</div>
			</template>
			<v-card>
				<v-card-text>
					<v-flex xl12 lg12 md12 sm6 xs12 style="margin: auto">
						<v-layout column style="border-right: 1px solid #333; border-bottom: 1px solid #222; margin: 5px; text-align: center; background: #505050;">
							<p><span v-html="$t('panel.toolOffset.offset', ['Z'])"></span><br/>
								<span style="color: darkgray"> {{ $t('panel.toolOffset.toolTrigHeight') }} </span>
								<v-flex v-if="!isLocal" row >
									<input style="width: 50px; height: 20px;text-align: center; border: 1px solid black; border-radius: 4px;"
									class="span_probe_offset"
									axis="z"
									autocomplete="off"
									type="number"
									:value="probeOffset"
									step="0.05"
									@keypress="keypressOffsetEvent"
									@blur="blurOffsetEvent"/> mm<br/>
									<v-tooltip bottom>
										<template v-slot:activator="{ on }">
											<v-btn class="btn_tilt" axis="z" dir="d" v-on="on" @click="clickBtnOffset">
												<span class="content">-0.05mm</span>
												<v-icon> arrow_downward </v-icon>
											</v-btn>
										</template>
										<span> Decrease Z probe offset (G10 Zxxx) </span>
									</v-tooltip>
									<v-tooltip bottom>
										<template v-slot:activator="{ on }">
											<v-btn class="btn_tilt" axis="z" dir="u" v-on="on" @click="clickBtnOffset">
												<span class="content">+0.05mm</span>
												<v-icon> arrow_upward </v-icon>
											</v-btn>
										</template>
										<span> Increase Z probe offset (G10 Zxxx) </span>
									</v-tooltip>
								</v-flex>
								<number-control v-if="isLocal" v-model.number="probeOffset" ref="input" :min="0" :max="50" :step="0.05" @keydown.native="onkeydown" @keyup.enter="keypressProbeOffsetEvent" @change="keypressProbeOffsetEvent" @blur="blurOffsetEvent" title="Z Probe offset" prompt="Please enter the new offset" :loading="applying" :disabled="uiFrozen" axis="z" :precision="2"></number-control>
								<span style="color: darkgray">{{ $t('panel.toolOffset.bbStepping') }}</span><br/>
								<v-flex v-if="!isLocal" row>
									<input style="width: 50px; height: 20px;text-align: center; border: 1px solid black; border-radius: 4px;"
									class="span_probe_offset"
									axis="z"
									autocomplete="off"
									type="number"
									:value="babystepZ"
									step="0.05"
									@keypress="keypressOffsetEvent"
									@blur="blurOffsetEvent"/> mm<br/>
									<v-tooltip bottom>
										<template v-slot:activator="{ on }">
											<v-btn class="btn_tilt" axis="b" dir="d" v-on="on" @click="clickBtnOffset">
												<span class="content">-0.05mm</span>
												<v-icon> arrow_downward </v-icon>
											</v-btn>
										</template>
										<span> Decrease Z probe offset (G10 Zxxx) </span>
									</v-tooltip>
									<v-tooltip bottom>
										<template v-slot:activator="{ on }">
											<v-btn class="btn_tilt" axis="b" dir="u" v-on="on" @click="clickBtnOffset">
												<span class="content">+0.05mm</span>
												<v-icon> arrow_upward </v-icon>
											</v-btn>
										</template>
										<span> Increase Z probe offset (G10 Zxxx) </span>
									</v-tooltip>
								</v-flex>
								<number-control v-if="isLocal" v-model.number="babystepZ" ref="input" :min="-1" :max="1" :step="0.05" @keydown.native="onkeydown" @keyup.enter="keypressBabystepOffsetEvent" @change="keypressBabystepOffsetEvent" @blur="blurBabystepOffsetEvent" title="Babystep offset" prompt="Please enter the usual babystep" :loading="applying" :disabled="uiFrozen" axis="z" :precision="2"></number-control>
							</p>
							<br/>
						</v-layout>
					</v-flex>
				</v-card-text>
			</v-card>
		</v-expansion-panel-content>
	</v-expansion-panel>
</template>
<script>
'use strict'

import { mapActions, mapState } from 'vuex'
export default {
	data () {
		return {
			zOffset: undefined, // id timeout file send
			probeOffset: "0.00",
			babystepZ: undefined,
			toolPath: {},
			applying: false,
			input: null,
			actualValue: 0,
			uiFrozen: false,
		}
	},
	props: {
		label: String,
		active: Boolean,
		standby: Boolean,
		tabTarget: [Object, HTMLAnchorElement],

		all: Boolean,
		heaterIndex: Number,
		tool: Object,
		shown: {
			type: Boolean,
			default: true
		},
	},
	computed: {
		...mapState(['isLocal', 'connectDialogShown', 'passwordRequired', 'selectedMachine', 'isConnecting']),
		...mapState({
			name: state => state.machine.model.network.name,
		}),
	},
	methods: {
		...mapActions('machine', ['getFileList', 'sendCode', 'download', 'upload']),
		clickBtnOffset: function(e) {
			e.preventDefault();
			clearTimeout(this.zOffset);
			let that = e.target;
			while (that.nodeName.toLowerCase() !== "button")
			that = that.parentElement;
			that = that.attributes;
			var axis = that.axis.value;
			var dir = that.dir.value;
			if (axis == "z")
			{
				this.probeOffset = (parseFloat(this.probeOffset) + (dir == "d" ? -0.05 : 0.05)).toFixed(2);
			}
			if (axis == "b")
			{
				this.babystepZ = (parseFloat(this.babystepZ) + (dir == "d" ? -0.05 : 0.05)).toFixed(2);
			}
			this.zOffset = setTimeout(this.sendToolOffset, 1000);
		},
		keypressOffsetEvent: function(e) {
			//console.log(this);
			if( e.which == 13 || e.keyCode == 13 ) {
				//console.log(e);
				this.blurOffsetEvent(e)
				e.target.blur()
				e.preventDefault();
			}
		},
		blurOffsetEvent: function(e) {
			e.preventDefault();
			clearTimeout(this.zOffset);
			this.probeOffset = parseFloat(this.probeOffset).toFixed(2);
			//var prct = e.target.value;
			//var axis = e.target.attributes.axis.value;
			this.zOffset = setTimeout(this.sendToolOffset, 1000);
			e.preventDefault();
		},
		keypressProbeOffsetEvent: function(e) {
			//console.log(this);
			//if( e.which == 13 || e.keyCode == 13 ) {
			//console.log(e);
			this.blurProbeOffsetEvent(e)
			//e.target.blur()
			//e.preventDefault();
			//}
		},
		blurProbeOffsetEvent: function(e) {
			//e.preventDefault();
			clearTimeout(this.zOffset);
			e = parseFloat(e);
			this.probeOffset = parseFloat(e).toFixed(2);
			//var prct = e.target.value;
			//var axis = e.target.attributes.axis.value;
			this.zOffset = setTimeout(this.sendToolOffset, 1000);
			//e.preventDefault();
		},
		keypressBabystepOffsetEvent: function(e) {
			//console.log(this);
			//if( e.which == 13 || e.keyCode == 13 ) {
			//console.log(e);
			this.blurBabystepOffsetEvent(e)
			//e.target.blur()
			//e.preventDefault();
			//}
		},
		blurBabystepOffsetEvent: function(e) {
			//e.preventDefault();
			clearTimeout(this.zOffset);
			this.babystepZ = e;
			//var prct = e.target.value;
			//var axis = e.target.attributes.axis.value;
			this.zOffset = setTimeout(this.sendToolOffset, 1000);
			//e.preventDefault();
		},
		preloadToolMatrices: async function() {
			console.log('load the cfg file');
			try {
				// Load file list and create missing props
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
						that.preloadToolMatrix(item.directory + "/" + item.name)
					}
				});
			} catch(e) {
				console.error(e);
			}
		},
		preloadToolMatrix: async function(path){
			try {
				let files = await this.getFileList(path);
				let name = (this.name.lastIndexOf("~")>0?this.name.substr(this.name.lastIndexOf("~")+1, 2):"");
				//console.log(name)
				files = files.filter(file => file.name.startsWith("_Nozzle height calibration"))
				if (files.length > 1)
				files = files.filter(file => file.name.includes(name))
				//console.log(files);
				let that = this;
				files.forEach(function (file) {
					if(file != undefined && file.name.startsWith("_Nozzle height calibration")) {
						var toolName = path.substring(path.lastIndexOf("/")+1);
						//console.log("name: " + toolName)
						//console.log( that.toolPath[toolName]);
						//console.log("path+name: " + path+"/"+file.name);
						if(file.name.includes("HF")) {
							if(that.toolPath[toolName+"_HF"] === undefined)
							that.toolPath[toolName+"_HF"] = {};
							that.toolPath[toolName+"_HF"].calibration = toolName+"/"+file.name;
							that.loadToolOffset(toolName+"_HF");
						} else if(file.name.includes("MF")) {
							if(that.toolPath[toolName+"_MF"] === undefined)
							that.toolPath[toolName+"_MF"] = {};
							that.toolPath[toolName+"_MF"].calibration = toolName+"/"+file.name;
							that.loadToolOffset(toolName+"_MF");
						} else {
							if(that.toolPath[toolName] === undefined)
							that.toolPath[toolName] = {};
							that.toolPath[toolName].calibration = toolName+"/"+file.name;
							that.loadToolOffset(toolName);
						}
					}
				});
			} catch(e) {
				console.error(e);
			}
		},
		loadToolOffset: async function(toolName){
			const filename = "0:/macros/_Toolheads/" + this.toolPath[toolName].calibration;
			const result = await this.download({ filename, type: 'text', showSuccess: false });
			let data = result.split("\n");
			this.toolPath[toolName].fileContent = [];
			var indexB4 = 0;
			var lines = [];
			//var offsets = [];
			var toolNum;
			var tools = [];
			var tHeadPos = {x: undefined, y: undefined, z: undefined};
			this.toolPath[toolName].fileContent[0] = "";
			for( var i = 0; i < data.length; i++) {
				if ( data[i].startsWith("M585")) {
					lines.push(data[i]);
					if (this.toolPath[toolName].fileContent[indexB4] != "") {
						indexB4 ++ ;
						this.toolPath[toolName].fileContent[indexB4] = "";
					}
				} else if (data[i].startsWith("G1") || data[i].startsWith("G10")) {
					lines.push(data[i]);
					this.toolPath[toolName].fileContent[indexB4] += data[i] + "\n";
				} else if (i < data.length-1 || data[i] !== ""){
					this.toolPath[toolName].fileContent[indexB4] += data[i] + "\n";
				}
			}
			for (i = 0; i < lines.length; i++)
			{
				var line = lines[i].substring(0, lines[i].indexOf(";")).split(" ");
				for( var j = 0; j < line.length; j++)
				{
					if (line[0] === "G1"){
						switch (line[j][0]) {
							case "X":
							tHeadPos.x = parseFloat(line[j].substring(1));
							break;
							case "Y":
							tHeadPos.y = parseFloat(line[j].substring(1));
							break;
							case "Z":
							tHeadPos.z = parseFloat(line[j].substring(1));
							break;
							default:
							break;
						}
					} else if (line[0] === "G10"){
						if (line[j].includes("P")) { //Tool number
							toolNum = parseInt(line[j].substring(1));
							if (tools[toolNum] == undefined) {
								//console.log("tool " + parseInt(line[j].substring(1)) +" found");
								tools[toolNum] = {};
							}
						}else if(line[j].includes("U")) { // axis U-W
							//console.log("offset X of tool " + toolNum + " = "+ parseFloat(line[j].substring(1)));
							tools[toolNum].u = parseFloat(line[j].substring(1));
						} else if(line[j].includes("V")) {
							//console.log("offset Y of tool " + toolNum + " = "+ parseFloat(line[j].substring(1)));
							tools[toolNum].v = parseFloat(line[j].substring(1));
						} else if(line[j].includes("W")) {
							//console.log("offset Z of tool " + toolNum + " = "+ parseFloat(line[j].substring(1)));
							tools[toolNum].w = parseFloat(line[j].substring(1));
						} else if(line[j].includes("X")) { // axis X-Z
							//console.log("offset X of tool " + toolNum + " = "+ parseFloat(line[j].substring(1)));
							tools[toolNum].x = parseFloat(line[j].substring(1));
						} else if(line[j].includes("Y")) {
							//console.log("offset Y of tool " + toolNum + " = "+ parseFloat(line[j].substring(1)));
							tools[toolNum].y = parseFloat(line[j].substring(1));
						} else if(line[j].includes("Z")) {
							//console.log("offset Z of tool " + toolNum + " = "+ parseFloat(line[j].substring(1)));
							tools[toolNum].z = parseFloat(line[j].substring(1)).toFixed(2);
						} else if(line[j].includes("S")) {
							//console.log("default active temp of tool " + toolNum + " = " + parseFloat(line[j].substring(1)));
							tools[toolNum].s = parseFloat(line[j].substring(1));
						} else if(line[j].includes("R")) {
							//console.log("default stanby temp of tool " + toolNum + " = " + parseFloat(line[j].substring(1)));
							tools[toolNum].r = parseFloat(line[j].substring(1));
						}
					} else if (line[0] === "M585") {
						if (line[j].includes("Z")) {
							//console.log("T"+toolNum+": "+tHeadPos.toSource());
							//console.log("probe offset = " + (tHeadPos.z + parseFloat(line[j].substring(1))) + "mm");
							this.probeOffset = parseFloat((tHeadPos.z + parseFloat(line[j].substring(1)))).toFixed(2);
							this.actualValue = parseFloat(this.probeOffset).toFixed(2);
							this.babystepZ = 0;
							//console.log($(".span_probe_offset")[0])
							//$(".span_probe_offset")[0].value = that.probeOffset;
							//$(".btn_probe_offset").prop("disabled", false);
						}
					}
				}
			}
			//makeTools();
		},
		sendToolOffset: function() {
			var keys = Object.keys(this.toolPath);
			//console.log(keys);
			var key = 0;
			if (this.actualValue != this.probeOffset || this.babystepZ != 0) {
				let inter = setInterval(function(that) {
					var out = "";
					var toolName = keys[key];
					if (key >= keys.length-1)
					clearInterval(inter)
					else
					key++
					//console.log(toolName);
					var fileContent = that.toolPath[toolName].fileContent;
					for (var i = 0; i < fileContent.length; i++)
					{
						var from = Math.max(fileContent[i].lastIndexOf("\nG1 ")+1, 0);
						var g10 = fileContent[i].substring(from);
						var to = fileContent[i].substring(from).indexOf("\n");
						out += fileContent[i];
						if (from > 0 && to > 0) {
							//console.log(from + ", " + (from+to));
							//console.log(fileContent[i].substr(from, to+1));
							g10 =  fileContent[i].substr(from, to+1);
							var end = (	g10.substring(g10.indexOf("Z")).indexOf(" ") > 0 ?
							g10.substring(g10.indexOf("Z")).indexOf(" ") :
							g10.substring(g10.indexOf("Z")).indexOf("\t")) - 1;
							//console.log(end)
							//console.log(g10.substr(g10.indexOf("Z")+1, end))
							var myZ = parseFloat(g10.substr(g10.indexOf("Z")+1, end));
							//console.log(myZ);
							if(!isNaN(myZ)) {
								//console.log((probeOffset-myZ).toFixed(2));
								out += "M585 Z"+ ((parseFloat(that.probeOffset)-parseFloat(that.babystepZ))-parseFloat(myZ)).toFixed(2) +" E8 L1 F100 S1	; Move the tool down (Z-) until triggering the probing tool\n";
							}
						}
					}
					//out += (fileContent[fileContent.length-1] == undefined? "" : fileContent[fileContent.length-1] );
					//console.log(out);
					let filename = "0:/macros/_Toolheads/" + that.toolPath[toolName].calibration;
					let data =  out;
					//console.log(filename+ ":\n" +data);
					const content = new Blob([data]);
					try {
						that.upload({filename: filename, content});
						//console.log("file saved");
					} catch (e) {
						console.log("Error: no such file/not mounted");
						console.error(e);// TODO Optionally ask user to save file somewhere else
					}
				},250, this);
			}
		},
		increment() {
			if (this.disabled || this.incrementDisabled) {
				return
			}

			let newVal = this.currentValue + this.step
			this.decrementDisabled = false

			this._updateValue(newVal)
		},
		decrement() {
			if (this.disabled || this.decrementDisabled) {
				return
			}

			let newVal = this.currentValue - this.step
			this.incrementDisabled = false

			this._updateValue(newVal)
		},
		mouseDown(goUp){
			let that = this;
			clearTimeout(this.interval);
			this.interval = setTimeout(function(that, goUp) {
				that.interval = setInterval(goUp ? that.increment : that.decrement, 125)
			}, 250, that, goUp);
		},
		mouseUp(){
			if(this.interval) {// ? this.increment() : this.decrement()
				clearTimeout(this.interval);
				clearInterval(this.interval);
				this.interval = setTimeout(function(that) { that.$emit('change', that.currentValue); that.interval = 0}, 250, this);
			}
		},
		update(event) {
			if (this.disabled) {
				return
			}
			this.currentValue = -1;
			//console.log(event)
			if (event.target)
			this._updateValue(parseFloat(event.target.value))
			else
			this._updateValue(parseFloat(event));


			//console.log("update " +this.currentValue);
			if (this.currentValue <= this.min) {
				this.decrementDisabled = true;
			} else {
				this.decrementDisabled = false;
			}

			if (this.currentValue >= this.max) {
				this.incrementDisabled = true
			} else {
				this.incrementDisabled = false
			}
			this.$emit('change', this.currentValue);
		},
		_updateValue(newVal) {
			const oldVal = this.currentValue
			if (oldVal === newVal || typeof this.probeOffset !== 'number') {
				return
			}
			if (newVal <= this.min) {
				newVal = this.min
				this.decrementDisabled = true;
				this.mouseUp();
			}
			if (newVal >= this.max) {
				newVal = this.max;
				this.incrementDisabled = true;
				this.mouseUp();
			}
			this.currentValue = newVal;
		}
	},
	mounted() {
		setTimeout(this.preloadToolMatrices, 1000*Math.random());
		if (this.probeOffset == this.min) {
			this.decrementDisabled = true
		} else {
			this.decrementDisabled = true
		}
	},
	watch: {
		probeOffset(val) {
			//console.log(this.probeOffset, val)
			this.currentValue = val
			this.decrementDisabled = (val === this.min);
			this.incrementDisabled = (val === this.max);
		}
	},
}
</script>
