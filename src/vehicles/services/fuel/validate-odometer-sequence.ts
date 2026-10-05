import { VehicleFuelEntryModel } from '@vehicles/model';
import { Types } from 'mongoose';

import { VehicleOdometerSequenceError } from '@utils/errors';

interface ValidateOdometerSequenceParams {
  excludeEntryId?: Types.ObjectId | string;
  odometerKm: number;
  ownerId: string;
  targetDate: Date;
  vehicleId: Types.ObjectId | string;
}

export const validateOdometerSequence = async ({
  ownerId,
  vehicleId,
  targetDate,
  odometerKm,
  excludeEntryId,
}: ValidateOdometerSequenceParams): Promise<void> => {
  const excludeFilter = excludeEntryId ? { _id: { $ne: excludeEntryId } } : {};

  const [previousEntry, nextEntry] = await Promise.all([
    VehicleFuelEntryModel.findOne({
      ownerId,
      vehicleId,
      date: { $lt: targetDate },
      ...excludeFilter,
    }).sort({ date: -1, odometerKm: -1 }),
    VehicleFuelEntryModel.findOne({
      ownerId,
      vehicleId,
      date: { $gt: targetDate },
      ...excludeFilter,
    }).sort({ date: 1, odometerKm: 1 }),
  ]);

  if (previousEntry && odometerKm < previousEntry.odometerKm) {
    throw new VehicleOdometerSequenceError(
      'too_low',
      odometerKm,
      previousEntry.odometerKm,
      previousEntry.date,
    );
  }

  if (nextEntry && odometerKm > nextEntry.odometerKm) {
    throw new VehicleOdometerSequenceError(
      'too_high',
      odometerKm,
      nextEntry.odometerKm,
      nextEntry.date,
    );
  }
};
