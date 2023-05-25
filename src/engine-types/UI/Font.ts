import { addClass, setInheritance } from "../../metadata";

export default function defineFont() {
    addClass(()=> {
        setInheritance('Resource');
    }, 'Font');
}