appControllers.controller( 'PutawayListCtrl', ['$scope', '$stateParams', '$state', '$ionicPopup', 'ApiService',
    function( $scope, $stateParams, $state, $ionicPopup, ApiService ) {
        var alertPopup = null;
        var alertPopupTitle = '';
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
        var alertPopup = null;
        var alertPopupTitle = '';
        var hmImgr2 = new HashMap();
        var hmImsn1 = new HashMap();
        var arrStoreNo = null;
        var arrBarCode = null;
        $scope.Detail = {
            Scan:{
                Qty: 0,
                BarCode: '',
                SerialNo:'',
                StoreNo:''
            },
            Customer: $stateParams.CustomerCode,
            GRN: $stateParams.GoodsReceiptNoteNo,
            TrxNo: $stateParams.TrxNo,
            Impr1: {},
            Imgr2s: {},
            Imgr2sDb: {},
            Whwh2s: {}
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
        var setScanQty = function( barcode, imgr2 ) {
            if ( imgr2.SerialNoFlag != null && imgr2.SerialNoFlag === 'Y' ) {
                $scope.Detail.Scan.Qty = imgr2.ScanQty;
                $( '#txt-sn' ).removeAttr( 'readonly' );
                $( '#txt-sn' ).select();
            } else {
                imgr2.ScanQty += 1;
                imgr2.StoreNo = $scope.Detail.Scan.StoreNo;
                hmImgr2.remove( barcode );
                hmImgr2.set( barcode, imgr2 );
                $scope.Detail.Scan.Qty = imgr2.ScanQty;
				
                //$( '#div-barcode' ).focus();
                if ( dbWms ) {
                    dbWms.transaction( function( tx ) {
                        dbSql = 'Update Imgr2_Putaway set ScanQty=?,StoreNo=? Where TrxNo=? and LineItemNo=?';
                        tx.executeSql( dbSql, [ imgr2.ScanQty, imgr2.StoreNo, imgr2.TrxNo, imgr2.LineItemNo ], null, dbError );
                    } );
                }
                //$( '#txt-barcode' ).select();
            }
        };
        var getImpr = function( barcode, imgr2 ) {
            $scope.Detail.Impr1.ProductCode = imgr2.ProductCode;
            $scope.Detail.Impr1.ProductDescription = imgr2.ProductDescription;			
            setScanQty( barcode, imgr2 );
			$scope.$apply();
        }
        var showImpr = function( barcode, blnScan ) {
            //barcode = barcode.replace( /[^0-9/d]/g, '' );
            if ( hmImgr2.count() > 0 ) {
                if ( hmImgr2.has( barcode ) ) {
                    var imgr2 = hmImgr2.get( barcode );
                    getImpr( barcode, imgr2 );
                } else {
                    //getImpr( barcode );
                }
            } else {
                //getImpr( barcode );
            }
        };
        var checkSn = function( sn, SnArray ) {
            var blnExistSn = false;
            for ( var i = 0; i < SnArray.length; i++ ) {
                if ( SnArray[ i ].toString() === sn ) {
                    blnExistSn = true;
                    break;
                }
            }
            return blnExistSn;
        };
        var setSnQty = function( sn, SnArray, mapValue ) {
            if ( SnArray.length > 1 ) {
                if ( checkSn( sn, SnArray ) ) {
                    return;
                }
            }
            SnArray.push( sn );
            hmImsn1.remove( $scope.Detail.Scan.BarCode );
            hmImsn1.set( $scope.Detail.Scan.BarCode , SnArray );
            mapValue.ScanQty += 1;
            hmImgr2.remove( $scope.Detail.Scan.BarCode );
            hmImgr2.set( $scope.Detail.Scan.BarCode , mapValue );
            $scope.Detail.Scan.Qty = mapValue.ScanQty;
			$scope.$apply();
            if ( dbWms ) {
                dbWms.transaction( function( tx ) {
                    dbSql = 'INSERT INTO Imsn1 (ReceiptNoteNo, ReceiptLineItemNo, SerialNo) values(?, ?, ?)';
                    tx.executeSql( dbSql, [ $scope.Detail.GRN, mapValue.LineItemNo, sn ], null, null );
                    dbSql = 'Update Imgr2_Putaway set ScanQty=? Where TrxNo=? and LineItemNo=?';
                    tx.executeSql( dbSql, [ mapValue.ScanQty, mapValue.TrxNo, mapValue.LineItemNo ], null, dbError );
                } );
            }
            $( '#txt-sn' ).select();
        };
        var ShowSn = function( sn, blnScan ) {
            if ( sn != null && sn > 0 ) {
                if ( blnScan ) {
                    $scope.Detail.Scan.SerialNo = sn;
                }
                var mapBcValue = hmImgr2.get( $scope.Detail.Scan.BarCode );
                var SnArray = null;
                if ( hmImsn1.count() > 0 ) {
                    if ( hmImsn1.has( $scope.Detail.Scan.BarCode ) ) {
                        SnArray = hmImsn1.get( $scope.Detail.Scan.BarCode );
                    } else {
                        SnArray = new Array();
                        SnArray.push( sn );
                        hmImsn1.set( $scope.Detail.Scan.BarCode , SnArray );
                    }
                } else {
                    SnArray = new Array();
                    SnArray.push( sn );
                    hmImsn1.set( $scope.Detail.Scan.BarCode , SnArray );
                }
                setSnQty( sn, SnArray, mapBcValue );
            }
        };
        var updateQty = function( imgr2 ) {
            if ( dbWms ) {
                dbWms.transaction( function( tx ) {
                    dbSql = 'Update Imgr2_Putaway set ScanQty=? Where TrxNo=? and LineItemNo=?';
                    tx.executeSql( dbSql, [ $scope.Detail.Scan.Qty, imgr2.TrxNo, imgr2.LineItemNo ], null, dbError );
                } );
            }
        };
        var confirm = function() {
            if ( dbWms ) {
                dbWms.transaction( function( tx ) {
                    dbSql = 'Select * from Imgr2_Putaway';
                    tx.executeSql( dbSql, [], function( tx, results ) {
                        var len = results.rows.length;
                        if ( len > 0 ) {
                            $ionicLoading.show();
                            for ( var i = 0; i < len; i++ ) {
                                var strUri = '/api/wms/imgr2/putaway/update?StoreNo=' + results.rows.item( i ).StoreNo + '&TrxNo=' + results.rows.item( i ).TrxNo + '&LineItemNo=' + results.rows.item( i ).LineItemNo;
                                ApiService.GetParam( strUri, false ).then( function success( result ) {

                                } );
                            }
                            $ionicLoading.hide();
                        }
                    }, dbError );
                } );
            }
            var alertPopup = $ionicPopup.alert( {
                title: 'Comfirm success.',
                okType: 'button-calm'
            } );
            $timeout( function() {
                alertPopup.close();
                $scope.returnList();
            }, 2500 );
        };
        var checkBarCode = function(barcode){
            var blnNoError = false;
            if(is.inArray(barcode,arrBarCode)){
                blnNoError = true;
            }else{
                alertPopup = $ionicPopup.alert( {
                    title: 'Wrong Product.',
                    subTitle: 'It not belongs to this GRN.',
                    okType: 'button-assertive'
                } );
            }
            return blnNoError;
        }
        var GetImgr2s = function( GoodsReceiptNoteNo ) {
            var strUri = '/api/wms/imgr2/putaway?GoodsReceiptNoteNo=' + GoodsReceiptNoteNo;
            ApiService.GetParam( strUri, true ).then( function success( result ) {
                $scope.Detail.Imgr2s = result.data.results;
                db_del_Imgr2_Putaway();
                arrStoreNo = new Array();
                arrBarCode = new Array();
                if(is.array($scope.Detail.Imgr2s)){
                    for ( var i = 0; i < $scope.Detail.Imgr2s.length; i++ ) {
                        var storeno = $scope.Detail.Imgr2s[ i ].StoreNo;
                        if(!is.inArray(storeno,arrStoreNo)){
                            arrStoreNo.push(storeno);
                        }
                        var barcode = $scope.Detail.Imgr2s[ i ].BarCode;
                        if(!is.inArray(barcode,arrBarCode)){
                            arrBarCode.push(barcode);
                        }
                        var imgr2_Db = {
                            TrxNo: $scope.Detail.Imgr2s[ i ].TrxNo,
                            LineItemNo: $scope.Detail.Imgr2s[ i ].LineItemNo,
                            StoreNo: $scope.Detail.Imgr2s[ i ].StoreNo,
                            ProductCode: $scope.Detail.Imgr2s[ i ].ProductCode,
                            ProductDescription: $scope.Detail.Imgr2s[ i ].ProductDescription,
                            ScanQty:0
                        }
                        hmImgr2.set( barcode, imgr2_Db);
                        db_add_Imgr2_Putaway( $scope.Detail.Imgr2s[ i ] );
                    }
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
            if ( dbWms ) {
                dbWms.transaction( function( tx ) {
                    dbSql = 'Select * from Imgr2_Putaway';
                    tx.executeSql( dbSql, [], function( tx, results ) {
                        var arr = new Array();
                        for ( var i = 0; i < results.rows.length; i++ ) {
                            var objImgr2 = {};
                            objImgr2.TrxNo = results.rows.item( i ).TrxNo;
                            objImgr2.LineItemNo = results.rows.item( i ).LineItemNo;
                            objImgr2.StoreNo = results.rows.item( i ).StoreNo;
                            objImgr2.ProductCode = results.rows.item( i ).ProductCode;
                            if ( results.rows.item( i ).ScanQty > 0 ) {
                                objImgr2.ScanQty = results.rows.item( i ).ScanQty;
                            } else {
                                objImgr2.ScanQty = 0;
                            }
                            objImgr2.BarCode = results.rows.item( i ).BarCode;
                            switch ( results.rows.item( i ).DimensionFlag ) {
                                case '1':
                                    objImgr2.ActualQty = results.rows.item( i ).PackingQty;
                                    break;
                                case '2':
                                    objImgr2.ActualQty = results.rows.item( i ).WholeQty;
                                    break;
                                default:
                                    objImgr2.ActualQty = results.rows.item( i ).LooseQty;
                            }
                            arr.push( objImgr2 );
                        }
                        $scope.Detail.Imgr2sDb = arr;
                    }, dbError )
                } );
            }
            $scope.modal.show();
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
            } else if ( is.equal( type, 'BarCode' ) ) {
                $scope.Detail.Scan.BarCode = '';
                $scope.Detail.Scan.SerialNo = '';
                $scope.Detail.Scan.Qty = 0;
                $scope.Detail.Impr1 = {};
                $( '#txt-sn' ).attr( 'readonly', true );
                $( '#txt-barcode' ).select();
            } else if ( is.equal( type, 'SerialNo' ) ) {
                $scope.Detail.Scan.SerialNo = '';
                $( '#txt-sn' ).select();
            }
        };
        $scope.changeQty = function() {
            if ( $scope.Detail.Scan.Qty > 0 && $scope.Detail.Scan.BarCode .length > 0 ) {
                if ( hmImgr2.count() > 0 && hmImgr2.has( $scope.Detail.Scan.BarCode ) ) {
                    var imgr2 = hmImgr2.get( $scope.Detail.Scan.BarCode );
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
                                updateQty( imgr2 );
                            }
                        } ]
                    } );
                }
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
                                    BarCode : results.rows.item( i ).BarCode,
                                    Qty : 0
                                };
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
                                    break;
                                }
                            }
                            if ( blnDiscrepancies ) {
                                $ionicLoading.hide();
                                var checkPopup = $ionicPopup.show( {
                                    title: 'The following product has not yet putaway.',
                                    buttons: [ {
                                        text: 'Cancel',
                                        onTap: function( e ) {
                                            checkPopup.close();
                                        }
                                    }, {
                                        text: '<b>Check</b>',
                                        type: 'button-assertive',
                                        onTap: function( e ) {
                                            $timeout( function() {
                                                $scope.openModal();
                                            }, 250 );
                                            checkPopup.close();
                                        }
                                    } ]
                                } );
                            } else {
                                confirm();
                            }
                        }
                    }, dbError )
                } );
            }
        };
        GetImgr2s( $scope.Detail.GRN );
        /*
        var checkStoreNo = function(storeno){
            var blnNoError = false;
            if(is.inArray(storeno,arrStoreNo)){
                blnNoError = true;
            }else{
                alertPopup = $ionicPopup.alert( {
                    title: 'Wrong Loaction.',
                    //subTitle: '',
                    okType: 'button-assertive'
                } );
            }
            return blnNoError;
        }
        */
        $( '#txt-storeno' ).on( 'keydown', function( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                if (alertPopup === null) {
                    //if(checkStoreNo($scope.Detail.Scan.StoreNo)){
                        $('#txt-barcode').focus();
                    //}else{
                    //    $('#txt-storeno').focus();
                    //}
                } else {
                    alertPopup.close();
                    alertPopup = null;
                }
            }
        } );
        $( '#txt-barcode' ).on( 'keydown', function( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                if (alertPopup === null) {
                    if(checkBarCode($scope.Detail.Scan.BarCode)){
                        showImpr( $scope.Detail.Scan.BarCode , false );
                    }else{
                        $('#txt-barcode').focus();
                    }
                } else {
                    alertPopup.close();
                    alertPopup = null;
                }
            }
        } );
        $( '#txt-sn' ).on( 'keydown', function( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                ShowSn( $scope.Detail.Scan.SerialNo, false );
            }
        } );
    } ] );
