import { addClass, makeAbstract } from "../../metadata";

export default function defineSerializable() {
    addClass(()=> {
        makeAbstract();
    }, 'Serializable');
}