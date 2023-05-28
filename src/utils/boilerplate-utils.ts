import path from "path";
import fs from 'fs';
import SystemState from "../system-state";

export default class BoilerplateUtils {
    public static loadHeader(fileName : string) {
        const filePath = path.join(SystemState.boilerplatePath, fileName+'.h');
        return fs.readFileSync(filePath).toString();
    }
    public static loadSource(fileName : string) {
        const filePath = path.join(SystemState.boilerplatePath, fileName+'.cpp');
        return fs.readFileSync(filePath).toString();
    }
}