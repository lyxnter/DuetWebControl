<template>
	<v-card>
		<v-card-title>
			<span>Duet Web Control 2.0.0-RC6+2</span>
			<v-spacer></v-spacer>
			<a href="https://github.com/lyxnter/DuetWebControl/tree/master" target="_blank">
				<v-icon small>star</v-icon> GitHub
			</a>
		</v-card-title>

		<v-card-text class="pt-0">
			{{ $t('panel.settingsAbout.developedBy') }} <a href="https://github.com/chrishamm/DuetWebControl/tree/next">Christian Hammacher</a> 	{{ $t('panel.settingsAbout.updatededBy') }} <a href="mailto:contact@lynxter.fr">Thomas Camguilhem</a> {{ $t('panel.settingsAbout.for') }} <a href="https://www.lynxter.fr" target="_blank">Lynxter</a>
			<br/>
			{{ $t('panel.settingsAbout.licensedUnder') }} <a href="https://www.gnu.org/licenses/gpl-3.0.en.html" target="_blank">GNU General Public License v3</a>
		</v-card-text>
	</v-card>
</template>
