# 🚗 Automated Parking System

A modern, RESTful API implementation for managing an automated car parking system built with NestJS and TypeScript.

## 🌟 Features

- Initialize and dynamically expand parking lot capacity
- Automated parking slot allocation (nearest to entry)
- Car registration and tracking
- Color-based car search
- Registration number-based car search
- Real-time parking status monitoring
- Slot deallocation and management
- Comprehensive error handling
- No external database dependencies

## 🛠️ Technical Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Testing**: Jest
- **Data Storage**: In-memory (Arrays/Maps)
- **Container**: Docker

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- pnpm (v9 or higher)
- Docker (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/MayankDiwate/nestjs-parking-lot-api.git
cd nestjs-parking-lot-api
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm run start:dev
```

### Docker Setup

1. Build the Docker image:
```bash
docker build -t parking-system .
```

2. Run the container:
```bash
docker run -p 3000:3000 parking-system
```

## 📡 API Endpoints

### Initialize Parking Lot
```
POST /parking_lot
Body: {
    "no_of_slot": 6
}
Response: {
    "total_slot": 6
}
```

### Expand Parking Lot
```
PATCH /parking_lot
Body: {
    "increment_slot": 3
}
Response: {
    "total_slot": 9
}
```

### Park a Car
```
POST /park
Body: {
    "car_reg_no": "KA-01-AB-2211",
    "car_color": "white"
}
Response: {
    "allocated_slot_number": 1
}
```

### Get Cars by Color
```
GET /registration_numbers/:color
Response: [
    "KA-01-HH-1234",
    "KA-02-AB-9999",
    "KA-03-PK-2211"
]
```

### Get Slots by Car Color
```
GET /slot_numbers/:color
Response: [
    "1",
    "5",
    "12"
]
```

### Clear Parking Slot
```
POST /clear
Body: {
    "slot_number": 1
}
// OR
Body: {
    "car_registration_no": "KA-01-AB-2211"
}
Response: {
    "freed_slot_number": 1
}
```

### Get Parking Status
```
GET /status
Response: [
    {
        "slot_no": 1,
        "registration_no": "KA-01-HH-1234",
        "color": "red"
    },
    ...
]
```

## 🧪 Testing

Run the test suite:
```bash
npm run test
```

Run tests with coverage:
```bash
npm run test:cov
```

## 📝 Design Decisions & Assumptions

1. **Slot Allocation Strategy**: 
   - Uses a min-heap data structure for optimal slot allocation (O(log n))
   - Always assigns the nearest available slot to the entry point

2. **Data Storage**:
   - Utilizes TypeScript Maps for O(1) lookups
   - Maintains separate indexes for color and registration number queries

3. **Error Handling**:
   - Comprehensive validation for car registration numbers
   - Proper error messages for full parking lot scenarios
   - Validation for duplicate registration numbers

4. **Assumptions**:
   - Car registration numbers are unique
   - Colors are case-insensitive
   - Slot numbers start from 1
   - Once initialized, parking lot base capacity cannot be reduced

## 🔒 Error Codes

- `400`: Bad Request (Invalid input)
- `404`: Not Found (Slot/Car not found)
- `409`: Conflict (Duplicate registration)
- `422`: Unprocessable Entity (Full parking lot)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.