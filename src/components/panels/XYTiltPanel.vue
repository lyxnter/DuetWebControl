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

  .v-input--switch {
    margin: 0;
  }
</style>
<template>
  <v-card class="card x_y_tilt">
    <v-card-title>
      <span>X-Y Tilt Compensation</span>
    </v-card-title>
    <v-card-text>
      <template v-if="asDeg">
        <p> Tilt <b>A</b> :
          <input style="width: 50px; height: 20px;text-align: center; border: 1px solid black; border-radius: 4px;"
          class="span_tilt"
          axis="a"
          autocomplete="off"
          type="number"
          :value="settings.tiltY.toFixed(2)"
          step="0.01"
          @keypress="keypressTiltEvent"
          @blur="blurTiltEvent"/> &deg;<br/>
          <span style="color: darkgray">Rotation around X</span>
        </p>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn class="btn_tilt" axis="a" dir="d" v-on="on" @click="clickBtnTilt">
              <v-icon> undo </v-icon>
              <span class="content">-0.01&deg;</span>
            </v-btn>
          </template>
          <span> Decrease bed tilt around the X axis (M666 Bxxx) </span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn class="btn_tilt" axis="a" dir="u" v-on="on" @click="clickBtnTilt">
              <span class="content">+0.01&deg;</span>
              <v-icon> redo </v-icon>
            </v-btn>
          </template>
          <span> Increase bed tilt around the X axis (M666 Bxxx) </span>
        </v-tooltip>
        <br/>
        <p> Tilt <b>B</b> :
          <input style="width: 50px; height: 20px;text-align: center; border: 1px solid black; border-radius: 4px;"
          axis="b"
          class="span_tilt"
          autocomplete="off"
          type="number"
          :value="-settings.tiltX.toFixed(2)"
          step="0.01"
          @keypress="keypressTiltEvent"
          @blur="blurTiltEvent"/> &deg;<br/>
          <span style="color: darkgray">Rotation around Y</span>
        </p>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn class="btn_tilt" axis="b" dir="d" v-on="on" @click="clickBtnTilt">
              <v-icon> undo </v-icon>
              <span class="content">-0.01&deg;</span>
            </v-btn>
          </template>
          <span> Decrease bed tilt around the Y axis (M666 Axxx) </span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn class="btn_tilt" axis="b" dir="u" v-on="on" @click="clickBtnTilt">
              <span class="content">+0.01&deg;</span>
              <v-icon> redo </v-icon>
            </v-btn>
          </template>
          <span> Increase bed tilt around the Y axis (M666 Axxx) </span>
        </v-tooltip>
      </template>
      <template v-if="asPrct">
        <p> Offset <b>X</b> :
          <input style="width: 50px; height: 20px;text-align: center; border: 1px solid black; border-radius: 4px;"
          class="span_tilt"
          axis="x"
          autocomplete="off"
          type="number"
          :value="prctX"
          step="0.01"
          @keypress="keypressTiltEvent"
          @blur="blurTiltEvent"/> %<br/>
          <span style="color: darkgray">Offset on X axis</span>
        </p>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn class="btn_tilt" axis="x" dir="d" v-on="on" @click="clickBtnTilt">
              <v-icon> redo </v-icon>
              <span class="content">-0.01%</span>
            </v-btn>
          </template>
          <span> Decrease bed tilt around the X axis (M666 Axxx) </span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn class="btn_tilt" axis="x" dir="u" v-on="on" @click="clickBtnTilt">
              <span class="content">+0.01%</span>
              <v-icon> undo </v-icon>
            </v-btn>
          </template>
          <span> Increase bed tilt around the X axis (M666 Axxx) </span>
        </v-tooltip>
        <br/>
        <p> Offset <b>Y</b> :
          <input style="width: 50px; height: 20px;text-align: center; border: 1px solid black; border-radius: 4px;"
          axis="y"
          class="span_tilt"
          autocomplete="off"
          type="number"
          :value="prctY"
          step="0.01"
          @keypress="keypressTiltEvent"
          @blur="blurTiltEvent"/> %<br/>
          <span style="color: darkgray">Offset on Y axis</span>
        </p>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn class="btn_tilt" axis="y" dir="d" v-on="on" @click="clickBtnTilt">
              <v-icon> undo </v-icon>
              <span class="content">-0.01%</span>
            </v-btn>
          </template>
          <span> Decrease bed tilt around the Y axis (M666 Bxxx) </span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn class="btn_tilt" axis="y" dir="u" v-on="on" @click="clickBtnTilt">
              <span class="content">+0.01%</span>
              <v-icon> redo </v-icon>
            </v-btn>
          </template>
          <span> Increase bed tilt around the Y axis (M666 Bxxx) </span>
        </v-tooltip>
      </template>
      <br/>
      <div style="width: max-content; margin: auto;">
        Display tilt as :<br/>
        <div style=" display: inline-flex">
          <span style="margin-top: 5px"><b> &deg; </b>&nbsp;</span>
          <v-switch hide-details class="ml-1" v-model="asPrct"></v-switch>
          <span style="margin-top: 5px"><b> % </b></span>
        </div>
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
      asDeg: true,
      asPrct: false,
      xyTilt: undefined,
      settings: {
        tiltX: 0,
        tiltY: 0,
      },
      prctX: 0,
      prctY: 0,
      B4M666: "",
      AFM666: "",
    }
  },
  methods: {
    ...mapActions('machine', ['sendCode', 'download', 'upload']),
    clickBtnTilt: function(e) {
      e.preventDefault();
      clearTimeout(this.xyTilt);
      var prct;
      let that = e.target;
      while (that.nodeName.toLowerCase() !== "button")
        that = that.parentElement;
      that = that.attributes;
      var axis = that.axis.value;
      var dir = that.dir.value;
      //console.log($(this))
      if(this.asPrct) {
        console.log("prct: " + axis + ", " + dir)
        prct = (Math.tan((this.settings["tilt"+axis.toUpperCase()]*Math.PI)/180)*100);
        prct += dir=="u" ? 0.01 : -0.01;
        this.settings["tilt"+axis.toUpperCase()] = ((Math.atan(prct/100)*180)/Math.PI)
        //$(".span_tilt[axis=" + axis + "]").prop("value", prct.toFixed(2));
      } else {
        console.log("deg: " + axis + ", " + dir)
        this.settings["tilt"+(axis=="b"?"X":"Y")] += (axis=="a" && dir=="u" || axis=="b" && dir=="d")? 0.01 : -0.01;
        prct = (Math.tan((this.settings["tilt"+(axis=="b"?"X":"Y")]*Math.PI)/180)*100).toFixed(3);
        //$(".span_tilt[axis="+axis+"]").prop("value", (axis=="b"?-1:1)*this.settings["tilt"+(axis=="b"?"X":"Y")].toFixed(2));
      }
      this.prctX = (Math.tan((this.settings.tiltX*Math.PI)/180)*100).toFixed(2);
      this.prctY = (Math.tan((this.settings.tiltY*Math.PI)/180)*100).toFixed(2);
      this.sendCode("M666 "+(axis=="x" || axis=="b" ? "A" : "B" ) + prct);
      this.xyTilt = setTimeout(this.sendM666Params, 1000);
    },
    clickPrct: function(e) {
      this.prctX = (Math.tan((this.settings.tiltX*Math.PI)/180)*100).toFixed(2);
      this.prctY = (Math.tan((this.settings.tiltY*Math.PI)/180)*100).toFixed(2);
      if(this.asPrct) {
        $(".span_tilt[axis=x]").prop("value",  prctX);//%
        $(".span_tilt[axis=y]").prop("value", prctY);//%
      } else {
        $(".span_tilt[axis=b]").prop("value", -settings.tiltX.toFixed(2));
        $(".span_tilt[axis=a]").prop("value", settings.tiltY.toFixed(2));
      }
      //e.preventDefault();
    },
    loadM666Params: async function() {
      console.log('load the cfg file');
      this.B4M666 = "";
      this.AFM666 = "";

      const filename = "0:/sys/config-override.g";
      const response = await this.download({ filename, type: 'text', showSuccess: false });

      let result = response.split("\n");
      var found = false;
      var line = -1;
      for( var i = 0; i < result.length; i++)
      {
        if (result[i].includes("M666")) {
          line = i;
          found = true;
        } else if (!found) {
          this.B4M666 += result[i] + "\n";
        } else {
          this.AFM666 += result[i] + "\n";
        }
      }
      result = result[line];
      result = (result.indexOf(";") > 0 ? result.substring(0,result.indexOf(";")):result);
      result = result.split(" ");
      for( var i = 0; i < result.length; i++)
      {
        if (result[i].includes("A")) {
          //console.log(parseFloat(result[i].substring(1))+"%");
          var prct_a = parseFloat(result[i].substring(1));
          var deg_a = ((Math.atan(prct_a/100)*180)/Math.PI);
          //console.log(-deg_a.toFixed(2)+"°");
          this.settings.tiltX = deg_a;
          //$(".span_tilt[axis=b]").prop("value", -deg_a.toFixed(2));
        } else if (result[i].includes("B")) {
          //console.log(parseFloat(result[i].substring(1))+"%");
          var prct_b = parseFloat(result[i].substring(1));
          var deg_b = ((Math.atan(prct_b/100)*180)/Math.PI);
          //console.log(deg_b.toFixed(2)+"°");
          this.settings.tiltY = deg_b;
          //$(".span_tilt[axis=a]").prop("value", deg_b.toFixed(2));
        } else if (result[i].length > 0){
          this.B4M666 += result[i] + " ";
        }
      }
    },
    sendM666Params: async function() {
      let filename = "0:/sys/config-override.g";
      let data =  this.B4M666 + "A" + (Math.tan((this.settings.tiltX*Math.PI)/180)*100).toFixed(3) + " B" + (Math.tan((this.settings.tiltY*Math.PI)/180)*100).toFixed(3) + " ; ! A and B axis are reverted to the X-Y Tilt interface (A=B and B=A) \n" + this.AFM666;
      const content = new Blob([data]);
      try {
        await this.upload({ filename: filename, content });
        console.log("file saved");
      } catch (e) {
        console.log("Error: " + (result.err == 1 ? "no such file" : "not mounted"));
        console.error(e);// TODO Optionally ask user to save file somewhere else
      }
    },

    keypressTiltEvent: function(e) {
      console.log(e.keyCode);
      if( e.which == 13 || e.keyCode == 13 ) {
        console.log(e);
        e.target.blur()
        e.preventDefault();
      }
    },
    blurTiltEvent: function(e) {
      e.preventDefault();
      clearTimeout(this.xyTilt);
      var prct = e.target.value;
      var axis = e.target.attributes.axis.value;
      if(this.asPrct) {
        console.log("prct: " +  axis)
        this.settings["tilt"+axis.toUpperCase()] = ((Math.atan(prct/100)*180)/Math.PI)
      } else {
        console.log("deg: " + axis)
        this.settings["tilt"+(axis.includes("b")?"X":"Y")] = (axis.includes("b")?-1:1)*parseFloat(prct);
        prct = (axis.includes("b")?-1:1)*(Math.tan((prct*Math.PI)/180)*100).toFixed(3);
      }
      this.prctX = (Math.tan((this.settings.tiltX*Math.PI)/180)*100).toFixed(2);
      this.prctY = (Math.tan((this.settings.tiltY*Math.PI)/180)*100).toFixed(2);
      this.sendCode("M666 "+ (this.asPrct?(axis.includes("x")?"A":"B"):(axis.includes("a")?"B":"A")) + prct);
      console.log("M666 "+ (this.asPrct?(axis.includes("x")?"A":"B"):(axis.includes("a")?"B":"A")) + prct)
      this.xyTilt = setTimeout(this.sendM666Params, 1000);
      e.preventDefault();
    },
  },
  mounted() {
    console.log('load the cfg file');
    setTimeout(this.loadM666Params, 1000*Math.random());

  },
  watch: {
    asDeg (deg){
      this.asPrct = !deg
      this.prctX = (Math.tan((this.settings.tiltX*Math.PI)/180)*100).toFixed(2);
      this.prctY = (Math.tan((this.settings.tiltY*Math.PI)/180)*100).toFixed(2);
    },
    asPrct (prct){
      this.asDeg = !prct
      this.prctX = (Math.tan((this.settings.tiltX*Math.PI)/180)*100).toFixed(2);
      this.prctY = (Math.tan((this.settings.tiltY*Math.PI)/180)*100).toFixed(2);
    },
  }
}
</script>
