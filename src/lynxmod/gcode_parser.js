
let THREE = require('three') ;
let Scene = require('./threeScene.js') ;
let GcodeReader = require('./gcode_reader.js');
let GcomParser = require('./gcom_parser.js');

/* ======== GCODE_PARSER ======== */
export default {
	name: 'gcode_parser',
	data() {
		return {
			DEBUG: true,
			PREVIEW: true,
			SHOW_ALL: true,
			SHOW_MOINS_2: true,
			SHOW_PREV: true,
			boundingBox: undefined,
			centerX: 0,
			centerY: 0,
			curLay: -1,
			extruding: false,
			gcodeLayer: -1,
			gcodeLayers: [],
			gcodeReader: Object.assign(GcodeReader.default.methods, GcodeReader.default.data),
			gcomParser: Object.assign(GcomParser.default.methods, GcomParser.default.data),
			lastPos:null,
			layHeight: -1,
			moves: [],
			nbKey: 0,
			relative: false,
			relativeExtrude: false,
			scene: Object.assign(Scene.default.methods, Scene.default.data),
			zLayer: undefined,
			zPrevLayer: -1,
		}
	},
	methods:
	{
		extractGCode: function(args){
			let acos;
			let asin;
			let bbox;
			let color;
			let curve;
			let ellipse;
			let endA;
			let geo;
			let geometry;
			let i;
			let id;
			let imgData;
			let key;
			let length;
			let material;
			let meshMaterial;
			let pointMaterial;
			let point_end;
			let point_start;
			let points;
			let pt;
			let rad;
			let startA;
			let strMime;
			let threeDee;
			let tmpPos;
			let width;
			let x2;
			let y2;
			this.gcomParser  = Object.assign( GcomParser.default.methods,  GcomParser.default.data);
			this.gcodeReader = Object.assign(GcodeReader.default.methods, GcodeReader.default.data);
			this.scene       = Object.assign(      Scene.default.methods,       Scene.default.data);
			switch (args.cmd)
			{
				/* ====== G Codes ====== */
				case "G0":
				case "G1":
					//console.log("move");
					/*console.log("new position: \n\t" +
					(args.x?(this.relative?this.lastPos.x+args.x:args.x):this.lastPos.x) + "\n\t" +
					(args.y?(this.relative?this.lastPos.y+args.y:args.y):this.lastPos.y) + "\n\t" +
					(args.z?(this.relative?this.lastPos.z+args.z:args.z):this.lastPos.z));*/
					if ((this.relative?this.lastPos.z+args.z:args.z) > this.lastPos.z)
					{
						this.extruding = false;
					}
					if(args.e)
						this.extruding = (this.lastPos.e < (this.relativeExtrude? this.lastPos.e + args.e : args.e));
					if (this.zLayer != this.lastPos.z && this.extruding)
					{
						this.zPrevLayer = this.zLayer;
						this.zLayer = this.lastPos.z;

						if(this.curLay === undefined)
						{
							let tmp = this;
							this.gcodeLayers.push({gcodeLayerStart: tmp.startLayer, gcodeLayer: tmp.gcodeLayer});
							this.gcomParser.nbLayers++;
						}
						this.startLayer = this.gcodeReader.instructionPos;
						if(this.PREVIEW) {
							/* ====== SHOW BOUNDING BOX ====== */
							if (this.gcodeLayers[this.curLay-1] || this.gcodeLayers[this.curLay] || ((this.gcodeReader.slicer == undefined || this.gcodeReader.slicer == this.gcodeReader.Slicer.SLIC) && this.gcomParser.nbLayers > 0))
							{
								if (!this.scene.previewScene.getObjectByName("bbox"))
								{
									this.centerX = (this.boundingBox.max.x + this.boundingBox.min.x)/2;
									this.centerY = (this.boundingBox.max.y + this.boundingBox.min.y)/2;
									width = this.boundingBox.max.x - this.boundingBox.min.x;
									length = this.boundingBox.max.y - this.boundingBox.min.y;
									this.scene.previewControls.object.position.set(-this.centerX, 0,this.centerY);
									if (this.gcomParser.nbLayers && this.layHeight)
										this.scene.previewControls.object.position.y = (this.gcomParser.nbLayers*this.layHeight);
								}
								this.scene.previewScene.remove(this.scene.previewScene.getObjectByName("bbox"));
								geo = new THREE.Geometry();
								// bottom bbox
								geo.vertices.push(new THREE.Vector3(-this.boundingBox.min.x, this.boundingBox.min.z, this.boundingBox.min.y));
								geo.vertices.push(new THREE.Vector3(-this.boundingBox.min.x, this.boundingBox.min.z, this.boundingBox.max.y));
								geo.vertices.push(new THREE.Vector3(-this.boundingBox.min.x, this.boundingBox.min.z, this.boundingBox.max.y));
								geo.vertices.push(new THREE.Vector3(-this.boundingBox.max.x, this.boundingBox.min.z, this.boundingBox.max.y));
								geo.vertices.push(new THREE.Vector3(-this.boundingBox.max.x, this.boundingBox.min.z, this.boundingBox.max.y));
								geo.vertices.push(new THREE.Vector3(-this.boundingBox.max.x, this.boundingBox.min.z, this.boundingBox.min.y));
								geo.vertices.push(new THREE.Vector3(-this.boundingBox.max.x, this.boundingBox.min.z, this.boundingBox.min.y));
								geo.vertices.push(new THREE.Vector3(-this.boundingBox.min.x, this.boundingBox.min.z, this.boundingBox.min.y));

								// sides bbox
								geo.vertices.push(new THREE.Vector3(-this.boundingBox.min.x, this.boundingBox.min.z, this.boundingBox.min.y));
								geo.vertices.push(new THREE.Vector3(-this.boundingBox.min.x, this.boundingBox.max.z, this.boundingBox.min.y));
								geo.vertices.push(new THREE.Vector3(-this.boundingBox.min.x, this.boundingBox.min.z, this.boundingBox.max.y));
								geo.vertices.push(new THREE.Vector3(-this.boundingBox.min.x, this.boundingBox.max.z, this.boundingBox.max.y));
								geo.vertices.push(new THREE.Vector3(-this.boundingBox.max.x, this.boundingBox.min.z, this.boundingBox.max.y));
								geo.vertices.push(new THREE.Vector3(-this.boundingBox.max.x, this.boundingBox.max.z, this.boundingBox.max.y));
								geo.vertices.push(new THREE.Vector3(-this.boundingBox.max.x, this.boundingBox.min.z, this.boundingBox.min.y));
								geo.vertices.push(new THREE.Vector3(-this.boundingBox.max.x, this.boundingBox.max.z, this.boundingBox.min.y));

								//top bbox
								geo.vertices.push(new THREE.Vector3(-this.boundingBox.min.x, this.boundingBox.max.z, this.boundingBox.min.y));
								geo.vertices.push(new THREE.Vector3(-this.boundingBox.min.x, this.boundingBox.max.z, this.boundingBox.max.y));
								geo.vertices.push(new THREE.Vector3(-this.boundingBox.min.x, this.boundingBox.max.z, this.boundingBox.max.y));
								geo.vertices.push(new THREE.Vector3(-this.boundingBox.max.x, this.boundingBox.max.z, this.boundingBox.max.y));
								geo.vertices.push(new THREE.Vector3(-this.boundingBox.max.x, this.boundingBox.max.z, this.boundingBox.max.y));
								geo.vertices.push(new THREE.Vector3(-this.boundingBox.max.x, this.boundingBox.max.z, this.boundingBox.min.y));
								geo.vertices.push(new THREE.Vector3(-this.boundingBox.max.x, this.boundingBox.max.z, this.boundingBox.min.y));
								geo.vertices.push(new THREE.Vector3(-this.boundingBox.min.x, this.boundingBox.max.z, this.boundingBox.min.y));

								bbox = new THREE.LineSegments(geo, new THREE.LineBasicMaterial());
								bbox.name = "bbox";
								this.scene.previewScene.add(bbox);

								this.centerX = (this.boundingBox.max.x + this.boundingBox.min.x)/2;
								this.centerY = (this.boundingBox.max.y + this.boundingBox.min.y)/2;
								this.scene.previewCamera.position.set(-this.centerX, 0,this.centerY);
								width = this.boundingBox.max.x - this.boundingBox.min.x;
								length = this.boundingBox.max.y - this.boundingBox.min.y;
								this.scene.previewControls.target.x = -this.centerX;
								this.scene.previewControls.target.z =	this.centerY;
								if (this.curLay!=undefined && this.layHeight)
								{
									this.scene.previewControls.object.position.y =	2*Math.max(width, length)+(this.curLay*this.layHeight);
									this.scene.previewControls.target.y = (this.boundingBox.max.z + this.boundingBox.min.z)/2;
								} else {
									this.scene.previewControls.object.position.y = 2*Math.max(width, length)+(this.lastPos.z);
									this.scene.previewControls.target.y = (this.boundingBox.max.z + this.boundingBox.min.z)/2;
								}
								this.scene.previewControls.update();
							}
							this.nbKey = 0;
							for ( key in this.scene.pointCloud)
							{
								id = [];
								if (!this.curLay)
									for ( i in this.scene.pointCloud[key])
										id.push(i);
								pt = id.length;
								if (!this.SHOW_PREV && !this.SHOW_ALL) {
									this.scene.previewScene.remove(this.scene.previewScene.getObjectByName( key+"_"+(this.curLay!=undefined?this.curLay-2:id[pt-2])));
									this.scene.previewScene.remove(this.scene.previewScene.getObjectByName( key+"_"+(this.curLay!=undefined?this.curLay-2:id[pt-2])));
								}else if (this.scene.previewScene.getObjectByName( key+"_"+(this.curLay!=undefined?this.curLay-2:id[pt-2])))
									this.scene.previewScene.getObjectByName( key+"_"+(this.curLay!=undefined?this.curLay-2:id[pt-2])).material.color = {r:0, g:0, b:0};
								if (!this.SHOW_MOINS_2 && !this.SHOW_ALL){
									this.scene.previewScene.remove(this.scene.previewScene.getObjectByName( key+"_"+(this.curLay!=undefined?this.curLay-3:id[pt-3])));
									this.scene.previewScene.remove(this.scene.previewScene.getObjectByName( key+"_"+(this.curLay!=undefined?this.curLay-3:id[pt-3])));
								} else if (this.scene.previewScene.getObjectByName( key+"_"+(this.curLay!=undefined?this.curLay-3:id[pt-3])))
									this.scene.previewScene.getObjectByName( key+"_"+(this.curLay!=undefined?this.curLay-3:id[pt-3])).material.color =	{r:0.25, g:0.25, b:0.25};
								if (!this.SHOW_ALL){
									this.scene.previewScene.remove(this.scene.previewScene.getObjectByName( key+"_"+(this.curLay!=undefined?this.curLay-4:id[pt-4])));
									this.scene.previewScene.remove(this.scene.previewScene.getObjectByName( key+"_"+(this.curLay!=undefined?this.curLay-4:id[pt-4])));
									}
								else if	(this.scene.previewScene.getObjectByName( key+"_"+(this.curLay!=undefined?this.curLay-4:id[pt-4])))
									this.scene.previewScene.getObjectByName( key+"_"+(this.curLay!=undefined?this.curLay-4:id[pt-4])).material.color =	{r:0.5, g:0.5, b:0.5};
								if (this.scene.pointCloud[key][(this.curLay!=undefined?this.curLay-1:id[pt-1])] != undefined)
								{
									this.nbKey++;
								}
							}
							i = 0;
							for ( key in this.scene.pointCloud)
							{
								id = [];
								if (this.curLay == undefined)
									for ( i in this.scene.pointCloud[key])
										id.push(i);
								pt = id.length;
								color = new THREE.Color().setHSL(((i-1)/this.nbKey), 1, 0.5);
								//console.log(key +" ("+color.r+","+color.g+","+color.b+")")
								pointMaterial = new THREE.LineBasicMaterial({color: color, linewidth:2});
								meshMaterial = new THREE.MeshPhongMaterial({color: color});
								if (this.scene.pointCloud[key][(this.curLay!=undefined?this.curLay-1:id[pt-1])] != undefined)
								{
									this.scene.pointCloud[key][(this.curLay!=undefined?this.curLay-1:id[pt-1])].computeVertexNormals();
									if (this.gcodeReader.fileSize < 10*1024*1024)
									{
										threeDee = (key != "MOVE"?new THREE.Mesh(
											new THREE.BufferGeometry().fromGeometry(this.scene.pointCloud[key][(this.curLay!=undefined?this.curLay-1:id[pt-1])])
											, meshMaterial )
											: new THREE.LineSegments(this.scene.pointCloud[key][(this.curLay!=undefined?this.curLay-1:id[pt-1])]
											, pointMaterial));
									} else {
										threeDee =	new THREE.LineSegments(this.scene.pointCloud[key][(this.curLay!=undefined?this.curLay-1:id[pt-1])]
										, pointMaterial);
									}
									threeDee.castShadow = true;
									threeDee.receiveShadow = true;
									threeDee.name = key+"_"+((this.curLay!=undefined?this.curLay-1:id[pt-1]));
									this.scene.this.scene.previewScene.add( threeDee );
								}
								i++;
							}
							console.log(this.gcodeLayers.length)
							if (this.gcodeLayers.length > 1)
							{
								console.log(id);
								try {
									this.scene.this.scene.previewControls.update();
									this.scene.previewRenderer.render( this.scene.this.scene.previewScene, this.scene.previewCamera );
									strMime = "image/jpeg";
									imgData = this.scene.previewRenderer.domElement.toDataURL(strMime);
									this.scene.preview.savePicture(imgData, this.gcodeReader.fileInput.name.substring(0,this.gcodeReader.fileInput.name.lastIndexOf("."))+"_"+(isNaN(this.curLay-1)?id[id.length-1]:this.curLay)+".jpg");
								} catch (e) {
									console.error(e);
									return;
								}
							}
						}
						this.gcodeLayer = {lBBox : {min:{x:1000,y:1000,z:1000}, max:{x:-1000,y:-1000,z:-1000}},points: []};
					}

					if ((this.lastPos.x && this.lastPos.y && this.lastPos.z) && (args.x || args.y || args.z))
					{
						x2 = (this.relative?(this.lastPos.x + args.x):args.x);
						y2 = (this.relative?(this.lastPos.y + args.y):args.y);

						point_start = new THREE.Vector3();
						point_end = new THREE.Vector3();
						if (args.e)
						{
							//console.log(Math.round(this.lastPos.z*100));
							if(!this.scene.pointCloud[this.lastPos.t] || !this.scene.pointCloud[this.lastPos.t][(this.curLay!=undefined?this.curLay:(Math.round(this.lastPos.z*100)))])
							{
								if ( !this.scene.pointCloud[this.lastPos.t])
								{
									this.scene.pointCloud[this.lastPos.t] = [];
									this.scene.pointCloud.length++;
								}
								this.scene.pointCloud[this.lastPos.t][(this.curLay!=undefined?this.curLay:(Math.round(this.lastPos.z*100)))] = new THREE.Geometry();
								this.scene.pointCloud[this.lastPos.t][(this.curLay!=undefined?this.curLay:(Math.round(this.lastPos.z*100)))].name = this.lastPos.t+"_"+(this.curLay!=undefined?this.curLay:(Math.round(this.lastPos.z*100)));
							}
							point_start.x = -this.lastPos.x;
							point_start.y = this.lastPos.z; //-y2;
							point_start.z = this.lastPos.y;//this.lastPos.z;

							point_end.x = -x2;
							point_end.y = this.lastPos.z; //-y2;
							point_end.z = y2;//this.lastPos.z;
							if (this.gcodeReader.fileSize < 10*1024*1024)
							{
								this.setPoly(point_start, point_end);
							} else {
								this.scene.pointCloud[this.lastPos.t][(this.curLay!=undefined?this.curLay:(Math.round(this.lastPos.z*100)))].vertices.push( point_start );
								this.scene.pointCloud[this.lastPos.t][(this.curLay!=undefined?this.curLay:(Math.round(this.lastPos.z*100)))].vertices.push( point_end );
							}

						} else {
							point_start.x = -this.lastPos.x;
							point_start.y = this.lastPos.z; //-y2;
							point_start.z = this.lastPos.y//this.lastPos.z;

							point_end.x = -x2;
							point_end.y = (args.z?(this.relative?(this.lastPos.z + args.z):args.z):this.lastPos.z); //-y2;
							point_end.z = y2//this.lastPos.z;
							if (!this.moves[(this.curLay!=undefined?this.curLay:(Math.round(this.lastPos.z*100)))])
							{
								this.moves[(this.curLay!=undefined?this.curLay:(Math.round(this.lastPos.z*100)))] = new THREE.Geometry();
								this.moves[(this.curLay!=undefined?this.curLay:(Math.round(this.lastPos.z*100)))].name = "MOVE_"+(this.curLay?this.curLay:(Math.round(this.lastPos.z*100)));
							}
							this.moves[(this.curLay!=undefined?this.curLay:(Math.round(this.lastPos.z*100)))].vertices.push( point_start );
							this.moves[(this.curLay!=undefined?this.curLay:(Math.round(this.lastPos.z*100)))].vertices.push( point_end );
						}
					}

					if (args.x)
					{
						this.lastPos.x = (this.relative?this.lastPos.x+args.x:args.x);
						if (this.lastPos.x < this.boundingBox.min.x)
							this.boundingBox.min.x = this.lastPos.x;
						if (this.lastPos.x > this.boundingBox.max.x)
							this.boundingBox.max.x = this.lastPos.x;

					}
					if (args.y)
					{
						this.lastPos.y = (this.relative?this.lastPos.y+args.y:args.y);
						if (this.lastPos.y < this.boundingBox.min.y)
							this.boundingBox.min.y = this.lastPos.y;
						if (this.lastPos.y > this.boundingBox.max.y)
							this.boundingBox.max.y = this.lastPos.y;
					}
					if (args.z)
					{
						this.lastPos.z = (this.relative?this.lastPos.z+args.z:args.z);
						if (this.lastPos.z < this.boundingBox.min.z)
							this.boundingBox.min.z = this.lastPos.z;
						if (this.lastPos.z > this.boundingBox.max.z)
							this.boundingBox.max.z = this.lastPos.z;
					}
					if (args.e)
					{
						this.lastPos.e = (this.relativeExtrude? this.lastPos.e + args.e : args.e);
					}
					if (args.f)
						this.lastPos.f = args.f;

					if(args.x || args.y)
					{
						tmpPos ={};
						tmpPos.x = this.lastPos.x;
						tmpPos.y = this.lastPos.y;
						tmpPos.z = this.lastPos.z;
						tmpPos.e = this.lastPos.e;
						tmpPos.f = this.lastPos.f;
						tmpPos.w = this.lastPos.w;
						tmpPos.t = this.lastPos.t;
						this.gcodeLayer.points.push(tmpPos);
					}
					break;
				case "G2":
					console.warn("clockwise rotation not implemented");
					console.log(args);

					rad = Math.sqrt(((args.i-args.x)*(args.i-args.x)) + ((args.y-args.j)*(args.y-args.j)))
					acos = Math.acos((this.lastPos.x-args.i)/rad);
					asin = Math.asin((this.lastPos.y-args.j)/rad);
					startA = 0;
					if (acos == asin)
					{
						startA = acos;
					} else if ((acos- Math.PI) == asin){
						startA = asin;
					} else {
						console.error('Que faire?')
					}

					acos = Math.acos(args.x/rad);
					asin = Math.asin(args.y/rad);
					endA = 0;
					if (acos == asin)
					{
						endA = acos;
					} else {
						console.error('Que faire?')
					}
					curve = new THREE.EllipseCurve(
								args.i, args.j,	// cX, cY
								rad, rad,				// xRadius, yRadius
								startA, endA,	// aStartAngle, aEndAngle
								true,						// aClockwise
								0								// aRotation
							);

					points = curve.getPoints( 50 );
					geometry = new THREE.BufferGeometry().setFromPoints( points );

					material = new THREE.LineBasicMaterial( { color : 0xff0000 } );

					// Create the final object to add to the scene
					ellipse = new THREE.Line( geometry, material );
					ellipse.position.z = this.lastPos.z;
					this.threeScene.live.add(ellipse);

					this.lastPos.x = args.x;
					this.lastPos.y = args.y;
					break;
				case "G3":
					console.warn("counterclockwise rotation not implemented");
					console.log(args)

					rad = Math.sqrt(((args.i-args.x)*(args.i-args.x)) + ((args.y-args.j)*(args.y-args.j)))
					acos = Math.acos((this.lastPos.x-args.i)/rad);
					asin = Math.asin((this.lastPos.y-args.j)/rad);
					startA = 0;
					if (acos == asin)
					{
						startA = acos;
					} else {
						console.error('Que faire?')
					}

					acos = Math.acos(args.x/rad);
					asin = Math.asin(args.y/rad);
					endA = 0;
					if (acos == asin)
					{
						endA = acos;
					} else {
						console.error('Que faire?')
					}
					curve = new THREE.EllipseCurve(
								args.i, args.j,	// cX, cY
								rad, rad,				// xRadius, yRadius
								startA, endA,	// aStartAngle, aEndAngle
								false,						// aClockwise
								0								// aRotation
							);

					points = curve.getPoints( 50 );
					geometry = new THREE.BufferGeometry().setFromPoints( points );

					material = new THREE.LineBasicMaterial( { color : 0xff0000 } );

					// Create the final object to add to the scene
					ellipse = new THREE.Line( geometry, material );
					ellipse.position.z = this.lastPos.z;
					this.threeScene.live.add(ellipse);

					this.lastPos.x = args.x;
					this.lastPos.y = args.y;
					break;

				case "G4":
					if (this.DEBUG)
						console.log("Wait");
					break;

				case "G10":
					if (this.DEBUG)
						if (args.p && (args.s || args.r))
							console.log("Set tool "+ args.p +" \n\tstanby temp: "+args.r +"\n\tactive temp: " + args.s);
						else if (args.l)
							console.log("Set tool "+ args.p + " offset\n\t X:"+ args.x +"\n\t Y:" + args.y + "\n\t Z:"+args.z);
						else
							console.log("Retracting filament");
					break;

				case "G21":
					if(this.DEBUG)
						console.log("Units set to mm");
					break;

				case "G28":
					if(this.DEBUG)
						console.log("Homing");
					this.lastPos.x = 0;
					this.lastPos.y = 0;
					this.lastPos.z = 0;
					break;

				case "G90":
					if(this.DEBUG)
						console.log("Absolute positioning");
					this.relative = false;
					break;

				case "G91":
					if(this.DEBUG)
						console.log("Relative positioning");
					this.relative = true;
					break;

				case "G92":
					if(this.DEBUG && (args.x || args.y || args.z))
						console.log("position set to" +
						(args.x?" \n\tX: " + args.x:"") +
						(args.y?" \n\tY: " + args.y:"") +
						(args.z?" \n\tZ: " + args.z:""));
					this.lastPos.x = (args.x?args.x:this.lastPos.x);
					this.lastPos.y = (args.y?args.y:this.lastPos.y);
					this.lastPos.z = (args.y?args.z:this.lastPos.z);
					break;

				/* ====== M Codes ====== */

				case "M42":
					if(this.DEBUG)
						console.log("new state "+args.s+" for Pin "+args.p);
					break;

				case "M82":
					if(this.DEBUG)
						console.log("Absolute extruder");
					this.relativeExtrude = false;
					break;

				case "M83":
				if(this.DEBUG)
					console.log("Relative extruder");
					this.relativeExtrude = true;
					break;

				case "M84":
					if(this.DEBUG)
						console.log("Steppers off");
					break;

				case "M104":
					if(this.DEBUG)
						console.log("Extruder set to "+args.s+"°C");
					break;

				case "M106":
					if(this.DEBUG)
						console.log("Fan " + (args.p?args.p+" ":"")+(args.s?"set to: " +args.s:"On"));
					break;

				case "M107":
					if(this.DEBUG)
						console.log("Fan off");
					break;

				case "M109":
					if(this.DEBUG)
						console.log("wait for Extruder to reach " + args.s+"°C");
					break;

				case "M116":
					if(this.DEBUG)
						if(args.p || args.h || args.c)
							console.log("wait for "+(args.p? "Tool "+args.p+" ":"")+(args.h?"Extruder "+args.h+" ":"")+(args.c?"Chamber "+args.c+" ":"")+"to reach it's target temperature");
						else
							console.log("wait for All to reach their target temperature");
					break;

				case "M117":
					break;

				case "M140":
					if(this.DEBUG)
						console.log("Bed set to "+args.s+"°C");
					break;

				case "M141":
					if(this.DEBUG)
						console.log("Chamber set to "+args.s+"°C");
					break;

				case "M190":
					if(this.DEBUG)
						console.log("Wait for bed to reach "+args.s+"°C");
					break;

				case "M191":
					if(this.DEBUG)
						console.log("Wait for chamber to reach "+args.s+"°C");
					break;

				/* ====== T Codes ====== */
				case "T0":
					if(this.DEBUG){
						console.log("Tool 0 selected");
						console.log(this.gcomParser.extruders[0]);
					}
					//extWidth = this.gcomParser.extruders[0].width;
					this.lastPos.t = 0;
					break;

				case "T1":
					if(this.DEBUG){
						console.log("Tool 1 selected");
						console.log(this.gcomParser.extruders[1]);
					}
					//extWidth = this.gcomParser.extruders[1].width;
					this.lastPos.t = 1;
					break;

				case "T2":
					if(this.DEBUG){
						console.log("Tool 2 selected");
						console.log(this.gcomParser.extruders[2]);
					}
					//extWidth = this.gcomParser.extruders[2].width;
					this.lastPos.t = 2;
					break;

				case "T3":
					if(this.DEBUG){
						console.log("Tool 3 selected");
						console.log(this.gcomParser.extruders[3]);
					}
					//extWidth = this.gcomParser.extruders[3].width;
					this.lastPos.t = 3;
					break;

				case "T4":
					if(this.DEBUG){
						console.log("Tool 4 selected");
						console.log(this.gcomParser.extruders[4]);
					}
					//extWidth = this.gcomParser.extruders[4].width;
					this.lastPos.t = 4;
					break;

				case "T5":
					if(this.DEBUG){
						console.log("Tool 5 selected");
						console.log(this.gcomParser.extruders[5]);
					}
					//extWidth = this.gcomParser.extruders[5].width;
					this.lastPos.t = 5;
					break;

				default :
					console.log("unknown command: "+args.cmd);
					console.log(args);
					break;
			}
		},
		setPoly: function(e,t){
			let a,E=this.scene.pointCloud[this.lastPos.t][void 0!=this.curLay?this.curLay:Math.round(100*this.lastPos.z)].vertices,h=this.scene.pointCloud[this.lastPos.t][void 0!=this.curLay?this.curLay:Math.round(100*this.lastPos.z)].faces,n=E.length,c=-(t.x-e.x),s=t.z-e.z;0!=c?(a=(t.z-e.z)/(e.x-t.x),e.z,e.x):(a=(e.x-t.x)/(t.z-e.z),e.x,e.z);let H,w,R,T,i=Math.atan(a);0!=c?(H=e.x+this.gcomParser.extWidth/2*Math.sin(i),w=t.x+this.gcomParser.extWidth/2*Math.sin(i),R=e.z+this.gcomParser.extWidth/2*Math.cos(i),T=t.z+this.gcomParser.extWidth/2*Math.cos(i)):(H=e.x+this.gcomParser.extWidth/2*Math.cos(i),w=t.x+this.gcomParser.extWidth/2*Math.cos(i),R=e.z+this.gcomParser.extWidth/2*Math.sin(i),T=t.z+this.gcomParser.extWidth/2*Math.sin(i));let o=new THREE.Vector3(H,e.y,R),x=new THREE.Vector3(w,t.y,T),r=new THREE.Vector3(w,t.y-(this.layHeight||this.lastPos.z-this.zPrevLayer),T),F=new THREE.Vector3(H,e.y-(this.layHeight||this.lastPos.z-this.zPrevLayer),R);0!=c?(H=e.x-this.gcomParser.extWidth/2*Math.sin(i),w=t.x-this.gcomParser.extWidth/2*Math.sin(i),R=e.z-this.gcomParser.extWidth/2*Math.cos(i),T=t.z-this.gcomParser.extWidth/2*Math.cos(i)):(H=e.x-this.gcomParser.extWidth/2*Math.cos(i),w=t.x-this.gcomParser.extWidth/2*Math.cos(i),R=e.z-this.gcomParser.extWidth/2*Math.sin(i),T=t.z-this.gcomParser.extWidth/2*Math.sin(i));let z,u,d,y,M,p,l,W,P=new THREE.Vector3(H,e.y,R),v=new THREE.Vector3(w,t.y,T),L=new THREE.Vector3(w,t.y-(this.layHeight||this.lastPos.z-this.zPrevLayer),T),V=new THREE.Vector3(H,e.y-(this.layHeight||this.lastPos.z-this.zPrevLayer),R),g=1/0;if(n>4){let f=o.x-E[n-4].x,C=o.z-E[n-4].z;g=Math.sqrt(f*f+C*C)}(n<4||g>this.gcomParser.extWidth/2)&&(E.push(o),E.push(F),E.push(P),E.push(V)),E.push(x),E.push(r),E.push(v),E.push(L),n>=4&&g<this.gcomParser.extWidth/2&&(n-=4),c<0?(z=new THREE.Face3(n,n+5,n+4),u=new THREE.Face3(n,n+1,n+5),d=new THREE.Face3(n+2,n+6,n+7),y=new THREE.Face3(n+2,n+7,n+3),M=new THREE.Face3(n,n+4,n+6),p=new THREE.Face3(n,n+6,n+2),l=new THREE.Face3(n+5,n+1,n+3),W=new THREE.Face3(n+5,n+3,n+7)):c>0?(z=new THREE.Face3(n,n+4,n+5),u=new THREE.Face3(n,n+5,n+1),d=new THREE.Face3(n+2,n+7,n+6),y=new THREE.Face3(n+2,n+3,n+7),M=new THREE.Face3(n,n+6,n+4),p=new THREE.Face3(n,n+2,n+6),l=new THREE.Face3(n+5,n+3,n+1),W=new THREE.Face3(n+5,n+7,n+3)):0==c&&(s<0?(z=new THREE.Face3(n,n+5,n+4),u=new THREE.Face3(n,n+1,n+5),d=new THREE.Face3(n+2,n+6,n+7),y=new THREE.Face3(n+2,n+7,n+3),M=new THREE.Face3(n,n+4,n+6),p=new THREE.Face3(n,n+6,n+2),l=new THREE.Face3(n+5,n+1,n+3),W=new THREE.Face3(n+5,n+3,n+7)):s>0&&(z=new THREE.Face3(n,n+4,n+5),u=new THREE.Face3(n,n+5,n+1),d=new THREE.Face3(n+2,n+7,n+6),y=new THREE.Face3(n+2,n+3,n+7),M=new THREE.Face3(n,n+6,n+4),p=new THREE.Face3(n,n+2,n+6),l=new THREE.Face3(n+5,n+3,n+1),W=new THREE.Face3(n+5,n+7,n+3))),z&&u&&(h.push(z),h.push(u)),d&&y&&(h.push(d),h.push(y)),M&&p&&(h.push(M),h.push(p)),l&&W&&(h.push(l),h.push(W)),z&&u&&d&&y&&M&&p&&l&&W||console.error("C'est possible!")}
	}
}
