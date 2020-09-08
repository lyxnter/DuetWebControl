<style scoped>
.control.number {
	display: inline-flex;
	position: relative;

	input {
		/*border: 1px solid $gray-light;*/
		border-radius: 3px;
		font-size: 1.25rem;
		flex: 1 0;
		line-height: 1.65;
		height: 2.5em;
		margin: 0 auto;
		padding-left: .5rem;
		padding-right: calc(82 / 16 * 1rem);
		text-align: center;
		max-width: 100%;
		vertical-align: top;
		width: 70px;
		/* Firefox-specific hack */
		-moz-appearance: textfield;

		&::-webkit-inner-spin-button,
		&::-webkit-outer-spin-button {
			-webkit-appearance: none;
			margin: 0;
		}

		&:focus {
			outline: 0;
			box-shadow: 0 0 0 0.2rem $link-color;
		}
	}

	button {
		background-color: #fff;
		border: 0px solid $gray-light;
		border-left-width: 1px;
		border-radius: 0;
		color: $gray-dark;
		cursor: pointer;
		flex: 0 1;
		font-family: sans-serif;
		font-size: 2.5rem;
		font-weight: bold;
		line-height: 1.7;
		position: absolute;
		top: .0625rem;
		text-align: center;
		width: 2.25rem;
		height: 2rem;
		user-select: none;
		z-index: 5;

		&:hover,
		&:active,
		&:focus {
			border-color: $link-color;
			color: $link-color;
			outline: none;
		}

		&:hover {
			& ~ .input {
				/*border: 1px solid $link-color;*/
			}
		}
		&:active,
		&:focus {
			& ~ .input {
				border: 0;
				box-shadow: 0 0 0 0.2rem $link-color;
			}
		}
		&:disabled,
		&.is-disabled {
			color: $gray-medium;
			opacity: 1;
		}
	}

}

[type=number] {
	width: 60px;
	height: 30px;
	margin-top: 15px;
	text-align: center;
	border: 1px outset #434847;
	background: #434847;
	font-size: 1.25rem;
}
</style>
<template>
	<div>
		<div class="control number">
			<v-btn large icon
			:disabled="disabled || decrementDisabled"
			@click="decrement()"
			@mousedown="mouseDown(false)"
			@mouseup="mouseUp(false)"
			@mouseleave="mouseUp(false)"
			@touchstart="mouseDown(false)"
			@touchend="mouseUp(false)"
			class="ml-0"
			v-bind:class="{'grey darken-1': !disabled && currentValue !== min}"
			>
			<v-icon>remove</v-icon>
		</v-btn>
		<input
		type="number"
		:disabled="inputDisabled"
		:min="min"
		:max="max"
		:step="Math.pow(10,-precision)"
		v-model.number="currentValue"
		@click="showTempEdit = !disabled "
		@blur="currentValue = parseFloat(value).toFixed(precision)"
		@keydown.esc="currentValue = parseFloat(value).toFixed(precision)"
		@keydown.enter="update"
		@keydown.up.prevent="increment"
		@keydown.down.prevent="decrement"
		/>
		<v-btn large icon
		:disabled="disabled || incrementDisabled"
		@click="increment()"
		@mousedown="mouseDown(true)"
		@mouseup="mouseUp(true)"
		@mouseleave="mouseUp(true)"
		@touchstart="mouseDown(true)"
		@touchend="mouseUp(true)"
		v-bind:class="{'grey darken-1': !disabled && currentValue !== max}"
		>
		<v-icon>add</v-icon>
	</v-btn>
</div>
<temp-edit-dialog :shown.sync="showTempEdit" :value="currentValue" :title="prompt" :prompt="title" @confirmed="update" :min="min"></temp-edit-dialog>
</div>
</template>
<script>
'use strict'

export default {
	props: {
		disabled: Boolean,
		max: {
			type: Number,
			default: 500,
		},
		min: {
			type: Number,
			default: 0,
		},
		value: {
			required: true
		},
		step: {
			type: Number,
			default: 1
		},
		precision: {
			type: Number,
			default: 0,
			required: false
		},
		title: {
			type: String,
			required: true,
		},
		prompt: {
			type: String,
			//default: ,
			required: true,
		}
	},

	data() {
		return {
			currentValue: undefined,
			decrementDisabled: false,
			incrementDisabled: false,
			inputDisabled: false,
			showTempEdit: false,
			interval: undefined,
		}
	},

	watch: {
		currentValue(val) {
			val = parseFloat(val)
			//console.log(val/*.toFixed(this.precision)*/, this.precision);
			this.currentValue = val.toFixed(this.precision)
			this.decrementDisabled = (val === this.min);
			this.incrementDisabled = (val === this.max);
		},
		value(val) {
			val = parseFloat(val)
			//console.log(val/*.toFixed(this.precision)*/, this.precision);
			this.currentValue = val.toFixed(this.precision)
			this.decrementDisabled = (val === this.min);
			this.incrementDisabled = (val === this.max);
		}
	},

	methods: {
		increment() {
			if (this.disabled || this.incrementDisabled) {
				return
			}

			let newVal = parseFloat(this.currentValue) + parseFloat(this.step)
			//this.decrementDisabled = false
			//console.log(newVal)
			this.currentValue = newVal.toFixed(this.precision);
			this._updateValue(newVal.toFixed(this.precision))
		},
		decrement() {
			if (this.disabled || this.decrementDisabled) {
				return
			}

			let newVal = parseFloat(this.currentValue) - parseFloat(this.step)
			//this.incrementDisabled = false
			//console.log(newVal)
			this.currentValue = newVal.toFixed(this.precision);
			this._updateValue(newVal.toFixed(this.precision))
		},
		mouseDown(goUp){
			let that = this;
			clearTimeout(this.interval);
			this.interval = setTimeout(function(that, goUp) {
				that.interval = setInterval(goUp ? that.increment : that.decrement, 125)
			}, 250, that, goUp);
		},
		mouseUp(/*goUp*/){
			if(this.interval) {// ? this.increment() : this.decrement()
				clearTimeout(this.interval);
				clearInterval(this.interval);
				this.interval = setTimeout(
					function(that) {
						//console.log(parseFloat(that.currentValue).toFixed(that.precision))
						that.$emit('change',
						parseFloat(that.currentValue).toFixed(that.precision));
						that.interval = 0
					}, 250, this);
				}
			},
			update(event) {
				if (this.disabled) {
					return
				}
				this.currentValue = -1;
				//console.log(event)
				if (event.target)
				this._updateValue(parseFloat(event.target.value))
				else
				this._updateValue(parseFloat(event));

				if (event.target)
				this.currentValue = parseFloat(event.target.value)
				else
				this.currentValue = parseFloat(event);
				console.log("update " +this.currentValue);
				if (this.currentValue <= this.min) {
					this.decrementDisabled = true;
				} else {
					this.decrementDisabled = false;
				}

				if (this.currentValue >= this.max) {
					this.incrementDisabled = true
				} else {
					this.incrementDisabled = false
				}
				this.$emit('change', this.currentValue);
			},
			_updateValue(newVal) {
				//const oldVal = this.currentValue
				
				if (newVal <= this.min) {
					newVal = this.min
					this.decrementDisabled = true;
					this.mouseUp();
				}
				if (newVal >= this.max) {
					newVal = this.max;
					this.incrementDisabled = true;
					this.mouseUp();
				}
				this.currentValue = newVal;
			}
		},

		mounted() {
			(this.value != this.currentValue ? this.currentValue = this.value : undefined)
			if (this.value <= this.min) {
				this.decrementDisabled = true
			} else {
				this.decrementDisabled = false
			}
		}
	}
	</script>
