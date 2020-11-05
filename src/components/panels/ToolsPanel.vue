<style scoped>
* {
	line-height: 1.1;
}
.v-card {
	background-position: center;
	background-repeat: no-repeat;
	background-blend-mode: overlay;
}
.v-card.liq {
	/*background-image: url(/img/ressources/Medium_universe_LIQ.svg);*/
}
.v-card.fil {
	/*background-image: url(/img/ressources/Medium_universe_FIL.svg);*/
}
table {
	width: 100%;
	border-spacing: 0;
}
table td,
table th {
	text-align: center;
}
table.tools th,
table.tools td {
	width: 20%;
}
table.extra th,
table.extra td {
	width: 25%;
}
table.extra tr > th:first-child,
table.extra tr > td:first-child {
	width: 50%;
}
.local {
	font-size: large;
}
</style>
<style>
@keyframes toolHeating {
	0% {
		background-position: 50% 0%;
	}
	100% {
		background-position: 50% 100%;
	}
}
@keyframes toolFault {
	0% {
		background: #ff0000;
	}
	9% {
		background: #ff0000;
	}
	10%{
		background: #424242;
	}
	19%{
		background: #424242;
	}
	20%{
		background: #ff0000;
	}
	29%{
		background: #ff0000;
	}
	30%{
		background: #424242;
	}
	39%{
		background: #424242;
	}
	40% {
		background: #ff0000;
	}
}
</style>

<template>
	<v-card v-bind:class=" getTool ? (getTool.toLowerCase().includes('filament') ? 'fil' : (getTool.toLowerCase().includes('liquid') ? 'liq' : '')) : ''" v-bind:style="isLocal?'font-size: large;':''" id="toolContainer">
		<v-card-title class="py-2" :class="{local: isLocal}">
			<panel-link :active="currentPage !== 'tools'" @click="currentPage = 'tools'" class="mr-2">
				<v-icon small>build</v-icon> {{ $t('panel.tools.caption') }}
			</panel-link>
			<panel-link :active="currentPage !== 'extra'" @click="currentPage = 'extra'" v-if="!isLocal">
				<v-icon small>timeline</v-icon> {{ $t('panel.tools.extra.caption') }}
			</panel-link>

			<v-spacer></v-spacer>

			<v-menu v-model="dropdownShown" offset-y left :close-on-content-click="false" :disabled="uiFrozen" v-if="!isLocal">
				<a slot="activator" ref="dropdownActivator" href="#" @click.prevent tabindex="0" @keyup.enter="showDropdown">
					<v-icon small>more_horiz</v-icon> {{ $t('panel.tools.controlAll') }}
				</a>
				<v-card>
					<v-layout justify-center column class="pt-2 px-2">
						<v-btn block color="primary" class="mb-3 pa-2" :disabled="!canTurnEverythingOff" @click="turnEverythingOff">
							<v-icon class="mr-1">power</v-icon> {{ $t('panel.tools.turnEverythingOff') }}
						</v-btn>

						<tool-input :shown="true" ref="allActive" :label="$t('panel.tools.allActiveTemperatures')" all active></tool-input>
						<tool-input :shown="true" :label="$t('panel.tools.allStandbyTemperatures')" all standby :tab-target="$refs.dropdownActivator"></tool-input>
					</v-layout>
				</v-card>
			</v-menu>
		</v-card-title>

		<v-card-text class="pa-0">
			<template v-if="currentPage === 'tools'">
				<v-alert :value="!tools.length && (getTool === undefined || getTool === '')" type="info" block>
					{{ $t('panel.tools.noTools') }}
				</v-alert>
				<!-- Tools -->
				<table class="tools" v-show="tools.length || true">
					<thead>
						<th class="pl-2">{{ $t('panel.tools.tool', ['']) }}</th>
						<th class="px-1" v-if="!isLocal">{{ $t('panel.tools.heater', ['']) }}</th>
						<th class="px-1">{{ $t('panel.tools.current', ['']) }}</th>
						<th class="px-1">{{ $t(isLocal && !shown?'panel.tools.target':'panel.tools.active') }}</th>
						<th class="pr-2" v-if="!isLocal || shown">{{ $t('panel.tools.standby') }}</th>
					</thead>
					<tbody>
						<template v-for="(tool, index) in tools">
							<!-- First tool row -->
							<tr :class="{ [selectedToolClass] : (tool.number === state.currentTool) }" :key="`tool-${index}-${tool.heaters.length && tool.heaters[0]}`">
								<!-- Tool name -->
								<th :rowspan="Math.max(1, tool.heaters.length)"
								:class="{ 'pt-2 pb-2' : !tool.heaters.length, 'pl-2': !(isLocal && shown), 'pl-1': isLocal && shown }"
								style="overflow: hidden;"
								:style="{background: (isLocal && shown) ? 'none !important' : '', border: false ? '2px solid' : '', 'border-radius': false ? '10px' : '', 'border-color': false ? '#7b7b7b' : '', cursor: (isLocal && shown) ? 'pointer' : '', height: (!isLocal || shown) ? '90px': '60px'}"
								@click.stop.prevent.self="( isLocal && shown && !isBusy? (heat.heaters[tool.heaters[0]] !== undefined ? toolHeaterClick(tool,tool.heaters[0]):toolClick(tool)) : null)">
								<v-layout row fill-height align-center>
									<v-flex shrink v-if="(isLocal && tool.heaters.length) || (!isLocal && tool.heaters.length == 1)"	style="min-width: 5px; /*border: 1px solid darkgray;*/ border-radius: 3px; left: 4px; overflow: hidden" :style="{ height: (!isLocal || shown) ? '80px' : '50px', 'margin-top': (!isLocal ? '0px' : (shown ? '0px' : '5px')), display: (((heatUp(tool).heater.state == 2 && tool.active[0] > 0 && (tool.number === state.currentTool)) || (heatUp(tool).heater.state == 1 && tool.standby[0] > 0 ) || (heatUp(tool).heater.state == 3))) ? '' : 'none'}">
										<div :style="{ height: heatUp(tool).height, background: heatUp(tool).background, 'margin-top' : ((!isLocal ? 80 : (shown ? 80 : 50)) - parseInt(heatUp(tool).height)) + 'px', 'background-position' : heatUp(tool).position
									}"
									style="height: 4px; border-radius: 2px; overflow: hidden;">
									<div v-if="heatUp(tool).heating"
									style="width: 100%;
									height:100%;
									background: linear-gradient(rgb(255, 142, 0) 45%, rgb(255, 214, 0) 50%, rgb(255, 142, 0) 55%) repeat scroll 0% 0% / 300% 300%;
									background-size: 600% 600%;
									animation: 2s linear 0s infinite normal none running toolHeating">
								</div>
								<div v-if="heatUp(tool).err"
								style="width: 100%;
								height:100%;
								background: #ff0000;
								animation: 2s linear 0s infinite normal none running toolFault">
							</div>
						</div>
					</v-flex>
					<v-flex grow>
						<div @click.prevent="( isLocal && shown && !isBusy ? (heat.heaters[tool.heaters[0]] !== undefined ? toolHeaterClick(tool,tool.heaters[0]):toolClick(tool)) : null)">
							<a href="#" :class="isLocal?getHeaterColor(tool.heaters[0]):''" @click.prevent="isLocal||isBusy?null:toolClick(tool)">
								{{ tool.name || $t('panel.tools.tool', [tool.number]) }}
							</a>
							<br>
							<span class="font-weight-regular caption" :style="{'font-size':isLocal?'large !important': ''}">
								T{{ tool.number }}
							</span>
							<span v-if="isLocal && tool.heaters.length && heat.heaters[tool.heaters[0]] !== undefined && heat.heaters[tool.heaters[0]].state !== undefined" class="font-weight-regular caption" :class="{
								red: heat.heaters[tool.heaters[0]] !== undefined && heatUp(tool).err,
								[activeToolClass]: heat.heaters[tool.heaters[0]] !== undefined && (heatUp(tool).heater.state == 2 || heatUp(tool).heater.state == 4),
								[standbyToolClass]: heat.heaters[tool.heaters[0]] !== undefined && heatUp(tool).heater.state == 1,
								'grey darken-2': heat.heaters[tool.heaters[0]] !== undefined && heatUp(tool).heater.state == 0,}" style="padding:1px 5px; border-radius: 5px">
								{{ $t(`generic.heaterStates[${heatUp(tool).heater.state}]`) }}
							</span>
							<span v-else-if="isLocal" class="font-weight-regular caption" :class="{
								[activeToolClass]: (state.currentTool == tool.number),
								'grey darken-2':  (state.currentTool != tool.number)}" style="padding:1px 5px">
								{{ $t(`generic.heaterStates[${(state.currentTool == tool.number)?2:0}]`) }}
							</span>
						</div>
						<div v-if="(shown || !isLocal) && materials != {} && window.width > 385" @click.stop.prevent.self="">
							<v-menu offset-y left :disabled="uiFrozen || isBusy" v-tab-control :close-on-content-click="false">
								<template slot="activator">
									<v-btn color="secondary darken-1" small class="mx-0" :disabled="uiFrozen">
										{{ window.width > 475 ? $t('button.preloadPrime.caption') : $t('button.preloadPrime.caption').split('/')[0] }} <v-icon v-if="window.width > 405">arrow_drop_down</v-icon>
									</v-btn>
								</template>

								<v-card>
									<v-list>
										<v-list-tile v-if="preloads.filter(item => item.name.includes(tool.name)).length" @click="sendCode('M98 P0:/macros/_Materials/' +  universe + '/Pre_load_' + tool.name + '.g')">
											<v-btn color="secondary darken-1" small class="mx-0" :disabled="uiFrozen">
												{{ $t('button.preloadPrime.preload', [(tool.name || $t('panel.tools.tool', [tool.number]))]) }}
											</v-btn>
										</v-list-tile>
										<v-list-tile v-if="Object.entries(materials).filter(item => item[1].filter(item => item.indexOf('Prime') >= 0).length).length > 0">
											<v-menu offset-y left :disabled="uiFrozen" v-tab-control>
												<template slot="activator">
													<v-btn color="secondary darken-1" small class="mx-0" :disabled="uiFrozen">
														{{ $t('button.preloadPrime.prime', [(tool.name || $t('panel.tools.tool', [tool.number]))]) }} <v-icon>arrow_drop_down</v-icon>
													</v-btn>
												</template>

												<v-card>
													<v-list>
														<v-list-tile v-for="(file, material) in Object.fromEntries(Object.entries(materials).filter(item => item[1].filter(item => item.indexOf('Prime') >= 0).length).sort())" :key="material" @click="sendCode('M98 P0:/macros/_Materials/' +  universe + '/' + material + '/Prime ' + (!tool.name.match(/E[0-9]+/)? 'E0' : tool.name))">
															{{ $t('button.preloadPrime.prime', [material]) }}
														</v-list-tile>
													</v-list>
												</v-card>
											</v-menu>
										</v-list-tile>
										<v-list-tile v-if="Object.entries(materials).filter(item => item[1].filter(item => item.indexOf('Unload') >= 0).length).length > 0">
											<v-menu offset-y left :disabled="uiFrozen" v-tab-control>
												<template slot="activator">
													<v-btn color="secondary darken-1" small class="mx-0" :disabled="uiFrozen">
														{{ $t('button.preloadPrime.unload', [(tool.name || $t('panel.tools.tool', [tool.number]))]) }} <v-icon>arrow_drop_down</v-icon>
													</v-btn>
												</template>

												<v-card>
													<v-list>
														<v-list-tile v-for="(file, material) in Object.fromEntries(Object.entries(materials).filter(item => item[1].filter(item => item.indexOf('Unload') >= 0).length).sort())" :key="material" @click="sendCode('M98 P0:/macros/_Materials/' +  universe + '/' + material + '/Unload ' + tool.name)">
															{{ $t('button.preloadPrime.unload', [material]) }}
														</v-list-tile>
													</v-list>
												</v-card>
											</v-menu>
										</v-list-tile>
										<v-list-tile v-if="Object.entries(materials).filter(item => item[1].filter(item => item.indexOf('Pre-heat') >= 0).length).length > 0">
											<v-menu offset-y left :disabled="uiFrozen" v-tab-control>
												<template slot="activator">
													<v-btn color="secondary darken-1" small class="mx-0" :disabled="uiFrozen">
														{{ $t('button.preloadPrime.preheat', [(tool.name || $t('panel.tools.tool', [tool.number]))]) }} <v-icon>arrow_drop_down</v-icon>
													</v-btn>
												</template>

												<v-card>
													<v-list>
														<v-list-tile v-for="(file, material) in Object.fromEntries(Object.entries(materials).filter(item => item[1].filter(item => item.indexOf('Pre-heat') >= 0).length).sort())" :key="material" @click="sendCode('M98 P0:/macros/_Materials/' +  universe + '/' + material + '/Pre-heat ' + tool.name)">
															{{ $t('button.preloadPrime.preheat', [material]) }}
														</v-list-tile>
													</v-list>
												</v-card>
											</v-menu>
										</v-list-tile>
									</v-list>
								</v-card>
							</v-menu>
						</div>
					</v-flex>
				</v-layout>
			</th>

			<th v-if="!isLocal">
				<v-layout row fill-height align-center>
					<v-flex shrink v-if="tool.heaters.length > 1"	style="min-width: 5px; /*border: 1px solid darkgray;*/ border-radius: 3px; overflow: hidden" :style="{ height: '50px', 'margin-top': (!isLocal ? '0px' : (shown ? '0px' : '-3px')), display: (((heat.heaters[tool.heaters[0]].state == 2 && tool.active[0] > 0 && (tool.number === state.currentTool)) || (heat.heaters[tool.heaters[0]].state == 1 && tool.standby[0] > 0 ) || (heat.heaters[tool.heaters[0]].state == 3))) ? '' : 'none'}">
						<div :style="{ height:
							heat.heaters[tool.heaters[0]].state == 1 ?
							(Math.min(heat.heaters[tool.heaters[0]].current,tool.standby[0])/Math.max(heat.heaters[tool.heaters[0]].current,tool.standby[0]))*50 + 'px' :
							(heat.heaters[tool.heaters[0]].state == 2 ?
							(Math.min(heat.heaters[tool.heaters[0]].current,tool.active[0])/Math.max(heat.heaters[tool.heaters[0]].current,tool.active[0]))*50+ 'px' :
							50 + 'px'),
							'margin-top' : 50 - (heat.heaters[tool.heaters[0]].state == 1 ?
							(Math.min(heat.heaters[tool.heaters[0]].current,tool.standby[0])/Math.max(heat.heaters[tool.heaters[0]].current,tool.standby[0]))*50 :
							(heat.heaters[tool.heaters[0]].state == 2 ?
							(Math.min(heat.heaters[tool.heaters[0]].current,tool.active[0])/Math.max(heat.heaters[tool.heaters[0]].current,tool.active[0]))*50 : 50 )) + 'px',
							background:
							heat.heaters[tool.heaters[0]].state == 1 ?
							'linear-gradient(rgb(20, 100, 190) 48%, rgb(25, 115, 215) 50%, rgb(20, 100, 190) 52%) repeat scroll 0% 0% / 200% 200%':
							heat.heaters[tool.heaters[0]].state == 2 ? 'linear-gradient(rgb(0, 128, 0) 48%, rgb(0, 150, 0) 50%, rgb(0, 128, 0) 52%) repeat scroll 0% 0% / 200% 200%': 'red',
							'background-position' : '50% ' + Math.round(heat.heaters[tool.heaters[0]].avgPWM*100) + '%'
						}"
						style="height: 4px; border-radius: 2px; overflow: hidden;">
						<div v-if="((heat.heaters[tool.heaters[0]].state == 1) && (Math.abs(heat.heaters[tool.heaters[0]].current - tool.standby[0]) > 1)) || ((heat.heaters[tool.heaters[0]].state == 2) && (Math.abs(heat.heaters[tool.heaters[0]].current - tool.active[0]) > 1))"
							style="width: 100%;
							height:100%;
							background: linear-gradient(rgb(255, 142, 0) 45%, rgb(255, 214, 0) 50%, rgb(255, 142, 0) 55%) repeat scroll 0% 0% / 300% 300%;
							background-size: 600% 600%;
							animation: 2s linear 0s infinite normal none running toolHeating">
						</div>
						<div v-if="(heat.heaters[tool.heaters[0]].state == 3)"
						style="width: 100%;
						height:100%;
						background: #ff0000;
						animation: 2s linear 0s infinite normal none running toolFault">
					</div>
				</div>
			</v-flex>
			<v-flex grow>
				<a v-if="tool.heaters.length" href="#" :class="getHeaterColor(tool.heaters[0])" @click.prevent="isBusy ? null : toolHeaterClick(tool, tool.heaters[0])">
					{{ formatHeaterName(heat.heaters[tool.heaters[0]], tool.heaters[0]) }}
				</a>
				<br/>
				<span v-if="tool.heaters.length && heat.heaters[tool.heaters[0]].state !== null" class="font-weight-regular caption" :class="{
					red:	heat.heaters[tool.heaters[0]] !== undefined && heat.heaters[tool.heaters[0]].state == 3,
					[activeToolClass]: heat.heaters[tool.heaters[0]] !== undefined && (heat.heaters[tool.heaters[0]].state == 2 || heat.heaters[tool.heaters[0]].state == 4),
					[standbyToolClass]: heat.heaters[tool.heaters[0]] !== undefined && heat.heaters[tool.heaters[0]].state == 1,
					'grey darken-2': heat.heaters[tool.heaters[0]] !== undefined && heat.heaters[tool.heaters[0]].state == 0,}" style="padding:1px 5px">
					{{ $t(`generic.heaterStates[${heat.heaters[tool.heaters[0]].state}]`) }}
				</span>
			</v-flex>
		</v-layout>
	</th>
	<td class="text-center px-1">
		<span v-if="tool.heaters.length" style="white-space: nowrap; overflow: hidden; display: inline-block; text-overflow: ellipsis;" :style="{'max-width': isLocal && shown ? '65px' : ''}">
			{{ formatHeaterValue(heat.heaters[tool.heaters[0]]) }}
		</span>
		<span v-else-if="isNumber(tool.spindle) && tool.spindle >= 0 && tool.spindle < spindles.length">
			{{ $display(spindles[tool.spindle].current, 0, $t('generic.rpm')) }}
		</span>
	</td>
	<td class="pl-2 pr-1" v-if="!isLocal || shown || (tool.heaters.length && heat.heaters[tool.heaters[0]].state == 2)">
		<tool-input :shown="shown" v-if="tool.heaters.length" :tool="tool" :heaterIndex="0" :precision="1" active></tool-input>
		<tool-input :shown="shown" v-else-if="isNumber(tool.spindle) && tool.spindle >= 0" :spindle="spindles[tool.spindle]" active></tool-input>
	</td>
	<td class="pl-1 pr-2"	v-if="!isLocal || shown || (tool.heaters.length && heat.heaters[tool.heaters[0]].state == 1)">
		<tool-input :shown="shown" v-if="tool.heaters.length" :tool="tool" :heaterIndex="0" :precision="1" standby></tool-input>
	</td>
	<td class="pl-1 pr-2" v-if="isLocal && !shown && (!tool.heaters.length || heat.heaters[tool.heaters[0]].state == 0)">
		<div class="control number">
			<span >
				0 C
			</span>
		</div>
	</td>
</tr>

<tr v-for="(heater, heaterIndex) in tool.heaters.slice(1)" :class="{ 'grey darken-2' : tool.number === state.currentTool }" :key="`tool-${index}-${heater}`">
	<th v-if="!isLocal">
		<v-layout row fill-height align-center>
			<v-flex shrink v-if="tool.heaters.length"	style="min-width: 5px; /*border: 1px solid darkgray;*/ border-radius: 3px; left: 4px; overflow: hidden" :style="{ height: '50px', 'margin-top': (!isLocal ? '-5px' : (shown ? '0px' : '-3px')), display: ((heat.heaters[heater].state == 2 && tool.active[heaterIndex+1] > 0 && (tool.number === state.currentTool)) || (heat.heaters[heater].state == 1 && tool.standby[heaterIndex+1] > 0 ) || (heat.heaters[heater].state == 3)) ? '' : 'none'}">
				<div :style="{ height:
					heat.heaters[heater].state == 1 ?
					(Math.min(heat.heaters[heater].current,tool.standby[heaterIndex+1])/Math.max(heat.heaters[heater].current,tool.standby[heaterIndex+1])) * 50 + 'px' :
					(heat.heaters[heater].state == 2 ?
					(Math.min(heat.heaters[heater].current,tool.active[heaterIndex+1])/Math.max(heat.heaters[heater].current,tool.active[heaterIndex+1]))*50 + 'px' :
					50 + 'px'),
					'margin-top' : 50 - (heat.heaters[heater].state == 1 ?
					(Math.min(heat.heaters[heater].current,tool.standby[heaterIndex+1])/Math.max(heat.heaters[heater].current,tool.standby[heaterIndex+1]))*50 :
					(heat.heaters[heater].state == 2 ?
					(Math.min(heat.heaters[heater].current,tool.active[heaterIndex+1])/Math.max(heat.heaters[heater].current,tool.active[heaterIndex+1]))*50 : 50 )) + 'px',
					background:
					heat.heaters[heater].state == 1 ?
					'linear-gradient(rgb(20, 100, 190) 48%, rgb(25, 115, 215) 50%, rgb(20, 100, 190) 52%) repeat scroll 0% 0% / 200% 200%':
					heat.heaters[heater].state == 2 ? 'linear-gradient(rgb(0, 128, 0) 48%, rgb(0, 150, 0) 50%, rgb(0, 128, 0) 52%) repeat scroll 0% 0% / 200% 200%': 'red',
					'background-position' : '50% ' + Math.round(heat.heaters[heater].avgPWM*100) + '%'
				}"
				style="height: 4px; border-radius: 2px; overflow: hidden;">
				<div v-if="((heat.heaters[heater].state == 1) && (Math.abs(heat.heaters[heater].current - tool.standby[heaterIndex+1]) > 1)) || ((heat.heaters[heater].state == 2) && (Math.abs(heat.heaters[heater].current - tool.active[heaterIndex+1]) > 1))"
					style="width: 100%;
					height:100%;
					background: linear-gradient(rgb(255, 142, 0) 45%, rgb(255, 214, 0) 50%, rgb(255, 142, 0) 55%) repeat scroll 0% 0% / 300% 300%;
					background-size: 600% 600%;
					animation: 2s linear 0s infinite normal none running toolHeating">
				</div>
				<div v-if="(heat.heaters[heater].state == 3)"
				style="width: 100%;
				height:100%;
				background: #ff0000;
				animation: 2s linear 0s infinite normal none running toolFault">
			</div>
		</div>
	</v-flex>
	<v-flex grow>
		<a href="#" :class="getHeaterColor(heater)" @click.prevent="isBusy ? null : toolHeaterClick(tool, heater)">
			{{ formatHeaterName(heat.heaters[heater], heater) }}
		</a>
		<br/>
		<span v-if="tool.heaters.length && heat.heaters[heater].state !== null" class="font-weight-regular caption" :class="{
			red:	heat.heaters[heater] !== undefined && heat.heaters[heater].state == 3,
			[activeToolClass]: heat.heaters[heater] !== undefined && (heat.heaters[heater].state == 2 || heat.heaters[heater].state == 4),
			[standbyToolClass]: heat.heaters[heater] !== undefined && heat.heaters[heater].state == 1,
			'grey darken-2': heat.heaters[heater] !== undefined && heat.heaters[heater].state == 0,}" style="padding:1px 5px">
			{{ $t(`generic.heaterStates[${heat.heaters[heater].state}]`) }}
		</span>
	</v-flex>
</v-layout>
</th>

<!-- Heater value -->
<td>
	{{ formatHeaterValue(heat.heaters[heater]) }}
</td>

<td v-if="isLocal && !shown">
	<tool-input :shown="shown" v-if="(heat.heaters[heater].state == 2)" :tool="tool" :heaterIndex="heaterIndex+1" :precision="1" active></tool-input>
	<tool-input :shown="shown" v-if="(heat.heaters[heater].state == 1)" :tool="tool" :heaterIndex="heaterIndex+1" :precision="1" standby></tool-input>
	<div class="control number" v-if="(heat.heaters[heater].state == 0)">
		<span>
			0 C
		</span>
	</div>
	<div class="control number" v-if="(heat.heaters[heater].state == 3)">
		<b style="color: red">
			ERR
		</b>
	</div>
</td>

<!-- Heater active -->
<td class="pl-2 pr-1"  v-if="!isLocal || shown">
	<tool-input :shown="shown" :tool="tool" :heaterIndex="heaterIndex + 1" :precision="1" active></tool-input>
</td>

<!-- Heater standby -->
<td class="pl-1 pr-2"  v-if="!isLocal || shown">
	<tool-input :shown="shown" :tool="tool" :heaterIndex="heaterIndex + 1" :precision="1" standby></tool-input>
</td>
</tr>

<tr v-if="index !== tools.length - 1" :key="`div-tool-${index}`">
	<td colspan="5">
		<v-divider></v-divider>
	</td>
</tr>
</template>

<!-- Beds -->
<template v-for="(bed, index) in heat.beds">
	<template v-if="bed">
		<tr :key="`div-bed-${index}`">
			<td colspan="5">
				<v-divider></v-divider>
			</td>
		</tr>

		<tr :key="`bed-${index}-${bed.heaters.length && bed.heaters[0]}`" :class="{ [selectedToolClass] : ( heat.heaters[bed.heaters[0]] !== undefined
			&& heat.heaters[bed.heaters[0]].state == 2)}">
			<th :rowspan="Math.max(1, bed.heaters.length)"
			:class="{ 'pt-2 pb-2' : !bed.heaters.length, 'pl-2': !(isLocal && shown), 'pl-1': (isLocal && shown)}"
			:style="{background: (isLocal && shown) ? 'none !important' : '', border: false ? '2px solid' : '', 'border-radius': false ? '10px' : '', 'border-color': false ? '#7b7b7b' : '', cursor: (isLocal && shown) ? 'pointer' : '', height: (!isLocal || shown) ? '90px': '60px'}" @click.prevent="isLocal && shown && !isBusy ? bedHeaterClick(bed, index, bed.heaters[0]) : null"
			style="">
			<v-layout row fill-height align-center>
				<v-flex shrink v-if="bed.heaters.length"
				style="min-width: 5px; border-radius: 3px; left: 4px; overflow: hidden; margin-top: 0px"
				:style="{ height: (!isLocal || shown) ? '80px' : '50px', display: (((heat.heaters[bed.heaters[0]].state == 2 &&  bed.active[0] > 0) || (heat.heaters[bed.heaters[0]].state == 1 && bed.standby[0] > 0 ) || (heat.heaters[bed.heaters[0]].state == 3))) ? '' : 'none'}">
				<div :style="{ height:
					heat.heaters[bed.heaters[0]].state == 1 ?
					(Math.min(heat.heaters[bed.heaters[0]].current,bed.standby[0])/Math.max(heat.heaters[bed.heaters[0]].current,bed.standby[0]))*((!isLocal || shown) ? 80 : 50 ) + 'px' :
					(heat.heaters[bed.heaters[0]].state == 2 ?
					(Math.min(heat.heaters[bed.heaters[0]].current,bed.active[0])/Math.max(heat.heaters[bed.heaters[0]].current,bed.active[0]))*((!isLocal || shown) ? 80 : 50 ) + 'px' :
					((!isLocal || shown) ? 80 : 50 ) + 'px'),
					'margin-top' : ((!isLocal || shown) ? 80 : 50 ) - (heat.heaters[bed.heaters[0]].state == 1 ?
					(Math.min(heat.heaters[bed.heaters[0]].current,bed.standby[0])/Math.max(heat.heaters[bed.heaters[0]].current,bed.standby[0]))*((!isLocal || shown) ? 80 : 50 ) :
					(heat.heaters[bed.heaters[0]].state == 2 ?
					(Math.min(heat.heaters[bed.heaters[0]].current,bed.active[0])/Math.max(heat.heaters[bed.heaters[0]].current,bed.active[0]))*((!isLocal || shown) ? 80 : 50 ) :
					((!isLocal || shown) ? 80 : 50 ))) + 'px',
					background:
					heat.heaters[bed.heaters[0]].state == 1 ?
					'#1565c0':
					heat.heaters[bed.heaters[0]].state == 2 ? 'linear-gradient(rgb(0, 128, 0) 48%, rgb(0, 150, 0) 50%, rgb(0, 128, 0) 52%) repeat scroll 0% 0% / 200% 200%': 'red',
					'background-position' : '50% ' + Math.round(heat.heaters[bed.heaters[0]].avgPWM*100) + '%'
				}"
				style="height: 4px; border-radius: 2px; overflow: hidden;">
				<div v-if="((heat.heaters[bed.heaters[0]].state == 1) && (Math.abs(heat.heaters[bed.heaters[0]].current - bed.standby[0]) > 1)) || ((heat.heaters[bed.heaters[0]].state == 2) && (Math.abs(heat.heaters[bed.heaters[0]].current - bed.active[0]) > 1))"
					style="width: 100%;
					height:100%;
					background: linear-gradient(rgb(255, 142, 0) 45%, rgb(255, 214, 0) 50%, rgb(255, 142, 0) 55%) repeat scroll 0% 0% / 300% 300%;
					background-size: 600% 600%;
					animation: 2s linear 0s infinite normal none running toolHeating">
				</div>
				<div v-if="(heat.heaters[bed.heaters[0]].state == 3)"
				style="width: 100%;
				height:100%;
				background: #ff0000;
				animation: 2s linear 0s infinite normal none running toolFault">
			</div>
		</div>
	</v-flex>
	<v-flex grow>
		<a href="#" :class="isLocal?getHeaterColor(bed.heaters[0]):''" @click.prevent="isLocal||isBusy?null:bedClick(bed)">
			{{ bed.name || $t('panel.tools.bed', [(heat.beds.length !== 1) ? index : '']) }}
		</a>
		<br/>
		&nbsp;
		<span v-if="isLocal && bed.heaters.length > 0 && heat.heaters[bed.heaters[0]] !== undefined && heat.heaters[bed.heaters[0]].state !== undefined" class="font-weight-regular caption"
			:class="{red : ( heat.heaters[bed.heaters[0]] !== undefined
				&& heat.heaters[bed.heaters[0]].state == 3),
				[activeToolClass]: heat.heaters[bed.heaters[0]] !== undefined
				&& (heat.heaters[bed.heaters[0]].state == 2 || heat.heaters[bed.heaters[0]].state == 4),
				[standbyToolClass]: heat.heaters[bed.heaters[0]] !== undefined
				&& heat.heaters[bed.heaters[0]].state == 1,
				'grey darken-2': heat.heaters[bed.heaters[0]] !== undefined
				&& heat.heaters[bed.heaters[0]].state == 0,}" style="padding:1px 5px; border-radius: 5px">
				{{ $t(`generic.heaterStates[${heat.heaters[bed.heaters[0]].state}]`) }}
			</span>
		</v-flex>
	</v-layout>
</th>

<th v-if="!isLocal">
	<a v-if="bed.heaters.length" href="#" :class="getHeaterColor(bed.heaters[0])" @click.prevent="isBusy ? null : bedHeaterClick(bed, index, bed.heaters[0])" >
		{{ formatHeaterName(heat.heaters[bed.heaters[0]], bed.heaters[0]) }}
	</a>
	<br/>
	<span v-if="bed.heaters.length > 0 && heat.heaters[bed.heaters[0]].state !== null" class="font-weight-regular caption"	:class="{red : ( heat.heaters[bed.heaters[0]] !== undefined
		&& heat.heaters[bed.heaters[0]].state == 3),
		[activeToolClass]: heat.heaters[bed.heaters[0]] !== undefined
		&& (heat.heaters[bed.heaters[0]].state == 2 || heat.heaters[bed.heaters[0]].state == 4),
		[standbyToolClass]: heat.heaters[bed.heaters[0]] !== undefined
		&& heat.heaters[bed.heaters[0]].state == 1,
		'grey darken-2': heat.heaters[bed.heaters[0]] !== undefined
		&& heat.heaters[bed.heaters[0]].state == 0,}" style="padding:1px 5px">
		{{ $t(`generic.heaterStates[${heat.heaters[bed.heaters[0]].state}]`) }}
	</span>
</th>
<td class="text-center">
	<span v-if="bed.heaters.length">
		{{ formatHeaterValue(heat.heaters[bed.heaters[0]]) }}
	</span>
</td>
<td class="pl-2 pr-1" v-if="!isLocal || shown ||  heat.heaters[bed.heaters[0]].state == 2">
	<tool-input :shown="shown" v-if="bed.heaters.length" :bed="bed" :bedIndex="0" :heaterIndex="0" :precision="1" active></tool-input>
</td>
<td class="pl-1 pr-2" v-if="!isLocal || shown || heat.heaters[bed.heaters[0]].state == 1">
	<tool-input :shown="shown" v-if="bed.standby.length" :bed="bed" :bedIndex="0" :heaterIndex="0" :precision="1" standby></tool-input>
</td>
<td class="pl-1 pr-2" v-if="isLocal && heat.heaters[bed.heaters[0]].state == 0 && !shown">
	<div class="control number">
		<span >
			0 C
		</span>
	</div>
</td>
</tr>
<tr v-for="(heater, heaterIndex) in bed.heaters.slice(1)" :key="`bed-${index}-${heater}`">
	<th>
		<a href="#" :class="getHeaterColor(heater)" @click.prevent=" isBusy ? null : bedHeaterClick(bed, index, heater)">
			{{ formatHeaterName(heat.heaters[heater], heater) }}
		</a>
		<br/>
		<span v-if="heat.heaters[heater].state !== null" class="font-weight-regular caption">
			{{ $t(`generic.heaterStates[${heat.heaters[heater].state}]`) }}
		</span>
	</th>
	<td>
		{{ formatHeaterValue(heat.heaters[heater]) }}
	</td>
	<td class="pl-2 pr-1">
		<tool-input :shown="shown" :bed="bed" :bedIndex="index" :heaterIndex="heaterIndex + 1" :precision="1" active></tool-input>
	</td>
	<td class="pl-1 pr-2">
		<tool-input :shown="shown" v-if="bed.standby.length > heaterIndex + 1" :bed="bed" :bedIndex="index" :heaterIndex="heaterIndex + 1" :precision="1" standby></tool-input>
	</td>
</tr>
</template>
</template>

<!-- Chambers -->
<template v-for="(chamber, index) in heat.chambers">
	<template v-if="chamber">
		<tr :key="`div-${index}`">
			<td colspan="5">
				<v-divider></v-divider>
			</td>
		</tr>

		<tr :key="`chamber-${index}-${chamber.heaters.length && chamber.heaters[0]}`" :class="{ [selectedToolClass] : ( heat.heaters[chamber.heaters[0]] !== undefined
			&& heat.heaters[chamber.heaters[0]].state == 2)}">
			<th :rowspan="Math.max(1, chamber.heaters.length)" :class="{ 'pt-2 pb-2' : !chamber.heaters.length, 'pl-2': !(isLocal && shown), 'pl-1': isLocal && shown}"
			:style="{background: (isLocal && shown) ? 'none !important' : '', border: false ? '2px solid' : '', 'border-radius': false ? '10px' : '', 'border-color': false ? '#7b7b7b' : '', cursor: (isLocal && shown) ? 'pointer' : '', height: (!isLocal || shown) ? '90px': '60px'}"
			@click.prevent="isLocal && shown && !isBusy ? chamberHeaterClick(chamber, index, chamber.heaters[0]):null">
			<v-layout row fill-height align-center>
				<v-flex shrink v-if="chamber.heaters.length"
				style="min-width: 5px; border-radius: 3px; left: 4px; overflow: hidden; margin-top: 0px"
				:style="{ height: (!isLocal || shown) ? '80px' : '50px', display: (((heat.heaters[chamber.heaters[0]].state == 2 &&  chamber.active[0] > 0) || (heat.heaters[chamber.heaters[0]].state == 1 && chamber.standby[0] > 0 ) || (heat.heaters[chamber.heaters[0]].state == 3))) ? '' : 'none'}">
				<div :style="{ height:
					heat.heaters[chamber.heaters[0]].state == 1 ?
					(Math.min(heat.heaters[chamber.heaters[0]].current,chamber.standby[0])/Math.max(heat.heaters[chamber.heaters[0]].current,chamber.standby[0]))*((!isLocal || shown) ? 80 : 50 ) + 'px' :
					(heat.heaters[chamber.heaters[0]].state == 2 ?
					(Math.min(heat.heaters[chamber.heaters[0]].current,chamber.active[0])/Math.max(heat.heaters[chamber.heaters[0]].current,chamber.active[0]))*((!isLocal || shown) ? 80 : 50 ) + 'px' :
					((!isLocal || shown) ? 80 : 50 ) + 'px'),
					'margin-top' : ((!isLocal || shown) ? 80 : 50 ) - (heat.heaters[chamber.heaters[0]].state == 1 ?
					(Math.min(heat.heaters[chamber.heaters[0]].current,chamber.standby[0])/Math.max(heat.heaters[chamber.heaters[0]].current,chamber.standby[0]))*((!isLocal || shown) ? 80 : 50 ) :
					(heat.heaters[chamber.heaters[0]].state == 2 ?
					(Math.min(heat.heaters[chamber.heaters[0]].current,chamber.active[0])/Math.max(heat.heaters[chamber.heaters[0]].current,chamber.active[0]))*((!isLocal || shown) ? 80 : 50 ) :
					((!isLocal || shown) ? 80 : 50 ))) + 'px',
					background:
					heat.heaters[chamber.heaters[0]].state == 1 ?
					'linear-gradient(rgb(20, 100, 190) 48%, rgb(25, 115, 215) 50%, rgb(20, 100, 190) 52%) repeat scroll 0% 0% / 200% 200%':
					heat.heaters[chamber.heaters[0]].state == 2 ? 'linear-gradient(rgb(0, 128, 0) 48%, rgb(0, 150, 0) 50%, rgb(0, 128, 0) 52%) repeat scroll 0% 0% / 200% 200%': 'red',
					'background-position' : '50% ' + Math.round(heat.heaters[chamber.heaters[0]].avgPWM*100) + '%'
				}"
				style="height: 4px; border-radius: 2px; overflow: hidden;">
				<div v-if="((heat.heaters[chamber.heaters[0]].state == 1) && (Math.abs(heat.heaters[chamber.heaters[0]].current - chamber.standby[0]) > 1)) || ((heat.heaters[chamber.heaters[0]].state == 2) && (Math.abs(heat.heaters[chamber.heaters[0]].current - chamber.active[0]) > 1))"
					style="width: 100%;
					height:100%;
					background: linear-gradient(rgb(255, 142, 0) 45%, rgb(255, 214, 0) 50%, rgb(255, 142, 0) 55%) repeat scroll 0% 0% / 300% 300%;
					background-size: 600% 600%;
					animation: 2s linear 0s infinite normal none running toolHeating">
				</div>
				<div v-if="(heat.heaters[chamber.heaters[0]].state == 3)"
				style="width: 100%;
				height:100%;
				background: #ff0000;
				animation: 2s linear 0s infinite normal none running toolFault">
			</div>
		</div>
	</v-flex>
	<v-flex grow>
		<a href="#" :class="isLocal?getHeaterColor(chamber.heaters[0]):''" @click.prevent="isLocal||isBusy?null:chamberClick(chamber)">
			{{ chamber.name || $t('panel.tools.chamber', [(heat.chambers.length !== 1) ? index : '']) }}
		</a>
		<br/>
		&nbsp;
		<span v-if="isLocal && chamber.heaters.length > 0 && heat.heaters[chamber.heaters[0]] !== undefined && heat.heaters[chamber.heaters[0]].state !== undefined" class="font-weight-regular caption"	:class="{
			red : ( heat.heaters[chamber.heaters[0]] !== undefined && heat.heaters[chamber.heaters[0]].state == 3),
			[activeToolClass]: heat.heaters[chamber.heaters[0]] !== undefined && (heat.heaters[chamber.heaters[0]].state == 2 || heat.heaters[chamber.heaters[0]].state == 4),
			[standbyToolClass]: heat.heaters[chamber.heaters[0]] !== undefined && heat.heaters[chamber.heaters[0]].state == 1,
			'grey darken-2': heat.heaters[chamber.heaters[0]] !== undefined && heat.heaters[chamber.heaters[0]].state == 0,}" style="padding:1px 5px; border-radius: 5px">
			{{ $t(`generic.heaterStates[${heat.heaters[chamber.heaters[0]].state}]`) }}
		</span>
		<div v-if="(shown || !isLocal) && materials != {} && window.width > 385 && Object.entries(materials).filter(item => item[1].filter(item => item.indexOf('Pre-heat Machine') >= 0).length).length > 0" @click.stop.prevent.self="">
			<v-menu offset-y left :disabled="uiFrozen || isBusy" v-tab-control :close-on-content-click="false">
				<template slot="activator">
					<v-btn color="secondary darken-1" small class="mx-0" :disabled="uiFrozen">
						{{ $t('button.preloadPrime.preheat', ['']) }} <v-icon>arrow_drop_down</v-icon>
					</v-btn>
				</template>

				<v-card>
					<v-list>
						<v-list-tile v-for="(file, material) in Object.fromEntries(Object.entries(materials).filter(item => item[1].filter(item => item.indexOf('Pre-heat') >= 0).length).sort())" :key="material" @click="sendCode('M98 P0:/macros/_Materials/' +  universe + '/' + material + '/Pre-heat Machine')">
							{{ $t('button.preloadPrime.preheat', [material]) }}
						</v-list-tile>
					</v-list>
				</v-card>
			</v-menu>
		</div>
	</v-flex>
</v-layout>
</th>

<th v-if="!isLocal">
	<a v-if="chamber.heaters.length > 0" href="#" :class="getHeaterColor(chamber.heaters[0])" @click.prevent="chamberHeaterClick(chamber, index, chamber.heaters[0])">
		{{ formatHeaterName(heat.heaters[chamber.heaters[0]], chamber.heaters[0]) }}
	</a>
	<br/>
	<span v-if="chamber.heaters.length > 0 && heat.heaters[chamber.heaters[0]].state !== null" class="font-weight-regular caption" :class="{
		red : ( heat.heaters[chamber.heaters[0]] !== undefined && heat.heaters[chamber.heaters[0]].state == 3),
		[activeToolClass]: heat.heaters[chamber.heaters[0]] !== undefined && (heat.heaters[chamber.heaters[0]].state == 2 || heat.heaters[chamber.heaters[0]].state == 4),
		[standbyToolClass]: heat.heaters[chamber.heaters[0]] !== undefined && heat.heaters[chamber.heaters[0]].state == 1,
		'grey darken-2': heat.heaters[chamber.heaters[0]] !== undefined && heat.heaters[chamber.heaters[0]].state == 0,}" style="padding:1px 5px">
		{{ $t(`generic.heaterStates[${heat.heaters[chamber.heaters[0]].state}]`) }}
	</span>
</th>
<td class="text-center">
	<span v-if="chamber.heaters.length > 0">
		{{ formatHeaterValue(heat.heaters[chamber.heaters[0]]) }}
	</span>
</td>
<td class="pl-2 pr-1" v-if="!isLocal || shown || heat.heaters[chamber.heaters[0]].state == 2">
	<tool-input :shown="shown" v-if="chamber.heaters.length" :chamber="chamber" :chamberIndex="index" :heaterIndex="0" :precision="1" active></tool-input>
</td>
<td class="pl-1 pr-2" :shown="shown" v-if="!isLocal || heat.heaters[chamber.heaters[0]].state == 1">
	<tool-input :shown="shown" v-if="chamber.standby.length" :chamber="chamber" :chamberIndex="index" :heaterIndex="0" :precision="1" standby></tool-input>
</td>
<td class="pl-1 pr-2" v-if="isLocal && heat.heaters[chamber.heaters[0]].state == 0 && !shown">
	<div class="control number">
		<span >
			0 C
		</span>
	</div>
</td>
</tr>
<tr v-for="(heater, heaterIndex) in chamber.heaters.slice(1)" :key="`chamber-${index}-${heater}`">
	<th>
		<a href="#" :class="getHeaterColor(heater)" @click.prevent="isBusy ? null : chamberHeaterClick(chamber, index, heater)">
			{{ formatHeaterName(heat.heaters[heater], heater) }}
		</a>
		<br/>
		<span v-if="heat.heaters[heater].state !== null" class="font-weight-regular caption">
			{{ $t(`generic.heaterStates[${heat.heaters[heater].state}]`) }}
		</span>
	</th>
	<td>
		{{ formatHeaterValue(heat.heaters[heater]) }}
	</td>
	<td class="pl-2 pr-1">
		<tool-input :shown="shown" :chamber="chamber" :chamberIndex="index" :heaterIndex="heaterIndex + 1" :precision="1" active></tool-input>
	</td>
	<td class="pl-1 pr-2">
		<tool-input :shown="shown" v-if="chamber.standby.length > heaterIndex + 1" :chamber="chamber" :chamberIndex="index" :heaterIndex="heaterIndex + 1" :precision="1" standby></tool-input>
	</td>
</tr>
</template>
</template>
</tbody>
</table>
<loadtool-btn block v-if="shown || !isLocal" @click="showToolDialog($event)" :load="!tools.length" :path.sync="loadToolDialog.toolPath" v-on:tool_loaded="updateBtn">
</loadtool-btn>

<reset-heater-fault-dialog :shown.sync="resetHeaterFault" :heater="faultyHeater"></reset-heater-fault-dialog>

<v-menu v-model="filamentMenu.shown" :activator="filamentMenu.target" offset-y auto>
	<v-list>
		<v-list-tile @click="filamentMenu.dialogShown = true">
			<v-icon class="mr-1">swap_vert</v-icon> {{ $t('panel.tools.changeFilament') }}
		</v-list-tile>
		<v-list-tile @click="unloadFilament">
			<v-icon class="mr-1">arrow_upward</v-icon> {{ $t('panel.tools.unloadFilament') }}
		</v-list-tile>
	</v-list>
</v-menu>
<filament-dialog :shown.sync="filamentMenu.dialogShown" :tool="filamentMenu.tool"></filament-dialog>
<tool-load-dialog :shown.sync="loadToolDialog.shown" v-on:tool_loaded="updateBtn" :load="!tools.length"></tool-load-dialog>
</template>

<template v-else-if="currentPage === 'extra'">
	<table class="extra ml-2 mr-2" v-show="heat.extra.length">
		<thead>
			<th class="hidden-sm-and-down"></th>
			<th>{{ $t('panel.tools.extra.sensor') }}</th>
			<th>{{ $t('panel.tools.extra.value') }}</th>
		</thead>
		<tbody>
			<tr v-for="(extraHeater, index) in heat.extra" :key="`extra-${index}`">
				<td class="hidden-sm-and-down">
					<v-switch class="ml-3" :value="displayedExtraTemperatures.indexOf(index) !== -1" @change="toggleExtraHeaterVisibility(index)" :label="$t('panel.tools.extra.showInChart')" :disabled="uiFrozen"></v-switch>
				</td>
				<th class="py-2" :class="getExtraHeaterColor(index)">
					{{ formatHeaterName(extraHeater, index + 100) }}
				</th>
				<td class="py-2">
					{{ formatHeaterValue(extraHeater) }}
				</td>
			</tr>
		</tbody>
	</table>
	<v-alert :value="!heat.extra.length" type="info">
		{{ $t('panel.tools.extra.noItems') }}
	</v-alert>
</template>
</v-card-text>
</v-card>
</template>

<script>
'use strict'

import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'

import { getHeaterColor, getExtraHeaterColor } from '../../utils/colors.js'
import { DisconnectedError } from '../../utils/errors.js'

export default {
	props: {
		shown: {
			type: Boolean,
			required: false
		},
	},
	computed: {
		...mapGetters(['isConnected', 'uiFrozen', 'getTool']),
		...mapState('machine/model', ['heat', 'state', 'spindles', 'tools']),
		...mapState('machine/settings', ['displayedExtraTemperatures']),
		...mapState('settings', ['darkTheme']),
		canTurnEverythingOff() {
			return !this.uiFrozen && this.heat.heaters.some(heater => heater.state);
		},
		selectedToolClass() {
			return this.darkTheme ? 'grey darken-2' : 'blue lighten-5';
		},
		activeToolClass() {
			return this.darkTheme ? 'green darken-3' : 'blue lighten-5';
		},
		standbyToolClass() {
			return this.darkTheme ? 'blue darken-3' : 'blue lighten-5';
		},
		...mapState(['isLocal', 'user']),
		isBusy() {
			return (['pausing', 'paused', 'resuming', 'processing', 'simulating', 'busy', 'changingTool'].indexOf(this.state.status) !== -1)
		}
	},
	data() {
		return {
			dropdownShown: false,
			turningEverythingOff: false,

			currentPage: 'tools',
			waitingForCode: false,

			loadingFilament: false,
			filamentMenu: {
				shown: false,
				tool: undefined,
				target: undefined,
				dialogShown: false
			},
			loadToolDialog: {
				shown: false,
				toolName: "",
				toolPath: "",
			},
			resetHeaterFault: false,
			faultyHeater: [],
			universe: undefined,
			materials: {},
			preloads: [],
			window: {
				width: 0,
				height: 0
			},
			interval: undefined,
		}
	},
	destroyed() {
		window.removeEventListener('resize', this.handleResize);
		document.getElementById('toolContainer') ? document.getElementById('toolContainer').removeEventListener('resize', this.handleResize) : null;
	},
	methods: {
		...mapActions('machine', ['getFileList', 'sendCode', 'download', 'upload']),
		...mapMutations('machine/settings', ['toggleExtraHeaterVisibility']),
		handleResize() {
			//console.log('Handle Resize')
			if(document.getElementById('toolContainer')) {
				this.window.width = document.getElementById('toolContainer').clientWidth;
				this.window.height = document.getElementById('toolContainer').clientHeight;
			}
			//console.log(this.window)
		},
		showDropdown() {
			this.dropdownShown = !this.dropdownShown;
			if (this.dropdownShown) {
				const input = this.$refs.allActive;
				setTimeout(() => input.focus(), 300);
			}
		},
		async turnEverythingOff() {
			let code = '';
			this.tools.forEach(function(tool) {
				if (tool.heaters.length) {
					const onTempsA = tool.active.reduce((a, b) => `${a}:${b}`);
					const onTempsS = tool.standby.reduce((a, b) => `${a}:${b}`);
					const offTemps = tool.active.map(() => '-273.15').reduce((a, b) => `${a}:${b}`);
					//const temps = tool.heaters.map(() => '-273.15').reduce((a, b) => a + ':' + b);
					code += `G10 P${tool.number} S${offTemps} R${offTemps}\nG10 P${tool.number} S${onTempsA} R${onTempsS}\n`;
				}
			});
			this.heat.beds.forEach(function(bed, index) {
				if (bed && bed.heaters.length) {
					code += `M140 P${index} S-273.15\n`;
				}
			});
			this.heat.chambers.forEach(function(chamber, index) {
				if (chamber && chamber.heaters.length) {
					code += `M141 P${index} S-273.15\n`;
				}
			});

			this.turningEverythingOff = true;
			try {
				await this.sendCode(code);
			} catch (e) {
				if (!(e instanceof DisconnectedError)) {
					this.$log('error', this.$t('error.turnOffEverythingFailed'), e.message);
				}
			}
			this.turningEverythingOff = false;
		},

		getHeaterColor: heater => getHeaterColor(heater),
		getExtraHeaterColor: heater => getExtraHeaterColor(heater),
		formatHeaterName(heater, index) {
			if (heater.name) {
				const matches = /(.*)\[(.*)\]$/.exec(heater.name);
				if (matches) {
					return matches[1];
				}
				return heater.name;
			}
			return this.$t('panel.tools.heater', [index]);
		},
		formatHeaterValue(heater) {
			let unit = (heater.sensor >= 450 && heater.sensor < 500) ? '%RH' : '°C';
			if (heater.name) {
				const matches = /(.*)\[(.*)\]$/.exec(heater.name);
				if (matches) {
					return this.$display(heater.current, 1, matches[2]);
				}
			}
			return this.$display(heater.current, 1, unit);
		},

		canLoadFilament(tool) {
			// TODO enhance this using dedicate setting defining if the E count does not matter
			return !this.isFrozen && (tool.filament !== undefined) && (tool.extruders.length === 1);
		},
		filamentClick(e, tool) {
			this.filamentMenu.tool = tool;
			if (tool.filament) {
				this.filamentMenu.target = e.target;
				this.filamentMenu.shown = true;
			} else {
				this.filamentMenu.dialogShown = true;
			}
		},
		unloadFilament() {
			let code = '';
			if (this.state.currentTool !== this.filamentMenu.tool.number) {
				code = `T${this.filamentMenu.tool.number}\n`;
			}
			code += 'M702';
			this.sendCode(code);
		},

		toolClick(tool) {
			if (!this.isConnected) {
				return;
			}

			this.waitingForCode = true;
			try {
				if (this.state.currentTool === tool.number) {
					// Deselect current tool
					this.sendCode('T-1');
				} else {
					// Select new tool
					this.sendCode(`T${tool.number}`);
				}
			} catch (e) {
				if (!(e instanceof DisconnectedError)) {
					this.$log('error', e.message);
				}
			}
			this.waitingForCode = false;
		},
		toolHeaterClick: async function(tool, heater) {
			if (!this.isConnected) {
				return;
			}

			let offTemps;
			let onTempsA, onTempsS;
			//alert(this.isLocal ? tool.heaters.reduce((acc, heat) => Math.max(acc, this.heat.heaters[heat].state), -1) : this.heat.heaters[heater].state)
			switch (this.isLocal ? tool.heaters.reduce((acc, heat) => Math.max(acc, this.heat.heaters[heat].state), -1) : this.heat.heaters[heater].state) {
				case 0:		// Off -> Active
				onTempsA = tool.active.reduce((a, b) => `${a}:${b}`);
				onTempsS = tool.standby.reduce((a, b) => `${a}:${b}`);
				offTemps = tool.active.map(() => '0').reduce((a, b) => `${a}:${b}`);
				await this.sendCode(`G10 P${tool.number} S${offTemps} R${offTemps}\nT${tool.number}\nG10 P${tool.number} S${onTempsA} R${onTempsS}`);
				break;

				case 2:		// Active -> Standby
				this.sendCode('T-1');
				break;

				case 3:		// Fault -> Ask for reset -> Off
				this.faultyHeater = tool.heaters;
				this.resetHeaterFault = true;
				// fallsthrough

				case 1:		// Standby -> Off
				onTempsA = tool.active.reduce((a, b) => `${a}:${b}`);
				onTempsS = tool.standby.reduce((a, b) => `${a}:${b}`);
				offTemps = tool.active.map(() => '-273.15').reduce((a, b) => `${a}:${b}`);
				this.sendCode(`G10 P${tool.number} S${offTemps} R${offTemps}\nG10 P${tool.number} S${onTempsA} R${onTempsS}`);
				break;
			}
		},

		bedClick(bed, bedIndex) {
			if (bed.heaters.length) {
				// There is no special action for clicking Bed yet
				this.bedHeaterClick(bed, bedIndex, bed.heaters[0]);
			}
		},
		bedHeaterClick(bed, bedIndex, heater) {
			if (!this.isConnected) {
				return;
			}

			let temps;
			switch (this.heat.heaters[heater].state) {
				case 0:		// Off -> Active
				temps = (bed.active instanceof Array) ? bed.active.reduce((a, b) => `${a}:${b}`) : bed.active;
				this.sendCode(`M140 P${bedIndex} S${temps}`);
				break;

				case 1:		// Standby -> Off
				temps = (bed.active instanceof Array) ? bed.active.map(() => '-273.15').reduce((a, b) => `${a}:${b}`) : '-273.15';
				this.sendCode(`M140 P${bedIndex} S${temps}`);
				break;

				case 2:		// Active -> Standby
				this.sendCode(`M144 P${bedIndex}`);
				break;

				case 3:		// Fault -> Ask for reset
				this.faultyHeater = heater;
				this.resetHeaterFault = true;
				break;
			}
		},

		chamberClick(chamber, chamberIndex) {
			if (chamber.heaters.length) {
				// There is no special action for clicking Chamber yet
				this.chamberHeaterClick(chamber, chamberIndex, chamber.heaters[0]);
			}
		},
		chamberHeaterClick(chamber, chamberIndex, heater) {
			if (!this.isConnected) {
				return;
			}

			let temps;
			switch (this.heat.heaters[heater].state) {
				case 0:		// Off -> Active
				temps = (chamber.active instanceof Array) ? chamber.active.reduce((a, b) => `${a}:${b}`) : chamber.active;
				this.sendCode(`M141 P${chamberIndex} S${temps}`);
				break;

				// Standby mode for chambers is not officially supported yet (there's no code for standby control)

				case 3:		// Fault -> Ask for reset
				this.faultyHeater = heater;
				this.resetHeaterFault = true;
				break;

				default:	// Active -> Off
				temps = (chamber.active instanceof Array) ? chamber.active.map(() => '-273.15').reduce((a, b) => `${a}:${b}`) : '-273.15';
				this.sendCode(`M141 P${chamberIndex} S${temps}`);
				break;
			}
		},
		showToolDialog(){
			//console.log(event);

			this.loadToolDialog.shown = true;
		},
		updateBtn(event) {
			//console.log(event);
			this.loadToolDialog.toolName = event.name;
			this.loadToolDialog.toolPath = event.path;
		},
		heatUp(tool) {
			let furthestHeater = this.heat.heaters[tool.heaters[0]];
			let furthestTool = 0;
			let furthestMin;
			if (furthestHeater.state == 2)
			furthestMin = (Math.min(this.heat.heaters[tool.heaters[0]].current, tool.active[0])/Math.max(this.heat.heaters[tool.heaters[0]].current, tool.active[0]));
			else if(furthestHeater.state == 1)
			furthestMin = (Math.min(this.heat.heaters[tool.heaters[0]].current, tool.standby[0])/Math.max(this.heat.heaters[tool.heaters[0]].current, tool.standby[0]));
			else if (furthestHeater.state == 3)
			furthestMin = 1
			tool.heaters.forEach((item, i) => {
				if ((this.heat.heaters[item].state != 2 && this.heat.heaters[item].state > furthestHeater.state) ||
				(tool.number === this.state.currentTool && this.heat.heaters[item].state > furthestHeater.state)) {
					furthestTool = i;
					furthestHeater = this.heat.heaters[item];
					if (furthestHeater.state == 2)
					furthestMin = (Math.min(this.heat.heaters[item].current, tool.active[i])/Math.max(this.heat.heaters[item].current,tool.active[i]));
					else if(furthestHeater.state == 1)
					furthestMin = (Math.min(this.heat.heaters[item].current, tool.standby[i])/Math.max(this.heat.heaters[item].current,tool.standby[i]));
					else if (furthestHeater.state == 3)
					furthestMin = 1
				}
				if (furthestHeater.state < 3 && this.heat.heaters[item].state == furthestHeater.state ) {
					let toolMin
					if (furthestHeater.state == 2)
					toolMin = (Math.min(this.heat.heaters[item].current, tool.active[i])/Math.max(this.heat.heaters[item].current,tool.active[i]));
					else if(furthestHeater.state == 1)
					toolMin = (Math.min(this.heat.heaters[item].current, tool.standby[i])/Math.max(this.heat.heaters[item].current,tool.standby[i]));
					if ( furthestMin > toolMin ) {
						furthestTool = i;
						furthestHeater = this.heat.heaters[item];
						furthestMin = toolMin;

					}
				}
			});

			let height = Math.round((furthestMin * ((!this.isLocal || this.shown) ? 80 : 50 ))) + 'px'
			let background = (furthestHeater.state == 1 ?
				'linear-gradient(rgb(20, 100, 190) 48%, rgb(25, 115, 215) 50%, rgb(20, 100, 190) 52%) repeat scroll 0% 0% / 200% 200%':
				furthestHeater.state == 2 ? 'linear-gradient(rgb(0, 128, 0) 48%, rgb(0, 150, 0) 50%, rgb(0, 128, 0) 52%) repeat scroll 0% 0% / 200% 200%': 'red')
				let position = '50% ' + Math.round(furthestHeater.avgPWM*100) + '%'
				let heating = (((furthestHeater.state == 1) && (Math.abs(furthestHeater.current - tool.standby[furthestTool]) > 1)) || ((furthestHeater.state == 2) && (Math.abs(furthestHeater.current - tool.active[furthestTool]) > 1)))
				let err = (furthestHeater.state == 3)
				return {height, background, position, heating, err, heater: furthestHeater}
			}
		},
		mounted: async function () {
			if(this.shown || !this.isLocal) {
				this.universe = this.user.loadedTool.substr(0,this.user.loadedTool.indexOf('_'))

				let files = await this.getFileList("0:/macros/_Materials/" + this.universe);
				//console.log(files)
				const directories = files.filter((file) => file && file.isDirectory)
				files = files.filter((file) => file && !file.isDirectory)
				//console.log(directories)
				this.preloads = files;
				const that = this;
				directories.forEach(async function(dir) {
					let files = await that.getFileList("0:/macros/_Materials/" + that.universe + "/" + dir.name)
					that.materials[dir.name] = []
					files.forEach((item) => {
						that.materials[dir.name].push(item.name)
					})})
					//this.materials.push(file)
					//console.log(this.universe);
					//console.log(this.materials);
				}
				this.interval = setInterval(() => {
					if (document.getElementById('toolContainer')) {
						window.addEventListener('resize', this.handleResize);
						document.getElementById('toolContainer').addEventListener('resize', this.handleResize);
						this.handleResize();
						clearInterval(this.interval)
					}
				}, 1000)
			}
		}
		</script>
