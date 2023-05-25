import defineMathModule from "./Math";
import defineResourceModule from "./Resource";
import defineSceneModule from "./Scene";
import defineUIModule from "./UI";
import defineBuiltins from "./builtins";
import defineGlobals from "./globals";

const defines = [
    defineBuiltins,
    defineGlobals,
    defineMathModule,
    defineResourceModule,
    defineSceneModule,
    defineUIModule
];

export default function defineEngineTypes() {
    defines.forEach(x => x());
}