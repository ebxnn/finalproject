import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import objModel from './models/couch2.obj';
import mtlModel from './models/couch2.mtl';

const SofaConfigurator = () => {
  const mountRef = useRef(null);
  const [sofaMaterial, setSofaMaterial] = useState({
    seat: new THREE.Color(0x67b0a6), // Light teal
    base: new THREE.Color(0x546e7a), // Blue-gray
    leg: new THREE.Color(0x3e2723), // Dark brown
    couchBack: new THREE.Color(0xee6352), // Coral
  });

  const [legHeight, setLegHeight] = useState(0.2); // Default leg height
  const [baseHeight, setBaseHeight] = useState(0.15); // Default base height
  const [modelLoaded, setModelLoaded] = useState(false);
  const [seatObject, setSeatObject] = useState(null);
  const [legObject, setLegObject] = useState(null);
  const [baseObject, setBaseObject] = useState(null);
  const [couchBackObject, setCouchBackObject] = useState(null);
  const [section, setSection] = useState('2-seater');
  const [zoomLevel, setZoomLevel] = useState(10);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a); // Dark background

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1).normalize();
    directionalLight.castShadow = true;
    scene.add(ambientLight);
    scene.add(directionalLight);

    // Load model
    const mtlLoader = new MTLLoader();
    mtlLoader.load(mtlModel, (materials) => {
      materials.preload();
      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.load(objModel, (object) => {
        object.position.set(0, 0, 0);
        object.scale.set(0.015, 0.015, 0.015);
        object.castShadow = true;
        object.receiveShadow = true;

        object.traverse((child) => {
          if (child.isMesh) {
            let partMaterial;
            if (child.name.toLowerCase().includes('seat')) {
              partMaterial = new THREE.MeshPhongMaterial({ color: sofaMaterial.seat });
              setSeatObject(child);
            } else if (child.name.toLowerCase().includes('leg')) {
              partMaterial = new THREE.MeshPhongMaterial({ color: sofaMaterial.leg });
              setLegObject(child);
            } else if (child.name.toLowerCase().includes('base')) {
              partMaterial = new THREE.MeshPhongMaterial({ color: sofaMaterial.base });
              setBaseObject(child);
            } else if (child.name.toLowerCase().includes('couchback')) {
              partMaterial = new THREE.MeshPhongMaterial({ color: sofaMaterial.couchBack });
              setCouchBackObject(child);
            } else {
              partMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
            }

            child.material = partMaterial;
          }
        });

        scene.add(object);
        setModelLoaded(true);
      });
    });

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.enableRotate = true;

    camera.position.set(0, 1, zoomLevel);
    controls.update();

    window.addEventListener('resize', () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    });

    const animate = () => {
      requestAnimationFrame(animate);
      if (modelLoaded) {
        controls.update();
        renderer.render(scene, camera);
      }
    };

    animate();

    // Cleanup effect
    return () => {
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [sofaMaterial, modelLoaded, zoomLevel]);

  const handleColorChange = (part, color) => {
    setSofaMaterial((prevState) => ({
      ...prevState,
      [part]: new THREE.Color(color),
    }));
  };

  const handleSectionChange = (e) => {
    setSection(e.target.value);
  };

  const adjustSeatLayout = () => {
    if (seatObject) {
      let seatWidth;
      if (section === '3-seater') {
        seatWidth = 1.5;
      } else {
        seatWidth = 1;
      }
      seatObject.scale.set(seatWidth, seatObject.scale.y, seatObject.scale.z);

      if (baseObject) {
        baseObject.scale.set(seatWidth, baseObject.scale.y, baseObject.scale.z);
      }
      if (legObject) {
        legObject.scale.set(seatWidth, legObject.scale.y, legObject.scale.z);
      }
      if (couchBackObject) {
        couchBackObject.scale.set(seatWidth, couchBackObject.scale.y, couchBackObject.scale.z);
      }
    }
  };

  const handleLegHeightChange = (increment) => {
    let newHeight = legHeight + increment;
    if (newHeight < 0.1 || newHeight > 0.4) return;

    setLegHeight(newHeight);
    if (legObject) {
      legObject.position.y = -newHeight * 40;
      legObject.updateMatrix();
      legObject.parent.updateMatrixWorld(true);
    }
  };

  const handleBaseHeightChange = (increment) => {
    let newHeight = baseHeight + increment;
    if (newHeight < 0.1 || newHeight > 0.4) return;

    setBaseHeight(newHeight);
    if (baseObject) {
      baseObject.position.y = newHeight * 5;
      baseObject.updateMatrix();
      baseObject.parent.updateMatrixWorld(true);
    }

    // Fix seat position relative to the base when base height is changed
    if (seatObject) {
      seatObject.position.y = baseObject.position.y + newHeight;  // Keep seat fixed above base
      seatObject.updateMatrixWorld();
    }
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.max(prev - 1, 5));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.min(prev + 1, 20));
  };

  useEffect(() => {
    adjustSeatLayout();
  }, [section]);

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <div id="sidebar" className="w-1/4 bg-gray-800 p-6">
        <h2 className="text-xl font-semibold mb-4">Customize Your Sofa</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            {[
              { name: 'seat', label: 'Seat' },
              { name: 'base', label: 'Base' },
              { name: 'leg', label: 'Leg' },
              { name: 'couchBack', label: 'Couch Back' },
            ].map(({ name, label }) => (
              <div key={name} className="space-y-1">
                <label className="text-sm font-medium">{`${label} Color`}</label>
                <div className="flex gap-2">
                  <button onClick={() => handleColorChange(name, '#67b0a6')} className="w-8 h-8 rounded-full" style={{ backgroundColor: '#67b0a6' }}></button>
                  <button onClick={() => handleColorChange(name, '#ee6352')} className="w-8 h-8 rounded-full" style={{ backgroundColor: '#ee6352' }}></button>
                  <button onClick={() => handleColorChange(name, '#546e7a')} className="w-8 h-8 rounded-full" style={{ backgroundColor: '#546e7a' }}></button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Leg Height: {legHeight.toFixed(2)} m</label>
              <input type="range" min="0.1" max="0.4" step="0.01" value={legHeight} onChange={(e) => handleLegHeightChange(e.target.value - legHeight)} className="w-full" />
            </div>

            <div>
              <label className="text-sm font-medium">Base Height: {baseHeight.toFixed(2)} m</label>
              <input type="range" min="0.1" max="0.4" step="0.01" value={baseHeight} onChange={(e) => handleBaseHeightChange(e.target.value - baseHeight)} className="w-full" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Sofa Section:</label>
            <select value={section} onChange={handleSectionChange} className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white">
              <option value="2-seater">2-Seater</option>
              <option value="3-seater">3-Seater</option>
            </select>
          </div>

          <div className="flex gap-4">
            <button onClick={handleZoomIn} className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">+</button>
            <button onClick={handleZoomOut} className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">-</button>
          </div>
        </div>
      </div>

      <div id="viewer" className="w-3/4 bg-gray-900 flex justify-center items-center">
        <div ref={mountRef} className="w-full h-full" />
      </div>
    </div>
  );
};

export default SofaConfigurator;