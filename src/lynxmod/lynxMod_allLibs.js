/** LYNXMOD **/
$(".btn_arrange_gcode").click(function(event){
	$(".btn_arrange_gcode").removeClass("active");
	this.classList.add("active");
	//console.log("clicked");
	//console.log(this);
	console.log(event);
	gcodeUpdateIndex = -1;
	updateGCodeFiles();
})

$("#btn_check_updates").click(function(e){ e.stopPropagation(); checkForUpdates(true);});
$("#btn_do_update").click(function(e){ e.stopPropagation(); doUpdate(true)});

function doUpdate(manual){
	for (elem in updateLinks)
	{
		if(manual || true){
			var popunder = window.open( updateLinks[elem].download_url);
			if(popunder)
			popunder.blur();
			window.focus();
		} else {
			console.log("getting " + updateLinks[elem].url);
			$.ajaxSetup({
				   headers:{
					   "Accept":  "application/octet-stream"
				   }
				});
			$.get(updateLinks[elem].url, null, function(res){console.log(res)})
			const req = new XMLHttpRequest();
			req.onreadystatechange = function(event) {
			    // XMLHttpRequest.DONE === 4
			    if (this.readyState === XMLHttpRequest.DONE) {
			    	if(req.status === 200){
						console.log("ok " + req.responseText);

						console.log("posting " +res + " to "+ ajaxPrefix+"rr_upload?name=0:/sys/" + updateLinks[elem].name + "&time="+updateLinks[elem].updated)
						//$.post(ajaxPrefix+"rr_upload?name=0:/sys/" + updateLinks[elem].name + "&time="+updateLinks[elem].updated, res)
					} else {
						console.log("Status de la réponse: %d (%s)", req.status, req.statusText);
					}
				}
			    if(this.readyState == this.HEADERS_RECEIVED) {
			        console.log(req.getResponseHeader("Location"));
			    }
			    console.log(req);
			}
			//req.open("GET", updateLinks[elem].url+"?access_token=30d3a7f0ebe4bb3c2077ce47c978f193c5442698", true);
			//req.setRequestHeader("Accept", "application/octet-stream");
			//req.withCredentials = true;
			//req.send(null);
		}
	}
}

$("#btn_add_user").click(function(e){
	e.stopPropagation();
	if(!$("#btn_add_user").hasClass("disabled"))
	{
		usersList.push({
			name: $("#userName").val(),
			id: $("#userLogin").val(),
			rank: $("#userType").val(),
		});
		updatePrivileges();
		create_key(usersList.length-1, $("#userPswd").val()).then(function(){
		$.ajax(ajaxPrefix + "rr_upload?name=" + encodeURIComponent("0:/sys/usersList.json") + "&time=" + encodeURIComponent(timeToStr(new Date())), {
			data: JSON.stringify(usersList),
			dataType: "json",
			processData: false,
			contentType: false,
			timeout: 0,
			type: "POST",
			global: false,
		});},
		function(e)
		{
			console.log(e)
		});
	}
})


/**
 * LineReader
 * https://github.com/mgmeyers/LineReader
 *
 * Copyright 2014 Matthew Meyers <hello@matthewmeye.rs>
 * Released under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 */
var LineReader=function(e){if(!(this instanceof LineReader))return new LineReader(e);var n=this._internals={},t=this;n.reader=new FileReader,n.chunkSize=e&&e.chunkSize?e.chunkSize:1024,n.events={},n.canRead=!0,n.reader.onload=function(){if(n.chunk+=this.result,/\r|\n/.test(n.chunk))n.lines=n.chunk.match(/[^\r\n]+/g),t._hasMoreData()&&(n.chunk="\n"===n.chunk[n.chunk.length-1]?"":n.lines.pop()),t._step();else{if(t._hasMoreData())return t.read();if(n.chunk.length)return t._emit("line",[n.chunk,t._emit.bind(t,"end")]);if(t._internals.canRead)t._emit("end")}},n.reader.onerror=function(){t._emit("error",[this.error])}};LineReader.prototype.on=function(e,n){this._internals.events[e]=n},LineReader.prototype.read=function(e){var n=this._internals;void 0!==e&&(n.file=e,n.fileLength=e.size,n.readPos=0,n.linepos=0,n.chunk="",n.lines=[]);var t=n.file.slice(n.readPos,n.readPos+n.chunkSize);n.linePos=n.readPos,n.readPos+=n.chunkSize,n.reader.readAsText(t)},LineReader.prototype.abort=function(){this._internals.canRead=!1; this._emit("abort", ["user aborted"])},LineReader.prototype._step=function(){var e=this._internals;if(0===e.lines.length)return this._hasMoreData()?this.read():this._emit("end");e.canRead?(this._emit("line",[e.lines.shift(),this._step.bind(this)]),e.linePos+=e.lines[0]?e.lines[0].length:0):this._emit("end")},LineReader.prototype._hasMoreData=function(){var e=this._internals;return e.readPos<=e.fileLength},LineReader.prototype._emit=function(e,n){var t=this._internals.events;"function"==typeof t[e]&&t[e].apply(this,n)},LineReader.prototype.GetReadPos=function(){return this._internals.linePos};

/* img to Blob*/
function b64toBlob(e,t,n){t=t||"",n=n||512;for(var o=atob(e),r=[],a=0;a<o.length;a+=n){for(var l=o.slice(a,a+n),i=new Array(l.length),s=0;s<l.length;s++)i[s]=l.charCodeAt(s);var c=new Uint8Array(i);r.push(c)}return new Blob(r,{type:t})}
var savePicture=function(e,t){document.getElementById("myAwesomeForm");var n=e.split(";"),o=n[0].split(":")[1],r=b64toBlob(n[1].split(",")[1],o);var f = fileInput.name.substring(0,fileInput.name.lastIndexOf("."));while(f.includes(" ")||t.includes(" ")){f=f.replace(" ","_");t=t.replace(" ","_");}$.ajax({url:ajaxPrefix+"rr_upload?name=0:/www/img/GCodePreview/"+f+"/"+t+"&time="+encodeURIComponent(timeToStr(new Date)),data:r,type:"POST",contentType:!1,processData:!1,cache:!1,dataType:"json",async:0,error:function(e){console.error(e)},success:function(e){/*console.log(e)*/},complete:function(){console.log("Request finished.")}})};

function getPicture(url, name, pic, size, nbTry) // new feature already deprecated
{
	while (url.includes(" ") || name.includes(" "))
	{
		url = url.replace(" ", "_");
		name = name.replace(" ", "_");
	}
	$.get(ajaxPrefix + "rr_filelist?dir=" + url + "&first=0",
		function(data, status)
		{
			var xhr = new XMLHttpRequest();
			 xhr.onreadystatechange = function() {
				 //console.log(name+": "+this.readyState + ", " +this.status)
			      if (this.readyState == 4 && this.status == 200)
			      {
			    	  //console.log(this.response)
			    	  var res = this.response;
			          var reader = new window.FileReader();
			          reader.readAsDataURL(res);
			          reader.onloadend = function() {
			        	  if(pic)
			        	  {
			        	  	pic.src = reader.result;
			        	  	pic.alt = name;
			        	  	pic.height = size;
			        	  	pic.width = size;
			        	  }
			          }
			      }
				 if (this.readyState == 4 && this.status == 0) {
					 if (nbTry != 5)
					{
						 nbTry = (nbTry?nbTry+1: 1);
		        		 getPicture(url, name, pic, size, nbTry);
					}
				 }
			 }
			 xhr.responseType = 'blob';
			if (data.files.length >= 2 )
			{
				xhr.open("GET", ajaxPrefix + "rr_download?name=" + url + "/" + name);
			} else {
				xhr.open("GET", ajaxPrefix + "rr_download?name=0/www/img/GCodePreview/empty_bp.jpg");
			}
			xhr.send();
		}
	);
}

function deletePicture(name)
{
	var dir = name.substring(0, name.lastIndexOf("."));
	var url = "0:/www/img/GCodePreview/" + dir;
	while (url.includes(" ") || dir.includes(" "))
	{
		url = url.replace(" ", "_");
		dir = dir.replace(" ", "_");
	}
	$.get(ajaxPrefix + "rr_filelist?dir=" + url + "&first=0",
		function(data, status)
		{
			for(var file in data.files)
			{
				$.get(ajaxPrefix + "rr_delete?name=" + url + "/" + data.files[file].name, function(data, status){}, false);
			}
			$.get(ajaxPrefix + "rr_delete?name=" + url, function(data, status){}, false);
		}
	);
}

function toHMS(r,e){var n=r%60,t=(r=(r-n)/60)%60,a=(r=(r-t)/60)%24,u=r=(r-a)/24;if(e){var c=u+"d "+a+"h "+t+"m "+n+"s";return c=c.replace(/(?:0. )+/,"")}return{d:u,h:a,m:t,s:n}}

initScene();
