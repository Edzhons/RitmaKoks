<script setup>
import StudioCard from '../components/StudioCard.vue'
</script>

<template>
  <div class="container site-container home-page">
    <section class="hero-panel" aria-labelledby="hero-title">
      <div class="hero-copy">
        <span class="eyebrow hero-eyebrow">
          <span class="eyebrow-dot"></span>
          YOUR CREATIVE SPACE
        </span>
        <h1 id="hero-title" class="hero-title">Make music.<br />Find your <em>rhythm.</em></h1>
        <p class="hero-description">
          A welcoming place to explore rhythm, create melodies, and grow your musical confidence —
          one note at a time.
        </p>
        <div class="hero-actions">
          <RouterLink class="btn btn-primary" to="/library">
            Explore the library
            <i class="bi bi-arrow-up-right ms-1" aria-hidden="true"></i>
          </RouterLink>
          <a class="hero-secondary" href="#studios">
            See what you can create
            <i class="bi bi-arrow-down" aria-hidden="true"></i>
          </a>
        </div>
      </div>

      <div class="hero-art" aria-hidden="true">
        <div class="hero-art-orbit"></div>
        <span class="floating-note floating-note-one">♪</span>
        <span class="floating-note floating-note-two">♫</span>
        <div class="music-note-card">
          <div class="music-staff">
            <div class="music-staff-notes">
              <span>♪</span>
              <span>♫</span>
              <span>♪</span>
            </div>
          </div>
          <span class="note-card-caption">Find your own tempo</span>
        </div>
      </div>
    </section>

    <section id="studios" aria-labelledby="studios-title">
      <div class="section-heading">
        <div>
          <span class="eyebrow">A PLACE TO BEGIN</span>
          <h2 id="studios-title">Choose your kind of music</h2>
        </div>
        <p>Start with a beat, follow a melody, or find something new to try.</p>
      </div>

      <div class="studio-grid">
        <StudioCard
          icon="bi-music-note-list"
          title="Rhythm studio"
          description="Build steady beats and explore how rhythm brings music to life."
          status="Coming in Step 06"
          action="Studio in the works"
        />
        <StudioCard
          icon="bi-soundwave"
          title="Melody studio"
          description="Arrange notes and rests into a melody that feels like your own."
          status="Coming in Step 07"
          action="Studio in the works"
          tone="amber"
        />
        <StudioCard
          icon="bi-collection"
          title="Music library"
          description="Discover ideas, save favorites, and share what you create."
          status="Coming in Step 08"
          action="Take a look around"
          to="/library"
        />
      </div>

      <aside class="gentle-reminder" aria-label="A note about learning">
        <span class="reminder-icon" aria-hidden="true">
          <i class="bi bi-flower1"></i>
        </span>
        <p><strong>Grow at your own pace.</strong> There is no wrong way to begin making music.</p>
      </aside>
    </section>
  </div>
</template>
