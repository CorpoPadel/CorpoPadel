import { describe, it, expect } from 'vitest';
import { passwordSchema, loginSchema, changePasswordSchema } from './auth';

describe('validations/auth', () => {
	describe('passwordSchema', () => {
		it('should validate a correct password', () => {
			expect(passwordSchema.safeParse('SuperSecret123!').success).toBe(true);
		});

		it('should fail if too short', () => {
			const res = passwordSchema.safeParse('Short1!');
			expect(res.success).toBe(false);
		});

		it('should fail if no uppercase', () => {
			const res = passwordSchema.safeParse('supersecret123!');
			expect(res.success).toBe(false);
		});

		it('should fail if no lowercase', () => {
			const res = passwordSchema.safeParse('SUPERSECRET123!');
			expect(res.success).toBe(false);
		});

		it('should fail if no digit', () => {
			const res = passwordSchema.safeParse('SuperSecret!!!');
			expect(res.success).toBe(false);
		});

		it('should fail if no special char', () => {
			const res = passwordSchema.safeParse('SuperSecret1234');
			expect(res.success).toBe(false);
		});
	});

	describe('loginSchema', () => {
		it('should validate valid login', () => {
			expect(
				loginSchema.safeParse({ email: 'test@example.com', password: 'SuperSecret123!' }).success
			).toBe(true);
		});

		it('should fail invalid email', () => {
			expect(
				loginSchema.safeParse({ email: 'notanemail', password: 'SuperSecret123!' }).success
			).toBe(false);
		});

		// Note: Login schema currently enforces complexity
		it('should fail simple password in login', () => {
			expect(
				loginSchema.safeParse({ email: 'test@example.com', password: 'password' }).success
			).toBe(false);
		});
	});

	describe('changePasswordSchema', () => {
		const validBase = {
			currentPassword: 'OldPassword123!',
			newPassword: 'NewPassword123!',
			confirmPassword: 'NewPassword123!'
		};

		it('should validate correct change', () => {
			expect(changePasswordSchema.safeParse(validBase).success).toBe(true);
		});

		it('should fail if new != confirm', () => {
			expect(
				changePasswordSchema.safeParse({
					...validBase,
					confirmPassword: 'OtherPassword123!'
				}).success
			).toBe(false);
		});

		it('should fail if new == current', () => {
			expect(
				changePasswordSchema.safeParse({
					...validBase,
					newPassword: 'OldPassword123!',
					confirmPassword: 'OldPassword123!'
				}).success
			).toBe(false);
		});

		it('should fail if new password is weak', () => {
			expect(
				changePasswordSchema.safeParse({
					...validBase,
					newPassword: 'weak',
					confirmPassword: 'weak'
				}).success
			).toBe(false);
		});
	});
});
