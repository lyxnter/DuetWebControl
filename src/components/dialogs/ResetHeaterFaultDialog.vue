<template>
	<v-dialog v-model="shown" max-width="640">
		<v-card>
			<v-card-title class="headline">
				<v-icon class="mr-1">warning</v-icon>
				{{ $t('dialog.resetHeaterFault.title') }}
			</v-card-title>

			<v-card-text>
				<p v-html="$t('dialog.resetHeaterFault.prompt', [this.heater])"></p>
			</v-card-text>

			<v-card-actions>
				<v-btn color="primary darken-1" flat="flat" @click="sendCode('M112\nM999');shutdown()">
					{{$t('dialog.confirmShutdown.title')}}
				</v-btn>

				<v-spacer></v-spacer>

				<v-btn color="primary darken-1" flat="flat" :disabled="!!counter" @click="resetFault">
					{{ $t('dialog.resetHeaterFault.resetFault') + (counter ? ` (${counter})` : '') }}
				</v-btn>

				<v-btn color="primary darken-1" flat="flat" @click="hide">
					{{ $t('generic.cancel') }}
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
'use strict'

import { mapActions } from 'vuex'

export default {
	props: {
		shown: {
			type: Boolean,
			required: true
		},
		heater: {
			type: Array,
			required: true
		}
	},
	data() {
		return {
			counter: 10
		}
	},
	methods: {
		...mapActions(['shutdown']),
		...mapActions('machine', ['sendCode']),
		resetFault() {
			if (typeof(this.heater) == typeof([])) {
				for (let i = 0; i < this.heater.length; i++) {
					this.sendCode(`M562 P` + this.heater[i]);
				}
			} else {
				this.sendCode(`M562 P` + this.heater);
			}
			this.hide();
		},
		hide() {
			this.$emit('update:shown', false);
		},
		countDown() {
			this.counter--;
			if (this.counter > 0) {
				setTimeout(this.countDown, 1000);
			}
		}
	},
	watch: {
		shown(to) {
			if (to) {
				this.counter = 5;
				this.countDown();
			}
		}
	}
}
</script>
