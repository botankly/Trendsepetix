# -*- coding: utf-8 -*-
import sqlite3
from collections import defaultdict

conn = sqlite3.connect('db.sqlite3')
cursor = conn.cursor()
cursor.execute("SELECT name, price FROM myapp_product")
rows = cursor.fetchall()

groups = defaultdict(list)
for name, price in rows:
    clean = name.split(" #")[0].split(" (")[0].strip()
    groups[clean].append(price)

print("Number of unique clean products:", len(groups))
print("Sample of clean products and their average prices:")
for i, (clean, prices) in enumerate(sorted(groups.items())):
    if i < 40 or 'parf' in clean.lower() or 'deod' in clean.lower() or 'boya' in clean.lower():
        print(f"- {clean}: count={len(prices)}, avg_price={sum(prices)/len(prices):.2f}, min_price={min(prices):.2f}, max_price={max(prices):.2f}")
