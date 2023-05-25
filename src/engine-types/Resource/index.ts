import defineResource from "./Resource";
import defineResourceCache from "./ResourceCache";
import defineResourceHeaders from "./headers";

export default function defineResourceModule() {
    const modules = [
        defineResourceHeaders,
        defineResource,
        defineResourceCache,
    ];

    modules.forEach(x => x());
}