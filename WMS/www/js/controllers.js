var appControllers = angular.module( 'WMSAPP.controllers', [
    'ionic',
    'ngCordova.plugins.dialogs',
    'ngCordova.plugins.toast',
    'ngCordova.plugins.appVersion',
    'ngCordova.plugins.file',
    'ngCordova.plugins.fileTransfer',
    'ngCordova.plugins.fileOpener2',
    'ngCordova.plugins.datePicker',
    'ngCordova.plugins.barcodeScanner',
    'ngCordova.plugins.keyboard',
    'ui.select',
    'WMSAPP.config',
    'WMSAPP.services'
] );

appControllers.controller( 'IndexCtrl', [ 'ENV', '$rootScope', '$scope', '$state', '$http',
    '$ionicPopup', '$ionicSideMenuDelegate', '$cordovaAppVersion',
    function( ENV, $rootScope, $scope, $state, $http, $ionicPopup, $ionicSideMenuDelegate, $cordovaAppVersion ) {
        var alertPopup = null;
        var alertPopupTitle = '';
        $scope.Status = {
            Login: false
        };
        $scope.logout = function() {
            $rootScope.$broadcast( 'logout' );
            $state.go( 'index.login', {}, {} );
        };
        $scope.gotoSetting = function() {
            $state.go( 'index.setting', {}, {
                reload: true
            } );
        };
        $scope.gotoUpdate = function() {
            if ( !ENV.fromWeb ) {
                var url = ENV.website + '/' + ENV.updateFile;
                $http.get( url )
                    .success( function( res ) {
                        var serverAppVersion = res.version;
                        $cordovaAppVersion.getVersionNumber().then( function( version ) {
                            if ( version != serverAppVersion ) {
                                $ionicSideMenuDelegate.toggleLeft();
                                $state.go( 'index.update', {
                                    'Version': serverAppVersion
                                } );
                            } else {
                                alertPopupTitle = 'Already the Latest Version!';
                                alertPopup = $ionicPopup.alert( {
                                    title: alertPopupTitle,
                                    okType: 'button-assertive'
                                } );
                            }
                        } );
                    } )
                    .error( function( res ) {
                        alertPopupTitle = 'Connect Update Server Error!';
                        alertPopup = $ionicPopup.alert( {
                            title: alertPopupTitle,
                            okType: 'button-assertive'
                        } );
                    } );
            } else {
                alertPopupTitle = 'No Updates!';
                alertPopup = $ionicPopup.alert( {
                    title: alertPopupTitle,
                    okType: 'button-calm'
                } );
            }
        }
        $rootScope.$on( 'logout', function() {
            $scope.Status.Login = false;
            $ionicSideMenuDelegate.toggleLeft();
        } );
        $rootScope.$on( 'login', function() {
            $scope.Status.Login = true;
        } );
    }
] );

appControllers.controller( 'SplashCtrl', [ '$state', '$timeout',
    function( $state, $timeout ) {
        $timeout( function() {
            $state.go( 'index.login', {}, {
                reload: true
            } );
        }, 2500 );
    } ] );

appControllers.controller( 'LoginCtrl', [ '$rootScope', '$scope', '$state', '$stateParams', '$ionicPopup', '$timeout', 'ApiService',
    function( $rootScope, $scope, $state, $stateParams, $ionicPopup, $timeout, ApiService ) {
        $scope.logininfo = {
            strUserName: '',
            strPassword: ''
        };
        var alertPopup = null, alertTitle = '';
        $scope.login = function() {
            if ( window.cordova && window.cordova.plugins.Keyboard ) {
                cordova.plugins.Keyboard.close();
            }
            if ( is.empty($scope.logininfo.strUserName) ) {
                alertTitle = 'Please Enter User Name.';
                alertPopup = $ionicPopup.alert({
                    title: alertTitle,
                    okType: 'button-assertive'
                });
                alertPopup.then(function(res) {
                    console.log(alertTitle);
                });
            }else{
                var strUri = '/api/wms/login/check?UserId=' + $scope.logininfo.strUserName + '&Md5Stamp=' + hex_md5( $scope.logininfo.strPassword );
                ApiService.GetParam( strUri, true ).then( function success( result ) {
                    if (result.data.results > 0) {
                        $rootScope.$broadcast( 'login' );
                        sessionStorage.clear();
                        sessionStorage.setItem( 'UserId', $scope.logininfo.strUserName );
                        $state.go( 'index.main', {}, {
                            reload: true
                        } );
                    }  else {
                        alertTitle = 'Invaild User';
                        alertPopup = $ionicPopup.alert({
                            title: alertTitle,
                            okType: 'button-assertive'
                        });
                        alertPopup.then(function(res) {
                            console.log(alertTitle);
                        });
                    }
                } );
            }
        };
        $( '#iUserName' ).on( 'keydown', function( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                $( '#iPassword' ).focus();
            }
        } );
        $( '#iPassword' ).on( 'keydown', function( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                if (alertPopup === null) {
                    $scope.login();
                } else {
                    alertPopup.close();
                    alertPopup = null;
                }
            }
        } );
    } ] );

appControllers.controller( 'SettingCtrl', [ 'ENV', '$rootScope', '$scope', '$state', '$ionicHistory', '$ionicPopup', '$cordovaToast', '$cordovaFile',
    function( ENV, $rootScope,  $scope, $state, $ionicHistory, $ionicPopup, $cordovaToast, $cordovaFile ) {
        $scope.Setting = {
            Version:    ENV.version,
            WebApiURL:  rmProtocol(ENV.api),
            WebSiteUrl: rmProtocol(ENV.website),
            SSL:        { checked: ENV.ssl === '0' ? false : true },
            blnWeb:    ENV.fromWeb
        };
        $scope.return = function() {
            if ( $ionicHistory.backView() ) {
                $ionicHistory.goBack();
            } else {
                $state.go( 'index.login', {}, {
                    reload: true
                } );
            }
        };
        $scope.save = function() {
            if ( is.not.empty( $scope.Setting.WebApiURL ) ) {
                ENV.api = $scope.Setting.WebApiURL;
            } else {
                $scope.Setting.WebApiURL = rmProtocol(ENV.api);
            }
            if ( is.not.empty( $scope.Setting.WebSiteUrl ) ) {
                ENV.website = $scope.Setting.WebSiteUrl;
            } else {
                $scope.Setting.WebSiteUrl = rmProtocol(ENV.website);
            }
            ENV.ssl = $scope.Setting.SSL.checked ? '1' : '0';
            var blnSSL = $scope.Setting.SSL.checked ? true : false;
            ENV.website = appendProtocol(ENV.website, blnSSL, ENV.port);
            ENV.api     = appendProtocol(ENV.api, blnSSL, ENV.port);
            if ( !ENV.fromWeb ) {
                var data = 'website=' + ENV.website + '##api=' + ENV.api + '##ssl=' + ENV.ssl;
                var path = cordova.file.externalRootDirectory;
                var file = ENV.rootPath + '/' + ENV.configFile;
                $cordovaFile.writeFile( path, file, data, true )
                    .then( function( success ) {
                        //$rootScope.$broadcast( 'logout' );
                        $state.go( 'index.login', {}, {
                            reload: true
                        } );
                    }, function( error ) {
                        $cordovaToast.showShortBottom( error );
                    } );
            } else {
                //$rootScope.$broadcast( 'logout' );
                $state.go( 'index.login', {}, {
                    reload: true
                } );
            }
        };
        $scope.reset = function() {
            $scope.Setting.WebApiURL = 'www.sysfreight.net/WebApi-wh';
            $scope.Setting.WebSiteUrl = 'www.sysfreight.net/mobileapp-wh';
            $scope.Setting.SSL = { checked: false };
            if ( !ENV.fromWeb ) {
                var path = cordova.file.externalRootDirectory;
                var file = ENV.rootPath + '/' + ENV.configFile;
                $cordovaFile.removeFile( path, file )
                    .then( function( success ) {

                    }, function( error ) {
                        //$cordovaToast.showShortBottom( error );
                    } );
            }
        };
    } ] );

appControllers.controller( 'UpdateCtrl', [ 'ENV', '$scope', '$state', '$stateParams', 'DownloadFileService',
    function( ENV, $scope, $state, $stateParams, DownloadFileService ) {
        $scope.strVersion = $stateParams.Version;
        $scope.return = function() {
            onError();
        };
        var onError = function() {
            $state.go( 'index.login', {}, {
                reload: true
            } );
        };
        $scope.upgrade = function() {
            DownloadFileService.Download( ENV.website + '/' + ENV.apkName + '.apk', 'application/vnd.android.package-archive', null, onError, onError );
        };
    } ] );

appControllers.controller( 'MainCtrl', [ '$scope', '$state', '$ionicPopup',
    function( $scope, $state, $ionicPopup ) {
        $scope.func_Dashboard = function() {
            $ionicPopup.alert( {
                title: 'Stay Tuned.',
                okType: 'button-calm'
            } );
        };
        $scope.func_GR = function() {
            $state.go( 'grList', {}, {
                reload: true
            } );
        };
        $scope.func_Putaway = function() {
            $state.go( 'putawayList', {}, {
                reload: true
            } );
        };
        $scope.func_GT = function() {
            $state.go( 'gtFrom', {}, {
                reload: true
            } );
        };
        $scope.func_Vgin = function() {
            $state.go( 'vginList', {}, {
                reload: true
            } );
        };
        $scope.func_Picking = function() {
            $state.go( 'pickingList', {}, {
                reload: true
            } );
        };
    } ] );
