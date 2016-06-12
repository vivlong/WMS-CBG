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
				[Route("/wms/impm1/putaway", "Get")]				//putaway?SerialNo=
				[Route("/wms/impm1/putaway/update", "Get")]				//update?TrxNo= &StoreNo= &ScanQty=
    public class Impm : IReturn<CommonResponse>
    {
								public string SerialNo { get; set; }
								public string TrxNo { get; set; }
								public string StoreNo { get; set; }
								public string ScanQty { get; set; }
    }
				private class Putaway_Update_ORM
				{
								public string TrxType { get; set; }
								public int ImgrTrxNo { get; set; }
								public int BatchLineItemNo { get; set; }
								public int ImgiTrxNo { get; set; }
								public int ImgiLineItemNo { get; set; }
				}
    public class Impm_Logic
    {        
        public IDbConnectionFactory DbConnectionFactory { get; set; }
								public List<Impm1_Putaway> Get_Impm1_Putaway_List(Impm request)
								{
												List<Impm1_Putaway> Result = null;
												try
												{
																using (var db = DbConnectionFactory.OpenDbConnection())
																{
																				string strSql = "Select " +
																								"Impm1.TrxNo, IsNull(Impm1.BatchNo,'') AS BatchNo, Impm1.BatchLineItemNo, Impm1.ProductTrxNo," +
																								"IsNull(Impm1.ProductCode,'') AS ProductCode, IsNull(Impm1.ProductName,'') AS ProductDescription," +
																								"IsNull(Impm1.SerialNo,'') AS SerialNo, IsNull(Impm1.StoreNo,'') AS StoreNo," +
																								"IsNull((Select StagingAreaFlag From Whwh2 Where WarehouseCode=Impm1.WarehouseCode And StoreNo=Impm1.StoreNo),'') AS StagingAreaFlag," +
																								"0 AS ScanQty " +
																								"From Impm1 " +
																								"Where (Impm1.TrxType='1' Or Impm1.TrxType='3') And Impm1.SerialNo='" + request.SerialNo + "'";
																				Result = db.Select<Impm1_Putaway>(strSql);
																}
												}
												catch { throw; }
												return Result;
								}
								public int Update_Impm1_StoreNo(Impm request)
								{
												int Result = -1;
												try
												{
																using (var db = DbConnectionFactory.OpenDbConnection())
																{
																				string strSql = "Select Impm1.TrxType, " +
																								"(Select TrxNo From Imgr1 Where GoodsReceiptNoteNo=Impm1.BatchNo) AS ImgrTrxNo, Impm1.BatchLineItemNo, " +
																								"(Select TrxNo From Imgi1 WHere GoodsIssueNoteNo=Impm1.GoodsReceiveorIssueNo) AS ImgiTrxNo," +
																								"(Select LineItemNo From Imgi2 Where Imgi2.ReceiptmovementTrxNo = Impm1.TrxNo) AS ImgiLineItemNo," + 
																								"From Impm1 " +
																								"Where Impm1.TrxNo=" + int.Parse(request.TrxNo);
																				List<Putaway_Update_ORM> impm1 = db.Select<Putaway_Update_ORM>(strSql);
																				if (impm1.Count > 0)
																				{
																								Result = db.Update<Imgr2>(
																												new
																												{
																																StoreNo = request.StoreNo
																												},
																												p => p.TrxNo == impm1[0].ImgrTrxNo && p.LineItemNo == impm1[0].BatchLineItemNo
																								);
																								Result = db.Update<Imgi2>(
																												new
																												{
																																StoreNo = request.StoreNo
																												},
																												p => p.TrxNo == impm1[0].ImgiTrxNo && p.LineItemNo == impm1[0].ImgiLineItemNo
																								);
																								Result = db.Update<Impm1>(
																												new
																												{
																																StoreNo = request.StoreNo
																												},
																												p => p.TrxNo == int.Parse(request.TrxNo)
																								);
																				}
																}
												}
												catch { throw; }
												return Result;
								}
				}
}
