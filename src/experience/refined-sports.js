// Dedicated choreography for the sports that need more than a generic gait.
const TAU = Math.PI * 2;
const P = (x, y, z = 0) => [x, y, z];
const add = (p, x, y, z = 0) => [p[0] + x, p[1] + y, p[2] + z];
const mix = (a, b, u) => a.map((v, i) => v + (b[i] - v) * u);
const ease = u => { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); };
function key(u, stops) {
  for (let i = 1; i < stops.length; i++) if (u <= stops[i][0]) {
    const [a, av] = stops[i - 1], [b, bv] = stops[i];
    return av + (bv - av) * ease((u - a) / (b - a));
  }
  return stops.at(-1)[1];
}
function target(u, stops) {
  return [0, 1, 2].map(i => key(u, stops.map(([time, value]) => [time, value[i]])));
}
const direction = (start, vector, length) => {
  const norm = Math.hypot(...vector);
  return start.map((v, i) => v + vector[i] * length / norm);
};
const downAngle = (start, angle, length) => direction(start, [Math.sin(angle), -Math.cos(angle), 0], length);
function torso(p, hip, lean = .06, bend = 0) {
  p.H = hip;
  p.S = add(hip, Math.sin(lean) * .86, Math.cos(lean) * Math.cos(bend) * .86, Math.sin(bend) * .86);
  p.N = add(p.S, Math.sin(lean) * .36, Math.cos(lean) * Math.cos(bend) * .36, Math.sin(bend) * .36);
}
export function attachment(center, z, yaw = 0, roll = 0) {
  return add(center, Math.sin(yaw) * Math.cos(roll) * z, -Math.sin(roll) * z, Math.cos(yaw) * Math.cos(roll) * z);
}
function guard(p) {
  p.LW = add(p.S, .35, .17, -.19); p.RW = add(p.S, .31, .14, .19);
  p.angles.armPoleL = [.35, -1, -.16]; p.angles.armPoleR = [.35, -1, .16];
}
function rotateBoard(p, height, pitch, roll) {
  p.props.boardPosition = P(0, height); p.props.boardTilt = pitch; p.props.boardRoll = roll;
  for (const name of ['H', 'S', 'N', 'LF', 'RF', 'LW', 'RW']) {
    const [x, y, z] = p[name], ry = y * Math.cos(roll) - z * Math.sin(roll);
    p[name] = [x * Math.cos(pitch) - ry * Math.sin(pitch), height + x * Math.sin(pitch) + ry * Math.cos(pitch), y * Math.sin(roll) + z * Math.cos(roll)];
  }
}
function cyclicPath(phase, points) {
  const value = phase * points.length, index = Math.floor(value), u = value - index;
  const at = offset => points[(index + offset + points.length) % points.length];
  const [a, b, c, d] = [-1, 0, 1, 2].map(at);
  return b.map((v, i) => .5 * (2 * v + (-a[i] + c[i]) * u + (2 * a[i] - 5 * v + 4 * c[i] - d[i]) * u * u + (-a[i] + 3 * v - 3 * c[i] + d[i]) * u * u * u));
}

function running(p, phase, t) {
  torso(p, P(0, 1.105 + .025 * Math.cos(t * 2)), .13);
  p.angles.shoulderYaw = Math.sin(t) * .065;
  for (const [i, side] of ['L', 'R'].entries()) {
    const sign = i ? 1 : -1, q = (phase + i * .5) % 1, stance = .4;
    let foot;
    if (q < stance) foot = P(.42 - .84 * q / stance, .1 + .012 * Math.sin(q / stance * Math.PI), sign * .15);
    else {
      const u = (q - stance) / (1 - stance), v = 1 - u;
      foot = P(v ** 3 * -.42 + 3 * v * v * u * -.66 + 3 * v * u * u * .35 + u ** 3 * .42,
        v ** 3 * .1 + 3 * v * v * u * .81 + 3 * v * u * u * .66 + u ** 3 * .1, sign * .15);
    }
    p[side + 'F'] = foot;
    const arm = -.55 * Math.cos(q * TAU);
    p[side + 'E'] = downAngle(attachment(p.S, sign * .19, p.angles.shoulderYaw), arm, .48);
    p[side + 'W'] = downAngle(p[side + 'E'], arm + 1.58, .46);
    p[side + 'FootPitch'] = q < stance ? -.16 * Math.sin(q / stance * Math.PI) : -.35 * Math.sin((q - stance) / (1 - stance) * Math.PI);
  }
}

export function refinedSport(p, id, t, phase, sampleRelease, api) {
  const s = Math.sin(t), c = Math.cos(t);
  switch (id) {
    case 'running': running(p, phase, t); break;
    case 'boxing': {
      const jab = key(phase, [[0,0],[.09,0],[.16,1],[.29,0],[1,0]]);
      const cross = key(phase, [[0,0],[.36,0],[.44,1],[.61,0],[1,0]]);
      const slip = key(phase, [[0,0],[.69,0],[.8,1],[.93,0],[1,0]]);
      torso(p, P(.055 * cross, 1.075 - .035 * slip), .08 + .06 * cross);
      p.LF = P(.29, .1, -.21); p.RF = P(-.31, .1, .21);
      p.angles.shoulderYaw = -.24 * jab + .33 * cross;
      p.angles.hipYaw = .12 * cross;
      guard(p);
      p.LW = add(p.S, .35 + .54 * jab, .17 - .1 * jab, -.19 + .04 * jab);
      p.RW = add(p.S, .31 + .57 * cross, .14 - .08 * cross, .19 - .14 * cross);
      p.RFootPitch = .15 * cross; p.RFootYaw = .16 * cross;
      p.props.bagSwing = key(phase, [[0,0],[.13,0],[.19,.1],[.35,0],[.4,0],[.48,.2],[.67,0],[1,0]]);
      break;
    }
    case 'martialArts': {
      const jab = key(phase, [[0,0],[.06,0],[.12,1],[.2,0],[1,0]]);
      const cross = key(phase, [[0,0],[.23,0],[.3,1],[.4,0],[1,0]]);
      const chamber = key(phase, [[0,0],[.43,0],[.53,1],[.73,1],[.88,0],[1,0]]);
      const extend = key(phase, [[0,0],[.54,0],[.64,1],[.69,1],[.78,0],[1,0]]);
      torso(p, P(.045 * chamber, 1.07), .08 - .19 * chamber);
      p.LF = P(.22, .1, -.19);
      const hip = attachment(p.H, .075);
      // Chamber the knee first, extend the lower leg, fold it, then plant again.
      const thigh = key(phase, [[0,-.3],[.43,-.3],[.53,2.0],[.64,1.7],[.69,1.7],[.78,2.0],[.9,-.3],[1,-.3]]);
      const shin = key(phase, [[0,-.3],[.43,-.3],[.53,.25],[.64,1.7],[.69,1.7],[.78,.25],[.9,-.3],[1,-.3]]);
      const kickKnee = downAngle(hip, thigh, .57), kickFoot = downAngle(kickKnee, shin, .55);
      const plant = P(-.26, .1, .2);
      p.RF = mix(plant, kickFoot, chamber);
      p.angles.legPoleR = mix([1, 0, .03], [Math.sin(thigh), -Math.cos(thigh), .03], chamber);
      guard(p);
      p.LW = add(p.S, .35 + .52 * jab, .17 - .08 * jab, -.19);
      p.RW = add(p.S, .31 + .56 * cross, .14 - .07 * cross, .19 - .12 * cross);
      p.angles.shoulderYaw = -.2 * jab + .28 * cross;
      p.RFootPitch = -.25 * chamber + 1.2 * extend;
      break;
    }
    case 'soccer': {
      const power = key(phase, [[0,0],[.18,0],[.42,1],[.55,.7],[.77,0],[1,0]]);
      torso(p, P(.1 * power, 1.1 - .04 * power), .08 + .07 * power);
      p.LF = P(.15, .1, -.22);
      p.RF = target(phase, [[0,P(-.22,.1,.18)],[.15,P(-.22,.1,.18)],[.29,P(-.48,.3,.18)],
        [.42,P(.72,.17,.18)],[.53,P(.85,.45,.18)],[.73,P(-.22,.1,.18)],[1,P(-.22,.1,.18)]]);
      p.LW = add(p.S, .18 - .16 * power, -.5, -.35);
      p.RW = add(p.S, -.05 - .2 * power, -.51, .35);
      p.angles.armPoleL = [0,-1,-.3]; p.angles.armPoleR = [0,-1,.3];
      p.RFootYaw = -.28 * power; p.RFootPitch = -.2 * power;
      const travel = Math.max(0, (phase - .42) / .5);
      p.props.ball = P(1.19 + 2.15 * travel, .24, .18);
      p.props.ballScale = ease(phase / .06) * (1 - ease((phase - .89) / .1));
      p.props.ballSpin = -2.15 * travel / .24;
      break;
    }
    case 'cycling': case 'indoorCycling':
      torso(p, P(-.45, 1.39 + .008 * Math.cos(t * 2)), id === 'cycling' ? .65 : .6);
      for (const [i, side] of ['L', 'R'].entries()) {
        const q = t + i * Math.PI;
        // Viewed from +Z, forward rolling is clockwise: the top pedal goes +X.
        p[side + 'F'] = P(Math.cos(q) * .29, .71 - Math.sin(q) * .29, i ? .22 : -.22);
        p[side + 'W'] = P(.75, 1.53, i ? .22 : -.22);
        p[side + 'FootPitch'] = .1 * Math.cos(q);
      }
      p.props.wheelSpin = -t;
      break;
    case 'pilates': {
      p.H = P(.08,.24); p.S = add(p.H,-.86*Math.cos(.36),.86*Math.sin(.36));
      p.N = add(p.S,-.36*Math.cos(.36),.36*Math.sin(.36));
      const left = ease((1+c)/2);
      for (const [i, side] of ['L','R'].entries()) {
        const sign = i ? 1 : -1, bend = i ? 1-left : left;
        const thigh = 1.8 + 2.18 * bend, shin = 1.8 - .72 * bend;
        const hip = attachment(p.H,sign*.075);
        p[side+'K'] = direction(hip,[Math.sin(thigh),-Math.cos(thigh),sign*.08],.57);
        p[side+'F'] = direction(p[side+'K'],[Math.sin(shin),-Math.cos(shin),sign*.08],.55);
        p[side+'FootPitch'] = -.3;
      }
      const held = mix(p.LK,p.RK,1-left);
      p.LW = add(held,-.08,.02,-.11); p.RW = add(held,.13,-.15,.11);
      p.angles.armPoleL = [0,-1,-.4]; p.angles.armPoleR = [0,-1,.4];
      break;
    }
    case 'surfing': {
      const roll = .045*Math.sin(t), pitch = .035*Math.sin(t+.4);
      torso(p,P(.025*s,1.06+.025*Math.cos(t*2)),.12,-roll*.8);
      p.LF=P(-.5,.23,-.13);p.RF=P(.5,.23,.13);
      p.LW=add(p.S,-.88,.02+.07*s,-.19);p.RW=add(p.S,.88,.02-.07*s,.19);
      p.angles.armPoleL=[0,-1,-.2];p.angles.armPoleR=[0,-1,.2];
      rotateBoard(p,.02*Math.sin(t),pitch,roll);
      break;
    }
    case 'swimming': {
      torso(p,P(-.35,.78),1.5);
      p.N=add(p.S,.35,.06+.025*Math.sin(t));
      p.angles.bodyRoll=.09*Math.sin(t);
      const stroke=[[1.16,.82],[1.15,.35],[.45,.12],[-.28,.63],[.1,1.13],[.72,1.02]];
      for(const [i,side] of ['L','R'].entries()){
        const q=(phase+i*.5)%1,sign=i?1:-1,hand=cyclicPath(q,stroke);
        const recovery=ease((q-.5)/.17)*(1-ease((q-.85)/.15));
        p[side+'W']=P(hand[0],hand[1],sign*(.24+.11*recovery));
        p.angles['armPole'+side]=[-.12,-1+2.3*recovery,sign*.55];
        p[side+'F']=add(p.H,-1.08,.02+.085*Math.sin(t*2+i*Math.PI),sign*.15);
        p.angles['legPole'+side]=[0,-1,sign*.05];
        p[side+'FootPitch']=.08*Math.sin(t*2+i*Math.PI);
      }
      p.props.headRotation=[.03,0,.04*Math.sin(t)];
      break;
    }
    case 'americanFootball': {
      const weight=key(phase,[[0,0],[.3,0],[.46,1],[.66,.8],[.9,0],[1,0]]);
      torso(p,P(.075*weight,1.09),-.045+.13*weight);
      p.LF=P(.31,.1,-.23);p.RF=P(-.31,.1,.23);
      p.angles.shoulderYaw=key(phase,[[0,0],[.29,.32],[.46,-.28],[.62,-.4],[1,0]]);
      p.angles.hipYaw=p.angles.shoulderYaw*.45;
      p.RW=target(phase,[[0,add(p.S,.3,.08,.23)],[.14,add(p.S,.3,.08,.23)],
        [.31,add(p.S,-.26,.37,.3)],[.4,add(p.S,.22,.43,.28)],
        [.46,add(p.S,.85,.19,.16)],[.61,add(p.S,.59,-.32,-.08)],[.9,add(p.S,.3,.08,.23)],[1,add(p.S,.3,.08,.23)]]);
      p.LW=add(p.S,.35+.16*weight,-.08-.14*weight,-.28);
      p.angles.armPoleR=[.1,.15,1];p.angles.armPoleL=[.1,-1,-.3];
      p.RFootPitch=.16*weight;
      if(sampleRelease)break;
      if(phase<.46){p.props.ballHandOffset=[.12,.015,0];p.props.ballScale=ease(phase/.05);}
      else{
        const start=api.releasePosition(id,.46,[.12,.015,0]);
        p.props.ball=add(start,(phase-.46)/.5*3.1,0,0);
        p.props.ballScale=1-ease((phase-.89)/.1);
      }
      // Spiral about the long X axis, never a tumbling end-over-end rotation.
      p.props.ballRotation=[(phase-.46)*TAU*5,0,0];
      break;
    }
    default:return false;
  }
  return true;
}
