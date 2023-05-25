import { addEnum, setEnumEntries } from "../../metadata";

export default function defineUIEnums() {
    addEnum(() => {
        setEnumEntries([
            ["left", "HA_LEFT"],
            ["center", "HA_CENTER"],
            ["right", "HA_RIGHT"],
            ["custom", "HA_CUSTOM"]
        ]);
    }, "HorizontalAlignment");
    addEnum(() => {
        setEnumEntries([
            ["top", "VA_TOP"],
            ["center", "VA_CENTER"],
            ["bottom", "VA_BOTTOM"],
            ["custom", "VA_CUSTOM"]
        ]);
    }, "VerticalAlignment");
    addEnum(() => {
        setEnumEntries([
            ["topLeft", "C_TOPLEFT"],
            ["topRight", "C_TOPRIGHT"],
            ["bottomLeft", "C_BOTTOMLEFT"],
            ["bottomRight", "C_BOTTOMRIGHT"]
        ]);
    }, "Corner");
    addEnum(() => {
        setEnumEntries([
            ["horizontal", "O_HORIZONTAL"],
            ["vertical", "O_VERTICAL"]
        ]);
    }, "Orientation");
    addEnum(() => {
        setEnumEntries([
            ["notFocusable", "FM_NOTFOCUSABLE"],
            ["resetFocus", "FM_RESETFOCUS"],
            ["focusable", "FM_FOCUSABLE"],
            ["focusableDefocusable", "FM_FOCUSABLE_DEFOCUSABLE"]
        ]);
    }, "FocusMode");
    addEnum(() => {
        setEnumEntries([
            ["free", "LM_FREE"],
            ["horizontal", "LM_HORIZONTAL"],
            ["vertical", "LM_VERTICAL"]
        ]);
    }, "LayoutMode");
    addEnum(() => {
        setEnumEntries([
            ["breadthFirst", "TM_BREADTH_FIRST"],
            ["depthFirst", "TM_DEPTH_FIRST"]
        ]);
    }, "TraversalMode");
    addEnum(()=> {
        setEnumEntries([
            ["disabled", "DD_DISABLED"],
            ["source", "DD_SOURCE"],
            ["target", "DD_TARGET"],
            ["sourceAndTarget", "DD_SOURCE_AND_TARGET"]
        ]);
    }, "DragAndDropMode");
}