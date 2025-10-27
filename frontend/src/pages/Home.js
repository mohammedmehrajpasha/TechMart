import React from "react";
import { Box, Typography, Container, Grid, Paper } from "@mui/material";
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import TabletMacIcon from '@mui/icons-material/TabletMac';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import StarIcon from '@mui/icons-material/Star';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

const Home = () => {
  return (
    <Box sx={{ backgroundColor: "#f5f5f7" }}>
      {/* Main Content */}
      <Container maxWidth="lg" sx={{ pt: 4, pb: 8 }}>
        <Grid container spacing={4}>
          {/* Hero Section */}
          <Grid item xs={12}>
            <Paper
              elevation={6}
              sx={{
                p: { xs: 4, md: 8 },
                textAlign: "center",
                background: "linear-gradient(135deg, #000428 0%, #004e92 100%)",
                color: "white",
                borderRadius: 2,
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 70%)",
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 4 }}>
                <SmartphoneIcon sx={{ fontSize: 48, transform: 'rotate(-15deg)' }} />
                <TabletMacIcon sx={{ fontSize: 56 }} />
                <LaptopMacIcon sx={{ fontSize: 64, transform: 'rotate(15deg)' }} />
              </Box>
              <Typography 
                variant="h3" 
                gutterBottom 
                sx={{
                  fontWeight: 700,
                  textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                  mb: 3
                }}
              >
                Welcome to TechMart System
              </Typography>
              <Typography 
                variant="h6" 
                paragraph
                sx={{
                  opacity: 0.9,
                  maxWidth: "800px",
                  margin: "0 auto",
                }}
              >
                Join us to share and analyze product feedback
              </Typography>
            </Paper>
          </Grid>

          {/* Quick Features */}
          <Grid item xs={12}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-around', 
              flexWrap: 'wrap',
              gap: 2,
              my: 4 
            }}>
              <Paper sx={{ 
                p: 2, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                minWidth: '200px'
              }}>
                <StarIcon sx={{ color: '#ffd700' }} />
                <Typography>Premium Quality</Typography>
              </Paper>
              <Paper sx={{ 
                p: 2, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                minWidth: '200px'
              }}>
                <LocalShippingIcon sx={{ color: '#004e92' }} />
                <Typography>Fast Delivery</Typography>
              </Paper>
              <Paper sx={{ 
                p: 2, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                minWidth: '200px'
              }}>
                <SupportAgentIcon sx={{ color: '#004e92' }} />
                <Typography>24/7 Support</Typography>
              </Paper>
            </Box>
          </Grid>

          {/* Features Section */}
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={2}
              sx={{ 
                p: 4, 
                height: "100%",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 6,
                },
                borderRadius: 2,
                background: "white",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <SmartphoneIcon sx={{ fontSize: 40, color: "#004e92", mb: 2 }} />
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  color: "#004e92",
                  fontWeight: 600,
                  mb: 2,
                  textAlign: "center"
                }}
              >
                Product Reviews
              </Typography>
              <Typography sx={{ color: "#333", textAlign: "center" }}>
                Share your experience with products and help others make
                informed decisions.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper 
              elevation={2}
              sx={{ 
                p: 4, 
                height: "100%",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 6,
                },
                borderRadius: 2,
                background: "white",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <TabletMacIcon sx={{ fontSize: 40, color: "#004e92", mb: 2 }} />
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  color: "#004e92",
                  fontWeight: 600,
                  mb: 2,
                  textAlign: "center"
                }}
              >
                Sentiment Analysis
              </Typography>
              <Typography sx={{ color: "#333", textAlign: "center" }}>
                Advanced analytics to understand customer sentiment and feedback
                patterns.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper 
              elevation={2}
              sx={{ 
                p: 4, 
                height: "100%",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 6,
                },
                borderRadius: 2,
                background: "white",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <LaptopMacIcon sx={{ fontSize: 40, color: "#004e92", mb: 2 }} />
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  color: "#004e92",
                  fontWeight: 600,
                  mb: 2,
                  textAlign: "center"
                }}
              >
                Improvement Insights
              </Typography>
              <Typography sx={{ color: "#333", textAlign: "center" }}>
                Get actionable insights to improve products based on customer
                feedback.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;
