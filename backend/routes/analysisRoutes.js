const express = require('express');
const router = express.Router();
const { sales_prediction, stockout_prediction, demand_analysis } = require('../models/analysis');
const auth = require('../middleware/auth');

router.post('/analyze', auth, async (req, res) => {
    try {
        const { salesData, reorderFrequency, startDate, endDate } = req.body;

        // Convert sales data to the format expected by the model
        const formattedData = salesData.map(sale => ({
            date: new Date(sale.date),
            brand: sale.brand,
            model: sale.model,
            quantity_sold: sale.quantity_sold,
            current_stock: sale.current_stock
        }));

        // Run analysis
        const salesForecast = await sales_prediction(formattedData, 7, salesData[0].brand, salesData[0].model);
        
        const stockoutPrediction = await stockout_prediction(
            formattedData,
            salesData[0].brand,
            salesData[0].model,
            salesData[0].current_stock,
            reorderFrequency,
            7 // lead time in days
        );

        const demandAnalysis = await demand_analysis(formattedData, salesData[0].brand, salesData[0].model);

        res.json({
            salesForecast,
            stockoutPrediction,
            demandAnalysis
        });
    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ message: 'Analysis failed', error: error.message });
    }
});

module.exports = router;
