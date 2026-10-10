<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  icon: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    default: null,
  },
  tone: {
    type: String,
    default: 'green',
  },
})
</script>

<template>
  <article class="studio-card" :class="`studio-card--${tone}`">
    <div class="studio-card-top">
      <span class="studio-icon" aria-hidden="true">
        <i :class="`bi ${icon}`"></i>
      </span>
      <span class="studio-status">{{ status }}</span>
    </div>
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
    <RouterLink v-if="to" class="studio-card-action" :to="to">
      {{ action }}
      <i class="bi bi-arrow-right" aria-hidden="true"></i>
    </RouterLink>
    <span v-else class="studio-card-action studio-card-action--disabled">
      {{ action }}
    </span>
  </article>
</template>
