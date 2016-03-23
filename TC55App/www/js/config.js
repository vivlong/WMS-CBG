'use strict';
var appConfig = angular.module('WMSAPP.config',[]);
appConfig.constant('ENV', {
    'website':      'http://www.sysfreight.net:8081/mobileapp-wh',
    'api':          'http://www.sysfreight.net:8081/WebApi',
    'debug':        true,
    'mock':         false,
    'fromWeb':      true,
    'appId':        '9CBA0A78-7D1D-49D3-BA71-C72E93F9E48F',
    'rootPath':     'WMS',
    'configFile':   'config.txt',
    'version':      '0.0.1'
});

var onStrToURL = function(strURL) {
    if (strURL.length > 0 && strURL.indexOf('http://') < 0 && strURL.indexOf('HTTP://') < 0) {
        strURL = "http://" + strURL;
    }
    return strURL;
};
