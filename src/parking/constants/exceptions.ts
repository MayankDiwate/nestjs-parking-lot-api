import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidSlotsException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class ParkingLotFullException extends HttpException {
  constructor() {
    super('Parking lot is full', HttpStatus.BAD_REQUEST);
  }
}

export class CarAlreadyParkedException extends HttpException {
  constructor(registrationNumber: string) {
    super(
      `Car with registration number ${registrationNumber} is already parked`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class InvalidInputException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}
