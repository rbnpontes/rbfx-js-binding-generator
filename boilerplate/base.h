// # Generated Header File
#pragma once
#include <duktape/duktape.h>
#include <EASTL/functional.h>

#include "../JavaScript/JavaScriptSystem.h"
#include "../Math/StringHash.h"
#include "../IO/Log.h"
#include "../JavaScript/JavaScriptEventHandle.h"
#include <EASTL/queue.h>


namespace Urho3D {
    typedef duk_ret_t(*duk_ctor_function)(duk_context* ctx, duk_idx_t obj_idx, Object* instance);
    class JavaScriptBindings {
        public:
            static void Setup(Context* rbfxCtx);
            static void RunCode(const ea::string& code);
            static duk_context* GetJSCtx() { return dukCtx_; }
            static Context* GetContext() { return rbfxCtx_; }
            static void RequireType(duk_context* ctx, duk_idx_t obj_idx, StringHash typeName);
            static Object* GetObjectInstance(duk_context* ctx, duk_idx_t obj_idx, StringHash typeName);
            static Object* GetObjectInstance(duk_context* ctx, duk_idx_t obj_idx);
            static void Destroy();
        private:
            static void HandleFatalError(void* udata, const char* msg);

            static duk_context* dukCtx_;
            static Context* rbfxCtx_;
    };

    void Call_Event(unsigned callerId, StringHash eventType, const VariantMap& eventArgs);
    void Register_Event(duk_context* ctx, duk_idx_t callback_idx, StringHash eventType);
    void Remove_Event(duk_context* ctx, duk_idx_t callback_idx, StringHash eventType);

    void Console_Print(duk_context* ctx, unsigned argc, LogLevel logLvl);
    void Wrap_Object(duk_context* ctx, Object* instance);
    void Setup_Primitive(duk_context* ctx, duk_idx_t obj_idx, const char* primitiveTypeName);
    duk_ret_t Object_Ctor(duk_context* ctx, duk_idx_t obj_idx, Object* instance);
    duk_ret_t Object_Finalizer(duk_context* ctx, duk_idx_t obj_idx, Object* instance);

    void Push_Variant(duk_context* ctx, const Variant& vary);
}
