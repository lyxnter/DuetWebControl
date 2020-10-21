let $ = require('jquery');
let THREE = require('three');
//import { mapState } from 'vuex'

export default {
	name: 'PreviewScene',
	computed: {
		//...mapState({selectedMachine: state => state.selectedMachine}),
	},
	data() {
		return {
			previewCamera: undefined,
			previewScene: undefined,
			previewRenderer: undefined,
			previewControls: undefined,
			pointCloud: [],
			keys: [],
			lays: [],
			tempChartOptions: 	{
				// This array should hold maxHeaters + maxTempSensors items
				//43,98,53,  223°,57,41, cmyk(0%, 0%, 0%, 5%)
				colors: ["#FDB913", "#403E3D", "#2D4EA2", "#FFA000", "#FF00FF", "#337AB7", "#000000", "#E0E000",	// Heater colors
				"#AEAEAE", "#BC0000", "#00CB00", "#0000DC", "#FEABEF", "#A0A000", "#DDDD00", "#00BDBD", "#CCBBAA", "#AA00AA"],		// Virtual heater colors
				grid: {
					borderWidth: 0
				},
				xaxis: {
					show: false
					/*labelWidth: 0,
					labelHeight: 0,
					tickSize: 30000,
					tickFormatter: function() { return ""; },
					reserveSpace: false*/
				},
				yaxis: {
					min: 0,
					max: 280
				}
			},
			selectedMachine: undefined,
			DEBUG: false,
		}
	},
	methods: {
		initPreview: function(target) {
			//console.log(target);
			this.selectedMachine = "https://"+target+"/";
			//console.log(this.selectedMachine);
			this.tempChartOptions = {
				// This array should hold maxHeaters + maxTempSensors items
				// This array should hold maxHeaters + maxTempSensors items
				//43,98,53,  223°,57,41, cmyk(0%, 0%, 0%, 5%)
				colors: ["#FDB913", "#2D4EA2", "#403e3d", "#FFA000", "#FF00FF", "#337AB7", "#000000", "#E0E000",	// Heater colors
				"#AEAEAE", "#BC0000", "#00CB00", "#0000DC", "#FEABEF", "#A0A000", "#DDDD00", "#00BDBD", "#CCBBAA", "#AA00AA"],		// Virtual heater colors
			}
			this.DEBUG = false;
			if (this.previewScene) {
				if (this.DEBUG)
				console.log("Scene already defined");
				return;
			}
			this.previewScene = new THREE.Scene();
			this.previewScene.background = new THREE.Color(/*0xffffff*/0x403e3d);
			this.previewCamera = new THREE.PerspectiveCamera(45, 600 / 600, 0.1, 10000);
			var previewSpace = ($("#threeDisplay")[0] ? $("#threeDisplay")[0] : $("#threeDisplay"));
			previewSpace.innerHTML = "";
			this.previewRenderer = new THREE.WebGLRenderer({
				preserveDrawingBuffer: true,
				alpha: true
			});
			this.lays = [];
			this.previewRenderer.setSize(1200, 1200);

			this.previewRenderer.shadowMapEnabeled = true;
			this.previewRenderer.shadowMap.type = THREE.BasicShadowMap;
			//previewSpace.prop("style", "transform: scale(0.5)");
			previewSpace.appendChild(this.previewRenderer.domElement);
			var ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
			this.previewScene.add(ambientLight);

			var light = new THREE.PointLight(0xffffff, 1, 600);
			light.position.set(0, 295, 0);
			light.castShadow = true;
			light.shadow.camera.near = 0.1;
			light.shadow.camera.far = 1000
			this.previewScene.add(light);

			var geometry = new THREE.CircleGeometry(180, 30);
			var material = new THREE.MeshPhongMaterial({
				color: 0xf0f0f0
			});
			var buildPlate = new THREE.Mesh(new THREE.CircleGeometry(200, 30), new THREE.MeshBasicMaterial({
				color: 0xf0f0f0
			}));
			buildPlate.receiveShadow = true;
			buildPlate.rotation.x = -Math.PI / 2;
			buildPlate.position.y = -1;
			var buildSurface = new THREE.Mesh(geometry, material);
			buildSurface.receiveShadow = true;
			buildSurface.rotation.x = -Math.PI / 2;
			buildSurface.position.y = 0.1;
			var topMaterial = new THREE.MeshPhongMaterial({
				color: 0xffffff,
				side: THREE.BackSide
			});
			var topCircle = new THREE.Mesh(geometry, topMaterial);
			topCircle.rotation.x = -Math.PI / 2;
			topCircle.position.y = 600;
			//this.previewScene.add( topCircle );
			this.previewScene.add(buildSurface);
			this.previewScene.add(buildPlate);
			geometry = new THREE.CylinderGeometry(200, 200, 602, 32, 1, true, 0, 2*Math.PI);
			material = new THREE.MeshBasicMaterial({
				color: 0xe0e0e0,
				side: THREE.BackSide
			});
			var buildVolume = new THREE.Mesh(geometry, material);

			buildVolume.position.y = 300;
			//this.previewScene.add(buildVolume);

			this.previewControls = new THREE.OrbitControls(this.previewCamera, $("#threeDisplay")[0]);

			var gridPrimeGeo = new THREE.Geometry();
			var gridSecGeo = new THREE.Geometry();
			var materPrime = new THREE.LineBasicMaterial({
				color: 0x7f7f7f
			});
			var materSec = new THREE.LineBasicMaterial({
				color: 0xafafaf
			});

			this.prepareGridBPGeoPreview(gridPrimeGeo, gridSecGeo);

			this.previewScene.add(new THREE.LineSegments(gridPrimeGeo, materPrime));
			this.previewScene.add(new THREE.LineSegments(gridSecGeo, materSec));

			// this.previewCamera center
			this.previewCamera.position.set(-400, 575, 0);
			//this.previewCamera positive
			//this.previewCamera.position.set(-100, 150, 100);
			this.previewCamera.rotation.set(-Math.PI / 2, -1, -Math.PI / 2);
		},
		prepareGridBPGeoPreview: function(gridPrime, gridSec) {
			for (var posY = -200; posY < 180; posY += 100) {
				var miniX = -180 * Math.sqrt(1 - ((posY / 180) * (posY / 180)));
				var maxiX = 180 * Math.sqrt(1 - ((posY / 180) * (posY / 180)));
				gridPrime.vertices.push(new THREE.Vector3(miniX, 1, posY));
				gridPrime.vertices.push(new THREE.Vector3(maxiX, 1, posY));
				gridPrime.vertices.push(new THREE.Vector3(posY, 1, miniX));
				gridPrime.vertices.push(new THREE.Vector3(posY, 1, maxiX));
				for (var posX = posY + 20; posX < posY + 100; posX += 20) {
					miniX = -180 * Math.sqrt(1 - ((posX / 180) * (posX / 180)));
					maxiX = 180 * Math.sqrt(1 - ((posX / 180) * (posX / 180)));
					gridSec.vertices.push(new THREE.Vector3(miniX, 1, posX));
					gridSec.vertices.push(new THREE.Vector3(maxiX, 1, posX));
					gridSec.vertices.push(new THREE.Vector3(posX, 1, miniX));
					gridSec.vertices.push(new THREE.Vector3(posX, 1, maxiX));
				}
			}
		},
		initRender: function(gcodeReader) {
			this.i = 0;
			this.lay = 0;
			if (!this.pointCloud)
			this.pointCloud = [];
			this.nbKey = this.pointCloud.length;
			this.keys = [];
			for (let key in this.pointCloud) {
				if (key != "length") {
					this.keys.push(key);
				}
			}
			for (let gcodeLayer in this.pointCloud[this.keys[0]]) {
				this.lays.push(gcodeLayer);
			}
			var color = new THREE.Color(this.tempChartOptions.colors[this.keys[this.i]]);
			if(this.DEBUG)
			console.log(this.keys[this.i] +" ("+color.r+","+color.g+","+color.b+")")
			this.pointMaterial = new THREE.LineBasicMaterial({
				color: color,
				linewidth: 2
			});
			this.meshMaterial = new THREE.MeshPhongMaterial({
				color: color
			});

			for (let key in this.pointCloud) {
				if (this.slicer == undefined || key == "Unknown" || key != "length") {
					for (let gcodeLayer in this.pointCloud[key]) {
						this.previewScene.remove(this.previewScene.getObjectByName(key + "_" + gcodeLayer));
					}
				}
			}

			if (this.previewScene.getObjectByName("bbox")) {
				this.previewScene.remove(this.previewScene.getObjectByName("bbox"));
			}
			//this.newStatus = this.parseRows[this.parsedFileCount].find("#status");
			if(this.DEBUG)
			console.log("BBox redrawn");
			this.renderLoop(gcodeReader);
		},
		animate: function() {
			//this.statsfps.begin();
			this.previewControls.update();
			if (this.hasGeoToRender)
			requestAnimationFrame( this.animate );
			if (this.hasGeoToRender)
			this.previewRenderer.render( this.previewScene, this.previewCamera );
			if (this.hasGeoToRender)
			this.renderLoop();
			//light.position.z -= 0.1;
		},
		renderLoop: function(gcodeReader) {
			if (this.i == this.keys.length) {
				this.hasGeoToRender = false;
				console.log("Done ");
				//this.initRedraw();
				var imgData;
				try {
					this.previewCamera.position.set(-800, 550, 0);
					this.previewControls.target.set(0, 250, 0);
					this.previewControls.update();
					this.previewRenderer.render(this.previewScene, this.previewCamera);
					var strMime = "image/jpeg";
					imgData = this.previewRenderer.domElement.toDataURL(strMime);
					this.savePicture(imgData.replace(strMime, this.strDownloadMime), this.fileName.substring(this.fileName.lastIndexOf("/" )+1) + "_bp.jpg");

					var centerX = (gcodeReader.boundingBox.max.x + gcodeReader.boundingBox.min.x) / 2;
					var centerY = (gcodeReader.boundingBox.max.y + gcodeReader.boundingBox.min.y) / 2;
					var centerZ = (gcodeReader.boundingBox.max.z + gcodeReader.boundingBox.min.z) / 2;
					var width = gcodeReader.boundingBox.max.x - gcodeReader.boundingBox.min.x;
					var length = gcodeReader.boundingBox.max.y - gcodeReader.boundingBox.min.y;
					var height = gcodeReader.boundingBox.max.z - gcodeReader.boundingBox.min.z;
					let dFromC = 1.24 * Math.sqrt(width * width + length * length);
					this.previewControls.object.position.set(centerY - dFromC * Math.cos(Math.PI / 4), 4 / 5 * (centerZ + Math.max(width, length, height)), centerX - dFromC * Math.sin(Math.PI / 4));
					this.previewControls.target.set(centerY, centerZ, centerX);
					this.previewControls.update();
					this.previewRenderer.render(this.previewScene, this.previewCamera);
					imgData = this.previewRenderer.domElement.toDataURL(strMime);
					this.savePicture(imgData.replace(strMime, this.strDownloadMime), this.fileName.substring(this.fileName.lastIndexOf("/" )+1) + "_ico.jpg");
					if(this.DEBUG)
					console.log(this.previewScene);
					for (let key in this.pointCloud) {
						if (this.slicer == undefined || key == "Unknown" || key != "length") {
							for (let gcodeLayer in this.pointCloud[key]) {
								//console.log(this.previewScene.getObjectByName(key + "_" + gcodeLayer))
								this.previewScene.remove(this.previewScene.getObjectByName(key + "_" + gcodeLayer));
							}
						}
					}
				} catch (e) {
					console.error(e);
					return;
				}
				return;
			}
			if (this.lays[this.lay] != undefined) {
				var start = new Date();
				do {
					this.renderGeo(this.keys[this.i], this.lays[this.lay], gcodeReader);
					this.lay++;
				} while ((new Date() - start < 50) && (this.lays[this.lay] != undefined))
			} else if (this.i < this.keys.length) {
				this.i++;
				this.lays = [];
				for (var gcodeLayer in this.pointCloud[this.keys[this.i]]) {
					this.lays.push(gcodeLayer);
				}
				var color = new THREE.Color(this.tempChartOptions.colors[this.keys[this.i]]);
				if(this.DEBUG)
				console.log("key"+this.keys[this.i] +": ("+color.r+","+color.g+","+color.b+")")
				this.pointMaterial = new THREE.LineBasicMaterial({
					color: color,
					linewidth: 2
				});
				this.meshMaterial = new THREE.MeshPhongMaterial({
					color: color
				});
				this.lay = 0;
				if(this.DEBUG)
				console.log("Drawing " + this.keys[this.i]);
			} else {
				this.hasGeoToRender = false;
				console.log("Done ");
			}
			this.renderLoop(gcodeReader);
		},
		redrawScene: function(key, layer, visible) {
			if (this.previewScene.getObjectByName(key + "_" + layer))
			this.previewScene.getObjectByName(key + "_" + layer).visible = visible;
		},
		renderGeo: function(key, gcodeLayer, gcodeReader) {
			let threeDee;
			if (this.pointCloud[key] && this.pointCloud[key][gcodeLayer]) {
				try {
					this.pointCloud[key][gcodeLayer].computeVertexNormals();
				} catch (e) {
					console.error(e);
					return;
				}
				if (gcodeReader.fileSize < 10 * 1024 * 1024) {
					threeDee = (key != "MOVE" ? new THREE.Mesh(
						new THREE.BufferGeometry().fromGeometry(this.pointCloud[key][gcodeLayer]), this.meshMaterial) :
						new THREE.LineSegments(this.pointCloud[key][gcodeLayer], this.pointMaterial));
					} else {
						threeDee = new THREE.LineSegments(this.pointCloud[key][gcodeLayer], this.pointMaterial);
					}
					if (key == "MOVE")
					threeDee.visible = false;
					threeDee.castShadow = true;
					threeDee.receiveShadow = true;
					threeDee.name = key + "_" + gcodeLayer;
					this.previewScene.add(threeDee);
				}
			},
			b64toBlob: function(e, t, n) {
				t = t || "", n = n || 512;
				for (var o = atob(e), r = [], a = 0; a < o.length; a += n) {
					for (var l = o.slice(a, a + n), i = new Array(l.length), s = 0; s < l.length; s++) i[s] = l.charCodeAt(s);
					var c = new Uint8Array(i);
					r.push(c)
				}
				return new Blob(r, {
					type: t
				})
			},
			savePicture: function(e, t) {
				document.getElementById("myAwesomeForm");
				var n = e.split(";"),
				o = n[0].split(":")[1],
				r = this.b64toBlob(n[1].split(",")[1], o);
				while (this.fileName.includes(" ")) {
					this.fileName = this.fileName.replace(" ", "_");
				}
				//console.log("t = " + t)
				//console.log("this.fileName = " + this.fileName)
				var f = this.fileName;
				while (f.includes(" ")) {
					f = f.replace(" ", "_");
				}
				while (t.includes(" ")) {
					t = t.replace(" ", "_");
				}
				//console.log("uploading("+this.fileName+"):	" + f + "/" + t);
				$.ajax({
					url: (this.selectedMachine?this.selectedMachine:"/") + "duet/action/rr_upload?name=0:/www/img/GCodePreview/" + f + "/" + t + "&time=" + encodeURIComponent(this.timeToStr(new Date)),
					data: r,
					type: "POST",
					contentType: !1,
					processData: !1,
					cache: !1,
					dataType: "json",
					async: false,
					error: function(e) {
						console.error(e)
					},
					success: function() {
						//console.log("Envoi Réussi")
					},
					complete: function() {
						//console.log("Request finished.")
					}
				})
			},
			timeToStr: function(time) {
				// Should return an ISO-like datetime string like "2016-10-24T15:39:09"
				// Cannot use toISOString() here because it doesn't output the localtime
				var result = "";
				result += time.getFullYear() + "-";
				result += (time.getMonth() + 1) + "-";
				result += time.getDate() + "T";
				result += time.getHours() + ":";
				result += time.getMinutes() + ":";
				result += time.getSeconds();
				return result;
			},
		},
		mounted(){
			//console.log(this.selectedMachine);
		}
	}
