<style>
	#tHead {
		margin-top: 10px;
		animation: movTHead 2s linear infinite;
	}
	#layerN {
		position: relative;
		margin-left: 21px;
		margin-top: -10px;
		background: #fdb913;
		height: 5px;
		width: 5px;
		border-radius: 5px;
		animation: layN 2s linear infinite;
	}

	#layerN1 {
		position: relative;
		margin-left: 21px;
		margin-top: -3px;
		background: #fdb913;
		height: 5px;
		width: 207px;
		border-radius: 5px;
		animation: layN1 2s linear infinite;
	}

	@keyframes movTHead {
		0% {
			margin-left: 0px;
		}
		45% {
			margin-left: 200px;
			margin-top: 15px;
		}
		50% {
			margin-left: 200px;
			margin-top: 10px;
		}
		95% {
			margin-left: 0px;
			margin-top: 15px;
		}
		100% {
			margin-top: 10px;
		}
	}

	@keyframes layN {
		45% {
			width: 207px;
			margin-top: -10px;
			background: #fdb913;
		}
		50% {
			margin-top: 0px;
		}
		95% {
			width: 207px;
			margin-top: 0px;
			background: #fdb91300;
		}
		100% {
			margin-top: -4px;
		}
	}

	@keyframes layN1 {
		45% {
			width: 207px;
			margin-left: 20px;
			margin-top: -3px;
			background: #fdb91300;
		}
		50% {
				width: 8px;
				margin-left: 220px;
				margin-top: -8px;
				background: #fdb91300;
		}
		51% {
			background: #fdb913;
		}
		95% {
			width: 207px;
			margin-left: 21px;
			margin-top: -8px;
			background: #fdb913;
		}
	}
</style>

<template>
	<v-dialog :value="isConnecting || isReconnecting || isDisconnecting || isLoggingIn || isLoggingOut || isLoadingTool" persistent width="480">
		<v-card style="height: 200px; background: #403E3D" dark>
			<v-card-title class="subtitle-1">
				{{ message }}
			</v-card-title>

			<v-card-text>
				<div style="margin: 0px auto;width: 230px;">
					<svg width="49" height="54" id="tHead">
						<path d="M 12 2 h 25 v 40 l -10 10 h-5 l -10 -10 v -40 Z" fill="#fdb913" stroke="#403e3d"/>
					</svg>
					<div id="layerN1"></div>
					<div id="layerN"></div>
				</div>
			</v-card-text>
		</v-card>
	</v-dialog>
</template>

<script>
'use strict'

import { mapState } from 'vuex'

export default {
	computed: {
		...mapState(['isConnecting', 'isDisconnecting', 'isLoggingIn', 'isLoggingOut', 'isLoadingTool', 'isUnloadingTool']),
		...mapState('machine', ['isReconnecting']),
		message() {
			if (this.isConnecting) {
				return this.$t('dialog.connection.connecting');
			}
			if (this.isReconnecting) {
				return this.$t((this.status === 'updating') ? 'dialog.connection.updating' : 'dialog.connection.reconnecting');
			}
			if (this.isDisconnecting) {
				return this.$t('dialog.connection.disconnecting');
			}
			if (this.isLoggingIn) {
				return this.$t('dialog.connection.loggingin');
			}
			if (this.isLoggingOut) {
				return this.$t('dialog.connection.loggingout');
			} if (this.isLoadingTool) {
				return this.$t('dialog.connection.loadingtool');
			}
			return this.$t('dialog.connection.standBy');
		},
		shown() {
			return this.isConnecting || this.isReconnecting || this.isDisconnecting || this.isLoggingIn || this.isLoggingOut || this.isLoadingTool || this.isUnloadingTool;
		}
	}
}
</script>
