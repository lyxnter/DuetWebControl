<template>
	<v-btn v-bind="$props" :color="buttonColor" :depressed="isBusy" @click="clicked" tabindex="0">
		<v-icon v-show="!isBusy">{{ buttonIcon }}</v-icon>
		<v-progress-circular size="20" v-show="isBusy" indeterminate></v-progress-circular>
		<span class="ml-2">{{ caption }}</span>
	</v-btn>
</template>

<script>
'use strict'

import VBtn from 'vuetify/es5/components/VBtn'

import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'

export default {
	computed: {
		...mapState(['isLoggingIn', 'isLoggingOut', 'isLocal', 'user']),
		...mapGetters(['isLogedIn']),
		isBusy() { return this.isLoggingIn || this.isLoggingOut },
		buttonColor() {
			return this.isBusy ? 'warning'
				: (this.isLogedIn ? 'success' : 'primary darken-1');
		},
		buttonIcon() {
			return this.isLogedIn ? 'no_meeting_room' : 'meeting_room';
		},
		caption() {
			return this.$t(this.isLoggingIn ? 'button.login.loggingin'
				: this.isLoggingOut ? 'button.login.loggingout'
					: this.isLogedIn ? this.isLocal ? this.user.username+" ("+this.user.type+")" : 'button.login.logout'
						: 'button.login.login');
		}
	},
	extends: VBtn,
	methods: {
		...mapActions(['login', 'logout']),
		...mapMutations(['showLoginDialog']),
		async clicked() {
			if (this.isBusy) {
				// Cannot disable this button because that messes up the color
				return;
			}

			if (this.isLogedIn) {
				// Disconnect from the current machine
				await this.logout();
			} else {
				// Ask user for hostname before connecting
				this.showLoginDialog();
			}
		}
	}
}
</script>
