'use strict'

let Scene = require('./threeScene.js');
let LineReader = require('./LineReader.js');
let THREE = require('three') ;

import { displaySpeed } from '../plugins/display.js'
import i18n from '../i18n'
import Axios from 'axios'
import { strToTime, timeToStr } from '../utils/time.js'

const exportSTL = require('threejs-export-stl');
import JSZip from 'jszip'
let $ = require('jquery');

import { makeFileTransferNotification, makeNotification } from '../plugins/toast.js'

/* ======== GCODE_READER ======== */

export default {
	data() {
		return {
			instructionPos: 0,
			slicer: undefined,
			Slicer: { CURA: 0, SIMP: 1, SLIC: 2, },

			fileSize: undefined,
			fileInput: undefined,

			DEBUG: true,
			preview: true,
			SHOW_ALL: true,
			SHOW_MOINS_2: true,
			SHOW_PREV: true,
			boundingBox: undefined,
			centerX: 0,
			centerY: 0,
			curLay: -1,
			extruding: false,
			extWidth: 0.4,
			gcodeLayer: -1,
			gcodeLayers: [],
			lastPos: null,
			layHeight: -1,
			moves: [],
			nbKey: 0,
			relative: false,
			relativeExtrude: false,
			zLayer: undefined,
			zPrevLayer: -1,
			nbLayers: 0,
			extruders: [],
			extruder: {
				name: "",
				number: undefined,
				diameter: undefined,
				width: undefined,
				primary: false
			},
			bbox: undefined,
			acos: undefined,
			asin: undefined,
			color: undefined,
			curve: undefined,
			ellipse: undefined,
			endA: undefined,
			geo: undefined,
			geometry: undefined,
			i: undefined,
			id: undefined,
			imgData: undefined,
			key: undefined,
			length: undefined,
			material: undefined,
			meshMaterial: undefined,
			pointMaterial: undefined,
			point_end: undefined,
			point_start: undefined,
			points: undefined,
			pt: undefined,
			rad: undefined,
			startA: undefined,
			strMime: undefined,
			threeDee: undefined,
			tmpPos: undefined,
			width: undefined,
			x2: undefined,
			y2: undefined,
			lineReader: Object.assign(LineReader.default.methods, LineReader.default.data),
			scene: Object.assign(Scene.default.methods, Scene.default.data),
			lastPrct: undefined,
			onProgress: function(){},
			gcodeToStl: undefined,
			axios: undefined,
		}
	},
	methods: {
		lectDonnees: async function(file, path, caller) {
			//console.log(caller)
			this.extruders = [];
			this.preview = true;
			this.DEBUG = false;
			this.SHOW_ALL = true,
			this.SHOW_MOINS_2 = true,
			this.SHOW_PREV = true,
			this.scene = Object.assign(Scene.default.methods, Scene.default.data);
			this.lineReader = Object.assign(LineReader.default.methods, LineReader.default.data);
			this.lineReader.LineReader({});
			this.lastPrct = 0;
			this.Slicer = {CURA: 0, SIMP: 1, SLIC: 2, };
			this.scene.initScene(caller.selectedMachine);
			if (!this.extWidth)
			this.extWidth = 0.4;
			let start = new Date();
			this.slicer = undefined;
			var self = this;
			for (let key in this.scene.preview.pointCloud) {
				if (this.slicer == undefined || key == "Unknown" || key != "length") {
					for (let gcodeLayer in this.scene.preview.pointCloud[key]) {
						self.scene.preview.previewScene.remove(
							self.scene.preview.previewScene.getObjectByName(key + "_" + gcodeLayer));
						}
					}
				}
				this.scene.preview.pointCloud = {
					length: 1
				};
				this.moves = [];
				this.zLayer = 0;
				this.zPrevLayer = 0;
				//parseRows[parsedFileCount].find(".glyphicon").removeClass("glyphicon-asterisk").addClass("glyphicon-cloud-upload");

				this.scene.pointMaterial = new THREE.LineBasicMaterial({
					color: 0xff0000
				});
				//var moveMaterial = new THREE.LineBasicMaterial({this.color: 0x0000ff});
				if (this.DEBUG) {
					console.log(file)
				}
				this.fileInput = file;
				this.fileSize = this.fileInput.size;
				//jQuery.get(ajaxPrefix + "rr_mkdir?dir=0:/www/img/GCodepreview");
				var name = path; //this.fileInput.name.substring(0, this.fileInput.name.lastIndexOf("."));
				while (name.includes(" "))
				name = name.replace(" ", "_");
				this.scene.preview.fileName = name;
				//console.log(ajaxPrefix + "rr_mkdir?dir=0:/www/img/GCodepreview/"+ name);
				var totalCount = 1;
				//var output = $('#fileDisplayArea');
				this.boundingBox = {
					min: {
						x: 1000,
						y: 1000,
						z: 1000
					},
					max: {
						x: -1000,
						y: -1000,
						z: -1000
					}
				};
				this.gcodeLayers = [];
				this.gcodeLayer = {
					lbbox: {
						min: {
							x: 1000,
							y: 1000,
							z: 1000
						},
						max: {
							x: -1000,
							y: -1000,
							z: -1000
						}
					},
					points: []
				};
				this.lastPos = {
					x: undefined,
					y: undefined,
					z: undefined,
					e: undefined,
					f: undefined,
					w: "Unknown",
					t: 0
				};
				this.relativeExtrude = false;
				this.extruding = false;
				this.gcodeToStl = undefined;
				self.lineReader.on('line', function(line, next) {
					line = self.parseGCode(line, self.lineReader.offset);
					if (line) {
						totalCount++;
					}
					self.instructionPos = self.lineReader.GetReadPos();
					if (Math.ceil((self.instructionPos/self.fileSize)*1000) > self.lastPrct)
					{
						var progress = Math.min(100, Math.max(0, Math.floor((self.instructionPos/self.fileSize)*1000)/10));
						$("#progress")[0].style.width = progress + "%"
						//$("#progress").innerHTML = progress + (Math.floor(progress) != Math.ceil(progress) ? "" : ".0") + "&nbsp;%";
						//console.log(progress + " %")
						//self.toast.onProgress({loaded: self.instructionPos, total: self.fileSize})

						self.lastPrct = Math.ceil((self.instructionPos/self.fileSize)*1000);


						let elt = ((new Date() - start)/(self.instructionPos/self.fileSize));
						let ert = elt * (1-(self.instructionPos/self.fileSize));
						$("#pleft")[0].innerHTML = i18n.t('notification.parse.eta', [self.toHMS(Math.round(ert/1000), true)]);

						let uploadSpeed = self.instructionPos / (((new Date()) - start) / 1000)
						$("#pspeed")[0].innerHTML = i18n.t('notification.parse.speed',
						[displaySpeed(uploadSpeed), " ( " + Math.round(totalCount / (((new Date()) - start) / 1000)) +" l/s )"]);

						//console.log( "eta: " + self.toHMS(Math.round(ert/1000), true))
						if (self.fileSize > 2 * 1024 * 1024)
						setTimeout(next, self.fileSize > 16 * 1024 * 1024 ? 1000 : 100);
						else
						next()
					} else {
						//if (totalCount < 210)
						next();
					}
				});

				self.lineReader.on('abort', function(abo) {
					console.warn("read aborted");
					console.warn(abo);
					self.lineReader = new LineReader({
						chunkSize: 512
					});
				})

				self.lineReader.on('error', function(err) {
					console.log(err);
				});

				self.lineReader.on('end',async function() {
					console.log("Read complete!\n" + totalCount + " lines parsed\n took " + self.toHMS(Math.round((new Date() - start) / 1000), true));
					self.scene.hasGeoToRender = true;
					self.scene.preview.pointCloud["MOVE"] = self.moves;
					self.scene.preview.pointCloud.length++;

					//self.toast.domElement.firstChild.childNodes[1].firstChild.innerText = "Generating preview"
					//self.toast.domElement.firstChild.childNodes[1].lastChild.innerText = "Please stand by while the preview is being generated"
					//let notif = makeNotification('info', 'Generating preview', "Please wait while we generate the preview for the gcode uploaded", null);

					console.log(self.boundingBox)

					let out  = "";

					out += "G28\nG1 X0 Y0 Z100 F18000\n";

					out += "G1 X" +  ((self.boundingBox.max.x + self.boundingBox.min.x)/2).toFixed(2) + " Y" + ((self.boundingBox.max.y + self.boundingBox.min.y)/2).toFixed(2) + " Z" + (self.boundingBox.min.z + 10).toFixed(2) + " F6000\n"
					out += "G1 X" + self.boundingBox.min.x.toFixed(2) + " Y" + self.boundingBox.min.y.toFixed(2) + " Z" + (self.boundingBox.min.z + 10).toFixed(2) + " F6000\n"

					for (let i = 0; i < 5; i++) {

						out += "M3 S0\n";
						if ((self.boundingBox.max.z - self.boundingBox.min.z) > 10) {
							out += "G1 X" + self.boundingBox.min.x.toFixed(2) + " Y" + self.boundingBox.min.y.toFixed(2) + " Z" + (self.boundingBox.min.z + 10).toFixed(2) + " F6000\n"
							out += "G1 X" + self.boundingBox.min.x.toFixed(2) + " Y" + self.boundingBox.min.y.toFixed(2) + " Z" + self.boundingBox.min.z.toFixed(2) + " F" + (60 * (10 - self.boundingBox.min.z)).toFixed(2) + "\n"
						} else {
							out += "G1 X" + self.boundingBox.min.x.toFixed(2) + " Y" + self.boundingBox.min.y.toFixed(2) + " Z" + self.boundingBox.min.z.toFixed(2) + " F" + (60 * (self.boundingBox.max.z - self.boundingBox.min.z)).toFixed(2) + "\n"
						}
						out += "M3 S10\n";
						out += "G1 X" + self.boundingBox.max.x.toFixed(2) + " Y" + self.boundingBox.min.y.toFixed(2) + " Z" + self.boundingBox.min.z.toFixed(2) + " F6000\n"
						out += "G1 X" + self.boundingBox.max.x.toFixed(2) + " Y" + self.boundingBox.max.y.toFixed(2) + " Z" + self.boundingBox.min.z.toFixed(2) + " F6000\n"
						out += "G1 X" + self.boundingBox.min.x.toFixed(2) + " Y" + self.boundingBox.max.y.toFixed(2) + " Z" + self.boundingBox.min.z.toFixed(2) + " F6000\n"
						out += "G1 X" + self.boundingBox.min.x.toFixed(2) + " Y" + self.boundingBox.min.y.toFixed(2) + " Z" + self.boundingBox.min.z.toFixed(2) + " F6000\n"
						out += "M3 S0\n";

						out += "G1 X" + self.boundingBox.min.x.toFixed(2) + " Y" + self.boundingBox.min.y.toFixed(2) + " Z" + self.boundingBox.max.z.toFixed(2) + " F6000\n"
						out += "M3 S10\n";
						out += "G1 X" + self.boundingBox.max.x.toFixed(2) + " Y" + self.boundingBox.min.y.toFixed(2) + " Z" + self.boundingBox.max.z.toFixed(2) + " F6000\n"
						out += "G1 X" + self.boundingBox.max.x.toFixed(2) + " Y" + self.boundingBox.max.y.toFixed(2) + " Z" + self.boundingBox.max.z.toFixed(2) + " F6000\n"
						out += "G1 X" + self.boundingBox.min.x.toFixed(2) + " Y" + self.boundingBox.max.y.toFixed(2) + " Z" + self.boundingBox.max.z.toFixed(2) + " F6000\n"
						out += "G1 X" + self.boundingBox.min.x.toFixed(2) + " Y" + self.boundingBox.min.y.toFixed(2) + " Z" + self.boundingBox.max.z.toFixed(2) + " F6000\n"
					}
					out += "M3 S0\n";
					out += "G28\n"

					let bboxPath = path.split('/')
					let fName = bboxPath.pop()
					bboxPath = '0:/gcodes/' + bboxPath.join('/') + '/' + 'BBox ' + file.name

					let content = new Blob([out]);
					//self.upload({ filename: bboxPath, content, showProgress: false, showSuccess: false });

					if( !self.axios) {
						self.axios = await Axios.create({
							baseURL:`http://192.168.1.53/`,
							//cancelToken: BaseConnector.getCancelSource().token,
							timeout: 8000,	// default session timeout in RepRapFirmware
							withCredentials: true,
						});
					}
					self.axios.post('rr_upload', content, {
						isFileTransfer: true,
						params: {
							name: bboxPath,
							time: timeToStr(file.lastModified ? new Date(file.lastModified) : new Date())
						},
						timeout: 0,
						transformRequest(data, headers) {
							delete headers.post['Content-Type'];
							return data;
						}
					})

					if (true == false) {
						if ((location.port === "8080") || (location.port === "8081") || (location.port === "8082")) {
							//$("#firstLayer")[0].value = 0;
							//$("#lastLayer")[0].value = nbLayers;
							//$("#firstLayer")[0].max = nbLayers;
							//$("#lastLayer")[0].max = nbLayers;
							//console.log(self.gcodeLayers)

							// Download files
							const zip = new JSZip();

							let layers = self.scene.preview.pointCloud[0]
							let sceneGeometry = new THREE.Geometry();
							let files = []
							for( var i = (layers[0]?0:1); i < layers.length; i++){
								files.push(exportSTL.fromGeometry( layers[i], true ))
								let mesh = new THREE.Mesh(layers[i])
								mesh.updateMatrix();
								sceneGeometry.merge(mesh.geometry, mesh.matrix)
							}
							files.push(exportSTL.fromGeometry( sceneGeometry, true ))
							var blob;
							files.forEach((file, index) => {
								blob = new Blob( [file], {type: exportSTL.mimeType})
								zip.file(self.fileInput.name.substring(0, self.fileInput.name.lastIndexOf('.')) + (index < files.length -1 ? "_" + index : "") + '.stl', blob)
							})
							zip.generateAsync({type: "blob"}).then(function(content) {
								// see FileSaver.js
								saveAs(content, self.fileInput.name.substring(0, self.fileInput.name.lastIndexOf('.')) + ".zip");
							});
						}
					}

					self.scene.preview.initRender(self);
					self.scene.preview.animate();
					this.lastPrct = 0;
					caller.$emit('refreshlist');
					//caller.$router.go(0);
					self.scene.preview.pointCloud = {};
					//console.log(self.toast);

					//self.toast.hide();
					//notif.hide();
					$("#uploadDiv")[0].style.display = "none";
					$("#threeDisplay")[0].style.display = "none"
				});

				$("#uploadDiv")[0].style.display = ""
				$("#threeDisplay")[0].style.display = ""
				$("#progress")[0].style.width = ""
				$("#fileProgress")[0].style.width = ""
				$("#fname")[0].innerHTML = i18n.t('notification.parse.title',
				[file.name.substring(file.name.lastIndexOf('/')+1)]);
				$("#progress")[0].style.transition = ""
				this.scene.preview.previewCamera.position.set(-800, 550, 0);
				this.scene.preview.previewControls.target.set(0, 250, 0);
				this.scene.preview.previewControls.update();
				this.scene.preview.previewRenderer.render(this.scene.preview.previewScene, this.scene.preview.previewCamera);
				return new Promise(resolve => {
					self.lineReader.read(self.fileInput);
					//self.toast = makeFileTransferNotification('parse', '0:/gcodes/', {cancel:function(){if(self.DEBUG) console.log("canceled")}}, null, null);
					resolve('')
				});
				//console.log(self.onProgress)
			},
			parseGCode: function(line) {
				var cmdLine = line.replace(/;.*$/, '').trim(); // Remove comments
				var comLine = "";
				if (line.indexOf(";") > -1)
				comLine = line.replace(/[a-zA-Z0-9| |.|-]*[;]/, '').trim();
				if (cmdLine) {
					let tokens = cmdLine.split(' ');
					if (tokens) {
						let cmd = tokens[0];
						var args = {
							'cmd': cmd
						};
						tokens.splice(1).forEach(function(token) {
							if (token) {
								var key = token[0].toLowerCase();
								var value = parseFloat(token.substring(1));
								args[key] = value;
							}
						});
						this.extractGCode(args);
					}
				}
				if (comLine) {
					if (this.slicer === undefined) {
						if (comLine.toUpperCase().includes("CURA")) {
							if(this.DEBUG)
							console.log("Cura detected");
							//$("#form_cura")[0].style.display = "block"
							this.slicer = this.Slicer.CURA;
						} else if (comLine.toUpperCase().includes("SIMPLIFY3D")) {
							if(this.DEBUG)
							console.log("Simplify 3D detected");
							//$("#form_simp")[0].style.display = "block"
							this.slicer = this.Slicer.SIMP;
						} else if (comLine.toUpperCase().includes("SLIC3R")) {
							if(this.DEBUG)
							console.log("Slic3r detected");
							//$("#form_slic")[0].style.display = "block"
							this.slicer = this.Slicer.SLIC;
						} else {
							// try Cura as the slicer name is at line 5
							let tokens = comLine.split(':');
							if (tokens) {
								let cmd = tokens[0].toUpperCase();
								let args = {
									'cmd': cmd
								};
								var key = 0;
								tokens.splice(1).forEach(function(token) {
									if (token) {
										key++;
										var value = token;
										args[key] = value;
									}
								});
								this.decodeCuraCom(args);
							}
							//console.log(comLine);
						}
					} else {
						switch (this.slicer) {
							case this.Slicer.CURA:
							var tokens = comLine.split(':');
							if (tokens) {
								let cmd = tokens[0];
								let args = {
									'cmd': cmd
								};
								let key = 0;
								tokens.splice(1).forEach(function(token) {
									if (token) {
										key++;
										var value = token;
										args[key] = value;
									}
								});
								this.decodeCuraCom(args);
							}
							break;
							case this.Slicer.SIMP:
							this.decodeSimpCom(comLine);
							break;
							case this.Slicer.SLIC:
							this.decodeSlicCom(comLine);
							break;
							default:
							console.log(comLine);
							break;
						}
					}
				}
				return cmdLine;
			},
			extractGCode: function(args) {
				if (this.scene === undefined)
				this.scene = Object.assign(Scene.default.methods, Scene.default.data);
				switch (args.cmd) {
					/* ====== G Codes ====== */
					case "G0":
					case "G1":
					case "G00":
					case "G01":
					//console.log("move");
					/*console.log("new position: \n\t" +
					(args.x?(this.relative?this.lastPos.x+args.x:args.x):this.lastPos.x) + "\n\t" +
					(args.y?(this.relative?this.lastPos.y+args.y:args.y):this.lastPos.y) + "\n\t" +
					(args.z?(this.relative?this.lastPos.z+args.z:args.z):this.lastPos.z));*/
					if ((this.relative ? this.lastPos.z + args.z : args.z) > this.lastPos.z) {
						this.extruding = false;
					}
					if (args.e) {
						this.extruding = (this.lastPos.e < (this.relativeExtrude ? this.lastPos.e + args.e : args.e));
					}
					if (this.zLayer !== this.lastPos.z && this.extruding) {
						//console.log(this.zLayer + " !== " + this.lastPos.z + " && " + this.extruding)
						this.zPrevLayer = this.zLayer;
						this.zLayer = this.lastPos.z;
						//console.log(this.curLay);
						//console.log(this.gcodeLayers.length);
						if ((this.curLay === undefined) || (this.gcodeLayers.length < this.curLay)) {
							let tmp = this;
							this.gcodeLayers.push({
								gcodeLayerStart: tmp.startLayer,
								gcodeLayer: tmp.gcodeLayer
							});
							this.nbLayers++;
						}
						this.startLayer = this.instructionPos;
						if (this.preview) {
							/* ====== SHOW BOUNDING BOX ====== */
							if (this.gcodeLayers[this.curLay - 1] || this.gcodeLayers[this.curLay] || ((this.slicer == undefined || this.slicer == this.Slicer.SLIC) && this.nbLayers > 0) || this.gcodeLayers.length > 1) {
								//console.log(this.boundingBox.toSource());
								if ((this.boundingBox.max.x > this.boundingBox.min.x) || (this.boundingBox.max.y > this.boundingBox.min.y) || (this.boundingBox.max.z > this.boundingBox.min.y)) {
									this.centerX = (this.boundingBox.max.x + this.boundingBox.min.x) / 2;
									this.centerY = (this.boundingBox.max.y + this.boundingBox.min.y) / 2;
									this.width	=	this.boundingBox.max.x - this.boundingBox.min.x;
									this.length = this.boundingBox.max.y - this.boundingBox.min.y;
									this.scene.preview.previewCamera.position.set(this.centerY, 0, this.centerX);
									this.scene.preview.previewControls.target.x = this.centerY + 0.1;
									this.scene.preview.previewControls.target.z = this.centerX;
									if (this.boundingBox.max.z < this.lastPos.z) {
										console.log(this.boundingBox.max.z + "<" + this.lastPos.z)
										if (this.curLay != undefined && this.layHeight) {
											this.scene.preview.previewControls.object.position.y = 1.24 * Math.max(this.width, this.length) + (this.curLay * this.layHeight);
											this.scene.preview.previewControls.target.y = (this.boundingBox.max.z + this.boundingBox.min.z) / 2;
										} else {
											this.scene.preview.previewControls.object.position.y = 1.24 * Math.max(this.width, this.length) + (this.lastPos.z);
											this.scene.preview.previewControls.target.y = (this.boundingBox.max.z + this.boundingBox.min.z) / 2;
										}
									} else {
										this.scene.preview.previewControls.object.position.y = 1.24 * Math.max(this.width, this.length) + (this.boundingBox.max.z);
										this.scene.preview.previewControls.target.y = (this.boundingBox.max.z + this.boundingBox.min.z) / 2;
									}
									this.scene.preview.previewControls.update();
								}
							}
							this.nbKey = 0;
							for (key in this.scene.preview.pointCloud) {
								this.id = [];
								if (!this.curLay)
								for (this.i in this.scene.preview.pointCloud[key])
								this.id.push(this.i);
								this.pt = this.id.length;
								//console.log("this.SHOW_PREV: " + this.SHOW_PREV);
								//console.log("this.SHOW_MOINS_2: " + this.SHOW_MOINS_2);
								//console.log("this.SHOW_ALL: " + this.SHOW_ALL);

								if (!this.SHOW_PREV && !this.SHOW_ALL) {
									this.scene.preview.previewScene.remove(this.scene.preview.previewScene.getObjectByName(key + "_" + (this.curLay != undefined ? this.curLay - 2 : this.id[this.pt - 2])));
									this.scene.preview.previewScene.remove(this.scene.preview.previewScene.getObjectByName(key + "_" + (this.curLay != undefined ? this.curLay - 2 : this.id[this.pt - 2])));
								} else if (this.scene.preview.previewScene.getObjectByName(key + "_" + (this.curLay != undefined ? this.curLay - 2 : this.id[this.pt - 2])))
								this.scene.preview.previewScene.getObjectByName(key + "_" + (this.curLay != undefined ? this.curLay - 2 : this.id[this.pt - 2])).material.color = {
									r: 0.12,
									g: 0.12,
									b: 0.11,
								};
								if (!this.SHOW_MOINS_2 && !this.SHOW_ALL) {
									this.scene.preview.previewScene.remove(this.scene.preview.previewScene.getObjectByName(key + "_" + (this.curLay != undefined ? this.curLay - 3 : this.id[this.pt - 3])));
									this.scene.preview.previewScene.remove(this.scene.preview.previewScene.getObjectByName(key + "_" + (this.curLay != undefined ? this.curLay - 3 : this.id[this.pt - 3])));
								} else if (this.scene.preview.previewScene.getObjectByName(key + "_" + (this.curLay != undefined ? this.curLay - 3 : this.id[this.pt - 3])))
								this.scene.preview.previewScene.getObjectByName(key + "_" + (this.curLay != undefined ? this.curLay - 3 : this.id[this.pt - 3])).material.color = {
									r: 0.25,
									g: 0.24,
									b: 0.23
								};
								if (!this.SHOW_ALL) {
									this.scene.preview.previewScene.remove(this.scene.preview.previewScene.getObjectByName(key + "_" + (this.curLay != undefined ? this.curLay - 4 : this.id[this.pt - 4])));
								} else if (this.scene.preview.previewScene.getObjectByName(key + "_" + (this.curLay != undefined ? this.curLay - 4 : this.id[this.pt - 4])))
								this.scene.preview.previewScene.getObjectByName(key + "_" + (this.curLay != undefined ? this.curLay - 4 : this.id[this.pt - 4])).material.color = {
									r: 0.5,
									g: 0.48,
									b: 0.47
								};
								if (this.scene.preview.pointCloud[key][(this.curLay != undefined ? this.curLay - 1 : this.id[this.pt - 1])] != undefined) {
									this.nbKey++;
								}
							}
							let i = 0;
							for (var key in this.scene.preview.pointCloud) {
								this.id = [];
								if (this.curLay == undefined)
								for (i in this.scene.preview.pointCloud[key])
								this.id.push(i);
								this.pt = this.id.length;
								this.color = new THREE.Color( "#FDB913");//this.scene.preview.tempChartOptions.colors[ isNaN(key)? this.nbKey : key]).setHSL(((i - 1) / this.nbKey), 1, 0.5);
								//console.log(key+": ("+isNaN(key)? i : key+"):	"+this.color.r+","+this.color.g+","+this.color.b)
								this.pointMaterial = new THREE.LineBasicMaterial({
									color: this.color,
									linewidth: 2
								});
								this.meshMaterial = new THREE.MeshPhongMaterial({
									color: this.color
								});
								if (this.scene.preview.pointCloud[key][(this.curLay != undefined ? this.curLay - 1 : this.id[this.pt - 1])] != undefined) {
									//console.log(this.scene.preview.pointCloud[key][(this.curLay != undefined ? this.curLay - 1 : this.id[this.pt - 1])])
									try {
										this.scene.preview.pointCloud[key][(this.curLay != undefined ? this.curLay - 1 : this.id[this.pt - 1])].computeVertexNormals();
									} catch (e) {
										//console.error(e);
									}
									if (this.fileSize < 10 * 1024 * 1024) {
										this.threeDee = (key != "MOVE" ? new THREE.Mesh(
											new THREE.BufferGeometry().fromGeometry(this.scene.preview.pointCloud[key][(this.curLay != undefined ? this.curLay - 1 : this.id[this.pt - 1])]), this.meshMaterial) :
											new THREE.LineSegments(this.scene.preview.pointCloud[key][(this.curLay != undefined ? this.curLay - 1 : this.id[this.pt - 1])], this.pointMaterial));
										} else {
											this.threeDee = new THREE.LineSegments(this.scene.preview.pointCloud[key][(this.curLay != undefined ? this.curLay - 1 : this.id[this.pt - 1])], this.pointMaterial);
										}
										this.threeDee.castShadow = true;
										this.threeDee.receiveShadow = true;
										this.threeDee.name = key + "_" + ((this.curLay != undefined ? this.curLay - 1 : this.id[this.pt - 1]));
										this.scene.preview.previewScene.add(this.threeDee);
										//console.log(this.threeDee);
									}
									i++;
								}

								if (this.gcodeLayers.length > 1) {
									try {
										this.scene.preview.previewControls.update();
										this.scene.preview.previewRenderer.render(this.scene.preview.previewScene, this.scene.preview.previewCamera);
										this.strMime = "image/jpeg";
										this.imgData = this.scene.preview.previewRenderer.domElement.toDataURL(this.strMime);
										let num = (isNaN(this.curLay - 1)?(this.gcodeLayers.length-1):(this.curLay - 1))
										this.scene.preview.savePicture(this.imgData, this.fileInput.name.substring(0, this.fileInput.name.lastIndexOf(".")) + "_" + ((num >= 1000) ? "": ((num >= 100) ? "0" : ((num >= 10) ? "00" : "000"))) + num + ".jpg");
									} catch (e) {
										console.error(e);
										return;
									}
									//console.log(planter.ici)
								} /*else {
									this.boundingBox = {
									min: {
									x: 1000,
									y: 1000,
									z: 1000
								},
								max: {
								x: -1000,
								y: -1000,
								z: -1000
							}
						};
					}*/
				}
				this.gcodeLayer = {
					lbbox: {
						min: {
							x: 1000,
							y: 1000,
							z: 1000
						},
						max: {
							x: -1000,
							y: -1000,
							z: -1000
						}
					},
					points: []
				};
			}

			if ((this.lastPos.x && this.lastPos.y && this.lastPos.z) && (args.x || args.y || args.z)) {
				this.x2 = (this.relative ? (this.lastPos.x + args.x) : args.x);
				this.y2 = (this.relative ? (this.lastPos.y + args.y) : args.y);

				var point_start = new THREE.Vector3();
				var point_end = new THREE.Vector3();
				if (args.e) {
					//console.log(Math.round(this.lastPos.z*100));
					if (!this.scene.preview.pointCloud[0] || !this.scene.preview.pointCloud[0][(this.curLay != undefined ? this.curLay : (Math.round(this.lastPos.z * 100)))]) {
						if (!this.scene.preview.pointCloud[0]) {
							this.scene.preview.pointCloud[0] = [];
							this.scene.preview.pointCloud.length++;
						}
						this.scene.preview.pointCloud[0][(this.curLay != undefined ? this.curLay : (Math.round(this.lastPos.z * 100)))] = new THREE.Geometry();
						this.scene.preview.pointCloud[0][(this.curLay != undefined ? this.curLay : (Math.round(this.lastPos.z * 100)))].name = this.lastPos.t + "_" + (this.curLay != undefined ? this.curLay : (Math.round(this.lastPos.z * 100)));
					}
					point_start.x = this.lastPos.y;
					point_start.y = this.lastPos.z; //-this.y2;
					point_start.z = this.lastPos.x; //this.lastPos.z;

					point_end.x = this.y2;
					point_end.y = this.lastPos.z; //-this.y2;
					point_end.z = this.x2; //this.lastPos.z;
					if (this.fileSize < 16 * 1024 * 1024) {
						this.setPoly(point_start, point_end);
					} else {
						this.scene.preview.pointCloud[0][(this.curLay != undefined ? this.curLay : (Math.round(this.lastPos.z * 100)))].vertices.push(point_start);
						this.scene.preview.pointCloud[0][(this.curLay != undefined ? this.curLay : (Math.round(this.lastPos.z * 100)))].vertices.push(point_end);
					}
				} else {
					point_start.x = this.lastPos.y;
					point_start.y = this.lastPos.z; //-this.y2;
					point_start.z = this.lastPos.x //this.lastPos.z;

					point_end.x = this.y2;
					point_end.y = (args.z ? (this.relative ? (this.lastPos.z + args.z) : args.z) : this.lastPos.z); //-this.y2;
					point_end.z = this.x2 //this.lastPos.z;
					if (!this.moves[(this.curLay != undefined ? this.curLay : (Math.round(this.lastPos.z * 100)))]) {
						this.moves[(this.curLay != undefined ? this.curLay : (Math.round(this.lastPos.z * 100)))] = new THREE.Geometry();
						this.moves[(this.curLay != undefined ? this.curLay : (Math.round(this.lastPos.z * 100)))].name = "MOVE_" + (this.curLay ? this.curLay : (Math.round(this.lastPos.z * 100)));
					}
					this.moves[(this.curLay != undefined ? this.curLay : (Math.round(this.lastPos.z * 100)))].vertices.push(point_start);
					this.moves[(this.curLay != undefined ? this.curLay : (Math.round(this.lastPos.z * 100)))].vertices.push(point_end);
				}
			}

			if (args.x) {
				this.lastPos.x = (this.relative ? this.lastPos.x + args.x : args.x);
				if (this.lastPos.x < this.boundingBox.min.x) {
					this.boundingBox.min.x = this.lastPos.x;
				}
				if (this.lastPos.x > this.boundingBox.max.x) {
					this.boundingBox.max.x = this.lastPos.x;
				}

			}
			if (args.y) {
				this.lastPos.y = (this.relative ? this.lastPos.y + args.y : args.y);
				if (this.lastPos.y < this.boundingBox.min.y) {
					this.boundingBox.min.y = this.lastPos.y;
				}
				if (this.lastPos.y > this.boundingBox.max.y) {
					this.boundingBox.max.y = this.lastPos.y;
				}
			}
			if (args.z) {
				this.lastPos.z = (this.relative ? this.lastPos.z + args.z : args.z);
				if (this.lastPos.z < this.boundingBox.min.z) {
					this.boundingBox.min.z = this.lastPos.z;
				}
				if (this.lastPos.z > this.boundingBox.max.z) {
					this.boundingBox.max.z = this.lastPos.z;
				}
			}
			if (args.e) {
				this.lastPos.e = (this.relativeExtrude ? this.lastPos.e + args.e : args.e);
			}
			if (args.f)
			this.lastPos.f = args.f;

			if (args.x || args.y) {
				this.tmpPos = {};
				this.tmpPos.x = this.lastPos.x;
				this.tmpPos.y = this.lastPos.y;
				this.tmpPos.z = this.lastPos.z;
				this.tmpPos.e = this.lastPos.e;
				this.tmpPos.f = this.lastPos.f;
				this.tmpPos.w = this.lastPos.w;
				this.tmpPos.t = this.lastPos.t;
				if (["OUTER_PERIMETER", "INNER_PERIMETER", "SOLID_LAYER"].includes(this.tmpPos.w))
				this.gcodeLayer.points.push(this.tmpPos);
			}
			break;

			case "G2":
			case "G02":
			//console.warn("clockwise rotation not implemented");
			if (args.r) {
				this.rad = args.r
			} else {
				this.rad = Math.sqrt(((args.i - args.x) * (args.i - args.x)) + ((args.y - args.j) * (args.y - args.j)))
			}
			let center = {}
			center.x = this.lastPos.x + args.i
			center.y = this.lastPos.y + args.j

			this.acos = Math.acos((this.lastPos.x - args.i) / this.rad);
			this.asin = Math.asin((this.lastPos.y - args.j) / this.rad);
			this.startA = 0;
			if (this.acos.toFixed(3) == this.asin.toFixed(3)) {
				this.startA = this.acos;
			} else if ((this.acos - Math.PI).toFixed(3) == this.asin.toFixed(3)) {
				this.startA = this.asin;
			} else {
				//console.warn(this.acos.toFixed(3) + "!=" + this.asin.toFixed(3))
			}

			this.acos = Math.acos((args.x - args.i)/ this.rad);
			this.asin = Math.asin((args.y - args.j)/ this.rad);
			this.endA = 0;
			if (this.acos.toFixed(3) == this.asin.toFixed(3)) {
				this.endA = this.acos;
			} else if ((this.acos - Math.PI).toFixed(3) == this.asin.toFixed(3)) {
				this.endA = this.asin;
			} else {
				//console.warn(this.acos.toFixed(3) + "!=" + this.asin.toFixed(3))
			}
			this.curve = new THREE.EllipseCurve(
				args.i, args.j, // cX, cY
				this.rad, this.rad, // xRadius, yRadius
				this.startA, this.endA, // aStartAngle, aendAngle
				true, // aClockwise
				0 // aRotation
			);

			this.points = this.curve.getPoints(50);
			this.geometry = new THREE.BufferGeometry().setFromPoints(this.points);

			this.material = new THREE.LineBasicMaterial({
				color: 0xff0000
			});

			// Create the final object to add to the scene
			this.ellipse = new THREE.Line(this.geometry, this.material);
			this.ellipse.position.z = this.lastPos.z;
			//this.scene.live.liveScene.add(this.ellipse);

			if (args.x) {
				this.lastPos.x = (this.relative ? this.lastPos.x + args.x : args.x);
				if (this.lastPos.x < this.boundingBox.min.x) {
					this.boundingBox.min.x = this.lastPos.x;
				}
				if (this.lastPos.x > this.boundingBox.max.x) {
					this.boundingBox.max.x = this.lastPos.x;
				}

			}
			if (args.y) {
				this.lastPos.y = (this.relative ? this.lastPos.y + args.y : args.y);
				if (this.lastPos.y < this.boundingBox.min.y) {
					this.boundingBox.min.y = this.lastPos.y;
				}
				if (this.lastPos.y > this.boundingBox.max.y) {
					this.boundingBox.max.y = this.lastPos.y;
				}
			}
			if (args.z) {
				this.lastPos.z = (this.relative ? this.lastPos.z + args.z : args.z);
				if (this.lastPos.z < this.boundingBox.min.z) {
					this.boundingBox.min.z = this.lastPos.z;
				}
				if (this.lastPos.z > this.boundingBox.max.z) {
					this.boundingBox.max.z = this.lastPos.z;
				}
			}

			break;

			case "G3":
			case "G03":
			//console.warn("counterclockwise rotation not implemented");
			//console.log(args)

			this.rad = Math.sqrt(((args.i - args.x) * (args.i - args.x)) + ((args.y - args.j) * (args.y - args.j)))
			this.acos = Math.acos((this.lastPos.x - args.i) / this.rad);
			this.asin = Math.asin((this.lastPos.y - args.j) / this.rad);
			this.startA = 0;
			if (this.acos.toFixed(3) == this.asin.toFixed(3)) {
				this.startA = this.acos;
			} else if ((this.acos - Math.PI).toFixed(3) == this.asin.toFixed(3)) {
				this.startA = this.asin;
			} else {
				//console.warn(this.acos.toFixed(3) + "!=" + this.asin.toFixed(3))
			}

			this.acos = Math.acos(args.x / this.rad);
			this.asin = Math.asin(args.y / this.rad);
			this.endA = 0;
			if (this.acos.toFixed(3) == this.asin.toFixed(3)) {
				this.endA = this.acos;
			} else if ((this.acos - Math.PI).toFixed(3) == this.asin.toFixed(3)) {
				this.endA = this.asin;
			} else {
				//console.warn(this.acos.toFixed(3) + "!=" + this.asin.toFixed(3))
			}
			this.curve = new THREE.EllipseCurve(
				args.i, args.j, // cX, cY
				this.rad, this.rad, // xRadius, yRadius
				this.startA, this.endA, // aStartAngle, aendAngle
				false, // aClockwise
				0 // aRotation
			);

			this.points = this.curve.getPoints(50);
			this.geometry = new THREE.BufferGeometry().setFromPoints(this.points);

			this.material = new THREE.LineBasicMaterial({
				color: 0xff0000
			});

			// Create the final object to add to the scene
			this.ellipse = new THREE.Line(this.geometry, this.material);
			this.ellipse.position.z = this.lastPos.z;
			//this.scene.live.liveScene.add(this.ellipse);

			if (args.x) {
				this.lastPos.x = (this.relative ? this.lastPos.x + args.x : args.x);
				if (this.lastPos.x < this.boundingBox.min.x) {
					this.boundingBox.min.x = this.lastPos.x;
				}
				if (this.lastPos.x > this.boundingBox.max.x) {
					this.boundingBox.max.x = this.lastPos.x;
				}

			}
			if (args.y) {
				this.lastPos.y = (this.relative ? this.lastPos.y + args.y : args.y);
				if (this.lastPos.y < this.boundingBox.min.y) {
					this.boundingBox.min.y = this.lastPos.y;
				}
				if (this.lastPos.y > this.boundingBox.max.y) {
					this.boundingBox.max.y = this.lastPos.y;
				}
			}
			if (args.z) {
				this.lastPos.z = (this.relative ? this.lastPos.z + args.z : args.z);
				if (this.lastPos.z < this.boundingBox.min.z) {
					this.boundingBox.min.z = this.lastPos.z;
				}
				if (this.lastPos.z > this.boundingBox.max.z) {
					this.boundingBox.max.z = this.lastPos.z;
				}
			}
			break;

			case "G4":
			if (this.DEBUG)
			console.log("Wait");
			break;

			case "G10":
			if (this.DEBUG)
			if (args.p && (args.s || args.r))
			console.log("Set tool " + args.p + " \n\tstanby temp: " + args.r + "\n\tactive temp: " + args.s);
			else if (args.l)
			console.log("Set tool " + args.p + " offset\n\tX:" + args.x + "\n\tY:" + args.y + "\n\tZ:" + args.z);
			else
			console.log("Retracting filament");
			break;

			case "G21":
			if (this.DEBUG)
			console.log("Units set to mm");
			break;

			case "G28":
			if (this.DEBUG)
			console.log("Homing");
			this.lastPos.x = 0;
			this.lastPos.y = 0;
			this.lastPos.z = 0;
			break;

			case "G90":
			if (this.DEBUG)
			console.log("Absolute positioning");
			this.relative = false;
			break;

			case "G91":
			if (this.DEBUG)
			console.log("Relative positioning");
			this.relative = true;
			break;

			case "G92":
			if (this.DEBUG && (args.x || args.y || args.z))
			console.log("position set to" +
			(args.x ? " \n\tX: " + args.x : "") +
			(args.y ? " \n\tY: " + args.y : "") +
			(args.z ? " \n\tZ: " + args.z : ""));
			this.lastPos.x = (args.x ? args.x : this.lastPos.x);
			this.lastPos.y = (args.y ? args.y : this.lastPos.y);
			this.lastPos.z = (args.y ? args.z : this.lastPos.z);
			break;

			/* ====== M Codes ====== */

			case "M42":
			if (this.DEBUG)
			console.log("new state " + args.s + " for Pin " + args.p);
			break;

			case "M82":
			if (this.DEBUG)
			console.log("Absolute extruder");
			this.relativeExtrude = false;
			break;

			case "M83":
			if (this.DEBUG)
			console.log("Relative extruder");
			this.relativeExtrude = true;
			break;

			case "M84":
			if (this.DEBUG)
			console.log("Steppers off");
			break;

			case "M104":
			if (this.DEBUG)
			console.log("Extruder set to " + args.s + "°C");
			break;

			case "M106":
			if (this.DEBUG)
			console.log("Fan " + (args.p ? args.p + " " : "") + (args.s ? "set to: " + args.s : "On"));
			break;

			case "M107":
			if (this.DEBUG)
			console.log("Fan off");
			break;

			case "M109":
			if (this.DEBUG)
			console.log("wait for Extruder to reach " + args.s + "°C");
			break;

			case "M116":
			if (this.DEBUG)
			if (args.p || args.h || args.c)
			console.log("wait for " + (args.p ? "Tool " + args.p + " " : "") + (args.h ? "Extruder " + args.h + " " : "") + (args.c ? "Chamber " + args.c + " " : "") + "to reach it's target temperature");
			else
			console.log("wait for All to reach their target temperature");
			break;

			case "M117":
			break;

			case "M140":
			if (this.DEBUG)
			console.log("Bed set to " + args.s + "°C");
			break;

			case "M141":
			if (this.DEBUG)
			console.log("Chamber set to " + args.s + "°C");
			break;

			case "M190":
			if (this.DEBUG)
			console.log("Wait for bed to reach " + args.s + "°C");
			break;

			case "M191":
			if (this.DEBUG)
			console.log("Wait for chamber to reach " + args.s + "°C");
			break;

			case "M204":
			if (this.DEBUG)
			console.log("Acceleration set " + args.s + "mm/s^2");
			break;

			/* ====== T Codes ====== */
			case "T-1":
			if (this.DEBUG) {
				console.log("Tools deselected");
			}
			this.extWidth = 0;
			this.lastPos.t = -1;
			break;

			case "T0":
			if (this.DEBUG) {
				console.log("Tool 0 selected");
				console.log(this.extruders[0]);
			}
			this.extWidth = (this.extruders[0] !== undefined?this.extruders[0].width:0.4);
			if(this.DEBUG)
			this.extWidth
			this.lastPos.t = 0;
			break;

			case "T1":
			if (this.DEBUG) {
				console.log("Tool 1 selected");
				console.log(this.extruders[1]);
			}
			this.extWidth = (this.extruders[1] !== undefined?this.extruders[1].width:0.4);
			if(this.DEBUG)
			this.extWidth
			this.lastPos.t = 1;
			break;

			case "T2":
			if (this.DEBUG) {
				console.log("Tool 2 selected");
				console.log(this.extruders[2]);
			}
			this.extWidth = (this.extruders[2] !== undefined?this.extruders[2].width:0.4);
			if(this.DEBUG)
			this.extWidth
			this.lastPos.t = 2;
			break;

			case "T3":
			if (this.DEBUG) {
				console.log("Tool 3 selected");
				console.log(this.extruders[3]);
			}
			this.extWidth = (this.extruders[3] !== undefined?this.extruders[3].width:0.4);
			this.lastPos.t = 3;
			break;

			case "T4":
			if (this.DEBUG) {
				console.log("Tool 4 selected");
				console.log(this.extruders[4]);
			}
			this.extWidth = (this.extruders[4] !== undefined?this.extruders[4].width:0.4);
			this.lastPos.t = 4;
			break;

			case "T5":
			if (this.DEBUG) {
				console.log("Tool 6 selected");
				console.log(this.extruders[5]);
			}
			this.extWidth = (this.extruders[5] !== undefined?this.extruders[5].width:0.4);
			this.lastPos.t = 5;
			break;

			case "T10":
			if (this.DEBUG) {
				console.log("Tool 10 selected");
				console.log(this.extruders[0]);
			}
			this.extWidth = (this.extruders[0] !== undefined?this.extruders[0].width:0.4);
			if(this.DEBUG)
			this.extWidth
			this.lastPos.t = 10;
			break;

			case "T11":
			if (this.DEBUG) {
				console.log("Tool 11 selected");
				console.log(this.extruders[1]);
			}
			this.extWidth = (this.extruders[1] !== undefined?this.extruders[1].width:0.4);
			if(this.DEBUG)
			this.extWidth
			this.lastPos.t = 11;
			break;

			case "T12":
			if (this.DEBUG) {
				console.log("Tool 12 selected");
				console.log(this.extruders[2]);
			}
			this.extWidth = (this.extruders[2] !== undefined?this.extruders[2].width:0.4);
			if(this.DEBUG)
			this.extWidth
			this.lastPos.t = 12;
			break;

			case "T13":
			if (this.DEBUG) {
				console.log("Tool 13 selected");
				console.log(this.extruders[0]);
			}
			this.extWidth = (this.extruders[0] !== undefined?this.extruders[0].width:0.4);
			if(this.DEBUG)
			this.extWidth
			this.lastPos.t = 13;
			break;

			case "T20":
			if (this.DEBUG) {
				console.log("Tool 20 selected");
				console.log(this.extruders[0]);
			}
			this.extWidth = (this.extruders[0] !== undefined?this.extruders[0].width:0.4);
			if(this.DEBUG)
			this.extWidth
			this.lastPos.t = 20;
			break;

			case "T999":
			if (this.DEBUG) {
				console.log("Tool deselected");
			}
			this.extWidth = 0;
			this.lastPos.t = -1;
			break;

			default:
			console.log("unknown command: " + args.cmd);
			console.log(args);
			break;
		}
	},
	setPoly: function(start, end) {
		//console.log("from " + start.toSource() + "to " + end.toSource());
		var vertices = this.scene.preview.pointCloud[0][(this.curLay != undefined ? this.curLay : (Math.round(this.lastPos.z * 100)))].vertices;
		var faces = this.scene.preview.pointCloud[0][(this.curLay != undefined ? this.curLay : (Math.round(this.lastPos.z * 100)))].faces;

		var iv = vertices.length;

		var dx = (-(end.x - start.x));
		var dy = (end.z - start.z)
		//console.log("dX = " + dx)
		//console.log("dY = " + dy)
		//console.log("dZ = " +	(end.y-start.y) )
		var a;
		//var b;
		if (dx != 0) {
			a = ((end.z - start.z) / (start.x - end.x));
			//b = (start.z - (a * (-start.x)));
		} else {
			a = ((start.x - end.x) / (end.z - start.z));
			//b = (-start.x - (a * (start.z)))
		}
		var alpha = Math.atan(a);
		//console.log("alpha = " + a);
		//console.log("extrusion width: "+this.extWidth+"mm")

		var start_x
		var end_x
		var start_y
		var end_y

		if (dx != 0) {
			start_x = start.x + (this.extWidth / 2) * Math.sin(alpha);
			end_x = end.x + (this.extWidth / 2) * Math.sin(alpha);
			start_y = start.z + (this.extWidth / 2) * Math.cos(alpha)
			end_y = end.z + (this.extWidth / 2) * Math.cos(alpha)
		} else {
			start_x = start.x + (this.extWidth / 2) * Math.cos(alpha);
			end_x = end.x + (this.extWidth / 2) * Math.cos(alpha);
			start_y = start.z + (this.extWidth / 2) * Math.sin(alpha)
			end_y = end.z + (this.extWidth / 2) * Math.sin(alpha)
		}
		//console.log("line 1 from ("+start_x+", " + start_y + ", " + start.y + ") to (" + end_x +", " + end_y + ", " + end.y +")");

		var pstr = new THREE.Vector3(start_x, start.y, start_y)
		var petr = new THREE.Vector3(end_x, end.y, end_y)
		var pebr = new THREE.Vector3(end_x, end.y - (this.layHeight ? this.layHeight : this.lastPos.z - this.zPrevLayer), end_y)
		var psbr = new THREE.Vector3(start_x, start.y - (this.layHeight ? this.layHeight : this.lastPos.z - this.zPrevLayer), start_y)

		if (dx != 0) {
			start_x = start.x - (this.extWidth / 2) * Math.sin(alpha);
			end_x = end.x - (this.extWidth / 2) * Math.sin(alpha);
			start_y = start.z - (this.extWidth / 2) * Math.cos(alpha)
			end_y = end.z - (this.extWidth / 2) * Math.cos(alpha)
		} else {
			start_x = start.x - (this.extWidth / 2) * Math.cos(alpha);
			end_x = end.x - (this.extWidth / 2) * Math.cos(alpha);
			start_y = start.z - (this.extWidth / 2) * Math.sin(alpha);
			end_y = end.z - (this.extWidth / 2) * Math.sin(alpha);
		}
		//console.log("line 2 from (" + start_x + ", " + start_y + ", " + start.y + ") to (" + end_x +", " + end_y + ", " + end.y + ")");

		var pstl = new THREE.Vector3(start_x, start.y, start_y)
		var petl = new THREE.Vector3(end_x, end.y, end_y)
		var pebl = new THREE.Vector3(end_x, end.y - (this.layHeight ? this.layHeight : this.lastPos.z - this.zPrevLayer), end_y)
		var psbl = new THREE.Vector3(start_x, start.y - (this.layHeight ? this.layHeight : this.lastPos.z - this.zPrevLayer), start_y)
		var diffPos = Infinity;
		if (iv > 4) {
			var diffx = pstr.x - vertices[iv - 4].x
			var diffy = pstr.z - vertices[iv - 4].z
			diffPos = Math.sqrt(diffx * diffx + diffy * diffy);
		}
		//console.log("head moved "+diffPos+"mm");

		if ((iv < 4) || diffPos > (this.extWidth / 2)) {
			vertices.push(pstr); // 0
			vertices.push(psbr); // 1
			vertices.push(pstl); // 2
			vertices.push(psbl); // 3
		}
		vertices.push(petr); // 4
		vertices.push(pebr); // 5
		vertices.push(petl); // 6
		vertices.push(pebl); // 7

		if (iv >= 4 && (diffPos < (this.extWidth / 2))) {
			iv -= 4
		}
		//console.log(diffPos)

		var ftrr;
		var fbrr;

		var ftll;
		var fbll;

		var fttr;
		var fttl;

		var fbbr;
		var fbbl;

		if (dx < 0) {
			ftrr = new THREE.Face3(iv, iv + 5, iv + 4);
			fbrr = new THREE.Face3(iv, iv + 1, iv + 5);

			ftll = new THREE.Face3(iv + 2, iv + 6, iv + 7);
			fbll = new THREE.Face3(iv + 2, iv + 7, iv + 3);

			fttr = new THREE.Face3(iv, iv + 4, iv + 6);
			fttl = new THREE.Face3(iv, iv + 6, iv + 2);

			fbbr = new THREE.Face3(iv + 5, iv + 1, iv + 3);
			fbbl = new THREE.Face3(iv + 5, iv + 3, iv + 7);
		} else if (dx > 0) {
			ftrr = new THREE.Face3(iv, iv + 4, iv + 5);
			fbrr = new THREE.Face3(iv, iv + 5, iv + 1);

			ftll = new THREE.Face3(iv + 2, iv + 7, iv + 6);
			fbll = new THREE.Face3(iv + 2, iv + 3, iv + 7);

			fttr = new THREE.Face3(iv, iv + 6, iv + 4);
			fttl = new THREE.Face3(iv, iv + 2, iv + 6);

			fbbr = new THREE.Face3(iv + 5, iv + 3, iv + 1);
			fbbl = new THREE.Face3(iv + 5, iv + 7, iv + 3);
		} else if (dx == 0) {
			if (dy < 0) {
				ftrr = new THREE.Face3(iv, iv + 5, iv + 4);
				fbrr = new THREE.Face3(iv, iv + 1, iv + 5);

				ftll = new THREE.Face3(iv + 2, iv + 6, iv + 7);
				fbll = new THREE.Face3(iv + 2, iv + 7, iv + 3);

				fttr = new THREE.Face3(iv, iv + 4, iv + 6);
				fttl = new THREE.Face3(iv, iv + 6, iv + 2);

				fbbr = new THREE.Face3(iv + 5, iv + 1, iv + 3);
				fbbl = new THREE.Face3(iv + 5, iv + 3, iv + 7);
			} else if (dy > 0) {
				ftrr = new THREE.Face3(iv, iv + 4, iv + 5);
				fbrr = new THREE.Face3(iv, iv + 5, iv + 1);

				ftll = new THREE.Face3(iv + 2, iv + 7, iv + 6);
				fbll = new THREE.Face3(iv + 2, iv + 3, iv + 7);

				fttr = new THREE.Face3(iv, iv + 6, iv + 4);
				fttl = new THREE.Face3(iv, iv + 2, iv + 6);

				fbbr = new THREE.Face3(iv + 5, iv + 3, iv + 1);
				fbbl = new THREE.Face3(iv + 5, iv + 7, iv + 3);
			}
		}

		if (ftrr && fbrr) {
			faces.push(ftrr) // (0,1,2)
			faces.push(fbrr) // (0,2,3)
		}

		if (ftll && fbll) {
			faces.push(ftll) // (4,5,6)
			faces.push(fbll) // (4,6,7)
		}

		if (fttr && fttl) {
			faces.push(fttr) // (0,1,5)
			faces.push(fttl) // (0,5,4)
		}

		if (fbbr && fbbl) {
			faces.push(fbbr) // (2,3,7)
			faces.push(fbbl) // (2,7,6)
		}

		if (!ftrr || !fbrr || !ftll || !fbll || !fttr || !fttl || !fbbr || !fbbl)
		console.warn("C'est possible!")
		//faces.push (new THREE.Face3( iv, iv+3, iv+4))
		//faces.push (new THREE.Face3( iv, iv+4, iv+7)) // (2,7,6)
	},
	decodeCuraCom: function(args) {
		if (args.cmd.includes("SETTING_3")) {
			var cmd = args.cmd;
			args.cmd = cmd.substring(0, cmd.indexOf(' '));
			args.setting = cmd.substring(cmd.indexOf(' ') + 1);
		}

		switch (args.cmd) {
			case "LAYER":
			if (this.DEBUG)
			console.log("Layer " + parseInt(args[1]) + "/" + this.nbLayers + "( " + Math.round(parseInt(args[1]) * this.layHeight * 100) / 100 + "/" + Math.round(this.nbLayers * this.layHeight * 100) / 100 + "mm )");
			var layNum = parseInt(args[1]);
			if (layNum != 0)
			this.gcodeLayers[layNum] = {
				gcodeLayerStart: this.startLayer,
				gcodeLayer: this.gcodeLayer
			};
			this.curLay = layNum;
			break;
			case "LAYER_COUNT":
			this.nbLayers = parseInt(args[1]);
			if (this.DEBUG)
			console.log("model height: " + Math.round((this.layHeight * this.nbLayers) * 100) / 100 + "mm");
			break;
			case "TYPE":
			if (this.DEBUG)
			console.log("wall type: " + args[1]);
			this.lastPos.w = args[1];
			break;
			case "TIME_ELAPSED":
			if (this.DEBUG)
			console.log("T+ " + this.toHMS(parseInt(args[1]), true));
			break;
			case "SETTING_3":
			break;
			case "TIME":
			console.log("Estimated print time: " + this.toHMS(parseInt(args[1]), true));
			break;
			case "LAYER HEIGHT":
			if (this.DEBUG)
			console.log("Layer height: " + args[1] + "mm");
			this.layHeight = parseFloat(args[1]);
			break;
			default:
			if (this.DEBUG)
			console.log(args);
		}
	},
	decodeSimpCom: function(comLine) {
		var cmd = comLine;
		if (comLine.includes(',')) {
			cmd = comLine.substring(0, comLine.indexOf(','));
			while (cmd.indexOf(' ') == 0)
			cmd = cmd.substring(cmd.indexOf(' ') + 1);
		}
		var args = {
			'cmd': cmd
		};
		var tokens = comLine.substring(cmd.length);
		tokens = tokens.substring(tokens.indexOf(',') + 1);
		tokens = tokens.split(',');
		for (var token in tokens) {
			if (tokens[token]) {
				var value = tokens[token];
				while (value.indexOf(' ') == 0)
				value = value.substring(value.indexOf(' ') + 1);
				args[token] = value;
			}
		}
		this.parseSimpCom(args);
		//console.log(args);
	},
	parseSimpCom: function(args) {
		if (this.extruders == undefined) {
			this.extruders = [];
		}
		if (args.cmd.includes("layer ")) {
			var cmd = args.cmd;
			args.cmd = cmd.substring(0, cmd.indexOf(' '));
			args.layNum = cmd.substring(cmd.indexOf(' ') + 1);
			if (args[0] && args[0].includes('Z = ')) {
				var z = args[0];
				args[0] = "Z";
				args.zHeight = z.substring(z.lastIndexOf(' ') + 1);
				//console.log(args);
			}
		}

		if (args.cmd.includes("tool")) {
			let cmd = args.cmd;
			args.cmd = cmd.substring(0, cmd.indexOf(' '));
			cmd = cmd.substring(cmd.indexOf(' ') + 1);
			var tokens = cmd.split(' ')
			for (var token in tokens) {
				var key = tokens[token][0];
				var value = parseFloat(tokens[token].substring(1));
				args[key] = value;
			}
		}
		let i;
		switch (args.cmd) {
			case "printMaterial":
			case "printQuality":
			break;
			/* ====== WALL TYPES ======*/
			case "feature bridge":
			if (this.DEBUG)
			console.log("wall type: " + "BRIDGE");
			this.lastPos.w = "BRIDGE";
			break;
			case "feature gap fill":
			if (this.DEBUG)
			console.log("wall type: " + "GAP_FILL");
			this.lastPos.w = "GAP_FILL";
			break;
			case "feature skirt":
			if (this.DEBUG)
			console.log("wall type: " + "SKIRT");
			this.lastPos.w = "SKIRT";
			break;
			case "feature infill":
			if (this.DEBUG)
			console.log("wall type: " + "INFILL");
			this.lastPos.w = "INFILL";
			break;
			case "feature inner perimeter":
			if (this.DEBUG)
			console.log("wall type: " + "INNER_PERIMETER");
			this.lastPos.w = "INNER_PERIMETER";
			break;
			case "feature outer perimeter":
			if (this.DEBUG)
			console.log("wall type: " + "OUTER_PERIMETER");
			this.lastPos.w = "OUTER_PERIMETER";
			break;
			case "feature solid layer":
			if (this.DEBUG)
			console.log("wall type: " + "SOLID_LAYER");
			this.lastPos.w = "SOLID_LAYER";
			break;
			case "feature support":
			if (this.DEBUG)
			console.log("wall type: " + "SUPPORT");
			this.lastPos.w = "SUPPORT";
			break;
			case "feature dense support":
			if (this.DEBUG)
			console.log("wall type: " + "DENSE_SUPPORT");
			this.lastPos.w = "DENSE_SUPPORT";
			break;

			/* ====== LAYERS ====== */
			case "layer":
			if (this.DEBUG)
			console.log("Layer " + args.layNum + (this.nbLayers ? "/" + this.nbLayers : ""));
			var layNum = parseInt(args.layNum);
			/*if (layNum != 0)
			gcodeLayers[layNum] = {gcodeLayerStart: startLayer, gcodeLayer: gcodeLayer};*/
			this.nbLayers++;
			this.curLay = layNum;
			break;
			case "layerHeight":
			if (this.DEBUG)
			console.log("Layer height: " + args[0] + "mm");
			this.layHeight = parseFloat(args[0]);
			break;

			/* ====== TOOLS PARAMETERS ====== */
			case "tool":
			if (this.layHeight === undefined)
			this.layHeight = args.H;
			if (this.extruders === undefined)
			this.extruders = args.W;
			break;
			case "extruderName":
			i = 0;
			while (args[i] !== undefined) {
				if (this.extruders[i] === undefined) {
					this.extruders[i] = {};
				}
				this.extruders[i].name = args[i];
				i++;
			}
			break;
			case "extruderToolheadNumber":
			i = 0;
			while (args[i] !== undefined) {
				if (this.extruders[i] === undefined) {
					this.extruders[i] = {};
				}
				this.extruders[i].number = parseInt(args[i]);
				i++;
			}
			break;
			case "extruderWidth":
			i = 0;
			if (this.DEBUG)
			console.log("Extruders width: " + args.toSource() + "mm");
			while (args[i] !== undefined) {
				if (this.extruders[i] === undefined) {
					this.extruders[i] = {};
				}
				this.extruders[i].width = parseFloat(args[i]);
				i++;
			}
			break;
			case "extruderDiameter":
			i = 0;
			while (args[i] !== undefined) {
				if (this.extruders[i] === undefined) {
					this.extruders[i] = {};
				}
				this.extruders[i].diameter = parseFloat(args[i]);
				i++;
			}
			break;
			case "primaryExtruder":
			for (let i = 0; i < this.extruders.length; i++) {
				if (this.extruders[i].number == parseInt(args[0])) {
					this.extruders[i].primary = true;
				} else {
					this.extruders[i].primary = false;
				}

			}
			break;
			default:
			if (this.DEBUG)
			console.log(args)
		}
	},
	decodeSlicCom: function(comLine) {
		if (this.DEBUG)
		console.log(comLine);
	},
	toHMS: function(delta, toStr) {
		var sec = delta % 60,
		min = (delta = (delta - sec) / 60) % 60,
		hour = (delta = (delta - min) / 60) % 24,
		day = delta = (delta - hour) / 24;
		if (toStr) {
			var strTime = day + "d " + hour + "h " + min + "m " + sec + "s";
			return strTime = strTime.replace(/(?:0. )+/, "")
		}
		return {
			d: day,
			h: hour,
			m: min,
			s: sec
		}
	},
},
mounted() {
	this.extruders = [];
}
}
