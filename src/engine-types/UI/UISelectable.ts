import { addClass, setInheritance } from "../../metadata";

export default function defineUISelectable() {
    addClass(()=> {
        setInheritance('UIElement');
    }, 'UISelectable');
}