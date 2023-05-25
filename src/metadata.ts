import { type } from "os";
import CodeBuilder from "./code-builder";
import IDictionary from "./types/dictionary";
import { VoidAction } from "./types/functions";
import { IClassToken, IEnumeratorToken, IListToken, IMethodDef, IObjectMethodDef, IObjectToken, IPrimitiveToken, ISmartPointerToken, ITypeToken, PrimitiveVarType } from "./types/metadata-def";
import CodeUtils from "./utils/code.utils";

const classes: IDictionary<IClassToken> = {};
const primitives: IDictionary<IPrimitiveToken> = {};
const enumerators: IDictionary<IEnumeratorToken> = {};

const GLOBAL_OBJECT: IObjectToken = {
    isGlobal: true,
    name: 'global',
    type: 'object',
    parent: null,
    methods: [],
    properties: [],
    variables: [],
    children: {}
};

let _currentClass: IClassToken = null;
let _currentObject: IObjectToken = null;
let _currentPrimitive: IPrimitiveToken = null;

let _currentMethod: IMethodDef = null;

let _headers: string[] = [];

let _currentEnum: IEnumeratorToken = null;

function _assertMethod() {
    if(!_currentMethod)
        throw 'must call inside addMethod.';
}
function _assertEnum() {
    if (!_currentEnum)
        throw 'must call inside addEnum.';
}
function _assertPrimitive() {
    if (!_currentPrimitive)
        throw 'must call inside addPrimitive.';
}

function _getTypeToken(type: string | ITypeToken) {
    if(typeof type != 'string') {
        return type;
    }
    let token: ITypeToken = null;

    if ((token = classes[type]))
        return token;
    if ((token = primitives[type]))
        return token;
    if ((token = enumerators[type]))
        return token;
    throw `not found registered token for type ${type}. did you call addClass, addEnum or addPrimitive ?`;
}
function _getClassToken(typeName: string) {
    let classToken: IClassToken = null;
    if ((classToken = classes[typeName]))
        return classToken;
    throw `not found class token for type ${typeName}. did you call addClass ?`
}

export function setMethodArgs(args: Array<string | ITypeToken>) {
    _assertMethod();
    const methodArgs = args.map((x) => _getTypeToken(x));
    _currentMethod.arguments = methodArgs;
}
export function setMethodReturn(returnType: string | ITypeToken) {
    _assertMethod();
    _currentMethod.returnType = _getTypeToken(returnType);
}
export function addMethod(callback: VoidAction, methodName: string) {
    const throwExistentMethod = () => { throw `this method "${methodName}" is already mapped on object.`; };
    if (_currentObject) {
        if (_currentObject.methods.find(x => x.name == methodName))
            throwExistentMethod();
        _currentMethod = {
            arguments: [],
            name: methodName,
            code: '',
            dynamicArgs: false,
            returnType: null
        } as IObjectMethodDef;
        callback();
        _currentObject.methods.push(_currentMethod as IObjectMethodDef);
        _currentMethod = null;
        return;
    } 
    else if (_currentPrimitive) {
        if (_currentPrimitive.methods.find(x => x.name == methodName))
            throwExistentMethod();
        _currentMethod = {
            arguments: [],
            name: methodName,
            returnType: null
        };
        callback();
        _currentPrimitive.methods.push(_currentMethod);
        _currentMethod = null;
        return;
    }

    if (!_currentClass)
        throw 'add method must be called inside addClass or addPrimitive.';
    if (_currentClass.methods.find(x => x.name == methodName))
        throwExistentMethod();

    _currentMethod = {
        arguments: [],
        name: methodName,
        returnType: null
    };
    callback();
    _currentClass.methods.push(_currentMethod);
    _currentMethod = null;
}
export function makeDynamic() {
    _assertMethod();
    (_currentMethod as IObjectMethodDef).dynamicArgs = true;
}
export function setMethodCode(code: string | CodeBuilder | Array<string | CodeBuilder>) {
    _assertMethod();
    (_currentMethod as IObjectMethodDef).code = code;
}
export function addStaticMethod(callback: VoidAction, methodName: string) {
    if (!_currentClass)
        throw 'add method must be called inside addClass';
    if (_currentClass.methods.find(x => x.name == methodName))
        throw `this method "${methodName}" is already mapped.`;

    _currentMethod = {
        arguments: [],
        name: methodName,
        returnType: null
    };
    callback();
    _currentClass.staticMethods.push(_currentMethod);
    _currentMethod = null;
}
export function addProperty(getter: string, setter: string, typeName: string | ITypeToken) {
    if (!_currentClass)
        throw 'must call addClass first.';
    _currentClass.properties.push({
        getName: getter,
        setName: setter,
        type: _getTypeToken(typeName)
    });
}
export function setInheritance(typeName: string) {
    if (!_currentClass)
        throw 'must call addClass first.';
    _currentClass.inherits = _getClassToken(typeName);
}

export function addClass(callback: VoidAction, className: string) {
    let klass = classes[className];
    if (!klass) {
        classes[className] = klass = {
            inherits: null,
            methods: [],
            name: className,
            properties: [],
            staticMethods: [],
            type: 'class',
            isAbstract: false
        };
    }
    _currentClass = klass;
    callback();
    _currentClass = null;
}
export function makeAbstract() {
    if (!_currentClass)
        throw 'must call addClass first.';
    _currentClass.isAbstract = true;
}

export function addPrimitive(callback: VoidAction, primitiveName: string) {
    let primitive = primitives[primitiveName];
    if (!primitive) {
        primitives[primitiveName] = primitive = {
            name: primitiveName,
            type: 'primitive',
            variables: {},
            staticVariables: {},
            builtin: false,
            operatorFlags: 0,
            methods: []
        };
    }

    _currentPrimitive = primitive;
    callback();
    _currentPrimitive = null;
}
export function addBuiltinPrimitive(primitiveName: string) {
    primitives[primitiveName] = {
        name: primitiveName,
        type: 'primitive',
        builtin: true,
        variables: {},
        staticVariables: {},
        operatorFlags: 0,
        methods: []
    };
}

export function addVar(name: string, type: PrimitiveVarType) {
    _assertPrimitive();
    _currentPrimitive.variables[name] = {
        nativeName: name + "_", // usually, rbfx appends underscore at end of primitive.
        type
    };
}
export function addStaticVar(name: string, data: string) {
    _assertPrimitive();
    _currentPrimitive.staticVariables[name] = data;
}
export function addVariables(entries: [string, PrimitiveVarType][]) {
    entries.forEach(entry => addVar(entry[0], entry[1]));
}
export function addStaticVariables(entries: [string, string][]) {
    entries.forEach(entry => addStaticVar(entry[0], entry[1]));
}
export function setVarNativeName(name: string, nativeName: string) {
    _assertPrimitive();
    const primitiveVar = _currentPrimitive.variables[name];
    if (primitiveVar)
        primitiveVar.nativeName = nativeName;
    else
        throw `variable "${name}" does not exist on current "${_currentEnum.name}".`;
}
export function setOperatorFlags(flags: number) {
    _assertPrimitive();
    _currentPrimitive.operatorFlags = flags;
}

export function useGlobal(callback: VoidAction) {
    _currentObject = GLOBAL_OBJECT;
    callback();
    _currentObject = null;
}
export function addObject(callback: VoidAction, objName: string) {
    if (!_currentObject)
        throw 'must call useGlobal first.';
    const oldObj = _currentObject;
    // Check if has method or property with this name.
    if (_currentObject.methods.find(x => x.name == objName))
        throw 'method has been already registered with the name ' + objName;
    if (_currentObject.properties.find(x => CodeUtils.getPropName(x.getName ?? x.setName) == objName))
        throw 'property has been already registered with the name ' + objName;
    const obj = _currentObject.children[objName] ?? {
        name: objName,
        children: {},
        isGlobal: false,
        methods: [],
        properties: [],
        variables: [],
        type: 'object',
        parent: null
    };
    _currentObject.children[objName] = obj;
    _currentObject = obj;
    callback();
    _currentObject = oldObj;
};

export function addEnum(callback: VoidAction, enumName: string) {
    let currEnum = enumerators[enumName];
    if (!currEnum) {
        enumerators[enumName] = currEnum = {
            name: enumName,
            type: 'enum',
            values: [],
            enumType: 'number'
        };
    }

    _currentEnum = currEnum;
    callback();
    _currentEnum = null;
}
export function makeStringEnum() {
    _assertEnum();
    _currentEnum.enumType = 'string';
}
export function setEnumEntry(key: string, value: string | number) {
    _assertEnum();
    _currentEnum.values.push({ key, value: value.toString() });
}
export function setEnumEntries(entries: [string, string | number][]) {
    entries.forEach(entry => setEnumEntry(entry[0], entry[1]));
}

export function addHeader(value: string) {
    _headers.push(value);
}
export function addHeaders(values: string[]) {
    values.forEach(x => addHeader(x));
}

export function list(type : string | ITypeToken) : IListToken {
    return {
        type: 'list',
        name: typeof type == 'string' ? type : type.name,
        target: _getTypeToken(type)
    };
}

export function smartPtr(smartPtrType : 'weak_ptr' | 'shared_ptr', type : string | ITypeToken) : ISmartPointerToken {
    return {
        type: smartPtrType,
        name: typeof type == 'string' ? type : type.name,
        target: _getTypeToken(type)
    };
}
export function sharedPtr(type : string) : ISmartPointerToken {
    return smartPtr('shared_ptr', type);
}
export function weakPtr(type: string | ITypeToken) : ISmartPointerToken {
    return smartPtr('weak_ptr', type);
}

export function getTypeToken(typeName: string) {
    return _getTypeToken(typeName);
}
export function getClasses() {
    return Object.values(classes);
}
export function getPrimitives() {
    return Object.values(primitives);
}
export function getEnums() {
    return Object.values(enumerators);
}
export function getGlobalObject() {
    return GLOBAL_OBJECT;
}
export function getHeaders() {
    return _headers;
}