import { curry } from 'ramda';

export class vfrMocks {
  constructor(mocks) {
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
      if (typeof callback === 'object') {
        callback = arguments[arguments.length - 2];
      }
      if (mock) {
        return setTimeout(function() {
          callback(result, event);
        }, mock.timeout || 50);
      }
    }
  }
}
// The actual factory that gets called in the controller.
/**
 * This method is what actually makes the request, either by calling the mock, or the actual remoting method
 *
 * @export jsr
 * @param {method: string, args:string[], options: { buffer: boolean, escape: boolean, timeout: number }}
 * @returns Promise
 */
export const vfr = curry(function(Visualforce, request) {
  // Wrap it in a Promise
  return new Promise(function(resolve, reject) {
    // Add each parameter, first the method name, then the arguments, then the callback
    var parameters = [window.vfr ? window.vfr[request.method] : request.method];
    if (request.args) {
      for (var i = 0; i < request.args.length; i++) {
        parameters.push(request.args[i]);
      }
    }
    // Resolve/Reject the promise
    var callback = function(result, event) {
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
    Visualforce.remoting.Manager.invokeAction.apply(
      Visualforce.remoting.Manager,
      parameters
    );
  });
});
