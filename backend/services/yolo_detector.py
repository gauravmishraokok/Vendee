from transformers import pipeline
import requests
from PIL import Image
from io import BytesIO
from typing import List, Dict, Union
import torch

# Load the fruits & vegetables detector from Hugging Face once at import
_USE_CUDA: bool = torch.cuda.is_available()
_DEVICE = 0 if _USE_CUDA else -1
_DTYPE = None  # keep weights in default dtype to avoid input/weight dtype mismatch

_pipe = pipeline(
    task="image-classification",
    model="jazzmacedo/fruits-and-vegetables-detector-36",
    device=_DEVICE,
    torch_dtype=_DTYPE,
)

def analyze_vendor_cart(
    image_input: Union[str, Image.Image],
    top_k: int = 10,
    min_confidence: float = 0.000001,
) -> List[Dict]:
    """
    Analyze a vendor cart image to detect fruits and vegetables using a Hugging Face model.

    Args:
        image_path_or_url: Local file path or HTTP(S) URL to the image.
        top_k: Number of top classes to return.
        min_confidence: Minimum confidence threshold for including a class.

    Returns:
        List of dicts: [{"name": str, "confidence": float}] sorted by confidence desc.
    """

    # Load image from local path/URL or accept already opened PIL image
    if isinstance(image_input, Image.Image):
        image = image_input
    elif isinstance(image_input, str):
        path_or_url = image_input
        if path_or_url.startswith("http"):
            response = requests.get(path_or_url, timeout=20)
            response.raise_for_status()
            image = Image.open(BytesIO(response.content))
        else:
            image = Image.open(path_or_url)
    else:
        raise ValueError("Unsupported image_input type. Pass a PIL.Image or a path/URL string.")

    # Ensure RGB
    if image.mode != "RGB":
        image = image.convert("RGB")

    # Run classification (top_k results)
    # Inference with optional autocast for CUDA and robust fallbacks
    try:
        if _USE_CUDA:
            with torch.inference_mode():
                with torch.autocast(device_type="cuda", dtype=torch.float16):
                    results = _pipe(image, top_k=top_k)
        else:
            with torch.inference_mode():
                results = _pipe(image, top_k=top_k)
    except Exception:
        # Retry without autocast on CUDA
        try:
            with torch.inference_mode():
                results = _pipe(image, top_k=top_k)
        except Exception:
            # Last resort: fallback to CPU pipeline for this call
            cpu_pipe = pipeline(
                task="image-classification",
                model="jazzmacedo/fruits-and-vegetables-detector-36",
                device=-1,
            )
            with torch.inference_mode():
                results = cpu_pipe(image, top_k=top_k)

    # Normalize into expected schema and filter by confidence
    detections: List[Dict] = []
    for res in results:
        label = str(res.get("label", "")).strip()
        score = float(res.get("score", 0.0))
        if label and score >= min_confidence:
            detections.append({
                "name": label.lower(),
                "confidence": score,
            })

    return detections


if __name__ == "__main__":
    # Local quick test
    test_path = "backend/services/test_vendor_cart.jpg"
    items = analyze_vendor_cart(test_path)
    print("Detections:", items)
