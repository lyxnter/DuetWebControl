<template>
	<v-layout row wrap>
		<v-flex md5 lg4>
			<v-layout row wrap>
				<v-flex xs12 v-if="isLocal">
					<settings-about-panel></settings-about-panel>
				</v-flex>
				<v-flex :class="isLocal?'sm12':'sm6'" md12>
					<settings-electronics-panel></settings-electronics-panel>
				</v-flex>
				<v-flex sm6 md12 v-if="!isLocal">
					<settings-machine-panel></settings-machine-panel>
				</v-flex>
				<v-flex :class="isLocal?'sm12':'sm6'" md12>
					<settings-network-panel></settings-network-panel>
				</v-flex>
				<v-flex v-if="false" :class="isLocal?'sm12':'sm6'" md12>
					<settings-endstops-panel></settings-endstops-panel>
				</v-flex>
			</v-layout>
		</v-flex>
		<v-flex md7 lg8 v-if="!isLocal">
			<v-layout row wrap>
				<v-flex>
					<settings-communication-panel></settings-communication-panel>
				</v-flex>
				<v-flex>
					<settings-list-items-panel></settings-list-items-panel>
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
	}
}
//alert(new Date());
</script>
