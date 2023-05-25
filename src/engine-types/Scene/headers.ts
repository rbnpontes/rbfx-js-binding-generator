import { addHeaders } from "../../metadata";

export default function defineSceneHeaders() {
    addHeaders([
        '../Scene/Serializable.h',
        '../Scene/Animatable.h'
    ]);
}