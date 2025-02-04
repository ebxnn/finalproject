import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPen, FaSignOutAlt } from "react-icons/fa";
import { Button, Typography, Container } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import "./DesignerDashboard.css";

// Create Material-UI Dark Theme with enhanced styling
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#BB86FC",
    },
    secondary: {
      main: "#03DAC6",
    },
    background: {
      default: "#121212",
      paper: "#1E1E1E",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#B0B0B0",
    },
  },
});

const DesignerDashboard = () => {
  const [models, setModels] = useState([
    {
      _id: "1",
      name: "Modern Sofa",
      category: "Living Room",
      imageUrl: "https://images.free3d.com/imgd/l95/5dc4c3dc26be8b15298b4567/4700-a-simple-sofa.jpg",
    },
    {
      _id: "2",
      name: "Modern Couch",
      category: "Living Room",
      imageUrl: "https://images.free3d.com/imgd/l2/60800efdafd10b0bbf1f7ce2/9687-couch-sofa.jpg",
    },
  ]);

  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
    console.log("User logged out");
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="flex h-screen overflow-hidden bg-gray-900">
        <div className="fixed left-0 top-0 h-full w-64 bg-gray-850 text-white p-6 shadow-lg">
          <div className="flex flex-col">
            <Typography variant="h5" className="mb-6 text-center">
              Dashboard
            </Typography>
            <div className="flex flex-col gap-4">
              <Button
                fullWidth
                variant="contained"
                color="primary"
                startIcon={<FaPen />}
                onClick={() => navigate("/designer")}
              >
                Design
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

        <div className="flex-1 ml-64 overflow-auto p-6">
          <Container>
            <section className="dashboard-content">
              <Typography variant="h5" gutterBottom className="text-white">
                Furniture Model Requests
              </Typography>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {models.map((model) => (
                  <div
                    key={model._id}
                    className="model-card bg-gray-850 text-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    <div className="model-image p-4 flex justify-center items-center">
                      <img src={model.imageUrl} alt={model.name} className="w-full h-48 object-cover rounded-lg" />
                    </div>
                    <div className="model-info p-4">
                      <Typography variant="h6" className="text-primary">{model.name}</Typography>
                      <Typography variant="body2" className="text-secondary">
                        <strong>Category:</strong> {model.category}
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        startIcon={<FaPen />}
                        onClick={() => navigate(model._id === "1" ? "/sofa-1" : "/sofa-2")}
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
