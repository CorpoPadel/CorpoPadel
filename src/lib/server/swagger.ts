import swaggerJsdoc from 'swagger-jsdoc';

const options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'CorpoPadel API',
			version: '1.0.0',
			description: 'API de gestion du tournoi CorpoPadel (Auto-generated)'
		},
		servers: [
			{
				url: 'http://localhost:5173',
				description: 'Serveur de développement'
			}
		],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT'
				}
			},
			schemas: {
				Error: {
					type: 'object',
					properties: {
						success: { type: 'boolean', example: false },
						message: { type: 'string' }
					}
				}
			}
		},
		paths: {
			'/api/auth/sign-in/email': {
				post: {
					summary: 'Connexion email/mot de passe',
					tags: ['Auth'],
					requestBody: {
						required: true,
						content: {
							'application/json': {
								schema: {
									type: 'object',
									required: ['email', 'password'],
									properties: {
										email: { type: 'string', format: 'email' },
										password: { type: 'string', format: 'password' }
									}
								}
							}
						}
					},
					responses: {
						200: {
							description: 'Connexion réussie',
							content: { 'application/json': { schema: { type: 'object' } } }
						},
						401: { description: 'Identifiants invalides' }
					}
				}
			},
			'/api/auth/sign-up/email': {
				post: {
					summary: 'Inscription email/mot de passe',
					tags: ['Auth'],
					requestBody: {
						required: true,
						content: {
							'application/json': {
								schema: {
									type: 'object',
									required: ['email', 'password', 'name'],
									properties: {
										email: { type: 'string', format: 'email' },
										password: { type: 'string', format: 'password' },
										name: { type: 'string' },
										image: { type: 'string' }
									}
								}
							}
						}
					},
					responses: {
						200: { description: 'Utilisateur créé' },
						400: { description: 'Erreur de validation' }
					}
				}
			},
			'/api/auth/sign-out': {
				post: {
					summary: 'Déconnexion',
					tags: ['Auth'],
					responses: {
						200: { description: 'Déconnecté avec succès' }
					}
				}
			},
			'/api/auth/session': {
				get: {
					summary: 'Récupérer la session courante',
					tags: ['Auth'],
					responses: {
						200: { description: 'Données de session' }
					}
				}
			}
		}
	},
	apis: ['./src/routes/api/v1/**/+server.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
