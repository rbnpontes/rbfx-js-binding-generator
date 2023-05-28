import path from "path";
import fs from 'fs';
import SystemState from "./system-state";

export default class FileBuild {
    public static build(inputs: [string, string][]) {
        if (!fs.existsSync(SystemState.outputPath))
            fs.mkdirSync(SystemState.outputPath, { recursive: true });
        inputs.forEach(x => {
            const [fileName, code] = x;
            const outputPath = path.join(SystemState.outputPath, fileName);
            fs.writeFileSync(outputPath, code);
        });
    }
}