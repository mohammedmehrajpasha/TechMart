import React, { useState, useEffect } from "react";
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
  Grid,
} from "@mui/material";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import EmailIcon from "@mui/icons-material/Email";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [email] = useState(location.state?.email || "");

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOTPChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Only allow digits
    if (value.length <= 6) {
      setOtpCode(value);
      setError("");
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (otpCode.length !== 6) {
      setError("Please enter a valid 6-digit OTP code");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: email,
            otpCode: otpCode,
          }),
          mode: "cors",
          credentials: "omit",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "OTP verification failed");
      }

      // Store token and navigate to dashboard or login
      localStorage.setItem("token", data.token);
      navigate("/Login", {
        state: {
          message: "Email verified successfully! You can now log in.",
          verified: true,
        },
      });
    } catch (err) {
      console.error("OTP verification error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/resend-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: email,
          }),
          mode: "cors",
          credentials: "omit",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend OTP");
      }

      setCountdown(60); // 60 seconds countdown
      setError("");
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError(err.message || "Failed to resend verification code");
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToSignUp = () => {
    navigate("/SignUp");
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
              <VerifiedUserIcon sx={{ fontSize: 32 }} />
              <EmailIcon sx={{ fontSize: 32 }} />
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
              Verify Your Email
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "#666",
                textAlign: "center",
                mb: 2,
              }}
            >
              We've sent a 6-digit verification code to:
              <br />
              <strong>{email}</strong>
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
              onSubmit={handleVerifyOTP}
              noValidate
              sx={{ width: "100%" }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="otpCode"
                label="Enter 6-digit code"
                name="otpCode"
                autoComplete="off"
                autoFocus
                value={otpCode}
                onChange={handleOTPChange}
                size="small"
                inputProps={{
                  maxLength: 6,
                  style: {
                    textAlign: "center",
                    fontSize: "24px",
                    letterSpacing: "8px",
                    fontWeight: "bold",
                  },
                }}
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
                disabled={loading || otpCode.length !== 6}
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
                  "Verify Email"
                )}
              </Button>

              <Grid container spacing={1} sx={{ mt: 2 }}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleResendOTP}
                    disabled={resendLoading || countdown > 0}
                    sx={{
                      borderRadius: "8px",
                      borderColor: "#1e3a8a",
                      color: "#1e3a8a",
                      textTransform: "none",
                      "&:hover": {
                        borderColor: "#1e3a8a",
                        backgroundColor: "rgba(30, 58, 138, 0.04)",
                      },
                    }}
                  >
                    {resendLoading ? (
                      <CircularProgress size={16} />
                    ) : countdown > 0 ? (
                      `Resend in ${countdown}s`
                    ) : (
                      "Resend Code"
                    )}
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="text"
                    onClick={handleBackToSignUp}
                    startIcon={<ArrowBackIcon />}
                    sx={{
                      borderRadius: "8px",
                      color: "#666",
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.04)",
                      },
                    }}
                  >
                    Back to Sign Up
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default OTPVerification;

