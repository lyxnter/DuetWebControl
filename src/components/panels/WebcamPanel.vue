<style scoped>
iframe {
	width: 100%;
	height: 100%;
	border: 0px;
	overflow: hidden;
}

img {
	max-width: 100%;
	max-height: 100%;
}

.img-container {
	overflow: hidden;
}

.flip-x {
	-moz-transform: scaleX(-1);
	-o-transform: scaleX(-1);
	-webkit-transform: scaleX(-1);
	transform: scaleX(-1);
	filter: FlipH;
	-ms-filter: "FlipH";
}

.flip-y {
	-moz-transform: scaleY(-1);
	-o-transform: scaleY(-1);
	-webkit-transform: scaleY(-1);
	transform: scaleY(-1);
	filter: FlipV;
	-ms-filter: "FlipV";
}

.rotate-90 {
	transform: rotate(90deg);
	-ms-transform: rotate(90deg);
	-moz-transform: rotate(90deg);
	-webkit-transform: rotate(90deg);
	-o-transform: rotate(90deg);
}

.rotate-180 {
	transform: rotate(180deg);
	-ms-transform: rotate(180deg);
	-moz-transform: rotate(180deg);
	-webkit-transform: rotate(180deg);
	-o-transform: rotate(180deg);
}

.rotate-270 {
	transform: rotate(270deg);
	-ms-transform: rotate(270deg);
	-moz-transform: rotate(270deg);
	-webkit-transform: rotate(270deg);
	-o-transform: rotate(270deg);
}

.loader {
	border: 10px solid #fff; /* white */
	border-top-color: #0000; /* transparent */
	border-radius: 50%;
	width: 90px;
	height: 90px;
	animation: spin-lynx 2s ease-in-out infinite;
	margin: auto;
}

@keyframes spin-lynx {
	0% { transform: rotate(0deg);
		border-top-color: #fcb603;
		border-bottom-color: #fcb603;
		border-left-color: #2d4ea200;
		border-right-color: #2d4ea200;
	}
	50% { transform: rotate(90deg);
		border-top-color: #2d4ea200;
		border-bottom-color: #2d4ea200;
		border-left-color: #fcb603;
		border-right-color: #fcb603;
	}
	100% { transform: rotate(180deg);
		border-top-color: #fcb603;
		border-bottom-color: #fcb603;
		border-left-color: #2d4ea200;
		border-right-color: #2d4ea200;
	}
}
</style>

<template>
	<v-card>
		<v-card-title>
			{{ $t('panel.webcam.caption') }}
		</v-card-title>

		<v-card-text class="pt-0 img-container">
			<v-responsive v-if="webcam.embedded" :aspect-ratio="16/9">
				<iframe :src="webcam.url" id="webcam"></iframe>
			</v-responsive>
			<div v-else style="min-height: 480px; margin: 0 auto; width: max-content">
				<div v-if="!loaded && !waited" class="loader" style="margin-top: 25px"></div>
				<!--img v-if="loaded" src="/img/ressources/noSignal.gif" style="position: absolute;"-->
				<img v-else :alt="$t('panel.webcam.alt')" :src="url" :class="imgClasses" id="webcam" style="position: relative; min-width: 480px; background-image: url('/img/ressources/noSignal.gif'); display: inline-block; min-height: 360px; background-position: center; margin: 0 auto; max-width: 96%">
			</div>
		</v-card-text>
	</v-card>
</template>

<script>
'use strict'

import { mapState } from 'vuex'
import axios from 'axios'

export default {
	computed: {
		...mapState(['settings', 'selectedMachine', 'isLocal']),
		...mapState('settings', ['webcam']),
		imgClasses() {
			const classes = [];

			if (this.webcam.flip === 'x' || this.webcam.flip === 'both') {
				classes.push('flip-x');
			}
			if (this.webcam.flip === 'y' || this.webcam.flip === 'both') {
				classes.push('flip-y');
			}

			if (this.webcam.rotation === 90) {
				classes.push('rotate-90');
			} else if (this.webcam.rotation === 180) {
				classes.push('rotate-180');
			} else if (this.webcam.rotation === 270) {
				classes.push('rotate-270');
			}

			return classes;
		}
	},
	data() {
		return {
			updateTimer: null,
			url: '',
			maWebcam: {
				devs: {},
				active: -1,
			},
			waited: false,
			loaded: false,
			inter: undefined,
		}
	},
	methods: {
		updateWebcam() {
			let url = this.webcam.url;
			if (this.webcam.useFix) {
				url += "_" + Math.random();
			} else {
				if (url.indexOf("?") === -1) {
					url += "?dummy=" + Math.random();
				} else {
					url += "&dummy=" + Math.random();
				}
			}
			this.url = url;
		},
		getWebcamParams: async function() {
			//let protocol = location.protocol;
			if (!this.axios) {
				//let protocol = location.protocol;
				this.axios = await axios.create({
					baseURL:`https://`+this.selectedMachine+`/`,
					//cancelToken: BaseConnector.getCancelSource().token,
					timeout: 8000,	// default session timeout in RepRapFirmware
					withCredentials: true,
				});
			}

			let result = await this.axios.get('/api/duet/action/pc_webcam', {
				withCredentials: true,
				params: {
					info: "",
				}
			});
			result = result.data
			console.log(result);
			let controls = result.controls.filter(item => item.name.includes("Exposure") || item.name.includes("Focus"))
			//let format = result.formats.filter(item => item.current == "true")[0];

			let exposures = controls.filter(item => item.name.includes("Exposure"))
			this.exposure = exposures.filter(item => item.name.toLowerCase().includes("absolute"))[0]
			this.exposure.value = (this.exposure.max-this.exposure.min)-this.exposure.value
			this.exposure.auto = exposures.filter(item => !item.name.toLowerCase().includes("absolute"))
			console.log(this.exposure);

			let focuses = controls.filter(item => item.name.includes("Focus"))
			let tmpFocus = focuses.filter(item => item.name.toLowerCase().includes("absolute"))[0]
			this.focus = (tmpFocus != undefined ? tmpFocus : this.focus)
			this.focus.value = (this.focus.max-this.focus.min)-this.focus.value
			this.focus.auto = focuses.filter(item => !item.name.toLowerCase().includes("absolute"))
		},

	},
	mounted: async function() {
		if (!this.webcam.embedded) {
			this.updateWebcam();
			if (this.webcam.updateInterval) {
				this.updateTimer = setInterval(this.updateWebcam, this.webcam.updateInterval);
			}
		}

		var img =  new XMLHttpRequest();
		img.timeout = 2000;

		let that = this;
		this.waited = false;

		img.onload = async function() {
			that.loaded = true;
		}

		img.ontimeout = async function() {
			console.log(that.width + 'x' + that.height);
			that.loaded = false;
			//that.waited = true;
		}

		that.inter = setInterval(async function(that) {
			img.open('GET', 'https://'+that.selectedMachine+':8080/?action=snapshot&dummy='+Math.random(), true);
			img.send(null);
			if (that.maWebcam.active < 0 || !that.loaded) {
				if (!that.axios) {
					//let protocol = location.protocol;
					that.axios = await axios.create({
						baseURL:`https://`+that.selectedMachine+`/`,
						//cancelToken: BaseConnector.getCancelSource().token,
						timeout: 8000,	// default session timeout in RepRapFirmware
						withCredentials: true,
					});
				}

				let rep = await that.axios.get('/api/duet/action/pc_webcam', {
					withCredentials: true,
					//params: {fra: 5, res: that.resolutions16_9['480p']}
				});
				console.log(rep.data)
				that.maWebcam.devs = rep.data.dev.filter((item, index)=> index%2 == 0);
				that.maWebcam.active = 0;
			} else if (this.loaded) {
				that.maWebcam.active++
			}
		}, 5000, this)

		img.open('GET', 'https://'+that.selectedMachine+':8080/?action=snapshot&dummy='+Math.random(), true);
		img.send(null);
	},
	beforeDestroy() {
		if (this.updateTimer) {
			clearInterval(this.updateTimer);
		}
		clearInterval(this.inter);
	},
	watch: {
		maWebcam: {
			deep: true,
			handler: async function() {
				//console.log(pre, post)
				if (this.maWebcam.devs[this.maWebcam.active]){
					if (!this.axios){
						this.axios = await axios.create({
							baseURL:`https://`+this.selectedMachine+`/`,
							//cancelToken: BaseConnector.getCancelSource().token,
							timeout: 8000,	// default session timeout in RepRapFirmware
							withCredentials: true,
						});
					}
					this.axios.get('/api/duet/action/pc_webcam', {
						withCredentials: true,
						params: {
							dev: this.maWebcam.devs[this.maWebcam.active],
							fra: this.webcam.framerate,
							res: this.webcam.resolution
						}
					});

					setTimeout(that => { that.getWebcamParams() }, 3000, this)

				}
			}
		},
	}
}
</script>
