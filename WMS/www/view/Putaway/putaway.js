appControllers.controller( 'PutawayListCtrl', ['$scope', '$stateParams', '$state', '$ionicPopup', 'ApiService',
    function( $scope, $stateParams, $state, $ionicPopup, ApiService ) {
        var alertPopup = null,
            alertPopupTitle = '';
        $scope.Rcbp1 = {};
        $scope.GrnNo = {};
        $scope.Imgr1s = {};
        $scope.refreshRcbp1 = function( BusinessPartyName ) {
            var strUri = '/api/wms/rcbp1?BusinessPartyName=' + BusinessPartyName;
            ApiService.GetParam( strUri, false ).then( function success( result ) {
                $scope.Rcbp1s = result.data.results;
            } );
        };
        $scope.refreshGrnNos = function( Grn ) {
            var strUri = '/api/wms/imgr1?StatusCode=EXE&GoodsReceiptNoteNo=' + Grn;
            ApiService.GetParam( strUri, false ).then( function success( result ) {
                $scope.GrnNos = result.data.results;
            } );
        };
        $scope.ShowImgr1 = function( Customer ) {
            var strUri = '/api/wms/imgr1?StatusCode=EXE&CustomerCode=' + Customer;
            ApiService.GetParam( strUri, true ).then( function success( result ) {
                $scope.Imgr1s = result.data.results;
                if ( window.cordova && window.cordova.plugins.Keyboard ) {
                    cordova.plugins.Keyboard.close();
                }
                $( '#div-grt-list' ).focus();
            } );
        };
        $scope.showDate = function( utc ) {
            return moment( utc ).format( 'DD-MMM-YYYY' );
        };
        $scope.GoToDetail = function( Imgr1 ) {
            if ( Imgr1 != null ) {
                $state.go( 'putawayDetail', {
                    'CustomerCode': Imgr1.CustomerCode,
                    'TrxNo': Imgr1.TrxNo,
                    'GoodsReceiptNoteNo': Imgr1.GoodsReceiptNoteNo
                }, {
                    reload: true
                } );
            }
        };
        $scope.returnMain = function() {
            $state.go( 'index.main', {}, {
                reload: true
            } );
        };
        $( '#div-list-rcbp' ).on( 'focus', ( function() {
            if ( window.cordova && window.cordova.plugins.Keyboard ) {
                cordova.plugins.Keyboard.close();
            }
        } ) );
        $( '#div-list-rcbp' ).focus();
    } ] );

appControllers.controller( 'PutawayDetailCtrl', [ '$scope', '$stateParams', '$state', '$timeout', '$ionicHistory', '$ionicLoading', '$ionicPopup', '$ionicModal', '$cordovaToast', '$cordovaBarcodeScanner', 'ApiService',
    function( $scope, $stateParams, $state, $timeout, $ionicHistory, $ionicLoading, $ionicPopup, $ionicModal, $cordovaToast, $cordovaBarcodeScanner, ApiService ) {
        var alertPopup = null,
            alertPopupTitle = '',
            hmImgr2 = new HashMap(),
            hmImsn1 = new HashMap(),
            arrStoreNo = null;
        $scope.Detail = {
            Scan:{
                Qty: 0,
                SerialNo:'',
                StoreNo:''
            },
            Customer: $stateParams.CustomerCode,
            GRN: $stateParams.GoodsReceiptNoteNo,
            TrxNo: $stateParams.TrxNo,
            Impr1: {
                ProductCode : '',
                ProductDescription : '',
                SerialNo : ''
            },
            Imgr2s: {},
            Imgr2sDb: {}
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
        var setScanQty = function( serialno, storeno, imgr2 ) {
            imgr2.ScanQty += 1;
            imgr2.StoreNo = storeno;
            hmImgr2.remove( serialno );
            hmImgr2.set( serialno, imgr2 );
            db_update_Imgr2_Putaway(imgr2);
            $scope.Detail.Scan.Qty = imgr2.ScanQty;
            $scope.Detail.Scan.SerialNo = '';
            $scope.$apply();
        };
        var showImpr = function( serialno ) {
            if ( hmImgr2.has( serialno ) ) {
                var imgr2 = hmImgr2.get( serialno ),
                    storeno = $scope.Detail.Scan.StoreNo;
                $scope.Detail.Impr1 = {
                    ProductCode : imgr2.ProductCode,
                    ProductDescription : imgr2.ProductDescription,
                    SerialNo : serialno
                };
                setScanQty( serialno, storeno, imgr2 );
            } else {
                showPopup('Invalid Serial No', 'assertive');
            }
        };
        var sendConfirm = function() {
            $ionicLoading.show();
            if ( dbWms ) {
                dbWms.transaction( function( tx ) {
                    dbSql = 'Select * from Imgr2_Putaway';
                    tx.executeSql( dbSql, [], function( tx, results ) {
                        var len = results.rows.length;
                        if ( len > 0 ) {
                            for ( var i = 0; i < len; i++ ) {
                                var strUri = '/api/wms/imgr2/putaway/update?GoodsReceiptNoteNo=' + $scope.Detail.GRN + '&StoreNo=' + results.rows.item( i ).StoreNo + '&TrxNo=' + results.rows.item( i ).TrxNo + '&LineItemNo=' + results.rows.item( i ).LineItemNo;
                                ApiService.GetParam( strUri, false ).then( function success( result ) {

                                } );
                            }
                            $ionicLoading.hide();
                            showPopup('Confirm success','calm',function(res){
                                $scope.returnList();
                            });
                        }
                    }, dbError );
                } );
            }
        };
        var onErrorConfirm = function(){
            var checkPopup = $ionicPopup.show( {
                title: 'Scanned Qty does not match GRN Qty',
                buttons: [{
                    text: '<b>Check</b>',
                    type: 'button-assertive',
                    onTap: function( e ) {
                        checkPopup.close();
                        $scope.openModal();
                    }
                } ]
            } );
        };
        var GetImgr2s = function( GoodsReceiptNoteNo ) {
            var strUri = '/api/wms/imgr2/putaway?GoodsReceiptNoteNo=' + GoodsReceiptNoteNo;
            ApiService.GetParam( strUri, true ).then( function success( result ) {
                $scope.Detail.Imgr2s = result.data.results;
                db_del_Imgr2_Putaway();
                arrStoreNo = new Array();
                for ( var i = 0; i < $scope.Detail.Imgr2s.length; i++ ) {
                    var storeno = $scope.Detail.Imgr2s[ i ].StoreNo;
                    if(!is.inArray(storeno,arrStoreNo)){
                        arrStoreNo.push(storeno);
                    }
                    hmImgr2.set( $scope.Detail.Imgr2s[ i ].SerialNo.toLowerCase(), $scope.Detail.Imgr2s[ i ] );
                    db_add_Imgr2_Putaway( $scope.Detail.Imgr2s[ i ] );
                }
            } );
        };
        $scope.openCam = function( type ) {
            if ( is.equal( type, 'StoreNo' ) ) {
                $cordovaBarcodeScanner.scan().then( function( imageData ) {
                    $scope.Detail.Scan.StoreNo = imageData.text;
                    $( '#txt-barcode' ).focus();
                }, function( error ) {
                    $cordovaToast.showShortBottom( error );
                } );
            } else if ( is.equal( type, 'BarCode' ) ) {
                $cordovaBarcodeScanner.scan().then( function( imageData ) {
                    $scope.Detail.Scan.BarCode = imageData.text;
                    ShowProduct( $scope.Detail.Scan.BarCode, true );
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
                    dbSql = 'Select * from Imgr2_Putaway';
                    tx.executeSql( dbSql, [], function( tx, results ) {
                        $scope.Detail.Imgr2sDb = new Array();
                        for ( var i = 0; i < results.rows.length; i++ ) {
                            var imgr2 = {
                                TrxNo : results.rows.item( i ).TrxNo,
                                LineItemNo : results.rows.item( i ).LineItemNo,
                                StoreNo : results.rows.item( i ).StoreNo,
                                ProductCode : results.rows.item( i ).ProductCode,
                                ScanQty : results.rows.item( i ).ScanQty > 0 ? results.rows.item( i ).ScanQty : 0,
                                SerialNo : results.rows.item( i ).SerialNo,
                                ActualQty : 0
                            };
                            switch ( results.rows.item( i ).DimensionFlag ) {
                                case '1':
                                    imgr2.ActualQty = results.rows.item( i ).PackingQty;
                                    break;
                                case '2':
                                    imgr2.ActualQty = results.rows.item( i ).WholeQty;
                                    break;
                                default:
                                    imgr2.ActualQty = results.rows.item( i ).LooseQty;
                            }
                            $scope.Detail.Imgr2sDb.push( imgr2 );
                        }
                        $ionicLoading.hide();
                    }, dbError )
                } );
            }
        };
        $scope.closeModal = function() {
            $scope.Detail.Imgr2sDb = {};
            $scope.modal.hide();
        };
        $scope.returnList = function() {
            if ( $ionicHistory.backView() ) {
                $ionicHistory.goBack();
            } else {
                $state.go( 'putawayList', {}, {
                    reload: true
                } );
            }
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
            if ( hmImgr2.count() > 0 ) {
                var imgr2 = hmImgr2.get( $scope.Detail.Impr1.SerialNo );
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
                            imgr2.ScanQty = $scope.Detail.Scan.Qty;
                            db_update_Imgr2_Putaway( imgr2 );
                        }
                    } ]
                } );
            }
        };
        $scope.checkConfirm = function() {
            if ( dbWms ) {
                dbWms.transaction( function( tx ) {
                    dbSql = 'Select * from Imgr2_Putaway';
                    tx.executeSql( dbSql, [], function( tx, results ) {
                        var len = results.rows.length;
                        if ( len > 0 ) {
                            $ionicLoading.show();
                            var blnDiscrepancies = false;
                            for ( var i = 0; i < len; i++ ) {
                                var imgr2 = {
                                    TrxNo : results.rows.item( i ).TrxNo,
                                    LineItemNo : results.rows.item( i ).LineItemNo,
                                    ProductCode : results.rows.item( i ).ProductCode,
                                    ScanQty : results.rows.item( i ).ScanQty,
                                    SerialNo : results.rows.item( i ).SerialNo,
                                    Qty : 0
                                };
                                if ( imgr2.SerialNo != null && imgr2.SerialNo.length > 0 ) {
                                    switch ( results.rows.item( i ).DimensionFlag ) {
                                        case '1':
                                            imgr2.Qty = results.rows.item( i ).PackingQty;
                                            break;
                                        case '2':
                                            imgr2.Qty = results.rows.item( i ).WholeQty;
                                            break;
                                        default:
                                            imgr2.Qty = results.rows.item( i ).LooseQty;
                                    }
                                    if ( imgr2.Qty != imgr2.ScanQty ) {
                                        console.log( 'Product (' + imgr2.ProductCode + ') Qty not equal.' );
                                        blnDiscrepancies = true;
                                    }
                                } else {
                                    blnDiscrepancies = true;
                                }
                            }
                            if ( blnDiscrepancies ) {
                                $ionicLoading.hide();
                                onErrorConfirm();
                            } else {
                                sendConfirm();
                            }
                        }
                        else{
                            $ionicLoading.hide();
                            onErrorConfirm();
                        }
                    }, dbError )
                } );
            }
        };
        GetImgr2s( $scope.Detail.GRN );
        $( '#txt-storeno' ).on( 'keydown', function( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                if (alertPopup === null) {
                    $('#txt-sn').focus();
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
                        showImpr( $scope.Detail.Scan.SerialNo.toLowerCase() );
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
