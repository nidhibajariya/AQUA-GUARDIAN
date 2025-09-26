# example_usage.py

from sentinel_client import SentinelClient

def main():
    client = SentinelClient()

    # Example bounding box (small area near Surat, India)
    bbox = [72.8, 21.0, 72.9, 21.1]
    time_interval = ("2025-09-20", "2025-09-25")
    width = 256
    height = 256

    arr, img = client.request_image(bbox, time_interval, width, height)
    print("Image shape:", arr.shape)
    img.show()

if __name__ == "__main__":
    main()
