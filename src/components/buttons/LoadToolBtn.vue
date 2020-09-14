<template>
	<v-btn large v-bind="$props" :color="buttonColor" :depressed="isBusy" @click="clicked" tabindex="0" :disabled="(['pausing', 'paused', 'resuming', 'processing', 'simulating', 'busy', 'changingTool'].indexOf(state.status) !== -1)">
		<v-icon v-show="!isBusy">{{ buttonIcon }}</v-icon>
		<v-progress-circular size="20" v-show="isBusy" indeterminate></v-progress-circular>
		<span class="ml-2" v-bind:style="isLocal?'font-size: larger;':''">{{ getTool.toUpperCase().includes("DEBUG") ? $t('generic.debug') : $t('generic.unload', [getTool]) }}</span>
	</v-btn>
</template>
<script>
'use strict'

import VBtn from 'vuetify/es5/components/VBtn'

import { mapState, mapActions} from 'vuex'
import Path from '../../utils/path.js'

export default {
	props: {
		load: {
			type: Boolean,
			required: true
		},
		path: {
			type: String,
			required: false
		},
	},
	data() {
		return {
			isBusy: false,
		}
	},
	computed: {
		...mapState(['machine','selectedMachine']),
		...mapState('machine/model', [ 'state']),
		...mapState({
			isLocal: state => state.isLocal,
			getTool: state => {/*console.log(state.user.loadedTool);*/ return state.user.loadedTool},
			name: state => state.machine.model.network.name,
		}),
		buttonColor() {
			return this.isBusy ? 'warning'
			: ((!this.load || this.getTool) ? 'success' : 'primary');
		},
		buttonIcon() {
			return this.isBusy ? 'warning' : (!this.load || this.getTool) ? 'close' : 'info';
		},
	},
	extends: VBtn,
	methods: {
		...mapActions('machine', ['sendCode', 'getFileList']),
		async clicked() {
			if (this.isBusy) {
				// Cannot disable this button because that messes up the color
				return;
			}
			this.isBusy = true;
			if (!this.load || this.getTool) {
				//console.log("unload tool dialog to be shown")
				let path = this.path
				let code = "";
				if (this.getTool.toUpperCase().includes("DEBUG")) {
					code = "M550 PLynxter - S600D";
				} else {
					if (this.path == "") {
						//console.warn("this.path is undefined");
						if(this.getTool.toUpperCase().startsWith("CAL"))
						{
							let response = await this.getFileList(Path.macros+"/_Toolheads");
							let tools = response.filter(item => item.name.startsWith("CAL")).map(item => item.name);
							//console.log("http://duetapi/rr_filelist?dir="+Path.macros+"/_Toolheads/"+tools[0])
							//console.log(tools);
							path = Path.macros + "/_Toolheads/" + tools[0]
						} else {
							path = Path.macros + "/_Toolheads/" + this.getTool
						}
					}
					path = (path.includes("~")?path.substring(0, path.indexOf("~")) + path.substring(path.lastIndexOf("_")) : path);
					code = 'M98 P"' + path + '/_Unload_tool.g"';
				}
				//console.log(code);
				let timeout = setTimeout(function(that){that.isBusy = false;}, 5000, this);
				await this.sendCode(code);
				clearTimeout(timeout)
				//this.$store.commit('setTool', '');
				//this.$emit('tool_loaded', "")
			} else {
				this.$emit('click', this);
			}
			this.isBusy = false;
		}
	}
}
</script>
