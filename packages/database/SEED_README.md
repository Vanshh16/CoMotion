# Database Seed Documentation

## Overview
Comprehensive seed file that populates the CoMotion database with realistic test data.

## What It Creates

### 👥 Users (4)
- Rahul Sharma (rahul@student.edu)
- Priya Patel (priya@student.edu)
- Amit Kumar (amit@student.edu)
- Sneha Reddy (sneha@student.edu)

### 🚗 Drivers (5)
- 4 verified drivers with various vehicles
- 1 unverified driver
- Different vehicle types: Swift Dzire, Honda City, Innova, Creta, Ertiga

### 🛣️ Rides (17)
**Airport Rides (3)** - Tomorrow
- College Campus → Airport (4:30 PM, ₹150, 3 seats)
- City Center → International Airport (5:00 PM, ₹200, 4 seats)
- Hostel Gate → Airport Terminal 2 (4:45 PM, ₹120, 2 seats)

**College/University Rides (2)** - Today
- Railway Station → College Campus (8:30 AM, ₹50)
- City Mall → University (9:00 AM, ₹40)

**Shopping Rides (2)** - Today
- College Hostel → City Mall (2:00 PM, ₹60)
- University Gate → Unity Mall (6:30 PM, ₹70)

**Railway Station Rides (2)** - Day after tomorrow
- College Campus → Railway Station (6:00 AM, ₹80)
- City Center → New Railway Station (7:30 AM, ₹90)

**Medical/Hospital (1)** - Today
- Hostel Area → City Hospital (10:00 AM, ₹100)

**Evening/Night Rides (2)** - Today
- City Center → College Campus (8:00 PM, ₹75)
- Downtown → Hostel Gate (9:30 PM, ₹85)

**Weekend Rides (2)** - Day after tomorrow
- City Center → Lake Park (11:00 AM, ₹120)
- College Campus → Hill Station (8:00 AM, ₹250)

**Various Status Rides (3)**
- 1 ACTIVE (currently running)
- 1 ENDED (completed)
- 1 CANCELLED

### 📝 Join Requests (5)
- 2 PENDING
- 2 APPROVED
- 1 REJECTED

## Usage

### Run the seed:
\`\`\`bash
# From the database package directory
npm run db:seed

# Or from project root
cd packages/database && npm run db:seed
\`\`\`

### Clear and reseed:
The seed script automatically clears existing data before seeding. If you want to keep existing data, comment out lines 11-16 in `seed.js`.

## Testing with AI Service

After seeding, you can test queries like:
- "Go to the airport tomorrow at 5pm"
- "Find rides to college today morning"
- "Take me to the mall this evening"
- "I need to go to the railway station"
- "Rides to the hospital"

All queries should return relevant rides from the seeded data.
