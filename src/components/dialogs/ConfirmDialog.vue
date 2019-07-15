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
		transition: transform 0.5s;
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
		background-color: #2e3338;
	}

	/* Style the front side (fallback if image is missing) */
	.flip-box-front {
	}
	/* Style the back side */
	.flip-box-left {
		transform: rotateY(-90deg);
	}
	/* Style the back side */
	.flip-box-back {
		transform: rotateY(180deg);
	}
</style>
<template>
	<v-dialog v-model="shown" persistent width="480">
		<v-card>
			<v-card-title>
				<span class="headline">{{ question }}</span>
			</v-card-title>

			<v-card-text v-if="!item">
				{{ prompt }}
				<video style="display:none"></video>
			</v-card-text>
			<template v-else>
				<div class="flip-box" v-if="item.ico">
					<div class="flip-box-inner">
						<div class="flip-box-front">
							<v-btn color="blue darken-1" onclick="
								document.getElementsByTagName('video')[0].load();
								document.getElementsByClassName('flip-box-inner')[0].style.transform = 'rotateY(180deg)';" @click="attachListener">Show preview</v-btn>
							<img :src="item.ico.substring(0,item.ico.length-7)+'bp.jpg'" style="width: 100%;">
						</div>
						<div class="flip-box-back">
							<v-btn color="blue darken-1" onclick="document.getElementsByTagName('video')[0].pause();
								document.getElementsByClassName('flip-box-inner')[0].style.transform = 'rotateY(0deg)';" id="back" class="sm6">
									Show buildplate
							</v-btn>
							<video :poster="item.ico" style="width: 100%;" @timeupdate="videoUpdate" @ended="videoEnded" @progress="videoBuffer" preload>
								<source :src="item.ico.substring(0,item.ico.length-8)+'.mp4'" type="video/mp4">
							</video>
							<div id="video-controls">
								<v-btn icon id="play-pause" @click="playPause" style="margin: 0 5px 5px 0;"><v-icon>{{ playIcon }}</v-icon></v-btn>
								<v-slider min="0" max="100" v-model="buffer" :buffer-value="bufferValue" id="seek-bar" style="width: 160px; display: inline-flex" @change="seekChange(buffer)" @mousedown="seekMouseDown" @mouseup="seekMouseUp"></v-slider>
								<!--button type="button" id="mute"><span class="material-icons">volume_up</span>/<span class="material-icons">volume_off</span></button>
								<input type="range" id="volume-bar" min="0" max="1" step="0.1" value="1"-->
								<v-btn icon id="full-screen" style="margin:  0  0 5px 5px;"><span class="material-icons">fullscreen</span></v-btn>
							</div>
						</div>
					</div>
				</div>
				<v-card-text> <!-- Print data -->
					Slicer : {{ item.generatedBy }} <br>
					Layer Height: {{ item.layerHeight }} mm <br>
					Object Height: {{ item.height }} mm <br>
					Print time: {{ $displayTime(item.printTime) }}<br>
					Filament Needed: {{ item.filament.length == 1 ? item.filament[0]+" mm" : "table" }} <br>
				</v-card-text>
				<v-card-text> <!-- File data -->
					Filename: {{ item.name }} <br>
					Size: {{ $displaySize(item.size) }}<br>
					Last modified : {{ item.lastModified.toLocaleString() }} <br>
				</v-card-text>
			</template>

			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn v-bind:color="(item?'red':'blue') +' darken-1'" flat @click="dismissed">{{ item?'Cancel':$t('generic.no') }}</v-btn>
				<v-btn :class="item?'success':'v-btn--flat blue--text text--darken-1'" @click="confirmed">{{ item?'Print':$t('generic.yes') }}</v-btn>
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
		back(e) {
			if (document.getElementsByClassName('flip-box-inner')[0].style.transform == "")
				document.getElementsByClassName('flip-box-inner')[0].style.transform = 'rotateY(90deg)';
			else {
				document.getElementsByTagName('video')[0].load();
				document.getElementsByTagName('video')[0].play();
			}
				//document.getElementsByClassName('flip-box-inner')[0].style.transform = '';

			//document.getElementsByClassName('flip-box')[0].onclick = this.front;
		},
		front(e) {
			document.getElementsByClassName('flip-box-inner')[0].style.transform = '';
			document.getElementsByClassName('flip-box')[0].onclick = this.back;
		},
		attachListener(){
			var fullscreen = document.getElementById('full-screen');
			var video = document.getElementsByTagName('video')[0];
			fullscreen.addEventListener("click", function() {
				if (video.requestFullscreen) {
					video.requestFullscreen();
				}
			});
		},
		playPause() {
			if (!document.getElementsByTagName('video')[0].paused) {
				document.getElementsByTagName('video')[0].pause();
				this.playIcon = 'play_arrow';
				this.playing = false;
			} else {
				document.getElementsByTagName('video')[0].play();
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

	}
}
</script>
