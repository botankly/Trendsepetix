from collections import defaultdict
from itertools import combinations

def get_associations(sales, min_support=0.05):
    """
    Basit bir Birliktelik Analizi (Association Analysis) örneği.
    Gerçek bir Apriori algoritmasının basitleştirilmiş halidir.
    """
    item_counts = defaultdict(int)
    pair_counts = defaultdict(int)
    total_sales = len(sales)
    
    if total_sales == 0:
        return []

    for sale in sales:
        products = list(sale.products.all().values_list('name', flat=True))
        # Temel adları temizle (opsiyonel)
        products = [p.split(" #")[0] for p in products]
        unique_products = list(set(products))
        
        for item in unique_products:
            item_counts[item] += 1
            
        for pair in combinations(sorted(unique_products), 2):
            pair_counts[pair] += 1

    results = []
    for pair, count in pair_counts.items():
        support = count / total_sales
        if support >= min_support:
            conf_a = count / item_counts[pair[0]]
            conf_b = count / item_counts[pair[1]]
            results.append({
                "items": pair,
                "support": round(support, 4),
                "confidence": round(max(conf_a, conf_b), 4),
                "count": count
            })
            
    return sorted(results, key=lambda x: x['support'], reverse=True)
