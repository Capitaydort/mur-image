# 🖼️ Mur d’Images

**Projet universitaire de première année** — Application web permettant aux utilisateurs de se connecter, commenter et liker des images.
Développée avec **Node.js**,**html**, **css**, **JavaScript** et **PostgreSQL**.

---

## Caractéristiques

- **Mode statique et dynamique** : sert à la fois des fichiers statiques (images, CSS, JS) et des pages générées dynamiquement via Node.js et PostgreSQL.  
- **Gestion des événements JavaScript** : interactions côté client comme les likes et la navigation dans le mur d’images.  
- **Sessions et comptes utilisateur** : inscription, connexion, suivi des sessions et restriction des actions (commentaires, likes) aux utilisateurs connectés.  


---

## Prérequis

* **Node.js** (v18 ou supérieur recommandé)
* **PostgreSQL** (v15 ou supérieur)
* npm (installé avec Node.js)

---

## Installation

Clonez le dépôt :

```bash
git clone https://github.com/sbonjour14/mur-image.git
cd mur-image
```

Installez les dépendances Node.js :

```bash
npm install
```

---

## Configuration de la base de données PostgreSQL

Connectez-vous à PostgreSQL :

```bash
psql -U <ton_user> -d postgres
```

Créez la base de données :

```sql
CREATE DATABASE application_image;
```

Sélectionnez la base :

```sql
\c application_image;
```

Et exécutez le script SQL pour la remplir :

```sql
\i application_image.sql;
```

---

## Configuration de l’environnement (`.env`)

Créez un fichier `.env` à la racine du projet :

```bash
touch .env
```

Puis ajoutez les variables suivantes (en adaptant selon votre configuration PostgreSQL) :

```
DB_USER=ton_user
DB_PASSWORD=ton_mot_de_passe
DB_NAME=application_image
DB_HOST=localhost
DB_PORT=5432
```

> Ne publiez **jamais** ce fichier `.env`.
> Vérifiez qu’il est bien ignoré dans votre `.gitignore`.

---

## Lancer le serveur

Démarrez le serveur Node.js :

```bash
npm start
```

ou directement :

```bash
node server.js
```

Ouvrez ensuite votre navigateur à l’adresse :
👉 **[http://localhost:3000](http://localhost:3000)** (ou le port configuré dans le code).

---

## Notes techniques

* L’application communique avec PostgreSQL via le module **pg**.
* Le module **dotenv** charge les variables d’environnement depuis `.env`.

## Licence

Ce projet est distribué sous la licence [MIT](LICENSE).
Vous êtes libre de l’utiliser, le modifier et le redistribuer, à condition de conserver les mentions d’origine.

---

## Auteur

Projet universitaire réalisé par **S. Bonjour**,
dans le cadre de L'UE programmation web et base de données (année 1).
