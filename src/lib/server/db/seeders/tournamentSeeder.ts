import { db } from '$lib/server/db';
import { players, teams, pools, events, matches } from '$lib/server/db/app-schema';
import { eventsData, playersData, poolsData, getTeamsData, getMatchesData } from './data';

/**
 * Seeds core tournament entities: pools, players, teams, and match events.
 */
export const seedTournamentData = async () => {
	console.log('🎾 Seeding Expanded Tournament Data...');

	// 1. Create pools
	const insertedPools = await db.insert(pools).values(poolsData).returning();
	console.log(`   ✓ ${insertedPools.length} pools created`);

	// 2. Create players
	const insertedPlayers = await db.insert(players).values(playersData).returning();
	console.log(`   ✓ ${insertedPlayers.length} players created`);

	// 3. Create teams (linked to players and pools)
	const teamsData = getTeamsData(insertedPlayers, insertedPools);
	const insertedTeams = await db.insert(teams).values(teamsData).returning();
	console.log(`   ✓ ${insertedTeams.length} teams created`);

	// 4. Create time-slot events
	const insertedEvents = await db.insert(events).values(eventsData).returning();
	console.log(`   ✓ ${insertedEvents.length} events created`);

	// 5. Create matches within those events
	const matchesData = getMatchesData(insertedEvents, insertedTeams);
	const insertedMatches = await db.insert(matches).values(matchesData).returning();
	console.log(`   ✓ ${insertedMatches.length} matches created`);

	return {
		pools: insertedPools,
		players: insertedPlayers,
		teams: insertedTeams,
		events: insertedEvents,
		matches: insertedMatches
	};
};
