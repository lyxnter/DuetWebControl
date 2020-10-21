<style scoped>
.slider {
	margin-top: 40px;
}
</style>
<style>
.theme--dark.v-input--slider .v-slider__ticks:empty {
	border-color: hsla(43, 98%, 50%, 0);
}
</style>

<template>
	<v-layout row align-center>
		<v-flex shrink>
			<v-btn large icon :disabled="disabled || innerValue <= min" @click="change(-step)" @mousedown="mouseDown(false)" @mouseup="mouseUp(false)" @mouseleave="mouseUp(false)" @touchstart="mouseDown(false)" @touchend="mouseUp(false)" class="ml-0">
				<v-icon>remove</v-icon>
			</v-btn>
		</v-flex>

		<v-flex class="px-2">
			<v-slider :value="innerValue.toFixed(0)" @change="$emit('input', $event)" :min="min" :max="max" :disabled="disabled && fan < 0" hide-details thumb-label="always" class="slider" :readonly="disabled" :color="disabled ? '#595959' : 'primary'" :tick-labels="labels" :ticks="fan === true ? 'always': false" :step="step"></v-slider>
		</v-flex>
		<v-flex shrink>
			<v-btn large icon :disabled="disabled || innerValue >= max" @click="change(step)" @mousedown="mouseDown(true)" @mouseup="mouseUp(true)" @mouseleave="mouseUp(true)" @touchstart="mouseDown(true)" @touchend="mouseUp(true)" class="mr-0">
				<v-icon>add</v-icon>
			</v-btn>
		</v-flex>
	</v-layout>
</template>

<script>
'use strict'

const debounceTime = 500
const changeTime = 300, changeInterval = 150

export default {
	props: {
		value: {
			type: Number,
			required: true
		},
		min: {
			type: Number,
			default: 0
		},
		max: {
			type: Number,
			default: 100
		},
		step: {
			type: Number,
			default: 5
		},
		fan: {
			type: Number,
			default: -1,
		},
		labels: {
			type: Object,
		},
		disabled: Boolean
	},
	data() {
		return {
			innerValue: parseFloat(this.value),
			debounceTimer: undefined,
			time: undefined,
			increaseTimer: undefined,
			decreaseTimer: undefined
		}
	},
	methods: {
		change(diff) {
			if (this.debounceTimer) {
				clearTimeout(this.debounceTimer);
			}
			this.innerValue = Math.round( Math.min(this.max, Math.max(this.min, parseFloat(this.innerValue) + parseFloat(diff) ) ) );
			this.debounceTimer = setTimeout(this.debounce, debounceTime);
		},
		debounce() {
			this.$emit('input', this.innerValue);
			this.debounceTimer = undefined;
		},
		mouseDown(increment) {
			if (increment) {
				this.increaseTimer = setTimeout(this.increase, changeTime);
			} else {
				this.decreaseTimer = setTimeout(this.decrease, changeTime);
			}
		},
		mouseUp(increment) {
			if (increment && this.increaseTimer) {
				clearTimeout(this.increaseTimer);
				this.increaseTimer = undefined;
			} else if (this.decreaseTimer) {
				clearTimeout(this.decreaseTimer);
				this.decreaseTimer = undefined;
			}
		},
		increase() {
			this.change(this.step);
			this.increaseTimer = setTimeout(this.increase, changeInterval);
		},
		decrease() {
			this.change(-this.step);
			this.decreaseTimer = setTimeout(this.decrease, changeInterval);
		}
	},
	watch: {
		value(to) {
			const newValue = Math.round(to);
			if (this.innerValue !== newValue) {
				this.innerValue = newValue;
			}
		}
	}
}
</script>
