import { ResendVerificationDTO } from '@auth/schema';
import { createEmailVerificationToken, sendEmailVerification } from '@auth/services';
import { UserModel } from '@user/model';

export const resendVerification = async ({
  email,
}: ResendVerificationDTO): Promise<void> => {
  const user = await UserModel.findOne({ email });

  if (!user) return;
  if (user.emailVerificationMethod === 'self-verified') return;

  const { token, tokenHash, expiresAt } = createEmailVerificationToken();

  user.emailVerificationTokenHash = tokenHash;
  user.emailVerificationExpiresAt = expiresAt;

  await user.save();
  await sendEmailVerification({ email: user.email, token });
};
