import { Types } from 'mongoose';
import { describe, expect, it } from 'vitest';

import { getNamedResourceModel } from './model';

describe('getNamedResourceModel', () => {
  describe('ownerId validator', () => {
    it('accepts user named resource with ownerId', () => {
      const doc = new (getNamedResourceModel('category'))({
        type: 'user',
        ownerId: new Types.ObjectId(),
        name: 'Food',
        nameNormalized: 'food',
      });

      const error = doc.validateSync();

      expect(error).toBeUndefined();
    });

    it('rejects user named resource when ownerId is null', () => {
      const doc = new (getNamedResourceModel('category'))({
        type: 'user',
        ownerId: null,
        name: 'Food',
        nameNormalized: 'food',
      });

      const error = doc.validateSync();

      expect(error?.errors.ownerId).toBeDefined();
      expect(error?.errors.ownerId?.message).toContain('Invalid ownerId');
    });

    it('rejects user named resource without ownerId', () => {
      const doc = new (getNamedResourceModel('category'))({
        type: 'user',
        name: 'Food',
        nameNormalized: 'food',
      });

      const error = doc.validateSync();

      expect(error?.errors.ownerId).toBeDefined();
      expect(error?.errors.ownerId?.message).toContain('Invalid ownerId');
    });

    it('accepts system named resource without ownerId', () => {
      const doc = new (getNamedResourceModel('category'))({
        type: 'system',
        name: 'Transfer',
        nameNormalized: 'transfer',
      });

      const error = doc.validateSync();

      expect(error).toBeUndefined();
    });

    it('rejects system named resource with ownerId', () => {
      const doc = new (getNamedResourceModel('category'))({
        type: 'system',
        ownerId: new Types.ObjectId(),
        name: 'Transfer',
        nameNormalized: 'transfer',
      });

      const error = doc.validateSync();

      expect(error?.errors.ownerId).toBeDefined();
      expect(error?.errors.ownerId?.message).toContain('Invalid ownerId');
    });
  });
});
