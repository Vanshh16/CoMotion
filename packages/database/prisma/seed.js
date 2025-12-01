import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\\n');

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log('🗑️  Clearing existing data...');
  await prisma.joinRequest.deleteMany();
  await prisma.ride.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Existing data cleared\\n');

  // Create Users
  console.log('👥 Creating users...');
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Rahul Sharma',
        email: 'rahul@student.edu',
        password: 'hashed_password_1',
        phoneNumber: '+919876543210',
        role: 'USER',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Priya Patel',
        email: 'priya@student.edu',
        password: 'hashed_password_2',
        phoneNumber: '+919876543211',
        role: 'USER',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Amit Kumar',
        email: 'amit@student.edu',
        password: 'hashed_password_3',
        phoneNumber: '+919876543212',
        role: 'USER',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Sneha Reddy',
        email: 'sneha@student.edu',
        password: 'hashed_password_4',
        phoneNumber: '+919876543213',
        role: 'USER',
      },
    }),
  ]);
  console.log(`✅ Created ${users.length} users\\n`);

  // Create Drivers
  console.log('🚗 Creating drivers...');
  const drivers = await Promise.all([
    prisma.driver.create({
      data: {
        name: 'Rajesh Yadav',
        email: 'rajesh.driver@commotion.com',
        password: 'hashed_password_d1',
        phoneNumber: '+919123456780',
        licenseNumber: 'DL-01-2020-0012345',
        vehicleInfo: 'Maruti Swift Dzire - White - DL01AB1234',
        upiId: 'rajesh.yadav@paytm',
        isVerified: true,
      },
    }),
    prisma.driver.create({
      data: {
        name: 'Suresh Patel',
        email: 'suresh.driver@commotion.com',
        password: 'hashed_password_d2',
        phoneNumber: '+919123456781',
        licenseNumber: 'DL-01-2019-0098765',
        vehicleInfo: 'Honda City - Silver - DL01CD5678',
        upiId: 'suresh@ybl',
        isVerified: true,
      },
    }),
    prisma.driver.create({
      data: {
        name: 'Vikram Singh',
        email: 'vikram.driver@commotion.com',
        password: 'hashed_password_d3',
        phoneNumber: '+919123456782',
        licenseNumber: 'DL-01-2021-0045678',
        vehicleInfo: 'Toyota Innova - Grey - DL01EF9012',
        upiId: 'vikram9012@oksbi',
        isVerified: true,
      },
    }),
    prisma.driver.create({
      data: {
        name: 'Mohammed Ali',
        email: 'ali.driver@commotion.com',
        password: 'hashed_password_d4',
        phoneNumber: '+919123456783',
        licenseNumber: 'DL-01-2020-0087654',
        vehicleInfo: 'Hyundai Creta - Blue - DL01GH3456',
        upiId: 'mohammedali@paytm',
        isVerified: true,
      },
    }),
    prisma.driver.create({
      data: {
        name: 'Deepak Verma',
        email: 'deepak.driver@commotion.com',
        password: 'hashed_password_d5',
        phoneNumber: '+919123456784',
        licenseNumber: 'DL-01-2018-0011223',
        vehicleInfo: 'Maruti Ertiga - Red - DL01IJ7890',
        upiId: null, // Unverified driver without UPI
        isVerified: false,
      },
    }),
  ]);
  console.log(`✅ Created ${drivers.length} drivers\\n`);

  // Helper function to create future dates
  const createFutureDate = (daysFromNow, hour, minute = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    date.setHours(hour, minute, 0, 0);
    return date;
  };

  // Create Rides
  console.log('🛣️  Creating rides...');
  const rides = await Promise.all([
    // Airport rides (tomorrow)
    prisma.ride.create({
      data: {
        driverId: drivers[0].id,
        origin: 'College Campus, Ranpur',
        destination: 'Airport, Ranpur',
        departure: createFutureDate(1, 16, 30),
        seats: 3,
        cost: 150,
        status: 'SCHEDULED',
      },
    }),
    prisma.ride.create({
      data: {
        driverId: drivers[1].id,
        origin: 'City Center, Ranpur',
        destination: 'International Airport',
        departure: createFutureDate(1, 17, 0),
        seats: 4,
        cost: 200,
        status: 'SCHEDULED',
      },
    }),
    prisma.ride.create({
      data: {
        driverId: drivers[2].id,
        origin: 'Hostel Gate, Ranpur',
        destination: 'Airport Terminal 2',
        departure: createFutureDate(1, 16, 45),
        seats: 2,
        cost: 120,
        status: 'SCHEDULED',
      },
    }),

    // College/University rides
    prisma.ride.create({
      data: {
        driverId: drivers[0].id,
        origin: 'Railway Station, Ranpur',
        destination: 'College Campus, Ranpur',
        departure: createFutureDate(0, 8, 30),
        seats: 4,
        cost: 50,
        status: 'SCHEDULED',
      },
    }),
    prisma.ride.create({
      data: {
        driverId: drivers[1].id,
        origin: 'City Mall, Ranpur',
        destination: 'University, Ranpur',
        departure: createFutureDate(0, 9, 0),
        seats: 3,
        cost: 40,
        status: 'SCHEDULED',
      },
    }),

    // Shopping/Mall rides
    prisma.ride.create({
      data: {
        driverId: drivers[2].id,
        origin: 'College Hostel',
        destination: 'City Mall, Ranpur',
        departure: createFutureDate(0, 14, 0),
        seats: 3,
        cost: 60,
        status: 'SCHEDULED',
      },
    }),
    prisma.ride.create({
      data: {
        driverId: drivers[3].id,
        origin: 'University Gate',
        destination: 'Unity Mall, Ranpur',
        departure: createFutureDate(0, 18, 30),
        seats: 4,
        cost: 70,
        status: 'SCHEDULED',
      },
    }),

    // Railway Station rides
    prisma.ride.create({
      data: {
        driverId: drivers[0].id,
        origin: 'College Campus',
        destination: 'Railway Station, Ranpur',
        departure: createFutureDate(2, 6, 0),
        seats: 2,
        cost: 80,
        status: 'SCHEDULED',
      },
    }),
    prisma.ride.create({
      data: {
        driverId: drivers[1].id,
        origin: 'City Center',
        destination: 'New Railway Station, Ranpur',
        departure: createFutureDate(2, 7, 30),
        seats: 3,
        cost: 90,
        status: 'SCHEDULED',
      },
    }),

    // Hospital/Medical rides
    prisma.ride.create({
      data: {
        driverId: drivers[2].id,
        origin: 'Hostel Area',
        destination: 'City Hospital, Ranpur',
        departure: createFutureDate(0, 10, 0),
        seats: 2,
        cost: 100,
        status: 'SCHEDULED',
      },
    }),

    // Evening/Night rides
    prisma.ride.create({
      data: {
        driverId: drivers[3].id,
        origin: 'City Center',
        destination: 'College Campus',
        departure: createFutureDate(0, 20, 0),
        seats: 3,
        cost: 75,
        status: 'SCHEDULED',
      },
    }),
    prisma.ride.create({
      data: {
        driverId: drivers[0].id,
        origin: 'Downtown',
        destination: 'Hostel Gate',
        departure: createFutureDate(0, 21, 30),
        seats: 2,
        cost: 85,
        status: 'SCHEDULED',
      },
    }),

    // Weekend rides (day after tomorrow)
    prisma.ride.create({
      data: {
        driverId: drivers[1].id,
        origin: 'City Center',
        destination: 'Lake Park, Ranpur',
        departure: createFutureDate(2, 11, 0),
        seats: 4,
        cost: 120,
        status: 'SCHEDULED',
      },
    }),
    prisma.ride.create({
      data: {
        driverId: drivers[2].id,
        origin: 'College Campus',
        destination: 'Hill Station, Ranpur',
        departure: createFutureDate(2, 8, 0),
        seats: 5,
        cost: 250,
        status: 'SCHEDULED',
      },
    }),

    // Some active/ongoing rides
    prisma.ride.create({
      data: {
        driverId: drivers[3].id,
        origin: 'Railway Station',
        destination: 'Airport',
        departure: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
        seats: 1,
        cost: 200,
        status: 'ACTIVE',
      },
    }),

    // Some completed rides
    prisma.ride.create({
      data: {
        driverId: drivers[0].id,
        origin: 'College',
        destination: 'City Mall',
        departure: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        seats: 0,
        cost: 60,
        status: 'ENDED',
      },
    }),

    // Cancelled ride
    prisma.ride.create({
      data: {
        driverId: drivers[1].id,
        origin: 'Hostel',
        destination: 'Airport',
        departure: createFutureDate(1, 15, 0),
        seats: 3,
        cost: 180,
        status: 'CANCELLED',
      },
    }),
  ]);
  console.log(`✅ Created ${rides.length} rides\\n`);

  // Create Join Requests
  console.log('📝 Creating join requests...');
  const joinRequests = await Promise.all([
    // Pending requests
    prisma.joinRequest.create({
      data: {
        rideId: rides[0].id,
        userId: users[0].id,
        status: 'PENDING',
      },
    }),
    prisma.joinRequest.create({
      data: {
        rideId: rides[1].id,
        userId: users[1].id,
        status: 'PENDING',
      },
    }),

    // Approved requests (for testing UPI QR code display)
    prisma.joinRequest.create({
      data: {
        rideId: rides[3].id,
        userId: users[2].id,
        status: 'APPROVED',
      },
    }),
    prisma.joinRequest.create({
      data: {
        rideId: rides[4].id,
        userId: users[3].id,
        status: 'APPROVED',
      },
    }),

    // Rejected request
    prisma.joinRequest.create({
      data: {
        rideId: rides[5].id,
        userId: users[0].id,
        status: 'REJECTED',
      },
    }),
  ]);
  console.log(`✅ Created ${joinRequests.length} join requests\\n`);

  console.log('📊 Seed Summary:');
  console.log(`   - ${users.length} Users`);
  console.log(`   - ${drivers.length} Drivers (${drivers.filter(d => d.isVerified).length} verified)`);
  console.log(`     • ${drivers.filter(d => d.upiId).length} drivers with UPI IDs`);
  console.log(`   - ${rides.length} Rides`);
  console.log(`     • ${rides.filter(r => r.status === 'SCHEDULED').length} SCHEDULED`);
  console.log(`     • ${rides.filter(r => r.status === 'ACTIVE').length} ACTIVE`);
  console.log(`     • ${rides.filter(r => r.status === 'ENDED').length} ENDED`);
  console.log(`     • ${rides.filter(r => r.status === 'CANCELLED').length} CANCELLED`);
  console.log(`   - ${joinRequests.length} Join Requests`);
  console.log(`     • ${joinRequests.filter(jr => jr.status === 'PENDING').length} PENDING`);
  console.log(`     • ${joinRequests.filter(jr => jr.status === 'APPROVED').length} APPROVED (ready for UPI payment testing)`);
  console.log(`     • ${joinRequests.filter(jr => jr.status === 'REJECTED').length} REJECTED`);

  console.log('\\n✨ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });