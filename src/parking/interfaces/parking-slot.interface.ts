import type { Car } from './car.interface';

export interface ParkingSlot {
  number: number;
  car: Car | null;
}
