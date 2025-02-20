import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Car } from './interfaces/car.interface';
import { ParkingService } from './parking.service';

@Controller('parking')
export class ParkingController {
  constructor(private readonly parkingService: ParkingService) {}

  @Post('parking_lot')
  @HttpCode(HttpStatus.CREATED)
  initializeParkingLot(@Body('no_of_slot') numberOfSlots: number) {
    return this.parkingService.initializeParkingLot(numberOfSlots);
  }

  @Patch('parking_lot')
  expandParkingLot(@Body('increment_slot') incrementSlots: number) {
    return this.parkingService.expandParkingLot(incrementSlots);
  }

  @Post('park')
  @HttpCode(HttpStatus.CREATED)
  parkCar(@Body() car: { car_reg_no: string; car_color: string }) {
    const carData: Car = {
      registration_number: car.car_reg_no,
      color: car.car_color,
    };
    return this.parkingService.parkCar(carData);
  }

  @Get('registration_numbers/:color')
  getRegistrationNumbersByColor(@Param('color') color: string) {
    return this.parkingService.getRegistrationNumbersByColor(color);
  }

  @Get('slot_numbers/:color')
  getSlotNumbersByColor(@Param('color') color: string) {
    return this.parkingService.getSlotNumbersByColor(color);
  }

  @Get('slots/:registration_number')
  getSlotByRegistrationNumber(
    @Param('registration_number') registrationNumber: string,
  ) {
    return this.parkingService.getSlotByRegistrationNumber(registrationNumber);
  }

  @Post('clear')
  @HttpCode(HttpStatus.OK)
  clearSlot(
    @Body('slot_number') slotNumber?: number,
    @Body('car_registration_no') carRegistrationNumber?: string,
  ) {
    return this.parkingService.clearSlot(slotNumber, carRegistrationNumber);
  }

  @Get('status')
  getStatus() {
    return this.parkingService.getStatus();
  }
}
