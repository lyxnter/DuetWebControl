<style scoped>
/* This container is needed to position the front and back side */
.v-card__text{
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.5s;
  transform-style: preserve-3d;
  padding: 5px;
}

.v-icon {
  font-size: 18px;
}

p {
  margin-top:15px;
  margin-bottom: auto;
}

.v-input--switch, .v-btn {
  margin: 6px 5px;
  text-transform: none !important;
}

</style>
<template>
  <v-card class="card z_probe_offset">
    <v-card-title>
      <span>Z Probe Offset</span>
    </v-card-title>
    <v-card-text>
      <p> Offset <b>Z</b> :
        <input style="width: 50px; height: 20px;text-align: center; border: 1px solid black; border-radius: 4px;"
        class="span_probe_offset"
        axis="z"
        autocomplete="off"
        type="number"
        :value="probeOffset"
        step="0.01"
        @keypress="keypressOffsetEvent"
        @blur="blurOffsetEvent"/> mm<br/>
        <span style="color: darkgray">Tool trigger height</span>
      </p>
      <v-flex row>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn class="btn_tilt" axis="z" dir="d" v-on="on" @click="clickBtnOffset">
            <span class="content">-0.01mm</span>
            <v-icon> arrow_downward </v-icon>
          </v-btn>
        </template>
        <span> Decrease Z probe offset (G10 Zxxx) </span>
      </v-tooltip>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn class="btn_tilt" axis="z" dir="u" v-on="on" @click="clickBtnOffset">
            <span class="content">+0.01mm</span>
            <v-icon> arrow_upward </v-icon>
          </v-btn>
        </template>
        <span> Increase Z probe offset (G10 Zxxx) </span>
      </v-tooltip>
    </v-flex>
      <br/>
    </v-card-text>
  </v-card>
</template>
<script>
'use strict'

import { mapActions } from 'vuex'
export default {
  data () {
    return {
      zOffset: undefined,
      probeOffset: 0,
      toolPath: {}
    }
  },
  methods: {
    ...mapActions('machine', ['getFileList', 'sendCode', 'download', 'upload']),
    clickBtnOffset: function(e) {
      e.preventDefault();
      clearTimeout(this.zOffset);
      let that = e.target;
      while (that.nodeName.toLowerCase() !== "button")
      that = that.parentElement;
      that = that.attributes;
      //var axis = that.axis.value;
      var dir = that.dir.value;
      this.probeOffset += (dir == "d"? -0.01 : 0.01);
      this.zOffset = setTimeout(this.sendToolOffset, 1000);
    },
    keypressOffsetEvent: function(e) {
      console.log(e.keyCode);
      if( e.which == 13 || e.keyCode == 13 ) {
        console.log(e);
        e.target.blur()
        e.preventDefault();
      }
    },
    blurOffsetEvent: function(e) {
      e.preventDefault();
      clearTimeout(this.zOffset);
      //var prct = e.target.value;
      //var axis = e.target.attributes.axis.value;
      this.zOffset = setTimeout(this.sendToolOffset, 1000);
      e.preventDefault();
    },
    preloadToolMatrices: async function() {
      console.log('load the cfg file');
      try {
        // Load file list and create missing props
        const files = await this.getFileList("0:/macros/_Tools");
        let that = this;
        files.forEach(function(item) {
          if (item.isDirectory)
          {
            //console.log(item);
            that.preloadToolMatrix(item.directory + "/" + item.name)
          }
        });
      } catch(e) {
        console.error(e);
      }
    },
    preloadToolMatrix: async function(path){
      try {
        const files = await this.getFileList(path);
        //console.log(files);
        let that = this;
        files.forEach(function (file) {
          if(file != undefined && file.name.includes("Nozzle")) {
            var toolName = path.substring(path.lastIndexOf("/")+1);
            //console.log("name: " + toolName)
            //console.log( that.toolPath[toolName]);
            //console.log("path+name: " + path+"/"+file.name);
            if(file.name.includes("HF")) {
              if(that.toolPath[toolName+"_HF"] === undefined)
              that.toolPath[toolName+"_HF"] = {};
              that.toolPath[toolName+"_HF"].calibration = toolName+"/"+file.name;
              that.loadToolOffset(toolName+"_HF");
            } else if(file.name.includes("MF")) {
              if(that.toolPath[toolName+"_MF"] === undefined)
              that.toolPath[toolName+"_MF"] = {};
              that.toolPath[toolName+"_MF"].calibration = toolName+"/"+file.name;
              that.loadToolOffset(toolName+"_MF");
            } else {
              if(that.toolPath[toolName] === undefined)
              that.toolPath[toolName] = {};
              that.toolPath[toolName].calibration = toolName+"/"+file.name;
              that.loadToolOffset(toolName);
            }
          }
        });
      } catch(e) {
        console.error(e);
      }
    },
    loadToolOffset: async function(toolName){
      const filename = "0:/macros/_Tools/" + this.toolPath[toolName].calibration;
      const result = await this.download({ filename, type: 'text', showSuccess: false });
      let data = result.split("\n");
      this.toolPath[toolName].fileContent = [];
      var indexB4 = 0;
      var lines = [];
      //var offsets = [];
      var toolNum;
      var tools = [];
      var tHeadPos = {x: undefined, y: undefined, z: undefined};
      this.toolPath[toolName].fileContent[0] = "";
      for( var i = 0; i < data.length; i++) {
        if ( data[i].startsWith("M585")) {
          lines.push(data[i]);
          if (this.toolPath[toolName].fileContent[indexB4] != "") {
            indexB4 ++ ;
            this.toolPath[toolName].fileContent[indexB4] = "";
          }
        } else if (data[i].startsWith("G1") || data[i].startsWith("G10")) {
          lines.push(data[i]);
          this.toolPath[toolName].fileContent[indexB4] += data[i] + "\n";
        } else if (i < data.length-1 || data[i] !== ""){
          this.toolPath[toolName].fileContent[indexB4] += data[i] + "\n";
        }
      }
      for (i = 0; i < lines.length; i++)
      {
        var line = lines[i].substring(0, lines[i].indexOf(";")).split(" ");
        for( var j = 0; j < line.length; j++)
        {
          if (line[0] === "G1"){
            switch (line[j][0]) {
              case "X":
              tHeadPos.x = parseFloat(line[j].substring(1));
              break;
              case "Y":
              tHeadPos.y = parseFloat(line[j].substring(1));
              break;
              case "Z":
              tHeadPos.z = parseFloat(line[j].substring(1));
              break;
              default:
              break;
            }
          } else if (line[0] === "G10"){
            if (line[j].includes("P")) { //Tool number
              toolNum = parseInt(line[j].substring(1));
              if (tools[toolNum] == undefined) {
                //console.log("tool " + parseInt(line[j].substring(1)) +" found");
                tools[toolNum] = {};
              }
            }else if(line[j].includes("U")) { // axis U-W
              //console.log("offset X of tool " + toolNum + " = "+ parseFloat(line[j].substring(1)));
              tools[toolNum].u = parseFloat(line[j].substring(1));
            } else if(line[j].includes("V")) {
              //console.log("offset Y of tool " + toolNum + " = "+ parseFloat(line[j].substring(1)));
              tools[toolNum].v = parseFloat(line[j].substring(1));
            } else if(line[j].includes("W")) {
              //console.log("offset Z of tool " + toolNum + " = "+ parseFloat(line[j].substring(1)));
              tools[toolNum].w = parseFloat(line[j].substring(1));
            } else if(line[j].includes("X")) { // axis X-Z
              //console.log("offset X of tool " + toolNum + " = "+ parseFloat(line[j].substring(1)));
              tools[toolNum].x = parseFloat(line[j].substring(1));
            } else if(line[j].includes("Y")) {
              //console.log("offset Y of tool " + toolNum + " = "+ parseFloat(line[j].substring(1)));
              tools[toolNum].y = parseFloat(line[j].substring(1));
            } else if(line[j].includes("Z")) {
              //console.log("offset Z of tool " + toolNum + " = "+ parseFloat(line[j].substring(1)));
              tools[toolNum].z = parseFloat(line[j].substring(1));
            } else if(line[j].includes("S")) {
              //console.log("default active temp of tool " + toolNum + " = " + parseFloat(line[j].substring(1)));
              tools[toolNum].s = parseFloat(line[j].substring(1));
            } else if(line[j].includes("R")) {
              //console.log("default stanby temp of tool " + toolNum + " = " + parseFloat(line[j].substring(1)));
              tools[toolNum].r = parseFloat(line[j].substring(1));
            }
          } else if (line[0] === "M585") {
            if (line[j].includes("Z")) {
              //console.log("T"+toolNum+": "+tHeadPos.toSource());
              //console.log("probe offset = " + (tHeadPos.z + parseFloat(line[j].substring(1))) + "mm");
              this.probeOffset = (tHeadPos.z + parseFloat(line[j].substring(1)));
              //console.log($(".span_probe_offset")[0])
              //$(".span_probe_offset")[0].value = that.probeOffset;
              //$(".btn_probe_offset").prop("disabled", false);
            }
          }
        }
      }
      //makeTools();
    },
    sendToolOffset: function() {
      var keys = Object.keys(this.toolPath);
      //console.log(keys);
      var key = 0;
      let inter = setInterval(function(that) {
        var out = "";
        var toolName = keys[key];
        if (key >= keys.length)
          clearInterval(inter)
        else
          key++
        //console.log(toolName);
        var fileContent = that.toolPath[toolName].fileContent;
        for (var i = 0; i < fileContent.length; i++)
        {
          var from = Math.max(fileContent[i].lastIndexOf("\nG1 ")+1, 0);
          var g10 = fileContent[i].substring(from);
          var to = fileContent[i].substring(from).indexOf("\n");
          out += fileContent[i];
          if (from > 0 && to > 0) {
            //console.log(from + ", " + (from+to));
            //console.log(fileContent[i].substr(from, to+1));
            g10 =  fileContent[i].substr(from, to+1);
            var end = (	g10.substring(g10.indexOf("Z")).indexOf(" ") > 0 ?
            g10.substring(g10.indexOf("Z")).indexOf(" ") :
            g10.substring(g10.indexOf("Z")).indexOf("\t")) - 1;
            //console.log(end)
            //console.log(g10.substr(g10.indexOf("Z")+1, end))
            var myZ = parseFloat(g10.substr(g10.indexOf("Z")+1, end));
            //console.log(myZ);
            if(!isNaN(myZ)) {
              //console.log((probeOffset-myZ).toFixed(2));
              out += "M585 Z"+ (that.probeOffset-myZ).toFixed(2) +" E8 L0 F100 S1	; Move the tool down (Z-) until triggering the probing tool\n";
            }
          }
        }
        out += (fileContent[fileContent.length-1] == undefined? "" : fileContent[fileContent.length-1] );
        //console.log(out);
        let filename = "0:/macros/_Tools/" + that.toolPath[toolName].calibration;
        let data =  out;
        const content = new Blob([data]);
        try {
          that.upload({filename: filename, content});
          console.log("file saved");
        } catch (e) {
          console.log("Error: no such file/not mounted");
          console.error(e);// TODO Optionally ask user to save file somewhere else
        }
      },250, this);
    },
  },
  mounted() {
    setTimeout(this.preloadToolMatrices, 1000*Math.random());
  },
}
</script>
