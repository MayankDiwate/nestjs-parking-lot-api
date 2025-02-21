import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { InvalidSlotsException } from './constants/exceptions';
import { ParkingService } from './parking.service';

describe('ParkingService', () => {
  let service: ParkingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParkingService],
    }).compile();

    service = module.get<ParkingService>(ParkingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initializeParkingLot', () => {
    it('should initialize parking lot with valid number of slots', () => {
      const result = service.initializeParkingLot(3);
      expect(result).toEqual({ total_slot: 3 });
    });

    it('should throw error for invalid number of slots', () => {
      expect(() => service.initializeParkingLot(0)).toThrow(
        new InvalidSlotsException('Number of slots must be greater than 0'),
      );
      expect(() => service.initializeParkingLot(-1)).toThrow(
        new InvalidSlotsException('Number of slots must be greater than 0'),
      );
    });
  });

  describe('expandParkingLot', () => {
    beforeEach(() => {
      service.initializeParkingLot(3);
    });

    it('should expand parking lot with valid increment slots', () => {
      const result = service.expandParkingLot(2);
      expect(result).toEqual({ total_slot: 5 });
    });

    it('should throw error for invalid increment slots', () => {
      expect(() => service.expandParkingLot(0)).toThrow(
        new InvalidSlotsException('Increment slots must be greater than 0'),
      );
      expect(() => service.expandParkingLot(-1)).toThrow(
        new InvalidSlotsException('Increment slots must be greater than 0'),
      );
    });
  });

  describe('parkCar', () => {
    beforeEach(() => {
      service.initializeParkingLot(3);
    });

    it('should park a car successfully', () => {
      const car = { registration_number: 'KA-01-HH-1234', color: 'red' };
      const result = service.parkCar(car);
      expect(result).toEqual({ allocated_slot_number: 1 });
    });

    it('should throw error for invalid car data', () => {
      expect(() =>
        service.parkCar({ registration_number: '', color: 'red' }),
      ).toThrow(
        new BadRequestException(
          'Car registration number and color are required',
        ),
      );

      expect(() =>
        service.parkCar({ registration_number: 'KA-01-HH-1234', color: '' }),
      ).toThrow(
        new BadRequestException(
          'Car registration number and color are required',
        ),
      );
    });

    it('should throw error if car is already parked', () => {
      const car = { registration_number: 'KA-01-HH-1234', color: 'red' };
      service.parkCar(car);
      expect(() => service.parkCar(car)).toThrow(
        new BadRequestException('Car already parked'),
      );
    });

    it('should throw error if parking lot is full', () => {
      const cars = [
        { registration_number: 'KA-01-HH-1234', color: 'red' },
        { registration_number: 'KA-01-HH-9999', color: 'blue' },
        { registration_number: 'KA-01-HH-1234', color: 'green' },
      ];

      cars.forEach((car) => service.parkCar(car));
      expect(() =>
        service.parkCar({ registration_number: 'JKL012', color: 'Yellow' }),
      ).toThrow(new BadRequestException('Parking lot is full'));
    });
  });

  describe('getRegistrationNumbersByColor', () => {
    beforeEach(() => {
      service.initializeParkingLot(3);
      service.parkCar({ registration_number: 'KA-01-HH-1234', color: 'red' });
      service.parkCar({ registration_number: 'KA-01-HH-9999', color: 'red' });
    });

    it('should return registration numbers for given color', () => {
      const result = service.getRegistrationNumbersByColor('red');
      expect(result).toEqual(['KA-01-HH-1234', 'KA-01-HH-9999']);
    });

    it('should throw error if no cars found with given color', () => {
      expect(() => service.getRegistrationNumbersByColor('blue')).toThrow(
        new NotFoundException('No cars found with color blue'),
      );
    });
  });

  describe('getSlotNumbersByColor', () => {
    beforeEach(() => {
      service.initializeParkingLot(3);
      service.parkCar({ registration_number: 'KA-01-HH-1234', color: 'red' });
      service.parkCar({ registration_number: 'KA-01-HH-9999', color: 'red' });
    });

    it('should return slot numbers for given color', () => {
      const result = service.getSlotNumbersByColor('red');
      expect(result).toEqual(['1', '2']);
    });

    it('should throw error if no slots found with given color', () => {
      expect(() => service.getSlotNumbersByColor('blue')).toThrow(
        new NotFoundException('No slots found with cars of color blue'),
      );
    });
  });

  describe('getSlotByRegistrationNumber', () => {
    beforeEach(() => {
      service.initializeParkingLot(3);
      service.parkCar({ registration_number: 'KA-01-HH-1234', color: 'red' });
    });

    it('should return slot number for given registration number', () => {
      const result = service.getSlotByRegistrationNumber('KA-01-HH-1234');
      expect(result).toEqual({ slot_number: 1 });
    });

    it('should throw error if car not found', () => {
      expect(() =>
        service.getSlotByRegistrationNumber('KA-01-HH-9999'),
      ).toThrow(
        new NotFoundException(
          'Car with registration number KA-01-HH-9999 not found',
        ),
      );
    });
  });

  describe('clearSlot', () => {
    beforeEach(() => {
      service.initializeParkingLot(3);
      service.parkCar({ registration_number: 'KA-01-HH-1234', color: 'red' });
    });

    it('should clear slot by slot number', () => {
      const result = service.clearSlot(1);
      expect(result).toEqual({ freed_slot_number: 1 });
    });

    it('should clear slot by registration number', () => {
      const result = service.clearSlot(undefined, 'KA-01-HH-1234');
      expect(result).toEqual({ freed_slot_number: 1 });
    });

    it('should throw error if slot not found', () => {
      expect(() => service.clearSlot(5)).toThrow(
        new NotFoundException('Slot number 5 not found'),
      );
    });

    it('should throw error if slot is already empty', () => {
      service.clearSlot(1);
      expect(() => service.clearSlot(1)).toThrow(
        new BadRequestException('Slot number 1 is already empty'),
      );
    });

    it('should throw error if car not found', () => {
      expect(() => service.clearSlot(undefined, 'KA-01-HH-9999')).toThrow(
        new NotFoundException(
          'Car with registration number KA-01-HH-9999 not found',
        ),
      );
    });

    it('should throw error if neither slot number nor registration number provided', () => {
      expect(() => service.clearSlot()).toThrow(
        new BadRequestException(
          'Either slot number or car registration number is required',
        ),
      );
    });
  });

  describe('getStatus', () => {
    beforeEach(() => {
      service.initializeParkingLot(3);
    });

    it('should return parking lot status', () => {
      service.parkCar({ registration_number: 'KA-01-HH-1234', color: 'red' });
      const result = service.getStatus();
      expect(result).toEqual([
        {
          slot_no: 1,
          registration_no: 'KA-01-HH-1234',
          color: 'red',
        },
      ]);
    });

    it('should throw error if parking lot is already occupied', () => {
      expect(() => service.getStatus()).toThrow(
        new NotFoundException('No cars are currently parked'),
      );
    });
  });
});
