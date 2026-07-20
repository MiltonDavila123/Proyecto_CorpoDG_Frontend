<script setup>
import { ref } from 'vue'

defineProps({
  modelValue: { type: String, default: '' },
  min: { type: String, default: undefined },
  max: { type: String, default: undefined },
  required: { type: Boolean, default: false },
  placeholder: { type: String, default: 'Seleccionar' }
})

const emit = defineEmits(['update:modelValue'])

const inputFecha = ref(null)

const abrirCalendario = () => {
  const input = inputFecha.value
  if (input) {
    try {
      input.showPicker()
    } catch {
      input.focus()
      input.click()
    }
  }
}
</script>

<template>
  <div class="fecha-wrapper" @click="abrirCalendario">
    <span class="fecha-display" :class="{ 'fecha-seleccionada': modelValue }">{{ modelValue || placeholder }}</span>
    <input
      ref="inputFecha"
      type="date"
      :value="modelValue"
      :min="min"
      :max="max"
      :required="required"
      class="fecha-input-hidden"
      @input="emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>

<style scoped>
.fecha-wrapper {
  position: relative;
  cursor: pointer;
}

.fecha-display {
  display: block;
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--border, #d7dbe2);
  border-radius: 8px;
  font-size: 0.95rem;
  color: #aaa;
  background: #fff;
  pointer-events: none;
  user-select: none;
}

.fecha-display.fecha-seleccionada {
  color: var(--text, #1b1f2c);
  font-weight: 500;
}

.fecha-input-hidden {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.fecha-wrapper:hover .fecha-display {
  border-color: var(--primary, #b5a642);
}
</style>
