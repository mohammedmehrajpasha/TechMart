from flask import Blueprint, jsonify, request
from services.sentiment_service import predict_sentiment
from services.product_improvement_service import ProductImprovementSystem
import mysql.connector  # or any other database connector you are using

review_routes = Blueprint('review_routes', __name__)

# Initialize the Product Improvement System
api_key = "AIzaSyD7mPGem7KTtks2bOZ0cIeoxYNWhchDnPk"  # Replace with your actual API key
improvement_system = ProductImprovementSystem(api_key)

def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host='localhost',  # Your database host
            user='root',  # Your database username
            password='123456',  # Your database password
            database='Store'  # Your database name
        )
        return connection
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None

@review_routes.route('/api/reviews/<int:product_id>', methods=['GET'])
def get_product_reviews(product_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""SELECT r.*, u.username FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = %s""", (product_id,))
        reviews = cursor.fetchall()
        return jsonify(reviews)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@review_routes.route('/analyze-product-reviews/<int:product_id>', methods=['GET'])
def analyze_product_reviews(product_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""SELECT r.feedback, r.rating, r.created_at, p.name as product_name FROM reviews r JOIN products p ON r.product_id = p.id WHERE r.product_id = %s""", (product_id,))
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
                'improvement_suggestion': "No reviews available for analysis."
            }), 200  

        review_texts = [review['feedback'] for review in reviews if review['feedback']]
        sentiments = [predict_sentiment(review) for review in review_texts]
        sentiment_counts = Counter(sentiments)

        common_problems = extract_common_problems(review_texts)
        problems_formatted = [f"{problem}: {count} mentions" for problem, count in common_problems]

        suggestion = improvement_system.analyze_reviews(review_texts)

        response = {
            'product_name': reviews[0]['product_name'] if reviews else 'Unknown Product',
            'sentiment_analysis': {
                'positive': sentiment_counts['Positive'],
                'neutral': sentiment_counts['Neutral'],
                'negative': sentiment_counts['Negative'],
                'total_reviews': len(review_texts)
            },
            'common_problems': problems_formatted,
            'improvement_suggestion': suggestion
        }

        return jsonify(response), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close() 