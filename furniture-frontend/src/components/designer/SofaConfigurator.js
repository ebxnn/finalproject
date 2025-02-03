import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './style.css'; // Ensure you include your custom styles for the buttons
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

  const [seatThickness, setSeatThickness] = useState(0.8); // Default seat thickness
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
    scene.background = new THREE.Color(0xffffff); // Set scene background to white

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
      } else if (section === '4-seater') {
        seatWidth = 2;
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

  const handleSeatThicknessChange = (increment) => {
    const newThickness = seatThickness + increment;
  
    // Ensure the thickness stays within a reasonable range (e.g., 0.5 to 1.5)
    if (newThickness < 0.5 || newThickness > 1.5) return;
  
    if (seatObject) {
      // Get the initial bounding box of the seat object to determine the original height
      const bbox = new THREE.Box3().setFromObject(seatObject);
      const originalHeight = bbox.max.y - bbox.min.y;
  
      // Calculate the scaling factor for the Y axis
      const scaleY = newThickness / originalHeight;
  
      // Keep the X and Z scales as they were before, only adjust the Y scale
      seatObject.scale.set(seatObject.scale.x, scaleY, seatObject.scale.z);
  
      // Recalculate the new bounding box after the scaling
      const bboxAfterScale = new THREE.Box3().setFromObject(seatObject);
      const newHeight = bboxAfterScale.max.y - bboxAfterScale.min.y;
  
      // Calculate the difference in height caused by scaling
      const heightDifference = newHeight - originalHeight;
  
      // Adjust the Y position by the height difference, without shifting the seat
      seatObject.position.y -= heightDifference / 2;
  
      // Update the state with the new thickness value
      setSeatThickness(newThickness);
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
    <div className="container">
      <div className="sidebar">
        <h2>Customize Your Sofa</h2>
        <div className="color-controls">
          {[
            { name: 'seat', label: 'Seat' },
            { name: 'base', label: 'Base' },
            { name: 'leg', label: 'Leg' },
            { name: 'couchBack', label: 'Couch Back' },
          ].map(({ name, label }) => (
            <div key={name} className="color-picker">
              <label>{`${label} Color`}</label>
              <div>
                <button onClick={() => handleColorChange(name, '#67b0a6')} style={{ backgroundColor: '#67b0a6' }}></button>
                <button onClick={() => handleColorChange(name, '#ee6352')} style={{ backgroundColor: '#ee6352' }}></button>
                <button onClick={() => handleColorChange(name, '#546e7a')} style={{ backgroundColor: '#546e7a' }}></button>
              </div>
            </div>
          ))}
        </div>

        <div className="height-controls">
          <label>Seat Thickness: {seatThickness.toFixed(2)}x</label>
          <input type="range" min="0.5" max="1.5" step="0.05" value={seatThickness} onChange={(e) => handleSeatThicknessChange(e.target.value - seatThickness)} />
          <label>Leg Height: {legHeight.toFixed(2)} m</label>
          <input type="range" min="0.1" max="0.4" step="0.01" value={legHeight} onChange={(e) => handleLegHeightChange(e.target.value - legHeight)} />
          <label>Base Height: {baseHeight.toFixed(2)} m</label>
          <input type="range" min="0.1" max="0.4" step="0.01" value={baseHeight} onChange={(e) => handleBaseHeightChange(e.target.value - baseHeight)} />
        </div>

        <div className="section-selector">
          <label>Select Sofa Section:</label>
          <select value={section} onChange={handleSectionChange}>
            <option value="2-seater">2-Seater</option>
            <option value="3-seater">3-Seater</option>
            <option value="4-seater">4-Seater</option>
          </select>
        </div>

        <div className="zoom-controls">
          <button onClick={handleZoomIn}>Zoom In</button>
          <button onClick={handleZoomOut}>Zoom Out</button>
        </div>
      </div>

      <div className="right-side">
        <div ref={mountRef} />
      </div>
    </div>
  );
};

export default SofaConfigurator;
