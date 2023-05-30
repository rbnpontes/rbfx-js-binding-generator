import path from "path";
import fs from 'fs';
import SystemState from "../system-state";

export default class BoilerplateUtils {
    private static _filter(input : String) {
        return input
            .replace(/__CTOR_PATTERN__/gm, SystemState.patterns.constructor)
            .replace(/__REQUIRE_PATTERN__/gm, SystemState.patterns.require)
            .replace(/__RESOLVE_PATTERN__/gm, SystemState.patterns.resolver);
    }
    public static loadHeader(fileName : string) {
        const filePath = path.join(SystemState.boilerplatePath, fileName+'.h');
        return this._filter(fs.readFileSync(filePath).toString());
    }
    public static loadSource(fileName : string) {
        const filePath = path.join(SystemState.boilerplatePath, fileName+'.cpp');
        return this._filter(fs.readFileSync(filePath).toString());
    }
}