import CodeBuilder from "../code-builder";
import IDictionary from "./dictionary";

export interface ITypeToken {
    readonly name: string;
    readonly type: 'primitive' | 'class' | 'object' | 'enum' | 'list' | 'umap' | 'map' | 'ref' | 'shared_ptr' | 'weak_ptr';
}
export enum OperatorFlags {
    none = 0,
    equal = 1 << 0,
    add = 1 << 1,
    sub = 1 << 2,
    mul = 1 << 3,
    div = 1 << 4,
    all = equal | add | sub | mul | div
}

export interface IMethodDef {
    name: string;
    returnType: ITypeToken;
    arguments: ITypeToken[];
}

export interface IClassProperty {
    type: ITypeToken;
    setName: string;
    getName: string;
}
export interface IClassToken extends ITypeToken {
    inherits: IClassToken;
    methods: IMethodDef[];
    staticMethods: IMethodDef[];
    properties: IClassProperty[];
    isAbstract: boolean;
}

export type PrimitiveVarType = 'string' | 'uint' | 'int' | 'float' | 'double';
export interface IPrimitiveVar {
    type : PrimitiveVarType;
    nativeName : string;
}
export interface IPrimitiveToken extends ITypeToken {
    variables : IDictionary<IPrimitiveVar>;
    staticVariables: IDictionary<string>;
    operatorFlags : number;
    builtin : boolean;
    methods : IMethodDef[];
}

export interface IObjectMethodDef extends IMethodDef {
    dynamicArgs: boolean;
    code: string | CodeBuilder | Array<string | CodeBuilder>;
}
export interface IObjectVariableDef {
    code: string | CodeBuilder | Array<string | CodeBuilder>;
    type: ITypeToken;
    name: string;
}
export interface IObjectToken extends ITypeToken {
    isGlobal: boolean;
    parent?: ITypeToken;
    children: IDictionary<IObjectToken>;
    methods: IObjectMethodDef[];
    properties: IClassProperty[];
    variables: IObjectVariableDef[];
}

export interface IEnumeratorToken extends ITypeToken {
    values: { key: string, value: string }[];
    enumType : 'string' | 'number';
}
export interface IListToken extends ITypeToken {
    target : ITypeToken;
}
export interface IRefToken extends ITypeToken {
    target : ITypeToken;
}
export interface ISmartPointerToken extends ITypeToken {
    target : ITypeToken;
}
