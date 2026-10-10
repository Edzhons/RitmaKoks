import { describe, expect, it } from 'vitest'

import {
  addGestureCue,
  buildMeasureGrid,
  createEmptyGestureSequence,
  formatTime,
  getActiveCueIndex,
  getActiveCueId,
  getNextCueIndex,
  normalizeGestureSequence,
} from './gestureSequence'

describe('gesture sequence helpers', () => {
  it('creates and formats an empty gesture sequence', () => {
    expect(createEmptyGestureSequence()).toEqual({
      schemaVersion: 2,
      tempo: 100,
      timeSignature: { numerator: 4, denominator: 4 },
      cues: [],
    })
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
    expect(sequence.tempo).toBe(100)
    expect(sequence.timeSignature).toEqual({ numerator: 4, denominator: 4 })
    expect(() =>
      normalizeGestureSequence({
        schemaVersion: 2,
        cues: [{ id: 'invalid', at: -1, gesture: 'triangle' }],
      }),
    ).toThrow()
    expect(() =>
      normalizeGestureSequence({
        schemaVersion: 2,
        tempo: 300,
        timeSignature: { numerator: 4, denominator: 4 },
        cues: [],
      }),
    ).toThrow('temps nav derīgs')
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
      tempo: 120,
      timeSignature: { numerator: 4, denominator: 4 },
      cues: [{ id: 'sound', at: 1, gesture: 'clap' }],
    })
  })

  it('builds measures and places timed cues in their corresponding beats', () => {
    const grid = buildMeasureGrid(
      [
        { id: 'first-clap', at: 0.1, gesture: 'clap' },
        { id: 'next-clap', at: 0.4, gesture: 'clap' },
        { id: 'stomp', at: 1.25, gesture: 'stomp' },
        { id: 'snap', at: 2.1, gesture: 'snap' },
      ],
      4,
      120,
      { numerator: 4, denominator: 4 },
    )

    expect(grid).toHaveLength(2)
    expect(grid[0].beats.map((beat) => beat.number)).toEqual([1, 2, 3, 4])
    expect(grid[0].beats[0].cues.map((cue) => cue.id)).toEqual(['first-clap', 'next-clap'])
    expect(grid[0].beats[2].cues[0].id).toBe('stomp')
    expect(grid[1].beats[0].cues[0].id).toBe('snap')
    expect(
      getActiveCueIndex(
        grid.flatMap((measure) => measure.beats.flatMap((beat) => beat.cues)),
        0.2,
      ),
    ).toBe(0)
    expect(getNextCueIndex([{ at: 1 }, { at: 2 }, { at: 2.5 }], 2)).toBe(2)
  })

  it('respects the selected meter when placing cues into measures', () => {
    const grid = buildMeasureGrid([{ id: 'next-measure', at: 3.1, gesture: 'snap' }], 5, 60, {
      numerator: 3,
      denominator: 4,
    })

    expect(grid).toHaveLength(2)
    expect(grid[0].beats).toHaveLength(3)
    expect(grid[1].beats[0].cues[0].id).toBe('next-measure')
  })
})
