import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';
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
}
