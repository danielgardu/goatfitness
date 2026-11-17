import * as THREE from 'three';

// Shared by the goat and the activity figures: three flat light bands.
export function createCelMaterial(options = {}) {
  const gradient = new THREE.DataTexture(new Uint8Array([48, 155, 255]), 3, 1, THREE.RedFormat);
  gradient.minFilter = gradient.magFilter = THREE.NearestFilter;
  gradient.generateMipmaps = false;
  gradient.needsUpdate = true;
  const material = new THREE.MeshToonMaterial({ color: '#ffffff', gradientMap: gradient, ...options });
  material.onBeforeCompile = shader => {
    shader.fragmentShader = shader.fragmentShader.replace('#include <opaque_fragment>', `
      float lightLevel=dot(reflectedLight.directDiffuse+reflectedLight.indirectDiffuse,vec3(.2126,.7152,.0722))
        /max(dot(diffuseColor.rgb,vec3(.2126,.7152,.0722)),.001);
      vec3 celColor=lightLevel<.65?vec3(.42,.56,.78):lightLevel<1.05?vec3(.76,.85,1.):vec3(1.6);
      outgoingLight=diffuseColor.rgb*celColor;
      #include <opaque_fragment>
    `);
  };
  material.customProgramCacheKey = () => 'goat-white-cel-v1';
  return material;
}

export function createHullMaterial(width = 2) {
  const uniforms = { uOutlineViewport: { value: new THREE.Vector2(1, 1) }, uOutlineWidth: { value: width } };
  const material = new THREE.MeshBasicMaterial({ color: '#0755ff', side: THREE.BackSide, toneMapped: false });
  material.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = 'uniform vec2 uOutlineViewport;\nuniform float uOutlineWidth;\n' + shader.vertexShader;
    // MeshBasic normally skips normals on unskinned meshes. Instanced figures
    // need the same normal pipeline as the skinned goat for hull expansion.
    shader.vertexShader = shader.vertexShader.replace('#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )', '#if 1');
    shader.vertexShader = shader.vertexShader.replace('#include <project_vertex>', `
      #include <project_vertex>
      vec3 hullNormal=-normalize(transformedNormal);
      vec2 projectedNormal=(projectionMatrix*vec4(hullNormal,0.)).xy;
      vec2 pixelNormal=projectedNormal*uOutlineViewport;
      float normalLength=length(pixelNormal);
      if(normalLength>.00001){
        gl_Position.xy+=pixelNormal/normalLength*(2.*uOutlineWidth/uOutlineViewport)*gl_Position.w;
      }
      gl_Position.z+=.00001*gl_Position.w;
    `);
  };
  material.customProgramCacheKey = () => 'goat-inverted-hull-v2';
  material.userData.updateViewport = renderer => renderer.getSize(uniforms.uOutlineViewport.value);
  return material;
}
