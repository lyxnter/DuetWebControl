<template>
	<v-card>
		<v-card-title>
			{{ $t('panel.settingsElectronics.caption') }}
			<v-spacer></v-spacer>
			<a href="#" @click.prevent="diagnostics" v-show="isConnected">
				<v-icon small>info</v-icon> {{ $t('panel.settingsElectronics.diagnostics') }}
			</a>
		</v-card-title>

		<v-card-text class="pt-0">
			<template v-if="isConnected">
				<template v-if="electronics.name">
					{{ $t('panel.settingsElectronics.board', [electronics.name + (electronics.shortName ? ` (${electronics.shortName})` : '')]) }} <br>
				</template>
				<template v-if="electronics.version">
					{{ `DSF Version: ${electronics.version}` }} <br>
				</template>
				<template v-if="electronics.firmware.name">
					{{ $t('panel.settingsElectronics.firmware', [electronics.firmware.name + ' ' + $display(electronics.firmware.version), $display(electronics.firmware.date)]) }}
					<br/><br/>
				</template>
				<template v-if="network.interfaces.length && network.interfaces[0].type === 'wifi'">
					{{ $t('panel.settingsElectronics.dwsFirmware', [$display(network.interfaces[0].firmwareVersion)]) }}
				</template>
				<br>
				{{ isLocal ? null : $t('panel.settingsElectronics.updateNote') }}
			</template>
			<template v-else>
				(not connected)
			</template>
		</v-card-text>
	</v-card>
</template>

<script>
'use strict'

import { mapState, mapGetters, mapActions } from 'vuex'

export default {
	computed: {
		...mapGetters(['isConnected']),
		...mapState(['isLocal']),
		...mapState('machine/model', ['electronics', 'network'])
	},
	methods: {
		...mapActions('machine', ['sendCode']),
		async diagnostics() {
			await this.sendCode('M122');
			this.$router.push('/Console');
		}
	}
}
</script>
