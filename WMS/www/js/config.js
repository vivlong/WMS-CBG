'use strict';
var appConfig = angular.module('WMSAPP.config',[]);
appConfig.constant('ENV', {
    'website':      'www.sysfreight.net/mobileapp-wh',
    'api':          'www.sysfreight.net/WebApi-wh',
    'ssl':          '0', // 0 : false, 1 : true
    'port':         '8081', // http port no
    'debug':        true,
    'mock':         false,
    'fromWeb':      true,
    'appId':        '9CBA0A78-7D1D-49D3-BA71-C72E93F9E48F',
    'apkName':      'WMS-SingleSN',
    'updateFile':   'update.json',
    'rootPath':     'WMS',
    'configFile':   'config.txt',
    'version':      '1.0.7'
});
