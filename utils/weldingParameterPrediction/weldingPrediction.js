import { exec } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

// Manually define __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getWeldingPrediction(flexuralStrength, tensileStrength, thermalConductivity, porosity) {
    const scriptPath = path.join(__dirname, "predict.py");

    return new Promise((resolve, reject) => {
        const command = `python3 "${scriptPath}" ${flexuralStrength} ${tensileStrength} ${thermalConductivity} ${porosity}`;

        const pythonProcess = exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Execution Error: ${error.message}`);
                reject(error.message);
                return;
            }
            if (stderr) {
                console.error(`Python Error: ${stderr}`);
                reject(stderr);
                return;
            }

            try {
                const prediction = JSON.parse(stdout);
                resolve(prediction);
            } catch (err) {
                reject("Failed to parse prediction output.");
            }
        });
    });
}
