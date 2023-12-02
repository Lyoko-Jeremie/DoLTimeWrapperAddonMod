
# DoLTimeWrapperAddon

---

use the API:

```typescript

// hook the `window.Time`
window.addonDoLTimeWrapperAddon.addTimeHook({
    key: 'fieldOrFunctionName',
    pos: 'before',
    type: 'call',
    hook: (...args: any[]) => {
        // do something
    }
});


// hook the `localFunctionName`
window.addonDoLTimeWrapperAddon.addFunctionHook({
    key: 'localFunctionName',
    pos: 'before',
    type: 'call',
    hook: (...args: any[]) => {
        // do something
    }
});
```

the `TimeHookType` is :
```typescript
export interface TimeHookType {
    key: string;        // field or function name
    pos: 'before' | 'after';    // this hook will be called before or after the original function call / field get/set
    type: 'call' | 'get' | 'set';   // is a function call OR get a field OR set a field
    // the callback function will be called when hook trigger
    //  1. if is a 'call' type:
    //      1.1 if 'before', the `args` will be the original function's arguments
    //      1.2 if 'after', the `args` will be the original function's return value
    //  2. if is a 'get' type:
    //      2.1 if 'before', the `args` will be []
    //      2.2 if 'after', the `args` will be the value
    //  3. if is a 'set' type:
    //      3.1 if 'before', the `args` will be the new value
    //      3.2 if 'after', the `args` will be the new value
    //  4. if a function 'get' from the `window.Time`, it will be call as follow order:
    //      1) trigger 'get' 'before' functionName with []
    //      2) trigger 'get' 'after' functionName with the original function ref
    //      2) trigger 'call' 'before' with the original function's arguments
    //      2) trigger 'call' 'after' with the original function's return value
    hook: (...args: any[]) => void;
}
```
