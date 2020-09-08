<template>
	<!--@click:prepend=""-->
	<v-text-field label="Search" prepend-icon="search" :value="search" clearable @change="updateList">
		<template v-slot:append-outer>
			<v-menu style="top: -12px" offset-y>
				<template v-slot:activator="{ on, attrs }">
					<v-btn v-bind="attrs" v-on="on">
						<v-icon left>mdi-menu</v-icon>
						Menu
					</v-btn>
				</template>
				<v-card>
					<v-card-text class="pa-6">
						<!-- @click=""-->
						<v-btn large flat color="primary"><v-icon left>mdi-target</v-icon>Click me</v-btn>
						{{
							filteredFiles ? filteredFiles.map(file => file.name) : ''
						}}
					</v-card-text>
				</v-card>
			</v-menu>
		</template>
	</v-text-field>
</template>

<script>
'use strict'

import { mapActions } from 'vuex'

//import i18n from '../../i18n'
import { DisconnectedError } from '../../utils/errors.js'
import Path from '../../utils/path.js'
export default {
	props: {
		path: {
			type: String
		}
	},
	data() {
		return {
			search: "",
			files: [],
			filteredFiles: []
		}
	},
	methods: {
		...mapActions('machine', ['getFileList', 'getFileInfo']),
		async loadDirectory(directory) {
			// Load file list and create missing props
			this.files = await this.getFileList({ dir: directory, recursive: true });
			for (let fileIndex = 0; fileIndex < this.files.length; fileIndex++) {
				let file = this.files[fileIndex]
				//let height = null, layerHeight = null, filament = [], generatedBy = null, printTime = null, simulatedTime = null;

				//console.log(file, fileIndex)

				this.fileinfoProgress = fileIndex;
				try {
					// Request file info
					if (!file.isDirectory) {
						const fileInfo = await this.getFileInfo(Path.combine(file.directory, file.name));

						// Set file info
						//console.log(this.files[fileIndex], fileInfo)
						this.files[fileIndex].height = fileInfo.height;
						this.files[fileIndex].layerHeight = fileInfo.layerHeight;
						this.files[fileIndex].filament = fileInfo.filament;
						this.files[fileIndex].generatedBy = fileInfo.generatedBy;
						this.files[fileIndex].printTime = fileInfo.printTime;
						this.files[fileIndex].simulatedTime = fileInfo.simulatedTime;
						this.files[fileIndex].dir = file.directory;
						if ( this.files[fileIndex].name.substring(this.files[fileIndex].name.lastIndexOf("/")+1,this.files[fileIndex].name.lastIndexOf(".")).length > 0){
							var dir = this.files[fileIndex].name.substring(this.files[fileIndex].name.lastIndexOf("/")+1,this.files[fileIndex].name.lastIndexOf("."));
							//console.log(this.filteredList[fileIndex].dir);
							//this.filteredList[fileIndex].name =  dir;
							while(dir.includes(" "))
							dir = dir.replace(/ /g, "_");
							this.files[fileIndex].ico = /*"http://" + this.selectedMachine +*/ "/img/GCodePreview/"+file.directory.substring(10).replace(/ /g, "_") + "/" + dir + "/" + dir + "_ico.jpg";//fileIco;
						}
					}
				} catch (e) {
					if (e instanceof DisconnectedError) {
						this.fileinfoProgress = -1;
						this.fileinfoDirectory = undefined;
						return;
					}

					console.warn(e);
					this.$log('error', this.$t('error.fileinfoRequestFailed', [file.name]), e.message);
				}

			}
		},
		async updateList(e) {
			console.log(e)

			this.filteredFiles = []
			this.files = await this.getFileList({ dir: this.path, recursive: true });
			for (let fileIndex = 0; fileIndex < this.files.length; fileIndex++) {
				let file = this.files[fileIndex]
				//let height = null, layerHeight = null, filament = [], generatedBy = null, printTime = null, simulatedTime = null;

				//console.log(file, fileIndex)

				this.fileinfoProgress = fileIndex;
				try {
					// Request file info
					if (!file.isDirectory) {
						const fileInfo = await this.getFileInfo(Path.combine(file.directory, file.name));

						// Set file info
						//console.log(this.files[fileIndex], fileInfo)
						this.files[fileIndex].height = fileInfo.height;
						this.files[fileIndex].layerHeight = fileInfo.layerHeight;
						this.files[fileIndex].filament = fileInfo.filament;
						this.files[fileIndex].generatedBy = fileInfo.generatedBy;
						this.files[fileIndex].printTime = fileInfo.printTime;
						this.files[fileIndex].simulatedTime = fileInfo.simulatedTime;
						this.files[fileIndex].dir = file.directory;
						if ( this.files[fileIndex].name.substring(this.files[fileIndex].name.lastIndexOf("/")+1,this.files[fileIndex].name.lastIndexOf(".")).length > 0){
							var dir = this.files[fileIndex].name.substring(this.files[fileIndex].name.lastIndexOf("/")+1,this.files[fileIndex].name.lastIndexOf("."));
							//console.log(this.filteredList[fileIndex].dir);
							//this.filteredList[fileIndex].name =  dir;
							while(dir.includes(" "))
							dir = dir.replace(/ /g, "_");
							this.files[fileIndex].ico = "https://" + this.selectedMachine + "/img/GCodePreview/"+file.directory.substring(10).replace(/ /g, "_") + "/" + dir + "/" + dir + "_ico.jpg";//fileIco;
						}
					}
				} catch (e) {
					if (e instanceof DisconnectedError) {
						this.fileinfoProgress = -1;
						this.fileinfoDirectory = undefined;
						return;
					}

					console.warn(e);
					this.$log('error', this.$t('error.fileinfoRequestFailed', [file.name]), e.message);
				}

			}
			this.filteredFiles = this.files.filter((item) => {
				return (item.name.includes(e))
			});
			//console.log(this.files.filter((item, i) => item.name.includes(e)))
			//console.log(this.filteredFiles)
			if (e == "") {
				this.filteredFiles = [];
			}
			this.$emit('change', this.filteredFiles)

		}
	},
	mounted() {
		console.log(Path.gcodes)
		console.log(this.path)
		this.loadDirectory(this.path)
	},
	watch: {
		path() {
			console.log(this.path)
			this.loadDirectory(this.path)
		}
	}
}
</script>
