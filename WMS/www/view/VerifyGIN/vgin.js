appControllers.controller( 'VginListCtrl', [ '$scope', '$stateParams', '$state', 'ApiService',
    function( $scope, $stateParams, $state, ApiService ) {
        $scope.rcbp1 = {};
        $scope.GinNo = {};
        $scope.imgi1s = {};
        $scope.refreshRcbp1 = function( BusinessPartyName ) {
            if(is.not.undefined(BusinessPartyName) && is.not.empty(BusinessPartyName)){
                var strUri = '/api/wms/rcbp1?BusinessPartyName=' + BusinessPartyName;
                ApiService.GetParam( strUri, false ).then( function success( result ) {
                    $scope.Rcbp1s = result.data.results;
                } );
            }
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

appControllers.controller( 'VginDetailCtrl', [ '$scope', '$stateParams', '$state', '$timeout', '$ionicHistory', '$ionicLoading', '$ionicModal', '$ionicPopup', '$cordovaToast', '$cordovaBarcodeScanner', 'ApiService',
    function( $scope, $stateParams, $state, $timeout, $ionicHistory, $ionicLoading, $ionicModal, $ionicPopup, $cordovaToast, $cordovaBarcodeScanner, ApiService ) {
        var alertPopup = null, alertTitle = '';
        var hmImgi2 = new HashMap();
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
            Imgi2sDb:{},
            Imsn1s:{},
            blnNext : true
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
            if( typeof(callback) == 'function') callback(alertPopup);
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
        var setScanQty = function( barcode, imgi2  ) {
            if ( is.equal(imgi2.SerialNoFlag,'Y') ) {
                $scope.Detail.Scan.Qty = imgi2.ScanQty;
                //$( '#txt-sn' ).removeAttr( 'readonly' );
                $( '#txt-sn' ).select();
            } else {
                imgi2.ScanQty += 1;
                hmImgi2.remove( barcode );
                hmImgi2.set( barcode, imgi2 );
                db_update_Imgi2_Verify(imgi2);
                $scope.Detail.Scan.Qty = imgi2.ScanQty;
                $scope.Detail.Scan.BarCode = '';
                $scope.Detail.Imgi2.QtyBal = imgi2.Qty - imgi2.ScanQty;
                if(is.equal(imgi2.Qty,imgi2.ScanQty) ){
                    $scope.showNext();
                }
            }
        };
        var showImpr = function( barcode ) {
            if ( hmImgi2.has( barcode ) ) {
                var imgi2 = hmImgi2.get( barcode );
                setScanQty( barcode, imgi2 );
            } else {
                showPopup('Wrong Product','assertive');
            }
            $scope.$apply();
        };
        var setSnQty = function(barcode, imgi2) {
            imgi2.ScanQty += 1;
            hmImgi2.remove( barcode );
            hmImgi2.set( barcode, imgi2 );
            db_update_Imgi2_Verify(imgi2);
            $scope.Detail.Scan.Qty = imgi2.ScanQty;
            $scope.Detail.Scan.SerialNo = '';
            if(is.equal(imgi2.Qty,imgi2.ScanQty) ){
                $scope.showNext();
            }else{
                $scope.Detail.Imgi2.QtyBal = imgi2.Qty - imgi2.ScanQty;
                $( '#txt-sn' ).select();
            }
            $scope.$apply();
        };
        var showSn = function( sn, blnScan ) {
            if ( is.not.empty(sn) ) {
                var barcode = $scope.Detail.Scan.BarCode,
                    SnArray = null,
                    imgi2 = hmImgi2.get( barcode );
                var imsn1 = {
                    ReceiptNoteNo: '',
                    ReceiptLineItemNo: '',
                    IssueNoteNo: $scope.Detail.GIN,
                    IssueLineItemNo: imgi2.LineItemNo,
                    SerialNo: sn,
                };
                if ( hmImsn1.count() > 0 && hmImsn1.has( barcode ) ) {
                    SnArray = hmImsn1.get( barcode );
                    if ( is.not.inArray(sn, SnArray) ) {
                        SnArray.push( sn );
                        hmImsn1.remove( barcode );
                        hmImsn1.set( barcode, SnArray );
                    }else{
                        $scope.Detail.Scan.SerialNo = '';
                        $scope.$apply();
                        return;
                    }
                } else {
                    SnArray = new Array();
                    SnArray.push( sn );
                    hmImsn1.set( barcode, SnArray );
                }
                db_add_Imsn1_Verify(imsn1);
                setSnQty( barcode, imgi2 );
            }
        };
        var showImgi2 = function( row ) {
            if (row != null && $scope.Detail.Imgi2s.length >= row) {
                $scope.Detail.Imgi2 = $scope.Detail.Imgi2s[ row ];
                $scope.Detail.Imgi2.QtyBal = $scope.Detail.Imgi2s[row].Qty-$scope.Detail.Imgi2s[row].ScanQty;
                $scope.Detail.Scan.Qty = $scope.Detail.Imgi2s[row].ScanQty;
            }
            if (is.equal(row,$scope.Detail.Imgi2s.length-1)) {
                $scope.Detail.blnNext = false;
            } else {
                $scope.Detail.blnNext = true;
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
        // var GetImsn1 = function( GoodsIssueNoteNo ) {
        //     var strUri = '/api/wms/imsn1?IssueNoteNo=' + GoodsIssueNoteNo;
        //     ApiService.GetParam( strUri, true ).then( function success( result ) {
        //         $scope.Detail.Imsn1s = result.data.results;
        //         db_del_Imsn1_Verify();
        //         if ( is.array($scope.Detail.Imsn1s) && is.not.empty($scope.Detail.Imsn1s)) {
        //             for ( var i = 0; i < $scope.Detail.Imsn1s.length; i++ ) {
        //                 hmImsn1.set( Imsn1s[i].IssueNoteNo + '#' + Imsn1s[i].IssueLineItemNo, Imsn1s[i].SerialNo );
        //                 db_add_Imsn1_Verify( $scope.Detail.Imsn1s[ i ] );
        //             }
        //         }
        //     } );
        // };
        //GetImsn1( $scope.Detail.GIN );
        $scope.openModal = function() {
            $scope.modal.show();
            $ionicLoading.show();
            db_query_Imgi2_Verify(function(results){
                $scope.Detail.Imgi2sDb = results;
                $ionicLoading.hide();
            });
        };
        $scope.closeModal = function() {
            $scope.Detail.Imgi2sDb = {};
            $scope.modal.hide();
        };
        $scope.changeQty = function() {
            if ( hmImgi2.count()>0 ) {
                var imgi2 = hmImgi2.get( $scope.Detail.Scan.BarCode );
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
                                imgi2.ScanQty = $scope.Detail.Scan.Qty;
                                $scope.Detail.Imgi2.QtyBal = imgi2.Qty - imgi2.ScanQty;
                                db_update_Imgi2_Verify(imgi2);
                            }
                      }
                    ]
                } );
            }
        };
        $scope.returnList = function() {
            $state.go( 'vginList', {}, {
                reload: true
            } );
        };
        $scope.openCam = function(type) {
            if(is.equal(type,'BarCode')){
                $cordovaBarcodeScanner.scan().then(function(imageData) {
                    $scope.Detail.Scan.BarCode = imageData.text;
                    showImpr($scope.Detail.Scan.BarCode);
                }, function(error) {
                    $cordovaToast.showShortBottom(error);
                });
            } else if(is.equal(type,'SerialNo')){
                //if ($('#txt-sn').attr("readonly") != "readonly") {
                    $cordovaBarcodeScanner.scan().then(function(imageData) {
                        $scope.Detail.Scan.SerialNo = imageData.text;
                        showSn($scope.Detail.Scan.SerialNo);
                    }, function(error) {
                        $cordovaToast.showShortBottom(error);
                    });
                //}
            }
        };
        $scope.clearInput = function(type) {
            if(is.equal(type,'BarCode')){
                if ($scope.Detail.Scan.BarCode.length > 0) {
                    $scope.Detail.Scan.BarCode = '';
                    $scope.Detail.Scan.SerialNo = '';
                    $scope.Detail.Scan.Qty = 0;
                    //$('#txt-sn').attr('readonly', true);
                    $('#txt-barcode').select();
                }
            } else if(is.equal(type,'SerialNo')){
                if ($scope.Detail.Scan.SerialNo.length > 0) {
                    $scope.Detail.Scan.SerialNo = "";
                    $('#txt-sn').select();
                }
            } else {
                $scope.Detail.Scan.BarCode = '';
                $scope.Detail.Scan.SerialNo = '';
                $scope.Detail.Scan.Qty = 0;
                //$('#txt-sn').attr('readonly', true);
                $('#txt-storeno').select();
            }
        };
        $scope.showPrev = function() {
            var intRow = $scope.Detail.Imgi2.RowNum - 1;
            if ($scope.Detail.Imgi2s.length > 0 && intRow > 0 && is.equal($scope.Detail.Imgi2s[intRow-1].RowNum,intRow)) {
                $scope.clearInput();
                showImgi2(intRow - 1);
            } else {
                showPopup('Already the first one','calm');
            }
        }
        $scope.showNext = function() {
            var intRow = $scope.Detail.Imgi2.RowNum + 1;
            if ($scope.Detail.Imgi2s.length > 0 && $scope.Detail.Imgi2s.length >= intRow && is.equal($scope.Detail.Imgi2s[intRow-1].RowNum,intRow)) {
                $scope.clearInput();
                showImgi2(intRow-1);
            } else {
                showPopup('Already the last one','calm');
            }
        }
        $scope.checkConfirm = function() {
            $ionicLoading.show();
            if ( dbWms ) {
                dbWms.transaction( function( tx ) {
                    dbSql = 'Select * from Imgi2_Verify';
                    tx.executeSql( dbSql, [], function( tx, results ) {
                        var len = results.rows.length;
                        if ( len > 0 ) {
                            var blnDiscrepancies = false;
                            for ( var i = 0; i < len; i++ ) {
                                var imgi2 = results.rows.item( i );
                                if ( is.not.empty(imgi2.BarCode) ) {
                                    if ( imgi2.Qty != imgi2.ScanQty ) {
                                        console.log( 'Product (' + imgi2.ProductCode + ') Qty not equal.' );
                                        blnDiscrepancies = true;
                                    }
                                } else {
                                    blnDiscrepancies = true;
                                }
                            }
                            $ionicLoading.hide();
                            if ( blnDiscrepancies ) {
                                showPopup('Discrepancies on Qty','assertive',function(popup){
                                    $timeout( function() {
                                        popup.close();
                                        $scope.openModal();
                                    }, 2500 );
                                });
                            } else {
                                showPopup('Confirm success','calm',function(popup){
                                    $timeout( function() {
                                        popup.close();
                                        $scope.returnList();
                                    }, 2500 );
                                });
                            }
                        }
                        else{
                            $ionicLoading.hide();
                            showPopup('Discrepancies on Qty','assertive',function(popup){
                                $timeout( function() {
                                    popup.close();
                                    $scope.openModal();
                                }, 2500 );
                            });
                        }
                    }, dbError )
                } );
            }
        };
        $( '#txt-barcode' ).on( 'keydown', function( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                if (alertPopup === null) {
                    if(blnVerifyInput('BarCode')){
                        showImpr( $scope.Detail.Scan.BarCode );
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
                        showSn( $scope.Detail.SerialNo );
                    }
                } else {
                    alertPopup.close();
                    alertPopup = null;
                }
            }
        } );
    } ] );
