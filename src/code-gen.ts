import SystemState from './system-state';
import CodeBuilder from './code-builder';
import { getClasses, getEnums, getGlobalObject, getHeaders, getPrimitives, getTypeToken } from './metadata';
import { IClassToken, IEnumeratorToken, IListToken, IObjectToken, IPrimitiveToken, ITypeToken, OperatorFlags } from './types/metadata-def';
import CodeUtils from './utils/code.utils';
import BoilerplateUtils from './utils/boilerplate-utils';
import FileBuild from './file-build';
export default class CodeGen {
    public static build() {
        const headers = getHeaders().map(x => `#include "${x}"`).join('\n');

        let codeInputs: [string, string][] = [
            ['JavaScriptBindings.h', BoilerplateUtils.loadHeader('base')],
            ['JavaScriptBindings.cpp', BoilerplateUtils.loadSource('base').replace('%OUTPUT_NAME%', SystemState.outputName)],
            ['JavaScriptBindingUtils.h', BoilerplateUtils.loadHeader('utils')],
            ['JavaScriptBindingUtils.cpp', BoilerplateUtils.loadSource('utils')]
        ];

        const code = new CodeBuilder();
        const scopeCode = new CodeBuilder();
        scopeCode.setIndentationSize(SystemState.indentSize);

        scopeCode.add('void Setup_Bindings(duk_context* ctx);');
        this._emitPrimitiveSignatures(scopeCode);
        this._emitConstructorSignatures(scopeCode);

        // Write Header
        code.add([
            '// # Generated File',
            '#pragma once',
            '#include "JavaScriptBindings.h"',
            headers,
            'namespace Urho3D {',
            scopeCode,
            '}'
        ]);

        // Create Header File
        codeInputs = [
            ...codeInputs,
            [SystemState.outputName + '.h', code.toString()]
        ];

        code.clear();
        scopeCode.clear();

        const bindingsCode = new CodeBuilder();
        bindingsCode.setIndentationSize(SystemState.indentSize + 1);
        this._emitConstructorCalls(bindingsCode);

        this._emitPrimitivesCall(scopeCode);
        this._emitConstructorsMethods(scopeCode);

        this._emitEnums(bindingsCode);
        this._emitPrimitives(bindingsCode);
        this._emitGlobalDefs(bindingsCode);

        code.add([
            '// # Generated File',
            `#include "${SystemState.outputName}.h"`,
            '#include "JavaScriptBindingUtils.h"',
            '',
            'namespace Urho3D {',
            scopeCode,
            '\tvoid Setup_Bindings(duk_context* ctx) {',
            bindingsCode,
            '\t}',
            '}'
        ]);

        codeInputs = [
            ...codeInputs,
            [SystemState.outputName + '.cpp', code.toString()]
        ];

        FileBuild.build(codeInputs);
    }

    private static _emitGlobalDefs(code: CodeBuilder) {
        const globalObj = getGlobalObject();

        Object.values(globalObj.children).forEach(objDef => {
            this._emitObjectDefs(objDef, code);
            code.add(`duk_put_global_string(ctx, "${objDef.name}");`);
        });

        code.add('// global defs')
        globalObj.methods.forEach(methodDef => {
            const scopeCode = new CodeBuilder();
            scopeCode.setIndentationSize(SystemState.indentSize);
            scopeCode.add('duk_idx_t argc = duk_get_top(ctx);');

            const emitCode = () => {
                if (typeof methodDef.code == 'string')
                    scopeCode.add(methodDef.code);
                else if (methodDef.code instanceof CodeBuilder)
                    scopeCode.add(methodDef.code);
                else if (Array.isArray(methodDef.code)) {
                    methodDef.code.forEach(x => {
                        if (typeof x == 'string')
                            scopeCode.add(x);
                        else if (x instanceof CodeBuilder)
                            scopeCode.add(x);
                    });
                }
            };
            if (!methodDef.dynamicArgs) {
                this._emitArgsValidation(methodDef.arguments, scopeCode);
                this._emitArgs(methodDef.arguments, scopeCode);
                this._emitReturnVar(methodDef.returnType, scopeCode);
                emitCode();
                this._emitReturn(methodDef.returnType, scopeCode);
            } else {
                this._emitReturnVar(methodDef.returnType, scopeCode);
                emitCode();
                this._emitReturn(methodDef.returnType, scopeCode);
            }


            code.add([
                `// setup global method ${methodDef.name}`,
                'duk_push_c_function(ctx, [](duk_context* ctx) {',
                scopeCode,
                `}, ${methodDef.dynamicArgs ? 'DUK_VARARGS' : methodDef.arguments.length});`,
                `duk_put_global_string(ctx, "${methodDef.name}");`
            ]);
        });
        code.add('// setup global variables');
        globalObj.variables.forEach(varDef => {
            const scopeCode = new CodeBuilder();
            scopeCode.setIndentationSize(SystemState.indentSize);

            this._emitReturnVar(varDef.type, scopeCode);
            scopeCode.add(`result = ${varDef.code.toString()};`);
            this._emitReturn(varDef.type, scopeCode);
            scopeCode.add(`duk_put_global_string(ctx, "${varDef.name}");`);

            code.add([
                '{ // Setup Global Variables',
                scopeCode,
                '}'
            ]);
        });
    }
    private static _emitObjectDefs(objDef: IObjectToken, code: CodeBuilder) {

        code.add([
            `// setup ${objDef.name} object`,
            'duk_push_object(ctx);',
        ]);
        objDef.methods.forEach(methodDef => {
            const scopeCode = new CodeBuilder();
            scopeCode.setIndentationSize(SystemState.indentSize);

            scopeCode.add('duk_idx_t argc = duk_get_top(ctx);');
            const emitCode = () => {
                if (typeof methodDef.code == 'string')
                    scopeCode.add(methodDef.code);
                else if (methodDef.code instanceof CodeBuilder)
                    scopeCode.add(methodDef.code);
                else if (Array.isArray(methodDef.code)) {
                    methodDef.code.forEach(x => {
                        if (typeof x == 'string')
                            scopeCode.add(x);
                        else if (x instanceof CodeBuilder)
                            scopeCode.add(x);
                    });
                }
            };
            if (!methodDef.dynamicArgs) {
                this._emitArgsValidation(methodDef.arguments, scopeCode);
                this._emitArgs(methodDef.arguments, scopeCode);
                this._emitReturnVar(methodDef.returnType, scopeCode);
                emitCode();
                this._emitReturn(methodDef.returnType, scopeCode);
            } else {
                this._emitReturnVar(methodDef.returnType, scopeCode);
                emitCode();
                this._emitReturn(methodDef.returnType, scopeCode);
            }

            code.add([
                `// setup ${objDef.name}.${methodDef.name}() method.`,
                'duk_push_c_function(ctx, [](duk_context* ctx) {',
                scopeCode,
                `}, ${methodDef.dynamicArgs ? 'DUK_VARARGS' : methodDef.arguments.length});`,
                `duk_put_prop_string(ctx, -2, "${methodDef.name}");`
            ]);
        });
        objDef.properties.forEach(propDef => {
            throw 'must implement object properties';
        });

        Object.values(objDef.children).forEach(childObjDef => {
            this._emitObjectDefs(childObjDef, code);
            code.add(`duk_put_prop_string(ctx, -2, "${childObjDef.name}")`)
        });
    }

    private static _emitConstructorSignatures(code: CodeBuilder) {
        const classes = getClasses();

        classes.forEach(klass => {
            code.add(`void ${klass.name}_${SystemState.patterns.constructor}(duk_context* ctx, duk_idx_t obj_idx, Object* instance);`)
        });
    }
    private static _emitConstructorsMethods(code: CodeBuilder) {
        const classes = getClasses();

        classes.forEach(klass => {
            const scopeCode = new CodeBuilder();
            scopeCode.setIndentationSize(SystemState.indentSize);

            if (klass.inherits)
                scopeCode.add(`${klass.inherits.name}_${SystemState.patterns.constructor}(ctx, obj_idx, instance);`);
            else
                scopeCode.add(`Object_${SystemState.patterns.constructor}(ctx, obj_idx, instance);`);

            this._emitConstructorProperties(klass, scopeCode);
            this._emitClassMethods(klass, scopeCode);
            code.add([
                `void ${klass.name}_${SystemState.patterns.constructor}(duk_context* ctx, duk_idx_t obj_idx, Object* instance) {`,
                scopeCode,
                '}'
            ]);
        });
    }
    private static _emitConstructorCalls(code: CodeBuilder) {
        const classes = getClasses();
        classes.filter(x => !x.isAbstract).forEach(klass => {
            const scopeCode = new CodeBuilder();
            scopeCode.setIndentationSize(SystemState.indentSize);

            this._emitConstructorCallValidation(klass, scopeCode);
            scopeCode.add([
                '',
                `${klass.name}* instance = nullptr;`,
                'duk_idx_t obj_idx = duk_get_top(ctx);',
                'if(obj_idx > 1) {',
                `\tURHO3D_LOGERROR("Invalid Constructor Call for Type ${klass.name}.");`,
                '\treturn DUK_RET_TYPE_ERROR;',
                '}',
                'duk_push_this(ctx);',
                '// If has 1 argument, they must need to be a pointer to object',
                'if(obj_idx == 0) {',
                `\tinstance = new ${klass.name}(JavaScriptBindings::GetContext());`,
                '} else {',
                `\tduk_require_pointer(ctx, 0);`,
                `\tinstance = static_cast<${klass.name}*>(duk_get_pointer_default(ctx, 0, nullptr));`,
                '}',
                '',
                'if(!instance) {',
                `\tURHO3D_LOGERROR("Instance is null for Constructor ${klass.name}");`,
                '\treturn DUK_RET_ERROR;',
                '}',
                'instance->AddRef();',
                `${klass.name}_${SystemState.patterns.constructor}(ctx, obj_idx, instance);`,
                '// Setup Destructor',
                'Object_Finalizer(ctx, obj_idx, instance);',
                '// Return this element',
                'duk_dup(ctx, obj_idx);',
                'return 1;'
            ]);

            code.add([
                'duk_push_c_function(ctx, [](duk_context* ctx) {',
                scopeCode,
                '}, DUK_VARARGS);',
            ]);
            this._emitStaticClassMethods(klass, code);
            code.add(`duk_put_global_string(ctx, "${klass.name}");`);
        });
    }
    private static _emitConstructorProperties(klass: IClassToken, code: CodeBuilder) {
        klass.properties.forEach(prop => {
            const propName = CodeUtils.getPropName(prop.getName ?? prop.setName);
            code.add([
                `// ${klass.name} - ${propName} property.`,
                `duk_push_string(ctx, "${propName}");`
            ]);

            const propFlags: string[] = ['DUK_DEFPROP_HAVE_ENUMERABLE'];
            if (prop.getName) {
                const scopeCode = new CodeBuilder();
                scopeCode.setIndentationSize(SystemState.indentSize);

                this._emitInstance(klass, scopeCode);
                this._emitReturnVar(prop.type, scopeCode);
                scopeCode.add(`result = instance->${prop.getName}();`);
                this._emitReturn(prop.type, scopeCode);

                code.add([
                    'duk_push_c_function(ctx, [](duk_context* ctx) {',
                    scopeCode,
                    '}, 0);'
                ]);

                propFlags.push('DUK_DEFPROP_HAVE_GETTER');
            }
            if (prop.setName) {
                const scopeCode = new CodeBuilder();
                scopeCode.setIndentationSize(SystemState.indentSize);

                this._emitInstance(klass, scopeCode);
                this._emitArgsValidation([prop.type], scopeCode);
                this._emitArgs([prop.type], scopeCode);

                scopeCode.add([
                    '// setter call',
                    `instance->${prop.setName}(arg0);`,
                    'return 0;'
                ]);

                code.add([
                    'duk_push_c_function(ctx, [](duk_context* ctx) {',
                    scopeCode,
                    '}, 1);'
                ]);

                propFlags.push('DUK_DEFPROP_HAVE_SETTER');
            }

            code.add(`duk_def_prop(ctx, obj_idx, ${propFlags.join(' | ')});`);
        });
    }
    private static _emitConstructorCallValidation(type: ITypeToken, code: CodeBuilder) {
        code.add([
            'if (!duk_is_constructor_call(ctx)) {',
            `\tURHO3D_LOGERROR("Invalid Constructor Call. Must call ${type.name} with 'new' keyword.");`,
            '\treturn DUK_RET_TYPE_ERROR;',
            '}',
        ]);
    }

    private static _emitClassMethods(klass: IClassToken, code: CodeBuilder) {
        klass.methods.forEach(methodDef => {
            code.add(`// Setup ${klass.name}::${methodDef.name}(${methodDef.arguments.map(x => x.name).join(', ')})`);
            const scopeCode = new CodeBuilder();
            scopeCode.setIndentationSize(SystemState.indentSize);

            this._emitInstance(klass, scopeCode);
            this._emitArgsValidation(methodDef.arguments, scopeCode);
            this._emitArgs(methodDef.arguments, scopeCode);

            this._emitReturnVar(methodDef.returnType, scopeCode);

            const argsCode = methodDef.arguments.map((_, idx) => `arg${idx}`).join(', ');
            const functionCall = `instance->${methodDef.name}(${argsCode});`;

            scopeCode.add(`${methodDef.returnType ? 'result = ' : ''}${functionCall}`);

            this._emitReturn(methodDef.returnType, scopeCode);
            code.add([
                'duk_push_c_function(ctx, [](duk_context* ctx) {',
                scopeCode,
                `}, ${methodDef.arguments.length});`,
                `duk_put_prop_string(ctx, obj_idx, "${CodeUtils.normalizeName(methodDef.name)}");`
            ]);
        });
    }
    private static _emitStaticClassMethods(klass: IClassToken, code: CodeBuilder) {
        klass.staticMethods.forEach(methodDef => {
            code.add(`// Setup static - ${klass.name}::${methodDef.name}(${methodDef.arguments.map(x => x.name).join(', ')})`);

            const scopeCode = new CodeBuilder();
            scopeCode.setIndentationSize(SystemState.indentSize);

            this._emitArgsValidation(methodDef.arguments, scopeCode);
            this._emitArgs(methodDef.arguments, scopeCode);
            this._emitReturnVar(methodDef.returnType, scopeCode);

            const args = methodDef.arguments.map((_, idx) => `arg${idx}`).join(', ');
            const funcCall = `${klass.name}::${methodDef.name}(${args});`;
            if (methodDef.returnType)
                scopeCode.add(`result = ${funcCall}`);
            else
                scopeCode.add(funcCall);

            this._emitReturn(methodDef.returnType, scopeCode);

            code.add([
                'duk_push_c_function(ctx, [](duk_context* ctx) {',
                scopeCode,
                `}, ${methodDef.arguments.length});`,
                `duk_put_prop_string(ctx, -2, "${methodDef.name}");`
            ]);
        });
    }
    private static _emitPrimitiveMethods(primitive: IPrimitiveToken, code: CodeBuilder) {
        code.add(`// setup ${primitive.name} methods.`);
        primitive.methods.forEach(methodDef => {
            const scopeCode = new CodeBuilder();
            scopeCode.setIndentationSize(SystemState.indentSize);

            this._emitPrimitiveInstance(primitive, scopeCode);
            this._emitArgsValidation(methodDef.arguments, scopeCode);
            this._emitArgs(methodDef.arguments, scopeCode);

            this._emitReturnVar(methodDef.returnType, scopeCode);

            const argsCode = methodDef.arguments.map((_, idx) => `arg${idx}`).join(', ');
            const functionCall = `instance.${methodDef.name}(${argsCode});`;

            scopeCode.add(`${methodDef.returnType ? 'result = ' : ''}${functionCall}`);

            this._emitReturn(methodDef.returnType, scopeCode);

            code.add([
                'duk_push_c_function(ctx, [](duk_context* ctx) {',
                scopeCode,
                `}, ${methodDef.arguments.length});`,
                `duk_put_prop_string(ctx, obj_idx, "${CodeUtils.normalizeName(methodDef.name)}");`
            ]);
        });
    }


    private static _emitPrimitiveSignatures(code: CodeBuilder) {
        code.add('// Primitive Calls');
        getPrimitives().filter(x => !x.builtin).forEach(primitive => {
            code.add(`void ${primitive.name}_${SystemState.patterns.constructor}(duk_context* ctx, duk_idx_t obj_idx, const ${primitive.name}& instance);`);
            code.add(`${primitive.name} ${primitive.name}_${SystemState.patterns.resolver}(duk_context* ctx, duk_idx_t obj_idx);`);
            code.add(`void ${primitive.name}_${SystemState.patterns.require}(duk_context* ctx, duk_idx_t obj_idx);`);
        });
    }
    private static _emitPrimitivesCall(code: CodeBuilder) {
        code.add('// Primitive Calls');

        getPrimitives().filter(x => !x.builtin).forEach(primitive => {
            const ctorCall = () => {
                const scopeCode = new CodeBuilder();
                scopeCode.setIndentationSize(SystemState.indentSize);

                scopeCode.add(`Setup_Primitive(ctx, obj_idx, "${primitive.name}");`);
                // Emit Primitive Variables
                const keys = Object.keys(primitive.variables);
                keys.forEach((key) => {
                    const returnScope = new CodeBuilder();
                    returnScope.setIndentationSize(SystemState.indentSize);

                    const vary = primitive.variables[key];
                    const varType = getTypeToken(vary.type);

                    this._emitReturnVar(varType, returnScope);
                    returnScope.add(`result = instance.${vary.nativeName};`);
                    this._emitReturn(varType, returnScope, false);

                    returnScope.add(`duk_put_prop_string(ctx, obj_idx, "${key}");`);

                    scopeCode.add([
                        '{',
                        returnScope,
                        '}'
                    ]);
                });
                // Define Operators
                const defineOperator = (operatorName: string, operatorSignal: string, typeName: string) => {
                    const opScope = new CodeBuilder();
                    opScope.setIndentationSize(SystemState.indentSize);

                    opScope.add([
                        'duk_push_this(ctx);',
                        `${primitive.name} value = ${primitive.name}_${SystemState.patterns.resolver}(ctx, 0);`,
                        `${primitive.name} instance = ${primitive.name}_${SystemState.patterns.resolver}(ctx, 1);`,
                        '',
                    ]);

                    const retType = getTypeToken(typeName);
                    this._emitReturnVar(retType, opScope);
                    opScope.add(`result = instance ${operatorSignal} value;`);

                    this._emitReturn(retType, opScope);

                    scopeCode.add([
                        'duk_push_c_function(ctx, [](duk_context* ctx) {',
                        opScope,
                        '}, 1);',
                        `duk_put_prop_string(ctx, obj_idx, "${operatorName}");`
                    ]);
                };

                if (primitive.operatorFlags & OperatorFlags.add)
                    defineOperator("add", "+", primitive.name);
                if (primitive.operatorFlags & OperatorFlags.sub)
                    defineOperator("sub", "-", primitive.name);
                if (primitive.operatorFlags & OperatorFlags.mul)
                    defineOperator("mul", "*", primitive.name);
                if (primitive.operatorFlags & OperatorFlags.div)
                    defineOperator("div", "/", primitive.name);
                if (primitive.operatorFlags & OperatorFlags.equal)
                    defineOperator("equals", "==", 'bool');

                this._emitPrimitiveMethods(primitive, scopeCode);

                code.add([
                    `void ${primitive.name}_${SystemState.patterns.constructor}(duk_context* ctx, duk_idx_t obj_idx, const ${primitive.name}& instance) {`,
                    scopeCode,
                    '}'
                ]);
            };
            const validationCall = () => {
                const scopeCode = new CodeBuilder();
                scopeCode.setIndentationSize(SystemState.indentSize);

                const keys = Object.keys(primitive.variables);
                keys.forEach((key, idx) => {
                    const vary = primitive.variables[key];
                    const type = getTypeToken(vary.type);

                    scopeCode.add(`duk_get_prop_string(ctx, obj_idx, "${key}");`);
                    this._emitTypeValidation(type, "-1", scopeCode);
                    scopeCode.add('duk_pop(ctx);');

                    if (idx < keys.length - 1)
                        scopeCode.add('');
                });

                code.add([
                    `void ${primitive.name}_${SystemState.patterns.require}(duk_context* ctx, duk_idx_t obj_idx) {`,
                    scopeCode,
                    '}'
                ]);
            };
            const resolveCall = () => {
                const scopeCode = new CodeBuilder();
                scopeCode.setIndentationSize(SystemState.indentSize);
                scopeCode.add(`${primitive.name} output;`);

                const keys = Object.keys(primitive.variables);

                keys.forEach((key, idx) => {
                    const vary = primitive.variables[key];
                    const type = getTypeToken(vary.type);

                    const argScope = new CodeBuilder();
                    argScope.setIndentationSize(SystemState.indentSize);

                    argScope.add([
                        `output.${vary.nativeName} = arg0;`,
                        'duk_pop(ctx);'
                    ]);
                    scopeCode.add(`duk_get_prop_string(ctx, obj_idx, "${key}");`);
                    this._emitValueRead(type, `arg${idx}`, '-1', scopeCode);
                    scopeCode.add([
                        `output.${vary.nativeName} = arg${idx};`,
                        'duk_pop(ctx);',
                    ]);
                    if (idx < keys.length - 1)
                        scopeCode.add('');
                });

                //this._emitArgs(varTypes, scopeCode, 'obj_idx + ');
                // keys.forEach((key, idx) => {
                //     const vary = primitive.variables[key];

                //     scopeCode.add(`output.${vary.nativeName} = arg${idx};`);
                // });

                scopeCode.add([
                    '',
                    'return output;'
                ]);
                code.add([
                    `${primitive.name} ${primitive.name}_${SystemState.patterns.resolver}(duk_context* ctx, duk_idx_t obj_idx) {`,
                    scopeCode,
                    '}'
                ]);
            };

            ctorCall();
            validationCall();
            resolveCall();
        });
    }
    private static _emitPrimitives(code: CodeBuilder) {
        code.add([
            '',
            '//setup primitives'
        ])

        getPrimitives().filter(x => !x.builtin).forEach(primitive => {
            const scopeCode = new CodeBuilder();
            scopeCode.setIndentationSize(SystemState.indentSize);

            const variables = Object.values(primitive.variables);
            const varTypes = variables.map(x => getTypeToken(x.type));

            this._emitConstructorCallValidation(primitive, scopeCode);
            scopeCode.add([
                `duk_idx_t argc = duk_get_top(ctx);`,
                `${primitive.name} instance;`
            ]);

            // Emit Variable Arguments Collection and Validation
            variables.forEach((vary, idx) => {
                const validationScope = new CodeBuilder();
                validationScope.setIndentationSize(SystemState.indentSize);

                const varType = [varTypes[idx]];
                this._emitArgsValidation(varType, validationScope);
                this._emitArgs(varType, validationScope);
                validationScope.add(`instance.${vary.nativeName} = arg0;`);
                validationScope.add('duk_remove(ctx, 0);');

                scopeCode.add([
                    `if(argc > ${idx}) {`,
                    validationScope,
                    '}'
                ]);
            });

            // Emit Variable properties inside object
            scopeCode.add([
                'duk_idx_t __push_idx = duk_get_top(ctx);',
                'duk_push_this(ctx);',
                `${primitive.name}_${SystemState.patterns.constructor}(ctx, __push_idx, instance);`,
                '',
                'return 1;'
            ]);

            code.add([
                `// setup primitive ${primitive.name}`,
                'duk_push_c_function(ctx, [](duk_context* ctx) {',
                scopeCode,
                '}, DUK_VARARGS);',
            ]);

            // Emit Static Variables
            const staticKeys = Object.keys(primitive.staticVariables);
            staticKeys.forEach(key => {
                const staticScope = new CodeBuilder();
                staticScope.setIndentationSize(SystemState.indentSize);

                const staticVar = primitive.staticVariables[key];
                staticScope.add([
                    `duk_push_object(ctx);`,
                    `${primitive.name}_${SystemState.patterns.constructor}(ctx, 0, ${primitive.name}::${staticVar});`,
                    'return 1;'
                ]);

                code.add([
                    `duk_push_string(ctx, "${key}");`,
                    'duk_push_c_function(ctx, [](duk_context* ctx) {',
                    staticScope,
                    '}, 0);',
                    `duk_def_prop(ctx, -3, DUK_DEFPROP_HAVE_GETTER | DUK_DEFPROP_HAVE_ENUMERABLE);`
                ]);
            });

            code.add(`duk_put_global_string(ctx, "${primitive.name}");`);
        });

        code.add([
            '// end setup primitives',
            ''
        ])
    }
    private static _emitPrimitiveInstance(primitive: IPrimitiveToken, code: CodeBuilder) {
        code.add([
            `duk_idx_t __push_idx = duk_get_top(ctx);`,
            `duk_push_this(ctx);`,
            `${primitive.name} instance = ${primitive.name}_${SystemState.patterns.resolver}(ctx, __push_idx);`,
            'duk_pop(ctx);'
        ]);
    }

    private static _emitEnums(code: CodeBuilder) {
        const enums = getEnums();
        code.add([
            '',
            '// Enumerators'
        ]);
        enums.forEach(enumerator => {
            code.add([
                `// setup enum ${enumerator.name}`,
                'duk_push_object(ctx);',
            ]);
            enumerator.values.forEach(entry => {
                if (enumerator.enumType == 'string')
                    code.add(`duk_push_string(ctx, "${entry.value}");`);
                else
                    code.add(`duk_push_int(ctx, ${entry.value});`);
                code.add(`duk_put_prop_string(ctx, -2, "${entry.key}");`);
            });
            code.add([
                'duk_seal(ctx, -1);',
                `duk_put_global_string(ctx, "${enumerator.name}");`
            ]);
        });
        code.add([
            '// End Enumerators',
            '',
        ]);
    }

    private static _emitInstance(instanceType: ITypeToken, code: CodeBuilder) {
        code.add([
            '// Acquire Current Instance',
            'duk_idx_t obj_idx = duk_get_top(ctx);',
            'duk_push_this(ctx);',
            `${instanceType.name}* instance = static_cast<${instanceType.name}*>(get_object(ctx, -1));`,
            'duk_pop(ctx);',
        ]);
    }
    private static _emitArgsValidation(argTypes: ITypeToken[], code: CodeBuilder) {
        if (argTypes.length > 0)
            code.add('// Validate Arguments');
        argTypes.forEach((argType, idx) => {
            this._emitTypeValidation(argType, idx.toString(), code);
        });
    }

    private static _emitTypeValidation(type: ITypeToken, accessor: string, code: CodeBuilder) {
        if (type.type == 'primitive') {
            switch (type.name) {
                case 'string':
                    code.add(`duk_require_string(ctx, ${accessor});`);
                    break;
                case 'StringHash':
                    code.add(`require_string_hash(ctx, ${accessor});`);
                    break;
                case 'bool':
                case 'boolean':
                    code.add(`duk_require_boolean(ctx, ${accessor});`);
                    break;
                case 'float':
                case 'double':
                    code.add(`duk_require_number(ctx, ${accessor});`);
                    break;
                case 'int':
                    code.add(`duk_require_int(ctx, ${accessor});`);
                    break;
                case 'unsigned':
                case 'uint':
                    code.add(`duk_require_uint(ctx, ${accessor});`);
                    break;
                case 'void*':
                case 'Object':
                    code.add(`duk_require_pointer(ctx, ${accessor});`);
                    break;
                case 'function':
                    code.add(`duk_require_function(ctx, ${accessor});`);
                    break;
                default:
                    code.add(`${type.name}_${SystemState.patterns.require}(ctx, ${accessor});`);
                    break;
            }
        }
        else if (type.type == 'class') {
            code.add(`require_object(ctx, ${accessor}, ${type.name}::GetTypeStatic());`);
        }
        else if (type.type == 'enum') {
            const enumType = type as IEnumeratorToken;
            if (enumType.enumType == 'number')
                code.add(`duk_require_int(ctx, ${accessor});`);
            else
                code.add(`duk_require_string(ctx, ${accessor});`);
        }
        else {
            throw 'unsupported argument type for validation: ' + type.name;
        }
    }

    private static _emitArgs(argTypes: ITypeToken[], code: CodeBuilder) {
        if (argTypes.length > 0)
            code.add('// Setup Arguments');
        argTypes.forEach((type, idx) => {
            this._emitValueRead(type, `arg${idx}`, idx.toString(), code);
        });
    }

    private static _emitValueRead(type: ITypeToken, varName: string, accessor: string, code: CodeBuilder) {
        if (type.type == 'primitive') {
            switch (type.name) {
                case 'string':
                    code.add(`const char* ${varName} = duk_get_string_default(ctx, ${accessor}, "");`)
                    break;
                case 'StringHash':
                    code.add(`StringHash ${varName} = get_string_hash(ctx, ${accessor});`);
                    break;
                case 'bool':
                case 'boolean':
                    code.add(`bool ${varName} = duk_get_boolean_default(ctx, ${accessor}, false);`);
                    break;
                case 'float':
                    code.add(`float ${varName} = (float)duk_get_number_default(ctx, ${accessor}, 0.0);`);
                    break;
                case 'double':
                    code.add(`double ${varName} = duk_get_number_default(ctx, ${accessor}, 0.0);`);
                    break;
                case 'int':
                    code.add(`int ${varName} = duk_get_int_default(ctx, ${accessor}, 0);`);
                    break;
                case 'uint':
                case 'unsigned':
                    code.add(`unsigned ${varName} = duk_get_uint_default(ctx, ${accessor}, 0u);`);
                    break;
                case 'void*':
                    code.add(`void* ${varName} = duk_get_pointer_default(ctx, ${accessor}, nullptr);`);
                    break;
                case 'Object':
                    code.add(`Object* ${varName} = get_object(ctx, ${accessor});`);
                    break;
                case 'function':
                    code.add(`duk_idx_t ${varName} = ${accessor};`);
                    break;
                default:
                    code.add(`${type.name} ${varName}= ${type.name}_${SystemState.patterns.resolver}(ctx, ${accessor});`);
                    break;
            }
        }
        else if (type.type == 'enum') {
            const enumType = type as IEnumeratorToken;
            if (enumType.enumType == 'number')
                code.add(`${enumType.name} ${varName} = (${enumType.name})duk_get_int(ctx, ${accessor});`);
            else
                code.add(`const char* ${varName} = duk_get_string(ctx, ${accessor});`);
        }
        else if (type.type == 'class') {
            code.add(`${type.name}* ${varName} = static_cast<${type.name}*>(JavaScriptBindings::GetObjectInstance(ctx, ${accessor}, ${type.name}::GetTypeStatic()));`);
        }
        else if (type.type == 'list') {
            const listType = type as IListToken;
            let listTypeName = listType.target.name;
            // Append asterisk if is Object or class
            if ((listType.target.type == 'primitive' && listTypeName == 'Object')
                || listType.target.type == 'class')
                listTypeName += '*';

            const arrReadCode = new CodeBuilder();
            arrReadCode.setIndentationSize(SystemState.indentSize);
            this._emitValueRead(listType.target, `${varName}_result`, '-1', arrReadCode);

            const scopeRead = new CodeBuilder();
            scopeRead.setIndentationSize(SystemState.indentSize);
            scopeRead.add([
                `// read array of ${varName}`,
                `duk_size_t ${varName}_length = duk_get_len(ctx, ${accessor});`,
                `${varName}.resize(${varName}_length);`,
                `for(duk_uarridx_t i = 0; i < ${varName}_length; ++i) {`,
                `\tduk_get_prop_index(ctx, ${accessor}, i);`,
                scopeRead,
                `${varName}[i] = ${varName}_result;`,
                'duk_pop(ctx);',
                '}'
            ]);
            code.add([
                `ea::vector<${listTypeName}> ${varName};`,
                '{',
                scopeRead,
                '}',
                `duk_size_t ${varName}_argc = duk_get_len(ctx, ${accessor});`
            ]);

        }
        else {
            throw `unsupported argument type: ${type.name}`;
        }
    }
    private static _emitValueWrite(type: ITypeToken, accessor: string, code: CodeBuilder) {
        if (type.type == 'primitive') {
            if (type.name == 'function')
                throw 'function cannot be used as write value';
            code.add(`push_variant(ctx, Variant(${accessor}));`);
        }
        else if (type.type == 'class' || type.type == 'weak_ptr' || type.type == 'shared_ptr') {
            if (type.type === 'weak_ptr')
                throw 'not implemented weak ptr value write.';
            else
                code.add(`push_object(ctx, ${accessor});`);
        }
        else if (type.type == 'enum') {
            const enumType = type as IEnumeratorToken;
            if (enumType.enumType == 'number')
                code.add(`duk_push_int(ctx, ${accessor});`);
            else
                code.add(`duk_push_string(ctx, ${accessor});`);
        }
        else if (type.type == 'list') {
            const listType = type as IListToken;
            const scopeLoopCode = new CodeBuilder();
            scopeLoopCode.setIndentationSize(SystemState.indentSize);

            const arrayIdxName = `${accessor}_arr_idx`;
            const arrayItemVarName = `${accessor}_arr_item`;

            scopeLoopCode.add(`${CodeUtils.getTypeVarDeclaration(listType.target)} ${arrayItemVarName}= ${accessor}.at(i);`);
            this._emitValueWrite(listType.target, arrayItemVarName, scopeLoopCode);
            scopeLoopCode.add(`duk_put_prop_index(ctx, ${arrayIdxName}, i);`);

            code.add([
                `duk_idx_t ${arrayIdxName} = duk_get_top(ctx);`,
                'duk_push_array(ctx);',
                `for(duk_uarridx_t i = 0; i < ${accessor}.size(); ++i) {`,
                scopeLoopCode,
                '}'
            ]);
        }
        else {
            throw 'not implemented value write for type: ' + type.type;
        }
    }

    private static _emitReturnVar(type: ITypeToken, code: CodeBuilder) {
        if (!type)
            return;
        code.add('// Setup return var');
        if (type.type == 'primitive') {
            switch (type.name) {
                case 'string':
                    code.add('ea::string result;');
                    break;
                case 'StringHash':
                    code.add('StringHash result;');
                    break;
                case 'bool':
                    code.add('bool result = false;');
                    break;
                case 'float':
                    code.add('float result = 0.0f;');
                    break;
                case 'double':
                    code.add('double result = 0.0;');
                    break;
                case 'int':
                    code.add('int result = 0;')
                    break;
                case 'unsigned':
                case 'uint':
                    code.add('unsigned result = 0u;');
                    break;
                case 'void*':
                    code.add('void* result = nullptr;')
                    break;
                case 'Object':
                    code.add('Object* result = nullptr;')
                    break;
                default:
                    code.add(`${type.name} result;`);
                    break;
            }
        } else if (type.type == 'class') {
            code.add(`${CodeUtils.getTypeVarDeclaration(type)} result = nullptr;`);
        } else if (type.type == 'enum' || type.type == 'list' || type.type == 'weak_ptr' || type.type == 'shared_ptr') {
            code.add(`${CodeUtils.getTypeVarDeclaration(type)} result;`);
        } else {
            throw 'not implemented return type: ' + type.type;
        }
    }
    private static _emitReturn(type: ITypeToken, code: CodeBuilder, appendReturn: boolean = true) {
        if (!type) {
            if (appendReturn)
                code.add('return 0;');
            return;
        }
        code.add('// Setup return');
        this._emitValueWrite(type, 'result', code);
        if (appendReturn)
            code.add('return 1;');
    }
}