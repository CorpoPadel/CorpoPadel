import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { db } from '../../src/lib/server/db';
import { loginAttempts } from '../../src/lib/server/db/app-schema';
import { session, user } from '../../src/lib/server/db/schema';
import { eq } from 'drizzle-orm';

const { Given, When, Then } = createBdd();

// ================
// Given
// ----------------

Given('Je suis sur la page de connexion', async ({ page }) => {
	await page.goto('/auth/sign-in');
	await expect(page.getByLabel('Email')).toBeVisible();
});

Given("J'ai un compte admin nouvellement créé", async ({ page }) => {
	const email = 'admin@corpopadel.com';
	const now = new Date();

	const attempt = await db.query.loginAttempts.findFirst({ where: eq(loginAttempts.email, email) });
	if (attempt) {
		await db
			.update(loginAttempts)
			.set({ attemptsCount: 0, lockedUntil: null, lastAttempt: now })
			.where(eq(loginAttempts.email, email));
	} else
		await db
			.insert(loginAttempts)
			.values({ email, attemptsCount: 0, lastAttempt: now, lockedUntil: null });

	const adminUser = await db.query.user.findFirst({ where: eq(user.email, email) });
	if (adminUser) await db.delete(session).where(eq(session.userId, adminUser.id));
});

Given("J'ai un compte joueur nouvellement créé", async ({ page }) => {
	const email = 'user@corpopadel.com';
	const now = new Date();

	const attempt = await db.query.loginAttempts.findFirst({ where: eq(loginAttempts.email, email) });
	if (attempt) {
		await db
			.update(loginAttempts)
			.set({ attemptsCount: 0, lockedUntil: null, lastAttempt: now })
			.where(eq(loginAttempts.email, email));
	} else
		await db
			.insert(loginAttempts)
			.values({ email, attemptsCount: 0, lastAttempt: now, lockedUntil: null });

	const playerUser = await db.query.user.findFirst({ where: eq(user.email, email) });
	if (playerUser) await db.delete(session).where(eq(session.userId, playerUser.id));
});

// ================
// Email
// ----------------

When('Je remplis le champ email avec {string}', async ({ page }, email: string) => {
	await page.getByLabel('Email').fill(email);
});

// Valide

When('Je remplis le champ email avec un compte admin', async ({ page }) => {
	await page.getByLabel('Email').fill('admin@corpopadel.com');
});

When('Je remplis le champ email avec un compte joueur', async ({ page }) => {
	await page.getByLabel('Email').fill('user@corpopadel.com');
});

// Invalide

When('Je remplis le champ email avec un mail non conforme', async ({ page }) => {
	await page.getByLabel('Email').fill('email@invalide');
});

When('Je laisse le champ email vide', async ({ page }) => {
	await page.getByLabel('Email').fill('');
});

// ================
// Email
// ----------------

When('Je rentre le mot de passe : {string}', async ({ page }, password: string) => {
	await page.getByLabel('Mot de passe').fill(password);
});

// Valide

When('Je rentre mon mot de passe avec un compte admin', async ({ page }) => {
	await page.getByLabel('Mot de passe').fill('Admin@123456789');
});

When('Je rentre mon mot de passe avec un compte joueur', async ({ page }) => {
	await page.getByLabel('Mot de passe').fill('User@123456789');
});

// Invalide

When('Je laisse le champ mot de passe vide', async ({ page }) => {
	await page.getByLabel('Mot de passe').fill('');
});

When('Je rentre un mot de passe trop courts', async ({ page }) => {
	await page.getByLabel('Mot de passe').fill('passwd');
});

When('Je rentre un mot de passe sans caractère spécial', async ({ page }) => {
	await page.getByLabel('Mot de passe').fill('password1234');
});

When('Je rentre un mauvais mot de passe', async ({ page }) => {
	await page.getByLabel('Mot de passe').fill('Password@123');
});

// ================
// Button
// ----------------

When('J\'appuie sur le bouton "Se connecter"', async ({ page }) => {
	const button = page.getByRole('button', { name: 'Connexion' });
	await expect(button).toBeEnabled();
	await page.waitForLoadState('networkidle');
	await button.click();
});

// ================
// Loops
// ----------------

When("L'admin a tenté de se connecter 5 fois avec les mauvaises credentiels", async ({ page }) => {
	for (let i = 0; i < 5; i++) {
		await page.getByLabel('Email').fill('admin@corpopadel.com');
		await page.getByLabel('Mot de passe').fill(`Password@123`);

		const button = page.getByRole('button', { name: 'Connexion' });
		await expect(button).toBeEnabled();
		await page.waitForLoadState('networkidle');
		await button.click();
		await page.waitForLoadState('networkidle');
	}
	await expect(page.locator('body')).toContainText(/.*Compte verrouillé.*/);
});

When(
	'Le joueur a tenté de se connecter 5 fois avec les mauvaises credentiels',
	async ({ page }) => {
		for (let i = 0; i < 5; i++) {
			await page.getByLabel('Email').fill('user@corpopadel.com');
			await page.getByLabel('Mot de passe').fill(`Password@123`);

			const button = page.getByRole('button', { name: 'Connexion' });
			await expect(button).toBeEnabled();
			await page.waitForLoadState('networkidle');
			await button.click();
			await page.waitForLoadState('networkidle');
		}
		await expect(page.locator('body')).toContainText(/.*Compte verrouillé.*/);
	}
);

// ================
// Loops
// ----------------

Then("L'utilisateur est redirigé sur l'écran principal", async ({ page }) => {
	await page.waitForLoadState('networkidle');
	await expect(page).toHaveURL('/');
});

// ======================
// Connecté en tant que
// ---------------------

Then("L'utilisateur est connecté en tant qu'admin", async ({ page }, mail: string) => {
	await expect(page).toHaveURL('/');
	await page.waitForLoadState('networkidle');
	await page.locator('span[data-slot="avatar-fallback"]').click();
	await expect(page.getByText('admin@corpopadel.com')).toBeVisible();
});

Then("L'utilisateur est connecté en tant que joueur", async ({ page }, mail: string) => {
	await expect(page).toHaveURL('/');
	await page.waitForLoadState('networkidle');
	await page.locator('span[data-slot="avatar-fallback"]').click();
	await expect(page.getByText('user@corpopadel.com')).toBeVisible();
});

// ======================
// Page access
// ---------------------

Then(
	"L'admin a accès aux pages de modification, d'ajout de joueurs et d'évènements.",
	async ({ page }) => {
		await page.goto('/admin');
		await page.waitForLoadState('networkidle');
		await expect(page).toHaveURL('/admin');
	}
);

Then("Le joueur n'a pas accès aux onglets pour l'admin", async ({ page }) => {
	await page.goto('/admin');
	await page.waitForLoadState('networkidle');
	await expect(page).not.toHaveURL('/admin');
});

Then("L'accès à la plateforme n'est pas autorisé", async ({ page }) => {
	await page.waitForLoadState('networkidle');
	await expect(page).toHaveURL(/\/auth\/sign-in/);
});

Then('La connexion a échouée', async ({ page }) => {
	await page.waitForLoadState('networkidle');
	await expect(page).toHaveURL(/\/auth\/sign-in/);
});

// ======================
// Input state
// ---------------------

Then('La bordure du champ email devient rouge', async ({ page }) => {
	await expect(page.getByLabel('Email')).toHaveClass(/.*border-destructive.*/);
});

Then('La bordure du champ mot de passe devient rouge', async ({ page }) => {
	await expect(page.getByLabel('Mot de passe')).toHaveClass(/.*border-destructive.*/);
});

// ======================
// Message
// ---------------------

Then("Le message {string} s'affiche", async ({ page }, message: string) => {
	const locator = page.locator('body').getByText(message);
	await expect(locator.first()).toBeVisible();
});

Then(
	"Un compteur expliquant qu'il reste {int} tentatives restantes s'affiche",
	async ({ page }, count: number) => {
		const regex = new RegExp(`Il vous reste\\s*${count}\\s*tentatives`, 'i');
		await expect(page.locator('body')).toContainText(regex);
	}
);

Then('La connexion au compte admin est verrouillé', async () => {
	const email = 'admin@corpopadel.com';
	const attempt = await db.query.loginAttempts.findFirst({ where: eq(loginAttempts.email, email) });
	expect(attempt).toBeTruthy();
	expect(attempt?.lockedUntil).toBeTruthy();
	expect(attempt?.lockedUntil && attempt.lockedUntil > new Date()).toBe(true);
});

Then('La connexion au compte joueur est verrouillé', async () => {
	const email = 'user@corpopadel.com';
	const attempt = await db.query.loginAttempts.findFirst({ where: eq(loginAttempts.email, email) });
	expect(attempt).toBeTruthy();
	expect(attempt?.lockedUntil).toBeTruthy();
	expect(attempt?.lockedUntil && attempt.lockedUntil > new Date()).toBe(true);
});

Then('Le temps restant avant le déblocage du compte est affiché', async ({ page }) => {
	await page.waitForLoadState('networkidle');
	await expect(page.locator('body')).toContainText(/.*Compte verrouillé.*/);
});
