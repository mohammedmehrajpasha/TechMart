import requests
import json

class ProductImprovementSystem:
    def __init__(self, api_key):
        self.api_key = api_key
        self.gemini_api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
        self.headers = {'Content-Type': 'application/json'}

    def analyze_reviews(self, reviews):
        combined_reviews = " ".join(reviews)
        prompt = f"""
        You are an AI product analyst. Based on the following customer reviews, identify the key issues with the product and provide actionable improvement suggestions. For each issue, also give a priority level.

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