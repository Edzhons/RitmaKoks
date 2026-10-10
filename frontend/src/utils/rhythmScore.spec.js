import { describe, expect, it } from 'vitest'

import {
  canPlaceRhythmEvent,
  createEmptyRhythmScore,
  createPlaybackTimeline,
  getBeatTicks,
  getMeasureTicks,
  getPlaybackPosition,
  normalizeRhythmScore,
} from './rhythmScore'

describe('rhythm score helpers', () => {
  it('creates a valid default score with two empty 4/4 measures', () => {
    const score = createEmptyRhythmScore()

    expect(score).toMatchObject({
      schemaVersion: 1,
      timeSignature: { numerator: 4, denominator: 4 },
      tempo: 90,
      measureCount: 2,
      events: [],
    })
    expect(getBeatTicks(4)).toBe(4)
    expect(getMeasureTicks(score.timeSignature)).toBe(16)
  })

  it('uses the correct subdivisions for different time signatures', () => {
    expect(getBeatTicks(2)).toBe(8)
    expect(getBeatTicks(8)).toBe(2)
    expect(getMeasureTicks({ numerator: 6, denominator: 8 })).toBe(12)
  })

  it('allows an event only when it fits without overlapping another event', () => {
    const events = [{ measure: 1, position: 0, duration: 4 }]

    expect(canPlaceRhythmEvent(events, 1, 4, 2, 16)).toBe(true)
    expect(canPlaceRhythmEvent(events, 1, 2, 4, 16)).toBe(false)
    expect(canPlaceRhythmEvent(events, 1, 15, 2, 16)).toBe(false)
    expect(canPlaceRhythmEvent(events, 2, 0, 4, 16)).toBe(true)
  })

  it('rejects invalid, overlapping, or out-of-measure saved rhythm content', () => {
    const score = createEmptyRhythmScore()

    expect(() => normalizeRhythmScore({ ...score, tempo: 20 })).toThrow()
    expect(() =>
      normalizeRhythmScore({
        ...score,
        events: [
          { id: 'a', measure: 1, position: 0, duration: 4, kind: 'sound' },
          { id: 'b', measure: 1, position: 2, duration: 2, kind: 'rest' },
        ],
      }),
    ).toThrow()
    expect(() =>
      normalizeRhythmScore({
        ...score,
        events: [{ id: 'a', measure: 1, position: 15, duration: 2, kind: 'sound' }],
      }),
    ).toThrow()
  })

  it('normalizes valid scores and creates a playback timeline with accented measure starts', () => {
    const score = normalizeRhythmScore({
      ...createEmptyRhythmScore(),
      tempo: 120,
      events: [
        { id: 'first', measure: 1, position: 0, duration: 4, kind: 'sound' },
        { id: 'rest', measure: 1, position: 4, duration: 4, kind: 'rest' },
      ],
    })
    const timeline = createPlaybackTimeline(score)

    expect(timeline.beatDuration).toBe(0.5)
    expect(timeline.totalDuration).toBe(4)
    expect(timeline.beats).toHaveLength(8)
    expect(timeline.beats.filter((beat) => beat.accented).map((beat) => beat.measure)).toEqual([
      1, 2,
    ])
    expect(timeline.notes).toEqual([{ id: 'first', measure: 1, position: 0, time: 0 }])
  })

  it('tracks the active measure, beat, and subdivision during playback', () => {
    const score = {
      ...createEmptyRhythmScore(),
      tempo: 60,
      measureCount: 2,
    }

    expect(getPlaybackPosition(0, score)).toEqual({ measure: 1, beat: 1, position: 0 })
    expect(getPlaybackPosition(1.5, score)).toEqual({ measure: 1, beat: 2, position: 2 })
    expect(getPlaybackPosition(4.2, score)).toEqual({ measure: 2, beat: 1, position: 0 })
  })
})
