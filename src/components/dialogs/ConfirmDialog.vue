<style>
/* The flip box container - set the width and height to whatever you want. We have added the border property to demonstrate that the flip itself goes out of the box on hover (remove perspective if you don't want the 3D effect */
.flip-box {
	display: block;
	background-color: transparent;
	width: 256px;
	height: 360px;
	perspective: 1000px; /* Remove this if you don't want the 3D effect */
	margin: 5px auto;
}

/* This container is needed to position the front and back side */
.flip-box-inner {
	position: relative;
	width: 100%;
	height: 100%;
	text-align: center;
	/*transition: transform 0.5s;*/
	transform-style: preserve-3d;
}

/* Do an horizontal flip when you move the mouse over the flip box container */
/*.flip-box:hover .flip-box-inner {
transform: rotateY(180deg);
}
.flip-box:hover video {
autoplay: true;
}*/

/* Position the front and back side */
.flip-box-front, .flip-box-left, .flip-box-back {
	position: absolute;
	width: 100%;
	height: 100%;
	backface-visibility: hidden;
	background-color: #403E3D;
	/*border-radius: 20px;*/
	overflow: hidden;
}

/* Style the front side (fallback if image is missing) */
.flip-box-front {
}

/* Style the back side */
.flip-box-back {
	transform: rotateY(180deg);
}

.confirm-dialog-item {
	min-width: 480px;
	width: max-content;
	margin: 0 auto;
	max-width: 100%
}

.confirm-dialog {
	width: 480px;
	margin: 0 auto;
}

.v-card__text {
	padding-top: 5px;
	padding-bottom: 5px;
}

</style>
<template>
	<v-dialog v-model="shown" persistent width="480">
		<!-- :class="item?'confirm-dialog-item':'confirm-dialog'" -->
		<v-card  style="background-color: #403E3D">
			<v-card-title>
				<div class="headline" style="width: 100%;">
					<div style="text-overflow: ellipsis;overflow: hidden;max-width: 440px;width: max-content;margin: 0 auto;">
						{{ item ? item.name.substring(0, item.name.lastIndexOf('.')) : question }}
					</div>
				</div>
			</v-card-title>

			<v-card-text v-if="!item">
				<p v-html="prompt"></p>
			</v-card-text>
			<template v-else>
				<div class="flip-box" v-if="item.ico">
					<div class="flip-box-inner">
						<div class="flip-box-front">
							<img id="buildPlate" src="" style="width: 80%; margin-left: 0%;" alt="" />
							<v-btn color="blue darken-1" onclick="
							document.getElementsByTagName('video')[0].load();
							document.getElementsByClassName('flip-box-inner')[0].style.transform = 'rotateY(180deg)';" @click="attachListener" style=" margin-top: 44px">{{ $t('generic.showPreview') }}</v-btn>
						</div>
						<div class="flip-box-back">
							<video :poster="item.ico" style="width: 100%;" @timeupdate="videoUpdate" @ended="videoEnded" @progress="videoBuffer" preload>
								<source :src="item.ico.substring(0,item.ico.length-8)+'.mp4'" type="video/mp4">
									<img src="/img/ressources/file.png" type="image/png"/>
								</video>
								<div id="video-controls" style="/*display: none*/">
									<v-btn icon id="play-pause" @click="playPause" style="margin: 0 5px 5px 0;"><v-icon>{{ playIcon }}</v-icon></v-btn>
									<v-slider min="0" max="100" v-model="buffer" :buffer-value="bufferValue" id="seek-bar" style="width: 160px; display: inline-flex;margin-top:0px" @change="seekChange(buffer)" @mousedown="seekMouseDown" @mouseup="seekMouseUp"></v-slider>
									<!--button type="button" id="mute"><span class="material-icons">volume_up</span>/<span class="material-icons">volume_off</span></button>
									<input type="range" id="volume-bar" min="0" max="1" step="0.1" value="1"-->
									<!--v-btn icon id="full-screen" style="margin:  0  0 5px 5px;"><span class="material-icons">fullscreen</span></v-btn-->
								</div>
								<v-btn color="blue darken-1" onclick="document.getElementsByTagName('video')[0].pause();
								document.getElementsByClassName('flip-box-inner')[0].style.transform = 'rotateY(0deg)';" id="back" class="sm6" style="margin-top:-5px">
								{{ $t('generic.showBuildplate') }}
							</v-btn>
						</div>
					</div>
				</div>
				<v-card-text> <!-- Print data -->
					{{$t('list.jobs.generatedBy')}} : {{ item.generatedBy }} <br>
					{{$t('list.jobs.layerHeight')}}: {{ item.layerHeight }} mm <br>
					{{$t('list.jobs.height')}}: {{ item.height }} mm <br>
					<template v-if="item.simulatedTime != null && item.simulatedTime > 0">
						{{$t('list.jobs.simulatedTime')}}: {{ $displayTime(item.simulatedTime) }}<br>
					</template>
					{{$t('list.jobs.printTime')}}: {{ $displayTime(item.printTime) }}<br>
					{{$t('list.jobs.filament')}}: {{ item.filament.length == 1 ? item.filament[0]+" mm" : "table" }} <br>
				</v-card-text>
				<v-card-text> <!-- File data -->
					<div style="text-overflow: ellipsis;overflow: hidden; width: 440px;">
						{{$t('list.baseFileList.fileName')}}: {{ item.name }}
					</div>
					{{$t('list.baseFileList.size')}}: {{ $displaySize(item.size) }}<br>
					{{$t('list.baseFileList.lastModified')}}: {{ item.lastModified.toLocaleString() }} <br>
				</v-card-text>
			</template>

			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn v-bind:color="(item?'red':'primary') +' darken-1'" flat @click="dismissed">{{ item?$t('generic.cancel'):$t('generic.no') }}</v-btn>
				<v-btn :class="item?'success':'v-btn--flat primary--text text--darken-1'" @click="confirmed">{{ item?$t('generic.print'):$t('generic.yes') }}</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
'use strict'

export default {
	data(){
		return {
			buffer: 0,
			bufferValue: 0,
			playIcon: 'play_arrow',
			playing: false,
		}
	},
	props: {
		question: {
			type: String,
			required: true
		},
		prompt: {
			type: String,
			required: true
		},
		shown: {
			type: Boolean,
			required: true
		},
		item: {
			type: Object,
			required: false
		}
	},
	methods: {
		breakAnywere() {
			let question = this.question.substr(this.question.indexOf(' '))
			if ( question.indexOf(' ') > 18 ) {
				return true;
			}
			if ( question.indexOf(' ') != -1 ) {
				let words = question.split(' ')
				return !words.every(word => word.length < 28)
			}
			if (question.length > 18) {
				return true
			}
			return false
		},
		confirmed() {
			this.$emit('confirmed');
			this.$emit('update:shown', false);
		},
		dismissed() {
			this.$emit('dismissed');
			this.$emit('update:shown', false);
		},
		hoverVideo() {
			document.getElementsByTagName("video")[0].play()
			//$('video', this).get(0).play();
		},
		hideVideo() {
			document.getElementsByTagName("video")[0].pause()
			//$('video', this).get(0).pause();
		},
		back() {
			if (document.getElementsByClassName('flip-box-inner')[0].style.transform == "")
			document.getElementsByClassName('flip-box-inner')[0].style.transform = 'rotateY(90deg)';
			else {
				document.getElementsByTagName('video')[0].load();
				document.getElementsByTagName('video')[0].play();
			}
			//document.getElementsByClassName('flip-box-inner')[0].style.transform = '';

			//document.getElementsByClassName('flip-box')[0].onclick = this.front;
		},
		front() {
			document.getElementsByClassName('flip-box-inner')[0].style.transform = '';
			document.getElementsByClassName('flip-box')[0].onclick = this.back;
		},
		attachListener(){

		},
		playPause() {
			if (!document.getElementsByTagName('video')[0].paused) {
				console.log("Pause");
				Array.from(document.getElementsByTagName('video')).filter(item => item.poster !== "").forEach(video => video.pause())
				this.playIcon = 'play_arrow';
				this.playing = false;
			} else {
				console.log("Play");
				Array.from(document.getElementsByTagName('video')).filter(item => item.poster !== "").forEach(video => video.play())
				this.playIcon = 'pause';
				this.playing = true;
			}
		},

		seekChange(e) {
			var video = document.getElementsByTagName('video')[0];
			// Calculate the new time
			var time = video.duration * (e / 100);
			// Update the video time
			video.currentTime = time;
		},
		seekMouseDown(){
			var video = document.getElementsByTagName('video')[0];
			video.pause();
		},
		seekMouseUp() {
			var video = document.getElementsByTagName('video')[0];
			//console.log(this.playing);
			if(this.playing) {
				video.play();
			}
		},

		videoBuffer() {
			var video = document.getElementsByTagName('video')[0];
			var duration = video.duration;
			if (duration > 0) {
				for (var i = 0; i < video.buffered.length; i++) {
					if (video.buffered.start(video.buffered.length - 1 - i) <= video.currentTime) {
						this.bufferValue = (video.buffered.end(video.buffered.length - 1 - i) / duration) * 100;
						break;
					}
				}
			}
		},
		videoUpdate() {
			var video = document.getElementsByTagName('video')[0];
			// Calculate the slider value
			var value = (100 / video.duration) * video.currentTime;

			// Update the slider value
			this.buffer = value;
		},
		videoEnded(){
			this.playIcon = 'play_arrow';
			this.playing = false;
			if(Document.fullscreenElement) {
				console.log('Document')
				Document.exitFullscreen();
			} else if(document.fullscreenElement){
				console.log('document')
				document.exitFullscreen();
			}
		}
	},
	mounted() {

	},
	watch: {
		shown() {
			if(this.shown && this.item) {
				if (document.getElementsByTagName('video').length)
				document.getElementsByTagName('video')[0].pause();
				if (document.getElementsByClassName('flip-box-inner').length)
				document.getElementsByClassName('flip-box-inner')[0].style.transform = 'rotateY(0deg)';

				var xhr =  new XMLHttpRequest();
				xhr.timeout = 2000;

				console.log(this.shown ? "shown" : "hidden")
				console.log(this.item)
				let item = this.item
				xhr.onload = function() {
					if(xhr.status == 404)
					document.getElementById("buildPlate").src = "/img/ressources/file.png"
					else
					document.getElementById("buildPlate").src = item.ico.substring(0, item.ico.length-7)+'bp.jpg'
				}

				xhr.ontimeout = function() {
					console.log("timed out")
				}

				xhr.onerror = function() {
					console.log("error")
					document.getElementById("buildPlate").src = "/img/ressources/file.png"
				}

				xhr.open('GET', item.ico.substring(0, item.ico.length-7)+'bp.jpg' , true);
				xhr.send(null);
			}
		}
	}
}
</script>
