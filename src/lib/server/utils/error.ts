/**
 * Custom application error class to handle HTTP-specific metadata and machine-readable error codes.
 * This class is used by errorResponse to standardize API errors.
 */
export class AppError extends Error {
	public statusCode: number;
	public code: string;
	public details?: any;

	constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: any) {
		super(message);
		this.statusCode = statusCode;
		this.code = code;
		this.details = details;
		Object.setPrototypeOf(this, AppError.prototype);
	}

	/** 400 Bad Request helper */
	static badRequest(message: string, code = 'BAD_REQUEST', details?: any) {
		return new AppError(message, 400, code, details);
	}

	/** 401 Unauthorized helper */
	static unauthorized(message: string = 'Non autorisé', code = 'UNAUTHORIZED') {
		return new AppError(message, 401, code);
	}

	/** 403 Forbidden helper */
	static forbidden(message: string = 'Accès interdit', code = 'FORBIDDEN') {
		return new AppError(message, 403, code);
	}

	/** 404 Not Found helper */
	static notFound(message: string = 'Ressource introuvable', code = 'NOT_FOUND') {
		return new AppError(message, 404, code);
	}

	/** 409 Conflict helper */
	static conflict(message: string, code = 'CONFLICT') {
		return new AppError(message, 409, code);
	}
}
