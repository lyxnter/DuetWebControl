<template>
	<div class="component">
		<v-toolbar>
			<directory-breadcrumbs v-model="directory"></directory-breadcrumbs>

			<v-spacer></v-spacer>

			<v-btn class="hidden-sm-and-down mr-3" :disabled="uiFrozen" @click="showNewFile = true">
				<v-icon class="mr-1">add</v-icon> {{ $t('button.newFile.caption') }}
			</v-btn>
			<v-btn class="hidden-sm-and-down mr-3" :disabled="uiFrozen" @click="showNewDirectory = true">
				<v-icon class="mr-1">create_new_folder</v-icon> {{ $t('button.newDirectory.caption') }}
			</v-btn>
			<v-btn class="hidden-sm-and-down mr-3" color="grey darken-3" :loading="loading" :disabled="uiFrozen" @click="refresh" >
				<v-icon class="mr-1">refresh</v-icon> {{ $t('button.refresh.caption') }}
			</v-btn>
			<v-btn class="hidden-md-and-up" color="grey darken-3" :loading="loading" :disabled="uiFrozen" @click="refresh">
				<v-icon class="mr-1">refresh</v-icon>
			</v-btn>
			<upload-btn class="hidden-sm-and-down" :directory="directory" target="sys" color="primary darken-1"  v-on:refreshlist="refresh" v-on:uploadComplete="refresh"></upload-btn>
			<upload-zip-btn class="hidden-sm-and-down" :directory="directory" target="update" color="primary darken-1"></upload-zip-btn>
		</v-toolbar>

		<base-file-list ref="filelist" v-model="selection" :directory.sync="directory" :loading.sync="loading" sort-table="sys" @fileClicked="fileClicked" @fileEdited="fileEdited">
			<template slot="no-data">
				<v-alert :value="true" type="secondary" class="ma-0" @contextmenu.prevent="">
					{{ $t('list.sys.noFiles') }}
				</v-alert>
			</template>
		</base-file-list>

		<v-layout class="hidden-md-and-up mt-2" row wrap justify-space-around>
			<v-btn :disabled="uiFrozen" @click="showNewFile = true">
				<v-icon class="mr-1">add</v-icon> {{ $t('button.newFile.caption') }}
			</v-btn>
			<v-btn :disabled="uiFrozen" @click="showNewDirectory = true">
				<v-icon class="mr-1">create_new_folder</v-icon> {{ $t('button.newDirectory.caption') }}
			</v-btn>
			<v-btn color="secondary" :loading="loading" :disabled="uiFrozen" @click="refresh">
				<v-icon class="mr-1">refresh</v-icon> {{ $t('button.refresh.caption') }}
			</v-btn>
			<upload-btn :directory="directory" target="sys" color="primary" v-on:uploadComplete="refresh"></upload-btn>
		</v-layout>

		<new-directory-dialog :shown.sync="showNewDirectory" :directory="directory"></new-directory-dialog>
		<new-file-dialog :shown.sync="showNewFile" :directory="directory"></new-file-dialog>
		<confirm-dialog :shown.sync="showResetPrompt" :question="$t('dialog.configUpdated.title')" :prompt="$t('dialog.configUpdated.prompt')" @confirmed="resetBoard"></confirm-dialog>
	</div>
</template>

<script>
'use strict'

import { mapState, mapGetters, mapActions } from 'vuex'

import Path from '../../utils/path.js'

export default {
	computed: {
		...mapState('machine/model', ['state']),
		...mapGetters(['uiFrozen']),
		...mapGetters('machine/model', ['isPrinting']),
		isRootDirectory() { return this.directory === Path.sys; }
	},
	data() {
		return {
			directory: '0:/www/img/Timelapses'/*Path.timelapse*/,
			loading: false,
			selection: [],
			showNewDirectory: false,
			showNewFile: false,
			showResetPrompt: false,
			fab: false
		}
	},
	methods: {
		...mapActions('machine', ['download', 'sendCode']),
		refresh() {
			this.$refs.filelist.refresh();
		},
		fileClicked(item) {
			if (item.name.toLowerCase().endsWith('.bin')) {
				this.$refs.filelist.download(item);
			} else {
				this.$refs.filelist.edit(item);
			}
		},
		fileEdited(filename) {
			if (filename === Path.configFile && !this.state.isPrinting) {
				this.showResetPrompt = true;
			}
		},
		async resetBoard() {
			try {
				await this.sendCode('M999');
			} catch (e) {
				// this is expected
			}
		},
		async editConfigTemplate() {
			const jsonTemplate = await this.download({ filename: Path.combine(Path.sys, 'config.json'), type: 'text' });

			const form = document.createElement('form');
			form.method = 'POST';
			form.action = 'https://configtool.reprapfirmware.org/load.php';
			form.target = '_blank';
			{
				const jsonTemplateInput = document.createElement('textarea');
				jsonTemplateInput.name = 'json';
				jsonTemplateInput.value = jsonTemplate;
				form.appendChild(jsonTemplateInput);
			}
			document.body.appendChild(form);
			form.submit();
			document.body.removeChild(form);
		}
	}
}
</script>
