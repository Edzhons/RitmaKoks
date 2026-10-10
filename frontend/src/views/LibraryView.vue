<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="page-shell">
    <header class="page-heading">
      <span class="eyebrow">MŪZIKAS BIBLIOTĒKA</span>
      <h1>Idejas, ar kurām dalīties.</h1>
      <p>
        Ritma vingrinājumu un melodiju krājums, ko iepazīt, apgūt un papildināt ar savām idejām.
      </p>
    </header>

    <section class="empty-state" aria-labelledby="library-empty-title">
      <span class="empty-state-icon" aria-hidden="true">
        <i class="bi bi-collection"></i>
      </span>
      <h2 id="library-empty-title">Bibliotēka vēl top</h2>
      <p>
        Darbu meklēšana, kategorijas un skolotāju koplietoti skaņdarbi paredzēti 8. solī. Tikmēr
        iepazīsti galveno sadaļu — ritma studiju.
      </p>
      <RouterLink class="btn btn-primary mt-4" to="/sound-gestures">
        Atvērt skanošos žestus
        <i class="bi bi-arrow-right ms-1" aria-hidden="true"></i>
      </RouterLink>
    </section>
  </div>
</template>
