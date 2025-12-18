
export const SAMPLE_USER = {
    uid: 'sample_user_001',
    email: 'operator@example.com',
    firstName: 'Alex',
    lastName: 'Rivera',
    tier: 'operator',
    birthData: {
        date: '1990-03-21',
        time: '14:30:00',
        location: 'Los Angeles, CA, USA',
        timezone: 'America/Los_Angeles',
        latitude: 34.0522,
        longitude: -118.2437
    },
    familyMembers: [
        {
            id: 'member_001',
            name: 'Jordan',
            relationship: 'PARTNER',
            relationshipType: 'INTIMATE',
            position: { x: 2.5, y: 1.0, z: 0.5 }
        }
    ]
};

export const SAMPLE_NATAL_CHART = {
    sun: { sign: 'Aries', degree: 0.5, house: 10 },
    moon: { sign: 'Cancer', degree: 15.2, house: 1 },
    mercury: { sign: 'Pisces', degree: 28.7, house: 9 },
    venus: { sign: 'Taurus', degree: 12.3, house: 11 },
    mars: { sign: 'Capricorn', degree: 5.8, house: 7 },
    aspects: [
        { type: 'SQUARE', planets: ['Sun', 'Moon'], orb: 2.5 },
        { type: 'TRINE', planets: ['Venus', 'Mars'], orb: 1.2 }
    ]
};
