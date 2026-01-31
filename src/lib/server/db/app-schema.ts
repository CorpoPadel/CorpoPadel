import { relations, sql } from 'drizzle-orm';
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { user, session, account } from './schema';

/** Status for account activation flow */
export type UserStatusType = 'ACTIVATE' | 'DEACTIVATE';
/** Status for individual matches */
export type MatchStatusEnum = 'ONGOING' | 'COMPLETED' | 'CANCELED';

/** Table for fine-grained permissions */
export const privileges = sqliteTable('privileges', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	label: text('label').notNull().unique(),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => new Date())
		.notNull()
});

/** Table for user roles (e.g., ADMINISTRATEUR, JOUEUR) */
export const roles = sqliteTable('roles', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	label: text('label').notNull().unique(),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => new Date())
		.notNull()
});

/** Junction table for Roles and Privileges (Many-to-Many) */
export const rolePrivileges = sqliteTable(
	'role_privileges',
	{
		roleId: integer('role_id')
			.notNull()
			.references(() => roles.id, { onDelete: 'cascade' }),
		privilegeId: integer('privilege_id')
			.notNull()
			.references(() => privileges.id, { onDelete: 'cascade' })
	},
	(table) => [
		index('role_privileges_roleId_idx').on(table.roleId),
		index('role_privileges_privilegeId_idx').on(table.privilegeId)
	]
);

/** Junction table for Users and Roles (Many-to-Many) */
export const userRoles = sqliteTable(
	'user_roles',
	{
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		roleId: integer('role_id')
			.notNull()
			.references(() => roles.id, { onDelete: 'cascade' })
	},
	(table) => [
		index('user_roles_userId_idx').on(table.userId),
		index('user_roles_roleId_idx').on(table.roleId)
	]
);

/** Table for player personal details, linked to an optional auth user */
export const players = sqliteTable('players', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	firstName: text('first_name').notNull(),
	lastName: text('last_name').notNull(),
	email: text('email').notNull().unique(),
	company: text('company').notNull(),
	licenseNumber: text('license_number').notNull().unique(),
	birthDate: integer('birth_date', { mode: 'timestamp_ms' }),
	photoUrl: text('photo_url'),
	userId: text('user_id')
		.references(() => user.id, { onDelete: 'set null' })
		.unique(),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => new Date())
		.notNull()
});

/** Table for tournament pools (groups of teams) */
export const pools = sqliteTable('pools', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull().unique(),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => new Date())
		.notNull()
});

/** Table for team duos, belonging to companies and optionally assigned to pools */
export const teams = sqliteTable('teams', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	company: text('company').notNull(),
	player1Id: integer('player1_id')
		.notNull()
		.references(() => players.id, { onDelete: 'restrict' })
		.unique(),
	player2Id: integer('player2_id')
		.notNull()
		.references(() => players.id, { onDelete: 'restrict' })
		.unique(),
	poolId: integer('pool_id').references(() => pools.id, { onDelete: 'set null' }),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => new Date())
		.notNull()
});

/** Table for scheduling events (time slots) */
export const events = sqliteTable('events', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	eventDate: integer('event_date', { mode: 'timestamp_ms' }).notNull(),
	eventTime: text('event_time').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => new Date())
		.notNull()
});

/** Table for individual matches belonging to an event */
export const matches = sqliteTable(
	'matches',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		eventId: integer('event_id')
			.notNull()
			.references(() => events.id, { onDelete: 'cascade' }),
		courtNumber: integer('court_number').notNull(),
		team1Id: integer('team1_id')
			.notNull()
			.references(() => teams.id, { onDelete: 'restrict' }),
		team2Id: integer('team2_id')
			.notNull()
			.references(() => teams.id, { onDelete: 'restrict' }),
		status: text('status').$type<MatchStatusEnum>().notNull().default('ONGOING'),
		scoreTeam1: text('score_team1'),
		scoreTeam2: text('score_team2'),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull()
	},
	(table) => [index('matches_eventId_idx').on(table.eventId)]
);

/** Table for storing secure password reset tokens */
export const passwordResetTokens = sqliteTable('password_reset_tokens', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	token: text('token').notNull().unique(),
	expirationDate: integer('expiration_date', { mode: 'timestamp_ms' }).notNull(),
	userId: integer('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => new Date())
		.notNull()
});

/** Table for tracking and limiting sign-in attempts per email */
export const loginAttempts = sqliteTable('login_attempts', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	email: text('email').notNull().unique(),
	attemptsCount: integer('attempts_count').notNull().default(0),
	lastAttempt: integer('last_attempt', { mode: 'timestamp_ms' }).notNull(),
	lockedUntil: integer('locked_until', { mode: 'timestamp_ms' }),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => new Date())
		.notNull()
});

// --- Drizzle Relations Definitions ---

export const privilegesRelations = relations(privileges, ({ many }) => ({
	rolePrivileges: many(rolePrivileges)
}));

export const rolesRelations = relations(roles, ({ many }) => ({
	rolePrivileges: many(rolePrivileges),
	userRoles: many(userRoles)
}));

export const rolePrivilegesRelations = relations(rolePrivileges, ({ one }) => ({
	role: one(roles, {
		fields: [rolePrivileges.roleId],
		references: [roles.id]
	}),
	privilege: one(privileges, {
		fields: [rolePrivileges.privilegeId],
		references: [privileges.id]
	})
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
	user: one(user, {
		fields: [userRoles.userId],
		references: [user.id]
	}),
	role: one(roles, {
		fields: [userRoles.roleId],
		references: [roles.id]
	})
}));

export const playersRelations = relations(players, ({ one }) => ({
	user: one(user, {
		fields: [players.userId],
		references: [user.id]
	})
}));

export const poolsRelations = relations(pools, ({ many }) => ({
	teams: many(teams)
}));

export const teamsRelations = relations(teams, ({ one }) => ({
	player1: one(players, {
		fields: [teams.player1Id],
		references: [players.id]
	}),
	player2: one(players, {
		fields: [teams.player2Id],
		references: [players.id]
	}),
	pool: one(pools, {
		fields: [teams.poolId],
		references: [pools.id]
	})
}));

export const eventsRelations = relations(events, ({ many }) => ({
	matches: many(matches)
}));

export const matchesRelations = relations(matches, ({ one }) => ({
	event: one(events, {
		fields: [matches.eventId],
		references: [events.id]
	}),
	team1: one(teams, {
		fields: [matches.team1Id],
		references: [teams.id]
	}),
	team2: one(teams, {
		fields: [matches.team2Id],
		references: [teams.id]
	})
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
	user: one(user, {
		fields: [passwordResetTokens.userId],
		references: [user.id]
	})
}));

export const usersRelations = relations(user, ({ one, many }) => ({
	sessions: many(session),
	accounts: many(account),

	player: one(players, {
		fields: [user.id],
		references: [players.userId]
	}),
	userRoles: many(userRoles),
	passwordResetTokens: many(passwordResetTokens)
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	})
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	})
}));
