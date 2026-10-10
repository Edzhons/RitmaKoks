<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="page-shell">
    <header class="page-heading">
      <span class="eyebrow">THE MUSIC LIBRARY</span>
      <h1>Ideas worth sharing.</h1>
      <p>
        A growing collection of rhythm exercises and melodies to explore, learn from, and make your
        own.
      </p>
    </header>

    <section class="empty-state" aria-labelledby="library-empty-title">
      <span class="empty-state-icon" aria-hidden="true">
        <i class="bi bi-collection"></i>
      </span>
      <h2 id="library-empty-title">The library is taking shape</h2>
      <p>
        Search, categories, and community compositions are planned for Step 08. For now, the best
        place to start is the creative home.
      </p>
      <RouterLink class="btn btn-primary mt-4" to="/">
        Back to the beginning
        <i class="bi bi-arrow-right ms-1" aria-hidden="true"></i>
      </RouterLink>
    </section>
  </div>
</template>
