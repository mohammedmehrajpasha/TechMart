import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import axios from "axios";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Fetching orders..."); // Debug log

      const response = await axios.get("http://localhost:5000/api/orders/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Orders response:", response.data); // Debug log

      if (!Array.isArray(response.data)) {
        throw new Error("Invalid data format received from server");
      }

      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch orders"
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "processing":
        return "info";
      case "completed":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
        style={{ backgroundColor: "#E8E8E8" }}
      >
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box style={{ backgroundColor: "#E8E8E8", minHeight: "100vh" }}>
        <Container>
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        </Container>
      </Box>
    );

  return (
    <Box
      style={{
        backgroundColor: "#E8E8E8",
        minHeight: "100vh",
        paddingTop: "20px",
      }}
    >
      <Typography
        variant="h3"
        component="h1"
        className="text-[#0056D2] font-bold mb-8 macondo-regular"
        style={{ fontFamily: "Macondo, serif" }}
        gutterBottom
        sx={{
          fontWeight: 600,
          color: "#333",
          paddingLeft: 8,
        }}
      >
        Orders
      </Typography>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Order Management
          </Typography>

          {orders.length === 0 ? (
            <Alert severity="info">No orders found</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>User ID</TableCell>
                    <TableCell>Products</TableCell>
                    <TableCell>Total Amount</TableCell>
                    <TableCell>Shipping Address</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{formatDate(order.created_at)}</TableCell>
                      <TableCell>{order.user_id}</TableCell>
                      <TableCell>
                        {order.items &&
                          order.items.map((item, index) => (
                            <Box key={index} sx={{ mb: 1 }}>
                              {item.product_name} (x{item.quantity})
                            </Box>
                          ))}
                      </TableCell>
                      <TableCell>₹{order.total_amount}</TableCell>
                      <TableCell>{order.shipping_address}</TableCell>
                      <TableCell>{order.phone_number}</TableCell>
                      <TableCell>
                        <Chip
                          label={order.status}
                          color={getStatusColor(order.status)}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminOrders;
