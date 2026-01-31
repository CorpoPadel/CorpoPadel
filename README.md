# CorpoPadel V2 🎾

Plateforme full-stack moderne de gestion de tournois de Padel inter-entreprises. Cette application permet de gérer les inscriptions, la planification des matchs, la saisie des scores et le calcul automatique des classements avec une interface utilisateur fluide et réactive.

## 🚀 Stack Technique

Le projet repose sur les technologies les plus récentes du Web :

- **Framework**: [SvelteKit 2](https://kit.svelte.dev/) avec **Svelte 5** (utilisation intensive des **Runes** : `$state`, `$derived`, `$props`).
- **Runtime**: [Bun](https://bun.sh/) (recommandé) ou Node.js 20+.
- **Base de données**: [SQLite](https://www.sqlite.org/) via [libsql](https://github.com/tursodatabase/libsql-js).
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) pour un typage strict et des migrations simplifiées.
- **Authentification**: [Better-Auth](https://better-auth.com/) avec gestion des sessions et protection brute-force.
- **Validation**: [Zod](https://zod.dev/) pour une validation robuste des données (formulaires et API).
- **UI & Design**: [Tailwind CSS 4](https://tailwindcss.com/), [Shadcn-Svelte](https://shadcn-svelte.com/) et [Lucide Icons](https://lucide.dev/).
- **Gestion d'état**: [Runed](https://runed.dev/) (pour de nouvelles runes tel que `watch` qui remplace le `$effect`).

## 🛠️ Installation & Lancement

### 1. Prérequis

Assurez-vous d'avoir [Bun](https://bun.sh/) (recommandé) ou [Node.js](https://nodejs.org/en) installé.

### 2. Cloner le projet et préparer les variables d'environnement

```bash
git clone https://github.com/CorpoPadel/CorpoPadel
cd CorpoPadel
cp .env.example .env
```

On génère une clé secrète pour l'authentification depuis ce [site](https://jwtsecrets.com/)
et on la colle dans la variable `BETTER_AUTH_SECRET` du fichier `.env`.
Il n'est pas nécessaire de modifier les autres variables d'environnement pour une installation locale en mode développement.

### 3. Installer les dépendances

```bash
# Avec Bun (Recommandé)
bun install

# Avec NPM
npm install

# Avec PNPM
pnpm install
```

### 4. Configuration de la base de données

Le projet utilise SQLite.

Soit, il suffit de placer la base de données SQLite `local.db` fournie avec le projet dans le dossier `database` (fournie dans les ressources), soit de l'initialiser via les commandes suivantes.

Initialisez le schéma et les données de test :

```bash
# Générer les fichiers de migration
bun run db:generate

# Ou avec NPM
npm run db:generate

# Ou avec PNPM
pnpm run db:generate
```

```bash
# Pousser le schéma vers la base de données locale (local.db)
bun run db:push

# Ou avec NPM
npm run db:push

# Ou avec PNPM
pnpm run db:push
```

```bash
# (Optionnel) Peupler avec des données de test (comptes démo inclus)
bun run db:seed

# Ou avec NPM
npm run db:seed

# Ou avec PNPM
pnpm run db:seed
```

### 5. Lancer le serveur

```bash
bun run dev

# Ou avec NPM
npm run dev

# Ou avec PNPM
pnpm run dev
```

L'application de développement est accessible sur `http://localhost:5173`.

---

## 🧪 Tests & Qualité du Code

Le projet intègre une suite complète de tests pour garantir la stabilité.

### 🧪 Tests Unitaires (Vitest)

Utilisés pour tester la logique métier.

```bash
bun run test:unit --coverage
```

### 🎭 Tests E2E (Playwright)

Simulent le parcours utilisateur complet (connexion).

```bash
# Installer les navigateurs Playwright (première fois)
bun x playwright install

# Lancer les tests E2E
bun run test:e2e
```

### 🛡️ Vérification de la Qualité

```bash
bun run check   # Vérification stricte des types TypeScript (Svelte-check)
bun run format  # Formatage automatique (Prettier)
```

---

## 🔑 Comptes de Test (via db:seed)

- **Admin** : `admin@corpopadel.com` / `Admin@123456789`
- **Utilisateur** : `user@corpopadel.com` / `User@123456789`
