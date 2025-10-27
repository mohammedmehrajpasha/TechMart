import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Link,
} from "@mui/material";
import LaptopIcon from "@mui/icons-material/Laptop";
import SmartphoneIcon from "@mui/icons-material/Smartphone";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage] = useState(location.state?.message || "");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
        mode: "cors",
        credentials: "omit",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store token and user details
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("userId", data.id);
      localStorage.setItem("email", formData.email);

      // Redirect based on user role
      navigate(data.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0a1f3c 0%, #1e3a8a 100%)",
        padding: "16px",
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={8}
          sx={{
            p: { xs: 2, sm: 3 },
            background: "rgba(255, 255, 255, 0.98)",
            borderRadius: "16px",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.2)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: "1rem",
                color: "#1e3a8a",
                mb: 1,
              }}
            >
              <LaptopIcon sx={{ fontSize: 32 }} />
              <SmartphoneIcon sx={{ fontSize: 32 }} />
            </Box>

            <Typography
              variant="h5"
              component="h1"
              sx={{
                color: "#1e3a8a",
                fontWeight: 600,
                textAlign: "center",
                mb: 0.5,
              }}
            >
              Welcome Back
            </Typography>

            {successMessage && (
              <Alert
                severity="success"
                sx={{
                  width: "100%",
                  borderRadius: "8px",
                  py: 0.5,
                }}
              >
                {successMessage}
              </Alert>
            )}

            {error && (
              <Alert
                severity="error"
                sx={{
                  width: "100%",
                  borderRadius: "8px",
                  py: 0.5,
                }}
              >
                {error}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ width: "100%" }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
                size="small"
                sx={{
                  mb: 1.5,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    "&:hover fieldset": {
                      borderColor: "#1e3a8a",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#1e3a8a",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#1e3a8a",
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                size="small"
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    "&:hover fieldset": {
                      borderColor: "#1e3a8a",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#1e3a8a",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#1e3a8a",
                  },
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  py: 1,
                  borderRadius: "8px",
                  background:
                    "linear-gradient(45deg, #1e3a8a 30%, #2563eb 90%)",
                  color: "white",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  textTransform: "none",
                  boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)",
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, #1e3a8a 60%, #2563eb 90%)",
                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.4)",
                  },
                }}
              >
                {loading ? (
                  <CircularProgress
                    size={20}
                    sx={{
                      color: "white",
                    }}
                  />
                ) : (
                  "Sign In"
                )}
              </Button>

              <Box
                sx={{
                  textAlign: "center",
                  mt: 2,
                  "& a": {
                    color: "#1e3a8a",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    "&:hover": {
                      color: "#2563eb",
                    },
                  },
                }}
              >
                <Link href="/signup">Don't have an account? Sign up</Link>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
