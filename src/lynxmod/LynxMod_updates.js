var lynxterFeatures = {};
var usersList = [];
var curUser = {};
var advancedUser = false;
var maintenanceUser = false;
var devUser = false;

$(".btn-login").click(function(e) {
	if(usersList.length == 0)
	{
		$.get(ajaxPrefix + "rr_download?name=0:/sys/usersList.json", function(res){
			usersList = JSON.parse(res);
		})
	}
	if(!$(this).hasClass("disabled")){
		if( curUser.id == undefined)
			showLoginPrompt();
		else {
			$(".btn-login").removeClass("btn-danger").removeClass("btn-warning").removeClass("btn-success").addClass("btn-info");
			curUser = {};
			$(".btn-login > span:not(.glyphicon)").text(T("Log in"));
			$(".btn-login > span.glyphicon").removeClass("glyphicon-log-out").addClass("glyphicon-log-in");
			advancedUser = maintenanceUser = devUser = false;
			updatePrivileges();
		}
	}
});

function checkForUpdates(forceDisplay){
	getConfigResponse(true);
	if (new Date().toISOString().split('T')[0] > configResponse.firmwareDate)
	{
		$("#modal_updates #input_update_rrf").empty();
		$("#modal_updates #input_update_dwc").empty();
		console.log("Time to look for updates!");
		$.get("https://api.github.com/repos/thomaslynx/reprapfirmwarelynxter/releases", function(data){
			var trouve = false;
			var i = 0;
			while (i < data.length && !trouve) {
				if (!data[i].draft && !data[i].prerelease)
				{
					console.log(data[i].tag_name +" > " + configResponse.firmwareVersion + " " + (data[i].tag_name > configResponse.firmwareVersion));
					if (data[i].tag_name > configResponse.firmwareVersion)
					{
						updateLinks.rrf = {};
						updateLinks.rrf.name = data[i].assets[0].name;
						updateLinks.rrf.url = data[i].assets[0].url;
						updateLinks.rrf.download_url = data[i].assets[0].browser_download_url;
						updateLinks.rrf.updated = data[i].assets[0].updated_at;
						$("#modal_updates #input_update_rrf").append("A new version is avaliable for the RepRap Firmware<br>    Current: " + configResponse.firmwareVersion + " => Avaliable: <a href='" +  data[i].html_url + "'>" + data[i].tag_name);
						$("#btn_do_update").removeClass("disabled");
						$("#modal_updates").modal("show");
					} 
					else
					{
						$("#modal_updates #input_update_rrf").append("RepRap Firmware is up to date");
					}
					
					trouve = true;
				}
			}
		});
		
		$.get("https://api.github.com/repos/thomaslynx/duetwebgcodeviewer/releases", function(data){
			var trouve = false;
			var i = 0;
			while (i < data.length && !trouve) {
				if (!data[i].draft && !data[i].prerelease)
				{
					console.log(data[i].tag_name +" > " + dwcVersion + " " + (data[i].tag_name > dwcVersion));
					if (data[i].tag_name > dwcVersion)
					{
						updateLinks.dwc = {};
						updateLinks.dwc.name = data[i].assets[0].name;
						updateLinks.dwc.url = data[i].assets[0].url;
						updateLinks.dwc.download_url = data[i].assets[0].browser_download_url;
						updateLinks.dwc.updated = data[i].assets[0].updated_at;
						$("#modal_updates #input_update_dwc").append("A new version is avaliable for the Web Control<br>    Current: " + dwcVersion + " => Avaliable:  <a href='" + data[i].html_url + "'>" + data[i].tag_name);
						$("#btn_do_update").removeClass("disabled");
						$("#modal_updates").modal("show");
					}
					else
					{
						$("#modal_updates #input_update_dwc").append("Duet Web Control is up to date");
					}
					trouve = true;
				}
			}
		});
		if (forceDisplay)
			$("#modal_updates").modal("show");
	}
}

update Status
if ($("td[data-axis='" + 0 + "']").html() != "n/a" && $("td[data-axis='" + 1 + "']").html() != "n/a")
{
	var x1 = (parseFloat($("td[data-axis='" + 0 + "']").html()));
	var y1 = (parseFloat($("td[data-axis='" + 1 + "']").html()));
	var z1 = parseFloat($("td[data-axis='" + 2 + "']").html());
	var x2 = (parseFloat(status.coords.xyz[0].toFixed(2)));
	var y2 = (parseFloat(status.coords.xyz[1].toFixed(2)));
	var z2 = parseFloat(status.coords.xyz[2].toFixed(2));
	if ((!isNaN(x1) && !isNaN(x2)) && (!isNaN(y1) && !isNaN(y2)) && (!isNaN(z1) && !isNaN(z2)))
	{
		if ((x1 != x2 || y1 != y2) && (z1 == z2))
		{// changer couleur extrudeur
			
			do {
				liveScene.remove(liveScene.getObjectByName("toolPath"));
			} while (liveScene.getObjectByName("toolPath"))
			
			lastLayer[Math.max(status.currentTool, 0)].push({x1: x1, x2: x2, y1: y1, y2: y2});
			for(var tool = 0; tool < lastLayer.length; tool++)
			{
				var geometry = new THREE.Geometry();
				for(var i = Math.max(0, lastLayer[tool].length-1000); i < lastLayer[tool].length; i++)
				{
						geometry.vertices.push(new THREE.Vector3(lastLayer[tool][i].x1, -lastLayer[tool][i].y1, 1));
						geometry.vertices.push(new THREE.Vector3(lastLayer[tool][i].x2, -lastLayer[tool][i].y2, 1));
				}
				if(Math.min(status.currentTool, 0) === tool)
				{
					geometry.vertices.push(new THREE.Vector3(x1, -y1, 1));
					geometry.vertices.push(new THREE.Vector3(x2, -y2, 1));
				}
				var line = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({color: (tool > 0 ?tempChartOptions.colors[tool]:0xa0a0a0)}))
				line.name = "toolPath";
				liveScene.add(line);
				
			}
				liveScene.remove(liveScene.getObjectByName("toolHead"));
				var geometry = new THREE.Geometry();
				drawHead(geometry, {x: x2, y: y2}, status.currentTool, nbTools);
				var line = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({color: 0xa0a0a0}))
				line.name = "toolHead"
				liveScene.add(line);
			
		} else if (z1 != z2){
			//console.log("new Layer")
			//redrawBP();
			do {
				liveScene.remove(liveScene.getObjectByName("toolPath"));
			} while (liveScene.getObjectByName("toolPath"))
			lastLayer = [[], [], [], [], [], []];
		}
	}
}
			
file info
var dirName = response.fileName.substring(response.fileName.lastIndexOf("/")+1, response.fileName.lastIndexOf("."));
fileName = dirName + "_bp.jpg"
//getPicture("0:/www/img/GCodePreview/" + dirName, fileName, $("#livePreview")[0], 250);
$("#livePreview")[0].src = ajaxPrefix + "img/GCodePreview/" + dirName + "/" + fileName;
$("#livePreview")[0].width = "250";
				
setOem
function setLynxter (config) {
	console.log(config);
	lynxterFeatures = config;
	//$(".diabase").removeClass("hidden");
	//$(".no-diabase").addClass("hidden");
	
	$(".navbar-brand").prop("href", "https://www.lynxter.fr/lynxter-accueil/").prop("target", "_blank");
	$(".navbar-brand > img").removeClass("hidden").prop("src", "img/logoLynxter.jpg");
	$(".navbar-brand > img").prop("style", "height: 50px; margin-top: -15px;");

	//$("#table_tools tr[data-heater='cabinet'] > th:first-child > a").text(T("Dry Cabinet"));
	//$("#table_heaters tr[data-heater='cabinet'] > th:first-child > a").text(T("Dry Cabinet"));

	//$("#img_crosshair").prop("src", "img/crosshair.png");
	//$("#img_calibration_diagram").prop("src", "img/diabase_calibration_diagram.png");
	
	for(var i = 0; i < config.heads.length; i++) {
		$("#tab_" + config.heads[i]).removeClass("hidden");
		$("#page_" + config.heads[i]).removeClass("hidden");
	}
}

// gcode miniatures implementation
function addGCodeFileMiniature(filename) {
	$("#page_files h1").addClass("hidden");
	$("#table_gcode_files").removeClass("hidden");
	var row = $("#table_gcode_files tr")[$("#table_gcode_files tr").length -1];
	if (row.childNodes.length >= 8)
	{
		row.outerHTML += '<tr> </tr>';
		row = $("#table_gcode_files tr")[$("#table_gcode_files tr").length -1];
	}
	//row +=		'<td><input type="checkbox"></td>';
	row.innerHTML +=	'<td draggable="true" class="name" style="width: 175px;" data-file="' + filename + '"><span class="glyphicon glyphicon-asterisk"></span> ' + filename + '</td>';
	return $(row).appendTo("#table_gcode_files > tbody");
}

function addGCodeDirectoryMiniature(name) {
	$("#page_files h1").addClass("hidden");
	$("#table_gcode_files").removeClass("hidden");
	
	var row = $("#table_gcode_files tr")[$("#table_gcode_files tr").length -1];
	if (row.childNodes.length >= 8)
	{
		row.outerHTML +=	'<tr> </tr>';
		row = $("#table_gcode_files tr")[$("#table_gcode_files tr").length -1];
	}

	row.innerHTML += '<td draggable="true" data-directory="' + name + '"><a href="#" class="a-gcode-directory"><img src="img/folder.svg" width="150"><br/> ' + name + '</a></td>';
	
	var rowElem = $(row);
	rowElem[0].addEventListener("dragstart", fileDragStart, false);
	rowElem[0].addEventListener("dragend", fileDragEnd, false);

	if (gcodeLastDirectory == undefined) {
		var firstRow = $("#table_gcode_files > tbody > tr:first-child");
		if (firstRow.length == 0) {
			$("#table_gcode_files > tbody > tr").append(rowElem);
		} else {
			rowElem.insertBefore(firstRow);
		}
	} else {
		rowElem.insertAfter(gcodeLastDirectory);
	}
	gcodeLastDirectory = rowElem;
}

function setGCodeFileMiniature(row, size, lastModified, height, firstLayerHeight, layerHeight, filamentUsage, generatedBy) {
	var lastModifiedValue = (lastModified == undefined) ? 0 : lastModified.getTime();

	// Make entry interactive and link the missing data attributes to it
	var linkCell = row;
	var img = document.createElement('img');
	var name = linkCell.html().substring(linkCell.html().lastIndexOf(">")+2, linkCell.html().lastIndexOf("."));
	while (name.includes(" "))
		name = name.replace(" ", "_");
	img.id = name;
	linkCell.find("span").replaceWith(img.outerHTML+"<BR/>");
	linkCell.html('<div class="udtooltip"><a href="#" class="a-gcode-file">' + linkCell.html() + '</a><span class="udtooltiptext udtooltip-bottom"></span></div>');
	//getPicture("0:/www/img/GCodePreview/" + name, name + "_ico.jpg" , $("#"+name)[0], 30);
	$("#"+name)[0].src = ajaxPrefix +"img/GCodePreview/" + name + "/" + name + "_ico.jpg";
	$("#"+name)[0].width = "150";
	$("#"+name)[0].classList.add("img_gcode_miniature");
	row.find("span")[0].innerHTML += "size: "+ formatSize(size) + "<br>";
	row.find("span")[0].innerHTML += "last-modified: " + new Date(lastModifiedValue).toLocaleString() + "<br>";
	row.find("span")[0].innerHTML += "height: " + height + "mm <br>";
	row.find("span")[0].innerHTML += "first-layer-height: "+  firstLayerHeight + "mm<br>";
	row.find("span")[0].innerHTML += "layer-height: " + layerHeight + "mm<br>";
	row.find("span")[0].innerHTML += "filament-usage: " + (filamentUsage/1000).toFixed(2) + "m<br>";
	row.find("span")[0].innerHTML += "generated-by: " + generatedBy + "<br>";

	// Add drag&drop handlers
	row[0].addEventListener("dragstart", fileDragStart, false);
	row[0].addEventListener("dragend", fileDragEnd, false);

	// Set size
	row.find(".size").text(formatSize(size));

	// Set last modified date
	row.find(".last-modified").text(((lastModified == undefined) ? T("n/a") : lastModified.toLocaleString()));

	// Set object height
	row.find(".object-height").text((height > 0) ? T("{0} mm", height) : T("n/a"));

	// Set layer height
	if (layerHeight > 0) {
		var lhText = (firstLayerHeight == undefined) ? (T("{0} mm", layerHeight)) : (firstLayerHeight + " / " + T("{0} mm", layerHeight));
		row.find(".layer-height").text(lhText);
	} else {
		row.find(".layer-height").text(T("n/a"));
	}

	// Set filament usage
	if (filamentUsage.length > 0) {
		var totalUsage = filamentUsage.reduce(function(a, b) { return a + b; }).toFixed(1) + " mm";
		if (filamentUsage.length == 1) {
			row.find(".filament-usage").text(totalUsage);
		} else {
			var individualUsage = T("{0} mm", filamentUsage.reduce(function(a, b) { return T("{0} mm", a) + ", " + b; }));
			var filaUsage = '<abbr class="filament-usage" title="' + individualUsage + '">' + totalUsage + "</abbr>";
			row.find(".filament-usage").html(filaUsage);
		}
	} else {
		row.find(".filament-usage").text(T("n/a"));
	}

	// Set slicer
	var slicer = generatedBy.match(/(.*\d\.\d)\s/);
	if (slicer == null) {
		slicer = generatedBy;
	} else {
		slicer = slicer[1];
	}
	slicer = slicer.replace(" Version", "");
	row.find(".generated-by").text((slicer != "") ? slicer : T("n/a"));
}

updateGcodeFile
if (row.length > 0) {
	if (fileinfo.err == 0) {
		if($("#gcode_list").hasClass("active"))
			setGCodeFileList(row, fileinfo.size, strToTime(fileinfo.lastModified), fileinfo.height, fileinfo.firstLayerHeight, fileinfo.layerHeight, fileinfo.filament, fileinfo.generatedBy);
		else if($("#gcode_mini").hasClass("active"))
			setGCodeFileMiniature(row, fileinfo.size, strToTime(fileinfo.lastModified), fileinfo.height, fileinfo.firstLayerHeight, fileinfo.layerHeight, fileinfo.filament, fileinfo.generatedBy);
	} else {
		if($("#gcode_list").hasClass("active"))
			setGCodeFileList(row, 0, undefined, 0, 0, 0, [], "");
		else if($("#gcode_mini").hasClass("active"))
			setGCodeFileMiniature(row, 0, undefined, 0, 0, 0, [], "");
			
	}
}

getGcodeFile
// add each file and directory
for(var i = 0; i < response.files.length; i++) {
	if (response.files[i].indexOf("*") == 0) {
		if($("#gcode_list").hasClass("active"))
			addGCodeDirectoryList(response.files[i].substr(1));
		else if($("#gcode_mini").hasClass("active"))
			addGCodeDirectoryMiniature(response.files[i].substr(1));
	} else {
		knownGCodeFiles.push(response.files[i]);
		if($("#gcode_list").hasClass("active"))
			addGCodeFileList(response.files[i]);
		else if($("#gcode_mini").hasClass("active"))
			addGCodeFileMiniature(response.files[i]);
	}
}

function gcodeUpdateFinished() {
	var table = $("#table_gcode_files").css("cursor", "");

	if($("#gcode_list").hasClass("active"))
	{
		sortTable(table);
		$("#table_gcode_files > thead")[0].style.display = "";
	} else if($("#gcode_mini").hasClass("active")) {
		sortTableTd(table);
		$("#table_gcode_files > thead")[0].style.display = "none";
		$("#table_gcode_files > tbody > td").prop("style", "text-align: center; vertical-align: middle; border-right: 1px solid lightgray;");
	}

	if (isConnected) {
		$(".span-refresh-files").toggleClass("hidden", currentPage != "files");
		startUpdates();
	} else {
		$(".span-refresh-files").addClass("hidden");
	}
}

$("body").on("click", ".a-gcode-file", function(e) {
	var file = ($(this).closest("tr").data("file")?$(this).closest("tr").data("file"):$(this).closest("td").data("file"));
	var dirName = file.substring(file.lastIndexOf("/"), file.lastIndexOf("."));
	$("#modal_confirmation_img")[0].parentNode.style.display = "block";
	fileName = dirName + "_bp.jpg"
	getPicture("0:/www/img/GCodePreview/" + dirName, fileName, $("#modal_confirmation_img")[0], 100);
	//$("#modal_confirmation_img")[0].src = ajaxPrefix +"img/GCodePreview/" + dirName + "/" + fileName;
	//$("#modal_confirmation_img")[0].width = "100";
	showConfirmationDialog(T("Run G-Code File"), T("Do you want to run <strong>{0}</strong>?", file), function() {
		waitingForJobStart = true;
		if (currentGCodeVolume != 0) {
			sendGCode('M32 "' + currentGCodeDirectory + "/" + file + '"');
		} else if (currentGCodeDirectory == "0:/gcodes") {
			sendGCode('M32 "' + file + '"');
		} else {
			sendGCode('M32 "' + currentGCodeDirectory.substring(10) + "/" + file + '"');
		}
		//getPicture("0:/www/img/GCodePreview/" + dirName, fileName, $("#livePreview")[0], 250);
		$("#livePreview")[0].src = ajaxPrefix +"img/GCodePreview/" + dirName + "/" + fileName;
		$("#livePreview")[0].width = "250";
	});
	e.preventDefault();
});


/* Filaments */

$(".span-refresh-materials").click(function() {
	updateMaterials();
	$(".span-refresh-materials").addClass("hidden");
});

$("#btn_new_material").click(function() {
	showTextInput(T("New material"), T("Please enter a name:"), function(value) {
		if (filenameValid(value)) {
			if (materialsExist) {
				$.ajax(ajaxPrefix + "rr_mkdir?dir=" + encodeURIComponent("0:/materials/" + value), {
					dataType: "json",
					success: function(response) {
						if (response.err == 0) {
							uploadTextFile("0:/materials/" + value + "/load.g", "", undefined, false);
							uploadTextFile("0:/materials/" + value + "/unload.g", "", undefined, false);
							updateMaterials();
						} else {
							showMessage("warning", T("Error"), T("Could not create this directory!"));
						}
					}
				});
			} else {
				$.ajax(ajaxPrefix + "rr_mkdir?dir=0:/materials", {
					dataType: "json",
					success: function(response) {
						if (response.err == 0) {
							$.ajax(ajaxPrefix + "rr_mkdir?dir=" + encodeURIComponent("0:/materials/" + value), {
								dataType: "json",
								success: function(response) {
									if (response.err == 0) {
										uploadTextFile("0:/materials/" + value + "/load.g", "", undefined, false);
										uploadTextFile("0:/materials/" + value + "/unload.g", "", undefined, false);
										updateMaterials();
									} else {
										showMessage("warning", T("Error"), T("Could not create this directory!"));
									}
								}
							});
						}
					}
				});
			}
		} else {
			showMessage("danger", T("Error"), T("The specified filename is invalid. It may not contain quotes, colons or (back)slashes."));
		}
	});
});

function updateMaterials() {
	clearMaterials();
	if (!isConnected) {
		$(".span-refresh-materials").addClass("hidden");
		return;
	}

	// Is the macro volume mounted?
	if ((mountedVolumes & (1 << 0)) == 0) {
		// No - stop here
		clearmaterials();
		return;
	}

	// Yes - fetch the filelist for the current directory and proceed
	stopUpdates();
	getMaterials(0);
}

function getMaterials(first) {
	if(first === undefined)
		return;
	$.ajax(ajaxPrefix + "rr_filelist?dir=0:/materials&first=" + (first != undefined ?first:0), {
		dataType: "json",
		success: function(response) {
			if (isConnected) {
				if (response.hasOwnProperty("err")) {
					// don't proceed if the firmware has reported an error
					materialsExist = false;
					$("#page_materials h1").text(T("Failed to retrieve Materials"));
					startUpdates();
				} else {
					var files = response.files, materialsAdded = 0;
					for(var i = 0; i < files.length; i++) {
						if (files[i].type == 'd') {
							var dateCreated = files[i].hasOwnProperty("date") ? strToTime(files[i].date) : undefined;
							switch(files[i].name){
								case "filaments":
									getFilaments(0);
									break;
								case "liquids":
									getLiquids(0);
									break;
								default:
									addMaterial(files[i].name, dateCreated);
									materialsAdded++;
							}
						}
					}

					if (response.next != 0 && !compatibilityMode) {
						getMaterials(response.next);
					} else {
						if (materialsAdded == 0) {
							$("#page_materials h1").text(T("No Materials found"));
						} else {
							sortTable($("#table_materials"));
						}

						if (currentPage == "materials") {
							$(".span-refresh-materials").removeClass("hidden");
						}

						materialsLoaded = true;
						materialsExist = true;
						startUpdates();
					}
				}
			}
		}
	});
}

function addMaterial(name, dateCreated) {
	$("#page_materials h1").addClass("hidden");
	$("#table_materials").removeClass("hidden");

	var dateCreatedValue = (dateCreated == undefined) ? 0 : dateCreated.getTime();
	var row =	'<tr data-material="' + name + '" data-date-created="' + dateCreatedValue + '">';
	row +=		'<td><input type="checkbox"></td>';
	row +=		'<td><a href="#" class="a-material"> <span class="glyphicon glyphicon-question-sign"></span>' + name + '</a></td>';
	row +=		'<td>' + ((dateCreated == undefined) ? T("unknown") : dateCreated.toLocaleString()) + '</td>';
	row +=		'</tr>';
	$("#table_materials > tbody").append(row);
}

function clearMaterials() {
	materialsLoaded = false;
	materialsExist = false;
	
	clearFilaments();
	clearLiquids()
	
	$("#table_materials > thead input[type='checkbox']:first-child").prop("checked", false);
	$("#table_materials > tbody").children().remove();
	$("#table_materials").addClass("hidden");
	$("#page_materials h1").removeClass("hidden");
	if (isConnected) {
		if ((mountedVolumes & (1 << 0)) == 0) {
			$("#page_materials h1").text(T("The first volume is not mounted"));
		} else {
			$("#page_materials h1").text(T("loading"));
		}
	} else {
		$("#page_materials h1").text(T("Connect to your Duet to display Materials"));
	}
}

$("#table_materials > tbody").on("click", ".a-material", function(e) {
	e.preventDefault();
});

$("#btn_new_filament").click(function() {
	showTextInput(T("New filament"), T("Please enter a name:"), function(value) {
		if (filenameValid(value)) {
			if (filamentsExist) {
				$.ajax(ajaxPrefix + "rr_mkdir?dir=" + encodeURIComponent("0:/materials/filaments/" + value), {
					dataType: "json",
					success: function(response) {
						if (response.err == 0) {
							uploadTextFile("0:/materials/filaments/" + value + "/load.g", "", undefined, false);
							uploadTextFile("0:/materials/filaments/" + value + "/unload.g", "", undefined, false);
							updateFilaments();
						} else {
							showMessage("warning", T("Error"), T("Could not create this directory!"));
						}
					}
				});
			} else {
				$.ajax(ajaxPrefix + "rr_mkdir?dir=0:/materials/filaments", {
					dataType: "json",
					success: function(response) {
						if (response.err == 0) {
							$.ajax(ajaxPrefix + "rr_mkdir?dir=" + encodeURIComponent("0:/materials/filaments/" + value), {
								dataType: "json",
								success: function(response) {
									if (response.err == 0) {
										uploadTextFile("0:/materials/filaments/" + value + "/load.g", "", undefined, false);
										uploadTextFile("0:/materials/filaments/" + value + "/unload.g", "", undefined, false);
										updateFilaments();
									} else {
										showMessage("warning", T("Error"), T("Could not create this directory!"));
									}
								}
							});
						}
					}
				});
			}
		} else {
			showMessage("danger", T("Error"), T("The specified filename is invalid. It may not contain quotes, colons or (back)slashes."));
		}
	});
});

function updateFilaments() {
	clearFilaments();
	if (!isConnected) {
		$(".span-refresh-materials").addClass("hidden");
		return;
	}

	// Is the macro volume mounted?
	if ((mountedVolumes & (1 << 0)) == 0) {
		// No - stop here
		clearFilaments();
		return;
	}

	// Yes - fetch the filelist for the current directory and proceed
	stopUpdates();
	getFilaments(0);
}

function getFilaments(first) {
	if(first === undefined)
		return;
	$.ajax(ajaxPrefix + "rr_filelist?dir=0:/materials/filaments&first=" + (first != undefined ?first:0), {
		dataType: "json",
		success: function(response) {
			if (isConnected) {
				if (response.hasOwnProperty("err")) {
					// don't proceed if the firmware has reported an error
					filamentsExist = false;
					$("#page_filaments h1").text(T("Failed to retrieve Filaments"));
					startUpdates();
				} else {
					var files = response.files, filamentsAdded = 0;
					for(var i = 0; i < files.length; i++) {
						if (files[i].type == 'd') {
							var dateCreated = files[i].hasOwnProperty("date") ? strToTime(files[i].date) : undefined;
							addFilament(files[i].name, dateCreated);
							filamentsAdded++;
						}
					}

					if (response.next != 0 && !compatibilityMode) {
						getFilaments(response.next);
					} else {
						if (filamentsAdded == 0) {
							$("#page_filaments h1").text(T("No Filaments found"));
						} else {
							sortTable($("#table_filaments"));
						}

						if (currentPage == "filaments") {
							$(".span-refresh-filaments").removeClass("hidden");
						}

						filamentsLoaded = true;
						filamentsExist = true;
						startUpdates();
					}
				}
			}
		}
	});
}

function addFilament(name, dateCreated) {
	$("#page_filaments h1").addClass("hidden");
	$("#table_filaments").removeClass("hidden");

	var dateCreatedValue = (dateCreated == undefined) ? 0 : dateCreated.getTime();
	var row =	'<tr data-filament="' + name + '" data-date-created="' + dateCreatedValue + '">';
	row +=		'<td><input type="checkbox"></td>';
	row +=		'<td><a href="#" class="a-filament"><span class="glyphicon glyphicon-cd"></span> ' + name + '</a></td>';
	row +=		'<td>' + ((dateCreated == undefined) ? T("unknown") : dateCreated.toLocaleString()) + '</td>';
	row +=		'</tr>';
	$("#table_filaments > tbody").append(row);
}

function clearFilaments() {
	filamentsLoaded = false;
	filamentsExist = false;

	$("#table_filaments > thead input[type='checkbox']:first-child").prop("checked", false);
	$("#table_filaments > tbody").children().remove();
	$("#table_filaments").addClass("hidden");
	$("#page_filaments h1").removeClass("hidden");
	if (isConnected) {
		if ((mountedVolumes & (1 << 0)) == 0) {
			$("#page_filaments h1").text(T("The first volume is not mounted"));
		} else {
			$("#page_filaments h1").text(T("loading"));
		}
	} else {
		$("#page_filaments h1").text(T("Connect to your Duet to display Filaments"));
	}
}

$("#table_filaments > tbody").on("click", ".a-filament", function(e) {
	e.preventDefault();
});

$("#btn_new_liquid").click(function() {
	showTextInput(T("New liquid"), T("Please enter a name:"), function(value) {
		if (filenameValid(value)) {
			if (liquidsExist) {
				$.ajax(ajaxPrefix + "rr_mkdir?dir=" + encodeURIComponent("0:/materials/liquids/" + value), {
					dataType: "json",
					success: function(response) {
						if (response.err == 0) {
							uploadTextFile("0:/materials/liquids/" + value + "/load.g", "", undefined, false);
							uploadTextFile("0:/materials/liquids/" + value + "/unload.g", "", undefined, false);
							updateLiquids();
						} else {
							showMessage("warning", T("Error"), T("Could not create this directory!"));
						}
					}
				});
			} else {
				$.ajax(ajaxPrefix + "rr_mkdir?dir=0:/materials/liquids", {
					dataType: "json",
					success: function(response) {
						if (response.err == 0) {
							$.ajax(ajaxPrefix + "rr_mkdir?dir=" + encodeURIComponent("0:/materials/liquids/" + value), {
								dataType: "json",
								success: function(response) {
									if (response.err == 0) {
										uploadTextFile("0:/materials/liquids/" + value + "/load.g", "", undefined, false);
										uploadTextFile("0:/materials/liquids/" + value + "/unload.g", "", undefined, false);
										updateLiquids();
									} else {
										showMessage("warning", T("Error"), T("Could not create this directory!"));
									}
								}
							});
						}
					}
				});
			}
		} else {
			showMessage("danger", T("Error"), T("The specified filename is invalid. It may not contain quotes, colons or (back)slashes."));
		}
	});
});

function updateLiquids() {
	clearLiquids();
	if (!isConnected) {
		$(".span-refresh-materials").addClass("hidden");
		return;
	}

	// Is the macro volume mounted?
	if ((mountedVolumes & (1 << 0)) == 0) {
		// No - stop here
		clearLiquids();
		return;
	}

	// Yes - fetch the filelist for the current directory and proceed
	stopUpdates();
	getLiquids(0);
}

function getLiquids(first) {
	if(first === undefined)
		return;
	$.ajax(ajaxPrefix + "rr_filelist?dir=0:/materials/liquids&first=" + (first != undefined ?first:0), {
		dataType: "json",
		success: function(response) {
			if (isConnected) {
				if (response.hasOwnProperty("err")) {
					// don't proceed if the firmware has reported an error
					liquidsExist = false;
					$("#page_liquids h1").text(T("Failed to retrieve Liquids"));
					startUpdates();
				} else {
					var files = response.files, liquidsAdded = 0;
					for(var i = 0; i < files.length; i++) {
						if (files[i].type == 'd') {
							var dateCreated = files[i].hasOwnProperty("date") ? strToTime(files[i].date) : undefined;
							addLiquid(files[i].name, dateCreated);
							liquidsAdded++;
						}
					}

					if (response.next != 0 && !compatibilityMode) {
						getLiquids(response.next);
					} else {
						if (liquidsAdded == 0) {
							$("#page_liquids h1").text(T("No Liquids found"));
						} else {
							sortTable($("#table_liquids"));
						}

						if (currentPage == "liquids") {
							$(".span-refresh-liquids").removeClass("hidden");
						}

						liquidsLoaded = true;
						liquidsExist = true;
						startUpdates();
					}
				}
			}
		}
	});
}

function addLiquid(name, dateCreated) {
	$("#page_liquids h1").addClass("hidden");
	$("#table_liquids").removeClass("hidden");

	var dateCreatedValue = (dateCreated == undefined) ? 0 : dateCreated.getTime();
	var row =	'<tr data-liquid="' + name + '" data-date-created="' + dateCreatedValue + '">';
	row +=		'<td><input type="checkbox"></td>';
	row +=		'<td><a href="#" class="a-liquid"><span class="glyphicon glyphicon-tint"></span> ' + name + '</a></td>';
	row +=		'<td>' + ((dateCreated == undefined) ? T("unknown") : dateCreated.toLocaleString()) + '</td>';
	row +=		'</tr>';
	$("#table_liquids > tbody").append(row);
}

function clearLiquids() {
	liquidsLoaded = false;
	liquidsExist = false;

	$("#table_liquids > thead input[type='checkbox']:first-child").prop("checked", false);
	$("#table_liquids > tbody").children().remove();
	$("#table_liquids").addClass("hidden");
	$("#page_liquids h1").removeClass("hidden");
	if (isConnected) {
		if ((mountedVolumes & (1 << 0)) == 0) {
			$("#page_liquids h1").text(T("The first volume is not mounted"));
		} else {
			$("#page_liquids h1").text(T("loading"));
		}
	} else {
		$("#page_liquids h1").text(T("Connect to your Duet to display Liquids"));
	}
}

$("#table_liquids > tbody").on("click", ".a-liquid", function(e) {
	e.preventDefault();
});

/* Common functions */

function deleteMaterial(material, elementToRemove) {
	multiFileOperations.push({
		action: "delete",
		elementToRemove: elementToRemove,
		material: material,
		type: "material"
	});
	doFileTask();
}

function deleteFilament(filament, elementToRemove) {
	multiFileOperations.push({
		action: "delete",
		elementToRemove: elementToRemove,
		filament: filament,
		type: "filament"
	});
	doFileTask();
}

function deleteLiquid(liquid, elementToRemove) {
	multiFileOperations.push({
		action: "delete",
		elementToRemove: elementToRemove,
		liquid: liquid,
		type: "liquid"
	});
	doFileTask();
}