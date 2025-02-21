import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { InvalidSlotsException } from './constants/exceptions';
import { ParkingController } from './parking.controller';
import { ParkingService } from './parking.service';

describe('ParkingController', () => {
  let parkingController: ParkingController;
  let parkingService: ParkingService;

  const mockParkingService = {
    initializeParkingLot: jest.fn(),
    expandParkingLot: jest.fn(),
    parkCar: jest.fn(),
    getRegistrationNumbersByColor: jest.fn(),
    getSlotNumbersByColor: jest.fn(),
    getSlotByRegistrationNumber: jest.fn(),
    clearSlot: jest.fn(),
    getStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParkingController],
      providers: [
        {
          provide: ParkingService,
          useValue: mockParkingService,
        },
      ],
    }).compile();

    parkingController = module.get<ParkingController>(ParkingController);
    parkingService = module.get<ParkingService>(ParkingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initializeParkingLot', () => {
    it('should initialize parking lot with valid number of slots', () => {
      const expectedResult = { total_slot: 5 };
      const mockFn = jest
        .spyOn(parkingService, 'initializeParkingLot')
        .mockImplementation(() => expectedResult);

      const result = parkingController.initializeParkingLot(5);

      expect(mockFn).toHaveBeenCalledWith(5);
      expect(result).toEqual(expectedResult);
    });

    it('should throw InvalidSlotsException for zero slots', () => {
      jest
        .spyOn(parkingService, 'initializeParkingLot')
        .mockImplementation(() => {
          throw new InvalidSlotsException(
            'Number of slots must be greater than 0',
          );
        });

      expect(() => parkingController.initializeParkingLot(0)).toThrow(
        'Number of slots must be greater than 0',
      );
    });

    it('should throw InvalidSlotsException for negative slots', () => {
      jest
        .spyOn(parkingService, 'initializeParkingLot')
        .mockImplementation(() => {
          throw new InvalidSlotsException(
            'Number of slots must be greater than 0',
          );
        });

      expect(() => parkingController.initializeParkingLot(-1)).toThrow(
        'Number of slots must be greater than 0',
      );
    });
  });

  describe('expandParkingLot', () => {
    it('should expand parking lot with valid increment slots', () => {
      const expectedResult = { total_slot: 8 };
      const mockFn = jest
        .spyOn(parkingService, 'expandParkingLot')
        .mockImplementation(() => expectedResult);

      const result = parkingController.expandParkingLot(3);

      expect(mockFn).toHaveBeenCalledWith(3);
      expect(result).toEqual(expectedResult);
    });

    it('should throw InvalidSlotsException for zero increment slots', () => {
      jest.spyOn(parkingService, 'expandParkingLot').mockImplementation(() => {
        throw new InvalidSlotsException(
          'Increment slots must be greater than 0',
        );
      });

      expect(() => parkingController.expandParkingLot(0)).toThrow(
        'Increment slots must be greater than 0',
      );
    });

    it('should throw InvalidSlotsException for negative increment slots', () => {
      jest.spyOn(parkingService, 'expandParkingLot').mockImplementation(() => {
        throw new InvalidSlotsException(
          'Increment slots must be greater than 0',
        );
      });

      expect(() => parkingController.expandParkingLot(-1)).toThrow(
        'Increment slots must be greater than 0',
      );
    });
  });

  describe('parkCar', () => {
    const mockCar = { registration_number: 'KA-01-HH-1234', color: 'red' };
    let parkCarMock: jest.SpyInstance;

    beforeEach(() => {
      parkCarMock = jest.spyOn(parkingService, 'parkCar');
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should park car and return allocated slot number', () => {
      const expectedResult = { allocated_slot_number: 1 };

      jest.spyOn(parkingService, 'parkCar').mockReturnValue(expectedResult);

      const mockCarData = {
        car_reg_no: mockCar.registration_number,
        car_color: mockCar.color,
      };

      const result = parkingController.parkCar(mockCarData);

      expect(parkCarMock).toHaveBeenCalledWith({
        registration_number: mockCarData.car_reg_no,
        color: mockCarData.car_color,
      });
      expect(result).toEqual(expectedResult);
    });

    it('should throw BadRequestException if car registration number is missing', () => {
      const invalidCar = { car_reg_no: '', car_color: 'red' };
      jest.spyOn(parkingService, 'parkCar').mockImplementation(() => {
        throw new BadRequestException(
          'Car registration number and color are required',
        );
      });

      expect(() => parkingController.parkCar(invalidCar)).toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if car is already parked', () => {
      const mockCarData = {
        car_reg_no: mockCar.registration_number,
        car_color: mockCar.color,
      };

      jest.spyOn(parkingService, 'parkCar').mockImplementation(() => {
        throw new BadRequestException('Car already parked');
      });

      expect(() => parkingController.parkCar(mockCarData)).toThrow(
        'Car already parked',
      );
    });

    it('should throw BadRequestException if parking lot is full', () => {
      const mockCarData = {
        car_reg_no: mockCar.registration_number,
        car_color: mockCar.color,
      };

      jest.spyOn(parkingService, 'parkCar').mockImplementation(() => {
        throw new BadRequestException('Parking lot is full');
      });

      expect(() => parkingController.parkCar(mockCarData)).toThrow(
        'Parking lot is full',
      );
    });
  });

  describe('getRegistrationNumbersByColor', () => {
    it('should return registration numbers for given color', () => {
      const expectedResult = ['KA-01-HH-1234', 'KA-01-HH-9999'];
      const mockFn = jest
        .spyOn(parkingService, 'getRegistrationNumbersByColor')
        .mockImplementation(() => expectedResult);

      const result = parkingController.getRegistrationNumbersByColor('red');

      expect(mockFn).toHaveBeenCalledWith('red');
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if no cars found with given color', () => {
      jest
        .spyOn(parkingService, 'getRegistrationNumbersByColor')
        .mockImplementation(() => {
          throw new NotFoundException('No cars found with color Blue');
        });

      expect(() =>
        parkingController.getRegistrationNumbersByColor('Blue'),
      ).toThrow('No cars found with color Blue');
    });
  });

  describe('getSlotNumbersByColor', () => {
    it('should return slot numbers for given color', () => {
      const expectedResult = ['1', '3'];
      const mockFn = jest
        .spyOn(parkingService, 'getSlotNumbersByColor')
        .mockImplementation(() => expectedResult);

      const result = parkingController.getSlotNumbersByColor('red');

      expect(mockFn).toHaveBeenCalledWith('red');
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if no slots found with given color', () => {
      jest
        .spyOn(parkingService, 'getSlotNumbersByColor')
        .mockImplementation(() => {
          throw new NotFoundException('No slots found with cars of color Blue');
        });

      expect(() => parkingController.getSlotNumbersByColor('Blue')).toThrow(
        'No slots found with cars of color Blue',
      );
    });
  });

  describe('getSlotByRegistrationNumber', () => {
    it('should return slot number for given registration number', () => {
      const expectedResult = { slot_number: 1 };
      const mockFn = jest
        .spyOn(parkingService, 'getSlotByRegistrationNumber')
        .mockImplementation(() => expectedResult);

      const result =
        parkingController.getSlotByRegistrationNumber('KA-01-HH-1234');

      expect(mockFn).toHaveBeenCalledWith('KA-01-HH-1234');
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if no car found with given registration number', () => {
      jest
        .spyOn(parkingService, 'getSlotByRegistrationNumber')
        .mockImplementation(() => {
          throw new NotFoundException(
            'Car with registration number KA-01-HH-9999 not found',
          );
        });

      expect(() =>
        parkingController.getSlotByRegistrationNumber('KA-01-HH-9999'),
      ).toThrow('Car with registration number KA-01-HH-9999 not found');
    });
  });

  describe('clearSlot', () => {
    it('should clear slot by slot number', () => {
      const expectedResult = { freed_slot_number: 1 };
      const mockFn = jest
        .spyOn(parkingService, 'clearSlot')
        .mockImplementation(() => expectedResult);

      const result = parkingController.clearSlot(1);

      expect(mockFn).toHaveBeenCalledWith(1, undefined);
      expect(result).toEqual(expectedResult);
    });

    it('should clear slot by car registration number', () => {
      const expectedResult = { freed_slot_number: 1 };
      const mockFn = jest
        .spyOn(parkingService, 'clearSlot')
        .mockImplementation(() => expectedResult);

      const result = parkingController.clearSlot(undefined, 'KA-01-HH-1234');

      expect(mockFn).toHaveBeenCalledWith(undefined, 'KA-01-HH-1234');
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if slot number not found', () => {
      jest.spyOn(parkingService, 'clearSlot').mockImplementation(() => {
        throw new NotFoundException('Slot number 10 not found');
      });

      expect(() => parkingController.clearSlot(10)).toThrow(
        'Slot number 10 not found',
      );
    });

    it('should throw NotFoundException if car registration number not found', () => {
      jest.spyOn(parkingService, 'clearSlot').mockImplementation(() => {
        throw new NotFoundException(
          'Car with registration number KA-01-HH-9999 not found',
        );
      });

      expect(() =>
        parkingController.clearSlot(undefined, 'KA-01-HH-9999'),
      ).toThrow('Car with registration number KA-01-HH-9999 not found');
    });

    it('should throw BadRequestException if slot is already empty', () => {
      jest.spyOn(parkingService, 'clearSlot').mockImplementation(() => {
        throw new BadRequestException('Slot number 1 is already empty');
      });

      expect(() => parkingController.clearSlot(1)).toThrow(
        'Slot number 1 is already empty',
      );
    });

    it('should throw BadRequestException if neither slot number nor registration number provided', () => {
      jest.spyOn(parkingService, 'clearSlot').mockImplementation(() => {
        throw new BadRequestException(
          'Either slot number or car registration number is required',
        );
      });

      expect(() => parkingController.clearSlot(undefined, undefined)).toThrow(
        'Either slot number or car registration number is required',
      );
    });
  });

  describe('getStatus', () => {
    it('should return current parking lot status', () => {
      const expectedResult = [
        {
          slot_no: 1,
          registration_no: 'KA-01-HH-1234',
          color: 'red',
        },
      ];
      const mockFn = jest
        .spyOn(parkingService, 'getStatus')
        .mockImplementation(() => expectedResult);

      const result = parkingController.getStatus();

      expect(mockFn).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if parking lot is empty', () => {
      jest.spyOn(parkingService, 'getStatus').mockImplementation(() => {
        throw new NotFoundException('No cars are currently parked');
      });

      expect(() => parkingController.getStatus()).toThrow(
        'No cars are currently parked',
      );
    });
  });
});
