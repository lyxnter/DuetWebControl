'use strict'

import Vue from 'vue'

import ConfirmDialog from './ConfirmDialog.vue'
import HistoryDialog from './HistoryDialog.vue'
import ConnectDialog from './ConnectDialog.vue'
import ConnectionDialog from './ConnectionDialog.vue'
import FilamentDialog from './FilamentDialog.vue'
import FileEditDialog from './FileEditDialog.vue'
import InputDialog from './InputDialog.vue'
import LoginDialog from './LoginDialog.vue'
import MeshEditDialog from './MeshEditDialog.vue'
import MessageBoxDialog from './MessageBoxDialog.vue'
import NewFileDialog from './NewFileDialog.vue'
import NewDirectoryDialog from './NewDirectoryDialog.vue'
import ResetHeaterFaultDialog from './ResetHeaterFaultDialog.vue'
import TempEditDialog from './TempEditDialog.vue'
import ToolDialog from './ToolDialog.vue'

Vue.component('confirm-dialog', ConfirmDialog)
Vue.component('history-dialog', HistoryDialog)
Vue.component('connect-dialog', ConnectDialog)
Vue.component('connection-dialog', ConnectionDialog)
Vue.component('filament-dialog', FilamentDialog)
Vue.component('file-edit-dialog', FileEditDialog)
Vue.component('input-dialog', InputDialog)
Vue.component('login-dialog', LoginDialog)
Vue.component('mesh-edit-dialog', MeshEditDialog)
Vue.component('messagebox-dialog', MessageBoxDialog)
Vue.component('new-file-dialog', NewFileDialog)
Vue.component('new-directory-dialog', NewDirectoryDialog)
Vue.component('reset-heater-fault-dialog', ResetHeaterFaultDialog)
Vue.component('temp-edit-dialog', TempEditDialog)
Vue.component('tool-load-dialog', ToolDialog)

export default {
	ConfirmDialog,
	HistoryDialog,
	ConnectDialog,
	ConnectionDialog,
	FilamentDialog,
	FileEditDialog,
	InputDialog,
	LoginDialog,
	MeshEditDialog,
	MessageBoxDialog,
	NewDirectoryDialog,
	NewFileDialog,
	ResetHeaterFaultDialog,
	TempEditDialog
}
