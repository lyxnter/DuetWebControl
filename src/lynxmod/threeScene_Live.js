
function initLive()
{
	liveScene = new THREE.Scene();
	liveCamera = new THREE.OrthographicCamera( -300, 300, 295, -225, 0.1, 10000 );	
	var liveSpace = $("#liveDisplay")[0];
	liveRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
	liveRenderer.setSize( 1200, 1040 );
	
	liveSpace.appendChild( liveRenderer.domElement );	
	var geometry = new THREE.CircleGeometry(180, 90);
	var material = new THREE.MeshBasicMaterial({ color: 0xf0f0f0 } );
	var buildPlate = new THREE.Mesh(new THREE.CircleGeometry( 225, 90), new THREE.MeshBasicMaterial({ color: 0xe0e0e0 }));
	//buildPlate.rotation.x = -Math.PI/2;
	buildPlate.position.z = -0.1;
	var buildSurface = new THREE.Mesh( geometry, material );
	//buildSurface.rotation.x = -Math.PI/2;
	buildSurface.position.z = 1;
	
	liveScene.add( buildSurface );
	liveScene.add( buildPlate );
		
	var gridPrimeGeo = new THREE.Geometry();
	var gridSecGeo = new THREE.Geometry();
	var materPrime = new THREE.LineBasicMaterial({ color: 0x7f7f7f});
	var materSec = new THREE.LineBasicMaterial({ color: 0xafafaf});
	
	prepareGridBPGeoLive(gridPrimeGeo, gridSecGeo);
	
	geometry = new THREE.Geometry();
	drawHead(geometry, {x: 0, y: 0}, 0, 3);
	var lineSegments = new THREE.LineSegments(geometry, materSec);
	lineSegments.name = "toolHead";
	liveScene.add(lineSegments);
	
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
	var lineSegments = new THREE.Mesh(geo, geoMat);
	liveScene.add(lineSegments);
	
		
	liveScene.add(new THREE.LineSegments(gridPrimeGeo, materPrime));
	liveScene.add(new THREE.LineSegments(gridSecGeo, materSec));
	
	liveCamera.position.set(0,0, 600);
}


function prepareGridBPGeoLive(gridPrime, gridSec)
{
	for (var posY = -200; posY < 180; posY += 100)
	{
		var miniX = -180 * Math.sqrt(1 - ((posY/180) * (posY/180)));
		var maxiX =  180 * Math.sqrt(1 - ((posY/180) * (posY/180)));
		gridPrime.vertices.push(new THREE.Vector3(miniX, posY, 1));
		gridPrime.vertices.push(new THREE.Vector3(maxiX, posY, 1));
		gridPrime.vertices.push(new THREE.Vector3(posY, miniX, 1));
		gridPrime.vertices.push(new THREE.Vector3(posY, maxiX, 1));
		for (var posX = posY + 20; posX < posY + 100; posX += 20)
		{
			miniX = -180 * Math.sqrt(1 - ((posX/180) * (posX/180)));
			maxiX =  180 * Math.sqrt(1 - ((posX/180) * (posX/180)));
			gridSec.vertices.push(new THREE.Vector3(miniX, posX, 1));
			gridSec.vertices.push(new THREE.Vector3(maxiX, posX, 1));
			gridSec.vertices.push(new THREE.Vector3(posX, miniX, 1));
			gridSec.vertices.push(new THREE.Vector3(posX, maxiX, 1));
		}
	}
}


// Converts from degrees to radians.
Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};
 
// Converts from radians to degrees.
Math.degrees = function(radians) {
  return radians * 180 / Math.PI;
};

function drawHead(geo ,pos, tnum, nbHead)
{

	var angle = 360/nbHead;
	if (tnum > 0)
	{
		pos.x -= (20*Math.cos(Math.radians(90-(angle*(tnum-1)))));
		pos.y -= (20*Math.sin(Math.radians(90-(angle*(tnum-1)))));
	}
	for(var i = 0; i <= 360; i += 60)
	{
		geo.vertices.push(new THREE.Vector3((pos.x+(35*Math.cos(Math.radians(i)))),-(pos.y+(35*Math.sin(Math.radians(i)))), 1));
		if (i!= 0)
			geo.vertices.push(new THREE.Vector3((pos.x+(35*Math.cos(Math.radians(i)))),-(pos.y+(35*Math.sin(Math.radians(i)))), 1));			
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
		geo.vertices.push(new THREE.Vector3((pos.x+(35*Math.cos(Math.radians(i)))),-(pos.y+(35*Math.sin(Math.radians(i)))), 1));
	}
	//console.log(str)

	liveScene.remove(liveScene.getObjectByName("toolHead0"));
	geometry = new THREE.Geometry();
	var posTi = {};
	posTi.x = pos.x 
	posTi.y = pos.y
	drawTool(posTi, geometry);
	var tHead = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({color: 0xafafaf}));
	tHead.name = "toolHead0";
	liveScene.add(tHead);
	
	for (var i = 0; i < nbHead; i++)
	{
		liveScene.remove(liveScene.getObjectByName("toolHead"+(i+1)));
		geometry = new THREE.Geometry();
		var posTi = {};
		posTi.x = pos.x + (20*Math.cos(Math.radians(90-(angle*i))));
		posTi.y = pos.y + (20*Math.sin(Math.radians(90-(angle*i))));
		drawTool(posTi, geometry);
		var tHead = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({color: tempChartOptions.colors[i+1]}));
		tHead.name = "toolHead"+(i+1);
		liveScene.add(tHead);
	}
}


function drawTool(pos, geo)
{
	for(var i = 0; i <= 360; i += 60){
		geo.vertices.push(new THREE.Vector3((pos.x+(2*Math.cos(Math.radians(i)))), -(pos.y+(2*Math.sin(Math.radians(i)))), 1));
		if (i!= 0)
			geo.vertices.push(new THREE.Vector3((pos.x+(2*Math.cos(Math.radians(i)))), -(pos.y+(2*Math.sin(Math.radians(i)))), 1));
	}
	geo.vertices.push(new THREE.Vector3((pos.x+(2*Math.cos(Math.radians(0)))), -(pos.y+(2*Math.sin(Math.radians(0)))), 1));
}

function redrawBP(){
	$("#layerPreview")[0].innerHTML = '<circle cx="300" cy="295" r="225" stroke="gray" stroke-width="1" fill="rgb(250,250,250)"/>';
	$("#layerPreview")[0].innerHTML += '<circle cx="300" cy="295" r="180" stroke="gray" stroke-width="1" fill="rgb(250,250,250)"/>';
	$("#layerPreview")[0].innerHTML += '<rect x="290" y="  0" width="20" height="10" stroke="gray" stroke-width="1" style="fill: darkgray;"></rect>';
	$("#layerPreview")[0].innerHTML += '<rect x="  0" y="510" width="20" height="10" stroke="gray" stroke-width="1" style="fill: darkgray; transform-origin: 20px 520px;" transform="rotate(45)" ></rect>';
	$("#layerPreview")[0].innerHTML += '<rect x="580" y="510" width="20" height="10" stroke="gray" stroke-width="1" style="fill: darkgray; transform-origin: 580px 520px;" transform="rotate(-45)"></rect>';
	for (var posY = -200; posY < 180; posY += 100)
	{
		for (var posX = posY + 20; posX < posY + 100; posX += 20)
		{
			var miniX = -180 * Math.sqrt(1 - ((posX/180) * (posX/180)));
			var maxiX =  180 * Math.sqrt(1 - ((posX/180) * (posX/180)));
			if (!isNaN(miniX) && !isNaN(maxiX))
			{
				$("#layerPreview")[0].innerHTML +="<line style='stroke:rgb(200,200,200);stroke-width:1'  x1='"+
					(300 + miniX) + "' y1='" + (295 + posX) + "' x2='" + (300 + maxiX) + "' y2='" + (295 + posX) + "'/>";
				$("#layerPreview")[0].innerHTML +="<line style='stroke:rgb(200,200,200);stroke-width:1'  x1='"+
					(300 + posX) + "' y1='" + (295 + miniX) + "' x2='" + (300 + posX) + "' y2='" + (295 + maxiX) + "'/>";
			}
		}
		var miniX = -180 * Math.sqrt(1 - ((posY/180) * (posY/180)));
		var maxiX =  180 * Math.sqrt(1 - ((posY/180) * (posY/180)));
		if (!isNaN(miniX) && !isNaN(maxiX))
		{
			$("#layerPreview")[0].innerHTML +="<line style='stroke:rgb(125,125,125);stroke-width:1'  x1='"+
				(300 + miniX) + "' y1='" + (295 + posY) + "' x2='" + (300 + maxiX) + "' y2='" + (295 + posY) + "'/>";
			$("#layerPreview")[0].innerHTML +="<line style='stroke:rgb(125,125,125);stroke-width:1'  x1='"+
				(300 + posY) + "' y1='" + (295 + miniX) + "' x2='" + (300 + posY) + "' y2='" + (295 + maxiX) + "'/>";
		}
	}
}