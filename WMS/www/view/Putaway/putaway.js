appControllers.controller( 'PutawayDetailCtrl', [ '$scope', '$stateParams', '$state', '$timeout', '$ionicHistory', '$ionicLoading', '$ionicPopup', '$ionicModal', '$cordovaToast', '$cordovaBarcodeScanner', 'ApiService',
    function( $scope, $stateParams, $state, $timeout, $ionicHistory, $ionicLoading, $ionicPopup, $ionicModal, $cordovaToast, $cordovaBarcodeScanner, ApiService ) {
        var alertPopup = null,
            alertPopupTitle = '',
            hmImpm1 = new HashMap();
        $scope.Detail = {
            Scan:{
                Qty: 0,
                SerialNo:'',
                StoreNo:''
            },
            Impm1: {},
            Impr1: {
                ProductCode : '',
                ProductDescription : '',
                SerialNo : ''
            },
            Impm1sDb: {}
        };
        $ionicModal.fromTemplateUrl( 'scan.html', {
            scope: $scope,
            animation: 'slide-in-up'
        } ).then( function( modal ) {
            $scope.modal = modal;
        } );
        $scope.$on( '$destroy', function() {
            $scope.modal.remove();
        } );
        var showPopup = function( title, type, callback ){
            if (alertPopup != null) {
                alertPopup.close();
                alertPopup = null;
            }
            alertPopup = $ionicPopup.alert( {
                title: title,
                okType: 'button-' + type
            } );
            alertPopup.then(function(res){
                if( typeof(callback) == 'function') callback(res);
            });
        };
        var setScanQty = function( serialno, storeno, impm1 ) {
            impm1.ScanQty += 1;
            impm1.StoreNo = storeno;
            hmImpm1.remove( serialno );
            hmImpm1.set( serialno, impm1 );
            db_update_Impm1_Putaway(impm1);
            $scope.Detail.Scan.Qty = impm1.ScanQty;
            $scope.Detail.Scan.SerialNo = '';
        };
        var showImpr = function( serialno ) {
            if ( !hmImpm1.has( serialno ) ) {
                var strUri = '/api/wms/impm1/putaway?SerialNo=' + serialno;
                ApiService.GetParam( strUri, true ).then( function success( result ) {
                    var impm1 = null;
                    if(result.data.results.length > 0){
                        impm1 = result.data.results[0];
                    }
                    if(is.existy(impm1)){
                        hmImpm1.set( impm1.SerialNo.toLowerCase(), impm1 );
                        db_add_Impm1_Putaway( impm1 );
                        $scope.Detail.Impr1 = {
                            ProductCode : impm1.ProductCode,
                            ProductDescription : impm1.ProductDescription,
                            SerialNo : serialno
                        };
                        setScanQty( serialno, $scope.Detail.Scan.StoreNo, impm1 );
                    }else{
                        showPopup('Invalid Serial No', 'assertive');
                    }
                });
            }
        };
        $scope.openCam = function( type ) {
            if ( is.equal( type, 'StoreNo' ) ) {
                $cordovaBarcodeScanner.scan().then( function( imageData ) {
                    $scope.Detail.Scan.StoreNo = imageData.text;
                    $( '#txt-barcode' ).focus();
                }, function( error ) {
                    $cordovaToast.showShortBottom( error );
                } );
            } else if ( is.equal( type, 'SerialNo' ) ) {
                if ( $( '#txt-sn' ).attr( 'readonly' ) != 'readonly' ) {
                    $cordovaBarcodeScanner.scan().then( function( imageData ) {
                        $scope.Detail.Scan.SerialNo = imageData.text;
                        ShowSn( $scope.Detail.Scan.SerialNo, false );
                    }, function( error ) {
                        $cordovaToast.showShortBottom( error );
                    } );
                }
            }
        };
        $scope.openModal = function() {
            $scope.modal.show();
            $ionicLoading.show();
            if ( dbWms ) {
                dbWms.transaction( function( tx ) {
                    dbSql = 'Select * from Impm1_Putaway';
                    tx.executeSql( dbSql, [], function( tx, results ) {
                        $scope.Detail.Impm1sDb = new Array();
                        for ( var i = 0; i < results.rows.length; i++ ) {
                            var impm1 = {
                                TrxNo : results.rows.item( i ).TrxNo,
                                BatchNo : results.rows.item( i ).BatchNo,
                                BatchLineItemNo : results.rows.item( i ).BatchLineItemNo,
                                StoreNo : results.rows.item( i ).StoreNo,
                                ProductCode : results.rows.item( i ).ProductCode,
                                ScanQty : results.rows.item( i ).ScanQty > 0 ? results.rows.item( i ).ScanQty : 0,
                                SerialNo : results.rows.item( i ).SerialNo
                            };
                            $scope.Detail.Impm1sDb.push( impm1 );
                        }
                        $ionicLoading.hide();
                    }, dbError )
                } );
            }
        };
        $scope.closeModal = function() {
            $scope.Detail.Impm1sDb = {};
            $scope.modal.hide();
        };
        $scope.returnMain = function() {
            $state.go( 'index.main', {}, {
                reload: true
            } );
        };
        $scope.clearInput = function( type ) {
            if ( is.equal( type, 'StoreNo' ) ) {
                $scope.Detail.Scan.StoreNo = '';
                $( '#txt-storeno' ).select();
            } else if ( is.equal( type, 'SerialNo' ) ) {
                $scope.Detail.Scan.SerialNo = '';
                $( '#txt-sn' ).select();
            }
        };
        $scope.changeQty = function() {
            if ( hmImpm1.count() > 0 ) {
                var impm1 = hmImpm1.get( $scope.Detail.Impr1.SerialNo );
                var promptPopup = $ionicPopup.show( {
                    template: '<input type="number" ng-model="Detail.Scan.Qty">',
                    title: 'Enter Qty',
                    subTitle: 'Are you sure to change Qty manually?',
                    scope: $scope,
                    buttons: [ {
                        text: 'Cancel'
                    }, {
                        text: '<b>Save</b>',
                        type: 'button-positive',
                        onTap: function( e ) {
                            impm1.ScanQty = $scope.Detail.Scan.Qty;
                            db_update_Impm1_Putaway( impm1 );
                        }
                    } ]
                } );
            }
        };
        $scope.checkConfirm = function() {
            if ( dbWms ) {
                dbWms.transaction( function( tx ) {
                    dbSql = 'Select * from Impm1_Putaway';
                    tx.executeSql( dbSql, [], function( tx, results ) {
                        var len = results.rows.length;
                        if ( len > 0 ) {
                            $ionicLoading.show();
                            for ( var i = 0; i < len; i++ ) {
                                var impm1 = results.rows.item( i );
                                var strUri = '/api/wms/impm1/putaway/update?TrxNo=' + impm1.TrxNo + '&StoreNo=' + impm1.StoreNo + '&ScanQty=' + impm1.ScanQty;
                                ApiService.GetParam( strUri, false ).then( function success( result ) {

                                } );
                            }
                            $ionicLoading.hide();
                            showPopup('Confirm success','calm',function(res){
                                db_del_Impm1_Putaway();
                                $scope.returnMain();
                            });
                        }
                        else{
                            showPopup('No Product to Putaway', 'assertive');
                        }
                    }, dbError )
                } );
            }
        };
        $( '#txt-storeno' ).on( 'keydown', function( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                if (alertPopup === null) {
                    if(is.not.empty($scope.Detail.Scan.StoreNo)){
                        $('#txt-sn').focus();
                    }else{
                        showPopup('Store No can not be empty','assertive');
                    }
                } else {
                    alertPopup.close();
                    alertPopup = null;
                }
            }
        } );
        $( '#txt-sn' ).on( 'keydown', function( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                if (alertPopup === null) {
                    if(is.not.empty($scope.Detail.Scan.StoreNo)){
                        if(is.not.empty($scope.Detail.Scan.SerialNo)){
                            showImpr( $scope.Detail.Scan.SerialNo.toLowerCase() );
                        }else{
                            showPopup('Serial No can not be empty','assertive');
                        }
                    }else{
                        showPopup('Store No can not be empty','assertive');
                    }
                } else {
                    alertPopup.close();
                    alertPopup = null;
                }
            }
        } );
    } ] );
