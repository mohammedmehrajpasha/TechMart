import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SecurityIcon from "@mui/icons-material/Security";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "email") {
      if (value && !value.endsWith("@gmail.com")) {
        setError("Email must end with @gmail.com");
        setFormData((prevState) => ({
          ...prevState,
          [name]: value,
          isValidEmail: false,
        }));
        return;
      } else {
        setError("");
        setFormData((prevState) => ({
          ...prevState,
          [name]: value,
          isValidEmail: true,
        }));
      }
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.endsWith("@gmail.com")) {
      setError("Email must end with @gmail.com");
      return;
    }
    setLoading(true);
    try {
      console.log(formData);
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: "customer",
        }),
        mode: "cors",
        credentials: "omit",
      });

      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Navigate to OTP verification page
      navigate("/otp-verification", {
        state: {
          email: formData.email,
          message: data.message,
        },
      });
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        overflow: "hidden",
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
              <PersonAddIcon sx={{ fontSize: 32 }} />
              <SecurityIcon sx={{ fontSize: 32 }} />
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
              Create Account
            </Typography>

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
                autoComplete="new-password"
                value={formData.password}
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
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
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
                  <CircularProgress size={20} sx={{ color: "white" }} />
                ) : (
                  "Create Account"
                )}
              </Button>

              <Box sx={{ textAlign: "center", mt: 2 }}>
                <Link
                  href="/login"
                  sx={{
                    color: "#1e3a8a",
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                >
                  Already have an account? Sign in
                </Link>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default SignUp;
