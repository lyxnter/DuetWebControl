<style>
.v-breadcrumbs__item {
	color: hsl(43, 98%, 50%);
}
</style>
<template>
	<v-flex>
		<v-breadcrumbs :items="pathItems" divider=">">
			<template slot="item" slot-scope="props">
				<v-breadcrumbs-item :disabled="props.item.disabled" @click="changeDirectory(props.item.href)" @dragover="dragOver(props.item.href, $event)" @drop.prevent="dragDrop(props.item.href, $event)">
					{{ props.item.text }}
				</v-breadcrumbs-item>
			</template>
		</v-breadcrumbs>
		<input-dialog :shown.sync="moveDialog.shown" :title="$t('dialog.moveFile.title')" :prompt="$t('dialog.moveFile.prompt')" :preset="moveDialog.item && moveDialog.item.name" @confirmed="moveCallback" :files="moveDialog.files"></input-dialog>
	</v-flex>
</template>

<script>
'use strict'

import { mapActions, mapState } from 'vuex'

import Path from '../../utils/path.js'

export default {
	data() {
		return {
			moveDialog: {
				shown: false,
				directory: '',
				item: null,
				files: []
			},
		}
	},
	props: {
		value: {
			type: String,
			required: true
		}
	},
	computed: {
		pathItems() {
			const pathItems = this.value.split('/');
			let rootCaption = pathItems.length ? this.$t('generic.noValue') : pathItems[0];
			if (pathItems.length > 1) {
				if (this.value.startsWith(Path.gcodes)) {
					pathItems.shift();
					pathItems[0] = Path.gcodes;
					rootCaption = this.$t('directory.gcodes');
				} else if (this.value.startsWith(Path.macros)) {
					pathItems.shift();
					pathItems[0] = Path.macros;
					rootCaption = this.$t('directory.macros');
				} else if (this.value.startsWith(Path.filaments)) {
					pathItems.shift();
					pathItems[0] = Path.filaments;
					rootCaption = 'Filaments Directory';
				} else if (this.value.startsWith(Path.liquids)) {
					pathItems.shift();
					pathItems[0] = Path.liquids;
					rootCaption = 'Liquids Directory';
				} else if (this.value.startsWith(Path.materials)) {
					pathItems.shift();
					pathItems[0] = Path.materials;
					rootCaption = 'Materials Directory';
				} else if (this.value.startsWith(Path.display)) {
					pathItems.shift();
					pathItems[0] = Path.display;
					rootCaption = this.$t('directory.display');
				} else if (this.value.startsWith(Path.sys)) {
					pathItems.shift();
					pathItems[0] = Path.sys;
					rootCaption = this.$t('directory.sys');
				} else if (this.value.startsWith("0:/www/img/Timelapses")) {
					console.log(pathItems);
					pathItems.splice(0, 3);
					console.log(pathItems);
					pathItems[0] = "0:/www/img/Timelapses";
					rootCaption = "Timelapses";
				} else if (this.value.startsWith(Path.www)) {
					pathItems.shift();
					pathItems[0] = Path.www;
					rootCaption = this.$t('directory.www');
				}
			}

			const that = this;
			let items = [], path = '';
			pathItems.forEach(function(item, index) {
				path = (path === '') ? item : path + '/' + item;
				if (index === 0) {
					items.push({
						text: item.startsWith('0:') ? rootCaption : that.$t('generic.sdCard', [/^(\d+)/.exec(item)[1]]),
						disabled: index === pathItems.length - 1,
						href: path
					});
				} else {
					items.push({
						text: item,
						disabled: index === pathItems.length - 1,
						href: path
					});
				}
			});
			return items;
		},
		...mapState({
			getTool: state => { return state.user.loadedTool}
		}),
	},
	methods: {
		...mapActions('machine', ['move', 'getFileList']),
		changeDirectory(directory) {
			this.$emit('input', directory);
		},
		dragOver(directory, e) {
			const jsonData = e.dataTransfer.getData('application/json');
			if (jsonData) {
				const data = JSON.parse(jsonData);
				if (data.type === 'dwcFiles' && !data.items.some(dataItem => dataItem.isDirectory && directory === Path.combine(data.directory, dataItem.name))) {
					e.preventDefault();
					e.stopPropagation();
				}
			} else {
				// Fix for Chrome: It does not grant access to dataTransfer on the same domain "for security reasons"...
				e.preventDefault();
				e.stopPropagation();
			}
		},
		async dragDrop(directory, e) {
			const jsonData = e.dataTransfer.getData('application/json');
			if (jsonData) {
				const data = JSON.parse(jsonData);
				if (data.type === 'dwcFiles' && !data.items.some(dataItem => dataItem.isDirectory && directory === Path.combine(data.directory, dataItem.name))) {
					const data = JSON.parse(jsonData);
					const folder = await this.getFileList(directory);
					let i = 0;
					this.moveDialog.directory = [Path.combine(data.directory), directory];
					let inter = setInterval(async function(that) {
						if(i == data.items.length) {
							clearInterval(inter)
							return;
						}
						if(that.moveDialog.shown == false) {
							that.moveDialog.item = (data.items && data.items[i] && data.items[i].name) ? data.items[i] : that.innerValue[0];
							that.moveDialog.files = folder;
							if (that.isUnique(data.items[i].name, folder)) {
								that.moveCallback(data.items[i].name)
							} else {
								that.moveDialog.shown = true;
								console.log(that.moveDialog)
							}
							i++
						}
					}, 1000, this)
					/*
					for (let i = 0; i < data.items.length; i++) {
					const from = Path.combine(data.directory, data.items[i].name);
					const to = Path.combine(directory, data.items[i].name);
					try {
					await this.move({ from, to });
				} catch (e) {
				this.$log('error', this.$t('error.move', [data.items[i].name, directory]), e.message);
				break;
			}
		}*/
	}
}
},
async moveCallback(newFilename) {
	const oldFilename = this.moveDialog.item.name;
	console.log(oldFilename, newFilename)
	const from = Path.combine(this.moveDialog.directory[0], oldFilename);
	const to = Path.combine(this.moveDialog.directory[1], newFilename);
	console.log(from, to)
	try {
		await this.move({ from, to, force: true});
	} catch (e) {
		this.$makeNotification('error', `Failed to move ${from} to ${to}`, e.message);
	}
},
isUnique(file, folder) {
	let input = file
	let ext = ''
	let num
	if (input.indexOf('.') > 0) {
		ext = input.substr(input.lastIndexOf('.')+1)
		input = input.substr(0, input.lastIndexOf('.'))
	}
	if ((/ - Copy(\(\d+\))?/gm).test(input)) {
		num = parseInt(input.substr( input.lastIndexOf('(')+1))
		input = input.substr(0, input.lastIndexOf(' - Copy'))
	}
	let maxnum = 0;
	let files = folder.filter(file => {
		let fname = file.name
		let fext = ''
		let fnum
		if (fname.indexOf('.') > 0) {
			fext = fname.substr(fname.lastIndexOf('.')+1)
			fname = fname.substr(0, fname.lastIndexOf('.'))
		}
		if ((/ - Copy(\(\d+\))?/gm).test(fname)) {
			fnum = parseInt(fname.substr( fname.lastIndexOf('(')+1))
			fname = fname.substr(0, fname.lastIndexOf(' - Copy'))
			if (fnum > maxnum && fname == input && fext == ext)
			maxnum = fnum
		}
		return fname == input && fext == ext && (fnum == num)
	})
	console.log(files.length == 0 ? 'unique' : 'NOT UNIQUE');
	return files.length == 0
},
}
}
</script>
