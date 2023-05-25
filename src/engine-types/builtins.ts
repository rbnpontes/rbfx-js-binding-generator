import { addBuiltinPrimitive } from "../metadata";

export default function defineBuiltins() {
    addBuiltinPrimitive('Object');
    addBuiltinPrimitive('string');
    addBuiltinPrimitive('StringHash');
    addBuiltinPrimitive('bool');
    addBuiltinPrimitive('float');
    addBuiltinPrimitive('double');
    addBuiltinPrimitive('int');
    addBuiltinPrimitive('unsigned');
    addBuiltinPrimitive('void*');
    addBuiltinPrimitive('function');
}