'use strict';
var appService = angular.module( 'WMSAPP.services', [
    'ionic',
    'ngCordova.plugins.toast',
    'ngCordova.plugins.file',
    'ngCordova.plugins.fileTransfer',
    'ngCordova.plugins.fileOpener2',
    'ngCordova.plugins.inAppBrowser',
    'WMSAPP.config'
] );

appService.service( 'ApiService', [ '$q', 'ENV', '$http', '$ionicLoading', '$ionicPopup', '$timeout',
    function( $q, ENV, $http, $ionicLoading, $ionicPopup, $timeout ) {
        this.Post = function( requestUrl, requestData, blnShowLoad ) {
            if ( blnShowLoad ) {
                $ionicLoading.show();
            }
            var deferred = $q.defer();
            var url = ENV.api + requestUrl;
            console.log( url );
            var config = {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
            };
            $http.post( url, requestData, config ).success( function( data, status, headers, config, statusText ) {
                if ( blnShowLoad ) {
                    $ionicLoading.hide();
                }
                deferred.resolve( data );
            } ).error( function( data, status, headers, config, statusText ) {
                if ( blnShowLoad ) {
                    $ionicLoading.hide();
                }
                deferred.reject( data );
                console.log( data );
            } );
            return deferred.promise;
        };
        this.Get = function( requestUrl, blnShowLoad ) {
            if ( blnShowLoad ) {
                $ionicLoading.show();
            }
            var deferred = $q.defer();
            var url = ENV.api + requestUrl + "?format=json";
            console.log( url );
            $http.get( url ).success( function( data, status, headers, config, statusText ) {
                if ( blnShowLoad ) {
                    $ionicLoading.hide();
                }
                deferred.resolve( data );
            } ).error( function( data, status, headers, config, statusText ) {
                if ( blnShowLoad ) {
                    $ionicLoading.hide();
                }
                deferred.reject( data );
                console.log( data );
            } );
            return deferred.promise;
        };
        this.GetParam = function( requestUrl, blnShowLoad ) {
            if ( blnShowLoad ) {
                $ionicLoading.show();
            }
            var deferred = $q.defer();
            var url = ENV.api + requestUrl + "&format=json";
            console.log( url );
            $http.get( url ).success( function( data, status, headers, config, statusText ) {
                if ( blnShowLoad ) {
                    $ionicLoading.hide();
                }
                deferred.resolve( data );
            } ).error( function( data, status, headers, config, statusText ) {
                if ( blnShowLoad ) {
                    $ionicLoading.hide();
                }
                deferred.reject( data );
                console.log( data );
            } );
            return deferred.promise;
        };
    } ] );

appService.service( 'DownloadFileService', [ 'ENV', '$http', '$timeout', '$ionicLoading', '$cordovaToast', '$cordovaFile', '$cordovaFileTransfer', '$cordovaFileOpener2',
    function( ENV, $http, $timeout, $ionicLoading, $cordovaToast, $cordovaFile, $cordovaFileTransfer, $cordovaFileOpener2 ) {
        this.Download = function( url, fileName, fileType, onPlatformError, onCheckError, onDownloadError ) {
            $ionicLoading.show( {
                template: "Download  0%"
            } );
            var blnError = false;
            if ( !ENV.fromWeb ) {
                var targetPath = cordova.file.externalRootDirectory + '/' + ENV.rootPath + '/' + fileName;
                var trustHosts = true;
                var options = {};
                $cordovaFileTransfer.download( url, targetPath, trustHosts, options ).then( function( result ) {
                    $ionicLoading.hide();
                    $cordovaFileOpener2.open( targetPath, fileType ).then( function() {
                        // success
                    }, function( err ) {
                        // error
                    } ).catch( function( ex ) {
                        console.log( ex );
                    } );
                }, function( err ) {
                    $cordovaToast.showShortCenter( 'Download faild.' );
                    $ionicLoading.hide();
                    if ( onDownloadError ) onDownloadError();
                }, function( progress ) {
                    $timeout( function() {
                        var downloadProgress = ( progress.loaded / progress.total ) * 100;
                        $ionicLoading.show( {
                            template: 'Download  ' + Math.floor( downloadProgress ) + '%'
                        } );
                        if ( downloadProgress > 99 ) {
                            $ionicLoading.hide();
                        }
                    } )
                } ).catch( function( ex ) {
                    console.log( ex );
                } );
            } else {
                $ionicLoading.hide();
                if( typeof(onPlatformError) == 'function') onPlatformError(url);
            }
        };
    } ] );
