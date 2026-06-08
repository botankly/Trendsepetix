# -*- coding: utf-8 -*-
import subprocess
import sys

# Define the old commit hashes and their corresponding new Turkish messages
commits = [
    ("5fb0ba4", "1. Hafta: Proje kapsamının belirlenmesi ve Docker ortamında MySQL kurulumu. Ham sepet veri setlerinin (dataset) sisteme import edilmesi."),
    ("ffeb5c3", "2. Hafta: Django Rest Framework ile backend mimarisinin kurulması. Temel CRUD işlemlerinin hazırlanması."),
    ("28b17ee", "3. Hafta: Veri Madenciliği Motoru: Python ile sepet birliktelik analizini yapacak fonksiyonların (Apriori algoritması vb.) yazılması."),
    ("e619d9c", "4. Hafta: React.js dashboard projesinin başlatılması. Tailwind CSS ile tasarım iskeletinin oluşturulması."),
    ("3859edc", "5. Hafta: Analiz motorunun sonuçlarını (yüzdelik ihtimalleri) frontend paneline aktaran API uçlarının yazılması."),
    ("feb5cd6", "6. Hafta (Vize): SQL sorgu optimizasyonu. Büyük veri setlerinde analiz hızının denetlenmesi."),
    ("6a97330", "7. Hafta: Bölgesel Analiz Modülü: Satışların coğrafi konumlara göre ayrıştırılması ve bölge bazlı trend filtrelerinin eklenmesi."),
    ("a2e0e1b", "8. Hafta: Hazır Sepet (Bundle) Önerici: Birbiriyle %70 ve üzeri ilişkili ürünleri otomatik \"Paket Ürün\" olarak gruplayan mantığın kodlanması."),
    ("84c1013", "9. Hafta: Gemini API Entegrasyonu: Sayısal analiz sonuçlarının Gemini'ye gönderilip \"X bölgesinde Y ürününü alanlar Z'ye de yöneliyor, kampanya başlatılmalı\" gibi metinsel yorumlar alınması."),
    ("e2e523d", "10. Hafta: İndirim Strateji Paneli: Düşük satışlı bölgeler için dinamik indirim oranları hesaplayan arayüzün geliştirilmesi."),
    ("2a2358d", "11. Hafta: Veri görselleştirme (Pie charts, Bar charts) ile en çok satan ikili/üçlü ürün gruplarının dashboard'da gösterilmesi."),
    ("32b4fe9", "12. Hafta: Kullanıcı Kabul Testleri (UAT). Sahte alışveriş verileriyle sistemin doğru tahminleme yapıp yapmadığının kontrolü."),
    ("2f5b306", "13. Hafta: Sistem Stres Testi: Binlerce eşzamanlı sepet analiz isteği geldiğinde sunucu yükünün (CPU/RAM) ölçülmesi."),
    ("665fc37", "14. Hafta: Proje teslimi ve rapor sunumu.")
]

def run_cmd(cmd):
    print(f"Running: {cmd}")
    res = subprocess.run(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        print(f"FAILED: {res.stderr}")
        return False, res.stderr
    return True, res.stdout

def rebuild():
    # 1. Create a new branch starting from the first commit hash
    ok, _ = run_cmd(f"git checkout -b main_rebuild {commits[0][0]}")
    if not ok:
        print("Could not create branch main_rebuild.")
        sys.exit(1)
        
    # 2. Amend the first commit's message
    first_msg = commits[0][1].replace('"', '\\"')
    ok, _ = run_cmd(f'git commit --amend -m "{first_msg}"')
    if not ok:
        print("Could not amend first commit.")
        sys.exit(1)
        
    # 3. Cherry-pick and amend each subsequent commit
    for i in range(1, len(commits)):
        h, msg = commits[i]
        msg_escaped = msg.replace('"', '\\"')
        
        # Cherry pick
        print(f"\n--- Cherry-picking {i+1}/14: {h} ---")
        ok, err = run_cmd(f"git cherry-pick {h}")
        if not ok:
            # If there's an issue, let's abort
            run_cmd("git cherry-pick --abort")
            print(f"Failed to cherry-pick {h}. Error: {err}")
            sys.exit(1)
            
        # Amend message
        ok, _ = run_cmd(f'git commit --amend -m "{msg_escaped}"')
        if not ok:
            print(f"Failed to amend message for commit {h}")
            sys.exit(1)
            
    print("\nRebuild successful! Swapping branches...")
    
    # 4. Swap branch names
    # Move back to main to delete main_rebuild? No, we should delete main first.
    # To delete main, we must not be on main. We are currently on main_rebuild, which is perfect.
    ok, _ = run_cmd("git branch -D main")
    if not ok:
        print("Failed to delete old main branch.")
        sys.exit(1)
        
    ok, _ = run_cmd("git branch -m main_rebuild main")
    if not ok:
        print("Failed to rename main_rebuild to main.")
        sys.exit(1)
        
    print("Done! Git history has been rebuilt with the exact Turkish weekly commit messages.")

if __name__ == "__main__":
    rebuild()
