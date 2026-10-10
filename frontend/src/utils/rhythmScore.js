export const MIN_TEMPO = 40
export const MAX_TEMPO = 240
export const MAX_MEASURES = 8
export const TICKS_PER_WHOLE_NOTE = 16

export const DURATION_OPTIONS = [
  { ticks: 16, symbol: '𝅝', label: 'Vesela nots', syllable: 'TA-A-A-A' },
  { ticks: 8, symbol: '𝅗𝅥', label: 'Pusnots', syllable: 'TA-A' },
  { ticks: 4, symbol: '♩', label: 'Ceturtdaļnots', syllable: 'TA' },
  { ticks: 2, symbol: '♪', label: 'Astotdaļnots', syllable: 'TI' },
  { ticks: 1, symbol: '𝅘𝅥𝅯', label: 'Sešpadsmitdaļnots', syllable: 'TIRI' },
]

export const TIME_SIGNATURE_NUMERATORS = [2, 3, 4, 5, 6, 7]
export const TIME_SIGNATURE_DENOMINATORS = [2, 4, 8]

export function createEmptyRhythmScore() {
  return {
    schemaVersion: 1,
    timeSignature: { numerator: 4, denominator: 4 },
    tempo: 90,
    measureCount: 2,
    events: [],
  }
}

export function getBeatTicks(denominator) {
  return TICKS_PER_WHOLE_NOTE / denominator
}

export function getMeasureTicks(timeSignature) {
  return timeSignature.numerator * getBeatTicks(timeSignature.denominator)
}

export function canPlaceRhythmEvent(events, measure, position, duration, measureTicks) {
  if (
    !Number.isInteger(measure) ||
    measure < 1 ||
    !Number.isInteger(position) ||
    position < 0 ||
    !Number.isInteger(duration) ||
    duration < 1 ||
    position + duration > measureTicks
  ) {
    return false
  }

  const end = position + duration

  return !events.some((event) => {
    if (event.measure !== measure) return false

    const existingEnd = event.position + event.duration
    return position < existingEnd && event.position < end
  })
}

export function normalizeRhythmScore(content) {
  if (
    !content ||
    content.schemaVersion !== 1 ||
    !content.timeSignature ||
    !TIME_SIGNATURE_NUMERATORS.includes(content.timeSignature.numerator) ||
    !TIME_SIGNATURE_DENOMINATORS.includes(content.timeSignature.denominator) ||
    !Number.isInteger(content.tempo) ||
    content.tempo < MIN_TEMPO ||
    content.tempo > MAX_TEMPO ||
    !Number.isInteger(content.measureCount) ||
    content.measureCount < 1 ||
    content.measureCount > MAX_MEASURES ||
    !Array.isArray(content.events)
  ) {
    throw new Error('Šī vingrinājuma ritma dati nav derīgi.')
  }

  const measureTicks = getMeasureTicks(content.timeSignature)
  const allowedDurations = DURATION_OPTIONS.map((option) => option.ticks)
  const ids = new Set()
  const events = []

  for (const event of content.events) {
    if (
      !event ||
      (typeof event.id !== 'string' && typeof event.id !== 'number') ||
      ids.has(event.id) ||
      !Number.isInteger(event.measure) ||
      event.measure < 1 ||
      event.measure > content.measureCount ||
      !Number.isInteger(event.position) ||
      !Number.isInteger(event.duration) ||
      !allowedDurations.includes(event.duration) ||
      !['sound', 'rest'].includes(event.kind)
    ) {
      throw new Error('Šī vingrinājuma ritma dati nav derīgi.')
    }

    if (!canPlaceRhythmEvent(events, event.measure, event.position, event.duration, measureTicks)) {
      throw new Error('Šī vingrinājuma ritma dati nav derīgi.')
    }

    ids.add(event.id)
    events.push({ ...event })
  }

  return {
    schemaVersion: 1,
    timeSignature: { ...content.timeSignature },
    tempo: content.tempo,
    measureCount: content.measureCount,
    events,
  }
}

export function createPlaybackTimeline(score) {
  const beatDuration = 60 / score.tempo
  const beatsPerMeasure = score.timeSignature.numerator
  const totalDuration = score.measureCount * beatsPerMeasure * beatDuration
  const beats = []
  const notes = []

  for (let measure = 1; measure <= score.measureCount; measure += 1) {
    for (let beat = 0; beat < beatsPerMeasure; beat += 1) {
      beats.push({
        measure,
        beat: beat + 1,
        time: ((measure - 1) * beatsPerMeasure + beat) * beatDuration,
        accented: beat === 0,
      })
    }
  }

  for (const event of score.events) {
    if (event.kind !== 'sound') continue

    const positionInBeats = event.position / getBeatTicks(score.timeSignature.denominator)
    notes.push({
      id: event.id,
      measure: event.measure,
      position: event.position,
      time: ((event.measure - 1) * beatsPerMeasure + positionInBeats) * beatDuration,
    })
  }

  return { beatDuration, totalDuration, beats, notes }
}

export function getPlaybackPosition(elapsedSeconds, score) {
  const beatDuration = 60 / score.tempo
  const beatsPerMeasure = score.timeSignature.numerator
  const totalBeats = score.measureCount * beatsPerMeasure
  const absoluteBeat = Math.min(
    totalBeats - 1,
    Math.max(0, Math.floor(elapsedSeconds / beatDuration)),
  )
  const beatStartTime = absoluteBeat * beatDuration
  const beatProgress = Math.min(0.999, Math.max(0, (elapsedSeconds - beatStartTime) / beatDuration))

  return {
    measure: Math.floor(absoluteBeat / beatsPerMeasure) + 1,
    beat: (absoluteBeat % beatsPerMeasure) + 1,
    position: Math.floor(beatProgress * getBeatTicks(score.timeSignature.denominator)),
  }
}
