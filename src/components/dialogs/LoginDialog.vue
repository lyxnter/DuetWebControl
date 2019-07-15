<template>
	<v-dialog v-model="shown" persistent width="360">
		<v-card>
			<v-form ref="form" @submit.prevent="submit">
				<v-card-title>
					<span class="headline">{{ $t('dialog.login.title') }}</span>
				</v-card-title>

				<v-card-text>
					{{ $t('dialog.login.prompt') }}
					<v-text-field ref="usrLogin" :placeholder="$t('dialog.login.hostPlaceholder')" v-model="usrLogin" :rules="[v => !!v || $t('dialog.login.hostRequired')]" required></v-text-field>
					<v-text-field ref="usrPasswd" type="password" :placeholder="$t('dialog.login.passwordPlaceholder')" v-model="usrPasswd" :rules="[v => !!v || $t('dialog.login.passwordRequired')]" :required="true"></v-text-field>
				</v-card-text>

				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn color="blue darken-1" flat @click="hideLoginDialog">{{ $t('generic.cancel') }}</v-btn>
					<v-btn color="blue darken-1" flat type="submit">{{ $t('dialog.login.connect') }}</v-btn>
				</v-card-actions>
			</v-form>
		</v-card>
	</v-dialog>
</template>

<script>
'use strict'

import { mapState, mapActions, mapMutations } from 'vuex'

export default {
	computed: {
		...mapState(['loginDialogShown']),
		...mapState('settings', ['lastHostname']),
		mustConnect() { return !this.isLocal && !this.isConnected; }
	},
	data() {
		return {
			shown: false,
			usrLogin: '',
			usrPasswd: ''
		}
	},
	methods: {
		...mapActions(['login']),
		...mapMutations(['hideLoginDialog']),
		async submit() {
			if (this.shown && this.$refs.form.validate()) {
				this.hideLoginDialog();

				await this.login({ usrLogin: this.usrLogin, usrPasswd: this.usrPasswd });
				this.usrPasswd = '';
			}
		}
	},
	mounted() {
		this.usrLogin = '';
		this.shown = this.loginDialogShown;
	},
	watch: {
		loginDialogShown(to) { this.shown = to; },
		shown(to) {
			if (to) {
				// Fill in the last usrLogin
				//this.usrLogin = '';

				// Auto-focus input
				const input = this.$refs.usrLogin;
				setTimeout(input.focus, 100);
			}
		}
	}
}
</script>
