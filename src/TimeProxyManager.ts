import type {SC2DataManager} from "../../../dist-BeforeSC2/SC2DataManager";
import type {ModUtils} from "../../../dist-BeforeSC2/Utils";
import type {LogWrapper} from "../../../dist-BeforeSC2/ModLoadController";

export class TimeProxyHandler implements ProxyHandler<any> {
    constructor(
        public parent: TimeProxyManager,
    ) {
    }

    get(target: any, p: string | symbol, receiver: any): any {
        this.parent.runCallback(p.toString(), 'before', 'get', []);
        let value = Reflect.get(target, p, receiver);
        this.parent.runCallback(p.toString(), 'after', 'get', [value]);
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
        this.parent.runCallback(p.toString(), 'before', 'set', [newValue]);
        const ok = Reflect.set(target, p, newValue, receiver);
        this.parent.runCallback(p.toString(), 'after', 'set', [newValue]);
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

export class HookManagerCore {
    protected logger: LogWrapper;

    constructor(
        public thisWin: Window,
        public gModUtils: ModUtils,
        public mode: string,
    ) {
        this.logger = this.gModUtils.getLogger();
    }

    callableHook: Map<string, TimeHookType[]> = new Map<string, TimeHookType[]>();

    addCallableHook(key: string, hook: TimeHookType) {
        const n = this.callableHook.get(key);
        if (!n) {
            this.callableHook.set(key, [hook]);
            console.log(`[DoLTimeWrapperAddon] [${this.mode}] addCallableHook`, [key, hook]);
            this.logger.log(`[DoLTimeWrapperAddon] [${this.mode}] addCallableHook key[${key}] pos[${hook.pos}] type[${hook.type}]`);
            return;
        }
        n.push(hook);
    }

    runCallback(key: string, pos: 'before' | 'after', type: 'call' | 'get' | 'set', args: any[]) {
        console.log(`[DoLTimeWrapperAddon] [${this.mode}] runCallback`, [key, pos, type, args]);
        const hooks = this.callableHook.get(key);
        if (!hooks) {
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
    }

}

export class TimeProxyManager extends HookManagerCore {
    constructor(
        public thisWin: Window,
        public gModUtils: ModUtils,
        public gSC2DataManager: SC2DataManager,
    ) {
        super(
            thisWin,
            gModUtils,
            'TimeProxyManager',
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
