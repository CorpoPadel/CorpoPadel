/**
 * Custom error map factory for Zod to handle both missing fields and type mismatches with custom messages.
 */
export const requiredErrorMap = (required: string, invalid: string) => (issue: any) => {
	// Custom handling for 'required' error (undefined input)
	if (issue.input === undefined) {
		return required;
	}

	// Custom handling for type errors
	if (
		issue.code === 'invalid_type' ||
		issue.code === 'invalid_date' ||
		issue.code === 'invalid_enum_value'
	) {
		return invalid;
	}

	// Fallback to Zod's default behavior
	return undefined;
};
