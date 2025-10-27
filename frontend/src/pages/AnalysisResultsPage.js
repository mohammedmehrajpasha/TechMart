import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const AnalysisResultsPage = () => {
  const location = useLocation();
  const { salesForecast, stockoutPrediction, demandAnalysis, initialStock } = location.state;

  // Round up predicted_sales in the sales forecast
  const roundedSalesForecast = useMemo(() => {
    return salesForecast?.map((forecast) => ({
      ...forecast,
      predicted_sales: forecast.predicted_sales
        ? Math.ceil(forecast.predicted_sales)
        : "N/A",
    }));
  }, [salesForecast]);

  // Calculate total quantity sold
  const totalQuantitySold = roundedSalesForecast?.reduce((total, forecast) => {
    return total + (forecast.predicted_sales || 0);
  }, 0) || 0;

  // Calculate current stock
  const currentStock = initialStock - totalQuantitySold;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Analysis Results
      </Typography>

      <Grid container spacing={3}>
        {/* Sales Forecast Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Sales Forecast
            </Typography>
            <Box>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Predicted Sales</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roundedSalesForecast?.map((forecast, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {new Date(forecast.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {Math.ceil(parseFloat(forecast.predicted_sales))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
            {/* Bar Chart for Sales Forecast */}
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roundedSalesForecast}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="predicted_sales" fill="#FF5733" shape={<CustomBar />} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        {/* Stockout Prediction Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Stockout Prediction
            </Typography>
            <Typography>
              Average Daily Sales:{" "}
              {stockoutPrediction?.avgDailySales
                ? stockoutPrediction.avgDailySales.toFixed(0)
                : "N/A"}
            </Typography>
            <Typography>
              Days until stockout:{" "}
              {stockoutPrediction?.stockoutDays
                ? stockoutPrediction.stockoutDays.toFixed(0)
                : "N/A"}
            </Typography>
            <Typography
              color={stockoutPrediction?.warning ? "error" : "success"}
            >
              {stockoutPrediction?.message}
            </Typography>
            <Typography>
              Current Stock: {currentStock >= 0 ? currentStock : 0} units
            </Typography>
          </Paper>
        </Grid>

        {/* Demand Analysis Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Demand Analysis
            </Typography>
            <Typography>
              Average Sales:{" "}
              {demandAnalysis?.avgSales
                ? demandAnalysis.avgSales.toFixed(0)
                : "N/A"}
            </Typography>
            <Typography>
              Maximum Sales:{" "}
              {demandAnalysis?.maxSales
                ? demandAnalysis.maxSales.toFixed(0)
                : "N/A"}
            </Typography>
            <Typography>
              Minimum Sales:{" "}
              {demandAnalysis?.minSales
                ? demandAnalysis.minSales.toFixed(0)
                : "N/A"}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// Custom Bar component to create sharp edges
const CustomBar = (props) => {
  const { x, y, width, height } = props;
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={props.fill}
      stroke="#000" // Optional: Add a stroke for better visibility
      strokeWidth={1} // Optional: Adjust stroke width
    />
  );
};

export default AnalysisResultsPage;
