import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  AlertTitle,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Chip,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ReferenceLine,
} from "recharts";

const ProductAnalysisPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { productId, productName } = location.state;
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [salesData, setSalesData] = useState([]);
  const [leadTime, setLeadTime] = useState("7");
  const [loading, setLoading] = useState({
    forecast: false,
    demand: false,
    stockout: false,
  });
  const [error, setError] = useState("");
  const [analysisResults, setAnalysisResults] = useState({
    forecast: null,
    demand: null,
    stockout: null,
  });
  const [activeTab, setActiveTab] = useState(0);

  const handleCollectSalesDetails = async () => {
    console.log("Fetching sales details...");
    setLoading((prev) => ({
      ...prev,
      forecast: true,
      demand: true,
      stockout: true,
    }));
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/sales/sales-details/${productId}?startDate=${startDate}&endDate=${endDate}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch sales details");
      }
      const data = await response.json();
      console.log("Sales Data:", data);
      setSalesData(data);
    } catch (error) {
      setError("Error fetching sales details: " + error.message);
      console.error("Error fetching sales details:", error);
    } finally {
      setLoading((prev) => ({
        ...prev,
        forecast: false,
        demand: false,
        stockout: false,
      }));
    }
  };

  const transformData = () => {
    if (!salesData || !salesData.dailySales) return [];

    // Create an array of dates between start and end date
    const dates = [];
    let currentDate = new Date(startDate);
    const endDateObj = new Date(endDate);

    while (currentDate <= endDateObj) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Get the current stock level
    const currentStock = salesData.totalLeftInStock || 0;

    // Transform the data for each date
    return dates.map((date) => {
      const dateStr = date.toISOString().split("T")[0];
      const dailySale = salesData.dailySales.find(
        (item) =>
          new Date(item.saleDate).toISOString().split("T")[0] === dateStr
      );

      return {
        date: dateStr,
        brand: productName || "Unknown",
        model: productName || "Unknown",
        quantity_sold: dailySale
          ? parseInt(dailySale.dailyQuantitySold) || 0
          : 0,
        current_stock: currentStock,
      };
    });
  };

  const handleSalesPrediction = async () => {
    if (salesData.length === 0) {
      setError("Please collect sales data first");
      return;
    }

    setLoading((prev) => ({ ...prev, forecast: true }));
    setError("");

    try {
      const transformedData = transformData();
      console.log("Sending data:", transformedData);

      const response = await fetch("http://localhost:5001/api/sales/forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sales_data: transformedData,
          brand: productName || "Unknown",
          model: productName || "Unknown",
          forecast_days: 14,
        }),
      });

      if (!response.ok) {
        throw new Error("Sales prediction failed");
      }

      const data = await response.json();
      console.log("Received forecast data:", data);

      setAnalysisResults((prev) => {
        console.log("Updating analysis results:", { ...prev, forecast: data });
        return { ...prev, forecast: data };
      });
    } catch (error) {
      console.error("Error in sales prediction:", error);
      setError("Sales prediction failed: " + error.message);
    } finally {
      setLoading((prev) => ({ ...prev, forecast: false }));
    }
  };

  const handleDemandAnalysis = async () => {
    if (salesData.length === 0) {
      setError("Please collect sales data first");
      return;
    }

    setLoading((prev) => ({ ...prev, demand: true }));
    setError("");
    const transformedData = transformData();

    const requestBody = {
      sales_data: transformedData,
      brand: productName || "Unknown",
      model: productName || "Unknown",
    };

    try {
      const response = await fetch(
        "http://localhost:5001/api/sales/demand-analysis",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error("Demand analysis failed");
      }

      const data = await response.json();
      setAnalysisResults((prev) => ({ ...prev, demand: data }));
    } catch (error) {
      setError("Demand analysis failed: " + error.message);
      console.error("Error during demand analysis:", error);
    } finally {
      setLoading((prev) => ({ ...prev, demand: false }));
    }
  };

  const handleStockoutPrediction = async () => {
    if (!salesData || !salesData.dailySales) {
      setError("Please collect sales data first");
      return;
    }

    setLoading((prev) => ({ ...prev, stockout: true }));
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5001/api/sales/stockout-prediction",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sales_data: transformData(),
            brand: productName || "Unknown",
            model: productName || "Unknown",
            current_stock: parseInt(salesData.totalLeftInStock) || 0,
            lead_time: parseInt(leadTime) || 7,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Stockout prediction failed");
      }

      const data = await response.json();
      setAnalysisResults((prev) => ({ ...prev, stockout: data }));
    } catch (error) {
      setError("Stockout prediction failed: " + error.message);
      console.error("Error during stockout prediction:", error);
    } finally {
      setLoading((prev) => ({ ...prev, stockout: false }));
    }
  };

  const handleTabChange = (newValue) => {
    setActiveTab(newValue);
  };

  const renderAnalysisButtons = () => (
    <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
      <Button
        variant={activeTab === 0 ? "contained" : "outlined"}
        color="primary"
        onClick={() => {
          handleTabChange(0);
          handleSalesPrediction();
        }}
        disabled={loading.forecast || salesData.length === 0}
        startIcon={loading.forecast && <CircularProgress size={20} />}
      >
        {loading.forecast ? "Predicting..." : "Sales Prediction"}
      </Button>
      <Button
        variant={activeTab === 1 ? "contained" : "outlined"}
        color="secondary"
        onClick={() => {
          handleTabChange(1);
          handleDemandAnalysis();
        }}
        disabled={loading.demand || salesData.length === 0}
        startIcon={loading.demand && <CircularProgress size={20} />}
      >
        {loading.demand ? "Analyzing..." : "Demand Analysis"}
      </Button>
      <Button
        variant={activeTab === 2 ? "contained" : "outlined"}
        color="warning"
        onClick={() => {
          handleTabChange(2);
          handleStockoutPrediction();
        }}
        disabled={loading.stockout || salesData.length === 0}
        startIcon={loading.stockout && <CircularProgress size={20} />}
      >
        {loading.stockout ? "Predicting..." : "Stockout Prediction"}
      </Button>
    </Box>
  );

  const renderActiveAnalysis = () => {
    console.log("Active tab:", activeTab);
    console.log("Analysis results:", analysisResults);

    switch (activeTab) {
      case 0:
        return (
          <Box sx={{ width: "100%" }}>
            {loading.forecast ? (
              <CircularProgress />
            ) : (
              analysisResults.forecast &&
              renderSalesChart(analysisResults.forecast)
            )}
          </Box>
        );

      case 1:
        return (
          <Box sx={{ width: "100%" }}>
            {loading.demand ? (
              <CircularProgress />
            ) : (
              analysisResults.demand &&
              renderDemandAnalysisChart(analysisResults.demand)
            )}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ width: "100%" }}>
            {loading.stockout ? (
              <CircularProgress />
            ) : (
              analysisResults.stockout &&
              renderStockoutAnalysis(analysisResults.stockout)
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  const renderSalesChart = (data) => {
    console.log("Rendering sales chart with data:", data);

    if (!data || (!data.forecast_data && !data.historical_data)) {
      console.log("No data available for sales chart");
      return null;
    }

    // Format the data for the chart
    const combinedChartData = [
      ...(data.historical_data || []).map((item) => ({
        date: item.date,
        historical: item.actual_sales || 0,
        forecast: null
      })),
      ...(data.forecast_data || []).map((item) => ({
        date: item.date,
        historical: null,
        forecast: item.predicted_sales || 0
      })),
    ];

    console.log("Combined chart data:", combinedChartData);

    return (
      <Box sx={{ width: "100%", mt: 2 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Sales Forecast Analysis
            </Typography>

            {/* Chart */}
            <Box sx={{ height: 400, width: "100%" }}>
              <ResponsiveContainer>
                <LineChart data={combinedChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(str) => new Date(str).toLocaleDateString()}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(str) => new Date(str).toLocaleDateString()}
                    formatter={(value) => [`${value} units`]}
                  />
                  <Legend />
                  <Line
                    type="linear"
                    dataKey="historical"
                    stroke="#8884d8"
                    name="Historical Sales"
                    dot={{ stroke: '#8884d8', strokeWidth: 1, r: 4 }}
                    strokeWidth={1.5}
                    connectNulls={false}
                    isAnimationActive={false}
                  />
                  <Line
                    type="linear"
                    dataKey="forecast"
                    stroke="#FF0000"
                    name="Forecasted Sales"
                    dot={{ stroke: '#FF0000', strokeWidth: 1, r: 4 }}
                    strokeWidth={1.5}
                    connectNulls={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>

            {/* Summary Statistics */}
            <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Chip
                label={`Historical Data Points: ${
                  data.historical_data?.length || 0
                }`}
                color="primary"
                variant="outlined"
              />
              <Chip
                label={`Forecast Data Points: ${
                  data.forecast_data?.length || 0
                }`}
                color="secondary"
                variant="outlined"
              />
            </Box>

            {/* Data Table */}
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Sales</TableCell>
                    <TableCell align="right">Type</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {combinedChartData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {new Date(row.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        {row.historical || row.forecast}
                      </TableCell>
                      <TableCell align="right">
                        {row.historical !== null ? "Historical" : "Forecast"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    );
  };

  const renderDemandAnalysisChart = (data) => {
    if (!data || !data.trend_data || !data.statistics) {
      console.log("No data available for demand analysis");
      return null;
    }

    const chartData = data.trend_data.map((item) => ({
      date: item.date,
      sales: item.sales,
      MA7: item.MA7,
      MA30: item.MA30,
    }));

    return (
      <Card sx={{ mt: 3, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Demand Analysis
        </Typography>

        <Box sx={{ height: 400, width: "100%", mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Sales Trend with Moving Average
          </Typography>
          <ResponsiveContainer>
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(str) => new Date(str).toLocaleDateString()}
              />
              <YAxis type="number" domain={[0, "auto"]} allowDecimals={false} />
              <Tooltip
                labelFormatter={(str) => new Date(str).toLocaleDateString()}
                formatter={(value, name) => [
                  `${Number(value).toFixed(1)} units`,
                  name === "MA7"
                    ? "7-Day Moving Average"
                    : name === "MA30"
                    ? "30-Day Moving Average"
                    : "Daily Sales",
                ]}
              />
              <Legend />
              <Line
                type="linear"
                dataKey="sales"
                stroke="#8884d8"
                name="Daily Sales"
                dot={{ stroke: '#8884d8', strokeWidth: 1, r: 4 }}
                strokeWidth={1.5}
                isAnimationActive={false}
              />
              <Line
                type="linear"
                dataKey="MA7"
                stroke="#82ca9d"
                name="7-Day Moving Average"
                dot={{ stroke: '#82ca9d', strokeWidth: 1, r: 4 }}
                strokeWidth={1.5}
                connectNulls
                isAnimationActive={false}
              />
              <Line
                type="linear"
                dataKey="MA30"
                stroke="#ffc658"
                name="30-Day Moving Average"
                dot={{ stroke: '#ffc658', strokeWidth: 1, r: 4 }}
                strokeWidth={1.5}
                connectNulls
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: "center",
            mb: 3,
          }}
        >
          <Chip
            label={`Average Sales: ${data.statistics.avg_sales.toFixed(
              1
            )} units/day`}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`Max Sales: ${data.statistics.max_sales} units`}
            color="success"
            variant="outlined"
          />
          <Chip
            label={`Min Sales: ${data.statistics.min_sales} units`}
            color="warning"
            variant="outlined"
          />
          <Chip
            label={`Total Sales: ${data.statistics.total_sales} units`}
            color="info"
            variant="outlined"
          />
        </Box>

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell align="right">Sales (units)</TableCell>
                <TableCell align="right">7-Day MA</TableCell>
                <TableCell align="right">30-Day MA</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.trend_data.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {new Date(row.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">{row.sales}</TableCell>
                  <TableCell align="right">
                    {row.MA7 ? row.MA7.toFixed(1) : "N/A"}
                  </TableCell>
                  <TableCell align="right">
                    {row.MA30 ? row.MA30.toFixed(1) : "N/A"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    );
  };

  const renderStockoutAnalysis = (data) => {
    if (!data || !data.metrics) return null;

    // Get risk level directly from the data
    const riskLevel = data.stockout_risk.toLowerCase();

    return (
      <Card sx={{ mt: 3, p: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Stockout Analysis
          </Typography>

          {/* Risk Warning Alert based on stockout_risk */}
          {data.alert && (
            <Alert
              severity={
                riskLevel === "high"
                  ? "error"
                  : riskLevel === "medium"
                  ? "warning"
                  : "success"
              }
              sx={{ mb: 2 }}
            >
              <AlertTitle>
                {riskLevel === "high"
                  ? "Critical Stock Level Warning!"
                  : riskLevel === "medium"
                  ? "Stock Level Warning"
                  : "Healthy Stock Levels"}
              </AlertTitle>
              {riskLevel === "high" && (
                <>
                  <strong>Immediate Action Required:</strong>
                  <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
                    <li>Current stock: {data.metrics.current_stock} units</li>
                    <li>
                      Estimated stockout in{" "}
                      {data.metrics.days_until_stockout.toFixed(1)} days
                    </li>
                    <li>Place new order immediately</li>
                  </ul>
                </>
              )}
              {riskLevel === "medium" && "Consider placing a new order soon."}
              {riskLevel === "low" &&
                "Stock levels are sufficient for projected demand."}
            </Alert>
          )}

          {/* Metrics Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    Current Status
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Current Stock: {data.metrics.current_stock} units
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Average Daily Sales:{" "}
                    {data.metrics.avg_daily_sales.toFixed(2)} units
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Days until Stockout:{" "}
                    {data.metrics.days_until_stockout.toFixed(1)} days
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1,
                      fontWeight: "bold",
                      color:
                        riskLevel === "high"
                          ? "error.main"
                          : riskLevel === "medium"
                          ? "warning.main"
                          : "success.main",
                    }}
                  >
                    Stockout Risk: {data.stockout_risk}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography
                    variant="subtitle1"
                    color="secondary"
                    gutterBottom
                  >
                    Inventory Metrics
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Safety Stock: {Math.round(data.metrics.safety_stock)} units
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Reorder Point: {Math.round(data.metrics.reorder_point)} units
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Max Daily Sales: {data.metrics.max_daily_sales} units
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Action Recommendations for high risk */}
          {riskLevel === "high" && (
            <Box sx={{ mb: 3 }}>
              <Alert severity="info">
                <AlertTitle>Recommended Actions</AlertTitle>
                <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
                  <li>
                    Place order for at least{" "}
                    {Math.round(
                      data.metrics.reorder_point - data.metrics.current_stock
                    )}{" "}
                    units
                  </li>
                  <li>Consider expedited shipping options</li>
                  <li>Monitor daily sales closely</li>
                </ul>
              </Alert>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderDailySalesGraph = () => {
    if (!salesData || !salesData.dailySales) return null;

    return (
      <Card sx={{ mt: 2, mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Historical Daily Sales
          </Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={salesData.dailySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="saleDate"
                  tickFormatter={(str) => new Date(str).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(str) => new Date(str).toLocaleDateString()}
                  formatter={(value) => [`${value} units`, "Daily Sales"]}
                />
                <Bar
                  dataKey="dailyQuantitySold"
                  fill="#8884d8"
                  name="Daily Sales"
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Product Analysis - {productName}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          type="date"
          label="Start Date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          type="date"
          label="End Date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ max: new Date().toISOString().split("T")[0] }}
        />
        <Button
          variant="contained"
          onClick={handleCollectSalesDetails}
          disabled={
            loading.forecast ||
            loading.demand ||
            loading.stockout ||
            !startDate ||
            !endDate
          }
        >
          {loading.forecast || loading.demand || loading.stockout
            ? "Collecting..."
            : "Collect Sales Details"}
        </Button>
      </Box>

      {salesData.length > 0 && (
        <>
          {renderAnalysisButtons()}
          <Box sx={{ mt: 2 }}>{renderActiveAnalysis()}</Box>
        </>
      )}

      {/* Show sales details table when data is available */}
      {salesData && (
        <TableContainer component={Paper} sx={{ mt: 2, mb: 2 }}>
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell>Product Name</TableCell>
                <TableCell align="right">Quantity Sold</TableCell>
                <TableCell align="right">Current Stock</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{salesData.name}</TableCell>
                <TableCell align="right">{salesData.quantitySold}</TableCell>
                <TableCell align="right">
                  {salesData.totalLeftInStock}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Daily sales graph */}
      {salesData && renderDailySalesGraph()}

      {/* Keep all existing analysis buttons and functionality */}
      {salesData && (
        <>
          {renderAnalysisButtons()}
          <Box sx={{ mt: 2 }}>{renderActiveAnalysis()}</Box>
        </>
      )}
    </Box>
  );
};

export default ProductAnalysisPage;
