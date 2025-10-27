from flask import Blueprint, jsonify, request
from services.sales_service import sales_forecast, demand_analysis

analysis_routes = Blueprint('analysis_routes', __name__)

@analysis_routes.route('/api/sales/forecast', methods=['POST'])
def sales_forecast_route():
    try:
        data = request.json
        if not data or 'sales_data' not in data:
            return jsonify({'error': 'No sales data provided'}), 400

        df = pd.DataFrame(data['sales_data'])
        df['date'] = pd.to_datetime(df['date'])
        df['quantity_sold'] = pd.to_numeric(df['quantity_sold'], errors='coerce').fillna(0)

        if df.empty:
            return jsonify({'error': 'Empty sales data provided'}), 400

        brand = data.get('brand', 'Unknown')
        model = data.get('model', 'Unknown')
        forecast_days = int(data.get('forecast_days', 14))

        # Feature engineering
        filtered = feature_engineering(df)

        feature_cols = [
            'day_of_year', 'month', 'day_of_week', 'is_weekend', 'is_holiday',
            'rolling_mean_7d', 'rolling_mean_30d', 'rolling_std_7d', 'rolling_std_30d',
            'trend_normalized', 'month_sin', 'month_cos', 'day_sin', 'day_cos',
            'lag_1', 'lag_3', 'lag_7', 'lag_14', 'lag_30'
        ]

        X = filtered[feature_cols]
        y = filtered['quantity_sold']

        # Ensure no NaN values and non-zero variance
        X = X.fillna(0)
        y = y.fillna(0)

        # Scale features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        # Train model
        model = GradientBoostingRegressor(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=3,
            random_state=42
        )

        model.fit(X_scaled, y)

        # Prepare future data
        last_date = filtered['date'].iloc[-1]
        future_dates = pd.date_range(start=last_date + pd.Timedelta(days=1), periods=forecast_days, freq='D')

        future_data = pd.DataFrame({'date': future_dates})
        future_data = feature_engineering(pd.concat([filtered, future_data], axis=0)).tail(forecast_days)

        X_future = future_data[feature_cols]
        X_future = X_future.fillna(0)

        X_future_scaled = scaler.transform(X_future)

        # Make predictions
        predictions = model.predict(X_future_scaled)
        predictions = np.maximum(predictions, 0)  # Ensure non-negative predictions

        # Prepare forecast data as a list of dictionaries
        forecast_data = []
        for date, pred in zip(future_dates, predictions):
            forecast_data.append({
                'date': date.strftime('%Y-%m-%d'),
                'predicted_sales': to_python_type(pred)
            })

        return jsonify({'forecast_data': forecast_data})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analysis_routes.route('/api/sales/demand-analysis', methods=['POST'])
def demand_analysis_route():
    try:
        data = request.json
        if not data or 'sales_data' not in data:
            return jsonify({'error': 'No sales data provided'}), 400

        df = pd.DataFrame(data['sales_data'])
        df['date'] = pd.to_datetime(df['date'])
        df['quantity_sold'] = pd.to_numeric(df['quantity_sold'], errors='coerce').fillna(0)

        if df.empty:
            return jsonify({'error': 'Empty sales data provided'}), 400

        # Calculate metrics
        stats = {
            'avg_sales': to_python_type(df['quantity_sold'].mean()),
            'median_sales': to_python_type(df['quantity_sold'].median()),
            'max_sales': to_python_type(df['quantity_sold'].max()),
            'min_sales': to_python_type(df['quantity_sold'].min()),
            'std_dev': to_python_type(df['quantity_sold'].std()),
            'total_sales': to_python_type(df['quantity_sold'].sum())
        }

        return jsonify({'statistics': stats})

    except Exception as e:
        return jsonify({'error': str(e)}), 500 