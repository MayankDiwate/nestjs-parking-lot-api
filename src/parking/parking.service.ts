import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InvalidSlotsException } from './constants/exceptions';
import { Car } from './interfaces/car.interface';
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

  parkCar(car: Car): { allocated_slot_number: number } {
    if (!car.registration_number || !car.color) {
      throw new BadRequestException(
        'Car registration number and color are required',
      );
    }

    // Check if car already parked
    const existingCar = this.parking_slots.find(
      (slot) => slot.car?.registration_number === car.registration_number,
    );
    if (existingCar) {
      throw new BadRequestException('Car already parked');
    }

    // Find nearest empty slot
    const slot = this.parking_slots.find((slot) => !slot.is_occupied);
    if (!slot) {
      throw new BadRequestException('Parking lot is full');
    }

    slot.car = car;
    slot.is_occupied = true;

    this.logger.log(
      `Car with registration number ${car.registration_number} parked in slot ${slot.slot_number}`,
    );

    return { allocated_slot_number: slot.slot_number };
  }

  getRegistrationNumbersByColor(color: string): string[] {
    const cars = this.parking_slots
      .filter(
        (slot) =>
          slot.is_occupied &&
          slot.car?.color.toLowerCase() === color.toLowerCase(),
      )
      .map((slot) => slot.car!.registration_number);

    if (!cars.length) {
      throw new NotFoundException(`No cars found with color ${color}`);
    }

    this.logger.log(`Found ${cars.length} cars with color ${color}`);

    return cars;
  }

  getSlotNumbersByColor(color: string): string[] {
    const slots = this.parking_slots
      .filter(
        (slot) =>
          slot.is_occupied &&
          slot.car?.color.toLowerCase() === color.toLowerCase(),
      )
      .map((slot) => slot.slot_number.toString());

    this.logger.log(`Found ${slots.length} slots with color ${color}`);

    if (!slots.length) {
      throw new NotFoundException(`No slots found with cars of color ${color}`);
    }

    this.logger.log(`Found ${slots.length} slots with color ${color}`);

    return slots;
  }

  getSlotByRegistrationNumber(registrationNumber: string): {
    slot_number: number;
  } {
    const slot = this.parking_slots.find(
      (slot) =>
        slot.is_occupied &&
        slot.car?.registration_number === registrationNumber,
    );

    if (!slot) {
      throw new NotFoundException(
        `Car with registration number ${registrationNumber} not found`,
      );
    }

    this.logger.log(
      `Found slot ${slot.slot_number} for car with registration number ${registrationNumber}`,
    );

    return { slot_number: slot.slot_number };
  }
}
