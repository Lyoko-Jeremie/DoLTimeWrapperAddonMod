function b() {
  console.log('b1');
  a();
  console.log('b2');
}

function a() {
  console.log('a');
}

console.log(a.toString());
console.log(globalThis.a);
console.log(global.a);

var bb = {
  oldA: a,
}

a = function (...args) {
  console.log('a1');
  bb.oldA(...args);
  console.log('a2');
}
console.log(a.toString());

var cc = {};

eval(`
  cc.aaa = {
    a: a,
  };
`)
eval(`
  a = function (...args) {
    console.log('a01');
    cc.aaa.a(...args);
    console.log('a02');
  }
`);

b();
