import CodeBuilder from "../code-builder";
import { addHeaders, addMethod, addObject, makeDynamic, setMethodArgs, setMethodCode, setMethodReturn, sharedPtr, useGlobal } from "../metadata";

type LogLevel ='LOG_DEBUG'| 'LOG_INFO' | 'LOG_WARNING' | 'LOG_ERROR';
function emitLogCode(logLvl : LogLevel) {
    const code = new CodeBuilder();
    code.add(`Console_Print(ctx, argc, ${logLvl});`);
    return code;
}
export default function defineGlobals() {
    addHeaders([
        '../Core/Context.h',
        '../IO/Log.h'
    ]);

    useGlobal(()=> {
        addObject(()=> {
            const logMethods = ['log', 'debug', 'warn', 'error'];
            const logLevels : LogLevel[] = ['LOG_DEBUG', 'LOG_DEBUG', 'LOG_WARNING', 'LOG_ERROR'];

            logMethods.forEach((logMethod, idx) => {
                addMethod(()=> {
                    makeDynamic();
                    setMethodCode(emitLogCode(logLevels[idx]));
                }, logMethod);
            });
        }, 'console');
        addObject(()=> {
            addMethod(()=> {
                setMethodArgs(['StringHash']);
                setMethodReturn(sharedPtr('Object'));
                setMethodCode('result = JavaScriptBindings::GetContext()->CreateObject(arg0);')
            }, 'createObject');
            addMethod(()=> {
                setMethodArgs(['function', 'string', 'string']);
                setMethodCode('Call_RegisterComponent(ctx, arg0, arg1, arg2);');
            }, 'registerComponent');
        }, 'Reflection');
        addMethod(()=> {
            setMethodArgs(['StringHash']);
            setMethodCode('result = JavaScriptBindings::GetContext()->GetSubsystem(arg0);');
            setMethodReturn('Object');
        }, 'getSubsystem');
        addMethod(()=> {
            setMethodArgs(['StringHash', 'function']);
            setMethodCode('Register_Event(ctx, arg1, arg0);');
        }, 'subscribeToEvent');
        addMethod(()=> {
            setMethodArgs(['StringHash', 'function']);
            setMethodCode('Remove_Event(ctx, arg1, arg0);');
        }, 'unsubscribeFromEvent');
        addMethod(()=> {
            setMethodArgs(['string']);
            setMethodReturn('StringHash');
            setMethodCode('result = StringHash(arg0);');
        }, 'toHash');
    });
}