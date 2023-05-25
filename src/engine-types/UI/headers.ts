import { addHeaders } from "../../metadata";

export default function defineUIHeaders() {
    addHeaders([
        '../UI/UI.h',
        '../UI/Font.h',
        '../UI/UIElement.h',
        '../UI/UISelectable.h',
        '../UI/Text.h'
    ]);
}