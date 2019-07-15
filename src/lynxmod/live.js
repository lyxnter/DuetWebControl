
let $ = require('jquery') ;
let THREE = require('three') ;
import { getRealHeaterColor } from '../utils/colors.js'

export default {
	name: 'LiveScene',
	data() {
		return {
		liveCamera: undefined,
		liveScene: undefined,
		liveRenderer: undefined,
	}
	},
	methods: {
	initLive: function()
		{
			this.liveScene = new THREE.Scene();
			this.liveCamera = new THREE.OrthographicCamera( -300, 300, 295, -225, 0.1, 10000 );
			var liveSpace = ($("#liveDisplay")[0]?$("#liveDisplay")[0]:$("#liveDisplay"));
			this.liveRenderer = new THREE.WebGLRenderer({
				alpha: true,
				antialias: true
			});
			this.liveRenderer.setSize( 1200, 1040 );
			//console.log(liveSpace);
			//console.log(this.liveRenderer);
			liveSpace.appendChild(this.liveRenderer.domElement);
			var geometry = new THREE.CircleGeometry(180, 90);
			var material = new THREE.MeshBasicMaterial({ color: 0xf0f0f0 } );
			var buildPlate = new THREE.Mesh(new THREE.CircleGeometry( 225, 90), new THREE.MeshBasicMaterial({ color: 0xe0e0e0 }));
			//buildPlate.rotation.x = -Math.PI/2;
			buildPlate.position.z = -0.1;
			var buildSurface = new THREE.Mesh( geometry, material );
			//buildSurface.rotation.x = -Math.PI/2;
			buildSurface.position.z = 1;

			this.liveScene.add( buildSurface );
			this.liveScene.add( buildPlate );

			var gridPrimeGeo = new THREE.Geometry();
			var gridSecGeo = new THREE.Geometry();
			var materPrime = new THREE.LineBasicMaterial({ color: 0x7f7f7f});
			var materSec = new THREE.LineBasicMaterial({ color: 0xafafaf});

			this.prepareGridBPGeoLive(gridPrimeGeo, gridSecGeo);

			geometry = new THREE.Geometry();
			this.drawHead(geometry, {x: 0, y: 0}, 0, 3);
			var lineSegments = new THREE.LineSegments(geometry, materSec);
			lineSegments.name = "toolHead";
			this.liveScene.add(lineSegments);

			var geo = new THREE.Geometry();
			geo.vertices.push(new THREE.Vector3(-10, 280, 1));
			geo.vertices.push(new THREE.Vector3(10, 280, 1));
			geo.vertices.push(new THREE.Vector3(-10, 290, 1));
			geo.vertices.push(new THREE.Vector3(10, 290, 1));


			geo.vertices.push(new THREE.Vector3(287, -203, 1));
			geo.vertices.push(new THREE.Vector3(273, -218, 1));
			geo.vertices.push(new THREE.Vector3(295, -210, 1));
			geo.vertices.push(new THREE.Vector3(280, -225, 1));

			geo.vertices.push(new THREE.Vector3(-273, -218, 1));
			geo.vertices.push(new THREE.Vector3(-287, -203, 1));
			geo.vertices.push(new THREE.Vector3(-280, -225, 1));
			geo.vertices.push(new THREE.Vector3(-295, -210, 1));

			geo.faces.push(new THREE.Face3(0,1,2));
			geo.faces.push(new THREE.Face3(2,1,3));
			geo.faces.push(new THREE.Face3(4,5,6));
			geo.faces.push(new THREE.Face3(6,5,7));
			geo.faces.push(new THREE.Face3(8,9,10));
			geo.faces.push(new THREE.Face3(10,9,11));


			var geoMat = new THREE.MeshBasicMaterial({color: 0xafafaf});
			lineSegments = new THREE.Mesh(geo, geoMat);
			this.liveScene.add(lineSegments);


			this.liveScene.add(new THREE.LineSegments(gridPrimeGeo, materPrime));
			this.liveScene.add(new THREE.LineSegments(gridSecGeo, materSec));

			this.liveCamera.position.set(0,0, 600);
		},
		prepareGridBPGeoLive: function(gridPrime, gridSec)
		{
			for (var posY = -200; posY < 180; posY += 100)
			{
				var miniX = -180 * Math.sqrt(1 - ((posY/180) * (posY/180)));
				var maxiX =	180 * Math.sqrt(1 - ((posY/180) * (posY/180)));
				gridPrime.vertices.push(new THREE.Vector3(miniX, posY, 1));
				gridPrime.vertices.push(new THREE.Vector3(maxiX, posY, 1));
				gridPrime.vertices.push(new THREE.Vector3(posY, miniX, 1));
				gridPrime.vertices.push(new THREE.Vector3(posY, maxiX, 1));
				for (var posX = posY + 20; posX < posY + 100; posX += 20)
				{
					miniX = -180 * Math.sqrt(1 - ((posX/180) * (posX/180)));
					maxiX =	180 * Math.sqrt(1 - ((posX/180) * (posX/180)));
					gridSec.vertices.push(new THREE.Vector3(miniX, posX, 1));
					gridSec.vertices.push(new THREE.Vector3(maxiX, posX, 1));
					gridSec.vertices.push(new THREE.Vector3(posX, miniX, 1));
					gridSec.vertices.push(new THREE.Vector3(posX, maxiX, 1));
				}
			}
		},
		drawHead: function(geo ,pos, tnum, nbHead)
		{
			var angle = 360/nbHead;
			if (tnum > 0)
			{
				pos.x -= (20*Math.cos(this.radians(90-(angle*(tnum-1)))));
				pos.y -= (20*Math.sin(this.radians(90-(angle*(tnum-1)))));
			}
			for(var i = 0; i <= 360; i += 60)
			{
				geo.vertices.push(new THREE.Vector3((pos.x+(35*Math.cos(this.radians(i)))),-(pos.y+(35*Math.sin(this.radians(i)))), 1));
				if (i!= 0)
					geo.vertices.push(new THREE.Vector3((pos.x+(35*Math.cos(this.radians(i)))),-(pos.y+(35*Math.sin(this.radians(i)))), 1));
				if(i == 0)
					geo.vertices.push(new THREE.Vector3(287, -203, 1));
				else if(i == 60)
					geo.vertices.push(new THREE.Vector3(273, -218, 1));
				else if(i == 120)
					geo.vertices.push(new THREE.Vector3(-273, -218, 1));
				else if(i == 180)
					geo.vertices.push(new THREE.Vector3(-287, -203, 1));
				else if(i == 240)
					geo.vertices.push(new THREE.Vector3(-10, 280, 1));
				else if(i == 300)
					geo.vertices.push(new THREE.Vector3(10, 280, 1));
				geo.vertices.push(new THREE.Vector3((pos.x+(35*Math.cos(this.radians(i)))),-(pos.y+(35*Math.sin(this.radians(i)))), 1));
			}
			//console.log(str)

			this.liveScene.remove(this.liveScene.getObjectByName("toolHead0"));
			let geometry = new THREE.Geometry();
			var posTi = {};
			posTi.x = pos.x
			posTi.y = pos.y
			this.drawTool(posTi, geometry);
			var tHead = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({color: 0xafafaf}));
			tHead.name = "toolHead0";
			this.liveScene.add(tHead);

			for ( this.i = 0; this.i < nbHead; this.i++)
			{
				this.liveScene.remove(this.liveScene.getObjectByName("toolHead"+(i+1)));
				geometry = new THREE.Geometry();
				posTi = {};
				posTi.x = pos.x + (20*Math.cos(this.radians(90-(angle*i))));
				posTi.y = pos.y + (20*Math.sin(this.radians(90-(angle*i))));
				this.drawTool(posTi, geometry);
				tHead = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({color: getRealHeaterColor(i,false)}));
				tHead.name = "toolHead"+(i+1);
				this.liveScene.add(tHead);
			}
		},
		drawTool: function(pos, geo)
		{
			for(var i = 0; i <= 360; i += 60){
				geo.vertices.push(new THREE.Vector3((pos.x+(2*Math.cos(this.radians(i)))),-(pos.y+(2*Math.sin(this.radians(i)))), 1));
				if (i!= 0)
					geo.vertices.push(new THREE.Vector3((pos.x+(2*Math.cos(this.radians(i)))),-(pos.y+(2*Math.sin(this.radians(i)))), 1));
			}
			geo.vertices.push(new THREE.Vector3((pos.x+(2*Math.cos(this.radians(0)))),-(pos.y+(2*Math.sin(this.radians(0)))), 1));
		},
		// Converts from Degrees to Radians.
		radians: function(degrees) {
			return degrees * Math.PI / 180;
		},
		// Converts from Radians to Degrees.
		degrees: function(radians) {
			return radians * 180 / Math.PI;
		},
	},
}
