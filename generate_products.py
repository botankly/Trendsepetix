import os
import json
import random

image_dir = r"c:\Users\KLAY\Desktop\TRENDSEPETİX\static\images"
files = os.listdir(image_dir)
products = []

for f in files:
    name = f.replace(".png", "").replace(".jpg", "").replace(".jpeg", "").replace(".webp", "").replace(".avif", "").replace(".jfif", "").replace(".pmg", "")
    products.append({
        "id": len(products) + 1,
        "name": name.strip().title(),
        "image": f"/static/images/{f}",
        "price": random.randint(10, 500)
    })

with open(r"c:\Users\KLAY\Desktop\TRENDSEPETİX\frontend\src\products.json", "w", encoding="utf-8") as file:
    json.dump(products, file, ensure_ascii=False, indent=2)

print("Created products.json")
