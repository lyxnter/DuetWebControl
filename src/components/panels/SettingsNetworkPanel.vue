<template>
	<v-card>
		<v-card-title>
			<span>{{ $t('panel.settingsNetwork.caption') }}</span>
		</v-card-title>

		<v-container fluid grid-list-lg class="px-3" >
			<v-layout column>
				<v-layout row>
					<v-spacer></v-spacer>
					<v-btn color="grey darken-3" @click="() => {edit = !edit; advanced = false} " ><v-icon>create</v-icon>{{ $t('generic.edit')}}</v-btn>
					<v-btn color="grey darken-3" @click="displayConfirmDialog" :disabled="!edit"><v-icon>save</v-icon>{{ $t('dialog.fileEdit.save') }}</v-btn>
				</v-layout>
				{{ $t('panel.settingsNetwork.publicIP' )}}
				<v-flex>
					<v-text-field id="publicIP" v-model.lazy="publicIP" ref="publicIP" type="string" @focus="focus('publicIP')" @blur="blur('publicIP')" :disabled="!edit" > </v-text-field>
				</v-flex>
				{{ $t('panel.settingsNetwork.netmask' )}}
				<v-flex>
					<v-text-field id="netmask" v-model.lazy="netmask" ref="netmask" type="string" @blur="blur('netmask')" @focus="focus('netmask')" :disabled="!edit" ></v-text-field>
				</v-flex>
				<v-expansion-panel :value="-1" style="margin-bottom: 15px">
					<v-expansion-panel-content style="background: #4D4D4D">
						<template v-slot:header>{{ $t('panel.settingsNetwork.advanced' )}}</template>
						<v-card>
							<v-layout row style="background: #4D4D4D">
								<v-spacer></v-spacer>
								<v-btn color="grey darken-3" @click="() => edit ? (advanced = !advanced) : (advanced = false)" :disabled="!edit"><v-icon>create</v-icon>{{ $t('generic.edit')}}</v-btn>
							</v-layout>
							<v-card-text class="panel-body" style="background: #4D4D4D">
								{{ $t('panel.settingsNetwork.gateway' )}}
								<v-flex>
									<v-text-field id="gateway" v-model.lazy="gateway" ref="gateway" type="string" @focus="focus('gateway')" @blur="blur('gateway')" :disabled="!edit || !advanced" ></v-text-field>
								</v-flex>
								<v-flex>
									{{ $t('panel.settingsNetwork.dns' )}}
									<ul>
										<li v-for="(addr, index) in dns" v-bind:key="index">
											<v-text-field :id="'dns_'+index" v-model.lazy="dns[index]" :ref="'dns-'+index" type="String" :disabled="!edit || !advanced" @focus="focus('dns', index)" @blur="blur('dns',index)"></v-text-field>
										</li>
									</ul>
									<v-flex style="width: max-content; margin: 0 auto">
										<v-btn color="grey darken-3" @click=" rmDns" :disabled="!edit || !advanced" ><v-icon>remove</v-icon>{{ $t('list.baseFileList.delete')}}</v-btn>
										<v-btn color="grey darken-3" @click="addDns" :disabled="!edit || !advanced" ><v-icon>add</v-icon>{{ $t('button.add.caption')}}</v-btn>
									</v-flex>
								</v-flex>
							</v-card-text>
						</v-card>
					</v-expansion-panel-content>
				</v-expansion-panel>
			</v-layout>
			<v-btn v-if="isLocal" @click="sheet = !sheet" style="position: fixed; margin: 0px 50%; z-index: 1; border-top-left-radius: 88px; border-top-right-radius: 88px; width: 88px; left: -44px" :style="{bottom: (sheet ? '260px' : '0px')}">
				<v-icon style="transition: 0.4s" :style="{transform: sheet ? 'rotate(180deg)' : 'rotate(0deg)'}">keyboard_arrow_up</v-icon>
			</v-btn>
			<div class="text-center">
				<v-bottom-sheet v-model="sheet" :inset="inset" :hide-overlay="hideOverlay" persistent>
					<v-sheet class="text-center" height="260px" style="background-color: #21212100;">
						<keyboard-input :target="target" @change="onInputChanged($event)" :emitEvent="true"></keyboard-input>
					</v-sheet>
				</v-bottom-sheet>
			</div>
		</v-container>
		<confirm-dialog :shown.sync="confirmUpdate" :question="'Are you sure'" :prompt="confirmPrompt" @confirmed="advanced?displayReConfirmDialog():save()"></confirm-dialog>
		<confirm-dialog :shown.sync="reConfirmUpdate" :question="'Are you really sure'" :prompt="reConfirmPrompt" @confirmed="save"></confirm-dialog>
		<confirm-dialog :shown.sync="restartDialog" :question="'Apply changes'" :prompt="'Restart the interface to apply update?'" @confirmed="restart"></confirm-dialog>
	</v-card>
</template>

<script>
'use strict'

import { mapState, mapMutations } from 'vuex'
import axios from 'axios'

export default {
	data() {
		return {
			ifaces: [],
			publicIP: "127.0.0.1",
			netmask: "255.0.0.0",
			gateway: "127.0.0.1",
			dns: [],
			axios: undefined,
			edit: false,
			advanced: false,
			confirmUpdate: false,
			reConfirmUpdate: false,
			restartDialog: false,
			confirmPrompt: '',
			reConfirmPrompt: '',
			sheet: false,
			inset: false,
			hideOverlay: true,
			target: document.createElement('input'),
		}
	},
	computed: {
		...mapState('machine', ['settings']),
		...mapState('machine/model', ['electronics']),
		...mapState(['selectedMachine', 'isLocal', 'user']),
	},
	methods: {
		...mapMutations('machine/settings', ['update']),
		computeNetmask: function(cidr) {
			//console.log(cidr);
			let netmask = "";
			let count = 4;
			while(cidr >= 8) {
				netmask += "255."
				cidr -= 8;
				count--;
			}
			if (count > 0) {
				switch (cidr) {
					case 7:
					netmask += "254."
					count--
					break;
					case 6:
					netmask += "252."
					count--
					break;
					case 5:
					netmask += "248."
					count--
					break;
					case 4:
					netmask += "240."
					count--
					break;
					case 3:
					netmask += "224."
					count--
					break;
					case 2:
					netmask += "192."
					count--
					break;
					case 1:
					netmask += "128."
					count--
					break;
					case 0:
					netmask += "0."
					count--
					break;
				}
			}
			if (count == 0) {
				netmask = netmask.substr(0, netmask.length-1)
			} else {
				while (count > 1) {
					netmask += "0."
					count--
				}
				netmask += "0"
			}
			//console.log(netmask);
			return netmask;
		},
		computeCidr: function(netmask) {
			const nmask = netmask;
			//console.log(netmask);
			let cidr = 0;
			while(netmask.startsWith("255.")) {
				cidr += 8
				netmask = netmask.substr(4);
			}
			switch (netmask.substr(0, 3)) {
				case "255":
				netmask = netmask.substr(4);
				cidr += 8
				break;
				case "254":
				netmask = netmask.substr(4);
				cidr += 7
				break;
				case "252":
				netmask = netmask.substr(4);
				cidr += 6
				break;
				case "248":
				netmask = netmask.substr(4);
				cidr += 5
				break;
				case "240":
				netmask = netmask.substr(4);
				cidr += 4
				break;
				case "224":
				netmask = netmask.substr(4);
				cidr += 3
				break;
				case "192":
				netmask = netmask.substr(4);
				cidr += 2
				break;
				case "128":
				netmask = netmask.substr(4);
				cidr += 1
				break;
				case "0.0":
				case "0":
				break;
				default:
				this.$makeNotification('error', 'IP validity check'/*this.$t(`button.upload['${this.target}'].caption`)*/,nmask + " can't be converted to a valid Netmask");
				return -1
			}
			while(netmask.startsWith("0")) {
				cidr += 0
				netmask = netmask.substr(2);
			}
			if (netmask.length > 0) {
				this.$makeNotification('error', 'IP validity check'/*this.$t(`button.upload['${this.target}'].caption`)*/,nmask + " can't be converted to a valid Netmask");
				return -1
			}
			if (cidr >= 31) {
				console.warn(nmask + " will mask all computers on the network rendering the machine useless");
			}
			return cidr;
		},
		isValid(addr, cidr){
			if (cidr < 0 || cidr >= 31) {
				console.error(cidr+" is not a valid netmask")
				return false;
			}
			var regex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-4]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/g;
			var found = addr.match(regex);
			if (found == null)
			{
				this.$makeNotification('error', 'IP validity check'/*this.$t(`button.upload['${this.target}'].caption`)*/, addr+" is not a valid IP" /*this.$t('error.uploadStartWrongFileCount'));*/)
				return false;
			}
			//console.log(addr+" is a valid IP" + (cidr? " and " + cidr + " is a valid netmask": ""));
			return true;
		},
		rmDns: function() {
			if(this.dns.length > 1)
			this.dns.pop()
		},
		addDns: function() {
			this.dns.push("")
		},
		save:async function() {
			let iface = this.ifaces[0].addr_info[0];
			let params = {};
			if ((iface.local != this.publicIP || iface.prefixlen != this.computeCidr(this.netmask)) && this.isValid(this.publicIP, this.computeCidr(this.netmask)))
			params.ip = this.publicIP+'/'+this.computeCidr(this.netmask);
			if (this.advanced) {
				if (iface.gateway != this.gateway && this.isValid(this.gateway)) {
					params.gateway = this.gateway;
				}
				let dns = this.dns;
				if (!(dns.every((ip) => iface.DNS.includes(ip)) && iface.DNS.every((ip) => dns.includes(ip))) && dns.every(this.isValid)) {
					params.dns = this.dns;
				}
			}
			console.log(params)
			if (params != {}) {
				if (!this.axios) {
					let protocol = location.protocol;
					this.axios = await axios.create({
						baseURL: ENTRYPOINT+`/`,
						timeout: 8000,	// default session timeout in RepRapFirmware
						withCredentials: true,
					});
				}
				const response = await this.axios.get('/duet/action/pc_getip', {
					withCredentials: true,
					params: params
				});
				console.log(response);
				if (response.data.err == 0) {
					this.$makeNotification('success', 'Network settings', 'The network data have successfully been updated')
					this.displayRestartDialog();
				} else if (response.data.err !== undefined){
					this.$makeNotification('error', 'Network settings', 'The following error happened during update: ' + response.data.msg)
				}
			}
		},
		blur: function(element, index) {
			console.log(this[element])
			console.log(index)
			if (this[element] == undefined || this[element] == "")
			{
				this.$nextTick(() => this[element] = this.ifaces[element]);
				//this.$refs[element].value = this.ifaces[element];
			}
			else
			{
				if (typeof(this[element]) == "string") {
					if (!this.isValid(this[element]) )
					{
						//console.log(this.$refs[element])
						this.$refs[element].focus();
						this.$nextTick(this[element] = this.ifaces[element]);
					}
					else if (element == "netmask" && this.computeCidr(this[element]) < 0)
					{
						//console.log(this.$refs[element])
						this.$refs[element].focus();
						this.$nextTick(this[element] = this.ifaces[element]);
					}
				}
				else if ( typeof(this[element]) == "object")
				{
					if ( !this[element].every((addr) => this.isValid(addr))) {
						//console.log(this.$refs[element])
						//this.$refs[element].focus();
						this.$nextTick(this[element] = this.ifaces[element]);
					}
				}
			}
		},
		restart: async function() {
			if (!this.axios) {
				let protocol = location.protocol;
				this.axios = await axios.create({
					baseURL:ENTRYPOINT+`/`,
					timeout: 8000,	// default session timeout in RepRapFirmware
					withCredentials: true,
				});
			}
			const response = await this.axios.get('/duet/action/pc_getip', {
				withCredentials: true,
				params: {restart: true}
			});
			console.log(response);
			if (response.data.err == 0) {
				this.$makeNotification('success', 'Network settings', 'The network data have successfully been updated')
				if( !this.isLocal) {
					setTimeout((that) => { location.href = location.protocol + '//' + that.publicIP + '/Settings/Machine'}, 250, this)
				}
			} else if (response.data.err !== undefined){
				this.$makeNotification('error', 'Network settings', 'The following error happened during update: ' + response.data.msg)
			}
		},
		displayConfirmDialog: function() {
			let iface = this.ifaces[0].addr_info[0];
			let dns = this.dns;
			console.log("confirm dialog")
			if (((iface.local != this.publicIP || iface.prefixlen != this.computeCidr(this.netmask)) && this.isValid(this.publicIP, this.computeCidr(this.netmask))) || (this.advanced && ((iface.gateway != this.gateway && this.isValid(this.gateway)) || (!(dns.every((ip) => iface.DNS.includes(ip)) && iface.DNS.every((ip) => dns.includes(ip))) && dns.every(this.isValid))))) {
				this.confirmPrompt = 'Update the following parameters: <br/><ul>'
				if (iface.local != this.publicIP && this.isValid(this.publicIP, this.computeCidr(this.netmask))) {
					this.confirmPrompt += '<li> address: ' + iface.local + " => " + this.publicIP + '</li>';
				}
				if ((iface.prefixlen != this.computeCidr(this.netmask)) && this.isValid(this.publicIP, this.computeCidr(this.netmask))) {
					this.confirmPrompt += '<li> netmask: ' + this.computeNetmask(iface.prefixlen) + " => "  + this.netmask +'</li>'
				}
				if (this.advanced) {
					if (iface.gateway != this.gateway && this.isValid(this.gateway)) {
						this.confirmPrompt += '<li> gateway: ' + iface.gateway + " => " + this.gateway + '</li>';
					}
					let dns = this.dns;
					if (!(dns.every((ip) => iface.DNS.includes(ip)) && iface.DNS.every((ip) => dns.includes(ip))) && dns.every(this.isValid)) {
						this.confirmPrompt += '<li> DNS addresses: <ul>'
						for (var i = 0; i < Math.max(this.dns.length, iface.DNS.length); i++)
						{
							if (iface.DNS[i] != this.dns[i]){
								this.confirmPrompt += '<li>'+ (iface.DNS[i]?iface.DNS[i]:'&Oslash;') + " => " + (this.dns[i]?this.dns[i]:"&Oslash;" + '</li>')
							}
						}
						this.confirmPrompt += '</ul></li>';
					}
				}
				this.confirmPrompt += "</ul>";
				this.$nextTick(() => this.confirmUpdate = true);
			}
		},
		displayReConfirmDialog: function() {
			this.reConfirmPrompt = 'Really update the following advanced parameters: <br/><ul>'
			let iface = this.ifaces[0].addr_info[0];
			if (this.advanced) {
				if (iface.gateway != this.gateway && this.isValid(this.gateway)) {
					this.reConfirmPrompt += '<li> gateway: ' + iface.gateway + " => " + this.gateway + '</li>';
				}
				let dns = this.dns;
				if (!(dns.every((ip) => iface.DNS.includes(ip)) && iface.DNS.every((ip) => dns.includes(ip))) && dns.every(this.isValid)) {
					this.reConfirmPrompt += '<li> DNS addresses: <ul>'
					for (var i = 0; i < Math.max(this.dns.length, iface.DNS.length); i++)
					{
						if (iface.DNS[i] != this.dns[i]){
							this.reConfirmPrompt += '<li>'+ (iface.DNS[i]?iface.DNS[i]:'&Oslash;') + " => " + (this.dns[i]?this.dns[i]:"&Oslash;" + '</li>')
						}
					}
					this.reConfirmPrompt += '</ul></li>';
				}
			}
			this.reConfirmPrompt += "</ul>";
			this.$nextTick(() => this.reConfirmUpdate = true);
		},
		displayRestartDialog: function() {
			this.$nextTick(() => this.restartDialog = true);
		},
		clickExpansion(e){
			console.log("expansion clicked");
			console.log(e)
		},
		focus: function(el, index) {
			console.log(el, index)
			this.target = document.getElementById( el+(index != undefined ? '_'+index : '') );
			console.log(this.target)
		},
		onInputChanged: function(e) {
			let id = this.target.id.split('_')[0];
			let index = this.target.id.split('_')[1];
			console.log(this[id])
			if (index == undefined) {
				this[id] = e;
			} else {
				this[id][index] = e;
			}
			console.log(this[id]);
		}
	},
	mounted() {
		console.log(this.user.ifaces);
		this.ifaces = this.user.ifaces;
		this.publicIP = this.ifaces[0].addr_info[0].local//+"/"+this.ifaces[0].addr_info[0].prefixlen;
		this.netmask = this.computeNetmask(this.ifaces[0].addr_info[0].prefixlen)
		this.computeCidr(this.netmask);
		this.gateway = this.ifaces[0].addr_info[0].gateway;
		this.dns = [];
		this.ifaces[0].addr_info[0].DNS.forEach((addr) => this.dns.push(addr));
	},
	watch: {
		user(as){
			console.log(as.ifaces);
			this.ifaces = as.ifaces;
			this.publicIP = this.ifaces[0].addr_info[0].local//+"/"+this.ifaces[0].addr_info[0].prefixlen;
			this.netmask = this.computeNetmask(this.ifaces[0].addr_info[0].prefixlen)
			this.gateway = this.ifaces[0].addr_info[0].gateway;
			this.dns = this.ifaces[0].addr_info[0].DNS;
		},
	}
}
</script>
