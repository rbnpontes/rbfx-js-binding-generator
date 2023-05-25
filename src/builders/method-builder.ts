import BaseBuilder, { IBuilder } from "./base-builder";
import fs from 'fs';
import path from 'path';
import SystemState from "../system-state";
import CodeBuilder from "../code-builder";

export default class MethodBuilder extends BaseBuilder implements IBuilder<MethodBuilder> {
    private _returnType: string = 'void';
    private _arguments: string[] = [];
    private _dynamicArgs: boolean = false;
    private _methodCode: string = '';

    public setReturn(returnType: string): MethodBuilder {
        this._returnType = returnType;
        return this;
    }
    public setArguments(args: string[]): MethodBuilder {
        this._arguments = args;
        return this;
    }
    public setDynamicArgs(): MethodBuilder {
        this._dynamicArgs = true;
        return this;
    }
    public unsetDynamicArgs(): MethodBuilder {
        this._dynamicArgs = false;
        return this;
    }
    public setCode(code: string): MethodBuilder
    public setCode(codeBuilder: CodeBuilder): MethodBuilder
    public setCode(args: Array<string | CodeBuilder>): MethodBuilder
    public setCode(args: any): MethodBuilder {
        const codeBuilder = new CodeBuilder();
        codeBuilder.add(args);
        this._methodCode = codeBuilder.toString();
        return this;
    }
    public setExternalCode(filePath: string): MethodBuilder {
        this._methodCode = fs.readFileSync(path.join(SystemState.boilerplatePath, filePath)).toString();
        return this;
    }

    private _emitMethodValidations(code: CodeBuilder) {
   
    }
    private _emitMethodArguments(code: CodeBuilder) {

    }
    private _emitMethodReturn(code: CodeBuilder) {

    }
    private _emitMethodScope(code: CodeBuilder) {
        this._emitMethodValidations(code);
        this._emitMethodArguments(code);
        code.add(this._methodCode);
        this._emitMethodReturn(code);
    }
    public build(): MethodBuilder {
        this.code.clear();
        const scopeCode = new CodeBuilder();
        scopeCode.setIndentationSize(4);

        this._emitMethodScope(scopeCode);
        this.code.add([
            'duk_push_c_function(ctx, [](duk_context* ctx){',
            scopeCode,
            `}, "${this._dynamicArgs ? "DUK_VARARGS" : this._arguments.length.toString()}");`
        ]);
        return this;
    }
}