'use strict';
var app = angular.module('WMSAPP', [
    'ionic',
    'jett.ionic.filter.bar',
    'ionic-datepicker',
    'ngCordova.plugins.toast',
    'ngCordova.plugins.dialogs',
    'ngCordova.plugins.appVersion',
    'ngCordova.plugins.file',
    'ngCordova.plugins.fileTransfer',
    'ngCordova.plugins.fileOpener2',
    'WMSAPP.config',
    //'WMSAPP.factories',
    'WMSAPP.services',
    'WMSAPP.controllers'
]);
app.run(['ENV', '$ionicPlatform', '$rootScope', '$state', '$location', '$timeout', '$ionicPopup', '$ionicHistory', '$ionicLoading', '$cordovaToast', '$cordovaFile',
    function (ENV, $ionicPlatform, $rootScope, $state, $location, $timeout, $ionicPopup, $ionicHistory, $ionicLoading, $cordovaToast, $cordovaFile) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if(window.cordova && window.cordova.plugins.Keyboard) {
                ENV.fromWeb = false;
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                //
                var data = 'website=' + ENV.website + '##api=' + ENV.api;
                var path = cordova.file.externalRootDirectory;
                var directory = ENV.rootPath;
                var file = directory + "/" + ENV.configFile;
                $cordovaFile.createDir(path, directory, false)
                    .then(function (success) {
                        $cordovaFile.writeFile(path, file, data, true)
                            .then(function (success) {
                                //
                            }, function (error) {
                                $cordovaToast.showShortBottom(error);
                            });
                    }, function (error) {
                        // If an existing directory exists
                        $cordovaFile.checkFile(path, file)
                            .then(function (success) {
                                $cordovaFile.readAsText(path, file)
                                    .then(function (success) {
                                        var arConf = success.split("##");
                                        var arWebServiceURL = arConf[0].split('=');
                                        if (is.not.empty(arWebServiceURL[1])) {
                                            ENV.website = arWebServiceURL[1];
                                        }
                                        var arWebSiteURL = arConf[1].split('=');
                                        if (is.not.empty(arWebSiteURL[1])) {
                                            ENV.api = arWebSiteURL[1];
                                        }
                                    }, function (error) {
                                        $cordovaToast.showShortBottom(error);
                                    });
                            }, function (error) {
                                // If file not exists
                                $cordovaFile.writeFile(path, file, data, true)
                                    .then(function (success) {
                                        //
                                    }, function (error) {
                                        $cordovaToast.showShortBottom(error);
                                    });
                            });
                    });
            }
            if(window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
        $ionicPlatform.registerBackButtonAction(function (e) {
            /*
            if ($cordovaKeyboard.isVisible()) {
                $cordovaKeyboard.close();
            }
            */
            // Is there a page to go back to $state.include
            if ($state.includes('main') || $state.includes('login') || $state.includes('loading')) {
                if ($rootScope.backButtonPressedOnceToExit) {
                    ionic.Platform.exitApp();
                } else {
                    $rootScope.backButtonPressedOnceToExit = true;
                    $cordovaToast.showShortBottom('Press again to exit.');
                    setTimeout(function () {
                        $rootScope.backButtonPressedOnceToExit = false;
                    }, 2000);
                }
            } else if ($state.includes('grtDetail') || $state.includes('vginDetail')) {
                if ($rootScope.backButtonPressedOnceToExit) {
                    if ($ionicHistory.backView()) {
                        $ionicHistory.goBack();
                    } else {
                        if ($state.includes('grtDetail')) {
                            $state.go('grtList', {});
                        } else {
                            $state.go('vginList', {});
                        }
                    }
                } else {
                    $rootScope.backButtonPressedOnceToExit = true;
                    $cordovaToast.showShortBottom('Press again to return.');
                    setTimeout(function () {
                        $rootScope.backButtonPressedOnceToExit = false;
                    }, 2000);
                }
            } else if ($state.includes('setting')) {
                $state.go('login',{ 'CheckUpdate':'Y' }, { reload : true });
            } else if ($state.includes('update')) {
                $state.go('login',{ 'CheckUpdate':'N' }, { reload : true });
            } else if ($state.includes('list')) {
                $state.go('main',{ 'blnForcedReturn':'Y' },{ reload:true });
            } else if ($ionicHistory.backView()) {
                $ionicHistory.goBack();
            } else {
                // This is the last page: Show confirmation popup
                $rootScope.backButtonPressedOnceToExit = true;
                $cordovaToast.showShortBottom('Press again to exit.');
                setTimeout(function () {
                    $rootScope.backButtonPressedOnceToExit = false;
                }, 2000);
            }
            e.preventDefault();
            return false;
        }, 101);
    }]);

app.config(['$httpProvider', '$stateProvider', '$urlRouterProvider', '$ionicConfigProvider',
    function($httpProvider, $stateProvider, $urlRouterProvider, $ionicConfigProvider) {
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
        $ionicConfigProvider.backButton.previousTitleText(false);
        $stateProvider
            .state('index', {
                url: '',
                abstract: true,
                templateUrl: 'view/menu.html',
                controller: 'IndexCtrl'
            })
            .state('loading', {
                url: '/loading',
                cache:'false',
                templateUrl: 'view/loading.html',
                controller: 'LoadingCtrl'
            })
            .state('index.login', {
                url: '/login',
                views: {
                    'menuContent': {
                        templateUrl: 'view/login.html',
                        controller: 'LoginCtrl'
                    }
                }
            })
            .state('index.setting', {
                url: '/setting',
                views: {
                    'menuContent': {
                        templateUrl: 'view/setting.html',
                        controller: 'SettingCtrl'
                    }
                }
            })
            .state('index.update', {
                url: '/update/:Version',
                views: {
                    'menuContent': {
                        templateUrl: 'view/update.html',
                        controller: 'UpdateCtrl'
                    }
                }
            })
            .state('index.main', {
                url: '/main',
                views: {
                    'menuContent': {
                        templateUrl: 'view/main.html',
                        controller: 'MainCtrl'
                    }
                }
            })
            .state('taskList', {
                url: '/task/list',
                templateUrl: 'view/task/list.html',
                controller: 'TaskListCtrl'
            })
            .state('grtList', {
                url: '/grt/list',
                templateUrl: 'view/grt/list.html',
                controller: 'GrtListCtrl'
            })
            .state('grtDetail', {
                url: '/grt/detail/:CustomerCode/:TrxNo/:GoodsReceiptNoteNo',
                cache: 'false',
                templateUrl: 'view/grt/detail.html',
                controller: 'GrtDetailCtrl'
            })
            .state('vginList', {
                url: '/vgin/list',
                templateUrl: 'view/vgin/list.html',
                controller: 'VginListCtrl'
            })
            .state('vginDetail', {
                url: '/vgin/detail/:CustomerCode/:TrxNo/:GoodsIssueNoteNo',
                cache: 'false',
                templateUrl: 'view/vgin/detail.html',
                controller: 'VginDetailCtrl'
            });
        $urlRouterProvider.otherwise('/login');
    }]);

app.constant('$ionicLoadingConfig', {
    template: 'Loading...'
});
