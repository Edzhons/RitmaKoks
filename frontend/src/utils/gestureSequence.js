export const MAX_CUES = 500
export const MAX_SEQUENCE_SECONDS = 60 * 60
export const DEFAULT_TEMPO = 100
export const DEFAULT_TIME_SIGNATURE = { numerator: 4, denominator: 4 }
export const TIME_SIGNATURE_DENOMINATORS = [2, 4, 8, 16]

export const GESTURES = [
  { id: 'clap', label: 'Plaukšķis', icon: '👏' },
  { id: 'stomp', label: 'Kājiņa', icon: '🦶' },
  { id: 'snap', label: 'Pirkstu knipsis', icon: '🫰' },
]

export function createEmptyGestureSequence() {
  return {
    schemaVersion: 2,
    tempo: DEFAULT_TEMPO,
    timeSignature: { ...DEFAULT_TIME_SIGNATURE },
    cues: [],
  }
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

  if (content.schemaVersion === 2) {
    if (!Array.isArray(content.cues) || content.cues.length > MAX_CUES) {
      throw new Error(`Vingrinājumā nedrīkst būt vairāk par ${MAX_CUES} žestiem.`)
    }

    const tempo = content.tempo ?? DEFAULT_TEMPO
    const timeSignature = content.timeSignature ?? DEFAULT_TIME_SIGNATURE
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

    const ids = new Set()
    let previousTime = -1

    for (const cue of content.cues) {
      if (
        !cue ||
        (typeof cue.id !== 'string' && typeof cue.id !== 'number') ||
        ids.has(cue.id) ||
        !Number.isFinite(cue.at) ||
        cue.at < 0 ||
        cue.at > MAX_SEQUENCE_SECONDS ||
        cue.at < previousTime ||
        !GESTURES.some((gesture) => gesture.id === cue.gesture)
      ) {
        throw new Error('Šī vingrinājuma žestu dati nav derīgi.')
      }

      ids.add(cue.id)
      previousTime = cue.at
    }

    return {
      schemaVersion: 2,
      tempo,
      timeSignature: { ...timeSignature },
      cues: content.cues.map((cue) => ({ ...cue })),
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
  const cues = content.events
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

  if (cues.length > MAX_CUES || cues.some((cue) => !Number.isFinite(cue.at) || cue.at < 0)) {
    throw new Error('Šī vingrinājuma žestu dati nav derīgi.')
  }

  return {
    schemaVersion: 2,
    tempo: content.tempo,
    timeSignature: {
      numerator: content.timeSignature.numerator,
      denominator: content.timeSignature.denominator,
    },
    cues,
  }
}

export function getActiveCueId(cues, currentTime) {
  let activeCueId = null

  for (const cue of cues) {
    if (cue.at > currentTime) break
    activeCueId = cue.id
  }

  return activeCueId
}

export function getActiveCueIndex(cues, currentTime) {
  let activeCueIndex = -1

  for (let index = 0; index < cues.length; index += 1) {
    if (cues[index].at > currentTime) break
    activeCueIndex = index
  }

  return activeCueIndex
}

export function getNextCueIndex(cues, currentTime) {
  return cues.findIndex((cue) => cue.at > currentTime)
}

export function buildMeasureGrid(cues, duration, tempo, timeSignature) {
  if (
    !Number.isInteger(tempo) ||
    tempo < 30 ||
    tempo > 240 ||
    !Number.isInteger(timeSignature?.numerator) ||
    timeSignature.numerator < 2 ||
    timeSignature.numerator > 12 ||
    !TIME_SIGNATURE_DENOMINATORS.includes(timeSignature.denominator)
  ) {
    throw new Error('Taktsmērs vai temps nav derīgs.')
  }

  const beatDuration = (60 / tempo) * (4 / timeSignature.denominator)
  const measureDuration = beatDuration * timeSignature.numerator
  const lastCueTime = cues.at(-1)?.at || 0
  const totalDuration = Math.max(duration, lastCueTime + 0.01, measureDuration)
  const measureCount = Math.ceil(totalDuration / measureDuration)

  const measures = Array.from({ length: measureCount }, (_, measureIndex) => ({
    number: measureIndex + 1,
    beats: Array.from({ length: timeSignature.numerator }, (_, beatIndex) => {
      const startTime = (measureIndex * timeSignature.numerator + beatIndex) * beatDuration

      return {
        number: beatIndex + 1,
        startTime,
        cues: [],
      }
    }),
  }))

  cues.forEach((cue, cueIndex) => {
    const absoluteBeat = Math.floor(cue.at / beatDuration)
    const measureIndex = Math.floor(absoluteBeat / timeSignature.numerator)
    const beatIndex = absoluteBeat % timeSignature.numerator
    measures[measureIndex]?.beats[beatIndex].cues.push({ ...cue, cueIndex })
  })

  return measures
}

export function addGestureCue(cues, gesture, currentTime, id) {
  if (!GESTURES.some((option) => option.id === gesture)) {
    throw new Error('Izvēlētais žests nav atbalstīts.')
  }
  if (!Number.isFinite(currentTime) || currentTime < 0 || currentTime > MAX_SEQUENCE_SECONDS) {
    throw new Error('Dziesmas laiks nav derīgs.')
  }
  if (cues.length >= MAX_CUES) {
    throw new Error(`Vingrinājumā nedrīkst būt vairāk par ${MAX_CUES} žestiem.`)
  }

  return [...cues, { id, at: Math.round(currentTime * 100) / 100, gesture }].sort(
    (left, right) => left.at - right.at,
  )
}
