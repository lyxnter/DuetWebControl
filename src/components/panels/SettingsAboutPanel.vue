<template>
	<v-card>
		<v-card-title>
			<span>Duet Web Control {{ version }}</span>
			<v-spacer></v-spacer>
			<a href="https://github.com/lyxnter/DuetWebControl/tree/master" target="_blank">
				<v-icon small>star</v-icon> GitHub
			</a><br/>
			<span v-if="lxVersion" style="width: 100%">{{ $t('panel.settingsAbout.lxVersion') + lxVersion }}</span><br/>
			<span v-if="buildDate">{{ $t('panel.settingsAbout.buildDate') + buildDate }}</span><br/>
		</v-card-title>

		<v-card-text class="pt-0">
			{{ $t('panel.settingsAbout.developedBy') }} <a href="mailto:christian@duet3d.com">Christian Hammacher</a> {{ $t('panel.settingsAbout.updatededBy') }} <a href="mailto:contact@lynxter.fr">Thomas Camguilhem</a> {{ $t('panel.settingsAbout.for') }} <a href="https://www.lynxter.fr" target="_blank">Lynxter</a>
			<br/>
			{{ $t('panel.settingsAbout.licensedUnder') }} <a href="https://www.gnu.org/licenses/gpl-3.0.en.html" target="_blank">GNU General Public License v3</a>
		</v-card-text>
	</v-card>
</template>

<script>
'use strict';

import {version, lxVersion, buildDate} from '../../../package.json'

export default {
	computed: {
		version: () => version ,
		lxVersion: () => lxVersion ,
		buildDate:() => buildDate
	}
}
</script>
