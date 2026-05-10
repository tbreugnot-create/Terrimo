# 🏠 Tour du Propriétaire — Terrimo
## Guide complet de démonstration · Version 2026

---

## 🔑 Credentials de démonstration

| Accès | URL | Secret / Token |
|-------|-----|----------------|
| **Dashboard Pro Premium** | https://terrimo.homes/pro/dashboard/demo-premium-terrimo-2026 | `demo-premium-terrimo-2026` |
| **Panneau Admin** | https://terrimo.homes/admin/TERRIMO_ADMIN_2026 | `TERRIMO_ADMIN_2026` |
| **Seed démo (réinitialiser)** | https://terrimo.homes/api/admin/seed-tour?secret=TERRIMO_TOUR_2026 | `TERRIMO_TOUR_2026` |
| **Migrations DB** | voir section Infrastructure | `TERRIMO_ADMIN_2026` |

> **Pour initialiser la démo :** Ouvrir l'URL seed-tour — elle crée le compte Premium avec 10 biens, 4 leads, 3 mandats acquéreurs. Idempotent : peut être relancé sans risque.

---

## 🗺️ Plan du tour (ordre recommandé)

### PARTIE 1 — Vue Acquéreur (public)
### PARTIE 2 — Vue Vendeur / Propriétaire (public)
### PARTIE 3 — Dashboard Pro Agence (connecté)
### PARTIE 4 — Panneau Admin (backoffice)
### PARTIE 5 — Infrastructure & SEO

---

## PARTIE 1 — Vue Acquéreur

### 1.1 Homepage
**URL :** https://terrimo.homes

**Ce qu'on voit :**
- Hero sombre avec CTA "Rechercher sur la carte"
- Carte interactive Mapbox (biens géolocalisés)
- Filtres : type, prix, surface, communes, draw-search
- Biens affichés avec confidentialité progressive (adresse masquée pour les non-inscrits)

**Points à tester :**
- [ ] Dessiner une zone personnalisée avec le bouton ✏️ (Draw Search)
- [ ] Filtrer par "Arcachon" uniquement
- [ ] Cliquer sur un marqueur → popup → "Voir le bien"
- [ ] Observer que l'adresse exacte est masquée (révélée après contact)

---

### 1.2 Fiche Bien
**URL exemple :** https://terrimo.homes/bien/[id_bien]

**Ce qu'on voit :**
- Galerie photo avec prev/next et thumbnails
- Informations complètes : surface, DPE, prix, commune
- Adresse partielle (confidentielle jusqu'au contact)
- Bouton "Contacter l'agence" → formulaire lead
- Section "Biens similaires" (4 biens même agence / commune)
- Bouton "Partager" → copie le lien en clipboard
- JSON-LD RealEstateListing (SEO)

**Points à tester :**
- [ ] Navigation galerie photo (flèches + thumbnails)
- [ ] Cliquer "Voir la fiche agence" → /agence/agence-terrimo-demo
- [ ] Cliquer "Contacter" → vérifier que le lead est créé (visible dans Admin)
- [ ] Tester le bouton Partager

---

### 1.3 Pages Communes — Vente & Location
**URLs :**
- https://terrimo.homes/vente/arcachon
- https://terrimo.homes/vente/lege-cap-ferret
- https://terrimo.homes/location/andernos-les-bains

**Ce qu'on voit :**
- Hero avec stats DVF (prix médian, transactions)
- Liste des biens disponibles dans la commune
- SEO : `<h1>` "Vente immobilier Arcachon", liens canoniques, JSON-LD

---

### 1.4 Observatoire du marché DVF
**URL :** https://terrimo.homes/marche

**Ce qu'on voit :**
- 4 KPI cards : biens actifs, prix médian Bassin, meilleure commune, évolution
- Tableau complet : prix m² médians maisons & appartements par commune
- Barres de visualisation proportionnelles
- Badges évolution YoY (vert ↑ / rouge ↓)
- Note méthodologique DVF
- CTA estimer + CTA agences

---

### 1.5 Pages Quartiers
**URLs :**
- https://terrimo.homes/quartier/arcachon
- https://terrimo.homes/quartier/lege-cap-ferret
- https://terrimo.homes/quartier/andernos-les-bains

**Ce qu'on voit :**
- Prix DVF par quartier (histogramme CSS)
- Ambiance & atouts de la commune
- Mini-carte centrée sur la commune
- CTA vers /vente/[commune]

---

### 1.6 Blog SEO
**URLs :**
- https://terrimo.homes/blog
- https://terrimo.homes/blog/prix-immobilier-arcachon-2025
- https://terrimo.homes/blog/guide-achat-immobilier-bassin-arcachon
- https://terrimo.homes/blog/fiscalite-location-saisonniere-bassin-arcachon
- https://terrimo.homes/blog/meilleurs-quartiers-arcachon
- https://terrimo.homes/blog/dpe-renovation-energetique-immobilier-arcachon
- https://terrimo.homes/blog/investir-immobilier-bassin-arcachon-2025

**Ce qu'on voit :**
- Index : article à la une (2 colonnes) + grille 3 articles
- Article individuel : JSON-LD Article + BreadcrumbList
- Navigation prev/next entre articles
- CTA "Estimer mon bien" et "Prix du marché DVF"
- Styles de tableau, blockquote, listes

---

## PARTIE 2 — Vue Vendeur / Propriétaire

### 2.1 Estimation bien
**URL :** https://terrimo.homes/evaluer

**Ce qu'on voit :**
- Formulaire d'estimation en plusieurs étapes
- Champs : commune, surface, type, DPE, distance mer, état
- Résultat : fourchette basse / centrale / haute (algo DVF)
- Capture lead : nom, email, téléphone
- Notif email admin + confirmation propriétaire

**Points à tester :**
- [ ] Compléter le formulaire (Arcachon, Maison, 120 m², DPE C, 200m de la mer)
- [ ] Voir l'estimation apparaître
- [ ] Vérifier dans Admin que le lead est créé (status: "new")

---

### 2.2 Page Vendre
**URL :** https://terrimo.homes/vendre

**Ce qu'on voit :**
- Hero propriétaire avec proposition de valeur
- 3 étapes : Estimer → Choisir → Vendre
- CTA vers /evaluer
- Section agences partenaires

---

### 2.3 Inscription Acquéreur
**URL :** https://terrimo.homes/acquereur

**Ce qu'on voit :**
- Formulaire mandat de recherche acquéreur
- Critères : communes souhaitées, budget, surface, type de bien, apport
- Alerte automatique par email quand un bien correspond (cron /api/cron/alertes)

---

## PARTIE 3 — Dashboard Pro Agence

**URL :** https://terrimo.homes/pro/dashboard/demo-premium-terrimo-2026

> Connexion avec le token Premium. Accès à toutes les fonctionnalités sans restriction.

---

### 3.1 Onglet Tableau de bord (Stats)

**Ce qu'on voit :**
- Nombre de biens actifs
- Vues totales (7 jours)
- Leads reçus (7 jours)
- Contacts (7 jours)
- Graphique d'activité (si données bien_events)

---

### 3.2 Onglet Mes biens

**Fonctionnalités :**

**Ajouter un bien manuellement**
- [ ] Cliquer "+ Ajouter un bien"
- [ ] Remplir : titre, type, commune, prix, surface, description
- [ ] Voir le bien apparaître dans la liste

**Import CSV (Premium)**
- [ ] Cliquer "Importer CSV"
- [ ] Télécharger le template via "📥 Modèle CSV"
- [ ] Upload un fichier CSV (ou drag-drop)
- [ ] Voir le résultat : X biens importés, Y erreurs

**Modifier un bien**
- [ ] Cliquer ✏️ sur un bien existant
- [ ] Modifier le prix ou la description
- [ ] Sauvegarder

**Supprimer un bien**
- [ ] Cliquer 🗑 sur un bien
- [ ] Confirmer la suppression

---

### 3.3 Onglet Leads reçus

**Ce qu'on voit :**
- Liste des leads : nom, email, commune, estimation, source, date
- 4 leads démo : Jean-Pierre Moreau, Sophie Leblanc, Marc Durand, Isabelle Fontaine
- Source : "evaluer" ou "vendre_vendre"

---

### 3.4 Onglet Abonnement

**Ce qu'on voit :**
- Plan actuel : **Premium** ✓
- Avantages du plan détaillés
- Bouton "Changer de plan" → Stripe Checkout
- Pour tester Stripe : utiliser carte de test `4242 4242 4242 4242`

**Plans disponibles :**
| Plan | Prix | Biens max | CSV | Leads |
|------|------|-----------|-----|-------|
| Free | 0 € | 3 | ✗ | ✗ |
| Pro | 79 €/mois | Illimité | 50/mois | ✓ |
| Premium | 149 €/mois | Illimité | Illimité | ✓ + alertes |

---

### 3.5 Fiche Agence publique
**URL :** https://terrimo.homes/agence/agence-terrimo-demo

**Ce qu'on voit :**
- Présentation agence : note Google (4.8 ⭐ · 127 avis), description
- Liste de tous les biens de l'agence
- Bouton de contact agence
- JSON-LD LocalBusiness

---

## PARTIE 4 — Panneau Admin

**URL :** https://terrimo.homes/admin/TERRIMO_ADMIN_2026

---

### 4.1 Stats globales

**Ce qu'on voit :**
- Total acteurs (agences + conciergeries)
- Total biens actifs
- Total leads (toutes sources)
- Total mandats recherche acquéreurs

---

### 4.2 Gestion Acteurs

**Fonctionnalités :**
- [ ] Voir la liste de toutes les agences (avec plan : free/pro/premium)
- [ ] Activer / Désactiver un acteur
- [ ] Valider un acteur (is_verified → true)
- [ ] Voir le token d'accès de chaque agence

**Agence démo visible :** "Agence Terrimo Démo" · plan: Premium · verified: ✓

---

### 4.3 Gestion Leads

**Ce qu'on voit :**
- Tous les leads de toutes les sources
- Filtrage par source (evaluer, vendre, contact…)
- Status : new / contacted / qualified / lost
- Mise à jour de status en 1 clic

---

### 4.4 Mandats Acquéreurs

**Ce qu'on voit :**
- Tous les mandats de recherche actifs
- Critères : communes, budget, surface, type
- 3 mandats démo : Thomas, Claire, Romain

---

## PARTIE 5 — Infrastructure & SEO

### 5.1 Sitemap
**URL :** https://terrimo.homes/sitemap.xml

**Ce qu'on voit :**
- URLs statiques (/, /evaluer, /marche, /blog, /tarifs…)
- URLs dynamiques biens (/bien/[id] · 500 max)
- URLs agences (/agence/[slug])
- URLs articles blog (/blog/[slug] · 6 articles)
- URLs communes vente + location (13 communes × 2)
- URLs quartiers (13 communes)

---

### 5.2 Robots
**URL :** https://terrimo.homes/robots.txt

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /pro/dashboard/
Sitemap: https://terrimo.homes/sitemap.xml
```

---

### 5.3 Migrations DB (si nécessaire)
> À exécuter depuis le navigateur après déploiement Vercel

| Migration | URL |
|-----------|-----|
| Tables Stripe | https://terrimo.homes/api/admin/migrate?secret=TERRIMO_ADMIN_2026&migration=stripe |
| Tables Mandats | https://terrimo.homes/api/admin/migrate?secret=TERRIMO_ADMIN_2026&migration=mandats |
| Tables Events | https://terrimo.homes/api/admin/migrate?secret=TERRIMO_ADMIN_2026&migration=bien_events |
| Tables Zone alertes | https://terrimo.homes/api/admin/migrate?secret=TERRIMO_ADMIN_2026&migration=zone_alertes |
| Status check | https://terrimo.homes/api/admin/migrate?secret=TERRIMO_ADMIN_2026&migration=status |

---

### 5.4 Variables d'environnement Vercel (à configurer)

```env
# Base de données
DATABASE_URL=neon://...

# Email (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=contact@terrimo.homes

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...
STRIPE_PRICE_PREMIUM_MONTHLY=price_...
STRIPE_PRICE_PREMIUM_YEARLY=price_...

# Cron
CRON_SECRET=votre_secret_cron

# Admin
ADMIN_SECRET=TERRIMO_ADMIN_2026
```

---

## 🧭 Checklist Tour Complet (30 min)

### Phase 1 — Initialisation (2 min)
- [ ] Appeler https://terrimo.homes/api/admin/seed-tour?secret=TERRIMO_TOUR_2026
- [ ] Vérifier la réponse JSON : `"ok": true, "biens_inserted": 10`

### Phase 2 — Côté Acquéreur (8 min)
- [ ] Explorer la carte homepage (draw search, filtres)
- [ ] Cliquer sur un bien → fiche complète + galerie
- [ ] Lire les biens similaires
- [ ] Visiter /marche → tableau prix DVF
- [ ] Lire un article de blog

### Phase 3 — Côté Vendeur (5 min)
- [ ] Faire une estimation sur /evaluer (Arcachon, 120 m², Maison, DPE C)
- [ ] Voir l'estimation s'afficher
- [ ] S'inscrire comme acquéreur sur /acquereur

### Phase 4 — Dashboard Pro (10 min)
- [ ] Ouvrir https://terrimo.homes/pro/dashboard/demo-premium-terrimo-2026
- [ ] Voir les stats (vues, leads, contacts)
- [ ] Voir les 10 biens démo
- [ ] Ajouter un bien manuellement
- [ ] Tester l'import CSV (télécharger template, importer)
- [ ] Voir les 4 leads démo
- [ ] Explorer l'onglet abonnement (plan Premium actif)

### Phase 5 — Backoffice Admin (5 min)
- [ ] Ouvrir https://terrimo.homes/admin/TERRIMO_ADMIN_2026
- [ ] Voir les stats globales
- [ ] Valider un acteur
- [ ] Voir les leads
- [ ] Voir les mandats acquéreurs

---

## 📞 Support & Contacts

| Rôle | Contact |
|------|---------|
| Fondateur | Thomas Breugnot — tbreugnot@di-africa.com |
| Site live | https://terrimo.homes |
| GitHub | https://github.com/tbreugnot-create/Terrimo |
| Vercel | terrimo-v2 project |

---

*Document généré automatiquement — Terrimo v2 · Mai 2026*
