
# DoLTimeWrapperAddon

---

this mod provide addon mode `DoLTimeWrapperAddon`: `DoLTimeWrapperAddon` and a js API .

detail to see follow .

### **⚠ WRANGLING: this mod maybe case infinity loop in runtime , so please use it carefully.**

---

use the params:

```json lines
{
  "addonPlugin": [
    {
      "modName": "DoLTimeWrapperAddon",
      "addonName": "DoLTimeWrapperAddon",
      "modVersion": "^1.0.0",
      "params": {
        "hooks": [
          {
            "level": "TimeObject",
            "key": "pass",
            "pos": "after",
            "type": "call",
            "js": "args.append([''])"
          },
          {
            "level": "TimeObject",
            "key": "pass",
            "pos": "before",
            "type": "call",
            "js": "V.xxx=aaa;"
          },
          {
            "level": "LocalFunction",
            "key": "dayPassed",
            "pos": "before",
            "type": "call",
            "wiki": "<<xxx>>"
          }
        ]
      }
    }
  ]
}
```

the `params.hooks` is array of :
```typescript
export interface DoLTimeWrapperParams {
    level: 'LocalFunction' | 'TimeObject';
    key: string;
    pos: 'before' | 'after';
    type: 'call' | 'get' | 'set';
    // the js code will called by `new Function('args', p.js)(args)` , the `args` will be `TimeHookType.hook(...args)`, see follow
    js?: string;
    wiki?: string;
}
```

---

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
    },
    change: false,   // if true, the hook() function return value will be the new value of the input of function (means it will change the origin value)
                    // this can be used to modify the origin value, such as origin function params or return, or object get result or set result.
});


// hook the `localFunctionName`
window.addonDoLTimeWrapperAddon.addFunctionHook({
    key: 'localFunctionName',
    pos: 'before',
    type: 'call',
    hook: (...args: any[]) => {
        // do something
        const originArgs = args[0];
        // must return the origin params or new modifed params if `change` is true
        // if change is false, the hook function return will be ignore
        return args;
        // return [/* place new args on here if you want modify it */];
    },
    change: false,
});
```

```js
window.addonDoLTimeWrapperAddon.addFunctionHook({
  key: 'passTime',
  pos: 'before',
  type: 'call',
  hook: (...args) => {
    const originParams = args[0];
    // this is a example to modify the origin params
    return [originParams + 1];
  },
  change: true,
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
    //      1.1 if 'before', the args[0] is the origin function's params list
    //      1.2 if 'after', the args[0] is the function's return value
    //  2. if is a 'get' type:
    //      2.1 if 'before', the args[0] is the origin object, the args[1] is the origin key, the args[2] is undefined
    //      2.2 if 'after', the args[0] is the origin object, the args[1] is the origin key, the args[2] is the origin value
    //  3. if is a 'set' type:
    //      3.1 if 'before', the args[0] is the origin object, the args[1] is the origin key, the args[2] is the new value
    //      3.2 if 'after', the args[0] is the origin object, the args[1] is the origin key, the args[2] is the new value
    //  4. if a function 'get' from the `window.Time`, it will be call as follow order:
    //      1) same as 2.1
    //      2) same as 2.2
    //      3) same as 1.1
    //      4) same as 1.2
    hook: (...args: any[]) => void;
    // if true, the hook() function return value will be the new value of the input of function (means it will change the origin value)
    // this can be used to modify the origin value, such as origin function params or return, or object get result or set result.
    // if not set, the `change` is false by default
    change?: boolean;
}
```

---

the `fieldOrFunctionName` can be any field of the `Time` object in game's `time.js`.

the `localFunctionName` is one of:
```typescript
export const OldTimeFunctionRefTypeNameList: (keyof OldTimeFunctionRefType)[] = [
    'yearPassed',
    'weekPassed',
    'dayPassed',
    'hourPassed',
    'minutePassed',
    'noonCheck',
    'dawnCheck',
    'dailyNPCEffects',
    'dailyPlayerEffects',
    'dailyTransformationEffects',
    'dailyLiquidEffects',
    'yearlyEventChecks',
    'moonState',
    'dailySchoolEffects',
    'dailyMasochismSadismEffects',
    'dailyFarmEvents',
    'passWater',
    'passArousalWetness',
    'getArousal',
    'earSlimeDaily',
    'getTimeString',
    
    'passTime',
    'passTimeUntil',
    'advanceToHour',
    'timeAfterXHours',
] as const;
```
