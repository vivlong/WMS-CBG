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
        var alertPopup = null;
        var alertTitle = '';
        var hmImgi2 = new HashMap();
        var hmSnScanQty = new HashMap();
        var hmImsn1 = new HashMap();
        $scope.Detail = {
            Customer:$stateParams.CustomerCode,
            GIN:$stateParams.GoodsIssueNoteNo,
            Scan:{
                BarCode:'',
                SerialNo:'',
                QtyBal:0,
                Qty:0,
            },
            Imgi2:{},
            Imgi2s:{},
            Imsn1s:{}
        };
        var showPopup = function( title, type, callback ){
            if (alertPopup === null) {
                alertPopup = $ionicPopup.alert( {
                    title: title,
                    okType: 'button-' + type
                } );
                if( typeof(callback) == 'function') callback(alertPopup);
            } else {
                alertPopup.close();
                alertPopup = null;
            }
        };
        var blnVerifyInput = function(type){
            var blnPass = true;
            if(is.equal(type,'SerialNo')) {
                if(!is.equal($scope.Detail.Scan.SerialNo,$scope.Detail.Imgi2.SerialNo)){
                    showPopup('Wrong Serial No','assertive');
                    blnPass = false;
                }
            } else if(is.equal(type,'BarCode')) {
                if(!is.equal($scope.Detail.Scan.BarCode,$scope.Detail.Imgi2.BarCode)){
                    showPopup('Wrong Product','assertive');
                    blnPass = false;
                }
            }
            return blnPass;
        };
        var setScanQty = function( numBarcode ) {
            if ( $scope.Detail.Scan.BarCode === numBarcode ) {
                var CurrentQty = 0;
                if ( hmImgi2.count()>0 ) {
                    if ( hmImgi2.has( numBarcode ) ) {
                        CurrentQty = hmImgi2.get( numBarcode );
                    }
                }
                if ( $scope.Detail.SerialNoFlag != null && $scope.Detail.SerialNoFlag === 'Y' ) {
                    $( '#txt-detail-sn' ).removeAttr( "readonly" );
                    $( '#txt-detail-sn' ).select();
                } else {
                    CurrentQty += 1;
                    hmImgi2.remove( numBarcode );
                    hmImgi2.set( numBarcode, CurrentQty );
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
        var ShowImpr = function( barcode ) {
            if ( hmImgi2.has( barcode ) ) {
                var imgi2 = hmImgi2.get( barcode );
                setScanQty( barcode, imgi2 );
            } else {
                showPopup('Wrong Product','assertive');
            }
            $scope.$apply();
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
            hmImgi2.remove( $scope.Detail.Scan.BarCode );
            hmImgi2.set( $scope.Detail.Scan.BarCode, CurrentQty );
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

                var CurrentQty = hmImgi2.get( $scope.Detail.Scan.BarCode );
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
        var showImgi2 = function( LineItemNo ) {
            if ( LineItemNo != null && $scope.Detail.Imgi2s.length > 0 ) {
                $scope.Detail.RowNum = $scope.Detail.Imgi2s[ LineItemNo ].RowNum;
                $scope.Detail.TrxNo = $scope.Detail.Imgi2s[ LineItemNo ].TrxNo;
                $scope.Detail.LineItemNo = $scope.Detail.Imgi2s[ LineItemNo ].LineItemNo;
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
                if ( hmImgi2.count()>0 ) {
                    if ( hmImgi2.has( $scope.Detail.BarCode ) ) {
                        $scope.Detail.Scan.Qty = hmImgi2.get( $scope.Detail.BarCode );
                    }
                }
            }
        };
        var GetImgi2 = function( GoodsIssueNoteNo ) {
            var strUri = '/api/wms/imgi2/verify?GoodsIssueNoteNo=' + GoodsIssueNoteNo;
            ApiService.GetParam( strUri, true ).then( function success( result ) {
                $scope.Detail.Imgi2s = result.data.results;
                db_del_Imgi2_Verify();
                if ( is.array($scope.Detail.Imgi2s) && is.not.empty($scope.Detail.Imgi2s)) {
                    for ( var i = 0; i < $scope.Detail.Imgi2s.length; i++ ) {
                        hmImgi2.set($scope.Detail.Imgi2s[i].BarCode, $scope.Detail.Imgi2s[i]);
                        db_add_Imgi2_Verify( $scope.Detail.Imgi2s[ i ] );
                    }
                    showImgi2( 0 );
                } else {
                    showPopup('This GIN has no Products','calm',function(popup){
                        $timeout( function() {
                            popup.close();
                            $scope.returnList();
                        }, 2500 );
                    });
                }
            } );

        };
        GetImgi2( $scope.Detail.GIN );
        var GetImsn1 = function( GoodsIssueNoteNo ) {
            var strUri = '/api/wms/imsn1?GoodsIssueNoteNo=' + GoodsIssueNoteNo;
            ApiService.GetParam( strUri, true ).then( function success( result ) {
                $scope.Detail.Imsn1s = result.data.results;
                db_del_Imsn1_Verify();
                if ( is.array($scope.Detail.Imsn1s) && is.not.empty($scope.Detail.Imsn1s)) {
                    for ( var i = 0; i < $scope.Detail.Imsn1s.length; i++ ) {
                        hmImsn1.set( Imsn1s[i].IssueNoteNo + "#" + Imsn1s[i].IssueLineItemNo, Imsn1s[i].SerialNo );
                        db_add_Imsn1_Verify( $scope.Detail.Imsn1s[ i ] );
                    }
                }
            } );
        };
        GetImsn1( $scope.Detail.GIN );
        $scope.changeQty = function() {
            if ( $scope.Detail.Scan.Qty > 0 && $scope.Detail.Scan.BarCode.length > 0 ) {
                if ( hmImgi2.count()>0 && hmImgi2.has( $scope.Detail.Scan.BarCode ) ) {
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
                                    db_update_Imgi2_Verify($scope.Detail.Imgi2);
                                }
                          }
                        ]
                    } );
                }
            }
        };
        $scope.returnList = function() {
            if ( $ionicHistory.backView() ) {
                $ionicHistory.goBack();
            } else {
                $state.go( 'vginList', {}, {
                    reload: true
                } );
            }
        };
        $scope.CamScanBarCode = function() {
            $cordovaBarcodeScanner.scan().then( function( imageData ) {
                $scope.Detail.Scan.BarCode = imageData.text;
                ShowImpr( $scope.Detail.Scan.BarCode, true );
            }, function( error ) {
                $cordovaToast.showShortBottom( error );
            } );
        };
        $scope.CamScanSerialNo = function() {
            if ( $( '#txt-sn' ).attr( "readonly" ) != "readonly" ) {
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
                $( '#txt-sn' ).attr( "readonly", true );
                $( '#txt-barcode' ).select();
            }
        };
        $scope.clearSerialNo = function() {
            if ( $scope.Detail.Scan.SerialNo.length > 0 ) {
                $scope.Detail.Scan.SerialNo = "";
                $( '#txt-sn' ).select();
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
                showPopup('Already the first one','calm');
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
                showPopup('Already the last one','calm');
            }
        }
        $( '#txt-barcode' ).on( 'keydown', function( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                if (alertPopup === null) {
                    if(blnVerifyInput('BarCode')){
                        ShowImpr( $scope.Detail.Scan.BarCode );
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
                    if(blnVerifyInput('SerialNo')){
                        ShowSn( $scope.Detail.SerialNo, false );
                    }
                } else {
                    alertPopup.close();
                    alertPopup = null;
                }
            }
        } );
    } ] );
