import { addHeaders } from "../../metadata";

export default function defineResourceHeaders() {
    addHeaders([
        '../Resource/ResourceCache.h',
        '../Resource/Resource.h'
    ]);
}