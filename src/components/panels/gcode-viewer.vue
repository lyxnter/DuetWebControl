<template>
	<v-card>
		<v-card-title class="pt-2 pb-0 nowrap">

			<v-spacer class="hidden-sm-and-down"></v-spacer>

			<v-icon small class="mr-1">visibility</v-icon> Gcode Visualizer
			<v-spacer></v-spacer>
		</v-card-title>
		<div id="eventTarget" style="width: 600px; height: 520px; overflow: hidden; margin:auto"  @mouseenter="zoomIn()" @mouseleave="zoomOut()" @mousemove="centerSvg($event)" @mousewheel="zoomSvg($event)" @wheel="zoomSvg($event)">
				<div id="liveDisplay" style="width: 600px; height: 520px; transform: scale(0.5); transform-origin: 0% 0%"></div>
		</div>
		<div id="threeDisplay" style="height: 400px; width: 400px; display:none;"></div>
  </v-card>
</template>
<script src="../../lynxmod/threeScene.js">
</script>
