// scripts/test-mandala.ts
import { generateMandalaCard } from "../src/tools/mandala";

(async () => {
    try {
        const result = await generateMandalaCard({
            userId: "test",
            birthDate: "1993-07-26",
            birthTime: "20:00:00",
            birthLocation: "Upland, CA, USA",
        });
        console.log("Mandala OK:", result);
        process.exit(0);
    } catch (e) {
        console.error("Mandala FAIL:", e);
        process.exit(1);
    }
})();
