import { addClass, addProperty, makeAbstract, setInheritance } from "../../metadata";

export default function defineComponent() {
    addClass(()=> {
        makeAbstract();
        addProperty('IsEnabled', 'SetEnabled', 'bool');
        setInheritance('Serializable');
    }, 'Component');
}