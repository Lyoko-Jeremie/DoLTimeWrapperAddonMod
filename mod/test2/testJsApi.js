(async () => {
  // hook the `window.Time`
  window.addonDoLTimeWrapperAddon.addTimeHook({
    key: 'pass',
    pos: 'before',
    type: 'call',
    hook: (...args) => {
      console.log('[TestDoLTimeWrapperAddon] addTimeHook pass before');
    },
  });
  window.addonDoLTimeWrapperAddon.addTimeHook({
    key: 'pass',
    pos: 'before',
    type: 'call',
    hook: (...args) => {
      console.log('[TestDoLTimeWrapperAddon] addFunctionHook pass before', [args]);
      const originParams = args[0];
      return args;
    },
    change: true,
  });


  // hook the `localFunctionName`
  window.addonDoLTimeWrapperAddon.addFunctionHook({
    key: 'dayPassed',
    pos: 'before',
    type: 'call',
    hook: (...args) => {
      console.log('[TestDoLTimeWrapperAddon] addFunctionHook dayPassed before');
    },
  });
  // hook the `localFunctionName`
  window.addonDoLTimeWrapperAddon.addFunctionHook({
    key: 'dayPassed',
    pos: 'after',
    type: 'call',
    hook: (...r) => {
      console.log('[TestDoLTimeWrapperAddon] addFunctionHook dayPassed after', [r]);
      const originReturn = r[0];
      return r;
    },
    change: true,
  });
  window.addonDoLTimeWrapperAddon.addFunctionHook({
    key: 'dayPassed',
    pos: 'after',
    type: 'call',
    hook: (...args) => {
      console.log('[TestDoLTimeWrapperAddon] addFunctionHook dayPassed after');
    },
  });

  window.addonDoLTimeWrapperAddon.addFunctionHook({
    key: 'passTime',
    pos: 'before',
    type: 'call',
    hook: (...args) => {
      console.log('[TestDoLTimeWrapperAddon] addFunctionHook passTime before', [args]);
      const originParams = args[0];
      return args;
    },
    change: true,
  });


  window.addonDoLTimeWrapperAddon.addFunctionHook({
    key: 'not_exist_function',
    pos: 'after',
    type: 'call',
    hook: (...args) => {
      console.log('[TestDoLTimeWrapperAddon] addFunctionHook not_exist_function after');
    },
  });
})();
