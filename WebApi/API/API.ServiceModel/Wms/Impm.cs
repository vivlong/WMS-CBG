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
				[Route("/wms/impm1/putaway", "Get")]												//putaway?SerialNo=
				[Route("/wms/impm1/putaway/update", "Get")]					//update?TrxNo= &StoreNo= &ScanQty=
    public class Impm : IReturn<CommonResponse>
    {
								public string SerialNo { get; set; }
								public string TrxNo { get; set; }
								public string StoreNo { get; set; }
								public string ScanQty { get; set; }
    }
    public class Impm_Logic
    {
								private class Putaway_Update_ORM
								{
												public int TrxNo { get; set; }
												public string BatchNo { get; set; }
												public string TrxType { get; set; }
												public int ImgrTrxNo { get; set; }
												public int BatchLineItemNo { get; set; }
												public int ImgiTrxNo { get; set; }
												public int ImgiLineItemNo { get; set; }
												public string ImgiGoodsIssueNoteNo { get; set; }
								}
        public IDbConnectionFactory DbConnectionFactory { get; set; }
								public List<Impm1_Putaway> Get_Impm1_Putaway_List(Impm request)
								{
												List<Impm1_Putaway> Result = null;
												try
												{
																using (var db = DbConnectionFactory.OpenDbConnection())
																{
																				string strSql = "Select Top 1 " +
																								"Impm1.TrxNo, Impm1.TrxType, IsNull(Impm1.BatchNo,'') AS BatchNo, Impm1.BatchLineItemNo, Impm1.ProductTrxNo," +
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
												int ResultTwo = -1;
												try
												{
																using (var db = DbConnectionFactory.OpenDbConnection())
																{
																				string strSql = "Select Impm1.TrxNo, IsNUll(Impm1.BatchNo,'') AS BatchNo, IsNUll(Impm1.TrxType,'') AS TrxType, " +
																								"(Select Top 1 TrxNo From Imgr1 Where GoodsReceiptNoteNo=Impm1.BatchNo) AS ImgrTrxNo, Impm1.BatchLineItemNo, " +
																								"(Select Top 1 TrxNo From Imgi2 WHere Imgi2.ReceiptmovementTrxNo = Impm1.TrxNo) AS ImgiTrxNo," +
																								"(Select Top 1 LineItemNo From Imgi2 Where Imgi2.ReceiptmovementTrxNo = Impm1.TrxNo) AS ImgiLineItemNo," + 
																								"(Select Top 1 GoodsIssueNoteNo From Imgi1 Left Join Imgi2 on Imgi1.TrxNo=Imgi2.TrxNo Where Imgi2.ReceiptmovementTrxNo = Impm1.TrxNo) AS ImgiGoodsIssueNoteNo " +
																								"From Impm1 " +
																								"Where Impm1.TrxNo=" + int.Parse(request.TrxNo);
																				List<Putaway_Update_ORM> impm1 = db.Select<Putaway_Update_ORM>(strSql);
																				if (impm1.Count > 0)
																				{
																								Result = db.Update<Impm1>(
																											new
																											{
																															StoreNo = request.StoreNo
																											},
																											p => p.TrxNo == int.Parse(request.TrxNo)
																								);
																								if (impm1[0].ImgrTrxNo > 0 && impm1[0].BatchLineItemNo > 0)
																								{
																												Result = db.Update<Imgr2>(
																																new
																																{
																																				StoreNo = request.StoreNo
																																},
																																p => p.TrxNo == impm1[0].ImgrTrxNo && p.LineItemNo == impm1[0].BatchLineItemNo
																												);
																								}
																								if (impm1[0].ImgiTrxNo > 0 && impm1[0].ImgiLineItemNo > 0)
																								{
																												ResultTwo = db.Update<Imgi2>(
																																new
																																{
																																				StoreNo = request.StoreNo
																																},
																																p => p.TrxNo == impm1[0].ImgiTrxNo && p.LineItemNo == impm1[0].ImgiLineItemNo
																												);
																												if (ResultTwo > -1 && !string.IsNullOrEmpty(impm1[0].ImgiGoodsIssueNoteNo))
																												{
																																Result = db.Update<Impm1>(
																																				new
																																				{
																																								StoreNo = request.StoreNo
																																				},
																																				p => p.GoodsReceiveorIssueNo == impm1[0].ImgiGoodsIssueNoteNo && p.BatchLineItemNo == impm1[0].BatchLineItemNo && p.TrxType == "2"
																																);
																												}
																								}
																				}
																}
												}
												catch { throw; }
												return Result;
								}
				}
}
