import defineColor from "./Color";
import defineMathHeaders from "./headers";

export default function defineMathModule() {
    const modules = [
        defineMathHeaders,
        defineColor
    ];
    modules.forEach(x => x());
}