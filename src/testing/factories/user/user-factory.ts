import { DATE_ISO_STR, USER_ID_OBJ, USER_ID_STR } from '@testing/factories/general';
import {
  USER_EMAIL,
  USER_FIRST_NAME,
  USER_LAST_NAME,
  USER_PASSWORD,
  USER_PASSWORD_HASH,
  USER_REFRESH_TOKEN_HASH,
} from '@testing/factories/user/user-consts';

const commonProps = {
  firstName: USER_FIRST_NAME,
  lastName: USER_LAST_NAME,
  email: USER_EMAIL,
};

export const getUserDTO = () => ({
  ...commonProps,
  password: USER_PASSWORD,
});

export const getUserResultJSON = () => ({
  ...commonProps,
  _id: USER_ID_OBJ,
  passwordHash: USER_PASSWORD_HASH,
  emailVerifiedAt: DATE_ISO_STR,
  emailVerificationMethod: 'self-verified',
  refreshTokenHash: {
    tokenHash: USER_REFRESH_TOKEN_HASH,
    createdAt: DATE_ISO_STR,
  },
  createdAt: DATE_ISO_STR,
  updatedAt: DATE_ISO_STR,
});

export const getUserResultSerialized = () => ({
  ...commonProps,
  id: USER_ID_STR,
  emailVerifiedAt: DATE_ISO_STR,
  emailVerificationMethod: 'self-verified',
  createdAt: DATE_ISO_STR,
  updatedAt: DATE_ISO_STR,
});
