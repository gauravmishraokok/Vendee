from transformers import pipeline
import requests
from PIL import Image
from io import BytesIO

# Load the fruits & vegetables detector from Hugging Face
pipe = pipeline(
    "image-classification",
    model="jazzmacedo/fruits-and-vegetables-detector-36"
)

def analyze_vendor_cart(image_path_or_url):
    """
    Analyzes vendor cart image to detect fruits and vegetables.
    Accepts both local file paths and URLs.
    Returns: list of detected items (top-1 label per image).
    """

    # Load image from local or URL
    if image_path_or_url.startswith("http"):
        response = requests.get(image_path_or_url)
        image = Image.open(BytesIO(response.content))
    else:
        image = Image.open(image_path_or_url)

    # Run classification
    results = pipe(image)

    # Extract top labels
    detected_items = [res['label'] for res in results]

    return detected_items


# Mock test (real inference)
if __name__ == "__main__":
    test_url = "C:/Users/gaura/OneDrive/Desktop/New folder/Vendee/backend/services/test_vendor_cart.jpg"
    items = analyze_vendor_cart(test_url)
    print("Detected Items:", items)
