export const MAX_CUES = 500
export const MAX_SEQUENCE_SECONDS = 60 * 60
export const MAX_SEQUENCE_BEATS = 7200
export const DEFAULT_TEMPO = 100
export const DEFAULT_TIME_SIGNATURE = { numerator: 4, denominator: 4 }
export const TIME_SIGNATURE_DENOMINATORS = [2, 4, 8, 16]
export const CUE_LOOKAHEAD_SECONDS = 0.08

export const GESTURES = [
  { id: 'clap', label: 'Plaukšķis', icon: '👏' },
  { id: 'stomp', label: 'Kājiņa', icon: '🦶' },
  { id: 'snap', label: 'Pirkstu knipsis', icon: '🫰' },
]

export function createEmptyGestureSequence() {
  return {
    schemaVersion: 3,
    tempo: DEFAULT_TEMPO,
    timeSignature: { ...DEFAULT_TIME_SIGNATURE },
    cues: [],
  }
}

export function getBeatDuration(tempo, timeSignature) {
  return (60 / tempo) * (4 / timeSignature.denominator)
}

export function getCueTime(beat, tempo, timeSignature) {
  return beat * getBeatDuration(tempo, timeSignature)
}

export function formatTime(seconds) {
  const safeSeconds = Math.max(0, Number(seconds) || 0)
  const minutes = Math.floor(safeSeconds / 60)
  const remainingSeconds = Math.floor(safeSeconds % 60)
  const centiseconds = Math.floor(((safeSeconds % 1) + 0.00000001) * 100)

  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`
}

export function normalizeGestureSequence(content) {
  if (!content) {
    throw new Error('Šī vingrinājuma žestu dati nav derīgi.')
  }

  if (content.schemaVersion === 3 || content.schemaVersion === 2) {
    if (!Array.isArray(content.cues) || content.cues.length > MAX_CUES) {
      throw new Error(`Vingrinājumā nedrīkst būt vairāk par ${MAX_CUES} žestiem.`)
    }

    const tempo = content.tempo ?? DEFAULT_TEMPO
    const timeSignature = content.timeSignature ?? DEFAULT_TIME_SIGNATURE
    validateRhythmSettings(tempo, timeSignature)

    const ids = new Set()
    const cues = []
    const usedBeats = new Set()

    for (const cue of content.cues) {
      const beat = content.schemaVersion === 3 ? cue?.beat : undefined
      if (
        !cue ||
        (typeof cue.id !== 'string' && typeof cue.id !== 'number') ||
        ids.has(cue.id) ||
        (content.schemaVersion === 3 &&
          (!Number.isInteger(beat) || beat < 0 || beat >= MAX_SEQUENCE_BEATS)) ||
        (content.schemaVersion === 2 &&
          (!Number.isFinite(cue.at) || cue.at < 0 || cue.at > MAX_SEQUENCE_SECONDS)) ||
        !GESTURES.some((gesture) => gesture.id === cue.gesture)
      ) {
        throw new Error('Šī vingrinājuma žestu dati nav derīgi.')
      }

      ids.add(cue.id)
      if (content.schemaVersion === 3) {
        if (usedBeats.has(beat)) {
          throw new Error('Katram takts sitienam var pievienot tikai vienu žestu.')
        }
        usedBeats.add(beat)
        cues.push({ id: cue.id, beat, gesture: cue.gesture })
      } else {
        cues.push({ id: cue.id, at: cue.at, gesture: cue.gesture })
      }
    }

    const normalizedCues =
      content.schemaVersion === 3 ? cues : quantizeLegacyCues(cues, tempo, timeSignature)

    return {
      schemaVersion: 3,
      tempo,
      timeSignature: { ...timeSignature },
      cues: normalizedCues.sort((left, right) => left.beat - right.beat),
    }
  }

  if (
    content.schemaVersion !== 1 ||
    !content.timeSignature ||
    !Number.isInteger(content.timeSignature.numerator) ||
    !Number.isInteger(content.timeSignature.denominator) ||
    content.timeSignature.denominator < 1 ||
    !Number.isInteger(content.tempo) ||
    content.tempo < 1 ||
    !Number.isInteger(content.measureCount) ||
    !Array.isArray(content.events)
  ) {
    throw new Error('Šī vingrinājuma žestu dati nav derīgi.')
  }

  const subdivisionsPerBeat = 16 / content.timeSignature.denominator
  const legacyCues = content.events
    .filter((event) => event.kind === 'sound')
    .map((event) => ({
      id: String(event.id),
      at:
        ((event.measure - 1) * content.timeSignature.numerator +
          event.position / subdivisionsPerBeat) *
        (60 / content.tempo),
      gesture: 'clap',
    }))
    .sort((left, right) => left.at - right.at)

  if (
    legacyCues.length > MAX_CUES ||
    legacyCues.some((cue) => !Number.isFinite(cue.at) || cue.at < 0)
  ) {
    throw new Error('Šī vingrinājuma žestu dati nav derīgi.')
  }

  const cues = quantizeLegacyCues(legacyCues, content.tempo, content.timeSignature)

  return {
    schemaVersion: 3,
    tempo: content.tempo,
    timeSignature: {
      numerator: content.timeSignature.numerator,
      denominator: content.timeSignature.denominator,
    },
    cues: cues.sort((left, right) => left.beat - right.beat),
  }
}

function validateRhythmSettings(tempo, timeSignature) {
  if (
    !Number.isInteger(tempo) ||
    tempo < 30 ||
    tempo > 240 ||
    !timeSignature ||
    !Number.isInteger(timeSignature.numerator) ||
    timeSignature.numerator < 2 ||
    timeSignature.numerator > 12 ||
    !TIME_SIGNATURE_DENOMINATORS.includes(timeSignature.denominator)
  ) {
    throw new Error('Šī vingrinājuma taktsmērs vai temps nav derīgs.')
  }
}

function findNearestFreeBeat(cues, currentTime, tempo, timeSignature, duration) {
  const beatDuration = getBeatDuration(tempo, timeSignature)
  const maxBeat = Math.max(
    0,
    Math.min(MAX_SEQUENCE_BEATS - 1, Math.ceil(duration / beatDuration) - 1),
  )
  const requestedBeat = Math.max(0, Math.min(maxBeat, Math.round(currentTime / beatDuration)))
  const occupiedBeats = new Set(cues.map((cue) => cue.beat))

  for (let distance = 0; distance <= maxBeat; distance += 1) {
    const laterBeat = requestedBeat + distance
    if (laterBeat <= maxBeat && !occupiedBeats.has(laterBeat)) {
      return laterBeat
    }

    const earlierBeat = requestedBeat - distance
    if (distance > 0 && earlierBeat >= 0 && !occupiedBeats.has(earlierBeat)) {
      return earlierBeat
    }
  }

  throw new Error('Vingrinājumā vairs nav brīvu taktsdaļu žestiem.')
}

function quantizeLegacyCues(cues, tempo, timeSignature) {
  const quantized = []
  for (const cue of cues) {
    if (quantized.length >= MAX_SEQUENCE_BEATS) break
    const beat = findNearestFreeBeat(quantized, cue.at, tempo, timeSignature, MAX_SEQUENCE_SECONDS)
    quantized.push({ id: cue.id, beat, gesture: cue.gesture })
  }
  return quantized
}

export function getActiveCueId(cues, currentTime, lookaheadSeconds = CUE_LOOKAHEAD_SECONDS) {
  let activeCueId = null

  for (const cue of cues) {
    if (cue.at > currentTime + lookaheadSeconds) break
    activeCueId = cue.id
  }

  return activeCueId
}

export function getActiveCueIndex(cues, currentTime, lookaheadSeconds = CUE_LOOKAHEAD_SECONDS) {
  let activeCueIndex = -1

  for (let index = 0; index < cues.length; index += 1) {
    if (cues[index].at > currentTime + lookaheadSeconds) break
    activeCueIndex = index
  }

  return activeCueIndex
}

export function getNextCueIndex(cues, currentTime, lookaheadSeconds = CUE_LOOKAHEAD_SECONDS) {
  return cues.findIndex((cue) => cue.at > currentTime + lookaheadSeconds)
}

export function buildMeasureGrid(cues, duration, tempo, timeSignature) {
  validateRhythmSettings(tempo, timeSignature)

  const beatDuration = getBeatDuration(tempo, timeSignature)
  const measureDuration = beatDuration * timeSignature.numerator
  const lastCueTime = getCueTime(cues.at(-1)?.beat || 0, tempo, timeSignature)
  const totalDuration = Math.max(duration, lastCueTime + 0.01, measureDuration)
  const measureCount = Math.ceil(totalDuration / measureDuration)

  const measures = Array.from({ length: measureCount }, (_, measureIndex) => ({
    number: measureIndex + 1,
    beats: Array.from({ length: timeSignature.numerator }, (_, beatIndex) => {
      const startTime = (measureIndex * timeSignature.numerator + beatIndex) * beatDuration

      return {
        number: beatIndex + 1,
        beatIndex: measureIndex * timeSignature.numerator + beatIndex,
        startTime,
        cues: [],
      }
    }),
  }))

  cues.forEach((cue, cueIndex) => {
    const absoluteBeat = cue.beat
    const measureIndex = Math.floor(absoluteBeat / timeSignature.numerator)
    const beatIndex = absoluteBeat % timeSignature.numerator
    measures[measureIndex]?.beats[beatIndex].cues.push({ ...cue, cueIndex })
  })

  return measures
}

export function addGestureCue(
  cues,
  gesture,
  currentTime,
  id,
  tempo,
  timeSignature,
  duration = MAX_SEQUENCE_SECONDS,
) {
  if (!GESTURES.some((option) => option.id === gesture)) {
    throw new Error('Izvēlētais žests nav atbalstīts.')
  }
  if (!Number.isFinite(currentTime) || currentTime < 0 || currentTime > MAX_SEQUENCE_SECONDS) {
    throw new Error('Dziesmas laiks nav derīgs.')
  }
  if (cues.length >= MAX_CUES) {
    throw new Error(`Vingrinājumā nedrīkst būt vairāk par ${MAX_CUES} žestiem.`)
  }

  validateRhythmSettings(tempo, timeSignature)
  const beat = findNearestFreeBeat(cues, currentTime, tempo, timeSignature, duration)

  return [...cues, { id, beat, gesture }].sort((left, right) => left.beat - right.beat)
}
