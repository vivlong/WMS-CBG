appControllers.controller('PickingListCtrl', ['$scope', '$stateParams', '$state', '$timeout', '$ionicPopup', 'ApiService',
    function($scope, $stateParams, $state, $timeout, $ionicPopup, ApiService) {
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

appControllers.controller('PickingDetailCtrl', ['ENV', '$scope', '$stateParams', '$state', '$http', '$timeout', '$ionicHistory', '$ionicLoading', '$ionicPopup', '$cordovaToast', '$cordovaBarcodeScanner', 'ApiService',
    function(ENV, $scope, $stateParams, $state, $http, $timeout, $ionicHistory, $ionicLoading, $ionicPopup, $cordovaToast, $cordovaBarcodeScanner, ApiService) {
        var alertPopup = null;
        var alertTitle = '';
        $scope.Detail = {
            Customer: $stateParams.CustomerCode,
            GIN: $stateParams.GoodsIssueNoteNo,
            Scan: {
                StoreNo: '',
                BarCode: '',
                SerialNo: '',
                Qty: 0
            },
            Imgi2s:{},
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
            Imsn1s:{}
        };
        var hmBarCodeScanQty = new HashMap();
        var hmSnScanQty = new HashMap();
        var hmSnSerialNo = new HashMap();
        var returnListFun = function() {
            if ($ionicHistory.backView()) {
                $ionicHistory.goBack();
            } else {
                $state.go('pickingList', {}, {
                    reload: true
                });
            }
        };
        $scope.returnList = returnListFun;
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
                    ShowProduct($scope.Detail.Scan.BarCode, true);
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
        var blnVerifyInput = function(type){
            if(is.equal(type,'StoreNo')) {
                if(!is.equal($scope.Detail.Scan.StoreNo,$scope.Detail.Imgi2.StoreNo)){
                    if(ENV.fromWeb){
                        alertPopup = $ionicPopup.alert({
                            title: 'Invalid Store No.',
                            okType: 'button-assertive'
                        });
                    } else {
                        $cordovaToast.showShortBottom('Invalid Store No.');
                    }
                    return false;
                }else{
                    return true;
                }
            } else if(is.equal(type,'BarCode')) {
                if(!is.equal($scope.Detail.Scan.BarCode,$scope.Detail.Imgi2.BarCode)){
                    if(ENV.fromWeb){
                        alertPopup = $ionicPopup.alert({
                            title: 'Invalid Product Picked.',
                            okType: 'button-assertive'
                        });
                    } else {
                        $cordovaToast.showShortBottom('Invalid Product Picked.');
                    }
                    return false;
                }else{
                    return true;
                }
            } else if(is.equal(type,'SerialNo')) {
                if(!is.equal($scope.Detail.Scan.SerialNo,$scope.Detail.Imgi2.SerialNo)){
                    if(ENV.fromWeb){
                        alertPopup = $ionicPopup.alert({
                            title: 'Invalid Serial No Picked.',
                            okType: 'button-assertive'
                        });
                    } else {
                        $cordovaToast.showShortBottom('Invalid Serial No Picked.');
                    }
                    return false;
                }else{
                    return true;
                }
            } else{
                return true;
            }
        };
        $scope.showImgi2Prev = function() {
            var blnHasPrev = false;
            var intRow = $scope.Detail.Imgi2.RowNum - 1;
            if ($scope.Detail.Imgi2s.length > 0 && intRow > 0 && is.equal($scope.Detail.Imgi2s[intRow-1].RowNum,intRow)) {
                blnHasPrev = true;
            }
            if (blnHasPrev) {
                $scope.clearInput();
                showImgi2(intRow - 1);
            } else {
                if(ENV.fromWeb){
                    alertPopup = $ionicPopup.alert({
                        title: 'Already the first one.',
                        okType: 'button-calm'
                    });
                } else {
                    $cordovaToast.showShortBottom('Already the first one.');
                }
            }
        }
        $scope.showImgi2Next = function() {
            var blnHasNext = false;
            var intRow = $scope.Detail.Imgi2.RowNum + 1;
            if ($scope.Detail.Imgi2s.length > 0 && $scope.Detail.Imgi2s.length >= intRow && is.equal($scope.Detail.Imgi2s[intRow-1].RowNum,intRow)) {
                blnHasNext = true;
            }
            if (blnHasNext) {
                $scope.clearInput();
                showImgi2(intRow-1);
            } else {
                if(ENV.fromWeb){
                    alertPopup = $ionicPopup.alert({
                        title: 'Already the last one.',
                        okType: 'button-calm'
                    });
                } else {
                    $cordovaToast.showShortBottom('Already the last one.');
                }
            }
        }
        var showImgi2 = function(row) {
            if (row != null && $scope.Detail.Imgi2s.length >= row) {
                $scope.Detail.Imgi2.RowNum = $scope.Detail.Imgi2s[row].RowNum;
                $scope.Detail.Imgi2.TrxNo = $scope.Detail.Imgi2s[row].TrxNo;
                $scope.Detail.Imgi2.LineItemNo = $scope.Detail.Imgi2s[row].LineItemNo;
                $scope.Detail.Imgi2.StoreNo = $scope.Detail.Imgi2s[row].StoreNo;
                $scope.Detail.Imgi2.ProductCode = $scope.Detail.Imgi2s[row].ProductCode;
                $scope.Detail.Imgi2.ProductDescription = $scope.Detail.Imgi2s[row].ProductDescription;
                $scope.Detail.Imgi2.SerialNoFlag = $scope.Detail.Imgi2s[row].SerialNoFlag;
                $scope.Detail.Imgi2.BarCode = $scope.Detail.Imgi2s[row].UserDefine01;
                switch ($scope.Detail.Imgi2s[row].DimensionFlag) {
                    case '1':
                        $scope.Detail.Imgi2.Qty = $scope.Detail.Imgi2s[row].PackingQty;
                        break;
                    case '2':
                        $scope.Detail.Imgi2.Qty = $scope.Detail.Imgi2s[row].WholeQty;
                        break;
                    default:
                        $scope.Detail.Imgi2.Qty = $scope.Detail.Imgi2s[row].LooseQty;
                }
                $scope.Detail.Imgi2.QtyBal = $scope.Detail.Imgi2.Qty;
                if (!hmBarCodeScanQty) {
                    if (hmBarCodeScanQty.has($scope.Detail.Imgi2.BarCode)) {
                        $scope.Detail.Scan.Qty = hmBarCodeScanQty.get($scope.Detail.Imgi2.BarCode);
                    }
                }
            }
        };

        var GetImgi2ProductCode = function(GoodsIssueNoteNo) {
            var strUri = '/api/wms/imgi2?GoodsIssueNoteNo=' + GoodsIssueNoteNo;
            ApiService.GetParam(strUri, true).then(function success(result) {
                $scope.Detail.Imgi2s = result.data.results;
                if (dbWms) {
                    dbWms.transaction(function(tx) {
                        dbSql = "Delete from Imgi2";
                        tx.executeSql(dbSql, [], null, dbError)
                    });
                }
                if ($scope.Detail.Imgi2s.length > 0) {
                    for (var i = 0; i < $scope.Detail.Imgi2s.length; i++) {
                        hmBarCodeScanQty.set($scope.Detail.Imgi2s[i].BarCode, 0);
                        insertImgi2s($scope.Detail.Imgi2s[i]);
                    }
                    showImgi2(0);
                } else {
                    alertPopup = $ionicPopup.alert({
                        title: 'This GIN has no Products.',
                        okType: 'button-calm'
                    });
                    $timeout(function() {
                        alertPopup.close();
                        returnListFun();
                    }, 2500);
                }
            });

        };
        GetImgi2ProductCode($scope.Detail.GIN);
        var insertImsn1s = function(Imsn1) {
            hmSnSerialNo.set(Imsn1.IssueNoteNo + "#" + Imsn1.IssueLineItemNo, Imsn1.SerialNo);
            if (dbWms) {
                dbWms.transaction(function(tx) {
                    dbSql = "INSERT INTO Imsn1 (IssueNoteNo, IssueLineItemNo, SerialNo) values(?, ?, ?)"
                    tx.executeSql(dbSql, [Imsn1.IssueNoteNo, Imsn1.IssueLineItemNo, Imsn1.SerialNo], null, dbError);
                });
            }
        };
        var GetImsn1SerialNo = function(GoodsIssueNoteNo) {
            var strUri = '/api/wms/imsn1?GoodsIssueNoteNo=' + GoodsIssueNoteNo;
            ApiService.GetParam(strUri, true).then(function success(result) {
                $scope.Detail.Imsn1s = result.data.results;
                if (dbWms) {
                    dbWms.transaction(function(tx) {
                        dbSql = "Delete from Imsn1";
                        tx.executeSql(dbSql, [], null, dbError)
                    });
                }
                if ($scope.Detail.Imsn1s.length > 0) {
                    for (var i = 0; i < $scope.Detail.Imsn1s.length; i++) {
                        insertImsn1s($scope.Detail.Imsn1s[i]);
                    }
                }
            });
        };
        GetImsn1SerialNo($scope.Detail.GIN);

        var setBarCodeQty = function(numBarcode) {
            if ($scope.Detail.BarCodeScan === numBarcode) {
                var CurrentQty = 0;
                if (!hmBarCodeScanQty.isEmpty()) {
                    if (hmBarCodeScanQty.containsKey(numBarcode)) {
                        CurrentQty = hmBarCodeScanQty.get(numBarcode);
                    }
                }
                if ($scope.Detail.SerialNoFlag != null && $scope.Detail.SerialNoFlag === 'Y') {
                    $('#txt-sn').removeAttr("readonly");
                    $('#txt-sn').select();
                } else {
                    CurrentQty += 1;
                    hmBarCodeScanQty.remove(numBarcode);
                    hmBarCodeScanQty.set(numBarcode, CurrentQty);
                    $scope.Detail.QtyScan = CurrentQty;
                    $('#txt-barcode').select();
                    if (dbWms) {
                        dbWms.transaction(function(tx) {
                            dbSql = "Update Imgi2 set ScanQty=? Where TrxNo=? and LineItemNo=?";
                            tx.executeSql(dbSql, [$scope.Detail.QtyScan, $scope.Detail.TrxNo, $scope.Detail.LineItemNo], null, dbError);
                        });
                    }
                }
            } else {
                var alertPopup = $ionicPopup.alert({
                    title: 'Invalid product picked.',
                    okType: 'button-assertive'
                });
                $timeout(function() {
                    alertPopup.close();
                }, 2500);
            }
        };
        var ShowProduct = function(barcode, blnScan) {
            var numBarcode = barcode.replace(/[^0-9/d]/g, '');
            if (blnScan) {
                $scope.Detail.Scan.BarCode = numBarcode;
            }
            if (numBarcode != null && numBarcode > 0) {
                setBarCodeQty(numBarcode);
            }
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
            hmBarCodeScanQty.remove($scope.Detail.BarCodeScan);
            hmBarCodeScanQty.set($scope.Detail.BarCodeScan, CurrentQty);
            $scope.Detail.QtyScan = CurrentQty;
            if (dbWms) {
                dbWms.transaction(function(tx) {
                    dbSql = "INSERT INTO Imsn1 (IssueNoteNo, IssueLineItemNo, SerialNo) values(?, ?, ?)";
                    tx.executeSql(dbSql, [$scope.Detail.strGIN, $scope.Detail.LineItemNo, sn], null, null);
                    dbSql = "Update Imgi2 set ScanQty=? Where TrxNo=? and LineItemNo=?";
                    tx.executeSql(dbSql, [CurrentQty, $scope.Detail.TrxNo, $scope.Detail.LineItemNo], null, dbError);
                });
            }
            $('#txt-sn').select();
        };
        var ShowSn = function(sn, blnScan) {
            if (sn != null && sn > 0) {
                if (blnScan) {
                    $scope.Detail.SerialNo = sn;
                }

                var CurrentQty = hmBarCodeScanQty.get($scope.Detail.BarCodeScan);
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
                        ShowProduct($scope.Detail.Scan.BarCode, false);
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
                    if(blnVerifyInput('SerialNo')){
                        ShowSn($scope.Detail.SerialNo, false);
                    }
                } else {
                    alertPopup.close();
                    alertPopup = null;
                }
            }
        });
        var updateQty = function() {
            hmSnScanQty.remove($scope.Detail.BarCodeScan);
            hmSnScanQty.set($scope.Detail.BarCodeScan, $scope.Detail.QtyScan);
            if (dbWms) {
                dbWms.transaction(function(tx) {
                    dbSql = "Update Imgi2 set ScanQty=? Where TrxNo=? and LineItemNo=?";
                    tx.executeSql(dbSql, [$scope.Detail.QtyScan, $scope.Detail.TrxNo, $scope.Detail.LineItemNo], null, dbError);
                });
            }
        };
        $scope.changeQty = function() {
            if ($scope.Detail.QtyScan > 0 && $scope.Detail.BarCodeScan.length > 0) {
                if (!hmBarCodeScanQty.isEmpty() && hmBarCodeScanQty.containsKey($scope.Detail.BarCodeScan)) {
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
                                updateQty();
                            }
                        }]
                    });
                }
            }
        };
    }
]);
