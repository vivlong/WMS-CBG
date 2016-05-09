appControllers.controller('PickingListCtrl', ['$scope', '$stateParams', '$state', 'ApiService',
    function($scope, $stateParams, $state, ApiService) {
        $scope.rcbp1 = {};
        $scope.GinNo = {};
        $scope.Imgi1s = {};
        $scope.refreshRcbp1s = function(BusinessPartyName) {
            var strUri = '/api/wms/rcbp1?BusinessPartyName=' + BusinessPartyName;
            ApiService.GetParam(strUri, true).then(function success(result) {
                $scope.rcbp1s = result.data.results;
            });
        };
        $scope.refreshGinNos = function(Grn) {
            var strUri = '/api/wms/imgi1?GoodsIssueNoteNo=' + Grn;
            ApiService.GetParam(strUri, true).then(function success(result) {
                $scope.GinNos = result.data.results;
            });
        };
        $scope.ShowImgi1 = function(CustomerCode) {
            var strUri = '/api/wms/imgi1?CustomerCode=' + CustomerCode;
            ApiService.GetParam(strUri, true).then(function success(result) {
                $scope.Imgi1s = result.data.results;
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.close();
                }
                $('#div-vgin-list').focus();
            });
        };
        $scope.showDate = function(utc) {
            return moment(utc).format('DD-MMM-YYYY');
        };
        $scope.GoToDetail = function(Imgi1) {
            if (Imgi1 != null) {
                $state.go('pickingDetail', {
                    'CustomerCode': Imgi1.CustomerCode,
                    'TrxNo': Imgi1.TrxNo,
                    'GoodsIssueNoteNo': Imgi1.GoodsIssueNoteNo
                }, {
                    reload: true
                });
            }
        };
        $scope.returnMain = function() {
            $state.go('index.main', {}, {
                reload: true
            });
        };
        $('#div-list-rcbp').on('focus', (function() {
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.close();
            }
        }));
        $('#div-list-rcbp').focus();
    }
]);

appControllers.controller('PickingDetailCtrl', ['ENV', '$scope', '$stateParams', '$state', '$timeout', '$ionicHistory', '$ionicPopup', '$ionicModal', '$ionicLoading', '$cordovaToast', '$cordovaBarcodeScanner', 'ApiService',
    function(ENV, $scope, $stateParams, $state, $timeout, $ionicHistory, $ionicPopup, $ionicModal, $ionicLoading, $cordovaToast, $cordovaBarcodeScanner, ApiService) {
        var alertPopup = null;
        var alertTitle = '';
        var hmImgi2 = new HashMap();
        var hmImsn1 = new HashMap();
        $scope.Detail = {
            Customer: $stateParams.CustomerCode,
            GIN: $stateParams.GoodsIssueNoteNo,
            Scan: {
                StoreNo: '',
                BarCode: '',
                SerialNo: '',
                Qty: 0
            },
            Imgi2:{
                RowNum:         0,
                TrxNo:          0,
                LineItemNo :    0,
                StoreNo:        '',
                ProductCode:    '',
                ProductDescription:    '',
                SerialNoFlag:   '',
                BarCode:        '',
                Qty:            0,
                QtyBal:         0
            },
            Imgi2s:{},
            Imgi2sDb:{},
            Imsn1s:{}
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
            if(is.equal(type,'StoreNo')) {
                if(!is.equal($scope.Detail.Scan.StoreNo,$scope.Detail.Imgi2.StoreNo)){
                    showPopup('Invalid Store No','assertive');
                    blnPass = false;
                }
            } else if(is.equal(type,'BarCode')) {
                if(!is.equal($scope.Detail.Scan.BarCode,$scope.Detail.Imgi2.BarCode)){
                    showPopup('Invalid Product Picked','assertive');
                    blnPass = false;
                }
            }
            return blnPass;
        };
        var setScanQty = function( barcode, imgi2 ) {
            if ( imgi2.SerialNoFlag != null && imgi2.SerialNoFlag === 'Y' ) {
                $scope.Detail.Scan.Qty = imgi2.ScanQty;
                $( '#txt-sn' ).removeAttr( 'readonly' );
                $( '#txt-sn' ).select();
            } else {
                imgi2.ScanQty += 1;
                hmImgi2.remove( barcode );
                hmImgi2.set( barcode, imgi2 );
                db_update_Imgi2_Picking(imgi2);
                $scope.Detail.Scan.Qty = imgi2.ScanQty;
                $scope.Detail.Scan.BarCode = '';
            }
        };
        var showImpr = function( barcode, blnScan ) {
            if ( hmImgi2.has( barcode ) ) {
                var imgi2 = hmImgi2.get( barcode );
                setScanQty( barcode, imgi2 );
            } else {
                showPopup('Invalid Product Picked','assertive');
            }
            $scope.$apply();
        };
        var checkSn = function(sn, SnArray) {
            var blnExistSn = false;
            for (var i = 0; i < SnArray.length; i++) {
                if (SnArray[i].toString() === sn) {
                    blnExistSn = true;
                    break;
                }
            }
            return blnExistSn;
        };
        var setSnQty = function(sn, SnArray, CurrentQty) {
            if (SnArray.length > 1) {
                if (checkSn(sn, SnArray)) {
                    return;
                }
            }
            SnArray.push(sn);
            hmSnScanQty.remove($scope.Detail.BarCodeScan);
            hmSnScanQty.set($scope.Detail.BarCodeScan, SnArray);
            CurrentQty += 1;
            hmImgi2.remove($scope.Detail.BarCodeScan);
            hmImgi2.set($scope.Detail.BarCodeScan, CurrentQty);
            $scope.Detail.QtyScan = CurrentQty;
            //if (dbWms) {
            //    dbWms.transaction(function(tx) {
            //        dbSql = "INSERT INTO Imsn1 (IssueNoteNo, IssueLineItemNo, SerialNo) values(?, ?, ?)";
            //        tx.executeSql(dbSql, [$scope.Detail.strGIN, $scope.Detail.LineItemNo, sn], null, null);
            //        dbSql = "Update Imgi2 set ScanQty=? Where TrxNo=? and LineItemNo=?";
            //        tx.executeSql(dbSql, [CurrentQty, $scope.Detail.TrxNo, $scope.Detail.LineItemNo], null, dbError);
            //    });
            //}
            $('#txt-sn').select();
        };
        var ShowSn = function(sn, blnScan) {
            if (sn != null && sn > 0) {
                if (blnScan) {
                    $scope.Detail.SerialNo = sn;
                }

                var CurrentQty = hmImgi2.get($scope.Detail.BarCodeScan);
                var SnArray = null;
                if (!hmSnScanQty.isEmpty()) {
                    if (hmSnScanQty.containsKey($scope.Detail.BarCodeScan)) {
                        SnArray = hmSnScanQty.get($scope.Detail.BarCodeScan);
                    } else {
                        SnArray = new Array();
                        SnArray.push(sn);
                        hmSnScanQty.set($scope.Detail.BarCodeScan, SnArray);
                    }
                } else {
                    SnArray = new Array();
                    SnArray.push(sn);
                    hmSnScanQty.set($scope.Detail.BarCodeScan, SnArray);
                }
                setSnQty(sn, SnArray, CurrentQty);
            }
        };
        var showImgi2 = function(row) {
            if (row != null && $scope.Detail.Imgi2s.length >= row) {
                $scope.Detail.Imgi2 = {
                    RowNum : $scope.Detail.Imgi2s[row].RowNum,
                    TrxNo : $scope.Detail.Imgi2s[row].TrxNo,
                    LineItemNo : $scope.Detail.Imgi2s[row].LineItemNo,
                    StoreNo : $scope.Detail.Imgi2s[row].StoreNo,
                    ProductTrxNo : $scope.Detail.Imgi2s[row].ProductTrxNo,
                    ProductCode : $scope.Detail.Imgi2s[row].ProductCode,
                    ProductDescription : $scope.Detail.Imgi2s[row].ProductDescription,
                    SerialNoFlag : $scope.Detail.Imgi2s[row].SerialNoFlag,
                    BarCode : $scope.Detail.Imgi2s[row].BarCode,
                    Qty : $scope.Detail.Imgi2s[row].Qty,
                    QtyBal : $scope.Detail.Imgi2s[row].Qty-$scope.Detail.Imgi2s[row].ScanQty,
                    ScanQty : $scope.Detail.Imgi2s[row].ScanQty
                };
            }
        };
        var GetImgi2ProductCode = function(GoodsIssueNoteNo) {
            var strUri = '/api/wms/imgi2/picking?GoodsIssueNoteNo=' + GoodsIssueNoteNo;
            ApiService.GetParam(strUri, true).then(function success(result) {
                $scope.Detail.Imgi2s = result.data.results;
                db_del_Imgi2_Picking();
                if(is.array($scope.Detail.Imgi2s) && is.not.empty($scope.Detail.Imgi2s)) {
                    for (var i = 0; i < $scope.Detail.Imgi2s.length; i++) {
                        hmImgi2.set($scope.Detail.Imgi2s[i].BarCode, $scope.Detail.Imgi2s[i]);
                        db_add_Imgi2_Picking($scope.Detail.Imgi2s[i]);
                    }
                    showImgi2(0);
                } else {
                    showPopup('This GIN has no Products','calm',function(popup){
                        $timeout(function() {
                            popup.close();
                            $scope.returnList();
                        }, 2500);
                    });
                }
            });
        };
        GetImgi2ProductCode($scope.Detail.GIN);
        var GetImsn1SerialNo = function(GoodsIssueNoteNo) {
            var strUri = '/api/wms/imsn1?GoodsIssueNoteNo=' + GoodsIssueNoteNo;
            ApiService.GetParam(strUri, true).then(function success(result) {
                $scope.Detail.Imsn1s = result.data.results;
                db_del_Imsn1_Picking();
                if (is.array($scope.Detail.Imsn1s) && is.not.empty($scope.Detail.Imsn1s)) {
                    for (var i = 0; i < $scope.Detail.Imsn1s.length; i++) {
                        hmImsn1.set($scope.Detail.Imsn1s[i].IssueNoteNo + "#" + $scope.Detail.Imsn1s[i].IssueLineItemNo, Imsn1.SerialNo);
                        db_add_Imsn1_Picking($scope.Detail.Imsn1s[i]);
                    }
                }
            });
        };
        GetImsn1SerialNo($scope.Detail.GIN);
        $scope.openModal = function() {
            $scope.modal.show();
            $ionicLoading.show();
            db_query_Imgi2_Picking(function(results){
                $scope.Detail.Imgi2sDb = results;
                $ionicLoading.hide();
            });
        };
        $scope.closeModal = function() {
            $scope.Detail.Imgi2sDb = {};
            $scope.modal.hide();
        };
        $scope.returnList = function() {
            if ($ionicHistory.backView()) {
                $ionicHistory.goBack();
            } else {
                $state.go('pickingList', {}, {
                    reload: true
                });
            }
        };
        $scope.changeQty = function() {
            if ($scope.Detail.Scan.Qty > 0 && $scope.Detail.Scan.BarCode.length > 0) {
                if (hmImgi2.count()>0 && hmImgi2.has($scope.Detail.Scan.BarCode)) {
                    var imgi2 = hmImgi2.get($scope.Detail.Scan.BarCode);
                    var promptPopup = $ionicPopup.show({
                        template: '<input type="number" ng-model="Detail.QtyScan">',
                        title: 'Enter Qty',
                        subTitle: 'Are you sure to change Qty manually?',
                        scope: $scope,
                        buttons: [{
                            text: 'Cancel'
                        }, {
                            text: '<b>Save</b>',
                            type: 'button-positive',
                            onTap: function(e) {
                                imgi2.ScanQty = $scope.Detail.Scan.Qty;
                                db_update_Imgi2_Picking(imgi2);
                            }
                        }]
                    });
                }
            }
        };
        $scope.openCam = function(type) {
            if(is.equal(type,'StoreNo')){
                $cordovaBarcodeScanner.scan().then(function(imageData) {
                    $scope.Detail.Scan.StoreNo = imageData.text;
                }, function(error) {
                    $cordovaToast.showShortBottom(error);
                });
            }else if(is.equal(type,'BarCode')){
                $cordovaBarcodeScanner.scan().then(function(imageData) {
                    $scope.Detail.Scan.BarCode = imageData.text;
                    showImpr($scope.Detail.Scan.BarCode, true);
                }, function(error) {
                    $cordovaToast.showShortBottom(error);
                });
            } else if(is.equal(type,'SerialNo')){
                if ($('#txt-sn').attr("readonly") != "readonly") {
                    $cordovaBarcodeScanner.scan().then(function(imageData) {
                        $scope.Detail.Scan.SerialNo = imageData.text;
                        ShowSn($scope.Detail.Scan.SerialNo, false);
                    }, function(error) {
                        $cordovaToast.showShortBottom(error);
                    });
                }
            }
        };
        $scope.clearInput = function(type) {
            if(is.equal(type,'BarCode')){
                if ($scope.Detail.Scan.BarCode.length > 0) {
                    $scope.Detail.Scan.BarCode = '';
                    $scope.Detail.Scan.SerialNo = '';
                    $scope.Detail.Scan.Qty = 0;
                    $('#txt-sn').attr('readonly', true);
                    $('#txt-barcode').select();
                }
            } else if(is.equal(type,'SerialNo')){
                if ($scope.Detail.Scan.SerialNo.length > 0) {
                    $scope.Detail.Scan.SerialNo = "";
                    $('#txt-sn').select();
                }
            } else if(is.equal(type,'StoreNo')){
                if ($scope.Detail.Scan.StoreNo.length > 0) {
                    $scope.Detail.Scan.StoreNo = '';
                    $('#txt-storeno').select();
                }
            } else {
                $scope.Detail.Scan.StoreNo = '';
                $scope.Detail.Scan.BarCode = '';
                $scope.Detail.Scan.SerialNo = '';
                $scope.Detail.Scan.Qty = 0;
                $('#txt-sn').attr('readonly', true);
                $('#txt-storeno').select();
            }
        };
        $scope.showImgi2Prev = function() {
            var intRow = $scope.Detail.Imgi2.RowNum - 1;
            if ($scope.Detail.Imgi2s.length > 0 && intRow > 0 && is.equal($scope.Detail.Imgi2s[intRow-1].RowNum,intRow)) {
                $scope.clearInput();
                showImgi2(intRow - 1);
            } else {
                showPopup('Already the first one','calm');
            }
        }
        $scope.showImgi2Next = function() {
            var intRow = $scope.Detail.Imgi2.RowNum + 1;
            if ($scope.Detail.Imgi2s.length > 0 && $scope.Detail.Imgi2s.length >= intRow && is.equal($scope.Detail.Imgi2s[intRow-1].RowNum,intRow)) {
                $scope.clearInput();
                showImgi2(intRow-1);
            } else {
                showPopup('Already the last one','calm');
            }
        }
        $('#txt-storeno').on('keydown', function(e) {
            if (e.which === 9 || e.which === 13) {
                if (alertPopup === null) {
                    if(blnVerifyInput('StoreNo')){
                        $('#txt-barcode').focus();
                    }
                } else {
                    alertPopup.close();
                    alertPopup = null;
                }
            }
        });
        $('#txt-barcode').on('keydown', function(e) {
            if (e.which === 9 || e.which === 13) {
                if (alertPopup === null) {
                    if(blnVerifyInput('BarCode')){
                        showImpr($scope.Detail.Scan.BarCode);
                    }
                } else {
                    alertPopup.close();
                    alertPopup = null;
                }
            }
        });
        $('#txt-sn').on('keydown', function(e) {
            if (e.which === 9 || e.which === 13) {
                if (alertPopup === null) {
                    ShowSn($scope.Detail.SerialNo, false);
                } else {
                    alertPopup.close();
                    alertPopup = null;
                }
            }
        });
    }
]);
