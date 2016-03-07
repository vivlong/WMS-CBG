
appControllers.controller('GrtListCtrl',
    ['$scope', '$stateParams', '$state', '$http', '$timeout', '$ionicLoading', '$ionicPopup', 'JsonServiceClient',
    function ($scope, $stateParams, $state, $http, $timeout, $ionicLoading, $ionicPopup, JsonServiceClient) {
        $scope.Rcbp1 = {};
        $scope.GrnNo = {};
        $scope.Imgr1s = {};
        $scope.refreshRcbp1 = function (BusinessPartyName) {
            var strUri = "/api/wms/action/list/rcbp1/" + BusinessPartyName;
            var onSuccess = function (response) {
                $scope.Rcbp1s = response.data.results;
            };
            JsonServiceClient.getFromService(strUri, onSuccess);
        };
        $scope.refreshGrnNos = function (Grn) {
            var strUri = "/api/wms/action/list/imgr1/grn/" + Grn;
            var onSuccess = function (response) {
                $scope.GrnNos = response.data.results;
            };
            JsonServiceClient.getFromService(strUri, onSuccess);
        };
        $scope.ShowImgr1 = function (Customer) {
            var strUri = "/api/wms/action/list/imgr1/" + Customer;
            var onSuccess = function (response) {
                $scope.Imgr1s = response.data.results;
            };
            var onError = function (response) {
                $cordovaToast.showShortBottom(response.meta.errors.message);
            };
            var onFinally = function () {
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.close();
                }
                $('#div-grt-list').focus();
            };
            JsonServiceClient.getFromService(strUri, onSuccess, onError, onFinally);
        };
        $scope.showDate = function (utc) {
            return moment(utc).format('DD-MMM-YYYY');
        };
        $scope.GoToDetail = function (Imgr1) {
            if (Imgr1 != null) {
                $state.go('grtDetail', { 'CustomerCode': Imgr1.CustomerCode, 'TrxNo': Imgr1.TrxNo, 'GoodsReceiptNoteNo': Imgr1.GoodsReceiptNoteNo }, { reload: true });
            }
        };
        $scope.returnMain = function () {
            $state.go('main', {}, { reload: true });
        };
        $('#div-list-rcbp').on('focus', (function () {
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.close();
            }
        }));
        $('#div-list-rcbp').focus();
    }]);

appControllers.controller('GrtDetailCtrl',
    ['$scope', '$stateParams', '$state', '$http', '$timeout', '$ionicHistory', '$ionicLoading', '$ionicPopup', '$ionicModal', '$cordovaToast', '$cordovaBarcodeScanner', 'JsonServiceClient',
    function ($scope, $stateParams, $state, $http, $timeout, $ionicHistory, $ionicLoading, $ionicPopup, $ionicModal, $cordovaToast, $cordovaBarcodeScanner, JsonServiceClient) {
        $scope.grtDetail = {};
        $scope.grtDetail.SerialNo = "";
        $scope.grtDetail.Qty = 0;
        $scope.grtDetail.strCustomer = $stateParams.CustomerCode;
        $scope.grtDetail.strGRN = $stateParams.GoodsReceiptNoteNo;
        $scope.grtDetail.intTrxNo = $stateParams.TrxNo;
        $scope.grtDetailImpr1 = {};
        $scope.grtDetailImgr2 = {};
        $scope.Imgr2s = {};
        /*
        $scope.Notification = { checked: false };
        $scope.NotificationChange = function () {
            if (!$scope.pushNotification.checked) {
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.close();
                }
            }
        };
        */
        $ionicModal.fromTemplateUrl('scan.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal = modal;
        });
        //Cleanup the modal when done with it!
        $scope.$on('$destroy', function () {
            $scope.modal.remove();
        });
        $scope.CamScanBarCode = function () {
            $cordovaBarcodeScanner.scan().then(function (imageData) {
                $scope.grtDetail.strBarCode = imageData.text;
                ShowProduct($scope.grtDetail.strBarCode, true);
            }, function (error) {
                $cordovaToast.showShortBottom(error);
            });
        };
        $scope.CamScanSerialNo = function () {
            if ($('#txt-grt-detail-sn').attr("readonly") != "readonly") {
                $cordovaBarcodeScanner.scan().then(function (imageData) {
                    $scope.grtDetail.SerialNo = imageData.text;
                    ShowSn($scope.grtDetail.SerialNo, false);
                }, function (error) {
                    $cordovaToast.showShortBottom(error);
                });
            }
        };
        var mapBarCodeScanQty = new HashMap();
        var mapSnScanQty = new HashMap();
        var checkProductCode = function (numBarcode, mapValue) {
            var existsProductCode = false;
            for (var i = 0; i < $scope.grtDetailImgr2.length; i++) {
                if ($scope.grtDetailImgr2[i].ProductCode === mapValue.ProductCode) {
                    mapValue.TrxNo = $scope.grtDetailImgr2[i].TrxNo.toString();
                    mapValue.LineItemNo = $scope.grtDetailImgr2[i].LineItemNo.toString();
                    mapBarCodeScanQty.remove(numBarcode);
                    mapBarCodeScanQty.put(numBarcode, mapValue);
                    existsProductCode = true;
                    break;
                }
            }
            return existsProductCode;
        };
        var setBarCodeQty = function (numBarcode, mapValue) {
            if (mapValue.ProductCode.length > 0 && checkProductCode(numBarcode, mapValue)) {
                if (mapValue.SerialNoFlag != null && mapValue.SerialNoFlag === 'Y') {
                    $scope.grtDetail.Qty = mapValue.CurrentQty;
                    $('#txt-grt-detail-sn').removeAttr("readonly");
                    $('#txt-grt-detail-sn').select();
                    if (dbWms) {
                        dbWms.transaction(function (tx) {
                            dbSql = "Update Imgr2 set BarCode=? Where TrxNo=? and LineItemNo=?";
                            tx.executeSql(dbSql, [numBarcode, mapValue.TrxNo, mapValue.LineItemNo], null, dbError);
                        });
                    }
                } else {
                    mapValue.CurrentQty += 1;
                    mapBarCodeScanQty.remove(numBarcode);
                    mapBarCodeScanQty.put(numBarcode, mapValue);
                    $scope.grtDetail.Qty = mapValue.CurrentQty;
                    $('#txt-grt-detail-barcode').select();
                    if (dbWms) {
                        dbWms.transaction(function (tx) {
                            dbSql = "Update Imgr2 set ScanQty=?, BarCode=? Where TrxNo=? and LineItemNo=?";
                            tx.executeSql(dbSql, [mapValue.CurrentQty, numBarcode, mapValue.TrxNo, mapValue.LineItemNo], null, dbError);
                        });
                    }
                }
            } else {
                var alertPopup = $ionicPopup.alert({
                    title: mapValue.ProductCode,
                    subTitle: "It not belongs to this GRN.",
                    okType: 'button-assertive'
                });
                $timeout(function () {
                    alertPopup.close();
                    $('#txt-grt-detail-barcode').select();
                }, 1500);
            }
        };
        var getBarCodeFromMap = function (numBarcode, mapValue) {
            $scope.grtDetailImpr1.ProductCode = mapValue.ProductCode;
            $scope.grtDetailImpr1.ProductName = mapValue.ProductName;
            setBarCodeQty(numBarcode, mapValue);
        };
        var getBarCodeFromWS = function (numBarcode) {
            var strUri = "/api/wms/action/list/impr1/" + numBarcode;
            var onSuccess = function (response) {
                $scope.grtDetailImpr1 = response.data.results;
                var mapValue = {};
                mapValue.ProductCode = $scope.grtDetailImpr1.ProductCode;
                mapValue.ProductName = $scope.grtDetailImpr1.ProductName;
                mapValue.SerialNoFlag = $scope.grtDetailImpr1.SerialNoFlag;
                mapValue.TrxNo = 0;
                mapValue.LineItemNo = 0;
                mapValue.CurrentQty = 0;
                mapBarCodeScanQty.put(numBarcode, mapValue);
                setBarCodeQty(numBarcode, mapValue);
                $ionicLoading.hide();
            };
            var onError = function (response) {
                $ionicLoading.hide();
                $scope.grtDetailImpr1 = {};
                $scope.grtDetail.Qty = 0;
            };
            JsonServiceClient.getFromService(strUri, onSuccess, onError);
        }
        var ShowProduct = function (barcode, blnScan) {
            var numBarcode = barcode.replace(/[^0-9/d]/g, '');
            if (blnScan) {
                $scope.grtDetail.strBarCode = numBarcode;
            }
            if (numBarcode != null && numBarcode > 0) {
                $ionicLoading.show();
                var currQty = 0;
                if (!mapBarCodeScanQty.isEmpty()) {
                    if (mapBarCodeScanQty.containsKey(numBarcode)) {
                        var mapValue = mapBarCodeScanQty.get(numBarcode);
                        getBarCodeFromMap(numBarcode, mapValue);
                        $ionicLoading.hide();
                    } else {
                        getBarCodeFromWS(numBarcode);
                    }
                } else {
                    getBarCodeFromWS(numBarcode);
                }
            }
        };
        $('#txt-grt-detail-barcode').on('focus', (function () {
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.close();
            }
        }));
        $('#txt-grt-detail-barcode').on('keydown', function (e) {
            if (e.which === 9 || e.which === 13) {
                ShowProduct($scope.grtDetail.strBarCode, false);
            }
        });
        var checkSn = function (sn, SnArray) {
            var blnExistSn = false;
            for (var i = 0; i < SnArray.length; i++) {
                if (SnArray[i].toString() === sn) {
                    blnExistSn = true;
                    break;
                }
            }
            return blnExistSn;
        };
        var setSnQty = function (sn, SnArray, mapValue) {
            if (SnArray.length > 1) {
                if (checkSn(sn, SnArray)) {
                    return;
                }
            }
            SnArray.push(sn);
            mapSnScanQty.remove($scope.grtDetail.strBarCode);
            mapSnScanQty.put($scope.grtDetail.strBarCode, SnArray);
            mapValue.CurrentQty += 1;
            mapBarCodeScanQty.remove($scope.grtDetail.strBarCode);
            mapBarCodeScanQty.put($scope.grtDetail.strBarCode, mapValue);
            $scope.grtDetail.Qty = mapValue.CurrentQty;
            if (dbWms) {
                dbWms.transaction(function (tx) {
                    dbSql = "INSERT INTO Imsn1 (ReceiptNoteNo, ReceiptLineItemNo, SerialNo) values(?, ?, ?)";
                    tx.executeSql(dbSql, [$scope.grtDetail.strGRN, mapValue.LineItemNo, sn], null, null);
                    dbSql = "Update Imgr2 set ScanQty=? Where TrxNo=? and LineItemNo=?";
                    tx.executeSql(dbSql, [mapValue.CurrentQty, mapValue.TrxNo, mapValue.LineItemNo], null, dbError);
                });
            }
            $('#txt-grt-detail-sn').select();
        };
        var ShowSn = function (sn, blnScan) {
            if (sn != null && sn > 0) {
                if (blnScan) {
                    $scope.grtDetail.SerialNo = sn;
                }
                var mapBcValue = mapBarCodeScanQty.get($scope.grtDetail.strBarCode);
                var SnArray = null;
                if (!mapSnScanQty.isEmpty()) {
                    if (mapSnScanQty.containsKey($scope.grtDetail.strBarCode)) {
                        SnArray = mapSnScanQty.get($scope.grtDetail.strBarCode);
                    } else {
                        SnArray = new Array();
                        SnArray.push(sn);
                        mapSnScanQty.put($scope.grtDetail.strBarCode, SnArray);
                    }
                } else {
                    SnArray = new Array();
                    SnArray.push(sn);
                    mapSnScanQty.put($scope.grtDetail.strBarCode, SnArray);
                }
                setSnQty(sn, SnArray, mapBcValue);
            }
        };
        $('#txt-grt-detail-sn').on('keydown', function (e) {
            if (e.which === 9 || e.which === 13) {
                ShowSn($scope.grtDetail.SerialNo, false);
            }
        });
        $scope.openModal = function () {
            $scope.modal.show();
            if (dbWms) {
                dbWms.transaction(function (tx) {
                    dbSql = "Select * from Imgr2";
                    tx.executeSql(dbSql, [], function (tx, results) {
                        var arr = new Array();
                        for (var i = 0; i < results.rows.length; i++) {
                            var objImgr2 = {};
                            objImgr2.TrxNo = results.rows.item(i).TrxNo;
                            objImgr2.LineItemNo = results.rows.item(i).LineItemNo;
                            objImgr2.ProductCode = results.rows.item(i).ProductCode;
                            if (results.rows.item(i).ScanQty > 0) {
                                objImgr2.ScanQty = results.rows.item(i).ScanQty;
                            } else {
                                objImgr2.ScanQty = 0;
                            }
                            objImgr2.BarCode = results.rows.item(i).BarCode;
                            switch (results.rows.item(i).DimensionFlag) {
                                case "1":
                                    objImgr2.ActualQty = results.rows.item(i).PackingQty;
                                    break;
                                case "2":
                                    objImgr2.ActualQty = results.rows.item(i).WholeQty;
                                    break;
                                default:
                                    objImgr2.ActualQty = results.rows.item(i).LooseQty;
                            }
                            arr.push(objImgr2);
                        }
                        $scope.Imgr2s = arr;
                    }, dbError)
                });
            }
        };
        $scope.closeModal = function () {
            $scope.Imgr2s = {};
            $scope.modal.hide();
        };
        $scope.returnList = function () {
            if ($ionicHistory.backView()) {
                $ionicHistory.goBack();
            }
            else {
                $state.go('grtList', {}, { reload: true });
            }
        };
        $scope.clearBarCode = function () {
            if ($scope.grtDetail.strBarCode.length > 0) {
                $scope.grtDetail.strBarCode = "";
                $scope.grtDetail.SerialNo = "";
                $scope.grtDetail.Qty = 0;
                $scope.grtDetailImpr1 = {};
                $('#txt-grt-detail-sn').attr("readonly", true);
                $('#txt-grt-detail-barcode').select();
            }
        };
        $scope.clearSerialNo = function () {
            if ($scope.grtDetail.SerialNo.length > 0) {
                $scope.grtDetail.SerialNo = "";
                $('#txt-grt-detail-sn').select();
            }
        };
        var updateQty = function (mapValue) {
            if (dbWms) {
                dbWms.transaction(function (tx) {
                    dbSql = "Update Imgr2 set ScanQty=? Where TrxNo=? and LineItemNo=?";
                    tx.executeSql(dbSql, [$scope.grtDetail.Qty, mapValue.TrxNo, mapValue.LineItemNo], null, dbError);
                });
            }
        };
        $scope.changeQty = function () {
            if ($scope.grtDetail.Qty > 0 && $scope.grtDetail.strBarCode.length > 0) {
                if (!mapBarCodeScanQty.isEmpty() && mapBarCodeScanQty.containsKey($scope.grtDetail.strBarCode)) {
                    var mapValue = mapBarCodeScanQty.get($scope.grtDetail.strBarCode);
                    var promptPopup = $ionicPopup.show({
                        template: '<input type="number" ng-model="grtDetail.Qty">',
                        title: 'Enter Qty',
                        subTitle: 'Are you sure to change Qty manually?',
                        scope: $scope,
                        buttons: [
                          { text: 'Cancel' },
                          {
                              text: '<b>Save</b>',
                              type: 'button-positive',
                              onTap: function (e) {
                                  updateQty(mapValue);
                              }
                          }
                        ]
                    });
                }
            }
        };
        $scope.checkConfirm = function () {
            if (dbWms) {
                dbWms.transaction(function (tx) {
                    dbSql = "Select * from Imgr2";
                    tx.executeSql(dbSql, [], function (tx, results) {
                        var len = results.rows.length;
                        if (len > 0) {
                            $ionicLoading.show();
                            var blnDiscrepancies = false;
                            for (var i = 0; i < len; i++) {
                                var objDetailImgr2 = {};
                                objDetailImgr2.intTrxNo = results.rows.item(i).TrxNo;
                                objDetailImgr2.intLineItemNo = results.rows.item(i).LineItemNo;
                                objDetailImgr2.strProductCode = results.rows.item(i).ProductCode;
                                objDetailImgr2.intScanQty = results.rows.item(i).ScanQty;
                                objDetailImgr2.strBarCode = results.rows.item(i).BarCode;
                                if (objDetailImgr2.strBarCode != null && objDetailImgr2.strBarCode.length > 0) {
                                    switch (results.rows.item(i).DimensionFlag) {
                                        case "1":
                                            objDetailImgr2.intQty = results.rows.item(i).PackingQty;
                                            break;
                                        case "2":
                                            objDetailImgr2.intQty = results.rows.item(i).WholeQty;
                                            break;
                                        default:
                                            objDetailImgr2.intQty = results.rows.item(i).LooseQty;
                                    }
                                    if (objDetailImgr2.intQty != objDetailImgr2.intScanQty) {
                                        console.log("Product (" + objDetailImgr2.strProductCode + ") Qty not equal.");
                                        blnDiscrepancies = true;
                                    }
                                } else {
                                    blnDiscrepancies = true;
                                }
                            }
                            if (blnDiscrepancies) {
                                $ionicLoading.hide();
                                var checkPopup = $ionicPopup.show({
                                    title: 'Discrepancies on Qty.',
                                    buttons: [
                                      {
                                          text: 'Cancel',
                                          onTap: function (e) {
                                              checkPopup.close();
                                          }
                                      },
                                      {
                                          text: '<b>Check</b>',
                                          type: 'button-assertive',
                                          onTap: function (e) {
                                              $timeout(function () {
                                                  $scope.openModal();
                                              }, 250);
                                              checkPopup.close();
                                          }
                                      }
                                    ]
                                });
                            } else {
                                sendConfirm();
                            }
                        }
                    }, dbError)
                });
            }
        };
        var sendConfirm = function () {
            var userID = sessionStorage.getItem("UserId").toString();
            var jsonData = { "UserId": userID, "TrxNo": $scope.grtDetail.intTrxNo };
            var strUri = "/api/wms/action/confirm/imgr1";
            var onSuccess = function (response) {
                $ionicLoading.hide();
                var alertPopup = $ionicPopup.alert({
                    title: 'Comfirm success.',
                    okType: 'button-calm'
                });
                $timeout(function () {
                    alertPopup.close();
                    $scope.returnList();
                }, 2500);
            };
            var onError = function () {
                $ionicLoading.hide();
            };
            JsonServiceClient.postToService(strUri, jsonData, onSuccess, onError);
        };
        var insertImgr2 = function (Imgr2) {
            if (dbWms) {
                dbWms.transaction(function (tx) {
                    dbSql = "INSERT INTO Imgr2 (TrxNo, LineItemNo, ProductTrxNo, ProductCode, DimensionFlag, PackingQty, WholeQty, LooseQty) values(?, ?, ?, ?, ?, ?, ?, ?)";
                    tx.executeSql(dbSql, [Imgr2.TrxNo, Imgr2.LineItemNo, Imgr2.ProductTrxNo, Imgr2.ProductCode, Imgr2.DimensionFlag, Imgr2.PackingQty, Imgr2.WholeQty, Imgr2.LooseQty], null, dbError);
                });
            }
        };
        var GetImgr2ProductCode = function (GoodsReceiptNoteNo) {
            $ionicLoading.show();
            var strUri = "/api/wms/action/list/imgr2/" + GoodsReceiptNoteNo;
            var onSuccess = function (response) {
                $scope.grtDetailImgr2 = response.data.results;
                if (dbWms) {
                    dbWms.transaction(function (tx) {
                        dbSql = "Delete from Imgr2";
                        tx.executeSql(dbSql, [], null, dbError)
                        dbSql = "Delete from Imsn1";
                        tx.executeSql(dbSql, [], null, dbError)
                    });
                }
                for (var i = 0; i < $scope.grtDetailImgr2.length; i++) {
                    insertImgr2($scope.grtDetailImgr2[i]);
                }
                $ionicLoading.hide();
            };
            var onError = function (response) {
                $ionicLoading.hide();
            };
            JsonServiceClient.getFromService(strUri, onSuccess, onError);
        };
        GetImgr2ProductCode($scope.grtDetail.strGRN);
        /*
        window.addEventListener('native.keyboardshow', function () {
            document.body.classList.add('keyboard-open');
        });
        */
    }]);
