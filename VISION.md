# CREOLE PSF AGRI PLATFORM

## 🌱 Vision du projet

CREOLE PSF Agri Platform est une plateforme numérique moderne de gestion agricole conçue pour les exploitations agricoles en Haïti et ailleurs.

L’objectif est de permettre aux fermes de :
- suivre leurs parcelles
- gérer leurs cultures
- organiser les travaux agricoles
- suivre les dépenses et revenus
- optimiser la production grâce aux données et à l’intelligence artificielle

La plateforme est pensée dès le départ comme un système **multi-exploitations (multi-tenant SaaS)**.

---

## 🧭 Objectif principal

Créer un système centralisé permettant à plusieurs fermes de :

- gérer leurs opérations agricoles
- suivre leur performance
- prendre de meilleures décisions grâce aux données
- réduire les pertes et augmenter les rendements

---

## 🏗️ Architecture du système

La plateforme est construite avec :

- Frontend : Next.js (React + TypeScript)
- Backend : API Next.js
- Base de données : PostgreSQL + Prisma ORM
- Authentification : Auth.js
- UI : Tailwind CSS
- Cartographie : Leaflet
- Déploiement : Vercel
- Versioning : GitHub

---

## 👥 Système multi-exploitation

Chaque utilisateur appartient à une ou plusieurs fermes.

Chaque ferme possède :
- ses utilisateurs
- ses parcelles
- ses cultures
- ses employés
- ses finances
- son inventaire

Isolation stricte des données entre exploitations.

---

## 🌾 Modules principaux

### 1. Authentification & utilisateurs
- inscription / connexion
- rôles : Admin, Manager, Employé

### 2. Gestion des fermes
- création de ferme
- configuration
- gestion des membres

### 3. Parcelles agricoles
- création de parcelles
- géolocalisation
- type de sol
- superficie

### 4. Cultures
- plantation
- suivi agronomique
- irrigation
- fertilisation
- récolte

### 5. Calendrier agricole
- planification des tâches
- rappels
- historique des activités

### 6. Inventaire
- semences
- engrais
- carburant
- matériel

### 7. Comptabilité agricole
- dépenses
- revenus
- rapports financiers

### 8. Intelligence artificielle (future)
- diagnostic des cultures
- recommandations agricoles
- prévisions de rendement
- assistant intelligent

---

## 📊 Philosophie du produit

- Simple à utiliser même pour un agriculteur non technique
- Fonctionne en environnement rural
- Optimisé pour mobile
- Rapide et léger
- Basé sur les données réelles du terrain

---

## 🚀 Vision long terme

Devenir une plateforme agricole SaaS utilisée par :

- fermes locales en Haïti
- coopératives agricoles
- ONG agricoles
- projets internationaux de développement rural

---

## 🧩 Principe clé

Chaque fonctionnalité doit répondre à une question réelle :

> "Est-ce que cela aide un agriculteur à mieux produire ou mieux gérer sa ferme ?"

Si la réponse est non → la fonctionnalité n’est pas prioritaire.
