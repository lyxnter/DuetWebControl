<template>
	<v-dialog v-model="shown" persistent width="360">
		<v-card>
			<v-form ref="form" @submit.prevent="submit">
				<v-card-title>
					<span class="headline">{{ title }}</span>
				</v-card-title>

				<v-card-text>
					{{ prompt }}
					<v-text-field ref="input" v-model="input" :rules="[v => !!v || $t('dialog.inputRequired'), v => !isNumericValue || isNumber(parseFloat(v)) || $t('dialog.numberRequired')]"
						@keyup="keyupEvent" required></v-text-field>
						<div v-if="!isUnique" v-html="$t('dialog.fileExists', [input, altInput])">
						</div>
					</v-card-text>

					<v-card-actions>
						<v-btn v-if="!isUnique" color="primary darken-1" flat @click="input = altInput">{{ $t('list.baseFileList.rename') }}</v-btn>
						<v-spacer></v-spacer>
						<v-btn color="primary darken-1" flat @click="hide">{{ $t('generic.cancel') }}</v-btn>
						<v-btn color="primary darken-1" flat type="submit">{{ $t('generic.ok') }}</v-btn>
					</v-card-actions>
				</v-form>
			</v-card>
		</v-dialog>
	</template>

	<script>
	'use strict'

	export default {
		props: {
			shown: {
				type: Boolean,
				required: true
			},
			title: {
				type: String,
				required: true
			},
			prompt: {
				type: String,
				required: true
			},
			isNumericValue: Boolean,
			preset: [String, Number],
			files: {
				type: Array,
				required: false,
			}
		},
		data() {
			return {
				input: '',
				altInput: '',
			}
		},
		computed: {
			isUnique() {
				if (this.files && this.files.length && this.input && this.input.length /*&& (!this.preset || this.input != this.preset)*/) {
					let input = this.input
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
					let files = this.files.filter(file => {
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
							if (fnum > maxnum && fname == input)
							maxnum = fnum
						}
						return fname == input && fext == ext && (fnum == num)
					})
					//console.log(files.length == 0 ? 'unique' : 'NOT UNIQUE');
					return files.length == 0
				}
				return true;
			}
		},
		methods: {
			async submit() {
				if (this.$refs.form.validate()) {
					this.$emit('update:shown', false);
					this.$emit('confirmed', this.isNumericValue ? parseFloat(this.input) : this.input);
				}
			},
			hide() {
				this.$emit('update:shown', false);
				this.$emit('cancelled');
			},
			renameFile(input) {
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
				let files = this.files.filter(file => {
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
						if (fnum > maxnum && fname == input && fext == ext) {
							maxnum = fnum
						}
					}
					return fname == input && fext == ext && (fnum == num)
				})
				console.log(files)
				files = files.sort((a, b) => { if (a.name < b.name) return -1; if (a.name > b.name) return 1; return 0})
				if(!this.isUnique)
				{
					this.altInput = input + ' - Copy(' + (maxnum+1) + ')' + (ext.length ? '.' + ext : '')
					console.log(this.altInput)
				} else {
					this.altInput = ''
				}
			},
			keyupEvent() {
				//console.log(this.input)
				if (this.files.length > 0) {
					this.renameFile(this.input)
				}
			}
		},
		watch: {
			shown(to) {
				if (to) {
					// Apply preset
					this.input = this.preset;
					// Auto-focus input
					const inputField = this.$refs.input;
					setTimeout(function(that) { inputField.focus();
						that.renameFile(that.input) }, 250, this);
					} else {
						this.altInput = ''
					}
				}
			}
		}
		</script>
