import { addClass, addMethod, addProperty } from "../../metadata";

export default function defineUI() {
    addClass(()=> {
        addProperty('GetRoot', 'SetRoot', 'UIElement');
    }, 'UI');
}