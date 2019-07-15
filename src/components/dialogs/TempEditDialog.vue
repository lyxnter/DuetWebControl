<style scoped="">
  table {
    width: 200px;
    height:200px;
    margin-left: auto;
    margin-right: auto;
  }
  td {
    text-align: center;
    font-size: 1.5rem;
    border: 1px outset black;
    border-radius: 5px;
    background: #80808030;
  }

  td:hover{
    border: 1px inset white;
  }
  td:active{
    border: 1px inset black;
  }
</style>
<template>
	<v-dialog v-model="shown" persistent width="360">
		<v-card>
			<v-form ref="form" @submit.prevent="submit">
				<v-card-title>
					<span class="headline">{{ title }}</span>
				</v-card-title>

				<v-card-text>
					{{ prompt }}
					<v-text-field ref="input" v-model="input" :rules="[/*v => !!v || $t('dialog.inputRequired'),*/ v => !isNumericValue || isNumber(parseFloat(v)) || $t('dialog.numberRequired')]" required></v-text-field>
          <table @click="fillInput">
            <tr><td>7</td><td>8</td><td>9</td><td style="background:#FF0000A0; border-radius: 10px;">X</td></tr>
            <tr><td>4</td><td>5</td><td>6</td><td style="background:#FFFF00A0; border-radius: 10px;">&lt;</td></tr>
            <tr><td>1</td><td>2</td><td>3</td><td rowspan="2" style="background:#00FF0080; border-radius: 10px;">V</td></tr>
            <tr><td colspan="2" >0</td><td>.</td></tr>
          </table>
        </v-card-text>

				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn color="blue darken-1" flat @click="hide">{{ $t('generic.cancel') }}</v-btn>
					<v-btn color="blue darken-1" flat type="submit">{{ $t('generic.ok') }}</v-btn>
				</v-card-actions>
			</v-form>
		</v-card>
	</v-dialog>
</template>

<script>
'use strict'

export default {
	props: {
		shown: {
			type: Boolean,
			required: true
		},
		title: {
			type: String,
			required: true
		},
		prompt: {
			type: String,
			//required: true
		},
    value: {
      type: Number,
      //required: true,
    },
		isNumericValue: Boolean,
		preset: [String, Number]
	},
	data() {
		return {
			input: ''
		}
	},
	methods: {
		async submit() {
			if (this.$refs.form.validate()) {
				this.$emit('update:shown', false);
				this.$emit('confirmed', this.isNumericValue ? parseFloat(this.input) : this.input);
			}
		},
		hide() {
			this.$emit('update:shown', false);
			this.$emit('cancelled');
		},
    fillInput(event) {
      let char = event.target.innerHTML
      if (isNaN(parseInt(char)))
      {
        if (char == "X")
        {
          this.hide();
        }
        if (char == "V")
        {
          this.submit();
        }
        if (char == "<" || char == "&lt;")
        {
          this.input = this.input.substring(0, this.input.length-1);
        }
      } else {
        if (this.input == undefined)
          this.input = "";
        this.input += char;
      }
    }
	},
  mounted() {
    //console.log(this.value)
    //this.input = this.value;
  },
	watch: {
		shown(to) {
			if (to) {
				// Apply preset
				this.input = this.preset;

				// Auto-focus input
				const inputField = this.$refs.input;
				setTimeout(function() { inputField.focus(); }, 100);
			}
		},
    /*value(val) {
      console.log(val)
      this.value = val;
      this.input = val;
    }*/
	}
}
</script>
