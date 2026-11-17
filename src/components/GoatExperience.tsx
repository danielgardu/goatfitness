import React, { useEffect } from 'react'
import '../experience/style.css'
import { useCopy } from '../i18n'

const APP_STORE = 'https://apps.apple.com/app/id6772637653'

/**
 * The playable alpine world from the goatrunning landing,
 * fitted into the homepage hero.
 */
const GoatExperience: React.FC = () => {
  const t = useCopy()
  useEffect(() => {
    let stop = () => {}
    let cancelled = false
    import('../experience/main.js').then(mod => {
      if (cancelled) return
      stop = mod.mountExperience()
    })
    return () => {
      cancelled = true
      stop()
    }
  }, [])

  const scrollOn = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    document.getElementById('download-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main id="experience" className="embedded" aria-label="Experiencia 3D de una cabra recorriendo un sendero">
      <canvas id="world" aria-label="GOAT FITNESS: mundo azul con 42 actividades animadas junto al sendero. Señala o toca un personaje para conocer su actividad. Arrastra para girar; pellizca para acercar." />
      <div className="vignette" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      <header className="header">
        <div className="wordmark" aria-label="GOAT FITNESS">
          <img src="/logo-mark.png" alt="GOAT FITNESS" width={46} height={46} />
        </div>
        <div className="header-right">
          <button type="button" className="nav-link" id="route-link">{t.route}</button>
        </div>
      </header>

      <div className="be-goat-slot">
        <h1 className="be-goat">
          <span className="be-the" style={{ letterSpacing: t.beThe.length > 6 ? '0.22em' : '0.42em' }}>{t.beThe}</span>
          <span className="letters" aria-label="GOAT">
            <span>G</span><span>O</span><span>A</span><span>T</span>
          </span>
        </h1>
      </div>

      <section className="hero-copy">
        <div className="eyebrow"><span className="tiny-cross">+</span> NO FINISH LINE. JUST FORWARD.</div>
        <h2>Born to<br />run wild<span className="period">.</span></h2>
        <p>Tu movimiento. Tu camino.<br />Descubre las actividades de GOAT FITNESS.</p>
        <div className="hero-actions">
          <button type="button" className="icon-plain" id="explore" aria-label={t.seeGallop}>
            <svg className="icon-go" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18L18 6M10 6h8v8" /></svg>
            <svg className="icon-back" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H6M12 6l-6 6 6 6" /></svg>
          </button>
        </div>
        <button type="button" className="run-launch" id="start-run" aria-controls="run-hud" aria-expanded="false" aria-label={t.playShort} disabled>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5l11 6.5-11 6.5z" /></svg>
          <span>{t.playShort}</span>
        </button>
      </section>

      <div className="subject-tag" id="subject-tag" aria-hidden="true"><span className="subject-line" /><div><i /> CAPRA / 001<small>ALWAYS IN MOTION</small></div></div>
      <div className="activity-tooltip" id="activity-tooltip" role="tooltip" aria-hidden="true" />

      <aside className="route-card" aria-label="Progreso del recorrido">
        <div className="route-card-heading"><span><i /> {t.leaving}</span><span className="loop-symbol">∞</span></div>
        <svg id="minimap" viewBox="0 0 220 110" aria-label="Mapa del circuito"><path id="map-path" /><path id="map-progress" /><circle id="map-dot-halo" r="7" /><circle id="map-dot" r="2.7" /></svg>
        <div className="route-card-footer"><span>{t.everyStep}</span><span id="lap">01</span></div>
      </aside>

      <footer className="footer">
        <span className="footer-label">{t.footer}</span>
        <div className="playback">
          <button type="button" id="pause" aria-label={t.pause} title={t.pause}>
            <svg className="pause-icon" viewBox="0 0 16 16"><path d="M5 3V13M11 3V13" /></svg>
            <svg className="play-icon" viewBox="0 0 16 16"><path d="M5 3L13 8L5 13Z" /></svg>
          </button>
          <div className="speed-control" role="group" aria-label="Velocidad de la animación">
            <button type="button" data-speed="0.5" aria-label="0.5×"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6L7 12l8 6" /></svg></button>
            <button type="button" data-speed="1" className="selected" aria-label="1×"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l8 6-8 6" /></svg></button>
            <button type="button" data-speed="2" aria-label="2×"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6l7 6-7 6M13 6l7 6-7 6" /></svg></button>
          </div>
          <span className="footer-divider" />
          <span id="camera-label">ORBIT CAM</span>
        </div>
      </footer>

      <div className="camera-tools">
        <span className="camera-hint">{t.cameraHint}</span>
        <div className="zoom-controls" role="group" aria-label="Zoom de la cámara">
          <button type="button" id="zoom-out" aria-label="−"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14" /></svg></button>
          <button type="button" id="zoom-in" aria-label="+"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg></button>
        </div>
      </div>

      <div className="loading" id="loading">
        <div className="loading-mark"><img src="/logo-mark.png" alt="" width={84} height={84} /></div>
        <span>{t.loading}<span className="loading-dots">...</span></span>
        <div className="loading-track"><i /></div>
      </div>
      <div className="toast" role="status" id="toast" />

      <section className="run-hud" id="run-hud" aria-label="Carrera en tercera persona" hidden>
        <div className="run-topline">
          <span className="run-mode"><i /> WILD RUN <span>/ TERCERA PERSONA</span></span>
          <div className="run-top-actions">
            <button type="button" id="run-pause" aria-label="Pausar carrera" title="Pausar o continuar (P)">Ⅱ</button>
            <button type="button" id="exit-run" aria-label={t.exitRun}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg></button>
          </div>
        </div>
        <div className="run-score">
          <div className="run-score-label">{t.scoreLabel}</div>
          <div className="run-distance-wrap"><span id="run-distance">000</span><span className="run-unit">m</span></div>
          <div className="run-meter"><i id="run-progress" /></div>
          <div className="run-score-meta"><span>{t.record} <b id="run-best">000</b> m</span><span id="run-pace">35 km/h</span></div>
        </div>
        <div className="run-countdown" id="run-countdown" aria-hidden="true" />
        <div className="run-feedback" id="run-feedback" aria-hidden="true" />
        <div className="run-instructions" id="run-instructions">
          <span className="run-instruction-kicker">{t.runKicker}</span>
          <p>{t.runHelp}</p>
          <span>{t.runKeys}</span>
          <small>{t.runMobile}</small>
        </div>
        <div className="run-bottom">
          <div className="run-obstacle-stat"><b id="run-cleared">00</b><span>{t.obstacles}</span></div>
          <div className="run-controls" aria-label="Controles de la carrera">
            <button type="button" className="run-direction" id="run-left" aria-label="Mover a la izquierda"><span aria-hidden="true">←</span></button>
            <button type="button" className="run-jump" id="run-jump" aria-label={t.jump}><span aria-hidden="true">↟</span></button>
            <button type="button" className="run-direction" id="run-right" aria-label="Mover a la derecha"><span aria-hidden="true">→</span></button>
          </div>
          <div className="run-lane" id="run-lane" aria-hidden="true"><i /><i /><i /><b /><span>{t.lane}</span></div>
        </div>
      </section>

      <aside className="run-result" id="run-result" aria-label="Resultado de la carrera" hidden>
        <button type="button" className="run-result-close" id="dismiss-run" aria-label="Cerrar resultado">×</button>
        <span className="run-result-kicker" id="run-result-label">{t.resultKicker}</span>
        <h2>{t.goodPath}<span>.</span></h2>
        <div className="run-result-number"><b id="run-result-distance">000</b><span>{t.meters}</span></div>
        <p id="run-result-detail" />
        <button type="button" className="primary" id="run-again">{t.again} <span aria-hidden="true">↗</span></button>
      </aside>
      <div className="sr-only" id="run-announcer" role="status" aria-live="polite" aria-atomic="true" />

      <div className="route-modal" id="route-modal" role="dialog" aria-modal="true" aria-labelledby="route-title" hidden>
        <div className="route-panel">
          <button type="button" className="modal-close icon-button" id="close-route" aria-label="Cerrar recorrido">×</button>
          <div className="eyebrow">{t.routeEyebrow}</div>
          <h2 id="route-title">{t.routeTitle}</h2>
          <ol className="activity-list" id="activity-list" />
        </div>
      </div>
      <a className="download-app" href={APP_STORE} target="_blank" rel="noopener noreferrer">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
        <span>{t.download}</span>
        <img className="download-mark" src="/logo-mark.png" alt="" width={22} height={22} />
      </a>

      <a className="goat-continue" href="#download-section" onClick={scrollOn}>
        <span>{t.continue} <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg></span>
      </a>
    </main>
  )
}

export default GoatExperience
