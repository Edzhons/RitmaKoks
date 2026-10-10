<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import RhythmMeasure from '../components/RhythmMeasure.vue'
import { useCrudResource } from '../composables/useCrudResource'
import { useAuthStore } from '../stores/auth'
import {
  canPlaceRhythmEvent,
  createEmptyRhythmScore,
  createPlaybackTimeline,
  DURATION_OPTIONS,
  getMeasureTicks,
  getPlaybackPosition,
  MAX_MEASURES,
  MAX_TEMPO,
  MIN_TEMPO,
  normalizeRhythmScore,
  TIME_SIGNATURE_DENOMINATORS,
  TIME_SIGNATURE_NUMERATORS,
} from '../utils/rhythmScore'

const auth = useAuthStore()
const score = ref(createEmptyRhythmScore())
const title = ref('Mans ritma vingrinājums')
const selectedDuration = ref(4)
const selectedKind = ref('sound')
const selectedExerciseId = ref('')
const presentationMode = ref(false)
const playbackPosition = ref(null)
const editorNotice = ref('')
const editorError = ref('')
const playbackError = ref('')
const audioContext = ref(null)
const playbackInterval = ref(null)
const playbackTimeout = ref(null)
const crud = useCrudResource('/api/rhythm-exercises')

const measures = computed(() =>
  Array.from({ length: score.value.measureCount }, (_, index) => index + 1),
)
const resourceError = crud.error
const validationErrors = crud.validationErrors
const savedExercises = crud.items
const currentMeasureTicks = computed(() => getMeasureTicks(score.value.timeSignature))
const timeSignatureText = computed(
  () => `${score.value.timeSignature.numerator}/${score.value.timeSignature.denominator}`,
)
const presentationBeats = computed(() => {
  const position = playbackPosition.value
  return Array.from({ length: score.value.timeSignature.numerator }, (_, index) => ({
    number: index + 1,
    active: position?.beat === index + 1,
  }))
})

watch(
  () => [
    score.value.timeSignature.numerator,
    score.value.timeSignature.denominator,
    score.value.measureCount,
  ],
  () => {
    const measureTicks = currentMeasureTicks.value
    const retained = []
    let removedCount = 0

    for (const event of score.value.events) {
      if (
        event.measure <= score.value.measureCount &&
        canPlaceRhythmEvent(retained, event.measure, event.position, event.duration, measureTicks)
      ) {
        retained.push(event)
      } else {
        removedCount += 1
      }
    }

    if (removedCount > 0) {
      score.value.events = retained
      editorNotice.value =
        removedCount === 1
          ? 'Viena ritma zīme noņemta, jo tā vairs neietilpa izvēlētajā taktī.'
          : `${removedCount} ritma zīmes noņemtas, jo tās vairs neietilpa izvēlētajā taktsmērā.`
    }
  },
)

watch(
  score,
  () => {
    if (audioContext.value) {
      stopPlayback()
    }
  },
  { deep: true },
)

watch(
  () => auth.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      void loadSavedExercises()
    } else {
      savedExercises.value = []
      selectedExerciseId.value = ''
    }
  },
  { immediate: true },
)

function makeEventId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function addEvent({ measure, position }) {
  if (
    !canPlaceRhythmEvent(
      score.value.events,
      measure,
      position,
      selectedDuration.value,
      currentMeasureTicks.value,
    )
  ) {
    return
  }

  score.value.events = [
    ...score.value.events,
    {
      id: makeEventId(),
      measure,
      position,
      duration: selectedDuration.value,
      kind: selectedKind.value,
    },
  ]
  editorNotice.value = ''
  editorError.value = ''
}

function removeEvent(id) {
  score.value.events = score.value.events.filter((event) => event.id !== id)
}

function clearScore() {
  score.value.events = []
  selectedExerciseId.value = ''
  title.value = 'Mans ritma vingrinājums'
  editorNotice.value = 'Ritma pieraksts notīrīts.'
  editorError.value = ''
}

async function loadSavedExercises() {
  try {
    await crud.list({ per_page: 50, sort: 'updated_at', direction: 'desc' })
  } catch (error) {
    resourceError.value = error.message || 'Saglabātos vingrinājumus neizdevās ielādēt.'
  }
}

function loadSelectedExercise() {
  const exercise = savedExercises.value.find((item) => String(item.id) === selectedExerciseId.value)
  if (!exercise) return

  try {
    score.value = normalizeRhythmScore(exercise.content)
    title.value = exercise.title
    editorNotice.value = `Ielādēts vingrinājums “${exercise.title}”.`
    editorError.value = ''
  } catch (error) {
    editorError.value = error.message
  }
}

function startNewExercise() {
  score.value = createEmptyRhythmScore()
  title.value = 'Mans ritma vingrinājums'
  selectedExerciseId.value = ''
  editorNotice.value = 'Izveidots jauns ritma vingrinājums.'
  editorError.value = ''
}

async function saveExercise() {
  editorNotice.value = ''
  editorError.value = ''

  let content
  try {
    content = normalizeRhythmScore(score.value)
  } catch (error) {
    editorError.value = error.message
    return
  }

  const payload = {
    title: title.value,
    content,
  }

  try {
    if (selectedExerciseId.value) {
      const saved = await crud.update(selectedExerciseId.value, payload)
      editorNotice.value = `Vingrinājums “${saved.title}” saglabāts.`
    } else {
      const saved = await crud.create(payload)
      selectedExerciseId.value = String(saved.id)
      editorNotice.value = `Vingrinājums “${saved.title}” saglabāts.`
    }
  } catch (error) {
    resourceError.value = error.message || 'Vingrinājumu neizdevās saglabāt.'
  }
}

function playTone(context, frequency, time, accent = false) {
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  const peak = accent ? 0.16 : 0.1

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(frequency, time)
  gain.gain.setValueAtTime(0.0001, time)
  gain.gain.exponentialRampToValueAtTime(peak, time + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.11)
  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start(time)
  oscillator.stop(time + 0.12)
}

function stopPlayback() {
  if (playbackInterval.value !== null) {
    window.clearInterval(playbackInterval.value)
    playbackInterval.value = null
  }
  if (playbackTimeout.value !== null) {
    window.clearTimeout(playbackTimeout.value)
    playbackTimeout.value = null
  }
  playbackPosition.value = null

  const context = audioContext.value
  audioContext.value = null
  if (context && context.state !== 'closed') {
    context.close().catch((error) => {
      playbackError.value = error.message || 'Atskaņošanu neizdevās apturēt korekti.'
    })
  }
}

async function togglePlayback() {
  if (audioContext.value) {
    stopPlayback()
    return
  }

  playbackError.value = ''
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext
  if (!AudioContextConstructor) {
    playbackError.value = 'Šajā pārlūkā ritma atskaņošana nav pieejama.'
    return
  }

  try {
    const context = new AudioContextConstructor()
    audioContext.value = context
    await context.resume()
    const timeline = createPlaybackTimeline(score.value)
    const startTime = context.currentTime + 0.05

    for (const beat of timeline.beats) {
      playTone(context, beat.accented ? 880 : 640, startTime + beat.time, beat.accented)
    }
    for (const note of timeline.notes) {
      playTone(context, 440, startTime + note.time)
    }

    const updatePosition = () => {
      const elapsed = context.currentTime - startTime
      playbackPosition.value = getPlaybackPosition(Math.max(0, elapsed), score.value)
    }

    updatePosition()
    playbackInterval.value = window.setInterval(updatePosition, 40)
    playbackTimeout.value = window.setTimeout(stopPlayback, timeline.totalDuration * 1000 + 120)
  } catch (error) {
    stopPlayback()
    playbackError.value = error.message || 'Ritmu neizdevās atskaņot.'
  }
}

function handleKeydown(event) {
  if (event.key === 'Escape' && presentationMode.value) {
    presentationMode.value = false
  }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  stopPlayback()
})
</script>

<template>
  <div class="rhythm-studio-page">
    <div class="rhythm-studio-content">
      <header class="rhythm-studio-heading">
        <div>
          <span class="eyebrow">RITMA STUDIJA</span>
          <h1>Veido savu ritmu.</h1>
          <p>Saliec ritma zīmes taktīs, skaiti līdzi un klausies, kā vingrinājums skan.</p>
        </div>
        <RouterLink class="studio-back-link" to="/">
          <i class="bi bi-arrow-left" aria-hidden="true"></i>
          Uz sākumu
        </RouterLink>
      </header>

      <div class="rhythm-studio-layout">
        <aside class="rhythm-controls" aria-label="Ritma iestatījumi">
          <section class="control-section">
            <h2><span>01</span> Taktsmērs</h2>
            <p>Izvēlies, cik sitienu ir katrā taktī.</p>
            <div class="meter-control">
              <label class="visually-hidden" for="meter-numerator">Sitienu skaits taktī</label>
              <select
                id="meter-numerator"
                v-model.number="score.timeSignature.numerator"
                class="form-select"
                aria-label="Sitienu skaits taktī"
              >
                <option
                  v-for="numerator in TIME_SIGNATURE_NUMERATORS"
                  :key="numerator"
                  :value="numerator"
                >
                  {{ numerator }}
                </option>
              </select>
              <span class="meter-divider" aria-hidden="true">/</span>
              <label class="visually-hidden" for="meter-denominator"
                >Skaņas vērtība vienam sitienam</label
              >
              <select
                id="meter-denominator"
                v-model.number="score.timeSignature.denominator"
                class="form-select"
                aria-label="Skaņas vērtība vienam sitienam"
              >
                <option
                  v-for="denominator in TIME_SIGNATURE_DENOMINATORS"
                  :key="denominator"
                  :value="denominator"
                >
                  {{ denominator }}
                </option>
              </select>
            </div>
            <p class="control-hint">
              Skaitītājs rāda sitienus taktī, saucējs — sitiena nots vērtību.
            </p>
          </section>

          <section class="control-section">
            <div class="control-title-row">
              <div>
                <h2><span>02</span> Temps</h2>
                <p>Sitieni minūtē</p>
              </div>
              <label class="tempo-number">
                <span class="visually-hidden">Temps sitienos minūtē</span>
                <input
                  v-model.number="score.tempo"
                  type="number"
                  :min="MIN_TEMPO"
                  :max="MAX_TEMPO"
                  aria-label="Temps sitienos minūtē"
                  @change="
                    score.tempo = Math.min(
                      MAX_TEMPO,
                      Math.max(MIN_TEMPO, Number(score.tempo) || 90),
                    )
                  "
                />
                <span>BPM</span>
              </label>
            </div>
            <input
              v-model.number="score.tempo"
              class="form-range tempo-range"
              type="range"
              :min="MIN_TEMPO"
              :max="MAX_TEMPO"
              aria-label="Mainīt tempu"
            />
            <div class="range-labels"><span>Lēni</span><span>Ātri</span></div>
          </section>

          <section class="control-section">
            <div class="control-title-row">
              <div>
                <h2><span>03</span> Takšu skaits</h2>
                <p>Vingrinājuma garums</p>
              </div>
              <label class="measure-count">
                <span class="visually-hidden">Takšu skaits vingrinājumā</span>
                <select
                  v-model.number="score.measureCount"
                  class="form-select"
                  aria-label="Takšu skaits vingrinājumā"
                >
                  <option v-for="count in MAX_MEASURES" :key="count" :value="count">
                    {{ count }}
                  </option>
                </select>
                <span>taktis</span>
              </label>
            </div>
          </section>

          <section class="control-section symbol-section">
            <h2><span>04</span> Ritma zīmes</h2>
            <p>Izvēlies zīmi, pēc tam pieskaries brīvai vietai taktī.</p>
            <div class="duration-options" role="group" aria-label="Izvēlēties nots ilgumu">
              <button
                v-for="option in DURATION_OPTIONS"
                :key="option.ticks"
                class="duration-option"
                :class="{ 'duration-option-active': selectedDuration === option.ticks }"
                type="button"
                :aria-pressed="selectedDuration === option.ticks"
                @click="selectedDuration = option.ticks"
              >
                <span class="duration-symbol" aria-hidden="true">{{ option.symbol }}</span>
                <span class="duration-copy">
                  <strong>{{ option.label }}</strong>
                  <small>{{ option.syllable }}</small>
                </span>
              </button>
            </div>

            <div class="kind-toggle" role="group" aria-label="Ritma zīmes veids">
              <button
                class="kind-button"
                :class="{ 'kind-button-active': selectedKind === 'sound' }"
                type="button"
                :aria-pressed="selectedKind === 'sound'"
                @click="selectedKind = 'sound'"
              >
                <i class="bi bi-music-note" aria-hidden="true"></i>
                Skaņa
              </button>
              <button
                class="kind-button"
                :class="{ 'kind-button-active': selectedKind === 'rest' }"
                type="button"
                :aria-pressed="selectedKind === 'rest'"
                @click="selectedKind = 'rest'"
              >
                <span aria-hidden="true">𝄽</span>
                Pauze
              </button>
            </div>
          </section>

          <section class="control-section playback-controls">
            <button
              class="btn btn-primary playback-button"
              type="button"
              :aria-pressed="Boolean(audioContext)"
              @click="togglePlayback"
            >
              <i
                :class="audioContext ? 'bi bi-stop-fill' : 'bi bi-play-fill'"
                aria-hidden="true"
              ></i>
              {{ audioContext ? 'Apturēt' : 'Atskaņot ritmu' }}
            </button>
            <button
              class="btn btn-outline-secondary presentation-button"
              type="button"
              @click="presentationMode = true"
            >
              <i class="bi bi-easel" aria-hidden="true"></i>
              Prezentācijas režīms
            </button>
          </section>
        </aside>

        <main class="rhythm-score-panel" aria-label="Ritma pieraksts">
          <div class="score-panel-heading">
            <div>
              <span class="score-meter">{{ timeSignatureText }}</span>
              <h2>Tavs ritma pieraksts</h2>
              <p>
                {{ score.measureCount }} {{ score.measureCount === 1 ? 'takts' : 'taktis' }} ·
                {{ score.tempo }} sitieni minūtē
              </p>
            </div>
            <button class="text-button" type="button" @click="clearScore">
              <i class="bi bi-eraser" aria-hidden="true"></i>
              Notīrīt
            </button>
          </div>

          <p class="score-instruction">
            <i class="bi bi-info-circle" aria-hidden="true"></i>
            Spied uz brīvajām vietām, lai pievienotu zīmi. Spied uz zīmes, lai to noņemtu.
          </p>

          <div class="measures-list">
            <section v-for="measure in measures" :key="measure" class="measure-section">
              <h3>{{ measure }}. takts</h3>
              <div class="measure-scroll">
                <RhythmMeasure
                  :score="score"
                  :measure="measure"
                  :selected-duration="selectedDuration"
                  :selected-kind="selectedKind"
                  :playback-position="playbackPosition"
                  @place="addEvent"
                  @remove="removeEvent"
                />
              </div>
            </section>
          </div>

          <div class="score-legend" aria-label="Ritma pieraksta apzīmējumi">
            <span><i class="legend-sound" aria-hidden="true"></i> Skaņa</span>
            <span><i class="legend-rest" aria-hidden="true"></i> Pauze</span>
            <span><i class="legend-beat" aria-hidden="true"></i> Sitiena sākums</span>
          </div>

          <section class="save-exercise" aria-labelledby="save-title">
            <div class="save-heading">
              <div>
                <span class="eyebrow">TAVI DARBI</span>
                <h2 id="save-title">Saglabā vingrinājumu</h2>
              </div>
              <button
                v-if="auth.isAuthenticated"
                class="text-button"
                type="button"
                :disabled="crud.loading"
                @click="startNewExercise"
              >
                Jauns vingrinājums
              </button>
            </div>

            <template v-if="auth.isAuthenticated">
              <div class="saved-work-controls">
                <label class="saved-select">
                  <span>Atvērt saglabātu</span>
                  <select
                    v-model="selectedExerciseId"
                    class="form-select"
                    aria-label="Atvērt saglabātu ritma vingrinājumu"
                    @change="loadSelectedExercise"
                  >
                    <option value="">Izveidot jaunu</option>
                    <option
                      v-for="exercise in savedExercises"
                      :key="exercise.id"
                      :value="String(exercise.id)"
                    >
                      {{ exercise.title }}
                    </option>
                  </select>
                </label>
                <label class="saved-title">
                  <span>Vingrinājuma nosaukums</span>
                  <input
                    v-model="title"
                    class="form-control"
                    maxlength="255"
                    placeholder="Piemēram, Mans pirmais ritms"
                  />
                  <small v-if="validationErrors.title?.[0]" class="field-error">
                    {{ validationErrors.title[0] }}
                  </small>
                </label>
                <button
                  class="btn btn-primary save-button"
                  type="button"
                  :disabled="crud.saving"
                  @click="saveExercise"
                >
                  <span
                    v-if="crud.saving"
                    class="spinner-border spinner-border-sm"
                    aria-hidden="true"
                  ></span>
                  <i v-else class="bi bi-cloud-arrow-up" aria-hidden="true"></i>
                  {{ crud.saving ? 'Saglabā…' : 'Saglabāt' }}
                </button>
              </div>
            </template>
            <div v-else class="sign-in-note">
              <i class="bi bi-person-lock" aria-hidden="true"></i>
              <p>
                Ritmu vari veidot un atskaņot arī bez konta. Lai saglabātu vingrinājumus, lūdzu,
                <RouterLink to="/login">pieslēdzies</RouterLink>
                vai
                <RouterLink to="/register">reģistrējies</RouterLink>.
              </p>
            </div>

            <p v-if="resourceError" class="editor-alert" role="alert">{{ resourceError }}</p>
            <p v-if="editorError" class="editor-alert" role="alert">{{ editorError }}</p>
            <p v-if="playbackError" class="editor-alert" role="alert">{{ playbackError }}</p>
            <p v-if="editorNotice" class="editor-notice" role="status">{{ editorNotice }}</p>
          </section>
        </main>
      </div>
    </div>

    <div
      v-if="presentationMode"
      class="presentation-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="presentation-title"
      @click.self="presentationMode = false"
    >
      <div class="presentation-toolbar">
        <div>
          <span class="eyebrow">RITMA STUDIJA</span>
          <h2 id="presentation-title">{{ title || 'Ritma vingrinājums' }}</h2>
        </div>
        <div class="presentation-actions">
          <span class="presentation-meter">{{ timeSignatureText }} · {{ score.tempo }} BPM</span>
          <button class="btn btn-primary" type="button" @click="togglePlayback">
            <i :class="audioContext ? 'bi bi-stop-fill' : 'bi bi-play-fill'" aria-hidden="true"></i>
            {{ audioContext ? 'Apturēt' : 'Atskaņot' }}
          </button>
          <button
            class="presentation-close"
            type="button"
            aria-label="Aizvērt prezentācijas režīmu"
            @click="presentationMode = false"
          >
            <i class="bi bi-x-lg" aria-hidden="true"></i>
          </button>
        </div>
      </div>
      <div class="presentation-body">
        <div class="presentation-beat-count" aria-label="Sitieni taktī">
          <span
            v-for="beat in presentationBeats"
            :key="beat.number"
            :class="{ 'presentation-beat-active': beat.active }"
          >
            {{ beat.number }}
          </span>
        </div>
        <section v-for="measure in measures" :key="measure" class="presentation-measure">
          <h3>{{ measure }}. takts</h3>
          <div class="measure-scroll">
            <RhythmMeasure
              :score="score"
              :measure="measure"
              :playback-position="playbackPosition"
              presentation
            />
          </div>
        </section>
      </div>
      <p class="presentation-hint">Lai aizvērtu prezentācijas režīmu, nospied taustiņu Esc.</p>
    </div>
  </div>
</template>

<style scoped>
.rhythm-studio-page {
  padding: 2.2rem 0 4rem;
}

.rhythm-studio-content {
  width: min(100% - 3rem, 1240px);
  margin: 0 auto;
}

.rhythm-studio-heading,
.score-panel-heading,
.control-title-row,
.save-heading,
.presentation-toolbar,
.presentation-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.rhythm-studio-heading {
  margin-bottom: 1.6rem;
}

.rhythm-studio-heading h1 {
  margin: 0.5rem 0 0.35rem;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(2.1rem, 4vw, 3.3rem);
  letter-spacing: -0.045em;
}

.rhythm-studio-heading p,
.score-panel-heading p,
.control-section p {
  margin: 0;
  color: var(--rk-muted);
}

.studio-back-link,
.text-button {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border: 0;
  color: var(--rk-green-strong);
  background: transparent;
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
}

.studio-back-link:hover,
.text-button:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.rhythm-studio-layout {
  display: grid;
  grid-template-columns: minmax(265px, 310px) minmax(0, 1fr);
  align-items: start;
  gap: 1.2rem;
}

.rhythm-controls,
.rhythm-score-panel {
  border: 1px solid var(--rk-border);
  border-radius: 1.35rem;
  background: var(--rk-surface);
  box-shadow: var(--rk-shadow);
}

.rhythm-controls {
  position: sticky;
  top: 6.7rem;
  padding: 0.3rem 1.25rem 1.25rem;
}

.control-section {
  padding: 1.15rem 0;
  border-bottom: 1px solid var(--rk-border);
}

.control-section:last-child {
  border-bottom: 0;
}

.control-section h2 {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0 0 0.25rem;
  font-size: 0.96rem;
  font-weight: 800;
}

.control-section h2 > span {
  color: var(--rk-amber);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
}

.control-section p {
  font-size: 0.78rem;
  line-height: 1.5;
}

.meter-control {
  display: flex;
  width: 150px;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.75rem;
}

.meter-control .form-select {
  min-height: 42px;
  text-align: center;
}

.meter-divider {
  color: var(--rk-muted);
  font-size: 1.2rem;
  font-weight: 700;
}

.control-hint {
  margin-top: 0.55rem !important;
  font-size: 0.69rem !important;
}

.tempo-number,
.measure-count {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--rk-muted);
  font-size: 0.75rem;
  font-weight: 700;
}

.tempo-number input {
  width: 4.1rem;
  padding: 0.4rem;
  border: 1px solid var(--rk-border);
  border-radius: 0.65rem;
  color: var(--rk-text);
  background: var(--rk-bg);
  font-size: 1rem;
  font-weight: 800;
  text-align: center;
}

.tempo-range {
  margin: 0.75rem 0 0;
}

.range-labels {
  display: flex;
  justify-content: space-between;
  color: var(--rk-muted);
  font-size: 0.68rem;
}

.measure-count .form-select {
  width: 4rem;
  min-height: 38px;
  padding: 0.35rem 1.7rem 0.35rem 0.65rem;
  color: var(--rk-text);
  background-color: var(--rk-bg);
  font-weight: 800;
}

.symbol-section > p {
  margin-bottom: 0.7rem;
}

.duration-options {
  display: grid;
  gap: 0.35rem;
}

.duration-option {
  display: flex;
  min-height: 48px;
  align-items: center;
  gap: 0.75rem;
  padding: 0.4rem 0.65rem;
  border: 1px solid transparent;
  border-radius: 0.8rem;
  color: var(--rk-text);
  background: transparent;
  text-align: left;
}

.duration-option:hover {
  background: var(--rk-surface-soft);
}

.duration-option-active {
  border-color: color-mix(in srgb, var(--rk-green) 45%, var(--rk-border));
  background: var(--rk-green-soft);
}

.duration-symbol {
  width: 2rem;
  color: var(--rk-green-strong);
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.65rem;
  line-height: 1;
  text-align: center;
}

.duration-copy {
  display: grid;
  gap: 0.05rem;
}

.duration-copy strong {
  font-size: 0.78rem;
}

.duration-copy small {
  color: var(--rk-muted);
  font-size: 0.68rem;
}

.kind-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.4rem;
  margin-top: 0.75rem;
  padding: 0.25rem;
  border-radius: 0.8rem;
  background: var(--rk-surface-soft);
}

.kind-button {
  display: flex;
  min-height: 38px;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  border: 0;
  border-radius: 0.6rem;
  color: var(--rk-muted);
  background: transparent;
  font-size: 0.78rem;
  font-weight: 700;
}

.kind-button-active {
  color: var(--rk-green-strong);
  background: var(--rk-surface);
  box-shadow: 0 2px 8px rgb(0 0 0 / 7%);
}

.playback-controls {
  display: grid;
  gap: 0.55rem;
}

.playback-button,
.presentation-button {
  display: flex;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  border-radius: 0.8rem;
  font-weight: 700;
}

.presentation-button {
  border-color: var(--rk-border);
  color: var(--rk-text);
}

.rhythm-score-panel {
  min-width: 0;
  padding: 1.45rem;
}

.score-panel-heading {
  align-items: flex-start;
}

.score-meter {
  display: inline-grid;
  min-width: 2.65rem;
  min-height: 2.3rem;
  place-items: center;
  margin-bottom: 0.55rem;
  border-radius: 0.7rem;
  color: var(--rk-green-strong);
  background: var(--rk-green-soft);
  font-weight: 800;
}

.score-panel-heading h2,
.save-heading h2 {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.3rem;
}

.score-panel-heading p {
  margin-top: 0.25rem;
  font-size: 0.81rem;
}

.text-button:disabled {
  cursor: wait;
  opacity: 0.6;
}

.score-instruction {
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
  margin: 1.15rem 0 1.25rem;
  padding: 0.7rem 0.8rem;
  border-radius: 0.8rem;
  color: var(--rk-muted);
  background: var(--rk-bg);
  font-size: 0.77rem;
}

.score-instruction i {
  color: var(--rk-green);
}

.measures-list {
  display: grid;
  gap: 1.15rem;
}

.measure-section h3,
.presentation-measure h3 {
  margin: 0 0 0.3rem 0.1rem;
  color: var(--rk-muted);
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.measure-section {
  min-width: 0;
}

.measure-scroll {
  min-width: 0;
  overflow-x: auto;
  padding: 0.15rem 0.15rem 0.65rem;
  scrollbar-color: var(--rk-border) transparent;
}

.score-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem 1.3rem;
  margin-top: 0.55rem;
  color: var(--rk-muted);
  font-size: 0.7rem;
}

.score-legend span {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.legend-sound,
.legend-rest,
.legend-beat {
  display: inline-block;
  width: 0.85rem;
  height: 0.62rem;
  border: 1px solid var(--rk-green);
  border-radius: 0.2rem;
  background: var(--rk-green-soft);
}

.legend-rest {
  border-style: dashed;
  border-color: var(--rk-amber);
  background: var(--rk-amber-soft);
}

.legend-beat {
  width: 0.12rem;
  border: 0;
  border-radius: 0;
  background: var(--rk-green);
}

.save-exercise {
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--rk-border);
}

.save-heading {
  margin-bottom: 0.9rem;
}

.save-heading .eyebrow {
  font-size: 0.66rem;
}

.save-heading h2 {
  margin-top: 0.15rem;
  font-size: 1.15rem;
}

.saved-work-controls {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr) auto;
  align-items: end;
  gap: 0.65rem;
}

.saved-select,
.saved-title {
  display: grid;
  gap: 0.3rem;
  color: var(--rk-muted);
  font-size: 0.72rem;
  font-weight: 700;
}

.saved-select .form-select,
.saved-title .form-control {
  min-height: 42px;
  color: var(--rk-text);
  background-color: var(--rk-bg);
  font-size: 0.82rem;
}

.save-button {
  min-height: 42px;
  white-space: nowrap;
}

.sign-in-note {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  padding: 0.85rem;
  border-radius: 0.8rem;
  color: var(--rk-muted);
  background: var(--rk-bg);
  font-size: 0.8rem;
}

.sign-in-note > i {
  color: var(--rk-green);
  font-size: 1.1rem;
}

.sign-in-note p {
  margin: 0;
}

.field-error,
.editor-alert {
  color: #a33d30;
  font-size: 0.75rem;
}

.editor-alert,
.editor-notice {
  margin: 0.75rem 0 0;
}

.editor-notice {
  color: var(--rk-green-strong);
  font-size: 0.8rem;
}

.presentation-overlay {
  position: fixed;
  z-index: 1100;
  inset: 0;
  display: flex;
  flex-direction: column;
  padding: clamp(1rem, 3vw, 2.5rem);
  color: var(--rk-text);
  background: var(--rk-bg);
}

.presentation-toolbar {
  align-items: center;
  padding-bottom: 1.1rem;
  border-bottom: 1px solid var(--rk-border);
}

.presentation-toolbar h2 {
  margin: 0.2rem 0 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(1.35rem, 3vw, 2.1rem);
}

.presentation-actions {
  justify-content: flex-end;
}

.presentation-meter {
  color: var(--rk-muted);
  font-size: 0.85rem;
  font-weight: 700;
  white-space: nowrap;
}

.presentation-actions .btn {
  white-space: nowrap;
}

.presentation-close {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border: 1px solid var(--rk-border);
  border-radius: 50%;
  color: var(--rk-text);
  background: var(--rk-surface);
}

.presentation-body {
  display: grid;
  gap: 1.4rem;
  overflow: auto;
  padding: 1.5rem 0;
}

.presentation-beat-count {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.presentation-beat-count span {
  display: grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  border: 1px solid var(--rk-border);
  border-radius: 50%;
  color: var(--rk-muted);
  font-size: 0.8rem;
  font-weight: 800;
}

.presentation-beat-count .presentation-beat-active {
  border-color: var(--rk-amber);
  color: var(--rk-text);
  background: var(--rk-amber-soft);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--rk-amber) 25%, transparent);
}

.presentation-measure h3 {
  margin-bottom: 0.5rem;
  text-align: center;
}

.presentation-hint {
  margin: auto 0 0;
  padding-top: 0.8rem;
  color: var(--rk-muted);
  font-size: 0.78rem;
  text-align: center;
}

@media (max-width: 950px) {
  .rhythm-studio-layout {
    grid-template-columns: 1fr;
  }

  .rhythm-controls {
    position: static;
  }

  .control-section {
    padding: 0.9rem 0;
  }

  .duration-options {
    grid-template-columns: repeat(auto-fit, minmax(175px, 1fr));
  }
}

@media (max-width: 650px) {
  .rhythm-studio-content {
    width: min(100% - 1.5rem, 1240px);
  }

  .rhythm-studio-page {
    padding-top: 1.3rem;
  }

  .rhythm-studio-heading {
    align-items: flex-start;
  }

  .studio-back-link {
    padding-top: 1rem;
    white-space: nowrap;
  }

  .rhythm-score-panel {
    padding: 1rem;
  }

  .saved-work-controls {
    grid-template-columns: 1fr;
  }

  .save-button {
    width: 100%;
  }

  .presentation-overlay {
    padding: 1rem;
  }

  .presentation-toolbar {
    align-items: flex-start;
  }

  .presentation-actions {
    flex-wrap: wrap;
    gap: 0.45rem;
  }

  .presentation-meter {
    flex-basis: 100%;
    text-align: right;
  }

  .presentation-actions .btn {
    min-height: 40px;
    padding: 0.45rem 0.7rem;
  }
}
</style>
