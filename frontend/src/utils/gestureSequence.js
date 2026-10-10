export const MAX_CUES = 500
export const MAX_SEQUENCE_SECONDS = 60 * 60

export const GESTURES = [
  { id: 'clap', label: 'Plaukšķis', icon: '👏' },
  { id: 'stomp', label: 'Kājiņa', icon: '🦶' },
  { id: 'snap', label: 'Pirkstu knipsis', icon: '🫰' },
]

export function createEmptyGestureSequence() {
  return { schemaVersion: 2, cues: [] }
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

  return { schemaVersion: 2, cues }
}

export function getActiveCueId(cues, currentTime) {
  let activeCueId = null

  for (const cue of cues) {
    if (cue.at > currentTime) break
    activeCueId = cue.id
  }

  return activeCueId
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
