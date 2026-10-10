<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import GestureCueTimeline from '../components/GestureCueTimeline.vue'
import { useCrudResource } from '../composables/useCrudResource'
import { apiRequest, resolveApiUrl } from '../services/api'
import { useAuthStore } from '../stores/auth'
import {
  addGestureCue,
  createEmptyGestureSequence,
  formatTime,
  getActiveCueId,
  GESTURES,
  MAX_SEQUENCE_SECONDS,
  normalizeGestureSequence,
} from '../utils/gestureSequence'

const MAX_AUDIO_SIZE = 50 * 1024 * 1024
const ACCEPTED_AUDIO_EXTENSIONS = /\.(mp3|wav|ogg|m4a|webm)$/i

const auth = useAuthStore()
const sequence = ref(createEmptyGestureSequence())
const title = ref('Mans skanošo žestu vingrinājums')
const selectedGesture = ref('clap')
const selectedExerciseId = ref('')
const selectedAudioFile = ref(null)
const audioSource = ref('')
const audioObjectUrl = ref('')
const audioElement = ref(null)
const fileInput = ref(null)
const audioDuration = ref(0)
const currentTime = ref(0)
const isPlaying = ref(false)
const activeCueId = ref(null)
const persistedAudio = ref(false)
const presentationMode = ref(false)
const editorNotice = ref('')
const editorError = ref('')
const resourceError = ref('')
const audioError = ref('')
const crud = useCrudResource('/api/rhythm-exercises')

const savedExercises = crud.items
const { saving, validationErrors } = crud
const cues = computed(() => sequence.value.cues)
const activeCue = computed(() => cues.value.find((cue) => cue.id === activeCueId.value) || null)
const currentGesture = computed(() =>
  GESTURES.find((gesture) => gesture.id === (activeCue.value?.gesture || selectedGesture.value)),
)
const hasAudio = computed(() => Boolean(audioSource.value))

watch(
  () => auth.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      void loadSavedExercises()
    } else {
      savedExercises.value = []
      resetExerciseSelection()
    }
  },
  { immediate: true },
)

watch(
  cues,
  (value) => {
    activeCueId.value = getActiveCueId(value, currentTime.value)
  },
  { deep: true },
)

function makeCueId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function releaseAudioObjectUrl() {
  if (audioObjectUrl.value) {
    URL.revokeObjectURL(audioObjectUrl.value)
    audioObjectUrl.value = ''
  }
}

function resetExerciseSelection() {
  selectedExerciseId.value = ''
  sequence.value = createEmptyGestureSequence()
  title.value = 'Mans skanošo žestu vingrinājums'
  selectedAudioFile.value = null
  persistedAudio.value = false
  audioSource.value = ''
  currentTime.value = 0
  audioDuration.value = 0
  activeCueId.value = null
  releaseAudioObjectUrl()
  if (fileInput.value) fileInput.value.value = ''
}

async function loadSavedExercises() {
  try {
    await crud.list({ per_page: 50, sort: 'updated_at', direction: 'desc' })
    resourceError.value = ''
  } catch (error) {
    resourceError.value = error.message || 'Saglabātos vingrinājumus neizdevās ielādēt.'
  }
}

function loadSelectedExercise() {
  const exercise = savedExercises.value.find((item) => String(item.id) === selectedExerciseId.value)
  if (!exercise) {
    resetExerciseSelection()
    editorNotice.value = 'Izveidots jauns skanošo žestu vingrinājums.'
    editorError.value = ''
    return
  }

  try {
    sequence.value = normalizeGestureSequence(exercise.content)
    title.value = exercise.title
    selectedAudioFile.value = null
    persistedAudio.value = Boolean(exercise.audio_url)
    audioSource.value = exercise.audio_url ? resolveApiUrl(exercise.audio_url) : ''
    currentTime.value = 0
    audioDuration.value = 0
    activeCueId.value = null
    releaseAudioObjectUrl()
    if (fileInput.value) fileInput.value.value = ''
    editorNotice.value = `Ielādēts vingrinājums “${exercise.title}”.`
    editorError.value = ''
    resourceError.value = ''
  } catch (error) {
    editorError.value = error.message || 'Vingrinājuma datus neizdevās atvērt.'
  }
}

function startNewExercise() {
  resetExerciseSelection()
  editorNotice.value = 'Izveidots jauns skanošo žestu vingrinājums.'
  editorError.value = ''
  resourceError.value = ''
}

function handleAudioSelected(event) {
  const file = event.target.files?.[0]
  if (!file) return

  editorNotice.value = ''
  audioError.value = ''

  if (!ACCEPTED_AUDIO_EXTENSIONS.test(file.name)) {
    audioError.value = 'Izvēlies MP3, WAV, OGG, M4A vai WEBM audio failu.'
    event.target.value = ''
    return
  }
  if (file.size > MAX_AUDIO_SIZE) {
    audioError.value = 'Audio fails nedrīkst būt lielāks par 50 MB.'
    event.target.value = ''
    return
  }

  releaseAudioObjectUrl()
  selectedAudioFile.value = file
  persistedAudio.value = false
  audioObjectUrl.value = URL.createObjectURL(file)
  audioSource.value = audioObjectUrl.value
  currentTime.value = 0
  audioDuration.value = 0
  activeCueId.value = null
}

function handleAudioMetadata() {
  const duration = audioElement.value?.duration || 0
  if (!Number.isFinite(duration) || duration <= 0) {
    audioError.value = 'Dziesmas ilgumu neizdevās nolasīt. Izvēlies citu audio failu.'
    return
  }
  if (duration > MAX_SEQUENCE_SECONDS) {
    audioError.value = 'Šajā versijā dziesma nedrīkst būt garāka par 60 minūtēm.'
    audioSource.value = ''
    selectedAudioFile.value = null
    releaseAudioObjectUrl()
    if (fileInput.value) fileInput.value.value = ''
    return
  }

  audioDuration.value = duration
  audioError.value = ''
}

function handleAudioTimeUpdate() {
  currentTime.value = audioElement.value?.currentTime || 0
  activeCueId.value = getActiveCueId(cues.value, currentTime.value)
}

function handleAudioPlayState(event) {
  isPlaying.value = event.type === 'play'
}

function recordGesture(gesture) {
  if (!audioElement.value || !hasAudio.value) return

  try {
    const cueTime = Math.round(audioElement.value.currentTime * 100) / 100
    sequence.value = {
      ...sequence.value,
      cues: addGestureCue(cues.value, gesture, cueTime, makeCueId()),
    }
    selectedGesture.value = gesture
    currentTime.value = cueTime
    activeCueId.value = getActiveCueId(cues.value, currentTime.value)
    editorNotice.value = ''
    editorError.value = ''
  } catch (error) {
    editorError.value = error.message
  }
}

function removeCue(id) {
  sequence.value = {
    ...sequence.value,
    cues: cues.value.filter((cue) => cue.id !== id),
  }
}

function seekTo(seconds) {
  if (!audioElement.value) return
  audioElement.value.currentTime = seconds
  handleAudioTimeUpdate()
}

function toggleAudioPlayback() {
  if (!audioElement.value) return

  if (audioElement.value.paused) {
    audioElement.value.play().catch((error) => {
      audioError.value = error.message || 'Dziesmu neizdevās atskaņot.'
    })
  } else {
    audioElement.value.pause()
  }
}

function startPresentation() {
  if (!audioElement.value || cues.value.length === 0) return

  audioElement.value.pause()
  audioElement.value.currentTime = 0
  currentTime.value = 0
  activeCueId.value = getActiveCueId(cues.value, 0)
  isPlaying.value = false
  presentationMode.value = true
}

async function uploadSelectedAudio(exerciseId) {
  if (!selectedAudioFile.value) return null

  const formData = new FormData()
  formData.append('audio', selectedAudioFile.value)
  return apiRequest(`/api/rhythm-exercises/${encodeURIComponent(exerciseId)}/audio`, {
    method: 'POST',
    body: formData,
  })
}

async function saveExercise() {
  editorNotice.value = ''
  editorError.value = ''
  resourceError.value = ''

  let content
  try {
    content = normalizeGestureSequence(sequence.value)
  } catch (error) {
    editorError.value = error.message
    return
  }

  const payload = { title: title.value, content }

  try {
    let saved
    if (selectedExerciseId.value) {
      saved = await crud.update(selectedExerciseId.value, payload)
    } else {
      saved = await crud.create(payload)
      selectedExerciseId.value = String(saved.id)
    }

    if (selectedAudioFile.value) {
      try {
        const audioResult = await uploadSelectedAudio(saved.id)
        saved = { ...saved, ...audioResult.data }
        persistedAudio.value = true
        selectedAudioFile.value = null
        releaseAudioObjectUrl()
        audioSource.value = saved.audio_url ? resolveApiUrl(saved.audio_url) : ''
        if (fileInput.value) fileInput.value.value = ''
      } catch (error) {
        resourceError.value = `Vingrinājuma dati ir saglabāti, bet dziesmas failu neizdevās augšupielādēt: ${error.message}`
        return
      }
    }

    await loadSavedExercises()
    editorNotice.value = `Vingrinājums “${saved.title}” saglabāts.`
  } catch (error) {
    resourceError.value = error.message || 'Vingrinājumu neizdevās saglabāt.'
  }
}

async function removeSavedAudio() {
  if (!selectedExerciseId.value || !persistedAudio.value) return

  try {
    const result = await apiRequest(
      `/api/rhythm-exercises/${encodeURIComponent(selectedExerciseId.value)}/audio`,
      { method: 'DELETE' },
    )
    persistedAudio.value = false
    audioElement.value?.pause()
    isPlaying.value = false
    selectedAudioFile.value = null
    audioSource.value = ''
    currentTime.value = 0
    audioDuration.value = 0
    releaseAudioObjectUrl()
    if (fileInput.value) fileInput.value.value = ''
    await loadSavedExercises()
    editorNotice.value = result.message
  } catch (error) {
    resourceError.value = error.message || 'Dziesmu neizdevās noņemt.'
  }
}

function handleAudioError() {
  if (!audioSource.value) return
  audioError.value =
    'Dziesmas failu neizdevās atvērt. Pārbaudi savienojumu vai izvēlies to vēlreiz.'
}

function handleKeydown(event) {
  if (event.key === 'Escape' && presentationMode.value) {
    presentationMode.value = false
  }
}

watch(presentationMode, (isOpen) => {
  if (isOpen) {
    window.addEventListener('keydown', handleKeydown)
  } else {
    window.removeEventListener('keydown', handleKeydown)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  releaseAudioObjectUrl()
})
</script>

<template>
  <div class="sound-gestures-page">
    <div class="sound-gestures-content">
      <header class="studio-heading">
        <div>
          <span class="eyebrow">RITMAKOKA GALVENĀ SADAĻA</span>
          <h1>Skanošie žesti</h1>
          <p>
            Klausies dziesmu, seko izceltajiem žestiem un atzīmē, kurā brīdī klasei tie jāizpilda.
          </p>
        </div>
        <RouterLink class="back-link" to="/">
          <i class="bi bi-arrow-left" aria-hidden="true"></i>
          Uz sākumu
        </RouterLink>
      </header>

      <main class="gesture-workspace" aria-label="Skanošo žestu veidotājs">
        <section class="song-panel" aria-labelledby="song-title">
          <div class="panel-heading">
            <div>
              <span class="step-label">01 · DZIESMA</span>
              <h2 id="song-title">Izvēlies dziesmu</h2>
            </div>
            <span v-if="persistedAudio" class="saved-badge">
              <i class="bi bi-cloud-check" aria-hidden="true"></i>
              Saglabāta
            </span>
          </div>

          <label class="audio-picker" for="song-audio">
            <span class="picker-icon" aria-hidden="true">
              <i class="bi bi-music-note-list"></i>
            </span>
            <span>
              <strong>{{
                selectedAudioFile?.name ||
                (hasAudio ? 'Nomainīt dziesmu' : 'Izvēlēties audio failu')
              }}</strong>
              <small>MP3, WAV, OGG, M4A vai WEBM · līdz 50 MB</small>
            </span>
            <span class="picker-action">Pārlūkot</span>
          </label>
          <input
            id="song-audio"
            ref="fileInput"
            class="visually-hidden"
            type="file"
            accept=".mp3,.wav,.ogg,.m4a,.webm,audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/webm"
            aria-label="Izvēlēties dziesmas audio failu"
            @change="handleAudioSelected"
          />

          <audio
            v-if="hasAudio"
            ref="audioElement"
            class="song-audio"
            :src="audioSource"
            crossorigin="use-credentials"
            controls
            preload="metadata"
            @loadedmetadata="handleAudioMetadata"
            @timeupdate="handleAudioTimeUpdate"
            @seeked="handleAudioTimeUpdate"
            @play="handleAudioPlayState"
            @pause="handleAudioPlayState"
            @ended="handleAudioPlayState"
            @error="handleAudioError"
          ></audio>
          <div v-else class="audio-empty">
            <i class="bi bi-headphones" aria-hidden="true"></i>
            <span>Izvēlies dziesmu, lai sāktu veidot žestu secību.</span>
          </div>

          <div v-if="hasAudio" class="audio-time-row">
            <span>{{ formatTime(currentTime) }}</span>
            <span>{{ audioDuration ? formatTime(audioDuration) : '—:—' }}</span>
          </div>
          <p v-if="selectedAudioFile && !persistedAudio" class="upload-reminder">
            Dziesma tiks pievienota vingrinājumam, kad to saglabāsi.
          </p>
          <p v-if="audioError" class="inline-error" role="alert">{{ audioError }}</p>
        </section>

        <section class="gesture-panel" aria-labelledby="gesture-title">
          <div class="panel-heading">
            <div>
              <span class="step-label">02 · ŽESTI</span>
              <h2 id="gesture-title">Pievieno žestu dziesmai</h2>
            </div>
            <span class="cue-count">{{ cues.length }} / 500</span>
          </div>
          <p class="section-help">
            Atskaņo dziesmu un nospied žestu brīdī, kad tas jāizpilda. Žests tiks atzīmēts dziesmas
            laika skalā.
          </p>

          <div
            class="gesture-buttons"
            role="group"
            aria-label="Pievienot žestu pašreizējā dziesmas brīdī"
          >
            <button
              v-for="gesture in GESTURES"
              :key="gesture.id"
              class="gesture-button"
              :class="[
                `gesture-button-${gesture.id}`,
                { 'gesture-button-selected': selectedGesture === gesture.id },
              ]"
              type="button"
              :disabled="!hasAudio || cues.length >= 500"
              :aria-label="`Pievienot ${gesture.label} pie ${formatTime(currentTime)}`"
              :aria-pressed="selectedGesture === gesture.id"
              @click="recordGesture(gesture.id)"
            >
              <span class="gesture-emoji" aria-hidden="true">{{ gesture.icon }}</span>
              <strong>{{ gesture.label }}</strong>
              <small>{{ formatTime(currentTime) }}</small>
            </button>
          </div>

          <div class="current-gesture-card" :class="`current-gesture-${currentGesture?.id}`">
            <span class="current-gesture-label">
              {{ activeCue ? `Tagad: ${formatTime(activeCue.at)}` : 'Gatavs nākamajam žestam' }}
            </span>
            <span class="current-gesture-emoji" aria-hidden="true">
              {{ currentGesture?.icon }}
            </span>
            <strong>{{ activeCue ? currentGesture?.label : 'Izvēlies žestu' }}</strong>
            <span v-if="activeCue" class="current-gesture-instruction">
              Izpildi žestu kopā ar dziesmu!
            </span>
          </div>

          <div class="cue-timeline-section">
            <div class="timeline-heading">
              <h3>Žestu secība</h3>
              <button
                v-if="cues.length"
                class="clear-cues"
                type="button"
                @click="sequence = { ...sequence, cues: [] }"
              >
                Notīrīt žestus
              </button>
            </div>
            <GestureCueTimeline
              :cues="cues"
              :duration="audioDuration"
              :current-time="currentTime"
              :active-cue-id="activeCueId"
              :disabled="!hasAudio"
              @seek="seekTo"
              @remove="removeCue"
            />
          </div>
        </section>

        <section v-if="auth.isAuthenticated" class="save-panel" aria-labelledby="save-title">
          <div class="panel-heading">
            <div>
              <span class="step-label">03 · SAGLABĀŠANA</span>
              <h2 id="save-title">Tavi vingrinājumi</h2>
            </div>
            <button class="new-exercise" type="button" @click="startNewExercise">
              Jauns vingrinājums
            </button>
          </div>
          <div class="save-fields">
            <label>
              <span>Atvērt saglabātu vingrinājumu</span>
              <select
                v-model="selectedExerciseId"
                class="form-select"
                aria-label="Atvērt saglabātu vingrinājumu"
                @change="loadSelectedExercise"
              >
                <option value="">Jauns vingrinājums</option>
                <option
                  v-for="exercise in savedExercises"
                  :key="exercise.id"
                  :value="String(exercise.id)"
                >
                  {{ exercise.title }}{{ exercise.audio_url ? ' · ar dziesmu' : '' }}
                </option>
              </select>
            </label>
            <label>
              <span>Vingrinājuma nosaukums</span>
              <input
                v-model="title"
                class="form-control"
                maxlength="255"
                placeholder="Piemēram, Ritms pavasara dziesmai"
              />
            </label>
            <button
              class="btn btn-primary save-button"
              type="button"
              :disabled="saving"
              @click="saveExercise"
            >
              <span
                v-if="saving"
                class="spinner-border spinner-border-sm"
                aria-hidden="true"
              ></span>
              <i v-else class="bi bi-cloud-arrow-up" aria-hidden="true"></i>
              {{ saving ? 'Saglabā…' : 'Saglabāt vingrinājumu' }}
            </button>
            <button
              v-if="persistedAudio"
              class="remove-audio-button"
              type="button"
              @click="removeSavedAudio"
            >
              Noņemt saglabāto dziesmu
            </button>
          </div>
          <p v-if="validationErrors.title?.[0]" class="inline-error" role="alert">
            {{ validationErrors.title[0] }}
          </p>
        </section>

        <section v-else class="save-panel sign-in-panel">
          <i class="bi bi-person-lock" aria-hidden="true"></i>
          <p>
            Vingrinājumu var veidot arī bez konta. Lai saglabātu dziesmu un žestus, lūdzu,
            <RouterLink to="/login">pieslēdzies</RouterLink>
            vai
            <RouterLink to="/register">reģistrējies</RouterLink>.
          </p>
        </section>

        <p v-if="resourceError" class="inline-error" role="alert">{{ resourceError }}</p>
        <p v-if="editorError" class="inline-error" role="alert">{{ editorError }}</p>
        <p v-if="editorNotice" class="inline-success" role="status">{{ editorNotice }}</p>

        <aside class="future-instrument-note">
          <i class="bi bi-info-circle" aria-hidden="true"></i>
          <p>
            Šeit veidojam žestu vingrinājumus. Atsevišķā <strong>Mūzikas instrumentu</strong>
            sadaļā vēlāk varēs pievienot kociņus, trijstūri un citus klasē pieejamos instrumentus.
          </p>
        </aside>

        <section class="presentation-launch-panel" aria-labelledby="presentation-launch-title">
          <div>
            <span class="step-label">NODARBĪBAI</span>
            <h2 id="presentation-launch-title">Rādi žestus klasei</h2>
            <p>
              Sāc prezentāciju, lai dziesmai skanot uz ekrāna izceltu katru nākamo žestu. Atverot
              režīmu, dziesma sāksies no sākuma.
            </p>
            <p v-if="!hasAudio || !cues.length" class="presentation-requirement">
              Lai sāktu, pievieno dziesmu un vismaz vienu žestu.
            </p>
          </div>
          <button
            class="btn btn-primary presentation-launch-button"
            type="button"
            :disabled="!hasAudio || cues.length === 0"
            @click="startPresentation"
          >
            <i class="bi bi-easel" aria-hidden="true"></i>
            Sākt prezentāciju
          </button>
        </section>
      </main>
    </div>

    <div
      v-if="presentationMode"
      class="presentation-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="presentation-title"
      @click.self="presentationMode = false"
    >
      <div class="presentation-header">
        <div>
          <span class="step-label">SKANOŠIE ŽESTI</span>
          <h2 id="presentation-title">{{ title || 'Žestu vingrinājums' }}</h2>
        </div>
        <div class="presentation-actions">
          <button
            v-if="hasAudio"
            class="btn btn-primary"
            type="button"
            @click="toggleAudioPlayback"
          >
            <i :class="isPlaying ? 'bi bi-pause-fill' : 'bi bi-play-fill'" aria-hidden="true"></i>
            {{ isPlaying ? 'Apturēt dziesmu' : 'Atskaņot dziesmu' }}
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
      <div class="presentation-stage" aria-live="polite" aria-atomic="true">
        <template v-if="activeCue">
          <span class="presentation-time">{{ formatTime(activeCue.at) }}</span>
          <span
            class="presentation-emoji"
            :class="`presentation-emoji-${currentGesture?.id}`"
            aria-hidden="true"
          >
            {{ currentGesture?.icon }}
          </span>
          <h3>{{ currentGesture?.label }}</h3>
          <p>Izpildi šo žestu kopā ar dziesmu!</p>
        </template>
        <template v-else>
          <span class="presentation-emoji presentation-emoji-ready" aria-hidden="true">♪</span>
          <h3>Gatavojies!</h3>
          <p>Žesti tiks izcelti dziesmai skanot.</p>
        </template>
      </div>
      <div class="presentation-footer">
        <span
          >{{ formatTime(currentTime) }} /
          {{ audioDuration ? formatTime(audioDuration) : '—:—' }}</span
        >
        <div class="presentation-upcoming" aria-label="Nākamie žesti">
          <span>Nākamie:</span>
          <span
            v-for="cue in cues.filter((item) => item.at > currentTime).slice(0, 4)"
            :key="cue.id"
            :title="`${GESTURES.find((gesture) => gesture.id === cue.gesture)?.label} — ${formatTime(cue.at)}`"
          >
            {{ GESTURES.find((gesture) => gesture.id === cue.gesture)?.icon }}
          </span>
          <span v-if="!cues.some((item) => item.at > currentTime)">—</span>
        </div>
        <button class="btn btn-outline-secondary" type="button" @click="presentationMode = false">
          Aizvērt (Esc)
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sound-gestures-page {
  padding: 2.25rem 0 4rem;
}

.sound-gestures-content {
  width: min(100% - 3rem, 1000px);
  margin: 0 auto;
}

.studio-heading,
.panel-heading,
.timeline-heading,
.presentation-header,
.presentation-actions,
.presentation-footer,
.presentation-upcoming {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.studio-heading {
  margin-bottom: 1.7rem;
}

.studio-heading h1 {
  margin: 0.45rem 0 0.35rem;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(2.3rem, 5vw, 3.5rem);
  letter-spacing: -0.05em;
}

.studio-heading p {
  max-width: 660px;
  margin: 0;
  color: var(--rk-muted);
}

.back-link {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 0.45rem;
  color: var(--rk-green-strong);
  font-size: 0.88rem;
  font-weight: 700;
  text-decoration: none;
}

.gesture-workspace {
  display: grid;
  gap: 1rem;
}

.song-panel,
.gesture-panel,
.save-panel,
.presentation-launch-panel {
  min-width: 0;
  padding: clamp(1rem, 3vw, 1.5rem);
  border: 1px solid var(--rk-border);
  border-radius: 1.3rem;
  background: var(--rk-surface);
  box-shadow: var(--rk-shadow);
}

.presentation-launch-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  border-color: var(--rk-green);
  background: linear-gradient(
    115deg,
    color-mix(in srgb, var(--rk-green-soft) 75%, var(--rk-surface)),
    var(--rk-surface)
  );
}

.presentation-launch-panel h2 {
  margin: 0.25rem 0 0.35rem;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.35rem;
}

.presentation-launch-panel p {
  max-width: 650px;
  margin: 0;
  color: var(--rk-muted);
  font-size: 0.82rem;
}

.presentation-launch-panel .presentation-requirement {
  margin-top: 0.45rem;
  color: var(--rk-green-strong);
  font-weight: 700;
}

.presentation-launch-button {
  display: inline-flex;
  min-height: 48px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.7rem 1.2rem;
  font-weight: 800;
}

.presentation-launch-button:disabled {
  cursor: not-allowed;
}

.panel-heading {
  align-items: flex-start;
  margin-bottom: 1rem;
}

.step-label {
  color: var(--rk-amber);
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.1em;
}

.panel-heading h2 {
  margin: 0.25rem 0 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.35rem;
}

.saved-badge,
.cue-count {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  color: var(--rk-green-strong);
  background: var(--rk-green-soft);
  font-size: 0.72rem;
  font-weight: 800;
  white-space: nowrap;
}

.audio-picker {
  display: flex;
  min-height: 76px;
  align-items: center;
  gap: 0.85rem;
  padding: 0.8rem 1rem;
  border: 1px dashed color-mix(in srgb, var(--rk-green) 55%, var(--rk-border));
  border-radius: 1rem;
  background: var(--rk-bg);
  cursor: pointer;
  transition: background-color 140ms ease;
}

.audio-picker:hover {
  background: var(--rk-green-soft);
}

.picker-icon {
  display: grid;
  width: 2.7rem;
  height: 2.7rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 0.8rem;
  color: var(--rk-green-strong);
  background: var(--rk-green-soft);
  font-size: 1.15rem;
}

.audio-picker > span:nth-child(2) {
  display: grid;
  min-width: 0;
  gap: 0.1rem;
}

.audio-picker strong,
.audio-picker small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.audio-picker strong {
  color: var(--rk-text);
  font-size: 0.85rem;
}

.audio-picker small {
  color: var(--rk-muted);
  font-size: 0.72rem;
}

.picker-action {
  flex: 0 0 auto;
  margin-left: auto;
  color: var(--rk-green-strong);
  font-size: 0.78rem;
  font-weight: 800;
}

.song-audio {
  display: block;
  width: 100%;
  height: 54px;
  margin-top: 0.8rem;
}

.audio-empty {
  display: flex;
  min-height: 54px;
  align-items: center;
  gap: 0.55rem;
  margin-top: 0.75rem;
  color: var(--rk-muted);
  font-size: 0.8rem;
}

.audio-empty i {
  color: var(--rk-green);
  font-size: 1.1rem;
}

.audio-time-row {
  display: flex;
  justify-content: space-between;
  margin-top: 0.25rem;
  color: var(--rk-muted);
  font-size: 0.72rem;
  font-variant-numeric: tabular-nums;
}

.upload-reminder {
  margin: 0.4rem 0 0;
  color: var(--rk-muted);
  font-size: 0.73rem;
}

.section-help {
  margin: -0.35rem 0 1rem;
  color: var(--rk-muted);
  font-size: 0.82rem;
}

.gesture-buttons {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.gesture-button {
  display: grid;
  min-height: 145px;
  align-content: center;
  justify-items: center;
  gap: 0.4rem;
  padding: 0.8rem;
  border: 1px solid var(--rk-border);
  border-radius: 1rem;
  color: var(--rk-text);
  background: var(--rk-bg);
  transition:
    transform 140ms ease,
    border-color 140ms ease,
    background-color 140ms ease;
}

.gesture-button:not(:disabled):hover {
  transform: translateY(-2px);
  border-color: var(--rk-green);
}

.gesture-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.gesture-button-selected {
  border-color: var(--rk-green);
  background: var(--rk-green-soft);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--rk-green) 14%, transparent);
}

.gesture-emoji {
  font-size: 2.5rem;
  line-height: 1.1;
}

.gesture-button strong {
  font-size: 0.83rem;
}

.gesture-button small {
  color: var(--rk-muted);
  font-size: 0.72rem;
  font-variant-numeric: tabular-nums;
}

.current-gesture-card {
  display: grid;
  min-height: 210px;
  justify-items: center;
  gap: 0.25rem;
  margin-top: 1rem;
  padding: 1.15rem;
  border: 1px solid var(--rk-border);
  border-radius: 1.1rem;
  background: var(--rk-bg);
  transition:
    background-color 120ms ease,
    border-color 120ms ease,
    box-shadow 120ms ease;
}

.current-gesture-clap {
  border-color: #48805e;
  background: color-mix(in srgb, var(--rk-green-soft) 83%, var(--rk-surface));
  box-shadow: inset 0 0 0 2px color-mix(in srgb, #48805e 18%, transparent);
}

.current-gesture-stomp {
  border-color: #b45d37;
  background: color-mix(in srgb, #b45d37 13%, var(--rk-surface));
  box-shadow: inset 0 0 0 2px color-mix(in srgb, #b45d37 18%, transparent);
}

.current-gesture-snap {
  border-color: #7d67a8;
  background: color-mix(in srgb, #7d67a8 13%, var(--rk-surface));
  box-shadow: inset 0 0 0 2px color-mix(in srgb, #7d67a8 18%, transparent);
}

.current-gesture-label {
  color: var(--rk-muted);
  font-size: 0.73rem;
  font-weight: 700;
}

.current-gesture-emoji {
  font-size: clamp(3.3rem, 8vw, 5rem);
  line-height: 1.2;
}

.current-gesture-card strong {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.35rem;
}

.current-gesture-instruction {
  color: var(--rk-muted);
  font-size: 0.78rem;
}

.cue-timeline-section {
  margin-top: 1.15rem;
}

.timeline-heading {
  margin-bottom: 0.7rem;
}

.timeline-heading h3 {
  margin: 0;
  font-size: 0.92rem;
  font-weight: 800;
}

.clear-cues,
.new-exercise,
.remove-audio-button {
  border: 0;
  color: var(--rk-green-strong);
  background: transparent;
  font-size: 0.75rem;
  font-weight: 700;
}

.clear-cues:hover,
.new-exercise:hover,
.remove-audio-button:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.save-fields {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
  align-items: end;
  gap: 0.7rem;
}

.save-fields label {
  display: grid;
  min-width: 0;
  gap: 0.35rem;
  color: var(--rk-muted);
  font-size: 0.72rem;
  font-weight: 700;
}

.save-fields .form-control,
.save-fields .form-select {
  min-height: 42px;
  color: var(--rk-text);
  background-color: var(--rk-bg);
  font-size: 0.82rem;
}

.save-button {
  min-height: 42px;
  white-space: nowrap;
}

.remove-audio-button {
  grid-column: 1 / -1;
  justify-self: start;
  padding: 0;
  color: #a33d30;
}

.sign-in-panel {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  color: var(--rk-muted);
}

.sign-in-panel > i {
  color: var(--rk-green);
  font-size: 1.15rem;
}

.sign-in-panel p {
  margin: 0;
  font-size: 0.82rem;
}

.inline-error,
.inline-success {
  margin: 0.75rem 0 0;
  font-size: 0.78rem;
}

.inline-error {
  color: #a33d30;
}

.inline-success {
  color: var(--rk-green-strong);
}

.future-instrument-note {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  padding: 0.95rem 1.1rem;
  border: 1px solid var(--rk-border);
  border-radius: 1rem;
  color: var(--rk-muted);
  background: var(--rk-surface-soft);
  font-size: 0.8rem;
}

.future-instrument-note > i {
  margin-top: 0.1rem;
  color: var(--rk-green);
}

.future-instrument-note p {
  margin: 0;
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

.presentation-header {
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--rk-border);
}

.presentation-header h2 {
  margin: 0.25rem 0 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(1.3rem, 3vw, 2rem);
}

.presentation-actions {
  justify-content: flex-end;
}

.presentation-close {
  display: grid;
  width: 44px;
  height: 44px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid var(--rk-border);
  border-radius: 50%;
  color: var(--rk-text);
  background: var(--rk-surface);
}

.presentation-stage {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  margin: 1.5rem auto;
  width: min(100%, 700px);
  border: 1px solid var(--rk-border);
  border-radius: 2rem;
  background: var(--rk-surface);
  box-shadow: var(--rk-shadow);
  text-align: center;
}

.presentation-stage:has(.presentation-emoji-clap) {
  border-color: #48805e;
  background: color-mix(in srgb, var(--rk-green-soft) 80%, var(--rk-surface));
}

.presentation-stage:has(.presentation-emoji-stomp) {
  border-color: #b45d37;
  background: color-mix(in srgb, #b45d37 13%, var(--rk-surface));
}

.presentation-stage:has(.presentation-emoji-snap) {
  border-color: #7d67a8;
  background: color-mix(in srgb, #7d67a8 13%, var(--rk-surface));
}

.presentation-time {
  color: var(--rk-muted);
  font-size: 0.9rem;
  font-variant-numeric: tabular-nums;
}

.presentation-emoji {
  font-size: clamp(7rem, 23vw, 14rem);
  line-height: 1.15;
}

.presentation-emoji-ready {
  color: var(--rk-amber);
  font-family: Georgia, 'Times New Roman', serif;
}

.presentation-stage h3 {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(2rem, 6vw, 3.5rem);
}

.presentation-stage p {
  margin: 0;
  color: var(--rk-muted);
  font-size: clamp(0.9rem, 2vw, 1.1rem);
}

.presentation-footer {
  min-height: 48px;
  color: var(--rk-muted);
  font-size: 0.8rem;
  font-variant-numeric: tabular-nums;
}

.presentation-upcoming {
  justify-content: center;
}

.presentation-upcoming > span:not(:first-child) {
  font-size: 1.3rem;
}

@media (max-width: 680px) {
  .sound-gestures-content {
    width: min(100% - 1.5rem, 1000px);
  }

  .studio-heading {
    align-items: flex-start;
  }

  .back-link {
    margin-top: 0.75rem;
    white-space: nowrap;
  }

  .gesture-buttons {
    gap: 0.45rem;
  }

  .gesture-button {
    min-height: 125px;
    padding: 0.55rem 0.3rem;
  }

  .gesture-emoji {
    font-size: 2rem;
  }

  .gesture-button strong {
    font-size: 0.72rem;
  }

  .save-fields {
    grid-template-columns: 1fr;
  }

  .presentation-launch-panel {
    align-items: stretch;
    flex-direction: column;
    gap: 1rem;
  }

  .save-button {
    width: 100%;
  }

  .presentation-launch-button {
    width: 100%;
  }

  .presentation-footer {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.6rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .gesture-button,
  .current-gesture-card {
    transition: none;
  }
}
</style>
