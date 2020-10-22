<style scoped>
td {
	cursor: pointer;
}

tr.isLocal td{
	padding: 0 5px !important;
}

.sm4 {
	width: 200px;
	height: 200px;
	border-radius: 20px;
	margin: 0%;
	cursor: pointer;
	transition: transform .1s;
}

.sm4:hover{
	transform: scale(1.05)
}

.sm3 {
	width: 147px;
	height: 50px;
	border-radius: 20px;
	margin: 1%;
	cursor: pointer;
	transition: transform .1s;
}

.sm4:hover{
	transform: scale(1.05)
}

th.checkbox {
	width: 1%;
}

.loading-cursor {
	cursor: wait;
}
.loading-cursor td {
	cursor: wait;
}

.img_gcode{
	transform-origin: 0% 50%;
	transition: transform .5s;
	margin: 0 5px;
}

.img_gcode:hover{
	transform: scale(5);
}

a {
	/*color: #fdb913;*/
	color: white;
	font-weight: bold;
}
tr:hover:not(.v-datatable__expand-row).isLocal  {
	background: none !important;
}

.isLocal td:hover:not(.v-datatable__expand-row) {
	background: #757575 !important;
}
.pr-0{
	//margin-left: 10%;
	width: 190px;
}

.md3 {
	display: inline-flex;
	margin: 5px 0;
}

.hoverPreview {
	cursor: pointer;
	transition: transform .1s;
}

.hoverPreview:hover {
	transform: scale(1.05)
}
.isLocal {
	display: inline flex;
}
</style>
<style scoped v-if="isLocal">
table.v-table tbody td,
table.v-table tbody th {
	height: 75px;
}
</style>

<template>
	<div>
		<v-btn-toggle class="v-btn-toggle--only-child v-btn-toggle--selected">
			<v-btn id="v-btn--list" class="v-btn--large v-btn--depressed " @click="updateDis('l')" :class="{active:!isLocal}"><v-icon  class="mr-1"> view_list </v-icon></v-btn>
			<v-btn id="v-btn--mini" class="v-btn--large v-btn--depressed " @click="updateDis('m')" :class="{active:isLocal}"><v-icon  class="mr-1"> view_module </v-icon></v-btn>
		</v-btn-toggle>
		<v-data-table v-model="innerValue" v-bind="$props"
		:items="innerFilelist"
		:loading="loading || innerLoading"
		:custom-sort="sort"
		:pagination.sync="innerPagination"
		select-all
		item-key="name"
		class="elevation-3"
		:hide-actions="innerFilelist.length <= 18"
		:rows-per-page-items='[9,18,36,{"text":"$vuetify.dataIterator.rowsPerPageAll","value":-1}]'
		:class="{ 'empty-table-fix' : innerFilelist.length === 0, 'loading-cursor' : (loading || innerLoading || doingFileOperation || innerDoingFileOperation)}">
		<template slot="progress">
			<slot name="progress">
				<v-progress-linear indeterminate></v-progress-linear>
			</slot>
		</template>

		<template slot="no-data">
			<slot name="no-data">
				<v-alert :value="true" class="ma-0" @contextmenu.prevent="">
					{{ $t('list.baseFileList.noFiles') }}
				</v-alert>
			</slot>
		</template>

		<template slot="headers" slot-scope="props">
			<tr v-if="displayMode.asList">
				<th class="checkbox pr-0">
					<v-checkbox :input-value="props.all" :indeterminate="props.indeterminate" primary hide-details @click.stop.prevent="toggleAll"></v-checkbox>
				</th>
				<template v-for="header in props.headers" >
					<th :key="header.value" v-if="header.value === 'name' || (header.unit === 'bytes' && $vuetify.breakpoint.mdAndUp) || header.unit === 'date' || (header.unit === 'time' && header.value === 'printTime' && $vuetify.breakpoint.mdAndUp) || (header.unit === 'time' && $vuetify.breakpoint.lgAndUp) || !isLocal" :class="['text-xs-left column sortable', innerPagination.descending ? 'desc' : 'asc', header.value === innerPagination.sortBy ? 'active' : '']" @click="changeSort(header.value)" v-tab-control style="max-width: 170px;">
						<div style="text-overflow: ellipsis;overflow: hidden; max-width: 150px; display: inline">
							{{ getHeaderText(header)}}
						</div>
						<v-icon small>arrow_upward</v-icon>
					</th>
				</template>
			</tr>
			<v-flex shrink v-if="displayMode.asMini" class="isLocal">
				<template v-for="header in props.headers">
					<div :key="header.value" v-if="header.value === 'name' || (header.unit === 'bytes' && $vuetify.breakpoint.smAndUp) || header.unit === 'date' || (header.unit === 'time' && header.value === 'printTime' && $vuetify.breakpoint.smAndUp) || (header.unit === 'time' && $vuetify.breakpoint.lgAndUp) || !isLocal" :class="['text-xs-left column sortable', innerPagination.descending ? 'desc' : 'asc', header.value === innerPagination.sortBy ? 'active' : '']" @click="changeSort(header.value)" v-tab-control style="margin: 5px 5px 0 5px">
						<v-layout sm3 shrink
						class="hoverPreview grey darken-2 white--text"
						@click="onItemClick(props)">
						<div style="margin: auto">
							{{ getHeaderText(header)}}
							<v-icon small v-if="header.value === innerPagination.sortBy" :style="'transform: rotate(' + (innerPagination.descending?'0deg':'180deg') + ')'">arrow_upward</v-icon>
						</div>
					</v-layout>
				</div>
			</template>
		</v-flex>
	</template>

	<template slot="items" slot-scope="props" v-if="!(loading || innerLoading)">
		<tr  v-if="displayMode.asList"
		:active="props.selected"
		@touchstart="onItemTouchStart(props, $event)"
		@touchend="onItemTouchEnd"
		@click="onItemClick(props)"
		@contextmenu.prevent="onItemContextmenu(props, $event)"
		:data-filename="(props.item.isDirectory ? '*' : '') + props.item.name"
		draggable="true"
		@dragstart="onItemDragStart(props.item, $event)"
		@dragover="onItemDragOver(props.item, $event)"
		@drop.prevent="onItemDragDrop(props.item, $event)"
		v-tab-control.contextmenu @keydown.space="props.selected = !props.selected">
		<td class="pr-0">
			<v-checkbox :input-value="props.selected" @touchstart.stop="" @touchend.stop="" @click.stop.prevent="props.selected = !props.selected" primary hide-details></v-checkbox>
		</td>
		<template v-for="header in headers">
			<td v-if="header.value === 'name'" :key="header.value">
				<v-layout row align-center @click.prevent="">
					<div v-if="props.item.ico !== undefined" style="height: 30px;"  @click.prevent="" @contextmenu.prevent="">
						<object :data="props.item.ico" class="img_gcode" style="width: 30px; height: 30px">
							<img :src="'/img/ressources/' + (props.item.isDirectory ? 'folder.png' : 'file.png')" :style="props.item.isDirectory?'width: 30px; height: 30px;':'height: 30px;'"/>
						</object>
					</div>
					<v-icon class="mr-1" v-else>{{ props.item.isDirectory ? 'folder' : 'assignment' }}</v-icon>
					<div style="text-overflow: ellipsis;overflow: hidden;" :style="{'max-width': $route.path=='/Files/Jobs'? '150px': ''}">
						{{
							((/\.([a-zA-Z])+$/).test(props.item.name) &&
							!props.item.name.toLowerCase().endsWith(".bak")) &&
							innerFilelist.every((item) => {
								let itemName = item.name
								let itemExt = ""
								let fileName = props.item.name
								let fileExt = ""
								if ((/\.([a-zA-Z])+$/).test(itemName)) {
									itemExt = itemName.substr(itemName.lastIndexOf('.'))
									itemName = itemName.substr(0, itemName.lastIndexOf('.'))
								}
								if ((/\.([a-zA-Z])+$/).test(fileName)) {
									fileExt = fileName.substr(fileName.lastIndexOf('.'))
									fileName = fileName.substr(0, fileName.lastIndexOf('.'))
								}
								return (itemName != fileName || (itemName == fileName && itemExt == fileExt))
							})
							? props.item.name.substring(0, props.item.name.lastIndexOf('.')): props.item.name }}
						</div>
					</v-layout>
				</td>
				<td v-else-if="header.unit === 'bytes' && ($vuetify.breakpoint.mdAndUp || !isLocal)" :key="header.value">
					{{ (props.item[header.value] !== null) ? $displaySize(props.item[header.value]) : '' }}
				</td>
				<td v-else-if="header.unit === 'date' " :key="header.value">
					{{ props.item.lastModified ? props.item.lastModified.toLocaleString() : $t('generic.noValue') }}
				</td>
				<td v-else-if="header.unit === 'filaments' && !isLocal" :key="header.value">
					<v-tooltip bottom :disabled="!props.item[header.value] || props.item[header.value].length <= 1">
						<span slot="activator">
							{{ displayLoadingValue(props.item, header.value, 1, 'mm') }}
						</span>

						<span>
							{{ $display(props.item[header.value], 1, 'mm') }}
						</span>
					</v-tooltip>
				</td>
				<td v-else-if="header.unit === 'time' && ((header.value === 'printTime' && $vuetify.breakpoint.mdAndUp) || $vuetify.breakpoint.lgAndUp || !isLocal)" :key="header.value">
					{{ displayTimeValue(props.item, header.value) }}
				</td>
				<td v-else-if="!isLocal" :key="header.value">
					{{ displayLoadingValue(props.item, header.value, header.precision, header.unit) }}
				</td>
			</template>
		</tr>
		<!--v-layout row wrap md12 v-if="displayMode.asMini"-->
		<v-flex shrink md3 v-if="displayMode.asMini" class="isLocal">
			<div
			v-tab-control.contextmenu.dblclick
			:active="props.selected"
			:data-filename="(props.item.isDirectory ? '*' : '') + props.item.name" draggable="true"
			@click="onItemClick(props)"
			@dblclick="onItemClick(props)"
			@contextmenu.prevent="onItemContextmenu(props, $event)"
			@keydown.space="props.selected = !props.selected"
			@dragstart="onItemDragStart(props.item, $event)"
			@dragover="onItemDragOver(props.item, $event)"
			@drop.prevent="onItemDragDrop(props.item, $event)"
			style="margin:5px" >
			<v-layout sm4 shrink :class="(props.item.isDirectory ? 'grey darken-2 white--text' : 'grey darken-2 white--text')">
				<v-layout column align-center>
					<div style="height: 150px; margin-bottom: 10px;">
						<object :data="props.item.ico" class="img_gcode_miniature" style="margin: 10px 0px;border-radius: 10px; width: 150px; height: 150px">
							<img :src="'/img/ressources/'+(props.item.isDirectory?'folder.png':'file.png')" :style="props.item.isDirectory?'width: 150px; height: 150px; margin-top: 9%; margin-bottom: 8%;':'height: 120px; margin-top: 22%; margin-bottom: 20%; margin-left: 0%;'"/>
						</object>
					</div>
					<div style=" width: 150px; text-align: center; text-overflow: ellipsis; overflow: hidden;">
						{{ /*(col*rows.length+row) + ': ' +*/
						(/\.([a-zA-Z])+$/).test(props.item.name) && innerFilelist.every((item) => {
							let itemName = item.name
							let itemExt = ""
							let fileName = props.item.name
							let fileExt = ""
							if ((/\.([a-zA-Z])+$/).test(itemName)) {
								itemExt = itemName.substr(itemName.lastIndexOf('.'))
								itemName = itemName.substr(0, itemName.lastIndexOf('.'))
							}
							if ((/\.([a-zA-Z])+$/).test(fileName)) {
								fileExt = fileName.substr(fileName.lastIndexOf('.'))
								fileName = fileName.substr(0, fileName.lastIndexOf('.'))
							}
							return (itemName != fileName || (itemName == fileName && itemExt == fileExt))
						}) ? props.item.name.substring(0, props.item.name.lastIndexOf('.')): props.item.name }}
					</div>
				</v-layout>
			</v-layout>
		</div>
	</v-flex>
	<!--/v-layout-->
</template>
</v-data-table>
<v-menu v-model="contextMenu.shown" :position-x="contextMenu.x" :position-y="contextMenu.y" absolute offset-y>
	<v-list>
		<slot name="context-menu"></slot>

		<v-list-tile v-show="!noDownload && innerValue.length === 1 && filesSelected && !isLocal" @click="download">
			<v-icon class="mr-1">cloud_download</v-icon> {{ $tc('list.baseFileList.download', innerValue.length) }}
		</v-list-tile>
		<v-list-tile v-show="!noEdit && innerValue.length === 1 && filesSelected && !isLocal" :disabled="!canEditFile" @click="edit(innerValue[0])">
			<v-icon class="mr-1">edit</v-icon> {{ $t('list.baseFileList.edit') }}
		</v-list-tile>
		<v-list-tile v-show="!noRename && innerValue.length === 1 && !isLocal" @click="rename">
			<v-icon class="mr-1">short_text</v-icon> {{ $t('list.baseFileList.rename') }}
		</v-list-tile>
		<v-list-tile v-show="!noDelete" @click="confirmDelete(innerValue)">
			<v-icon class="mr-1">delete</v-icon> {{ $t('list.baseFileList.delete') }}
		</v-list-tile>
		<v-list-tile v-show="!foldersSelected && innerValue.length > 1 && !isLocal" @click="downloadZIP">
			<v-icon class="mr-1">archive</v-icon> {{ $t('list.baseFileList.downloadZIP') }}
		</v-list-tile>
	</v-list>
</v-menu>

<file-edit-dialog :shown.sync="editDialog.shown" :filename="editDialog.filename" v-model="editDialog.content" @editComplete="$emit('fileEdited', $event)"></file-edit-dialog>
<input-dialog :shown.sync="renameDialog.shown" :title="$t('dialog.renameFile.title')" :prompt="$t('dialog.renameFile.prompt')" :preset="renameDialog.item && renameDialog.item.name" @confirmed="renameCallback" :files="innerFilelist"></input-dialog>
<input-dialog :shown.sync="moveDialog.shown" :title="$t('dialog.moveFile.title')" :prompt="$t('dialog.moveFile.prompt')" :preset="moveDialog.item && moveDialog.item.name" @confirmed="moveCallback" :files="moveDialog.files"></input-dialog>
<confirm-dialog :shown.sync="deleteDialog.shown" :question="deleteDialog.question" :prompt="deleteDialog.prompt" @confirmed="remove" :item="deleteDialog.item"></confirm-dialog>
</div>
</template>

<script>
'use strict'

import JSZip from 'jszip'
import saveAs from 'file-saver'
import VDataTable from 'vuetify/es5/components/VDataTable'

import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'

import i18n from '../../i18n'
import { defaultMachine, getModifiedDirectories } from '../../store/machine'
import { DisconnectedError, OperationCancelledError } from '../../utils/errors.js'
import Path from '../../utils/path.js'

const bigFileThreshold = 1048576;		// 1 MiB
const maxEditFileSize = 15728640;		// 15 MiB

export default {
	props: {
		headers: {
			type: Array,
			default: () => [
				{
					text: () => i18n.t('list.baseFileList.fileName'),
					value: 'name'
				},
				{
					text: () => i18n.t('list.baseFileList.size'),
					value: 'size',
					unit: 'bytes'
				},
				{
					text: () => i18n.t('list.baseFileList.lastModified'),
					value: 'lastModified',
					unit: 'date'
				}
			]
		},
		items: {
			default: () => [],
			required: false
		},
		sortBy: {
			type: String,
			default: 'name'
		},
		descending: {
			type: Boolean,
			default: false
		},
		sortTable: String,
		directory: {
			type: String,
			required: true
		},
		filelist: Array,
		value: Array,
		fileIcon: {
			type: String,
			default: 'mdi-file'
		},
		folderIcon: {
			type: String,
			default: 'mdi-folder'
		},
		loading: Boolean,
		doingFileOperation: Boolean,
		noDragDrop: Boolean,
		noDownload: Boolean,
		noEdit: Boolean,
		noFilesText:
		{
			type: String,
			default: ''
		},
		noRename: Boolean,
		noDelete: Boolean
	},
	computed: {
		...mapState(['selectedMachine']),
		...mapGetters(['isConnected', 'getTool']),
		...mapState('machine', ['isReconnecting']),
		...mapState('machine/cache', ['sorting']),
		...mapState('machine/model', ['storages']),
		...mapState({isLocal: state => state.isLocal,}),
		defaultHeaders() {
			return [
				{
					text: i18n.t('list.baseFileList.fileName'),
					value: 'name'
				},
				{
					text: i18n.t('list.baseFileList.size'),
					value: 'size',
					unit: 'bytes'
				},
				{
					text: i18n.t('list.baseFileList.lastModified'),
					value: 'lastModified',
					unit: 'date'
				}
			];
		},
		isLoading() {
			return this.loading || this.innerLoading || this.doingFileOperation || this.innerDoingFileOperation;
		},
		storageIndex() {
			const matches = /^(\d+)/.exec(this.innerDirectory);
			if (matches) {
				return parseInt(matches[1]);
			}
			return 0;
		},
		foldersSelected() {
			return this.innerValue.some(item => item.isDirectory)
		},
		filesSelected() {
			return this.innerValue.some(item => !item.isDirectory)
		},
		canEditFile() {
			return (this.innerValue.length > 0) && (this.innerValue[0].size < maxEditFileSize);
		},
		noItemsText() {
			if (this.selectedMachine === defaultMachine) {
				return this.noFilesText;
			}
			return (this.storages.length > this.storageIndex && this.storages[this.storageIndex].mounted) ? this.noFilesText : 'list.baseFileList.driveUnmounted';
		},
		internalSortBy: {
			get() { return this.sorting[this.sortTable].column; },
			set(value) {
				this.setSorting({ table: this.sortTable, column: value, descending: this.internalSortDesc });
			}
		},
		internalSortDesc: {
			get() { return this.sorting[this.sortTable].descending; },
			set(value) {
				this.setSorting({ table: this.sortTable, column: this.internalSortBy, descending: value });
			}
		}
	},
	data() {
		return {
			unsubscribe: undefined,
			wasMounted: false,
			initialDirectory: this.directory,
			innerDirectory: this.directory,
			innerFilelist: [],
			innerLoading: false,
			innerDoingFileOperation: false,
			innerPagination: {
				sortBy: this.sortBy,
				descending: this.descending,
				rowsPerPage: 18
			},
			innerValue: [],
			prevSelection: [],
			contextMenu: {
				shown: false,
				touchTimer: undefined,
				items: [],
				x: 0,
				y: 0
			},
			editDialog: {
				shown: false,
				filename: '',
				content: ''
			},
			renameDialog: {
				shown: false,
				directory: '',
				item: null
			},
			moveDialog: {
				shown: false,
				directory: '',
				item: null,
				files: []
			},
			deleteDialog: {
				question: '',
				prompt: '',
				item: undefined,
				shown: false
			},
			displayMode:{
				asList: false,
				asMini: false,
			},
			cols: [],
			rows:[],
		}
	},
	extends: VDataTable,
	methods: {
		...mapActions('machine', {
			machineDownload: 'download',
			machineMove: 'move',
			machineDelete: 'delete',
			getFileList: 'getFileList'
		}),
		...mapMutations('machine/cache', ['setSorting']),
		getHeaderText: (header) => (header.text instanceof(Function)) ? header.text() : header.text,
		toggleAll() {
			this.innerValue = this.innerValue.length ? [] : this.innerFilelist.slice();
		},
		changeSort(column) {
			if (this.innerPagination.sortBy === column) {
				this.innerPagination.descending = !this.innerPagination.descending;
			} else {
				this.innerPagination.sortBy = column;
				this.innerPagination.descending = true;
			}

			this.$emit('update:sortBy', this.innerPagination.sortBy);
			this.$emit('update:descending', this.innerPagination.descending);
			this.$nextTick(function() {
				this.$emit('changedSort');
			});
		},
		sort(items, index, isDescending) {
			// Sort by index
			items.sort(function(a, b) {
				if (a[index] === b[index]) {
					return 0;
				}
				if (a[index] === null || a[index] === undefined) {
					return -1;
				}
				if (b[index] === null || b[index] === undefined) {
					return 1;
				}
				if (a[index].constructor === String && b[index].constructor === String) {
					return a[index].localeCompare(b[index], undefined, { sensivity: 'base' });
				}
				if (a[index] instanceof Array && b[index] instanceof Array) {
					const reducedA = a[index].length ? a.filament.reduce((a, b) => a + b) : 0;
					const reducedB = b[index].length ? b.filament.reduce((a, b) => a + b) : 0;
					return reducedA - reducedB;
				}
				return a[index] - b[index];
			});

			// Deal with descending order
			if (isDescending) {
				items.reverse();
			}

			// Then make sure directories come first
			items.sort((a, b) => (a.isDirectory === b.isDirectory) ? 0 : (a.isDirectory ? -1 : 1));
			return items;
		},
		async refresh() {
			await this.loadDirectory(this.innerDirectory);
			await this.computeRowsCols();
			//this.$emit('update:filelist', to);
		},
		async loadDirectory(directory) {
			if (!this.isConnected || this.innerLoading || !directory) {
				return;
			}

			if (this.storageIndex >= this.storages.length || !this.storages[this.storageIndex].mounted) {
				this.innerDirectory = (this.storageIndex === 0) ? this.initialDirectory : `${this.storageIndex}:`;
				this.innerFilelist = [];
				return;
			}

			this.innerLoading = true;
			let len = 0
			let tool
			try {
				// Load file list and create missing props
				let files = await this.getFileList(directory);
				tool = this.getTool.substring(0,5);
				if (this.getTool.substr(0,3).toUpperCase() == "CAL") {
					tool = this.getTool.substr(0,3)
				}
				//console.log(tool)
				//console.log(this.innerDirectory + " => " + directory)
				if (directory.split('/').length >= this.innerDirectory.split('/').length) {
					len = files.filter(item => item.name.startsWith(tool) && !item.directory.includes(tool)).length
					if(len > 0) {
						files = files.filter(item => item.name.startsWith(tool) && !item.directory.includes(tool))
					} else {
						tool = this.getTool.substring(0,3);
						len = files.filter(item => item.name.startsWith(tool) && !item.directory.includes(tool)).length
						if(len > 0) {
							files = files.filter(item => item.name.startsWith(tool) && !item.directory.includes(tool))
						}
					}
				}
				files.forEach(function(item) {
					this.headers.forEach(function(header) {
						if (!item.hasOwnProperty(header.value)) {
							item[header.value] = undefined;
						}
					});
				}, this);

				this.innerDirectory = directory;
				this.innerFilelist = files;
				this.innerValue = [];

				this.$nextTick(function() {
					console.log('emitting \'directoryLoaded\'')
					this.$emit('directoryLoaded', directory);
				});
				await this.computeRowsCols();
			} catch (e) {
				if (!(e instanceof DisconnectedError)) {
					console.warn(e);
					this.$makeNotification('error', this.$t('error.filelistRequestFailed'), e.message);
				}
			}
			this.innerLoading = false;

			//console.log(this.innerFilelist);
			if( len == 1 && this.innerFilelist[0].isDirectory && this.innerFilelist[0].name.startsWith(tool) && !this.innerFilelist[0].directory.includes(tool)) {
				//console.log(this.innerFilelist[0].directory + "/" + this.innerFilelist[0].name);
				await this.loadDirectory(this.innerFilelist[0].directory + "/" + this.innerFilelist[0].name)
			}
		},
		displayLoadingValue(item, prop, precision, unit = '') {
			if (item.isDirectory) {
				return '';
			}
			if (!item[prop]) {
				return this.$t((item[prop] === undefined) ? 'generic.loading' : 'generic.noValue');
			}

			let displayValue;
			if (item[prop] instanceof Array) {
				if (!item[prop].length) {
					return this.$t('generic.noValue');
				}
				displayValue = item[prop].reduce((a, b) => a + b);
			} else {
				displayValue = item[prop];
			}

			if (precision !== undefined) {
				displayValue = displayValue.toFixed(precision);
			}
			return `${displayValue} ${unit}`;
		},
		displayTimeValue(item, prop) {
			if (item.isDirectory) {
				return '';
			}
			return (item[prop] !== null) ? this.$displayTime(item[prop]) : this.$t('generic.noValue');
		},
		onItemTouchStart(props, e) {
			const that = this;
			this.contextMenu.touchTimer = setTimeout(function() {
				that.contextMenu.touchTimer = undefined;
				that.onItemContextmenu(props, { clientX: e.targetTouches[0].clientX, clientY: e.targetTouches[0].clientY });
			}, 1000);
		},
		onItemTouchEnd() {
			if (this.contextMenu.touchTimer) {
				clearTimeout(this.contextMenu.touchTimer);
				this.contextMenu.touchTimer = undefined;
			}
		},
		onItemClick(props) {
			if (props.item.isDirectory) {
				this.loadDirectory(Path.combine(this.innerDirectory, props.item.name));
				this.computeRowsCols();
			} else {
				this.$emit('fileClicked', props.item);
			}
		},
		onItemContextmenu(props, e) {

			this.onItemTouchEnd();

			// Deal with selection
			if (!props.selected) {
				props.selected = true;
			}

			if (this.innerValue.length > 1 && (this.displayMode.asMini || (this.isLocal && !this.displayMode.asList))){
				//console.log(this.innerValue);
				this.innerValue.shift();
			}

			// Open the context menu
			this.contextMenu.shown = false;
			this.contextMenu.x = e.clientX;
			this.contextMenu.y = e.clientY;
			this.$nextTick(() => {
				this.contextMenu.shown = true;
			});
		},
		onItemDragStart(item, e) {
			if (this.noDragDrop) {
				return;
			}

			const itemsToDrag = this.innerValue;
			if (itemsToDrag.indexOf(item) === -1) {
				itemsToDrag.push(item);
			}
			e.dataTransfer.setData('application/json', JSON.stringify({
				type: 'dwcFiles',
				directory: this.innerDirectory,
				items: itemsToDrag
			}));
			e.dataTransfer.effectAllowed = 'move';

			const table = this.$el.querySelector('table'), firstRow = table.tBodies[0].rows[0];
			const tableClone = table.cloneNode(true), itemFilename = (item.isDirectory ? '*' : '') + item.name;
			let offsetY = 0, countingOffset = true;

			tableClone.tHead.remove();
			Array.from(tableClone.tBodies[0].rows).forEach(function(row) {
				const filename = row.dataset.filename;
				if (itemsToDrag.some(item => (item.isDirectory ? '*' : '') + item.name === filename)) {
					Array.from(row.children).forEach((td, index) => td.style.width = `${firstRow.children[index].offsetWidth}px`);
					if (countingOffset) {
						if (filename === itemFilename) {
							countingOffset = false;
						} else {
							offsetY += firstRow.offsetHeight;
						}
					}
				} else {
					row.remove();
				}
			}, this);
			tableClone.style.opacity = 0.5;
			tableClone.style.position = 'absolute';
			tableClone.style.pointerEvents = 'none';
			if(this.asMini)
			table.parentNode.append(tableClone);

			const x = e.clientX - table.getClientRects()[0].left;
			const y = e.clientY - e.target.closest('tr').getClientRects()[0].top + offsetY;
			e.dataTransfer.setDragImage(tableClone, x, y);

			setTimeout(() => tableClone.remove(), 0);
		},
		onItemDragOver(item, e) {
			if (!this.noDragDrop && item.isDirectory) {
				const jsonData = e.dataTransfer.getData('application/json');
				if (jsonData) {
					const data = JSON.parse(jsonData);
					if (data.type === 'dwcFiles' && !data.items.some(dataItem => dataItem.isDirectory && dataItem.name === item.name)) {
						e.preventDefault();
						e.stopPropagation();
					}
				} else {
					// Fix for Chrome: It does not grant access to dataTransfer on the same domain "for security reasons"...
					e.preventDefault();
					e.stopPropagation();
				}
			}
		},
		async onItemDragDrop(item, e) {
			const jsonData = e.dataTransfer.getData('application/json');
			if (jsonData) {
				const data = JSON.parse(jsonData);
				if (data.type === 'dwcFiles' && !data.items.some(dataItem => dataItem.isDirectory && dataItem.name === item.name)) {
					const directory = this.innerDirectory;
					const folder = await this.getFileList(Path.combine(directory, item.name));
					let i = 0;
					this.moveDialog.directory = [directory, Path.combine(directory, item.name)];
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
				await this.machineMove({ from, to, force: true});
			} catch (e) {
				this.$makeNotification('error', `Failed to move ${from} to ${to}`, e.message);
			}
		},
		async download(item) {
			try {
				const filename = (item && item.name) ? item.name : this.innerValue[0].name;
				const blob = await this.machineDownload({ filename: Path.combine(this.innerDirectory, filename), type: 'blob' });
				saveAs(blob, filename);
			} catch (e) {
				if (!(e instanceof DisconnectedError) && !(e instanceof OperationCancelledError)) {
					// should be handled before we get here
					console.warn(e);
				}
			}
		},
		async edit(item) {
			try {
				let notification, showDelay = 0;
				if (item.size > bigFileThreshold) {
					notification = this.$makeNotification('warning', this.$t('notification.loadingFile.title'), this.$t('notification.loadingFile.message'), false);
					showDelay = 1000;
				}

				const filename = Path.combine(this.innerDirectory, item.name);
				const response = await this.machineDownload({ filename, type: 'text', showSuccess: false });
				const editDialog = this.editDialog;
				setTimeout(function() {
					editDialog.filename = filename;
					editDialog.content = response;
					editDialog.shown = true;

					if (notification) {
						setTimeout(notification.hide, 1000);
					}
				}, showDelay);
			} catch (e) {
				if (!(e instanceof DisconnectedError) && !(e instanceof OperationCancelledError)) {
					// should be handled before we get here
					console.warn(e);
				}
			}
		},
		async rename(item) {
			this.renameDialog.directory = this.innerDirectory;
			this.renameDialog.item = (item && item.name) ? item : this.innerValue[0];
			this.renameDialog.shown = true;
		},
		async renameCallback(newFilename) {
			const oldFilename = this.renameDialog.item.name;
			if (this.innerDoingFileOperation) {
				return;
			}

			this.innerDoingFileOperation = true;
			try {
				await this.machineMove({
					from: Path.combine(this.renameDialog.directory, oldFilename),
					to: Path.combine(this.renameDialog.directory, newFilename)
				});

				this.innerFilelist.some(function(file) {
					if (file.isDirectory === this.isDirectory && file.name === this.name) {
						file.name = newFilename;
						return true;
					}
					return false;
				}, this.renameDialog.item);

				this.$makeNotification('success', this.$t('notification.rename.success', [oldFilename, newFilename]));
			} catch (e) {
				console.warn(e);
				this.$log('error', this.$t('notification.rename.error'), e.message);
			}
			this.innerDoingFileOperation = false;
		},
		async remove(items, directory) {
			if (!items || !(items instanceof Array)) {
				items = this.innerValue.slice();
			}

			if (this.innerDoingFileOperation && !directory) {
				return;
			}
			this.innerDoingFileOperation = true;
			const deletedItems = [];
			if (!directory) {
				directory = this.directory;
			}
			let notif
			for (let i = 0; i < items.length; i++) {
				try {
					const item = items[i];
					if (item.isDirectory) {
						let fileList = await this.getFileList(Path.combine(directory, item.name))
						await this.remove(fileList, directory + '/' + item.name)
						if (notif) {
							notif.domElement.firstChild.childNodes[1].firstChild.innerHTML = 'deleting ' + item.name
						} else {
							notif = this.$makeNotification('info','deleting ' + item.name , '', 10000)
						}
						await this.machineDelete(Path.combine(directory, item.name));

						deletedItems.push(items[i]);

						this.innerFilelist = this.innerFilelist.filter(file => file.isDirectory !== item.isDirectory || file.name !== item.name);
						this.innerValue = this.innerValue.filter(file => file.isDirectory !== item.isDirectory || file.name !== item.name);
					} else {
						if (notif) {
							notif.domElement.firstChild.childNodes[1].firstChild.innerHTML = 'deleting ' + item.name
						} else {
							notif = this.$makeNotification('info','deleting ' + item.name , '', 10000)
						}
						await this.machineDelete(Path.combine(directory, item.name));
						deletedItems.push(items[i]);
						this.innerFilelist = this.innerFilelist.filter(file => file.isDirectory !== item.isDirectory || file.name !== item.name);
						this.innerValue = this.innerValue.filter(file => file.isDirectory !== item.isDirectory || file.name !== item.name);
					}
				} catch (e) {
					this.$makeNotification('error', this.$t('notification.delete.errorTitle', [items[i].name]), items[i].isDirectory ? this.$t('notification.delete.errorMessageDirectory') : e.message);
				}
			}
			if (notif && directory == this.directory) {
				notif.hide()
			}
			if (deletedItems.length) {
				this.$log('success', (deletedItems.length > 1) ? this.$t('notification.delete.successMultiple', [deletedItems.length]) : this.$t('notification.delete.success', [deletedItems[0].name]));
			}
			this.innerDoingFileOperation = false;
		},
		async downloadZIP(items) {
			if (!items || !(items instanceof Array)) { items = this.innerValue.slice(); }
			const directory = this.directory;

			// Download files
			const zip = new JSZip();
			for (let i = 0; i < items.length; i++) {
				try {
					const blob = await this.machineDownload({ filename: Path.combine(directory, items[i].name), type: 'blob', num: i + 1, count: items.length });
					zip.file(items[i].name, blob);
				} catch (e) {
					if (!(e instanceof DisconnectedError) && !(e instanceof OperationCancelledError)) {
						// should be handled before we get here
						console.warn(e);
					}
					return;
				}
			}

			// Compress files and save the new archive
			const notification = this.$makeNotification('info', this.$t('notification.compress.title'), this.$t('notification.compress.message'));
			try {
				const zipBlob = await zip.generateAsync({ type: 'blob' });
				saveAs(zipBlob, 'download.zip');
			} catch (e) {
				console.warn(e);
				this.$makeNotification('error', this.$t('notification.compress.errorTitle'), e.message);
			}
			notification.hide();
		},
		async computeRowsCols(items){
			this.rows = [];
			this.cols = [];
			if (!items)
			items = this.innerFilelist;
			if (items)
			{
				var i = 0;
				if(this.displayMode.asList){
					//console.log('asList');
					for(i = 0; i < items.length; i++)
					this.rows.push(i);
					this.cols.push(0);
				} else if(this.displayMode.asMini){
					//console.log('asMini');
					//console.log(Math.floor(window.innerWidth/200))
					var rowLength = Math.ceil(items.length/8);
					var colLength = Math.min(items.length/rowLength, Math.floor(window.innerWidth/200));
					rowLength = Math.ceil(items.length/colLength)
					for(i = 0; i < rowLength; i++)
					{
						this.rows.push(i);
					}
					for(i = 0; i < colLength; i++ )
					{
						this.cols.push(i);
					}
					items.sort(function(a, b){
						if (a.isDirectory && !b.isDirectory)
						return -1;
						if (!a.isDirectory && b.isDirectory)
						return 1;
						if(a.name < b.name)
						return -1;
						if(a.name > b.name)
						return 1;
						return 0;
					})
					//console.log(items)
				}
			}
			//console.log("Rows: ")
			//console.log(this.rows);
			//console.log("Cols: ")
			//console.log(this.cols);
		},
		async updateDis(type){
			for(let dis in this.displayMode)
			this.displayMode[dis] = false;
			switch(type)
			{
				case 'l':
				this.displayMode.asList=true;
				break;
				case 'm':
				this.displayMode.asMini=true;
				break;
				default:
			}
			await this.computeRowsCols();
			//this.loadDirectory(this.innerDirectory);
		},
		async confirmDelete(items) {
			this.deleteDialog.question = i18n.t('dialog.delete.title', [(items.length==1?items[0].name:i18n.t('dialog.delete.multiple', [items.length]))]);
			this.deleteDialog.prompt = i18n.t('dialog.delete.prompt');
			items.sort((a, b) => { if (a.name < b.name) return -1; if (a.name > b.name) return 1; return 0}).forEach(item => this.deleteDialog.prompt += "<li><div style=\"text-overflow: ellipsis;overflow: hidden;max-width: 420px;width: max-content;\">" + item.name + "</div></li>");
			this.deleteDialog.prompt += "</ul>";
			this.deleteDialog.shown = true;
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
		async handlePaste(e) {
			console.log(e)
		}
	},
	mounted() {
		//console.log("mounted")
		this.displayMode.asList = !this.isLocal;
		this.displayMode.asMini = this.isLocal;
		// Perform initial load
		if (this.isConnected) {
			this.wasMounted = (this.storages.length > this.storageIndex) && this.storages[this.storageIndex].mounted;
			//console.log(this.$route);
			if (this.$route.query.path){
				//console.log(this.$route.query);
				//console.log(this.innerDirectory);
				this.innerDirectory = this.$route.query.path;
			}
			this.loadDirectory(this.innerDirectory);
		}

		// Keep track of file changes
		const that = this;
		this.unsubscribe = this.$store.subscribeAction(async function(action, state) {
			if (!that.doingFileOperation && !that.innerDoingFileOperation) {
				const modifiedDirectories = getModifiedDirectories(action, state);
				if (Path.pathAffectsFilelist(modifiedDirectories, that.innerDirectory, that.innerFilelist)) {
					// Refresh when an external operation has caused a change
					await that.refresh();
				}
			}
		});

		// Get sorting from cache
		if (this.sortTable) {
			const column = this.sorting[this.sortTable].column;
			const descending = this.sorting[this.sortTable].descending;
			if (column !== this.innerPagination.sortBy || descending !== this.innerPagination.descending) {
				this.innerPagination.sortBy = column;
				this.innerPagination.descending = descending;
			}
		}
	},
	beforeDestroy() {
		this.unsubscribe();
	},
	watch: {
		isConnected(to) {
			if (to) {
				this.refresh();
			} else {
				this.innerDirectory = this.initialDirectory;
				this.innerFilelist = [];

				this.editDialog.shown = false;
				this.renameDialog.shown = false;
			}
		},
		selectedMachine() {
			// TODO store current directory per selected machine
			this.innerDirectory = this.initialDirectory;
			this.innerFilelist = [];

			this.editDialog.shown = false;
			this.renameDialog.shown = false;
		},
		storages: {
			deep: true,
			handler() {
				// Refresh file list when the selected storage is mounted or unmounted
				if (this.storages.length <= this.storageIndex || this.wasMounted !== this.storages[this.storageIndex].mounted) {
					this.loadDirectory(this.wasMounted ? this.initialDirectory : this.innerDirectory);
					this.wasMounted = (this.storages.length > this.storageIndex) && this.storages[this.storageIndex].mounted;
				}
			}
		},
		directory(to) {
			if (to !== this.innerDirectory) {
				this.loadDirectory(to);
			}
		},
		innerDirectory(to) {
			if (this.directory !== to) {
				this.$emit('update:directory', to);
			}
		},
		innerFilelist(to) {
			if (this.filelist !== to) {
				this.$emit('update:filelist', to);
				console.log('here?')
			}
		},
		filelist(to) {
			console.log(to)
			if (this.innerFilelist !== to && this.innerFilelist != [] && to != []) {
				this.innerFilelist = to
			}
			else if (this.innerFilelist == [] || to == [])
			{
				this.$emit('update:filelist', to);
			}
		},
		innerLoading(to) {
			if (this.loading !== to) {
				this.$emit('update:loading', to);
			}
		},
		innerValue(to) {
			if (this.value !== to) {
				this.$emit('input', to);
			}
		},
		innerPagination: {
			deep: true,
			handler(to) {
				if (this.sortTable && (this.sorting[this.sortTable].column !== to.sortBy || this.sorting[this.sortTable].descending !== to.descending)) {
					this.setSorting({ table: this.sortTable, column: to.sortBy, descending: to.descending });
				}
			}
		},
		sorting: {
			deep: true,
			handler(to) {
				const column = to[this.sortTable].column;
				const descending = to[this.sortTable].descending;
				if (column !== this.innerPagination.sortBy || descending !== this.innerPagination.descending) {
					this.innerPagination.sortBy = column;
					this.innerPagination.descending = descending;
				}
			}
		},
	}
}
</script>
