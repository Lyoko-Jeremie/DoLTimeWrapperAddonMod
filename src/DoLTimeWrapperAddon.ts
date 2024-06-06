import JSZip from "jszip";
import type {AddonPluginHookPointEx} from "../../../dist-BeforeSC2/AddonPlugin";
import type {LogWrapper} from "../../../dist-BeforeSC2/ModLoadController";
import type {SC2DataManager} from "../../../dist-BeforeSC2/SC2DataManager";
import type {ModUtils} from "../../../dist-BeforeSC2/Utils";
import type {ModBootJson, ModBootJsonAddonPlugin, ModInfo} from "../../../dist-BeforeSC2/ModLoader";
import {isArray, isNil, isString} from 'lodash';
import {OldTimeFunctionRefType, OldTimeFunctionRefTypeNameList, TimeHookManager} from "./OldTimeFunctionHook";
import {InfinityLoopChecker, TimeHookType, TimeProxyManager} from "./TimeProxyManager";
import type {ModZipReader} from "../../../dist-BeforeSC2/ModZipReader";
import {DoLTimeWrapperAddonPlugin} from "./DoLTimeWrapperAddonPlugin";


export class DoLTimeWrapperAddon {
    private logger: LogWrapper;

    private timeWrapperAddonPlugin: DoLTimeWrapperAddonPlugin;
    public infinityLoopChecker: InfinityLoopChecker;

    constructor(
        public gSC2DataManager: SC2DataManager,
        public gModUtils: ModUtils,
    ) {
        this.logger = gModUtils.getLogger();
        this.timeWrapperAddonPlugin = new DoLTimeWrapperAddonPlugin(gSC2DataManager, gModUtils, this);
        this.infinityLoopChecker = new InfinityLoopChecker(this.logger);
        // catch the `Time` object and "Proxy" it
        this._timeProxyManager = new TimeProxyManager(
            this.gModUtils.thisWin,
            this.gModUtils,
            this.gSC2DataManager,
            this.infinityLoopChecker,
        );
        // catch all the "local" function in `time.js` file and "hook" it
        this._timeHookManager = new TimeHookManager(
            this.gModUtils.thisWin,
            this.gModUtils,
            this.gSC2DataManager,
            this.infinityLoopChecker,
        );
    }

    addTimeHook(hook: TimeHookType) {
        this._timeProxyManager.addCallableHook(hook.key, hook);
    }

    addFunctionHook(hook: TimeHookType) {
        this._timeHookManager.addCallableHook(hook.key, hook);
    }

    private _timeProxyManager: TimeProxyManager;
    get timeProxyManager() {
        return this._timeProxyManager;
    }

    private _timeHookManager: TimeHookManager;
    get timeHookManager() {
        return this._timeHookManager;
    }

    private _isInit = false;
    get isInit() {
        return this._isInit;
    }

    makeCatchCode() {
        if (this.isInit) {
            return '';
        }

        // TODO this will case a error if a function now exist in OldTimeFunctionRefTypeNameList that we try to catch
        //      and we cannot detect this, now
        let code = `window.addonDoLTimeWrapperAddon.init({`;
        for (let key of OldTimeFunctionRefTypeNameList) {
            code += `${key}: ${key},`;
        }
        code += `});`;

        // // the code will generate like :
        // window.addonDoLTimeWrapperAddon.init({
        //     yearPassed: yearPassed,
        //     weekPassed: weekPassed,
        // });

        return code;
    }

    init(oldTimeFunctionRef: OldTimeFunctionRefType) {
        // this function must run in sc2 script context
        if (this.isInit) {
            return;
        }

        this._timeProxyManager.init();
        this._timeHookManager.init(oldTimeFunctionRef);

        // generate the code to replace the "local" function in `time.js` file
        let code = `\n`;
        for (let key of OldTimeFunctionRefTypeNameList) {
            if (typeof oldTimeFunctionRef[key] === 'function') {
                code += `${key} = window.addonDoLTimeWrapperAddon.timeHookManager.createWrapperForOldTimeFunctionRef("${key}");\n`;
            }
        }

        // // the code will generate like :
        // yearPassed = window.addonDoLTimeWrapperAddon.timeHookManager.createWrapperForOldTimeFunctionRef("yearPassed");
        // weekPassed = window.addonDoLTimeWrapperAddon.timeHookManager.createWrapperForOldTimeFunctionRef("weekPassed");

        this._isInit = true;

        return code;
    }

}
