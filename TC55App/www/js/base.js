
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
