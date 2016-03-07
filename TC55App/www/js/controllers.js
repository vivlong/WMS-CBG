var appControllers = angular.module('WMSAPP.controllers', [
    'ionic',
    'ngCordova.plugins.dialogs',
    'ngCordova.plugins.toast',
    'ngCordova.plugins.appVersion',
    'ngCordova.plugins.file',
    'ngCordova.plugins.fileTransfer',
    'ngCordova.plugins.fileOpener2',
    'ngCordova.plugins.datePicker',
    'ngCordova.plugins.barcodeScanner',
    'ui.select',
    'WMSAPP.services'
]);

appControllers.controller('LoadingCtrl',
    ['$state', '$timeout',
    function ($state, $timeout) {
        $timeout(function () {
            $state.go('login', { 'CheckUpdate': 'N' }, { reload: true });
        }, 2500);
    }]);

appControllers.controller('LoginCtrl',
    ['$scope', '$http', '$state', '$stateParams', '$ionicPopup', '$timeout', '$ionicLoading', '$cordovaToast', '$cordovaAppVersion', 'JsonServiceClient',
    function ($scope, $http, $state, $stateParams, $ionicPopup, $timeout, $ionicLoading, $cordovaToast, $cordovaAppVersion, JsonServiceClient) {
        $scope.logininfo = {};
        if (undefined == $scope.logininfo.strUserName) {
            $scope.logininfo.strUserName = "";
        }
        if (undefined == $scope.logininfo.strPassword) {
            $scope.logininfo.strPassword = "";
        }
        $('#iUserName').on('keydown', function (e) {
            if (e.which === 9 || e.which === 13) {
                $('#iPassword').focus();
            }
        });
        $('#iPassword').on('keydown', function (e) {
            if (e.which === 9 || e.which === 13) {
                $scope.login();
            }
        });
        if ($stateParams.CheckUpdate === 'Y') {
            var url = strWebServiceURL + strBaseUrl + '/update.json';
            $http.get(url)
                .success(function (res) {
                    var serverAppVersion = res.version;
                    $cordovaAppVersion.getVersionNumber().then(function (version) {
                        if (version != serverAppVersion) {
                            $state.go('update', { 'Version': serverAppVersion });
                        }
                    });
                })
                .error(function (res) {});
        }
        $scope.checkUpdate = function () {
            var url = strWebServiceURL + strBaseUrl + '/update.json';
            $http.get(url)
                .success(function (res) {
                    var serverAppVersion = res.version;
                    $cordovaAppVersion.getVersionNumber().then(function (version) {
                        if (version != serverAppVersion) {
                            $state.go('update', { 'Version': serverAppVersion });
                        } else {
                            var alertPopup = $ionicPopup.alert({
                                title: "Already the Latest Version!",
                                okType: 'button-assertive'
                            });
                            $timeout(function () {
                                alertPopup.close();
                            }, 2500);
                        }
                    });
                })
                .error(function (res) {
                    var alertPopup = $ionicPopup.alert({
                        title: "Connect Update Server Error!",
                        okType: 'button-assertive'
                    });
                    $timeout(function () {
                        alertPopup.close();
                    }, 2500);
                });
        };
        $scope.setConf = function () {
            $state.go('setting', {}, { reload: true });
        };
        $scope.login = function () {
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.close();
            }
            if ($scope.logininfo.strUserName == "") {
                var alertPopup = $ionicPopup.alert({
                    title: 'Please Enter User Name.',
                    okType: 'button-assertive'
                });
                $timeout(function () {
                    alertPopup.close();
                }, 2500);
                return;
            }
            /*
            if ($scope.logininfo.strPassword == "") {
                var alertPopup = $ionicPopup.alert({
                    title: 'Please Enter Password.',
                    okType: 'button-assertive'
                });
                $timeout(function () {
                    alertPopup.close();
                }, 2500);
                return;
            }
            */
            $ionicLoading.show();
            var jsonData = { "UserId": $scope.logininfo.strUserName, "Password": hex_md5($scope.logininfo.strPassword) };
            var strUri = "/api/wms/action/list/login";
            var onSuccess = function (response) {
                $ionicLoading.hide();
                sessionStorage.clear();
                sessionStorage.setItem("UserId", $scope.logininfo.strUserName);
                $state.go('main', { }, { reload: true });
            };
            var onError = function () {
                $ionicLoading.hide();
            };
            JsonServiceClient.postToService(strUri, jsonData, onSuccess, onError);
        };
    }]);

appControllers.controller('SettingCtrl',
    ['$scope', '$state', '$timeout', '$ionicLoading', '$ionicPopup', '$cordovaToast', '$cordovaFile',
    function ($scope, $state, $timeout, $ionicLoading, $ionicPopup, $cordovaToast, $cordovaFile) {
        $scope.Setting = {};
        $scope.Setting.WebServiceURL = strWebServiceURL.replace('http://', '');
        $scope.Setting.BaseUrl = strBaseUrl.replace('/', '');
        if (strPL43Device > 0) {
            $scope.Setting.PL43Device = { checked: true };
        } else {
            $scope.Setting.PL43Device = { checked: false };
        }
        $scope.returnLogin = function () {
            $state.go('login', { 'CheckUpdate': 'Y' }, { reload: true });
        };
        $scope.saveSetting = function () {
            if ($scope.Setting.WebServiceURL.length > 0) {
                strWebServiceURL = $scope.Setting.WebServiceURL;
                if (strWebServiceURL.length > 0) {
                    strWebServiceURL = "http://" + strWebServiceURL;
                }
            } else { $scope.Setting.WebServiceURL = strWebServiceURL }
            if ($scope.Setting.BaseUrl.length > 0) {
                strBaseUrl = $scope.Setting.BaseUrl;
                if (strBaseUrl.length > 0) {
                    strBaseUrl = "/" + strBaseUrl;
                }
            } else { $scope.Setting.BaseUrl = strBaseUrl }
            var data = 'BaseUrl=' + $scope.Setting.BaseUrl + '##WebServiceURL=' + $scope.Setting.WebServiceURL + '##PL43Device=' + strPL43Device;
            var path = cordova.file.externalRootDirectory;
            var directory = "WmsApp";
            var file = directory + "/Config.txt";
            $cordovaFile.writeFile(path, file, data, true)
                .then(function (success) {
                    $state.go('login', { 'CheckUpdate': 'Y' }, { reload: true });
                }, function (error) {
                    $cordovaToast.showShortBottom(error);
                });
        };
        $scope.delSetting = function () {
            var path = cordova.file.externalRootDirectory;
            var directory = "WmsApp";
            var file = directory + "/Config.txt";
            $cordovaFile.removeFile(path, file)
                .then(function (success) {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Delete Config File Success.',
                        okType: 'button-calm'
                    });
                    $timeout(function () {
                        alertPopup.close();
                    }, 2500);
                }, function (error) {
                    $cordovaToast.showShortBottom(error);
                });
        };
    }]);

appControllers.controller('UpdateCtrl',
    ['$scope', '$stateParams', '$state', '$timeout', '$ionicLoading', '$cordovaToast', '$cordovaFile', '$cordovaFileTransfer', '$cordovaFileOpener2',
    function ($scope, $stateParams, $state, $timeout, $ionicLoading, $cordovaToast, $cordovaFile, $cordovaFileTransfer, $cordovaFileOpener2) {
        $scope.strVersion = $stateParams.Version;
        $scope.returnLogin = function () {
            $state.go('login', { 'CheckUpdate': 'N' }, { reload: true });
        };
        $scope.upgrade = function () {
            $ionicLoading.show({
                template: "Download  0%"
            });
            var url = strWebServiceURL + strBaseUrl + "/TMS.apk";
            var blnError = false;
            $cordovaFile.checkFile(cordova.file.externalRootDirectory, "TMS.apk")
            .then(function (success) {
                //
            }, function (error) {
                blnError = true;
            });
            var targetPath = cordova.file.externalRootDirectory + "TMS.apk";
            var trustHosts = true;
            var options = {};
            if (!blnError) {
                $cordovaFileTransfer.download(url, targetPath, options, trustHosts).then(function (result) {
                    $ionicLoading.hide();
                    $cordovaFileOpener2.open(targetPath, 'application/vnd.android.package-archive'
                    ).then(function () {
                        // success
                    }, function (err) {
                        // error
                    });
                }, function (err) {
                    $cordovaToast.showShortCenter('Download faild.');
                    $ionicLoading.hide();
                    $state.go('login', { 'CheckUpdate': 'N' }, { reload: true });
                }, function (progress) {
                    $timeout(function () {
                        var downloadProgress = (progress.loaded / progress.total) * 100;
                        $ionicLoading.show({
                            template: "Download  " + Math.floor(downloadProgress) + "%"
                        });
                        if (downloadProgress > 99) {
                            $ionicLoading.hide();
                        }
                    })
                });
            } else {
                $ionicLoading.hide();
                $cordovaToast.showShortCenter('Check APK file faild.');
                $state.go('login', { 'CheckUpdate': 'N' }, { reload: true });
            }
        };
    }]);

appControllers.controller('MainCtrl',
    ['$scope', '$http', '$state', '$stateParams', '$ionicPopup', '$timeout', 'JsonServiceClient',
    function ($scope, $http, $state, $stateParams, $ionicPopup, $timeout, JsonServiceClient) {
        $scope.GoToTask = function () {
            $state.go('taskList', {}, { reload: true });
        }
        $scope.GoToGrt = function () {
            $state.go('grtList', {}, { reload: true });
        };
        $scope.GoToVgin = function () {
            $state.go('vginList', {}, { reload: true });
        };
        $scope.GoToSetting = function () {
            $state.go('setting', {}, { reload: true });
        };
    }]);

appControllers.controller('TaskListCtrl',
    ['$scope', '$stateParams', '$state', '$http', '$timeout', '$ionicLoading', '$ionicPopup', 'JsonServiceClient',
    function ($scope, $stateParams, $state, $http, $timeout, $ionicLoading, $ionicPopup, JsonServiceClient) {
        var returnMainFun = function () {
            $state.go('main', {}, { reload: true });
        };
        $scope.returnMain = returnMainFun;
        var alertPopup = $ionicPopup.alert({
            title: 'No Tasks.',
            okType: 'button-calm'
        });
        $timeout(function () {
            alertPopup.close();
            returnMainFun();
        }, 2500);
    }]);
