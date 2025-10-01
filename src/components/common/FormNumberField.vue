<template>
  <div class="panel-field" :style="wrapperStyle">
    <span class="panel-field__label">{{ label }}</span>
    <a-input-number
      v-model:value="innerValue"
      :min="min"
      :max="max"
      :step="step"
      :addon-after="unit"
      :precision="precision"
      :controls="controls"
      :style="inputStyle"
      :class="inputClass"
      :disabled="disabled"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  label: { type: String, required: true },
  modelValue: { type: [Number, String, null], default: null },
  min: { type: Number, default: undefined },
  max: { type: Number, default: undefined },
  step: { type: Number, default: 1 },
  unit: { type: String, default: '' },
  inputWidth: { type: Number, default: 196 },
  wrapperStyle: { type: [String, Object, Array], default: undefined },
  precision: { type: Number, default: undefined },
  controls: { type: Boolean, default: true },
  inputClass: { type: String, default: 'panel-input-number' },
  disabled: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue']);

const innerValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const inputStyle = computed(() => ({
  width: `${props.inputWidth}px`
}));
</script>

<style scoped>
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
</style>
