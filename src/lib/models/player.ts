export interface Player {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
	company: string;
	licenseNumber: string;
	birthDate: Date | null;
	photoUrl: string | null;
	userId?: string | null;
	createdAt: Date;
	updatedAt: Date;
}
