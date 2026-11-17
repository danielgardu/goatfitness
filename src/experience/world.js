import * as THREE from 'three';
import { loadGoatAsset } from './goat-asset.js';
import { ActivityWorld } from './activities.js';
import { WaterActivityStages } from './activity-water-stages.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const stage = () => document.getElementById('experience');

const TAU = Math.PI * 2;
let seed = 8071;
const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const lerp = THREE.MathUtils.lerp;
const smooth = THREE.MathUtils.smoothstep;
const color = new THREE.Color();
const dummy = new THREE.Object3D();
const v = new THREE.Vector3();
const palette = ['#ffffff', '#d6efff', '#8be5ff', '#b9d1ff', '#ffffff', '#74d7ff', '#a5beff', '#ecfaff'];

export class AlpineWorld {
  constructor(canvas, onProgress) {
    this.canvas = canvas;
    this.onProgress = onProgress;
    this.progress = .115;
    this.distance = 0;
    this.time = 0;
    this.speed = 1;
    this.paused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.detail = false;
    this.detailBlend = 0;
    this.pointMats = [];
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#0846ff');
    this.scene.fog = new THREE.FogExp2('#0846ff', .006);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', alpha: false });
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.35 : 1.75));
    this.renderer.setClearColor('#0846ff');
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.13;
    this.camera = new THREE.OrthographicCamera(-40, 40, 25, -25, .1, 550);
    this.scene.add(new THREE.HemisphereLight('#bdc8c8', '#20221f', 2.1));
    const sun = new THREE.DirectionalLight('#c5ceca', 1.6);
    sun.position.set(-45, 70, -25);
    this.scene.add(sun);
    this.path = new THREE.CatmullRomCurve3([
      [-85,30],[-60,40],[-38,27],[-16,31],[8,48],[39,43],[65,20],[53,-9],[22,-17],[17,-39],[51,-56],[65,-82],[39,-94],[8,-76],[-14,-65],[-42,-76],[-73,-61],[-61,-33],[-88,-13],[-103,10],
    ].map(([x,z]) => new THREE.Vector3(x, .11, z)), true, 'centripetal');
    this.pathLength = this.path.getLength();
    this.samples = this.path.getSpacedPoints(1500);
    this.distance = this.progress * this.pathLength;
    this.startDistance = this.distance;
    this.waterStages = new WaterActivityStages(this);
    this.makeGround();
    this.makeTrack();
    this.waterStages.build();
    this.activities = new ActivityWorld(this);
    this.makeNature();
    this.makeGoat();
    this.makeParticles();
    this.makeAmbient();
    this.followTarget = new THREE.Vector3();
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = .09;
    this.controls.minPolarAngle = this.controls.maxPolarAngle = Math.atan2(50,28);
    this.controls.minZoom = .65;
    this.controls.maxZoom = 4.5;
    this.controls.screenSpacePanning = false;
    this.controls.rotateSpeed = .65;
    this.controls.zoomSpeed = .9;
    this.resetCamera();
    this.composer = new EffectComposer(this.renderer);
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);
    this.bloom = new UnrealBloomPass(new THREE.Vector2(1000, 700), .14, .35, .92);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());
    this.resize();
    this.last = performance.now();
    this.suspended = false;
    this.frame = this.frame.bind(this);
    this.frame();
  }

  suspend() {
    this.suspended = true;
  }

  resume() {
    if (this.destroyed) return;
    this.suspended = false;
    if (!this.raf) {
      this.last = performance.now();
      this.frame();
    }
  }

  destroy() {
    this.destroyed = true;
    this.suspended = true;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.controls?.dispose();
    this.composer?.dispose?.();
    this.renderer?.dispose();
  }

  nearestDistance(x, z) {
    let min = 1e9;
    for (let i = 0; i < this.samples.length; i += 5) {
      const p = this.samples[i];
      const d = (x-p.x)**2 + (z-p.z)**2;
      if (d < min) min = d;
    }
    return Math.sqrt(min);
  }

  makeGround() {
    this.peaks = [];
    for (let i=0; i<120; i++) {
      const x = random()*270-135, z = random()*250-140;
      if (this.nearestDistance(x,z) > 11 && this.waterStages.isClear(x,z,3)) this.peaks.push({x,z,h:5+random()*19,r:6+random()*12});
    }
    const geo = new THREE.PlaneGeometry(330, 310, 220, 207);
    geo.rotateX(-Math.PI/2);
    const a = geo.attributes.position;
    const colors = new Float32Array(a.count*3);
    this.heightAt = (x,z,d) => {
      if (d === undefined) d = this.nearestDistance(x,z);
      let h = 0;
      for (const p of this.peaks) {
        const r = Math.sqrt((x-p.x)**2 + (z-p.z)**2)/p.r;
        if(r<2.5) h = Math.max(h, p.h*Math.exp(-r*r*1.3));
      }
      const n = Math.sin(x*1.3+z*.7)*.5+Math.sin(z*1.7-x*.9)*.3+Math.sin(x*3.2+z*2.1)*.2;
      const height = Math.min(Math.max(0,(h*(.8+n*.2)+n*.6)*smooth(d,6.6,17)),Math.max(0,(d-6)*.56));
      return this.waterStages.heightAt(x,z,height);
    };
    for (let i=0; i<a.count; i++) {
      const x=a.getX(i), z=a.getZ(i), d=this.nearestDistance(x,z);
      const h=this.heightAt(x,z,d);
      a.setY(i,h-.06);
      const n=random();
      color.set(h>12?'#3878ff':h>6?'#1a5bff':'#0846ff');
      color.multiplyScalar(.9+n*.15+(h/70));
      if (d < 7) color.set('#0846ff');
      colors.set([color.r,color.g,color.b],i*3);
    }
    geo.setAttribute('color',new THREE.BufferAttribute(colors,3));
    geo.computeVertexNormals();
    const terrain = new THREE.Mesh(geo,new THREE.MeshBasicMaterial({vertexColors:true}));
    this.waterStages.maskTerrain(terrain.material);
    this.scene.add(terrain);
    const edgeGeo = new THREE.WireframeGeometry(geo);
    const edges = new THREE.LineSegments(edgeGeo,new THREE.LineBasicMaterial({color:'#8cbdff',transparent:true,opacity:.035}));
    edges.position.y=.018;
    this.scene.add(edges);
    // Pale contours give the blue terrain a drawn, topographic finish.
    const contourVerts=[];
    const pos = geo.attributes.position;
    const idx = geo.index.array;
    for(let level=3;level<26;level+=2.6){
      for(let k=0;k<idx.length;k+=3){
        const points=[];
        for(let j=0;j<3;j++){
          const ia=idx[k+j],ib=idx[k+(j+1)%3],ya=pos.getY(ia),yb=pos.getY(ib);
          if((ya<level && yb>=level)||(yb<level && ya>=level)){
            const t=(level-ya)/(yb-ya);
            points.push(lerp(pos.getX(ia),pos.getX(ib),t),level+.035,lerp(pos.getZ(ia),pos.getZ(ib),t));
          }
        }
        if(points.length===6)contourVerts.push(...points);
      }
    }
    const cg=new THREE.BufferGeometry();cg.setAttribute('position',new THREE.Float32BufferAttribute(contourVerts,3));
    this.scene.add(new THREE.LineSegments(cg,new THREE.LineBasicMaterial({color:'#b8dfff',transparent:true,opacity:.18})));
  }

  makeTrack() {
    // A continuous ink ribbon is revealed only where the goat has already run.
    const count=2400,positions=[],uvs=[],distances=[],indices=[];
    for(let i=0;i<=count;i++){
      const t=i/count,p=this.path.getPointAt(t),d=this.path.getTangentAt(t);
      const normal=new THREE.Vector3(-d.z,0,d.x);
      for(const side of [-1,1]){
        const point=p.clone().addScaledVector(normal,side*1.45);
        positions.push(point.x,.025,point.z);
        uvs.push(t,side*.5+.5);distances.push(t*this.pathLength);
      }
      if(i<count){const j=i*2;indices.push(j,j+2,j+1,j+1,j+2,j+3);}
    }
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
    geometry.setAttribute('aDistance',new THREE.Float32BufferAttribute(distances,1));
    geometry.setIndex(indices);
    this.trackUniforms={uDistance:{value:this.distance},uStart:{value:this.startDistance},uLength:{value:this.pathLength}};
    const material=new THREE.ShaderMaterial({
      uniforms:this.trackUniforms,transparent:true,depthWrite:false,side:THREE.DoubleSide,
      vertexShader:`attribute float aDistance;varying vec2 vUv;varying float vDistance;
        void main(){vUv=uv;vDistance=aDistance;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader:`uniform float uDistance;uniform float uStart;uniform float uLength;
        varying vec2 vUv;varying float vDistance;
        void main(){
          float age=mod(uDistance-vDistance+uLength,uLength);
          float travelled=uDistance-uStart;
          if(age>min(travelled,65.)||age<1.1)discard;
          float across=abs(vUv.y-.5)*2.;
          float edge=.88+.055*sin(vDistance*3.7)+.035*sin(vDistance*9.1);
          float stroke=1.-smoothstep(edge-.09,edge,across);
          float fade=(1.-smoothstep(35.,65.,age))*smoothstep(1.1,3.,age);
          float threads=.78+.22*sin(vUv.y*94.+sin(vDistance*2.)*.7);
          vec3 ink=mix(vec3(.22,.62,1.),vec3(.78,.93,1.),pow(1.-across,2.));
          gl_FragColor=vec4(ink,stroke*fade*threads*.68);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    });
    this.scene.add(new THREE.Mesh(geometry,material));
  }

  makeNature(){
    const trees=[];
    for(let i=0;i<1500;i++){
      const x=random()*260-130,z=random()*240-125,d=this.nearestDistance(x,z);
      if(d<8||d>40||!this.activities.isClearOfFigures(x,z)||!this.waterStages.isClear(x,z,2))continue;
      const h=this.heightAt(x,z,d);if(h>7)continue;
      trees.push({x,z,y:h,s:.75+random()*1.2});
    }
    const geo=new THREE.ConeGeometry(.68,2.3,5,1);
    const mat=new THREE.MeshToonMaterial({color:'#1453ef'});
    const mesh=new THREE.InstancedMesh(geo,mat,trees.length*3);
    const trunks=new THREE.InstancedMesh(new THREE.CylinderGeometry(.075,.13,1.25,4),new THREE.MeshToonMaterial({color:'#164ad6'}),trees.length);
    let n=0;
    trees.forEach((t,i)=>{
      for(let j=0;j<3;j++){
        dummy.position.set(t.x,t.y+1.25*t.s+j*.55*t.s,t.z);dummy.scale.setScalar(t.s*(1-j*.19));dummy.rotation.set(0,random()*TAU,0);dummy.updateMatrix();mesh.setMatrixAt(n++,dummy.matrix);
      }
      dummy.position.set(t.x,t.y+.6*t.s,t.z);dummy.scale.setScalar(t.s);dummy.updateMatrix();trunks.setMatrixAt(i,dummy.matrix);
    });
    this.scene.add(mesh,trunks);
    const rocks=[];
    for(let i=0;i<750;i++){
      const x=random()*265-135,z=random()*250-135,d=this.nearestDistance(x,z);if(d<5.4||!this.activities.isClearOfFigures(x,z)||!this.waterStages.isClear(x,z,1))continue;
      rocks.push({x,z,y:this.heightAt(x,z,d)});
    }
    const rock=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1,0),new THREE.MeshToonMaterial({color:'#397bff'}),rocks.length);
    rocks.forEach((p,i)=>{dummy.position.set(p.x,p.y+.15,p.z);dummy.rotation.set(random(),random()*TAU,random());dummy.scale.set(.2+random()*.8,.2+random()*.4,.3+random()*.6);dummy.updateMatrix();rock.setMatrixAt(i,dummy.matrix);});
    this.scene.add(rock);
  }

  pointMaterial(size=.048,opacity=.9){
    const material = new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uScale:{value:17},uSize:{value:size},uOpacity:{value:opacity},uPixelRatio:{value:Math.min(devicePixelRatio,1.75)}},vertexShader:`attribute vec3 color;varying vec3 vColor;uniform float uSize;uniform float uPixelRatio;uniform float uScale;void main(){vColor=color;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=max(.38,uSize*uPixelRatio*uScale);}`,fragmentShader:`varying vec3 vColor;uniform float uOpacity;void main(){float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;float a=exp(-d*d*3.5)*uOpacity;gl_FragColor=vec4(vColor,a);}`});
    this.pointMats.push(material);return material;
  }

  makeGoat(){
    this.goat=new THREE.Group();this.scene.add(this.goat);
    const shadowCanvas=document.createElement('canvas');shadowCanvas.width=128;shadowCanvas.height=64;
    const context=shadowCanvas.getContext('2d'),gradient=context.createRadialGradient(64,32,0,64,32,60);gradient.addColorStop(0,'rgba(0,0,0,.65)');gradient.addColorStop(1,'rgba(0,0,0,0)');context.fillStyle=gradient;context.fillRect(0,0,128,64);
    this.shadow=new THREE.Mesh(new THREE.PlaneGeometry(6,2.8),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));this.shadow.rotation.x=-Math.PI/2;this.scene.add(this.shadow);
    this.hoofLight=new THREE.PointLight('#649bcd',1,9,2);this.scene.add(this.hoofLight);
    this.goatKey=new THREE.PointLight('#bdd7e1',38,19,2);this.scene.add(this.goatKey);
    this.goatReady=loadGoatAsset(this).catch(error=>{console.error('Goat model could not load',error);document.documentElement.dataset.goatModel='error';throw error;});
  }

  makeParticles(){
    this.particleCount=4200;
    this.particlePositions=new Float32Array(this.particleCount*3);
    const colors=new Float32Array(this.particleCount*3),ages=new Float32Array(this.particleCount);
    this.particles=[];
    for(let i=0;i<this.particleCount;i++){
      color.set(palette[random()<.78?Math.floor(random()*4):4+Math.floor(random()*4)]);colors.set([color.r,color.g,color.b],i*3);
      ages[i]=0;this.particles.push({age:10,life:.8+random()*2.5,velocity:new THREE.Vector3()});this.particlePositions[i*3+1]=-100;
    }
    this.trailGeometry=new THREE.BufferGeometry();this.trailGeometry.setAttribute('position',new THREE.BufferAttribute(this.particlePositions,3));this.trailGeometry.setAttribute('color',new THREE.BufferAttribute(colors,3));this.trailGeometry.setAttribute('aAge',new THREE.BufferAttribute(ages,1));
    const mat=this.pointMaterial(.047,.6);
    mat.vertexShader=mat.vertexShader.replace('attribute vec3 color;','attribute vec3 color; attribute float aAge; varying float vAge;').replace('vColor=color;','vColor=color; vAge=aAge;');
    mat.fragmentShader=mat.fragmentShader.replace('varying vec3 vColor;','varying vec3 vColor; varying float vAge;').replace('exp(-d*d*3.5)*uOpacity','exp(-d*d*3.5)*uOpacity*pow(max(0.,1.-vAge),1.3)');
    this.trail=new THREE.Points(this.trailGeometry,mat);this.trail.frustumCulled=false;this.scene.add(this.trail);this.particleCursor=0;this.spawnDebt=0;
    // Long-exposure filaments stay attached to the path through turns.
    this.ribbons=[];
    for(let i=0;i<6;i++){
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(85*3),3));geo.setAttribute('color',new THREE.BufferAttribute(new Float32Array(85*3),3));
      const line=new THREE.Line(geo,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.07,blending:THREE.AdditiveBlending,depthWrite:false}));line.frustumCulled=false;this.scene.add(line);this.ribbons.push({line,phase:random()*TAU,offset:(random()-.5)*.9,length:8+random()*15,color:new THREE.Color(palette[i%palette.length])});
    }
  }

  makeAmbient(){
    const pos=[],cols=[];
    for(let i=0;i<450;i++){
      pos.push(random()*250-125,1+random()*20,random()*240-130);color.set(random()>.6?'#ffffff':'#a4dcff').multiplyScalar(.4+random()*.4);cols.push(color.r,color.g,color.b);
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));this.ambient=new THREE.Points(g,this.pointMaterial(.055,.35));this.scene.add(this.ambient);
  }

  resetCamera(){
    this.viewingWaterActivity = false;
    stage().classList.remove('water-activity-view');
    const p=this.path.getPointAt(this.progress),d=this.path.getTangentAt(this.progress);
    const target=p.clone().add(new THREE.Vector3(0,1.7,0));
    const offset=new THREE.Vector3(-d.z*50,28,d.x*50);
    this.controls.target.copy(target);
    this.followTarget.copy(target);
    this.camera.position.copy(target).add(offset);
    this.camera.zoom=1;this.camera.updateProjectionMatrix();
    // Clear any remaining gesture damping before establishing the new view.
    const damping=this.controls.enableDamping;
    this.controls.enableDamping=false;this.controls.update();this.controls.enableDamping=damping;
  }

  zoomCamera(factor){
    this.camera.zoom=THREE.MathUtils.clamp(this.camera.zoom*factor,this.controls.minZoom,this.controls.maxZoom);
    this.camera.updateProjectionMatrix();
  }

  showWaterActivity(id='swimming'){
    this.viewingWaterActivity = true; this.detail = false;
    this.waterActivityId = id;
    stage().classList.add('water-activity-view');
    const {target,offset} = this.waterStages.cameraFor(id);
    this.activityFrustumHeight=this.waterStages.cameraFor(id).height;
    this.controls.target.copy(target); this.camera.position.copy(target).add(offset);
    this.camera.zoom = 1; this.camera.updateProjectionMatrix();
    const damping = this.controls.enableDamping;
    this.controls.enableDamping = false; this.controls.update(); this.controls.enableDamping = damping;
  }

  showActivity(id){
    if(id==='swimming'||id==='surfing')return this.showWaterActivity(id);
    const figure=this.activities.figures.find(figure=>figure.id===id);
    if(!figure)return;
    this.viewingWaterActivity=true;this.detail=false;this.activityFrustumHeight=10;
    stage().classList.add('water-activity-view');
    const target=figure.root.position.clone().add(new THREE.Vector3(0,2.1,0));
    const offset=new THREE.Vector3(16,20,35).applyAxisAngle(new THREE.Vector3(0,1,0),figure.root.rotation.y);
    this.controls.target.copy(target);this.camera.position.copy(target).add(offset);
    this.camera.zoom=1;this.camera.updateProjectionMatrix();
    const damping=this.controls.enableDamping;this.controls.enableDamping=false;this.controls.update();this.controls.enableDamping=damping;
  }

  resize(){
    const w=this.canvas.clientWidth,h=this.canvas.clientHeight;
    if (w < 2 || h < 2) return;
    this.width=w;this.height=h;this.aspect=w/h;
    this.renderer.setSize(w,h,false);this.composer.setSize(w,h);this.setFrustum();
  }

  setFrustum(){
    const mobile=this.width<600;
    const height=this.viewingWaterActivity?this.activityFrustumHeight:lerp(mobile?28:25,mobile?18:15,this.detailBlend);
    this.camera.left=-height*this.aspect/2;this.camera.right=height*this.aspect/2;this.camera.top=height/2;this.camera.bottom=-height/2;this.camera.updateProjectionMatrix();
    for(const material of this.pointMats)material.uniforms.uScale.value=this.height*this.camera.zoom/height;
  }

  updateGoat(dt){
    this.assetGoat?.update(dt);
  }

  updateParticles(dt,p,dir){
    if(!this.assetGoat)return;
    this.spawnDebt+=dt*1050;
    while(this.spawnDebt>1){
      this.spawnDebt--;
      const i=this.particleCursor++%this.particleCount,item=this.particles[i];item.age=0;item.life=.9+random()*2.2;
      const local=new THREE.Vector3();
      this.assetGoat.sampleDust(local);
      this.particlePositions.set([local.x,local.y,local.z],i*3);
      item.velocity.set(-dir.x*(.6+random()*2)+(random()-.5),random()*1.1,-dir.z*(.6+random()*2)+(random()-.5));
      if(random()<.2){this.particlePositions[i*3+1]=.2;item.velocity.y=.5+random()*1.5;}
    }
    const ages=this.trailGeometry.attributes.aAge.array;
    for(let i=0;i<this.particleCount;i++){
      const item=this.particles[i];item.age+=dt;
      ages[i]=Math.min(1,item.age/item.life);
      if(ages[i]>=1)continue;
      this.particlePositions[i*3]+=item.velocity.x*dt;
      this.particlePositions[i*3+1]+=item.velocity.y*dt;
      this.particlePositions[i*3+2]+=item.velocity.z*dt;
      item.velocity.y-=dt*.33;
      if(this.particlePositions[i*3+1]<.1)this.particlePositions[i*3+1]=.1;
    }
    this.trailGeometry.attributes.position.needsUpdate=true;this.trailGeometry.attributes.aAge.needsUpdate=true;
    for(const rib of this.ribbons){
      const positions=rib.line.geometry.attributes.position.array,colors=rib.line.geometry.attributes.color.array;
      for(let j=0;j<85;j++){
        const a=j/84;
        const t=((this.distance-a*rib.length-1)/this.pathLength+1)%1;
        const p=this.path.getPointAt(t),d=this.path.getTangentAt(t);
        const wave=Math.sin(a*10-this.time*4+rib.phase)*(.04+a*.18);
        p.x+=-d.z*(rib.offset+wave);p.z+=d.x*(rib.offset+wave);
        p.y=(2.5+Math.sin(rib.phase)*.55)*(1-a*.23)+wave;
        positions.set([p.x,p.y,p.z],j*3);const fade=(1-a)**1.8;
        colors.set([rib.color.r*fade,rib.color.g*fade,rib.color.b*fade],j*3);
      }
      rib.line.geometry.attributes.position.needsUpdate=true;rib.line.geometry.attributes.color.needsUpdate=true;
    }
  }

  frame(now=performance.now()){
    if (this.suspended || this.destroyed) {
      this.raf = 0;
      this.last = now;
      return;
    }
    this.raf=requestAnimationFrame(this.frame);
    const realDt=Math.min((now-this.last)/1000,.045);this.last=now;
    const advance=this.runner?.tick(realDt)??null;
    const dt=advance===null?(this.paused?0:realDt*this.speed):advance/(this.travelSpeed||5.4);
    this.time+=dt;this.distance+=advance===null?dt*(this.travelSpeed||5.4):advance;
    this.progress=(this.distance/this.pathLength)%1;
    const p=this.path.getPointAt(this.progress),d=this.path.getTangentAt(this.progress);
    this.goat.position.copy(p);this.goat.rotation.y=-Math.atan2(d.z,d.x);
    if(this.runner?.active)this.runner.placeGoat(p,d,realDt);
    if(dt>0){this.updateGoat(dt);this.updateParticles(dt,p,d);}
    this.shadow.position.set(this.goat.position.x,.075,this.goat.position.z);this.shadow.rotation.z=this.goat.rotation.y;
    const shadowScale=1-(this.runner?.active?this.runner.state.height*.13:0);this.shadow.scale.setScalar(shadowScale);
    this.shadow.material.opacity=shadowScale;
    this.hoofLight.position.copy(this.goat.position).add(new THREE.Vector3(0,1.2,0));
    this.goatKey.position.copy(this.goat.position).add(new THREE.Vector3(-d.z*4-d.x*1.5,5.5,d.x*4-d.z*1.5));
    this.trackUniforms.uDistance.value=this.distance;
    const blend=1-Math.exp(-realDt*3.);
    this.detailBlend=lerp(this.detailBlend,this.detail?1:0,blend);
    this.setFrustum();
    // Translate the orbit with the subject, preserving the user's angle, pan, and zoom.
    if (!this.viewingWaterActivity) {
    const right=new THREE.Vector3().subVectors(this.camera.position,this.controls.target);
    right.set(right.z,0,-right.x).normalize();
    const span=(this.camera.right-this.camera.left)/this.camera.zoom;
    const target=p.clone().add(new THREE.Vector3(0,1.7,0));
    target.addScaledVector(right,-span*.12*(1-this.detailBlend));
    const previous=this.followTarget.clone();
    this.followTarget.lerp(target,1-Math.exp(-realDt*8));
    const movement=this.followTarget.clone().sub(previous);
    this.controls.target.add(movement);this.camera.position.add(movement);
    }
    if(this.controls.enabled)this.controls.update();
    this.waterStages.update(this.time);
    this.activities.update(this.time, now);
    this.composer.render();
    if(this.onProgress && now-(this.lastUI||0)>80){
      const screen=p.clone().add(new THREE.Vector3(0,4.6,0)).project(this.renderPass.camera);
      this.onProgress({progress:this.progress,lap:Math.floor(this.distance/this.pathLength)+1,x:(screen.x*.5+.5)*this.width,y:(-.5*screen.y+.5)*this.height});this.lastUI=now;
    }
    window.__goatDebug={progress:this.progress,paused:this.paused,drawCalls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles,particles:this.renderer.info.render.points,renderer:'Three.js / WebGL2',gait:this.gaitMetrics,camera:this.renderPass.camera.position.toArray(),runner:this.runner?{phase:this.runner.state.phase,distance:this.runner.state.distance,lateral:this.runner.state.lateral,height:this.runner.state.height,cleared:this.runner.state.cleared,paused:this.runner.state.paused}:null};
  }
}
