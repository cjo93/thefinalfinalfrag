import { db, collections } from '../services/firestore';
import { Timestamp } from '@google-cloud/firestore';
import { VectorEngine } from '../core/vector-engine';
import { generateAstrologyProfile } from '../services/astrology'; // [NEW IMPORT]
import { LineageProfile, Vector3, UserState } from '../types/family-system';

// --- Types ---
interface FamilyMemberInput {
    userId: string;
    relation_to_anchor: 'mother' | 'father' | 'sibling' | 'extended' | 'friend';
    age_cohort: 'Gen_Z' | 'Millennial' | 'Gen_X' | 'Boomer' | 'Silent';
}

interface RoleInput {
    memberId: string;
    userId: string; // Needed for path or validation
    inferred_role: {
        lineage: 'order' | 'chaos' | 'neutral';
        archetype: 'martyr' | 'mad_genius' | 'crusader' | 'destroyer' | 'parasite' | 'slinger' | 'ghost' | 'innocent';
        primary_wound: string;
        confidence_score: number;
    }
}

// --- Tool: addFamilyMember ---
export const addFamilyMember = async (input: FamilyMemberInput) => {
    const { userId, relation_to_anchor, age_cohort } = input;

    const memberData = {
        relation_to_anchor,
        age_cohort,
        inferred_role: null,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
    };

    const docRef = await collections.users.doc(userId).collection('family_members').add(memberData);

    return { success: true, member_id: docRef.id };
};

// --- Tool: updateFamilyMemberRole ---
export const updateFamilyMemberRole = async (input: RoleInput) => {
    const { memberId, userId, inferred_role } = input;

    // Validation (simple check)
    const validArchetypes = ['martyr', 'mad_genius', 'crusader', 'destroyer', 'parasite', 'slinger', 'ghost', 'innocent'];
    if (!validArchetypes.includes(inferred_role.archetype)) {
        throw new Error(`Invalid archetype: ${inferred_role.archetype}`);
    }

    await collections.users.doc(userId).collection('family_members').doc(memberId).update({
        inferred_role,
        updated_at: Timestamp.now(),
    });

    // Trigger re-analysis
    await analyzeFamilySystem({ userId });

    return { success: true };
};

// --- Tool: analyzeFamilySystem ---
export const analyzeFamilySystem = async (input: { userId: string }) => {
    const { userId } = input;

    const membersSnapshot = await collections.users.doc(userId).collection('family_members').get();
    const members = membersSnapshot.docs.map((d: any) => d.data());

    const { vectors, confidence_scores } = await calculateVectors({ family_members: members });

    // Update user doc with vectors
    // Storing full UserState now
    const { userState } = await calculateVectors({ family_members: members, userId });

    await collections.users.doc(userId).update({
        family_system_state: userState, // New Field
        family_system_vectors: vectors, // Keep legacy for now or overwrite if safe? Overwriting with new structure might break old frontend.
        // Let's rely on family_system_state for the new Cube view.
        family_members_count: members.length
    });

    // Update integration score
    await updateIntegrationScore({ userId, vectors });

    return { vectors, analysis_summary: 'Analysis complete.' };
};

// --- Tool: calculateVectors ---
export const calculateVectors = async (input: { family_members: any[], userId?: string }) => {
    const { family_members } = input;

    // 1. Construct Lineage Profile from Members
    // This maps the raw Firestore data to the Engine's expected LineageProfile
    const lineage: LineageProfile = {
        lifePaths: [],
        humanDesign: [],
        relations: [],
        priors: { orderScore: 0, chaosScore: 0 },
        amplifiers: { lpMatch: false, reflectorPresent: false },
        biasVector: { x: 0, y: 0, z: 0 } // Default bias
    };

    // Simple heuristic to build biasVector from roles
    // X: Connection (+1) / Hostility (-1)
    // Y: Agency (+1) / Submission (-1)
    // Z: Meaning (+1) / Survival (-1)
    let biasX = 0;
    let biasY = 0;
    let biasZ = 0;

    family_members.forEach(m => {
        if (m.inferred_role) {
            const arch = m.inferred_role.archetype;

            // Map Archetypes to Axis Biases (Stub logic based on brief implications)
            // 'martyr' -> Submission (-Y), Connection (+X) maybe?
            // 'destroyer' -> Hostility (-X), Agency (+Y)
            if (arch === 'destroyer') { biasX -= 0.5; biasY += 0.5; }
            if (arch === 'crusader') { biasY += 0.5; biasZ += 0.2; }
            if (arch === 'martyr') { biasX += 0.3; biasY -= 0.5; }
            if (arch === 'ghost') { biasX -= 0.5; biasZ -= 0.3; }
        }
    });

    // Normalize bias
    const count = family_members.length || 1;
    lineage.biasVector = {
        x: biasX / count,
        y: biasY / count,
        z: biasZ / count
    };

    // 2. Run Vector Engine
    // We assume a neutral "User Input" ({0,0,0}) to see where the System pulls them.
    // In a real flow, this input would come from the session sliders.
    const userInput: Vector3 = { x: 0, y: 0, z: 0 };

    // Fetch Real Astrology Profile
    const astroProfile = await generateAstrologyProfile(new Date()); // Defaults to NOW (Transit bias)

    const userState: UserState = VectorEngine.updateState(userInput, lineage, astroProfile || undefined);

    return {
        vectors: userState.vector, // For legacy compat if needed, but really it's the whole state
        userState,
        confidence_scores: { global: 0.8 }
    };
};

// --- Tool: updateIntegrationScore ---
export const updateIntegrationScore = async (input: { userId: string; vectors: any }) => {
    const { userId, vectors } = input;

    // Simple heuristic: Closer to 0.5 balance = higher integration
    const balance = Math.abs(vectors.order_chaos.position - 0.5); // 0 is best
    const integration_score = 1 - (balance * 2); // 1.0 if balance is 0.5, 0.0 if balance is 0 or 1.

    await collections.users.doc(userId).update({
        integration_score
    });

    return { integration_score, change_from_previous: 0 };
};
