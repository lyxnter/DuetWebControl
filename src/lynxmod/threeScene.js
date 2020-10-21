//var fileInput;
//var ajaxPrefix = "http://localhost:8080/";
//var timeToStr = function(){};
/* img to Blob*/
/* ======== THREE_SCENE ======== */
let THREE = require('three') ;
let Stats = require('stats') ;
let Preview = require('./preview') ;
let Live = require ('./live') ;

export default {
	name: 'ThreeScene',
	data() {
		return {
			DEBUG: false,
			//layStart = 0,
			//layEnd = 100,
			//strDownloadMime = "image/octet-stream",
			pointCloud: {},
			zoomLevel: 2,
			statsfps: undefined,
			needsRedraw: false,
			i: 0,
			nbKey: 0,
			keys: [],
			lays: [],
			lay: 0,
			curlay: 0,
			hasGeoToRender: false,
			newStatus: {},
			preview: Object.assign(Preview.default.methods, Preview.default.data),
			live: Object.assign(Live.default.methods, Live.default.data),
		}
	},
	methods: {
		initScene: function(target)
		{
			this.preview = Object.assign(Preview.default.methods, Preview.default.data);
			this.live = Object.assign(Live.default.methods, Live.default.data);
			if(this.DEBUG)
			{
				this.statsfps = new Stats();
				this.statsfps.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
				document.body.appendChild( this.statsfps.dom );
			}
			this.preview.initPreview(target);
			this.live.initLive();
		},
		animate: function() {
			//this.statsfps.begin();
			this.preview.previewControls.update();
			requestAnimationFrame( this.animate );
			if (this.hasGeoToRender || this.needsRedraw)
			{
				this.preview.previewRenderer.render( this.preview.previewScene, this.preview.previewCamera );
				this.live.liveRenderer.render(this.live.liveScene, this.live.liveCamera);
			}
			if (this.hasGeoToRender)
				this.preview.renderLoop();
			if (this.needsRedraw)
				this.redrawLoop();
			//light.position.z -= 0.1;
		},
		initRedraw: function()
		{
			this.needsRedraw = true;
			//layStart = parseInt($("#firstLayer")[0].value);
			//layEnd = parseInt($("#lastLayer")[0].value);
			if (this.layStart == undefined)
				this.layStart = 0;
			if (this.layEnd == undefined)
				this.layEnd = this.nbLayers;

			this.i = 0;
			this.lay = 0;
			this.nbKey = this.pointCloud.length;
			this.keys = [];
			for(var key in this.pointCloud)
			{
				if(key != "length" )
				{
					this.keys.push(key);
				}
			}
			for(var layer in this.pointCloud[this.keys[0]])
			{
				this.lays.push(layer);
			}
			var color = new THREE.Color().setHSL((this.i/this.nbKey), 0.75, 0.5);
			//console.log(key +" ("+color.r+","+color.g+","+color.b+")")
			this.pointMaterial = new THREE.LineBasicMaterial({color: color, width:2});
			this.meshMaterial = new THREE.MeshPhongMaterial({color: color});
		},
		redrawLoop: function()
		{
			if (this.i == this.keys.length)
			{
				this.needsRedraw = false;
				return;
			}
			if (this.lays[this.lay] != undefined )
			{
				var start = new Date();
				do {
					this.lay ++;
				}while ((new Date() - start < 10) && (this.lays[this.lay] != undefined ))
			} else if (this.i < this.keys.length)
			{
				this.i++;
				this.lays = [];
				for(var layer in this.pointCloud[this.keys[this.i]])
				{
					this.lays.push(layer);
				}
				var color = new THREE.Color().setHSL((this.i/this.nbKey), 0.75, 0.5);
				//console.log(key +" ("+color.r+","+color.g+","+color.b+")")
				this.pointMaterial = new THREE.LineBasicMaterial({color: color, linewidth: 2});
				this.meshMaterial = new THREE.MeshPhongMaterial({color: color});
				this.lay = 0;
			}
		},
		zoomIn: function()
		{
				document.getElementById("liveDisplay").firstElementChild.style.transform = "scale("+ (this.zoomLevel) +")";
				document.getElementById("liveDisplay").firstElementChild.style.transition = "transform .5s"
		},
		zoomOut: function()
		{
				document.getElementById("liveDisplay").firstElementChild.style.transform = "scale("+1+")";
		},
		centerSvg: function(event)
		{
			var cX = (event.offsetX)/12;
			var cY = (event.offsetY)/10.4;
			//console.log("X = " + cX + "%")
			//console.log("Y = " + cY + "%")
			document.getElementById("liveDisplay").firstElementChild.style["transform-origin"] = cX + "% " + cY + "%";
		},
		zoomSvg: function(event)
		{
			var  dir = event.deltaY;
			//var fast = event.shiftKey
			if ((dir < 0) && (this.zoomLevel < 4)) // forward
			{
				document.getElementById("liveDisplay").firstElementChild.style.transform = "scale("+ (this.zoomLevel *= 1.1) +")";
			} else if ((dir > 0) && (this.zoomLevel > 1)) {
				document.getElementById("liveDisplay").firstElementChild.style.transform = "scale("+ (this.zoomLevel /= 1.1) +")";
			}
			event.preventDefault();
		},
	},
	mounted() {
		this.preview = Object.assign(Preview.default.methods, Preview.default.data);
		this.live = Object.assign(Live.default.methods, Live.default.data);
		this.initScene();
		this.animate();
	}
}
