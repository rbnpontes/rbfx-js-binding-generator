import defineFont from "./Font";
import defineText from "./Text";
import defineUI from "./UI";
import defineUIElement from "./UIElement";
import defineUISelectable from "./UISelectable";
import defineUIEnums from "./enums";
import defineUIHeaders from "./headers";

export default function defineUIModule() {
    const modules = [
        defineUIHeaders,
        defineUIEnums,
        defineFont,
        defineUIElement,
        defineUISelectable,
        defineText,
        defineUI
    ];
    modules.forEach(x => x());
}