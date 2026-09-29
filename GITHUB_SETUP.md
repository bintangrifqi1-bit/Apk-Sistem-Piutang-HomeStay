# GitHub Setup — Ringkas

Root repository harus terlihat seperti ini:

```text
REPOSITORY/
├── index.html
├── config/
├── css/
├── js/
├── supabase/
└── .github/
    └── workflows/
        └── deploy-pages.yml
```

Jangan sampai menjadi:

```text
REPOSITORY/
└── homestay-accounting-system/
    ├── index.html
    └── .github/
```

Perintah dari folder project:

```bash
git init
git branch -M main
git add .
git commit -m "Initial commit - Homestay Accounting System"
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```
