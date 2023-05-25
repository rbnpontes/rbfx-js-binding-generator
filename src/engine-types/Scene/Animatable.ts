import { addClass, makeAbstract, setInheritance } from "../../metadata";

export default function defineAnimatable() {
    addClass(()=> {
        makeAbstract();
        setInheritance('Serializable');
    }, 'Animatable');
}