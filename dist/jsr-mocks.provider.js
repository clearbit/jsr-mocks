'use strict';

angular.module('jsrMocks', [])
    .provider('jsrMocks', jsrMocks)
    .factory('jsr',jsr);

function jsrMocks() {

    var $mocks;

    return {

        setMocks: function(mocks) {
            $mocks = mocks;
        },

        $get: function() {
            if(!window.Visualforce){
                return {
                    remoting: {
                        Manager: {
                            invokeAction: function() {
                                var lastArg = arguments[arguments.length - 1],
                                    callback = lastArg,
                                    mock = $mocks[arguments[0]],
                                    result = mock.method(arguments),
                                    event = {
                                        status: true
                                    };
                                if (typeof(callback) === 'object') {
                                    callback = arguments[arguments.length - 2];
                                }
                                setTimeout(function() {
                                    callback(result, event);
                                }, mock.timeout);
                            }
                        }
                    }
                };
            }else{
                return Visualforce;
            }
        }

    }
}

function jsr(jsrMocks,$q,$rootScope){
    var Visualforce = jsrMocks;

    console.log('testing', arguments, Visualforce);

    return function(request) {
        var deferred = $q.defer();
        
        var parameters = [request.method];

        if(request.args){
            
            for(var i=0;i<request.args.length;i++){
                parameters.push(request.args[i]);
            }
        }
        
        var callback = function(result, event) {
            $rootScope.$apply(function() {
                if (event.status) {
                    deferred.resolve(result);
                } else {
                    deferred.reject(event);
                }
            });
        }
        
        parameters.push(callback);
        
        if(request.options){
            parameters.push(request.options);
        }

        Visualforce.remoting.Manager.invokeAction.apply(Visualforce.remoting.Manager, parameters);

        return deferred.promise;
    };
}
