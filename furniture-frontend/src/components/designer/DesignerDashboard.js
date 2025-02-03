import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { FaPen, FaSignOutAlt } from "react-icons/fa";
import { Button, Typography, Container } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import "./DesignerDashboard.css";

// Import OBJ and MTL files as static assets
import sofaModelObj from "./models/couch2.obj";
import sofaModelMtl from "./models/couch2.mtl";
import tableModelObj from "./models/couchsofa.obj";
import tableModelMtl from "./models/couchsofa.mtl";
import chairModelObj from "./models/sofa.obj";
import chairModelMtl from "./models/sofa.mtl";

// Create Material-UI Dark Theme
const darkTheme = createTheme({
  palette: {
    mode: "dark", // Dark theme
    primary: {
      main: "#1976d2", // Blue theme color for primary
    },
    background: {
      default: "#121212", // Dark background
    },
    text: {
      primary: "#ffffff", // White text color
    },
  },
});

// Component to Load OBJ Models with MTL (Material) for Textures
const ModelViewer = ({ objUrl, mtlUrl }) => {
  const [obj, setObj] = useState(null);
  const [materials, setMaterials] = useState(null);

  // Load both OBJ and MTL files
  useEffect(() => {
    const loadModel = async () => {
      const mtlLoader = new MTLLoader();
      const objLoader = new OBJLoader();

      // Load materials
      mtlLoader.load(mtlUrl, (loadedMaterials) => {
        loadedMaterials.preload();
        setMaterials(loadedMaterials);
        
        // Load OBJ and apply materials
        objLoader.setMaterials(loadedMaterials);
        objLoader.load(objUrl, (loadedObj) => {
          setObj(loadedObj);
        });
      });
    };
    loadModel();
  }, [objUrl, mtlUrl]);

  if (!obj || !materials) {
    return null; // Return null while the model is loading
  }

  return <primitive object={obj} scale={0.5} />;
};

const DesignerDashboard = () => {
  const [models, setModels] = useState([
    { _id: "1", name: "Modern Sofa", category: "Living Room", objUrl: sofaModelObj, mtlUrl: sofaModelMtl, status: "pending" },
    { _id: "2", name: "Wooden Table", category: "Dining Room", objUrl: tableModelObj, mtlUrl: tableModelMtl, status: "pending" },
    { _id: "3", name: "Luxury Chair", category: "Office", objUrl: chairModelObj, mtlUrl: chairModelMtl, status: "pending" },
  ]);

  const navigate = useNavigate(); // Use useNavigate hook for navigation

  const handleDesign = (id) => {
    // Depending on the model ID, route to the respective configurator
    if (id === "1") {
      navigate("/sofa-1");
    } else if (id === "2") {
      navigate("/sofa-2");
    } else if (id === "3") {
      navigate("/sofa-3");
    }
  };

  const handleLogout = () => {
    // Logic for logging out the user
    console.log("User logged out");
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="flex h-screen overflow-hidden">
        {/* Fixed Sidebar */}
        <div className="fixed left-0 top-0 h-full w-64 bg-gray-800 text-white p-6">
          <div className="flex flex-col">
            <Typography variant="h5" className="mb-4">Dashboard</Typography>
            <div className="flex flex-col gap-4">
              <Button
                fullWidth
                variant="contained"
                color="primary"
                startIcon={<FaPen />}
                onClick={() => handleDesign("1")} // Example for Sofa model
              >
                Design Model
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                startIcon={<FaSignOutAlt />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64 overflow-auto bg-gray-900">
          <Container className="py-6">
            <section className="dashboard-content">
              <Typography variant="h5" gutterBottom className="text-white">
                Furniture Model Requests
              </Typography>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {models.map((model) => (
                  <div key={model._id} className="model-card bg-gray-800 text-white rounded-lg shadow-lg overflow-hidden">
                    {/* Model Viewer */}
                    <div className="model-viewer p-4 flex justify-center items-center">
                      <Canvas style={{ width: "100%", height: "300px" }}>
                        <ambientLight intensity={0.5} />
                        <pointLight position={[10, 10, 10]} />
                        <ModelViewer objUrl={model.objUrl} mtlUrl={model.mtlUrl} />
                        <OrbitControls />
                      </Canvas>
                    </div>

                    {/* Model Info */}
                    <div className="model-info p-4">
                      <Typography variant="h6">{model.name}</Typography>
                      <Typography variant="body2"><strong>Category:</strong> {model.category}</Typography>
                      <Typography variant="body2"><strong>Status:</strong> {model.status}</Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        startIcon={<FaPen />}
                        onClick={() => handleDesign(model._id)} // Route to the correct configurator
                      >
                        Design Model
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </Container>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default DesignerDashboard;
