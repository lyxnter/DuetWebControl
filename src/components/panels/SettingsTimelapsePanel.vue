<template>
	<v-card>
		<v-card-title class="pb-0">
			{{ $t('panel.settingsTimelapse.caption') }}
			<v-spacer></v-spacer>
			<a v-show="!uiFrozen" href="/fileManager.php">
				<v-icon small class="mr-1">camera_roll</v-icon> {{ $t('panel.settingsTimelapse.showPreview') }}
			</a>
		</v-card-title>

		<v-container fluid grid-list-lg class="px-3">
			<v-layout row wrap align-center>
				<v-flex xs12 sm12 md6>
					<v-text-field v-model="timelapseURL" :label="$t('panel.settingsTimelapse.timelapseURL')"></v-text-field>
				</v-flex>
				<v-flex xs12 sm12 md6>
				</v-flex>
				<v-flex xs12 sm12 md6>
					<v-switch v-model="timelapseInterval" :label="$t('panel.settingsTimelapse.timelapseInterval')"></v-switch>
				</v-flex>
				<v-flex xs12 sm12 md6 >
					<v-text-field v-if="timelapseInterval" v-model="timelapseUpdateInterval" type="number" step="1" min="5" :label="$t('panel.settingsTimelapse.timelapseUpdateInterval', ['s'])"></v-text-field>
				</v-flex>
				<v-flex xs12 sm12 md6>
					<v-switch v-model="timelapseLayer" :label="$t('panel.settingsTimelapse.timelapseLayer')"></v-switch>
				</v-flex>
				<v-flex xs12 sm12 md6>
				</v-flex>
				<v-flex xs12 sm12 md6>
					<v-select v-model="timelapseResolution" :items="resolutionsItems" :label="$t('panel.settingsTimelapse.timelapseResolution')"></v-select>
				</v-flex>
				<v-flex xs12 sm12 md6 >
					<v-text-field v-model="timelapseTargetDuration" type="number" step="1" min="1" :label="$t('panel.settingsTimelapse.timelapseTargetDuration', ['s'])"></v-text-field>
				</v-flex>
				<v-flex xs12 sm12 md6>
					<v-text-field v-model="timelapseMinFramerate" type="number" step="1" min="5" :label="$t('panel.settingsTimelapse.timelapseMinFramerate', ['s'])"></v-text-field>
				</v-flex>
				<v-flex xs12 sm12 md6>
					<v-text-field v-model="timelapseMaxFramerate" type="number" step="1" min="5" :label="$t('panel.settingsTimelapse.timelapseMaxFramerate', ['s'])"></v-text-field>
				</v-flex>
			</v-layout>
		</v-container>
	</v-card>
</template>

<script>
'use strict'

import { mapState,mapGetters, mapMutations } from 'vuex'

export default {
	computed: {
		...mapState(['settings']),
		...mapGetters(['uiFrozen']),
		timelapseURL: {
			get() { return (this.settings.timelapse.url ? this.settings.timelapse.url : window.origin + ":8080/?action=stream"); },
			set(value) { this.update({ timelapse: { url: (window.origin + ":8080/?action=stream" == value ? "" : value) } }); }
		},
		timelapseInterval: {
			get() { return this.settings.timelapse.onInterval; },
			set(value) { this.update({ timelapse: { onInterval: value } }); }
		},
		timelapseUpdateInterval: {
			get() { return this.settings.timelapse.updateInterval; },
			set(value) { this.update({ timelapse: { updateInterval: parseInt(value) } }); }
		},
		timelapseLayer: {
			get() { return this.settings.timelapse.onLayer; },
			set(value) { this.update({ timelapse: { onLayer: value } }); }
		},
		timelapseResolution: {
			get() { return this.settings.timelapse.resolution; },
			set(value) { this.update({ timelapse: { resolution: value } }); }
		},
		timelapseMinFramerate: {
			get() { return this.settings.timelapse.framerate.min; },
			set(value) { this.update({ timelapse: { framerate: { min: parseInt(value) } } }); }
		},
		timelapseMaxFramerate: {
			get() { return this.settings.timelapse.framerate.max; },
			set(value) { this.update({ timelapse: { framerate: { max: parseInt(value) } } }); }
		},
		timelapseTargetDuration: {
			get() { return this.settings.timelapse.targetDuration; },
			set(value) { this.update({ timelapse: { targetDuration: parseInt(value) } }); }
		},
	},
	data() {
		return {
			resolutionsItems: ["320x240", "352x288", "640x360", "640x480", "800x600", "1280x720", "1920x1080"],
		}
	},
	mounted() {
		this.timelapseURL = (this.timelapseURL ? this.timelapseURL : window.origin + ":8080/?action=stream")
	},
	methods: mapMutations('settings', ['update'])
}
</script>
