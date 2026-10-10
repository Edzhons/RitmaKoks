import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import GestureCueTimeline from './GestureCueTimeline.vue'

describe('GestureCueTimeline', () => {
  it('shows timed cues, marks the active cue, and emits seek and remove actions', async () => {
    const wrapper = mount(GestureCueTimeline, {
      props: {
        cues: [
          { id: 'one', at: 5, gesture: 'clap' },
          { id: 'two', at: 10, gesture: 'stomp' },
        ],
        duration: 20,
        currentTime: 10,
        activeCueId: 'two',
      },
    })

    expect(wrapper.findAll('.cue-list-item')).toHaveLength(2)
    expect(wrapper.findAll('.timeline-marker')[1].classes()).toContain('timeline-marker-active')
    expect(wrapper.findAll('.cue-list-item')[1].classes()).toContain('cue-list-item-active')

    await wrapper.get('[aria-label="Pāriet uz 00:05.00 — Plaukšķis"]').trigger('click')
    await wrapper.get('[aria-label="Noņemt Kājiņa žestu pie 00:10.00"]').trigger('click')

    expect(wrapper.emitted('seek')).toEqual([[5]])
    expect(wrapper.emitted('remove')).toEqual([['two']])
  })

  it('disables editing controls in presentation mode', async () => {
    const wrapper = mount(GestureCueTimeline, {
      props: {
        cues: [{ id: 'one', at: 0, gesture: 'clap' }],
        disabled: true,
      },
    })

    expect(wrapper.get('.cue-jump').element.disabled).toBe(true)
    expect(wrapper.find('.cue-remove').exists()).toBe(false)
  })
})
