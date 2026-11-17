import { refinedSport, attachment } from './refined-sports.js';
import { reviewedActivity } from './reviewed-activities.js';

// Spatial adaptations of the SwiftUI Canvas loops in Copia Stickmans de Actividades.
// Coordinates: +X forward, +Y up, ±Z separate the far and near limbs.
export const ACTIVITIES = [
  ['running', 'Correr', 'StickmanView', 7.5],
  ['yoga', 'Yoga', 'YogaView', 1.57],
  ['boxing', 'Boxeo', 'BoxingView', Math.PI * 2 / 1.8],
  ['cycling', 'Ciclismo', 'CyclistView', 4],
  ['basketball', 'Básquetbol', 'BasketballView', 2.51],
  ['bicepCurl', 'Curl de bíceps', 'BicepCurlView', 1.8],
  ['jumpRope', 'Saltar la cuerda', 'JumpRopeView', 5.5],
  ['soccer', 'Fútbol', 'SoccerView', Math.PI * 2 / 3.2],
  ['pilates', 'Pilates', 'PilatesView', 1.6],
  ['tennis', 'Tenis', 'TennisView', 2.64],
  ['weightlifter', 'Levantamiento de pesas', 'WeightlifterView', 2.8],
  ['dance', 'Baile', 'DanceView', 3],
  ['walking', 'Caminata', 'WalkerView', 4.5],
  ['rowingMachine', 'Remo', 'RowingMachineView', Math.PI * 2 / 2.8],
  ['skateboard', 'Skateboard', 'SkateboardView', Math.PI * 2 / 4.6],
  ['shoulderRaise', 'Elevaciones de hombros', 'ShoulderRaiseView', 1.4],
  ['volleyball', 'Voleibol', 'VolleyballView', 3.8],
  ['hiit', 'HIIT', 'HIITView', 4.5],
  ['hiker', 'Senderismo', 'HikerView', 3],
  ['benchPress', 'Press de banca', 'BenchPressView', 1.6],
  ['surfing', 'Surf', 'SurfingView', 2.4],
  ['padel', 'Pádel', 'PadelView', 2.64],
  ['core', 'Abdominales', 'CoreExerciseView', 2.4],
  ['indoorCycling', 'Ciclismo indoor', 'IndoorCyclingView', 4],
  ['martialArts', 'Artes marciales', 'MartialArtsView', Math.PI * 2 / 2.4],
  ['golf', 'Golf', 'GolfView', 2.4],
  ['calisthenics', 'Calistenia', 'CalisthenicsView', 1.2],
  ['rollerSkating', 'Patinaje sobre ruedas', 'RollerSkatingView', Math.PI * 2 / 2.1],
  ['barbellRow', 'Remo con barra', 'BarbellRowView', 1.8],
  ['swimming', 'Natación', 'SwimmingView', 3.5],
  ['pickleball', 'Pickleball', 'PickleballView', 2.64],
  ['warmup', 'Calentamiento', 'WarmupView', 1.8],
  ['baseball', 'Béisbol', 'BaseballView', Math.PI * 2 / 3.8],
  ['legTraining', 'Sentadillas', 'LegTrainingView', 2.2],
  ['scooter', 'Scooter', 'ScooterView', 3],
  ['skullCrusher', 'Extensión de tríceps', 'SkullCrusherView', 1.6],
  ['hockey', 'Hockey', 'HockeyView', 4.2],
  ['elliptical', 'Elíptica', 'EllipticalView', 4.2],
  ['americanFootball', 'Fútbol americano', 'AmericanFootballView', Math.PI * 2 / 3.4],
  ['iceSkating', 'Patinaje sobre hielo', 'IceSkatingView', 3],
  ['stairClimber', 'Escaladora', 'StairClimberView', 4.2],
  ['pingPong', 'Tenis de mesa', 'PingPongView', 3.46],
].map(([id, label, source, speed]) => ({ id, label, source: `${source}.swift`, speed }));

const TAU = Math.PI * 2;
export const point = (x, y, z = 0) => [x, y, z];
const add = (p, x, y, z = 0) => [p[0] + x, p[1] + y, p[2] + z];
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const distance = (a, b) => Math.hypot(...a.map((v, i) => v - b[i]));
const polar = (p, a, length) => add(p, Math.sin(a) * length, -Math.cos(a) * length);
const smooth = v => { v = Math.max(0, Math.min(1, v)); return v * v * (3 - 2 * v); };
const pulse = (phase, start, peak, end) => phase < start || phase > end ? 0 : phase < peak ? smooth((phase - start) / (peak - start)) : 1 - smooth((phase - peak) / (end - peak));
const rep = phase => smooth((phase - .12) / .3) * (1 - smooth((phase - .58) / .34));
function keys(phase, stops) {
  for (let i = 1; i < stops.length; i++) {
    if (phase <= stops[i][0]) {
      const [start, a] = stops[i - 1], [end, b] = stops[i];
      return a + (b - a) * smooth((phase - start) / (end - start));
    }
  }
  return stops.at(-1)[1];
}

// A spatial two-bone solver with an anatomical bend plane. The original 2D
// solver bent lateral arm/leg targets in the wrong plane, creating square arches.
export function joint(a, b, upper, lower, pole = [1, 0, 0]) {
  const d = Math.max(.00001, distance(a, b)), axis = b.map((v, i) => (v - a[i]) / d);
  const clamped = Math.min(upper + lower - .00001, Math.max(Math.abs(upper - lower) + .00001, d));
  const along = (upper * upper - lower * lower + clamped * clamped) / (2 * clamped);
  const height = Math.sqrt(Math.max(0, upper * upper - along * along));
  let projection = pole.reduce((sum, v, i) => sum + v * axis[i], 0);
  let normal = pole.map((v, i) => v - axis[i] * projection);
  if (Math.hypot(...normal) < .0001) {
    const fallback = Math.abs(axis[2]) < .9 ? [0, 0, 1] : [0, 1, 0];
    projection = fallback.reduce((sum, v, i) => sum + v * axis[i], 0);
    normal = fallback.map((v, i) => v - axis[i] * projection);
  }
  const length = Math.hypot(...normal);
  return a.map((v, i) => v + axis[i] * along + normal[i] / length * height);
}

function body(p, hips, lean = .04, sideBend = 0) {
  p.H = hips;
  p.S = add(hips, Math.sin(lean) * .86, Math.cos(lean) * Math.cos(sideBend) * .86, Math.sin(sideBend) * .86);
  p.N = add(p.S, Math.sin(lean) * .36, Math.cos(lean) * Math.cos(sideBend) * .36, Math.sin(sideBend) * .36);
}
function stand(p, height = 1.17, width = .34, lean = .04) {
  body(p, point(0, height), lean);
  p.LF = point(0, .1, -width); p.RF = point(0, .1, width);
  p.LW = add(p.S, .12, -.78, -.28); p.RW = add(p.S, .12, -.78, .28);
}
function gait(p, phase, running = false, hiking = false) {
  const stance = running ? .48 : .63, stride = running ? .48 : .32;
  body(p, point(0, running ? 1.06 + .08 * (1 - Math.cos(phase * TAU * 2)) / 2 : 1.14 + .025 * Math.cos(phase * TAU * 2)), running ? .15 : hiking ? .13 : .025);
  for (const [i, side] of ['L', 'R'].entries()) {
    const q = (phase + i * .5) % 1, z = i ? .16 : -.16;
    const recovery = smooth((q - stance) / (1 - stance));
    const x = q < stance ? stride * (1 - 2 * smooth(q / stance)) : stride * (2 * recovery - 1);
    const height = q < stance ? 0 : Math.sin(recovery * Math.PI) ** 2 * (running ? .48 : hiking ? .2 : .13);
    p[side + 'F'] = point(x, .1 + height, z);
    const swing = Math.sin(q * TAU) * (running ? .72 : .34);
    p[side + 'E'] = polar(add(p.S, 0, 0, z * 1.2), -swing, .48);
    p[side + 'W'] = polar(p[side + 'E'], -swing + (running ? 1.45 : .42), .46);
    p[side + 'FootPitch'] = q < stance ? -.12 * Math.sin(q / stance * TAU) : -.3 * Math.sin(recovery * Math.PI);
  }
}
function lying(p, hips, angle) {
  p.H = hips; p.S = add(hips, -.86 * Math.cos(angle), .86 * Math.sin(angle));
  p.N = add(p.S, -.36 * Math.cos(angle), .36 * Math.sin(angle));
}
function boardTransform(p, height, pitch, roll = 0) {
  p.props.boardPosition = [0, height, 0]; p.props.boardTilt = pitch; p.props.boardRoll = roll;
  for (const name of ['H', 'S', 'N', 'LF', 'RF', 'LW', 'RW']) {
    const [x, y, z] = p[name];
    const rolledY = y * Math.cos(roll) - z * Math.sin(roll), rolledZ = y * Math.sin(roll) + z * Math.cos(roll);
    p[name] = [x * Math.cos(pitch) - rolledY * Math.sin(pitch), height + x * Math.sin(pitch) + rolledY * Math.cos(pitch), rolledZ];
  }
}
const releaseCache = new Map();
function releasePosition(id, phase, offset) {
  const key = `${id}:${phase}`;
  if (!releaseCache.has(key)) {
    const pose = activityPose(id, phase * TAU, true);
    releaseCache.set(key, add(pose.RW, ...offset));
  }
  return [...releaseCache.get(key)];
}
export function implementPoint(pose, local) {
  if (pose.props.implementDirection) {
    const direction = pose.props.implementDirection, length = Math.hypot(...direction);
    return pose.RW.map((v, i) => v + direction[i] / length * local[1]);
  }
  const [rx, ry, rz] = pose.props.implementRotation, [x, y, z] = local;
  const zx = x * Math.cos(rz) - y * Math.sin(rz), zy = x * Math.sin(rz) + y * Math.cos(rz);
  const yx = zx * Math.cos(ry) + z * Math.sin(ry), yz = -zx * Math.sin(ry) + z * Math.cos(ry);
  return add(pose.RW, yx, zy * Math.cos(rx) - yz * Math.sin(rx), zy * Math.sin(rx) + yz * Math.cos(rx));
}
export const STRIKE_CONTACTS = {
  tennis: [.46, [0, .65, 0]], padel: [.48, [0, .65, 0]],
  pickleball: [.48, [0, .65, 0]], pingPong: [.48, [0, .36, 0]],
  baseball: [.46, [0, .78, 0]], golf: [.47, [.14, -1.05, 0]], hockey: [.5, [.22, -1.25, 0]],
};
function strikeFlight(p, id, phase) {
  const [contactPhase, local] = STRIKE_CONTACTS[id], key = `strike:${id}`;
  if (!releaseCache.has(key)) releaseCache.set(key, implementPoint(activityPose(id, contactPhase * TAU, true), local));
  const contact = releaseCache.get(key), low = id === 'golf' || id === 'hockey';
  if (phase <= contactPhase) {
    const u = phase / contactPhase;
    p.props.ball = low ? [...contact] : add(contact, (1 - u) * (id === 'pingPong' ? 1.45 : 1.6), Math.sin(u * Math.PI) * (id === 'pingPong' ? -.22 : .15));
  } else {
    const u = (phase - contactPhase) / (1 - contactPhase);
    p.props.ball = add(contact, u * (id === 'pingPong' ? 1.45 : 2), id === 'hockey' ? 0 : Math.sin(u * Math.PI) * (id === 'golf' ? 1 : id === 'pingPong' ? -.22 : .35));
  }
  p.props.ballScale = (low ? 1 : smooth(phase / .04)) * (1 - smooth((phase - .92) / .08));
}

// Each case has its own complete, periodic movement. Shared anatomy only solves
// joints and reach; timing, supports, hand targets and equipment are per sport.
export function activityPose(id, t, sampleRelease = false) {
  t = ((t % TAU) + TAU) % TAU;
  const phase = t / TAU, s = Math.sin(t), c = Math.cos(t), r = rep(phase);
  const p = { props: {}, angles: {} };
  stand(p);
  const api={releasePosition,strikeFlight,implementPoint};
  if (!reviewedActivity(p,id,t,phase,sampleRelease,api) && !refinedSport(p, id, t, phase, sampleRelease, api)) switch (id) {
    case 'walking':
      gait(p, phase); break;
    case 'hiker':
      gait(p, phase, false, true);
      p.RW = add(p.S, .25 + .18 * s, -.52, .26);
      delete p.RE;
      p.props.pole = [p.RW, point(.55 + .18 * s, .04, .29)]; break;
    case 'yoga':
      body(p, point(0, 1.17), .68 + s * .018);
      p.LF = point(.01, .1, -.14);
      p.RF = point(-.55, 1.72 + s * .02, .14);
      p.LW = add(p.S, -.79, .34, -.22); p.RW = add(p.S, .8, -.34, .22);
      p.angles.legPoleL = [1, 0, 0]; p.angles.legPoleR = [-1, 0, 0]; break;
    case 'hiit': {
      const open = smooth((1 - c) / 2), hop = .16 * s * s;
      const width = .16 + .49 * open;
      stand(p, .1 + Math.sqrt(1.119 ** 2 - (width - .075) ** 2) + hop, width, 0);
      p.LF[1] += hop; p.RF[1] += hop;
      for (const [i, side] of ['L', 'R'].entries()) {
        const sign = i ? 1 : -1, angle = .08 + open * 2.72;
        // Nearly straight limbs describe a triangle, rather than an inverted U.
        p[side + 'E'] = add(p.S, .025, -.48 * Math.cos(angle), sign * (.19 + .48 * Math.sin(angle)));
        p[side + 'W'] = add(p[side + 'E'], .025, -.46 * Math.cos(angle + .06), sign * .46 * Math.sin(angle + .06));
        p.angles['legPole' + side] = [0, 0, sign];
      }
      break;
    }
    case 'jumpRope': {
      const hop = .23 * smooth(Math.max(0, c)), compression = .055 * smooth(Math.max(0, -c));
      stand(p, 1.17 + hop - compression, .16, .025);
      p.LF[1] += hop; p.RF[1] += hop;
      p.LW = point(.12 + .025 * s, 1.32 + hop - compression + .025 * c, -.47);
      p.RW = point(.12 + .025 * s, 1.32 + hop - compression + .025 * c, .47);
      p.props.ropeAngle = t; break;
    }
    case 'dance': {
      const leftLift = smooth(Math.max(0, s)), rightLift = smooth(Math.max(0, -s));
      body(p, point(.03 * c, 1.1 - .05 * Math.cos(t * 2), .12 * s), .04, .12 * s);
      p.LF = point(.02, .1 + .16 * leftLift, -.32 + .06 * leftLift);
      p.RF = point(.02, .1 + .16 * rightLift, .32 - .06 * rightLift);
      p.LW = add(p.S, .25 + .14 * c, -.25 + .18 * Math.sin(t * 2), -.6 - .1 * s);
      p.RW = add(p.S, .25 - .14 * c, -.25 - .18 * Math.sin(t * 2), .6 - .1 * s); break;
    }
    case 'warmup': {
      const stretch = s * .26, leftUp = smooth((s + 1) / 2);
      body(p, point(0, 1.11), 0, stretch);
      p.LF = point(0, .1, -.4); p.RF = point(0, .1, .4);
      for (const [i, side] of ['L', 'R'].entries()) {
        const sign = i ? 1 : -1, angle = .08 + 2.82 * (i ? 1 - leftUp : leftUp);
        p[side + 'E'] = add(p.S, .02, -.48 * Math.cos(angle), sign * (.19 + .48 * Math.sin(angle)));
        p[side + 'W'] = add(p[side + 'E'], .025, -.46 * Math.cos(angle + .06), sign * .46 * Math.sin(angle + .06));
      }
      break;
    }
    case 'bicepCurl':
      stand(p, 1.17, .27);
      for (const [i, side] of ['L','R'].entries()) {
        p[side + 'E'] = add(p.S, .09, -.47, i ? .22 : -.22);
        p[side + 'W'] = polar(p[side + 'E'], .1 + 2.55 * r, .46);
      }
      break;
    case 'shoulderRaise':
      stand(p, 1.17, .28);
      for (const [i, side] of ['L','R'].entries()) {
        const sign = i ? 1 : -1, angle = .08 + 1.4 * r;
        p[side + 'E'] = add(p.S, .02, -.48 * Math.cos(angle), sign * (.19 + .48 * Math.sin(angle)));
        p[side + 'W'] = add(p[side + 'E'], .06, -.46 * Math.cos(angle + .06), sign * .46 * Math.sin(angle + .06));
      }
      break;
    case 'barbellRow':
      stand(p, 1.04, .29, .97);
      p.H[0] = -.28; p.S[0] -= .28; p.N[0] -= .28;
      p.LW = point(.45 - .19 * r, .69 + .46 * r, -.4); p.RW = point(.45 - .19 * r, .69 + .46 * r, .4);
      p.angles.armPoleL = [-1, 1, -.2]; p.angles.armPoleR = [-1, 1, .2]; break;
    case 'core':
      lying(p, point(.05, .23), .07 + .85 * r);
      p.LF = point(1.02, .11, -.24); p.RF = point(1.02, .11, .24);
      p.angles.legPoleL = [0, 1, 0]; p.angles.legPoleR = [0, 1, 0];
      p.LW = add(p.N, -.05, -.06, -.24); p.RW = add(p.N, -.05, -.06, .24);
      p.angles.armPoleL = [0, 0, -1]; p.angles.armPoleR = [0, 0, 1]; break;
    case 'rowingMachine': {
      const d = phase < .34 ? phase / .34 : (phase - .34) / .66;
      const legs = phase < .34 ? smooth(d / .72) : 1 - smooth((d - .4) / .6);
      const back = phase < .34 ? smooth((d - .3) / .7) : 1 - smooth((d - .16) / .27);
      const arms = phase < .34 ? smooth((d - .64) / .36) : 1 - smooth(d / .22);
      body(p, point(.28 - .63 * legs, .83), .32 - .58 * back);
      p.LF = point(.63, .34, -.21); p.RF = point(.63, .34, .21);
      p.LW = point(1.22 - .63 * legs - .45 * back - .16 * arms, 1.3, -.23);
      p.RW = point(1.22 - .63 * legs - .45 * back - .16 * arms, 1.3, .23);
      p.props.seat = p.H; p.props.wheelSpin = -t * 4; break;
    }
    case 'skateboard': {
      const push = pulse(phase, .03, .19, .38), crouch = pulse(phase, .4, .55, .62) + .6 * pulse(phase, .8, .88, .98);
      const air = phase > .58 && phase < .82 ? Math.sin((phase - .58) / .24 * Math.PI) ** 2 : 0;
      stand(p, 1.23 - .35 * push - .25 * crouch, .16, .18);
      p.H[0] -= .15 * push; p.S[0] -= .15 * push; p.N[0] -= .15 * push;
      p.LF = point(-.48 - .42 * push, .23 - .13 * push, -.12);
      p.RF = point(.48, .23, .12);
      p.LW = add(p.S, -.65, -.25 + .2 * air, -.24); p.RW = add(p.S, .65, -.25 + .2 * air, .24);
      boardTransform(p, .52 * air, .1 * Math.sin((phase - .58) / .24 * TAU) * air);
      p.props.wheelSpin = -t * 3; break;
    }
    case 'scooter': {
      const push = pulse(phase, .05, .36, .65), recover = pulse(phase, .57, .78, .99);
      body(p, point(0, 1.15 - .22 * push), .11);
      p.RF = point(.32, .23, .12);
      p.LF = point(-.2 - .5 * push + .18 * recover, .1 + .24 * recover, -.25);
      p.LW = point(.8, 1.55, -.23); p.RW = point(.8, 1.55, .23);
      p.props.boardPosition = [0, 0, 0]; p.props.boardTilt = 0; p.props.wheelSpin = -t * 4; break;
    }
    case 'rollerSkating':
    case 'iceSkating': {
      const ice = id === 'iceSkating';
      body(p, point(-.06, ice ? 1.1 : 1.05, .14 * s), ice ? .14 : .23, -.04 * s);
      for (const [i, side] of ['L','R'].entries()) {
        const q = t + i * Math.PI, sign = i ? 1 : -1, push = smooth(Math.max(0, Math.sin(q))), recover = smooth(Math.max(0, -Math.sin(q)));
        p[side + 'F'] = point(-.07 - .3 * push + .16 * recover, .24 + .2 * recover, sign * (.24 + (ice ? .3 : .38) * push));
        p[side + 'W'] = add(p.S, .19 + Math.sin(q) * .3, -.52 + .05 * recover, sign * (ice ? .43 : .3));
        p[side + 'FootYaw'] = sign * .18 * push; p[side + 'FootPitch'] = -.16 * recover;
      }
      p.props.wheelSpin = -t * 4; break;
    }
    case 'basketball': {
      const dip = pulse(phase, .02, .16, .28), jump = pulse(phase, .2, .38, .62), extend = pulse(phase, .16, .38, .7);
      stand(p, 1.16 - .22 * dip + .28 * jump, .27, -.02);
      p.LF[1] += .28 * jump; p.RF[1] += .28 * jump;
      p.LW = add(p.S, .37, -.17 + .95 * extend, -.2); p.RW = add(p.S, .4, -.13 + .95 * extend, .2);
      if (sampleRelease) break;
      const release = releasePosition(id, .38, [.03, .2, -.12]);
      if (phase < .38) { p.props.ballHandOffset = [.03, .2, -.12]; p.props.ballScale = smooth(phase / .06); }
      else {
        const u = Math.min(1, (phase - .38) / .3);
        p.props.ball = mix(release, point(2.15, 3.1), u); p.props.ball[1] += 4 * u * (1 - u) * .55;
        if (phase > .68) p.props.ball[1] -= ((phase - .68) / .3) ** 2 * 2.9;
        p.props.ballScale = 1 - smooth((phase - .86) / .1);
      }
      break;
    }
    case 'tennis': {
      const stroke = keys(phase, [[0,0],[.17,0],[.34,-1],[.46,1],[.64,.7],[.88,0],[1,0]]);
      const dip = pulse(phase, .2, .37, .6);
      stand(p, 1.12 - .1 * dip, .36, .08 + .06 * stroke);
      p.H[0] += .06 * stroke; p.S[0] += .06 * stroke; p.N[0] += .06 * stroke;
      p.RW = add(p.S, .52 + .17 * stroke, -.5 + .1 * stroke, .28 - .37 * stroke);
      p.LW = add(p.S, .26 - .12 * stroke, -.2, -.42);
      p.props.implementRotation = [.3, -.8 * stroke, -1.1 - .5 * stroke];
      if (!sampleRelease) strikeFlight(p, id, phase); break;
    }
    case 'padel': {
      const stroke = keys(phase, [[0,0],[.2,0],[.36,-.7],[.48,1],[.67,.6],[.9,0],[1,0]]);
      stand(p, 1.04 + .04 * stroke, .35, .15);
      p.RW = add(p.S, .5 + .15 * stroke, -.42 + .12 * stroke, .28 - .22 * stroke);
      p.LW = add(p.S, .3, -.24, -.34);
      p.props.implementRotation = [.15, -.7 * stroke, -.8 - .6 * stroke];
      if (!sampleRelease) strikeFlight(p, id, phase); break;
    }
    case 'pickleball': {
      const stroke = pulse(phase, .22, .48, .77);
      stand(p, 1.06 - .035 * stroke, .34, .16);
      p.RW = add(p.S, .5 + .2 * stroke, -.42 + .25 * stroke, .2 - .1 * stroke);
      p.LW = add(p.S, .3, -.25, -.3);
      p.props.implementRotation = [.1, -.25 * stroke, -1.4 - .4 * stroke];
      if (!sampleRelease) strikeFlight(p, id, phase); break;
    }
    case 'pingPong': {
      const stroke = pulse(phase, .27, .48, .7);
      stand(p, 1.02, .31, .3);
      p.RW = add(p.S, .48 + .18 * stroke, -.48 + .1 * stroke, .2 - .18 * stroke);
      p.LW = add(p.S, .15, -.4, -.36);
      p.props.implementRotation = [.1, -.4 * stroke, -1.45 - .3 * stroke];
      if (!sampleRelease) strikeFlight(p, id, phase); break;
    }
    case 'golf': {
      const swing = keys(phase, [[0,0],[.12,0],[.36,-1],[.47,0],[.62,1],[.75,1],[1,0]]);
      stand(p, 1.04, .32, .43);
      p.RW = add(p.S, .31 - .1 * Math.abs(swing), -.66 + .78 * Math.abs(swing), .16 - .35 * swing);
      p.LW = add(p.RW, -.03, .06, -.1);
      p.props.implementRotation = [.1, swing * .5, swing * 2.5];
      p.LW = implementPoint(p, [0, .12, 0]);
      if (!sampleRelease) strikeFlight(p, id, phase); break;
    }
    default: throw new Error(`Unknown activity: ${id}`);
  }

  for (const [i, side] of ['L', 'R'].entries()) {
    const sign = i ? 1 : -1;
    p[side + 'A'] = attachment(p.S, sign * .19, p.angles.shoulderYaw || 0, p.angles.bodyRoll || 0);
    // The thighs meet a narrow pelvis. Wide knees no longer create a square arch.
    p[side + 'B'] = attachment(p.H, sign * .075, p.angles.hipYaw || 0);
    p[side + 'K'] ||= joint(p[side + 'B'], p[side + 'F'], .57, .55, p.angles['legPole' + side] || [1, 0, sign * .04]);
    if (!p[side + 'E']) {
      const start = p[side + 'A'], target = p[side + 'W'], reach = distance(start, target);
      if (reach > .939) p[side + 'W'] = mix(start, target, .939 / reach);
      p[side + 'E'] = joint(start, p[side + 'W'], .48, .46, p.angles['armPole' + side] || [-.5, -.5, sign * .3]);
    }
  }
  if (p.props.ballHandOffset) p.props.ball = add(p.RW, ...p.props.ballHandOffset);
  return p;
}
