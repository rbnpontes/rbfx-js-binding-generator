import GlobalBuilder from "./builders/global-builder";
import ObjectBuilder from "./builders/object-builder";
import CodeBuilder from "./code-builder";

export default class DuktapeBuilder {
    public static getClassBuilder(codeBuilder : CodeBuilder) {

    }
    public static getGlobalBuilder(codeBuilder : CodeBuilder) {
        return new GlobalBuilder(codeBuilder);
    }
    public static getObjectBuilder(codeBuilder : CodeBuilder) {
        return new ObjectBuilder(codeBuilder);
    }
}