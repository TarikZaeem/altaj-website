import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  buildProceduralPotGroup,
  detectSoftwareWebGL,
  disposeThreeHierarchy,
} from '../three/potBuilder';
import type { ProductColorOption, ProductItem } from '../data/products';

interface PotViewer3DProps {
  product: ProductItem;
  selectedColor: ProductColorOption;
}

export const PotViewer3D: React.FC<PotViewer3DProps> = ({ product, selectedColor }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const requestRenderRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.color.set(selectedColor.hex);
      materialRef.current.metalness = selectedColor.isMetal ? 0.92 : 0.02;
      materialRef.current.roughness = selectedColor.isMetal ? 0.2 : 0.35;
      materialRef.current.needsUpdate = true;
      requestRenderRef.current?.();
    }
  }, [selectedColor]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

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
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2)
    );
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    const w = container.clientWidth || 360;
    const h = container.clientHeight || 320;
    renderer.setSize(w, h, false);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(36, w / h, 0.1, 30);
    camera.position.set(2.4, 1.85, 2.7);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 1.8;
    controls.maxDistance = 5.5;
    controls.target.set(0, product.dimensions3d.height * 0.45, 0);

    const hemi = new THREE.HemisphereLight(0xf3fbfb, 0xd8c3b0, 0.85);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfff5e8, 1.8);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = !isSoftwareGl;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x2acbd2, 0.7);
    rimLight.position.set(-4, 2, -3);
    scene.add(rimLight);

    const { group, primaryMaterial } = buildProceduralPotGroup({
      profileType: product.profileType,
      topRadius: product.dimensions3d.topRadius * 0.75,
      bottomRadius: product.dimensions3d.bottomRadius * 0.75,
      height: product.dimensions3d.height * 0.85,
      ribs: product.dimensions3d.ribs,
      colorHex: selectedColor.hex,
      isMetal: selectedColor.isMetal,
      hasPlant: product.dimensions3d.hasPlant,
      plantType: product.category === 'decor' ? 'leaves' : 'succulent',
    });
    materialRef.current = primaryMaterial;
    scene.add(group);

    let disposed = false;
    let renderBusy = false;
    let renderDirty = false;
    let frameId = 0;

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

    function requestRender() {
      if (disposed) return;
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame(() => {
        if (disposed) return;
        renderDirty = false;
        controls.update();
        renderer.render(scene, camera);
        const done = () => {
          renderBusy = false;
          if (renderDirty) requestRender();
        };
        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    }

    requestRenderRef.current = requestRender;
    controls.addEventListener('change', requestRender);
    requestRender();

    const onResize = () => {
      if (!container) return;
      const rw = container.clientWidth || 360;
      const rh = container.clientHeight || 320;
      camera.aspect = rw / rh;
      camera.updateProjectionMatrix();
      renderer.setSize(rw, rh, false);
      requestRender();
    };
    window.addEventListener('resize', onResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', onResize);
      controls.removeEventListener('change', requestRender);
      controls.dispose();
      disposeThreeHierarchy(scene);
      envTex.dispose();
      renderer.dispose();
      materialRef.current = null;
      requestRenderRef.current = null;
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [product.id]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full min-h-[280px] sm:min-h-[340px] cursor-grab active:cursor-grabbing"
    />
  );
};

export default PotViewer3D;
