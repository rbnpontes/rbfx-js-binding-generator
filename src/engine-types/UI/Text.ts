import { addClass, addMethod, addProperty, setInheritance, setMethodArgs, setMethodReturn } from "../../metadata";

export default function defineText() {
    addClass(()=> {
        setInheritance('UISelectable');
        addProperty('GetText', 'SetText', 'string');
        addProperty('GetFont', 'SetFont', 'Font');
        addProperty('GetFontSize', 'SetFontSize', 'float');

        addMethod(()=> {
            setMethodArgs(['Font', 'float']);
            setMethodReturn('bool');
        }, 'SetFont');
    }, 'Text');
};