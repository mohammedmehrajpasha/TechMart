import React, { useState, useEffect } from "react";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { cartService } from "../services/api";
import HistoryIcon from "@mui/icons-material/History";
const Navbar = () => {
  const navigate = useNavigate();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [openProfile, setOpenProfile] = useState(false);
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");
  const email = localStorage.getItem("email");

  useEffect(() => {
    fetchCartCount();
    const handleCartUpdate = () => {
      fetchCartCount();
    };
    window.addEventListener("cart-updated", handleCartUpdate);
    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
    };
  }, []);

  const fetchCartCount = async () => {
    try {
      const response = await cartService.getCart();
      setCartItemCount(response.data.length);
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
    navigate("/login");
  };

  return (
    <nav className="bg-gradient-to-r from-[#000428] to-[#004e92] shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0 transform hover:scale-105 transition-all duration-300">
            <h1
              className="text-white text-3xl font-extrabold cursor-pointer font-[IBM Plex Mono] flex items-center gap-2"
              onClick={() => navigate("/")}
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 hover:italic transition-all duration-300">
                TechMart
              </span>
            </h1>
          </div>

          <div className="flex items-center space-x-6">
            {token ? (
              <>
                {role === "admin" ? (
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => navigate("/admin")}
                      className="bg-white/10 text-white hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-semibold backdrop-blur-sm transition-all duration-300 border border-white/20 hover:border-white/40 flex items-center gap-2"
                    >
                      <DashboardIcon className="h-5 w-5" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => navigate("/admin/orders")}
                      className="bg-white/10 text-white hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-semibold backdrop-blur-sm transition-all duration-300 border border-white/20 hover:border-white/40 flex items-center gap-2"
                    >
                      <LocalShippingIcon className="h-5 w-5" />
                      Orders
                    </button>
                    <button
                      onClick={() => navigate("/products")}
                      className="bg-white/10 text-white hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-semibold backdrop-blur-sm transition-all duration-300 border border-white/20 hover:border-white/40 flex items-center gap-2"
                    >
                      <Inventory2Icon className="h-5 w-5" />
                      Products
                    </button>
                    <button
                      onClick={() => navigate("/admin/add-product")}
                      className="bg-white/10 text-white hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-semibold backdrop-blur-sm transition-all duration-300 border border-white/20 hover:border-white/40 flex items-center gap-2"
                    >
                      <AddCircleOutlineIcon className="h-5 w-5" />
                      Add Product
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={() => navigate("/products")}
                      className="bg-white/10 text-white hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-semibold backdrop-blur-sm transition-all duration-300 border border-white/20 hover:border-white/40 flex items-center gap-2"
                    >
                      <Inventory2Icon className="h-5 w-5" />
                      Products
                    </button>
                    <button
                      onClick={() => navigate("/cart")}
                      className="bg-white/10 text-white hover:bg-white/20 p-3 rounded-full transition-all duration-300 relative group border border-white/20 hover:border-white/40"
                    >
                      <ShoppingCartIcon className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                      {cartItemCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-[#000428]">
                          {cartItemCount}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => navigate("/OrderHistory")}
                      className="bg-white/10 text-white hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-semibold backdrop-blur-sm transition-all duration-300 border border-white/20 hover:border-white/40 flex items-center gap-2"
                    >
                      <HistoryIcon className="h-5 w-5" />
                      Order History
                    </button>
                    <button
                      onClick={() => setOpenProfile(true)}
                      className="bg-white/10 text-white hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 border border-white/20 hover:border-white/40 flex items-center gap-2"
                    >
                      <AccountCircleIcon className="h-5 w-5" />
                      Profile
                    </button>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-white/10 text-white hover:bg-red-600 px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-300 border border-white/20 hover:border-red-400 flex items-center gap-2"
                >
                  <LogoutIcon className="h-5 w-5" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate("/login")}
                  className="bg-white/10 text-white hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-semibold backdrop-blur-sm transition-all duration-300 border border-white/20 hover:border-white/40 flex items-center gap-2"
                >
                  <LoginIcon className="h-5 w-5" />
                  Login
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="bg-white/10 text-white hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-semibold backdrop-blur-sm transition-all duration-300 border border-white/20 hover:border-white/40 flex items-center gap-2"
                >
                  <PersonAddIcon className="h-5 w-5" />
                  Signup
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Dialog open={openProfile} onClose={() => setOpenProfile(false)}>
        <DialogTitle>Profile</DialogTitle>
        <DialogContent>
          <p>Email: {email}</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenProfile(false)} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </nav>
  );
};

export default Navbar;
