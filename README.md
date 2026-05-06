# 🎨 FANY Design — Site Vitrine

**Maison de Couture Africaine au Cameroun**

---

## 🚀 Démarrage rapide

### Prérequis
- [Node.js](https://nodejs.org) version 16 ou supérieure
- npm (inclus avec Node.js)

### Installation

```bash
# 1. Décompresser le projet et entrer dans le dossier
cd fany-design

# 2. Installer les dépendances
npm install

# 3. Démarrer le serveur
node server.js
```

### Accès
| URL | Description |
|-----|-------------|
| `http://localhost:3000` | Site public |
| `http://localhost:3000/admin` | Interface administrateur |
| `http://localhost:3000/api/models` | API JSON |

---

## 🔐 Connexion Admin

| Champ | Valeur |
|-------|--------|
| Identifiant | `fany` |
| Mot de passe | `FanyDesign2024` |

> ⚠️ **Important** : Changez le mot de passe dans `public/admin.html`
> (ligne : `const ADMIN_CREDS = { user: 'fany', pass: 'FanyDesign2024' }`)

---

## 📱 Contact WhatsApp

Le numéro configuré est : **+237 671 743 463**

Pour modifier ce numéro, cherchez `237671743463` dans :
- `public/index.html`
- `public/app.js`

---

## 📁 Structure du projet

```
fany-design/
├── public/
│   ├── images/          ← Images uploadées + logo
│   ├── index.html       ← Site public
│   ├── admin.html       ← Interface d'administration
│   ├── styles.css       ← Feuille de styles
│   └── app.js           ← JavaScript frontend
├── data/
│   └── models.json      ← Base de données (JSON)
├── server.js            ← Serveur Express + API
├── package.json         ← Dépendances Node.js
└── README.md            ← Ce fichier
```

---

## 🛠️ API REST

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/models` | Lister tous les modèles |
| `POST` | `/api/models` | Ajouter un modèle |
| `PUT` | `/api/models/:id` | Modifier un modèle |
| `DELETE` | `/api/models/:id` | Supprimer un modèle |

---

## 🌐 Déploiement en production

### Option 1 — VPS (recommandé)

```bash
# Installer PM2 pour garder le serveur en vie
npm install -g pm2

# Démarrer avec PM2
pm2 start server.js --name "fany-design"
pm2 save
pm2 startup
```

### Option 2 — Render.com (gratuit)

1. Créer un compte sur [render.com](https://render.com)
2. New → Web Service
3. Connecter votre dépôt GitHub
4. Build command : `npm install`
5. Start command : `node server.js`

### Option 3 — Railway.app

1. Compte sur [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Ajouter la variable d'environnement `PORT=3000`

---

## 📧 Support

Pour toute question technique, contactez FANY Design :
**WhatsApp : +237 671 743 463**
