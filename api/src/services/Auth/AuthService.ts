import * as bcrypt from 'bcrypt';
import { inject, injectable } from 'inversify';
import * as uuid from 'uuid';
import { User, UserRole } from '../../domain';
import { BadRequestError, NotFoundError } from '../../errors';
import { TYPES } from '../../inversify.constants';
import { UserRepo } from '../../repos';
import { SessionUser } from '../../server';
import { Logger, rand } from '../../util';

@injectable()
export class AuthService {
  static MAX_RESET_PASSWORD_TOKEN_AGE_MS = 86400 * 1000; // 1 day
  static MIN_PASSWORD_LENGTH = 6;
  static HASH_ROUNDS = 10;
  static RESET_PASSWORD_TOKEN_LENGTH = 10;
  static EMAIL_CONFIRMATION_TOKEN_LENGTH = 10;

  static async encryptPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, AuthService.HASH_ROUNDS);
  }

  constructor(@inject(TYPES.UserRepo) public userRepo: UserRepo, @inject(TYPES.Logger) public logger: Logger) {}

  async getSessionUser(id: string): Promise<SessionUser> {
    const user = id ? await this.userRepo.find(id) : null;
    return this.toSessionUser(user);
  }

  toSessionUser(user: User | null): SessionUser {
    if (user) {
      return { id: user.id, role: user.role, isLoggedIn: true };
    }
    return { id: '', role: UserRole.STUDENT, isLoggedIn: false };
  }

  async whoami(id: string): Promise<User | null> {
    return await this.userRepo.find(id);
  }

  async getAuthenticatedUser(usernameOrEmail: string, password: string): Promise<User | null> {
    const user = await this.userRepo.findByUsernameOrEmail(usernameOrEmail);
    if (!user) {
      return null;
    }
    const isPassword = await bcrypt.compare(password, user.encryptedPassword);
    return isPassword ? user : null;
  }

  async signup(username: string, email: string, password: string): Promise<User> {
    this.validatePassword(password);
    const encryptedPassword = await AuthService.encryptPassword(password);
    const confirmationToken = uuid.v4();

    const user = await this.userRepo.create({
      username,
      email,
      encryptedPassword,
      confirmationToken,
    });

    return user;
  }

  async confirmEmail(id: string, confirmationToken: string, confirmedAt: Date): Promise<User> {
    const user = await this.userRepo.find(id);
    if (!user) {
      throw new NotFoundError('user not found');
    }
    if (user.confirmedAt) {
      throw new BadRequestError('invalid confirmation token');
    }
    if (!user.confirmationToken) {
      throw new BadRequestError('invalid confirmation token');
    }
    if (!confirmationToken) {
      throw new BadRequestError('invalid confirmation token');
    }
    const confirmationTokensMatch = await this.tokensMatch(user.confirmationToken, confirmationToken);
    if (!confirmationTokensMatch) {
      throw new BadRequestError('invalid confirmation token');
    }

    return await this.userRepo.update(user.id, { confirmationToken: null, confirmedAt });
  }

  async resetConfirmationToken(id: string): Promise<User> {
    const user = await this.userRepo.find(id);
    if (!user) {
      throw new NotFoundError('user not found');
    }
    if (user.confirmedAt) {
      throw new BadRequestError('user already confirmed');
    }
    return await this.userRepo.update(id, { confirmationToken: rand.str(AuthService.EMAIL_CONFIRMATION_TOKEN_LENGTH) });
  }

  async refreshResetPasswordToken(email: string, reqAt: Date): Promise<User> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new NotFoundError('user not found');
    }

    return await this.userRepo.update(user.id, {
      resetPasswordToken: this.generateResetPasswordToken(),
      resetPasswordTokenSentAt: reqAt,
    });
  }

  async resetPassword(email: string, resetPasswordToken: string, password: string, reqAt: Date): Promise<User> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      this.logger.warn(`no user found for ${email}`);
      throw new BadRequestError('invalid reset password token');
    }

    if (!user.resetPasswordToken) {
      this.logger.warn(`missing resetPasswordToken for ${email}`);
      throw new BadRequestError('invalid reset password token');
    }

    if (!user.resetPasswordTokenSentAt) {
      this.logger.warn(`missing resetPasswordTokenSentAt for ${email}`);
      throw new BadRequestError('invalid reset password token');
    }

    const resetPasswordTokenAgeMs = reqAt.getTime() - user.resetPasswordTokenSentAt.getTime();
    if (resetPasswordTokenAgeMs > AuthService.MAX_RESET_PASSWORD_TOKEN_AGE_MS) {
      this.logger.warn(`expired resetPasswordToken for ${email}`);
      throw new BadRequestError('invalid reset password token');
    }

    const resetPasswordTokensMatch = await this.tokensMatch(
      this.normalizeResetPasswordToken(user.resetPasswordToken),
      this.normalizeResetPasswordToken(resetPasswordToken)
    );
    if (!resetPasswordTokensMatch) {
      this.logger.warn(`resetPasswordTokens do not match for: ${email}`);
      throw new BadRequestError('invalid reset password token');
    }

    this.validatePassword(password);
    const encryptedPassword = await AuthService.encryptPassword(password);
    return await this.userRepo.update(user.id, {
      resetPasswordToken: null,
      resetPasswordTokenSentAt: null,
      encryptedPassword,
    });
  }

  private async validatePassword(password: string) {
    if (password.length < AuthService.MIN_PASSWORD_LENGTH) {
      throw new BadRequestError(`password must be at least ${AuthService.MIN_PASSWORD_LENGTH} characters`);
    }
  }

  private normalizeResetPasswordToken(resetPasswordToken: string) {
    return resetPasswordToken.toUpperCase();
  }

  private generateResetPasswordToken(): string {
    return this.normalizeResetPasswordToken(rand.str(AuthService.RESET_PASSWORD_TOKEN_LENGTH));
  }

  private async tokensMatch(token1: string, token2: string): Promise<boolean> {
    // Prevent timing attacks
    return await new Promise((resolve) => {
      setTimeout(() => {
        resolve(token1 === token2);
      }, rand.int(100, 200));
    });
  }
}
