import { describe, expect, it } from 'vitest'

import {
  addGestureCue,
  createEmptyGestureSequence,
  formatTime,
  getActiveCueId,
  normalizeGestureSequence,
} from './gestureSequence'

describe('gesture sequence helpers', () => {
  it('creates and formats an empty gesture sequence', () => {
    expect(createEmptyGestureSequence()).toEqual({ schemaVersion: 2, cues: [] })
    expect(formatTime(65.239)).toBe('01:05.23')
  })

  it('adds gestures in song-time order and rounds cue times', () => {
    const cues = addGestureCue([{ id: 'later', at: 4, gesture: 'snap' }], 'clap', 1.238, 'earlier')

    expect(cues).toEqual([
      { id: 'earlier', at: 1.24, gesture: 'clap' },
      { id: 'later', at: 4, gesture: 'snap' },
    ])
  })

  it('highlights the latest gesture reached in the song', () => {
    const cues = [
      { id: 'first', at: 0, gesture: 'clap' },
      { id: 'second', at: 3.5, gesture: 'stomp' },
    ]

    expect(getActiveCueId(cues, 1)).toBe('first')
    expect(getActiveCueId(cues, 3.5)).toBe('second')
    expect(getActiveCueId(cues, 0)).toBe('first')
    expect(getActiveCueId(cues, 20)).toBe('second')
    expect(getActiveCueId([], 0)).toBeNull()
  })

  it('validates a saved gesture sequence', () => {
    const sequence = normalizeGestureSequence({
      schemaVersion: 2,
      cues: [
        { id: 'one', at: 0.25, gesture: 'clap' },
        { id: 'two', at: 1.5, gesture: 'snap' },
      ],
    })

    expect(sequence.cues).toHaveLength(2)
    expect(() =>
      normalizeGestureSequence({
        schemaVersion: 2,
        cues: [{ id: 'invalid', at: -1, gesture: 'triangle' }],
      }),
    ).toThrow()
  })

  it('converts saved note-grid sounds into matching gesture cues', () => {
    const sequence = normalizeGestureSequence({
      schemaVersion: 1,
      timeSignature: { numerator: 4, denominator: 4 },
      tempo: 120,
      measureCount: 1,
      events: [
        { id: 'rest', measure: 1, position: 4, duration: 4, kind: 'rest' },
        { id: 'sound', measure: 1, position: 8, duration: 2, kind: 'sound' },
      ],
    })

    expect(sequence).toEqual({
      schemaVersion: 2,
      cues: [{ id: 'sound', at: 1, gesture: 'clap' }],
    })
  })
})
