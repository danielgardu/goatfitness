import * as THREE from 'three';
import { createCelMaterial, createHullMaterial } from './cel-shading.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const dustPalette=['#449fff','#81d4ff','#5484df','#b2caff','#f5ac65','#efc48c'];

function applyToonCoat(mesh){
  // Preserve the eyes while replacing the photographic fur with solid white.
  const {skinIndex,skinWeight,position}=mesh.geometry.attributes;
  const colors=new Float32Array(position.count*3),eyeColor=new THREE.Color('#102f68');
  for(let i=0;i<position.count;i++){
    let eyeWeight=0;
    for(let j=0;j<4;j++)if(/^eye/.test(mesh.skeleton.bones[skinIndex.getComponent(i,j)]?.name||''))eyeWeight+=skinWeight.getComponent(i,j);
    const ink=THREE.MathUtils.smoothstep(eyeWeight,.35,.8);
    colors.set([THREE.MathUtils.lerp(1,eyeColor.r,ink),THREE.MathUtils.lerp(1,eyeColor.g,ink),THREE.MathUtils.lerp(1,eyeColor.b,ink)],i*3);
  }
  mesh.geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
  const coat=createCelMaterial({vertexColors:true,side:THREE.FrontSide});
  coat.name='White cel-shaded coat';
  mesh.material=coat;
  const outlineMaterial=createHullMaterial(3.2);
  outlineMaterial.name='Electric blue inverted hull';
  // A sibling shares the exact skin, skeleton, bind matrices, and morphs of the goat.
  const outline=mesh.clone(false);
  outline.name='goat_blue_outline';outline.material=outlineMaterial;outline.frustumCulled=false;
  outline.morphTargetInfluences=mesh.morphTargetInfluences;
  outline.onBeforeRender=renderer=>{
    outlineMaterial.userData.updateViewport(renderer);
  };
  mesh.parent.add(outline);
  return outline;
}

export async function loadGoatAsset(world){
  const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const gltf=await loader.loadAsync('/models/goat.glb');
  const content=gltf.scene,orientation=new THREE.Group();orientation.add(content);world.goat.add(orientation);
  orientation.rotation.y=Math.PI/2;
  const mesh=content.getObjectByName('goat');
  const lod=content.getObjectByName('goat_lod');if(lod)lod.visible=false;
  if(!mesh?.isSkinnedMesh)throw new Error('The goat asset needs its animated skin.');
  const skeleton=mesh.skeleton;
  // Keep the curved horn target confined to its own vertices.
  const skinIndex=mesh.geometry.attributes.skinIndex,skinWeight=mesh.geometry.attributes.skinWeight;
  const morph=mesh.geometry.morphAttributes.position?.[0];
  const morphNormal=mesh.geometry.morphAttributes.normal?.[0];
  if(morph){
    for(let i=0;i<morph.count;i++){
      let weight=0;
      for(let j=0;j<4;j++){const bone=skeleton.bones[skinIndex.getComponent(i,j)];if(bone&&/^horn/.test(bone.name))weight+=skinWeight.getComponent(i,j);}
      morph.setXYZ(i,morph.getX(i)*weight,morph.getY(i)*weight,morph.getZ(i)*weight);
      if(morphNormal)morphNormal.setXYZ(i,morphNormal.getX(i)*weight,morphNormal.getY(i)*weight,morphNormal.getZ(i)*weight);
    }
    mesh.morphTargetInfluences[0]=1;
  }
  const bones=Object.fromEntries(skeleton.bones.map(b=>[b.name,b]));
  bones.udder?.scale.setScalar(.015);
  const mixer=new THREE.AnimationMixer(content);
  const clip=gltf.animations.find(c=>c.name==='run');
  if(!clip)throw new Error('The goat asset has no run animation.');
  const action=mixer.clipAction(clip);action.play();action.time=.14;mixer.update(0);
  content.updateMatrixWorld(true);
  const savedPosition=world.goat.position.clone(),savedRotation=world.goat.quaternion.clone();
  world.goat.position.set(0,0,0);world.goat.quaternion.identity();world.goat.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(orientation,true),size=bounds.getSize(V()),center=bounds.getCenter(V());
  const scale=5.35/size.x;
  orientation.scale.setScalar(scale);
  orientation.position.set(-center.x*scale,.01,-center.z*scale);
  world.goat.position.copy(savedPosition);world.goat.quaternion.copy(savedRotation);
  orientation.updateMatrixWorld(true);
  const outline=applyToonCoat(mesh);
  mesh.frustumCulled=false;
  const rearVertices=[];
  const position=mesh.geometry.attributes.position;
  // The asset faces +Z before its placement rotation.
  for(let i=0;i<position.count;i++)if(position.getZ(i)<.02&&position.getY(i)>.3)rearVertices.push(i);
  const count=1100,indices=new Uint32Array(count),positions=new Float32Array(count*3),colors=new Float32Array(count*3);
  const color=new THREE.Color();
  for(let i=0;i<count;i++){
    let candidate,accept=false;
    while(!accept){
      candidate=Math.floor(Math.random()*position.count);let headWeight=0;
      for(let j=0;j<4;j++){const name=skeleton.bones[skinIndex.getComponent(candidate,j)]?.name||'';if(/head|ear|horn|eye|jaw|beard/.test(name))headWeight+=skinWeight.getComponent(candidate,j);}
      accept=headWeight<.3||Math.random()<.13;
    }
    indices[i]=candidate;
    color.set(dustPalette[Math.random()<.8?Math.floor(Math.random()*4):4+Math.floor(Math.random()*2)]).multiplyScalar(.4+Math.random()*.7);colors.set([color.r,color.g,color.b],i*3);
  }
  const particlesGeometry=new THREE.BufferGeometry();particlesGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3));particlesGeometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
  const surfacePoints=new THREE.Points(particlesGeometry,world.pointMaterial(.028,.55));surfacePoints.frustumCulled=false;mesh.add(surfacePoints);
  const sourceNormal=mesh.geometry.attributes.normal;
  const hairCount=450,hairPositions=new Float32Array(hairCount*6),hairColors=new Float32Array(hairCount*6);
  const hairLength=new Float32Array(hairCount);
  for(let i=0;i<hairCount;i++){
    hairLength[i]=.009+Math.random()*.017;
    const c=new THREE.Color(Math.random()<.09?'#98bcff':'#ffffff').multiplyScalar(.8+Math.random()*.2);
    hairColors.set([c.r,c.g,c.b,c.r*.65,c.g*.75,c.b*.8],i*6);
  }
  const hairGeometry=new THREE.BufferGeometry();hairGeometry.setAttribute('position',new THREE.BufferAttribute(hairPositions,3));hairGeometry.setAttribute('color',new THREE.BufferAttribute(hairColors,3));
  const hair=new THREE.LineSegments(hairGeometry,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.45,depthWrite:false}));hair.frustumCulled=false;mesh.add(hair);
  const cache=new Map();
  function updateSurface(){
    cache.clear();
    for(let i=0;i<count;i++){
      const index=indices[i];
      let p=cache.get(index);
      if(!p){p=mesh.getVertexPosition(index,V());p.addScaledVector(new THREE.Vector3().fromBufferAttribute(sourceNormal,index),.002);cache.set(index,p);}
      positions.set([p.x,p.y,p.z],i*3);
    }
    particlesGeometry.attributes.position.needsUpdate=true;
    for(let i=0;i<hairCount;i++){
      const index=indices[i*2],p=cache.get(index)||mesh.getVertexPosition(index,V());
      const tip=new THREE.Vector3().fromBufferAttribute(position,index).addScaledVector(new THREE.Vector3().fromBufferAttribute(sourceNormal,index),hairLength[i]);
      if(morph)tip.addScaledVector(new THREE.Vector3().fromBufferAttribute(morph,index),1);
      mesh.applyBoneTransform(index,tip);
      const flutter=Math.sin(world.time*16+i*2.31)*.002;
      tip.z-=.005;tip.x+=flutter;tip.y+=flutter*.4;
      hairPositions.set([p.x,p.y,p.z,tip.x,tip.y,tip.z],i*6);
    }
    hairGeometry.attributes.position.needsUpdate=true;
  }
  const hoofBones=['toesL','toesR','htoesL','htoesR'].map(n=>bones[n]).filter(Boolean);
  
  const beardRest=bones.beard?.quaternion.clone();
  const asset={
    content,mesh,outline,mixer,action,clip,orientation,bones,hoofBones,
    update(dt){
      // This clip travels naturally at 4.464 m/s; keep the stride synchronized with the trail.
      action.timeScale=.7;
      world.travelSpeed=4.464*scale*.7;
      mixer.update(dt);
      bones.udder?.scale.setScalar(.015);
      if(mesh.morphTargetInfluences)mesh.morphTargetInfluences[0]=1;
      const turn=world.path.getTangentAt((world.progress+.008)%1),direction=world.path.getTangentAt(world.progress);
      const bank=THREE.MathUtils.clamp(direction.x*turn.z-direction.z*turn.x,-.1,.1);
      // Raise the neck into the forward, airborne pose of the supplied running reference.
      content.updateMatrixWorld(true);
      const raiseBone=(bone,angle)=>{
        if(!bone)return;
        const parentQ=bone.parent.getWorldQuaternion(new THREE.Quaternion());
        const axis=V(1,0,0).applyQuaternion(orientation.getWorldQuaternion(new THREE.Quaternion()));
        const delta=new THREE.Quaternion().setFromAxisAngle(axis,angle);
        delta.premultiply(parentQ.clone().invert()).multiply(parentQ);
        bone.quaternion.premultiply(delta);bone.updateWorldMatrix(false,true);
      };
      raiseBone(bones.neck1,-.23);raiseBone(bones.neck2,-.08);raiseBone(bones.head,.09);
      raiseBone(bones.tail1,.22);
      // Secondary motion is layered over the authored skeleton, never over the foot support.
      if(bones.beard){bones.beard.quaternion.copy(beardRest);bones.beard.rotation.x+=Math.sin(world.time*12-1)*.055;}
      if(bones.tail1)bones.tail1.rotation.y+=Math.sin(world.time*11-.7)*.04;
      if(bones.earL)bones.earL.rotation.x+=Math.sin(world.time*13)*.015;
      if(bones.earR)bones.earR.rotation.x+=Math.sin(world.time*13-.4)*.015;
      content.updateMatrixWorld(true);skeleton.update();updateSurface();
      world.gaitMetrics={phase:(action.time/clip.duration)%1,animation:'run',bones:skeleton.bones.length,vertices:position.count,source:'Microsoft Rocketbox'};
    },
    sampleDust(target){
      if(!rearVertices.length)return false;
      const index=rearVertices[Math.floor(Math.random()*rearVertices.length)];
      mesh.getVertexPosition(index,target);mesh.localToWorld(target);return true;
    },
  };
  world.assetGoat=asset;
  world.travelSpeed=4.464*scale*.7;
  asset.update(0);
  document.documentElement.dataset.goatModel='rocketbox';
  return asset;
}
