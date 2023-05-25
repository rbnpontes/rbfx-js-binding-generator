import CodeBuilder from "../code-builder";
import { Action } from "../types/functions";
import BaseBuilder from "./base-builder";

export default class ObjectBuilder extends BaseBuilder{
    addMethod(callback : Action<void>, methodName : string) : ObjectBuilder {
        const methodCode = new CodeBuilder();
        methodCode.setIndentationSize(4);

        this.code.add([
        ]);
        return this;
    }
}