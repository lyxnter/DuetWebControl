<template>
	<v-layout row wrap>
		<v-flex v-bind:class="{'lg9': !isLocal, 'lg12': isLocal}" xs12 sm12 md8 xl9>
			<v-layout v-bind:class="{'row': $vuetify.breakpoint.mdAndUp, 'column': $vuetify.breakpoint.smAndDown}" v-if="isLocal">
				<v-flex xs12 sm12 md6 lg6>
					<status-panel></status-panel>
				</v-flex>
				<v-flex xs12 sm12 md6 lg6>
					<tools-panel></tools-panel>
				</v-flex>
				<v-flex v-if="$vuetify.breakpoint.mdAndUp" md6 lg6>
					<temperature-chart></temperature-chart>
				</v-flex>
			</v-layout>
			<v-layout column>
				<v-flex v-if="$vuetify.breakpoint.smAndDown" sm12>
					<temperature-chart></temperature-chart>
				</v-flex>
				<v-flex v-if="!isLocal">
					<movement-panel></movement-panel>
				</v-flex>

				<v-flex>
					<v-layout row>
						<v-flex v-if="!isLocal" sm12 md9 lg9 xl10>
							<extrude-panel></extrude-panel>
						</v-flex>

						<v-flex class="hidden-sm-and-down" v-if="false" align-self-center md3 lg3 xl2>
							<atx-panel></atx-panel>
						</v-flex>
					</v-layout>
				</v-flex>

				<!--v-flex v-if="!isLocal">
					<gcode-panel></gcode-panel>
				</v-flex-->

				<v-flex md9 v-if="!isLocal">
					<fan-panel></fan-panel>
				</v-flex>

				<v-flex v-if="!isLocal" class="hidden-md-and-up">
					<atx-panel></atx-panel>
				</v-flex>
			</v-layout>
			<v-layout v-if="isLocal" row>
				<v-flex class="hidden-xs-only" sm12 md6 lg4 xl3>
					<gcode-list></gcode-list>
				</v-flex>
			</v-layout>
		</v-flex>

		<v-flex class="hidden-xs-only" v-if="!isLocal" sm4 md4 lg3 xl3>
			<macro-list></macro-list>
			<gcode-list></gcode-list>
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
		}
	}
	//alert(new Date());
</script>
