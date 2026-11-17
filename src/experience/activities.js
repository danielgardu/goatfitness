import * as THREE from 'three';
import { ACTIVITIES, activityPose, point } from './activity-poses.js';
import { createCelMaterial, createHullMaterial } from './cel-shading.js';
import { stairPosition } from './reviewed-activities.js';

const Y = new THREE.Vector3(0, 1, 0);
const a = new THREE.Vector3(), b = new THREE.Vector3(), direction = new THREE.Vector3();
const hiddenMatrix = new THREE.Matrix4().makeScale(.001, .001, .001).setPosition(0, -1000, 0);
const vec = p => new THREE.Vector3(...p);
const offset = (p, x, y, z = 0) => point(p[0] + x, p[1] + y, p[2] + z);

// All 42 actors share four instanced geometries and two materials. The inverted
// hull uses the SAME instance matrices, including every animated joint/prop.
export class FigureBatch {
  constructor(scene) {
    this.scene = scene;
    this.material = createCelMaterial();
    this.hullMaterial = createHullMaterial(1.8);
    this.pools = new Map([
      ['sphere', { geometry: new THREE.SphereGeometry(1, 14, 10), nodes: [] }],
      ['bar', { geometry: new THREE.CylinderGeometry(1, 1, 1, 10), nodes: [] }],
      ['box', { geometry: new THREE.BoxGeometry(1, 1, 1), nodes: [] }],
      ['ring', { geometry: new THREE.TorusGeometry(1, .065, 6, 28), nodes: [] }],
    ]);
  }

  node(kind, parent, actor, size, position = [0, 0, 0]) {
    const node = new THREE.Object3D();
    node.scale.set(...size); node.position.set(...position); parent.add(node);
    this.pools.get(kind).nodes.push({ node, actor });
    return node;
  }

  build() {
    for (const pool of this.pools.values()) {
      pool.mesh = new THREE.InstancedMesh(pool.geometry, this.material, pool.nodes.length);
      pool.hull = new THREE.InstancedMesh(pool.geometry, this.hullMaterial, pool.nodes.length);
      pool.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      // Share the attribute itself; surfaces and outlines cannot drift apart.
      pool.hull.instanceMatrix = pool.mesh.instanceMatrix;
      pool.mesh.frustumCulled = pool.hull.frustumCulled = false;
      pool.mesh.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 500);
      pool.mesh.userData.figures = pool.nodes;
      pool.hull.onBeforeRender = renderer => this.hullMaterial.userData.updateViewport(renderer);
      this.scene.add(pool.mesh, pool.hull);
    }
    this.pickMeshes = [...this.pools.values()].map(pool => pool.mesh);
  }

  update() {
    for (const pool of this.pools.values()) {
      pool.nodes.forEach(({ node, actor }, i) => pool.mesh.setMatrixAt(i, actor.visible ? node.matrixWorld : hiddenMatrix));
      pool.mesh.instanceMatrix.needsUpdate = true;
    }
  }
}

function setSegment(node, from, to, radius) {
  a.set(...from); b.set(...to); direction.subVectors(b, a);
  node.position.copy(a).add(b).multiplyScalar(.5);
  node.quaternion.setFromUnitVectors(Y, direction.clone().normalize());
  node.scale.set(radius, Math.max(.001, direction.length()), radius);
}

export class ActivityFigure {
  constructor(batch, definition, index) {
    Object.assign(this, definition);
    this.phase = index * 2.399;
    this.root = new THREE.Group();
    this.root.scale.setScalar(1.35);
    this.visible = true;
    this.batch = batch;
    this.joints = {};
    for (const name of ['H', 'S', 'LA', 'RA', 'LB', 'RB', 'LK', 'RK', 'LF', 'RF', 'LE', 'RE', 'LW', 'RW']) {
      this.joints[name] = this.shape('sphere', name === 'H' || name === 'S' ? [.125, .125, .125] : [.083, .083, .083]);
    }
    this.head = this.shape('sphere', [.25, .27, .25]);
    this.feet = ['L', 'R'].map(() => this.shape('sphere', [.16, .07, .1]));
    this.links = [['H', 'S', .115], ['S', 'N', .08], ['LA', 'RA', .095], ['LB', 'RB', .1]];
    for (const side of ['L', 'R']) this.links.push([side + 'A', side + 'E', .077], [side + 'E', side + 'W', .07], [side + 'B', side + 'K', .09], [side + 'K', side + 'F', .079]);
    this.limbs = this.links.map(() => this.shape('bar', [1, 1, 1]));
    this.updaters = [];
    this.equipment = {};
    this.makeEquipment();
  }

  shape(kind, size, position, parent = this.root) { return this.batch.node(kind, parent, this, size, position); }
  bar(from, to, radius = .045, parent = this.root) {
    const node = this.shape('bar', [1, 1, 1], [0, 0, 0], parent); setSegment(node, from, to, radius); return node;
  }
  dynamicBar(getPoints, radius = .04) {
    const node = this.bar([0, 0, 0], [0, 1, 0], radius);
    this.updaters.push(p => setSegment(node, ...getPoints(p), radius)); return node;
  }
  group() { const group = new THREE.Group(); this.root.add(group); return group; }
  wheel(x, y, r, z = 0, parent = this.root) {
    const group = new THREE.Group(); group.position.set(x, y, z); parent.add(group);
    this.shape('ring', [r, r, r], [0, 0, 0], group);
    for (let i = 0; i < 3; i++) {
      const angle = i * Math.PI / 3;
      this.bar([-Math.cos(angle) * r, -Math.sin(angle) * r, 0], [Math.cos(angle) * r, Math.sin(angle) * r, 0], .015, group);
    }
    return group;
  }
  weight(parent, halfWidth = .25, plate = .16) {
    this.bar([0, 0, -halfWidth - .08], [0, 0, halfWidth + .08], .035, parent);
    for (const z of [-halfWidth, halfWidth]) {
      const disc = this.shape('bar', [plate, .09, plate], [0, 0, z], parent); disc.rotation.x = Math.PI / 2;
    }
  }

  makeEquipment() {
    const id = this.id;
    if (['soccer', 'basketball', 'volleyball', 'americanFootball', 'tennis', 'padel', 'pickleball', 'pingPong', 'golf', 'baseball', 'hockey'].includes(id)) {
      const radius = { soccer: .24, basketball: .24, volleyball: .23, americanFootball: .17, golf: .055, hockey: .1, baseball: .075 }[id] || .08;
      const ball = this.shape('sphere', [radius, radius, radius]);
      if (id === 'americanFootball') ball.scale.x *= 1.6;
      if (id === 'hockey') ball.scale.y *= .3;
      const ballSize = ball.scale.clone();
      this.updaters.push(p => {
        ball.position.set(...p.props.ball);
        ball.scale.copy(ballSize).multiplyScalar(Math.max(.0001, p.props.ballScale ?? 1));
        ball.rotation.set(...(p.props.ballRotation || [0, 0, p.props.ballSpin || 0]));
      });
      if (id === 'americanFootball') {
        this.bar([-.46, .86, .18], [.46, .86, .18], .022, ball);
        for (const x of [-.3, -.15, 0, .15, .3]) this.bar([x, .8, .03], [x, .91, .28], .02, ball);
      }
      if (['soccer', 'basketball', 'volleyball'].includes(id)) {
        // Thin seams keep an all-white ball readable in the monochrome landscape.
        for (const angle of [0, Math.PI / 2]) {
          const seam = this.shape('ring', [radius * .99, radius * .99, radius * .99], [0, 0, 0], ball);
          // Ball already supplies the overall scale.
          seam.scale.setScalar(1); seam.rotation.y = angle;
        }
      }
    }
    if (id === 'boxing') for (const side of ['L', 'R']) {
      const glove = this.shape('sphere', [.14, .12, .14]);
      this.updaters.push(p => glove.position.set(...p[side + 'W']));
    }
    if (id === 'boxing') {
      const bag = this.group();
      this.shape('bar', [.25, .95, .25], [0, 0, 0], bag);
      this.shape('sphere', [.25, .18, .25], [0, .46, 0], bag);
      this.shape('sphere', [.25, .18, .25], [0, -.46, 0], bag);
      this.bar([1.9, .06, 0], [1.9, 3.05, 0], .04);
      this.bar([1.9, 3.05, 0], [1.27, 3.05, 0], .04);
      this.bar([1.9, .06, -.6], [1.9, .06, .6], .04);
      this.dynamicBar(p => [point(1.27, 3.05), point(1.27 + p.props.bagSwing, 2.64)], .017);
      this.updaters.push(p => { bag.position.set(1.27 + p.props.bagSwing, 2, 0); bag.rotation.z = -p.props.bagSwing * .18; });
    }
    if (id === 'soccer') {
      for (const z of [-.85, .85]) {
        this.bar([3.2, .06, z], [3.2, 1.15, z], .035);
        this.bar([3.2, 1.15, z], [3.65, .06, z], .025);
        this.bar([3.2, .06, z], [3.65, .06, z], .025);
      }
      this.bar([3.2, 1.15, -.85], [3.2, 1.15, .85], .035);
      for (let z = -.7; z <= .71; z += .28) this.bar([3.2, 1.15, z], [3.65, .06, z], .008);
      for (let y = .2; y < 1.1; y += .22) {
        const x = 3.65 - y / 1.15 * .45;
        this.bar([x, y, -.85], [x, y, .85], .008);
      }
    }
    if (id === 'basketball') {
      this.bar([2.55, .1, 0], [2.55, 3.45, 0], .045);
      this.shape('box', [.06, .65, 1.05], [2.5, 3.32, 0]);
      const hoop = this.shape('ring', [.31, .31, .31], [2.15, 3.1, 0]); hoop.rotation.x = Math.PI / 2;
      for (const z of [-.22, .22]) this.bar([2.15, 3.1, z], [2.15, 2.85, z * .55], .012);
    }
    if (id === 'hiker') {
      const pack = this.shape('box', [.33, .57, .48]);
      this.updaters.push(p => pack.position.set(...offset(p.S, -.32, -.28)));
      this.dynamicBar(p => p.props.pole, .026);
    }
    if (['bicepCurl', 'shoulderRaise'].includes(id)) for (const side of ['L', 'R']) {
      const weight = this.group(); this.weight(weight);
      if(id==='shoulderRaise')weight.rotation.y=-THREE.MathUtils.degToRad(95);
      (this.equipment.dumbbells ||= []).push(weight);
      this.updaters.push(p => weight.position.set(...p[side + 'W']));
    }
    if (['weightlifter', 'barbellRow', 'benchPress', 'skullCrusher'].includes(id)) {
      const weight = this.group(); this.weight(weight, .92, id === 'skullCrusher' ? .18 : .29);
      this.equipment.barbell=weight;
      this.updaters.push(p => weight.position.copy(vec(p.LW)).add(vec(p.RW)).multiplyScalar(.5));
    }
    if (['benchPress', 'skullCrusher'].includes(id)) {
      this.equipment.benchPad=this.shape('box', [1.55, .15, .5], [-.475, .73, 0]);
      for (const x of [-1.02, .05]) {
        this.bar([x, .65, 0], [x, .12, 0], .055);
        this.bar([x, .12, -.47], [x, .12, .47], .055);
      }
    }
    if (['pilates', 'core', 'yoga'].includes(id)) this.shape('box', [3.5, .045, 1.25], [.1, .025, 0]);
    if (id === 'calisthenics') {
      for (const z of [-1, 1]) {
        this.bar([0, .05, z], [0, 3.2, z], .055);
        this.bar([-.6, .06, z], [.6, .06, z], .045);
      }
      this.equipment.pullUpBar=this.bar([0, 3.2, -1], [0, 3.2, 1], .05);
    }
    if (id === 'jumpRope') {
      const rope = Array.from({ length: 28 }, () => this.bar([0, 0, 0], [0, 1, 0], .016));
      this.updaters.push(p => {
        const angle = p.props.ropeAngle;
        const at = u => {
          const handle = vec(p.LW).lerp(vec(p.RW), u), arc = Math.sin(u * Math.PI) * 1.45;
          handle.x += Math.sin(angle) * arc; handle.y -= Math.cos(angle) * arc;
          return handle.toArray();
        };
        rope.forEach((node, i) => setSegment(node, at(i / rope.length), at((i + 1) / rope.length), .016));
      });
    }
    if (['cycling', 'indoorCycling'].includes(id)) {
      const rear = point(-1, .5), front = point(1, .5), crank = point(0, .71), seat = point(-.45, 1.3), handle = point(.75, 1.53);
      const wheels = [this.wheel(-1, .5, .47), this.wheel(1, .5, .47)];
      for (const [from, to] of [[rear, crank], [rear, seat], [seat, crank], [seat, handle], [crank, handle], [handle, front]]) this.bar(from, to, .04);
      this.shape('box', [.36, .065, .25], [-.45, 1.33, 0]);
      this.bar([.75, 1.53, -.3], [.75, 1.53, .3]);
      this.dynamicBar(p => [point(0, .71, -.22), p.LF], .025);
      this.dynamicBar(p => [point(0, .71, .22), p.RF], .025);
      this.updaters.push(p => wheels.forEach(wheel => wheel.rotation.z = p.props.wheelSpin));
      if (id === 'indoorCycling') for (const x of [-1, 1]) this.bar([x, .08, -.48], [x, .08, .48], .06);
    }
    if (id === 'rowingMachine') {
      this.bar([-1.2, .55, 0], [1.6, .55, 0], .07);
      const flywheel = this.wheel(1.5, .73, .42);
      for (const x of [-1, 1.5]) this.bar([x, .1, -.45], [x, .1, .45], .06);
      const seat = this.shape('box', [.48, .12, .5]);
      this.updaters.push(p => { seat.position.set(p.H[0], .68, 0); flywheel.rotation.z = p.props.wheelSpin; });
      this.shape('box', [.12, .35, .6], [.68, .32, 0]);
      this.dynamicBar(p => [point(1.5, 1.3), offset(p.RW, 0, 0, -.24)], .018);
      this.dynamicBar(p => [p.LW, p.RW], .04);
    }
    if (id === 'elliptical') {
      this.shape('box', [1.85, .16, .95], [.12, .12, 0]);
      this.bar([.75, .18, 0], [.75, 1.8, 0], .055);
      for (const side of ['L', 'R']) {
        const pedal = this.shape('box', [.55, .075, .25]);
        this.updaters.push(p => pedal.position.set(...offset(p[side + 'F'], .07, -.12)));
        this.dynamicBar(p => [offset(p[side + 'F'], .15, -.1), p[side + 'W']], .035);
      }
      this.shape('box', [.18, .28, .48], [.76, 1.9, 0]);
    }
    if(id==='stairClimber'){
      for(const z of [-.65,.65])this.bar([-1,.08,z],[1,.08,z],.045);
      for(const x of [-1,1])this.bar([x,.08,-.65],[x,.08,.65],.045);
      this.equipment.stairSteps=[];
      for(let i=0;i<4;i++){
        const step=this.group();this.shape('box',[.38,.065,1.02],[0,-.0325,0],step);
        this.shape('box',[.055,.19,1.02],[.165,-.125,0],step);
        this.equipment.stairSteps.push(step);
        this.updaters.push(p=>{
          const u=(p.props.stepPhase+i*.25)%1,[x,y]=stairPosition(u);
          step.position.set(x,y,0);step.scale.setScalar(Math.max(.001,Math.min(1,u/.045,(1-u)/.045)));
        });
      }
      for(const z of [-.59,.59]){
        this.bar([-.9,.16,z],[.74,1.06,z],.045);
        this.bar([.9,.12,z],[.9,2.2,z],.055);
        this.bar([.9,2.2,z],[.68,2.08,z*.8],.045);
        this.bar([.68,2.08,z*.8],[.25,1.9,z*.8],.035);
      }
      this.shape('box',[.32,.22,.76],[.96,2.22,0]);
    }
    if(id==='volleyball'){
      for(const z of [-1.15,1.15]){
        this.bar([2.4,.04,z],[2.4,2.45,z],.035);
        this.bar([2.15,.04,z],[2.65,.04,z],.03);
      }
      for(let y=1.5;y<=2.41;y+=.18)this.bar([2.4,y,-1.15],[2.4,y,1.15],.009);
      for(let z=-1.1;z<=1.11;z+=.22)this.bar([2.4,1.5,z],[2.4,2.4,z],.009);
    }
    if (['skateboard', 'surfing', 'scooter'].includes(id)) {
      const board = this.group();
      this.shape('sphere', [id === 'surfing' ? 1.65 : 1, .075, id === 'surfing' ? .46 : .27], [0, .12, 0], board);
      const wheels = [];
      if (id !== 'surfing') for (const x of [-.65, .65]) for (const z of [-.23, .23]) wheels.push(this.wheel(x, .1, .095, z, board));
      if (id === 'scooter') {
        this.bar([.8, .12, 0], [.8, 1.55, 0], .045);
        this.bar([.8, 1.55, -.3], [.8, 1.55, .3], .045);
      }
      this.updaters.push(p => {
        board.rotation.set(p.props.boardRoll || 0, 0, p.props.boardTilt);
        board.position.set(...p.props.boardPosition);
        wheels.forEach(wheel => wheel.rotation.z = p.props.wheelSpin || 0);
      });
    }
    if (['rollerSkating', 'iceSkating'].includes(id)) for (const side of ['L', 'R']) {
      const skate = this.group();
      this.shape('box', [.34, .1, .18], [.07, -.065, 0], skate);
      if (id === 'iceSkating') this.bar([-.1, -.16, 0], [.27, -.16, 0], .022, skate);
      else for (const x of [-.09, .01, .11, .21]) {
        const wheel = this.wheel(x, -.15, .055, 0, skate);
        this.updaters.push(p => wheel.rotation.z = p.props.wheelSpin);
      }
      this.updaters.push(p => {
        skate.position.set(...p[side + 'F']);
        skate.rotation.set(0, p[side + 'FootYaw'] || 0, p[side + 'FootPitch'] || 0);
      });
    }
    if (['tennis', 'padel', 'pickleball', 'pingPong', 'baseball', 'golf', 'hockey'].includes(id)) {
      const implement = this.group();
      const racket = ['tennis', 'padel', 'pickleball', 'pingPong'].includes(id);
      if (racket) {
        const small = id === 'pingPong';
        this.bar([0, 0, 0], [0, small ? .23 : .37, 0], .032, implement);
        const center = small ? .36 : .65, radius = small ? .18 : .3;
        this.shape('ring', [radius, radius * 1.2, radius], [0, center, 0], implement);
        // Strings for tennis; solid paddle for the other racket sports.
        if (id === 'tennis') {
          for (const x of [-.14, 0, .14]) this.bar([x, center - .25, 0], [x, center + .25, 0], .009, implement);
          for (const y of [-.17, 0, .17]) this.bar([-.24, center + y, 0], [.24, center + y, 0], .009, implement);
        } else this.shape('sphere', [radius * .89, radius * 1.08, .045], [0, center, 0], implement);
      } else if (id === 'baseball') {
        this.bar([0, 0, 0], [0, .5, 0], .033, implement);
        this.bar([0, .45, 0], [0, 1.03, 0], .075, implement);
        this.shape('sphere', [.075, .08, .075], [0, 1.03, 0], implement);
        this.shape('sphere', [.055, .025, .055], [0, -.02, 0], implement);
      } else if(id==='hockey'){
        this.bar([0,0,0],[0,-1.25,0],.029,implement);
        this.shape('box',[.55,.1,.13],[.22,-1.25,0],implement);
      } else {
        this.bar([0, 0, 0], [0, -1.05, 0], .027, implement);
        this.shape('box', [id === 'hockey' ? .48 : .18, .12, .12], [.14, -1.05, 0], implement);
      }
      this.updaters.push(p => {
        implement.position.set(...p.RW);
        if (p.props.implementDirection) implement.quaternion.setFromUnitVectors(Y, vec(p.props.implementDirection).normalize());
        else implement.rotation.set(...p.props.implementRotation);
      });
      if (id === 'pingPong') {
        this.shape('box', [1.9, .08, 1.2], [1.8, .88, 0]);
        for (const x of [1, 2.6]) for (const z of [-.48, .48]) this.bar([x, .1, z], [x, .85, z], .035);
        this.shape('box', [.025, .18, 1.2], [1.85, 1.01, 0]);
      }
    }
    if(id==='hockey')for(const side of ['L','R']){
      const skate=this.group();this.shape('box',[.35,.13,.19],[.06,-.025,0],skate);
      this.bar([-.12,-.12,0],[.26,-.12,0],.025,skate);
      this.updaters.push(p=>{skate.position.set(...p[side+'F']);skate.rotation.y=p[side+'FootYaw'];});
    }
    if (id === 'surfing') this.shape('box', [.2, .17, .035], [-.9, .01, 0]);
  }

  update(time) {
    const t = time * this.speed + this.phase;
    const pose = activityPose(this.id, t);
    for (const [name, node] of Object.entries(this.joints)) node.position.set(...pose[name]);
    this.head.position.set(...pose.N);
    this.head.rotation.set(...(pose.props.headRotation || [0, 0, 0]));
    this.feet.forEach((foot, i) => {
      const side = i ? 'R' : 'L';
      foot.position.set(...offset(pose[side + 'F'], .07, -.025));
      foot.rotation.set(0, pose[side + 'FootYaw'] || 0, pose[side + 'FootPitch'] || 0);
    });
    this.links.forEach(([from, to, radius], i) => setSegment(this.limbs[i], pose[from], pose[to], radius));
    for (const update of this.updaters) update(pose, t);
    this.root.updateMatrixWorld(true);
    // Above the highest part of the figure/equipment, including horizontal poses.
    const top = Math.max(...Object.values(pose).filter(Array.isArray).map(p => p[1]));
    this.anchor = vec(point(pose.N[0], top + .5)); this.root.localToWorld(this.anchor);
  }
}

export class ActivityWorld {
  constructor(world) {
    this.world = world;
    this.batch = new FigureBatch(world.scene);
    this.frustum = new THREE.Frustum(); this.projection = new THREE.Matrix4();
    this.bounds = new THREE.Sphere(new THREE.Vector3(), 6.5);
    this.raycaster = new THREE.Raycaster(); this.pointer = new THREE.Vector2();
    this.pointerInside = false; this.dragging = false; this.selected = null;
    this.tooltip = document.getElementById('activity-tooltip');
    this.figures = ACTIVITIES.map((definition, index) => {
      const figure = new ActivityFigure(this.batch, definition, index);
      const waterStation = world.waterStages?.stationFor(definition.id);
      if (waterStation) {
        figure.root.position.copy(waterStation.position);
        figure.root.rotation.y = waterStation.rotation;
        figure.root.rotation.z = waterStation.tilt || 0;
        figure.routeProgress = waterStation.progress;
        figure.clearance = world.nearestDistance(waterStation.position.x, waterStation.position.z);
        figure.inWater = true; figure.update(0);
        return figure;
      }
      const t = (.105 + index / ACTIVITIES.length) % 1;
      const p = world.path.getPointAt(t), tangent = world.path.getTangentAt(t);
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x);
      let side = index % 2 === 0 ? 1 : -1;
      let position;
      // Check the ENTIRE loop, so offsetting from one bend cannot enter another.
      for (const candidateSide of [side, -side]) {
        for (const offset of [7.2, 8.4, 9.6, 11, 12.5]) {
          const candidate = p.clone().addScaledVector(normal, candidateSide * offset);
          if (world.nearestDistance(candidate.x, candidate.z) > 5.8 && (!world.waterStages || world.waterStages.isClear(candidate.x,candidate.z,3.7))) {
            position = candidate; side = candidateSide; break;
          }
        }
        if (position) break;
      }
      if (!position) throw new Error(`No safe roadside position for ${definition.id}`);
      position.y = world.heightAt(position.x, position.z) + .08;
      figure.root.position.copy(position);
      // Face along the route; the camera can orbit freely around the real geometry.
      figure.root.rotation.y = -Math.atan2(tangent.z, tangent.x) + side * .2;
      figure.routeProgress = t;
      figure.clearance = world.nearestDistance(position.x, position.z);
      figure.update(0);
      return figure;
    });
    this.batch.build(); this.batch.update();
    this.makeShadows();
    this.bindPointer();
  }

  makeShadows() {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 64;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 31);
    gradient.addColorStop(0, 'rgba(0,18,120,.32)'); gradient.addColorStop(1, 'rgba(0,18,120,0)');
    context.fillStyle = gradient; context.fillRect(0, 0, 64, 64);
    const shadows = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(canvas), transparent: true, depthWrite: false,
    }), this.figures.length);
    const placement = new THREE.Object3D();
    this.figures.forEach((figure, i) => {
      if (figure.inWater) { shadows.setMatrixAt(i, hiddenMatrix); return; }
      placement.position.copy(figure.root.position); placement.position.y -= .055;
      placement.rotation.set(-Math.PI / 2, 0, figure.root.rotation.y);
      placement.scale.set(['pilates', 'core', 'swimming', 'surfing'].includes(figure.id) ? 4.7 : 3.1, 1.9, 1);
      placement.updateMatrix(); shadows.setMatrixAt(i, placement.matrix);
    });
    this.world.scene.add(shadows);
  }

  isClearOfFigures(x, z, padding = 3.7) {
    return this.figures.every(figure => Math.hypot(x - figure.root.position.x, z - figure.root.position.z) > padding);
  }

  bindPointer() {
    const canvas = this.world.canvas;
    const setPointer = event => {
      const rect = canvas.getBoundingClientRect();
      this.pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    };
    canvas.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch') return;
      setPointer(event); this.pointerInside = true;
    });
    canvas.addEventListener('pointerleave', () => { this.pointerInside = false; this.hide(); });
    canvas.addEventListener('pointerdown', event => {
      this.down = { x: event.clientX, y: event.clientY };
      this.dragging = true; this.hide();
    });
    canvas.addEventListener('pointerup', event => {
      this.dragging = false;
      if (event.pointerType === 'touch' && this.down && Math.hypot(event.clientX - this.down.x, event.clientY - this.down.y) < 7) {
        setPointer(event); this.pointerInside = true; this.touchUntil = performance.now() + 1800; this.pick();
      }
      this.down = null;
    });
    canvas.addEventListener('pointercancel', () => { this.dragging = false; this.pointerInside = false; this.hide(); });
    document.addEventListener('keydown', event => { if (event.code === 'Escape') { this.pointerInside = false; this.hide(); } });
    document.addEventListener('visibilitychange', () => { if (document.hidden) { this.pointerInside = false; this.hide(); } });
    document.getElementById('route-link').addEventListener('click', () => { this.pointerInside = false; this.hide(); });
  }

  hide() {
    this.selected = null;
    this.tooltip.classList.remove('visible'); this.tooltip.setAttribute('aria-hidden', 'true');
    this.world.canvas.classList.remove('activity-hover');
  }

  pick() {
    if (this.world.runner?.active || !this.pointerInside || this.dragging) return this.hide();
    this.raycaster.setFromCamera(this.pointer, this.world.camera);
    const hit = this.raycaster.intersectObjects(this.batch.pickMeshes, false)[0];
    const figure = hit && hit.object.userData.figures[hit.instanceId]?.actor;
    if (!figure || !figure.visible) return this.hide();
    this.selected = figure;
    this.tooltip.textContent = figure.label;
    this.tooltip.classList.add('visible'); this.tooltip.setAttribute('aria-hidden', 'false');
    this.world.canvas.classList.add('activity-hover');
  }

  update(time, now) {
    const camera = this.world.renderPass?.camera || this.world.camera;
    this.projection.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    this.frustum.setFromProjectionMatrix(this.projection);
    for (const figure of this.figures) {
      this.bounds.center.copy(figure.root.position); this.bounds.center.y += 1.5;
      figure.visible = this.frustum.intersectsSphere(this.bounds);
      if (figure.visible) figure.update(time);
    }
    this.batch.update();
    // Raycast against moving limbs even when the mouse stays still.
    if (this.touchUntil && now > this.touchUntil) { this.touchUntil = 0; this.pointerInside = false; this.hide(); }
    if (now - (this.lastPick || 0) > 50) { this.pick(); this.lastPick = now; }
    if (this.selected) {
      const screen = this.selected.anchor.clone().project(camera);
      if (Math.abs(screen.x) > 1.05 || Math.abs(screen.y) > 1.05 || screen.z < -1 || screen.z > 1) return this.hide();
      const x = (screen.x * .5 + .5) * this.world.width, y = (-screen.y * .5 + .5) * this.world.height;
      const half = this.tooltip.offsetWidth / 2 + 10;
      this.tooltip.style.left = `${THREE.MathUtils.clamp(x, half, this.world.width - half)}px`;
      this.tooltip.style.top = `${THREE.MathUtils.clamp(y, 46, this.world.height - 24)}px`;
    }
  }
}
