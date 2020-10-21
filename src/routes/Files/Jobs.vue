<style>
.progress {
	background: linear-gradient(to right, hsl(43, 98%, 50%) 45%, hsl(43, 98%, 75%) 50%, hsl(43, 98%, 50%) 55%) repeat scroll 0% 0% / 300% 300%;
	background-size: 600% 600% !important;
	animation: 2s linear 0s infinite normal none running fileUploading !important;
}
@keyframes fileUploading {
	0% {
		background-position: 125% 50%;
	}
	100% {
		background-position: -25% 50%;
	}
}
</style>
<template>
	<v-layout row>
		<v-flex style="width: -webkit-fill-available;">
			<job-file-list></job-file-list>
		</v-flex>
		<v-flex id="uploadDiv" style="position: fixed; right: 15px; bottom: 15px; width: 320px; border-radius: 5px !important; overflow: hidden; display: none; background: #515151; border: 1px solid #202020; padding: 10px; z-index: 1">
			<div id="previewDisplay" style="border: 1px solid #606060; border-radius: 5px; overflow: hidden; height: 300px">
				<div style="width: 300px;position: absolute;font-size: x-large;text-align: center;vertical-align: middle;margin-top: 132px;"> No preview available </div>
				<div id="threeDisplay" style="max-height: 300px; transform: scale(0.25); transform-origin: 0% 0%;"></div>
			</div>
			<div style="height: 15px; overflow: hidden; border-radius: 5px; background: rgb(101, 73, 1); margin: 10px 0;">
				<div id="fileProgress" style="height: 15px; text-align: center; font-size: 10px; width: 50%; color: black; overflow: hidden; background: linear-gradient(to right, hsl(43, 98%, 30%) 45%, hsl(43, 98%, 50%) 50%, hsl(43, 98%, 30%) 55%) repeat scroll 0% 0% / 300% 300%"></div>
				<div id="progress" class="progress" style="height: 15px; text-align: center; font-size: 10px; width: 25%; color: black; overflow: hidden; position: relative; bottom: 15px"></div>
			</div>
			<div style="padding: 10px">
				<div id="fname" style="text-overflow: ellipsis;overflow: hidden; max-width: 300px;"></div><br/>
				<span id="pspeed"></span><br/>
				<span id="pleft"></span>
			</div>
		</v-flex>
		<v-flex style="display: none">
			<div id="liveDisplay"></div>
		</v-flex>
	</v-layout>
</template>
