<template>
	<v-btn large v-bind="$props" :color="buttonColor" :depressed="isBusy" @click="clicked" tabindex="0">
		<v-icon v-show="!isBusy">{{ buttonIcon }}</v-icon>
		<v-progress-circular size="20" v-show="isBusy" indeterminate></v-progress-circular>
		<span class="ml-2" v-bind:style="isLocal?'font-size: larger;':''">{{ caption }}</span>
	</v-btn>
</template>
<script>
'use strict'

import VBtn from 'vuetify/es5/components/VBtn'

import { mapState, mapActions, mapMutations} from 'vuex'

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
		...mapState({
			isLocal: state => state.isLocal,
			getTool: state => {console.log(state.user.loadedTool); return state.user.loadedTool},
			name: state => state.machine.model.network.name,
		}),
		buttonColor() {
			return this.isBusy ? 'warning'
				: ((!this.load || this.getTool) ? 'success' : 'primary');
		},
		buttonIcon() {
			return this.isBusy ? 'warning' : (!this.load || this.getTool) ? 'close' : 'info';
		},
		caption() {
			return  this.isBusy ? (!this.load || this.getTool ?  "unloading tool" : "loading tool") : (this.getTool ? "Unload " + this.getTool : "load a tool");
		},
	},
	extends: VBtn,
	methods: {
		...mapActions('machine', ['sendCode']),
		async clicked() {
			if (this.isBusy) {
				// Cannot disable this button because that messes up the color
				return;
			}
			this.isBusy = true;
			if (!this.load || this.getTool) {
				console.log("unload tool dialog to be shown")
				let path = this.path
				if (this.path == "") {
					//console.warn("this.path is undefined");
					path = "0:/macros/_Tools/" + this.getTool
					if (path.endsWith("_HF") || path.endsWith("_MF"))
						path = path.substring(0, path.length-3);
					console.log("http://192.168.1.243/rr_filelist?dir=" + path)
				}
				let code = 'M98 P"' + path + '/_Unload_tool.g"';
				console.log(code);
				await this.sendCode(code);
				this.$store.commit('setTool', '');
				this.$emit('tool_loaded', "")
			} else {
				this.$emit('click', this);
			}
			this.isBusy = false;
		}
	}
}
</script>
