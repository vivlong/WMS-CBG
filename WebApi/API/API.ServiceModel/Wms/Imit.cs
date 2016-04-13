using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data;
using ServiceStack;
using ServiceStack.ServiceHost;
using ServiceStack.OrmLite;
using WebApi.ServiceModel.Tables;

namespace WebApi.ServiceModel.Wms
{
				[Route("/wms/imit1/confirm", "Get")]				//confirm?UserID=
				[Route("/wms/imit2/create", "Get")]					//create?TrxNo= &Imgr2LineItemNo= &Imgr2TrxNo= &Imgr2LineItemNo= &NewStoreNo= &Qty= &UpdateBy= 
				public class Imit : IReturn<CommonResponse>
    {
								public string UserID { get; set; }
								public string Imgr2TrxNo { get; set; }
								public string Imgr2LineItemNo { get; set; }
								public string TrxNo { get; set; }
								public string LineItemNo { get; set; }
								public string NewStoreNo { get; set; }
								public string Qty { get; set; }
								public string UpdateBy { get; set; }
    }
				public class Imit_Logic
    {
        public IDbConnectionFactory DbConnectionFactory { get; set; }
								public List<Imit1> Confirm_Imit1(Imit request)
								{
												List<Imit1> Result = null;
												int intResult = -1;
												try
												{
																using (var db = DbConnectionFactory.OpenDbConnection("WMS"))
																{
																				string strSql = "EXEC spi_Imit1 @CustomerCode,@Description1,@Description2,@GoodsTransferNoteNo,@RefNo,@TransferBy,@TransferDateTime,@TrxNo,@WorkStation,@CreateBy,@UpdateBy";
																				intResult = db.SqlScalar<int>(strSql,
																								new {
																												CustomerCode = "",
																												Description1 = "",
																												Description2 = "",
																												GoodsTransferNoteNo = "",
																												RefNo = "",
																												TransferBy = request.UserID,
																												TransferDateTime = DateTime.Now,
																												TrxNo = "",
																												WorkStation = "APP",
																												CreateBy = request.UserID,
																												UpdateBy = request.UserID
																								});
																				if (intResult > -1)
																				{
																								strSql = "Select top 1 * From Imit1 Order By CreateDateTime Desc";
																								Result = db.Select<Imit1>(strSql);
																				}
																}
												}
												catch { throw; }
												return Result;
								}
								public int Insert_Imit2(Imit request)
								{
												int Result = -1;
												try
												{
																using (var db = DbConnectionFactory.OpenDbConnection())
																{
																				string strSql = "Select Imgr2.* " +
																							"From Imgr2 " +
																							"Where Imgr2.TrxNo=" + int.Parse(request.Imgr2TrxNo) + " And Imgr2.LineItemNo=" + int.Parse(request.Imgr2LineItemNo);
																				List<Imgr2> imgr2s = db.Select<Imgr2>(strSql);
																				if (imgr2s.Count > 0)
																				{
																								switch (imgr2s[0].DimensionFlag)
																								{
																												case "1":
																																db.Insert(
																																				new Imit2
																																				{
																																								TrxNo = int.Parse(request.TrxNo),
																																								LineItemNo = int.Parse(request.LineItemNo),
																																								NewStoreNo = request.NewStoreNo,
																																								UpdateBy = request.UpdateBy,
																																								MovementTrxNo = imgr2s[0].MovementTrxNo,
																																								NewWarehouseCode = imgr2s[0].WarehouseCode,
																																								StoreNo = imgr2s[0].StoreNo,
																																								WarehouseCode = imgr2s[0].WarehouseCode,
																																								ProductTrxNo = imgr2s[0].ProductTrxNo,
																																								PackingQty = int.Parse(request.Qty),
																																								Volume = imgr2s[0].Volume,
																																								Weight = imgr2s[0].Weight,
																																								SpaceArea = imgr2s[0].SpaceArea
																																				}
																																);
																																break;
																												case "2":
																																db.Insert(
																																				new Imit2
																																				{
																																								TrxNo = int.Parse(request.TrxNo),
																																								LineItemNo = int.Parse(request.LineItemNo),
																																								NewStoreNo = request.NewStoreNo,
																																								UpdateBy = request.UpdateBy,
																																								MovementTrxNo = imgr2s[0].MovementTrxNo,
																																								NewWarehouseCode = imgr2s[0].WarehouseCode,
																																								StoreNo = imgr2s[0].StoreNo,
																																								WarehouseCode = imgr2s[0].WarehouseCode,
																																								ProductTrxNo = imgr2s[0].ProductTrxNo,
																																								WholeQty = int.Parse(request.Qty),
																																								Volume = imgr2s[0].Volume,
																																								Weight = imgr2s[0].Weight,
																																								SpaceArea = imgr2s[0].SpaceArea
																																				}
																																);
																																break;
																												default:
																																db.Insert(
																																				new Imit2
																																				{
																																								TrxNo = int.Parse(request.TrxNo),
																																								LineItemNo = int.Parse(request.LineItemNo),
																																								NewStoreNo = request.NewStoreNo,
																																								UpdateBy = request.UpdateBy,
																																								MovementTrxNo = imgr2s[0].MovementTrxNo,
																																								NewWarehouseCode = imgr2s[0].WarehouseCode,
																																								StoreNo = imgr2s[0].StoreNo,
																																								WarehouseCode = imgr2s[0].WarehouseCode,
																																								ProductTrxNo = imgr2s[0].ProductTrxNo,
																																								LooseQty = int.Parse(request.Qty),
																																								Volume = imgr2s[0].Volume,
																																								Weight = imgr2s[0].Weight,
																																								SpaceArea = imgr2s[0].SpaceArea
																																				}
																																);
																																break;
																								}
																								Result = 1;
																				}
																}
												}
												catch { throw; }
												return Result;
								}
    }
}
