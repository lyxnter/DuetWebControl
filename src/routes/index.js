'use strict'

import Vue from 'vue'
import VueRouter from 'vue-router'

import Page404 from './Page404.vue'

import Control from './Control'
import Job from './Job'
import Files from './Files'
import Settings from './Settings'
import Lynx from './Lynx'
import store from '../store'

Vue.use(VueRouter)
//console.log("isLocal: " + store.state.isLocal);
//console.log("user: "+ store.getters.getUser.level);
export const Routing = ( store.state.isLocal? [
	// access Pannel
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
				component: Lynx.Dashboard,
				showLocal: true,
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
				caption: 'menu.lynx.control',
				path: '/Lynxter/Control',
				component: Lynx.Control,
				showLocal: true,
			},
			// Calibration
			{
				icon: 'build',
				caption: 'menu.lynx.calibrate',
				path: '/Lynxter/Calibration',
				component: Lynx.Calibration,
				showLocal: true,
			},
		]
	},
	// Settings
	{
		icon: 'settings',
		caption: 'menu.settings.caption',
		showLocal: true,
		pages: [
				// Webcam
				{
					icon: 'photo_camera',
					caption: 'menu.job.webcam',
					path: '/Job/Webcam',
					component: Job.Webcam,
					condition: 'webcam',
					showLocal: true,
					minLevel: 1,
				},
				// Height Map
				{
					icon: 'grid_on',
					caption: 'menu.control.heightmap',
					path: '/Heightmap',
					component: Control.Heightmap,
					showLocal: true,
					//minLevel: 0,
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
				// Jobs
				{
						icon: 'play_arrow',
						caption: 'menu.files.jobs',
						path: '/Files/Jobs',
						component: Files.Jobs,
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
			]
		},
		// Settings
		{
			icon: 'build',
			caption: 'menu.settings.caption',
			showLocal: true,
			minLevel: 2,
			pages: [
				// General
				{
					icon: 'settings',
					caption: 'menu.settings.general',
					path: '/Settings/General',
					component: Settings.General,
					showLocal: true,
					minLevel: 3,
				},
				// Machine
				{
					icon: 'settings_applications',
					caption: 'menu.settings.machine',
					path: '/Settings/Machine',
					component: Settings.Machine,
					showLocal: true,
					minLevel: 2,
				},
			]
		}
	] : [
	// Control
	{
		icon: 'tune',
		caption: 'menu.control.caption',
		pages: [
			// Dashboard
			{
				icon: 'dashboard',
				caption: 'menu.control.dashboard',
				path: '/',
				component: Control.Dashboard,
			},
			// Console
			{
				icon: 'code',
				caption: 'menu.control.console',
				path: '/Console',
				component: Control.Console,
				//minLevel: 1,
			},
			// Height Map
			{
				icon: 'grid_on',
				caption: 'menu.control.heightmap',
				path: '/Heightmap',
				component: Control.Heightmap,
				//minLevel: 1,
			}
		]
	},
	// Job
	{
		icon: 'print',
		caption: 'menu.job.caption',
		pages: [
			// Status
			{
				icon: 'info',
				caption: 'menu.job.status',
				path: '/Job/Status',
				component: Job.Status,
			},
			// Webcam
			{
				icon: 'photo_camera',
				caption: 'menu.job.webcam',
				path: '/Job/Webcam',
				component: Job.Webcam,
				condition: 'webcam',
				//minLevel: 1,
			}
			// Visualiser (coming soon)
			/* {
				icon: 'theaters',
				caption: 'menu.job.visualiser',
				path: '/Job/Visualiser',
				component: Job.Visualiser
			} */
		]
	},
	// Files
	{
		icon: 'sd_storage',
		caption: 'menu.files.caption',
		//minLevel: 1,
		pages: [
			// Jobs
			{
				icon: 'play_arrow',
				caption: 'menu.files.jobs',
				path: '/Files/Jobs',
				component: Files.Jobs,
				//minLevel: 1,
			},
			// Macros
			{
				icon: 'polymer',
				caption: 'menu.files.macros',
				path: '/Files/Macros',
				component: Files.Macros,
				//minLevel: 1,
			},
			// Display
			{
				icon: 'format_list_numbered',
				caption: 'menu.files.display',
				path: '/Files/Display',
				component: Files.Display,
				condition: 'display',
				//minLevel: 3,
			},
			// System
			{
				icon: 'settings',
				caption: 'menu.files.system',
				path: '/Files/System',
				component: Files.System,
				//minLevel: 3,
			}
		]
	},
	// Materials
	{
		icon: 'widgets',
		caption: 'menu.material.materials',
		//minLevel: 1,
		pages: [
			// Materials
			/*{
				icon: 'radio_button_checked',
				caption: 'menu.material.materials',
				path: '/Files/Materials',
				component: Files.Materials,
				showLocal: false,
			},*/
			// Filaments
			{
				icon: 'album',
				caption: 'menu.material.filaments',
				path: '/Files/Filaments',
				component: Files.Filaments,
				//minLevel: 1,
			},
			// Liquids
			{
				icon: 'invert_colors',
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
			},*/
		]
	},
	// Settings
	{
		icon: 'build',
		caption: 'menu.settings.caption',
		//minLevel: 2,
		pages: [
			// General
			{
				icon: 'settings',
				caption: 'menu.settings.general',
				path: '/Settings/General',
				component: Settings.General,
				//minLevel: 2,
			},
			// Machine
			{
				icon: 'settings_applications',
				caption: 'menu.settings.machine',
				path: '/Settings/Machine',
				component: Settings.Machine,
				//minLevel: 3
			},
			// Calibration
			{
				icon: 'build',
				caption: 'menu.lynx.calibrate',
				path: '/Lynxter/Calibration',
				component: Lynx.Calibration,
				showLocal: true,
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
		]
	},
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
