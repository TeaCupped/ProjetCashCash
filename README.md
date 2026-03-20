# Application Web CashCash - Guide de Démarrage

Ce projet utilise une architecture Modèle-Vue-Contrôleur (MVC) avec **Node.js** pour le serveur (backend/API) et du **JavaScript/HTML/CSS** classique assaisonné de **jQuery et AJAX** pour le frontend. Il utilise également le module natif **SQLite** de Node.js pour la base de données.

## Prérequis

1. Vous devez avoir **Node.js v24** ou supérieur installé sur votre machine.

## Étape 1 : Initialisation de l'application et de la base de données

Ouvrez un terminal (Invite de commandes ou PowerShell) dans le dossier de l'application (le dossier contenant ce fichier `README.md`) et exécutez les commandes suivantes dans l'ordre :

1.  **Installer les dépendances :**
    ```bash
    npm install
    ```
    *Cela va installer les modules nécessaires (Express, bcryptjs, cors, jsonwebtoken).*

2.  **Initialiser la base de données SQLite :**
    ```bash
    node init-db.js
    ```
    *Vous devriez voir le message `Database initialized successfully.` Cela supprime toute ancienne base pour recréer proprement `cashcash.db` avec les données d'essai.*

## Étape 2 : Lancer le serveur Backend (L'API)

Dans le même terminal, lancez le fichier serveur :

```bash
node server.js
```
*Le terminal affichera "Server running on http://localhost:3000". Laissez cette fenêtre de terminal ouverte pendant que vous utilisez l'application.*

## Étape 3 : Lancer l'interface Frontend

Vous avez deux options pour ouvrir le site web :

**Option 1 : Méthode rapide (Fichier local)**
Ouvrez votre explorateur de fichiers, naviguez dans le sous-dossier `public/`, et double-cliquez simplement sur le fichier `index.html` pour l'ouvrir dans votre navigateur (Chrome, Edge, Firefox, etc.).

**Option 2 : Avec un serveur HTTP local (Plus robuste)**
Si vous avez un outil comme Live Server dans VSCode, ou un serveur comme `serve` installé globalement via npm :
Ouvrez un **nouveau** terminal dans le dossier `public/` puis tapez :
```bash
npx serve .
```
Ensuite, cliquez sur l'URL `http://localhost:X` générée dans votre terminal.

---

## 🔑 Identifiants de Test (Comptes de Démonstration)

Dès que la page `index.html` (Connexion) est ouverte, utilisez l'un de ces profils :

**Profil Admin (Etienne Lantier)**
- **Matricule :** `3001`
- **Mot de passe :** `password123`

**Profil Technicien (Claire DUPONT)**
- **Matricule :** `1001`
- **Mot de passe :** `password123`

**Profil Gestionnaire (Paul BERNARD)**
- **Matricule :** `2001`
- **Mot de passe :** `password123`
*(Les gestionnaires ont accès à l'onglet Statistiques et au bouton "+ Créer" une intervention)*
