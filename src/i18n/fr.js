
export default {
	language: 'Français',
	'$vuetify': {
		close: 'Fermer',
		dataIterator: {
			pageText: '{0}-{1} sur {2}',
			noResultsText: 'Aucun enregistrement correspondant trouvé',
			loadingText: "Chargement de l'élément...",
			rowsPerPageAll: 'Toutes',
		},
		dataTable: {
			itemsPerPageText: 'Eléments par page:',
			rowsPerPageText: 'Lignes par page',
			ariaLabel: {
				sortDescending: ': Tri décroissant. Activer pour supprimer le tri.',
				sortAscending: ': Tri croissant. Activer pour trier par ordre décroissant.',
				sortNone: ': Non trié. Activer pour trier par ordre croissant.'
			},
			sortBy: 'Trier par'
		},
		dataFooter: {
			itemsPerPageText: 'Élements par page:',
			itemsPerPageAll: 'Tous',
			nextPage: 'Page suivante',
			prevPage: 'Page précédente',
			firstPage: 'Première page',
			lastPage: 'Dernière page',
			pageText: '{0}-{1} de {2}'
		},
		datePicker: {
			itemsSelected: '{0} sélectionnés'
		},
		noDataText: 'Aucune donnée disponible',
		carousel: {
			prev: 'Visuel précédent',
			next: 'Visuel suivant'
		},
		calendar: {
			moreEvents: '{0} plus'
		},
		fileInput: {
			counter: '{0} fichiers',
			counterSize: '{0} fichiers ({1} au total)'
		},
		timePicker: {
			am: 'AM',
			pm: 'PM'
		}
	},
	button: {
		add: {
			caption: 'Ajouter'
		},
		parkHead: {
			caption: 'Position parking'
		},
		connect: {
			connect: 'Connecter',
			connecting: 'Connexion...',
			disconnect: 'Se déconnecter',
			disconnecting: 'Déconnexion...'
		},
		login: {
			login: 'S\'identifier',
			loggingin: 'Connexion...',
			logout: 'Se déconnecter',
			loggingout: 'Déconnexion...'
		},
		emergencyStop: {
			caption: 'Arrêt D\'Urgence',
			title: 'Forcer un redémarrage logiciel immédiat (M112+M999)'
		},
		home: {
			caption: 'Origine {0}',
			captionAll: 'Tout aux origines',
			title: 'Déplace l\'axe {0} à son origine (G28 {0})',
			titleAll: 'Déplace tout les axes aux origines (G28)'
		},
		newDirectory: {
			caption: 'Nouveau dossier'
		},
		newFilament: {
			caption: 'Nouveau filament'
		},
		newLiquid: {
			caption: 'Nouveau liquide'
		},
		newFile: {
			caption: 'Nouveau fichier'
		},
		refresh: {
			caption: 'Rafraîchir'
		},
		preloadPrime: {
			caption: 'Charger/Amorcer',
			preload: 'Précharger {0}',
			prime: 'Amorcer {0}',
			unload: 'Décharger {0}',
			preheat: 'Pre chauffer {0}'
		},
		preheat: {
			caption: 'Préchauffer',
			preheat: 'Préchauffer pour {0}',
		},
		upload: {
			generic: {
				caption: 'Envoyer fichier(s)',
				title: 'Envoyer un ou plusieurs fichiers (le glisser/déposer est supporté)'
			},
			gcodes: {
				caption: 'Envoyer fichier(s) G-Code',
				title: 'Envoyer un ou plusieurs fichiers G-Code (le glisser/déposer est supporté)'
			},
			start: {
				caption: 'Envoyer & Lancer',
				title: 'Envoyer & lancer un fichier G-Code (le glisser/déposer est supporté)'
			},
			macros: {
				caption: 'Envoyer fichier(s) macro',
				title: 'Envoyer un ou plusieurs fichiers macros (le glisser/déposer est supporté)'
			},
			filaments: {
				caption: 'Envoyer config filament',
				title: 'Envoyer une ou plusieures configuration de filament (le glisser/déposer est supporté)'
			},
			liquids: {
				caption: 'Envoyer config liquide',
				title: 'Envoyer une ou plusieures configuration de liquide (le glisser/déposer est supporté)'
			},
			display: {
				caption: 'Envoyer fichiers menu',
				title: 'Envoyer un ou plusieurs fichiers menu (le glisser/déposer est supporté)'
			},
			sys: {
				caption: 'Envoyer fichiers système',
				title: 'Envoyer un ou plusieurs fichiers système (le glisser/déposer est supporté)'
			},
			www: {
				caption: 'Envoyer fichiers web',
				title: 'Envoyer un ou plusieurs fichiers web (le glisser/déposer est supporté)'
			},
			update: {
				caption: 'Envoyer mise à jour',
				title: 'Envoyer un paquet de mise à jour (le glisser/déposer est supporté)'
			},
			preview: {
				caption: 'Envoyer apercu',
				title: 'Envoyer un ou plusieurs apercu (le glisser/déposer est supporté)'
			},
		}
	},
	chart: {
		layer: {
			caption: 'couches',
			layerTime: 'Temps de couche',

			showLastLayers: 'Afficher les {0} dernières couches',
			showAllLayers: 'Afficher toutes les couches',

			layer: 'Couche {0}',
			layerDuration: 'Durée: {0}',
			layerHeight: 'Hauteur de couche: {0}',
			filamentUsage: 'Utilisation de filament: {0}',
			fractionPrinted: 'Progrès du fichier: {0}'
		},
		temperature: {
			caption: 'Températures',
			heater: 'Résistance {0}',
			noData: 'Aucune donnée'
		},
		fan: {
			caption: 'Ventilateurs',
			heater: 'Résistance {0}',
			noData: 'Aucune donnée'
		},
		smoothing: {
			caption: 'Lissage',
			off: "Off",
			low: "Faible",
			med: "Moyen",
			high: "Haut"
		}
	},
	dialog: {
		cancel: {
			title: "Annuler l'impression",
			prompt: "Souhaitez vous annuler <b>'{0}'</b>?"
		},
		changeMoveStep: {
			title: 'Modifier distance de mouvement',
			prompt: 'Merci d\'entrer une nouvelle valeur pour le bouton de mouvement cliqué:'
		},
		configUpdated: {
			title: 'Redémarrer la machine?',
			prompt: 'Voulez-vous redémarrer la machine pour appliquer la mise à jour de la configuration?'
		},
		confirmShutdown: {
			title: 'Eteindre machine',
			prompt: "Etes vous sûr de vouloir éteindre la machine",
		},
		connect: {
			title: 'Connecter à la machine',
			prompt: 'Merci d\'entrer le nom d\'hôte et le mot de passe de la machine à laquelle vous voulez vouz connecter:',
			hostPlaceholder: 'Nom d\'Hôte',
			hostRequired: 'Nom d\'Hôte requis',
			passwordPlaceholderOptional: 'Mot de passe (optionnel)',
			passwordPlaceholder: 'Mot de passe',
			passwordRequired: 'Mot de passe requis',
			connect: 'Connexion'
		},
		connection: {
			connecting: 'Connexion...',
			disconnecting: 'Déconnexion...',
			updating: 'Veuillez patienter pendant l\'installation des mises à jour....',
			reconnecting: 'Connexion perdue, tentative de reconnexion...',
			standBy: 'Merci de patienter...',
			loadingtool: "Chargement de l'outil, Merci de patienter..."
		},
		editExtrusionAmount: {
			title: 'Modifier quantité d\'extrusion',
			prompt: 'Merci d\'enter une nouvelle quantité pour le bouton cliqué:'
		},
		editExtrusionFeedrate: {
			title: 'Modifier vitesse d\'extrusion',
			prompt: 'Merci d\'entrer une nouvelle vitesse pour le bouton cliqué:'
		},
		factoryReset: {
			title: 'Effectuer restauration des paramètres d\'usine?',
			prompt: 'Etes-vous sûr de vouloir restaurer des paramètres d\'usine ? Tout les paramètres sauvegardés seront perdus.'
		},
		filament: {
			titleChange: 'Changer filament',
			titleLoad: 'Charger filament',
			prompt: 'Merci de choisir un filament:'
		},
		fileEdit: {
			gcodeReference: 'Références G-Code',
			menuReference: 'Référence menu',
			save: 'Sauvegarder',
			confirmClose: 'Le fichier a été modifié. Si vous continuez, vos modifications seront perdues.'
		},
		meshEdit: {
			title: 'Calibration personnalisée',
			new: "Nouvelle calibration",
			radius: 'Diamètre de palpage (mm)',
			spacing: 'Espacement des points (mm)',
			startCoordinate: 'Position {0} min (mm)',
			endCoordinate: 'Position {0} max (mm)',
			spacingDirection: 'Espacement des points en {0} (mm)',
			bed: 'Temperature plateau (°C)',
			chamber: 'Temperature étuve (°C)',
			rectangle: 'Rectangle',
			circle: 'Cercle',
			diameter: 'Diamètre ',
			success: 'Nouvelle calibration ajoutée a la liste'
		},
		newDirectory: {
			title: 'Nouveau dossier',
			prompt: 'Merci d\'entrer un nom de nouveau dossier:'
		},
		newFilament: {
			title: 'Nouveau filament',
			prompt: 'Merci d\'entrer un nom pour le nouveau filament:'
		},
		newFile: {
			title: 'Nouveau fichier',
			prompt: 'Merci d\'entrer un nom de nouveau fichier:'
		},
		renameFile: {
			title: 'Renommer un fichier ou dossier',
			prompt: 'Merci d\'entrer un nouveau nom:'
		},
		moveFile: {
			title: 'Renommer un fichier ou dossier avant de le déplacer',
			prompt: 'Merci d\'entrer un nouveau nom:'
		},
		resetHeaterFault: {
			title: 'Réinitialiser Défaut de chauffe',
			prompt: 'Un défaut de chauffe s\'est produit sur la <b>Résistance {0}</b>.<br/> Il est fortement recommandé d\'éteindre la machine maintenant et de vérifier le câblage avant de continuer.<br/><b>-</b> Si vous êtes sûr qu\'il n\'y a pas de problème physique, vous pouvez réinitialiser le défaut. Soyez conscient que ce n\'est <span style="color: red; font-weight: bold;">PAS RECOMMANDÉ</span> et peut provoquer d\'autres problèmes.<br/><b>-</b> Si le problème persiste nous vous conseillons de contacter le <a style="font-weight: bold;" href="mailto:support@lynxter.fr">SAV Lynxter</a>. <br/><br/>Comment voulez-vous proceder?',
			/*Un défaut de chauffage s'est produit sur le chauffage 1. Il est fortement recommandé d'éteindre la machine maintenant et vérifier votre câblage avant de continuer. Si vous êtes absolument sûr qu'il n'y a pas de problème physique, vous pouvez réinitialiser le défaut <span style="color: red; font-weight: bold;">A VOS RISQUES ET PERILS</span>. Soyez conscient que ce n'est <span style="color: red; font-weight: bold;">PAS RECOMMANDÉ</span> et peut provoquer plus de problèmes. Comment voulez-vous proceder?*/
			resetFault: 'Réinitialiser Défaut'
		},
		runMacro: {
			title: 'Lancer {0}',
			prompt: 'Voulez-vous lancer {0}?'
		},
		startJob: {
			title: 'Démarrer {0}',
			prompt: 'Voulez-vous démarrer {0}?'
		},
		delete: {
			title: 'Supprimer {0}?',
			prompt: 'Voulez vous vraiment supprimer <ul>',
			multiple: '{0} fichiers'
		},
		update: {
			title: 'Installer Mise à Jour?',
			prompt: 'Vous avez envoyé au moins une mise à jour logiciel. Voulez-vous les installer maintenant?'
		},
		inputRequired: 'Merci d\'entrer une nouvelle valeur',
		numberRequired: 'Merci d\'entrer un nombre valide',
		temperature:  {
			title: "Saisir la nouvelle temperature",
			prompt: "Saisir la temperature {1} pour {0}"
		},
		fileExists: 'Le fichier/dossier: <b>{0}</b> existe déjà<br/> alternative suggérée <b>{1}</b>',
	},
	directory: {
		display: 'Répertoire Menu',
		filaments: 'Répertoire Filaments',
		gcodes: 'Répertoire G-Codes',
		macros: 'Répertoire Macros',
		sys: 'Répertoire Systeme',
		www: 'Répertoire WWW'
	},
	error: {
		notImplemented: '{0} n\'est pas implémenté',
		invalidPassword: 'Mauvais mot de passe!',
		noFreeSession: 'Plus de sessions libre!',
		connect: 'Échec de la connexion à {0}',
		disconnect: 'Impossible de se déconnecter correctement de {0}',
		disconnected: 'Impossible de compléter l\'action car la connexion s\'est terminée',
		cancelled: 'Opération annulée',
		network: 'Erreur réseau',
		timeout: 'Réquête HTTP expirée',
		driveUnmounted: 'Le lecteur cible est démonté',
		directoryNotFound: 'Répertoire {0} introuvable',
		fileNotFound: 'Fichier {0} introuvable',
		invalidHeightmap: 'Carte de compensation invalide',
		operationFailed: 'Échec de l\'opération (Raison: {0})',
		uploadStartWrongFileCount: 'Seulement un fichier peut être envoyé & démarré',
		uploadNoSingleZIP: 'Seulement un fichier ZIP peut être envoyé à la fois',
		uploadNoFiles: 'Ce ZIP ne contient aucun fichier utilisable',
		uploadDecompressionFailed: 'Échec de la décompression du fichier ZIP',
		codeResponse: 'Impossible d\'exécuter le code car une mauvaise réponse a été reçue',
		codeBuffer: 'Impossible d\'exécuter le code car l\'espace tampon est épuisé',
		enterValidNumber: 'Merci d\'entrer un nombre valide',
		turnOffEverythingFailed: 'Impossible de tout éteindre',
		filelistRequestFailed: 'Impossible d\'obtenir la liste des fichiers',
		fileinfoRequestFailed: 'Impossible d\'obtenir les informations du fichier pour {0}',
		filamentsLoadFailed: 'Impossible de charger le filament',
		move: 'Impossible de déplacer {0} à {1}'
	},
	events: {
		connected: 'Connecté à {0}',
		connectionLost: 'N\'a pas réussi à maintenir la connexion à {0}',
		emergencyStop: 'Arrêt d\'urgence, tentative de reconnexion...',
		reconnecting: 'Connexion interrompue, tentative de reconnexion...',
		reconnected: 'Connexion établie',
		disconnected: 'Déconnecté de {0}'
	},
	generic: {
		ok: 'OK',
		cancel: 'Annuler',
		yes: 'Oui',
		no: 'Non',
		close: 'Fermer',
		reset: 'Réinitialiser',
		noValue: 'n/a',
		loading: 'Chargement',
		error: 'Erreur',
		edit: 'Modifier',
		info: 'Info',
		warning: 'Attention',
		success: 'Succès',
		print: 'Imprimer',
		showBuildplate: 'Afficher plateau',
		showPreview: 'Afficher pièce',
		preload: 'Précharger {0}',
		unload: 'Décharger l\'outil',
		debug: 'Retour chargement outil',
		heaterStates: [
			'off',
			'veille',
			'actif',
			'défaut',
			'réglage',
			'offline'
		],
		status: {
			updating: 'Mise à jour...',
			off: 'Off',
			halted: 'Interrompu',
			pausing: 'Mise en pause',
			paused: 'Pause',
			resuming: 'Reprise',
			printing: 'Impression',
			processing: 'Traitement',
			simulating: 'Simulation',
			busy: 'Occupé',
			changingTool: 'Changement d\'outil',
			idle: 'Repos',
			unknown: 'Inconnu',
			upgrading: 'Mise à jour...',
		},
		rpm: 'TPM',
		sdCard: 'Carte SD {0}',
		mounted: 'monté',
		notMounted: 'non monté',
		extracting: 'Extraction',
		uploading: 'Envoi en cours',
		active: 'Actif',
		standby: 'Veille'
	},
	input: {
		code: {
			send: 'Envoyer',
			placeholder: 'Envoyer code...'
		},
		addTemperature: 'Valeur de la nouvelle température',
		addRPM: 'Valeur du nouveau preset'
	},
	jobProgress: {
		simulating: 'Simulation {0}, {1} complète',
		simulated: 'Simulation {0}, 100 % complète',
		processing: 'Traitement {0}, {1} complet',
		processed: 'Traitement {0}, 100 % complet',
		printing: 'Impression {0}, {1} complète',
		printed: 'Impression {0}, 100 % complète',
		noJob: 'Aucun travail en cours.',
		layer: 'Couche {0} sur {1}',
		filament: 'Utilisation de filament: {0}',
		filamentRemaining: '{0} restant'
	},
	list: {
		baseFileList: {
			fileName: 'Nom',
			size: 'Taille',
			lastModified: 'Dernière modif',
			download: 'Télécharger',
			edit: 'Modifier',
			rename: 'Renommer',
			delete: 'Supprimer',
			downloadZIP: 'Télécharger en ZIP',
			noFiles: 'Aucun fichiers ou Répertoires',
			driveUnmounted: 'La carte n\'est pas monté',
			goUp: 'Remonter',
			showMore: 'Voir plus'
		},
		display: {
			noFiles: 'Aucun fichier d\'Affichage'
		},
		eventLog: {
			date: 'Date',
			type: 'Type',
			message: 'Événement',
			noEvents: 'Aucun événement',
			copy: 'Copier',
			clear: 'Effacer',
			downloadText: 'Télécharger en texte',
			downloadCSV: 'Télécharger en CSV'
		},
		filament: {
			noFilaments: 'Aucun Filaments'
		},
		liquid: {
			noLiquids: 'Aucun Liquide'
		},
		macro: {
			caption: 'Macros',
			noMacros: 'Aucune macro',
			run: 'Lancer macro',
			root: 'Source'
		},
		gcode: {
			caption: 'Gcodes',
			noGcodes: 'Aucun gcode',
			run: 'Lancer gcode',
			root: 'Source'
		},
		jobs: {
			height: 'Hauteur objet',
			layerHeight: 'Hauteur de couche',
			filament: 'Utilisation de filament',
			printTime: 'Temps d\'impression',
			simulatedTime: 'Temps simulé',
			generatedBy: 'Généré par',

			noJobs: 'Aucun gcode',
			start: 'Lancer fichier',
			simulate: 'Simuler fichier'
		},
		sys: {
			noFiles: 'Aucun fichier système',
			configToolNote: 'éditer via l\'outil de configuration'
		}
	},
	menu: {
		control: {
			caption: 'Contrôle de la machine',
			dashboard: 'Tableau de bord',
			console: 'Console',
			heightmap: 'Carte de compensation'
		},
		job: {
			caption: 'Travail',
			status: 'Status',
			webcam: 'Webcam',
			visualiser: 'Visualiser'
		},
		files: {
			caption: 'Gestion de fichiers',
			jobs: 'GCodes',
			filaments: 'Filaments',
			macros: 'Macros',
			display: 'Affichage',
			system: 'Système',
			web: 'Web',
			timelapses: 'Timelapses'
		},
		material: {
			materials: 'Materiaux',
			filaments: 'Filaments',
			liquids: 'Liquides',
			paste: 'Pates',
			pellets: 'Pellets',
			fibers: 'Fibres',
			hybrids: 'Hybrides',
		},
		settings: {
			caption: 'Paramètres',
			general: 'Général',
			machine: 'Spécifique à la machine',
			update: 'Mise à jour'
		},
		lynxter: {
			control: 'Contrôles',
			calibrate: 'Calibration',
			advanced: "Avancé"
		}
	},
	notification: {
		compress: {
			title: 'Compression des fichiers...',
			message: 'Merci de patienter pendant que vos fichiers se font compresser...',
			errorTitle: 'Échec de la compression des fichiers'
		},
		delete: {
			errorTitle: 'Impossible de supprimer {0}',
			errorMessageDirectory: 'Merci de vous assurez que ce dossier est vide',
			success: '{0} supprimé avec succès',
			successMultiple: '{0} objets supprimés avec succès'
		},
		deleteFilament: {
			errorTitle: 'Impossible de supprimer le(s) filament(s)',
			errorStillLoaded: 'Au moins un des filaments séléctionné est toujours chargé. Merci de les décharger avant de procéder',
			errorSubDirectories: 'Le filament {0} contient des sous-dossiers. Merci de les supprimer manuellement et réessayer.'
		},
		download: {
			title: 'Téléchargement {0} @ {1}, {2}% complet',
			message: 'Veuillez patienter pendant que le fichier est en téléchargement...',
			success: 'Téléchargement de {0} réussi après {1}',
			successMulti: 'Téléchargement de {0} fichiers réussi',
			error: 'Échec du téléchargement de {0}'
		},
		loadingFile: {
			title: 'Chargement du fichier',
			message: 'Ce fichier est relativement gros alors cela peut prendre du temps avant qu\'il s\'affiche.'
		},
		message: 'Message',
		mount: {
			successTitle: 'Carte SD montée',
			errorTitle: 'Impossible de monter la carte SD'
		},
		newDirectory: {
			errorTitle: 'Échec de la création du dossier',
			successTitle: 'Dossier créé',
			successMessage: 'Création du dossier {0} réussi'
		},
		newFilament: {
			errorTitle: 'Échec de la création du filament',
			errorTitleMacros: 'Échec de la création des macros de filament',
			successTitle: 'Filament créé',
			successMessage: 'Création du filament {0} réusssi'
		},
		rename: {
			success: 'Renommage de {0} en {1} réussi',
			error: 'Échec du renommage de {0} en {1}',
		},
		renameFilament: {
			errorTitle: 'Échec du renommage du filament',
			errorStillLoaded: 'Ce filament est toujours chargé. Merci de le décharger avant de procéder'
		},
		responseTooLong: 'Réponse trop longue, voir la console',
		upload: {
			title: 'Envoi {0} @ {1}, {2}% complet',
			message: 'Veuillez patienter pendant que le fichier est envoyé...',
			success: 'Envoi de {0} réussi après {1}',
			successMulti: 'Envoi de {0} fichiers réusssi',
			error: 'Échec de l\'envoi de {0}',
			queueTitle: '{0} a été ajouté a la queue',
			queued: 'Ce fichier peut prendre jusqu\'a {0} pour apparaitre',
		},
		parse: {
			title: '<b>{0}</b>',
			speed: 'Vitesse: {0} {1}',
			eta: 'Temps restant: {0}',
		}
	},
	panel: {
		atx: {
			caption: 'Contrôle de l\'alim',
			on: 'On',
			off: 'Off'
		},
		babystepping: {
			caption: 'Z Babystepping',
			current: 'Décalage actuel: {0}'
		},
		extrude: {
			caption: 'Contrôle de l\'extrusion',
			mix: 'Mix',
			mixRatio: 'Mix ratio:',
			amount: 'Avance en {0}:',
			feedrate: 'Vitesse en {0}:',
			retract: 'Rétracter',
			extrude: 'Extruder'
		},
		extrusionFactors: {
			caption: 'Facteurs d\'extrusion',
			changeVisibility: 'Changer visibilité',
			extruder: 'Extruder {0}',
			noExtruders: 'Aucun extruder'
		},
		fan: {
			caption: 'Contrôle des ventilateurs',
			selection: 'Séléction du ventilateur:',
			toolFan: 'Ventilateur outil',
			fan: 'Ventilateur {0}'
		},
		fans: {
			caption: 'Ventilateurs',
			changeVisibility: 'Changer visibilité',
			toolFan: 'Ventilateur outil',
			fan: 'Ventilateur {0}',
			noFans: 'Aucun ventilateur'
		},
		heightmap: {
			scale: 'Échelle:',
			orMore: 'ou plus',
			orLess: 'ou moins',
			axes: 'Axes:',
			notAvailable: 'Carte de compensation non disponible',
			numPoints: 'Nombre de points: {0}',
			radius: 'Rayon de palpage: {0}',
			area: 'Zone de palpage: {0}',
			maxDeviations: 'Déviation maximale: {0} / {1}',
			biasError: 'Erreur moyenne: {0}',
			meanError: 'Erreur absolue: {0}',
			rmsError: 'Erreur RMS: {0}',
			topView: 'Vue du dessus',
			perspective: 'Vue perspective',
			colorScheme: 'Code couleur:',
			terrain: 'Terrain',
			heat: 'Chaleur',
			diff: 'Diff',
			reload: 'Recharger',
			probing: {
				perfect: 'OK',
				valid: 'OK',
				danger: 'Moyen',
				reprobe: 'Défaut'
			},
			probeDate: "Palpé le : {0} à {1}",
			mapName: "Carte chargée: {0}"
		},
		jobControl: {
			caption: "Contrôle de l'impression",
			cancelJob: 'Annuler travail',
			cancelPrint: 'Annuler impression',
			cancelSimulation: 'Annuler simulation',
			pauseJob: 'Pause travail',
			pausePrint: 'Pause impression',
			pauseSimulation: 'Pause simulation',
			resumeJob: 'Reprendre  travail',
			resumePrint: 'Reprendre impression',
			resumeSimulation: 'Reprendre simulation',
			repeatJob: 'Recommencer',
			repeatPrint: 'Réimprimer',
			repeatSimulation: 'Simuler à nouveau',
			autoSleep: 'Activer veille automatique'
		},
		jobData: {
			caption: 'Données collectés',
			warmUpDuration: 'Temps de chauffe',
			currentLayerTime: 'Couche actuelle',
			lastLayerTime: 'Dernière couche',
			jobDuration: "Durée de l'impression"
		},
		jobEstimations: {
			caption: 'Estimations basée sur',
			filament: 'Utilisation de filament',
			file: 'Progrès du fichier',
			layer: 'Couche précédente',
			slicer: 'Trancheur',
			simulation: 'Simulation'
		},
		jobInfo: {
			caption: "Information sur l'impression",
			height: 'Hauteur:',
			layerHeight: 'Hauteur de couche:',
			filament: 'Utilisation de filament:',
			generatedBy: 'Généré par:'
		},
		movement: {
			caption: 'Mouvement machine',
			compensation: 'Compensation & Calibration',
			runBed: 'Calibration du plateau (G32)',
			runDelta: 'Calibration Machine (G32)',
			runAdvanced: 'Calibration Machine',
			compensationInUse: 'Compensation utilisée : {0}',
			disableBedCompensation: 'Désactiver compensation (M561)',
			disableMeshCompensation: 'Désactiver compensation (G29 S2)',
			editMesh: 'Calibration Machine avancée',
			runMesh: 'Lancer macro compensation (G29)',
			loadMesh: 'Charger compensation depuis la SD (G29 S1)',
			axesNotHomed: 'L\'axe suivant  n\'a pas été à son origine:|Les axes suivants n\'ont pas été à leur origine:',
			noAxes: 'Pas d\'axes',
			runNozzleHeight: 'Calibration hauteur buses',
			showHeightmap: "Afficher la carte"
		},
		settingsAbout: {
			caption: 'À propos',
			developedBy: 'Interface web dévelopée par',
			updatededBy: 'mis a jour par',
			lxVersion: "Version Lynxter: ",
			buildDate: "Compilé le: ",
			for: 'pour',
			licensedUnder: 'Sous licence selon les termes de la',
			esVersion: "Version système embarqué: ",
		},
		settingsAppearance: {
			caption: 'Apparence',
			darkTheme: 'Thème sombre',
			language: 'Langage',
			binaryFileSizes: 'Utiliser des tailles de fichiers binaires',
			binaryFileSizesTitle: 'Les tailles de fichier sont affichées avec une base de 1024 (IEC) au lieu de 1000 (SI)',
			disableAutoComplete: 'Disable auto-complete',
			disableAutoCompleteTitle: 'Do not show auto-complete list when typing in code or temperature inputs'
		},
		settingsCommunication: {
			caption: 'Communication',
			pingInterval: 'Intervalle PING au repos ({0})',
			ajaxRetries: 'Nombre maximal de tentatives AJAX',
			updateInterval: 'Intervalle de mise à jour ({0})',
			extendedUpdateEvery: 'Intervalle de mise à jour du statut étendu',
			fileTransferRetryThreshold: 'Limite d\'essais pour le transfert de fichiers ({0})',
			crcUploads: 'Utiliser les sommes de contrôle CRC32 pour les téléchargements',
			unavailable: 'Aucun réglage disponible.',
		},
		settingsElectronics: {
			caption: 'Électronique',
			diagnostics: 'Diagnostiquer',
			board: 'Carte: {0}',
			firmware: 'Microprogramme: {0} ({1})',
			dwsFirmware: 'Version Duet WiFi Server: {0}',
			updateNote: 'Remarque: Vous pouvez installer les mises à jour sur la page \'Système\'.'
		},
		settingsEndstops: {
			caption: 'Fin de courses',
			index: 'Index',
			triggered: 'Déclenché'
		},
		settingsGeneral: {
			caption: 'Général',
			factoryReset: 'Revenir aux paramètres d\'usine',
			settingsStorageLocal: 'Sauvegarder les paramètres dans le stockage local',
			settingsSaveDelay: 'Délai de mise à jour pour les modifications de paramètres ({0})',
			cacheStorageLocal: 'Sauvegarder le cache dans le stockage local',
			cacheSaveDelay: 'Délai de mise à jour pour les modifications du cache ({0})'
		},
		settingsListItems: {
			caption: 'Liste des Éléments',
			toolTemperatures: 'Températures de l\'Outil',
			bedTemperatures: 'Températures du plateau',
			chamberTemperatures: 'Températures de la chambre',
			spindleRPM: 'TPM de l\'axe'
		},
		settingsMachine: {
			caption: 'Spécifique à la machine',
			revertDWC: 'Revenir à DWC1',
			babystepAmount: 'Incrément Babystep ({0})',
			moveFeedrate: 'Vitesse pour les boutons de mouvement ({0})'
		},
		settingsNetwork: {
			caption: 'Paramètres réseaux',
			publicIP: 'Addresse IPv4 machine',
			advanced: 'Avancé',
			netmask: 'Masque de sous réseau',
			gateway: 'Passerelle par défaut',
			dns: 'Adresses DNS'
		},
		settingsNotifications: {
			caption: 'Notifications',
			notificationErrorsPersistent: 'Ne pas fermer les messages d\'erreur automatiquement',
			notificationTimeout: 'Délais d\'affichage des notifications par défaut ({0})'
		},
		settingsWebcam: {
			caption: 'Caméra',
			webcamURL: 'URL de la caméra (optionnel)',
			webcamUpdateInterval: 'Intervale de màj de la Webcam ({0})',
			webcamFix: 'Ne pas ajouter de qualificatif HTTP supplémentaire lors du rechargement d\'images',
			webcamEmbedded: 'Incorporer l\'image de la caméra dans un iframe',
			webcamRotation: 'Pivoter l\'image de la caméra',
			webcamFlip: 'Retourner l\'image de la caméra',
			webcamResolution: 'Résolution de la caméra',
			webcamFramerate: 'Ips de la caméra',
			flipNone: 'Non',
			flipX: 'Horizontalement',
			flipY: 'Verticalement',
			flipBoth: 'Retourner les deux'
		},
		settingsTimelapse: {
			caption: 'Timelapse',
			showPreview: 'Afficher timelapses',
			timelapseURL: 'URL du Timelapse (optionnel)',
			timelapseResolution: 'Résolution du timelapse',
			timelapseInterval: 'Capture a intervalle régulier',
			timelapseUpdateInterval: 'Prendre une image toutes les {} s',
			timelapseLayer: 'Capture a chaque couche',
			timelapseMinFramerate: 'framerate min Timelapse',
			timelapseMaxFramerate: 'framerate max Timelapse',
			timelapseTargetDuration: 'Durée finale Timelapse'
		},
		speedFactor: {
			caption: 'Facteur de vitesse'
		},
		status: {
			caption: 'Status',
			mode: 'Mode: {0}',
			toolPosition: 'Position outil',
			machinePosition: 'Position machine',
			extruders: 'Extrudeuse',
			extruderDrive: 'Moteur {0}',
			speeds: 'Vitesses',
			requestedSpeed: 'Vitesse demandée',
			topSpeed: 'Vitesses de pointe',
			sensors: 'Capteurs',
			cpuTemp: 'Température CPU',
			cpuTempTitle: 'Minimum: {0}, Maximum: {1}',
			mcuTemp: 'Température MCU',
			mcuTempTitle: 'Minimum: {0}, Maximum: {1}',
			vIn: 'Vin',
			vInTitle: 'Minimum: {0}, Maximum {1}',
			fanRPM: 'TPM ventilateur',
			probe: 'Sonde-Z|Sondes-Z',
			noStatus: 'Pas de statut'
		},
		tools: {
			caption: 'Outils',
			controlAll: 'Tout contrôler',
			turnEverythingOff: 'Tout Éteindre',
			allActiveTemperatures: 'Définir toutes les températures actives',
			allStandbyTemperatures: 'Définir toutes les températures de veille',
			tool: 'Outil {0}',
			loadFilament: 'Charger filament',
			changeFilament: 'Changer filament',
			unloadFilament: 'Décharger filament',
			heater: 'Chauffe {0}',
			current: 'Actuel',
			active: 'Actif',
			standby: 'Repos',
			target: 'Cible',
			bed: 'Plateau {0}',
			chamber: 'Chambre {0}',
			extra: {
				caption: 'Extra',
				sensor: 'Capteur',
				value: 'Valeur',
				showInChart: 'Afficher dans le graphique',
				noItems: 'Pas de Résistance supplémentaire'
			},
			noTools: 'Pas d\'Outils'
		},
		webcam: {
			caption: 'Caméra de surveillance',
			alt: '(image caméra)',
			advanced: 'Contrôles caméra avancés'
		},
		toolOffset: {
			captionXY: 'Décalage inter buses',
			captionZ: 'Décalage de la jauge Z',
			tool: 'Outil',
			offset: 'Décalage <b>{0}</b> :',
			toolTrigHeight: 'Hauteur de la jauge',
			bbStepping: 'Babystepping usuel',
			dialog: {
				title: "Décalage inter buses",
				sucess: "Décalage inter buses sauvegardé",
				error: "l'erreur suivante est survenue: {0}"
			}
		},
		toolAngle: {
			caption: 'Calibration angle outil',
			angle: 'Angle <b>{0}</b>',
			active: 'Angle actif',
			standby: 'Angle veille',
			run: 'Calibrer angle {0}',
			auto: 'Calibraton auto',
			move: 'Activer&nbsp;<b>{0}</b>'
		},
		tiltCompensation: {
			caption: 'Compensation de l\'inclinaison',
			tilt: 'Inclinaison <b>{0}</b>',
			offset: 'Décalage <b>{0}</b>',
			tooltip: 'Décalage sur l\'axe {0}',
			switch: 'Afficher l\'inclinaison comme :',
			rotation: 'Rotation autour de {0}',
			buttonCaption: {
				decrease: 'Diminuer l\'inclinaison autour de l\'axe {0} (M666 {1}xxx)',
				increase: 'Augmenter l\'inclinaison autour de l\'axe {0} (M666 {1}xxx)',
			}
		},
		toolPID: {
			caption: 'Calibration PID',
			tool: 'Outil',
			pid: 'Calibration PID <b>{0}</b>',
			calibration: 'T° calibration',
			pwm: 'PWM de calibration',
			run: 'Lancer la calibration',
			save: 'Sauvegarder les résultats'
		},
	},
	loadTool: {
		toolhead: 'Charger une Tête',
		network: {
			disconnected: 'Câble déconnecté',
			booting: 'Démarrage'
		},
		calibrationTool: "Charger l'outil de calibration",
		debug: "Acceder a l'interface (sans outil)",
		refreshIface: "Rafraichir l'interface",
		refreshTools: "Rafraichir liste outils",
		enableTool: "afficher/cacher outils",
	},
	power_settings: 'Option d\'alimentation',
}
