import type { Car } from './car.interface';

export interface ParkingSlot {
  slot_number: number;
  car?: Car;
  is_occupied: boolean;
}
