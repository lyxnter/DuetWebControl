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
				<div class="flip-box">
					<div class="flip-box-inner">
						<div class="flip-box-front">
							<img v-if="item.ico" id="buildPlate" src="" style="width: 200px; margin-left: 0%; height: 200px;" alt="" />
							<v-btn v-if="!item.ico" @click="$refs.fileInput.click()" @contextmenu="$emit('contextmenu', $event)" tabindex="0" color="primary darken-1">
								<v-icon class="mr-2">cloud_upload</v-icon> {{ $t('button.upload.generic.caption') }}
							</v-btn>
							<canvas v-if="!item.ico" style="border:1px solid grey; width: 200px; margin-left: 0%; height: 200px;" id="canvas" @click="onClick" ></canvas>
							<v-btn v-if="!item.ico" @click="onClick" @contextmenu="$emit('contextmenu', $event)" tabindex="0" color="gray darken-3" id="saveBtn">
								<v-icon class="mr-2">save</v-icon> {{ $t('dialog.fileEdit.save') }}
							</v-btn>
							<input ref="fileInput" id="imageInput" type="file" accept="image/*" hidden multiple>
							<v-btn v-if="item.ico" color="blue darken-1" onclick="
							document.getElementsByTagName('video')[0].load();
							document.getElementsByClassName('flip-box-inner')[0].style.transform = 'rotateY(180deg)';" @click="attachListener" style=" margin-top: 44px">{{ $t('generic.showPreview') }}</v-btn>
						</div>
						<div class="flip-box-back">
							<video v-if="item.ico" :poster="item.ico" style="width: 200px; margin-left: 0%; height: 200px;" @timeupdate="videoUpdate" @ended="videoEnded" @progress="videoBuffer" preload>
								<source :src="item.ico.substring(0,item.ico.length-8)+'.mp4'" type="video/mp4"/>
								<img src="/img/ressources/file.png" type="image/png">
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
				{{$t('list.jobs.filament')}}: {{ item.filament.length == 0 ? $t('generic.noValue') : (item.filament.length == 1 ? item.filament[0]+" mm" : item.filament) }} <br>
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

import { mapState } from 'vuex'

let $ = require('jquery');

function CLIPBOARD_CLASS(canvas_id, autoresize) {
	var _self = this;
	var canvas = document.getElementById(canvas_id);
	var imgInput = document.getElementById('imageInput');
	var ctx = document.getElementById(canvas_id).getContext("2d");
	var saveBtn = document.getElementById('saveBtn')
	saveBtn.style.display = 'none'

	//handlers
	document.addEventListener('paste', function (e) { _self.paste_auto(e); }, false);
	imgInput.onchange = function(e) { _self.file_input(e); };
	window.ondragover = function(e) {e.preventDefault()}
	window.ondrop = function(e) { _self.drag_n_drop(e); };

	//on paste
	this.paste_auto = async function (e) {
		if (e.clipboardData) {
			console.log(e.clipboardData)
			var items = e.clipboardData.items;
			if (!items) return;
			console.log(items)
			//access data directly
			var is_image = false;
			for (var i = 0; i < items.length; i++) {
				console.log(items[i])
				if (items[i].type.indexOf("image") !== -1) {
					//image
					var blob = items[i].getAsFile();
					var URLObj = window.URL || window.webkitURL;
					var source = URLObj.createObjectURL(blob);
					this.paste_createImage(source);
					is_image = true;
				}
			}
			if(is_image == true){
				e.preventDefault();
				saveBtn.style.display = ''
			}
		}
	};

	//on change
	this.file_input = function (e) {
		if(e.target) {
			var files = e.target.files;
			if (!files) return;
			var is_image = false;
			for (var i = 0; i < files.length; i++) {
				if (files[i].type.indexOf("image") !== -1) {
					var blob = files[i]
					var URLObj = window.URL || window.webkitURL;
					var source = URLObj.createObjectURL(blob);
					this.paste_createImage(source);
					is_image = true;
				}
			}
			if(is_image == true){
				e.preventDefault();
				saveBtn.style.display = ''
			}
		}
	}

	//on change
	this.drag_n_drop = function (e) {
		if(e.dataTransfer) {
			var files = e.dataTransfer.files;
			if (!files) return;
			var is_image = false;
			for (var i = 0; i < files.length; i++) {
				if (files[i].type.indexOf("image") !== -1) {
					var blob = files[i]
					var URLObj = window.URL || window.webkitURL;
					var source = URLObj.createObjectURL(blob);
					this.paste_createImage(source);
					is_image = true;
				}
			}
			if(is_image == true){
				e.preventDefault();
				saveBtn.style.display = ''
			}
		}
	}

	//draw pasted image to canvas
	this.paste_createImage = function (source) {
		var pastedImage = new Image();
		pastedImage.onload = function () {
			if(autoresize == true){
				//resize
				canvas.width = pastedImage.width;
				canvas.height = pastedImage.height;
			}
			else{
				//clear canvas
				ctx.clearRect(0, 0, canvas.width, canvas.height);
			}
			ctx.drawImage(pastedImage, 0, 0);
		};
		pastedImage.src = source;
	};
}

export default {
	data(){
		return {
			buffer: 0,
			bufferValue: 0,
			playIcon: 'play_arrow',
			playing: false,
			CLIPBOARD: undefined,
			strDownloadMime: "image/octet-stream",
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
	computed: {
		...mapState({
			isLocal: state => state.isLocal,
		}),
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
		},
		onClick: function() {
			let strMime = "image/jpeg";
			let imgData = document.getElementById('canvas').toDataURL(strMime);
			let fileName = this.item.directory.substr(10) + '/' + this.item.name.substring(0, this.item.name.lastIndexOf("."));
			console.log(this.item.dir, this.item.directory, this.item.name)
			this.savePicture(imgData/*.replace(strMime, this.strDownloadMime)*/, fileName.substring(fileName.lastIndexOf("/" )+1) + "_ico.jpg");
			while (fileName.includes(" ")) {
				fileName = fileName.replace(" ", "_");
			}
			this.item.ico = "/img/GCodePreview/" + fileName + "/" + fileName.substring(fileName.lastIndexOf("/" )+1) + "_ico.jpg"
			console.log(this.item)
			let item = this.item
			setTimeout(() => {
				let ico = item.ico.substring(0, item.ico.length-7)+'bp.jpg'
				this.validateImg(ico, "buildPlate")
				if (document.getElementById("buildPlate").src.endsWith("/img/ressources/file.png")) {
					ico = item.ico
					this.validateImg(ico, "buildPlate")
				}
			}, 250)
		},
		b64toBlob: function(e, t, n) {
			t = t || "", n = n || 512;
			for (var o = atob(e), r = [], a = 0; a < o.length; a += n) {
				for (var l = o.slice(a, a + n), i = new Array(l.length), s = 0; s < l.length; s++) i[s] = l.charCodeAt(s);
				var c = new Uint8Array(i);
				r.push(c)
			}
			return new Blob(r, {
				type: t
			})
		},
		savePicture: function(e, t) {
			document.getElementById("myAwesomeForm");
			var n = e.split(";"),
			o = n[0].split(":")[1],
			r = this.b64toBlob(n[1].split(",")[1], o);
			let fileName = this.item.directory.substr(10) + '/' + this.item.name.substring(0, this.item.name.lastIndexOf("."));
			while (fileName.includes(" ")) {
				fileName = fileName.replace(" ", "_");
			}
			//console.log("t = " + t)
			//console.log("this.item.name = " + this.item.name)
			var f = fileName;
			while (f.includes(" ")) {
				f = f.replace(" ", "_");
			}
			while (t.includes(" ")) {
				t = t.replace(" ", "_");
			}
			//console.log("uploading("+this.item.name+"):	" + f + "/" + t);
			var start = new Date()
			let that = this
			$.ajax({
				url: (this.selectedMachine?this.selectedMachine:"/") + "rr_upload?name=0:/www/img/GCodePreview/" + f + "/" + t + "&time=" + encodeURIComponent(this.timeToStr(new Date)),
				data: r,
				type: "POST",
				contentType: !1,
				processData: !1,
				cache: !1,
				dataType: "json",
				async: false,
				error: function(e) {
					console.error(e)
					that.$makeNotification('error', that.$t('notification.upload.error', [t]));
				},
				success: function() {
					console.log("Envoi Réussi", (new Date() - start)/1000)
					that.$makeNotification('success', that.$t('notification.upload.success', [t, Math.ceil((new Date() - start)/1000)]));
				},
				complete: function() {
					console.log("Request finished.")
				}
			})
		},
		timeToStr: function(time) {
			// Should return an ISO-like datetime string like "2016-10-24T15:39:09"
			// Cannot use toISOString() here because it doesn't output the localtime
			var result = "";
			result += time.getFullYear() + "-";
			result += (time.getMonth() + 1) + "-";
			result += time.getDate() + "T";
			result += time.getHours() + ":";
			result += time.getMinutes() + ":";
			result += time.getSeconds();
			return result;
		},
		validateImg(path, id_img) {
			console.log(path, id_img)
			var xhr =  new XMLHttpRequest();
			xhr.onload = function() {
				if(xhr.status == 404) {
					console.log(path, id_img)
					document.getElementById(id_img).src = "/img/ressources/file.png"
				} else {
					document.getElementById(id_img).src = path;
				}
			}

			xhr.ontimeout = function() {
				console.log("timed out")
			}

			xhr.onerror = function() {
				console.log("error")
				document.getElementById(id_img).src = "/img/ressources/file.png"
			}

			xhr.open('GET', path , false);
			xhr.send(null);
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

				console.log(this.shown ? "shown" : "hidden")
				console.log(this.item)
				let item = this.item
				if (item.ico) {
					setTimeout(() => {
						let ico = item.ico.substring(0, item.ico.length-7)+'bp.jpg'
						this.validateImg(ico, "buildPlate")
						if (document.getElementById("buildPlate").src.endsWith("/img/ressources/file.png")) {
							ico = item.ico
							this.validateImg(ico, "buildPlate")
						}
					}, 250)
				} else if (!this.isLocal){
					let that = this;
					setTimeout(() => {
						that.CLIPBOARD = new CLIPBOARD_CLASS("canvas", true);
					}, 250)
				} else {
					setTimeout(() => {
						item.ico = (this.selectedMachine?this.selectedMachine:"/") + "img/ressources/file.png"
						setTimeout(() => {
							document.getElementById("buildPlate").src = (this.selectedMachine?this.selectedMachine:"/") + ("img/ressources/file.png")
						}, 250)
					}, 250)
				}
			} else {
				if (document.getElementById('canvas')) {
					var canvas = document.getElementById('canvas')
					var context = canvas.getContext('2d');
					context.clearRect(0, 0, canvas.width, canvas.height);
				} else if (document.getElementById("buildPlate").src.endsWith("/img/ressources/file.png")) {
					this.item.ico = null;
				}
			}
		}
	}
}
</script>
