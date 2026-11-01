# ORKÜTEK Web Sitesi

Saf HTML/CSS/JS — derleme (build) gerektirmez. Yazı tipleri sitenin içindedir (dış servis yok).

## GitHub Pages'e yayınlama
1. github.com'da yeni bir **public** repo açın (örn. `orkutek`).
2. Bu klasörün **içindekileri** (index.html, css, js, assets, .nojekyll …) repoya yükleyin
   (Add file → Upload files, ya da `git push`).
3. Repo → **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main` / `(root)` → Save.
4. 1–2 dakika sonra adres: `https://KULLANICIADI.github.io/orkutek/`
5. Kendi alan adınız varsa Pages ayarında *Custom domain* girin.

## Doldurmanız gerekenler
- `js/config.js` → e-posta, IBAN (dernek tescilinden sonra), sosyal medya bağlantıları. Boş alanlar otomatik gizlenir.
- `index.html` içinde `og:image` adresini, yayın adresinizle tam URL yapın (WhatsApp/sosyal medya önizlemesi için).
- Ekip bölümü (`id="team"`): kişi kartlarını kişilerin onayıyla düzenleyin/silin.
