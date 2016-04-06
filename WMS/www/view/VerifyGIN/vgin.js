appControllers.controller( 'VginListCtrl', [ '$scope', '$stateParams', '$state', 'ApiService',
    function( $scope, $stateParams, $state, ApiService ) {
        $scope.rcbp1 = {};
        $scope.GinNo = {};
        $scope.imgi1s = {};
        $scope.refreshRcbp1s = function( BusinessPartyName ) {
            var strUri = '/api/wms/rcbp1BusinessPartyName=?' + BusinessPartyName;
            ApiService.GetParam( strUri, true ).then( function success( result ) {
                $scope.rcbp1s = result.data.results;
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
                $scope.imgi1s = result.data.results;
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
        $scope.Detail = {
            Scan:{
                BarCode:'',
                SerialNo:'',
                QtyBal:0,
                Qty:0,
            },
            Customer:$stateParams.CustomerCode,
            GIN:$stateParams.GoodsIssueNoteNo,
            Imgi2s:{},
            Imsn1:{}
        };
        var hmBarCodeScanQty = new HashMap();
        var hmSnScanQty = new HashMap();
        var hmSnSerialNo = new HashMap();
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
                $scope.Detail.Scan.BarCode = imageData.text;
                ShowProduct( $scope.Detail.Scan.BarCode, true );
            }, function( error ) {
                $cordovaToast.showShortBottom( error );
            } );
        };
        $scope.CamScanSerialNo = function() {
            if ( $( '#txt-detail-sn' ).attr( "readonly" ) != "readonly" ) {
                $cordovaBarcodeScanner.scan().then( function( imageData ) {
                    $scope.Detail.Scan.SerialNo = imageData.text;
                    ShowSn( $scope.Detail.Scan.SerialNo, false );
                }, function( error ) {
                    $cordovaToast.showShortBottom( error );
                } );
            }
        };
        $scope.clearBarCode = function() {
            if ( $scope.Detail.Scan.BarCode.length > 0 ) {
                $scope.Detail.Scan.BarCode = "";
                $scope.Detail.Scan.SerialNo = "";
                $scope.Detail.Scan.Qty = 0;
                $( '#txt-detail-sn' ).attr( "readonly", true );
                $( '#txt-detail-barcode' ).select();
            }
        };
        $scope.clearSerialNo = function() {
            if ( $scope.Detail.Scan.SerialNo.length > 0 ) {
                $scope.Detail.Scan.SerialNo = "";
                $( '#txt-detail-sn' ).select();
            }
        };
        $scope.showImgi2Prev = function() {
            var blnHasPrev = false;
            var intLineItemNo = $scope.Detail.LineItemNo - 1;
            if ( $scope.Detail.Imgi2s.length > 0 ) {
                for ( var i = 0; i < $scope.Detail.Imgi2s.length; i++ ) {
                    if ( $scope.Detail.Imgi2s[ i ].LineItemNo === intLineItemNo ) {
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
            if ( $scope.Detail.Imgi2s.length > 0 ) {
                for ( var i = 0; i < $scope.Detail.Imgi2s.length; i++ ) {
                    if ( $scope.Detail.Imgi2s[ i ].LineItemNo === intLineItemNo ) {
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
            if ( LineItemNo != null && $scope.Detail.Imgi2s.length > 0 ) {
                $scope.Detail.TrxNo = $scope.Detail.Imgi2s[ LineItemNo ].TrxNo;
                $scope.Detail.LineItemNo = $scope.Detail.Imgi2s[ LineItemNo ].LineItemNo;
                $scope.Detail.StoreNo = $scope.Detail.Imgi2s[ LineItemNo ].StoreNo;
                $scope.Detail.ProductCode = $scope.Detail.Imgi2s[ LineItemNo ].ProductCode;
                $scope.Detail.ProductDescription = $scope.Detail.Imgi2s[ LineItemNo ].ProductDescription;
                $scope.Detail.SerialNoFlag = $scope.Detail.Imgi2s[ LineItemNo ].SerialNoFlag;
                $scope.Detail.BarCode = $scope.Detail.Imgi2s[ LineItemNo ].UserDefine01;
                switch ( $scope.Detail.Imgi2s[ LineItemNo ].DimensionFlag ) {
                    case '1':
                        $scope.Detail.Qty = $scope.Detail.Imgi2s[ LineItemNo ].PackingQty;
                        break;
                    case '2':
                        $scope.Detail.Qty = $scope.Detail.Imgi2s[ LineItemNo ].WholeQty;
                        break;
                    default:
                        $scope.Detail.Qty = $scope.Detail.Imgi2s[ LineItemNo ].LooseQty;
                }
                if ( hmBarCodeScanQty.count()>0 ) {
                    if ( hmBarCodeScanQty.has( $scope.Detail.BarCode ) ) {
                        $scope.Detail.Scan.Qty = hmBarCodeScanQty.get( $scope.Detail.BarCode );
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
            var strProductDescription = vginDetailImgi2Actual.ProductDescription;
            var strSerialNoFlag = vginDetailImgi2Actual.SerialNoFlag;
            var strBarCode = vginDetailImgi2Actual.UserDefine01;
            var intPackingQty = vginDetailImgi2Actual.PackingQty;
            var intWholeQty = vginDetailImgi2Actual.WholeQty;
            var intLooseQty = vginDetailImgi2Actual.LooseQty;
            hmBarCodeScanQty.set( strBarCode, 0 );
            if ( dbWms ) {
                dbWms.transaction( function( tx ) {
                    tx.executeSql( "INSERT INTO Imgi2 (TrxNo, LineItemNo, StoreNo, ProductTrxNo, ProductCode, DimensionFlag, ProductDescription, SerialNoFlag, BarCode, PackingQty, WholeQty, LooseQty) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?, ?)", [ intTrxNo, intLineItemNo, strStoreNo, intProductTrxNo, strProductCode, strDimensionFlag, strProductDescription, strSerialNoFlag, strBarCode, intPackingQty, intWholeQty, intLooseQty ], null, dbError );
                } );
            }
        };
        var GetImgi2ProductCode = function( GoodsIssueNoteNo ) {
            var strUri = '/api/wms/imgi2?GoodsIssueNoteNo=' + GoodsIssueNoteNo;
            ApiService.GetParam( strUri, true ).then( function success( result ) {
                $scope.Detail.Imgi2s = result.data.results;
                if ( dbWms ) {
                    dbWms.transaction( function( tx ) {
                        dbSql = "Delete from Imgi2";
                        tx.executeSql( dbSql, [], null, dbError )
                    } );
                }
                if ( $scope.Detail.Imgi2s.length > 0 ) {
                    for ( var i = 0; i < $scope.Detail.Imgi2s.length; i++ ) {
                        insertImgi2( $scope.Detail.Imgi2s[ i ] );
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
        GetImgi2ProductCode( $scope.Detail.GIN );
        var insertImsn1 = function( Imsn1 ) {
            hmSnSerialNo.set( Imsn1.IssueNoteNo + "#" + Imsn1.IssueLineItemNo, Imsn1.SerialNo );
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
                $scope.Detail.Imsn1 = result.data.results;
                if ( dbWms ) {
                    dbWms.transaction( function( tx ) {
                        dbSql = "Delete from Imsn1";
                        tx.executeSql( dbSql, [], null, dbError )
                    } );
                }
                if ( $scope.Detail.Imsn1.length > 0 ) {
                    for ( var i = 0; i < $scope.Detail.Imsn1.length; i++ ) {
                        insertImsn1( $scope.Detail.Imsn1[ i ] );
                    }
                }
            } );
        };
        GetImsn1SerialNo( $scope.Detail.GIN );
        var setBarCodeQty = function( numBarcode ) {
            if ( $scope.Detail.Scan.BarCode === numBarcode ) {
                var CurrentQty = 0;
                if ( hmBarCodeScanQty.count()>0 ) {
                    if ( hmBarCodeScanQty.has( numBarcode ) ) {
                        CurrentQty = hmBarCodeScanQty.get( numBarcode );
                    }
                }
                if ( $scope.Detail.SerialNoFlag != null && $scope.Detail.SerialNoFlag === 'Y' ) {
                    $( '#txt-detail-sn' ).removeAttr( "readonly" );
                    $( '#txt-detail-sn' ).select();
                } else {
                    CurrentQty += 1;
                    hmBarCodeScanQty.remove( numBarcode );
                    hmBarCodeScanQty.set( numBarcode, CurrentQty );
                    $scope.Detail.Scan.Qty = CurrentQty;
                    $( '#txt-detail-barcode' ).select();
                    if ( dbWms ) {
                        dbWms.transaction( function( tx ) {
                            dbSql = "Update Imgi2 set ScanQty=? Where TrxNo=? and LineItemNo=?";
                            tx.executeSql( dbSql, [ $scope.Detail.Scan.Qty, $scope.Detail.TrxNo, $scope.Detail.LineItemNo ], null, dbError );
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
                $scope.Detail.Scan.BarCode = numBarcode;
            }
            if ( numBarcode != null && numBarcode > 0 ) {
                setBarCodeQty( numBarcode );
            }
        };
        $( '#txt-detail-barcode' ).on( 'keydown', function( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                ShowProduct( $scope.Detail.Scan.BarCode, false );
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
            hmSnScanQty.remove( $scope.Detail.Scan.BarCode );
            hmSnScanQty.set( $scope.Detail.Scan.BarCode, SnArray );
            CurrentQty += 1;
            hmBarCodeScanQty.remove( $scope.Detail.Scan.BarCode );
            hmBarCodeScanQty.set( $scope.Detail.Scan.BarCode, CurrentQty );
            $scope.Detail.Scan.Qty = CurrentQty;
            if ( dbWms ) {
                dbWms.transaction( function( tx ) {
                    dbSql = "INSERT INTO Imsn1 (IssueNoteNo, IssueLineItemNo, SerialNo) values(?, ?, ?)";
                    tx.executeSql( dbSql, [ $scope.Detail.GIN, $scope.Detail.LineItemNo, sn ], null, null );
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

                var CurrentQty = hmBarCodeScanQty.get( $scope.Detail.Scan.BarCode );
                var SnArray = null;
                if ( hmSnScanQty.count()>0 ) {
                    if ( hmSnScanQty.has( $scope.Detail.Scan.BarCode ) ) {
                        SnArray = hmSnScanQty.get( $scope.Detail.Scan.BarCode );
                    } else {
                        SnArray = new Array();
                        SnArray.push( sn );
                        hmSnScanQty.set( $scope.Detail.Scan.BarCode, SnArray );
                    }
                } else {
                    SnArray = new Array();
                    SnArray.push( sn );
                    hmSnScanQty.set( $scope.Detail.Scan.BarCode, SnArray );
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
            hmSnScanQty.remove( $scope.Detail.Scan.BarCode );
            hmSnScanQty.set( $scope.Detail.Scan.BarCode, $scope.Detail.Scan.Qty );
            if ( dbWms ) {
                dbWms.transaction( function( tx ) {
                    dbSql = "Update Imgi2 set ScanQty=? Where TrxNo=? and LineItemNo=?";
                    tx.executeSql( dbSql, [ $scope.Detail.Scan.Qty, $scope.Detail.TrxNo, $scope.Detail.LineItemNo ], null, dbError );
                } );
            }
        };
        $scope.changeQty = function() {
            if ( $scope.Detail.Scan.Qty > 0 && $scope.Detail.Scan.BarCode.length > 0 ) {
                if ( hmBarCodeScanQty.count()>0 && hmBarCodeScanQty.has( $scope.Detail.Scan.BarCode ) ) {
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
