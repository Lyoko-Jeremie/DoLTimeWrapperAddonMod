import {DoLTimeWrapperAddon} from "./DoLTimeWrapperAddon";
import type {AddonPluginHookPointEx} from "../../../dist-BeforeSC2/AddonPlugin";
import type {LogWrapper} from "../../../dist-BeforeSC2/ModLoadController";
import type {SC2DataManager} from "../../../dist-BeforeSC2/SC2DataManager";
import type {ModUtils} from "../../../dist-BeforeSC2/Utils";
import type {ModBootJson, ModBootJsonAddonPlugin, ModInfo} from "../../../dist-BeforeSC2/ModLoader";
import {every, isArray, isNil, isString} from 'lodash';
import type {ModZipReader} from "../../../dist-BeforeSC2/ModZipReader";
import {TimeHookType} from "./TimeProxyManager";


export interface DoLTimeWrapperParams {
    level: 'LocalFunction' | 'TimeObject';
    key: string;
    pos: 'before' | 'after';
    type: 'call' | 'get' | 'set';
    js?: string;
    wiki?: string;
}

export function checkParams(a: any): a is DoLTimeWrapperParams {
    return a
        && isString(a.level) && ['LocalFunction', 'TimeObject'].includes(a.level)
        && isString(a.key)
        && isString(a.pos) && ['before', 'after'].includes(a.pos)
        && isString(a.type) && ['call', 'get', 'set'].includes(a.type)
        && ((isString(a.js) && isNil(a.wiki)) || (isNil(a.js) && isString(a.wiki)))
        ;
}

export interface TimeHookTypeEx extends TimeHookType {
    modName: string;
    originParams: DoLTimeWrapperParams;
}

export class DoLTimeWrapperAddonPlugin implements AddonPluginHookPointEx {
    private logger: LogWrapper;

    constructor(
        public gSC2DataManager: SC2DataManager,
        public gModUtils: ModUtils,
        public timeWrapperAddon: DoLTimeWrapperAddon,
    ) {
        this.logger = gModUtils.getLogger();
    }

    async registerMod(addonName: string, mod: ModInfo, modZip: ModZipReader) {
        if (!mod) {
            console.error('[DoLTimeWrapperAddon] registerMod() (!mod)', [addonName, mod]);
            this.logger.error(`[DoLTimeWrapperAddon] registerMod() (!mod): addon[${addonName}] mod[${mod}]`);
            return;
        }
        const pp = mod.bootJson.addonPlugin?.find((T: ModBootJsonAddonPlugin) => {
            return T.modName === 'DoLTimeWrapperAddon'
                && T.addonName === 'DoLTimeWrapperAddon';
        })?.params as any;
        if (!(pp && isArray(pp['hooks']) && every(pp['hooks'], checkParams))) {
            console.error('[DoLTimeWrapperAddon] registerMod() ParamsInvalid', [addonName, mod, pp]);
            this.logger.error(`[DoLTimeWrapperAddon] registerMod() ParamsInvalid: addon[${addonName}]`);
            return;
        }

        const ppp = pp['hooks'] as DoLTimeWrapperParams[];
        for (const p of ppp) {
            const hook: TimeHookTypeEx = {
                modName: mod.name,
                originParams: p,
                key: p.key,
                pos: p.pos,
                type: p.type,
                hook: (...args: any[]) => {
                    console.log(`[DoLTimeWrapperAddon] [${mod.name}] run js`, [mod.name, p, p.key, p.pos, p.type, p.js, args]);
                    // this.logger.log(`[DoLTimeWrapperAddon] [${mod.name}] run js key[${p.key}] pos[${p.pos}] type[${p.type}]`);
                    if (p.js) {
                        try {
                            const f = new Function('args', p.js);
                            f(args);
                        } catch (e: Error | any) {
                            console.error(`[DoLTimeWrapperAddon] [${mod.name}] run js error: `, [mod.name, p, p.key, p.pos, p.type, p.js, args, e]);
                            // this.logger.error(`[DoLTimeWrapperAddon] [${mod.name}] run js key[${p.key}] pos[${p.pos}] type[${p.type}]. error: [${e.message ? e.message : e}]`);
                        }
                    }
                    if (p.wiki) {
                        console.log(`[DoLTimeWrapperAddon] [${mod.name}] run wikify`, [mod.name, p, p.key, p.pos, p.type, p.wiki, args]);
                        // this.logger.log(`[DoLTimeWrapperAddon] [${mod.name}] run wikify key[${p.key}] pos[${p.pos}] type[${p.type}]`);
                        try {
                            window.SugarCube.Wikifier.wikifyEval(p.wiki);
                        } catch (e: Error | any) {
                            console.error(`[DoLTimeWrapperAddon] [${mod.name}] run wikify error: `, [mod.name, p, p.key, p.pos, p.type, p.wiki, args, e]);
                            // this.logger.error(`[DoLTimeWrapperAddon] [${mod.name}] run wikify key[${p.key}] pos[${p.pos}] type[${p.type}]. error: [${e.message ? e.message : e}]`);
                        }
                    }
                },
            };
            if (p.level === 'LocalFunction') {
                this.timeWrapperAddon.addFunctionHook(hook);
            } else if (p.level === 'TimeObject') {
                this.timeWrapperAddon.addTimeHook(hook);
            }
        }

    }


}
