export type Pt = { x: number; y: number }

const TWO_PI = Math.PI * 2

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function clamp(v: number, a = 0, b = 1): number {
  return Math.max(a, Math.min(b, v))
}

export function smooth(t: number): number {
  const c = clamp(t)
  return c * c * (3 - 2 * c)
}

export function phase(c: number, start: number, end: number): number {
  if (c <= start) return 0
  if (c >= end) return 1
  return (c - start) / (end - start)
}

export function rem(t: number, m: number): number {
  return ((t % m) + m) % m
}

export function withAlpha(color: string, a: number): string {
  const m = color.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/)
  if (m) return `rgba(${m[1]},${m[2]},${m[3]},${a})`
  if (color.startsWith('#')) {
    const h = color.slice(1)
    const hex = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
    const n = parseInt(hex, 16)
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
  }
  return color
}

function stroke(ctx: CanvasRenderingContext2D, pts: Pt[], color: string, width: number) {
  if (pts.length < 2) return
  ctx.beginPath()
  ctx.moveTo(pts[0].x, pts[0].y)
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y)
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.stroke()
}

function fillCircle(ctx: CanvasRenderingContext2D, p: Pt, r: number, color: string) {
  ctx.beginPath()
  ctx.arc(p.x, p.y, r, 0, TWO_PI)
  ctx.fillStyle = color
  ctx.fill()
}

function strokeCircle(ctx: CanvasRenderingContext2D, p: Pt, r: number, color: string, width: number) {
  ctx.beginPath()
  ctx.arc(p.x, p.y, r, 0, TWO_PI)
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.stroke()
}

function solveIK(start: Pt, end: Pt, len1: number, len2: number, bendSign: number): Pt {
  const dx = end.x - start.x
  const dy = end.y - start.y
  let dist = Math.hypot(dx, dy)
  dist = Math.max(0.0001, Math.min(dist, len1 + len2 - 0.001))
  const base = Math.atan2(dy, dx)
  const cosA = (len1 * len1 + dist * dist - len2 * len2) / (2 * len1 * dist)
  const angleA = Math.acos(clamp(cosA, -1, 1))
  const joint = base + bendSign * angleA
  return { x: start.x + Math.cos(joint) * len1, y: start.y + Math.sin(joint) * len1 }
}

type DrawFn = (ctx: CanvasRenderingContext2D, w: number, h: number, time: number, color: string) => void

function widths(scale: number) {
  return {
    torso: Math.max(2.2, scale * 0.11),
    leg: Math.max(2, scale * 0.10),
    arm: Math.max(1.8, scale * 0.085),
    thin: Math.max(1.2, scale * 0.04),
  }
}

function punchPulse(p: number, start: number, peak: number, end: number): number {
  if (p < start || p > end) return 0
  if (p < peak) return smooth(smooth((p - start) / (peak - start)))
  return 1 - smooth(smooth((p - peak) / (end - peak)))
}

const drawStrength: DrawFn = (ctx, w, h, time, color) => {
  const t = time * 2.8
  const cx = w / 2
  const cy = h * 0.85
  const scale = Math.min(w, h) * 0.38
  const { torso, leg, arm, thin } = widths(scale)
  const raw = rem(t, TWO_PI)
  const p = raw / TWO_PI
  const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2)

  let bodyExt = 1
  let barH = 0
  let armExt = 0
  let tremble = 0
  if (p < 0.18) {
    const k = ease(p / 0.18)
    bodyExt = 1 - k * 0.3
  } else if (p < 0.4) {
    const k = ease((p - 0.18) / 0.22)
    bodyExt = 0.7 + k * 0.3
    barH = k * 0.4
  } else if (p < 0.6) {
    const k = ease((p - 0.4) / 0.2)
    barH = 0.4 + k * 0.6
    armExt = k
  } else if (p < 0.72) {
    barH = 1
    armExt = 1
    tremble = 1.2 * Math.sin(t * 35)
  } else {
    const k = ease((p - 0.72) / 0.28)
    barH = 1 - k
    armExt = 1 - k
    tremble = (1 - k) * Math.sin(t * 35)
  }

  const footSpread = scale * 0.22
  const leftFoot = { x: cx - footSpread, y: cy }
  const rightFoot = { x: cx + footSpread, y: cy }
  const hip = { x: cx, y: cy - bodyExt * scale * 0.58 }
  const leftKnee = { x: (leftFoot.x + hip.x) / 2 - 4, y: (leftFoot.y + hip.y) / 2 + 1 }
  const rightKnee = { x: (rightFoot.x + hip.x) / 2 + 4, y: (rightFoot.y + hip.y) / 2 + 1 }
  const shoulder = { x: hip.x, y: hip.y - scale * 0.42 }
  const headR = scale * 0.19
  const head = { x: shoulder.x, y: shoulder.y - headR * 1.3 }
  const barY = shoulder.y + scale * 0.1 - barH * scale * 0.9 + tremble * 0.4
  const barW = scale * 1.8
  const handSpread = scale * 0.46
  const lHand = { x: shoulder.x - handSpread, y: barY }
  const rHand = { x: shoulder.x + handSpread, y: barY }
  const bow = 8 * (1 - armExt)
  const lElbow = { x: (shoulder.x + lHand.x) / 2 - bow, y: (shoulder.y + lHand.y) / 2 + bow }
  const rElbow = { x: (shoulder.x + rHand.x) / 2 + bow, y: (shoulder.y + rHand.y) / 2 + bow }

  fillCircle(ctx, head, headR, color)
  stroke(ctx, [shoulder, hip], color, torso)
  stroke(ctx, [leftFoot, leftKnee, hip], color, leg)
  stroke(ctx, [rightFoot, rightKnee, hip], color, leg)
  stroke(ctx, [shoulder, lElbow, lHand], color, arm)
  stroke(ctx, [shoulder, rElbow, rHand], color, arm)
  stroke(ctx, [{ x: cx - barW / 2, y: barY }, { x: cx + barW / 2, y: barY }], color, thin + 0.8)
  for (const side of [-1, 1]) {
    for (let i = 0; i < 2; i++) {
      const x = cx + side * (barW / 2 - 2 + i * 5)
      ctx.beginPath()
      ctx.roundRect(x - 3, barY - scale * 0.18, 6, scale * 0.36, 2)
      ctx.fillStyle = color
      ctx.fill()
    }
  }
}

const drawCalisthenics: DrawFn = (ctx, w, h, time, color) => {
  const t = time * 1.2
  const cx = w / 2
  const cy = h / 2
  const scale = Math.min(w, h) * 0.42
  const { torso, leg, arm } = widths(scale)
  const p = rem(t, TWO_PI) / TWO_PI
  let lift: number
  if (p < 0.3) lift = Math.sin((p / 0.3) * (Math.PI / 2))
  else if (p < 0.4) lift = 1
  else if (p < 0.8) {
    const tp = (p - 0.4) / 0.4
    lift = 1 - tp * tp * (3 - 2 * tp)
  } else lift = 0

  const barY = cy - scale * 0.7
  const barW = scale * 1.6
  const grip = scale * 0.55
  const handL = { x: cx - grip / 2, y: barY }
  const handR = { x: cx + grip / 2, y: barY }
  const hangY = barY + scale * 0.65
  const pullY = barY + scale * 0.05
  const neck = { x: cx, y: hangY + (pullY - hangY) * lift }
  const hip = { x: cx, y: neck.y + scale * 0.42 }
  const headR = scale * 0.14
  const head = { x: neck.x, y: neck.y - headR * 1.25 }
  const ua = scale * 0.28
  const fa = scale * 0.28
  const elbow = (shoulder: Pt, hand: Pt, left: boolean) => {
    const dx = hand.x - shoulder.x
    const dy = hand.y - shoulder.y
    const dist = Math.hypot(dx, dy)
    if (dist >= ua + fa) {
      const r = ua / (ua + fa)
      return { x: shoulder.x + dx * r, y: shoulder.y + dy * r }
    }
    const cosA = (ua * ua + dist * dist - fa * fa) / (2 * ua * dist)
    const ang = Math.acos(clamp(cosA, -1, 1))
    const base = Math.atan2(dy, dx)
    const e = left ? base - ang : base + ang
    return { x: shoulder.x + Math.cos(e) * ua, y: shoulder.y + Math.sin(e) * ua }
  }
  const eL = elbow(neck, handL, true)
  const eR = elbow(neck, handR, false)
  const thigh = scale * 0.3
  const shin = scale * 0.3
  const legA = Math.PI / 2 - 0.02 - lift * 0.05
  const spread = scale * 0.05 - lift * 0.04
  const kneeL = { x: hip.x - spread - Math.cos(legA) * thigh, y: hip.y + Math.sin(legA) * thigh }
  const kneeR = { x: hip.x + spread + Math.cos(legA) * thigh, y: hip.y + Math.sin(legA) * thigh }
  const shinA = legA + 0.05
  const footL = { x: kneeL.x - Math.cos(shinA) * shin, y: kneeL.y + Math.sin(shinA) * shin }
  const footR = { x: kneeR.x + Math.cos(shinA) * shin, y: kneeR.y + Math.sin(shinA) * shin }

  stroke(ctx, [neck, hip], color, torso)
  stroke(ctx, [hip, kneeL, footL], color, leg)
  stroke(ctx, [hip, kneeR, footR], color, leg)
  stroke(ctx, [neck, eL, handL], color, arm)
  stroke(ctx, [neck, eR, handR], color, arm)
  fillCircle(ctx, head, headR, color)
  stroke(ctx, [{ x: cx - barW / 2, y: barY }, { x: cx + barW / 2, y: barY }], '#f97316', Math.max(3, scale * 0.1))
}

const drawRunning: DrawFn = (ctx, w, h, time, color) => {
  drawGait(ctx, w, h, time, color, { speed: 7.5, lean: 0.15, bounce: 2, armAmp: 0.8, kneeFold: 1.8 })
}

function drawGait(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  color: string,
  opts: { speed: number; lean: number; bounce: number; armAmp: number; kneeFold: number; extra?: (args: { scale: number; center: Pt; hips: Pt; shoulders: Pt; cycle: number }) => void }
) {
  const t = time * opts.speed
  const center = { x: w / 2, y: h / 2 }
  const scale = Math.min(w, h) * 0.4
  const { torso, leg, arm } = widths(scale)
  const cycle = rem(t, TWO_PI)
  const bounce = (1 - Math.cos(cycle * 2)) * opts.bounce
  const hips = { x: center.x, y: center.y + bounce }
  const torsoLen = scale * 0.55
  const shoulders = {
    x: hips.x + Math.sin(opts.lean) * torsoLen,
    y: hips.y - Math.cos(opts.lean) * torsoLen,
  }
  const headR = scale * 0.16
  const head = {
    x: shoulders.x + Math.sin(opts.lean) * headR * 1.5,
    y: shoulders.y - Math.cos(opts.lean) * headR * 1.5,
  }
  const limbScale = scale * 0.55
  const back = withAlpha(color, 0.4)

  const limb = (start: Pt, phaseOff: number, isArm: boolean, isFront: boolean) => {
    const p = cycle + phaseOff
    const c = isFront ? color : back
    const width = isArm ? arm : leg
    if (isArm) {
      const upper = Math.sin(p) * opts.armAmp
      const elbowA = upper + 1.4
      const elbow = {
        x: start.x + Math.sin(upper) * limbScale * 0.55,
        y: start.y + Math.cos(upper) * limbScale * 0.55,
      }
      const hand = {
        x: elbow.x + Math.sin(elbowA) * limbScale * 0.45,
        y: elbow.y + Math.cos(elbowA) * limbScale * 0.45,
      }
      stroke(ctx, [start, elbow, hand], c, width)
    } else {
      const upper = Math.sin(p) * opts.armAmp
      const fold = Math.max(Math.cos(p) * opts.kneeFold, 0.1)
      const lower = upper - fold
      const knee = {
        x: start.x + Math.sin(upper) * limbScale * 0.5,
        y: start.y + Math.cos(upper) * limbScale * 0.5,
      }
      const foot = {
        x: knee.x + Math.sin(lower) * limbScale * 0.5,
        y: knee.y + Math.cos(lower) * limbScale * 0.5,
      }
      stroke(ctx, [start, knee, foot], c, width)
    }
  }

  limb(shoulders, Math.PI, true, false)
  limb(hips, 0, false, false)
  fillCircle(ctx, head, headR, color)
  stroke(ctx, [shoulders, hips], color, torso)
  limb(hips, Math.PI, false, true)
  limb(shoulders, 0, true, true)
  opts.extra?.({ scale, center, hips, shoulders, cycle })
}

const drawCycling: DrawFn = (ctx, w, h, time, color) => {
  const t = time * 4
  const cx = w / 2
  const cy = h / 2
  const scale = Math.min(w, h) * 0.35
  const { torso, leg, arm, thin } = widths(scale)
  const cycle = rem(t, TWO_PI)
  const back = withAlpha(color, 0.35)
  const wheelR = scale * 0.3
  const wheelY = cy + scale * 0.5
  const rear = { x: cx - scale * 0.48, y: wheelY }
  const front = { x: cx + scale * 0.48, y: wheelY }

  const drawWheel = (c: Pt) => {
    strokeCircle(ctx, c, wheelR, color, thin)
    fillCircle(ctx, c, 2, color)
    for (let i = 0; i < 4; i++) {
      const a = cycle + (i * Math.PI) / 2
      stroke(ctx, [c, { x: c.x + Math.cos(a) * (wheelR - 2), y: c.y + Math.sin(a) * (wheelR - 2) }], withAlpha(color, 0.25), 1)
    }
  }
  drawWheel(rear)
  drawWheel(front)

  const bb = { x: rear.x + (front.x - rear.x) * 0.42, y: wheelY - wheelR * 0.25 }
  const seat = { x: rear.x + scale * 0.18, y: wheelY - wheelR * 1.55 }
  const bars = { x: front.x - scale * 0.08, y: wheelY - wheelR * 1.35 }
  stroke(ctx, [bb, seat], color, thin)
  stroke(ctx, [bb, bars], color, thin)
  stroke(ctx, [seat, bars], color, thin * 0.8)
  stroke(ctx, [rear, bb], color, thin * 0.8)
  stroke(ctx, [rear, seat], color, thin * 0.7)
  stroke(ctx, [front, bars], color, thin * 0.8)

  const crank = scale * 0.18
  const pedal1 = { x: bb.x + Math.cos(cycle) * crank, y: bb.y + Math.sin(cycle) * crank }
  const pedal2 = { x: bb.x + Math.cos(cycle + Math.PI) * crank, y: bb.y + Math.sin(cycle + Math.PI) * crank }
  stroke(ctx, [bb, pedal1], color, thin)
  stroke(ctx, [bb, pedal2], back, thin)

  const hip = { x: seat.x + 2, y: seat.y - 3 }
  const lean = 0.4
  const torsoLen = scale * 0.5
  const shoulder = { x: hip.x + Math.sin(lean) * torsoLen, y: hip.y - Math.cos(lean) * torsoLen }
  const headR = scale * 0.168
  const head = { x: shoulder.x + Math.sin(lean) * headR, y: shoulder.y - headR * 1.3 }
  const thigh = scale * 0.45
  const shin = scale * 0.42
  const knee1 = solveIK(hip, pedal1, thigh, shin, 1)
  const knee2 = solveIK(hip, pedal2, thigh, shin, 1)
  stroke(ctx, [hip, knee2, pedal2], back, leg)
  const backHand = { x: bars.x - 1, y: bars.y - 2 }
  const backElbow = { x: (shoulder.x + backHand.x) / 2 - 2, y: (shoulder.y + backHand.y) / 2 + 5 }
  stroke(ctx, [shoulder, backElbow, backHand], back, arm)
  fillCircle(ctx, head, headR, color)
  stroke(ctx, [shoulder, hip], color, torso)
  stroke(ctx, [hip, knee1, pedal1], color, leg)
  const frontHand = { x: bars.x + 1, y: bars.y - 2 }
  const frontElbow = { x: (shoulder.x + frontHand.x) / 2 + 2, y: (shoulder.y + frontHand.y) / 2 + 5 }
  stroke(ctx, [shoulder, frontElbow, frontHand], color, arm)
  stroke(ctx, [{ x: bars.x - 4, y: bars.y - 3 }, { x: bars.x + 5, y: bars.y - 3 }], color, thin)
}

const drawSwimming: DrawFn = (ctx, w, h, time, color) => {
  const t = time * 3.5
  const cx = w / 2
  const cy = h / 2
  const scale = Math.min(w, h) * 0.4
  const { torso, arm } = widths(scale)
  const cycle = rem(t, TWO_PI)
  const shoulderBob = Math.sin(cycle * 2) * scale * 0.05
  const shoulderXBob = Math.cos(cycle * 2) * scale * 0.03
  const shoulder = { x: cx + scale * 0.15 + shoulderXBob, y: cy + scale * 0.05 + shoulderBob }
  const hips = { x: cx - scale * 0.4, y: cy + scale * 0.25 }
  const headR = scale * 0.15
  const headLift = Math.max(0, Math.sin(cycle * 2 - Math.PI / 2) * scale * 0.03)
  const head = { x: shoulder.x + scale * 0.22, y: shoulder.y - scale * 0.2 - headLift }

  const wave1Off = t * 3
  const waveLen1 = scale * 1.4
  const amp1 = scale * 0.08
  const water1 = cy + scale * 0.2

  ctx.save()
  ctx.beginPath()
  ctx.moveTo(0, 0)
  for (let x = 0; x <= w + 5; x += 4) {
    const y = water1 + Math.sin(x / waveLen1 + wave1Off) * amp1
    ctx.lineTo(x, y)
  }
  ctx.lineTo(w, 0)
  ctx.closePath()
  ctx.clip()

  const drawArm = (phaseOff: number, front: boolean) => {
    const rawP = rem(cycle + phaseOff, TWO_PI)
    const isRecovery = rawP > Math.PI
    const bend = isRecovery ? Math.sin(rawP - Math.PI) * 2.2 : Math.sin(rawP) * 0.4
    const elbowA = rawP + bend
    const c = front ? color : withAlpha(color, 0.3)
    const width = front ? arm : arm * 0.82
    const len = scale * 0.35
    const elbow = { x: shoulder.x + Math.cos(rawP) * len, y: shoulder.y + Math.sin(rawP) * len }
    const hand = { x: elbow.x + Math.cos(elbowA) * len, y: elbow.y + Math.sin(elbowA) * len }
    stroke(ctx, [shoulder, elbow, hand], c, width)
  }
  drawArm(Math.PI, false)
  stroke(ctx, [shoulder, hips], color, torso)
  fillCircle(ctx, head, headR, color)
  drawArm(0, true)
  ctx.restore()

  const wStart = cx - scale * 1.3
  const wEnd = cx + scale * 1.3
  ctx.beginPath()
  for (let x = wStart; x <= wEnd; x += 4) {
    const y = water1 + Math.sin(x / waveLen1 + wave1Off) * amp1
    if (x === wStart) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.strokeStyle = '#22d3ee'
  ctx.lineWidth = Math.max(2.5, scale * 0.08)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.stroke()

  const wave2Off = t * 4 + 1
  const waveLen2 = scale * 1.1
  const amp2 = scale * 0.1
  const water2 = cy + scale * 0.32
  ctx.beginPath()
  const s2 = wStart - scale * 0.1
  const e2 = wEnd + scale * 0.1
  for (let x = s2; x <= e2; x += 4) {
    const y = water2 + Math.sin(x / waveLen2 + wave2Off) * amp2
    if (x === s2) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = Math.max(3, scale * 0.1)
  ctx.stroke()
}

const drawCardio: DrawFn = (ctx, w, h, time, color) => {
  const t = time * 6
  const cx = w / 2
  const cy = h / 2
  const scale = Math.min(w, h) * 0.4
  const { torso, leg, arm, thin } = widths(scale)
  const cycle = rem(t, TWO_PI)
  const jumpH = scale * 0.18
  const bounce = Math.max(0, Math.cos(cycle)) * jumpH
  const squat = Math.max(0, -Math.cos(cycle)) * scale * 0.04
  const hips = { x: cx, y: cy + scale * 0.4 - bounce + squat }
  const shoulders = { x: hips.x, y: hips.y - scale * 0.35 }
  const headR = scale * 0.16
  const head = { x: shoulders.x, y: shoulders.y - headR * 1.5 }
  const stance = scale * 0.15
  const groundY = cy + scale * 0.85
  const footY = groundY - bounce
  stroke(ctx, [shoulders, hips], color, torso)
  fillCircle(ctx, head, headR, color)
  stroke(ctx, [hips, { x: hips.x - stance, y: footY }], color, leg)
  stroke(ctx, [hips, { x: hips.x + stance, y: footY }], color, leg)
  const elbowW = scale * 0.18
  const elbowY = (shoulders.y + hips.y) / 2 + scale * 0.05
  const lElbow = { x: shoulders.x - elbowW, y: elbowY }
  const rElbow = { x: shoulders.x + elbowW, y: elbowY }
  const lHand = { x: lElbow.x + scale * 0.04, y: lElbow.y + scale * 0.12 }
  const rHand = { x: rElbow.x - scale * 0.04, y: rElbow.y + scale * 0.12 }
  stroke(ctx, [shoulders, lElbow, lHand], color, arm)
  stroke(ctx, [shoulders, rElbow, rHand], color, arm)

  ctx.beginPath()
  const ropePhase = cycle
  for (let i = 0; i <= 24; i++) {
    const u = i / 24
    const x = lHand.x + (rHand.x - lHand.x) * u
    const arc = Math.sin(u * Math.PI) * scale * 0.7
    const y = (lHand.y + rHand.y) / 2 + Math.cos(ropePhase) * arc
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.strokeStyle = withAlpha(color, 0.7)
  ctx.lineWidth = thin
  ctx.stroke()
}

const drawHIIT: DrawFn = (ctx, w, h, time, color) => {
  const t = time * 4.5
  const cx = w / 2
  const cy = h / 2
  const scale = Math.min(w, h) * 0.38
  const { torso, leg, arm } = widths(scale)
  const cycle = rem(t, TWO_PI)
  const raw = (1 - Math.cos(cycle)) / 2
  const jp = raw * raw * (3 - 2 * raw)
  const jumpH = jp * scale * 0.18
  const groundY = cy + scale * 0.6
  const hip = { x: cx, y: groundY - jumpH - scale * 0.45 }
  const shoulder = { x: cx, y: hip.y - scale * 0.45 }
  const headR = scale * 0.16
  const head = { x: cx, y: shoulder.y - headR * 1.3 }
  const spread = scale * 0.05 + (scale * 0.45) * jp
  const feetY = groundY - jumpH
  const lFoot = { x: cx - spread, y: feetY }
  const rFoot = { x: cx + spread, y: feetY }
  const bow = jp * scale * 0.06
  const lKnee = { x: (lFoot.x + hip.x) / 2 - bow, y: (lFoot.y + hip.y) / 2 }
  const rKnee = { x: (rFoot.x + hip.x) / 2 + bow, y: (rFoot.y + hip.y) / 2 }
  const armLen = scale * 0.44
  const ua = armLen * 0.55
  const fa = armLen * 0.45
  const sweep = 0.08 + jp * Math.PI * 0.82
  const lElbow = { x: shoulder.x - Math.sin(sweep) * ua, y: shoulder.y + Math.cos(sweep) * ua }
  const lHand = { x: lElbow.x - Math.sin(sweep + 0.08) * fa, y: lElbow.y + Math.cos(sweep + 0.08) * fa }
  const rElbow = { x: shoulder.x + Math.sin(sweep) * ua, y: shoulder.y + Math.cos(sweep) * ua }
  const rHand = { x: rElbow.x + Math.sin(sweep + 0.08) * fa, y: rElbow.y + Math.cos(sweep + 0.08) * fa }
  const back = withAlpha(color, 0.35)
  stroke(ctx, [shoulder, lElbow, lHand], back, arm)
  stroke(ctx, [hip, lKnee, lFoot], back, leg)
  fillCircle(ctx, head, headR, color)
  stroke(ctx, [shoulder, hip], color, torso)
  stroke(ctx, [hip, rKnee, rFoot], color, leg)
  stroke(ctx, [shoulder, rElbow, rHand], color, arm)
}

const drawYoga: DrawFn = (ctx, w, h, time, color) => {
  const cx = w / 2
  const cy = h / 2
  const scale = Math.min(w, h) * 0.4
  const { torso, leg, arm } = widths(scale)
  const phaseA = time * TWO_PI / 4
  const sway = Math.sin(phaseA) * 0.08
  const rot = (p: Pt, a: number): Pt => ({
    x: p.x * Math.cos(a) - p.y * Math.sin(a),
    y: p.x * Math.sin(a) + p.y * Math.cos(a),
  })
  const torsoA = -Math.PI / 3.8
  const torsoLen = scale * 0.45
  const shoulderL = { x: Math.cos(torsoA) * torsoLen, y: Math.sin(torsoA) * torsoLen }
  const headR = scale * 0.16
  const headA = torsoA - 0.2
  const headL = { x: shoulderL.x + Math.cos(headA) * headR * 1.5, y: shoulderL.y + Math.sin(headA) * headR * 1.5 }
  const standA = Math.PI / 2.05
  const st = scale * 0.28
  const sKneeL = { x: Math.cos(standA) * st, y: Math.sin(standA) * st }
  const sFootL = { x: sKneeL.x + Math.cos(standA) * st, y: sKneeL.y + Math.sin(standA) * st }
  const liftThigh = scale * 0.36
  const lKneeL = { x: Math.cos(Math.PI) * liftThigh, y: Math.sin(Math.PI) * liftThigh }
  const liftShin = scale * 0.34
  const lFootL = { x: lKneeL.x + Math.cos(-Math.PI / 2) * liftShin, y: lKneeL.y + Math.sin(-Math.PI / 2) * liftShin }
  const armA = 0.28
  const armLen = scale * 0.42
  const fElbowL = { x: shoulderL.x + Math.cos(armA) * armLen * 0.5, y: shoulderL.y + Math.sin(armA) * armLen * 0.5 }
  const fHandL = { x: shoulderL.x + Math.cos(armA) * armLen, y: shoulderL.y + Math.sin(armA) * armLen }
  const bA = armA + Math.PI
  const bElbowL = { x: shoulderL.x + Math.cos(bA) * armLen * 0.5, y: shoulderL.y + Math.sin(bA) * armLen * 0.5 }
  const bHandL = { x: shoulderL.x + Math.cos(bA) * armLen, y: shoulderL.y + Math.sin(bA) * armLen }
  const groundY = cy + scale * 0.85
  const sfR = rot(sFootL, sway)
  const ox = cx - sfR.x
  const oy = groundY - sfR.y
  const g = (p: Pt): Pt => {
    const r = rot(p, sway)
    return { x: r.x + ox, y: r.y + oy }
  }
  const hip = g({ x: 0, y: 0 })
  const shoulder = g(shoulderL)
  const head = g(headL)
  const sKnee = g(sKneeL)
  const sFoot = g(sFootL)
  const lKnee = g(lKneeL)
  const lFoot = g(lFootL)
  const fElbow = g(fElbowL)
  const fHand = g(fHandL)
  const bElbow = g(bElbowL)
  const bHand = g(bHandL)
  const back = withAlpha(color, 0.4)
  stroke(ctx, [hip, lKnee, lFoot], back, leg)
  stroke(ctx, [shoulder, bElbow, bHand], back, arm)
  stroke(ctx, [shoulder, hip], color, torso)
  fillCircle(ctx, head, headR, color)
  stroke(ctx, [hip, sKnee, sFoot], color, leg)
  stroke(ctx, [shoulder, fElbow, fHand], color, arm)
}

const drawPilates: DrawFn = (ctx, w, h, time, color) => {
  const t = time * 1.6
  const cx = w / 2
  const cy = h / 2
  const scale = Math.min(w, h) * 0.42
  const { torso, leg, arm } = widths(scale)
  const full = rem(t, TWO_PI)
  const isRight = full < Math.PI
  const legPhase = isRight ? full / Math.PI : (full - Math.PI) / Math.PI
  const rawLift = Math.sin(legPhase * Math.PI)
  const lift = rawLift * rawLift * (3 - 2 * rawLift)
  const groundY = cy + scale * 0.35
  const hip = { x: cx + scale * 0.05, y: groundY - scale * 0.08 }
  const curl = 0.25 + lift * 0.35
  const torsoLen = scale * 0.42
  const shoulder = { x: hip.x - Math.cos(curl) * torsoLen, y: hip.y - Math.sin(curl) * torsoLen }
  const headR = scale * 0.14
  const headA = curl + 0.2 + lift * 0.15
  const head = { x: shoulder.x - Math.cos(headA) * headR * 1.2, y: shoulder.y - Math.sin(headA) * headR * 1.2 }
  const thigh = scale * 0.28
  const shin = scale * 0.28
  const rest = 0.18
  const lifted = 1.35
  const makeLeg = (amt: number) => {
    const a = rest + (lifted - rest) * amt
    const bend = 0.5 * (1 - amt * 0.7)
    const knee = {
      x: hip.x + Math.cos(a + bend * 0.6) * thigh,
      y: hip.y - Math.sin(a + bend * 0.6) * thigh,
    }
    const sa = a - bend * 0.8
    const foot = { x: knee.x + Math.cos(sa) * shin, y: knee.y - Math.sin(sa) * shin }
    return { knee, foot }
  }
  const right = makeLeg(isRight ? lift : 0)
  const left = makeLeg(isRight ? 0 : lift)
  const activeKnee = isRight ? right.knee : left.knee
  const activeFoot = isRight ? right.foot : left.foot
  const target = { x: activeKnee.x * 0.4 + activeFoot.x * 0.6, y: activeKnee.y * 0.4 + activeFoot.y * 0.6 }
  const reachElbow = {
    x: shoulder.x + (target.x - shoulder.x) * 0.5 * lift + (1 - lift) * scale * 0.15,
    y: shoulder.y + (target.y - shoulder.y) * 0.5 * lift + (1 - lift) * scale * 0.06,
  }
  const reachHand = {
    x: shoulder.x + (target.x - shoulder.x) * 0.85 * lift + (1 - lift) * scale * 0.25,
    y: shoulder.y + (target.y - shoulder.y) * 0.85 * lift + (1 - lift) * scale * 0.1,
  }
  const back = withAlpha(color, 0.3)
  const d = 3
  stroke(ctx, [{ x: cx - scale * 0.95, y: groundY + 2 }, { x: cx + scale * 0.85, y: groundY + 2 }], withAlpha(color, 0.12), 4)
  stroke(ctx, [shoulder, { x: reachElbow.x, y: reachElbow.y + d }, { x: reachHand.x, y: reachHand.y + d }], back, arm)
  stroke(ctx, [hip, { x: left.knee.x, y: left.knee.y + d }, { x: left.foot.x, y: left.foot.y + d }], back, leg)
  stroke(ctx, [shoulder, hip], color, torso)
  fillCircle(ctx, head, headR, color)
  stroke(ctx, [hip, right.knee, right.foot], color, leg)
  stroke(ctx, [shoulder, reachElbow, reachHand], color, arm)
}

const drawCore: DrawFn = (ctx, w, h, time, color) => {
  const t = time * 2.4
  const cx = w / 2 + w * 0.08
  const cy = h / 2
  const scale = Math.min(w, h) * 0.45
  const { torso, leg, arm } = widths(scale)
  const cycle = rem(t, TWO_PI)
  const raw = (1 - Math.cos(cycle)) / 2
  const p1 = raw * raw * (3 - 2 * raw)
  const crunch = p1 * p1 * (3 - 2 * p1)
  const groundY = cy + scale * 0.25
  const hip = { x: cx - scale * 0.15, y: groundY - scale * 0.05 }
  const tLen = scale * 0.32
  const sLen = scale * 0.32
  const foot = { x: cx + scale * 0.4 - crunch * scale * 0.04, y: groundY }
  const knee = solveIK(hip, foot, tLen, sLen, -1)
  const flat = Math.PI + 0.05
  const curled = Math.PI + 1.15
  const torsoA = flat + (curled - flat) * crunch
  const torsoLen = scale * 0.45
  const shoulder = { x: hip.x + Math.cos(torsoA) * torsoLen, y: hip.y + Math.sin(torsoA) * torsoLen }
  const headR = scale * 0.15
  const headA = torsoA - 0.15 * crunch
  const head = { x: shoulder.x + Math.cos(headA) * headR * 1.35, y: shoulder.y + Math.sin(headA) * headR * 1.35 }
  const hand = {
    x: head.x + Math.cos(headA - Math.PI * 0.05) * headR * 1.3,
    y: head.y + Math.sin(headA - Math.PI * 0.05) * headR * 1.3,
  }
  const flare = torsoA + Math.PI / 2
  const elbowOff = scale * 0.16 - scale * 0.08 * crunch
  const elbow = {
    x: (shoulder.x + hand.x) / 2 + Math.cos(flare) * elbowOff,
    y: (shoulder.y + hand.y) / 2 + Math.sin(flare) * elbowOff,
  }
  const back = withAlpha(color, 0.35)
  stroke(ctx, [{ x: cx - scale * 0.85, y: groundY + 3 }, { x: cx + scale * 0.75, y: groundY + 3 }], withAlpha(color, 0.12), 4)
  stroke(ctx, [shoulder, { x: elbow.x - 2, y: elbow.y + 2 }, { x: hand.x - 1, y: hand.y + 1 }], back, arm)
  stroke(ctx, [hip, { x: knee.x + 3, y: knee.y - 2 }, { x: foot.x + 3, y: foot.y }], back, leg)
  stroke(ctx, [shoulder, hip], color, torso)
  fillCircle(ctx, head, headR, color)
  stroke(ctx, [hip, knee, foot], color, leg)
  stroke(ctx, [shoulder, elbow, hand], color, arm)
}

const drawSoccer: DrawFn = (ctx, w, h, time, color) => {
  drawGait(ctx, w, h, time, color, {
    speed: 7.5,
    lean: 0.15,
    bounce: 2,
    armAmp: 0.8,
    kneeFold: 1.8,
    extra: ({ scale, center, cycle }) => {
      const ballR = scale * 0.12
      const ball = {
        x: center.x + scale * 0.45 - Math.cos(cycle * 2) * scale * 0.18,
        y: center.y + scale * 0.58 - Math.abs(Math.sin(cycle * 2)) * scale * 0.05,
      }
      fillCircle(ctx, ball, ballR, color)
    },
  })
}

const drawBasketball: DrawFn = (ctx, w, h, time, color) => {
  const t = time * 5.2
  const cx = w / 2
  const cy = h / 2
  const scale = Math.min(w, h) * 0.4
  const { torso, leg, arm } = widths(scale)
  const cycle = rem(t, TWO_PI)
  const bounce = Math.abs(Math.sin(cycle)) * scale * 0.04
  const hip = { x: cx - scale * 0.05, y: cy + scale * 0.15 + bounce }
  const lean = 0.18
  const shoulder = { x: hip.x + Math.sin(lean) * scale * 0.5, y: hip.y - Math.cos(lean) * scale * 0.5 }
  const headR = scale * 0.16
  const head = { x: shoulder.x + Math.sin(lean) * headR * 1.3, y: shoulder.y - Math.cos(lean) * headR * 1.3 }
  const groundY = cy + scale * 0.72
  const lFoot = { x: cx - scale * 0.22, y: groundY }
  const rFoot = { x: cx + scale * 0.18, y: groundY }
  const lKnee = { x: (lFoot.x + hip.x) / 2 - 4, y: (lFoot.y + hip.y) / 2 }
  const rKnee = { x: (rFoot.x + hip.x) / 2 + 4, y: (rFoot.y + hip.y) / 2 }
  const dribble = (Math.sin(cycle) + 1) / 2
  const ballR = scale * 0.11
  const ball = {
    x: shoulder.x + scale * 0.38,
    y: lerp(shoulder.y + scale * 0.08, groundY - ballR, dribble * dribble),
  }
  const rHand = { x: ball.x - ballR * 0.2, y: Math.min(ball.y - ballR * 0.4, shoulder.y + scale * 0.22) }
  const rElbow = { x: (shoulder.x + rHand.x) / 2 + 6, y: (shoulder.y + rHand.y) / 2 + 8 }
  const lHand = { x: shoulder.x - scale * 0.22, y: hip.y - scale * 0.05 }
  const lElbow = { x: shoulder.x - scale * 0.18, y: shoulder.y + scale * 0.18 }
  const back = withAlpha(color, 0.4)
  stroke(ctx, [hip, lKnee, lFoot], back, leg)
  stroke(ctx, [shoulder, lElbow, lHand], back, arm)
  stroke(ctx, [shoulder, hip], color, torso)
  fillCircle(ctx, head, headR, color)
  stroke(ctx, [hip, rKnee, rFoot], color, leg)
  stroke(ctx, [shoulder, rElbow, rHand], color, arm)
  fillCircle(ctx, ball, ballR, '#f97316')
  strokeCircle(ctx, ball, ballR, color, 1)
}

const drawBaseball: DrawFn = (ctx, w, h, time, color) => {
  const c = rem(time * 0.42, 1)
  const cx = w / 2
  const cy = h / 2
  const scale = Math.min(w, h) * 0.4
  const { torso, leg, arm, thin } = widths(scale)
  const load = smooth(phase(c, 0.22, 0.4))
  const swing = smooth(phase(c, 0.4, 0.6))
  const follow = smooth(phase(c, 0.6, 0.74))
  const recover = smooth(phase(c, 0.74, 1))
  const key = (a: number, b: number, d: number, e: number) => {
    if (c < 0.22) return a
    if (c < 0.4) return lerp(a, b, load)
    if (c < 0.6) return lerp(b, d, swing)
    if (c < 0.74) return lerp(d, e, follow)
    return lerp(e, a, recover)
  }
  const groundY = cy + scale * 0.72
  const hips = { x: cx - scale * 0.03 + key(0, -scale * 0.09, scale * 0.17, scale * 0.11), y: groundY - scale * 0.5 + key(0, scale * 0.06, -scale * 0.04, scale * 0.01) }
  const lean = key(-0.04, -0.22, 0.16, 0.08)
  const shoulder = { x: hips.x + Math.sin(lean) * scale * 0.46, y: hips.y - Math.cos(lean) * scale * 0.46 }
  const headR = scale * 0.15
  const head = { x: shoulder.x + Math.sin(lean - 0.08) * headR * 1.35, y: shoulder.y - Math.cos(lean - 0.08) * headR * 1.35 }
  const backFoot = { x: key(cx - scale * 0.25, cx - scale * 0.26, cx - scale * 0.22, cx - scale * 0.2), y: groundY }
  const frontFoot = { x: key(cx + scale * 0.24, cx + scale * 0.21, cx + scale * 0.27, cx + scale * 0.31), y: groundY }
  const backKnee = solveIK(hips, backFoot, scale * 0.3, scale * 0.31, -1)
  const frontKnee = solveIK(hips, frontFoot, scale * 0.3, scale * 0.31, -1)
  const handle = {
    x: shoulder.x + key(scale * 0.03, -scale * 0.01, scale * 0.22, scale * 0.18),
    y: shoulder.y + key(scale * 0.19, scale * 0.22, scale * 0.15, scale * 0.15),
  }
  const batA = key(-1.8, -2.4, 0.4, 1.1)
  const batEnd = { x: handle.x + Math.cos(batA) * scale * 0.72, y: handle.y + Math.sin(batA) * scale * 0.72 }
  const hitElbow = solveIK(shoulder, handle, scale * 0.28, scale * 0.28, -1)
  const otherHand = { x: handle.x - 4, y: handle.y + 2 }
  const otherElbow = solveIK(shoulder, otherHand, scale * 0.26, scale * 0.26, 1)
  const back = withAlpha(color, 0.4)
  stroke(ctx, [hips, backKnee, backFoot], back, leg)
  stroke(ctx, [shoulder, otherElbow, otherHand], back, arm)
  stroke(ctx, [shoulder, hips], color, torso)
  fillCircle(ctx, head, headR, color)
  stroke(ctx, [hips, frontKnee, frontFoot], color, leg)
  stroke(ctx, [shoulder, hitElbow, handle], color, arm)
  stroke(ctx, [handle, batEnd], '#38bdf8', thin + 1)
  fillCircle(ctx, batEnd, scale * 0.045, '#38bdf8')
}

const drawTennis: DrawFn = (ctx, w, h, time, color) => {
  drawRacketSport(ctx, w, h, time, color, 'tennis')
}

const drawPadel: DrawFn = (ctx, w, h, time, color) => {
  drawRacketSport(ctx, w, h, time, color, 'padel')
}

function drawRacketSport(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  color: string,
  kind: 'tennis' | 'padel'
) {
  const c = rem(time * 0.42, 1)
  const cx = w / 2
  const cy = h / 2
  const scale = Math.min(w, h) * 0.4
  const { torso, leg, arm, thin } = widths(scale)
  const prep = smooth(phase(c, 0, 0.25))
  const backP = smooth(phase(c, 0.25, 0.45))
  const swing = smooth(phase(c, 0.45, 0.65))
  const follow = smooth(phase(c, 0.65, 0.85))
  const rec = smooth(phase(c, 0.85, 1))
  const key = (a: number, b: number, d: number, e: number, f: number) => {
    if (c < 0.25) return lerp(a, b, prep)
    if (c < 0.45) return lerp(b, d, backP)
    if (c < 0.65) return lerp(d, e, swing)
    if (c < 0.85) return lerp(e, f, follow)
    return lerp(f, a, rec)
  }
  const groundY = cy + scale * 0.72
  const hips = {
    x: cx + key(0, -scale * 0.05, -scale * 0.15, scale * 0.15, scale * 0.05),
    y: groundY - scale * 0.5 + key(0, scale * 0.02, scale * 0.08, scale * 0.05, 0),
  }
  const lean = key(0.05, -0.05, -0.15, 0.25, 0.15)
  const shoulder = { x: hips.x + Math.sin(lean) * scale * 0.5, y: hips.y - Math.cos(lean) * scale * 0.5 }
  const headR = scale * 0.15
  const head = { x: shoulder.x + Math.sin(lean) * headR * 1.3, y: shoulder.y - Math.cos(lean) * headR * 1.3 }
  const handle = {
    x: shoulder.x + key(scale * 0.2, scale * 0.1, -scale * 0.4, scale * 0.5, scale * 0.4),
    y: shoulder.y + key(scale * 0.3, scale * 0.4, scale * 0.1, 0, scale * 0.1),
  }
  const rAngle = key(0.6, 1.2, 2.6, -0.2, 0.3)
  const hitElbow = solveIK(shoulder, handle, scale * 0.28, scale * 0.28, -1)
  const lHand = { x: hips.x - scale * 0.18, y: hips.y - scale * 0.05 }
  const lElbow = solveIK(shoulder, lHand, scale * 0.26, scale * 0.26, 1)
  const backFoot = { x: cx - scale * 0.22, y: groundY }
  const frontFoot = { x: cx + scale * 0.22, y: groundY }
  const backKnee = solveIK(hips, backFoot, scale * 0.3, scale * 0.3, -1)
  const frontKnee = solveIK(hips, frontFoot, scale * 0.3, scale * 0.3, -1)
  const headDir = { x: Math.cos(rAngle), y: Math.sin(rAngle) }
  const racketEnd = { x: handle.x + headDir.x * scale * 0.38, y: handle.y + headDir.y * scale * 0.38 }
  const back = withAlpha(color, 0.4)
  stroke(ctx, [hips, backKnee, backFoot], back, leg)
  stroke(ctx, [shoulder, lElbow, lHand], back, arm)
  stroke(ctx, [shoulder, hips], color, torso)
  fillCircle(ctx, head, headR, color)
  stroke(ctx, [hips, frontKnee, frontFoot], color, leg)
  stroke(ctx, [shoulder, hitElbow, handle], color, arm)
  stroke(ctx, [handle, racketEnd], color, thin)
  if (kind === 'tennis') {
    strokeCircle(ctx, racketEnd, scale * 0.1, color, thin)
  } else {
    ctx.beginPath()
    ctx.roundRect(racketEnd.x - scale * 0.08, racketEnd.y - scale * 0.11, scale * 0.16, scale * 0.22, 6)
    ctx.strokeStyle = color
    ctx.lineWidth = thin
    ctx.stroke()
  }
  if (c > 0.5 && c < 0.72) {
    const bp = phase(c, 0.5, 0.72)
    fillCircle(ctx, { x: lerp(handle.x, cx + scale * 0.7, bp), y: lerp(handle.y, cy - scale * 0.3, bp) }, scale * 0.045, '#facc15')
  }
}

const drawVolleyball: DrawFn = (ctx, w, h, time, color) => {
  const t = time * 3.8
  const cx = w / 2
  const cy = h / 2
  const scale = Math.min(w, h) * 0.4
  const { torso, leg, arm } = widths(scale)
  const cycle = rem(t, TWO_PI) / TWO_PI
  const sm = (v: number) => v * v * (3 - 2 * v)
  let vert = 0
  if (cycle < 0.15) vert = 0
  else if (cycle < 0.3) vert = sm((cycle - 0.15) / 0.15) * scale * 0.1
  else if (cycle < 0.8) vert = scale * 0.1 - Math.sin(((cycle - 0.3) / 0.5) * Math.PI) * scale * 0.45
  else {
    const p = (cycle - 0.8) / 0.2
    vert = lerp(scale * 0.1, 0, sm(p)) * (1 - Math.sin(p * Math.PI))
  }
  const hips = { x: cx, y: cy + scale * 0.22 + vert }
  let torsoA = 0.05
  if (cycle > 0.3 && cycle < 0.6) torsoA = lerp(0.05, -0.22, sm((cycle - 0.3) / 0.3))
  else if (cycle >= 0.6 && cycle < 0.75) torsoA = lerp(-0.22, 0.45, sm((cycle - 0.6) / 0.15))
  else if (cycle >= 0.75) torsoA = lerp(0.45, 0.05, sm((cycle - 0.75) / 0.25))
  const shoulder = { x: hips.x + Math.sin(torsoA) * scale * 0.58, y: hips.y - Math.cos(torsoA) * scale * 0.58 }
  const headR = scale * 0.16
  const head = { x: shoulder.x + Math.sin(torsoA) * headR * 1.4, y: shoulder.y - Math.cos(torsoA) * headR * 1.4 }
  const groundY = cy + scale * 0.78
  const jump = Math.max(0, -vert)
  const lFoot = { x: cx - scale * 0.18, y: groundY - jump * 0.15 }
  const rFoot = { x: cx + scale * 0.18, y: groundY - jump * 0.15 }
  const lKnee = { x: (lFoot.x + hips.x) / 2 - 3, y: (lFoot.y + hips.y) / 2 }
  const rKnee = { x: (rFoot.x + hips.x) / 2 + 3, y: (rFoot.y + hips.y) / 2 }
  const armUp = cycle > 0.45 && cycle < 0.8 ? lerp(0.2, -2.4, sm(phase(cycle, 0.45, 0.68))) : 0.4
  const rHand = { x: shoulder.x + Math.sin(armUp) * scale * 0.5, y: shoulder.y - Math.cos(armUp) * scale * 0.5 }
  const rElbow = { x: (shoulder.x + rHand.x) / 2 + 4, y: (shoulder.y + rHand.y) / 2 }
  const lHand = { x: shoulder.x - scale * 0.15, y: shoulder.y + scale * 0.22 }
  const lElbow = { x: shoulder.x - scale * 0.2, y: shoulder.y + scale * 0.12 }
  const back = withAlpha(color, 0.4)
  stroke(ctx, [hips, lKnee, lFoot], back, leg)
  stroke(ctx, [shoulder, lElbow, lHand], back, arm)
  stroke(ctx, [shoulder, hips], color, torso)
  fillCircle(ctx, head, headR, color)
  stroke(ctx, [hips, rKnee, rFoot], color, leg)
  stroke(ctx, [shoulder, rElbow, rHand], color, arm)
  if (cycle > 0.55 && cycle < 0.85) {
    const bp = phase(cycle, 0.55, 0.85)
    fillCircle(ctx, { x: lerp(rHand.x, cx + scale * 0.35, bp), y: lerp(rHand.y, cy - scale * 0.55, bp) }, scale * 0.09, '#f4f4f5')
  }
}

const drawGolf: DrawFn = (ctx, w, h, time, color) => {
  const t = time * 2.4
  const cx = w / 2
  const cy = h / 2
  const scale = Math.min(w, h) * 0.42
  const { torso, leg, arm, thin } = widths(scale)
  const raw = rem(t, TWO_PI) / TWO_PI
  let swing = 0
  if (raw < 0.18) swing = raw / 0.18
  else {
    const reset = (raw - 0.18) / 0.82
    swing = 1 - (0.5 - Math.cos(reset * Math.PI) * 0.5)
  }
  const hips = { x: cx + (swing - 0.45) * scale * 0.04, y: cy + scale * 0.35 }
  const rot = -1.4 + swing * 2.8
  const shoulder = {
    x: hips.x + Math.sin(rot) * scale * 0.48 * 0.15,
    y: hips.y - Math.cos(rot * 0.12) * scale * 0.48 * 0.98,
  }
  const headR = scale * 0.17
  const head = { x: shoulder.x + Math.sin(rot * 0.3) * headR * 0.3, y: shoulder.y - headR * 1.35 }
  const clubA = -2.2 + swing * 6.9
  const finish = Math.max(0, (swing - 0.6) / 0.4)
  const hand = {
    x: shoulder.x + Math.sin(Math.min(clubA, 2.5)) * scale * 0.4 - finish * scale * 0.15 + swing * scale * 0.18,
    y: shoulder.y + Math.cos(Math.min(clubA, 2.5)) * scale * 0.3 - swing * scale * 0.28,
  }
  const clubEnd = { x: hand.x + Math.sin(clubA) * scale * 0.68, y: hand.y + Math.cos(clubA) * scale * 0.68 }
  const groundY = cy + scale * 0.82
  const lFoot = { x: cx - scale * 0.02, y: groundY }
  const rFoot = { x: cx + scale * 0.28, y: groundY }
  const lKnee = { x: (lFoot.x + hips.x) / 2, y: (lFoot.y + hips.y) / 2 }
  const rKnee = { x: (rFoot.x + hips.x) / 2, y: (rFoot.y + hips.y) / 2 }
  const elbow = { x: (shoulder.x + hand.x) / 2, y: (shoulder.y + hand.y) / 2 - 4 }
  const back = withAlpha(color, 0.4)
  stroke(ctx, [hips, lKnee, lFoot], back, leg)
  stroke(ctx, [shoulder, hips], color, torso)
  fillCircle(ctx, head, headR, color)
  stroke(ctx, [hips, rKnee, rFoot], color, leg)
  stroke(ctx, [shoulder, elbow, hand], color, arm)
  stroke(ctx, [hand, clubEnd], color, thin)
  ctx.beginPath()
  ctx.ellipse(clubEnd.x, clubEnd.y, scale * 0.06, scale * 0.025, clubA, 0, TWO_PI)
  ctx.fillStyle = color
  ctx.fill()
}

const drawBoxing: DrawFn = (ctx, w, h, time, color) => {
  const t = time * 3
  const cx = w / 2
  const cy = h / 2
  const scale = Math.min(w, h) * 0.38
  const { torso, leg, arm } = widths(scale)
  const cycle = rem(t, TWO_PI)
  const p = cycle / TWO_PI
  const punch1 = punchPulse(p, 0.02, 0.1, 0.22)
  const punch2 = punchPulse(p, 0.24, 0.35, 0.46)
  const punch3 = punchPulse(p, 0.48, 0.6, 0.73)
  const breathe = Math.sin(cycle * 2.5) * 1.2
  const sway = Math.sin(cycle * 1.3) * 1.6
  const groundY = cy + scale * 0.65
  const shift = (punch1 * 0.1 + punch2 * 0.15 + punch3 * 0.2) * scale
  const duck = (punch1 * 0.05 + punch2 * 0.08 + punch3 * 0.06) * scale
  const hip = { x: cx - scale * 0.1 + shift + sway, y: groundY - scale * 0.52 + duck + breathe * 0.3 }
  const lean = 0.15 + punch1 * 0.15 + punch2 * 0.25 + punch3 * 0.2
  const shoulder = { x: hip.x + Math.sin(lean) * scale * 0.45, y: hip.y - Math.cos(lean) * scale * 0.45 }
  const headR = scale * 0.171
  const head = { x: shoulder.x + headR * 0.6, y: shoulder.y - headR * 1.2 + breathe * 0.2 }
  const lFoot = { x: cx - scale * 0.35, y: groundY }
  const rFoot = { x: cx + scale * 0.25 + (punch2 * 0.1 + punch3 * 0.05) * scale, y: groundY }
  const kb = scale * 0.15
  const lKnee = { x: (lFoot.x + hip.x) / 2 + kb * 0.8, y: (lFoot.y + hip.y) / 2 + kb * 0.2 }
  const rKnee = { x: (rFoot.x + hip.x) / 2 + kb * 0.8, y: (rFoot.y + hip.y) / 2 + kb * 0.2 }
  const guardX = head.x + scale * 0.05
  const guardY = head.y + scale * 0.15
  const guardEX = shoulder.x - scale * 0.15
  const guardEY = shoulder.y + scale * 0.2
  const lFist = {
    x: guardX + (shoulder.x + scale * 0.7 - guardX) * punch3 - scale * 0.05,
    y: guardY + (shoulder.y + scale * 0.02 - guardY) * punch3,
  }
  const lElbow = { x: guardEX - scale * 0.1 + (lFist.x - guardX) * 0.4, y: guardEY - punch3 * scale * 0.1 }
  const rFistX = guardX + (shoulder.x + scale * 0.65 - guardX) * punch1 + (shoulder.x + scale * 0.7 - guardX) * punch2
  const rFistY = guardY + (shoulder.y + scale * 0.02 - guardY) * punch1 + (shoulder.y + scale * 0.02 - guardY) * punch2
  const rFist = { x: rFistX, y: rFistY }
  const rElbow = { x: guardEX + (rFistX - guardX) * 0.45, y: guardEY - (punch1 + punch2) * scale * 0.15 }
  const fistR = scale * 0.07
  const back = withAlpha(color, 0.35)
  stroke(ctx, [hip, lKnee, lFoot], back, leg)
  stroke(ctx, [shoulder, lElbow, lFist], back, arm)
  stroke(ctx, [shoulder, hip], color, torso)
  fillCircle(ctx, head, headR, color)
  stroke(ctx, [hip, rKnee, rFoot], color, leg)
  stroke(ctx, [shoulder, rElbow, rFist], color, arm)
  fillCircle(ctx, rFist, fistR, color)
}

const drawMartial: DrawFn = (ctx, w, h, time, color) => {
  const t = time * 3
  const cx = w / 2
  const cy = h / 2
  const scale = Math.min(w, h) * 0.38
  const { torso, leg, arm } = widths(scale)
  const cycle = rem(t, TWO_PI)
  const p = cycle / TWO_PI
  const punch1 = punchPulse(p, 0.02, 0.12, 0.24)
  const punch2 = punchPulse(p, 0.26, 0.36, 0.48)
  const kick = punchPulse(p, 0.52, 0.68, 0.88)
  const breathe = Math.sin(cycle * 2.5) * 1.2
  const sway = Math.sin(cycle * 1.3) * 1.6
  const groundY = cy + scale * 0.65
  const shift = (punch1 * 0.1 + punch2 * 0.15) * scale - kick * scale * 0.12
  const duck = (punch1 * 0.05 + punch2 * 0.08) * scale + kick * scale * 0.02
  const hip = { x: cx - scale * 0.1 + shift + sway, y: groundY - scale * 0.52 + duck + breathe * 0.3 }
  const lean = 0.15 + punch1 * 0.15 + punch2 * 0.25 - kick * 0.45
  const shoulder = { x: hip.x + Math.sin(lean) * scale * 0.45, y: hip.y - Math.cos(lean) * scale * 0.45 }
  const headR = scale * 0.17
  const head = { x: shoulder.x + headR * 0.5, y: shoulder.y - headR * 1.2 }
  const lFoot = { x: cx - scale * 0.32, y: groundY }
  const rFootPlant = { x: cx + scale * 0.22, y: groundY }
  const kickFoot = {
    x: hip.x + Math.cos(-0.2 + kick * 0.9) * scale * 0.85,
    y: hip.y - Math.sin(kick * 1.1) * scale * 0.7,
  }
  const rFoot = kick > 0.05 ? kickFoot : rFootPlant
  const lKnee = { x: (lFoot.x + hip.x) / 2 + scale * 0.08, y: (lFoot.y + hip.y) / 2 }
  const rKnee = { x: (rFoot.x + hip.x) / 2, y: (rFoot.y + hip.y) / 2 - kick * scale * 0.12 }
  const guard = { x: head.x + scale * 0.08, y: head.y + scale * 0.12 }
  const rFist = {
    x: lerp(guard.x, shoulder.x + scale * 0.65, Math.max(punch1, punch2)),
    y: lerp(guard.y, shoulder.y, Math.max(punch1, punch2)),
  }
  const rElbow = { x: (shoulder.x + rFist.x) / 2 - 4, y: (shoulder.y + rFist.y) / 2 + 6 }
  const lFist = { x: lerp(guard.x - 8, shoulder.x + scale * 0.6, punch2 * 0.4), y: guard.y + 4 }
  const lElbow = { x: shoulder.x - scale * 0.16, y: shoulder.y + scale * 0.18 }
  const back = withAlpha(color, 0.35)
  stroke(ctx, [hip, lKnee, lFoot], back, leg)
  stroke(ctx, [shoulder, lElbow, lFist], back, arm)
  stroke(ctx, [shoulder, hip], color, torso)
  fillCircle(ctx, head, headR, color)
  stroke(ctx, [hip, rKnee, rFoot], color, leg)
  stroke(ctx, [shoulder, rElbow, rFist], color, arm)
}

const drawFootball: DrawFn = (ctx, w, h, time, color) => {
  const c = rem(time * 0.42, 1)
  const cx = w / 2
  const cy = h / 2
  const scale = Math.min(w, h) * 0.42
  const { torso, leg, arm } = widths(scale)
  const load = smooth(phase(c, 0.2, 0.38))
  const throwP = smooth(phase(c, 0.38, 0.42))
  const follow = smooth(phase(c, 0.42, 0.6))
  const rec = smooth(phase(c, 0.6, 1))
  const key = (a: number, b: number, d: number, e: number) => {
    if (c < 0.2) return a
    if (c < 0.38) return lerp(a, b, load)
    if (c < 0.42) return lerp(b, d, throwP)
    if (c < 0.6) return lerp(d, e, follow)
    return lerp(e, a, rec)
  }
  const groundY = cy + scale * 0.7
  const hips = { x: cx + key(0, -scale * 0.08, scale * 0.12, scale * 0.06), y: groundY - scale * 0.5 }
  const lean = key(0.1, -0.15, 0.35, 0.2)
  const shoulder = { x: hips.x + Math.sin(lean) * scale * 0.48, y: hips.y - Math.cos(lean) * scale * 0.48 }
  const headR = scale * 0.15
  const head = { x: shoulder.x + Math.sin(lean) * headR * 1.3, y: shoulder.y - Math.cos(lean) * headR * 1.3 }
  const ballHand = {
    x: shoulder.x + key(scale * 0.15, -scale * 0.28, scale * 0.55, scale * 0.4),
    y: shoulder.y + key(-scale * 0.05, -scale * 0.28, scale * 0.05, scale * 0.15),
  }
  const rElbow = solveIK(shoulder, ballHand, scale * 0.26, scale * 0.26, -1)
  const lHand = { x: hips.x + scale * 0.12, y: hips.y - scale * 0.05 }
  const lElbow = { x: shoulder.x + scale * 0.15, y: shoulder.y + scale * 0.18 }
  const lFoot = { x: cx - scale * 0.2, y: groundY }
  const rFoot = { x: cx + scale * 0.22, y: groundY }
  const lKnee = solveIK(hips, lFoot, scale * 0.3, scale * 0.3, -1)
  const rKnee = solveIK(hips, rFoot, scale * 0.3, scale * 0.3, -1)
  const back = withAlpha(color, 0.4)
  stroke(ctx, [hips, lKnee, lFoot], back, leg)
  stroke(ctx, [shoulder, lElbow, lHand], back, arm)
  stroke(ctx, [shoulder, hips], color, torso)
  fillCircle(ctx, head, headR, color)
  stroke(ctx, [hips, rKnee, rFoot], color, leg)
  stroke(ctx, [shoulder, rElbow, ballHand], color, arm)
  ctx.save()
  ctx.translate(ballHand.x, ballHand.y)
  ctx.rotate(key(-0.4, -1.1, 0.3, 0.6))
  ctx.beginPath()
  ctx.ellipse(0, 0, scale * 0.09, scale * 0.045, 0, 0, TWO_PI)
  ctx.fillStyle = '#b45309'
  ctx.fill()
  ctx.restore()
  if (c > 0.42 && c < 0.7) {
    const bp = phase(c, 0.42, 0.7)
    ctx.beginPath()
    ctx.ellipse(lerp(ballHand.x, cx + scale * 0.85, bp), lerp(ballHand.y, cy - scale * 0.45, bp), scale * 0.09, scale * 0.045, 0.4, 0, TWO_PI)
    ctx.fillStyle = '#b45309'
    ctx.fill()
  }
}

const drawHockey: DrawFn = (ctx, w, h, time, color) => {
  const t = time * 4.2
  const cx = w / 2
  const cy = h / 2
  const scale = Math.min(w, h) * 0.42
  const { torso, leg, arm, thin } = widths(scale)
  const cycle = rem(t, TWO_PI)
  const bounce = Math.sin(cycle * 2) * scale * 0.015
  const shift = Math.sin(cycle) * scale * 0.12
  const hips = { x: cx + shift, y: cy + scale * 0.22 + bounce }
  const lean = 0.65
  const shoulder = { x: hips.x + Math.sin(lean) * scale * 0.58, y: hips.y - Math.cos(lean) * scale * 0.58 }
  const headR = scale * 0.16
  const head = { x: shoulder.x + Math.sin(lean) * headR * 1.3, y: shoulder.y - Math.cos(lean) * headR * 1.3 }
  const stickSway = Math.sin(cycle) * scale * 0.03
  const stickStart = { x: shoulder.x - scale * 0.24 + stickSway, y: shoulder.y + scale * 0.16 }
  const stickEnd = { x: stickStart.x + scale * 0.78, y: hips.y + scale * 0.55 }
  const handBack = { x: stickStart.x + (stickEnd.x - stickStart.x) * 0.16, y: stickStart.y + (stickEnd.y - stickStart.y) * 0.16 }
  const handFront = { x: stickStart.x + (stickEnd.x - stickStart.x) * 0.54, y: stickStart.y + (stickEnd.y - stickStart.y) * 0.54 }
  const elbowBack = { x: shoulder.x - scale * 0.22 + shift * 0.4, y: shoulder.y - scale * 0.14 + bounce }
  const elbowFront = { x: shoulder.x + scale * 0.22, y: shoulder.y + scale * 0.28 }
  const back = withAlpha(color, 0.4)
  const gait = (phaseOff: number, front: boolean) => {
    const p = cycle + phaseOff
    const upper = Math.sin(p) * 0.55
    const fold = Math.max(Math.cos(p) * 1.1, 0.2)
    const knee = { x: hips.x + Math.sin(upper) * scale * 0.32, y: hips.y + Math.cos(upper) * scale * 0.32 }
    const foot = { x: knee.x + Math.sin(upper - fold) * scale * 0.32, y: knee.y + Math.cos(upper - fold) * scale * 0.32 }
    stroke(ctx, [hips, knee, foot], front ? color : back, leg)
  }
  gait(0, false)
  stroke(ctx, [shoulder, elbowBack, handBack], back, arm)
  stroke(ctx, [shoulder, hips], color, torso)
  fillCircle(ctx, head, headR, color)
  gait(Math.PI, true)
  stroke(ctx, [shoulder, elbowFront, handFront], color, arm)
  stroke(ctx, [stickStart, stickEnd], color, thin + 0.5)
  stroke(ctx, [stickEnd, { x: stickEnd.x + scale * 0.16, y: stickEnd.y + 2 }], color, thin + 1.2)
}

const drawSurfing: DrawFn = (ctx, w, h, time, color) => {
  const t = time * 0.82
  const cx = w / 2
  const cy = h / 2
  const scale = Math.min(w, h) * 0.47
  const { torso, leg, arm, thin } = widths(scale)
  const phaseA = t * TWO_PI
  const diag = Math.sin(phaseA * 0.84)
  const rebound = Math.sin(phaseA * 1.68 + 0.5) * scale * 0.01
  const boardC = { x: cx + diag * scale * 0.065, y: cy + scale * 0.35 - diag * scale * 0.075 + rebound }
  const boardA = Math.sin(phaseA * 0.84 + 0.35) * 0.14 + Math.sin(phaseA * 1.68 - 0.4) * 0.022
  const world = (lx: number, ly: number): Pt => ({
    x: boardC.x + lx * Math.cos(boardA) - ly * Math.sin(boardA),
    y: boardC.y + lx * Math.sin(boardA) + ly * Math.cos(boardA),
  })
  const half = scale * 0.4
  ctx.beginPath()
  const nose = world(half * 0.98, -scale * 0.035)
  const tail = world(-half * 0.98, -scale * 0.035)
  const ctrl = world(0, scale * 0.11)
  ctx.moveTo(tail.x, tail.y)
  ctx.quadraticCurveTo(ctrl.x, ctrl.y, nose.x, nose.y)
  ctx.strokeStyle = color
  ctx.lineWidth = Math.max(3, scale * 0.045)
  ctx.lineCap = 'round'
  ctx.stroke()

  const waveY = cy + scale * 0.78 + diag * scale * 0.014
  ctx.beginPath()
  for (let x = cx - scale; x <= cx + scale; x += 6) {
    const y = waveY + Math.sin(x * 0.08 + t * 4) * scale * 0.03
    if (x === cx - scale) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = Math.max(2, scale * 0.04)
  ctx.stroke()

  const hip = world(scale * 0.04, -scale * 0.16)
  const shoulder = world(scale * 0.02 + diag * 0.04, -scale * 0.52)
  const headR = scale * 0.13
  const head = world(scale * 0.02, -scale * 0.68)
  const fFoot = world(scale * 0.16, -scale * 0.02)
  const bFoot = world(-scale * 0.14, -scale * 0.02)
  const fKnee = world(scale * 0.12, -scale * 0.12)
  const bKnee = world(-scale * 0.08, -scale * 0.12)
  const fHand = world(scale * 0.32, -scale * 0.42)
  const bHand = world(-scale * 0.28, -scale * 0.48)
  const fElbow = world(scale * 0.2, -scale * 0.48)
  const bElbow = world(-scale * 0.14, -scale * 0.5)
  const back = withAlpha(color, 0.4)
  stroke(ctx, [hip, bKnee, bFoot], back, leg)
  stroke(ctx, [shoulder, bElbow, bHand], back, arm)
  stroke(ctx, [shoulder, hip], color, torso)
  fillCircle(ctx, head, headR, color)
  stroke(ctx, [hip, fKnee, fFoot], color, leg)
  stroke(ctx, [shoulder, fElbow, fHand], color, arm)
  void thin
}

const drawHiking: DrawFn = (ctx, w, h, time, color) => {
  const t = time * 3
  const cx = w / 2
  const cy = h / 2
  const scale = Math.min(w, h) * 0.4
  const { torso, leg, arm, thin } = widths(scale)
  const cycle = rem(t, TWO_PI)
  const bounce = Math.abs(Math.sin(cycle * 2)) * 2
  const hips = { x: cx, y: cy + bounce }
  const lean = -0.1
  const shoulder = { x: hips.x + Math.sin(lean) * scale * 0.55, y: hips.y - Math.cos(lean) * scale * 0.55 }
  const headR = scale * 0.16
  const head = { x: shoulder.x + Math.sin(lean) * headR * 1.5, y: shoulder.y - Math.cos(lean) * headR * 1.5 }
  const bpW = scale * 0.25
  const bpH = scale * 0.35
  const bpX = shoulder.x - bpW * 0.8 + Math.sin(lean) * bpH * 0.3
  const bpY = shoulder.y - bpH * 0.1
  ctx.beginPath()
  ctx.roundRect(bpX, bpY, bpW, bpH, 4)
  ctx.fillStyle = withAlpha(color, 0.3)
  ctx.fill()
  ctx.strokeStyle = withAlpha(color, 0.5)
  ctx.lineWidth = thin
  ctx.stroke()
  const limbScale = scale * 0.52
  const back = withAlpha(color, 0.4)
  const limb = (start: Pt, phaseOff: number, isArm: boolean, isFront: boolean) => {
    const p = cycle + phaseOff
    const c = isFront ? color : back
    const upper = Math.sin(p) * (isArm ? 0.55 : 0.7)
    if (isArm) {
      const elbowA = upper + 0.6
      const elbow = { x: start.x + Math.sin(upper) * limbScale * 0.55, y: start.y + Math.cos(upper) * limbScale * 0.55 }
      const hand = { x: elbow.x + Math.sin(elbowA) * limbScale * 0.45, y: elbow.y + Math.cos(elbowA) * limbScale * 0.45 }
      stroke(ctx, [start, elbow, hand], c, arm)
      if (isFront) {
        const pole = { x: hand.x + Math.sin(lean) * scale * 0.35, y: hand.y + scale * 0.42 }
        stroke(ctx, [hand, pole], color, thin)
      }
    } else {
      const fold = Math.max(Math.cos(p) * 1.2, 0.15)
      const knee = { x: start.x + Math.sin(upper) * limbScale * 0.5, y: start.y + Math.cos(upper) * limbScale * 0.5 }
      const foot = { x: knee.x + Math.sin(upper - fold) * limbScale * 0.5, y: knee.y + Math.cos(upper - fold) * limbScale * 0.5 }
      stroke(ctx, [start, knee, foot], c, leg)
    }
  }
  limb(shoulder, Math.PI, true, false)
  limb(hips, 0, false, false)
  fillCircle(ctx, head, headR, color)
  stroke(ctx, [shoulder, hips], color, torso)
  limb(hips, Math.PI, false, true)
  limb(shoulder, 0, true, true)
}

const drawSkate: DrawFn = (ctx, w, h, time, color) => {
  const t = time * 1
  const cx = w / 2
  const cy = h / 2
  const scale = Math.min(w, h) * 0.46
  const { torso, leg, arm, thin } = widths(scale)
  const jumpCycle = 3
  const jumpWindow = 0.3
  const jp = rem(t / jumpCycle, 1)
  let pulse = 0
  let pre = 0
  if (jp < jumpWindow) {
    const p = jp / jumpWindow
    pulse = Math.sin(p * Math.PI)
    if (p < 0.18) pre = Math.sin((p / 0.18) * Math.PI)
  }
  const groundY = cy + scale * 0.83
  const lift = pulse * scale * 0.118 - pre * scale * 0.018
  const deckY = groundY - scale * 0.08 - lift
  const deckHalf = scale * 0.42
  stroke(ctx, [{ x: cx - deckHalf, y: deckY }, { x: cx + deckHalf, y: deckY }], color, Math.max(3, scale * 0.055))
  fillCircle(ctx, { x: cx - deckHalf * 0.62, y: deckY + scale * 0.055 }, scale * 0.05, color)
  fillCircle(ctx, { x: cx + deckHalf * 0.62, y: deckY + scale * 0.055 }, scale * 0.05, color)
  const squat = pre * scale * 0.04
  const hip = { x: cx, y: deckY - scale * 0.28 + squat - pulse * scale * 0.04 }
  const shoulder = { x: hip.x, y: hip.y - scale * 0.42 }
  const headR = scale * 0.14
  const head = { x: shoulder.x, y: shoulder.y - headR * 1.3 }
  const lFoot = { x: cx - scale * 0.16, y: deckY - 2 }
  const rFoot = { x: cx + scale * 0.18, y: deckY - 2 }
  const lKnee = { x: (lFoot.x + hip.x) / 2 - 3, y: (lFoot.y + hip.y) / 2 }
  const rKnee = { x: (rFoot.x + hip.x) / 2 + 3, y: (rFoot.y + hip.y) / 2 }
  const armOut = 0.4 + pulse * 0.5
  const lHand = { x: shoulder.x - Math.sin(armOut) * scale * 0.4, y: shoulder.y + Math.cos(armOut) * scale * 0.15 }
  const rHand = { x: shoulder.x + Math.sin(armOut) * scale * 0.4, y: shoulder.y + Math.cos(armOut) * scale * 0.15 }
  const lElbow = { x: (shoulder.x + lHand.x) / 2, y: (shoulder.y + lHand.y) / 2 + 4 }
  const rElbow = { x: (shoulder.x + rHand.x) / 2, y: (shoulder.y + rHand.y) / 2 + 4 }
  const back = withAlpha(color, 0.4)
  stroke(ctx, [hip, lKnee, lFoot], back, leg)
  stroke(ctx, [shoulder, lElbow, lHand], back, arm)
  stroke(ctx, [shoulder, hip], color, torso)
  fillCircle(ctx, head, headR, color)
  stroke(ctx, [hip, rKnee, rFoot], color, leg)
  stroke(ctx, [shoulder, rElbow, rHand], color, arm)
  void thin
}

const DRAWS: Record<string, DrawFn> = {
  'Strength Training.': drawStrength,
  'Calisthenics.': drawCalisthenics,
  'Running.': drawRunning,
  'Cycling.': drawCycling,
  'Swimming.': drawSwimming,
  'Cardio.': drawCardio,
  'HIIT.': drawHIIT,
  'Yoga.': drawYoga,
  'Pilates.': drawPilates,
  'Core.': drawCore,
  'Soccer.': drawSoccer,
  'Basketball.': drawBasketball,
  'Baseball.': drawBaseball,
  'Tennis.': drawTennis,
  'Volleyball.': drawVolleyball,
  'Golf.': drawGolf,
  'Boxing.': drawBoxing,
  'Martial Arts.': drawMartial,
  'American Football.': drawFootball,
  'Hockey.': drawHockey,
  'Surfing.': drawSurfing,
  'Padel.': drawPadel,
  'Hiking.': drawHiking,
  'Skate.': drawSkate,
}

export function drawActivity(
  activity: string,
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  color: string
) {
  ctx.clearRect(0, 0, w, h)
  const fn = DRAWS[activity] ?? drawRunning
  fn(ctx, w, h, time, color)
}
