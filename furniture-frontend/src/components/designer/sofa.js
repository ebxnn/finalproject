import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {
  Box,
  Button,
  Drawer,
  Typography,
  Grid,
  Paper,
  Divider,
} from '@mui/material';

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
    pillow5: new THREE.Color(0xA2DFF7),
  });

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 5); // Adjusted for better initial view

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
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
        object.scale.set(2, 2, 2); // Adjusted to a smaller size
        object.position.set(0, -1, 0);
        object.castShadow = true;
        object.receiveShadow = true;

        object.traverse((child) => {
          if (child.isMesh) {
            const materialMap = {
              sofa: sofaMaterial.sofa,
              pillow1: sofaMaterial.pillow1,
              pillow2: sofaMaterial.pillow2,
              pillow3: sofaMaterial.pillow3,
              pillow4: sofaMaterial.pillow4,
              pillow5: sofaMaterial.pillow5,
            };
            if (materialMap[child.name]) {
              child.material = new THREE.MeshPhongMaterial({ color: materialMap[child.name] });
            }
          }
        });

        scene.add(object);
      });
    });

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
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
  }, [sofaMaterial]);

  const handleColorChange = (part, color) => {
    setSofaMaterial((prev) => ({
      ...prev,
      [part]: new THREE.Color(color),
    }));
  };

  return (
    <Box display="flex" height="100vh">
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          width: 320,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: 320, padding: 2, boxSizing: 'border-box' },
        }}
      >
        <Typography variant="h5" gutterBottom>
          Customize Your Sofa
        </Typography>

        {/* Sofa Colors */}
        <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6">Body Colors</Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={1}>
            {[
              { name: 'Brown', color: '#8B4513' },
              { name: 'Tan', color: '#D2B48C' },
              { name: 'Olive', color: '#556B2F' },
              { name: 'Charcoal', color: '#4D4D4D' },
              { name: 'Steel', color: '#B0C4DE' },
              { name: 'Slate', color: '#708090' },
            ].map((item) => (
              <Grid item xs={4} key={item.name}>
                <Button
                  fullWidth
                  sx={{ bgcolor: item.color, color: '#fff' }}
                  onClick={() => handleColorChange('sofa', item.color)}
                >
                  {item.name}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Pillow Colors */}
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6">Pillow Colors</Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={1}>
            {[
              { name: 'Tomato', color: '#FF6347' },
              { name: 'Orange Red', color: '#FF4500' },
              { name: 'Gold', color: '#FFD700' },
              { name: 'Dodger Blue', color: '#1E90FF' },
              { name: 'Lime Green', color: '#32CD32' },
              { name: 'Blue Violet', color: '#8A2BE2' },
            ].map((item, index) => (
              <Grid item xs={4} key={item.name}>
                <Button
                  fullWidth
                  sx={{ bgcolor: item.color, color: '#fff' }}
                  onClick={() => handleColorChange(`pillow${index + 1}`, item.color)}
                >
                  {item.name}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Drawer>

      {/* 3D Canvas */}
      <Box flex={1} display="flex" justifyContent="center" alignItems="center">
        <div ref={mountRef} />
      </Box>
    </Box>
  );
};

export default Sofa;
