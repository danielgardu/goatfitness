import * as THREE from 'three';
import { createCelMaterial, createHullMaterial } from './cel-shading.js';

// Two roadside sport illustrations: a small surf splash and one corner of
// a full-size competition pool. The rest of the map remains dry ground.
export class WaterActivityStages {
  constructor(world) {
    this.world = world;
    this.surface = .08;
    const frame = progress => {
      const point=world.path.getPointAt(progress), tangent=world.path.getTangentAt(progress);
      return { progress, point, tangent, normal:new THREE.Vector3(-tangent.z,0,tangent.x),
        rotation:-Math.atan2(tangent.z,tangent.x) };
    };
    this.pool = { ...frame(.6), length:50, width:25 };
    this.pool.corner = this.pool.point.clone().addScaledVector(this.pool.tangent,4).addScaledVector(this.pool.normal,9.5);
    this.pool.center = this.pool.corner.clone().addScaledVector(this.pool.tangent,-25).addScaledVector(this.pool.normal,12.5);
    this.pool.center.y=0;
    this.wave = { ...frame(.625), length:10, width:6 };
    this.wave.center=this.wave.point.clone().addScaledVector(this.wave.normal,-11.5);
    this.wave.center.y=0;
    // Turn the open face towards the normal follow camera as the goat passes.
    const waveDirection=this.wave.normal.clone();
    this.wave.normal=this.wave.tangent.clone().negate();
    this.wave.tangent=waveDirection;
    this.wave.rotation=-Math.atan2(waveDirection.z,waveDirection.x);
  }

  coordinates(area,x,z) {
    const dx=x-area.center.x, dz=z-area.center.z;
    return {x:dx*area.tangent.x+dz*area.tangent.z,z:dx*area.normal.x+dz*area.normal.z};
  }

  isClear(x,z,padding=0) {
    return [this.pool,this.wave].every(area=>{
      const p=this.coordinates(area,x,z);
      return Math.abs(p.x)>area.length/2+1.2+padding || Math.abs(p.z)>area.width/2+1.2+padding;
    });
  }

  heightAt(x,z,original) {
    const p=this.coordinates(this.pool,x,z);
    const outside=Math.max(Math.abs(p.x)-25,Math.abs(p.z)-12.5);
    if(outside<-.05)return -2.25;
    const ground=outside<3?THREE.MathUtils.lerp(0,original,THREE.MathUtils.smoothstep(outside,1.3,3)):original;
    const w=this.coordinates(this.wave,x,z);
    const edge=Math.max(Math.abs(w.x)-4,Math.abs(w.z)-3);
    return edge<11?Math.min(ground,THREE.MathUtils.lerp(0,original,THREE.MathUtils.smoothstep(edge,4,11))):ground;
  }

  maskTerrain(material) {
    // The landscape grid is much coarser than the pool rim. Clip its fragments
    // at the inner walls so sloping ground triangles cannot pierce the water.
    material.onBeforeCompile=shader=>{
      shader.uniforms.uPoolCenter={value:new THREE.Vector2(this.pool.center.x,this.pool.center.z)};
      shader.uniforms.uPoolTangent={value:new THREE.Vector2(this.pool.tangent.x,this.pool.tangent.z)};
      shader.uniforms.uPoolNormal={value:new THREE.Vector2(this.pool.normal.x,this.pool.normal.z)};
      shader.vertexShader='varying vec2 vTerrainXZ;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',
        '#include <begin_vertex>\nvTerrainXZ=(modelMatrix*vec4(transformed,1.)).xz;');
      shader.fragmentShader='varying vec2 vTerrainXZ;uniform vec2 uPoolCenter;uniform vec2 uPoolTangent;uniform vec2 uPoolNormal;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>',
        '#include <clipping_planes_fragment>\nvec2 poolDelta=vTerrainXZ-uPoolCenter;\nif(abs(dot(poolDelta,uPoolTangent))<25.3 && abs(dot(poolDelta,uPoolNormal))<12.8)discard;');
    };
    material.customProgramCacheKey=()=> 'terrain-with-pool-opening-v1';
  }

  localPoint(area,x,y,z) {
    const point=area.center.clone().addScaledVector(area.tangent,x).addScaledVector(area.normal,z);
    point.y=y;return point;
  }

  stationFor(id) {
    if(id==='swimming')return {
      position:this.localPoint(this.pool,19,this.surface-.78*1.35,-11.25),
      rotation:this.pool.rotation,progress:this.pool.progress,
    };
    if(id==='surfing')return {
      position:this.localPoint(this.wave,0,.22-.12*1.35,0),
      rotation:this.wave.rotation,progress:this.wave.progress,
    };
    return null;
  }

  cameraFor(id) {
    const area=id==='surfing'?this.wave:this.pool;
    const target=id==='surfing'?area.center.clone():area.corner.clone()
      .addScaledVector(area.tangent,-6).addScaledVector(area.normal,-8);
    target.y=id==='surfing'?1.8:1.2;
    const offset=area.normal.clone().multiplyScalar(id==='surfing'?-28:50).addScaledVector(area.tangent,id==='surfing'?48:5);
    offset.y=28;
    return {target,offset,height:id==='surfing'?17:25};
  }

  build() {
    this.group=new THREE.Group();
    this.white=createCelMaterial();
    this.blue=createCelMaterial({color:'#168bff'});
    this.hull=createHullMaterial(1.8);
    this.buildPool();this.buildWave();
    this.world.scene.add(this.group);
  }

  outlined(geometry,material,parent) {
    const mesh=new THREE.Mesh(geometry,material),outline=new THREE.Mesh(geometry,this.hull);
    outline.onBeforeRender=renderer=>this.hull.userData.updateViewport(renderer);
    mesh.add(outline);parent.add(mesh);return mesh;
  }

  buildPool() {
    const pool=new THREE.Group();pool.position.copy(this.pool.center);pool.rotation.y=this.pool.rotation;
    this.group.add(pool);
    const box=(size,position,material=this.white)=>{
      const mesh=this.outlined(new THREE.BoxGeometry(...size),material,pool);mesh.position.set(...position);return mesh;
    };
    box([51.8,.25,26.8],[0,-2.35,0],this.blue);
    box([50,.1,25],[0,-2.14,0],createCelMaterial({color:'#8ad5ef'}));
    // White vertical walls and broad coping conceal the cut in the terrain.
    for(const z of [-12.8,12.8])box([51.2,2.55,.6],[0,-.93,z]);
    for(const x of [-25.3,25.3])box([.6,2.55,25],[x,-.93,0]);
    for(const z of [-12.85,12.85])box([51.8,.18,1.1],[0,.36,z]);
    for(const x of [-25.35,25.35])box([1.1,.18,25.1],[x,.36,0]);

    const lines=[],tiles=[];
    for(let lane=0;lane<10;lane++) {
      const z=-11.25+lane*2.5;
      lines.push(-23,-2.07,z,23,-2.07,z);
      for(const x of [-23,23])lines.push(x,-2.07,z-.65,x,-2.07,z+.65);
      box([.45,.55,.4],[26.2,.65,z]);
      const platform=box([1.05,.16,.9],[26.25,.99,z],this.blue);platform.rotation.z=-.1;
    }
    for(let x=-25;x<=25;x+=2.5)tiles.push(x,-2.075,-12.5,x,-2.075,12.5);
    for(let z=-12.5;z<=12.5;z+=2.5)tiles.push(-25,-2.075,z,25,-2.075,z);
    const lineMesh=(positions,color,opacity)=>{
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
      pool.add(new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({color,transparent:true,opacity})));
    };
    lineMesh(lines,'#063671',.9);lineMesh(tiles,'#2b8dc4',.28);

    // Floating lane dividers, with red end markers like a competition pool.
    const floats=new THREE.InstancedMesh(new THREE.CylinderGeometry(.075,.075,.3,6),this.white,9*111);
    const dummy=new THREE.Object3D();let index=0;
    for(let lane=1;lane<10;lane++)for(let j=0;j<111;j++) {
      const x=-24.75+j*.45;
      dummy.position.set(x,this.surface+.025,-12.5+lane*2.5);dummy.rotation.z=Math.PI/2;dummy.updateMatrix();
      floats.setMatrixAt(index,dummy.matrix);
      floats.setColorAt(index++,new THREE.Color(Math.abs(x)>20?'#ef526b':j%2?'#f3fbff':'#1289ff'));
    }
    pool.add(floats);

    this.uniforms={uTime:{value:0}};
    const waterGeometry=new THREE.PlaneGeometry(50,25);waterGeometry.rotateX(-Math.PI/2);
    const water=new THREE.Mesh(waterGeometry,new THREE.ShaderMaterial({
      uniforms:this.uniforms,transparent:true,depthWrite:false,side:THREE.DoubleSide,
      vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader:`uniform float uTime;varying vec2 vUv;void main(){
        float ripple=sin(vUv.x*180.+sin(vUv.y*73.)-uTime)*sin(vUv.y*110.+uTime*.65);
        float glint=smoothstep(.87,.98,ripple);
        vec3 water=mix(vec3(.018,.4,.73),vec3(.5,.89,1.),glint*.4);
        gl_FragColor=vec4(water,.38);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    }));
    water.position.y=this.surface;water.renderOrder=2;pool.add(water);
    this.poolGroup=pool;
  }

  buildWave() {
    const patch=new THREE.Group();patch.position.copy(this.wave.center);patch.rotation.y=this.wave.rotation;
    this.group.add(patch);
    const edge=new THREE.CatmullRomCurve3([
      [-4.1,-1],[-3.1,-1.7],[-1.7,-1.55],[-.8,-2],[1.4,-1.7],[3.6,-.85],
      [4,-.1],[3,.65],[2,1.45],[.4,1.8],[-1,1.5],[-2.8,1.8],[-3.4,.6],[-4.5,.2],
    ].map(([x,z])=>new THREE.Vector3(x,0,z)),true,'centripetal');
    const points=edge.getPoints(160),shape=new THREE.Shape(points.map(p=>new THREE.Vector2(p.x,-p.z)));
    const geometry=new THREE.ShapeGeometry(shape);geometry.rotateX(-Math.PI/2);
    const positions=geometry.attributes.position;
    for(let i=0;i<positions.count;i++)positions.setY(i,.12+.018*Math.sin(positions.getX(i)*1.5)*Math.cos(positions.getZ(i)*2));
    geometry.computeVertexNormals();this.outlined(geometry,this.blue,patch);
    this.surfRipples=[];
    for(const z of [-1.2,-.82,.9,1.3]){
      const points=Array.from({length:25},(_,i)=>new THREE.Vector3(-2.8+i/24*5.4,.17,z+.12*Math.sin(i/24*Math.PI*2)));
      const ripple=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),40,.022,4,false),
        new THREE.MeshBasicMaterial({color:'#bceeff',transparent:true,opacity:.6}));
      patch.add(ripple);this.surfRipples.push(ripple);
    }
    this.waveGroup=patch;
  }

  update(time) {
    this.uniforms.uTime.value=time;
    this.surfRipples.forEach((ripple,i)=>{ripple.position.x=.1*Math.sin(time*1.5+i);ripple.material.opacity=.45+.15*Math.sin(time+i);});
  }
}
