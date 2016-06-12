
var dbInfo = {
    dbName: 'WmsDB',
    dbVersion: '1.0',
    dbDisplayName: 'WMS Database',
    dbEstimatedSize: 10 * 11024 * 1024
};
var dbSql = '';
function dbError(tx, error) {
    console.log(error.message);
}
var dbWms = window.openDatabase(dbInfo.dbName, dbInfo.dbVersion, dbInfo.dbDisplayName, dbInfo.dbEstimatedSize);
if (dbWms) {
    dbWms.transaction(function (tx) {
        dbSql = 'DROP TABLE if exists Imgr2_Receipt';
        tx.executeSql(dbSql, [], null, dbError);
        dbSql = "CREATE TABLE Imgr2_Receipt (TrxNo INT, LineItemNo INT, ProductTrxNo INT, ProductCode TEXT, ProductDescription TEXT, SerialNo TEXT, DimensionFlag TEXT, PackingQty INT, WholeQty INT, LooseQty INT, ScanQty INT)";
        tx.executeSql(dbSql, [], null, dbError);
        dbSql = 'DROP TABLE if exists Imsn1_Receipt';
        tx.executeSql(dbSql, [], null, dbError);
        dbSql = "CREATE TABLE Imsn1_Receipt (ReceiptNoteNo TEXT, ReceiptLineItemNo INT, IssueNoteNo TEXT, IssueLineItemNo INT, SerialNo TEXT)";
        tx.executeSql(dbSql, [], null, dbError);

        dbSql = 'DROP TABLE if exists Impm1_Putaway';
        tx.executeSql(dbSql, [], null, dbError);
        dbSql = "CREATE TABLE Impm1_Putaway (TrxNo INT, BatchNo TEXT, BatchLineItemNo INT, StoreNo TEXT, StagingAreaFlag TEXT, ProductTrxNo INT, ProductCode TEXT, ProductDescription TEXT, SerialNo TEXT, ScanQty INT)";
        tx.executeSql(dbSql, [], null, dbError);

        dbSql = 'DROP TABLE if exists Imgr2_Putaway';
        tx.executeSql(dbSql, [], null, dbError);
        dbSql = "CREATE TABLE Imgr2_Putaway (TrxNo INT, LineItemNo INT, StoreNo TEXT, StagingAreaFlag TEXT, ProductTrxNo INT, ProductCode TEXT, SerialNo TEXT, DimensionFlag TEXT, PackingQty INT, WholeQty INT, LooseQty INT, ScanQty INT)";
        tx.executeSql(dbSql, [], null, dbError);
        dbSql = 'DROP TABLE if exists Imsn1_Putaway';
        tx.executeSql(dbSql, [], null, dbError);
        dbSql = "CREATE TABLE Imsn1_Putaway (ReceiptNoteNo TEXT, ReceiptLineItemNo INT, IssueNoteNo TEXT, IssueLineItemNo INT, SerialNo TEXT)";
        tx.executeSql(dbSql, [], null, dbError);

        dbSql = 'DROP TABLE if exists Imgr2_Transfer';
        tx.executeSql(dbSql, [], null, dbError);
        dbSql = "CREATE TABLE Imgr2_Transfer (TrxNo INT, LineItemNo INT, StoreNo TEXT, StoreNoFrom TEXT, StoreNoTo TEXT, ProductTrxNo INT, ProductCode TEXT, ProductDescription TEXT, SerialNoFlag TEXT, BarCode TEXT, ScanQtyFrom INT, ScanQtyTo INT)";
        tx.executeSql(dbSql, [], null, dbError);
        dbSql = 'DROP TABLE if exists Imsn1_Transfer';
        tx.executeSql(dbSql, [], null, dbError);
        dbSql = "CREATE TABLE Imsn1_Transfer (ReceiptNoteNo TEXT, ReceiptLineItemNo INT, IssueNoteNo TEXT, IssueLineItemNo INT, SerialNo TEXT)";
        tx.executeSql(dbSql, [], null, dbError);

        dbSql = 'DROP TABLE if exists Imgi2_Picking';
        tx.executeSql(dbSql, [], null, dbError);
        dbSql = "CREATE TABLE Imgi2_Picking (RowNum, TrxNo INT, LineItemNo INT, StoreNo TEXT, ProductTrxNo INT, ProductCode TEXT, ProductDescription TEXT, SerialNo TEXT, PackingNo TEXT, Qty INT, ScanQty INT, QtyBal INT)";
        tx.executeSql(dbSql, [], null, dbError);
        dbSql = 'DROP TABLE if exists Imsn1_Picking';
        tx.executeSql(dbSql, [], null, dbError);
        dbSql = "CREATE TABLE Imsn1_Picking (ReceiptNoteNo TEXT, ReceiptLineItemNo INT, IssueNoteNo TEXT, IssueLineItemNo INT, SerialNo TEXT)";
        tx.executeSql(dbSql, [], null, dbError);

        dbSql = 'DROP TABLE if exists Imgi2_Verify';
        tx.executeSql(dbSql, [], null, dbError);
        dbSql = "CREATE TABLE Imgi2_Verify (RowNum, TrxNo INT, LineItemNo INT, ProductTrxNo INT, ProductCode TEXT, ProductDescription TEXT, SerialNo TEXT, Qty INT, ScanQty INT, QtyBal INT)";
        tx.executeSql(dbSql, [], null, dbError);
        dbSql = 'DROP TABLE if exists Imsn1_Verify';
        tx.executeSql(dbSql, [], null, dbError);
        dbSql = "CREATE TABLE Imsn1_Verify (ReceiptNoteNo TEXT, ReceiptLineItemNo INT, IssueNoteNo TEXT, IssueLineItemNo INT, SerialNo TEXT)";
        tx.executeSql(dbSql, [], null, dbError);
    });
}

var db_del_Imgr2_Receipt = function (){
    if ( dbWms ) {
        dbWms.transaction( function( tx ) {
            dbSql = 'Delete from Imgr2_Receipt';
            tx.executeSql( dbSql, [], null, dbError )
        } );
    }
}
var db_add_Imgr2_Receipt = function( imgr2 ) {
    if ( dbWms ) {
        dbWms.transaction( function( tx ) {
            dbSql = 'INSERT INTO Imgr2_Receipt (TrxNo, LineItemNo, ProductTrxNo, ProductCode, ProductDescription, SerialNo, DimensionFlag, PackingQty, WholeQty, LooseQty, ScanQty) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            tx.executeSql( dbSql, [ imgr2.TrxNo, imgr2.LineItemNo, imgr2.ProductTrxNo, imgr2.ProductCode, imgr2.ProductDescription, imgr2.SerialNo, imgr2.DimensionFlag, imgr2.PackingQty, imgr2.WholeQty, imgr2.LooseQty, 0], null, dbError );
        } );
    }
};
var db_update_Imgr2_Receipt = function( imgr2 ) {
    if ( dbWms ) {
        dbWms.transaction( function( tx ) {
            dbSql = 'Update Imgr2_Receipt set ScanQty=? Where TrxNo=? and LineItemNo=?';
            tx.executeSql( dbSql, [ imgr2.ScanQty, imgr2.TrxNo, imgr2.LineItemNo ], null, dbError );
        } );
    }
};
var db_del_Imsn1_Receipt = function (){
    if ( dbWms ) {
        dbWms.transaction( function( tx ) {
            dbSql = 'Delete from Imsn1_Receipt';
            tx.executeSql( dbSql, [], null, dbError )
        } );
    }
}
var db_add_Imsn1_Receipt = function( imsn1 ) {
    if ( dbWms ) {
        dbWms.transaction( function( tx ) {
            dbSql = 'INSERT INTO Imsn1_Receipt (ReceiptNoteNo, ReceiptLineItemNo, SerialNo) values(?, ?, ?)';
            tx.executeSql( dbSql, [ imsn1.ReceiptNoteNo, imsn1.ReceiptLineItemNo, imsn1.SerialNo], null, dbError );
        } );
    }
};

var db_del_Impm1_Putaway = function (){
    if ( dbWms ) {
        dbWms.transaction( function( tx ) {
            dbSql = 'Delete from Impm1_Putaway';
            tx.executeSql( dbSql, [], null, dbError )
        } );
    }
}
var db_add_Impm1_Putaway = function( impm1 ) {
    if ( dbWms ) {
        dbWms.transaction( function( tx ) {
            dbSql = 'INSERT INTO Impm1_Putaway (TrxNo, BatchNo, BatchLineItemNo, StoreNo, StagingAreaFlag, ProductTrxNo, ProductCode, ProductDescription, SerialNo, ScanQty) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            tx.executeSql( dbSql, [ impm1.TrxNo, impm1.BatchNo, impm1.BatchLineItemNo, impm1.StoreNo, impm1.StagingAreaFlag, impm1.ProductTrxNo, impm1.ProductCode, impm1.ProductDescription, impm1.SerialNo, 0], null, dbError );
        } );
    }
};
var db_update_Impm1_Putaway = function( impm1 ) {
    if ( dbWms ) {
        dbWms.transaction( function( tx ) {
            dbSql = 'Update Impm1_Putaway set ScanQty=?,StoreNo=? Where TrxNo=?';
            tx.executeSql( dbSql, [ impm1.ScanQty, impm1.StoreNo, impm1.TrxNo], null, dbError );
        } );
    }
};

var db_del_Imgr2_Putaway = function (){
    if ( dbWms ) {
        dbWms.transaction( function( tx ) {
            dbSql = 'Delete from Imgr2_Putaway';
            tx.executeSql( dbSql, [], null, dbError )
        } );
    }
}
var db_add_Imgr2_Putaway = function( imgr2 ) {
    if ( dbWms ) {
        dbWms.transaction( function( tx ) {
            dbSql = 'INSERT INTO Imgr2_Putaway (TrxNo, LineItemNo, StoreNo, StagingAreaFlag, ProductTrxNo, ProductCode, SerialNo, DimensionFlag, PackingQty, WholeQty, LooseQty, ScanQty) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            tx.executeSql( dbSql, [ imgr2.TrxNo, imgr2.LineItemNo, imgr2.StoreNo, imgr2.StagingAreaFlag, imgr2.ProductTrxNo, imgr2.ProductCode, imgr2.SerialNo, imgr2.DimensionFlag, imgr2.PackingQty, imgr2.WholeQty, imgr2.LooseQty, 0], null, dbError );
        } );
    }
};
var db_update_Imgr2_Putaway = function( imgr2 ) {
    if ( dbWms ) {
        dbWms.transaction( function( tx ) {
            dbSql = 'Update Imgr2_Putaway set ScanQty=?,StoreNo=? Where TrxNo=? and LineItemNo=?';
            tx.executeSql( dbSql, [ imgr2.ScanQty, imgr2.StoreNo, imgr2.TrxNo, imgr2.LineItemNo ], null, dbError );
        } );
    }
};

var db_del_Imgr2_Transfer = function (){
    if ( dbWms ) {
        dbWms.transaction( function( tx ) {
            dbSql = 'Delete from Imgr2_Transfer';
            tx.executeSql( dbSql, [], null, dbError )
        } );
    }
}
var db_add_Imgr2_Transfer = function( imgr2 ) {
    if ( dbWms ) {
        dbWms.transaction( function( tx ) {
            dbSql = 'INSERT INTO Imgr2_Transfer (TrxNo, LineItemNo, StoreNo, StoreNoFrom, StoreNoTo, ProductTrxNo, ProductCode, ProductDescription, SerialNoFlag, BarCode, ScanQtyFrom, ScanQtyTo) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            tx.executeSql( dbSql, [ imgr2.TrxNo, imgr2.LineItemNo, imgr2.StoreNo, imgr2.StoreNoFrom, imgr2.StoreNoTo, imgr2.ProductTrxNo, imgr2.ProductCode, imgr2.ProductDescription, imgr2.SerialNoFlag, imgr2.BarCode, 0, 0], null, dbError );
        } );
    }
};
var db_update_Imgr2_Transfer = function( imgr2, type ) {
    if ( dbWms ) {
        if(is.equal(type,'from')){
            dbWms.transaction( function( tx ) {
                dbSql = 'Update Imgr2_Transfer set ScanQtyFrom=?,StoreNoFrom=? Where TrxNo=? and LineItemNo=?';
                tx.executeSql( dbSql, [ imgr2.ScanQtyFrom, imgr2.StoreNoFrom, imgr2.TrxNo, imgr2.LineItemNo ], null, dbError );
            } );
        }else if(is.equal(type,'to')){
            dbWms.transaction( function( tx ) {
                dbSql = 'Update Imgr2_Transfer set ScanQtyTo=?,StoreNoTo=? Where TrxNo=? and LineItemNo=?';
                tx.executeSql( dbSql, [ imgr2.ScanQtyTo, imgr2.StoreNoTo, imgr2.TrxNo, imgr2.LineItemNo ], null, dbError );
            } );
        }
    }
};
var db_query_Imgr2_Transfer = function( callback ) {
    if ( dbWms ) {
        dbWms.transaction( function( tx ) {
            dbSql = 'Select * from Imgr2_Transfer';
            tx.executeSql( dbSql, [], function( tx, results ) {
                var len = results.rows.length;
                var arr = new Array();
                for ( var i = 0; i < len; i++ ) {
                    var imgr2 = {
                        TrxNo : results.rows.item( i ).TrxNo,
                        LineItemNo : results.rows.item( i ).LineItemNo,
                        StoreNo : results.rows.item( i ).StoreNo,
                        StoreNoFrom : results.rows.item( i ).StoreNoFrom,
                        StoreNoTo : results.rows.item( i ).StoreNoTo,
                        ProductTrxNo : results.rows.item( i ).ProductTrxNo,
                        ProductCode : results.rows.item( i ).ProductCode,
                        ProductDescription : results.rows.item( i ).ProductDescription,
                        SerialNoFlag : results.rows.item( i ).SerialNoFlag,
                        ScanQtyFrom : results.rows.item( i ).ScanQtyFrom > 0 ? results.rows.item( i ).ScanQtyFrom : 0,
                        ScanQtyTo : results.rows.item( i ).ScanQtyTo > 0 ? results.rows.item( i ).ScanQtyTo : 0,
                        BarCode : results.rows.item( i ).BarCode
                    };
                    arr.push( imgr2 );
                }
                if( typeof(callback) == 'function') callback(arr);
            }, dbError )
        } );
    }
}

var db_del_Imgi2_Picking = function (){
    if ( dbWms ) {
        dbWms.transaction( function( tx ) {
            dbSql = 'Delete from Imgi2_Picking';
            tx.executeSql( dbSql, [], null, dbError )
        } );
    }
}
var db_add_Imgi2_Picking = function(imgi2) {
    if (dbWms) {
        dbWms.transaction(function(tx) {
            dbSql = 'INSERT INTO Imgi2_Picking (RowNum, TrxNo, LineItemNo, StoreNo, ProductTrxNo, ProductCode, ProductDescription, SerialNo, PackingNo, Qty, ScanQty, QtyBal) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?)';
            tx.executeSql(dbSql, [imgi2.RowNum, imgi2.TrxNo, imgi2.LineItemNo, imgi2.StoreNo, imgi2.ProductTrxNo, imgi2.ProductCode, imgi2.ProductDescription, imgi2.SerialNo, imgi2.PackingNo, imgi2.Qty, 0, imgi2.Qty], null, dbError);
        });
    }
};
var db_update_Imgi2_Picking = function( imgi2 ) {
    if ( dbWms ) {
        dbWms.transaction( function( tx ) {
            dbSql = 'Update Imgi2_Picking set ScanQty=?, PackingNo=? Where TrxNo=? and LineItemNo=?';
            tx.executeSql( dbSql, [ imgi2.ScanQty, imgi2.PackingNo, imgi2.TrxNo, imgi2.LineItemNo ], null, dbError );
        } );
    }
};
var db_query_Imgi2_Picking = function( callback ) {
    if ( dbWms ) {
        dbWms.transaction( function( tx ) {
            dbSql = 'Select * from Imgi2_Picking';
            tx.executeSql( dbSql, [], function( tx, results ) {
                var len = results.rows.length;
                var arr = new Array();
                for ( var i = 0; i < len; i++ ) {
                    var imgi2 = results.rows.item( i );
                    imgi2.Qty = results.rows.item( i ).Qty > 0 ? results.rows.item( i ).Qty : 0;
                    imgi2.ScanQty = results.rows.item( i ).ScanQty > 0 ? results.rows.item( i ).ScanQty : 0;
                    imgi2.QtyBal = results.rows.item( i ).QtyBal > 0 ? results.rows.item( i ).QtyBal : 0;
                    arr.push( imgi2 );
                }
                if( typeof(callback) == 'function') callback(arr);
            }, dbError )
        } );
    }
}
var db_del_Imsn1_Picking = function (){
    if ( dbWms ) {
        dbWms.transaction( function( tx ) {
            dbSql = 'Delete from Imsn1_Picking';
            tx.executeSql( dbSql, [], null, dbError )
        } );
    }
}
var db_add_Imsn1_Picking = function(imsn1) {
    if (dbWms) {
        dbWms.transaction(function(tx) {
            dbSql = 'INSERT INTO Imsn1_Picking (IssueNoteNo, IssueLineItemNo, SerialNo) values(?, ?, ?)';
            tx.executeSql(dbSql, [imsn1.IssueNoteNo, imsn1.IssueLineItemNo, imsn1.SerialNo], null, dbError);
        });
    }
};

var db_del_Imgi2_Verify = function (){
    if ( dbWms ) {
        dbWms.transaction( function( tx ) {
            dbSql = 'Delete from Imgi2_Verify';
            tx.executeSql( dbSql, [], null, dbError )
        } );
    }
}
var db_add_Imgi2_Verify = function(imgi2) {
    if (dbWms) {
        dbWms.transaction(function(tx) {
            dbSql = 'INSERT INTO Imgi2_Verify (RowNum, TrxNo, LineItemNo, ProductTrxNo, ProductCode, ProductDescription, SerialNo, Qty, ScanQty, QtyBal) values(?, ?, ?, ?, ?, ?, ?, ? ,?, ?)';
            tx.executeSql(dbSql, [imgi2.RowNum, imgi2.TrxNo, imgi2.LineItemNo, imgi2.ProductTrxNo, imgi2.ProductCode, imgi2.ProductDescription, imgi2.SerialNo, imgi2.Qty, 0, imgi2.Qty], null, dbError);
        });
    }
};
var db_update_Imgi2_Verify = function( imgi2 ) {
    if ( dbWms ) {
        dbWms.transaction( function( tx ) {
            dbSql = 'Update Imgi2_Verify set ScanQty=? Where TrxNo=? and LineItemNo=?';
            tx.executeSql( dbSql, [ imgi2.ScanQty, imgi2.TrxNo, imgi2.LineItemNo ], null, dbError );
        } );
    }
};
var db_query_Imgi2_Verify = function( callback ) {
    if ( dbWms ) {
        dbWms.transaction( function( tx ) {
            dbSql = 'Select * from Imgi2_Verify';
            tx.executeSql( dbSql, [], function( tx, results ) {
                var len = results.rows.length;
                var arr = new Array();
                for ( var i = 0; i < len; i++ ) {
                    var imgi2 = results.rows.item( i );
                    imgi2.Qty = results.rows.item( i ).Qty > 0 ? results.rows.item( i ).Qty : 0;
                    imgi2.ScanQty = results.rows.item( i ).ScanQty > 0 ? results.rows.item( i ).ScanQty : 0;
                    imgi2.QtyBal = results.rows.item( i ).QtyBal > 0 ? results.rows.item( i ).QtyBal : 0;
                    arr.push( imgi2 );
                }
                if( typeof(callback) == 'function') callback(arr);
            }, dbError )
        } );
    }
}
var db_del_Imsn1_Verify = function (){
    if ( dbWms ) {
        dbWms.transaction( function( tx ) {
            dbSql = 'Delete from Imsn1_Verify';
            tx.executeSql( dbSql, [], null, dbError )
        } );
    }
}
var db_add_Imsn1_Verify = function(imsn1) {
    if (dbWms) {
        dbWms.transaction(function(tx) {
            dbSql = 'INSERT INTO Imsn1_Verify (IssueNoteNo, IssueLineItemNo, SerialNo) values(?, ?, ?)';
            tx.executeSql(dbSql, [imsn1.IssueNoteNo, imsn1.IssueLineItemNo, imsn1.SerialNo], null, dbError);
        });
    }
};

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
