import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  buildProceduralPotGroup,
  detectSoftwareWebGL,
  disposeThreeHierarchy,
  type HeroPlantSpecies,
  type PotModelOptions,
} from '../three/potBuilder';
import { PRODUCTS, type ProductItem } from '../data/products';
import { useAppStore } from '../store/useAppStore';

interface HeroPotSpec {
  productId: string;
  scale: number;
  tintWithSwatch: boolean;
  fixedColorHex?: string;
  isMetal?: boolean;
  plantType: HeroPlantSpecies;
  hasPlant: boolean;
  floatPhase: number;
  floatSpeed: number;
  options: Omit<PotModelOptions, 'colorHex' | 'isMetal' | 'hasPlant' | 'plantType'>;
}

// 5 distinct pots arranged on a smooth 3D carousel ring (3 on mobile)
const HERO_POT_SPECS: HeroPotSpec[] = [
  // 1. Center-Front Hero Pot (tall tapered planter with snake-plant blades, swatch-reactive)
  {
    productId: 'dec-tall-taper-55',
    scale: 1.04,
    tintWithSwatch: true,
    hasPlant: true,
    plantType: 'snake',
    floatPhase: 0.2,
    floatSpeed: 1.05,
    options: {
      profileType: 'tall',
      topRadius: 0.68,
      bottomRadius: 0.46,
      height: 1.32,
      ribs: 0,
    },
  },
  // 2. Terracotta soft ribbed nursery pot with succulent rosette
  {
    productId: 'prod-soft-12',
    scale: 0.98,
    tintWithSwatch: false,
    fixedColorHex: '#c7623f',
    hasPlant: true,
    plantType: 'succulent',
    floatPhase: 1.5,
    floatSpeed: 1.2,
    options: {
      profileType: 'soft',
      topRadius: 0.74,
      bottomRadius: 0.5,
      height: 0.9,
      ribs: 3,
    },
  },
  // 3. Round botanical bowl in crisp off-white with trailing vine
  {
    productId: 'dec-round-bowl-38',
    scale: 1.0,
    tintWithSwatch: false,
    fixedColorHex: '#f3f1ec',
    hasPlant: true,
    plantType: 'vine',
    floatPhase: 2.8,
    floatSpeed: 0.95,
    options: {
      profileType: 'round',
      topRadius: 0.84,
      bottomRadius: 0.52,
      height: 0.74,
      ribs: 0,
    },
  },
  // 4. Empty forest-green tapered nursery pot showcasing rim & interior
  {
    productId: 'prod-12',
    scale: 0.92,
    tintWithSwatch: false,
    fixedColorHex: '#2f6e49',
    hasPlant: false,
    plantType: 'none',
    floatPhase: 4.1,
    floatSpeed: 1.15,
    options: {
      profileType: 'tapered',
      topRadius: 0.72,
      bottomRadius: 0.48,
      height: 0.88,
      ribs: 2,
    },
  },
  // 5. Swatch-reactive square architectural planter with succulent rosette
  {
    productId: 'dec-square-cube-40',
    scale: 0.92,
    tintWithSwatch: true,
    hasPlant: true,
    plantType: 'succulent',
    floatPhase: 5.0,
    floatSpeed: 1.1,
    options: {
      profileType: 'square',
      topRadius: 0.7,
      bottomRadius: 0.63,
      height: 0.86,
      ribs: 0,
    },
  },
];

interface Hero3DSceneProps {
  onSelectProduct: (product: ProductItem) => void;
  isOrbitPlaying: boolean;
  isProductSelected?: boolean;
}

const CAMERA_ELEVATION_RAD = THREE.MathUtils.degToRad(13.5);
const RING_TILT_SIN = Math.sin(THREE.MathUtils.degToRad(8));
const BASE_ORBIT_SPEED = -0.19; // Clockwise from above (~33s per full revolution)
const GROUND_SHADOW_Y = -1.08;
const BASE_POT_Y = -0.58;

const _pointer = new THREE.Vector2();
const _raycaster = new THREE.Raycaster();
const _targetColor = new THREE.Color();
const _targetInnerColor = new THREE.Color();

function shortestAngleDelta(target: number, current: number): number {
  const twoPi = Math.PI * 2;
  return (((target - current) % twoPi) + Math.PI * 3) % twoPi - Math.PI;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export const Hero3DScene: React.FC<Hero3DSceneProps> = ({
  onSelectProduct,
  isOrbitPlaying,
  isProductSelected = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetColorRef = useRef<THREE.Color>(new THREE.Color('#2acbd2'));
  const onSelectRef = useRef(onSelectProduct);
  onSelectRef.current = onSelectProduct;

  const isOrbitPlayingRef = useRef(isOrbitPlaying);
  isOrbitPlayingRef.current = isOrbitPlaying;

  const isProductSelectedRef = useRef(isProductSelected);
  isProductSelectedRef.current = isProductSelected;

  const heroColorHex = useAppStore((s) => s.heroColorHex);
  const lang = useAppStore((s) => s.lang);
  const [webglReady, setWebglReady] = useState(false);
  const [hoveredInfo, setHoveredInfo] = useState<{
    name: string;
    size: string;
    x: number;
    y: number;
  } | null>(null);
  const [tagVisible, setTagVisible] = useState(false);

  // Smooth ~400ms color tweening without resetting orbit angle
  useEffect(() => {
    targetColorRef.current.set(heroColorHex);
  }, [heroColorHex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const initialMobile = window.innerWidth < 768;
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const isSoftwareGl = detectSoftwareWebGL();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 1.5)
    );
    renderer.shadowMap.enabled = !isSoftwareGl && !initialMobile;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'pan-y';

    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    // Studio Environment Lighting
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.035).texture;
    scene.environment = envTex;
    pmrem.dispose();

    const getResponsiveLayout = (w: number, h: number) => {
      const vw = window.innerWidth;
      const isMob = vw < 768;
      const isTab = vw >= 768 && vw < 1024;
      const ringRadius = isMob ? 1.62 : isTab ? 2.2 : 2.52;
      const potScaleMul = isMob ? 0.85 : isTab ? 0.92 : 1.0;

      const aspect = Math.max(w / Math.max(h, 1), 0.7);
      const minHalfSpan = ringRadius + (isMob ? 0.95 : 1.12);
      const halfHeight = minHalfSpan / Math.min(aspect, 1.32);
      const tanHalfFov = Math.tan(THREE.MathUtils.degToRad(19));
      const camDist = Math.max(isMob ? 7.3 : 8.5, halfHeight / tanHalfFov);
      return { ringRadius, potScaleMul, camDist, isMob };
    };

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 540;
    renderer.setSize(width, height, false);

    let layout = getResponsiveLayout(width, height);
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 60);
    const positionCamera = (dist: number) => {
      camera.position.set(
        0,
        dist * Math.sin(CAMERA_ELEVATION_RAD),
        dist * Math.cos(CAMERA_ELEVATION_RAD)
      );
      camera.lookAt(0, -0.22, 0);
    };
    positionCamera(layout.camDist);

    // Three-Point Lighting Setup
    const fillLight = new THREE.HemisphereLight(0xf3fbfb, 0x1e383b, 0.85);
    scene.add(fillLight);

    const keyLight = new THREE.DirectionalLight(0xfff6ea, 2.05);
    keyLight.position.set(4.5, 7.5, 5.5);
    keyLight.castShadow = !isSoftwareGl && !initialMobile;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 22;
    keyLight.shadow.camera.left = -5.5;
    keyLight.shadow.camera.right = 5.5;
    keyLight.shadow.camera.top = 5.5;
    keyLight.shadow.camera.bottom = -5.5;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x2acbd2, 1.35);
    rimLight.position.set(-4.5, 3.2, -4.5);
    scene.add(rimLight);

    // Soft radial contact shadow & teal ambient floor glow texture
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(128, 128, 12, 128, 128, 128);
      grad.addColorStop(0, 'rgba(6, 22, 24, 0.48)');
      grad.addColorStop(0.45, 'rgba(6, 22, 24, 0.2)');
      grad.addColorStop(0.75, 'rgba(42, 203, 210, 0.11)');
      grad.addColorStop(1, 'rgba(42, 203, 210, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 256, 256);
    }
    const contactTex = new THREE.CanvasTexture(shadowCanvas);

    const glowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(8.8, 8.8),
      new THREE.MeshBasicMaterial({
        map: contactTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.72,
      })
    );
    glowPlane.rotation.x = -Math.PI / 2;
    glowPlane.position.y = GROUND_SHADOW_Y - 0.02;
    scene.add(glowPlane);

    // Parent carousel orbit group centered in the scene
    const orbitGroup = new THREE.Group();
    orbitGroup.name = 'orbitGroup';
    scene.add(orbitGroup);

    const specsToSpawn = initialMobile ? HERO_POT_SPECS.slice(0, 3) : HERO_POT_SPECS;
    const potCount = specsToSpawn.length;

    interface SpawnedPot {
      index: number;
      spec: HeroPotSpec;
      ringAngle: number;
      group: THREE.Group;
      material: THREE.MeshPhysicalMaterial;
      innerMaterial: THREE.MeshStandardMaterial;
      baseOuterColor: THREE.Color;
      baseInnerColor: THREE.Color;
      extraColorEntries: { mat: THREE.MeshStandardMaterial; baseColor: THREE.Color }[];
      contactShadow: THREE.Mesh;
      shadowMaterial: THREE.MeshBasicMaterial;
      product: ProductItem | undefined;
      hoverLiftY: number;
      selfSpinAngle: number;
      brightness: number;
    }

    const spawnedPots: SpawnedPot[] = [];
    const hitTargets: THREE.Mesh[] = [];

    const initialHex = useAppStore.getState().heroColorHex;
    targetColorRef.current.set(initialHex);

    specsToSpawn.forEach((spec, i) => {
      const ringAngle = (i / potCount) * Math.PI * 2;
      const colorHex = spec.tintWithSwatch
        ? initialHex
        : spec.fixedColorHex || '#2acbd2';

      const { group, primaryMaterial, innerMaterial } =
        buildProceduralPotGroup({
          ...spec.options,
          colorHex,
          isMetal: spec.isMetal,
          hasPlant: spec.hasPlant,
          plantType: spec.plantType,
        });

      const baseOuterColor = primaryMaterial.color.clone();
      const baseInnerColor = innerMaterial.color.clone();

      // Collect secondary non-pot materials (soil, clods, leaves) so hover dimming -10% stays cohesive
      const extraColorEntries: {
        mat: THREE.MeshStandardMaterial;
        baseColor: THREE.Color;
      }[] = [];
      group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          const m = obj.material;
          if (
            m instanceof THREE.MeshStandardMaterial &&
            m !== primaryMaterial &&
            m !== innerMaterial
          ) {
            extraColorEntries.push({ mat: m, baseColor: m.color.clone() });
          }
        }
      });

      const x = Math.sin(ringAngle) * layout.ringRadius;
      const z = Math.cos(ringAngle) * layout.ringRadius;
      const tiltY = -z * RING_TILT_SIN;

      group.position.set(x, BASE_POT_Y + tiltY, z);
      group.scale.setScalar(spec.scale * layout.potScaleMul);
      orbitGroup.add(group);

      // Per-pot contact shadow following the ring
      const shadowMaterial = new THREE.MeshBasicMaterial({
        map: contactTex,
        transparent: true,
        depthWrite: false,
        opacity: initialMobile ? 0 : 0.42,
      });
      const cs = new THREE.Mesh(
        new THREE.PlaneGeometry(spec.options.topRadius * 3.0, spec.options.topRadius * 3.0),
        shadowMaterial
      );
      cs.rotation.x = -Math.PI / 2;
      cs.position.set(x, GROUND_SHADOW_Y, z);
      cs.visible = !initialMobile;
      orbitGroup.add(cs);

      const product = PRODUCTS.find((p) => p.id === spec.productId);
      group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.userData.product = product;
          obj.userData.potIndex = i;
          hitTargets.push(obj);
        }
      });

      spawnedPots.push({
        index: i,
        spec,
        ringAngle,
        group,
        material: primaryMaterial,
        innerMaterial,
        baseOuterColor,
        baseInnerColor,
        extraColorEntries,
        contactShadow: cs,
        shadowMaterial,
        product,
        hoverLiftY: 0,
        selfSpinAngle: 0,
        brightness: 1,
      });
    });

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    setWebglReady(true);

    // Orbit, Hover, Click-Focus, and Touch Inertia State
    let orbitAngle = 0;
    let timeScale = isOrbitPlayingRef.current ? 1 : 0;
    let animTime = 0;

    let isSceneHovered = false;
    let hoveredIndex: number | null = null;
    let lastRaycastAt = 0;

    let isTouchDown = false;
    let activeTouchId: number | null = null;
    let lastTouchX = 0;
    let touchDragDist = 0;
    let touchDragVel = 0;
    let lastTouchInteractionAt = -10000;
    let mouseDragDist = 0;
    let mouseDownPos = { x: 0, y: 0 };

    let focusAnim: {
      startAngle: number;
      targetAngle: number;
      elapsed: number;
      duration: number;
    } | null = null;

    let isViewportVisible = true;
    let isTabVisible = document.visibilityState !== 'hidden';
    let frameId = 0;
    let disposed = false;

    const clock = new THREE.Clock();

    const triggerSelectPot = (index: number) => {
      const pot = spawnedPots[index];
      if (!pot) return;
      const delta = shortestAngleDelta(-pot.ringAngle, orbitAngle);
      focusAnim = {
        startAngle: orbitAngle,
        targetAngle: orbitAngle + delta,
        elapsed: 0,
        duration: 0.7,
      };
      touchDragVel = 0;
      if (pot.product) {
        onSelectRef.current(pot.product);
      }
    };

    const raycastAtClient = (clientX: number, clientY: number): number | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return null;
      _pointer.set(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1
      );
      _raycaster.setFromCamera(_pointer, camera);
      const hits = _raycaster.intersectObjects(hitTargets, false);
      if (hits.length > 0) {
        const idx = hits[0].object.userData.potIndex;
        return typeof idx === 'number' ? idx : null;
      }
      return null;
    };

    const updateHoveredFromPointer = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const hitIdx = raycastAtClient(e.clientX, e.clientY);
      if (hitIdx !== null) {
        hoveredIndex = hitIdx;
        renderer.domElement.style.cursor = 'pointer';
        const prod = spawnedPots[hitIdx]?.product;
        if (prod) {
          setHoveredInfo({
            name: prod.name,
            size: prod.sizeLabel,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
          setTagVisible(true);
        }
      } else {
        hoveredIndex = null;
        renderer.domElement.style.cursor = 'default';
        setTagVisible(false);
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        activeTouchId = e.pointerId;
        isTouchDown = true;
        lastTouchX = e.clientX;
        touchDragDist = 0;
        touchDragVel = 0;
        lastTouchInteractionAt = performance.now();
        focusAnim = null;
        try {
          renderer.domElement.setPointerCapture(e.pointerId);
        } catch {
          // Safe fallback if capture is unavailable
        }
      } else {
        mouseDownPos = { x: e.clientX, y: e.clientY };
        mouseDragDist = 0;
      }
    };

    const onPointerEnter = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      isSceneHovered = true;
      updateHoveredFromPointer(e);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        if (!isTouchDown || activeTouchId !== e.pointerId) return;
        const dx = e.clientX - lastTouchX;
        lastTouchX = e.clientX;
        touchDragDist += Math.abs(dx);
        lastTouchInteractionAt = performance.now();

        const angularDelta = dx * 0.0078;
        orbitAngle += angularDelta;
        // Estimate angular velocity for inertial spin-down
        touchDragVel = THREE.MathUtils.clamp(angularDelta / 0.016, -3.5, 3.5);
        return;
      }

      isSceneHovered = true;
      mouseDragDist = Math.hypot(
        e.clientX - mouseDownPos.x,
        e.clientY - mouseDownPos.y
      );

      const now = performance.now();
      if (now - lastRaycastAt < 40) return;
      lastRaycastAt = now;
      updateHoveredFromPointer(e);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        if (activeTouchId !== e.pointerId) return;
        isTouchDown = false;
        activeTouchId = null;
        lastTouchInteractionAt = performance.now();
        if (touchDragDist < 10) {
          const hitIdx = raycastAtClient(e.clientX, e.clientY);
          if (hitIdx !== null) {
            triggerSelectPot(hitIdx);
          }
        }
        return;
      }

      if (mouseDragDist < 8) {
        const hitIdx = raycastAtClient(e.clientX, e.clientY);
        if (hitIdx !== null) {
          triggerSelectPot(hitIdx);
        }
      }
    };

    const onPointerCancel = (e: PointerEvent) => {
      if (e.pointerType === 'touch' && activeTouchId === e.pointerId) {
        isTouchDown = false;
        activeTouchId = null;
        lastTouchInteractionAt = performance.now();
      }
    };

    const onPointerLeave = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      isSceneHovered = false;
      hoveredIndex = null;
      renderer.domElement.style.cursor = 'default';
      setTagVisible(false);
    };

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerenter', onPointerEnter);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointercancel', onPointerCancel);
    renderer.domElement.addEventListener('pointerleave', onPointerLeave);
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);

    const observer = new IntersectionObserver(
      ([entry]) => {
        isViewportVisible = entry.isIntersecting;
        if (isViewportVisible && isTabVisible && !disposed) {
          clock.getDelta();
          scheduleNext();
        }
      },
      { threshold: 0.02 }
    );
    observer.observe(container);

    const onVisibilityChange = () => {
      isTabVisible = document.visibilityState !== 'hidden';
      if (isViewportVisible && isTabVisible && !disposed) {
        clock.getDelta();
        scheduleNext();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 640;
      const h = container.clientHeight || 540;
      layout = getResponsiveLayout(w, h);
      camera.aspect = w / h;
      positionCamera(layout.camDist);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      renderer.render(scene, camera);
    };
    window.addEventListener('resize', onResize);

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 6);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 6);
    }

    function scheduleNext() {
      if (disposed || !isViewportVisible || !isTabVisible) return;
      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    function tick() {
      if (disposed || !isViewportVisible || !isTabVisible) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const nowMs = performance.now();

      const touchCooldownActive = nowMs - lastTouchInteractionAt < 2500;
      const shouldOrbitRun =
        isOrbitPlayingRef.current &&
        !isSceneHovered &&
        hoveredIndex === null &&
        !isTouchDown &&
        !touchCooldownActive &&
        !isProductSelectedRef.current &&
        focusAnim === null;

      const targetTimeScale = shouldOrbitRun ? 1 : 0;
      // Fast smooth brake (400-600ms) when hovering/pausing; gentler ramp (600-800ms) on resume
      const dampLambda = targetTimeScale === 0 ? 7.5 : 4.2;
      timeScale = THREE.MathUtils.damp(timeScale, targetTimeScale, dampLambda, dt);
      if (targetTimeScale === 0 && timeScale < 0.002) {
        timeScale = 0;
      }

      // Advance click-focus easeInOutCubic animation (700ms) OR normal damped orbit
      if (focusAnim) {
        focusAnim.elapsed += dt;
        const u = Math.min(focusAnim.elapsed / focusAnim.duration, 1);
        const eased = easeInOutCubic(u);
        orbitAngle = THREE.MathUtils.lerp(
          focusAnim.startAngle,
          focusAnim.targetAngle,
          eased
        );
        if (u >= 1) {
          focusAnim = null;
        }
      } else {
        // Apply inertial velocity after touch swipe
        if (!isTouchDown && Math.abs(touchDragVel) > 0.001) {
          orbitAngle += touchDragVel * dt;
          touchDragVel *= Math.exp(-3.8 * dt);
        }
        orbitAngle += BASE_ORBIT_SPEED * timeScale * dt;
      }

      orbitGroup.rotation.y = orbitAngle;

      // Advance gentle ambient motion time using smoothed timeScale (freezes gracefully on pause)
      if (!prefersReducedMotion) {
        animTime += dt * timeScale;
      }

      // Smooth ~400ms color tweening on swatch selection
      const colorLerpAlpha = 1 - Math.exp(-7.5 * dt);
      _targetColor.copy(targetColorRef.current);
      _targetInnerColor.copy(_targetColor).multiplyScalar(0.52);

      spawnedPots.forEach((pot) => {
        const isHovered = hoveredIndex === pot.index;
        const isAnyHovered = hoveredIndex !== null;

        // World angle & position around the ring
        const worldAngle = pot.ringAngle + orbitAngle;
        const localX = Math.sin(pot.ringAngle) * layout.ringRadius;
        const localZ = Math.cos(pot.ringAngle) * layout.ringRadius;
        const worldZ = Math.cos(worldAngle) * layout.ringRadius;

        // Gentle 8-degree tilted ring depth feel (back higher, front lower)
        const tiltY = -worldZ * RING_TILT_SIN;

        // Floating bob (±0.05 units) on top of the orbit
        const bobY =
          prefersReducedMotion || !isOrbitPlayingRef.current
            ? 0
            : Math.sin(animTime * pot.spec.floatSpeed + pot.spec.floatPhase) * 0.05;

        // Hover lift (+0.12 units)
        pot.hoverLiftY = THREE.MathUtils.damp(
          pot.hoverLiftY,
          isHovered ? 0.12 : 0,
          9,
          dt
        );

        const targetY = BASE_POT_Y + tiltY + bobY + pot.hoverLiftY;
        pot.group.position.set(localX, targetY, localZ);

        // Counter-rotate pot around its own Y axis so plants & fronts keep facing the camera,
        // plus subtle ±0.05 rad/s rim-catching oscillation (damps to 0 on hover)
        const targetSelfSpin =
          isHovered || prefersReducedMotion
            ? 0
            : Math.sin(animTime * 0.36 + pot.spec.floatPhase) * 0.14;
        pot.selfSpinAngle = THREE.MathUtils.damp(
          pot.selfSpinAngle,
          targetSelfSpin,
          6,
          dt
        );
        pot.group.rotation.y = -orbitAngle + pot.selfSpinAngle;

        // Smooth scale to 1.05 on hover
        const baseScale = pot.spec.scale * layout.potScaleMul;
        const targetScale = isHovered ? baseScale * 1.05 : baseScale;
        const nextScale = THREE.MathUtils.damp(pot.group.scale.x, targetScale, 9, dt);
        pot.group.scale.setScalar(nextScale);

        // Contact shadow follows pot around the ring & fades with height
        pot.contactShadow.position.set(localX, GROUND_SHADOW_Y, localZ);
        if (!layout.isMob) {
          pot.contactShadow.visible = true;
          const heightAboveGround = Math.max(0, targetY - GROUND_SHADOW_Y);
          const heightFade = THREE.MathUtils.clamp(
            0.46 - heightAboveGround * 0.32,
            0.12,
            0.44
          );
          pot.shadowMaterial.opacity = THREE.MathUtils.damp(
            pot.shadowMaterial.opacity,
            isAnyHovered && !isHovered ? heightFade * 0.85 : heightFade,
            9,
            dt
          );
        } else {
          pot.contactShadow.visible = false;
        }

        // Update swatch color without resetting orbit
        if (pot.spec.tintWithSwatch) {
          pot.baseOuterColor.lerp(_targetColor, colorLerpAlpha);
          pot.baseInnerColor.lerp(_targetInnerColor, colorLerpAlpha);
        }

        // Depth brightness + -10% dim on other pots while one pot is hovered
        const depthNorm = THREE.MathUtils.clamp(
          (worldZ / Math.max(layout.ringRadius, 0.1) + 1) * 0.5,
          0,
          1
        );
        const depthMul = THREE.MathUtils.lerp(0.84, 1.04, depthNorm);
        const hoverMul = isAnyHovered ? (isHovered ? 1.06 : 0.88) : 1.0;
        pot.brightness = THREE.MathUtils.damp(
          pot.brightness,
          depthMul * hoverMul,
          9,
          dt
        );

        pot.material.color.copy(pot.baseOuterColor).multiplyScalar(pot.brightness);
        pot.innerMaterial.color.copy(pot.baseInnerColor).multiplyScalar(pot.brightness);
        pot.material.envMapIntensity = 1.2 * pot.brightness;

        for (let eIdx = 0; eIdx < pot.extraColorEntries.length; eIdx++) {
          const entry = pot.extraColorEntries[eIdx];
          entry.mat.color.copy(entry.baseColor).multiplyScalar(pot.brightness);
        }

        pot.material.emissiveIntensity = THREE.MathUtils.damp(
          pot.material.emissiveIntensity,
          isHovered ? 0.14 : 0,
          8,
          dt
        );
        if (isHovered) {
          pot.material.emissive.setHex(0x2acbd2);
        }
      });

      renderer.render(scene, camera);
      scheduleNext();
    }

    renderer.render(scene, camera);
    scheduleNext();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerenter', onPointerEnter);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointercancel', onPointerCancel);
      renderer.domElement.removeEventListener('pointerleave', onPointerLeave);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      disposeThreeHierarchy(scene);
      envTex.dispose();
      contactTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Clean poster fallback shown only while WebGL initializes or if WebGL fails */}
      {!webglReady && (
        <img
          src="src/assets/images/hero_pots_poster_1795437449315.jpg"
          alt={
            lang === 'ar'
              ? 'أحواض نباتات بلاستيكية وزراعية من شركة التاج المميزة'
              : 'Al Taj Al Mumayyaz plastic and decorative plant pots'
          }
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover rounded-[28px] opacity-90"
        />
      )}

      {/* Dedicated Three.js Canvas Mount */}
      <div
        ref={containerRef}
        aria-hidden="true"
        className="relative w-full h-full z-10"
        style={{ touchAction: 'pan-y' }}
      />

      {/* Floating Hover Tag with 200ms smooth transition */}
      {hoveredInfo && (
        <div
          className={`pointer-events-none absolute z-30 px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl text-xs transition-all duration-200 ${
            tagVisible
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-1.5 scale-95'
          }`}
          style={{
            left: Math.min(
              Math.max(hoveredInfo.x + 12, 12),
              (containerRef.current?.clientWidth || 500) - 200
            ),
            top: Math.max(hoveredInfo.y - 54, 12),
          }}
        >
          <p className="font-semibold text-[var(--text-primary)]">{hoveredInfo.name}</p>
          <p className="text-[var(--accent-teal-deep)] dark:text-[var(--accent-teal)] font-medium mt-0.5">
            {hoveredInfo.size}
          </p>
        </div>
      )}
    </div>
  );
};

export default Hero3DScene;
