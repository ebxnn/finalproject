import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './style.css'; 

import couchObj from './models/couchsofa.obj'; 
import couchMtl from './models/couchsofa.mtl'; 

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

    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(ambientLight, directionalLight);

    const mtlLoader = new MTLLoader();
    mtlLoader.setPath('/path/to/textures/');
    mtlLoader.load(couchMtl, (materials) => {
      materials.preload();

      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);

      objLoader.load(couchObj, (object) => {
        object.scale.set(5, 5, 5);
        object.position.set(0, -1, 0);
        object.castShadow = true;
        object.receiveShadow = true;

        object.traverse((child) => {
          if (child.isMesh) {
            const material = child.material;
            material.map = null;

            if (child.name === 'mainback') material.color.set(couchMaterial.mainback);
            else if (child.name === 'back1') material.color.set(couchMaterial.back);
            else if (child.name === 'seat') material.color.set(couchMaterial.seat);
            else if (child.name === 'base') material.color.set(couchMaterial.base);
            else if (child.name === 'armrest') material.color.set(couchMaterial.armrest);
            else if (child.name === 'legs') material.color.set(couchMaterial.legs);

            material.needsUpdate = true;
          }
        });

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
        const rendererElement = mountRef.current.querySelector('canvas');
        if (rendererElement) {
          mountRef.current.removeChild(rendererElement);
        }
      }
    };
  }, [couchMaterial]); 

  const handleColorChange = (part, color) => {
    setCouchMaterial((prev) => ({
      ...prev,
      [part]: color,
    }));
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Customize Your Couch</h5>
              <div className="form-group">
                {Object.keys(couchMaterial).map((part) => (
                  <div key={part}>
                    <label>{part.charAt(0).toUpperCase() + part.slice(1)}</label>
                    <input 
                      type="color" 
                      value={couchMaterial[part]} 
                      onChange={(e) => handleColorChange(part, e.target.value)} 
                      className="form-control"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div ref={mountRef} style={{ width: '100%', height: '80vh' }} />
        </div>
      </div>
    </div>
  );
};

export default CouchConfigurator;
