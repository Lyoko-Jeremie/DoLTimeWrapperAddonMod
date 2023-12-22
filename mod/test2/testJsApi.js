(async () => {
  // hook the `window.Time`
  window.addonDoLTimeWrapperAddon.addTimeHook({
    key: 'pass',
    pos: 'before',
    type: 'call',
    hook: (...args) => {
      console.log('[TestDoLTimeWrapperAddon] addTimeHook pass before');
    }
  });


  // hook the `localFunctionName`
  window.addonDoLTimeWrapperAddon.addFunctionHook({
    key: 'dayPassed',
    pos: 'before',
    type: 'call',
    hook: (...args) => {
      console.log('[TestDoLTimeWrapperAddon] addFunctionHook dayPassed before');
    }
  });
  window.addonDoLTimeWrapperAddon.addFunctionHook({
    key: 'dayPassed',
    pos: 'after',
    type: 'call',
    hook: (...args) => {
      console.log('[TestDoLTimeWrapperAddon] addFunctionHook dayPassed after');
    }
  });
})();
