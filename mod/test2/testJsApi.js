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
    hook: (r) => {
      console.log('[TestDoLTimeWrapperAddon] addFunctionHook dayPassed after', r);
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
    key: 'not_exist_function',
    pos: 'after',
    type: 'call',
    hook: (...args) => {
      console.log('[TestDoLTimeWrapperAddon] addFunctionHook not_exist_function after');
    },
  });
})();
