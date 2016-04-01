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
                $state.go( 'pickingDetail', {
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

appControllers.controller( 'PickingDetailCtrl', [ '$scope', '$stateParams', '$state', '$http', '$timeout', '$ionicHistory', '$ionicLoading', '$ionicPopup', '$cordovaToast', '$cordovaBarcodeScanner', 'ApiService',
    function( $scope, $stateParams, $state, $http, $timeout, $ionicHistory, $ionicLoading, $ionicPopup, $cordovaToast, $cordovaBarcodeScanner, ApiService ) {
        $scope.DetailImgi2 = {};
        $scope.DetailImsn1 = {};
        $scope.Detail = {};
        $scope.Detail.BarCodeScan = "";
        $scope.Detail.SerialNoScan = "";
        $scope.Detail.QtyBal = 0;
        $scope.Detail.QtyScan = 0;
        $scope.Detail.strCustomer = $stateParams.CustomerCode;
        $scope.Detail.strGIN = $stateParams.GoodsIssueNoteNo;
        var mapBarCodeScanQty = new HashMap();
        var mapSnScanQty = new HashMap();
        var mapSnSerialNo = new HashMap();
        var returnListFun = function() {
            if ( $ionicHistory.backView() ) {
                $ionicHistory.goBack();
            } else {
                $state.go( 'pickingList', {}, {
                    reload: true
                } );
            }
        };
        $scope.returnList = returnListFun;
        $scope.CamScanBarCode = function() {
            $cordovaBarcodeScanner.scan().then( function( imageData ) {
                $scope.Detail.BarCodeScan = imageData.text;
                ShowProduct( $scope.Detail.BarCodeScan, true );
            }, function( error ) {
                $cordovaToast.showShortBottom( error );
            } );
        };
        $scope.CamScanSerialNo = function() {
            if ( $( '#txt-detail-sn' ).attr( "readonly" ) != "readonly" ) {
                $cordovaBarcodeScanner.scan().then( function( imageData ) {
                    $scope.Detail.SerialNoScan = imageData.text;
                    ShowSn( $scope.Detail.SerialNoScan, false );
                }, function( error ) {
                    $cordovaToast.showShortBottom( error );
                } );
            }
        };
        $scope.clearBarCode = function() {
            if ( $scope.Detail.BarCodeScan.length > 0 ) {
                $scope.Detail.BarCodeScan = "";
                $scope.Detail.SerialNoScan = "";
                $scope.Detail.QtyScan = 0;
                $( '#txt-detail-sn' ).attr( "readonly", true );
                $( '#txt-detail-barcode' ).select();
            }
        };
        $scope.clearSerialNo = function() {
            if ( $scope.Detail.SerialNoScan.length > 0 ) {
                $scope.Detail.SerialNoScan = "";
                $( '#txt-detail-sn' ).select();
            }
        };
        $scope.showImgi2Prev = function() {
            var blnHasPrev = false;
            var intLineItemNo = $scope.Detail.LineItemNo - 1;
            if ( $scope.DetailImgi2.length > 0 ) {
                for ( var i = 0; i < $scope.DetailImgi2.length; i++ ) {
                    if ( $scope.DetailImgi2[ i ].LineItemNo === intLineItemNo ) {
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
            var intLineItemNo = $scope.Detail.LineItemNo + 1;
            if ( $scope.DetailImgi2.length > 0 ) {
                for ( var i = 0; i < $scope.DetailImgi2.length; i++ ) {
                    if ( $scope.DetailImgi2[ i ].LineItemNo === intLineItemNo ) {
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
            if ( LineItemNo != null && $scope.DetailImgi2.length > 0 ) {
                $scope.Detail.TrxNo = $scope.DetailImgi2[ LineItemNo ].TrxNo;
                $scope.Detail.LineItemNo = $scope.DetailImgi2[ LineItemNo ].LineItemNo;
                $scope.Detail.StoreNo = $scope.DetailImgi2[ LineItemNo ].StoreNo;
                $scope.Detail.ProductCode = $scope.DetailImgi2[ LineItemNo ].ProductCode;
                $scope.Detail.ProductName = $scope.DetailImgi2[ LineItemNo ].ProductName;
                $scope.Detail.SerialNoFlag = $scope.DetailImgi2[ LineItemNo ].SerialNoFlag;
                $scope.Detail.BarCode = $scope.DetailImgi2[ LineItemNo ].UserDefine01;
                switch ( $scope.DetailImgi2[ LineItemNo ].DimensionFlag ) {
                    case '1':
                        $scope.Detail.Qty = $scope.DetailImgi2[ LineItemNo ].PackingQty;
                        break;
                    case '2':
                        $scope.Detail.Qty = $scope.DetailImgi2[ LineItemNo ].WholeQty;
                        break;
                    default:
                        $scope.Detail.Qty = $scope.DetailImgi2[ LineItemNo ].LooseQty;
                }
                if ( !mapBarCodeScanQty ) {
                    if ( mapBarCodeScanQty.containsKey( $scope.Detail.BarCode ) ) {
                        $scope.Detail.QtyScan = mapBarCodeScanQty.get( $scope.Detail.BarCode );
                    }
                }
            }
        };
        var insertImgi2 = function( DetailImgi2Actual ) {
            var intTrxNo = DetailImgi2Actual.TrxNo;
            var intLineItemNo = DetailImgi2Actual.LineItemNo;
            var strStoreNo = DetailImgi2Actual.StoreNo;
            var strProductCode = DetailImgi2Actual.ProductCode;
            var intProductTrxNo = DetailImgi2Actual.ProductTrxNo;
            var strDimensionFlag = DetailImgi2Actual.DimensionFlag;
            var strProductName = DetailImgi2Actual.ProductName;
            var strSerialNoFlag = DetailImgi2Actual.SerialNoFlag;
            var strBarCode = DetailImgi2Actual.UserDefine01;
            var intPackingQty = DetailImgi2Actual.PackingQty;
            var intWholeQty = DetailImgi2Actual.WholeQty;
            var intLooseQty = DetailImgi2Actual.LooseQty;
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
                $scope.DetailImgi2 = result.data.results;
                if ( dbWms ) {
                    dbWms.transaction( function( tx ) {
                        dbSql = "Delete from Imgi2";
                        tx.executeSql( dbSql, [], null, dbError )
                    } );
                }
                if ( $scope.DetailImgi2.length > 0 ) {
                    for ( var i = 0; i < $scope.DetailImgi2.length; i++ ) {
                        insertImgi2( $scope.DetailImgi2[ i ] );
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
        GetImgi2ProductCode( $scope.Detail.strGIN );
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
                $scope.DetailImsn1 = result.data.results;
                if ( dbWms ) {
                    dbWms.transaction( function( tx ) {
                        dbSql = "Delete from Imsn1";
                        tx.executeSql( dbSql, [], null, dbError )
                    } );
                }
                if ( $scope.DetailImsn1.length > 0 ) {
                    for ( var i = 0; i < $scope.DetailImsn1.length; i++ ) {
                        insertImsn1( $scope.DetailImsn1[ i ] );
                    }
                }
            } );
        };
        GetImsn1SerialNo( $scope.Detail.strGIN );
        var setBarCodeQty = function( numBarcode ) {
            if ( $scope.Detail.BarCodeScan === numBarcode ) {
                var CurrentQty = 0;
                if ( !mapBarCodeScanQty.isEmpty() ) {
                    if ( mapBarCodeScanQty.containsKey( numBarcode ) ) {
                        CurrentQty = mapBarCodeScanQty.get( numBarcode );
                    }
                }
                if ( $scope.Detail.SerialNoFlag != null && $scope.Detail.SerialNoFlag === 'Y' ) {
                    $( '#txt-detail-sn' ).removeAttr( "readonly" );
                    $( '#txt-detail-sn' ).select();
                } else {
                    CurrentQty += 1;
                    mapBarCodeScanQty.remove( numBarcode );
                    mapBarCodeScanQty.set( numBarcode, CurrentQty );
                    $scope.Detail.QtyScan = CurrentQty;
                    $( '#txt-detail-barcode' ).select();
                    if ( dbWms ) {
                        dbWms.transaction( function( tx ) {
                            dbSql = "Update Imgi2 set ScanQty=? Where TrxNo=? and LineItemNo=?";
                            tx.executeSql( dbSql, [ $scope.Detail.QtyScan, $scope.Detail.TrxNo, $scope.Detail.LineItemNo ], null, dbError );
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
                $scope.Detail.BarCodeScan = numBarcode;
            }
            if ( numBarcode != null && numBarcode > 0 ) {
                setBarCodeQty( numBarcode );
            }
        };
        $( '#txt-detail-barcode' ).on( 'keydown', function( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                ShowProduct( $scope.Detail.BarCodeScan, false );
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
            mapSnScanQty.remove( $scope.Detail.BarCodeScan );
            mapSnScanQty.set( $scope.Detail.BarCodeScan, SnArray );
            CurrentQty += 1;
            mapBarCodeScanQty.remove( $scope.Detail.BarCodeScan );
            mapBarCodeScanQty.set( $scope.Detail.BarCodeScan, CurrentQty );
            $scope.Detail.QtyScan = CurrentQty;
            if ( dbWms ) {
                dbWms.transaction( function( tx ) {
                    dbSql = "INSERT INTO Imsn1 (IssueNoteNo, IssueLineItemNo, SerialNo) values(?, ?, ?)";
                    tx.executeSql( dbSql, [ $scope.Detail.strGIN, $scope.Detail.LineItemNo, sn ], null, null );
                    dbSql = "Update Imgi2 set ScanQty=? Where TrxNo=? and LineItemNo=?";
                    tx.executeSql( dbSql, [ CurrentQty, $scope.Detail.TrxNo, $scope.Detail.LineItemNo ], null, dbError );
                } );
            }
            $( '#txt-detail-sn' ).select();
        };
        var ShowSn = function( sn, blnScan ) {
            if ( sn != null && sn > 0 ) {
                if ( blnScan ) {
                    $scope.Detail.SerialNo = sn;
                }

                var CurrentQty = mapBarCodeScanQty.get( $scope.Detail.BarCodeScan );
                var SnArray = null;
                if ( !mapSnScanQty.isEmpty() ) {
                    if ( mapSnScanQty.containsKey( $scope.Detail.BarCodeScan ) ) {
                        SnArray = mapSnScanQty.get( $scope.Detail.BarCodeScan );
                    } else {
                        SnArray = new Array();
                        SnArray.push( sn );
                        mapSnScanQty.set( $scope.Detail.BarCodeScan, SnArray );
                    }
                } else {
                    SnArray = new Array();
                    SnArray.push( sn );
                    mapSnScanQty.set( $scope.Detail.BarCodeScan, SnArray );
                }
                setSnQty( sn, SnArray, CurrentQty );
            }
        };
        $( '#txt-detail-sn' ).on( 'keydown', function( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                ShowSn( $scope.Detail.SerialNo, false );
            }
        } );
        var updateQty = function() {
            mapSnScanQty.remove( $scope.Detail.BarCodeScan );
            mapSnScanQty.set( $scope.Detail.BarCodeScan, $scope.Detail.QtyScan );
            if ( dbWms ) {
                dbWms.transaction( function( tx ) {
                    dbSql = "Update Imgi2 set ScanQty=? Where TrxNo=? and LineItemNo=?";
                    tx.executeSql( dbSql, [ $scope.Detail.QtyScan, $scope.Detail.TrxNo, $scope.Detail.LineItemNo ], null, dbError );
                } );
            }
        };
        $scope.changeQty = function() {
            if ( $scope.Detail.QtyScan > 0 && $scope.Detail.BarCodeScan.length > 0 ) {
                if ( !mapBarCodeScanQty.isEmpty() && mapBarCodeScanQty.containsKey( $scope.Detail.BarCodeScan ) ) {
                    var promptPopup = $ionicPopup.show( {
                        template: '<input type="number" ng-model="Detail.QtyScan">',
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
