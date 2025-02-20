import { Injectable, Logger } from '@nestjs/common';
import { InvalidSlotsException } from './constants/exceptions';
import { ParkingSlot } from './interfaces/parking-slot.interface';

@Injectable()
export class ParkingService {
  private readonly logger = new Logger(ParkingService.name);
  private parking_slots: ParkingSlot[] = [];
  private total_slots: number = 0;

  initializeParkingLot(numberOfSlots: number): { total_slot: number } {
    this.logger.log(`Initializing parking lot with ${numberOfSlots} slots`);

    if (numberOfSlots <= 0) {
      this.logger.error(`Invalid number of slots: ${numberOfSlots}`);
      throw new InvalidSlotsException('Number of slots must be greater than 0');
    }

    this.total_slots = numberOfSlots;
    this.parking_slots = Array(numberOfSlots)
      .fill(null)
      .map((_, index) => ({
        slot_number: index + 1,
        is_occupied: false,
      }));

    this.logger.log(
      `Successfully initialized parking lot with ${numberOfSlots} slots`,
    );
    return { total_slot: this.total_slots };
  }

  expandParkingLot(incrementSlots: number): { total_slot: number } {
    this.logger.log(`Expanding parking lot by ${incrementSlots} slots`);

    if (incrementSlots <= 0) {
      this.logger.error(`Invalid increment slots: ${incrementSlots}`);
      throw new InvalidSlotsException('Increment slots must be greater than 0');
    }

    const newSlots = Array(incrementSlots)
      .fill(null)
      .map((_, index) => ({
        slot_number: this.total_slots + index + 1,
        is_occupied: false,
      }));

    this.parking_slots.push(...newSlots);
    this.total_slots += incrementSlots;

    this.logger.log(
      `Successfully expanded parking lot. New total: ${this.total_slots} slots`,
    );
    return { total_slot: this.total_slots };
  }
}
