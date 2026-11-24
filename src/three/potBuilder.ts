import * as THREE from 'three';
import type { PotProfileType } from '../data/products';

export type HeroPlantSpecies = 'succulent' | 'snake' | 'vine' | 'leaves' | 'none';

export interface PotModelOptions {
  profileType: PotProfileType;
  topRadius: number;
  bottomRadius: number;
  height: number;
  ribs: number;
  colorHex: string;
  isMetal?: boolean;
  hasPlant?: boolean;
  plantType?: HeroPlantSpecies;
}

export function detectSoftwareWebGL(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export function createPotMaterial(colorHex: string, isMetal = false): THREE.MeshPhysicalMaterial {
  if (isMetal) {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(colorHex),
      metalness: 0.92,
      roughness: 0.2,
      anisotropy: 0.78,
      clearcoat: 0.35,
      clearcoatRoughness: 0.25,
      envMapIntensity: 1.3,
    });
  }
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(colorHex),
    metalness: 0.02,
    roughness: 0.32,
    clearcoat: 0.6,
    clearcoatRoughness: 0.25,
    sheen: 0.3,
    sheenRoughness: 0.55,
    sheenColor: new THREE.Color(0xffffff),
    envMapIntensity: 1.2,
  });
}

function buildOuterLathePoints(opts: PotModelOptions): THREE.Vector2[] {
  const { profileType, topRadius, bottomRadius, height, ribs } = opts;
  const pts: THREE.Vector2[] = [];
  const wallThickness = Math.max(0.045, topRadius * 0.068);
  const rimOut = topRadius * 0.1;

  // Foot ring & base underside
  pts.push(new THREE.Vector2(0, 0.025));
  pts.push(new THREE.Vector2(bottomRadius * 0.64, 0.025));
  pts.push(new THREE.Vector2(bottomRadius * 0.72, 0));
  pts.push(new THREE.Vector2(bottomRadius, 0));

  const steps = 20;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const y = t * height * 0.94;
    let r = THREE.MathUtils.lerp(bottomRadius, topRadius, t);

    if (profileType === 'round') {
      const belly = Math.sin(t * Math.PI) * (topRadius * 0.22);
      r = THREE.MathUtils.lerp(bottomRadius, topRadius, Math.pow(t, 0.68)) + belly;
    } else if (profileType === 'soft') {
      r = THREE.MathUtils.lerp(bottomRadius, topRadius, Math.pow(t, 0.88));
    } else if (profileType === 'tall') {
      r = THREE.MathUtils.lerp(bottomRadius, topRadius, Math.pow(t, 0.92));
    }

    if (ribs > 0 && t > 0.14 && t < 0.86) {
      r += Math.sin(t * ribs * Math.PI * 2) * (topRadius * 0.014);
    }

    pts.push(new THREE.Vector2(r, y));
  }

  // Visible rolled/stepped rim with wall thickness
  pts.push(new THREE.Vector2(topRadius + rimOut, height * 0.945));
  pts.push(new THREE.Vector2(topRadius + rimOut, height));
  pts.push(new THREE.Vector2(topRadius - wallThickness * 0.3, height));
  pts.push(new THREE.Vector2(topRadius - wallThickness, height * 0.94));

  return pts;
}

function buildInnerWallPoints(opts: PotModelOptions): THREE.Vector2[] {
  const { topRadius, bottomRadius, height } = opts;
  const wallThickness = Math.max(0.045, topRadius * 0.068);
  const soilY = height * 0.8;
  return [
    new THREE.Vector2(0, soilY - 0.05),
    new THREE.Vector2(THREE.MathUtils.lerp(bottomRadius, topRadius, 0.78) - wallThickness, soilY - 0.05),
    new THREE.Vector2(topRadius - wallThickness, height * 0.945),
    new THREE.Vector2(topRadius - wallThickness * 0.85, height * 0.97),
  ];
}

function applyVerticalRibbing(geo: THREE.BufferGeometry, height: number, count: number, depth: number) {
  if (count <= 0) return;
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x, z);
    if (r < 0.05 || y > height * 0.91 || y < height * 0.08) continue;
    const angle = Math.atan2(z, x);
    const flute = Math.sin(angle * count) * depth;
    const scale = (r + flute) / r;
    pos.setX(i, x * scale);
    pos.setZ(i, z * scale);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
}

function createCurvedLeafGeometry(
  length: number,
  maxWidth: number,
  archAmount: number,
  twistAmount: number
): THREE.BufferGeometry {
  const segX = 4;
  const segY = 10;
  const geo = new THREE.PlaneGeometry(maxWidth, length, segX, segY);
  // Shift so base sits at y = 0
  geo.translate(0, length / 2, 0);

  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const t = THREE.MathUtils.clamp(y / length, 0, 1);

    // Leaf silhouette taper: narrow stem at base, full belly, tapered tip
    const widthProfile = Math.sin(Math.pow(t, 0.7) * Math.PI) * 0.92 + 0.08 * (1 - t);
    const nx = x * widthProfile;

    // Gentle midrib cupping + parabolic arch
    const cupZ = (Math.abs(x) / (maxWidth * 0.5 + 0.001)) * 0.025 * Math.sin(t * Math.PI);
    const archZ = Math.pow(t, 1.8) * archAmount;
    const nz = cupZ + archZ;

    // Subtle natural twist
    const angle = t * twistAmount;
    const rx = nx * Math.cos(angle) - nz * Math.sin(angle);
    const rz = nx * Math.sin(angle) + nz * Math.cos(angle);

    pos.setXYZ(i, rx, y, rz);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

function buildBotanicalPlant(
  species: HeroPlantSpecies,
  topRadius: number,
  soilY: number
): THREE.Group {
  const plantGroup = new THREE.Group();
  plantGroup.position.set(0, soilY, 0);
  if (species === 'none') return plantGroup;

  const leafMatDeep = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#23693d'),
    emissive: new THREE.Color('#0b2917'),
    emissiveIntensity: 0.16,
    roughness: 0.48,
    metalness: 0.02,
    side: THREE.DoubleSide,
  });

  const leafMatBright = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#3f965c'),
    emissive: new THREE.Color('#0e331c'),
    emissiveIntensity: 0.18,
    roughness: 0.42,
    metalness: 0.02,
    side: THREE.DoubleSide,
  });

  const maxTipRadius = topRadius * 1.28; // Strictly within 1.4x rim radius

  if (species === 'succulent') {
    const rings = [
      { count: 7, rOffset: topRadius * 0.24, len: topRadius * 0.62, width: topRadius * 0.34, tilt: 0.85, arch: 0.09 },
      { count: 5, rOffset: topRadius * 0.14, len: topRadius * 0.5, width: topRadius * 0.28, tilt: 0.52, arch: 0.06 },
      { count: 3, rOffset: topRadius * 0.05, len: topRadius * 0.34, width: topRadius * 0.2, tilt: 0.25, arch: 0.03 },
    ];
    rings.forEach((ring, rIdx) => {
      const leafGeo = createCurvedLeafGeometry(ring.len, ring.width, ring.arch, 0.12);
      for (let i = 0; i < ring.count; i++) {
        const angle = (i / ring.count) * Math.PI * 2 + rIdx * 0.55;
        const leaf = new THREE.Mesh(
          leafGeo,
          (i + rIdx) % 2 === 0 ? leafMatDeep : leafMatBright
        );
        // Root base inside soil surface
        leaf.position.set(
          Math.cos(angle) * ring.rOffset,
          -0.03,
          Math.sin(angle) * ring.rOffset
        );
        leaf.rotation.y = -angle + Math.PI / 2;
        leaf.rotation.x = ring.tilt;
        leaf.castShadow = true;
        plantGroup.add(leaf);
      }
    });
  } else if (species === 'snake' || species === 'leaves') {
    // Upright sculpted snake-plant blades rooted in soil center
    const count = 10;
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const angle = t * Math.PI * 2 + (i % 2) * 0.2;
      const len = topRadius * (0.95 + (i % 3) * 0.22);
      const width = topRadius * 0.24;
      const bladeGeo = createCurvedLeafGeometry(len, width, 0.07 + (i % 2) * 0.04, 0.25);
      const blade = new THREE.Mesh(
        bladeGeo,
        i % 2 === 0 ? leafMatDeep : leafMatBright
      );
      const radialBase = topRadius * (0.08 + (i % 3) * 0.11);
      blade.position.set(
        Math.cos(angle) * radialBase,
        -0.04,
        Math.sin(angle) * radialBase
      );
      blade.rotation.y = -angle + Math.PI / 2;
      // Slight natural splay while guaranteeing tips stay well within maxTipRadius
      const maxAngle = Math.asin(Math.min(0.45, (maxTipRadius - radialBase) / len));
      blade.rotation.x = 0.08 + (i % 3) * (maxAngle * 0.38);
      blade.castShadow = true;
      plantGroup.add(blade);
    }
  } else if (species === 'vine') {
    // Compact cascading / arching indoor foliage rooted inside soil
    const count = 12;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const isOuter = i % 2 === 0;
      const len = topRadius * (isOuter ? 0.82 : 0.62);
      const width = topRadius * 0.26;
      const leafGeo = createCurvedLeafGeometry(
        len,
        width,
        isOuter ? 0.28 : 0.14,
        0.18
      );
      const leaf = new THREE.Mesh(
        leafGeo,
        isOuter ? leafMatBright : leafMatDeep
      );
      const rBase = topRadius * (isOuter ? 0.34 : 0.16);
      leaf.position.set(
        Math.cos(angle) * rBase,
        -0.03,
        Math.sin(angle) * rBase
      );
      leaf.rotation.y = -angle + Math.PI / 2;
      leaf.rotation.x = isOuter ? 0.72 : 0.35;
      leaf.castShadow = true;
      plantGroup.add(leaf);
    }
  }

  return plantGroup;
}

export function buildProceduralPotGroup(opts: PotModelOptions): {
  group: THREE.Group;
  primaryMaterial: THREE.MeshPhysicalMaterial;
  innerMaterial: THREE.MeshStandardMaterial;
  plantGroup: THREE.Group | null;
  hitMeshes: THREE.Mesh[];
} {
  const group = new THREE.Group();
  const hitMeshes: THREE.Mesh[] = [];
  const primaryMaterial = createPotMaterial(opts.colorHex, opts.isMetal);

  const radialSegments = opts.profileType === 'square' ? 4 : 44;
  const outerPts = buildOuterLathePoints(opts);
  const bodyGeo = new THREE.LatheGeometry(outerPts, radialSegments);
  if (opts.profileType === 'square') {
    bodyGeo.rotateY(Math.PI / 4);
  } else if (opts.profileType === 'tapered' || opts.profileType === 'soft') {
    applyVerticalRibbing(bodyGeo, opts.height, 18, opts.topRadius * 0.012);
  }
  bodyGeo.computeVertexNormals();

  const bodyMesh = new THREE.Mesh(bodyGeo, primaryMaterial);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  group.add(bodyMesh);
  hitMeshes.push(bodyMesh);

  // Darker inner wall liner for realistic plastic thickness & cavity depth
  const innerColor = new THREE.Color(opts.colorHex).multiplyScalar(0.52);
  const innerMaterial = new THREE.MeshStandardMaterial({
    color: innerColor,
    roughness: 0.58,
    metalness: opts.isMetal ? 0.75 : 0.02,
    side: THREE.DoubleSide,
  });
  const innerPts = buildInnerWallPoints(opts);
  const innerGeo = new THREE.LatheGeometry(innerPts, radialSegments);
  if (opts.profileType === 'square') {
    innerGeo.rotateY(Math.PI / 4);
  }
  innerGeo.computeVertexNormals();
  const innerMesh = new THREE.Mesh(innerGeo, innerMaterial);
  innerMesh.receiveShadow = true;
  group.add(innerMesh);

  // Crisp molded rim collar
  const collarGeo = new THREE.TorusGeometry(
    opts.topRadius * (opts.profileType === 'square' ? 0.98 : 1.03),
    opts.topRadius * 0.036,
    12,
    opts.profileType === 'square' ? 4 : 40
  );
  collarGeo.rotateX(Math.PI / 2);
  if (opts.profileType === 'square') {
    collarGeo.rotateZ(Math.PI / 4);
  }
  const collarMesh = new THREE.Mesh(collarGeo, primaryMaterial);
  collarMesh.position.y = opts.height * 0.975;
  collarMesh.castShadow = true;
  group.add(collarMesh);

  // Bottom drainage holes
  const drainMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#121516'),
    roughness: 0.85,
  });
  const holeGeo = new THREE.CylinderGeometry(
    opts.bottomRadius * 0.085,
    opts.bottomRadius * 0.085,
    0.03,
    10
  );
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const holeMesh = new THREE.Mesh(holeGeo, drainMat);
    holeMesh.position.set(
      Math.cos(angle) * opts.bottomRadius * 0.52,
      0.015,
      Math.sin(angle) * opts.bottomRadius * 0.52
    );
    group.add(holeMesh);
  }

  // Recessed organic potting soil bed (1–2cm below rim, textured with organic bumps)
  const soilY = opts.height * 0.8;
  const soilRadius = opts.topRadius * 0.82;
  const soilGeo = new THREE.CylinderGeometry(
    soilRadius,
    soilRadius * 0.95,
    0.06,
    opts.profileType === 'square' ? 4 : 28
  );
  if (opts.profileType === 'square') {
    soilGeo.rotateY(Math.PI / 4);
  }
  const soilMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#2d1f16'),
    roughness: 0.95,
    metalness: 0.0,
  });
  const soilMesh = new THREE.Mesh(soilGeo, soilMat);
  soilMesh.position.y = soilY;
  soilMesh.receiveShadow = true;
  group.add(soilMesh);

  // Subtle soil clod bumps so soil reads organically, never like a flat lid
  const clodGeo = new THREE.IcosahedronGeometry(opts.topRadius * 0.085, 0);
  const clodMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#3a281d'),
    roughness: 0.96,
  });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    const dist = soilRadius * (0.28 + (i % 3) * 0.16);
    const clod = new THREE.Mesh(clodGeo, clodMat);
    clod.position.set(
      Math.cos(a) * dist,
      soilY + 0.028,
      Math.sin(a) * dist
    );
    clod.scale.set(1.1, 0.55, 0.9);
    clod.rotation.y = a;
    group.add(clod);
  }

  // Rooted plant species
  let plantGroup: THREE.Group | null = null;
  if (opts.hasPlant && opts.plantType && opts.plantType !== 'none') {
    plantGroup = buildBotanicalPlant(opts.plantType, opts.topRadius, soilY + 0.02);
    group.add(plantGroup);
  }

  return { group, primaryMaterial, innerMaterial, plantGroup, hitMeshes };
}

export function disposeThreeHierarchy(root: THREE.Object3D) {
  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry?.dispose();
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach((m) => m?.dispose());
    }
  });
}
