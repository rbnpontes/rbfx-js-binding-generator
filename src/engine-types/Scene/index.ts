import defineAnimatable from "./Animatable";
import defineComponent from "./Component";
import defineSerializable from "./Serializable";
import defineSceneHeaders from "./headers";

export default function defineSceneModule() {
    const modules = [
        defineSceneHeaders,
        defineSerializable,
        defineComponent,
        defineAnimatable
    ];

    modules.forEach(x => x());
}