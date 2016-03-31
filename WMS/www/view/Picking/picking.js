appControllers.controller( 'PickingListCtrl', [ '$scope', '$stateParams', '$state', '$timeout', '$ionicPopup', 'ApiService',
    function( $scope, $stateParams, $state, $timeout, $ionicPopup, ApiService ) {
        $scope.Rcbp1 = {};
        $scope.GinNo = {};
        $scope.Imgi1s = {};
        $scope.refreshRcbp1 = function( BusinessPartyName ) {
            var strUri = '/api/wms/rcbp1?' + BusinessPartyName;
            ApiService.GetParam( strUri, true ).then( function success( result ) {
                $scope.Rcbp1s = result.data.results;
            } );
        };
        $scope.refreshGinNos = function( Grn ) {
            var strUri = '/api/wms/imgi1?GoodsIssueNoteNo=' + Grn;
            ApiService.GetParam( strUri, true ).then( function success( result ) {
                $scope.GinNos = result.data.results;
            } );
        };
        $scope.ShowImgi1 = function( Customer ) {
            var strUri = '/api/wms/imgi1?CustomerCode=' + Customer;
            ApiService.GetParam( strUri, true ).then( function success( result ) {
                $scope.Imgi1s = result.data.results;
                if ( window.cordova && window.cordova.plugins.Keyboard ) {
                    cordova.plugins.Keyboard.close();
                }
                $( '#div-vgin-list' ).focus();
            } );
        };
        $scope.showDate = function( utc ) {
            return moment( utc ).format( 'DD-MMM-YYYY' );
        };
        $scope.GoToDetail = function( Imgi1 ) {
            if ( Imgi1 != null ) {
                $state.go( 'vginDetail', {
                    'CustomerCode': Imgi1.CustomerCode,
                    'TrxNo': Imgi1.TrxNo,
                    'GoodsIssueNoteNo': Imgi1.GoodsIssueNoteNo
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

appControllers.controller( 'VginDetailCtrl', [ '$scope', '$stateParams', '$state', '$http', '$timeout', '$ionicHistory', '$ionicLoading', '$ionicPopup', '$cordovaToast', '$cordovaBarcodeScanner', 'ApiService',
    function( $scope, $stateParams, $state, $http, $timeout, $ionicHistory, $ionicLoading, $ionicPopup, $cordovaToast, $cordovaBarcodeScanner, ApiService ) {
        $scope.vginDetailImgi2 = {};
        $scope.vginDetailImsn1 = {};
        $scope.vginDetail = {};
        $scope.vginDetail.BarCodeScan = "";
        $scope.vginDetail.SerialNoScan = "";
        $scope.vginDetail.QtyBal = 0;
        $scope.vginDetail.QtyScan = 0;
        $scope.vginDetail.strCustomer = $stateParams.CustomerCode;
        $scope.vginDetail.strGIN = $stateParams.GoodsIssueNoteNo;
        var mapBarCodeScanQty = new HashMap();
        var mapSnScanQty = new HashMap();
        var mapSnSerialNo = new HashMap();
        var returnListFun = function() {
            if ( $ionicHistory.backView() ) {
                $ionicHistory.goBack();
            } else {
                $state.go( 'vginList', {}, {
                    reload: true
                } );
            }
        };
        $scope.returnList = returnListFun;
        $scope.CamScanBarCode = function() {
            $cordovaBarcodeScanner.scan().then( function( imageData ) {
                $scope.vginDetail.BarCodeScan = imageData.text;
                ShowProduct( $scope.vginDetail.BarCodeScan, true );
            }, function( error ) {
                $cordovaToast.showShortBottom( error );
            } );
        };
        $scope.CamScanSerialNo = function() {
            if ( $( '#txt-detail-sn' ).attr( "readonly" ) != "readonly" ) {
                $cordovaBarcodeScanner.scan().then( function( imageData ) {
                    $scope.vginDetail.SerialNoScan = imageData.text;
                    ShowSn( $scope.vginDetail.SerialNoScan, false );
                }, function( error ) {
                    $cordovaToast.showShortBottom( error );
                } );
            }
        };
        $scope.clearBarCode = function() {
            if ( $scope.vginDetail.BarCodeScan.length > 0 ) {
                $scope.vginDetail.BarCodeScan = "";
                $scope.vginDetail.SerialNoScan = "";
                $scope.vginDetail.QtyScan = 0;
                $( '#txt-detail-sn' ).attr( "readonly", true );
                $( '#txt-detail-barcode' ).select();
            }
        };
        $scope.clearSerialNo = function() {
            if ( $scope.vginDetail.SerialNoScan.length > 0 ) {
                $scope.vginDetail.SerialNoScan = "";
                $( '#txt-detail-sn' ).select();
            }
        };
        $scope.showImgi2Prev = function() {
            var blnHasPrev = false;
            var intLineItemNo = $scope.vginDetail.LineItemNo - 1;
            if ( $scope.vginDetailImgi2.length > 0 ) {
                for ( var i = 0; i < $scope.vginDetailImgi2.length; i++ ) {
                    if ( $scope.vginDetailImgi2[ i ].LineItemNo === intLineItemNo ) {
                        blnHasPrev = true;
                        break;
                    }
                }
            }
            if ( blnHasPrev ) {
                $scope.clearBarCode();
                showImgi2( intLineItemNo - 1 );
            } else {
                $cordovaToast.showShortBottom( "Already the first one." );
            }
        }
        $scope.showImgi2Next = function() {
            var blnHasNext = false;
            var intLineItemNo = $scope.vginDetail.LineItemNo + 1;
            if ( $scope.vginDetailImgi2.length > 0 ) {
                for ( var i = 0; i < $scope.vginDetailImgi2.length; i++ ) {
                    if ( $scope.vginDetailImgi2[ i ].LineItemNo === intLineItemNo ) {
                        blnHasNext = true;
                        break;
                    }
                }
            }
            if ( blnHasNext ) {
                $scope.clearBarCode();
                showImgi2( intLineItemNo - 1 );
            } else {
                $cordovaToast.showShortBottom( "Already the last one." );
            }
        }
        var showImgi2 = function( LineItemNo ) {
            if ( LineItemNo != null && $scope.vginDetailImgi2.length > 0 ) {
                $scope.vginDetail.TrxNo = $scope.vginDetailImgi2[ LineItemNo ].TrxNo;
                $scope.vginDetail.LineItemNo = $scope.vginDetailImgi2[ LineItemNo ].LineItemNo;
                $scope.vginDetail.StoreNo = $scope.vginDetailImgi2[ LineItemNo ].StoreNo;
                $scope.vginDetail.ProductCode = $scope.vginDetailImgi2[ LineItemNo ].ProductCode;
                $scope.vginDetail.ProductName = $scope.vginDetailImgi2[ LineItemNo ].ProductName;
                $scope.vginDetail.SerialNoFlag = $scope.vginDetailImgi2[ LineItemNo ].SerialNoFlag;
                $scope.vginDetail.BarCode = $scope.vginDetailImgi2[ LineItemNo ].UserDefine01;
                switch ( $scope.vginDetailImgi2[ LineItemNo ].DimensionFlag ) {
                    case '1':
                        $scope.vginDetail.Qty = $scope.vginDetailImgi2[ LineItemNo ].PackingQty;
                        break;
                    case '2':
                        $scope.vginDetail.Qty = $scope.vginDetailImgi2[ LineItemNo ].WholeQty;
                        break;
                    default:
                        $scope.vginDetail.Qty = $scope.vginDetailImgi2[ LineItemNo ].LooseQty;
                }
                if ( !mapBarCodeScanQty.isEmpty() ) {
                    if ( mapBarCodeScanQty.containsKey( $scope.vginDetail.BarCode ) ) {
                        $scope.vginDetail.QtyScan = mapBarCodeScanQty.get( $scope.vginDetail.BarCode );
                    }
                }
            }
        };
        var insertImgi2 = function( vginDetailImgi2Actual ) {
            var intTrxNo = vginDetailImgi2Actual.TrxNo;
            var intLineItemNo = vginDetailImgi2Actual.LineItemNo;
            var strStoreNo = vginDetailImgi2Actual.StoreNo;
            var strProductCode = vginDetailImgi2Actual.ProductCode;
            var intProductTrxNo = vginDetailImgi2Actual.ProductTrxNo;
            var strDimensionFlag = vginDetailImgi2Actual.DimensionFlag;
            var strProductName = vginDetailImgi2Actual.ProductName;
            var strSerialNoFlag = vginDetailImgi2Actual.SerialNoFlag;
            var strBarCode = vginDetailImgi2Actual.UserDefine01;
            var intPackingQty = vginDetailImgi2Actual.PackingQty;
            var intWholeQty = vginDetailImgi2Actual.WholeQty;
            var intLooseQty = vginDetailImgi2Actual.LooseQty;
            mapBarCodeScanQty.set( strBarCode, 0 );
            if ( dbWms ) {
                dbWms.transaction( function( tx ) {
                    tx.executeSql( "INSERT INTO Imgi2 (TrxNo, LineItemNo, StoreNo, ProductTrxNo, ProductCode, DimensionFlag, ProductName, SerialNoFlag, BarCode, PackingQty, WholeQty, LooseQty) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?, ?)", [ intTrxNo, intLineItemNo, strStoreNo, intProductTrxNo, strProductCode, strDimensionFlag, strProductName, strSerialNoFlag, strBarCode, intPackingQty, intWholeQty, intLooseQty ], null, dbError );
                } );
            }
        };
        var GetImgi2ProductCode = function( GoodsIssueNoteNo ) {
            var strUri = '/api/wms/imgi2?GoodsIssueNoteNo=' + GoodsIssueNoteNo;
            ApiService.GetParam( strUri, true ).then( function success( result ) {
                $scope.vginDetailImgi2 = result.data.results;
                if ( dbWms ) {
                    dbWms.transaction( function( tx ) {
                        dbSql = "Delete from Imgi2";
                        tx.executeSql( dbSql, [], null, dbError )
                    } );
                }
                if ( $scope.vginDetailImgi2.length > 0 ) {
                    for ( var i = 0; i < $scope.vginDetailImgi2.length; i++ ) {
                        insertImgi2( $scope.vginDetailImgi2[ i ] );
                    }
                    showImgi2( 0 );
                } else {
                    var alertPopup = $ionicPopup.alert( {
                        title: 'This GIN has no Products.',
                        okType: 'button-calm'
                    } );
                    $timeout( function() {
                        alertPopup.close();
                        returnListFun();
                    }, 2500 );
                }
            } );

        };
        GetImgi2ProductCode( $scope.vginDetail.strGIN );
        var insertImsn1 = function( Imsn1 ) {
            mapSnSerialNo.set( Imsn1.IssueNoteNo + "#" + Imsn1.IssueLineItemNo, Imsn1.SerialNo );
            if ( dbWms ) {
                dbWms.transaction( function( tx ) {
                    dbSql = "INSERT INTO Imsn1 (IssueNoteNo, IssueLineItemNo, SerialNo) values(?, ?, ?)"
                    tx.executeSql( dbSql, [ Imsn1.IssueNoteNo, Imsn1.IssueLineItemNo, Imsn1.SerialNo ], null, dbError );
                } );
            }
        };
        var GetImsn1SerialNo = function( GoodsIssueNoteNo ) {
            var strUri = '/api/wms/imsn1?GoodsIssueNoteNo=' + GoodsIssueNoteNo;
            ApiService.GetParam( strUri, true ).then( function success( result ) {
                $scope.vginDetailImsn1 = result.data.results;
                if ( dbWms ) {
                    dbWms.transaction( function( tx ) {
                        dbSql = "Delete from Imsn1";
                        tx.executeSql( dbSql, [], null, dbError )
                    } );
                }
                if ( $scope.vginDetailImsn1.length > 0 ) {
                    for ( var i = 0; i < $scope.vginDetailImsn1.length; i++ ) {
                        insertImsn1( $scope.vginDetailImsn1[ i ] );
                    }
                }
            } );
        };
        GetImsn1SerialNo( $scope.vginDetail.strGIN );
        var setBarCodeQty = function( numBarcode ) {
            if ( $scope.vginDetail.BarCodeScan === numBarcode ) {
                var CurrentQty = 0;
                if ( !mapBarCodeScanQty.isEmpty() ) {
                    if ( mapBarCodeScanQty.containsKey( numBarcode ) ) {
                        CurrentQty = mapBarCodeScanQty.get( numBarcode );
                    }
                }
                if ( $scope.vginDetail.SerialNoFlag != null && $scope.vginDetail.SerialNoFlag === 'Y' ) {
                    $( '#txt-detail-sn' ).removeAttr( "readonly" );
                    $( '#txt-detail-sn' ).select();
                } else {
                    CurrentQty += 1;
                    mapBarCodeScanQty.remove( numBarcode );
                    mapBarCodeScanQty.set( numBarcode, CurrentQty );
                    $scope.vginDetail.QtyScan = CurrentQty;
                    $( '#txt-detail-barcode' ).select();
                    if ( dbWms ) {
                        dbWms.transaction( function( tx ) {
                            dbSql = "Update Imgi2 set ScanQty=? Where TrxNo=? and LineItemNo=?";
                            tx.executeSql( dbSql, [ $scope.vginDetail.QtyScan, $scope.vginDetail.TrxNo, $scope.vginDetail.LineItemNo ], null, dbError );
                        } );
                    }
                }
            } else {
                var alertPopup = $ionicPopup.alert( {
                    title: 'Invalid product picked.',
                    okType: 'button-assertive'
                } );
                $timeout( function() {
                    alertPopup.close();
                }, 2500 );
            }
        };
        var ShowProduct = function( barcode, blnScan ) {
            var numBarcode = barcode.replace( /[^0-9/d]/g, '' );
            if ( blnScan ) {
                $scope.vginDetail.BarCodeScan = numBarcode;
            }
            if ( numBarcode != null && numBarcode > 0 ) {
                setBarCodeQty( numBarcode );
            }
        };
        $( '#txt-detail-barcode' ).on( 'keydown', function( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                ShowProduct( $scope.vginDetail.BarCodeScan, false );
            }
        } );
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
        var setSnQty = function( sn, SnArray, CurrentQty ) {
            if ( SnArray.length > 1 ) {
                if ( checkSn( sn, SnArray ) ) {
                    return;
                }
            }
            SnArray.push( sn );
            mapSnScanQty.remove( $scope.vginDetail.BarCodeScan );
            mapSnScanQty.set( $scope.vginDetail.BarCodeScan, SnArray );
            CurrentQty += 1;
            mapBarCodeScanQty.remove( $scope.vginDetail.BarCodeScan );
            mapBarCodeScanQty.set( $scope.vginDetail.BarCodeScan, CurrentQty );
            $scope.vginDetail.QtyScan = CurrentQty;
            if ( dbWms ) {
                dbWms.transaction( function( tx ) {
                    dbSql = "INSERT INTO Imsn1 (IssueNoteNo, IssueLineItemNo, SerialNo) values(?, ?, ?)";
                    tx.executeSql( dbSql, [ $scope.vginDetail.strGIN, $scope.vginDetail.LineItemNo, sn ], null, null );
                    dbSql = "Update Imgi2 set ScanQty=? Where TrxNo=? and LineItemNo=?";
                    tx.executeSql( dbSql, [ CurrentQty, $scope.vginDetail.TrxNo, $scope.vginDetail.LineItemNo ], null, dbError );
                } );
            }
            $( '#txt-detail-sn' ).select();
        };
        var ShowSn = function( sn, blnScan ) {
            if ( sn != null && sn > 0 ) {
                if ( blnScan ) {
                    $scope.vginDetail.SerialNo = sn;
                }

                var CurrentQty = mapBarCodeScanQty.get( $scope.vginDetail.BarCodeScan );
                var SnArray = null;
                if ( !mapSnScanQty.isEmpty() ) {
                    if ( mapSnScanQty.containsKey( $scope.vginDetail.BarCodeScan ) ) {
                        SnArray = mapSnScanQty.get( $scope.vginDetail.BarCodeScan );
                    } else {
                        SnArray = new Array();
                        SnArray.push( sn );
                        mapSnScanQty.set( $scope.vginDetail.BarCodeScan, SnArray );
                    }
                } else {
                    SnArray = new Array();
                    SnArray.push( sn );
                    mapSnScanQty.set( $scope.vginDetail.BarCodeScan, SnArray );
                }
                setSnQty( sn, SnArray, CurrentQty );
            }
        };
        $( '#txt-detail-sn' ).on( 'keydown', function( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                ShowSn( $scope.vginDetail.SerialNo, false );
            }
        } );
        var updateQty = function() {
            mapSnScanQty.remove( $scope.vginDetail.BarCodeScan );
            mapSnScanQty.set( $scope.vginDetail.BarCodeScan, $scope.vginDetail.QtyScan );
            if ( dbWms ) {
                dbWms.transaction( function( tx ) {
                    dbSql = "Update Imgi2 set ScanQty=? Where TrxNo=? and LineItemNo=?";
                    tx.executeSql( dbSql, [ $scope.vginDetail.QtyScan, $scope.vginDetail.TrxNo, $scope.vginDetail.LineItemNo ], null, dbError );
                } );
            }
        };
        $scope.changeQty = function() {
            if ( $scope.vginDetail.QtyScan > 0 && $scope.vginDetail.BarCodeScan.length > 0 ) {
                if ( !mapBarCodeScanQty.isEmpty() && mapBarCodeScanQty.containsKey( $scope.vginDetail.BarCodeScan ) ) {
                    var promptPopup = $ionicPopup.show( {
                        template: '<input type="number" ng-model="vginDetail.QtyScan">',
                        title: 'Enter Qty',
                        subTitle: 'Are you sure to change Qty manually?',
                        scope: $scope,
                        buttons: [
                            {
                                text: 'Cancel'
                            },
                            {
                                text: '<b>Save</b>',
                                type: 'button-positive',
                                onTap: function( e ) {
                                    updateQty();
                                }
                          }
                        ]
                    } );
                }
            }
        };
    } ] );
