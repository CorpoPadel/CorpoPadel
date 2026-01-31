import type { MatchStatusEnum } from '$lib/server/db/app-schema';

/** List of tournament pools to be created */
export const poolsData = [{ name: 'Poule A' }, { name: 'Poule B' }];

/** List of initial player profiles representing different companies */
export const playersData = [
	{
		firstName: 'Jean',
		lastName: 'Dupont',
		company: 'TechCorp',
		licenseNumber: 'L000001',
		birthDate: new Date('1990-05-15'),
		email: 'jean.dupont@techcorp.com'
	},
	{
		firstName: 'Marie',
		lastName: 'Martin',
		company: 'TechCorp',
		licenseNumber: 'L000002',
		birthDate: new Date('1992-08-20'),
		email: 'marie.martin@techcorp.com'
	},
	{
		firstName: 'Pierre',
		lastName: 'Durand',
		company: 'InnoSoft',
		licenseNumber: 'L000003',
		birthDate: new Date('1988-03-10'),
		email: 'pierre.durand@innosoft.com'
	},
	{
		firstName: 'Sophie',
		lastName: 'Bernard',
		company: 'InnoSoft',
		licenseNumber: 'L000004',
		birthDate: new Date('1995-11-25'),
		email: 'sophie.bernard@innosoft.com'
	},
	{
		firstName: 'Luc',
		lastName: 'Petit',
		company: 'DataFlow',
		licenseNumber: 'L000005',
		birthDate: new Date('1991-07-08'),
		email: 'luc.petit@dataflow.com'
	},
	{
		firstName: 'Emma',
		lastName: 'Robert',
		company: 'DataFlow',
		licenseNumber: 'L000006',
		birthDate: new Date('1993-02-18'),
		email: 'emma.robert@dataflow.com'
	},
	{
		firstName: 'Thomas',
		lastName: 'Moreau',
		company: 'CloudNet',
		licenseNumber: 'L000007',
		birthDate: new Date('1989-12-05'),
		email: 'thomas.moreau@cloudnet.com'
	},
	{
		firstName: 'Julie',
		lastName: 'Simon',
		company: 'CloudNet',
		licenseNumber: 'L000008',
		birthDate: new Date('1994-09-30'),
		email: 'julie.simon@cloudnet.com'
	},
	{
		firstName: 'Nicolas',
		lastName: 'Laurent',
		company: 'WebAgency',
		licenseNumber: 'L000009',
		birthDate: new Date('1987-04-22'),
		email: 'nicolas.laurent@webagency.com'
	},
	{
		firstName: 'Camille',
		lastName: 'Michel',
		company: 'WebAgency',
		licenseNumber: 'L000010',
		birthDate: new Date('1996-01-14'),
		email: 'camille.michel@webagency.com'
	},
	{
		firstName: 'Alexandre',
		lastName: 'Leroy',
		company: 'StartupXYZ',
		licenseNumber: 'L000011',
		birthDate: new Date('1990-06-11'),
		email: 'alexandre.leroy@startupxyz.com'
	},
	{
		firstName: 'Laura',
		lastName: 'Garcia',
		company: 'StartupXYZ',
		licenseNumber: 'L000012',
		birthDate: new Date('1992-10-03'),
		email: 'laura.garcia@startupxyz.com'
	},
	{
		firstName: 'Antoine',
		lastName: 'Vernet',
		company: 'CyberDyne',
		licenseNumber: 'L000013',
		birthDate: new Date('1985-11-12'),
		email: 'antoine.vernet@cyberdyne.com'
	},
	{
		firstName: 'Clémence',
		lastName: 'Faure',
		company: 'CyberDyne',
		licenseNumber: 'L000014',
		birthDate: new Date('1991-03-25'),
		email: 'clemence.faure@cyberdyne.com'
	},
	{
		firstName: 'Hugo',
		lastName: 'Gros',
		company: 'BioTech',
		licenseNumber: 'L000015',
		birthDate: new Date('1993-09-05'),
		email: 'hugo.gros@biotech.com'
	},
	{
		firstName: 'Léa',
		lastName: 'Dubois',
		company: 'BioTech',
		licenseNumber: 'L000016',
		birthDate: new Date('1995-12-18'),
		email: 'lea.dubois@biotech.com'
	},
	{
		firstName: 'Paul',
		lastName: 'Roux',
		company: 'NextGen',
		licenseNumber: 'L000017',
		birthDate: new Date('1992-04-10'),
		email: 'paul.roux@nextgen.com'
	},
	{
		firstName: 'Alice',
		lastName: 'Benoit',
		company: 'NextGen',
		licenseNumber: 'L000018',
		birthDate: new Date('1994-07-22'),
		email: 'alice.benoit@nextgen.com'
	},
	{
		firstName: 'Julien',
		lastName: 'Perrot',
		company: 'GreenIT',
		licenseNumber: 'L000019',
		birthDate: new Date('1990-02-17'),
		email: 'julien.perrot@greenit.com'
	},
	{
		firstName: 'Claire',
		lastName: 'Lemoine',
		company: 'GreenIT',
		licenseNumber: 'L000020',
		birthDate: new Date('1993-11-29'),
		email: 'claire.lemoine@greenit.com'
	},
	{
		firstName: 'Mathieu',
		lastName: 'Girard',
		company: 'BlueSoft',
		licenseNumber: 'L000021',
		birthDate: new Date('1989-06-13'),
		email: 'mathieu.girard@bluesoft.com'
	},
	{
		firstName: 'Sabrina',
		lastName: 'Marchand',
		company: 'BlueSoft',
		licenseNumber: 'L000022',
		birthDate: new Date('1995-08-24'),
		email: 'sabrina.marchand@bluesoft.com'
	},
	{
		firstName: 'Vincent',
		lastName: 'Baron',
		company: 'RedTech',
		licenseNumber: 'L000023',
		birthDate: new Date('1991-10-16'),
		email: 'vincent.baron@redtech.com'
	},
	{
		firstName: 'Elise',
		lastName: 'Fontaine',
		company: 'RedTech',
		licenseNumber: 'L000024',
		birthDate: new Date('1992-12-02'),
		email: 'elise.fontaine@redtech.com'
	}
];

/**
 * Factory to generate team data linked to inserted players and pools.
 */
export const getTeamsData = (insertedPlayers: any[], insertedPools: any[]) => [
	// Poule A
	{
		company: 'TechCorp',
		player1Id: insertedPlayers[0].id,
		player2Id: insertedPlayers[1].id,
		poolId: insertedPools[0].id
	},
	{
		company: 'InnoSoft',
		player1Id: insertedPlayers[2].id,
		player2Id: insertedPlayers[3].id,
		poolId: insertedPools[0].id
	},
	{
		company: 'DataFlow',
		player1Id: insertedPlayers[4].id,
		player2Id: insertedPlayers[5].id,
		poolId: insertedPools[0].id
	},
	{
		company: 'CloudNet',
		player1Id: insertedPlayers[6].id,
		player2Id: insertedPlayers[7].id,
		poolId: insertedPools[0].id
	},
	{
		company: 'WebAgency',
		player1Id: insertedPlayers[8].id,
		player2Id: insertedPlayers[9].id,
		poolId: insertedPools[0].id
	},
	{
		company: 'StartupXYZ',
		player1Id: insertedPlayers[10].id,
		player2Id: insertedPlayers[11].id,
		poolId: insertedPools[0].id
	},
	// Poule B
	{
		company: 'CyberDyne',
		player1Id: insertedPlayers[12].id,
		player2Id: insertedPlayers[13].id,
		poolId: insertedPools[1].id
	},
	{
		company: 'BioTech',
		player1Id: insertedPlayers[14].id,
		player2Id: insertedPlayers[15].id,
		poolId: insertedPools[1].id
	},
	{
		company: 'NextGen',
		player1Id: insertedPlayers[16].id,
		player2Id: insertedPlayers[17].id,
		poolId: insertedPools[1].id
	},
	{
		company: 'GreenIT',
		player1Id: insertedPlayers[18].id,
		player2Id: insertedPlayers[19].id,
		poolId: insertedPools[1].id
	},
	{
		company: 'BlueSoft',
		player1Id: insertedPlayers[20].id,
		player2Id: insertedPlayers[21].id,
		poolId: insertedPools[1].id
	},
	{
		company: 'RedTech',
		player1Id: insertedPlayers[22].id,
		player2Id: insertedPlayers[23].id,
		poolId: insertedPools[1].id
	}
];

/** List of initial scheduling events */
export const eventsData = [
	{ eventDate: new Date('2025-12-05'), eventTime: '18:00' },
	{ eventDate: new Date('2025-12-05'), eventTime: '19:00' },
	{ eventDate: new Date('2025-12-15'), eventTime: '18:00' },
	{ eventDate: new Date('2025-12-15'), eventTime: '19:00' },
	{ eventDate: new Date('2026-01-05'), eventTime: '18:00' },
	{ eventDate: new Date('2026-01-05'), eventTime: '19:00' },
	{ eventDate: new Date('2026-02-10'), eventTime: '18:00' },
	{ eventDate: new Date('2026-02-10'), eventTime: '19:00' }
];

/**
 * Factory to generate matches linked to inserted events and teams.
 */
export const getMatchesData = (insertedEvents: any[], insertedTeams: any[]) => [
	{
		eventId: insertedEvents[0].id,
		courtNumber: 1,
		team1Id: insertedTeams[0].id,
		team2Id: insertedTeams[1].id,
		status: 'COMPLETED' as MatchStatusEnum,
		scoreTeam1: '6-4, 6-2',
		scoreTeam2: '4-6, 2-6'
	},
	{
		eventId: insertedEvents[0].id,
		courtNumber: 2,
		team1Id: insertedTeams[2].id,
		team2Id: insertedTeams[3].id,
		status: 'COMPLETED' as MatchStatusEnum,
		scoreTeam1: '7-5, 3-6, 7-6',
		scoreTeam2: '5-7, 6-3, 6-7'
	},
	{
		eventId: insertedEvents[0].id,
		courtNumber: 3,
		team1Id: insertedTeams[4].id,
		team2Id: insertedTeams[5].id,
		status: 'COMPLETED' as MatchStatusEnum,
		scoreTeam1: '6-2, 6-3',
		scoreTeam2: '2-6, 3-6'
	},
	{
		eventId: insertedEvents[1].id,
		courtNumber: 1,
		team1Id: insertedTeams[6].id,
		team2Id: insertedTeams[7].id,
		status: 'COMPLETED' as MatchStatusEnum,
		scoreTeam1: '6-3, 6-4',
		scoreTeam2: '3-6, 4-6'
	},
	{
		eventId: insertedEvents[1].id,
		courtNumber: 2,
		team1Id: insertedTeams[8].id,
		team2Id: insertedTeams[9].id,
		status: 'COMPLETED' as MatchStatusEnum,
		scoreTeam1: '4-6, 3-6',
		scoreTeam2: '6-4, 6-3'
	},
	{
		eventId: insertedEvents[1].id,
		courtNumber: 3,
		team1Id: insertedTeams[10].id,
		team2Id: insertedTeams[11].id,
		status: 'COMPLETED' as MatchStatusEnum,
		scoreTeam1: '2-6, 6-4, 1-6',
		scoreTeam2: '6-2, 4-6, 6-1'
	},
	{
		eventId: insertedEvents[2].id,
		courtNumber: 1,
		team1Id: insertedTeams[0].id,
		team2Id: insertedTeams[2].id,
		status: 'COMPLETED' as MatchStatusEnum,
		scoreTeam1: '6-3, 6-2',
		scoreTeam2: '3-6, 2-6'
	},
	{
		eventId: insertedEvents[2].id,
		courtNumber: 2,
		team1Id: insertedTeams[1].id,
		team2Id: insertedTeams[3].id,
		status: 'COMPLETED' as MatchStatusEnum,
		scoreTeam1: '7-6, 6-7, 6-4',
		scoreTeam2: '6-7, 7-6, 4-6'
	},
	{
		eventId: insertedEvents[2].id,
		courtNumber: 3,
		team1Id: insertedTeams[4].id,
		team2Id: insertedTeams[0].id,
		status: 'COMPLETED' as MatchStatusEnum,
		scoreTeam1: '5-7, 6-4, 6-2',
		scoreTeam2: '7-5, 4-6, 2-6'
	},
	{
		eventId: insertedEvents[3].id,
		courtNumber: 1,
		team1Id: insertedTeams[5].id,
		team2Id: insertedTeams[1].id,
		status: 'COMPLETED' as MatchStatusEnum,
		scoreTeam1: '6-2, 6-3',
		scoreTeam2: '2-6, 3-6'
	},
	{
		eventId: insertedEvents[3].id,
		courtNumber: 2,
		team1Id: insertedTeams[6].id,
		team2Id: insertedTeams[8].id,
		status: 'COMPLETED' as MatchStatusEnum,
		scoreTeam1: '6-4, 6-4',
		scoreTeam2: '4-6, 4-6'
	},
	{
		eventId: insertedEvents[3].id,
		courtNumber: 3,
		team1Id: insertedTeams[7].id,
		team2Id: insertedTeams[9].id,
		status: 'COMPLETED' as MatchStatusEnum,
		scoreTeam1: '6-3, 7-5',
		scoreTeam2: '3-6, 5-7'
	},
	{
		eventId: insertedEvents[4].id,
		courtNumber: 1,
		team1Id: insertedTeams[2].id,
		team2Id: insertedTeams[4].id,
		status: 'COMPLETED' as MatchStatusEnum,
		scoreTeam1: '6-2, 6-1',
		scoreTeam2: '2-6, 1-6'
	},
	{
		eventId: insertedEvents[4].id,
		courtNumber: 2,
		team1Id: insertedTeams[3].id,
		team2Id: insertedTeams[5].id,
		status: 'COMPLETED' as MatchStatusEnum,
		scoreTeam1: '6-4, 6-7, 7-5',
		scoreTeam2: '4-6, 7-6, 5-7'
	},
	{
		eventId: insertedEvents[4].id,
		courtNumber: 3,
		team1Id: insertedTeams[6].id,
		team2Id: insertedTeams[10].id,
		status: 'COMPLETED' as MatchStatusEnum,
		scoreTeam1: '6-3, 6-2',
		scoreTeam2: '3-6, 2-6'
	},
	{
		eventId: insertedEvents[5].id,
		courtNumber: 1,
		team1Id: insertedTeams[7].id,
		team2Id: insertedTeams[11].id,
		status: 'COMPLETED' as MatchStatusEnum,
		scoreTeam1: '7-5, 6-4',
		scoreTeam2: '5-7, 4-6'
	},
	{
		eventId: insertedEvents[5].id,
		courtNumber: 2,
		team1Id: insertedTeams[0].id,
		team2Id: insertedTeams[3].id,
		status: 'COMPLETED' as MatchStatusEnum,
		scoreTeam1: '6-2, 6-2',
		scoreTeam2: '2-6, 2-6'
	},
	{
		eventId: insertedEvents[5].id,
		courtNumber: 3,
		team1Id: insertedTeams[1].id,
		team2Id: insertedTeams[2].id,
		status: 'COMPLETED' as MatchStatusEnum,
		scoreTeam1: '6-4, 6-4',
		scoreTeam2: '4-6, 4-6'
	},
	{
		eventId: insertedEvents[6].id,
		courtNumber: 1,
		team1Id: insertedTeams[4].id,
		team2Id: insertedTeams[5].id,
		status: 'COMPLETED' as MatchStatusEnum,
		scoreTeam1: '7-6, 6-3',
		scoreTeam2: '6-7, 3-6'
	},
	{
		eventId: insertedEvents[6].id,
		courtNumber: 2,
		team1Id: insertedTeams[6].id,
		team2Id: insertedTeams[9].id,
		status: 'COMPLETED' as MatchStatusEnum,
		scoreTeam1: '6-1, 6-2',
		scoreTeam2: '1-6, 2-6'
	},
	{
		eventId: insertedEvents[6].id,
		courtNumber: 3,
		team1Id: insertedTeams[7].id,
		team2Id: insertedTeams[8].id,
		status: 'COMPLETED' as MatchStatusEnum,
		scoreTeam1: '6-3, 6-4',
		scoreTeam2: '3-6, 4-6'
	},
	{
		eventId: insertedEvents[7].id,
		courtNumber: 1,
		team1Id: insertedTeams[10].id,
		team2Id: insertedTeams[11].id,
		status: 'COMPLETED' as MatchStatusEnum,
		scoreTeam1: '6-4, 6-2',
		scoreTeam2: '4-6, 2-6'
	},
	{
		eventId: insertedEvents[7].id,
		courtNumber: 2,
		team1Id: insertedTeams[8].id,
		team2Id: insertedTeams[11].id,
		status: 'COMPLETED' as MatchStatusEnum,
		scoreTeam1: '7-5, 6-3',
		scoreTeam2: '5-7, 3-6'
	},
	{
		eventId: insertedEvents[7].id,
		courtNumber: 3,
		team1Id: insertedTeams[9].id,
		team2Id: insertedTeams[10].id,
		status: 'COMPLETED' as MatchStatusEnum,
		scoreTeam1: '6-2, 6-4',
		scoreTeam2: '2-6, 4-6'
	}
];
