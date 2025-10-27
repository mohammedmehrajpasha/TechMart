import numpy as np
import joblib
from tensorflow.keras.models import load_model

# Load the sentiment analysis model and vectorizer
sentiment_model = load_model('sentiment_model_v3.h5')
vectorizer = joblib.load('vectorizer_v3.pkl')
sentiment_labels = ['Positive', 'Neutral', 'Negative']

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