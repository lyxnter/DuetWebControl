<style>
	.mcode {
		color: palegreen;
	}

	.gcode {
		color: cyan;
	}

	.mcode-param-name, .gcode-param-name {
		color: red;
	}

	.mcode-param-value, .gcode-param-value {
		color: pink;
	}

	.comment {
		color: lightgray;
	}
</style>
<style>
	.edit-textarea {
		align-items: stretch !important;
	}
	.edit-textarea > div > div {
		align-items: stretch;
		flex-grow: 1;
	}
	.edit-textarea > div > div > div {
		align-items: stretch !important;
	}
	.edit-textarea textarea {
		display: flex;
		flex-grow: 1;
		font-family: monospace;
		margin-top: 0 !important;
		resize: none;
	}
</style>

<style scoped>
	.card {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100% !important;
	}

	.content {
		display: flex;
		flex-grow: 1;
	}
</style>

<template>
	<v-dialog v-model="shown" fullscreen hide-overlay transition="dialog-bottom-transition">
		<v-card tile class="card" id="fileEditDialog">
			<v-toolbar card dark color="primary">
				<v-btn icon dark @click="close">
					<v-icon>close</v-icon>
				</v-btn>
				<v-toolbar-title>{{ filename }}</v-toolbar-title>

				<v-spacer></v-spacer>

				<v-toolbar-items>
					<v-btn v-if="showGCodeHelp" dark flat href="https://duet3d.dozuki.com/Wiki/Gcode" target="_blank">
						<v-icon class="mr-1">help</v-icon> {{ $t('dialog.fileEdit.gcodeReference') }}
					</v-btn>
					<v-btn v-if="showDisplayHelp" dark flat href="https://duet3d.dozuki.com/Wiki/Duet_2_Maestro_12864_display_menu_system" target="_blank">
						<v-icon class="mr-1">help</v-icon> {{ $t('dialog.fileEdit.menuReference') }}
					</v-btn>
					<v-btn dark flat @click="save">
						<v-icon class="mr-1">save</v-icon> {{ $t('dialog.fileEdit.save') }}
					</v-btn>
				</v-toolbar-items>
			</v-toolbar>

			<v-textarea ref="textarea" :value="innerValue" @blur="innerValue = $event.target.value" @keydown.tab.exact.prevent="onTextareaTab" @keydown.esc="close" :rows="null" hide-details solo class="edit-textarea" browser-autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></v-textarea>
			<!--div ref="textarea" v-html="innerValue"  @keydown.tab.exact.prevent="onTextareaTab" @keydown.esc="close" :rows="null" hide-details solo class="edit-textarea" browser-autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" contenteditable="true" style="overflow-y: scroll; padding-left: 10px; padding-top: 5px; padding-right: 10px;"></div-->
		</v-card>
	</v-dialog>
</template>

<script>
'use strict'

import { mapActions } from 'vuex'

import Path from '../../utils/path.js'

export default {
	props: {
		shown: {
			type: Boolean,
			required: true
		},
		filename: {
			type: String,
			required: true
		},
		value: String
	},
	computed: {
		showGCodeHelp() {
			if (this.filename.startsWith(Path.macros)) {
				return true;
			}
			const matches = /\.(.*)$/.exec(this.filename.toLowerCase());
			return matches && ['.g', '.gcode', '.gc', '.gco', '.nc', '.ngc', '.tap'].indexOf(matches[1]);
		},
		showDisplayHelp() {
			return this.filename.startsWith(Path.display);
		}
	},
	data() {
		return {
			innerValue: ''
		}
	},
	methods: {
		...mapActions('machine', ['upload']),
		close() {
			this.$emit('input', '');
			this.$emit('update:shown', false);
		},
		async save() {
			const content = new Blob([this.innerValue]);
			this.close();

			try {
				await this.upload({ filename: this.filename, content });
				this.$emit('editComplete', this.filename);
			} catch (e) {
				// TODO Optionally ask user to save file somewhere else
			}
		},
		onBeforeLeave(e) {
			// Cancel the event
			e.preventDefault();
			// Chrome requires returnValue to be set
			e.returnValue = '';
		},
		onTextareaTab(e) {
			const originalSelectionStart = e.target.selectionStart;
			const textStart = e.target.value.slice(0, originalSelectionStart);
			const textEnd = e.target.value.slice(originalSelectionStart);
			e.target.value = `${textStart}\t${textEnd}`;
			e.target.selectionEnd = e.target.selectionStart = originalSelectionStart + 1;
		}
	},
	/*mounted() {
		function htmlEncode(html){
			var text = document.createTextNode(html);
			var p = document.createElement('p');
			p.appendChild(text);
			return p.innerHTML;
		}
		function htmlDecode(input){
			var e = document.createElement('textarea');
			e.innerHTML = input;
			// handle case of empty input
			return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
		}
		let value = '; Full machine test\n\n; Fan test\nG4 S1\nM291 R"Test fans" P"Running fans test" S2\nG4 S1\nM106 P0 I1 S0 H-1\n;M106 P1 I1 S0 H-1\nM106 P2 I1 S0 H-1\nM106 P3 I1 S0 H-1\nM106 P4 I1 S0 H-1\nM106 P5 I1 S0 H-1\nM106 P6 I1 S0 H-1\n\n; Tool fans\nM106 P0 I1 S1 H-1\nG4 S1\nM291 R"Test fans" P"Tool fan on" S2\nG4 S1\nM106 P0 S0\n; Heated chamber fan\n;M106 P1 I1 S1 H-1\n;G4 S1\n;M291 R"Test fans" P"Heated chamber fan on" S2\n;G4 S1\n;M106 P1 S0\n; Filtration fan\nM106 P2 I1 S1 H-1\nG4 S1\nM291 R"Test fans" P"Filtration fan on" S2\nG4 S1\nM106 P2 S0\n; Water cooling pump \nM106 P3 I1 S1 H-1 C"WC pump"\nG4 S1\nM291 R"Test fans" P"Water pump on" S2\nG4 S1\nM106 P3 S0\n; Water cooling and rack fan\nM106 P4 I1 S1 H-1 C"WC Fan"\nG4 S1\nM291 R"Test fans" P"WC fan on" S2\nG4 S1\nM106 P4 S0\n; Door cooling fan\nM106 P5 I1 S1 H-1 C"Door Fan"\nG4 S1\nM291 R"Test fans" P"Door fan on" S2\nG4 S1\nM106 P5 S0\n; Bowden cooling fan \nM106 P6 I1 S1 H-1 C"Bowden fan"\nG4 S1\nM291 R"Test fans" P"Bowden fan on" S2\nG4 S1\nM106 P6 S0\n\n; Motors test\nG4 S1\nM291 R"Test Axes" P"Check that the axes are in the center of the machine" S3\nG4 S1\nM669 K0\nG92 X0\nG4 S1\nM291 R"Test Axes" P"X axis should go up" S2\nG4 S1\nG1 X100 F3000\nG4 S1\nM291 R"Test Axes" P"X axis should go down" S2\nG4 S1\nG1 X0 F3000\nG92 Y0\nG4 S1\nM291 R"Test Axes" P"Y axis should go up" S2\nG4 S1\nG1 Y100 F3000\nG4 S1\nM291 R"Test Axes" P"Y axis should go down" S2\nG4 S1\nG1 Y0 F3000\nG92 Z0\nG4 S1\nM291 R"Test Axes" P"Z axis should go up" S2\nG4 S1\nG1 Z100 F3000\nG4 S1\nM291 R"Test Axes" P"Z axis should go down" S2\nG4 S1\nG1 Z0 F3000\nM669 K3\n\n; Heater test\nG4 S1\nM291 R"Test Heaters" P"Running heaters test" S2\nG4 S1\nM141 P0 S50\nM140 P0 S100\nG10 P0 S200\nG10 P1 S200\nG10 P2 S200\nT0\nM116 H1:2:3\nG4 S1\nM291 R"Test Heaters" P"T0 heater working" S2\nG4 S1\nT1\nM116 H1:2:3S2\nG4 S1\nM291 R"Test Heaters" P"T1 heater working" S2\nG4 S1\nT2\nM116 H1:2:3\nG4 S1\nM291 R"Test Heaters" P"T2 heater working" S2\nG4 S1\nT-1\nM291 R"Test Heaters" P"Tools heaters working" S2\nG4 S1\nM116 H0\nG4 S1\nM291 R"Test Heaters" P"Bed heater working" S2\nG4 S1\nM116 H4\nG4 S1\nM291 R"Test Heaters" P"Chamber heater working" S2\nG4 S1\nG10 P0 R-273.15 S-273.15\nG10 P1 R-273.15 S-273.15\nG10 P2 R-273.15 S-273.15\nM140 P0 S-273.15\nM141 P0 S-273.15'
		let lines = htmlEncode(value).split("\n");
		for (var i = 0; i < lines.length; i++)
		{
			let line = lines[i];
			if (line.startsWith("M") || line.startsWith("m")) {
				let params = line.substr(line.indexOf(" ")+1).split(" ")
				line = "<span class='mcode'>" + line.substr(0, line.indexOf(" ")) + "</span> "
				console.log(params);
				for (let j = 0; j < params.length; j++) {
					let param = params[j]
					if (param.substr(0,1) == param.substr(0,1).toUpperCase())
					{
						line += "<span class='mcode-param-name'>" + param.substr(0, 1) + "</span><span class='mcode-param-value'>"
						if (param.substr(1).startsWith('"')) {
							params[j] = param.substr(1);
							do {
								line += params[j++] + " ";
							} while (!params[j-1].endsWith('"'));
						}
						line += "</span> ";
					} else {
						line += param + " ";
					}
				}
				lines[i] = line;
			} else if (line.startsWith("G") || line.startsWith("g")) {
					let params = line.substr(line.indexOf(" ")+1).split(" ")
					line = "<span class='gcode'>" + line.substr(0, line.indexOf(" ")) + "</span> "
					console.log(params);
					for (let j = 0; j < params.length; j++) {
						let param = params[j]
						if (param.substr(0,1) == param.substr(0,1).toUpperCase())
						{
							line += "<span class='gcode-param-name'>" + param.substr(0, 1) + "</span><span class='gcode-param-value'>" + param.substr(1) + "</span> ";
						} else {
							line += param + " ";
						}
					}
					lines[i] = line;
			}
			if (line.includes(";")) {
				line = line.substr(0, line.indexOf(";")) + "<span class='comment'>" + line.substr(line.indexOf(";")) + "</span>"
				lines[i] = line;
			}
		}
		console.log(lines.join("<br>\n"))
	},*/
	watch: {
		shown(to) {
			// Set textarea content
			this.innerValue = this.value;

			// Notify users that they may not have saved their changes yet
			if (to) {
				window.addEventListener('beforeunload', this.onBeforeLeave);
			} else {
				window.removeEventListener('beforeunload', this.onBeforeLeave);
			}

			// Auto-focus textarea
			const textarea = this.$refs.textarea;
			setTimeout(function() { textarea.focus(); }, 100);
		}
	}
}
</script>
