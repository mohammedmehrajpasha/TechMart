from flask import Blueprint, jsonify, request
from services.sales_service import stockout_prediction

sales_routes = Blueprint('sales_routes', __name__)

@sales_routes.route('/api/sales/stockout-prediction', methods=['POST'])
def stockout_prediction_route():
    try:
        data = request.json
        if not data or 'sales_data' not in data:
            return jsonify({'error': 'No sales data provided'}), 400

        df = pd.DataFrame(data['sales_data'])
        if df.empty:
            return jsonify({'error': 'Empty sales data provided'}), 400

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

        return jsonify({
            'metrics': {
                'current_stock': current_stock,
                'avg_daily_sales': avg_daily_sales,
                'max_daily_sales': max_daily_sales,
                'safety_stock': safety_stock,
                'reorder_point': reorder_point,
                'days_until_stockout': days_until_stockout
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500 