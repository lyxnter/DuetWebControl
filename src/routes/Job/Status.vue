<template>
	<v-layout column>
		<v-flex>
			<job-progress></job-progress>
		</v-flex>
		<v-layout row wrap>
			<v-flex v-if="isLocal" shrink md6 sm12>
				<temperature-chart></temperature-chart>
			</v-flex>
			<v-flex d-flex v-if="isLocal" md6 sm12>
				<layer-chart></layer-chart>
			</v-flex>
		</v-layout>
		<v-flex>
			<v-layout row wrap full-height>
				<v-flex order-sm1 order-md1 md3 xl2>
					<v-layout row wrap align-center>
						<v-flex xs7 sm6 md12>
							<job-control-panel></job-control-panel>
						</v-flex>
						<v-flex xs5 sm6 md12>
							<babystepping-panel></babystepping-panel>
						</v-flex>
						<v-flex xs5 sm6 md12 v-if="!isLocal">
							<webcam-panel></webcam-panel>
						</v-flex>
						<v-flex class="hidden-xs-only" v-if="!isLocal">
							<job-info-panel></job-info-panel>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex order-sm2 order-md2 md6 xl7 d-flex>
					<v-layout column>
						<v-flex d-flex v-if="!isLocal">
							<layer-chart></layer-chart>
						</v-flex>
						<v-flex shrink>
							<v-layout row wrap>
								<v-layout :style="isLocal ? 'width: 50%' :''" :class="isLocal ? 'column shrink' : 'row wrap'">
									<v-flex xs6 md12 order-sm2 order-md3>
										<job-estimations-panel></job-estimations-panel>
									</v-flex>
									<v-flex xs6 md12 v-if="isLocal">
										<speed-factor-panel></speed-factor-panel>
									</v-flex>
								</v-layout>
								<v-flex xs6 md12 order-sm3 order-md2>
									<job-data-panel></job-data-panel>
								</v-flex>
							</v-layout>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex v-if="!isLocal" order-sm3 order-md3 md3 xl3>
					<v-layout column>
						<v-flex>
							<fans-panel></fans-panel>
						</v-flex>
						<v-flex>
							<speed-factor-panel></speed-factor-panel>
						</v-flex>
						<v-flex>
							<extrusion-factors-panel></extrusion-factors-panel>
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
		</v-flex>
	</v-layout>
</template>

<script>
'use strict'

import { mapState } from 'vuex'

export default {
	computed: {
		...mapState({
			isLocal: state => state.isLocal,
		}),
	},
	data() {
		return {
		}
	},
	methods:{
	}
}
</script>
