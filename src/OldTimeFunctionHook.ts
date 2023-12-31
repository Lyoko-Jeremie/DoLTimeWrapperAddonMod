import {HookManagerCore, InfinityLoopChecker, TimeProxyHandler, TimeProxyManager} from "./TimeProxyManager";
import type {SC2DataManager} from "../../../dist-BeforeSC2/SC2DataManager";
import type {ModUtils} from "../../../dist-BeforeSC2/Utils";

export interface OldTimeFunctionRefType {
    yearPassed?: () => DocumentFragment;
    weekPassed?: () => DocumentFragment;
    dayPassed?: () => DocumentFragment;
    hourPassed?: (hours: number) => DocumentFragment;
    minutePassed?: (minutes: number) => DocumentFragment;
    noonCheck?: () => DocumentFragment;
    dawnCheck?: () => DocumentFragment;
    dailyNPCEffects?: () => DocumentFragment;
    dailyPlayerEffects?: () => DocumentFragment;
    dailyTransformationEffects?: () => DocumentFragment;
    dailyLiquidEffects?: () => DocumentFragment;
    yearlyEventChecks?: () => DocumentFragment;
    moonState?: () => DocumentFragment;
    dailySchoolEffects?: () => DocumentFragment;
    dailyMasochismSadismEffects?: () => DocumentFragment;
    dailyFarmEvents?: () => DocumentFragment;
    temperatureHour?: () => void;
    passWater?: (passMinutes: number) => DocumentFragment;
    passArousalWetness?: (passMinutes: number) => DocumentFragment;
    getArousal?: (passMinutes: number) => number;
    earSlimeDaily?: () => void;
}

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
    'temperatureHour',
    'passWater',
    'passArousalWetness',
    'getArousal',
    'earSlimeDaily',
] as const;

export type OldTimeFunctionArgsType = {
    [K in keyof OldTimeFunctionRefType]: OldTimeFunctionRefType[K] extends (...args: infer A) => any ? A : never;
};
export type OldTimeFunctionReturnType = {
    [K in keyof OldTimeFunctionRefType]: OldTimeFunctionRefType[K] extends (...args: any[]) => infer R ? R : never;
};

export type EnsureTuple<T> = T extends void ? [] : (T extends any[] ? T : [T]);

export function isEmptyArray(value: any[]): value is [] {
    return Array.isArray(value) && value.length === 0;
}

export class TimeHookManager extends HookManagerCore {
    public oldTimeFunctionRef?: OldTimeFunctionRefType;

    constructor(
        public thisWin: Window,
        public gModUtils: ModUtils,
        public gSC2DataManager: SC2DataManager,
        public infinityLoopChecker: InfinityLoopChecker,
    ) {
        super(
            thisWin,
            gModUtils,
            'TimeHookManager',
            infinityLoopChecker
        );
    }

    // invokeOldTimeFunctionRef<K extends keyof OldTimeFunctionRefType>(key: K, args: OldTimeFunctionArgsType[K]) {
    //     if (typeof this.oldTimeFunctionRef[key] === 'function') {
    //         const ff = this.oldTimeFunctionRef[key] as OldTimeFunctionRefType[K];
    //         if (ff !== undefined) {
    //             if (isEmptyArray(args)) {
    //                 // 对于无参函数的情况，不传递 args
    //                 const R = (ff() as OldTimeFunctionReturnType[K]);
    //             } else {
    //                 // 对于有参函数的情况，传递 args
    //                 const R = (ff(...args) as OldTimeFunctionReturnType[K]);
    //             }
    //             // const tupleArgs = args as EnsureTuple<OldTimeFunctionArgsType[K]>;
    //             // const R = (ff(...tupleArgs) as OldTimeFunctionReturnType[K]);
    //         }
    //     }
    // }

    // from GPT-4 + GithubCopilotChat
    invokeOldTimeFunctionRef<K extends keyof OldTimeFunctionRefType>(key: K, args: []): void;
    invokeOldTimeFunctionRef<K extends keyof OldTimeFunctionRefType>(key: K, args: OldTimeFunctionArgsType[K]): void;
    invokeOldTimeFunctionRef<K extends keyof OldTimeFunctionRefType>(key: K, args: any[]): void {
        if (!this.oldTimeFunctionRef) {
            console.error(`[DoLTimeWrapperAddon] [TimeHookManager] createWrapperForOldTimeFunctionRef error oldTimeFunctionRef not init`);
            this.logger.error(`[DoLTimeWrapperAddon] [TimeHookManager] createWrapperForOldTimeFunctionRef error oldTimeFunctionRef not init`);
            return;
        }
        if (typeof this.oldTimeFunctionRef[key] === 'function') {
            const ff = this.oldTimeFunctionRef[key] as (...args: any[]) => any;
            this.runCallback(key, 'before', 'call', args);
            const R = ff(...args) as OldTimeFunctionReturnType[K]; // 使用类型断言来绕过 TS2556
            this.runCallback(key, 'after', 'call', [R]);
            return R;
        }
        console.error(`[DoLTimeWrapperAddon] [TimeHookManager] invokeOldTimeFunctionRef error function not exit: `, [key, args]);
        this.logger.error(`[DoLTimeWrapperAddon] [TimeHookManager] invokeOldTimeFunctionRef error function not exit: [${key}]`);
        throw new Error(`[DoLTimeWrapperAddon] [TimeHookManager] invokeOldTimeFunctionRef error function not exit: [${key}]`);
    }

    createWrapperForOldTimeFunctionRef<K extends keyof OldTimeFunctionRefType>(key: K) {
        if (!this.oldTimeFunctionRef) {
            console.error(`[DoLTimeWrapperAddon] [TimeHookManager] createWrapperForOldTimeFunctionRef error oldTimeFunctionRef not init`);
            this.logger.error(`[DoLTimeWrapperAddon] [TimeHookManager] createWrapperForOldTimeFunctionRef error oldTimeFunctionRef not init`);
            return;
        }
        if (typeof this.oldTimeFunctionRef[key] === 'function') {
            const ff = this.oldTimeFunctionRef[key] as (...args: OldTimeFunctionArgsType[K]) => any;
            return (...args: any[]) => {
                return this.invokeOldTimeFunctionRef(key, args as any) as OldTimeFunctionReturnType[K];
            };
        }
        console.error(`[DoLTimeWrapperAddon] [TimeHookManager] createWrapperForOldTimeFunctionRef error function not exit: `, [key]);
        this.logger.error(`[DoLTimeWrapperAddon] [TimeHookManager] createWrapperForOldTimeFunctionRef error function not exit: [${key}]`);
    }

    init(oldTimeFunctionRef: OldTimeFunctionRefType) {
        this.oldTimeFunctionRef = oldTimeFunctionRef;
    }

}

