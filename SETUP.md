# 🏠 Terrimo v2 — Guide de mise en production

## Étape 1 — Créer la base de données Neon (gratuit)

1. Aller sur **https://neon.tech** → créer un compte (gratuit)
2. Créer un nouveau projet → nommer "terrimo"
3. Copier la **Connection string** (ressemble à `postgresql://user:pass@ep-xxx.aws.neon.tech/neondb`)
4. Dans Neon → onglet "SQL Editor" → coller et exécuter le contenu de `db/schema.sql`
5. Puis exécuter `db/seed-agencies.sql` pour les agences initiales

## Étape 2 — Importer les données DVF

```bash
# Dans le dossier du projet
cp .env.example .env.local
# Remplir DATABASE_URL avec la connection string Neon

npm install tsx
npx tsx db/import-dvf.ts
# Télécharge et importe ~5 années de DVF pour le Bassin d'Arcachon
# Durée : ~5-10 minutes
```

## Étape 3 — Créer un compte GitHub

1. Aller sur **https://github.com** → créer un compte
2. Créer un nouveau dépôt "terrimo"
3. Dans le dossier du projet :
```bash
git init
git add .
git commit -m "Initial commit — Terrimo v2"
git remote add origin https://github.com/TON_USERNAME/terrimo.git
git push -u origin main
```

## Étape 4 — Déployer sur Vercel (gratuit)

1. Aller sur **https://vercel.com** → créer un compte avec GitHub
2. Cliquer "Add New Project" → importer le dépôt "terrimo"
3. Dans les **Environment Variables**, ajouter :
   - `DATABASE_URL` → ta connection string Neon
   - `ODOO_URL` → `https://empploy.odoo.com`
   - `ODOO_API_KEY` → ta clé API Odoo
4. Cliquer "Deploy" → Vercel génère une URL automatiquement

## Étape 5 — Connecter terrimo.homes

1. Dans Vercel → Projet → "Domains" → "Add Domain" → `terrimo.homes`
2. Vercel te donne un enregistrement DNS à ajouter chez ton registrar
3. Ajouter l'enregistrement DNS → propagation en quelques minutes

## Étape 6 — Obtenir la clé API Odoo

1. Sur empploy.odoo.com → Paramètres → Technique → API Keys
2. Créer une nouvelle clé → copier dans `.env.local`

## Structure des fichiers

```
terrimo/
├── app/
│   ├── page.tsx                    ← Carte interactive (accueil)
│   ├── layout.tsx                  ← Layout global
│   ├── business/page.tsx           ← Page professionnels
│   ├── quartier/[slug]/page.tsx    ← 10 pages communes
│   └── api/
│       ├── stats/commune/route.ts  ← GET /api/stats/commune?commune=ARCACHON
│       └── agencies/route.ts       ← GET /api/agencies
├── components/
│   ├── Map.tsx                     ← Carte Leaflet interactive
│   └── DvfStats.tsx                ← Bloc stats DVF (server component)
├── lib/
│   ├── db.ts                       ← Connexion Neon
│   └── communes.ts                 ← Données des 10 communes
├── db/
│   ├── schema.sql                  ← Schéma PostgreSQL
│   ├── seed-agencies.sql           ← Agences initiales
│   └── import-dvf.ts               ← Script import DVF
└── .env.example                    ← Variables d'environnement
```
