import defineAnimatable from "./Animatable";
import defineSerializable from "./Serializable";
import defineSceneHeaders from "./headers";

export default function defineSceneModule() {
    const modules = [
        defineSceneHeaders,
        defineSerializable,
        defineAnimatable
    ];

    modules.forEach(x => x());
}