import { describe, expect, it } from 'vitest';

import {
  VehicleCreateSchema,
  VehicleSlugSchema,
  VehicleUpdateSchema,
} from './vehicle-schema';

describe('vehicle schema', () => {
  describe('VehicleSlugSchema', () => {
    it('accepts valid kebab-case slug', () => {
      expect(VehicleSlugSchema.safeParse('suzuki-sv-650').success).toBe(true);
      expect(VehicleSlugSchema.safeParse('audi-a4-b8-2010').success).toBe(true);
      expect(VehicleSlugSchema.safeParse('car').success).toBe(true);
    });

    it('rejects invalid slugs with uppercase, spaces, or symbols', () => {
      expect(VehicleSlugSchema.safeParse('Suzuki-SV-650').success).toBe(false);
      expect(VehicleSlugSchema.safeParse('suzuki sv 650').success).toBe(false);
      expect(VehicleSlugSchema.safeParse('suzuki_sv_650').success).toBe(false);
      expect(VehicleSlugSchema.safeParse('-suzuki-').success).toBe(false);
      expect(VehicleSlugSchema.safeParse('').success).toBe(false);
    });
  });

  describe('VehicleCreateSchema', () => {
    it('accepts valid vehicle create DTO without slug', () => {
      const result = VehicleCreateSchema.safeParse({
        name: 'Suzuki SV650',
        brand: 'Suzuki',
        vehicleModel: 'SV650',
        type: 'motorcycle',
        productionYear: 2007,
      });

      expect(result.success).toBe(true);
    });

    it('accepts valid vehicle create DTO with custom slug', () => {
      const result = VehicleCreateSchema.safeParse({
        name: 'Suzuki SV650',
        slug: 'my-sv650-custom',
        type: 'motorcycle',
      });

      expect(result.success).toBe(true);
    });

    it('rejects missing name or type', () => {
      expect(VehicleCreateSchema.safeParse({ type: 'car' }).success).toBe(false);
      expect(VehicleCreateSchema.safeParse({ name: 'Car' }).success).toBe(false);
    });

    it('rejects invalid production year', () => {
      expect(
        VehicleCreateSchema.safeParse({
          name: 'Car',
          type: 'car',
          productionYear: 1800,
        }).success,
      ).toBe(false);
    });
  });

  describe('VehicleUpdateSchema', () => {
    it('accepts partial updates', () => {
      expect(VehicleUpdateSchema.safeParse({ name: 'New Name' }).success).toBe(true);
      expect(VehicleUpdateSchema.safeParse({ notes: 'Updated notes' }).success).toBe(
        true,
      );
      expect(VehicleUpdateSchema.safeParse({}).success).toBe(true);
    });
  });
});
