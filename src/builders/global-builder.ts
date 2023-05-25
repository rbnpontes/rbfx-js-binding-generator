import CodeBuilder from "../code-builder";
import { Action } from "../types/functions";
import BaseBuilder from "./base-builder";
import ObjectBuilder from "./object-builder";


export default class GlobalBuilder extends BaseBuilder {
    public addObject(callback : Action<ObjectBuilder>, objectName : string) : GlobalBuilder {
        const objCodeBuilder = new CodeBuilder();
        const objBuilder = new ObjectBuilder(objCodeBuilder);

        callback(objBuilder);
        
        this.code.add([
            `duk_push_object(ctx, ${objectName});`,
            objCodeBuilder,
            `duk_put_global_string(ctx, "${objectName}");`
        ]);
        
        this.code.add(objCodeBuilder);
        return this;
    }
}