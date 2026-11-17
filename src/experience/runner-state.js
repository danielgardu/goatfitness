// Simulation uses seconds and metres, independently of rendering or animation speed.
export const LANE_WIDTH = 2.35;
export const JUMP_SPEED = 11.2;
export const GRAVITY = 22;
const STEER_RESPONSE = 9;

export class RunnerState {
  constructor() { this.phase = 'idle'; }

  start(speed = 5.4) {
    Object.assign(this, { phase: 'countdown', elapsed: 0, distance: 0, speed,
      lane: 0, lateral: 0, lateralVelocity: 0, lean: 0, steerYaw: 0,
      height: 0, velocity: 0, cleared: 0, paused: false, jumpBuffer: 0 });
  }

  move(direction) {
    if (this.paused || !['countdown', 'running'].includes(this.phase)) return false;
    this.lane = Math.max(-1, Math.min(1, this.lane + direction));
    return true;
  }

  jump() {
    if (this.phase !== 'running' || this.paused) return false;
    if (this.height > .01) { this.jumpBuffer = .12; return false; }
    this.velocity = JUMP_SPEED;
    return true;
  }

  update(dt, speed = this.speed) {
    if (this.paused || this.phase === 'idle') return 0;
    this.elapsed += dt;
    if (this.phase === 'countdown' && this.elapsed >= 3.2) {
      this.phase = 'running'; this.elapsed = 0;
    }
    if (!['countdown', 'running', 'returning'].includes(this.phase)) return 0;
    this.speed = speed;
    // Exact critically damped spring: accelerate into a sidestep, then ease out.
    // Preserve momentum when the player reverses direction midway through it.
    const target = this.lane * LANE_WIDTH, offset = this.lateral - target;
    const decay = Math.exp(-STEER_RESPONSE * dt);
    const momentum = (this.lateralVelocity + STEER_RESPONSE * offset) * dt;
    this.lateral = target + (offset + momentum) * decay;
    this.lateralVelocity = (this.lateralVelocity - STEER_RESPONSE * momentum) * decay;
    const bodyBlend = 1 - Math.exp(-dt * 10);
    this.lean += (Math.max(-.19, Math.min(.19, this.lateralVelocity * .027)) - this.lean) * bodyBlend;
    const yaw = Math.max(-.28, Math.min(.28, -Math.atan2(this.lateralVelocity, Math.max(.1, speed)) * .55));
    this.steerYaw += (yaw - this.steerYaw) * bodyBlend;
    const advance = dt * this.speed;
    if (this.phase !== 'returning') this.distance += advance;
    // Keep the jump's clearance in metres consistent at every scene speed.
    const jumpDt = dt * this.speed / 9.6;
    this.jumpBuffer = Math.max(0, this.jumpBuffer - dt);
    if (this.velocity !== 0 || this.height > 0) {
      this.height = Math.max(0, this.height + this.velocity * jumpDt - .5 * GRAVITY * jumpDt * jumpDt);
      this.velocity -= GRAVITY * jumpDt;
      if (this.height === 0) {
        this.velocity = this.jumpBuffer > 0 ? JUMP_SPEED : 0;
        this.jumpBuffer = 0;
      }
    }
    return advance;
  }

  hits(obstacle) {
    // Goat's length and width are included, with a forgiving margin at the hooves.
    return Math.abs(obstacle.at - this.distance) < 2.15 + obstacle.depth / 2
      && Math.abs(obstacle.lateral - this.lateral) < .56 + obstacle.width / 2
      && this.height < obstacle.height - .08;
  }

  crash() {
    if (this.phase !== 'running') return;
    this.phase = 'crashed'; this.elapsed = 0; this.paused = false;
  }
}
