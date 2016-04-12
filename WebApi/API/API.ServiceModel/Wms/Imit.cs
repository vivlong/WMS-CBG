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
				[Route("/wms/imit2/create", "Get")]					//create?TrxNo= &LineItemNo= &MovementTrxNo= &NewStoreNo= &StoreNo= &DimensionFlag= &Qty= &UpdateBy= 
				public class Imit : IReturn<CommonResponse>
    {
								public string UserID { get; set; }
								public string TrxNo { get; set; }
								public string LineItemNo { get; set; }
								public string MovementTrxNo { get; set; }
								public string NewStoreNo { get; set; }
								public string StoreNo { get; set; }
								public string DimensionFlag { get; set; }
								public string Qty { get; set; }
								public string UpdateBy { get; set; }
    }
				public class Imit_Logic
    {
        public IDbConnectionFactory DbConnectionFactory { get; set; }
								public int Confirm_Imit1(Imit request)
								{
												int Result = -1;
												try
												{
																using (var db = DbConnectionFactory.OpenDbConnection("WMS"))
																{
																				string strSql = "EXEC spi_Imit1 @CustomerCode,@Description1,@Description2,@GoodsTransferNoteNo,@RefNo,@TransferBy,@TransferDateTime,@TrxNo,@WorkStation,@CreateBy,@UpdateBy";
																				Result = db.SqlScalar<int>(strSql,
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
																				string strSql = "Select Imgr2.*, " +
																							"(Select Top 1 SerialNoFlag From Impr1 Where TrxNo=Imgr2.ProductTrxNo) AS SerialNoFlag " +
																							"From Imgr2 " +
																							"Where Imgr2.TrxNo=" + int.Parse(request.TrxNo) + " And Imgr2.LineItemNo=" + int.Parse(request.LineItemNo);
																				List<Imgr2_Transfer> imgr2s = db.Select<Imgr2_Transfer>(strSql);


																				db.Insert(
																								new Imit2
																								{
																												TrxNo = int.Parse(request.TrxNo),
																												LineItemNo = int.Parse(request.LineItemNo),
																												MovementTrxNo = int.Parse(request.MovementTrxNo),
																												NewStoreNo = request.NewStoreNo,
																												StoreNo = request.StoreNo,
																												UpdateBy = request.UpdateBy
																								}
																				);
																				Result = 1;
																}
												}
												catch { throw; }
												return Result;
								}
    }
}
