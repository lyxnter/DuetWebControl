<template>
	<v-layout row wrap>
		<v-flex v-bind:class="{'lg9': !isLocal, 'lg12': isLocal}" xs12 sm12 md8 xl9>
    <!-- v-bind:class="{'row': $vuetify.breakpoint.mdAndUp, 'column': $vuetify.breakpoint.smAndDown}"-->
  		<v-layout row>
				<v-flex xs12 sm12 md6 lg6>
					<tools-panel :shown=true ></tools-panel>
				</v-flex>
				<v-flex v-if="$vuetify.breakpoint.mdAndUp" md6 lg6>
					<temperature-chart></temperature-chart>
				</v-flex>
			</v-layout>
			<v-layout row>
  			<v-layout column>
	          <v-flex>
	  					<movement-panel></movement-panel>
	  				</v-flex>
  				<v-flex>
  					<v-layout row>
							<v-flex xs12 sm4 md6 lg6>
								<status-panel></status-panel>
							</v-flex>
  						<v-flex sm12 md8 lg9 xl10>
  							<extrude-panel></extrude-panel>
  						</v-flex>
  					</v-layout>
  				</v-flex>
					<v-flex>
  					<v-layout row>
							<v-flex xs7 sm4 md12>
								<job-control-panel></job-control-panel>
							</v-flex>
		  				<v-flex md9>
		  					<fan-panel></fan-panel>
		  				</v-flex>

						</v-layout>
					</v-flex>
					<v-flex v-if="isLocal" xs12 sm9 md6 lg6 class="hidden-md-and-up">
		 				<macro-list></macro-list>
		 			</v-flex>
        </v-layout>
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
	}
}
	//alert(new Date());
</script>
