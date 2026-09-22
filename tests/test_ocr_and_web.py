import io
import pytest
from PIL import Image, ImageDraw
from app.services.ocr_service import ocr_service

def test_real_ocr_image_analysis():
    # Create image with text
    img = Image.new('RGB', (450, 120), color=(255, 255, 255))
    d = ImageDraw.Draw(img)
    d.text((10, 20), 'State Bank of India', fill=(0, 0, 0))
    d.text((10, 50), 'Payment of Rs 15000 successful', fill=(0, 0, 0))
    d.text((10, 80), 'UPI Ref No: 123456789012', fill=(0, 0, 0))

    buf = io.BytesIO()
    img.save(buf, format='PNG')
    image_bytes = buf.getvalue()

    result = ocr_service.analyze_image_bytes(image_bytes, filename="payment_screenshot.png")
    assert result["success"] is True
    assert result["dimensions"] == "450x120"
    assert result["format"] == "PNG"
    assert len(result["indicators"]) > 0
    # Verified OCR output or heuristic analysis
    assert "extracted_text" in result

def test_ocr_invalid_format():
    result = ocr_service.analyze_image_bytes(b"not_an_image", filename="test.xyz")
    assert result["success"] is False
