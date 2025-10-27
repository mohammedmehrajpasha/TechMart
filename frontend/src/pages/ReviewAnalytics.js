import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, CircularProgress, Chip, 
  ToggleButton, ToggleButtonGroup, Fade, Zoom,
  Card, CardContent
} from '@mui/material';
import {
  PieChart, Pie, Cell, Sector,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, AreaChart, Area,
  LineChart, Line, CartesianGrid, Scatter, ScatterChart,
  ComposedChart, Treemap
} from 'recharts';

const COLORS = ['#4CAF50', '#FFC107', '#F44336'];
const RADAR_COLORS = ['#2196F3', '#FF4081', '#FFB74D'];

const ReviewAnalytics = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState('sentiment');
  const [processedSuggestions, setProcessedSuggestions] = useState([]);
  const location = useLocation();
  const analysis = location.state?.analysis;

useEffect(() => {
  if (analysis?.improvement_suggestion) {
    // Process and clean suggestions
    const suggestions = analysis.improvement_suggestion
      .split('\n')
      .map(suggestion => suggestion.trim())
      .filter(suggestion => suggestion.length > 0)
      .filter(suggestion => !isUnwanted(suggestion)) // Filter out unwanted sentences
      .map((suggestion, index) => ({
        id: index,
        text: suggestion,
        category: getCategoryFromSuggestion(suggestion),
        priority: getPriorityFromSuggestion(suggestion)
      }))
      .sort((a, b) => priorityValue(b.priority) - priorityValue(a.priority)); // Sort by priority

    setProcessedSuggestions(suggestions);
  }
}, [analysis]);

// Helper function to filter out unwanted sentences
const isUnwanted = (suggestion) => {
  // Filter based on unwanted keywords or patterns
  const unwantedPatterns = [
    'please', // Example: remove suggestions with 'please'
    'thanks', // Example: remove suggestions with 'thanks'
    'do better' // Example: remove any suggestions mentioning 'do better'
  ];

  return unwantedPatterns.some(pattern => suggestion.toLowerCase().includes(pattern));
};

// Helper function to map priority strings to numerical values for sorting
const priorityValue = (priority) => {
  if (priority === 'High') return 3;
  if (priority === 'Medium') return 2;
  return 1; // Low priority
};

// Keep the original logic for category and priority assignment
const getCategoryFromSuggestion = (suggestion) => {
  if (suggestion.toLowerCase().includes('product')) return 'Product';
  if (suggestion.toLowerCase().includes('service')) return 'Service';
  if (suggestion.toLowerCase().includes('customer')) return 'Customer';
  return 'General';
};

const getPriorityFromSuggestion = (suggestion) => {
  const length = suggestion.length;
  if (length > 100) return 'High';
  if (length > 50) return 'Medium';
  return 'Low';
};


  if (!analysis) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

  const { sentiment_analysis, common_problems } = analysis;

  // Data preparation for sentiment analysis
  const pieData = [
    { name: 'Positive', value: sentiment_analysis.positive },
    { name: 'Neutral', value: sentiment_analysis.neutral },
    { name: 'Negative', value: sentiment_analysis.negative }
  ];

  // Process problems data
  const problemsData = common_problems.map((problem, index) => ({
    name: `Issue ${index + 1}`,
    count: problem.count || 1,
    impact: problem.severity === 'high' ? 3 : problem.severity === 'medium' ? 2 : 1,
    category: problem.category,
    description: problem.issue
  }));

  // Custom active shape for interactive pie chart
  const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} fontSize="16">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <text x={cx} y={cy - 20} textAnchor="middle" fill="#333" fontSize="14">
        {(percent * 100).toFixed(1)}%
      </text>
      <text x={cx} y={cy + 20} textAnchor="middle" fill="#666" fontSize="12">
        {value} reviews
      </text>
    </g>
  );
};


  // Treemap data for problem categories
  const treemapData = Object.entries(
    problemsData.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.count;
      return acc;
    }, {})
  ).map(([name, size]) => ({ name, size }));

  return (
    <Box
      sx={{
        p: 4,
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      }}
    >
      {/* Header and Controls */}
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          mb: 4,
          color: "#1a237e",
          textAlign: "center",
          fontWeight: "bold",
          textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        Review Analysis Dashboard
      </Typography>

      <ToggleButtonGroup
        value={viewMode}
        exclusive
        onChange={(e, newMode) => setViewMode(newMode)}
        sx={{ mb: 3, display: "flex", justifyContent: "center" }}
      >
        <ToggleButton value="sentiment">Sentiment Analysis</ToggleButton>
        {/* <ToggleButton value="problems">Problem Analysis</ToggleButton> */}
        <ToggleButton value="suggestions">Improvement Suggestions</ToggleButton>
      </ToggleButtonGroup>

      {/* Dynamic Content Based on View Mode */}
      <Grid container spacing={3}>
        {viewMode === "sentiment" && (
          <>
            {/* Interactive Sentiment Pie Chart */}
            <Grid item xs={12} md={6}>
              <Zoom in={viewMode === "sentiment"}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    height: "400px",
                    borderRadius: 2,
                    background:
                      "linear-gradient(to right bottom, #ffffff, #fafafa)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ color: "#1a237e", fontWeight: "bold" }}
                  >
                    Sentiment Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        data={pieData}
                        innerRadius={60}
                        outerRadius={80}
                        dataKey="value"
                        onMouseEnter={(_, index) => setActiveIndex(index)}
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>

                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Zoom>
            </Grid>

            {/* Sentiment Composition Chart */}
            <Grid item xs={12} md={6}>
              <Zoom in={viewMode === "sentiment"}>
                <Paper
                  elevation={3}
                  sx={{ p: 3, height: "400px", borderRadius: 2 }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ color: "#1a237e", fontWeight: "bold" }}
                  >
                    Sentiment Composition
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={pieData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" />
                      <Line type="monotone" dataKey="value" stroke="#ff7300" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Paper>
              </Zoom>
            </Grid>
          </>
        )}

        {viewMode === "problems" && (
          <>
            {/* Problem Categories Treemap
            <Grid item xs={12} md={6}>
              <Fade in={viewMode === "problems"}>
                <Paper
                  elevation={3}
                  sx={{ p: 3, height: "400px", borderRadius: 2 }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ color: "#1a237e", fontWeight: "bold" }}
                  >
                    Problem Categories
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <Treemap
                      data={treemapData}
                      dataKey="size"
                      ratio={4 / 3}
                      stroke="#fff"
                      fill="#8884d8"
                    >
                      <Tooltip />
                    </Treemap>
                  </ResponsiveContainer>
                </Paper>
              </Fade>
            </Grid> */}

            {/* Problem Impact Radar */}
            <Grid item xs={12} md={6}>
              <Fade in={viewMode === "problems"}>
                <Paper
                  elevation={3}
                  sx={{ p: 3, height: "400px", borderRadius: 2 }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ color: "#1a237e", fontWeight: "bold" }}
                  >
                    Problem Impact Analysis
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={problemsData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" />
                      <PolarRadiusAxis />
                      <Radar
                        name="Frequency"
                        dataKey="count"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.6}
                      />
                      <Radar
                        name="Impact"
                        dataKey="impact"
                        stroke="#82ca9d"
                        fill="#82ca9d"
                        fillOpacity={0.6}
                      />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </Paper>
              </Fade>
            </Grid>
          </>
        )}

        {viewMode === "suggestions" && (
          <Grid item xs={12}>
            <Fade in={viewMode === "suggestions"}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  borderRadius: 2,
                  background:
                    "linear-gradient(to right bottom, #ffffff, #fafafa)",
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: "#1a237e", fontWeight: "bold" }}
                >
                  Key Improvement Suggestions
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  {processedSuggestions.map((suggestion, index) => (
                    <Card key={index} elevation={2}>
                      <CardContent>
                        <Typography variant="body1" gutterBottom>
                          {suggestion.text}
                        </Typography>
                        <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                          <Chip
                            label={suggestion.category}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Chip
                            label={suggestion.priority}
                            size="small"
                            color={
                              suggestion.priority === "High"
                                ? "error"
                                : suggestion.priority === "Medium"
                                ? "warning"
                                : "success"
                            }
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Paper>
            </Fade>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

// Helper functions for suggestion processing
const getCategoryFromSuggestion = (suggestion) => {
  // Add logic to categorize suggestions
  if (suggestion.toLowerCase().includes('product')) return 'Product';
  if (suggestion.toLowerCase().includes('service')) return 'Service';
  if (suggestion.toLowerCase().includes('customer')) return 'Customer';
  return 'General';
};

const getPriorityFromSuggestion = (suggestion) => {
  // Add logic to determine priority
  const length = suggestion.length;
  if (length > 100) return 'High';
  if (length > 50) return 'Medium';
  return 'Low';
};

export default ReviewAnalytics