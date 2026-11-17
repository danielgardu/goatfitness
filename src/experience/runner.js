import * as THREE from 'three';
import { RunnerState, LANE_WIDTH } from './runner-state.js';

const stage = () => document.getElementById('experience');

const $ = id => document.getElementById(id);
const ease = t => { t = THREE.MathUtils.clamp(t, 0, 1); return t * t * (3 - 2 * t); };
const format = value => String(Math.floor(value)).padStart(3, '0');

export class TrailRunner {
  constructor(world) {
    this.world = world;
    this.canvasLabel = world.canvas.getAttribute('aria-label');
    this.state = new RunnerState();
    this.camera = new THREE.PerspectiveCamera(55, world.aspect || 1, .15, 300);
    this.cameraTarget = new THREE.Vector3();
    this.group = new THREE.Group(); this.group.visible = false; world.scene.add(this.group);
    this.best = 0;
    try { this.best = Math.max(0, Number(localStorage.getItem('goat-trail-best')) || 0); } catch { /* Storage is optional. */ }
    $('run-best').textContent = format(this.best);
    this.makeCourse();
    this.bindControls();
  }

  get active() { return this.state.phase !== 'idle'; }

  makeCourse() {
    this.materials = [];
    const material = (color, opacity = 1) => {
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: opacity === 1 });
      mat.userData.opacity = opacity; this.materials.push(mat); return mat;
    };
    const white = material('#ecf9ff'), frost = material('#91e0ff', .5), ink = material('#083bca');
    const box = new THREE.BoxGeometry(1, 1, 1);
    const addBox = (parent, size, position, mat) => {
      const mesh = new THREE.Mesh(box, mat); mesh.scale.set(...size); mesh.position.set(...position); parent.add(mesh); return mesh;
    };
    this.obstacles = Array.from({ length: 7 }, (_, index) => {
      const root = new THREE.Group(), hurdle = index % 3 === 0;
      const width = hurdle ? 7.7 : 1.55, height = hurdle ? 1 : 1.55, depth = hurdle ? .38 : 1.2;
      const body = new THREE.Group(); root.add(body);
      if (hurdle) {
        addBox(body, [width, .28, depth], [0, height - .14, 0], white);
        for (const x of [-3.5, 3.5]) {
          addBox(body, [.14, height, .15], [x, height / 2, 0], white);
          addBox(body, [.55, .06, .8], [x, .03, 0], frost);
        }
        for (let x = -3; x <= 3; x += .75) addBox(body, [.3, .29, depth + .01], [x, height - .14, 0], ink);
      } else {
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), white);
        rock.scale.set(width * .62, height * .62, depth * .65); rock.position.y = height * .52;
        body.add(rock);
        addBox(body, [.6, .05, .08], [0, height + .25, 0], frost);
      }
      const halo = new THREE.Mesh(new THREE.RingGeometry(hurdle ? 1 : .8, hurdle ? 1.035 : .84, 48), frost);
      halo.rotation.x = -Math.PI / 2; halo.position.y = .07;
      if (hurdle) halo.scale.set(3.5, .65, 1);
      root.add(halo); this.group.add(root);
      return { root, body, halo, hurdle, width, height, depth, lateral: 0, at: 0, passed: false };
    });
    const positions = new Float32Array(120 * 6), geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.course = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: '#b9ebff', transparent: true, opacity: .25, depthWrite: false }));
    this.course.frustumCulled = false; this.group.add(this.course);
    this.ripples = Array.from({ length: 5 }, () => {
      const mat = new THREE.MeshBasicMaterial({ color: '#e0f7ff', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(new THREE.RingGeometry(.85, .9, 48), mat);
      mesh.rotation.x = -Math.PI / 2; mesh.visible = false; this.group.add(mesh);
      return { mesh, age: 2 };
    });
  }

  bindControls() {
    $('start-run').addEventListener('click', () => this.start());
    $('run-again').addEventListener('click', () => this.start());
    $('dismiss-run').addEventListener('click', () => { $('run-result').hidden = true; stage().classList.remove('has-run-result'); $('start-run').focus({ preventScroll: true }); });
    $('exit-run').addEventListener('click', () => this.exit(false));
    $('run-pause').addEventListener('click', () => this.togglePause());
    for (const [id, action] of [['run-left', () => this.move(-1)], ['run-right', () => this.move(1)], ['run-jump', () => this.jump()]]) {
      $(id).addEventListener('pointerdown', event => { if (event.button !== 0) return; event.preventDefault(); action(); });
      // Keyboard and assistive technology synthesize click without a pointer event.
      $(id).addEventListener('click', event => { if (event.detail === 0) action(); });
    }
    document.addEventListener('keydown', event => {
      if (!this.active || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName) || event.target.isContentEditable) return;
      if (['Space', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyD', 'Escape', 'KeyP'].includes(event.code)) event.preventDefault();
      if (event.repeat) return;
      if (['Space', 'ArrowUp', 'KeyW'].includes(event.code) && event.target.tagName !== 'BUTTON') this.jump();
      if (['ArrowLeft', 'KeyA'].includes(event.code)) this.move(-1);
      if (['ArrowRight', 'KeyD'].includes(event.code)) this.move(1);
      if (event.code === 'Escape') this.exit(false);
      if (event.code === 'KeyP') this.togglePause();
    });
    let touch;
    this.world.canvas.addEventListener('pointerdown', event => {
      if (!this.active || event.pointerType === 'mouse') return;
      touch = { x: event.clientX, y: event.clientY, id: event.pointerId };
      this.world.canvas.setPointerCapture(event.pointerId);
    });
    this.world.canvas.addEventListener('pointerup', event => {
      if (!touch || touch.id !== event.pointerId) return;
      const dx = event.clientX - touch.x, dy = event.clientY - touch.y;
      if (Math.abs(dx) > 28 && Math.abs(dx) > Math.abs(dy)) this.move(Math.sign(dx));
      else if (dy < -24 || Math.hypot(dx, dy) < 18) this.jump();
      touch = null;
    });
    this.world.canvas.addEventListener('pointercancel', () => { touch = null; });
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.setPaused(true); });
    window.addEventListener('blur', () => this.setPaused(true));
  }

  start() {
    if (this.active || !this.world.assetGoat) return;
    const w = this.world;
    if (w.viewingWaterActivity) w.resetCamera();
    this.saved = { paused: w.paused, speed: w.speed, detail: w.detail, rotationOrder: w.goat.rotation.order };
    w.goat.rotation.order = 'YXZ';
    this.origin = w.distance; this.startBest = this.best; this.lastMilestone = 0; this.clock = 0; this.endedByCollision = false;
    this.state.start((w.travelSpeed || 5.4) * w.speed); w.paused = false; w.controls.enabled = false;
    w.activities.pointerInside = false; w.activities.hide();
    this.camera.position.copy(w.camera.position); this.cameraTarget.copy(w.controls.target);
    this.chaseDirection = w.path.getTangentAt(w.progress);
    this.camera.fov = this.orbitFov(); this.entryPosition = this.camera.position.clone(); this.entryTarget = this.cameraTarget.clone(); this.entryFov = this.camera.fov;
    this.entryAnchor = w.path.getPointAt(w.progress);
    this.camera.aspect = w.aspect; this.camera.updateProjectionMatrix();
    let at = 31 + this.state.speed * 3.2;
    this.obstacles.forEach((obstacle, index) => {
      obstacle.at = at; obstacle.passed = false;
      obstacle.lateral = obstacle.hurdle ? 0 : [-1, 1, 0, 1, -1, 0, 1][index] * LANE_WIDTH;
      obstacle.root.visible = true; obstacle.body.scale.setScalar(1);
      at += 25 + Math.random() * 7;
    });
    this.nextObstacle = at;
    this.group.visible = true;
    for (const mat of this.materials) mat.opacity = mat.userData.opacity;
    $('run-result').hidden = true; $('run-hud').hidden = false;
    stage().classList.add('running'); stage().classList.remove('inspect', 'has-run-result');
    $('start-run').setAttribute('aria-expanded', 'true');
    $('run-feedback').textContent = ''; this.feedbackUntil = 0;
    $('run-instructions').hidden = false;
    $('world').setAttribute('aria-label', 'Carrera en tercera persona. Flechas izquierda y derecha o A y D para esquivar. Espacio o flecha arriba para saltar. P para pausar y Escape para salir. En móvil, desliza o usa los botones.');
    $('world').setAttribute('tabindex', '0'); $('world').focus({ preventScroll: true });
    this.announce('Prepárate. Flechas para esquivar. Espacio para saltar.');
    this.updateHUD();
  }

  orbitFov() {
    const w = this.world;
    return THREE.MathUtils.radToDeg(2 * Math.atan((w.camera.top - w.camera.bottom) / w.camera.zoom / (2 * w.camera.position.distanceTo(w.controls.target))));
  }

  move(direction) {
    if (this.state.move(direction)) {
      const button = $(direction < 0 ? 'run-left' : 'run-right');
      button.animate([{ transform: 'scale(.91)' }, { transform: 'scale(1)' }], { duration: 230, easing: 'cubic-bezier(.2,.8,.2,1)' });
    }
  }

  jump() {
    if (this.state.jump()) {
      this.ripple();
      $('run-jump').animate([{ transform: 'translateY(2px) scale(.96)' }, { transform: 'translateY(-3px)' }, { transform: 'none' }], { duration: 340 });
    }
  }

  setPaused(value) {
    if (!['countdown', 'running'].includes(this.state.phase)) return;
    this.state.paused = value;
    $('run-pause').textContent = value ? '▶' : 'Ⅱ';
    $('run-pause').setAttribute('aria-label', value ? 'Continuar carrera' : 'Pausar carrera');
    this.updateHUD();
  }

  togglePause() { this.setPaused(!this.state.paused); }
  announce(text) { $('run-announcer').textContent = text; }

  feedback(text) {
    $('run-feedback').textContent = text; this.feedbackUntil = this.clock + 1.5;
    $('run-feedback').animate([{ opacity: 0, transform: 'translateX(-50%) translateY(8px)' }, { opacity: 1, transform: 'translateX(-50%) translateY(0)' }], { duration: 260 });
  }

  ripple() {
    const ripple = this.ripples.find(item => item.age > 1);
    if (!ripple) return;
    ripple.age = 0; ripple.mesh.visible = true; ripple.mesh.position.copy(this.world.goat.position); ripple.mesh.position.y = .09;
  }

  tick(realDt) {
    if (!this.active) return null;
    const state = this.state, oldPhase = state.phase;
    if (!state.paused) this.clock += realDt;
    const advance = state.update(realDt, (this.world.travelSpeed || 5.4) * this.world.speed);
    if (oldPhase === 'countdown' && state.phase === 'running') { this.feedback('Encuentra tu ritmo.'); this.announce('¡Corre!'); }
    if (state.phase === 'crashed' && state.elapsed > .6) this.beginReturn();
    if (state.phase === 'returning' && state.elapsed > 1.35) this.finish();
    return advance;
  }

  placeGoat(p, direction, realDt) {
    if (!this.active) return;
    const state = this.state;
    const right = new THREE.Vector3(-direction.z, 0, direction.x);
    this.world.goat.position.copy(p).addScaledVector(right, state.lateral); this.world.goat.position.y += state.height;
    this.world.goat.rotation.y += state.steerYaw;
    this.world.goat.rotation.x = state.lean;
    this.world.goat.rotation.z = state.height > .03 ? -state.velocity * .012 : 0;
    if (state.phase === 'crashed') this.world.goat.rotation.x += Math.sin(state.elapsed * 15) * .12 * (1 - state.elapsed);
    if (state.phase === 'running') {
      for (const obstacle of this.obstacles) {
        if (!obstacle.passed && state.hits(obstacle)) { this.lose(); break; }
        if (!obstacle.passed && state.distance > obstacle.at + 3.2) {
          obstacle.passed = true; state.cleared++; this.ripple();
          this.feedback(obstacle.hurdle ? 'Salto limpio ↗' : 'A tu manera ↗');
        }
        if (state.distance > obstacle.at + 13) {
          obstacle.at = this.nextObstacle; this.nextObstacle += 24 + Math.random() * 8;
          obstacle.lateral = obstacle.hurdle ? 0 : (Math.floor(Math.random() * 3) - 1) * LANE_WIDTH;
          obstacle.passed = false;
        }
      }
      const milestone = Math.floor(state.distance / 100);
      if (milestone > this.lastMilestone) {
        this.lastMilestone = milestone; this.feedback(`${milestone * 100} m. Sigue salvaje.`); this.announce(`${milestone * 100} metros.`);
        $('run-distance').animate([{ filter: 'brightness(2)', transform: 'scale(1.08)' }, { filter: 'brightness(1)', transform: 'scale(1)' }], { duration: 600 });
      }
    }
    this.updateCourse(realDt);
    this.updateCamera(realDt, p);
    this.updateHUD();
  }

  updateCourse(dt) {
    const w = this.world, state = this.state;
    const opacity = state.phase === 'returning' ? 1 - ease(state.elapsed / .9) : 1;
    for (const material of this.materials) material.opacity = material.userData.opacity * opacity;
    this.course.material.opacity = .25 * opacity;
    for (const obstacle of this.obstacles) {
      const t = ((this.origin + obstacle.at) / w.pathLength) % 1;
      const point = w.path.getPointAt(t), direction = w.path.getTangentAt(t);
      obstacle.root.position.copy(point).addScaledVector(new THREE.Vector3(-direction.z, 0, direction.x), obstacle.lateral);
      obstacle.root.position.y = .035;
      obstacle.root.rotation.y = Math.atan2(direction.x, direction.z);
      obstacle.halo.material.opacity = .5 * opacity;
      obstacle.body.scale.y = obstacle.passed ? Math.max(.01, 1 - (state.distance - obstacle.at - 3.2) / 5) : 1;
    }
    const positions = this.course.geometry.attributes.position.array;
    let cursor = 0;
    for (const side of [-1, 1]) for (let i = 0; i < 60; i++) for (let j = 0; j < 2; j++) {
      const distance = w.distance - 8 + i * 1.25 + j * .8;
      const t = ((distance / w.pathLength) % 1 + 1) % 1, p = w.path.getPointAt(t), d = w.path.getTangentAt(t);
      p.addScaledVector(new THREE.Vector3(-d.z, 0, d.x), side * 4.05);
      positions[cursor++] = p.x; positions[cursor++] = .055; positions[cursor++] = p.z;
    }
    this.course.geometry.attributes.position.needsUpdate = true;
    for (const ripple of this.ripples) {
      if (ripple.age > 1) { ripple.mesh.visible = false; continue; }
      ripple.age += state.paused ? 0 : dt;
      ripple.mesh.scale.setScalar(1 + ripple.age * 4); ripple.mesh.material.opacity = (1 - Math.min(1, ripple.age)) * .65 * opacity;
    }
  }

  updateCamera(dt, p) {
    const w = this.world, state = this.state;
    const direction = w.path.getTangentAt(w.progress), right = new THREE.Vector3(-direction.z, 0, direction.x);
    // Dampen the heading, then anchor both ends to the player. Curves cannot
    // push the goat out of a narrow phone viewport as independent camera lag can.
    this.chaseDirection.lerp(direction, 1 - Math.exp(-dt * 5)).normalize();
    const position = p.clone().addScaledVector(this.chaseDirection, -14).add(new THREE.Vector3(0, w.width < 600 ? 9.2 : 7.8, 0)).addScaledVector(right, state.lateral * .7);
    const target = p.clone().addScaledVector(this.chaseDirection, 10).add(new THREE.Vector3(0, 1.3 + state.height * .16, 0)).addScaledVector(right, state.lateral * .7);
    const desiredFov = w.width < 600 ? 66 : 55;
    if (state.phase === 'countdown') {
      const blend = ease(state.elapsed / 2.6);
      const movement = p.clone().sub(this.entryAnchor);
      this.camera.position.lerpVectors(this.entryPosition.clone().add(movement), position, blend);
      this.cameraTarget.lerpVectors(this.entryTarget.clone().add(movement), target, blend);
      this.camera.fov = THREE.MathUtils.lerp(this.entryFov, desiredFov, blend);
    } else if (state.phase === 'returning') {
      const blend = ease(state.elapsed / 1.35);
      this.camera.position.lerpVectors(this.returnPosition, w.camera.position, blend);
      this.cameraTarget.lerpVectors(this.returnTarget, w.controls.target, blend);
      this.camera.fov = THREE.MathUtils.lerp(this.returnFov, this.orbitFov(), blend);
    } else {
      const blend = 1 - Math.exp(-dt * 7);
      this.camera.position.copy(position); this.cameraTarget.copy(target);
      this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, desiredFov, blend);
    }
    this.camera.aspect = w.aspect; this.camera.updateProjectionMatrix(); this.camera.lookAt(this.cameraTarget);
    w.renderPass.camera = this.camera;
    for (const mat of w.pointMats) mat.uniforms.uScale.value = w.height / 20;
  }

  updateHUD() {
    const state = this.state;
    $('run-distance').textContent = format(state.distance);
    $('run-cleared').textContent = String(state.cleared).padStart(2, '0');
    $('run-best').textContent = format(Math.max(this.best, state.distance));
    $('run-pace').textContent = `${(state.speed * 3.6).toFixed(0)} km/h`;
    $('run-progress').style.width = `${state.distance % 100}%`;
    $('run-lane').style.setProperty('--lane', state.lateral / LANE_WIDTH);
    $('run-hud').classList.toggle('is-paused', state.paused);
    $('run-hud').classList.toggle('is-airborne', state.height > .15);
    $('run-pause').textContent = state.paused ? '▶' : 'Ⅱ';
    const countdown = $('run-countdown');
    let text = state.paused ? 'En pausa' : state.phase === 'countdown' ? String(Math.max(1, 3 - Math.floor(state.elapsed))) : '';
    if (state.phase === 'crashed') text = 'Buen camino.';
    if (countdown.textContent !== text) {
      countdown.textContent = text;
      if (text) countdown.animate([{ opacity: 0, transform: 'translateX(-50%) scale(1.22) translateY(10px)' }, { opacity: 1, transform: 'translateX(-50%) scale(1) translateY(0)' }], { duration: 350 });
    }
    countdown.classList.toggle('has-message', state.paused || state.phase === 'crashed');
    if (state.distance > 40) $('run-instructions').hidden = true;
    if (this.clock > this.feedbackUntil) $('run-feedback').textContent = '';
  }

  lose() {
    this.state.crash(); this.endedByCollision = true;
    this.announce(`Fin de carrera. ${Math.floor(this.state.distance)} metros y ${this.state.cleared} obstáculos superados.`);
    stage().classList.add('run-impact');
    this.ripple();
  }

  exit(collision = false) {
    if (!this.active || this.state.phase === 'returning') return;
    this.endedByCollision = collision;
    this.beginReturn();
  }

  beginReturn() {
    this.state.phase = 'returning'; this.state.elapsed = 0; this.state.paused = false;
    this.state.lane = 0;
    this.returnPosition = this.camera.position.clone(); this.returnTarget = this.cameraTarget.clone(); this.returnFov = this.camera.fov;
    this.world.detail = this.saved.detail;
    stage().classList.remove('run-impact');
    $('run-hud').classList.add('is-returning');
  }

  finish() {
    const state = this.state, w = this.world, distance = Math.floor(state.distance);
    const isRecord = distance > this.startBest;
    if (distance > this.best) {
      this.best = distance;
      try { localStorage.setItem('goat-trail-best', String(distance)); } catch { /* Private browsers may disable storage. */ }
    }
    state.phase = 'idle'; this.group.visible = false;
    w.goat.rotation.x = 0; w.goat.rotation.z = 0;
    w.goat.rotation.order = this.saved.rotationOrder;
    w.paused = this.saved.paused; w.speed = this.saved.speed; w.controls.enabled = true;
    w.renderPass.camera = w.camera;
    $('world').setAttribute('aria-label', this.canvasLabel);
    stage().classList.remove('running', 'run-impact'); stage().classList.toggle('inspect', this.saved.detail);
    $('run-hud').hidden = true; $('run-hud').classList.remove('is-returning');
    $('start-run').setAttribute('aria-expanded', 'false');
    $('pause').classList.toggle('paused', w.paused); $('pause').setAttribute('aria-label', w.paused ? 'Reproducir animación' : 'Pausar animación');
    if (this.endedByCollision) {
      stage().classList.add('has-run-result');
      $('run-result').hidden = false;
      $('run-result-label').textContent = isRecord ? 'TU NUEVA MEJOR HUELLA' : 'CADA INTENTO DEJA HUELLA';
      $('run-result-distance').textContent = format(distance);
      $('run-result-detail').textContent = `${state.cleared} obstáculos superados · Récord ${this.best} m`;
      $('run-again').focus({ preventScroll: true });
    } else $('start-run').focus({ preventScroll: true });
  }
}
