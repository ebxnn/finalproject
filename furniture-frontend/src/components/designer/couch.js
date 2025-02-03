import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './style.css'; // Custom styles for sidebar and UI elements

import couchObj from './models/couchsofa.obj'; // Path to your couch .obj model
import couchMtl from './models/couchsofa.mtl'; // Path to your couch .mtl material file

const CouchConfigurator = () => {
  const mountRef = useRef(null);
  const [couchMaterial, setCouchMaterial] = useState({
    mainback: '#8B4513',
    back: '#D2B48C',
    seat: '#556B2F',
    base: '#4D4D4D',
    armrest: '#B0C4DE',
    legs: '#708090',
  });

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(ambientLight, directionalLight);

    // Load .mtl and .obj models
    const mtlLoader = new MTLLoader();
    mtlLoader.setPath('/path/to/textures/'); // set base path for textures
    mtlLoader.load(couchMtl, (materials) => {
      materials.preload();

      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);

      objLoader.load(couchObj, (object) => {
        object.scale.set(5, 5, 5);
        object.position.set(0, -1, 0);
        object.castShadow = true;
        object.receiveShadow = true;

        // Traverse the loaded object and apply custom colors dynamically
        object.traverse((child) => {
          if (child.isMesh) {
            const material = child.material;

            // Ensure that textures are removed
            material.map = null; // Remove any existing texture map

            // Assign colors dynamically for each part (without textures)
            if (child.name === 'mainback') material.color.set(couchMaterial.mainback);
            else if (child.name === 'back1') material.color.set(couchMaterial.back);
            else if (child.name === 'seat') material.color.set(couchMaterial.seat);
            else if (child.name === 'base') material.color.set(couchMaterial.base);
            else if (child.name === 'armrest') material.color.set(couchMaterial.armrest);
            else if (child.name === 'legs') material.color.set(couchMaterial.legs);

            material.needsUpdate = true; // Ensure material is updated
          }
        });

        scene.add(object);
      });
    });

    // Orbit controls
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
        // Clean up the Three.js renderer
        const rendererElement = mountRef.current.querySelector('canvas');
        if (rendererElement) {
          mountRef.current.removeChild(rendererElement);
        }
      }
    };
  }, [couchMaterial]); 

  // Handler for color changes
  const handleColorChange = (part, color) => {
    setCouchMaterial((prev) => ({
      ...prev,
      [part]: color,
    }));
  };

  return (
    <div className="container">
      <div className="sidebar">
        <h2>Customize Your Couch</h2>

        {/* Color controls for different parts */}
        <div className="color-section">
          <h3>Body Parts</h3>

          <div className="color-group">
            <h4>Main Back</h4>
            <input type="color" value={couchMaterial.mainback} onChange={(e) => handleColorChange('mainback', e.target.value)} />
          </div>

          <div className="color-group">
            <h4>Back</h4>
            <input type="color" value={couchMaterial.back} onChange={(e) => handleColorChange('back', e.target.value)} />
          </div>

          <div className="color-group">
            <h4>Seat</h4>
            <input type="color" value={couchMaterial.seat} onChange={(e) => handleColorChange('seat', e.target.value)} />
          </div>

          <div className="color-group">
            <h4>Base</h4>
            <input type="color" value={couchMaterial.base} onChange={(e) => handleColorChange('base', e.target.value)} />
          </div>

          <div className="color-group">
            <h4>Armrest</h4>
            <input type="color" value={couchMaterial.armrest} onChange={(e) => handleColorChange('armrest', e.target.value)} />
          </div>

          <div className="color-group">
            <h4>Legs</h4>
            <input type="color" value={couchMaterial.legs} onChange={(e) => handleColorChange('legs', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="right-side">
        <div ref={mountRef} />
      </div>
    </div>
  );
};

export default CouchConfigurator;
