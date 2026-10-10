import { describe, expect, it } from 'vitest'

import {
  addGestureCue,
  buildMeasureGrid,
  createEmptyGestureSequence,
  formatTime,
  getCueTime,
  getActiveCueIndex,
  getActiveCueId,
  getNextCueIndex,
  normalizeGestureSequence,
} from './gestureSequence'

describe('gesture sequence helpers', () => {
  it('creates and formats an empty gesture sequence', () => {
    expect(createEmptyGestureSequence()).toEqual({
      schemaVersion: 3,
      tempo: 100,
      timeSignature: { numerator: 4, denominator: 4 },
      cues: [],
    })
    expect(formatTime(65.239)).toBe('01:05.23')
  })

  it('snaps gestures to the nearest available beat and prevents beat collisions', () => {
    const settings = { numerator: 4, denominator: 4 }
    const first = addGestureCue([], 'clap', 0.08, 'first', 120, settings)
    const second = addGestureCue(first, 'clap', 0.12, 'second', 120, settings)
    const third = addGestureCue(second, 'stomp', 0.88, 'third', 120, settings)

    expect(third).toEqual([
      { id: 'first', beat: 0, gesture: 'clap' },
      { id: 'second', beat: 1, gesture: 'clap' },
      { id: 'third', beat: 2, gesture: 'stomp' },
    ])
    expect(new Set(third.map((cue) => cue.beat)).size).toBe(third.length)
    expect(getCueTime(third[2].beat, 120, settings)).toBe(1)
  })

  it('highlights the latest gesture reached in the song', () => {
    const cues = [
      { id: 'first', at: 0, gesture: 'clap' },
      { id: 'second', at: 3.5, gesture: 'stomp' },
    ]

    expect(getActiveCueId(cues, 0.95)).toBe('first')
    expect(getActiveCueId(cues, 3.45)).toBe('second')
    expect(getActiveCueId(cues, 0)).toBe('first')
    expect(getActiveCueId(cues, 20)).toBe('second')
    expect(getActiveCueId([], 0)).toBeNull()
  })

  it('validates a saved gesture sequence', () => {
    const sequence = normalizeGestureSequence({
      schemaVersion: 3,
      tempo: 100,
      timeSignature: { numerator: 4, denominator: 4 },
      cues: [
        { id: 'one', beat: 0, gesture: 'clap' },
        { id: 'two', beat: 3, gesture: 'snap' },
      ],
    })

    expect(sequence.cues).toHaveLength(2)
    expect(sequence.tempo).toBe(100)
    expect(sequence.timeSignature).toEqual({ numerator: 4, denominator: 4 })
    expect(() =>
      normalizeGestureSequence({
        schemaVersion: 3,
        cues: [{ id: 'invalid', beat: -1, gesture: 'triangle' }],
      }),
    ).toThrow()
    expect(() =>
      normalizeGestureSequence({
        schemaVersion: 3,
        tempo: 300,
        timeSignature: { numerator: 4, denominator: 4 },
        cues: [],
      }),
    ).toThrow('temps nav derīgs')
    expect(() =>
      normalizeGestureSequence({
        schemaVersion: 3,
        cues: [
          { id: 'one', beat: 0, gesture: 'clap' },
          { id: 'two', beat: 0, gesture: 'snap' },
        ],
      }),
    ).toThrow('tikai vienu žestu')
  })

  it('converts saved note-grid sounds into beat-based cues', () => {
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
      schemaVersion: 3,
      tempo: 120,
      timeSignature: { numerator: 4, denominator: 4 },
      cues: [{ id: 'sound', beat: 2, gesture: 'clap' }],
    })
  })

  it('migrates legacy second-based cues and separates collisions into free beats', () => {
    const sequence = normalizeGestureSequence({
      schemaVersion: 2,
      tempo: 120,
      timeSignature: { numerator: 4, denominator: 4 },
      cues: [
        { id: 'first', at: 0.1, gesture: 'clap' },
        { id: 'second', at: 0.2, gesture: 'clap' },
      ],
    })

    expect(sequence.cues).toEqual([
      { id: 'first', beat: 0, gesture: 'clap' },
      { id: 'second', beat: 1, gesture: 'clap' },
    ])
  })

  it('builds measures and places cues in their corresponding beats', () => {
    const grid = buildMeasureGrid(
      [
        { id: 'first-clap', beat: 0, at: 0, gesture: 'clap' },
        { id: 'next-clap', beat: 1, at: 0.5, gesture: 'clap' },
        { id: 'stomp', beat: 2, at: 1, gesture: 'stomp' },
        { id: 'snap', beat: 4, at: 2, gesture: 'snap' },
      ],
      4,
      120,
      { numerator: 4, denominator: 4 },
    )

    expect(grid).toHaveLength(2)
    expect(grid[0].beats.map((beat) => beat.number)).toEqual([1, 2, 3, 4])
    expect(grid[0].beats[0].cues.map((cue) => cue.id)).toEqual(['first-clap'])
    expect(grid[0].beats[1].cues[0].id).toBe('next-clap')
    expect(grid[0].beats[2].cues[0].id).toBe('stomp')
    expect(grid[0].beats[3].cues).toEqual([])
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
    const grid = buildMeasureGrid(
      [{ id: 'next-measure', beat: 3, at: 3, gesture: 'snap' }],
      5,
      60,
      { numerator: 3, denominator: 4 },
    )

    expect(grid).toHaveLength(2)
    expect(grid[0].beats).toHaveLength(3)
    expect(grid[1].beats[0].cues[0].id).toBe('next-measure')
  })
})
