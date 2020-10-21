let GcodeParser = require('./gcode_parser.js');

/* ======== GCOM_PARSER ======== */
const DEBUG = false;
export default {
	name: 'gcom_parser',
	data() {
		return {
			nbLayers: 0,
			layHeight: 0,
			curLay: undefined,
			extruders: [],
			extruder: {name: "", number: undefined, diameter: undefined, width: undefined, primary: false},
			gcodeParser: Object.assign(GcodeParser.default.methods, GcodeParser.default.data),
			extWidth: 0.4
		}
	},
	methods:
	{
		decodeCuraCom: function(args)
		{
			if (this.gcodeParser == undefined)
				this.gcodeParser = Object.assign(GcodeParser.default.methods, GcodeParser.default.data);
			if(args.cmd.includes("SETTING_3"))
			{
				var cmd = args.cmd;
				args.cmd = cmd.substring(0, cmd.indexOf(' '));
				args.setting = cmd.substring(cmd.indexOf(' ')+1);
			}

			switch (args.cmd)
			{
				case "LAYER":
					if(DEBUG)
						console.log("Layer " + parseInt(args[1]) + "/" + this.nbLayers+"( "+ Math.round(parseInt(args[1])*this.layHeight*100)/100 + "/" + Math.round(this.nbLayers*this.layHeight*100)/100+"mm )");
					var layNum = parseInt(args[1]);
					if (layNum != 0)
						this.gcodeParser.gcodeLayers[layNum] = {gcodeLayerStart: 	this.gcodeParser.startLayer, gcodeLayer: 	this.gcodeParser.gcodeLayer};
					this.curLay = layNum;
					break;
				case "LAYER_COUNT" :
					this.nbLayers = parseInt(args[1]);
					if(DEBUG)
						console.log("model height: " + Math.round((this.layHeight*this.nbLayers)*100)/100 + "mm");
					break;
				case "TYPE":
					if(DEBUG)
						console.log("wall type: " + args[1]);
					this.gcodeParser.lastPos.w = args[1];
					break;
				case "TIME_ELAPSED":
					if(DEBUG)
						console.log("T+ " + this.toHMS(parseInt(args[1]), true));
					break;
				case "SETTING_3":
					break;
				case "TIME":
					console.log("Estimated print time: " + this.toHMS(parseInt(args[1]), true));
					break;
				case "LAYER HEIGHT":
					if(DEBUG)
						console.log("Layer height: "+args[1] +"mm");
					this.layHeight = parseFloat(args[1]);
					break;
				default:
					console.log(args);
			}
		},
		decodeSimpCom: function(comLine)
		{
			var cmd = comLine;
			if (comLine.includes(','))
			{
				cmd = comLine.substring(0,comLine.indexOf(','));
				while(cmd.indexOf(' ') == 0)
					cmd = cmd.substring(cmd.indexOf(' ')+1);
			}
			var args = {
			'cmd': cmd
			};
			var tokens = comLine.substring(cmd.length);
			tokens = tokens.substring(tokens.indexOf(',')+1);
			tokens = tokens.split(',');
			for(var token in tokens)
			{
				if (tokens[token])
				{
					var value = tokens[token];
					while(value.indexOf(' ') == 0)
						value = value.substring(value.indexOf(' ')+1);
					args[token] = value;
				}
			}
			this.parseSimpCom(args);
			//console.log(args);
		},
		parseSimpCom: function(args)
		{
			if (this.extruders == undefined)
			{
				this.extruders = [];
			}
			if (args.cmd.includes("layer "))
			{
				var cmd = args.cmd;
				args.cmd = cmd.substring(0, cmd.indexOf(' '));
				args.layNum = cmd.substring(cmd.indexOf(' ')+1);
				if (args[0] && args[0].includes('Z = '))
				{
					var z = args[0];
					args[0] = "Z";
					args.zHeight = z.substring(z.lastIndexOf(' ')+1);
					//console.log(args);
				}
			}

			if(args.cmd.includes("tool"))
			{
				let cmd = args.cmd;
				args.cmd = cmd.substring(0, cmd.indexOf(' '));
				cmd = cmd.substring(cmd.indexOf(' ')+1);
				var tokens = cmd.split(' ')
				for(var token in tokens)
				{
					var key = tokens[token][0];
					var value = parseFloat(tokens[token].substring(1));
					args[key] = value;
				}
				//console.log(args);
			}
			let i;
			switch (args.cmd)
			{
				case "printMaterial":
				case "printQuality":
					break;
				/* ====== WALL TYPES ======*/
				case "bridge":
					if(DEBUG)
						console.log("wall type: " + "BRIDGE");
					this.gcodeParser.lastPos.w = "BRIDGE";
					break;
				case "gap fill":
					if(DEBUG)
						console.log("wall type: " + "GAP_FILL");
					this.gcodeParser.lastPos.w = "GAP_FILL";
					break;
				case "skirt":
					if(DEBUG)
						console.log("wall type: " + "SKIRT");
					this.gcodeParser.lastPos.w = "SKIRT";
					break;
				case "infill":
					if(DEBUG)
						console.log("wall type: " + "INFILL");
					this.gcodeParser.lastPos.w = "INFILL";
					break;
				case "inner perimeter":
					if(DEBUG)
						console.log("wall type: " + "INNER_PERIMETER");
					this.gcodeParser.lastPos.w = "INNER_PERIMETER";
					break;
				case "outer perimeter":
					if(DEBUG)
						console.log("wall type: " + "OUTER_PERIMETER" );
					this.gcodeParser.lastPos.w = "OUTER_PERIMETER";
					break;
				case "solid layer":
					if(DEBUG)
						console.log("wall type: " + "SOLID_LAYER");
					this.gcodeParser.lastPos.w = "SOLID_LAYER";
					break;
				case "support":
					if(DEBUG)
						console.log("wall type: " + "SUPPORT");
					this.gcodeParser.lastPos.w = "SUPPORT";
					break;
				case "dense support":
					if(DEBUG)
						console.log("wall type: " + "DENSE_SUPPORT");
					this.gcodeParser.lastPos.w = "DENSE_SUPPORT";
					break;

				/* ====== LAYERS ====== */
				case "layer":
					if(DEBUG)
						console.log("Layer " + args.layNum +(this.nbLayers?"/"+this.nbLayers:""));
					var layNum = parseInt(args.layNum);
					/*if (layNum != 0)
						gcodeLayers[layNum] = {gcodeLayerStart: startLayer, gcodeLayer: gcodeLayer};*/
					this.nbLayers++;
					this.curLay = layNum;
					break;
				case "layerHeight":
					if(DEBUG)
						console.log("Layer height: "+args[0] +"mm");
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
					while (args[i] !== undefined)
					{
						if(this.extruders[i] === undefined)
						{
							this.extruders[i] = {};
						}
						this.extruders[i].name = args[i];
						i++;
					}
					break;
				case "extruderToolheadNumber":
					i = 0;
					while (args[i] !== undefined)
					{
						if(this.extruders[i] === undefined)
						{
							this.extruders[i] = {};
						}
						this.extruders[i].number = parseInt(args[i]);
						i++;
					}
					break;
				case "extruderWidth":
					i = 0;
					while (args[i] !== undefined)
					{
						if(this.extruders[i] === undefined)
						{
							this.extruders[i] = {};
						}
						this.extruders[i].width = parseFloat(args[i]);
						i++;
					}
					break;
				case "extruderDiameter":
					i = 0;
					while (args[i] !== undefined)
					{
						if(this.extruders[i] === undefined)
						{
							this.extruders[i] = {};
						}
						this.extruders[i].diameter = parseFloat(args[i]);
						i++;
					}
					break;
				case "primaryExtruder":
					for(let i = 0; i < this.extruders.length; i++)
					{
						if(this.extruders[i].number == parseInt(args[0]))
						{
							this.extruders[i].primary = true;
						} else {
							this.extruders[i].primary = false;
						}

					}
					break;
				default:
					console.log(args)
			}
		},
		decodeSlicCom: function(comLine)
		{
			if(DEBUG)
				console.log(comLine);
		},
		toHMS: function(r,e){var n=r%60,t=(r=(r-n)/60)%60,a=(r=(r-t)/60)%24,u=r=(r-a)/24;if(e){var c=u+"d "+a+"h "+t+"m "+n+"s";return c=c.replace(/(?:0. )+/,"")}return{d:u,h:a,m:t,s:n}}
	},
	mounted() {
		this.gcodeParser = Object.assign(GcodeParser.default.methods, GcodeParser.default.data);
		this.extruders = [];
	}
}
