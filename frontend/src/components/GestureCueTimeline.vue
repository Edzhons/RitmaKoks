<script setup>
import { computed } from 'vue'
import { formatTime, GESTURES } from '../utils/gestureSequence'

const props = defineProps({
  cues: { type: Array, required: true },
  duration: { type: Number, default: 0 },
  currentTime: { type: Number, default: 0 },
  activeCueId: { type: [String, Number], default: null },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['seek', 'remove'])

const markers = computed(() =>
  props.cues.map((cue) => ({
    ...cue,
    left: `${props.duration > 0 ? (cue.at / props.duration) * 100 : 0}%`,
    gestureInfo: GESTURES.find((gesture) => gesture.id === cue.gesture),
  })),
)

const playheadPosition = computed(() =>
  props.duration > 0 ? `${Math.min(100, (props.currentTime / props.duration) * 100)}%` : '0%',
)
</script>

<template>
  <div class="cue-timeline" aria-label="Dziesmas žestu norises laika skala">
    <div class="timeline-track">
      <span
        v-for="marker in markers"
        :key="marker.id"
        class="timeline-marker"
        :class="[
          `timeline-marker-${marker.gesture}`,
          { 'timeline-marker-active': activeCueId === marker.id },
        ]"
        :style="{ left: marker.left }"
        :title="`${marker.gestureInfo?.label || 'Žests'} — ${formatTime(marker.at)}`"
      ></span>
      <span class="timeline-playhead" :style="{ left: playheadPosition }"></span>
    </div>

    <ol v-if="cues.length" class="cue-list">
      <li
        v-for="cue in cues"
        :key="cue.id"
        class="cue-list-item"
        :class="{ 'cue-list-item-active': activeCueId === cue.id }"
      >
        <button
          class="cue-jump"
          type="button"
          :disabled="disabled"
          :aria-label="`Pāriet uz ${formatTime(cue.at)} — ${GESTURES.find((gesture) => gesture.id === cue.gesture)?.label}`"
          @click="emit('seek', cue.at)"
        >
          <span class="cue-time">{{ formatTime(cue.at) }}</span>
          <span class="cue-list-icon" aria-hidden="true">
            {{ GESTURES.find((gesture) => gesture.id === cue.gesture)?.icon }}
          </span>
          <span>{{ GESTURES.find((gesture) => gesture.id === cue.gesture)?.label }}</span>
        </button>
        <button
          v-if="!disabled"
          class="cue-remove"
          type="button"
          :aria-label="`Noņemt ${GESTURES.find((gesture) => gesture.id === cue.gesture)?.label} žestu pie ${formatTime(cue.at)}`"
          @click="emit('remove', cue.id)"
        >
          <i class="bi bi-x-lg" aria-hidden="true"></i>
        </button>
      </li>
    </ol>
    <p v-else class="timeline-empty">Pagaidām žesti nav pievienoti.</p>
  </div>
</template>

<style scoped>
.cue-timeline {
  display: grid;
  gap: 0.9rem;
}

.timeline-track {
  position: relative;
  height: 1.15rem;
  border: 1px solid var(--rk-border);
  border-radius: 999px;
  background: var(--rk-surface-soft);
}

.timeline-marker,
.timeline-playhead {
  position: absolute;
  top: 50%;
  width: 0.68rem;
  height: 0.68rem;
  transform: translate(-50%, -50%);
  border: 2px solid var(--rk-surface);
  border-radius: 50%;
  background: var(--rk-green);
}

.timeline-marker-stomp {
  background: #b45d37;
}

.timeline-marker-snap {
  background: #7d67a8;
}

.timeline-marker-active {
  z-index: 1;
  width: 1rem;
  height: 1rem;
  box-shadow: 0 0 0 3px var(--rk-amber-soft);
}

.timeline-playhead {
  z-index: 2;
  width: 0.18rem;
  height: 1.65rem;
  border: 0;
  border-radius: 2px;
  background: var(--rk-amber);
}

.cue-list {
  display: grid;
  max-height: 250px;
  gap: 0.35rem;
  overflow: auto;
  margin: 0;
  padding: 0;
  list-style: none;
}

.cue-list-item {
  display: flex;
  min-height: 42px;
  align-items: center;
  justify-content: space-between;
  border: 1px solid transparent;
  border-radius: 0.7rem;
  background: var(--rk-bg);
}

.cue-list-item-active {
  border-color: var(--rk-amber);
  background: var(--rk-amber-soft);
}

.cue-jump,
.cue-remove {
  display: inline-flex;
  min-height: 40px;
  align-items: center;
  border: 0;
  color: var(--rk-text);
  background: transparent;
}

.cue-jump {
  flex: 1;
  gap: 0.65rem;
  padding: 0.4rem 0.7rem;
  text-align: left;
}

.cue-jump:disabled {
  cursor: default;
}

.cue-time {
  min-width: 4.3rem;
  color: var(--rk-muted);
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
}

.cue-list-icon {
  font-size: 1.1rem;
}

.cue-jump > span:last-child {
  font-size: 0.8rem;
  font-weight: 700;
}

.cue-remove {
  justify-content: center;
  padding: 0 0.8rem;
  color: var(--rk-muted);
}

.cue-remove:hover {
  color: #a33d30;
}

.timeline-empty {
  margin: 0;
  color: var(--rk-muted);
  font-size: 0.8rem;
}
</style>
