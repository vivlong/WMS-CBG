
var dbInfo = {
    dbName: "WmsDB",
    dbVersion: "1.0",
    dbDisplayName: "WMS Database",
    dbEstimatedSize: 10 * 11024 * 1024
};
var dbSql = "";
function dbError(tx, error) {
    console.log(error.message);
}
var dbWms = window.openDatabase(dbInfo.dbName, dbInfo.dbVersion, dbInfo.dbDisplayName, dbInfo.dbEstimatedSize);
if (dbWms) {
    dbWms.transaction(function (tx) {
        dbSql = "CREATE TABLE if not exists Imgr2 (TrxNo INT, LineItemNo INT, ProductTrxNo INT, ProductCode TEXT, BarCode TEXT, DimensionFlag TEXT, PackingQty INT, WholeQty INT, LooseQty INT, ScanQty INT)";
        tx.executeSql(dbSql, [], null, dbError);
        dbSql = "CREATE TABLE if not exists Imsn1 (ReceiptNoteNo TEXT, ReceiptLineItemNo INT, IssueNoteNo TEXT, IssueLineItemNo INT, SerialNo TEXT)";
        tx.executeSql(dbSql, [], null, dbError);
        dbSql = "CREATE TABLE if not exists Imgi2 (TrxNo INT, LineItemNo INT, StoreNo TEXT, ProductTrxNo INT, ProductCode TEXT, DimensionFlag TEXT, ProductName TEXT, SerialNoFlag TEXT, BarCode TEXT, PackingQty INT, WholeQty INT, LooseQty INT, ScanQty INT)";
        tx.executeSql(dbSql, [], null, dbError);
    });
}

var appendProtocol = function(url, blnSSL, portNo) {
    if (url.length > 0 && url.toUpperCase().indexOf('HTTPS://') < 0 && url.toUpperCase().indexOf('HTTP://') < 0) {
        if(blnSSL){
            url = 'https://' + url;
        }else{
            var aURL = url.split('/');
            if(aURL[0].indexOf(':') < 0){
                url = 'http://' + aURL[0] + ':' + portNo;
            }else{
                url = 'http://' + aURL[0];
            }
            for(var i=1; i<aURL.length; i++){
                url = url + '/' + aURL[i];
            }
        }
    }
    return url;
};
var rmProtocol = function(url) {
    if (url.length > 0) {
        var regex = /(https?:\/\/)?/gi;
        url = url.replace(regex, '');
    }
    return url;
};
