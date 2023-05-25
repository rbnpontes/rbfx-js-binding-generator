import { addEnum, addMethod, setEnumEntries, sharedPtr } from "../../metadata";
import { setMethodArgs } from "../../metadata";
import { setMethodReturn } from "../../metadata";
import { addProperty, list } from "../../metadata";
import { addClass, setInheritance } from "../../metadata";

export default function defineUIElement() {
    addClass(()=> {
        setInheritance('Animatable');
        addProperty('IsEnabled', 'SetEnabled', 'bool');
        addProperty('GetName', 'SetName', 'string');
        addProperty('GetChildren', null, list(sharedPtr('UIElement')));
        addProperty('GetHorizontalAlignment', 'SetHorizontalAlignment', 'HorizontalAlignment');
        addProperty('GetVerticalAlignment', 'SetVerticalAlignment', 'VerticalAlignment');
        addProperty(null, 'SetColor', 'Color');
        addMethod(()=> {
            setMethodArgs(['UIElement']);
        }, 'AddChild');
        addMethod(()=> {
            setMethodArgs(['Corner']);
            setMethodReturn('Color');
        }, 'GetColor');
        addMethod(()=> {
            setMethodArgs(['Corner', 'Color']);
        }, 'SetColor');
        // addMethod(()=> {
        //     setMethodArgs()
        //     setMethodReturn(list('UIElement'));
        // })
    }, 'UIElement');
}