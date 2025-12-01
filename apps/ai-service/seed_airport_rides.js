import { prisma } from '@repo/db';

async function seedAirportRides() {
    try {
        console.log('Seeding airport rides...\n');

        // Get existing drivers
        const drivers = await prisma.driver.findMany({ take: 2 });

        if (drivers.length === 0) {
            console.log('No drivers found. Creating sample driver...');
            const driver = await prisma.driver.create({
                data: {
                    name: 'Airport Shuttle Driver',
                    email: 'airport@shuttle.com',
                    password: 'password123',
                    phoneNumber: '+919999999999',
                    licenseNumber: 'DL12345',
                    vehicleInfo: 'Toyota Innova - Airport Shuttle',
                    isVerified: true,
                }
            });
            drivers.push(driver);
        }

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Create rides to the airport
        const airportRides = [
            {
                origin: 'College Campus, Ranpur',
                destination: 'Airport, Ranpur',
                departure: new Date(tomorrow.setHours(16, 30, 0, 0)),
                seats: 3,
                cost: 150,
                status: 'SCHEDULED',
            },
            {
                origin: 'City Center, Ranpur',
                destination: 'International Airport',
                departure: new Date(tomorrow.setHours(17, 0, 0, 0)),
                seats: 4,
                cost: 200,
                status: 'SCHEDULED',
            },
            {
                origin: 'Hostel Gate, Ranpur',
                destination: 'Airport Terminal 2',
                departure: new Date(tomorrow.setHours(16, 45, 0, 0)),
                seats: 2,
                cost: 120,
                status: 'SCHEDULED',
            },
        ];

        for (const rideData of airportRides) {
            const ride = await prisma.ride.create({
                data: {
                    ...rideData,
                    driverId: drivers[0].id,
                },
                include: { driver: true }
            });

            console.log(`✅ Created: ${ride.origin} → ${ride.destination}`);
            console.log(`   Departure: ${ride.departure.toLocaleString()}, Cost: $${ride.cost}, Seats: ${ride.seats}\n`);
        }

        console.log('✅ Airport rides seeded successfully!');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

seedAirportRides();
