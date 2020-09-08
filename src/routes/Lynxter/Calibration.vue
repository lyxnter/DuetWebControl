<style scoped>
.v-card__title, .v-toolbar__title, .v-expansion-panel__header {
	font-family: GTAmericaExpandedRegular, sans-serif;
	text-transform: uppercase;
	letter-spacing: 0.1rem;
}
* {
	transition-duration: 0.25s;
	transition-property: transform;
	transform-origin: 50% 25%
}
</style>
<template>
	<v-layout row wrap>
		<v-layout column v-if="$vuetify.breakpoint.lgAndUp" style="width=25%; height: fit-content">
			<v-flex xs12 sm12 md6 lg6 xl3 order-sm1 order-md1 order-lg1 order-xl1 shrink style="padding: 10px">
				<z-probe-offset></z-probe-offset>
			</v-flex>
			<v-flex xs12 sm12 md6 lg6 xl3 order-sm5 order-md1 order-lg1 order-xl5 shrink style="padding: 10px" v-if="$vuetify.breakpoint.xlOnly" >
				<xy-tilt-panel></xy-tilt-panel>
			</v-flex>
			<v-flex xs12 sm12 md6 lg6 xl3 order-sm5 order-md1 order-lg1 order-xl5 shrink style="padding: 10px" v-if="$vuetify.breakpoint.lgAndDown" >
				<xy-tilt-panel></xy-tilt-panel>
			</v-flex>
		</v-layout>
		<v-layout column shrink :style="{width: ($vuetify.breakpoint.lgAndUp ? '75%' : '100%')}" style="">
			<v-flex xs12 sm12 md6 lg6 xl3 order-sm1 order-md1 order-lg1 order-xl1 shrink style="padding: 10px" v-if="$vuetify.breakpoint.mdAndDown">
				<z-probe-offset></z-probe-offset>
			</v-flex>
			<v-flex xs12 sm12 md6 lg6 xl3 order-sm5 order-md1 order-lg1 order-xl5 shrink style="padding: 10px" v-if="$vuetify.breakpoint.mdAndDown" >
				<xy-tilt-panel></xy-tilt-panel>
			</v-flex>
			<v-flex xs12 sm12 md12 lg12 xl9 order-sm2 order-md2 order-lg2 order-xl2 shrink style="padding: 10px">
				<xy-tool-offset></xy-tool-offset>
			</v-flex>
			<v-flex xs12 sm12 md12 lg12 xl9 order-sm4 order-md4 order-lg4 order-xl4 shrink style="padding: 10px">
				<tool-angle-calib></tool-angle-calib>
			</v-flex>
			<v-flex xs12 sm12 md12 lg9 xl9 order-sm6 order-md6 order-lg6 order-xl6 shrink style="padding: 10px">
				<tool-pid-panel></tool-pid-panel>
			</v-flex>
			<v-flex xs12 sm12 md12 lg12 xl9 order-sm7 order-md7 order-lg7 order-xl7 shrink>
				<movement-panel></movement-panel>
			</v-flex>
		</v-layout>
	</v-layout>
</template>
