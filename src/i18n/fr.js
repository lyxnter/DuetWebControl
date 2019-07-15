export default {
	language: 'Français',
	'$vuetify': {
		dataIterator: {
			rowsPerPageText: 'Elements par page:',
			rowsPerPageAll: 'Tous',
			pageText: '{0}-{1} sur {2}',
			noResultsText: 'Aucun enregistrement correspondant trouvé',
			nextPage: 'Page suivante',
			prevPage: 'Page précédente'
		},
		dataTable: {
			rowsPerPageText: 'Colones par page:'
		},
		noDataText: 'Aucune donnée disponible'
	},
	button: {
		add: {
			caption: 'Ajouter'
		},
		connect: {
			connect: 'Connection',
			connecting: 'Connection...',
			disconnect: 'Déconnection',
			disconnecting: 'Déconnection...'},
		login: {
			login: 'S\'identifier',
			loggingin: 'Identification...',
			logout: 'Se déconnecter',
			loggingout: 'Déconnection...'
		},
		emergencyStop: {
			caption: 'Arret d\'urgence',
			title: 'Forcer le redémarrage de la machine (M112+M999)'
		},
		home: {
			caption: 'Déplacement a l\'origine {0}',
			captionAll: 'Déplacement de tous les axes aux origines',
			title: 'Déplace l\'axe {0} a l\'origine (G28 {0})',
			titleAll: 'Déplacement de tous les axes a l\'origine (G28)'
		},
		newDirectory: {
			caption: 'Nouveau Dossier'
		},
		newFilament: {
			caption: 'Nouveau Filament'
		},
		newFile: {
			caption: 'Nouveau Fichier'
		},
		refresh: {
			caption: 'Rafraichir'
		},
		upload: {
			gcodes: {
				caption: 'Télécharger un(des) fichier(s) G-Code',
				title: 'Télécharger un ou plusieurs fichiers G-Code (glissé-déposé est aussi supporté)'
			},
			start: {
				caption: 'Télécharger & Imprimer',
				title: 'Télécharger & Imprimer un ou plusieurs fichiers G-Code (glissé-déposé est aussi supporté)'
			},
			macros: {
				caption: 'Télécharger un(des) fichier(s) Macro',
				title: 'Télécharger un ou plusieurs fichiers macro (glissé-déposé est aussi supporté)'
			},
			materials: {
				caption: 'Télécharger un(des) fichier(s) Materiau',
				title: 'Télécharger un ou plusieurs fichiers materiau (glissé-déposé est aussi supporté)'

			},
			filaments: {
				caption: 'Télécharger un(des) fichier(s) Filament',
				title: 'Télécharger un ou plusieurs fichiers filament (glissé-déposé est aussi supporté)'
			},
			liquids: {
				caption: 'Télécharger un(des) fichier(s) Liquide',
				title: 'Télécharger un ou plusieurs fichiers liquide (glissé-déposé est aussi supporté)'
			},
			display: {
				caption: 'Télécharger un(des) fichier(s) Menu',
				title: 'Télécharger un ou plusieurs fichiers menu (glissé-déposé est aussi supporté)'
			},
			sys: {
				caption: 'Télécharger un(des) fichier(s) Sistèmes',
				title: 'Télécharger un ou plusieurs fichiers system (glissé-déposé est aussi supporté)'
			},
			www: {
				caption: 'Télécharger un(des) fichier(s) Web',
				title: 'Télécharger un ou plusieurs fichiers web (glissé-déposé est aussi supporté)'
			},
			update: {
				caption: 'Télécharger un(des) fichier(s) Mise-a-jour',
				title: 'Télécharger un ou plusieurs fichiers de mise a jour (glissé-déposé est aussi supporté)'
			}
		}
	},
	chart: {
		layer: {
			caption: 'Layer Chart',
			layerTime: 'Durée couche',

			showLastLayers: 'Afficher les {0} dernières couches',
			showAllLayers: 'Afficher toutes les couches',

			layer: 'Couche {0}',
			layerDuration: 'Durée: {0}',
			layerHeight: 'Hauteur des couches: {0}',
			filamentUsage: 'Filament utilisé: {0}',
			fractionPrinted: 'Progression du fichier: {0}'
		},
		temperature: {
			caption: 'Graphique des Températures',
			heater: 'Buse {0}'
		}
	},
	dialog: {
		connect: {
			title: 'Se connecter à la machine',
			prompt: 'Entrez le nom d’hôte et le mot de passe de la machine à laquelle vous souhaitez vous connecter:',
			hostPlaceholder: 'Adresse machine',
			hostRequired: 'l\'Adresse est obligatoire',
			passwordPlaceholderOptional: 'Mot de passe (optionnel)',
			passwordPlaceholder: 'Mot de passe',
			passwordRequired: 'Le mot de passe est obligatoire',
			connect: 'Connection'
		},
		login: {
			title: 'Connexion au compte',
			prompt: 'Veuillez saisir votre identifiant et votre mot de passe:',
			hostPlaceholder: 'Identifiant',
			hostRequired: 'l\'identifiant est obligatoire',
			passwordPlaceholderOptional: 'Mot de passe (facultatif)',
			passwordPlaceholder: 'Mot de passe',
			passwordRequired: 'Le mot de passe est obligatoire',
			connect: 'Connexion'
		},
		connection: {
			connecting: 'Connection...',
			disconnecting: 'Déconnection...',
			loggingin: 'Connection...',
			loggingout: 'Déconnection...',
			reconnecting: 'Connexion perdue, tentative de reconnexion...',
			standBy: 'Merci de patienter...'
		},
		editExtrusionAmount: {
			title: 'Modifier la quantité d\'extrusion',
			prompt: 'S\'il vous plaît entrer une nouvelle quantité pour le bouton cliqué:'
		},
		editExtrusionFeedrate: {
			title: 'Modifier le débit d\'extrusion',
			prompt: 'Entrez une nouvelle vitesse pour le bouton sur lequel vous avez cliqué:'
		},
		factoryReset: {
			title: 'Réinitialiser les paramètres d\'usine?',
			prompt: 'Êtes-vous sûr de vouloir réinitialiser les paramètres d\'usine? Tous les paramètres enregistrés seront perdus.'
		},
		filament: {
			titleChange: 'Changer de Filament',
			titleLoad: 'Charger un Filament',
			prompt: 'Merci de choisir un filament:'
		},
		fileEdit: {
			gcodeReference: 'G-Code Reference',
			menuReference: 'Menu Reference',
			save: 'Save'
		},
		meshEdit: {
			title: 'Set Mesh Parameters',
			radius: 'Probe Radius',
			spacing: 'Spacing',
			startCoordinate: 'Start coordinate in {0} direction',
			endCoordinate: 'End coordinate in {0} direction',
			spacingDirection: 'Spacing in {0} direction'
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
		resetHeaterFault: {
			title: 'Effacer erreur buse',
			prompt: 'A heater fault has occurred on heater {0}. It is strongly advised to turn off your machine now and to check your wiring before you continue. If you are absolutely sure that this is not a phsical problem, you can reset the heater fault ON YOUR OWN RISK. Be aware that this is NOT RECOMMENDED and can lead to further problems. How would you like to proceed?',
			resetFault: 'Effacer erreur'
		},
		runMacro: {
			title: 'Run {0}',
			prompt: 'Do you want to run {0}?'
		},
		startJob: {
			title: 'Start {0}',
			prompt: 'Do you want to start {0}?'
		},
		update: {
			title: 'Install updates?',
			prompt: 'You have uploaded at least one firmware update. Would you like to install them now?'
		},
		inputRequired: 'Please enter a value',
		numberRequired: 'Please enter a valid number'
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
		connectionError: 'Failed to maintain connection to {0}',
		disconnect: 'Could not disconnect cleanly from {0}',
		disconnected: 'Could not complete action because the connection has been terminated',
		cancelled: 'Operation has been cancelled',
		cors: 'CORS request failed',
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
		cancel: 'Annuler',
		yes: 'Oui',
		no: 'Non',
		close: 'Fermer',
		reset: 'Reinitialiser',
		noValue: 'n/a',
		loading: 'chargement en cours',
		error: 'Erreur',
		info: 'Info',
		warning: 'Danger',
		success: 'Succes',
		heaterStates: [
			'off',
			'veille',
			'actif',
			'erreur',
			'reglage'
		],
		status: {
			updating: 'Mise a jour',
			off: 'Off',
			halted: 'Arrétée',
			pausing: 'En pause',
			paused: 'En pause',
			resuming: 'Reprise',
			printing: 'Impression',
			processing: 'Processing',
			simulating: 'Simulating',
			busy: 'Busy',
			changingTool: 'Changing Tool',
			idle: 'Idle',
			unknown: 'Unknown'
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
			placeholder: 'Send Code...'
		},
		addTemperature: 'Value of new temperature',
		addRPM: 'Value of new preset'
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
			goUp: 'Go up'
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
		filament: {
			noFilaments: 'No Filaments'
		},
		macro: {
			caption: 'Macros',
			noMacros: 'No Macros',
			run: 'Run Macro',
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
			noFiles: 'No System Files'
		}
	},
	menu: {
		control: {
			caption: 'Controle Machine',
			dashboard: 'Tableau de bord',
			console: 'Console',
			heightmap: 'Height Map'
		},
		job: {
			caption: 'Travail d\'impression',
			status: 'Status',
			webcam: 'Webcam',
			visualiser: 'Visualiser'
		},
		files: {
			caption: 'Gestion de fichiers',
			jobs: 'Fichiers G-Code',
			materials: 'Materiaux',
			macros: 'Macros',
			display: 'Affichage',
			system: 'Systeme',
			web: 'Web'
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
			caption: 'Parametres',
			general: 'General',
			machine: 'Machine',
			update: 'Mise a jour',
			setup: 'Equipement/Setup',
			support: 'Support',
			maintenance:'Maintnance',
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
		responseTooLong: 'Reponse trop longue, voir Console',
		upload: {
			title: 'Téléchargement {0} @ {1}, {2}%',
			message: 'Merci de patienter pendant le téléchargement...',
			success: 'Téléchargement de {0} réussit après {1}',
			successMulti: 'Successfully uploaded {0} files',
			error: 'Failed to upload {0}'
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
			numPoints: 'Number of points: {0}',
			radius: 'Probing radius: {0}',
			area: 'Probe area: {0}',
			maxDeviations: 'Maximum deviations: {0} / {1}',
			meanError: 'Mean error: {0}',
			rmsError: 'RMS error: {0}',
			topView: 'Top view',
			colorScheme: 'Color scheme:',
			terrain: 'Terrain',
			heat: 'Heat',
			reload: 'Reload Height Map'
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
			caption: 'Estimations',
			filament: 'Based on Filament Usage',
			file: 'Based on File Progress',
			layer: 'Based on Layer Time',
			slicer: 'Based on Slicer',
			simulation: 'Based on Simulation'
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
			compensationInUse: 'Compensation in use: {0}',
			disableBedCompensation: 'Disable Bed Compensation (M561)',
			disableMeshCompensation: 'Disable Mesh Compensation (G29 S2)',
			editMesh: 'Define Area for Mesh Compensation (M557)',
			runMesh: 'Run Mesh Compensation (G29)',
			loadMesh: 'Load Saved Height Map from SD Card (G29 S1)',
			axesNotHomed: 'The following axis is not homed:|The following axes are not homed:',
			noAxes: 'No Axes'
		},
		settingsAbout: {
			caption: 'About',
			developedBy: 'Web Interface developed by',
			for: 'for',
			licensedUnder: 'Licensed under the terms of the'
		},
		settingsAppearance: {
			caption: 'Appearance',
			darkTheme: 'Dark theme',
			language: 'Language',
			binaryFileSizes: 'Use binary file sizes',
			binaryFileSizesTitle: 'File sizes are displayed with a basis of 1024 (IEC) instead of 1000 (SI)'
		},
		settingsCommunication: {
			caption: 'Communication',
			ajaxRetries: 'Number of maximum AJAX retries',
			updateInterval: 'Update interval ({0})',
			extendedUpdateEvery: 'Extended status update interval',
			fileTransferRetryThreshold: 'Retry threshold for file transfers ({0})'
		},
		settingsElectronics: {
			caption: 'Electronics',
			diagnostics: 'Diagnostics',
			firmware: 'Firmware: {0} ({1})',
			dwsFirmware: 'Duet WiFi Server Version: {0}'
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
			flipNone: 'None',
			flipX: 'Flip X',
			flipY: 'Flip Y',
			flipBoth: 'Flip both'
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
			mcuTemp: 'MCU Temperature',
			mcuTempTitle: 'Minimum: {0}, Maximum: {1}',
			vIn: 'Vin',
			vInTitle: 'Minimum: {0}, Maximum {1}',
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
			bed: 'Bed {0}',
			chamber: 'Chamber {0}',
			extra: {
				caption: 'Extra',
				sensor: 'Sensor',
				value: 'Value',
				showInChart: 'Show in Chart',
				noItems: 'No Extra Heaters'
			},
			noTools: 'No Tools'
		},
		webcam: {
			caption: 'Webcam Surveillance',
			alt: '(webcam image)'
		}
	}
}
