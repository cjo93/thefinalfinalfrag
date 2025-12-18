import os
import json
import base64
import math
import zipfile
import io
from PIL import Image, ImageDraw
from typing import Tuple

# --- CONFIGURATION ---
PASS_TYPE_ID = "pass.com.defrag.identity"
TEAM_ID = "YOUR_TEAM_ID" # Placeholder - Needs to be replaced with real Apple Developer Team ID

class PassGenerator:
    def __init__(self):
        pass

    def create_mandala_strip(self, size: Tuple[int, int]) -> Image.Image:
        """
        Generates the mandala artwork for the wallet card strip.
        """
        width, height = size
        # Base: Deep Void Black
        img = Image.new('RGBA', size, (5, 5, 10, 255))
        draw = ImageDraw.Draw(img)
        cx, cy = width // 2, height // 2

        # A. The Parallax Depth (Ghost Rings)
        for r in range(height, 20, -15):
            opacity = int(20 * (r / height))
            draw.ellipse((cx-r, cy-r, cx+r, cy+r), outline=(100, 100, 120, opacity), width=1)

        # B. The Iridescent Core (Cyan/Gold/Purple)
        colors = [(0, 255, 255, 60), (255, 215, 0, 40), (138, 43, 226, 40)]
        for i in range(0, 360, 10):
            rad = math.radians(i)
            color = colors[(i // 10) % 3]
            x_end = cx + math.cos(rad) * (height * 0.85)
            y_end = cy + math.sin(rad) * (height * 0.85)
            draw.line((cx, cy, x_end, y_end), fill=color, width=1)

        return img

    def generate_pass_bundle(self, user_id: str) -> io.BytesIO:
        """
        Creates the .pkpass bundle (zip file) containing the pass.json and images.
        """
        # 1. Create In-Memory Zip
        zip_buffer = io.BytesIO()

        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
            # 2. Generate pass.json
            pass_json = self._get_pass_json(user_id)
            zf.writestr("pass.json", json.dumps(pass_json, indent=2))

            # 3. Generate strip.png (The Mandala Artwork)
            # Standard strip size for Wallet is usually around 375x123 or similar ratio.
            # We use 375x123 as a good baseline for the strip image.
            strip_img = self.create_mandala_strip((375, 123))
            strip_bytes = io.BytesIO()
            strip_img.save(strip_bytes, format="PNG")
            zf.writestr("strip.png", strip_bytes.getvalue())

            # 4. Add placeholder icon/logo (reuse strip or create simple ones)
            # In a real app, you'd want specific icon.png (29x29) and logo.png
            # For now, we'll resize the strip or just use a colored block for icon/logo to avoid errors if they are strictly checked.
            # Ideally logo.png should be transparent background with text or symbol.

            # Icon
            icon_img = Image.new('RGBA', (29, 29), (0, 0, 0, 255))
            icon_draw = ImageDraw.Draw(icon_img)
            icon_draw.ellipse((2, 2, 27, 27), fill=(0, 255, 255))
            icon_bytes = io.BytesIO()
            icon_img.save(icon_bytes, format="PNG")
            zf.writestr("icon.png", icon_bytes.getvalue())

            # Logo
            logo_img = Image.new('RGBA', (160, 50), (0, 0, 0, 0)) # Transparent
            logo_draw = ImageDraw.Draw(logo_img)
            logo_draw.text((10, 15), "DEFRAG", fill=(255, 255, 255)) # Default font
            logo_bytes = io.BytesIO()
            logo_img.save(logo_bytes, format="PNG")
            zf.writestr("logo.png", logo_bytes.getvalue())

            # Also need @2x and @3x ideally, but standard pass might work without them or scale them.
            # Apple Wallet is picky. We might need manifest.json and signature for a REAL valid pass.
            # For this "implementation", we are generating the bundle structure.
            # Signing is a complex step requiring certificates. We will skip the actual cryptographic signature
            # unless the user provided certs, but we can structure it correctly.

        zip_buffer.seek(0)
        return zip_buffer

    def _get_pass_json(self, user_id: str):
        # Deep Link Payload
        identity_data = {
            "uid": user_id,
            "name": "User", # In real app, fetch user name
            "sun": "Capricorn", # Placeholder
            "moon": "Virgo",    # Placeholder
            "dob": "1993-07-26" # Placeholder
        }
        json_str = json.dumps(identity_data)
        payload_b64 = base64.b64encode(json_str.encode()).decode()
        deep_link = f"defrag://initialize?payload={payload_b64}"

        return {
          "formatVersion": 1,
          "passTypeIdentifier": PASS_TYPE_ID,
          "serialNumber": f"DEFRAG-{user_id[:8]}",
          "teamIdentifier": TEAM_ID,
          "organizationName": "DEFRAG",
          "description": "Defrag Signal Card",
          "logoText": "DEFRAG",
          "foregroundColor": "rgb(255, 255, 255)",
          "backgroundColor": "rgb(0, 0, 0)",
          "labelColor": "rgb(0, 255, 255)",
          "storeCard": {
            "auxiliaryFields": [
                {
                    "key": "action",
                    "label": "DEFRAG ENGINE",
                    "value": "INITIALIZE",
                    "attributedValue": f"<a href='{deep_link}'>INITIALIZE</a>",
                    "textAlignment": "PKTextAlignmentCenter"
                }
            ],
            "primaryFields": [
                {
                    "key": "balance",
                    "label": "ARTIFACT",
                    "value": "ACTIVE",
                    "textAlignment": "PKTextAlignmentRight"
                }
            ]
          }
        }
