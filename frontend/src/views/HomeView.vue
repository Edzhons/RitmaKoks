<script setup>
import StudioCard from '../components/StudioCard.vue'
</script>

<template>
  <div class="container site-container home-page">
    <section class="hero-panel" aria-labelledby="hero-title">
      <div class="hero-copy">
        <span class="eyebrow hero-eyebrow">
          <span class="eyebrow-dot"></span>
          TAVA MŪZIKAS TELPA
        </span>
        <h1 id="hero-title" class="hero-title">Sāc ar ritmu.<br />Veido savu <em>mūziku.</em></h1>
        <p class="hero-description">
          Atklāj ritmu, veido melodijas un iepazīsti mūziku soli pa solim. Sāc ar ritma studiju —
          RitmaKoka galveno sadaļu.
        </p>
        <div class="hero-actions">
          <RouterLink class="btn btn-primary" to="/sound-gestures">
            Atvērt skanošos žestus
            <i class="bi bi-arrow-right ms-1" aria-hidden="true"></i>
          </RouterLink>
          <RouterLink class="hero-secondary" to="/library">
            Apskatīt bibliotēku
            <i class="bi bi-arrow-up-right" aria-hidden="true"></i>
          </RouterLink>
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
          <span class="note-card-caption">Atrodi savu ritmu</span>
        </div>
      </div>
    </section>

    <section id="studios" aria-labelledby="studios-title">
      <div class="section-heading">
        <div>
          <span class="eyebrow">MĀCIES UN RADI</span>
          <h2 id="studios-title">Ritms ir sākums</h2>
        </div>
        <p>
          Skanošie žesti ir galvenā vieta ritma apguvei — klausies dziesmu un seko līdzi žestiem.
        </p>
      </div>

      <div class="studio-grid">
        <StudioCard
          id="ritma-studija"
          icon="bi-music-note-list"
          title="Skanošie žesti"
          description="Atskaņo dziesmu, atzīmē plaukšķus, kājiņas un pirkstu knipšus, lai skolēni varētu sekot ritmam."
          status="RitmaKoka galvenā sadaļa"
          action="Atvērt skanošos žestus"
          to="/sound-gestures"
          tone="featured"
          featured
        />
        <StudioCard
          icon="bi-soundwave"
          title="Krāsainās notis"
          description="Veido melodijas no dažāda ilguma un krāsas notīm."
          status="Plānota 7. solī"
          action="Tiek plānota"
          tone="amber"
        />
        <StudioCard
          icon="bi-triangle"
          title="Mūzikas instrumenti"
          description="Pievieno dziesmām kociņus, trijstūri un citus klasē pieejamos instrumentus."
          status="Plānota 8. solī"
          action="Tiek plānota"
          tone="green"
        />
        <StudioCard
          icon="bi-collection"
          title="Mūzikas bibliotēka"
          description="Atrodi idejas, saglabā sev noderīgo un dalies ar saviem darbiem."
          status="Plānota 9. solī"
          action="Apskatīt bibliotēku"
          to="/library"
        />
      </div>

      <aside class="gentle-reminder" aria-label="Piezīme par mācīšanos">
        <span class="reminder-icon" aria-hidden="true">
          <i class="bi bi-flower1"></i>
        </span>
        <p><strong>Mācies savā tempā.</strong> Mūziku var sākt iepazīt dažādos veidos.</p>
      </aside>
    </section>
  </div>
</template>
