<template>
  <div>
    <div class="panel-field" :style="wrapperStyle">
      <span class="panel-field__label">{{ label }}</span>
      <div class="panel-range-inputs">
        <a-input-number
          :value="rangeValue[0]"
          :min="min"
          :max="max"
          :step="step"
          :precision="precision"
          :addon-after="unit"
          :style="inputStyle"
          :class="inputClass"
          @update:value="updateInput($event, 0)"
        />
        <span class="panel-range-inputs__separator">-</span>
        <a-input-number
          :value="rangeValue[1]"
          :min="min"
          :max="max"
          :step="step"
          :precision="precision"
          :addon-after="unit"
          :style="inputStyle"
          :class="inputClass"
          @update:value="updateInput($event, 1)"
        />
      </div>
    </div>
    <a-slider
      v-if="slider"
      class="panel-range-slider"
      v-model:value="sliderBinding"
      :min="sliderMin"
      :max="sliderMax"
      :step="sliderStep"
      :tooltip-visible="sliderTooltip"
      range
      :style="sliderStyle"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  label: { type: String, required: true },
  modelValue: { type: Array, default: () => [null, null] },
  min: { type: Number, default: undefined },
  max: { type: Number, default: undefined },
  step: { type: Number, default: 1 },
  precision: { type: Number, default: undefined },
  unit: { type: String, default: '' },
  inputWidth: { type: Number, default: 90 },
  wrapperStyle: { type: [String, Object, Array], default: undefined },
  inputClass: { type: String, default: 'panel-input-number' },
  slider: { type: Boolean, default: true },
  sliderMin: { type: Number, default: 1 },
  sliderMax: { type: Number, default: 30 },
  sliderStep: { type: Number, default: 1 },
  sliderIndent: { type: Number, default: 114 },
  sliderTooltip: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue']);

const rangeValue = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return [props.modelValue[0] ?? null, props.modelValue[1] ?? null];
  }
  return [null, null];
});

const sliderBinding = computed({
  get: () => rangeValue.value,
  set: (value) => emit('update:modelValue', Array.isArray(value) ? [...value] : [null, null])
});

const updateInput = (value, index) => {
  const next = [...rangeValue.value];
  next[index] = value;
  emit('update:modelValue', next);
};

const inputStyle = computed(() => ({
  width: `${props.inputWidth}px`
}));

const sliderStyle = computed(() => ({
  marginLeft: `${props.sliderIndent}px`
}));
</script>

<style scoped>
.panel-range-inputs {
  display: flex;
  align-items: center;
  gap: 6px;
}

.panel-range-inputs__separator {
  color: #4a5775;
}

.panel-field {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 15px;
}

.panel-field__label {
  color: #1f2a44;
  font-size: 13px;
  width: 100px;
}

.panel-range-slider {
  margin-top: 8px;
}
</style>
