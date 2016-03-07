var app = angular.module('WMSAPP', [
    'ionic',
    'ngCordova.plugins.toast',
    'ngCordova.plugins.file',
    'WMSAPP.controllers'
]);

app.run(['$ionicPlatform', '$rootScope', '$state', '$location', '$timeout', '$ionicPopup', '$ionicHistory', '$ionicLoading', '$cordovaToast', '$cordovaFile',
    function ($ionicPlatform, $rootScope, $state, $location, $timeout, $ionicPopup, $ionicHistory, $ionicLoading, $cordovaToast, $cordovaFile) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if(window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                //
                var data = 'BaseUrl=' + strBaseUrl + '##WebServiceURL=' + strWebServiceURL;
                var path = cordova.file.externalRootDirectory;
                var directory = "WmsApp";
                var file = directory + "/Config.txt";
                $cordovaFile.createDir(path, directory, false)
                    .then(function (success) {
                        $cordovaFile.writeFile(path, file, data, true)
                            .then(function (success) {
                                //
                                if (strBaseUrl.length > 0) {
                                    strBaseUrl = "/" + strBaseUrl;
                                }
                                if (strWebServiceURL.length > 0) {
                                    strWebServiceURL = "http://" + strWebServiceURL;
                                }
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
                                        var arBaseUrl = arConf[0].split("=");
                                        if(arBaseUrl[1].length>0){
                                            strBaseUrl = arBaseUrl[1];
                                        }
                                        var arWebServiceURL = arConf[1].split("=");
                                        if(arWebServiceURL[1].length>0){
                                            strWebServiceURL = arWebServiceURL[1];
                                        }
                                        //
                                        if (strBaseUrl.length > 0) {
                                            strBaseUrl = "/" + strBaseUrl;
                                        }
                                        if (strWebServiceURL.length > 0) {
                                            strWebServiceURL = "http://" + strWebServiceURL;
                                        }
                                    }, function (error) {
                                        $cordovaToast.showShortBottom(error);
                                    });
                            }, function (error) {
                                // If file not exists
                                $cordovaFile.writeFile(path, file, data, true)
                                    .then(function (success) {
                                        //
                                        if (strBaseUrl.length > 0) {
                                            strBaseUrl = "/" + strBaseUrl;
                                        }
                                        if (strWebServiceURL.length > 0) {
                                            strWebServiceURL = "http://" + strWebServiceURL;
                                        }
                                    }, function (error) {
                                        $cordovaToast.showShortBottom(error);
                                    });
                            });
                    });
            } else {
                if (strBaseUrl.length > 0) {
                    strBaseUrl = "/" + strBaseUrl;
                }
                if (strWebServiceURL.length > 0) {
                    strWebServiceURL = "http://" + strWebServiceURL;
                }
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

app.config(['$stateProvider', '$urlRouterProvider', '$ionicConfigProvider',
    function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
        $ionicConfigProvider.backButton.previousTitleText(false);
        $stateProvider
            .state('loading', {
                url: '/loading',
                cache:'false',
                templateUrl: 'view/loading.html',
                controller: 'LoadingCtrl'
            })
            .state('login', {
                url: '/login/:CheckUpdate',
                cache:'false',
                templateUrl: 'view/login.html',
                controller: 'LoginCtrl'
            })
            .state('setting', {
                url: '/setting',
                cache:'false',
                templateUrl: 'view/setting.html',
                controller: 'SettingCtrl'
            })
            .state('update', {
                url: '/update/:Version',
                cache:'false',
                templateUrl: 'view/update.html',
                controller: 'UpdateCtrl'
            })
            .state('main', {
                url: "/main",
                templateUrl: "view/main.html",
                controller: 'MainCtrl'
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
            })
        $urlRouterProvider.otherwise('/loading');
    }]);

app.constant('$ionicLoadingConfig', {
    template: 'Loading...'
});
