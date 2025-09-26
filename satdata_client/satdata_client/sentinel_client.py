# sentinel_client.py

import time
import requests
import json
from config import CLIENT_ID, CLIENT_SECRET, TOKEN_URL, PROCESS_API_URL
from PIL import Image
import io
import numpy as np

class SentinelClient:
    def __init__(self):
        self.token = None
        self.token_expires = 0

    def authenticate(self):
        if self.token and time.time() < self.token_expires - 60:
            return self.token

        data = {
            "grant_type": "client_credentials",
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET
        }
        resp = requests.post(TOKEN_URL, data=data)
        resp.raise_for_status()
        obj = resp.json()
        self.token = obj["access_token"]
        self.token_expires = time.time() + obj.get("expires_in", 3600)
        return self.token

    def request_image(self, bbox, time_interval, width, height):
        token = self.authenticate()
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        evalscript = """
        //VERSION=3
        function setup() {
          return {
            input: ["B02","B03","B04"],
            output: { bands: 3 }
          }
        }
        function evaluatePixel(sample) {
          return [sample.B04, sample.B03, sample.B02];
        }
        """

        payload = {
            "input": {
                "bounds": {
                    "bbox": bbox,
                    "properties": { "crs": "http://www.opengis.net/def/crs/EPSG/0/4326" }
                },
                "data": [
                    {
                        "type": "S2L2A",
                        "dataFilter": {
                            "timeRange": {
                                "from": f"{time_interval[0]}T00:00:00Z",
                                "to": f"{time_interval[1]}T23:59:59Z"
                            },
                            "maxCloudCoverage": 20.0
                        }
                    }
                ]
            },
            "output": {
                "width": width,
                "height": height,
                "responses": [
                    {
                        "identifier": "default",
                        "format": { "type": "image/png" }
                    }
                ]
            },
            "evalscript": evalscript
        }

        resp = requests.post(PROCESS_API_URL, headers=headers, json=payload)
        resp.raise_for_status()

        img = Image.open(io.BytesIO(resp.content))
        arr = np.array(img)
        return arr, img
