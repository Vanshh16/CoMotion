import { prisma } from '@repo/db';

async function checkDatabase() {
    try {
        console.log('Checking database...\n');

        const driversCount = await prisma.driver.count();
        const ridesCount = await prisma.ride.count();

        console.log(`Drivers: ${driversCount}`);
        console.log(`Rides: ${ridesCount}\n`);

        if (ridesCount > 0) {
            console.log('Sample rides:');
            const rides = await prisma.ride.findMany({
                take: 5,
                include: { driver: true },
                orderBy: { departure: 'asc' }
            });

            rides.forEach(ride => {
                console.log(`- ${ride.origin} → ${ride.destination}`);
                console.log(`  Departure: ${ride.departure}, Cost: $${ride.cost}, Seats: ${ride.seats}`);
                console.log(`  Status: ${ride.status}, Driver: ${ride.driver.name}\n`);
            });
        } else {
            console.log('⚠️  No rides in database');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkDatabase();
