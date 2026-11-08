import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

const generatePasswordHash = async (password: string) => {
    const argon2 = await import('argon2');
    return argon2.hash(password, {
        type: argon2.argon2id,
    });
}

async function main() {
    const passenger = await prisma.user.upsert({
        where: { email: 'passenger@corridas.local' },
        update: {},
        create: {
            id: '11111111-1111-4111-8111-111111111111',
            name: 'Test Passenger',
            email: 'passenger@corridas.local',
            role: UserRole.PASSENGER,
            passwordHash: await generatePasswordHash('passenger123'),
        },
    });

    const driver = await prisma.user.upsert({
        where: { email: 'driver@corridas.local' },
        update: {},
        create: {
            id: '22222222-2222-4222-8222-222222222222',
            name: 'Test Driver',
            email: 'driver@corridas.local',
            role: UserRole.DRIVER,
            passwordHash: await generatePasswordHash('driver123'),
        },
    });

    console.log('Seed completed:', {
        passenger: passenger.id,
        driver: driver.id,
    });
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });