const pd = require('pandas-js');
const tf = require('@tensorflow/tfjs-node');
const moment = require('moment');

const feature_engineering = (data) => {
    const dates = data.map(d => moment(d.date));
    return data.map((row, i) => ({
        ...row,
        day_of_year: moment(row.date).dayOfYear(),
        month: moment(row.date).month() + 1,
        day_of_week: moment(row.date).day(),
        is_weekend: [0, 6].includes(moment(row.date).day()) ? 1 : 0,
        is_holiday: isHoliday(row.date) ? 1 : 0,
        rolling_sales_7d: calculateRollingMean(data.slice(Math.max(0, i-7), i).map(d => d.quantity_sold)),
        lag_1: i > 0 ? data[i-1].quantity_sold : null,
        lag_3: i > 2 ? data[i-3].quantity_sold : null,
        lag_7: i > 6 ? data[i-7].quantity_sold : null
    }));
};

const isHoliday = (date) => {
    const holidays = ['2024-12-25', '2024-01-01'].map(d => moment(d).format('YYYY-MM-DD'));
    return holidays.includes(moment(date).format('YYYY-MM-DD'));
};

const calculateRollingMean = (values) => {
    if (!values.length) return null;
    return values.reduce((a, b) => a + b, 0) / values.length;
};

const sales_prediction = async (data, forecast_days = 7, brand = null, model = null) => {
    try {
        let filtered = data;
        if (brand) {
            filtered = filtered.filter(d => d.brand === brand);
        }
        if (model) {
            filtered = filtered.filter(d => d.model === model);
        }

        if (!filtered.length) {
            console.log(`No data available for brand '${brand}' and model '${model}'.`);
            return [];
        }

        const engineered = feature_engineering(filtered);
        const features = engineered.map(row => [
            row.day_of_year, row.month, row.day_of_week, 
            row.is_weekend, row.is_holiday, row.rolling_sales_7d,
            row.lag_1, row.lag_3, row.lag_7
        ]).filter(row => !row.includes(null));

        const labels = filtered.slice(features.length * -1).map(d => d.quantity_sold);

        // Create and train model
        const model = tf.sequential({
            layers: [
                tf.layers.dense({ units: 64, activation: 'relu', inputShape: [9] }),
                tf.layers.dense({ units: 32, activation: 'relu' }),
                tf.layers.dense({ units: 1 })
            ]
        });

        model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

        const xs = tf.tensor2d(features);
        const ys = tf.tensor2d(labels, [labels.length, 1]);

        await model.fit(xs, ys, { epochs: 50 });

        // Generate future dates and features
        const lastDate = moment(filtered[filtered.length - 1].date);
        const futureDates = Array.from({ length: forecast_days }, (_, i) => 
            lastDate.clone().add(i + 1, 'days')
        );

        const futureFeatures = futureDates.map(date => [
            date.dayOfYear(),
            date.month() + 1,
            date.day(),
            [0, 6].includes(date.day()) ? 1 : 0,
            isHoliday(date) ? 1 : 0,
            labels[labels.length - 1], // Use last known sales as rolling mean
            labels[labels.length - 1], // Use last known sale as lag_1
            labels[labels.length - 3], // lag_3
            labels[labels.length - 7]  // lag_7
        ]);

        const predictions = model.predict(tf.tensor2d(futureFeatures)).arraySync();

        return futureDates.map((date, i) => ({
            date: date.toDate(),
            predicted_sales: predictions[i][0]
        }));

    } catch (error) {
        console.error('Error in sales prediction:', error);
        return [];
    }
};

const stockout_prediction = async (data, brand, model, current_stock, reorder_threshold, lead_time) => {
    try {
        const filtered = data.filter(d => d.brand === brand && d.model === model);
        
        if (!filtered.length) {
            return {
                avgDailySales: 0,
                stockoutDays: 0,
                warning: true,
                message: `No data available for brand '${brand}' and model '${model}'.`
            };
        }

        const avgDailySales = filtered.reduce((sum, row) => sum + row.quantity_sold, 0) / filtered.length;
        const stockoutDays = current_stock / avgDailySales;

        const warning = stockoutDays < lead_time;
        const message = warning 
            ? "Warning: Stock may run out before new stock arrives. Consider reordering now."
            : "Stock level is sufficient until the next restock.";

        return {
            avgDailySales,
            stockoutDays,
            warning,
            message
        };
    } catch (error) {
        console.error('Error in stockout prediction:', error);
        return null;
    }
};

const demand_analysis = async (data, brand, model) => {
    try {
        const filtered = data.filter(d => d.brand === brand && d.model === model);
        
        if (!filtered.length) {
            return null;
        }

        const quantities = filtered.map(d => d.quantity_sold);
        return {
            avgSales: quantities.reduce((a, b) => a + b, 0) / quantities.length,
            maxSales: Math.max(...quantities),
            minSales: Math.min(...quantities)
        };
    } catch (error) {
        console.error('Error in demand analysis:', error);
        return null;
    }
};

module.exports = {
    sales_prediction,
    stockout_prediction,
    demand_analysis
};
