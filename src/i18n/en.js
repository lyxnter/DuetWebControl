export default {
	language: 'English',
	'$vuetify': {
		close: 'Close',
		dataIterator: {
			pageText: '{0}-{1} of {2}',
			noResultsText: 'No matching records found',
			loadingText: 'Loading items...'
		},
		dataTable: {
			itemsPerPageText: 'Rows per page:',
			ariaLabel: {
				sortDescending: ': Sorted descending. Activate to remove sorting.',
				sortAscending: ': Sorted ascending. Activate to sort descending.',
				sortNone: ': Not sorted. Activate to sort ascending.'
			},
		},
		dataFooter: {
			itemsPerPageText: 'Items per page:',
			itemsPerPageAll: 'All',
			nextPage: 'Next page',
			prevPage: 'Previous page',
			firstPage: 'First page',
			lastPage: 'Last page'
		},
		datePicker: {
			itemsSelected: '{0} selected'
		},
		noDataText: 'No data available',
		carousel: {
			prev: 'Previous visual',
			next: 'Next visual'
		},
		calendar: {
			moreEvents: '{0} more'
		}
	},
	button: {
		add: {
			caption: 'Add'
		},
		parkHead: {
			caption: 'Park Toolhead'
		},
		connect: {
			connect: 'Connect',
			connecting: 'Connecting...',
			disconnect: 'Disconnect',
			disconnecting: 'Disconnecting...'
		},
		login: {
			login: 'Log in',
			loggingin: 'Logging in...',
			logout: 'Log out',
			loggingout: 'Logging out...'
		},
		emergencyStop: {
			caption: 'Emergency Stop',
			title: 'Enforce an immediate software reset (M112+M999)'
		},
		home: {
			caption: 'Home {0}',
			captionAll: 'Home All',
			title: 'Home the {0} axis (G28 {0})',
			titleAll: 'Home all axes (G28)'
		},
		newDirectory: {
			caption: 'New Directory'
		},
		newMaterial: {
			caption: 'New Material'
		},
		newFilament: {
			caption: 'New Filament'
		},
		newLiquid: {
			caption: 'New Liquid'
		},
		newFile: {
			caption: 'New File'
		},
		refresh: {
			caption: 'Refresh'
		},
		preloadPrime: {
			caption: 'Preload/Prime',
			preload: 'Preload {0}',
			prime: 'Prime {0}',
			unload: 'Unload {0}',
			preheat: 'preheat {0}'
		},
		preheat: {
			caption: 'Preheat',
			preheat: 'Preheat for {0}',
		},
		upload: {
			generic: {
				caption: 'Upload File(s)',
				title: 'Upload one or more files (drag&drop is supported as well)'
			},
			gcodes: {
				caption: 'Upload G-Code File(s)',
				title: 'Upload one or more G-Code files (drag&drop is supported as well)'
			},
			start: {
				caption: 'Upload & Start',
				title: 'Upload & Start one or more G-Code files (drag&drop is supported as well)'
			},
			macros: {
				caption: 'Upload Macro File(s)',
				title: 'Upload one or more macro files (drag&drop is supported as well)'
			},
			materials: {
				caption: 'Upload Material Configs',
				title: 'Upload one or more material configurations (drag&drop is supported as well)'
			},
			filaments: {
				caption: 'Upload Filament Configs',
				title: 'Upload one or more filament configurations (drag&drop is supported as well)'
			},
			liquids: {
				caption: 'Upload Liquid Configs',
				title: 'Upload one or more liquid configurations (drag&drop is supported as well)'
			},
			display: {
				caption: 'Upload Menu Files',
				title: 'Upload one or more menu files (drag&drop is supported as well)'
			},
			sys: {
				caption: 'Upload System Files',
				title: 'Upload one or more system files (drag&drop is supported as well)'
			},
			www: {
				caption: 'Upload Web Files',
				title: 'Upload one or more web files (drag&drop is supported as well)'
			},
			update: {
				caption: 'Upload Update',
				title: 'Upload an update package (drag&drop is supported as well)'
			},
			preview: {
				caption: 'Upload preview',
				title: 'Upload one or more preview files (drag&drop is supported as well)'
			},
		}
	},
	chart: {
		layer: {
			caption: 'Layer Chart',
			layerTime: 'Layer Time',

			showLastLayers: 'Show Last {0} Layers',
			showAllLayers: 'Show All Layers',

			layer: 'Layer {0}',
			layerDuration: 'Duration: {0}',
			layerHeight: 'Layer Height: {0}',
			filamentUsage: 'Filament Usage: {0}',
			fractionPrinted: 'File Progress: {0}'
		},
		temperature: {
			caption: 'Temperature Chart',
			heater: 'Heater {0}',
			noData: 'No Data'
		},
		fan: {
			caption: 'Fans Chart',
			heater: 'Heater {0}',
			noData: 'No Data'
		},
		smoothing: {
			caption: 'Smoothing',
			off: "Off",
			low: "Low",
			med: "Med",
			high: "High"
		}
	},
	dialog: {
		cancel: {
			title: "Cancel the print",
			prompt: "Are you sure you want to cancel <b>'{0}'</b>?"
		},
		changeMoveStep: {
			title: 'Change move step',
			prompt: 'Please enter a new value for the clicked move button:'
		},
		configUpdated: {
			title: 'Reset board?',
			prompt: 'Would you like to restart your board to apply the updated configuration?'
		},
		confirmShutdown: {
			title: 'Shutdown Printer',
			prompt: "Are you sure you want to shutdown the Printer",
		},
		connect: {
			title: 'Connect to Machine',
			prompt: 'Please enter the hostname and password of the machine that you would like to connect to:',
			hostPlaceholder: 'Hostname',
			hostRequired: 'Hostname is required',
			passwordPlaceholderOptional: 'Password (optional)',
			passwordPlaceholder: 'Password',
			passwordRequired: 'Password is required',
			connect: 'Connect'
		},
		login: {
			title: 'Login to account',
			prompt: 'Please enter your login and password:',
			hostPlaceholder: 'Login',
			hostRequired: 'Login is required',
			passwordPlaceholderOptional: 'Password (optional)',
			passwordPlaceholder: 'Password',
			passwordRequired: 'Password is required',
			connect: 'Log in'
		},
		connection: {
			connecting: 'Connecting...',
			disconnecting: 'Disconnecting...',
			updating: 'Please wait while updates are being installed...',
			loggingin: 'Logging In...',
			loggingout: 'Logging Out...',
			reconnecting: 'Connection lost, attempting to reconnect...',
			standBy: 'Please stand by...',
			loadingtool: "Loading Tool please wait",
		},
		editExtrusionAmount: {
			title: 'Edit extrusion amount',
			prompt: 'Please enter a new amount for the clicked button:'
		},
		editExtrusionFeedrate: {
			title: 'Edit extrusion feedrate',
			prompt: 'Please enter a new feedrate for the clicked button:'
		},
		factoryReset: {
			title: 'Perform factory reset?',
			prompt: 'Are you sure you wish to perform a factory reset? All saved settings will be lost.'
		},
		filament: {
			titleChange: 'Change Filament',
			titleLoad: 'Load Filament',
			prompt: 'Please choose a filament:'
		},
		fileEdit: {
			gcodeReference: 'G-Code Reference',
			menuReference: 'Menu Reference',
			save: 'Save',
			confirmClose: 'The file has been changed. If you proceed, your changes will be lost.'
		},
		meshEdit: {
			title: 'Custom calibration',
			radius: 'Probe diameter',
			spacing: 'Spacing',
			startCoordinate: 'Start coordinate in {0} direction',
			endCoordinate: 'End coordinate in {0} direction',
			spacingDirection: 'Spacing in {0} direction',
			bed: 'Bed temperature',
			chamber: 'Chamber temperature',
			rectangle: 'Rectangle',
			circle: 'Circle',
			diameter: 'Diameter ',
			success: 'New calibration added',
			new: "New calibration",
		},
		newDirectory: {
			title: 'New Directory',
			prompt: 'Please enter a new directory name:'
		},
		newFilament: {
			title: 'New Filament',
			prompt: 'Please enter a name for the new filament:'
		},
		newFile: {
			title: 'New File',
			prompt: 'Please enter a new file name:'
		},
		renameFile: {
			title: 'Rename File or Directory',
			prompt: 'Please enter a new name:'
		},
		moveFile: {
			title: 'Rename File or Directory before moving',
			prompt: 'Please enter a new name:'
		},
		resetHeaterFault: {
			title: 'Reset Heater Fault',
			prompt: 'A heater fault has occurred on <b>Heater {0}</b>. It is strongly advised to turn off your machine now and to check your wiring before you continue.<br/><b>-</b> If you are absolutely sure that this is not a phsical problem, you can reset the heater fault. Be aware that this is <span style="color: red; font-weight: bold;">NOT RECOMMENDED</span> and can lead to further problems.<br/><b>-</b> If the issue persists we strongly advise you to contact <a style="font-weight: bold;" href="mailto:support@lynxter.fr"> Lynxter\'s customer service</a>. <br/><br/> How would you like to proceed?',
			/*'A heater fault has occurred on heater {0}. It is strongly advised to turn off your machine now and to check your wiring before you continue. If you are absolutely sure that this is not a phsical problem, you can reset the heater fault <span style="color: red; font-weight: bold;">ON YOUR OWN RISK</span>. Be aware that this is <span style="color: red; font-weight: bold;">NOT RECOMMENDED</span> and can lead to further problems. How would you like to proceed?'*/
			resetFault: 'Reset Fault'
		},
		runMacro: {
			title: 'Run {0}',
			prompt: 'Do you want to run {0}?'
		},
		startJob: {
			title: 'Start {0}',
			prompt: 'Do you want to start {0}?'
		},
		delete: {
			title: 'Delete {0}?',
			prompt: 'Are you sure you want to delete : <ul>',
			multiple: '{0} files'
		},
		update: {
			title: 'Install updates?',
			prompt: 'You have uploaded at least one firmware update. Would you like to install them now?'
		},
		tool: {
			titleUnload: 'Unload tool',
			titleLoad: 'Load tool',
			prompt: 'Please choose a tool:'
		},
		inputRequired: 'Please enter a value',
		numberRequired: 'Please enter a valid number',
		temperature:  {
			title: "Enter the target temperature",
			prompt: "Enter {0} {1} temperature"
		},
		fileExists: 'File/Folder: <b>{0}</b> already exists<br/>suggested alternative <b>{1}</b>',
	},
	directory: {
		display: 'Menu Directory',
		filaments: 'Filaments Directory',
		gcodes: 'G-Codes Directory',
		macros: 'Macros Directory',
		sys: 'System Directory',
		www: 'WWW Directory'
	},
	error: {
		notImplemented: '{0} is not implemented',
		invalidPassword: 'Invalid password!',
		noFreeSession: 'No more free sessions!',
		connect: 'Failed to connect to {0}',
		disconnect: 'Could not disconnect cleanly from {0}',
		disconnected: 'Could not complete action because the connection has been terminated',
		cancelled: 'Operation has been cancelled',
		network: 'Network error',
		timeout: 'HTTP request timed out',
		driveUnmounted: 'Target drive is unmounted',
		directoryNotFound: 'Directory {0} not found',
		fileNotFound: 'File {0} not found',
		invalidHeightmap: 'Invalid Height Map',
		operationFailed: 'Operation failed (Reason: {0})',
		uploadStartWrongFileCount: 'Only a single file can be uploaded & started',
		uploadNoSingleZIP: 'Only a single ZIP file can be uploaded at once',
		uploadNoFiles: 'This ZIP does not contain any usable fiels',
		uploadDecompressionFailed: 'Failed to decompress ZIP file',
		codeResponse: 'Could not run code because a bad response has been received',
		codeBuffer: 'Could run code because the buffer space has been exhausted',
		enterValidNumber: 'Please enter a valid number',
		turnOffEverythingFailed: 'Failed to turn everything off',
		filelistRequestFailed: 'Failed to get file list',
		fileinfoRequestFailed: 'Failed to get file info for {0}',
		filamentsLoadFailed: 'Failed to load filaments',
		toolsLoadFailed: 'Failed to load the Tools list',
		move: 'Failed to move {0} to {1}'
	},
	events: {
		connected: 'Connected to {0}',
		connectionLost: 'Failed to maintain connection to {0}',
		emergencyStop: 'Emergency stop, attemping to reconnect...',
		reconnecting: 'Connection interrupted, attempting to reconnect...',
		reconnected: 'Connection established',
		disconnected: 'Disconnected from {0}'
	},
	generic: {
		ok: 'OK',
		cancel: 'Cancel',
		yes: 'Yes',
		no: 'No',
		close: 'Close',
		reset: 'Reset',
		noValue: 'n/a',
		loading: 'loading',
		error: 'Error',
		info: 'Info',
		warning: 'Warning',
		success: 'Success',
		print: 'Print',
		showBuildplate: 'Show buildplate',
		showPreview: 'Show preview',
		preload: 'Preload {0}',
		unload: 'Unload tool',
		debug: 'Back to title screen',
		edit: 'Edit',
		heaterStates: [
			'off',
			'standby',
			'active',
			'fault',
			'tuning',
			'offline'
		],
		status: {
			updating: 'Updating',
			off: 'Off',
			halted: 'Halted',
			pausing: 'Pausing',
			paused: 'Paused',
			resuming: 'Resuming',
			printing: 'Printing',
			processing: 'Processing',
			simulating: 'Simulating',
			busy: 'Busy',
			changingTool: 'Changing Tool',
			idle: 'Idle',
			unknown: 'Unknown',
			upgrading: 'Upgrading',
		},
		rpm: 'RPM',
		sdCard: 'SD Card {0}',
		mounted: 'mounted',
		notMounted: 'not mounted',
		extracting: 'Extracting',
		uploading: 'Uploading',
		active: 'Active',
		standby: 'Standby'
	},
	input: {
		code: {
			send: 'Send',
			placeholder: 'Send code...'
		},
		addTemperature: 'Value of new temperature',
		addRPM: 'Value of new preset',
	},
	jobProgress: {
		simulating: 'Simulating {0}, {1} complete',
		simulated: 'Simulated {0}, 100 % complete',
		processing: 'Processing {0}, {1} complete',
		processed: 'Processed {0}, 100 % complete',
		printing: 'Printing {0}, {1} complete',
		printed: 'Printed {0}, 100 % complete',
		noJob: 'No Job running.',
		layer: 'Layer {0} of {1}',
		filament: 'Filament Usage: {0}',
		filamentRemaining: '{0} remaining'
	},
	list: {
		baseFileList: {
			fileName: 'Filename',
			size: 'Size',
			lastModified: 'Last modified',
			download: 'Download File',
			edit: 'Edit File',
			rename: 'Rename',
			delete: 'Delete',
			downloadZIP: 'Download as ZIP',
			noFiles: 'No Files or Directories',
			driveUnmounted: 'Drive is unmounted',
			goUp: 'Go up',
			showMore: 'Show More'
		},
		display: {
			noFiles: 'No Display Files'
		},
		eventLog: {
			date: 'Date',
			type: 'Type',
			message: 'Event',
			noEvents: 'No Events',
			copy: 'Copy',
			clear: 'Clear',
			downloadText: 'Download as Text',
			downloadCSV: 'Download as CSV'
		},
		material: {
			noMaterials: "No Materials"
		},
		filament: {
			noFilaments: 'No Filaments'
		},
		liquid: {
			noLiquids: 'No Liquids'
		},
		macro: {
			caption: 'Macros',
			noMacros: 'No Macros',
			run: 'Run Macro',
			root: 'Root'
		},
		gcode: {
			caption: 'Gcodes',
			noGcodes: 'No Gcodes',
			run: 'Run Gcode',
			root: 'Root'
		},
		jobs: {
			height: 'Object Height',
			layerHeight: 'Layer Height',
			filament: 'Filament Usage',
			printTime: 'Print Time',
			simulatedTime: 'Simulated Time',
			generatedBy: 'Generated by',

			noJobs: 'No Jobs',
			start: 'Start File',
			simulate: 'Simulate File'
		},
		sys: {
			noFiles: 'No System Files',
			configToolNote: 'edit via config tool'
		}
	},
	menu: {
		control: {
			caption: 'Machine Control',
			dashboard: 'Dashboard',
			console: 'G-Code Console',
			heightmap: 'Height Map'
		},
		job: {
			caption: 'Current Job',
			status: 'Status',
			webcam: 'Webcam',
			visualiser: 'Visualiser'
		},
		files: {
			caption: 'File Management',
			jobs: 'G-Code Files',
			filaments: 'Filaments',
			macros: 'Macros',
			display: 'Display',
			system: 'System',
			web: 'Web',
			timelapses: 'Timelapses'
		},
		material: {
			materials: 'Materials',
			filaments: 'Filaments',
			liquids: 'Liquids',
			pellets: 'Pellets',
			fibers: 'Fibers',
			hybrids: 'Hybrids',
		},
		settings: {
			caption: 'Settings',
			general: 'General',
			machine: 'Machine-Specific',
			update: 'Update',
			setup: 'Equipement/Setup',
			support: 'Support',
			maintenance:'Maintnance',
		},
		lynxter: {
			control: 'Controls',
			calibrate: 'Calibrate',
			advanced: 'Advanced'
		}
	},
	notification: {
		compress: {
			title: 'Compressing files...',
			message: 'Please stand by while your files are being compressed...',
			errorTitle: 'Failed to compress files'
		},
		delete: {
			errorTitle: 'Failed to delete {0}',
			errorMessageDirectory: 'Please make sure that this directory is empty',
			success: 'Successfully deleted {0}',
			successMultiple: 'Successfully deleted {0} items'
		},
		deleteFilament: {
			errorTitle: 'Failed to delete filament(s)',
			errorStillLoaded: 'At least one of the selected filaments is still loaded. Please unload them before you proceed',
			errorSubDirectories: 'The filament {0} contains sub-directories. Please delete them manually and try again.'
		},
		download: {
			title: 'Downloading {0} @ {1}, {2}% complete',
			message: 'Please stand by while the file is being downloaded...',
			success: 'Download of {0} successful after {1}',
			successMulti: 'Successfully downloaded {0} files',
			error: 'Failed to download {0}'
		},
		loadingFile: {
			title: 'Loading file...',
			message: 'This file is relatively big so it may take a while before it is displayed.'
		},
		message: 'Message',
		mount: {
			successTitle: 'SD card mounted',
			errorTitle: 'Failed to mount SD card'
		},
		newDirectory: {
			errorTitle: 'Failed to create directory',
			successTitle: 'Directory created',
			successMessage: 'Successfully created directory {0}'
		},
		newFilament: {
			errorTitle: 'Failed to create filament',
			errorTitleMacros: 'Failed to create filament macros',
			successTitle: 'Filament created',
			successMessage: 'Successfully created filament {0}'
		},
		rename: {
			success: 'Successfully renamed {0} to {1}',
			error: 'Failed to rename {0} to {1}',
		},
		renameFilament: {
			errorTitle: 'Failed to rename filament',
			errorStillLoaded: 'This filament is still loaded. Please unload it before you proceed'
		},
		responseTooLong: 'Response too long, see Console',
		upload: {
			title: 'Uploading {0} @ {1}, {2}% complete',
			message: 'Please stand by while the file is being uploaded...',
			success: 'Upload of {0} successful after {1}',
			successMulti: 'Successfully uploaded {0} files',
			error: 'Failed to upload {0}',
			queueTitle: '{0} has been added to queue',
			queued: 'This file is quite big this may take up to {0} to be fully uploaded',
		},
		parse: {
			title: 'Parsing: <b>{0}</b>',
			speed: 'Speed: {0} {1}',
			eta: 'Time left: {0}',
		}
	},
	panel: {
		atx: {
			caption: 'ATX Power',
			on: 'On',
			off: 'Off'
		},
		babystepping: {
			caption: 'Z Babystepping',
			current: 'Current Offset: {0}'
		},
		extrude: {
			caption: 'Extrusion Control',
			mix: 'Mix',
			mixRatio: 'Mix Ratio:',
			amount: 'Feed amount in {0}:',
			feedrate: 'Feedrate in {0}:',
			retract: 'Retract',
			extrude: 'Extrude'
		},
		extrusionFactors: {
			caption: 'Extrusion Factors',
			changeVisibility: 'Change Visibility',
			extruder: 'Extruder {0}',
			noExtruders: 'No Extruders'
		},
		fan: {
			caption: 'Fan Control',
			selection: 'Fan Selection:',
			toolFan: 'Tool Fan',
			fan: 'Fan {0}'
		},
		fans: {
			caption: 'Fans',
			changeVisibility: 'Change Visibility',
			toolFan: 'Tool Fan',
			fan: 'Fan {0}',
			noFans: 'No Fans'
		},
		heightmap: {
			scale: 'Scale:',
			orMore: 'or more',
			orLess: 'or less',
			axes: 'Axes:',
			notAvailable: 'height map not available',
			numPoints: 'Number of points: {0}',
			radius: 'Probing radius: {0}',
			area: 'Probe area: {0}',
			maxDeviations: 'Maximum deviations: {0} / {1}',
			biasError: 'Mean error: {0}',
			meanError: 'Absolute error: {0}',
			rmsError: 'RMS error: {0}',
			topView: 'Top view',
			perspective: 'Default view',
			colorScheme: 'Color scheme:',
			terrain: 'Terrain',
			heat: 'Heat',
			reload: 'Reload',
			diff: 'Diff',
			probing: {
				perfect: 'OK',
				valid: 'OK',
				danger: 'Average',
				reprobe: 'Default'
			},
			probeDate: "Probed the : {0} at {1}",
			mapName: "Loaded heightmap: {0}"
		},
		jobControl: {
			caption: 'Job Control',
			cancelJob: 'Cancel Job',
			cancelPrint: 'Cancel Print',
			cancelSimulation: 'Cancel Simulation',
			pauseJob: 'Pause Job',
			pausePrint: 'Pause Print',
			pauseSimulation: 'Pause Simulation',
			resumeJob: 'Resume Job',
			resumePrint: 'Resume Print',
			resumeSimulation: 'Resume Simulation',
			repeatJob: 'Start Again',
			repeatPrint: 'Print Again',
			repeatSimulation: 'Simulate Again',
			autoSleep: 'Enable Auto-Sleep'
		},
		jobData: {
			caption: 'Collected Data',
			warmUpDuration: 'Warm-Up Time',
			currentLayerTime: 'Current Layer Time',
			lastLayerTime: 'Last Layer Time',
			jobDuration: 'Job Duration'
		},
		jobEstimations: {
			caption: 'Estimations based on',
			filament: 'Filament Usage',
			file: 'File Progress',
			layer: 'Layer Time',
			slicer: 'Slicer',
			simulation: 'Simulation'
		},
		jobInfo: {
			caption: 'Job Information',
			height: 'Height:',
			layerHeight: 'Layer Height:',
			filament: 'Filament Usage:',
			generatedBy: 'Generated by:'
		},
		movement: {
			caption: 'Machine Movement',
			compensation: 'Compensation & Calibration',
			runBed: 'True Bed Levelling (G32)',
			runDelta: 'Delta Calibration (G32)',
			runAdvanced: 'Machine Calibration',
			compensationInUse: 'Compensation in use: {0}',
			disableBedCompensation: 'Disable Bed Compensation (M561)',
			disableMeshCompensation: 'Disable Mesh Compensation (G29 S2)',
			editMesh: 'Define Area for Mesh Compensation (M557)',
			runMesh: 'Run Mesh Compensation (G29)',
			loadMesh: 'Load Saved Height Map from SD Card (G29 S1)',
			axesNotHomed: 'The following axis is not homed:|The following axes are not homed:',
			noAxes: 'No Axes',
			runNozzleHeight: 'Run nozzle height calibration',
			showHeightmap: "Shown the Heightmap"
		},
		settingsAbout: {
			caption: 'About',
			developedBy: 'Web Interface developed by',
			updatededBy: 'updated by',
			buildDate: "Build date: ",
			lxVersion: "Lynxter version: ",
			esVersion: "Embedded System version: ",
			for: 'for',
			licensedUnder: 'Licensed under the terms of the'
		},
		settingsAppearance: {
			caption: 'Appearance',
			darkTheme: 'Dark theme',
			language: 'Language',
			binaryFileSizes: 'Use binary file sizes',
			binaryFileSizesTitle: 'File sizes are displayed with a basis of 1024 (IEC) instead of 1000 (SI)',
			disableAutoComplete: 'Disable auto-completion',
			disableAutoCompleteTitle: 'Do not show auto-complete list when typing in code or temperature inputs'
		},
		settingsCommunication: {
			caption: 'Communication',
			pingInterval: 'PING interval when idle (ms)',
			ajaxRetries: 'Number of maximum AJAX retries',
			updateInterval: 'Update interval ({0})',
			extendedUpdateEvery: 'Extended status update interval',
			fileTransferRetryThreshold: 'Retry threshold for file transfers ({0})',
			crcUploads: 'Use CRC32 checksums for uploads',
			unavailable: 'No settings available'
		},
		settingsElectronics: {
			caption: 'Electronics',
			diagnostics: 'Diagnostics',
			board: 'Board: {0}',
			firmware: 'Firmware: {0} ({1})',
			dwsFirmware: 'Duet WiFi Server Version: {0}',
			updateNote: 'Note: You can install updates on the System page.'
		},
		settingsEndstops: {
			caption: 'Endstops',
			index: 'Index',
			triggered: 'Triggered'
		},
		settingsGeneral: {
			caption: 'General',
			factoryReset: 'Revert to factory defaults',
			settingsStorageLocal: 'Save settings in local storage',
			settingsSaveDelay: 'Update delay for settings changes ({0})',
			cacheStorageLocal: 'Save cache in local storage',
			cacheSaveDelay: 'Update delay for cache changes ({0})'
		},
		settingsListItems: {
			caption: 'List Items',
			toolTemperatures: 'Tool Temperatures',
			bedTemperatures: 'Bed Temperatures',
			chamberTemperatures: 'Chamber Temperatures',
			spindleRPM: 'Spindle RPM'
		},
		settingsMachine: {
			caption: 'Machine-Specific',
			revertDWC: 'Revert to DWC1',
			babystepAmount: 'Babystep amount ({0})',
			moveFeedrate: 'Feedrate for move buttons ({0})'
		},
		settingsNetwork: {
			caption: 'Networking',
			advanced: 'Advanced',
			publicIP: 'Machine\'s address',
			netmask: 'Netmask',
			gateway: 'Gateway',
			dns: 'DNS addresses'
		},
		settingsNotifications: {
			caption: 'Notifications',
			notificationErrorsPersistent: 'Do not close error messages automatically',
			notificationTimeout: 'Default notification timeout ({0})'
		},
		settingsWebcam: {
			caption: 'Webcam',
			webcamURL: 'Webcam URL (optional)',
			webcamUpdateInterval: 'Webcam update interval ({0})',
			webcamFix: 'Do not append extra HTTP qualifier when reloading images',
			webcamEmbedded: 'Embed webcam image in an iframe',
			webcamRotation: 'Rotate webcam image',
			webcamFlip: 'Flip webcam image',
			webcamResolution: 'Webcam resolution',
			webcamFramerate: 'Webcam framerate',
			flipNone: 'None',
			flipX: 'Flip X',
			flipY: 'Flip Y',
			flipBoth: 'Flip both',
		},
		settingsTimelapse: {
			caption: 'Timelapse',
			showPreview: 'Show timelapses',
			timelapseURL: 'Timelapse URL (optional)',
			timelapseResolution: 'Timelapse resolution',
			timelapseInterval: 'Take a picture at regular interval',
			timelapseUpdateInterval: 'Take a picture every {} s',
			timelapseLayer: 'Take a picture at every layer',
			timelapseMinFramerate: 'Min framerate',
			timelapseMaxFramerate: 'Max framerate',
			timelapseTargetDuration: 'Target duration'
		},
		speedFactor: {
			caption: 'Speed Factor'
		},
		status: {
			caption: 'Status',
			mode: 'Mode: {0}',
			toolPosition: 'Tool Position',
			machinePosition: 'Machine Position',
			extruders: 'Extruder Drives',
			extruderDrive: 'Drive {0}',
			speeds: 'Speeds',
			requestedSpeed: 'Requested Speed',
			topSpeed: 'Top Speed',
			sensors: 'Sensors',
			mcuTemp: 'MCU',
			mcuTempTitle: 'Minimum: {0}, Maximum: {1}',
			cpuTemp: 'CPU',
			cpuTempTitle: 'Minimum: {0}, Maximum: {1}',
			vIn: 'Vin',
			vInTitle: 'Minimum: {0}, Maximum {1}',
			fanRPM: 'Fan RPM',
			probe: 'Z-Probe|Z-Probes',
			noStatus: 'No Status'
		},
		tools: {
			caption: 'Tools',
			controlAll: 'Control All',
			turnEverythingOff: 'Turn Everything Off',
			allActiveTemperatures: 'Set all active temperatures',
			allStandbyTemperatures: 'Set all standby temperatures',
			tool: 'Tool {0}',
			loadFilament: 'Load Filament',
			changeFilament: 'Change Filament',
			unloadFilament: 'Unload Filament',
			heater: 'Heater {0}',
			current: 'Current',
			active: 'Active',
			standby: 'Standby',
			target: 'Target',
			bed: 'Bed {0}',
			chamber: 'Chamber {0}',
			extra: {
				caption: 'Extra',
				sensor: 'Sensor',
				value: 'Value',
				showInChart: 'Show in Chart',
				noItems: 'No Extra Heaters'
			},
			noTools: 'No Tools',
			noTool: 'Load a tool first'
		},
		webcam: {
			caption: 'Webcam Surveillance',
			alt: '(webcam image)',
			advanced: 'Advanced webcam controls'
		},
		toolOffset: {
			captionXY: 'X-Y Tool Offset',
			captionZ: 'Z Probe Offset',
			tool: 'Tool',
			offset: 'Offset <b>{0}</b>:',
			toolTrigHeight: 'Tool trigger height',
			bbStepping: 'Usual babystepping',
			dialog: {
				title: "X-Y Tool Offset",
				sucess: "Successfully saved new Tool offset",
				error: "An error occured {0}"
			}
		},
		toolAngle: {
			caption: 'Tool angle calibration',
			angle: 'Angle <b>{0}</b>',
			active: 'Active angle',
			standby: 'Standby angle',
			run: 'Calibrate {0} angle',
			auto: 'Auto calibraton'
		},
		tiltCompensation: {
			caption: 'X-Y Tilt Compensation',
			tilt: 'Tilt <b>{0}</b>',
			offset: 'Offset <b>{0}</b>',
			tooltip: 'Offset on {0} axis',
			switch: 'Display tilt as :',
			rotation: 'Rotation around {0}',
			buttonCaption: {
				decrease: 'Decrease bed tilt around the {0} axis (M666 {1}xxx)',
				increase: 'Increase bed tilt around the {0} axis (M666 {1}xxx)',
			}
		},
		toolPID: {
			caption: 'PID calibration',
			tool: 'Tool',
			pid: 'Calibration PID <b>{0}</b>',
			calibration: 'calibration T°',
			pwm: 'calibration PWM',
			run: 'Run PID tuning',
			save: 'Save results'

		},
	},
	loadTool: {
		toolhead: 'Select a toolhead',
		network: {
			disconnected: 'Network disconnected',
			booting: 'Booting'
		},
		calibrationTool: "Load calibration tool",
		debug: "Access DWC (No tool)",
		refreshIface: "Refresh the interface",
		refreshTools: "Refresh tools List",
		enableTool: "show/hide tools",
	},
	power_settings: 'Power settings',
}
