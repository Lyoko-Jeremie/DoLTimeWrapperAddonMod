import type {SC2DataManager} from "../../../dist-BeforeSC2/SC2DataManager";
import type {ModUtils} from "../../../dist-BeforeSC2/Utils";
import type {LogWrapper} from "../../../dist-BeforeSC2/ModLoadController";
import {OldTimeFunctionRefTypeNameList} from "./OldTimeFunctionHook";
import {clone} from 'lodash';

export class TimeProxyHandler implements ProxyHandler<any> {
    constructor(
        public parent: TimeProxyManager,
    ) {
    }

    get(target: any, p: string | symbol, receiver: any): any {
        this.parent.runCallback(p.toString(), 'before', 'get', [target, p, undefined]);
        let value = Reflect.get(target, p, receiver);
        this.parent.runCallback(p.toString(), 'after', 'get', [target, p, value]);
        if (typeof value == 'function') {
            return (...argArray: any[]) => {
                this.parent.runCallback(value.name, 'before', 'call', argArray);
                const R = Reflect.apply(value, target, argArray);
                this.parent.runCallback(value.name, 'after', 'call', [R]);
                return R;
            };
        } else {
            return value;
        }
    }

    set(target: any, p: string | symbol, newValue: any, receiver: any): boolean {
        this.parent.runCallback(p.toString(), 'before', 'set', [target, p, newValue]);
        const ok = Reflect.set(target, p, newValue, receiver);
        this.parent.runCallback(p.toString(), 'after', 'set', [target, p, newValue]);
        return ok;
    }

    // apply(target: any, thisArg: any, argArray: any[]): any {
    //     this.parent.runCallback(target.name, 'before', 'call', argArray);
    //     const R = Reflect.apply(target, thisArg, argArray);
    //     this.parent.runCallback(target.name, 'after', 'call', [R]);
    //     return R;
    // }

}

export interface TimeHookType {
    key: string;
    pos: 'before' | 'after';
    type: 'call' | 'get' | 'set';
    hook: (...args: any[]) => void;
}

export interface InfinityLoopStackType {
    key: string;
    pos: 'before' | 'after';
    type: 'call' | 'get' | 'set';
    args: any[];
}

export class InfinityLoopChecker {
    constructor(
        protected logger: LogWrapper,
    ) {
    }

    stack: InfinityLoopStackType[] = [];
    maxStackLengthWarn = 10;
    maxStackLengthError = 30;

    push(p: InfinityLoopStackType) {
        this.stack.push(p);
        // console.log(`[DoLTimeWrapperAddon] InfinityLoopChecker stack push`, clone(this.stack));
        if (this.stack.length > this.maxStackLengthError) {
            console.error(`[DoLTimeWrapperAddon] InfinityLoopChecker stack overflow`, this.stack);
            throw new Error(`[DoLTimeWrapperAddon] InfinityLoopChecker stack overflow`);
            return false;
        } else if (this.stack.length > this.maxStackLengthWarn) {
            console.warn(`[DoLTimeWrapperAddon] InfinityLoopChecker stack overflow`, this.stack);
            return true;
        }
        return true;
    }

    pop(p: InfinityLoopStackType) {
        // check stack balance
        if (
            this.stack.length == 0
            || this.stack[this.stack.length - 1].key !== p.key
            || this.stack[this.stack.length - 1].pos !== p.pos
            || this.stack[this.stack.length - 1].type !== p.type
        ) {
            console.error(`[DoLTimeWrapperAddon] InfinityLoopChecker stack balance error`, this.stack, p);
            throw new Error(`[DoLTimeWrapperAddon] InfinityLoopChecker stack balance error`);
            return false;
        }
        this.stack.pop();
        return true;
    }
}

export class HookManagerCore {
    protected logger: LogWrapper;

    constructor(
        public thisWin: Window,
        public gModUtils: ModUtils,
        public mode: string,
        public infinityLoopChecker: InfinityLoopChecker,
    ) {
        this.logger = this.gModUtils.getLogger();
    }

    callableHook: Map<string, TimeHookType[]> = new Map<string, TimeHookType[]>();

    addCallableHook(key: string, hook: TimeHookType) {
        if (this.mode === 'TimeHookManager' && !OldTimeFunctionRefTypeNameList.includes(key as any)) {
            console.warn(`[DoLTimeWrapperAddon] [${this.mode}] addCallableHook key[${key}] not in OldTimeFunctionRefTypeNameList`);
            this.logger.warn(`[DoLTimeWrapperAddon] [${this.mode}] addCallableHook key[${key}] not in OldTimeFunctionRefTypeNameList`);
        }
        if (!this.callableHook.has(key)) {
            this.callableHook.set(key, []);
        }
        this.callableHook.get(key)!.push(hook);
        console.log(`[DoLTimeWrapperAddon] [${this.mode}] addCallableHook`, [key, hook]);
        this.logger.log(`[DoLTimeWrapperAddon] [${this.mode}] addCallableHook key[${key}] pos[${hook.pos}] type[${hook.type}]`);
    }

    runCallback(key: string, pos: 'before' | 'after', type: 'call' | 'get' | 'set', args: any[]) {
        // when 'call' , the args[0] is the origin function's params list ('before') OR is the function's return value ('after')
        // when 'get' , the args[0] is the origin object, the args[1] is the origin key, the args[2] is the origin value ('after') OR undefined ('before')
        // when 'set' , the args[0] is the origin object, the args[1] is the origin key, the args[2] is the new value

        // console.log(`[DoLTimeWrapperAddon] [${this.mode}] runCallback`, [key, pos, type, args]);
        this.infinityLoopChecker.push({
            key,
            pos,
            type,
            args,
        });
        const hooks = this.callableHook.get(key);
        if (!hooks) {
            this.infinityLoopChecker.pop({
                key,
                pos,
                type,
                args,
            });
            return;
        }
        for (const hook of hooks) {
            if (hook.pos == pos && hook.type == type) {
                try {
                    hook.hook(...args);
                } catch (e: Error | any) {
                    console.error(`[DoLTimeWrapperAddon] [${this.mode}] runCallback error: `, [key, pos, type, [args], e]);
                    this.logger.error(`[DoLTimeWrapperAddon] [${this.mode}] runCallback key[${key}] pos[${pos}] type[${type}]. error: [${e.message ? e.message : e}]`);
                }
            }
        }
        this.infinityLoopChecker.pop({
            key,
            pos,
            type,
            args,
        });
    }

}

export class TimeProxyManager extends HookManagerCore {
    constructor(
        public thisWin: Window,
        public gModUtils: ModUtils,
        public gSC2DataManager: SC2DataManager,
        public infinityLoopChecker: InfinityLoopChecker,
    ) {
        super(
            thisWin,
            gModUtils,
            'TimeProxyManager',
            infinityLoopChecker
        );
    }

    originTime?: any;
    timeProxyHandler?: TimeProxyHandler;
    revoke?: () => void;

    init() {
        this.originTime = this.thisWin.Time;
        this.timeProxyHandler = new TimeProxyHandler(this);
        const rP = Proxy.revocable(this.thisWin.Time, this.timeProxyHandler);
        this.thisWin.Time = rP.proxy;
        this.revoke = rP.revoke;
    }

}
