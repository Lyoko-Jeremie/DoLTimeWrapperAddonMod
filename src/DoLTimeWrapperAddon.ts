import JSZip from "jszip";
import type {LifeTimeCircleHook, LogWrapper} from "../../../dist-BeforeSC2/ModLoadController";
import type {SC2DataManager} from "../../../dist-BeforeSC2/SC2DataManager";
import type {ModUtils} from "../../../dist-BeforeSC2/Utils";
import type {ModBootJson, ModInfo} from "../../../dist-BeforeSC2/ModLoader";
import {isArray, isNil, isString} from 'lodash';
import {OldTimeFunctionRefType, OldTimeFunctionRefTypeNameList, TimeHookManager} from "./OldTimeFunctionHook";
import {TimeProxyManager} from "./TimeProxyManager";

export class DoLTimeWrapperAddon {
    private logger: LogWrapper;

    constructor(
        public gSC2DataManager: SC2DataManager,
        public gModUtils: ModUtils,
    ) {
        this.logger = gModUtils.getLogger();
    }

    private _timeProxyManager?: TimeProxyManager;
    get timeProxyManager() {
        return this._timeProxyManager;
    }

    private _timeHookManager?: TimeHookManager;
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

        // catch the `Time` object and "Proxy" it
        this._timeProxyManager = new TimeProxyManager(
            this.gModUtils.thisWin,
            this.gModUtils,
            this.gSC2DataManager,
        );
        this._timeProxyManager.init();

        // catch all the "local" function in `time.js` file and "hook" it
        this._timeHookManager = new TimeHookManager(
            this.gModUtils.thisWin,
            this.gModUtils,
            this.gSC2DataManager,
            oldTimeFunctionRef
        );
        this._timeHookManager.init();

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
