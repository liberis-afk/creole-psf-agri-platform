# CREOLE PSF Agri Platform

Multi Plateforme Agricole Watson Creole PSF

Plateforme numérique de gestion agricole multi-exploitations (multi-tenant SaaS) pour les fermes en Haïti et ailleurs. Voir [VISION.md](./VISION.md) pour la vision complète du produit.

## Stack technique

- Frontend/Backend : Next.js (App Router, TypeScript)
- Base de données : PostgreSQL + Prisma ORM
- Authentification : Auth.js
- UI : Tailwind CSS
- Cartographie : Leaflet
- Déploiement : Vercel

## Démarrage

```bash
npm install
cp .env.example .env   # puis renseigner DATABASE_URL et AUTH_SECRET
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

### Base de données locale

En développement, une base PostgreSQL locale peut être lancée via le serveur de dev intégré à Prisma (aucune installation de PostgreSQL requise) :

```bash
npx prisma dev --name creole-psf-agri --detach   # démarre le serveur en arrière-plan
npx prisma dev ls                                 # liste les serveurs actifs et leur DATABASE_URL
npx prisma db push                                # applique prisma/schema.prisma à la base
```

Copier l'URL TCP `postgres://...` affichée par `prisma dev ls` dans `DATABASE_URL` (`.env`).

## Structure

- `src/app/` — routes et pages (App Router)
- `prisma/` — schéma et migrations de la base de données
