import { getEnv } from '@app/config';

type SendEmailVerificationParams = {
  email: string;
  token: string;
};

export const sendEmailVerification = async ({
  email,
  token,
}: SendEmailVerificationParams): Promise<void> => {
  const { appOrigin } = getEnv();
  const verificationUrl = new URL('/verify-email', appOrigin);
  verificationUrl.searchParams.set('token', token);

  // Initial delivery strategy: surface the link in server logs until a real provider is wired in.
  console.log(`Email verification link for ${email}: ${verificationUrl.toString()}`);
};
