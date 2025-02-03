import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './style.css'; 

import sofaObj from './models/sofa.obj';
import sofaMtl from './models/sofa.mtl'; 
const Sofa = () => {
  const mountRef = useRef(null);
  const [sofaMaterial, setSofaMaterial] = useState({
    sofa: new THREE.Color(0x856D4B),
    pillow1: new THREE.Color(0xDD7144),
    pillow2: new THREE.Color(0xF1A7A0),
    pillow3: new THREE.Color(0x2F5179),
    pillow4: new THREE.Color(0x928D43),
    pillow5: new THREE.Color(0xA2DFF7)
  });

  const [modelLoaded, setModelLoaded] = useState(false);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1).normalize();
    directionalLight.castShadow = true;
    scene.add(ambientLight, directionalLight);

    const mtlLoader = new MTLLoader();
    mtlLoader.load(sofaMtl, (materials) => {
      materials.preload();
      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.load(sofaObj, (object) => {
        object.scale.set(5, 5, 5);
        object.position.set(0, -1, 0);
        object.castShadow = true;
        object.receiveShadow = true;

        object.traverse((child) => {
          if (child.isMesh) {
            if (child.name === 'sofa') child.material = new THREE.MeshPhongMaterial({ color: sofaMaterial.sofa });
            else if (child.name === 'pillow1') child.material = new THREE.MeshPhongMaterial({ color: sofaMaterial.pillow1 });
            else if (child.name === 'pillow2') child.material = new THREE.MeshPhongMaterial({ color: sofaMaterial.pillow2 });
            else if (child.name === 'pillow3') child.material = new THREE.MeshPhongMaterial({ color: sofaMaterial.pillow3 });
            else if (child.name === 'pillow4') child.material = new THREE.MeshPhongMaterial({ color: sofaMaterial.pillow4 });
            else if (child.name === 'pillow5') child.material = new THREE.MeshPhongMaterial({ color: sofaMaterial.pillow5 });
          }
        });

        setModelLoaded(true);
        scene.add(object);
      });
    });

    const controls = new OrbitControls(camera, renderer.domElement);
    camera.position.set(0, 2, 8);
    controls.update();

    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (mountRef.current) {
        // Remove the Three.js renderer if it exists
        const rendererElement = mountRef.current.querySelector('canvas');
        if (rendererElement) {
          mountRef.current.removeChild(rendererElement);
        }
      }
    };
    
  }, [sofaMaterial]);

  const handleColorChange = (part, color) => {
    setSofaMaterial((prev) => ({
      ...prev,
      [part]: new THREE.Color(color),
    }));
  };

  return (
    <div className="container">
      <div className="sidebar">
        <h2>Customize Your Sofa</h2>
        
        {/* Sofa Colors */}
        <div className="color-section">
          <h3>Body Colors</h3>
          <div className="color-group">
            <h4>Earth Tones</h4>
            <button onClick={() => handleColorChange('sofa', '#8B4513')} style={{ backgroundColor: '#8B4513' }}>Brown</button>
            <button onClick={() => handleColorChange('sofa', '#D2B48C')} style={{ backgroundColor: '#D2B48C' }}>Tan</button>
            <button onClick={() => handleColorChange('sofa', '#556B2F')} style={{ backgroundColor: '#556B2F' }}>Olive</button>
          </div>
          <div className="color-group">
            <h4>Modern Shades</h4>
            <button onClick={() => handleColorChange('sofa', '#4D4D4D')} style={{ backgroundColor: '#4D4D4D' }}>Charcoal</button>
            <button onClick={() => handleColorChange('sofa', '#B0C4DE')} style={{ backgroundColor: '#B0C4DE' }}>Steel</button>
            <button onClick={() => handleColorChange('sofa', '#708090')} style={{ backgroundColor: '#708090' }}>Slate</button>
          </div>
        </div>

        {/* Pillow Colors */}
        <div className="color-section">
          <h3>Pillow Colors</h3>
          <div className="color-group">
            <h4>Warm Tones</h4>
            <button onClick={() => handleColorChange('pillow1', '#FF6347')} style={{ backgroundColor: '#FF6347' }}>Tomato</button>
            <button onClick={() => handleColorChange('pillow2', '#FF4500')} style={{ backgroundColor: '#FF4500' }}>Orange Red</button>
            <button onClick={() => handleColorChange('pillow3', '#FFD700')} style={{ backgroundColor: '#FFD700' }}>Gold</button>
          </div>
          <div className="color-group">
            <h4>Cool Tones</h4>
            <button onClick={() => handleColorChange('pillow4', '#1E90FF')} style={{ backgroundColor: '#1E90FF' }}>Dodger Blue</button>
            <button onClick={() => handleColorChange('pillow5', '#32CD32')} style={{ backgroundColor: '#32CD32' }}>Lime Green</button>
            <button onClick={() => handleColorChange('pillow1', '#8A2BE2')} style={{ backgroundColor: '#8A2BE2' }}>Blue Violet</button>
          </div>
        </div>
      </div>

      <div className="right-side">
        <div ref={mountRef} />
      </div>
    </div>
  );
};

export default Sofa;
