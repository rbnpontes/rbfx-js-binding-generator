import { addClass, addProperty, makeAbstract } from "../../metadata";

export default function defineResource() {
    addClass(()=> {
        makeAbstract();
        addProperty('GetName', 'SetName', 'string');
    }, 'Resource');
}