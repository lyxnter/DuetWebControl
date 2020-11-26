'use strict'

import Vue from 'vue'
import VueRouter from 'vue-router'

import Page404 from './Page404.vue'

import Control from './Control'
import Job from './Job'
import Files from './Files'
import Settings from './Settings'
import Lynxter from './Lynxter'
//import store from '../store'

Vue.use(VueRouter)

export const Routing = ( [
	// Control
	{
		icon: 'tune',
		caption: 'menu.control.caption',
		showLocal: true,
		pages: [
			// Dashboard
			{
				icon: 'dashboard',
				caption: 'menu.control.dashboard',
				path: '/',
				component: Lynxter.Dashboard,
				showLocal: true,
				showDist: false,
			},
			// Dashboard
			{
				icon: 'open_with',
				caption: 'menu.lynxter.control',
				path: '/',
				component: Control.Dashboard,
			},
			// Status
			{
				icon: 'info',
				caption: 'menu.job.status',
				path: '/Job/Status',
				component: Job.Status,
				showLocal: true,
			},
			// Control
			{
				icon: 'open_with',
				caption: 'menu.lynxter.control',
				path: '/Lynxter/Control',
				component: Lynxter.Control,
				showLocal: true,
				showDist: false,
			},
			// Jobs
			{
				icon: 'play_arrow',
				caption: 'menu.files.jobs',
				path: '/Files/Jobs',
				component: Files.Jobs,
				showLocal: true,
				//minLevel: 1,
			},
			// Calibration
			{
				icon: 'build',
				caption: 'menu.lynxter.calibrate',
				path: '/Lynxter/Calibration',
				component: Lynxter.Calibration,
				showLocal: true,
			},
			// Webcam
			{
				icon: 'photo_camera',
				caption: 'menu.job.webcam',
				path: '/Job/Webcam',
				component: Job.Webcam,
				/*condition: 'webcam',*/
				showLocal: true,
				//minLevel: 1,
			}
		]
	},
	// Settings
	{
		icon: 'settings',
		caption: 'menu.lynxter.advanced',
		showLocal: true,
		defaultClosed: true,
		pages: [
			// Height Map
			{
				icon: 'grid_on',
				caption: 'menu.control.heightmap',
				path: '/Heightmap',
				component: Control.Heightmap,
				showLocal: true,
				//minLevel: 1,
			},
			// Console
			{
				icon: 'code',
				caption: 'menu.control.console',
				path: '/Console',
				component: Control.Console,
				showLocal: true,
				//minLevel: 1,
			},
			// Console
			{
				icon: 'code',
				caption: 'menu.control.command',
				path: '/Command',
				component: Control.Command,
				showLocal: true,
				//minLevel: 1,
			},
			// Macros
			{
				icon: 'polymer',
				caption: 'menu.files.macros',
				path: '/Files/Macros',
				component: Files.Macros,
				showLocal: true,
				//minLevel: 1,
			},
			// System
			{
				icon: 'report',
				caption: 'menu.files.system',
				path: '/Files/System',
				component: Files.System,
				showLocal: false,
				//minLevel: 3,
			},
			// Timelapses
			{
				icon: 'video_library',
				caption: 'menu.files.timelapses',
				path: '/Files/Timelapse',
				component: Lynxter.Timelapse,
				showLocal: true,
				//minLevel: 3,
			},
			// General
			{
				icon: 'settings',
				caption: 'menu.settings.caption',
				path: '/Settings/General',
				component: Settings.General,
				showLocal: false,
				//minLevel: 2,
			},
			// Machine
			{
				icon: 'settings_applications',
				caption: 'menu.settings.machine',
				path: '/Settings/Machine',
				component: Settings.Machine,
				showLocal: true,
				showDist: false,
				//minLevel: 3
			},
		]
	},
	// Debug
	{
		icon: 'bug_report',
		caption: 'Debug',
		showLocal: true,
		showDist: true,
		defaultClosed: true,
		condition: 'debug',
		pages: [
			// Debug
			{
				icon: 'bug_report',
				caption: 'Debug',
				path: '/Debug',
				component: Lynxter.Debug,
				showLocal: true,
				showDist: true,
				//minLevel: 3
			},
	]}
	// Materials
	/*{
		icon: 'widgets',
		caption: 'menu.material.materials',
		//minLevel: 1,
		pages: [
			// Materials
			{
			icon: 'radio_button_checked',
			caption: 'menu.material.materials',
			path: '/Files/Materials',
			component: Files.Materials,
			showLocal: false,
		},
		// Filaments
		{
			icon: 'album',
			img: '/img/ressources/Medium_universe_FIL.svg',
			caption: 'menu.material.filaments',
			path: '/Files/Filaments',
			component: Files.Filaments,
			//minLevel: 1,
		},
		// Paste
		{
			icon: 'invert_colors',
			img: '/img/ressources/Medium_universe_LIQ.svg',
			caption: 'menu.material.liquids',
			path: '/Files/Liquids',
			component: Files.Liquids,
			//minLevel: 1,
		},
		// Pellets
		/*{
		icon: 'radio_button_checked',
		caption: 'menu.material.pellets',
		path: '/Files/Pellets',
		component: Files.Pellets,
		//minLevel: 1,
	},
	// Fibers
	{
	icon: 'radio_button_checked',
	caption: 'menu.material.fibers',
	path: '/Files/Fibers',
	component: Files.Fibers,
	//minLevel: 1,
	},
	// Materials
	{
	icon: 'radio_button_checked',
	caption: 'menu.material.hybrids',
	path: '/Files/Hybrids',
	component: Files.Hybrids,
	//minLevel: 1,
	},
	]
},*/
	// Settings
	/*{
		icon: 'build',
		caption: 'menu.settings.caption',
		showLocal: true,
		//minLevel: 2,
		pages: [
			// General
			{
				icon: 'settings',
				caption: 'menu.settings.general',
				path: '/Settings/General',
				component: Settings.General,
				showLocal: true,
				//minLevel: 2,
			},
			// Machine
			{
				icon: 'settings_applications',
				caption: 'menu.settings.machine',
				path: '/Settings/Machine',
				component: Settings.Machine,
				showLocal: true,
				//minLevel: 3
			},
			// Setup
			/*{
				icon: 'build',//'setup',
				caption: 'menu.settings.setup',
				path: '/Settings/Setup',
				component: Settings.Setup
			},
			// Support
			{
				icon: 'build',//'tutorial',
				caption: 'menu.settings.support',
				path: '/Settings/Support',
				component: Settings.Support,
			},
			// if is certified
			// Maintenance
			{
				icon: 'build',//'maintenance',
				caption: 'menu.settings.maintenance',
				path: '/Settings/Maintenance',
				component: Settings.Maintenance,
			}*/
			// Update (coming soon)
			/* {
				icon: 'update',
				caption: 'menu.settings.update',
				path: '/Settings/Update',
				component: Settings.Update
				} */
			/*]
		},*/
	]);

	export default new VueRouter({
		mode: 'history',
		base: process.env.BASE_URL,
		routes: [
			...Routing.map(category => category.pages).reduce((a, b) => a.concat(b)),
			{
				path: '*',
				component: Page404
			}
		],
	})
