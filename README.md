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
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Structure

- `src/app/` — routes et pages (App Router)
- `prisma/` — schéma et migrations de la base de données
