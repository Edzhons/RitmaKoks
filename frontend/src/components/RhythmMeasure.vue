<script setup>
import { computed } from 'vue'
import {
  canPlaceRhythmEvent,
  DURATION_OPTIONS,
  getBeatTicks,
  getMeasureTicks,
} from '../utils/rhythmScore'

const props = defineProps({
  score: { type: Object, required: true },
  measure: { type: Number, required: true },
  selectedDuration: { type: Number, default: 4 },
  selectedKind: { type: String, default: 'sound' },
  playbackPosition: { type: Object, default: null },
  presentation: { type: Boolean, default: false },
})

const emit = defineEmits(['place', 'remove'])

const measureTicks = computed(() => getMeasureTicks(props.score.timeSignature))
const beatTicks = computed(() => getBeatTicks(props.score.timeSignature.denominator))
const positions = computed(() => Array.from({ length: measureTicks.value }, (_, index) => index))
const beats = computed(() =>
  Array.from({ length: props.score.timeSignature.numerator }, (_, index) => index + 1),
)
const gridStyle = computed(() => ({ '--measure-ticks': measureTicks.value }))
const eventStarts = computed(
  () =>
    new Map(
      props.score.events
        .filter((event) => event.measure === props.measure)
        .map((event) => [event.position, event]),
    ),
)
const coveredPositions = computed(() => {
  const covered = new Set()

  for (const event of props.score.events) {
    if (event.measure !== props.measure) continue
    for (
      let position = event.position + 1;
      position < event.position + event.duration;
      position += 1
    ) {
      covered.add(position)
    }
  }

  return covered
})

function canPlace(position) {
  return canPlaceRhythmEvent(
    props.score.events,
    props.measure,
    position,
    props.selectedDuration,
    measureTicks.value,
  )
}

function eventDescription(event) {
  const duration = DURATION_OPTIONS.find((option) => option.ticks === event.duration)
  const symbol = event.kind === 'rest' ? 'Pauze' : duration?.syllable || 'Skaņa'

  return `${symbol}, ${duration?.label || 'ritma vērtība'}`
}

function isPlaybackPosition(position) {
  const playback = props.playbackPosition
  if (!playback || playback.measure !== props.measure) return false

  return (playback.beat - 1) * beatTicks.value + playback.position === position
}
</script>

<template>
  <div
    class="measure-track"
    :class="{ 'measure-track-presentation': presentation }"
    :style="gridStyle"
    :aria-label="`${measure}. takts`"
  >
    <div class="beat-track" aria-hidden="true">
      <span
        v-for="beat in beats"
        :key="beat"
        class="beat-label"
        :style="{ gridColumn: `${(beat - 1) * beatTicks + 1} / span ${beatTicks}` }"
      >
        {{ beat }}
      </span>
    </div>

    <div class="slot-track">
      <template v-for="position in positions" :key="position">
        <button
          v-if="eventStarts.has(position)"
          class="rhythm-event"
          :class="[
            eventStarts.get(position).kind === 'rest' ? 'rhythm-event-rest' : 'rhythm-event-sound',
            { 'rhythm-event-active': isPlaybackPosition(position) },
          ]"
          :style="{ gridColumn: `${position + 1} / span ${eventStarts.get(position).duration}` }"
          type="button"
          :disabled="presentation"
          :aria-label="
            presentation
              ? eventDescription(eventStarts.get(position))
              : `${eventDescription(eventStarts.get(position))}. Noņemt no ${measure}. takts`
          "
          @click="emit('remove', eventStarts.get(position).id)"
        >
          <span class="event-symbol" aria-hidden="true">
            {{
              eventStarts.get(position).kind === 'rest'
                ? '𝄽'
                : DURATION_OPTIONS.find(
                    (option) => option.ticks === eventStarts.get(position).duration,
                  )?.symbol
            }}
          </span>
          <span class="event-syllable">
            {{
              eventStarts.get(position).kind === 'rest'
                ? 'Pauze'
                : DURATION_OPTIONS.find(
                    (option) => option.ticks === eventStarts.get(position).duration,
                  )?.syllable
            }}
          </span>
          <span v-if="!presentation" class="event-remove" aria-hidden="true">×</span>
        </button>
        <span
          v-else-if="coveredPositions.has(position)"
          class="rhythm-covered"
          :style="{ gridColumn: String(position + 1) }"
          aria-hidden="true"
        ></span>
        <button
          v-else
          class="rhythm-empty"
          :style="{ gridColumn: String(position + 1) }"
          :class="{
            'rhythm-empty-beat': position % beatTicks === 0,
            'rhythm-empty-active': isPlaybackPosition(position),
          }"
          type="button"
          :disabled="presentation || !canPlace(position)"
          :aria-label="`${measure}. takts, ritma vieta ${position + 1}`"
          @click="emit('place', { measure, position })"
        >
          <span v-if="position % beatTicks === 0" class="slot-beat" aria-hidden="true">
            {{ Math.floor(position / beatTicks) + 1 }}
          </span>
          <span v-else class="slot-add" aria-hidden="true">+</span>
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.measure-track {
  min-width: max-content;
}

.beat-track,
.slot-track {
  display: grid;
  grid-template-columns: repeat(var(--measure-ticks), minmax(1.65rem, 1fr));
}

.beat-track {
  min-height: 1.7rem;
  align-items: center;
  color: var(--rk-muted);
  font-size: 0.72rem;
  font-weight: 700;
  text-align: center;
}

.slot-track {
  min-height: 5.2rem;
  border: 1px solid var(--rk-border);
  border-radius: 0.9rem;
  background: var(--rk-surface);
  overflow: hidden;
}

.rhythm-empty,
.rhythm-event,
.rhythm-covered {
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 5.1rem;
  align-items: center;
  justify-content: center;
  border: 0;
  border-right: 1px solid var(--rk-border);
}

.rhythm-empty {
  color: var(--rk-muted);
  background: transparent;
  transition: background-color 120ms ease;
}

.rhythm-empty:not(:disabled):hover {
  background: var(--rk-green-soft);
}

.rhythm-empty:disabled {
  cursor: default;
  opacity: 0.55;
}

.rhythm-empty-beat {
  border-left: 1px solid color-mix(in srgb, var(--rk-green) 45%, transparent);
}

.rhythm-empty-active,
.rhythm-event-active {
  box-shadow: inset 0 0 0 3px var(--rk-amber);
}

.slot-beat {
  font-size: 0.68rem;
  font-weight: 800;
}

.slot-add {
  font-size: 0.85rem;
  opacity: 0;
}

.rhythm-empty:not(:disabled):hover .slot-add {
  opacity: 1;
}

.rhythm-event {
  z-index: 1;
  flex-direction: column;
  gap: 0.05rem;
  overflow: hidden;
  border: 1px solid var(--rk-green);
  border-radius: 0.7rem;
  color: var(--rk-text);
  background: var(--rk-green-soft);
  line-height: 1.1;
}

.rhythm-event:not(:disabled):hover {
  border-color: #a33d30;
  background: color-mix(in srgb, var(--rk-amber-soft) 72%, var(--rk-surface));
}

.rhythm-event-rest {
  border-style: dashed;
  border-color: var(--rk-amber);
  background: var(--rk-amber-soft);
}

.event-symbol {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.45rem;
  line-height: 1;
}

.event-syllable {
  overflow: hidden;
  max-width: 100%;
  font-size: clamp(0.52rem, 1.2vw, 0.7rem);
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-remove {
  position: absolute;
  top: 0.1rem;
  right: 0.24rem;
  color: var(--rk-muted);
  font-size: 0.8rem;
  opacity: 0;
}

.rhythm-event:not(:disabled):hover .event-remove {
  opacity: 1;
}

.measure-track-presentation .beat-track,
.measure-track-presentation .slot-track {
  grid-template-columns: repeat(var(--measure-ticks), minmax(3.5rem, 1fr));
}

.measure-track-presentation .beat-track {
  min-height: 2.7rem;
  font-size: 1rem;
}

.measure-track-presentation .slot-track {
  min-height: 9rem;
}

.measure-track-presentation .rhythm-empty,
.measure-track-presentation .rhythm-event,
.measure-track-presentation .rhythm-covered {
  min-height: 8.9rem;
}

.measure-track-presentation .event-symbol {
  font-size: 2.5rem;
}

.measure-track-presentation .event-syllable {
  font-size: clamp(0.78rem, 2vw, 1.15rem);
}
</style>
