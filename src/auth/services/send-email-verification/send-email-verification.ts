import { Resend } from 'resend';

import { getEnv } from '@app/config';
import { AppError } from '@utils/errors';

type SendEmailVerificationParams = {
  email: string;
  token: string;
};

export const sendEmailVerification = async ({
  email,
  token,
}: SendEmailVerificationParams): Promise<void> => {
  const { appOrigin, resendApiKey, resendFromEmail, nodeEnv } = getEnv();
  const verificationUrl = new URL('/verify-email', appOrigin);
  verificationUrl.searchParams.set('token', token);

  console.log(`Email verification link for ${email}: ${verificationUrl.toString()}`);

  if (nodeEnv === 'test') return;

  if (!resendApiKey || !resendFromEmail) {
    throw new AppError(
      500,
      'Resend email delivery is not configured',
      {
        resendApiKeyConfigured: Boolean(resendApiKey),
        resendFromEmailConfigured: Boolean(resendFromEmail),
      },
      'AUTH_EMAIL_PROVIDER_NOT_CONFIGURED',
    );
  }

  const resend = new Resend(resendApiKey);

  const { error } = await resend.emails.send({
    from: `Finance Tracker <${resendFromEmail}>`,
    to: [email],
    subject: 'Finance Tracker - Verify your email address',
    html: [
      '<p>Welcome to Finance Tracker.</p>',
      `<p>Please verify your email address by opening `,
      `<a href="${verificationUrl.toString()}">this link</a>.</p>`,
      `<p>If the button does not work, copy and paste this URL into your browser: `,
      `${verificationUrl.toString()}</p>`,
    ].join(''),
    text: [
      'Welcome to Finance Tracker.',
      `Verify your email address by opening this link: ${verificationUrl.toString()}`,
    ].join('\n\n'),
  });

  if (error) {
    throw new AppError(
      502,
      'Failed to send verification email',
      error,
      'AUTH_EMAIL_DELIVERY_FAILED',
    );
  }
};
