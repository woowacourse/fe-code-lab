// Web Worker: executes student code and tests in isolated worker context
// This is an educational tool - dynamic code execution is intentional.

self.onmessage = function(e) {
  var codeBlocks = e.data.codeBlocks;
  var testCode = e.data.testCode;
  var results = [];

  function captureConsole(fn) {
    var captured = '';
    var origLog = self.console.log;
    self.console.log = function() {
      captured = Array.prototype.slice.call(arguments).join(' ');
    };
    try { fn(); } finally { self.console.log = origLog; }
    return captured;
  }

  function test(name, fn) {
    try {
      fn();
      results.push({ name: name, pass: true });
    } catch (err) {
      results.push({ name: name, pass: false, error: err.message });
    }
  }

  function expect(actual) {
    return {
      toBe: function(expected) {
        if (actual !== expected) {
          throw new Error('Expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual));
        }
      },
      toEqual: function(expected) {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
          throw new Error('Expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual));
        }
      },
      toThrow: function() {
        if (typeof actual !== 'function') throw new Error('Expected a function');
        var threw = false;
        try { actual(); } catch(err) { threw = true; }
        if (!threw) throw new Error('Expected function to throw');
      }
    };
  }

  try {
    var allCode = codeBlocks.join('\n') + '\n' + testCode;
    // NOTE: new Function() is used intentionally - this educational tool
    // executes student-written code by design.
    var executor = new Function('test', 'expect', 'captureConsole', allCode);
    executor(test, expect, captureConsole);
  } catch (err) {
    results.push({ name: 'Code execution error', pass: false, error: err.message });
  }

  self.postMessage({ results: results });
};
