// api/scripts/generate-demo-tokens.ts

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { JwtService } from '@nestjs/jwt';

const PASSENGER_ID = '11111111-1111-4111-8111-111111111111';
const DRIVER_ID = '22222222-2222-4222-8222-222222222222';

const privateKey = readFileSync(
    resolve(process.cwd(), 'keys/private.pem'),
    'utf8',
);

const jwtService = new JwtService({
    privateKey,
    signOptions: {
        algorithm: 'RS256',
        issuer: 'corridas-api',
        audience: 'corridas-app',
        expiresIn: '30d',
    },
});

async function main() {
    const passengerToken = await jwtService.signAsync({
        sub: PASSENGER_ID,
    });

    const driverToken = await jwtService.signAsync({
        sub: DRIVER_ID,
    });

    console.log('\nPASSENGER TOKEN:\n', passengerToken);
    console.log('\nDRIVER TOKEN:\n', driverToken);
}

main().catch(console.error);