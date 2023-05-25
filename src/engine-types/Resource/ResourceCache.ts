import { addClass, addMethod, setMethodArgs, setMethodReturn } from "../../metadata";

export default function defineResourceCache() {
    addClass(()=> {
        addMethod(()=> {
            setMethodArgs(['StringHash', 'string']);
            setMethodReturn('Resource');
        }, 'GetResource');
    }, 'ResourceCache');
}