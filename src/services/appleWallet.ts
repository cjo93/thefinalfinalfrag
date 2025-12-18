import { PKPass } from 'passkit-generator';
import path from 'path';
import fs from 'fs';
import { collections } from './firestore';
import { generateAstrologyProfile } from './astrology';

// Helper to get Certs (Env Base64 > File)
function getCertificates() {
    // Production: Base64 Env Vars
    if (process.env.APPLE_WALLET_SIGNER_CERT && process.env.APPLE_WALLET_SIGNER_KEY) {
        return {
            wwdr: Buffer.from(process.env.APPLE_WALLET_WWDR || '', 'base64'),
            signerCert: Buffer.from(process.env.APPLE_WALLET_SIGNER_CERT, 'base64'),
            signerKey: Buffer.from(process.env.APPLE_WALLET_SIGNER_KEY, 'base64'),
            signerKeyPassphrase: process.env.APPLE_WALLET_PASSPHRASE
        };
    }

    // Development: Local Filesystem
    const certDir = path.resolve(__dirname, '../../certs');
    // Check if certs exist to avoid crash in environments without them
    if (!fs.existsSync(path.join(certDir, 'signerCert.pem'))) {
        // Fallback for CI/Build where certs might not be present but code needs to compile
        // Return warnings or empty buffers if strictly needed, but throwing is better for visibility on dev
        console.warn("Certificates not found. returning empty buffers for mock compile.");
        return {
            wwdr: Buffer.from(''),
            signerCert: Buffer.from(''),
            signerKey: Buffer.from('')
        };
    }

    return {
        wwdr: fs.readFileSync(path.join(certDir, 'wwdr.pem')),
        signerCert: fs.readFileSync(path.join(certDir, 'signerCert.pem')),
        signerKey: fs.readFileSync(path.join(certDir, 'signerKey.pem'))
    };
}

export const generateApplePass = async (userId: string): Promise<Buffer> => {
    const certs = getCertificates();

    // Initialize Pass
    // Model path - ensure this exists in your project or mock it
    const modelPath = path.resolve(__dirname, '../../frontend/public/models/pass.pass');

    // Cast to any because PKPass types are strict about 'model' being string usually, but library supports more
    // and certificates structure matches what passkit-generator expects
    const pass = new (PKPass as any)(
        {
            model: modelPath,
            certificates: {
                wwdr: certs.wwdr,
                signerCert: certs.signerCert,
                signerKey: certs.signerKey,
            },
        },
        {
            serialNumber: userId || 'guest',
            passTypeIdentifier: process.env.APPLE_WALLET_PASS_TYPE_ID || 'pass.com.defrag.app',
            teamIdentifier: process.env.APPLE_WALLET_TEAM_ID || 'DEFRAGTEAM',
        },
        {
            description: 'Defrag System Artifact',
            logoText: 'DEFRAG',
            foregroundColor: 'rgb(255, 255, 255)',
            backgroundColor: 'rgb(0, 0, 0)',
            labelColor: 'rgb(100, 100, 100)',
        }
    );

    // Fetch User Data
    const userDoc = await collections.users.doc(userId).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    let gateKey = "GATE_XX";
    let ioRole = "ARCHITECT_NODE";

    if (userData?.birthDate) {
        try {
            const birthDate = new Date(userData.birthDate);
            const profile = await generateAstrologyProfile(birthDate);
            if (profile && profile.humanDesign) {
                gateKey = `GATE_${profile.humanDesign.sunGate}`;

                const { x, y } = profile.astroPrior;
                if (x > 0.3 && y > 0.3) ioRole = "SYSTEM_WEAVER";
                else if (x < -0.3 && y > 0.3) ioRole = "PATH_CUTTER";
                else if (y < -0.3) ioRole = "VOID_WALKER";
                else ioRole = "ARCHITECT_NODE";
            }
        } catch (e) {
            console.warn("Failed to generate astrology profile for pass", e);
        }
    }

    // Add Fields
    pass.primaryFields.push({
        key: 'gate',
        label: 'GATE KEY',
        value: gateKey,
        textAlignment: 'PKTextAlignmentCenter'
    });

    pass.secondaryFields.push({
        key: 'role',
        label: 'I/O ROLE',
        value: ioRole,
        textAlignment: 'PKTextAlignmentLeft'
    });

    // Add Images
    try {
        const publicDir = path.resolve(__dirname, '../../frontend/public');
        if (fs.existsSync(path.join(publicDir, 'og-card.png'))) {
            const imgBuffer = fs.readFileSync(path.join(publicDir, 'og-card.png'));
            (pass as any).add('icon', imgBuffer);
            (pass as any).add('logo', imgBuffer);
        }
    } catch (e) {
        console.warn("Pass assets missing or add failed", e);
    }

    return await pass.getAsBuffer();
};
