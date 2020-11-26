<style scoped>
.loading {
	background-color: black;
}
.loading h1{
	color: white;
}
.loading,
.canvas {
	border-radius: 8px 0 0 8px;
}
.legend {
	border-radius: 0 8px 8px 0;
}
canvas {
	display: flex;
	min-height: 480px;
}
.no-cursor {
	pointer-events: none;
}
.v-expansion-panel__header{
	padding: 0 !important;
}
</style>

<template>
	<div class="component">
		<v-card class="card">
			<v-container ref="container" class="pa-1" fluid>
				<v-layout row wrap fill-height>
					<!-- TODO: Add CSV list here -->

					<v-flex class="heightmap-container pa-2" xs12 sm12 md9 lg9 xl10>
						<v-layout ref="parentElement" row fill-height>
							<v-flex class="loading" v-show="!ready">
								<v-layout fill-height align-center>
									<v-flex tag="h1" class="text-xs-center">
										{{ loading ? $t('generic.loading') : errorMessage }}
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex v-show="ready" shrink>
								<canvas ref="canvas" class="canvas" @mousemove="canvasMouseMove"></canvas>
							</v-flex>
							<v-flex d-flex shrink>
								<canvas ref="legend" class="legend" width="80"></canvas>
							</v-flex>
						</v-layout>
					</v-flex>

					<v-flex class="pa-2" xs12 sm12 md3 lg3 xl2>
						<v-layout v-bind:class="$vuetify.breakpoint.smAndDown?'row':'column'" fill-height justifiy-space-between>
							<v-layout column>
								<v-flex shrink>
									{{ $t('panel.heightmap.colorScheme') }}
								</v-flex>
								<v-flex shrink>
									<v-btn-toggle v-model="colorScheme">
										<v-btn value="terrain">{{ $t('panel.heightmap.terrain') }}</v-btn>
										<v-btn value="heat">{{ $t('panel.heightmap.heat') }}</v-btn>
										<v-btn value="diff">{{ $t('panel.heightmap.diff') }}</v-btn>
									</v-btn-toggle>
								</v-flex>
								<v-flex shrink>
									<v-btn class="ml-0" :disabled="!ready" @click="topViewFct">
										<v-icon small class="mr-1">{{topView?'3d_rotation':'vertical_align_bottom'}}</v-icon> {{ topView?$t('panel.heightmap.perspective'):$t('panel.heightmap.topView') }}
									</v-btn>
								</v-flex>
								<v-flex shrink>
									<v-btn class="ml-0" :disabled="!isConnected" :loading="loading" @click="getHeightmap(heightmapPath.lastIndexOf('/') >= 0 ? heightmapPath : Path.heightmap)">
										<v-icon class="mr-1">refresh</v-icon> {{ $t('panel.heightmap.reload') }}
									</v-btn>
								</v-flex>
							</v-layout>
							<v-layout column>
								<div>
									<div class="px-2" style="border-radius: 5px; margin: 5px auto; width: max-content" :class="statusClass()">
										{{ statusName() }}
									</div>
								</div>
								<div style="height: 250px;" :style="{'min-width': ($vuetify.breakpoint.smAndDown?'300px':''),  'margin': ($vuetify.breakpoint.smAndDown?'0 auto':'') }">
									<v-expansion-panel :value="-1" style="margin-bottom: 15px">
										<v-expansion-panel-content style="background: #4D4D4D">
											<template v-slot:header style="padding: 0">
												<span style="font-size: small">
													{{ $t('panel.settingsNetwork.advanced' )}}
												</span>
											</template>
											<v-card style="background: #0000; padding: 0 20px">
												<v-layout column>
													<v-flex class="pt-2">
														{{ $t('panel.heightmap.mapName', [heightmapPath.lastIndexOf('/') >= 0 ? heightmapPath.substr(heightmapPath.lastIndexOf('/') +1 ) : heightmapPath]) }}
													</v-flex>
													<v-spacer></v-spacer>
													<v-flex class="pt-2">
														{{ $t('panel.heightmap.probeDate', [dateToStr.date, dateToStr.hour]) }}
													</v-flex>
													<v-flex>
														{{ $t('panel.heightmap.numPoints', [$display(numPoints, 0)]) }}
													</v-flex>
													<v-flex>
														{{ $t('panel.heightmap.radius', [$display(radius, 0, 'mm')]) }}
													</v-flex>
													<v-flex>
														{{ $t('panel.heightmap.area', [$display(area / 100, 1, 'cm²')]) }}
													</v-flex>
													<v-flex>
														{{ $t('panel.heightmap.maxDeviations', [$display(minDiff, 3), $display(maxDiff, 3, 'mm')]) }}
													</v-flex>
													<v-flex>
														{{ $t('panel.heightmap.meanError', [$display(meanError, 3, 'mm')]) }}
													</v-flex>
													<v-flex>
														{{ $t('panel.heightmap.rmsError', [$display(rmsError, 3, 'mm')]) }}
													</v-flex>
												</v-layout>
											</v-card>
										</v-expansion-panel-content>
									</v-expansion-panel>
								</div>
							</v-layout>
						</v-layout>
					</v-flex>
				</v-layout>
			</v-container>
		</v-card>

		<v-tooltip top absolute v-model="tooltip.shown" :position-x="tooltip.x" :position-y="tooltip.y">
			<span class="no-cursor">
				X: {{ $display(tooltip.coord.x, 1, 'mm') }}<br/>
				Y: {{ $display(tooltip.coord.y, 1, 'mm') }}<br/>
				Z: {{ $display(tooltip.coord.z, 3, 'mm') }}
			</span>
		</v-tooltip>
	</div>
</template>

<script>
'use strict'

import { mapState, mapGetters, mapActions } from 'vuex'

import { Scene, PerspectiveCamera, OrthographicCamera, WebGLRenderer, Raycaster, Mesh, MeshBasicMaterial, Vector2, Vector3, VertexColors, DoubleSide, ArrowHelper, GridHelper, Geometry, LineSegments, LineBasicMaterial, EllipseCurve, Line, BufferGeometry } from 'three'
import OrbitControls from 'three-orbitcontrols'

import { drawLegend, setFaceColors, generateIndicators, generateMeshGeometry } from '../../utils/3d.js'
import CSV from '../../utils/csv.js'
import Path from '../../utils/path.js'

const scaleZ = 0.5
let maxVisualizationZ = 0.25, maxVisualizationZB = 0.25
const indicatorColor = 0xFFFFFF, indicatorOpacity = 0.4, indicatorOpacityHighlighted = 1.0

let threeInstances = []
window.addEventListener('resize', function() {
	threeInstances.forEach(instance => instance.resize())
})

export default {
	beforeCreate() {
		this.three = {						// non-reactive data
			scene: null,
			camera: null,
			renderer: null,
			orbitControlsPersp: null,
			orbitControlsOrtho: null,
			raycaster: null,

			hasHelpers: false,
			meshGeometry: null,
			meshPlane: null,
			meshIndicators: null,
			lastIntersection: null
		}
	},
	computed: {
		...mapGetters(['isConnected']),
		...mapState('settings', ['language', 'darkTheme']),
		...mapState('machine/model', {
			heightmapPath: (state) => {
				state = state.state;
				return (state.heightmap == undefined || state.heightmap == "" ?
				Path.heightmap :
				(state.heightmap.indexOf('/') >= 0 ?
				state.heightmap :
				Path.heightmap.substr(0, Path.heightmap.lastIndexOf('/') + 1) + state.heightmap
			)
		)
	}
}),
dateToStr() {
	let data = this.buildDate
	//console.log(data);
	let out = { date : "", hour : ""}
	if (data) {
		out.date = (data.getDate() < 10 ? "0"+data.getDate() : data.getDate())
		out.date += "/"
		out.date += (data.getMonth() < 9 ? "0"+(data.getMonth() + 1) : (data.getMonth() + 1))
		out.date += "/"
		out.date +=  data.getFullYear()

		out.hour = data.getHours() < 10 ? "0" + data.getHours() : data.getHours()
		out.hour += ":"
		out.hour += data.getMinutes() < 10 ? "0" + data.getMinutes() : data.getMinutes()
	}
	return out;
}
},
data() {
	return {
		isActive: true,
		ready: false,
		loading: false,
		errorMessage: 'height map not available',

		colorScheme: 'terrain',
		tooltip: {
			coord: {
				x: 0,
				y: 0,
				z: 0
			},
			x: undefined,
			y: undefined,
			shown: false
		},
		numPoints: undefined,			// points excluding NaN
		area: undefined,
		radius: undefined,
		minDiff: undefined,
		maxDiff: undefined,
		meanError: undefined,
		rmsError: undefined,
		topView: false,

		unsubscribe: undefined,
		buildDate: undefined,
	}
},
methods: {
	...mapActions('machine', ['download']),
	init() {
		// Perform initial resize
		const size = this.resize();

		// Create THREE instances
		this.three.scene = new Scene();
		this.three.perspectiveCamera = new PerspectiveCamera(45, size.width / size.height, 0.1, 1000);
		this.three.perspectiveCamera.position.set(0, -1.15, 1.15);
		this.three.perspectiveCamera.up = new Vector3(0, 0, 1);
		//																							 w min	w max
		var w, h
		if (size.width > size.height) {
			w = 0.65*(size.width/size.height)
			h = 0.65
		} else {
			w = 0.65*(size.height/size.width)
			h = 0.65
		}
		this.three.orthoCamera = new OrthographicCamera( -w,	w,	h, -h, 0.1, 1000 );
		this.three.orthoCamera.position.set(0, 0, 1);
		this.three.orthoCamera.rotation.set(0, 0, Math.PI / 2);
		this.three.orthoCamera.up = new Vector3(0, 0, 1);

		this.three.renderer = new WebGLRenderer({ canvas: this.$refs.canvas });
		this.three.renderer.setSize(size.width, size.height);
		this.three.orbitControlsPersp = new OrbitControls(this.three.perspectiveCamera, this.three.renderer.domElement);
		this.three.orbitControlsPersp.enableKeys = false;
		this.three.orbitControlsOrtho = new OrbitControls(this.three.orthoCamera, this.three.renderer.domElement);
		this.three.orbitControlsOrtho.enableKeys = false;
		this.three.raycaster = new Raycaster();

		// Register this instance in order to deal with size changes
		threeInstances.push(this);
		if (this.isConnected) {
			this.getHeightmap(this.heightmapPath.lastIndexOf('/') >= 0 ? this.heightmapPath : Path.heightmap);
		}
	},
	resize() {
		if (!this.isActive) {
			return;
		}

		// Resize canvas elements
		const containerOffset = this.$refs.container.scrollWidth - this.$refs.container.offsetWidth;
		const width = this.$refs.parentElement.offsetWidth - this.$refs.legend.offsetWidth - containerOffset;
		const height = this.$refs.parentElement.offsetHeight;
		this.$refs.legend.height = height;
		this.$refs.canvas.width = width;
		this.$refs.canvas.height = height;

		// Resize the 3D height map
		if (this.three.renderer) {
			var w, h
			if (width > height) {
				w = 0.65*(width/height)
				h = 0.65
			} else {
				w = 0.65*(height/width)
				h = 0.65
			}
			this.three.orthoCamera.left = -w;
			this.three.orthoCamera.right = w;
			this.three.orthoCamera.top = h;
			this.three.orthoCamera.bottom = -h
			this.three.orthoCamera.updateProjectionMatrix();
			this.three.perspectiveCamera.aspect = width / height;
			this.three.perspectiveCamera.updateProjectionMatrix();
			this.three.renderer.setSize(width, height);
		}

		// Redraw the legend and return the canvas size
		drawLegend(this.$refs.legend, maxVisualizationZ, this.colorScheme);
		return { width, height };
	},
	showCSV(csvData, clear=true) {
		// RepRapFirmware height map file v2 generated at 2020-01-09 15:36, min error -0.238, max error 0.166, mean -0.067, deviation 0.076
		if (clear) {
			this.buildDate = new Date(csvData.substring(csvData.indexOf(" at ")+4, csvData.indexOf(",")))
		}
		// Load the CSV. The first line is a comment that can be removed
		const csv = new CSV(csvData.substr(csvData.indexOf("\n") + 1));
		let radius = parseFloat(csv.get('radius'));
		if (radius <= 0) { radius = undefined; }
		const xMin = parseFloat(csv.get('xmin'));
		const yMin = parseFloat(csv.get('ymin'));
		let xSpacing = parseFloat(csv.get('xspacing'));
		if (isNaN(xSpacing)) { xSpacing = parseFloat(csv.get('spacing')); }
		let ySpacing = parseFloat(csv.get('yspacing'));
		if (isNaN(ySpacing)) { ySpacing = parseFloat(csv.get('spacing')); }

		// Convert each point to a vector
		const points = [];
		for (let y = 1; y < csv.content.length; y++) {
			for (let x = 0; x < csv.content[y].length; x++) {
				const value = csv.content[y][x].trim();
				points.push([-(xMin + x * xSpacing), -(yMin + (y - 1) * ySpacing), (value === "0") ? NaN : parseFloat(value)]);
			}
		}

		// Display height map
		this.showHeightmap(points, radius, clear, xSpacing);
	},
	showHeightmap(points, probeRadius, clear=true, xSpacing=20) {
		// Clean up first
		if (this.three.meshGeometry && clear) {
			this.three.scene.remove(this.three.meshPlane);
			this.three.meshIndicators.forEach(function(indicator) {
				this.remove(indicator);
			}, this.three.scene);

			this.three.meshGeometry = null;
			this.three.meshPlane = null;
			this.three.meshIndicators = null;
			this.three.lastIntersection = null;
		}

		// Generate stats
		let xMin, xMax, yMin, yMax, zMin, zMax;
		if (clear) {
			this.radius = probeRadius;
			this.numPoints = 0;
			this.minDiff = undefined;
			this.maxDiff = undefined;
			this.meanError = 0;
			this.biasError = 0;
			this.rmsError = 0;
		}

		for (let i = 0; i < points.length; i++) {
			const z = points[i][2];
			if (!isNaN(z)) {
				const x = points[i][0];
				const y = points[i][1];
				if (xMin === undefined || xMin > x) { xMin = x; }
				if (xMax === undefined || xMax < x) { xMax = x; }
				if (yMin === undefined || yMin > y) { yMin = y; }
				if (yMax === undefined || yMax < y) { yMax = y; }
				if (zMin === undefined || zMin > z) { zMin = z; }
				if (zMax === undefined || zMax < z) { zMax = z; }
				if (clear) {
					this.numPoints++;
					this.meanError += Math.abs(z);
					this.biasError += z;
					this.rmsError += z * z;
					if (this.minDiff === undefined || this.minDiff > z) { this.minDiff = z; }
					if (this.maxDiff === undefined || this.maxDiff < z) { this.maxDiff = z; }
				}
			}
		}
		if (clear) {
			this.area = probeRadius ? (probeRadius * probeRadius * Math.PI) : Math.abs((xMax - xMin) * (yMax - yMin));
			this.rmsError = Math.sqrt(((this.rmsError * this.numPoints) - (this.biasError * this.biasError))) / this.numPoints;
			this.meanError = this.meanError / this.numPoints;
			this.biasError = this.biasError / this.numPoints;
			//maxVisualizationZ = Math.min(Math.max(Math.abs(zMin), zMax), 0.5)
		} else {
			//maxVisualizationZB = Math.min(Math.max(Math.abs(zMin), zMax), 0.5)
		}
		// Generate mesh geometry and apply face colors
		if (clear) {
			this.three.meshGeometry = generateMeshGeometry(points, xMin, xMax, yMin, yMax, scaleZ);
			setFaceColors(this.three.meshGeometry, scaleZ, this.colorScheme, maxVisualizationZ);
		} else {
			this.three.meshBGeometry = generateMeshGeometry(points, xMin, xMax, yMin, yMax, scaleZ)
			//console.log(points.toSource(), this.three.meshBGeometry.vertices.toSource())
			this.three.meshGeometry.vertices.forEach((vertex, index) => {
				let vertexB = this.three.meshBGeometry.vertices[index];
				this.three.meshBGeometry.vertices[index].z = vertex.z - vertexB.z

				if (zMin === undefined || zMin > (vertex.z - vertexB.z)/scaleZ) { zMin = (vertex.z - vertexB.z)/scaleZ; }
				if (zMax === undefined || zMax < (vertex.z - vertexB.z)/scaleZ) { zMax = (vertex.z - vertexB.z)/scaleZ; }
			});
			//maxVisualizationZB = Math.min(Math.max(Math.abs(zMin), zMax), 0.5)
			setFaceColors(this.three.meshBGeometry, scaleZ, this.colorScheme, maxVisualizationZB);
		}

		if (clear) {
			// Make 3D mesh and add it
			const material = new MeshBasicMaterial({ vertexColors: VertexColors, side: DoubleSide });
			this.three.meshPlane = new Mesh(this.three.meshGeometry, material);
			this.three.meshPlane.name="APlane"
			this.three.scene.add(this.three.meshPlane);

			// Make indicators and add them
			this.three.meshIndicators = generateIndicators(this.three.meshGeometry, this.numPoints, scaleZ, indicatorColor, indicatorOpacity);
			this.three.meshIndicators.forEach(function(indicator) {
				this.add(indicator);
			}, this.three.scene);
		} else {
			// Make 3D mesh and add it
			const material = new MeshBasicMaterial({ vertexColors: VertexColors, side: DoubleSide });
			this.three.meshBPlane = new Mesh(this.three.meshBGeometry, material);
			this.three.meshBPlane.name="diffPlane"
			this.three.meshBPlane.visible=false;
			this.three.scene.add(this.three.meshBPlane);

			// Make indicators and add them
			this.three.meshBIndicators = generateIndicators(this.three.meshBGeometry, this.numPoints, scaleZ, indicatorColor, indicatorOpacity);
			this.three.meshBIndicators.forEach(function(indicator) {
				indicator.visible= false;
				this.add(indicator);
			}, this.three.scene);
		}


		if (!this.three.hasHelpers) {
			if(!probeRadius) {
				// Make axis arrows for XYZ
				this.three.scene.add(new ArrowHelper(new Vector3(1, 0, 0), new Vector3(-0.6, -0.6, 0), 0.5, 0xFF0000));
				this.three.scene.add(new ArrowHelper(new Vector3(0, 1, 0), new Vector3(-0.6, -0.6, 0), 0.5, 0x00FF00));
				this.three.scene.add(new ArrowHelper(new Vector3(0, 0, 1), new Vector3(-0.6, -0.6, 0), 0.5, 0x0000FF));

				// Make grid on XY plane
				const grid = new GridHelper(1.1, 15);
				grid.rotation.x = -Math.PI / 2;
				this.three.scene.add(grid);
			} else if (probeRadius) {
				// Make axis arrows for XYZ
				this.three.scene.add(new ArrowHelper(new Vector3(-1, 0, 0), new Vector3(0, 0, 0), 0.5, 0xFF0000));
				this.three.scene.add(new ArrowHelper(new Vector3(0, -1, 0), new Vector3(0, 0, 0), 0.5, 0x00FF00));
				this.three.scene.add(new ArrowHelper(new Vector3(0, 0, 1), new Vector3(0, 0, 0), 0.5, 0x0000FF));

				// Make grid on XY plane
				var gridPrimeGeo = new Geometry();
				var gridSecGeo = new Geometry();

				let gridScale = 0.5 * ( 200 / xMax )
				let stepScale = gridScale/(0.25*(200/xSpacing))
				this.prepareGridBPGeoPreview(gridPrimeGeo, gridSecGeo, gridScale, stepScale);
				let line = new LineSegments(gridPrimeGeo, new LineBasicMaterial({ color:	0xafafaf}));
				line.name = "gridHelper";
				this.three.scene.add(line);
				line = new LineSegments(gridSecGeo, new LineBasicMaterial({ color: 0x7f7f7f}))
				line.name = "gridHelper";
				this.three.scene.add(line);

				// Create the final object to add to the scene
				var curve = new EllipseCurve(
					0,	0,					// ax, aY
					gridScale, gridScale,				// xRadius, yRadius
					0,	2 * Math.PI,// aStartAngle, aEndAngle
					false,					// aClockwise
					0								// aRotation
				);
				line = new Line( new BufferGeometry().setFromPoints(curve.getPoints(64)), new LineBasicMaterial( { color : 0xafafaf}))
				line.name = "gridHelper";
				this.three.scene.add(line);
			}
			this.three.scene.rotation.z = Math.PI
			//console.log(this.three.scene.rotation.z)
			// Don't add these helpers again
			this.three.hasHelpers = true;
		}

		// Render scene
		this.ready = true;
		this.resize();
		this.render();
		//console.log(this.three.scene)
	},
	prepareGridBPGeoPreview(gridPrime, gridSec, gridScale, stepScale) {
		let limitY = gridScale;
		let stepY = stepScale//(2*limitY)/5;
		let stepX = (stepY/4)
		for (var posY = 0; posY < limitY; posY += stepY) {
			var miniX = -limitY * Math.sqrt(1 - ((posY/limitY) * (posY/limitY)));
			var maxiX =	limitY * Math.sqrt(1 - ((posY/limitY) * (posY/limitY)));
			gridPrime.vertices.push(new Vector3(miniX, posY, 0));
			gridPrime.vertices.push(new Vector3(maxiX, posY, 0));
			gridPrime.vertices.push(new Vector3(posY, miniX, 0));
			gridPrime.vertices.push(new Vector3(posY, maxiX, 0));
			miniX = -limitY * Math.sqrt(1 - ((-posY/limitY) * (-posY/limitY)));
			maxiX =	limitY * Math.sqrt(1 - ((-posY/limitY) * (-posY/limitY)));
			gridPrime.vertices.push(new Vector3(miniX,-posY, 0));
			gridPrime.vertices.push(new Vector3(maxiX,-posY, 0));
			gridPrime.vertices.push(new Vector3(-posY, miniX, 0));
			gridPrime.vertices.push(new Vector3(-posY, maxiX, 0));
			for (var posX = posY + stepX; posX < posY + stepY; posX += stepX) {
				miniX = -limitY * Math.sqrt(1 - ((posX/limitY) * (posX/limitY)));
				maxiX =	limitY * Math.sqrt(1 - ((posX/limitY) * (posX/limitY)));
				gridSec.vertices.push(new Vector3(miniX, posX, 0));
				gridSec.vertices.push(new Vector3(maxiX, posX, 0));
				gridSec.vertices.push(new Vector3(posX, miniX, 0));
				gridSec.vertices.push(new Vector3(posX, maxiX, 0));
				miniX = -limitY * Math.sqrt(1 - ((-posX/limitY) * (-posX/limitY)));
				maxiX =	limitY * Math.sqrt(1 - ((-posX/limitY) * (-posX/limitY)));
				gridSec.vertices.push(new Vector3(miniX, -posX, 0));
				gridSec.vertices.push(new Vector3(maxiX, -posX, 0));
				gridSec.vertices.push(new Vector3(-posX, miniX, 0));
				gridSec.vertices.push(new Vector3(-posX, maxiX, 0));
			}
		}
	},
	render() {
		if (this.three.renderer) {
			requestAnimationFrame(this.render);
			/*for(let i = 0 ;	i < this.three.scene.children.length; i++) {
			if (this.three.scene.children[i].rotation.x == 0)
			this.three.scene.children[i].rotation.z += 0.001
		}*/
		this.three.renderer.render(this.three.scene, //(this.topView ?
			/* this.three.orthoCamera : */ this.three.perspectiveCamera);
		}
	},
	canvasMouseMove(e) {
		if (!e.clientX || !this.three.meshGeometry) {
			return;
		}

		// Try to get the Z value below the cursor
		// For that we need normalized X+Y coordinates between -1.0 and 1.0
		const rect = e.target.getBoundingClientRect();
		const mouse = new Vector2();
		mouse.x = (e.clientX - rect.left) / e.target.clientWidth * 2 - 1;
		mouse.y = -(e.clientY - rect.top) / e.target.clientHeight * 2 + 1;

		// Is the cursor on a point indicator?
		this.three.raycaster.setFromCamera(mouse, this.three.perspectiveCamera);
		const intersection = this.three.raycaster.intersectObjects(this.three.meshIndicators);
		if (this.three.lastIntersection && (intersection.length === 0 || intersection[0] !== this.three.lastIntersection)) {
			this.three.lastIntersection.object.material.opacity = indicatorOpacity;
			this.three.lastIntersection = undefined;
		}

		let intersectionPoint;
		if (intersection.length > 0) {
			if (intersection[0] !== this.three.lastIntersection) {
				intersection[0].object.material.opacity = indicatorOpacityHighlighted;
				this.three.lastIntersection = intersection[0];
			}
			intersectionPoint = intersection[0].object.coords;
		}

		// Show or hide the tooltip
		if (intersectionPoint) {
			this.tooltip.coord.x = intersectionPoint.x;
			this.tooltip.coord.y = intersectionPoint.y;
			this.tooltip.coord.z = intersectionPoint.z;
			this.tooltip.x = e.clientX;
			this.tooltip.y = e.clientY;
			this.tooltip.shown = true;
		} else {
			this.tooltip.shown = false;
		}
	},
	topViewFct() {
		this.topView = true //!this.topView;
		if(this.topView) {
			this.three.perspectiveCamera.position.set(0, 0, 1.65);
			this.three.perspectiveCamera.rotation.set(0, 0, 0);
			this.three.perspectiveCamera.updateProjectionMatrix();
		} else {
			this.three.perspectiveCamera.position.set(1, 1, 1);
			this.three.perspectiveCamera.rotation.set(-0.80, 0.60, 2.60);
			this.three.perspectiveCamera.updateProjectionMatrix();
			//this.three.orbitControlsPersp.reset();
		}
		//this.three.orbitControlsOrtho.reset();
		this.three.orthoCamera.position.set(0, 0, 1);
		this.three.orthoCamera.rotation.set(0, 0, Math.PI/2);
		this.three.orthoCamera.updateProjectionMatrix();
		this.topView = false
	},

	async getHeightmap(filename = Path.heightmap) {
		if (this.loading) {
			// Don't attempt to load more than one file at once...
			return;
		}

		if (this.three.scene) {
			while(this.three.scene.children.length > 0){
				this.three.scene.remove(this.three.scene.children[0]);
			}
			this.three.hasHelpers = false;
			this.colorScheme = (this.colorScheme == "heat" ? "heat" : "terrain")
		}

		this.ready = false;
		this.loading = true;
		try {
			const back = await this.download({ filename: filename+".bak", type: 'text', showSuccess: false, showError: false });
			const heightmap = await this.download({ filename, type: 'text', showSuccess: false, showError: false });
			this.showCSV(heightmap);
			this.showCSV(back, false);
		} catch (e) {
			console.warn(e);
			this.errorMessage = e.message;
		}
		this.loading = false;
	},

	testMesh() {
		const csvData = 'RepRapFirmware height map file v1\nxmin,xmax,ymin,ymax,radius,spacing,xnum,ynum\n-140.00,140.10,-140.00,140.10,150.00,20.00,15,15\n0,0,0,0,0,-0.139,-0.188,-0.139,-0.202,-0.224,0,0,0,0,0\n0,0,0,-0.058,-0.066,-0.109,-0.141,-0.129,-0.186,-0.198,-0.191,-0.176,0,0,0\n0,0,0.013,-0.008,-0.053,-0.071,-0.087,-0.113,-0.162,-0.190,-0.199,-0.267,-0.237,0,0\n0,0.124,0.076,0.025,-0.026,-0.054,-0.078,-0.137,-0.127,-0.165,-0.201,-0.189,-0.227,-0.226,0\n0,0.198,0.120,0.047,0.089,-0.074,-0.097,-0.153,-0.188,-0.477,-0.190,-0.199,-0.237,-0.211,0\n0.312,0.229,0.198,0.098,0.097,0.004,-0.089,-0.516,-0.150,-0.209,-0.197,-0.183,-0.216,-0.296,-0.250\n0.287,0.263,0.292,0.100,0.190,0.015,-0.102,-0.039,-0.125,-0.149,-0.137,-0.198,-0.188,-0.220,-0.192\n0.378,0.289,0.328,0.172,0.133,0.078,-0.086,0.134,-0.100,-0.150,-0.176,-0.234,-0.187,-0.199,-0.221\n0.360,0.291,0.260,0.185,0.111,0.108,0.024,0.073,-0.024,-0.116,-0.187,-0.252,-0.201,-0.215,-0.187\n0.447,0.397,0.336,0.276,0.180,0.164,0.073,-0.050,-0.049,-0.109,-0.151,-0.172,-0.211,-0.175,-0.161\n0,0.337,0.289,0.227,0.179,0.127,0.086,0.034,-0.039,-0.060,-0.113,-0.108,-0.171,-0.153,0\n0,0.478,0.397,0.374,0.270,0.141,0.085,0.074,0.037,-0.048,-0.080,-0.187,-0.126,-0.175,0\n0,0,0.373,0.364,0.265,0.161,0.139,0.212,0.040,0.046,-0.008,-0.149,-0.115,0,0\n0,0,0,0.346,0.295,0.273,0.148,0.136,0.084,0.024,-0.055,-0.078,0,0,0\n0,0,0,0,0,0.240,0.178,0.084,0.090,0.004,0,0,0,0,0';
		this.showCSV(csvData);
	},
	testBedCompensation(numPoints) {
		let testPoints;
		switch (numPoints) {
			case 3:
			testPoints = [[15.0, 15.0, 0.123], [15.0, 195.0, -0.243], [215.0, 105.0, 0.034]];
			break;
			case 4:
			testPoints = [[15.0, 15.0, 0.015], [15.0, 185.0, -0.193], [175.0, 185.0, 0.156], [175.0, 15.0, 0.105]];
			break;
			case 5:
			testPoints = [[15.0, 15.0, 0.007], [15.0, 185.0, -0.121], [175.0, 185.0, -0.019], [175.0, 15.0, 0.193], [95.0, 100.0, 0.05]];
			break;
			default:
			throw new Error("Bad number of probe points, only one of 3/4/5 is supported");
		}
		this.showHeightmap(testPoints);
	},
	statusClass() {
		if (this.rmsError < 0.10) {
			return this.darkTheme ? 'light-green darken-3' : 'light-green lighten-4';
			//} else if (this.rmsError < 0.10) {
			//	return this.darkTheme ? 'yellow darken-3 black--text' : 'orange accent-2';
		} else if (this.rmsError < 0.15) {
			return this.darkTheme ? 'orange darken-2' : 'yellow lighten-1';
		} else if (this.rmsError >= 0.15) {
			return this.darkTheme ? 'red darken-2 white--text' : 'red darken-1 white--text';
		}
	},
	statusName() {
		if (this.rmsError < 0.05) {
			return this.$t('panel.heightmap.probing.perfect');
		} else if (this.rmsError < 0.10) {
			return this.$t('panel.heightmap.probing.valid');
		} else if (this.rmsError < 0.15) {
			return this.$t('panel.heightmap.probing.danger');
		} else if (this.rmsError >= 0.15){
			return this.$t('panel.heightmap.probing.reprobe');
		}
	}
},
activated() {
	this.isActive = true;
	this.resize();
},
deactivate() {
	this.isActive = false;
},
mounted() {
	const getHeightmap = this.getHeightmap;
	this.unsubscribe = this.$store.subscribeAction(function(action) {
		if (action.type.endsWith('onCodeCompleted') && action.payload.reply.indexOf('heightmap.csv') !== -1) {
			getHeightmap();
		}
	});
	console.log("Heightmap: " + this.heightmapPath)
	// FIXME give the grid some time to resize everything...
	setTimeout(this.init, 100);
},
beforeDestroy() {
	this.unsubscribe();

	threeInstances = threeInstances.filter(item => item !== this);
	if (this.three.renderer) {
		this.three.renderer.forceContextLoss();
		this.three.renderer = null;
	}
},
watch: {
	colorScheme(to) {
		this.three.meshPlane.visible = (to != 'diff')
		this.three.meshIndicators.forEach(function(indicator) {
			indicator.visible= (to != 'diff');
		}, this.three.scene);
		this.three.meshBPlane.visible = (to == 'diff')
		this.three.meshBIndicators.forEach(function(indicator) {
			indicator.visible= (to == 'diff');
		}, this.three.scene);

		if (this.three.meshGeometry) {
			setFaceColors((to=="diff"?this.three.meshBGeometry:this.three.meshGeometry), scaleZ, to, (to=="diff"?maxVisualizationZB:maxVisualizationZ));
		}
		drawLegend(this.$refs.legend, (to=="diff"?maxVisualizationZB:maxVisualizationZ), to);
	},
	isConnected(to) {
		if (to) {
			this.getHeightmap();
		}
	},
	language() {
		drawLegend(this.$refs.legend, maxVisualizationZ, this.colorScheme);
	}
}
}
</script>
