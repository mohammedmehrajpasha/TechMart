import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import {
  ChartBarIcon,
  ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/outline";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleReviewAnalysis = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5001/analyze-product-reviews/${id}`
      );
      console.log(response);
      if (!response.ok) throw new Error("Failed to fetch analysis");
      const analysisResult = await response.json();
      console.log(analysisResult);
      navigate("/analysis-results", { state: { analysis: analysisResult } });
    } catch (error) {
      console.error("Error analyzing reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductAnalysis = () => {
    navigate("/product-analysis", { state: { productId: id } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Product Analysis Dashboard
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Gain valuable insights into your product's performance through our
            comprehensive analysis tools
          </p>
        </div>

        {/* Analysis Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Review Analysis Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-transform hover:scale-105 hover:shadow-xl duration-300">
            <div className="p-8 flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <ChatBubbleBottomCenterTextIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Review Analysis
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Analyze customer feedback and sentiment to understand user
                satisfaction.
              </p>
              <button
                onClick={handleReviewAnalysis}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold 
                  hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <CircularProgress size={24} className="text-white" />
                ) : (
                  "Analyze Reviews"
                )}
              </button>
            </div>
          </div>

          {/* Product Analysis Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-transform hover:scale-105 hover:shadow-xl duration-300">
            <div className="p-8 flex flex-col items-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                <ChartBarIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Product Analysis
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Get detailed insights into product performance<br></br> and
                metrics.
              </p>
              <button
                onClick={handleProductAnalysis}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold 
                  hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Analyze Product
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Make Data-Driven Decisions
            </h2>
            <p className="text-gray-600">
              Our advanced analytics tools help you understand your product's
              performance, customer satisfaction, and market demand through
              comprehensive analysis and intuitive visualizations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
