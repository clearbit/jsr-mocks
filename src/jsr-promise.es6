import { curry } from 'ramda';

function useMock() {
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

export class vfrMocks {
  constructor(mocks) {
    this.$mocks = mocks;
    if (!window.Visualforce || (top !== self && !window.sforce)) {
      this.remoting = {
        Manager: {
          invokeAction: useMock.bind(this)
        }
      };
    } else {
      this.remoting = window.Visualforce.remoting;
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
    // Add the method name
    let parameters = [window.vfr ? window.vfr[request.method] : request.method];

    // Add the arguments
    if (request.args) {
      parameters = parameters.concat(request.args);
    }

    // Add the callback (Resolve/Reject the promise)
    parameters.push(function(result, event) {
      if (event.status) {
        resolve(result);
      } else {
        reject(event);
      }
    });

    // Add the Options
    if (request.options) {
      parameters.push(request.options);
    }

    // Call it
    // https://developer.salesforce.com/docs/atlas.en-us.pages.meta/pages/pages_js_remoting_invoking.htm
    Visualforce.remoting.Manager.invokeAction(...parameters);
  });
});
