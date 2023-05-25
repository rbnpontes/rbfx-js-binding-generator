import path from "path";
import defineEngineTypes from "./engine-types";
import { getClasses, getPrimitives } from "./metadata";
import SystemState from "./system-state";
import CodeGen from "./code-gen";

let outputPath = '';
if(outputPath = process.argv.find(x => x.startsWith('--out='))) {
    outputPath = outputPath.replace('--out=', '');
    SystemState.outputPath = path.normalize(outputPath);
} else {
    SystemState.outputPath = path.join(__dirname, '../out');
}
SystemState.boilerplatePath = path.join(__dirname, '../boilerplate');

defineEngineTypes();

CodeGen.build();