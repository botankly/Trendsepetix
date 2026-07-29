import json

products_file = r"C:\Users\KLAY\Desktop\TRENDSEPETİX\frontend\src\products.json"

with open(products_file, "r", encoding="utf-8") as f:
    products = json.load(f)

unsplash_map = {
    # Teknoloji
    "airpods": "https://images.unsplash.com/photo-1588449668338-d151688d3472?w=500",
    "kulaklık": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
    "saat": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
    "laptop": "https://images.unsplash.com/photo-1496181130204-755241524eab?w=500",
    "tablet": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500",
    "telefon": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500",
    "drone": "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=500",
    "hoparlor": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500",
    "powerbank": "https://images.unsplash.com/photo-1609592424109-dd9892f1b17c?w=500",
    "robotsupurge": "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=500",
    "mouse": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500",
    "fare": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500",
    "klavye": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500",
    "led": "https://images.unsplash.com/photo-1550985616-10810253b84d?w=500",
    "ampul": "https://images.unsplash.com/photo-1550985616-10810253b84d?w=500",

    # Giyim & Aksesuar
    "gömlek": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500",
    "pantolon": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500",
    "sweat": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500",
    "eşofman": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500",
    "kazak": "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=500",
    "atkı": "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=500",
    "bot": "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=500",
    "ayakkabı": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
    "terlik": "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=500",
    "çorap": "https://images.unsplash.com/photo-1582966772680-860e372bb558?w=500",
    "corap": "https://images.unsplash.com/photo-1582966772680-860e372bb558?w=500",
    "ceket": "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500",
    "kemer": "https://images.unsplash.com/photo-1624222247344-550fb8ec5519?w=500",

    # Bakliyat & Temel Gıda
    "pirinç": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500",
    "bulgur": "https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=500",
    "mercimek": "https://images.unsplash.com/photo-1547050605-2f88541c87f4?w=500",
    "nohut": "https://images.unsplash.com/photo-1547050605-2f88541c87f4?w=500",
    "fasulye": "https://images.unsplash.com/photo-1547050605-2f88541c87f4?w=500",
    "tavuk": "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500",
    "kıyma": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500",
    "kuşbaşı": "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500",
    "et": "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500",
    "zeytinyağı": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500",
    "yağ": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500",
    "şeker": "https://images.unsplash.com/photo-1581798459219-318e76aecc7b?w=500",
    "makarna": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500",
    "peynir": "https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=500",
    "kaşar": "https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=500",
    "süt": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500",
    "sut": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500",
    "yumurta": "https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=500",
    "ymurta": "https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=500",
    "bal": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500",

    # Sebze & Meyve
    "domates": "https://images.unsplash.com/photo-1595855759920-86582396756a?w=500",
    "salatalık": "https://images.unsplash.com/photo-1449300079323-02e209d9d02e?w=500",
    "biber": "https://images.unsplash.com/photo-1588611919736-411517478716?w=500",
    "bıber": "https://images.unsplash.com/photo-1588611919736-411517478716?w=500",
    "patates": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500",
    "patlıcan": "https://images.unsplash.com/photo-1628294895550-9805d8f2024b?w=500",
    "kabak": "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=500",
    "soğan": "https://images.unsplash.com/photo-1508747703725-719ae2c73ee0?w=500",
    "sogan": "https://images.unsplash.com/photo-1508747703725-719ae2c73ee0?w=500",
    "muz": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500",
    "portakal": "https://images.unsplash.com/photo-1547514701-42782101795e?w=500",
    "çilek": "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500",
    "cılek": "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500",
    "karpuz": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500",
    "kavun": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500",
    "kayısı": "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=500",
    "erik": "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=500",
    "erık": "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=500",
    "şeftali": "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=500",
    "seftalı": "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=500",
    "üzüm": "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=500",
    "uzum": "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=500",

    # Temizlik & Deterjan
    "bulaşık makinesi": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500",
    "bulaşık tableti": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500",
    "tablet": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500",
    "deterjan": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500",
    "temizleyici": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500",
    "çamaşır suyu": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500",
    "camasırsuyu": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500",
    "sıvı deterjan": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500",
    "yüzey": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500",
    "sabun": "https://images.unsplash.com/photo-1607006342411-92fc4627d70e?w=500",
    "sıvısabun": "https://images.unsplash.com/photo-1607006342411-92fc4627d70e?w=500",
    "deodorant": "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500",
    "parfüm": "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500",
    "parfum": "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500",
    "saç boyası": "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500",
    "saçboyası": "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500",
    "krem": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500",
    "macun": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500",
    "nemlendirici": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500",
    "sünger": "https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=500",
    "sunger": "https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=500",
    "tuvalet kağıdı": "https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=500",
    "kağıt": "https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=500",
    "havlu": "https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=500",
    "rulo": "https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=500",
    "bez": "https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=500",
    "teli": "https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=500",

    # Kırtasiye & Hobi
    "kalem": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500",
    "defter": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500",
    "kitap": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500",
    "puzzle": "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=500",
    "logo": "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=500",

    # Baharatlar
    "baharat": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500",
    "sumak": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500",
    "tarçın": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500",
    "tarcın": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500",
    "kimyon": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500",
    "kımyon": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500",
    "nane": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500",
    "kekik": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500",
    "kekık": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500",
    "karabiber": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500",
    "karabıber": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500",
    "karanfil": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500",
    "karanfıl": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500",
    "pulbiber": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500",
    "pulbıber": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500",

    # İçecekler & Atıştırmalıklar
    "kola": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500",
    "gazoz": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500",
    "şalgam": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500",
    "salgam": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500",
    "su": "https://images.unsplash.com/photo-1548865140-64a02ae0e87b?w=500",
    "kahve": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500",
    "bisküvi": "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=500",
    "bıskuvı": "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=500",
    "çikolata": "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=500",
    "cıkolata": "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=500",
    "kraker": "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=500",
    "kek": "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=500",
    "jelibon": "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=500",
    "jelıbon": "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=500",
    "lolipop": "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=500",
    "lolıop": "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=500",
    "sakız": "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=500",
    "cips": "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=500",
    "cıps": "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=500",

    # Outdoor & Sports
    "termos": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500",
    "sandalye": "https://images.unsplash.com/photo-1596265376427-4688ee0f610f?w=500",
    "kamp": "https://images.unsplash.com/photo-1596265376427-4688ee0f610f?w=500",

    # Ev & Yaşam
    "yatak": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500",
    "nevresim": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500",
    "koltuk": "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=500"
}

def get_image(name):
    n = name.lower()
    for key, val in unsplash_map.items():
        if key in n:
            return val
    return "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500"

for p in products:
    p["image"] = get_image(p["name"])

with open(products_file, "w", encoding="utf-8") as f:
    json.dump(products, f, ensure_ascii=False, indent=2)

print("Updated products.json with direct Unsplash URLs!")
