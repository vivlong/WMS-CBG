'use strict';
var app = angular.module( 'WMSAPP', [
    'ionic',
    'jett.ionic.filter.bar',
    'ionic-datepicker',
    'ngCordova',
    'WMSAPP.config',
    //'WMSAPP.factories',
    'WMSAPP.services',
    'WMSAPP.controllers'
] );
app.run( [ 'ENV', '$ionicPlatform', '$rootScope', '$state', '$location', '$timeout', '$ionicPopup', '$ionicHistory', '$ionicLoading', '$cordovaKeyboard', '$cordovaToast', '$cordovaFile',
    function( ENV, $ionicPlatform, $rootScope, $state, $location, $timeout, $ionicPopup, $ionicHistory, $ionicLoading, $cordovaKeyboard, $cordovaToast, $cordovaFile ) {
        $ionicPlatform.ready( function() {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if ( window.cordova ) {
                ENV.fromWeb = false;
                $cordovaKeyboard.hideAccessoryBar(true);
                $cordovaKeyboard.disableScroll(true);
                //
                var data = 'website=' + ENV.website + '##api=' + ENV.api + '##ssl=' + ENV.ssl;
                var path = cordova.file.externalRootDirectory;
                var directory = ENV.rootPath;
                var file = directory + '/' + ENV.configFile;
                $cordovaFile.createDir( path, directory, false )
                    .then( function( success ) {
                        $cordovaFile.writeFile( path, file, data, true )
                            .then( function( success ) {
                                var blnSSL = ENV.ssl === 0 ? false : true;
                                ENV.website = appendProtocol( ENV.website, blnSSL, ENV.port );
                                ENV.api = appendProtocol( ENV.api, blnSSL, ENV.port );
                            }, function( error ) {
                                $cordovaToast.showShortBottom( error );
                            } );
                    }, function( error ) { // If an existing directory exists
                        $cordovaFile.checkFile( path, file )
                            .then( function( success ) {
                                $cordovaFile.readAsText( path, file )
                                    .then( function( success ) {
                                        var arConf = success.split( '##' );
                                        if ( is.not.empty( arConf[ 0 ] ) ) {
                                            var arWebServiceURL = arConf[ 0 ].split( '=' );
                                            if ( is.not.empty( arWebServiceURL[ 1 ] ) ) {
                                                ENV.website = arWebServiceURL[ 1 ];
                                            }
                                        }
                                        if ( is.not.empty( arConf[ 1 ] ) ) {
                                            var arWebSiteURL = arConf[ 1 ].split( '=' );
                                            if ( is.not.empty( arWebSiteURL[ 1 ] ) ) {
                                                ENV.api = arWebSiteURL[ 1 ];
                                            }
                                        }
                                        if ( is.not.empty( arConf[ 2 ] ) ) {
                                            var arSSL = arConf[ 2 ].split( '=' );
                                            if ( is.not.empty( arSSL[ 1 ] ) ) {
                                                ENV.ssl = arSSL[ 1 ];
                                            }
                                        }
                                        var blnSSL = ENV.ssl === 0 ? false : true;
                                        ENV.website = appendProtocol( ENV.website, blnSSL, ENV.port );
                                        ENV.api = appendProtocol( ENV.api, blnSSL, ENV.port );
                                        //
                                    }, function( error ) {
                                        $cordovaToast.showShortBottom( error );
                                    } );
                            }, function( error ) {
                                // If file not exists
                                $cordovaFile.writeFile( path, file, data, true )
                                    .then( function( success ) {
                                        var blnSSL = ENV.ssl === 0 ? false : true;
                                        ENV.website = appendProtocol( ENV.website, blnSSL, ENV.port );
                                        ENV.api = appendProtocol( ENV.api, blnSSL, ENV.port );
                                    }, function( error ) {
                                        $cordovaToast.showShortBottom( error );
                                    } );
                            } );
                    } );
            } else {
                var blnSSL = 'https:' === document.location.protocol ? true : false;
                ENV.ssl = blnSSL ? '1' : '0';
                ENV.website = appendProtocol( ENV.website, blnSSL, ENV.port );
                ENV.api = appendProtocol( ENV.api, blnSSL, ENV.port );
            }
            if ( window.StatusBar ) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        } );
        $ionicPlatform.registerBackButtonAction( function( e ) {
            /*
            if ($cordovaKeyboard.isVisible()) {
                $cordovaKeyboard.close();
            }
            */
            // Is there a page to go back to $state.include
            if ( $state.includes( 'index.main' ) || $state.includes( 'index.login' ) || $state.includes( 'splash' ) ) {
                if ( $rootScope.backButtonPressedOnceToExit ) {
                    ionic.Platform.exitApp();
                } else {
                    $rootScope.backButtonPressedOnceToExit = true;
                    $cordovaToast.showShortBottom( 'Press again to exit.' );
                    setTimeout( function() {
                        $rootScope.backButtonPressedOnceToExit = false;
                    }, 2000 );
                }
            } else if (
                $state.includes( 'grDetail' ) ||
                $state.includes( 'putawayDetail' ) ||
                $state.includes( 'gtTo' ) ||
                $state.includes( 'gtFrom' ) ||
                $state.includes( 'pickingDetail' ) ||
                $state.includes( 'vginDetail' ) ) {
                if ( $rootScope.backButtonPressedOnceToExit ) {
                    if ( $ionicHistory.backView() ) {
                        $ionicHistory.goBack();
                    } else {
                        if ( $state.includes( 'grDetail' ) ) {
                            $state.go( 'grList', {} );
                        } else if ( $state.includes( 'putawayDetail' ) ) {
                            $state.go( 'putawayList', {} );
                        } else if ( $state.includes( 'gtTo' ) ) {
                            $state.go( 'gtFrom', {} );
                        } else if ( $state.includes( 'gtFrom' ) ) {
                            $state.go( 'index.main', {} );
                        } else if ( $state.includes( 'pickingDetail' ) ) {
                            $state.go( 'pickingList', {} );
                        } else if ( $state.includes( 'vginDetail' ) ) {
                            $state.go( 'vginList', {} );
                        }
                    }
                } else {
                    $rootScope.backButtonPressedOnceToExit = true;
                    $cordovaToast.showShortBottom( 'Press again to return.' );
                    setTimeout( function() {
                        $rootScope.backButtonPressedOnceToExit = false;
                    }, 2000 );
                }
            } else if ( $ionicHistory.backView() ) {
                $ionicHistory.goBack();
            } else {
                // This is the last page: Show confirmation popup
                $rootScope.backButtonPressedOnceToExit = true;
                $cordovaToast.showShortBottom( 'Press again to exit.' );
                setTimeout( function() {
                    $rootScope.backButtonPressedOnceToExit = false;
                }, 2000 );
            }
            e.preventDefault();
            return false;
        }, 101 );
    } ] );

app.config( [ '$httpProvider', '$stateProvider', '$urlRouterProvider', '$ionicConfigProvider',
    function( $httpProvider, $stateProvider, $urlRouterProvider, $ionicConfigProvider ) {
        //$httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
        $ionicConfigProvider.backButton.previousTitleText( false );
        $stateProvider
            .state( 'index', {
                url: '',
                abstract: true,
                templateUrl: 'view/menu.html',
                controller: 'IndexCtrl'
            } )
            .state( 'splash', {
                url: '/splash',
                cache: 'false',
                templateUrl: 'view/splash.html',
                controller: 'SplashCtrl'
            } )
            .state( 'index.login', {
                url: '/login',
                views: {
                    'menuContent': {
                        templateUrl: 'view/login.html',
                        controller: 'LoginCtrl'
                    }
                }
            } )
            .state( 'index.setting', {
                url: '/setting',
                views: {
                    'menuContent': {
                        templateUrl: 'view/setting.html',
                        controller: 'SettingCtrl'
                    }
                }
            } )
            .state( 'index.update', {
                url: '/update/:Version',
                views: {
                    'menuContent': {
                        templateUrl: 'view/update.html',
                        controller: 'UpdateCtrl'
                    }
                }
            } )
            .state( 'index.main', {
                url: '/main',
                views: {
                    'menuContent': {
                        templateUrl: 'view/main.html',
                        controller: 'MainCtrl'
                    }
                }
            } )
            .state( 'grList', {
                url: '/gr/list',
                templateUrl: 'view/GoodsReceipt/list.html',
                controller: 'GrListCtrl'
            } )
            .state( 'grDetail', {
                url: '/gr/detail/:CustomerCode/:TrxNo/:GoodsReceiptNoteNo',
                cache: 'false',
                templateUrl: 'view/GoodsReceipt/detail.html',
                controller: 'GrDetailCtrl'
            } )
            .state( 'vginList', {
                url: '/vgin/list',
                templateUrl: 'view/VerifyGIN/list.html',
                controller: 'VginListCtrl'
            } )
            .state( 'vginDetail', {
                url: '/vgin/detail/:CustomerCode/:TrxNo/:GoodsIssueNoteNo',
                cache: 'false',
                templateUrl: 'view/VerifyGIN/detail.html',
                controller: 'VginDetailCtrl'
            } )
            .state( 'pickingList', {
                url: '/picking/list',
                templateUrl: 'view/Picking/list.html',
                controller: 'PickingListCtrl'
            } )
            .state( 'pickingDetail', {
                url: '/picking/detail/:CustomerCode/:TrxNo/:GoodsIssueNoteNo',
                cache: 'false',
                templateUrl: 'view/Picking/detail.html',
                controller: 'PickingDetailCtrl'
            } )
            .state( 'putawayList', {
                url: '/putaway/list',
                templateUrl: 'view/Putaway/list.html',
                controller: 'PutawayListCtrl'
            } )
            .state( 'putawayDetail', {
                url: '/putaway/detail',
                cache: 'false',
                templateUrl: 'view/Putaway/detail.html',
                controller: 'PutawayDetailCtrl'
            } )
            .state( 'gtList', {
                url: '/gt/list',
                cache: 'false',
                templateUrl: 'view/GoodsTransfer/list.html',
                controller: 'GtListCtrl'
            } )
            .state( 'gtFrom', {
                url: '/gt/from',
                cache: 'false',
                templateUrl: 'view/GoodsTransfer/from.html',
                controller: 'GtFromCtrl'
            } )
            .state( 'gtTo', {
                url: '/gt/to',
                cache: 'false',
                templateUrl: 'view/GoodsTransfer/to.html',
                controller: 'GtToCtrl'
            } );
        $urlRouterProvider.otherwise( '/login' );
    } ] );

app.constant( '$ionicLoadingConfig', {
    template: 'Loading...'
} );
