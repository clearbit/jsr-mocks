'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vfr = exports.vfrMocks = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _ramda = require('ramda');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var vfrMocks = exports.vfrMocks = function vfrMocks(mocks) {
  _classCallCheck(this, vfrMocks);

  this.$mocks = mocks;
  if (!window.Visualforce) {
    this.remoting = {
      Manager: {
        invokeAction: invokeStaticAction.bind(this)
      }
    };
  } else {
    this.remoting = window.Visualforce.remoting;
  }

  function invokeStaticAction() {
    if (!this.$mocks) {
      throw 'No mocks are configured';
    }
    if (!arguments[0]) {
      throw 'No Method passed to InvokeStaticAction';
    }
    if (!this.$mocks[arguments[0]]) {
      throw 'Missing Mock for method ' + arguments[0];
    }
    var lastArg = arguments[arguments.length - 1],
        callback = lastArg,
        mock = this.$mocks[arguments[0].trim()],
        result = mock.method(arguments),
        event = {
      status: true
    };
    if ((typeof callback === 'undefined' ? 'undefined' : _typeof(callback)) === 'object') {
      callback = arguments[arguments.length - 2];
    }
    if (mock) {
      return setTimeout(function () {
        callback(result, event);
      }, mock.timeout || 50);
    }
  }
};
// The actual factory that gets called in the controller.
/**
 * This method is what actually makes the request, either by calling the mock, or the actual remoting method
 *
 * @export jsr
 * @param {method: string, args:string[], options: { buffer: boolean, escape: boolean, timeout: number }}
 * @returns Promise
 */


var vfr = exports.vfr = (0, _ramda.curry)(function (Visualforce, request) {
  // Wrap it in a Promise
  return new Promise(function (resolve, reject) {
    // Add each parameter, first the method name, then the arguments, then the callback
    var parameters = [window.vfr ? window.vfr[request.method] : request.method];
    if (request.args) {
      for (var i = 0; i < request.args.length; i++) {
        parameters.push(request.args[i]);
      }
    }
    // Resolve/Reject the promise
    var callback = function callback(result, event) {
      if (event.status) {
        resolve(result);
      } else {
        reject(event);
      }
    };
    parameters.push(callback);
    if (request.options) {
      parameters.push(request.options);
    }
    // Here is where we actually invoke the action we want to call with our parameters
    Visualforce.remoting.Manager.invokeAction.apply(Visualforce.remoting.Manager, parameters);
  });
});