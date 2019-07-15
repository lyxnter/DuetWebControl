<style scoped>
  .toff {
    padding: 0 10px;
    text-align: center;
    border-right: 1px solid darkgray;
    display: inline-block;
    min-width: 200px;
  }
  .toff input, .tool_offset {
    width: 50px;
    height: 20px;
    text-align: center;
    border: 1px solid black;
    border-radius: 4px;
  }

  .layout.row {
    margin: 0 auto;
  }
</style>

<template class="panel panel-default">
  <v-card>
    <v-card-title class="panel-heading">
      <span>X-Y Tool Offset</span>
    </v-card-title>
    <v-card-text class="panel-body">
      <v-flex style="display: inline-flex; width: 100%;">
        <span class="input-group-text" id="basic-addon1" style="font-size: 18px; margin-top: 16px; margin-right: 20px;">Tool : </span>
        <v-select v-model="select" id="hname" :items="tools" :rules="[]" required style="width: 80%" @change="loadToolMatrix">
        </v-select>
      </v-flex>
      <br/>
      <v-layout row wrap style="width: max-content">
        <v-layout column shrink v-for="(tool, index) in toolHeads" style="border-right: 1px solid black; margin: 5px; text-align: center; background: #505050;" v-if="!tool.hide">
          <v-layout row>
            Offset:&nbsp;<strong> T{{tool.t}}</strong>
            <span style="color: darkgray;" v-for="sec in tool.sec">
                , T{{toolHeads[sec].t}}
            </span>
          </v-layout>
          <v-layout column>
            <v-layout row>
              Offset X&nbsp; <input class="tool_offset" autocomplete="off" type="number" :value="(relative?(tool.x-toolHeads[0].x):tool.x)" step="0.01" off="x" :tnum="index" v-bind:class="{disabled: (index == 0)}"/>&nbsp;mm
            </v-layout>
            <v-flex row>
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-btn class="btn_tilt" off="x" :tnum="index" dir="d" v-on="on" @click="handleBtnOffsetEvent" v-bind:class="{'v-btn--disabled': (index == 0 && relative)}">
                    <span class="content">-0.01mm</span>
                    <v-icon> arrow_left </v-icon>
                  </v-btn>
                </template>
                <span> Offsets the tool head by a tiny amount in the X direction (G10 Px Xyy) </span>
              </v-tooltip>
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-btn class="btn_tilt" off="x" :tnum="index" dir="u" v-on="on" @click="handleBtnOffsetEvent" v-bind:class="{'v-btn--disabled': (index == 0 && relative)}">
                    <span class="content">+0.01mm</span>
                    <v-icon> arrow_right </v-icon>
                  </v-btn>
                </template>
                <span> Offsets the tool head by a tiny amount in the X direction (G10 Px Xyy) </span>
              </v-tooltip><br/>
            </v-flex>
            <v-flex column>
              Offset Y <input class="tool_offset" autocomplete="off" type="number" :value="(relative?(tool.y-toolHeads[0].y):tool.y)" step="0.01" off="y" :tnum="index" tsec="{2}"/>&nbsp;mm
              <v-flex row>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-btn class="btn_tilt" off="y" :tnum="index" dir="d" v-on="on" @click="handleBtnOffsetEvent"v-bind:class="{'v-btn--disabled': (index == 0 && relative)}">
                      <span class="content">-0.01mm</span>
                      <v-icon> arrow_left </v-icon>
                    </v-btn>
                  </template>
                  <span> Offsets the tool head by a tiny amount in the Y direction (G10 Px Yyy) </span>
                </v-tooltip>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-btn class="btn_tilt" off="y" :tnum="index" dir="u" v-on="on" @click="handleBtnOffsetEvent" v-bind:class="{'v-btn--disabled': (index == 0 && relative)}">
                      <span class="content">+0.01mm</span>
                      <v-icon> arrow_right </v-icon>
                    </v-btn>
                  </template>
                  <span> Offsets the tool head by a tiny amount in the Y direction (G10 Px Xyy) </span>
                </v-tooltip>
              </v-flex>
            </v-flex>
          </v-layout>
        </v-layout>
      </v-layout>
      <div style=" display: flex; width: max-content; margin: 0 auto;" v-if="toolHeads.length>0">
        <span style="margin-top: 20px"><b> Absolute </b> tools offsets</span>
        <v-switch hide-details class="ml-1" v-model="relative"></v-switch>
        <span style="margin-top: 20px"><b> Relative </b> to <b> T{{toolHeads[0].t}} </b> tools offsets</span>
      </div>
    </v-card-text>
  </v-card>
</template>
<script>
'use strict'

import { mapActions } from 'vuex'
export default {
  data () {
    return {
      select: undefined,
      relative: false,
      b4: "",
      tools: [],
      toolHeads: [],
      toolPath: {},
      xyToolOffset: undefined,
    }
  },
  methods: {
    ...mapActions('machine', ['getFileList', 'sendCode', 'download', 'upload']),
    preloadToolMatrices: async function() {
      console.log('load the cfg file');
      try {
        this.tools = [];
        // Load file list and create missing props
        const files = await this.getFileList("0:/macros/_Tools");
        let that = this;
        let inter = setInterval(function(files){
          if (files.length == 1)
          clearInterval(inter);
          let item = files.shift();
          if (item.isDirectory)
          {
            //console.log(item);
            that.preloadToolMatrix(item.directory + "/" + item.name)
          }
        }, 500, files);

      } catch(e) {
        console.error(e);
      }
    },
    preloadToolMatrix: async function(path){
      try {
        const files = await this.getFileList(path);
        //console.log(files);
        let that = this;
        let inter = setInterval(function(files){
          if (files == undefined || files.length == 1)
          clearInterval(inter);
          let file = files.shift();
          //console.log(file);
          if(file != undefined && file.name.includes("Toolmatrix")){
            //console.log(file);
            var toolName = file.name.substring(11);
            if (toolName.includes("."))
            toolName = toolName.substring(0, toolName.indexOf("."));
            if(that.toolPath[toolName] === undefined)
            that.toolPath[toolName] = {};
            if(that.toolPath[toolName].matrix === undefined) {
              that.tools.push(toolName);
            }
            that.toolPath[toolName].matrix = path.substring(path.lastIndexOf("/")+1)+"/"+file.name;

            that.tools = that.tools.sort();
            //console.log(that.tools.toSource())
          }
        }, 125, files);
        //console.log(files.filter(file => file.name.includes("Toolmatrix")))
        if(files.length === 1) {
          loadToolMatrix(toolName);
          //$("#hname").prop("value", toolName);
          //$("#hname").data("tool" , toolName);
        }
      } catch(e) {
        console.error(e);
      }
    },
    loadToolMatrix: async function() {
      //isHF = false;
      console.log(this.select);
      let targetMatrix = this.select.toString();
      console.log(this.toolPath[targetMatrix])
      this.b4 = [];
      let toolHeads = [];
      let filename = ("0:/macros/_Tools/"+this.toolPath[targetMatrix].matrix);
      let result = await this.download({ filename, type: 'text', showSuccess: false });
      let data = result.split("\n");
      this.b4[0] = "";
      let indexB4 = 0;
      var lines = [];
      let toolNum = -1;
      for( var i = 0; i < data.length; i++)
      {
        if (data[i].includes("G10") || data[i].includes("M563")) {
          lines.push(data[i]);
          if (this.b4[indexB4] != "") {
            indexB4 ++ ;
            this.b4[indexB4] = "";
          }
        } else if (data[i] !== "" && data[i] !== "\n"){
          this.b4[indexB4] += data[i] + "\n";
        }
      }
      for (var i = 0; i < lines.length; i++)
      {
        var line = lines[i].substring(0, lines[i].indexOf(";")).split(" ");
        for( var j = 0; j < line.length; j++)
        {
          if (line[0] === "G10"){
            if (line[j].includes("P")) { //Tool number
              if ((toolHeads[toolNum] == undefined) || (toolHeads[toolNum+1] == undefined && toolHeads[toolNum].t !== parseInt(line[j].substring(1)))) {
                toolNum++;
                console.log("G10: tool " + parseInt(line[j].substring(1)) +" found");
                toolHeads[toolNum] = {};
                toolHeads[toolNum].t = parseInt(line[j].substring(1))
              }
            } else if(line[j].includes("U")) { // axis U-W
              //console.log("offset X of tool " + toolHeads[toolNum].t + " = "+ parseFloat(line[j].substring(1)));
              toolHeads[toolNum].u = parseFloat(line[j].substring(1));
            } else if(line[j].includes("V")) {
              //console.log("offset Y of tool " + toolHeads[toolNum].t + " = "+ parseFloat(line[j].substring(1)));
              toolHeads[toolNum].v = parseFloat(line[j].substring(1));
            } else if(line[j].includes("W")) {
              //console.log("offset Z of tool " + toolHeads[toolNum].t + " = "+ parseFloat(line[j].substring(1)));
              toolHeads[toolNum].w = parseFloat(line[j].substring(1));
            } else if(line[j].includes("X")) { // axis X-Z
              //console.log("offset X of tool " + toolHeads[toolNum].t + " = "+ parseFloat(line[j].substring(1)));
              toolHeads[toolNum].x = parseFloat(line[j].substring(1));
            } else if(line[j].includes("Y")) {
              //console.log("offset Y of tool " + toolHeads[toolNum].t + " = "+ parseFloat(line[j].substring(1)));
              toolHeads[toolNum].y = parseFloat(line[j].substring(1));
            } else if(line[j].includes("Z")) {
              //console.log("offset Z of tool " + toolHeads[toolNum].t + " = "+ parseFloat(line[j].substring(1)));
              toolHeads[toolNum].z = parseFloat(line[j].substring(1));
            } else if(line[j].includes("S")) {
              //console.log("default active temp of tool " + toolHeads[toolNum].t + " = " + parseFloat(line[j].substring(1)));
              toolHeads[toolNum].s = parseFloat(line[j].substring(1));
            } else if(line[j].includes("R")) {
              //console.log("default stanby temp of tool " + toolHeads[toolNum].t + " = " + parseFloat(line[j].substring(1)));
              toolHeads[toolNum].r = parseFloat(line[j].substring(1));
            }
          } else if (line[0] === "M563") {
            if (line[j].includes("P")) {
              if ((toolHeads[toolNum] == undefined) || (toolHeads[toolNum+1] == undefined && toolHeads[toolNum].t !== parseInt(line[j].substring(1)))) {
                toolNum++;
                console.log("M563: tool " + parseInt(line[j].substring(1)) +" found");
                toolHeads[toolNum] = {};
                toolHeads[toolNum].t = parseInt(line[j].substring(1))
              }
            } else if ( line[j].includes("S")) {
              var open = -1;
              var close = -1;
              do {
                if (open < 0) {
                  open = line[j].indexOf("\"");
                  if (open < line[j].lastIndexOf("\"")){ // IE there is a second " after the first one ex( "A+B")
                  close = line[j].lastIndexOf("\"");
                  toolHeads[toolNum].e = line[j].substring(open+1, close)
                } else {
                  toolHeads[toolNum].e = line[j].substring(open+1);
                }
              } else if (line[j].indexOf("\"") >= 0){ // we found the closing "
              close  = line[j].indexOf("\"");
              toolHeads[toolNum].e += " " + line[j].substring(0,close)
            } else {
              toolHeads[toolNum].e += " " + line[j]
            }
            j++;
          } while (close < 0);
          j--;
          //console.log("tool " + toolHeads[toolNum].t +" named: " + toolHeads[toolNum].e);
        } else if (line[j].includes("D")) {
          //console.log("tool " + toolHeads[toolNum].t + " drive " + parseFloat(line[j].substring(1)));
          var drives = line[j].substring(1).split(":")
          for(var k = 0; k < drives.length; k++)
          drives[k] = parseFloat(drives[k]);
          toolHeads[toolNum].d = drives;
        } else if (line[j].includes("H")) {
          //console.log("tool " + toolHeads[toolNum].t + " heater " + parseFloat(line[j].substring(1)));
          var heaters = line[j].substring(1).split(":")
          for(var k = 0; k < heaters.length; k++)
          heaters[k] = parseFloat(heaters[k]);
          toolHeads[toolNum].h = heaters;
        } else if (line[j].includes("F")) {
          //console.log("fan " + parseFloat(line[j].substring(1)) + "maped to tool " + toolHeads[toolNum].t);
          toolHeads[toolNum].f = parseFloat(line[j].substring(1));
        } else if (line[j].includes("L")) {
          toolHeads[toolNum].l = parseFloat(line[j].substring(1));
        }
      }
    }
      }
      this.makeTools(toolHeads);
      //console.log("done")
      //console.log(toolHeads);
    },
    handleBtnOffsetEvent: function(e) {
      let that = e.target;
      while (that.nodeName.toLowerCase() !== "button") {
        that = that.parentElement;
      }
      e.preventDefault();
      if(!that.classList.contains("disabled") && this.tools.length > 0)
      {
        let attr = that.attributes;
        var first = 0;
        while (this.tools[first] === undefined && this.tools.length > 0)
        {
          first++;
        }
        var offset = (parseFloat(that.innerText) + this.toolHeads[attr.tnum.value][attr.off.value])
        clearTimeout(this.xyToolOffset);
        console.log(offset);
        this.toolHeads[attr.tnum.value][attr.off.value] = offset;
        /*for (var i = 0; i < this.toolHeads.length; i++)
        {
          this.sendCode("G10 P" + i + " X" + that.toolHeads[i].x + " Y" + that.toolHeads[i].y);
        }*/
        this.xyToolOffset = setTimeout(this.sendToolMatrix, 1000, attr.tnum.value)
      }
    },
    handleToolOffsetBlurEvent: function(e) {
      e.preventDefault();
      if (tools.length > 0 && this.style.border !== "none") {
        var absolute = $("#relative").prop("checked");
        var off = $(this).attr('off');
        var tnum = $(this).attr('tnum');
        var tsec = [];
        var first = 0;
        while(tools[first] === undefined)
        {
          first++;
        }
        $(this).attr('tsec').split(",").forEach(tool => tsec.push(parseInt(tool.substring(tool.indexOf("T")+1))));
        var offset = parseFloat($(this).prop("value"))
        var toolOffset = offset + (absolute?tools[first][(off.includes("X")?"x":"y")]:0)
        console.log(toolOffset);
        clearTimeout(xyToolOffset);
        tools[parseFloat(tnum.substring(1))][off.includes("X")?"x":"y"] = toolOffset;
        tsec.forEach(tool => tools[tool][off.includes("X")?"x":"y"] = toolOffset )
        $(this).prop("value", offset.toFixed(2))
        tools.forEach((tool, i) => sendGCode("G10 P" + i + " X" + tool.x.toFixed(2) + " Y" + tool.y.toFixed(2)));
        xyToolOffset = setTimeout(sendToolMatrix, 1000, $("#hname").data("tool"));
      }
    },
    makeTools: function(tools) {
      console.log('here');
      var isSec = [];
    	var first = 0;
    	while (tools[first] === undefined && tools.length > 0)
    	{
    		first++;
    	}
    	for(var i = 0; i < tools.length; i++) {
    		if (tools[i] !== undefined && isSec[i] === undefined) {
    			var heaters = tools[i].h;
    			var drives = tools[i].d;
    			var tsec = [];
    			for (var j = i+1; j < tools.length; j++) {
    				if (tools[j] === undefined)
    					break;
    				var wasSec = false;
    				if (tools[j].h !== undefined) {
    					for( var a = 0; a < tools[j].h.length; a++) {
    							if (heaters.includes(tools[j].h[a])) {
    									tsec.push(j);
    									isSec[j] = true;
    									wasSec = true;
    							}
    					}
    				}
    				if (wasSec)
    					break;
    				if (tools[j].d !== undefined) {
    					for( a = 0; a < tools[j].d.length; a++) {
    							if (drives.includes(tools[j].d[a])) {
    									tsec.push(j);
    									isSec[j] = true;
    							}
    					}
    				}
    			}
    			if(tsec.length)
    				tools[i].sec = tsec;
    		}
    	}
      tools.forEach((tool, index) => tool.hide = isSec[index])
      console.log(tools);
      this.toolHeads = tools;
    },
    sendToolMatrix: function(targetMatrix) {
  		var out = "";
      console.trace();
  		for (var i = 0; i < this.toolHeads.length; i++)
  		{
  			out += (this.b4[i] == undefined?"":this.b4[i]);
  			out += "M563 P"+ i + " S\"" + this.toolHeads[i].e + "\" D" + this.toolHeads[i].d + " H" + this.toolHeads[i].h + "\t\t\t; Define tool " + i + "\n";
  			out += "G10 P" + i + " X" + this.toolHeads[i].x.toFixed(2) + " Y" + this.toolHeads[i].y.toFixed(2) + " Z" + this.toolHeads[i].z.toFixed(2) + "\t\t; Set tool " + i + " axis offsets\n"
  			out += "G10 P" + i + " R" + this.toolHeads[i].r + " S" + this.toolHeads[i].s + "\t\t\t\t; Set initial tool " + i + " active and standby temperatures to " + this.toolHeads[i].s + "/" + this.toolHeads[i].r + "°C\n";
  		}
  		out += (this.b4[this.toolHeads.length] == undefined? "" : this.b4[this.toolHeads.length] );
      console.log(this.tools);
      let filename = "0:/macros/_Tools/" + this.toolPath[this.select].matrix;
      let data =  out;
      const content = new Blob([data]);
      try {
        this.upload({ filename: filename, content });
        console.log("file saved");
      } catch (e) {
        console.log("Error: " + (result.err == 1 ? "no such file" : "not mounted"));
        console.error(e);// TODO Optionally ask user to save file somewhere else
      }
    }
  },
  mounted() {
    console.log('load the cfg file');
    setTimeout(this.preloadToolMatrices, 1000*Math.random());
  },
  watch: {
    toolHeads: {
      deep: true,
      handler: function(newVal){
        //console.trace();
        console.log(newVal);
      }
    }
  }
}
</script>
