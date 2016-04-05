appControllers.controller( 'GrListCtrl', [ 'ENV', '$scope', '$stateParams', '$state', '$ionicPopup', 'ApiService',
    function( ENV, $scope, $stateParams, $state, $ionicPopup, ApiService ) {
        var alertPopup = null;
        var alertPopupTitle = '';
        $scope.Rcbp1 = {};
        $scope.GrnNo = {};
        $scope.Imgr1s = {};
        $scope.refreshRcbp1 = function( BusinessPartyName ) {
            var strUri = '/api/wms/rcbp1?BusinessPartyName=' + BusinessPartyName;
            ApiService.GetParam( strUri, true ).then( function success( result ) {
                $scope.Rcbp1s = result.data.results;
            } );
        };
        $scope.refreshGrnNos = function( Grn ) {
            var strUri = '/api/wms/imgr1?GoodsReceiptNoteNo=' + Grn;
            ApiService.GetParam( strUri, true ).then( function success( result ) {
                $scope.GrnNos = result.data.results;
            } );
        };
        $scope.ShowImgr1 = function( Customer ) {
            var strUri = '/api/wms/imgr1?CustomerCode=' + Customer;
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
                $state.go( 'grDetail', {
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
        var BhEngine = new Bloodhound( {
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace( 'value' ),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            remote: {
                url: ENV.api + '/api/wms/rcbp1?BusinessPartyName=%QUERY&format=json',
                wildcard: '%QUERY',
                transform: function( result ) {
                    return $.map( result.data.results, function( rcbp1 ) {
                        return {
                            value: rcbp1.BusinessPartyName
                        };
                    } );
                }
            }
        } );
        BhEngine.initialize();
        $( '#scrollable-dropdown-menu .typeahead' ).typeahead( {
            hint: false,
            highlight: true,
            minLength: 1
        }, {
            name: 'BusinessPartyNames',
            limit: 10,
            displayKey: 'value',
            source: BhEngine.ttAdapter(),
            templates: {
                empty: [
                    '<div class="tt-empty-message">',
                    'No Results Found',
                    '</div>'
                ].join( '\n' ),
                suggestion: function( data ) {
                    return '<p><strong>' + data.value + '</strong></p>';
                }
            }
        } );
        $( 'input' ).on( [
            'typeahead:initialized',
            'typeahead:initialized:err',
            'typeahead:selected',
            'typeahead:autocompleted',
            'typeahead:cursorchanged',
            'typeahead:opened',
            'typeahead:closed'
        ].join( ' ' ), function( d ) {
            console.log( this.value );
        } );
    }
] );

appControllers.controller( 'GrDetailCtrl', [ '$scope', '$stateParams', '$state', '$http', '$timeout', '$ionicHistory', '$ionicLoading', '$ionicPopup', '$ionicModal', '$cordovaToast', '$cordovaBarcodeScanner', 'ApiService',
    function( $scope, $stateParams, $state, $http, $timeout, $ionicHistory, $ionicLoading, $ionicPopup, $ionicModal, $cordovaToast, $cordovaBarcodeScanner, ApiService ) {

        var hmBarCodeScanQty = new HashMap();
        var hmSnScanQty = new HashMap();
        $scope.Detail = {
            SerialNo: '',
            Qty: 0,
            strCustomer: $stateParams.CustomerCode,
            strGRN: $stateParams.GoodsReceiptNoteNo,
            intTrxNo: $stateParams.TrxNo,
            Impr1: {},
            Imgr2s: {}
        };
        $scope.Imgr2s = {};
        $ionicModal.fromTemplateUrl( 'scan.html', {
            scope: $scope,
            animation: 'slide-in-up'
        } ).then( function( modal ) {
            $scope.modal = modal;
        } );
        //Cleanup the modal when done with it!
        $scope.$on( '$destroy', function() {
            $scope.modal.remove();
        } );
        $scope.openCam = function( type ) {
            if ( is.equal( type, 'BarCode' ) ) {
                $cordovaBarcodeScanner.scan().then( function( imageData ) {
                    $scope.Detail.strBarCode = imageData.text;
                    ShowProduct( $scope.Detail.strBarCode, true );
                }, function( error ) {
                    $cordovaToast.showShortBottom( error );
                } );
            } else if ( is.equal( type, 'SerialNo' ) ) {
                if ( $( '#txt-sn' ).attr( 'readonly' ) != 'readonly' ) {
                    $cordovaBarcodeScanner.scan().then( function( imageData ) {
                        $scope.Detail.SerialNo = imageData.text;
                        ShowSn( $scope.Detail.SerialNo, false );
                    }, function( error ) {
                        $cordovaToast.showShortBottom( error );
                    } );
                }
            }

        };
        var checkProductCode = function( numBarcode, mapValue ) {
            var existsProductCode = false;
            for ( var i = 0; i < $scope.Detail.Imgr2s.length; i++ ) {
                if ( $scope.Detail.Imgr2s[ i ].ProductCode === mapValue.ProductCode ) {
                    mapValue.TrxNo = $scope.Detail.Imgr2s[ i ].TrxNo.toString();
                    mapValue.LineItemNo = $scope.Detail.Imgr2s[ i ].LineItemNo.toString();
                    hmBarCodeScanQty.remove( numBarcode );
                    hmBarCodeScanQty.set( numBarcode, mapValue );
                    existsProductCode = true;
                    break;
                }
            }
            return existsProductCode;
        };
        var setBarCodeQty = function( numBarcode, mapValue ) {
            if ( mapValue.ProductCode.length > 0 && checkProductCode( numBarcode, mapValue ) ) {
                if ( mapValue.SerialNoFlag != null && mapValue.SerialNoFlag === 'Y' ) {
                    $scope.Detail.Qty = mapValue.CurrentQty;
                    $( '#txt-sn' ).removeAttr( 'readonly' );
                    $( '#txt-sn' ).select();
                    if ( dbWms ) {
                        dbWms.transaction( function( tx ) {
                            dbSql = 'Update Imgr2 set BarCode=? Where TrxNo=? and LineItemNo=?';
                            tx.executeSql( dbSql, [ numBarcode, mapValue.TrxNo, mapValue.LineItemNo ], null, dbError );
                        } );
                    }
                } else {
                    mapValue.CurrentQty += 1;
                    hmBarCodeScanQty.remove( numBarcode );
                    hmBarCodeScanQty.set( numBarcode, mapValue );
                    $scope.Detail.Qty = mapValue.CurrentQty;
                    $( '#txt-barcode' ).select();
                    if ( dbWms ) {
                        dbWms.transaction( function( tx ) {
                            dbSql = 'Update Imgr2 set ScanQty=?, BarCode=? Where TrxNo=? and LineItemNo=?';
                            tx.executeSql( dbSql, [ mapValue.CurrentQty, numBarcode, mapValue.TrxNo, mapValue.LineItemNo ], null, dbError );
                        } );
                    }
                }
            } else {
                var alertPopup = $ionicPopup.alert( {
                    title: mapValue.ProductCode,
                    subTitle: 'It not belongs to this GRN.',
                    okType: 'button-assertive'
                } );
                $timeout( function() {
                    alertPopup.close();
                    $( '#txt-barcode' ).select();
                }, 1500 );
            }
        };
        var getImpr = function( numBarcode, mapValue ) {
            if ( is.undefined( mapValue ) ) {
                var strUri = '/api/wms/impr1?BarCode=' + numBarcode;
                ApiService.GetParam( strUri, true ).then( function success( result ) {
                    $scope.Detail.Impr1 = result.data.results;
                    if ( is.not.undefined( $scope.Detail.Impr1 ) ) {
                        var mapValue = {};
                        mapValue.ProductCode = $scope.Detail.Impr1.ProductCode;
                        mapValue.ProductName = $scope.Detail.Impr1.ProductName;
                        mapValue.SerialNoFlag = $scope.Detail.Impr1.SerialNoFlag;
                        mapValue.TrxNo = 0;
                        mapValue.LineItemNo = 0;
                        mapValue.CurrentQty = 0;
                        hmBarCodeScanQty.set( numBarcode, mapValue );
                        setBarCodeQty( numBarcode, mapValue );
                    } else {
                        $scope.Detail.Impr1 = {};
                        $scope.Detail.Qty = 0;
                    }
                }, function error( result ) {
                    $scope.Detail.Impr1 = {};
                    $scope.Detail.Qty = 0;
                } );
            } else {
                $scope.Detail.Impr1.ProductCode = mapValue.ProductCode;
                $scope.Detail.Impr1.ProductName = mapValue.ProductName;
                setBarCodeQty( numBarcode, mapValue );
            }
        }
        var showImpr = function( barcode, blnScan ) {
            var numBarcode = barcode.replace( /[^0-9/d]/g, '' );
            if ( blnScan ) {
                $scope.Detail.strBarCode = numBarcode;
            }
            if ( numBarcode != null && numBarcode > 0 ) {
                var currQty = 0;
                if ( hmBarCodeScanQty.count() > 0 ) {
                    if ( hmBarCodeScanQty.has( numBarcode ) ) {
                        var mapValue = hmBarCodeScanQty.get( numBarcode );
                        getImpr( numBarcode, mapValue );
                    } else {
                        getImpr( numBarcode );
                    }
                } else {
                    getImpr( numBarcode );
                }
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
            hmSnScanQty.remove( $scope.Detail.strBarCode );
            hmSnScanQty.set( $scope.Detail.strBarCode, SnArray );
            mapValue.CurrentQty += 1;
            hmBarCodeScanQty.remove( $scope.Detail.strBarCode );
            hmBarCodeScanQty.set( $scope.Detail.strBarCode, mapValue );
            $scope.Detail.Qty = mapValue.CurrentQty;
            if ( dbWms ) {
                dbWms.transaction( function( tx ) {
                    dbSql = 'INSERT INTO Imsn1 (ReceiptNoteNo, ReceiptLineItemNo, SerialNo) values(?, ?, ?)';
                    tx.executeSql( dbSql, [ $scope.Detail.strGRN, mapValue.LineItemNo, sn ], null, null );
                    dbSql = 'Update Imgr2 set ScanQty=? Where TrxNo=? and LineItemNo=?';
                    tx.executeSql( dbSql, [ mapValue.CurrentQty, mapValue.TrxNo, mapValue.LineItemNo ], null, dbError );
                } );
            }
            $( '#txt-sn' ).select();
        };
        var ShowSn = function( sn, blnScan ) {
            if ( sn != null && sn > 0 ) {
                if ( blnScan ) {
                    $scope.Detail.SerialNo = sn;
                }
                var mapBcValue = hmBarCodeScanQty.get( $scope.Detail.strBarCode );
                var SnArray = null;
                if ( hmSnScanQty.count() > 0 ) {
                    if ( hmSnScanQty.has( $scope.Detail.strBarCode ) ) {
                        SnArray = hmSnScanQty.get( $scope.Detail.strBarCode );
                    } else {
                        SnArray = new Array();
                        SnArray.push( sn );
                        hmSnScanQty.set( $scope.Detail.strBarCode, SnArray );
                    }
                } else {
                    SnArray = new Array();
                    SnArray.push( sn );
                    hmSnScanQty.set( $scope.Detail.strBarCode, SnArray );
                }
                setSnQty( sn, SnArray, mapBcValue );
            }
        };

        $scope.openModal = function() {
            $scope.modal.show();
            if ( dbWms ) {
                dbWms.transaction( function( tx ) {
                    dbSql = 'Select * from Imgr2';
                    tx.executeSql( dbSql, [], function( tx, results ) {
                        var arr = new Array();
                        for ( var i = 0; i < results.rows.length; i++ ) {
                            var objImgr2 = {};
                            objImgr2.TrxNo = results.rows.item( i ).TrxNo;
                            objImgr2.LineItemNo = results.rows.item( i ).LineItemNo;
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
                        $scope.Imgr2s = arr;
                    }, dbError )
                } );
            }
        };
        $scope.closeModal = function() {
            $scope.Imgr2s = {};
            $scope.modal.hide();
        };
        $scope.returnList = function() {
            if ( $ionicHistory.backView() ) {
                $ionicHistory.goBack();
            } else {
                $state.go( 'grList', {}, {
                    reload: true
                } );
            }
        };
        $scope.clearInput = function( type ) {
            if ( is.equal( type, 'BarCode' ) ) {
                if ( $scope.Detail.strBarCode.length > 0 ) {
                    $scope.Detail.strBarCode = '';
                    $scope.Detail.SerialNo = '';
                    $scope.Detail.Qty = 0;
                    $scope.Detail.Impr1 = {};
                    $( '#txt-sn' ).attr( 'readonly', true );
                    $( '#txt-barcode' ).select();
                }
            } else if ( is.equal( type, 'SerialNo' ) ) {
                if ( $scope.Detail.SerialNo.length > 0 ) {
                    $scope.Detail.SerialNo = '';
                    $( '#txt-sn' ).select();
                }
            }
        };
        var updateQty = function( mapValue ) {
            if ( dbWms ) {
                dbWms.transaction( function( tx ) {
                    dbSql = 'Update Imgr2 set ScanQty=? Where TrxNo=? and LineItemNo=?';
                    tx.executeSql( dbSql, [ $scope.Detail.Qty, mapValue.TrxNo, mapValue.LineItemNo ], null, dbError );
                } );
            }
        };
        $scope.changeQty = function() {
            if ( $scope.Detail.Qty > 0 && $scope.Detail.strBarCode.length > 0 ) {
                if ( hmBarCodeScanQty.count() > 0 && hmBarCodeScanQty.has( $scope.Detail.strBarCode ) ) {
                    var mapValue = hmBarCodeScanQty.get( $scope.Detail.strBarCode );
                    var promptPopup = $ionicPopup.show( {
                        template: '<input type="number" ng-model="grtDetail.Qty">',
                        title: 'Enter Qty',
                        subTitle: 'Are you sure to change Qty manually?',
                        scope: $scope,
                        buttons: [ {
                            text: 'Cancel'
                        }, {
                            text: '<b>Save</b>',
                            type: 'button-positive',
                            onTap: function( e ) {
                                updateQty( mapValue );
                            }
                        } ]
                    } );
                }
            }
        };
        $scope.checkConfirm = function() {
            if ( dbWms ) {
                dbWms.transaction( function( tx ) {
                    dbSql = 'Select * from Imgr2';
                    tx.executeSql( dbSql, [], function( tx, results ) {
                        var len = results.rows.length;
                        if ( len > 0 ) {
                            $ionicLoading.show();
                            var blnDiscrepancies = false;
                            for ( var i = 0; i < len; i++ ) {
                                var objDetailImgr2 = {};
                                objDetailImgr2.intTrxNo = results.rows.item( i ).TrxNo;
                                objDetailImgr2.intLineItemNo = results.rows.item( i ).LineItemNo;
                                objDetailImgr2.strProductCode = results.rows.item( i ).ProductCode;
                                objDetailImgr2.intScanQty = results.rows.item( i ).ScanQty;
                                objDetailImgr2.strBarCode = results.rows.item( i ).BarCode;
                                if ( objDetailImgr2.strBarCode != null && objDetailImgr2.strBarCode.length > 0 ) {
                                    switch ( results.rows.item( i ).DimensionFlag ) {
                                        case '1':
                                            objDetailImgr2.intQty = results.rows.item( i ).PackingQty;
                                            break;
                                        case '2':
                                            objDetailImgr2.intQty = results.rows.item( i ).WholeQty;
                                            break;
                                        default:
                                            objDetailImgr2.intQty = results.rows.item( i ).LooseQty;
                                    }
                                    if ( objDetailImgr2.intQty != objDetailImgr2.intScanQty ) {
                                        console.log( 'Product (' + objDetailImgr2.strProductCode + ') Qty not equal.' );
                                        blnDiscrepancies = true;
                                    }
                                } else {
                                    blnDiscrepancies = true;
                                }
                            }
                            if ( blnDiscrepancies ) {
                                $ionicLoading.hide();
                                var checkPopup = $ionicPopup.show( {
                                    title: 'Discrepancies on Qty.',
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
                                sendConfirm();
                            }
                        }
                    }, dbError )
                } );
            }
        };
        var sendConfirm = function() {
            var userID = sessionStorage.getItem( 'UserId' ).toString();
            var jsonData = {
                'UserId': userID,
                'TrxNo': $scope.Detail.intTrxNo
            };
            var strUri = '/api/wms/action/confirm/imgr1';
            ApiService.Post( strUri, jsonData, true ).then( function success( result ) {
                var alertPopup = $ionicPopup.alert( {
                    title: 'Comfirm success.',
                    okType: 'button-calm'
                } );
                $timeout( function() {
                    alertPopup.close();
                    $scope.returnList();
                }, 2500 );
            } );
        };

        var GetImgr2ProductCode = function( GoodsReceiptNoteNo ) {
            var strUri = '/api/wms/imgr2?GoodsReceiptNoteNo=' + GoodsReceiptNoteNo;
            ApiService.GetParam( strUri, true ).then( function success( result ) {
                $scope.Detail.Imgr2s = result.data.results;
                if ( dbWms ) {
                    dbWms.transaction( function( tx ) {
                        dbSql = 'Delete from Imgr2';
                        tx.executeSql( dbSql, [], null, dbError )
                        dbSql = 'Delete from Imsn1';
                        tx.executeSql( dbSql, [], null, dbError )
                    } );
                }
                for ( var i = 0; i < $scope.Detail.Imgr2s.length; i++ ) {
                    insertImgr2s( $scope.Detail.Imgr2s[ i ] );
                }
            } );
        };
        GetImgr2ProductCode( $scope.Detail.strGRN );

        $( '#txt-barcode' ).on( 'focus', ( function() {
            if ( window.cordova && window.cordova.plugins.Keyboard ) {
                cordova.plugins.Keyboard.close();
            }
        } ) );
        $( '#txt-barcode' ).on( 'keydown', function( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                showImpr( $scope.Detail.strBarCode, false );
            }
        } );
        $( '#txt-sn' ).on( 'keydown', function( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                ShowSn( $scope.Detail.SerialNo, false );
            }
        } );
    }
] );
