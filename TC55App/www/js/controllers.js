angular.module('MobileAPP.controllers', [
    'ionic',
    'ngCordova.plugins.dialogs',
    'ngCordova.plugins.toast',
    'ngCordova.plugins.appVersion',
    'ngCordova.plugins.file',
    'ngCordova.plugins.fileTransfer',
    'ngCordova.plugins.fileOpener2',
    'ngCordova.plugins.datePicker',
    'ngCordova.plugins.barcodeScanner',
    'ngCordova.plugins.pl43scanner',
    'ui.select',
    'MobileAPP.directives',
    'MobileAPP.services'
])

    .controller('LoadingCtrl',
        ['$state', '$timeout',
        function ($state, $timeout) {
            $timeout(function () {
                $state.go('login', { 'CheckUpdate': 'N' }, { reload: true });
            }, 2500);
        }])
    .controller('LoginCtrl',
        ['$scope', '$http', '$state', '$stateParams', '$ionicPopup', '$timeout', '$ionicLoading', '$cordovaToast', '$cordovaAppVersion', 'JsonServiceClient', '$cordovaPL43Scanner',
        function ($scope, $http, $state, $stateParams, $ionicPopup, $timeout, $ionicLoading, $cordovaToast, $cordovaAppVersion, JsonServiceClient, $cordovaPL43Scanner) {
            $scope.logininfo = {};
            if (undefined == $scope.logininfo.strUserName) {
                $scope.logininfo.strUserName = "";
            }
            if (undefined == $scope.logininfo.strPassword) {
                $scope.logininfo.strPassword = "";
            }
            $('#iUserName').on('keydown', function (e) {
                if (e.which === 9 || e.which === 13) {
                    $('#iPassword').focus();
                }
            });
            $('#iPassword').on('keydown', function (e) {
                if (e.which === 9 || e.which === 13) {
                    $scope.login();
                }
            });
            if ($stateParams.CheckUpdate === 'Y') {
                var url = strWebServiceURL + strBaseUrl + '/update.json';
                $http.get(url)
                    .success(function (res) {
                        var serverAppVersion = res.version;
                        $cordovaAppVersion.getVersionNumber().then(function (version) {
                            if (version != serverAppVersion) {
                                $state.go('update', { 'Version': serverAppVersion });
                            }
                        });
                    })
                    .error(function (res) {});
            }
            $scope.checkUpdate = function () {
                var url = strWebServiceURL + strBaseUrl + '/update.json';
                $http.get(url)
                    .success(function (res) {
                        var serverAppVersion = res.version;
                        $cordovaAppVersion.getVersionNumber().then(function (version) {
                            if (version != serverAppVersion) {
                                $state.go('update', { 'Version': serverAppVersion });
                            } else {
                                var alertPopup = $ionicPopup.alert({
                                    title: "Already the Latest Version!",
                                    okType: 'button-assertive'
                                });
                                $timeout(function () {
                                    alertPopup.close();
                                }, 2500);
                            }
                        });
                    })
                    .error(function (res) {
                        var alertPopup = $ionicPopup.alert({
                            title: "Connect Update Server Error!",
                            okType: 'button-assertive'
                        });
                        $timeout(function () {
                            alertPopup.close();
                        }, 2500);
                    });
            };
            $scope.setConf = function () {
                $state.go('setting', {}, { reload: true });
            };
            $scope.login = function () {
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.close();
                }
                if ($scope.logininfo.strUserName == "") {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Please Enter User Name.',
                        okType: 'button-assertive'
                    });
                    $timeout(function () {
                        alertPopup.close();
                    }, 2500);
                    return;
                }
                /*
                if ($scope.logininfo.strPassword == "") {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Please Enter Password.',
                        okType: 'button-assertive'
                    });
                    $timeout(function () {
                        alertPopup.close();
                    }, 2500);
                    return;
                }
                */
                $ionicLoading.show();
                var jsonData = { "UserId": $scope.logininfo.strUserName, "Password": hex_md5($scope.logininfo.strPassword) };
                var strUri = "/api/wms/action/list/login";
                var onSuccess = function (response) {
                    $ionicLoading.hide();
                    sessionStorage.clear();
                    sessionStorage.setItem("UserId", $scope.logininfo.strUserName);
                    $state.go('main', { }, { reload: true });
                };
                var onError = function () {
                    $ionicLoading.hide();
                };
                JsonServiceClient.postToService(strUri, jsonData, onSuccess, onError);
            };
        }])
    .controller('SettingCtrl',
        ['$scope', '$state', '$timeout', '$ionicLoading', '$ionicPopup', '$cordovaToast', '$cordovaFile',
        function ($scope, $state, $timeout, $ionicLoading, $ionicPopup, $cordovaToast, $cordovaFile) {
            $scope.Setting = {};
            $scope.Setting.WebServiceURL = strWebServiceURL.replace('http://', '');
            $scope.Setting.BaseUrl = strBaseUrl.replace('/', '');
            if (strPL43Device > 0) {
                $scope.Setting.PL43Device = { checked: true };
            } else {
                $scope.Setting.PL43Device = { checked: false };
            }
            $scope.returnLogin = function () {
                $state.go('login', { 'CheckUpdate': 'Y' }, { reload: true });
            };
            $scope.saveSetting = function () {
                if ($scope.Setting.WebServiceURL.length > 0) {
                    strWebServiceURL = $scope.Setting.WebServiceURL;
                    if (strWebServiceURL.length > 0) {
                        strWebServiceURL = "http://" + strWebServiceURL;
                    }
                } else { $scope.Setting.WebServiceURL = strWebServiceURL }
                if ($scope.Setting.BaseUrl.length > 0) {
                    strBaseUrl = $scope.Setting.BaseUrl;
                    if (strBaseUrl.length > 0) {
                        strBaseUrl = "/" + strBaseUrl;
                    }
                } else { $scope.Setting.BaseUrl = strBaseUrl }
                if ($scope.Setting.PL43Device.checked) {
                    strPL43Device = "1";
                } else {
                    strPL43Device = "0";
                }
                var data = 'BaseUrl=' + $scope.Setting.BaseUrl + '##WebServiceURL=' + $scope.Setting.WebServiceURL + '##PL43Device=' + strPL43Device;
                var path = cordova.file.externalRootDirectory;
                var directory = "WmsApp";
                var file = directory + "/Config.txt";
                $cordovaFile.writeFile(path, file, data, true)
                    .then(function (success) {
                        $state.go('login', { 'CheckUpdate': 'Y' }, { reload: true });
                    }, function (error) {
                        $cordovaToast.showShortBottom(error);
                    });
            };
            $scope.delSetting = function () {
                var path = cordova.file.externalRootDirectory;
                var directory = "WmsApp";
                var file = directory + "/Config.txt";
                $cordovaFile.removeFile(path, file)
                    .then(function (success) {
                        var alertPopup = $ionicPopup.alert({
                            title: 'Delete Config File Success.',
                            okType: 'button-calm'
                        });
                        $timeout(function () {
                            alertPopup.close();
                        }, 2500);
                    }, function (error) {
                        $cordovaToast.showShortBottom(error);
                    });
            };
        }])
    .controller('UpdateCtrl',
        ['$scope', '$stateParams', '$state', '$timeout', '$ionicLoading', '$cordovaToast', '$cordovaFile', '$cordovaFileTransfer', '$cordovaFileOpener2',
        function ($scope, $stateParams, $state, $timeout, $ionicLoading, $cordovaToast, $cordovaFile, $cordovaFileTransfer, $cordovaFileOpener2) {
            $scope.strVersion = $stateParams.Version;
            $scope.returnLogin = function () {
                $state.go('login', { 'CheckUpdate': 'N' }, { reload: true });
            };
            $scope.upgrade = function () {
                $ionicLoading.show({
                    template: "Download  0%"
                });
                var url = strWebServiceURL + strBaseUrl + "/TMS.apk";
                var blnError = false;
                $cordovaFile.checkFile(cordova.file.externalRootDirectory, "TMS.apk")
                .then(function (success) {
                    //
                }, function (error) {
                    blnError = true;
                });
                var targetPath = cordova.file.externalRootDirectory + "TMS.apk";
                var trustHosts = true;
                var options = {};
                if (!blnError) {
                    $cordovaFileTransfer.download(url, targetPath, options, trustHosts).then(function (result) {
                        $ionicLoading.hide();
                        $cordovaFileOpener2.open(targetPath, 'application/vnd.android.package-archive'
                        ).then(function () {
                            // success
                        }, function (err) {
                            // error
                        });
                    }, function (err) {
                        $cordovaToast.showShortCenter('Download faild.');
                        $ionicLoading.hide();
                        $state.go('login', { 'CheckUpdate': 'N' }, { reload: true });
                    }, function (progress) {
                        $timeout(function () {
                            var downloadProgress = (progress.loaded / progress.total) * 100;
                            $ionicLoading.show({
                                template: "Download  " + Math.floor(downloadProgress) + "%"
                            });
                            if (downloadProgress > 99) {
                                $ionicLoading.hide();
                            }
                        })
                    });
                } else {
                    $ionicLoading.hide();
                    $cordovaToast.showShortCenter('Check APK file faild.');
                    $state.go('login', { 'CheckUpdate': 'N' }, { reload: true });
                }
            };
        }])
    .controller('MainCtrl',
        ['$scope', '$http', '$state', '$stateParams', '$ionicPopup', '$timeout', 'JsonServiceClient',
        function ($scope, $http, $state, $stateParams, $ionicPopup, $timeout, JsonServiceClient) {
            $scope.GoToTask = function () {
                $state.go('taskList', {}, { reload: true });
            }
            $scope.GoToGrt = function () {
                $state.go('grtList', {}, { reload: true });
            };
            $scope.GoToVgin = function () {
                $state.go('vginList', {}, { reload: true });
            };
            $scope.GoToSetting = function () {
                $state.go('setting', {}, { reload: true });
            };            
        }])
    .controller('TaskListCtrl',
        ['$scope', '$stateParams', '$state', '$http', '$timeout', '$ionicLoading', '$ionicPopup', '$cordovaPL43Scanner', 'JsonServiceClient',
        function ($scope, $stateParams, $state, $http, $timeout, $ionicLoading, $ionicPopup, $cordovaPL43Scanner, JsonServiceClient) {
            var returnMainFun = function () {
                $state.go('main', {}, { reload: true });
            };
            $scope.returnMain = returnMainFun;
            var alertPopup = $ionicPopup.alert({
                title: 'No Tasks.',
                okType: 'button-calm'
            });
            $timeout(function () {
                alertPopup.close();
                returnMainFun();
            }, 2500);
        }])
    .controller('GrtListCtrl',
        ['$scope', '$stateParams', '$state', '$http', '$timeout', '$ionicLoading', '$ionicPopup', '$cordovaPL43Scanner', 'JsonServiceClient',
        function ($scope, $stateParams, $state, $http, $timeout, $ionicLoading, $ionicPopup, $cordovaPL43Scanner, JsonServiceClient) {
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
                var utcDate = Number(utc.substring(utc.indexOf('(') + 1, utc.lastIndexOf('-')));
                return new Date(utcDate).Format("yyyy-MM-dd");
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
        }])
    .controller('GrtDetailCtrl',
        ['$scope', '$stateParams', '$state', '$http', '$timeout', '$ionicHistory', '$ionicLoading', '$ionicPopup', '$ionicModal', '$cordovaToast', '$cordovaBarcodeScanner', '$cordovaPL43Scanner', 'JsonServiceClient',
        function ($scope, $stateParams, $state, $http, $timeout, $ionicHistory, $ionicLoading, $ionicPopup, $ionicModal, $cordovaToast, $cordovaBarcodeScanner, $cordovaPL43Scanner, JsonServiceClient) {
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
                if (e.which === 112 || e.which === 113 || e.which === 114 || e.which === 115) {
                    $cordovaPL43Scanner.scan().then(function (barcode) {
                        ShowProduct(barcode, true);
                    }, function (error) {
                        $cordovaToast.showShortBottom(error);
                    });
                } else if (e.which === 9 || e.which === 13) {
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
                if (e.which === 112 || e.which === 113 || e.which === 114 || e.which === 115) {
                    $cordovaPL43Scanner.scan().then(function (sn) {
                        ShowSn(sn, true);
                    }, function (error) {
                        $cordovaToast.showShortBottom(error);
                    });
                } else if (e.which === 9 || e.which === 13) {
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
        }])
    .controller('VginListCtrl',
        ['$scope', '$stateParams', '$state', '$http', '$timeout', '$ionicLoading', '$ionicPopup', '$cordovaPL43Scanner', 'JsonServiceClient',
        function ($scope, $stateParams, $state, $http, $timeout, $ionicLoading, $ionicPopup, $cordovaPL43Scanner, JsonServiceClient) {
            $scope.Rcbp1 = {};
            $scope.GinNo = {};
            $scope.Imgi1s = {};
            $scope.refreshRcbp1 = function (BusinessPartyName) {
                var strUri = "/api/wms/action/list/rcbp1/" + BusinessPartyName;
                var onSuccess = function (response) {
                    $scope.Rcbp1s = response.data.results;
                };
                JsonServiceClient.getFromService(strUri, onSuccess);
            };
            $scope.refreshGinNos = function (Grn) {
                var strUri = "/api/wms/action/list/imgi1/gin/" + Grn;
                var onSuccess = function (response) {
                    $scope.GinNos = response.data.results;
                };
                JsonServiceClient.getFromService(strUri, onSuccess);
            };            
            $scope.ShowImgi1 = function (Customer) {
                var strUri = "/api/wms/action/list/imgi1/" + Customer;
                var onSuccess = function (response) {
                    $scope.Imgi1s = response.data.results;
                };
                var onError = function (response) {
                    $cordovaToast.showShortBottom(response.meta.errors.message);
                };
                var onFinally = function () {
                    if (window.cordova && window.cordova.plugins.Keyboard) {
                        cordova.plugins.Keyboard.close();
                    }
                    $('#div-vgin-list').focus();
                };
                JsonServiceClient.getFromService(strUri, onSuccess, onError, onFinally);
            };
            $scope.showDate = function (utc) {
                var utcDate = Number(utc.substring(utc.indexOf('(') + 1, utc.lastIndexOf('-')));
                return new Date(utcDate).Format("yyyy-MM-dd");
            };
            $scope.GoToDetail = function (Imgi1) {
                if (Imgi1 != null) {
                    $state.go('vginDetail', { 'CustomerCode': Imgi1.CustomerCode, 'TrxNo': Imgi1.TrxNo, 'GoodsIssueNoteNo': Imgi1.GoodsIssueNoteNo }, { reload: true });
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
        }])
    .controller('VginDetailCtrl',
        ['$scope', '$stateParams', '$state', '$http', '$timeout', '$ionicHistory', '$ionicLoading', '$ionicPopup', '$cordovaToast', '$cordovaBarcodeScanner', '$cordovaPL43Scanner', 'JsonServiceClient',
        function ($scope, $stateParams, $state, $http, $timeout, $ionicHistory, $ionicLoading, $ionicPopup, $cordovaToast, $cordovaBarcodeScanner, $cordovaPL43Scanner, JsonServiceClient) {
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
            var returnListFun = function () {
                if ($ionicHistory.backView()) {
                    $ionicHistory.goBack();
                }
                else {
                    $state.go('vginList', {}, { reload: true });
                }
            };
            $scope.returnList = returnListFun;
            $scope.CamScanBarCode = function () {
                $cordovaBarcodeScanner.scan().then(function (imageData) {
                    $scope.vginDetail.BarCodeScan = imageData.text;
                    ShowProduct($scope.vginDetail.BarCodeScan, true);
                }, function (error) {
                    $cordovaToast.showShortBottom(error);
                });
            };
            $scope.CamScanSerialNo = function () {
                if ($('#txt-detail-sn').attr("readonly") != "readonly") {
                    $cordovaBarcodeScanner.scan().then(function (imageData) {
                        $scope.vginDetail.SerialNoScan = imageData.text;
                        ShowSn($scope.vginDetail.SerialNoScan, false);
                    }, function (error) {
                        $cordovaToast.showShortBottom(error);
                    });
                }
            };
            $scope.clearBarCode = function () {
                if ($scope.vginDetail.BarCodeScan.length > 0) {
                    $scope.vginDetail.BarCodeScan = "";
                    $scope.vginDetail.SerialNoScan = "";
                    $scope.vginDetail.QtyScan = 0;
                    $('#txt-detail-sn').attr("readonly",true);
                    $('#txt-detail-barcode').select();
                }
            };
            $scope.clearSerialNo = function () {
                if ($scope.vginDetail.SerialNoScan.length > 0) {
                    $scope.vginDetail.SerialNoScan = "";
                    $('#txt-detail-sn').select();
                }
            };
            $scope.showImgi2Prev = function () {
                var blnHasPrev = false;
                var intLineItemNo = $scope.vginDetail.LineItemNo - 1;
                if ($scope.vginDetailImgi2.length > 0) {
                    for (var i = 0; i < $scope.vginDetailImgi2.length; i++) {
                        if ($scope.vginDetailImgi2[i].LineItemNo === intLineItemNo) {
                            blnHasPrev = true;
                            break;
                        }
                    }
                }
                if (blnHasPrev) {
                    $scope.clearBarCode();
                    showImgi2(intLineItemNo - 1);
                } else {
                    $cordovaToast.showShortBottom("Already the first one.");
                }
            }
            $scope.showImgi2Next = function () {
                var blnHasNext = false;
                var intLineItemNo = $scope.vginDetail.LineItemNo + 1;
                if ($scope.vginDetailImgi2.length > 0) {
                    for (var i = 0; i < $scope.vginDetailImgi2.length; i++) {
                        if ($scope.vginDetailImgi2[i].LineItemNo === intLineItemNo) {
                            blnHasNext = true;
                            break;
                        }
                    }
                }
                if (blnHasNext) {
                    $scope.clearBarCode();
                    showImgi2(intLineItemNo - 1);
                } else {
                    $cordovaToast.showShortBottom("Already the last one.");
                }
            }
            var showImgi2 = function (LineItemNo) {
                if (LineItemNo != null && $scope.vginDetailImgi2.length > 0) {
                    $scope.vginDetail.TrxNo = $scope.vginDetailImgi2[LineItemNo].TrxNo;
                    $scope.vginDetail.LineItemNo = $scope.vginDetailImgi2[LineItemNo].LineItemNo;
                    $scope.vginDetail.StoreNo = $scope.vginDetailImgi2[LineItemNo].StoreNo;
                    $scope.vginDetail.ProductCode = $scope.vginDetailImgi2[LineItemNo].ProductCode;
                    $scope.vginDetail.ProductName = $scope.vginDetailImgi2[LineItemNo].ProductName;
                    $scope.vginDetail.SerialNoFlag = $scope.vginDetailImgi2[LineItemNo].SerialNoFlag;
                    $scope.vginDetail.BarCode = $scope.vginDetailImgi2[LineItemNo].UserDefine01;
                    switch ($scope.vginDetailImgi2[LineItemNo].DimensionFlag) {
                        case '1':
                            $scope.vginDetail.Qty = $scope.vginDetailImgi2[LineItemNo].PackingQty;
                            break;
                        case '2':
                            $scope.vginDetail.Qty = $scope.vginDetailImgi2[LineItemNo].WholeQty;
                            break;
                        default :
                            $scope.vginDetail.Qty = $scope.vginDetailImgi2[LineItemNo].LooseQty;
                    }
                    if (!mapBarCodeScanQty.isEmpty()) {
                        if (mapBarCodeScanQty.containsKey($scope.vginDetail.BarCode)) {
                            $scope.vginDetail.QtyScan = mapBarCodeScanQty.get($scope.vginDetail.BarCode);
                        }
                    }
                }
            };
            var insertImgi2 = function (vginDetailImgi2Actual) {
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
                mapBarCodeScanQty.put(strBarCode, 0);
                if (dbWms) {
                    dbWms.transaction(function (tx) {
                        tx.executeSql("INSERT INTO Imgi2 (TrxNo, LineItemNo, StoreNo, ProductTrxNo, ProductCode, DimensionFlag, ProductName, SerialNoFlag, BarCode, PackingQty, WholeQty, LooseQty) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?, ?)", [intTrxNo, intLineItemNo, strStoreNo, intProductTrxNo, strProductCode, strDimensionFlag, strProductName, strSerialNoFlag, strBarCode, intPackingQty, intWholeQty, intLooseQty], null, dbError);
                    });
                }
            };
            var GetImgi2ProductCode = function (GoodsIssueNoteNo) {
                $ionicLoading.show();
                var strUri = "/api/wms/action/list/imgi2/" + GoodsIssueNoteNo;
                var onSuccess = function (response) {
                    $scope.vginDetailImgi2 = response.data.results;
                    if (dbWms) {
                        dbWms.transaction(function (tx) {
                            dbSql = "Delete from Imgi2";
                            tx.executeSql(dbSql, [], null, dbError)
                        });
                    }
                    $ionicLoading.hide();
                    if ($scope.vginDetailImgi2.length > 0) {
                        for (var i = 0; i < $scope.vginDetailImgi2.length; i++) {
                            insertImgi2($scope.vginDetailImgi2[i]);
                        }
                        showImgi2(0);
                    } else {
                        var alertPopup = $ionicPopup.alert({
                            title: 'This GIN has no Products.',
                            okType: 'button-calm'
                        });
                        $timeout(function () {
                            alertPopup.close();
                            returnListFun();
                        }, 2500);
                    }
                };
                var onError = function (response) {
                    $ionicLoading.hide();
                };
                JsonServiceClient.getFromService(strUri, onSuccess, onError);
            };
            GetImgi2ProductCode($scope.vginDetail.strGIN);
            var insertImsn1 = function (Imsn1) {
                mapSnSerialNo.put(Imsn1.IssueNoteNo + "#" + Imsn1.IssueLineItemNo, Imsn1.SerialNo);
                if (dbWms) {
                    dbWms.transaction(function (tx) {
                        dbSql = "INSERT INTO Imsn1 (IssueNoteNo, IssueLineItemNo, SerialNo) values(?, ?, ?)"
                        tx.executeSql(dbSql, [Imsn1.IssueNoteNo, Imsn1.IssueLineItemNo, Imsn1.SerialNo], null, dbError);
                    });
                }
            };
            var GetImsn1SerialNo = function (GoodsIssueNoteNo) {
                $ionicLoading.show();
                var strUri = "/api/wms/action/list/imsn1/" + GoodsIssueNoteNo;
                var onSuccess = function (response) {
                    $scope.vginDetailImsn1 = response.data.results;
                    if (dbWms) {
                        dbWms.transaction(function (tx) {
                            dbSql = "Delete from Imsn1";
                            tx.executeSql(dbSql, [], null, dbError)
                        });
                    }
                    $ionicLoading.hide();
                    if ($scope.vginDetailImsn1.length > 0) {
                        for (var i = 0; i < $scope.vginDetailImsn1.length; i++) {
                            insertImsn1($scope.vginDetailImsn1[i]);
                        }
                    }
                };
                var onError = function (response) {
                    $ionicLoading.hide();
                };
                JsonServiceClient.getFromService(strUri, onSuccess, onError);
            };
            GetImsn1SerialNo($scope.vginDetail.strGIN);
            var setBarCodeQty = function (numBarcode) {
                if ($scope.vginDetail.BarCodeScan === numBarcode) {
                    var CurrentQty = 0;
                    if (!mapBarCodeScanQty.isEmpty()) {
                        if (mapBarCodeScanQty.containsKey(numBarcode)) {
                            CurrentQty = mapBarCodeScanQty.get(numBarcode);
                        }
                    }
                    if ($scope.vginDetail.SerialNoFlag != null && $scope.vginDetail.SerialNoFlag === 'Y') {
                        $('#txt-detail-sn').removeAttr("readonly");
                        $('#txt-detail-sn').select();
                    } else {
                        CurrentQty += 1;
                        mapBarCodeScanQty.remove(numBarcode);
                        mapBarCodeScanQty.put(numBarcode, CurrentQty);
                        $scope.vginDetail.QtyScan = CurrentQty;
                        $('#txt-detail-barcode').select();
                        if (dbWms) {
                            dbWms.transaction(function (tx) {
                                dbSql = "Update Imgi2 set ScanQty=? Where TrxNo=? and LineItemNo=?";
                                tx.executeSql(dbSql, [$scope.vginDetail.QtyScan, $scope.vginDetail.TrxNo, $scope.vginDetail.LineItemNo], null, dbError);
                            });
                        }
                    }                    
                } else {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Invalid product picked.',
                        okType: 'button-assertive'
                    });
                    $timeout(function () {
                        alertPopup.close();
                    }, 2500);
                }
            };
            var ShowProduct = function (barcode, blnScan) {
                var numBarcode = barcode.replace(/[^0-9/d]/g, '');
                if (blnScan) {
                    $scope.vginDetail.BarCodeScan = numBarcode;
                }
                if (numBarcode != null && numBarcode > 0) {                    
                    setBarCodeQty(numBarcode);
                }
            };
            $('#txt-detail-barcode').on('keydown', function (e) {
                if(strPL43Device > 0 && (e.which === 112 || e.which === 113 || e.which === 114 || e.which === 115)) {
                    $cordovaPL43Scanner.scan().then(function (barcode) {
                        ShowProduct(barcode, true);
                    }, function (error) {
                        $cordovaToast.showShortBottom(error);
                    });
                } else if (e.which === 9 || e.which === 13) {
                    ShowProduct($scope.vginDetail.BarCodeScan, false);
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
            var setSnQty = function (sn, SnArray, CurrentQty) {
                if (SnArray.length > 1) {
                    if (checkSn(sn, SnArray)) {
                        return;
                    }
                }
                SnArray.push(sn);
                mapSnScanQty.remove($scope.vginDetail.BarCodeScan);
                mapSnScanQty.put($scope.vginDetail.BarCodeScan, SnArray);
                CurrentQty += 1;
                mapBarCodeScanQty.remove($scope.vginDetail.BarCodeScan);
                mapBarCodeScanQty.put($scope.vginDetail.BarCodeScan, CurrentQty);
                $scope.vginDetail.QtyScan = CurrentQty;
                if (dbWms) {
                    dbWms.transaction(function (tx) {
                        dbSql = "INSERT INTO Imsn1 (IssueNoteNo, IssueLineItemNo, SerialNo) values(?, ?, ?)";
                        tx.executeSql(dbSql, [$scope.vginDetail.strGIN, $scope.vginDetail.LineItemNo, sn], null, null);
                        dbSql = "Update Imgi2 set ScanQty=? Where TrxNo=? and LineItemNo=?";
                        tx.executeSql(dbSql, [CurrentQty, $scope.vginDetail.TrxNo, $scope.vginDetail.LineItemNo], null, dbError);
                    });
                }
                $('#txt-detail-sn').select();
            };
            var ShowSn = function (sn, blnScan) {
                if (sn != null && sn > 0) {
                    if (blnScan) {
                        $scope.vginDetail.SerialNo = sn;
                    }

                    var CurrentQty = mapBarCodeScanQty.get($scope.vginDetail.BarCodeScan);
                    var SnArray = null;
                    if (!mapSnScanQty.isEmpty()) {
                        if (mapSnScanQty.containsKey($scope.vginDetail.BarCodeScan)) {
                            SnArray = mapSnScanQty.get($scope.vginDetail.BarCodeScan);
                        } else {
                            SnArray = new Array();
                            SnArray.push(sn);
                            mapSnScanQty.put($scope.vginDetail.BarCodeScan, SnArray);
                        }
                    } else {
                        SnArray = new Array();
                        SnArray.push(sn);
                        mapSnScanQty.put($scope.vginDetail.BarCodeScan, SnArray);
                    }
                    setSnQty(sn, SnArray, CurrentQty);
                }
            };
            $('#txt-detail-sn').on('keydown', function (e) {
                if (strPL43Device > 0 && (e.which === 112 || e.which === 113 || e.which === 114 || e.which === 115)) {
                    $cordovaPL43Scanner.scan().then(function (sn) {
                        ShowSn(sn, true);
                    }, function (error) {
                        $cordovaToast.showShortBottom(error);
                    });
                } else if (e.which === 9 || e.which === 13) {
                    ShowSn($scope.vginDetail.SerialNo, false);
                }
            });
            var updateQty = function () {
                mapSnScanQty.remove($scope.vginDetail.BarCodeScan);
                mapSnScanQty.put($scope.vginDetail.BarCodeScan, $scope.vginDetail.QtyScan);
                if (dbWms) {
                    dbWms.transaction(function (tx) {
                        dbSql = "Update Imgi2 set ScanQty=? Where TrxNo=? and LineItemNo=?";
                        tx.executeSql(dbSql, [$scope.vginDetail.QtyScan, $scope.vginDetail.TrxNo, $scope.vginDetail.LineItemNo], null, dbError);
                    });
                }
            };
            $scope.changeQty = function () {
                if ($scope.vginDetail.QtyScan > 0 && $scope.vginDetail.BarCodeScan.length > 0) {
                    if (!mapBarCodeScanQty.isEmpty() && mapBarCodeScanQty.containsKey($scope.vginDetail.BarCodeScan)) {
                        var promptPopup = $ionicPopup.show({
                            template: '<input type="number" ng-model="vginDetail.QtyScan">',
                            title: 'Enter Qty',
                            subTitle: 'Are you sure to change Qty manually?',
                            scope: $scope,
                            buttons: [
                              { text: 'Cancel' },
                              {
                                  text: '<b>Save</b>',
                                  type: 'button-positive',
                                  onTap: function (e) {
                                      updateQty();
                                  }
                              }
                            ]
                        });
                    }
                }
            };
        }])