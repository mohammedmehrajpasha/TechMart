import React, { useEffect, useState } from "react";
import { orderService } from "../services/api";
import { Button } from "@mui/material";
import jsPDF from "jspdf";
import "jspdf-autotable";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderService.getUserOrders();
      console.log(response.data);
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

 const generateInvoice = (order) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Invoice", 90, 20);

  doc.setFontSize(12);
  doc.text("Customer: " + order.customer_name, 20, 30);
  doc.text("Order ID: " + order.mysql_order_id, 150, 30);
  doc.text("Date: " + new Date(order.created_at).toLocaleDateString(), 150, 40);

  doc.autoTable({
    startY: 50,
    head: [["Product Name", "Quantity", "Price"]],
    body: order.items?.map((item) => [
      item.product_name,
      item.quantity,
      `₹${(item.quantity * item.price_at_time).toFixed(2)}`,
    ]) || [],
  });

  const totalAmount = order.items?.reduce(
    (acc, item) => acc + item.quantity * item.price_at_time,
    0
  ).toFixed(2);

  doc.text(`Total Amount: ₹${totalAmount}`, 20, doc.autoTable.previous.finalY + 10);

  doc.save(`invoice_${order.mysql_order_id}.pdf`);
};



  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-4">Order History</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Order ID</th>
              <th className="border p-2">Date</th>
              <th className="border p-2">Total</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="text-center">
                <td className="border p-2">{order.mysql_order_id}</td>
                <td className="border p-2">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="border p-2">₹{order.total_amount}</td>
                <td className="border p-2">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => generateInvoice(order)}
                  >
                    Generate Invoice
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrderHistory;
