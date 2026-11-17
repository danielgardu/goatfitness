import './style.css';
import { detectLang, ui } from '../i18n.tsx';
import { AlpineWorld } from './world.js';
import { TrailRunner } from './runner.js';

const t = ui(detectLang());

const $ = id => document.getElementById(id);
const stage = () => document.getElementById('experience');

export function mountExperience() {
  let world;
  const mapCoord = p => ({ x: 17 + (p.x + 110) / 190 * 186, y: 12 + (p.z + 100) / 155 * 85 });
  let toastTimer;
  const toast = message => {
    $('toast').textContent = message;
    $('toast').classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 2600);
  };
  const togglePause = () => {
    world.paused = !world.paused;
    $('pause').classList.toggle('paused', world.paused);
    $('pause').setAttribute('aria-label', world.paused ? t.play : t.pause);
  };

  const ac = new AbortController();
  const originalAdd = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function (type, fn, options) {
    const extra = options === true ? { capture: true } : options && typeof options === 'object' ? options : {};
    return originalAdd.call(this, type, fn, { ...extra, signal: ac.signal });
  };

  try {
    world = new AlpineWorld($('world'), state => {
      if (!world) return;
      const p = world.path.getPointAt(state.progress), m = mapCoord(p);
      for (const id of ['map-dot', 'map-dot-halo']) {
        $(id).setAttribute('cx', m.x);
        $(id).setAttribute('cy', m.y);
      }
      const length = Math.min(65, world.distance - world.startDistance);
      const trace = Array.from({ length: 80 }, (_, i) => {
        const t = ((world.distance - length + length * i / 79) / world.pathLength) % 1;
        return mapCoord(world.path.getPointAt(t));
      });
      $('map-progress').setAttribute('d', 'M' + trace.map(point => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' L'));
      $('lap').textContent = String(state.lap).padStart(2, '0');
      $('subject-tag').style.left = `${state.x + 34}px`;
      $('subject-tag').style.top = `${state.y - 23}px`;
    });
    world.runner = new TrailRunner(world);
    world.goatReady.then(() => {
      $('loading').classList.add('done');
      $('subject-tag').classList.add('visible');
      $('start-run').disabled = false;
      focusActivityHash();
    }).catch(() => {
      $('loading').innerHTML = `<div class="loading-mark"><img src="/logo-mark.png" alt="" width="72" height="72" /></div><span>${t.loadFail}</span>`;
    });
    if (world.paused) $('pause').classList.add('paused');
    const activityList = $('activity-list');
    world.activities.figures.forEach((figure, index) => {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'activity-jump';
      button.textContent = `${String(index + 1).padStart(2, '0')}  ${figure.label}`;
      button.addEventListener('click', () => {
        $('route-modal').hidden = true;
        world.showActivity(figure.id);
      });
      item.append(button);
      activityList.append(item);
    });
  } catch (error) {
    console.error(error);
    if ($('loading')) $('loading').innerHTML = `<div class="loading-mark"><img src="/logo-mark.png" alt="" width="72" height="72" /></div><span>${t.needWebgl}</span>`;
  }

  const onResize = () => world?.resize();
  window.addEventListener('resize', onResize, { signal: ac.signal });
  $('pause').addEventListener('click', togglePause);
  const cameraReset = $('camera-reset');
  if (cameraReset) cameraReset.addEventListener('click', () => world.resetCamera());
  $('zoom-in').addEventListener('click', () => world.zoomCamera(1.2));
  $('zoom-out').addEventListener('click', () => world.zoomCamera(1 / 1.2));
  const experienceLink = $('experience-link');
  if (experienceLink) experienceLink.addEventListener('click', () => { world.resetCamera(); if (world.paused) togglePause(); });
  $('explore').addEventListener('click', () => {
    if (world.viewingWaterActivity) world.resetCamera();
    world.detail = !world.detail;
    stage().classList.toggle('inspect', world.detail);
    $('explore').setAttribute('aria-label', world.detail ? t.backToView : t.seeGallop);
    if (world.paused) togglePause();
  });
  stage().querySelectorAll('[data-speed]').forEach(button => button.addEventListener('click', () => {
    world.speed = Number(button.dataset.speed);
    stage().querySelectorAll('[data-speed]').forEach(b => b.classList.toggle('selected', b === button));
    if (world.paused) togglePause();
  }));
  $('route-link').addEventListener('click', () => { $('route-modal').hidden = false; $('close-route').focus(); });
  const closeRoute = () => { $('route-modal').hidden = true; $('route-link').focus(); };
  $('close-route').addEventListener('click', closeRoute);
  $('route-modal').addEventListener('click', e => { if (e.target === $('route-modal')) closeRoute(); });
  const focusWaterActivity = id => {
    if (!world) return;
    stage().classList.remove('inspect');
    $('explore').setAttribute('aria-label', t.seeGallop);
    world.showWaterActivity(id);
  };
  const focusActivityHash = () => {
    if (world?.runner?.active) return;
    if (location.hash === '#natacion') focusWaterActivity('swimming');
    if (location.hash === '#surf') focusWaterActivity('surfing');
  };
  window.addEventListener('hashchange', focusActivityHash, { signal: ac.signal });
  document.addEventListener('keydown', e => {
    if (world?.runner?.active) return;
    const inside = e.target === $('world') || (e.target instanceof Element && e.target.closest('#experience') && e.target.closest('button, a, select'));
    if (e.code === 'Space' && e.target === $('world')) { e.preventDefault(); togglePause(); }
    if (!inside && e.target !== $('world')) return;
    if (e.code === 'Escape' && !$('route-modal').hidden) closeRoute();
    if (e.code === 'KeyR' && $('route-modal').hidden && e.target === $('world')) world.resetCamera();
  }, { signal: ac.signal });

  const root = stage();
  const view = new IntersectionObserver(([entry]) => {
    if (!world) return;
    if (entry.isIntersecting && !document.hidden) world.resume();
    else if (!world.runner?.active) world.suspend();
  }, { threshold: 0.08 });
  view.observe(root);
  const box = new ResizeObserver(() => world?.resize());
  box.observe(root);
  document.addEventListener('visibilitychange', () => {
    if (!world) return;
    if (document.hidden) world.suspend();
    else if (root.getBoundingClientRect().bottom > 0 && root.getBoundingClientRect().top < window.innerHeight) world.resume();
  }, { signal: ac.signal });

  EventTarget.prototype.addEventListener = originalAdd;

  return () => {
    view.disconnect();
    box.disconnect();
    clearTimeout(toastTimer);
    ac.abort();
    world?.destroy();
    EventTarget.prototype.addEventListener = originalAdd;
  };
}
