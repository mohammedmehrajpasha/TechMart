from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import joblib
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
import requests
import json
from collections import Counter
import mysql.connector
from datetime import datetime
import pandas as pd
import numpy as np
from sklearn.model_selection import cross_val_score, TimeSeriesSplit
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
import io
import base64
from io import BytesIO
from scipy.ndimage import gaussian_filter1d

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Database configuration
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'meraj',
    'database': 'store'
}

# Load the sentiment analysis model and vectorizer
try:
    sentiment_model = load_model('sentiment_model_v3.h5')
    vectorizer = joblib.load('vectorizer_v3.pkl')
    sentiment_labels = ['Positive', 'Neutral', 'Negative']
except Exception as e:
    print(f"Error loading models: {e}")

class ProductImprovementSystem:
    def __init__(self, api_key):
        self.api_key = api_key
        self.gemini_api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
        self.headers = {'Content-Type': 'application/json'}

    def analyze_reviews(self, reviews):
        combined_reviews = " ".join(reviews)
        prompt = f"""
       Analyze the following customer reviews and provide precise, actionable improvement suggestions. For each issue identified, respond in the following format:

        **Issue**: [Brief description of the problem]
        **Improvement**: [Specific action or improvement]

        Ensure the following:
        - Focus on the most common and critical issues.
        - Provide concise and realistic suggestions.
        - Avoid unnecessary explanations or fluff.


        Reviews: {combined_reviews}
        """
        return self.get_suggestion_from_api(prompt)



    def get_suggestion_from_api(self, prompt):
        data = {
            "contents": [{"parts": [{"text": prompt}]}]
        }
        try:
            response = requests.post(
                f"{self.gemini_api_url}?key={self.api_key}",
                headers=self.headers,
                data=json.dumps(data)
            )
            if response.status_code == 200:
                response_json = response.json()
                suggestion = response_json.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", None)
                return suggestion.strip() if suggestion else "No actionable suggestion generated."
            else:
                return f"Error: {response.status_code} - {response.text}"
        except requests.exceptions.RequestException as e:
            return f"An error occurred: {e}"

# Initialize the Product Improvement System
api_key = "AIzaSyD7mPGem7KTtks2bOZ0cIeoxYNWhchDnPk"  
improvement_system = ProductImprovementSystem(api_key)

def get_db_connection():
    try:
        return mysql.connector.connect(**db_config)
    except mysql.connector.Error as err:
        print(f"Database connection error: {err}")
        return None

def predict_sentiment(review):
    try:
        review = review.lower().strip()
        review_tfidf = vectorizer.transform([review])
        prediction = sentiment_model.predict(review_tfidf)
        max_index = np.argmax(prediction)
        return sentiment_labels[max_index]
    except Exception as e:
        print(f"Error in sentiment prediction: {e}")
        return "Neutral"

def extract_common_problems(reviews):
    common_keywords = {
        "quality": ["poor", "bad", "low", "inconsistent"],
        "price": ["expensive", "costly", "overpriced"],
        "delivery": ["late", "delayed", "slow"],
        "durability": ["broke", "broken", "weak", "fragile"],
        "customer service": ["unhelpful", "rude", "unresponsive"],
        "usability": ["difficult", "complicated", "confusing"],
        "performance": ["slow", "laggy", "inefficient"]
    }
    
    problems = []
    for review in reviews:
        review_lower = review.lower()
        for category, keywords in common_keywords.items():
            if any(keyword in review_lower for keyword in keywords):
                problems.append(category)
    
    problem_counts = Counter(problems)
    return problem_counts.most_common(5)

def to_python_type(obj):
    """Convert numpy types to Python native types"""
    if isinstance(obj, (np.intc, np.intp, np.int8,
                        np.int16, np.int32, np.int64,
                        np.uint8, np.uint16, np.uint32, np.uint64)):
        return int(obj)
    elif isinstance(obj, (np.float16, np.float32, np.float64, float)):
        return float(obj)
    elif isinstance(obj, (np.bool_)):
        return bool(obj)
    elif isinstance(obj, (np.ndarray,)):
        return obj.tolist()
    return obj


@app.route('/api/reviews/<int:product_id>', methods=['GET'])
def get_product_reviews(product_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT r.*, u.username 
            FROM reviews r 
            JOIN users u ON r.user_id = u.id 
            WHERE r.product_id = %s
        """, (product_id,))
        reviews = cursor.fetchall()
        return jsonify(reviews)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/analyze-product-reviews/<int:product_id>', methods=['GET'])
def analyze_product_reviews(product_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        # Fetch reviews for the specific product
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT r.feedback, r.rating, r.created_at, p.name as product_name
            FROM reviews r
            JOIN products p ON r.product_id = p.id
            WHERE r.product_id = %s
        """, (product_id,))
        reviews = cursor.fetchall()

        if not reviews:
            return jsonify({
                'sentiment_analysis': {
                    'positive': 0,
                    'neutral': 0,
                    'negative': 0,
                    'total_reviews': 0
                },
                'common_problems': [],
                'improvement_suggestion': "No reviews available for analysis.",
                'analysis_timestamp': datetime.now().isoformat()
            }), 200  

        # Extract review texts
        review_texts = [review['feedback'] for review in reviews if review['feedback']]

        if not review_texts:
            return jsonify({
                'sentiment_analysis': {
                    'positive': 0,
                    'neutral': 0,
                    'negative': 0,
                    'total_reviews': 0
                },
                'common_problems': [],
                'improvement_suggestion': "No text reviews available for analysis.",
                'analysis_timestamp': datetime.now().isoformat()
            }), 200

        # Analyze sentiments
        sentiments = [predict_sentiment(review) for review in review_texts]
        sentiment_counts = Counter(sentiments)

        # Extract common problems
        common_problems = extract_common_problems(review_texts)
        problems_formatted = [f"{problem}: {count} mentions" for problem, count in common_problems]

        # Get improvement suggestions
        suggestion = improvement_system.analyze_reviews(review_texts)

        # Prepare detailed response
        response = {
            'product_name': reviews[0]['product_name'] if reviews else 'Unknown Product',
            'sentiment_analysis': {
                'positive': sentiment_counts['Positive'],
                'neutral': sentiment_counts['Neutral'],
                'negative': sentiment_counts['Negative'],
                'total_reviews': len(review_texts)
            },
            'common_problems': problems_formatted,
            'improvement_suggestion': suggestion,
            'analysis_timestamp': datetime.now().isoformat()
        }

        return jsonify(response), 200

    except Exception as e:
        print(f"Error in analyze_product_reviews: {str(e)}")  
        return jsonify({
            'error': str(e),
            'message': 'An error occurred during analysis'
        }), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

_LAST_PREDICTIONS = {}
_MODEL_CACHE = {}
_BASE_PREDICTIONS = {}

def get_cached_model(key, params):
    """Get or create a model with consistent random state"""
    if key not in _MODEL_CACHE:
        _MODEL_CACHE[key] = GradientBoostingRegressor(**params)
    return _MODEL_CACHE[key]

def feature_engineering(data):
    # Create a complete date range without gaps
    date_range = pd.date_range(start=data['date'].min(), end=data['date'].max(), freq='D')
    complete_data = pd.DataFrame({'date': date_range})
    data = pd.merge(complete_data, data, on='date', how='left')
    
    # Fill missing values in categorical columns
    if 'brand' in data.columns:
        data['brand'].fillna(method='ffill', inplace=True)
    if 'model' in data.columns:
        data['model'].fillna(method='ffill', inplace=True)
    
    # Basic time features
    data['day_of_year'] = data['date'].dt.dayofyear
    data['month'] = data['date'].dt.month
    data['day_of_week'] = data['date'].dt.dayofweek
    data['is_weekend'] = data['day_of_week'].isin([5, 6]).astype(int)
    
    # Holiday features (expanded list)
    holidays = pd.to_datetime([
        '2024-01-01',  # New Year's Day
        '2024-01-26',  # Republic Day
        '2024-08-15',  # Independence Day
        '2024-10-02',  # Gandhi Jayanti
        '2024-12-25'   # Christmas
    ])
    data['is_holiday'] = data['date'].isin(holidays).astype(int)
    
    # Handle missing values in quantity_sold using linear interpolation
    data['quantity_sold'] = data['quantity_sold'].fillna(method='ffill').fillna(method='bfill')
    data['quantity_sold'] = data['quantity_sold'].interpolate(method='linear')
    
    # Advanced features
    data['rolling_mean_7d'] = data['quantity_sold'].rolling(window=7, min_periods=1, center=True).mean()
    data['rolling_mean_30d'] = data['quantity_sold'].rolling(window=30, min_periods=1, center=True).mean()
    data['rolling_std_7d'] = data['quantity_sold'].rolling(window=7, min_periods=1, center=True).std()
    data['rolling_std_30d'] = data['quantity_sold'].rolling(window=30, min_periods=1, center=True).std()
    
    # Trend features
    data['trend'] = np.arange(len(data))
    data['trend_normalized'] = (data['trend'] - data['trend'].mean()) / data['trend'].std()
    
    # Seasonal features
    data['month_sin'] = np.sin(2 * np.pi * data['month']/12)
    data['month_cos'] = np.cos(2 * np.pi * data['month']/12)
    data['day_sin'] = np.sin(2 * np.pi * data['day_of_year']/365)
    data['day_cos'] = np.cos(2 * np.pi * data['day_of_year']/365)
    
    # Lag features
    for lag in [1, 3, 7, 14, 30]:
        data[f'lag_{lag}'] = data['quantity_sold'].shift(lag)
        data[f'lag_{lag}'].fillna(data['rolling_mean_7d'], inplace=True)
    
    return data

def sales_prediction(data, forecast_days=7, brand=None, model=None):
    # Create a unique key for this brand/model combination
    prediction_key = f"{brand}_{model}"
    
    filtered = data.copy()
    if brand:
        filtered = filtered[filtered['brand'] == brand]
    if model:
        filtered = filtered[filtered['model'] == model]

    if filtered.empty:
        return {
            'error': "No data available for the specified brand and model.",
            'forecast': None,
            'cv_scores': None
        }

    # Set random seed for numpy operations
    np.random.seed(42)
    
    # Feature engineering with simplified features
    filtered['date'] = pd.to_datetime(filtered['date'])
    filtered['day_of_week'] = filtered['date'].dt.dayofweek
    filtered['month'] = filtered['date'].dt.month
    filtered['is_weekend'] = filtered['day_of_week'].isin([5, 6]).astype(int)
    
    # Calculate baseline metrics
    overall_mean = filtered['quantity_sold'].mean()
    recent_mean = filtered['quantity_sold'].tail(30).mean()
    
    # Create base features
    feature_cols = ['day_of_week', 'month', 'is_weekend']
    
    # Calculate moving averages
    filtered['ma7'] = filtered['quantity_sold'].rolling(window=7, min_periods=1).mean()
    filtered['ma30'] = filtered['quantity_sold'].rolling(window=30, min_periods=1).mean()
    feature_cols.extend(['ma7', 'ma30'])
    
    X = filtered[feature_cols]
    y = filtered['quantity_sold']

    # Get or create cached model
    if prediction_key not in _MODEL_CACHE:
        _MODEL_CACHE[prediction_key] = GradientBoostingRegressor(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=3,
            random_state=42
        )
        
    model = _MODEL_CACHE[prediction_key]
    
    # Prepare future data
    last_date = filtered['date'].iloc[-1]
    future_dates = pd.date_range(start=last_date + pd.Timedelta(days=1),
                               periods=forecast_days, freq='D')
    
    future_data = pd.DataFrame({'date': future_dates})
    future_data['day_of_week'] = future_data['date'].dt.dayofweek
    future_data['month'] = future_data['date'].dt.month
    future_data['is_weekend'] = future_data['day_of_week'].isin([5, 6]).astype(int)
    
    # Use recent averages for MA features
    future_data['ma7'] = filtered['quantity_sold'].tail(7).mean()
    future_data['ma30'] = filtered['quantity_sold'].tail(30).mean()
    
    # If we have base predictions, use them
    if prediction_key in _BASE_PREDICTIONS:
        predictions = _BASE_PREDICTIONS[prediction_key]
    else:
        # Train model and make predictions
        model.fit(X, y)
        predictions = model.predict(future_data[feature_cols])
        _BASE_PREDICTIONS[prediction_key] = predictions
    
    # Apply consistency adjustments
    if prediction_key in _LAST_PREDICTIONS:
        last_preds = _LAST_PREDICTIONS[prediction_key]
        # Strong smoothing with previous predictions (90% previous, 10% new)
        predictions = 0.9 * last_preds + 0.1 * predictions
    
    # Ensure predictions are within reasonable bounds
    min_val = max(1.0, overall_mean * 0.5)  # At least 1.0 or 50% of mean
    max_val = overall_mean * 2.0  # Maximum 200% of mean
    predictions = np.clip(predictions, min_val, max_val)
    
    # Apply day-of-week patterns consistently
    dow_patterns = filtered.groupby('day_of_week')['quantity_sold'].mean()
    dow_factors = dow_patterns / dow_patterns.mean()
    
    for i, date in enumerate(future_dates):
        predictions[i] *= dow_factors.get(date.dayofweek, 1.0)
    
    # Round predictions to 2 decimal places
    final_predictions = np.round(predictions, 2)
    
    # Store predictions for next run
    _LAST_PREDICTIONS[prediction_key] = final_predictions
    
    # Create forecast DataFrame
    forecast = pd.DataFrame({
        'date': future_dates,
        'predicted_sales': final_predictions
    })

    return {
        'forecast': forecast.to_dict('records'),
        'cv_scores': {
            'mean': float(overall_mean),
            'recent_mean': float(recent_mean)
        }
    }

def demand_analysis(data, brand, model):
    filtered = data[(data['brand'] == brand) & (data['model'] == model)].copy()
    
    if filtered.empty:
        return {
            'error': "No data available for the specified brand and model.",
            'stats': None,
            'moving_averages': None
        }

    # Calculate statistics
    stats_dict = {
        'average_sales': float(filtered['quantity_sold'].mean()),
        'median_sales': float(filtered['quantity_sold'].median()),
        'maximum_sales': float(filtered['quantity_sold'].max()),
        'minimum_sales': float(filtered['quantity_sold'].min()),
        'standard_deviation': float(filtered['quantity_sold'].std()),
        'total_sales': float(filtered['quantity_sold'].sum())
    }

    # Calculate moving averages
    filtered['MA7'] = filtered['quantity_sold'].rolling(window=7, center=True).mean()
    filtered['MA30'] = filtered['quantity_sold'].rolling(window=30, center=True).mean()
    
    # Get recent moving averages
    ma_data = filtered[['date', 'quantity_sold', 'MA7', 'MA30']].tail(10)

    return {
        'stats': stats_dict,
        'moving_averages': ma_data.to_dict('records')
    }

def stockout_prediction(data, brand, model, current_stock, reorder_threshold, lead_time):
    filtered = data[(data['brand'] == brand) & (data['model'] == model)].copy()
    
    if filtered.empty:
        return {
            'error': "No data available for the specified brand and model.",
            'metrics': None,
            'recommendations': None
        }

    # Calculate metrics
    avg_daily_sales = float(filtered['quantity_sold'].mean())
    std_daily_sales = float(filtered['quantity_sold'].std())
    max_daily_sales = float(filtered['quantity_sold'].max())
    safety_stock = float(2 * std_daily_sales * np.sqrt(lead_time))
    reorder_point = float((avg_daily_sales * lead_time) + safety_stock)
    
    # Calculate days until stockout
    avg_case_days = float(current_stock / avg_daily_sales if avg_daily_sales > 0 else float('inf'))
    worst_case_days = float(current_stock / max_daily_sales if max_daily_sales > 0 else float('inf'))
    
    metrics = {
        'current_stock': current_stock,
        'avg_daily_sales': avg_daily_sales,
        'max_daily_sales': max_daily_sales,
        'safety_stock': safety_stock,
        'reorder_point': reorder_point,
        'avg_case_days': avg_case_days,
        'worst_case_days': worst_case_days
    }

    # Generate recommendations
    if current_stock <= reorder_point:
        recommendations = {
            'status': 'alert',
            'message': f"Stock level ({current_stock}) is at or below reorder point ({reorder_point:.1f})",
            'action': f"Place order within {lead_time} days to avoid stockout"
        }
    else:
        days_until_reorder = (current_stock - reorder_point) / avg_daily_sales
        recommendations = {
            'status': 'ok',
            'message': "Stock level is adequate",
            'action': f"Next reorder in approximately {days_until_reorder:.1f} days"
        }

    return {
        'metrics': metrics,
        'recommendations': recommendations
    }

@app.route('/api/sales/forecast', methods=['POST'])
def sales_forecast():
    try:
        data = request.json
        if not data or 'sales_data' not in data:
            return jsonify({'error': 'No sales data provided'}), 400

        # Convert sales data to DataFrame
        df = pd.DataFrame(data['sales_data'])
        if df.empty:
            return jsonify({'error': 'Empty sales data provided'}), 400

        df['date'] = pd.to_datetime(df['date'])
        df['quantity_sold'] = pd.to_numeric(df['quantity_sold'], errors='coerce').fillna(0)
        
        # Ensure we have enough data points
        if len(df) < 3:  # Minimum required for meaningful forecast
            return jsonify({
                'forecast_data': [],
                'error': 'Not enough data points for forecast'
            }), 200

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
        
        # Add small random noise to prevent zero variance
        for col in X.columns:
            if X[col].std() == 0:
                X[col] = X[col] + np.random.normal(0, 0.0001, size=len(X))

        # Scale features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        # Train model with simpler parameters for small datasets
        model = GradientBoostingRegressor(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=3,
            min_samples_split=2,
            min_samples_leaf=1,
            subsample=1.0,
            random_state=42
        )

        model.fit(X_scaled, y)

        # Prepare future data
        last_date = filtered['date'].iloc[-1]
        future_dates = pd.date_range(start=last_date + pd.Timedelta(days=1),
                                   periods=forecast_days, freq='D')
        
        future_data = pd.DataFrame({'date': future_dates})
        future_data = feature_engineering(pd.concat([filtered, future_data], axis=0)).tail(forecast_days)
        
        X_future = future_data[feature_cols]
        X_future = X_future.fillna(0)
        
        # Add small random noise to prevent zero variance
        for col in X_future.columns:
            if X_future[col].std() == 0:
                X_future[col] = X_future[col] + np.random.normal(0, 0.0001, size=len(X_future))
        
        X_future_scaled = scaler.transform(X_future)
        
        # Make predictions
        predictions = model.predict(X_future_scaled)
        predictions = np.maximum(predictions, 0)  # Ensure non-negative predictions
        smoothed_predictions = gaussian_filter1d(predictions, sigma=0.8)

        # Prepare forecast data as a list of dictionaries
        forecast_data = []
        for date, pred in zip(future_dates, smoothed_predictions):
            forecast_data.append({
                'date': date.strftime('%Y-%m-%d'),
                'predicted_sales': to_python_type(pred)
            })

        return jsonify({
            'forecast_data': forecast_data,
            'historical_data': [{
                'date': row['date'].strftime('%Y-%m-%d'),
                'actual_sales': to_python_type(row['quantity_sold'])
            } for _, row in filtered.iterrows()]
        })

    except Exception as e:
        print(f"Forecast error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/sales/demand-analysis', methods=['POST'])
def demand_analysis():
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

        # Calculate daily trends
        daily_sales = df.groupby('date')['quantity_sold'].sum().reset_index()
        daily_sales['date'] = daily_sales['date'].dt.strftime('%Y-%m-%d')
        
        # Calculate moving averages
        df['MA7'] = df['quantity_sold'].rolling(window=7, min_periods=1).mean()
        df['MA30'] = df['quantity_sold'].rolling(window=30, min_periods=1).mean()

        trend_data = [{
            'date': row['date'].strftime('%Y-%m-%d'),
            'sales': to_python_type(row['quantity_sold']),
            'MA7': to_python_type(row['MA7']),
            'MA30': to_python_type(row['MA30'])
        } for _, row in df.iterrows()]

        return jsonify({
            'statistics': stats,
            'trend_data': trend_data,
            'daily_sales': daily_sales.to_dict('records')
        })

    except Exception as e:
        print(f"Demand analysis error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/sales/stockout-prediction', methods=['POST'])
def stockout_prediction():
    try:
        data = request.json
        if not data or 'sales_data' not in data:
            return jsonify({'error': 'No sales data provided'}), 400

        df = pd.DataFrame(data['sales_data'])
        if df.empty:
            return jsonify({'error': 'Empty sales data provided'}), 400

        df['date'] = pd.to_datetime(df['date'])
        df['quantity_sold'] = pd.to_numeric(df['quantity_sold'], errors='coerce').fillna(0)
        
        current_stock = int(data.get('current_stock', 0))
        lead_time = int(data.get('lead_time', 7))

        # Ensure we have enough data points
        if len(df) < 3:
            return jsonify({
                'stockout_risk': 'high',
                'days_until_stockout': 0,
                'safety_stock': 0,
                'reorder_point': current_stock,
                'stock_projections': []
            }), 200

        # Calculate metrics
        avg_daily_sales = to_python_type(df['quantity_sold'].mean())
        max_daily_sales = to_python_type(df['quantity_sold'].max())
        std_dev = to_python_type(df['quantity_sold'].std())

        # Calculate safety stock and reorder point
        safety_stock = to_python_type(2 * std_dev * np.sqrt(lead_time))
        reorder_point = to_python_type((avg_daily_sales * lead_time) + safety_stock)

        # Calculate days until stockout
        days_until_stockout = to_python_type(current_stock / avg_daily_sales if avg_daily_sales > 0 else float('inf'))
        
        # Determine stockout risk
        if days_until_stockout <= lead_time:
            stockout_risk = 'high'
        elif days_until_stockout <= lead_time * 2:
            stockout_risk = 'medium'
        else:
            stockout_risk = 'low'

        # Calculate stock projections
        dates = pd.date_range(start=df['date'].max(), periods=lead_time * 2, freq='D')
        stock_projections = []
        
        for i, date in enumerate(dates):
            avg_case_stock = to_python_type(current_stock - (avg_daily_sales * (i + 1)))
            worst_case_stock = to_python_type(current_stock - (max_daily_sales * (i + 1)))
            
            stock_projections.append({
                'date': date.strftime('%Y-%m-%d'),
                'avg_case_stock': to_python_type(max(avg_case_stock, 0)),
                'worst_case_stock': to_python_type(max(worst_case_stock, 0))
            })

        return jsonify({
            'metrics': {
                'current_stock': current_stock,
                'avg_daily_sales': avg_daily_sales,
                'max_daily_sales': max_daily_sales,
                'safety_stock': safety_stock,
                'reorder_point': reorder_point,
                'days_until_stockout': days_until_stockout
            },
            'stockout_risk': stockout_risk,
            'stock_projections': stock_projections,
            'alert': current_stock <= reorder_point
        })

    except Exception as e:
        print(f"Stockout prediction error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/analysis', methods=['POST'])
def analyze_sales():
    try:
        data = request.json
        sales_data = pd.DataFrame(data['salesData'])
        current_stock = int(data.get('currentStock', 50))
        
        # Generate sales forecast
        forecast_data = sales_forecast(sales_data)
        demand_stats = demand_analysis(sales_data)
        stock_analysis = stockout_prediction(sales_data, current_stock)
        
        response = {
            'salesForecast': [
                {
                    'date': date.strftime('%Y-%m-%d %H:%M:%S'),
                    'predicted_sales': to_python_type(sales)
                }
                for date, sales in forecast_data['predicted_sales'].items()
            ],
            'demandAnalysis': {
                'statistics': [
                    {'metric': 'Average Sales', 'value': to_python_type(demand_stats['average_sales'])},
                    {'metric': 'Median Sales', 'value': to_python_type(demand_stats['median_sales'])},
                    {'metric': 'Maximum Sales', 'value': to_python_type(demand_stats['max_sales'])},
                    {'metric': 'Minimum Sales', 'value': to_python_type(demand_stats['min_sales'])},
                    {'metric': 'Standard Deviation', 'value': to_python_type(demand_stats['std_dev'])},
                    {'metric': 'Total Sales', 'value': to_python_type(demand_stats['total_sales'])}
                ],
                'movingAverages': [
                    {
                        'date': date.strftime('%Y-%m-%d %H:%M:%S'),
                        'sales': to_python_type(row['sales']),
                        '7day_ma': to_python_type(row['7day_ma']) if pd.notna(row['7day_ma']) else None,
                        '30day_ma': to_python_type(row['30day_ma']) if pd.notna(row['30day_ma']) else None
                    }
                    for date, row in demand_stats['moving_averages'].iterrows()
                ]
            },
            'stockAnalysis': {
                'metrics': [
                    {'metric': 'Current Stock', 'value': to_python_type(current_stock)},
                    {'metric': 'Average Daily Sales', 'value': to_python_type(demand_stats['average_sales'])},
                    {'metric': 'Maximum Daily Sales', 'value': to_python_type(demand_stats['max_sales'])},
                    {'metric': 'Safety Stock', 'value': to_python_type(stock_analysis['safety_stock'])},
                    {'metric': 'Reorder Point', 'value': to_python_type(stock_analysis['reorder_point'])},
                    {'metric': 'Days until Stockout (Avg Case)', 'value': to_python_type(stock_analysis['days_until_stockout'])},
                    {'metric': 'Days until Stockout (Worst Case)', 'value': to_python_type(stock_analysis['days_until_stockout'])}
                ],
                'projections': [
                    {
                        'day': day,
                        'average_case': to_python_type(avg_case),
                        'worst_case': to_python_type(worst_case)
                    }
                    for day, (avg_case, worst_case) in enumerate(stock_analysis['stock_projections'])
                ]
            },
            'recommendations': [
                f" Stock level is {stock_analysis['stock_status']}",
                f"Next reorder in approximately {to_python_type(stock_analysis['days_until_reorder'])} days"
            ]
        }
        
        return jsonify(response)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Add a test endpoint to verify the API is working
@app.route('/test', methods=['GET'])
def test():
    return jsonify({'message': 'API is working!'}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5001) 