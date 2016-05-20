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

				[Route("/wms/imgi1", "Get")]				//imgi1?GoodsIssueNoteNo= & CustomerCode=
				[Route("/wms/imgi1/complete", "Get")]				//complete?GoodsIssueNoteNo= &UserID=
				[Route("/wms/imgi1/confirm", "Get")]				//confirm?GoodsIssueNoteNo= &UserID=
				[Route("/wms/imgi2", "Get")]				//imgi2?GoodsIssueNoteNo=
				[Route("/wms/imgi2/picking", "Get")]				//picking?GoodsIssueNoteNo=
				[Route("/wms/imgi2/verify", "Get")]					//verify?GoodsIssueNoteNo=
    public class Imgi : IReturn<CommonResponse>
    {
        public string CustomerCode { get; set; }
        public string GoodsIssueNoteNo { get; set; }
								public string UserID { get; set; }
    }
    public class Imgi_Logic
    {
        public IDbConnectionFactory DbConnectionFactory { get; set; }
        public List<Imgi1> Get_Imgi1_List(Imgi request)
        {
            List<Imgi1> Result = null;
            try
            {
																using (var db = DbConnectionFactory.OpenDbConnection())
                {
                    if (!string.IsNullOrEmpty(request.CustomerCode))
                    {
                        Result = db.SelectParam<Imgi1>(
                            i => i.CustomerCode != null && i.CustomerCode != "" && i.StatusCode != null && i.StatusCode != "DEL" && i.StatusCode!="EXE" && i.StatusCode!="CMP" && i.CustomerCode == request.CustomerCode
                        ).OrderByDescending(i => i.IssueDateTime).ToList<Imgi1>();
                    }
                    else if (!string.IsNullOrEmpty(request.GoodsIssueNoteNo))
                    {
                        Result = db.SelectParam<Imgi1>(
																												i => i.CustomerCode != null && i.CustomerCode != "" && i.StatusCode != null && i.StatusCode != "DEL" && i.StatusCode != "EXE" && i.StatusCode != "CMP" && i.GoodsIssueNoteNo.StartsWith(request.GoodsIssueNoteNo)
                        ).OrderByDescending(i => i.IssueDateTime).ToList<Imgi1>();
                    }                  
                }
            }
            catch { throw; }
            return Result;
        }
								public List<Imgi2_Picking> Get_Imgi2_Picking_List(Imgi request)
								{
												List<Imgi2_Picking> Result = null;
												try
												{
																using (var db = DbConnectionFactory.OpenDbConnection())
																{
																				string strSql = "Select RowNum = ROW_NUMBER() OVER (ORDER BY Imgi2.StoreNo ASC), " +
																								"Imgi2.TrxNo, Imgi2.LineItemNo, Imgi2.ProductTrxNo," +
																								"IsNull(Imgi2.StoreNo,'') AS StoreNo, IsNull(Imgi2.ProductCode,'') AS ProductCode," +
																								"IsNull(Imgi2.ProductDescription,'') AS ProductDescription," +
																								"IsNull(Imgi2.PackingNo,'') AS PackingNo," +
																								"(Select Top 1 SerialNo From Impm1 Where TrxNo=Imgi2.ReceiptMovementTrxNo) AS SerialNo," +
																								"(CASE Imgi2.DimensionFlag When '1' THEN Imgi2.PackingQty When '2' THEN Imgi2.WholeQty ELSE Imgi2.LooseQty END) AS Qty, " +
																								"0 AS QtyBal, 0 AS ScanQty " +
																								"From Imgi2 " +
																								"Left Join Imgi1 On Imgi2.TrxNo=Imgi1.TrxNo " +
																								"Where Imgi1.GoodsIssueNoteNo='" + request.GoodsIssueNoteNo + "'";
																				Result = db.Select<Imgi2_Picking>(strSql);
																}
												}
												catch { throw; }
												return Result;
								}
								public List<Imgi2_Verify> Get_Imgi2_Verify_List(Imgi request)
								{
												List<Imgi2_Verify> Result = null;
												try
												{
																using (var db = DbConnectionFactory.OpenDbConnection())
																{
																				string strSql = "Select RowNum = ROW_NUMBER() OVER (ORDER BY Imgi2.StoreNo ASC), " +
																								"Imgi2.TrxNo, Imgi2.LineItemNo, Imgi2.ProductTrxNo," +
																								"IsNull(Imgi2.StoreNo,'') AS StoreNo, IsNull(Imgi2.ProductCode,'') AS ProductCode," +
																								"IsNull(Imgi2.ProductDescription,'') AS ProductDescription," +
																								"(Select Top 1 SerialNo From Impm1 Where TrxNo=Imgi2.ReceiptMovementTrxNo) AS SerialNo," +
																								"(CASE Imgi2.DimensionFlag When '1' THEN Imgi2.PackingQty When '2' THEN Imgi2.WholeQty ELSE Imgi2.LooseQty END) AS Qty, " +
																								"0 AS QtyBal, 0 AS ScanQty " +
																								"From Imgi2 " +
																								"Left Join Imgi1 On Imgi2.TrxNo=Imgi1.TrxNo " +
																								"Where Imgi1.GoodsIssueNoteNo='" + request.GoodsIssueNoteNo + "'";
																				Result = db.Select<Imgi2_Verify>(strSql);
																}
												}
												catch { throw; }
												return Result;
								}
								public int Complete_Imgi1(Imgi request)
								{
												int Result = -1;
												try
												{
																using (var db = DbConnectionFactory.OpenDbConnection())
																{
																				/*
																				Result = db.Update<Imgi1>(
																								new
																								{
																												StatusCode = "CMP",
																												CompleteBy = request.UserID,
																												CompleteDate = DateTime.Now
																								},
																								p => p.GoodsIssueNoteNo == request.GoodsIssueNoteNo
																				);
																				if (Result > -1)
																				{
																				 * */
																				db.Insert(
																								new Imsl1
																								{
																												DocNo = request.GoodsIssueNoteNo,
																												Description = "PICKED",
																												StatusLogDateTime = DateTime.Now,
																												UserId = request.UserID,
																												StatusCode = "CMP",
																												UpdateBy = request.UserID,
																												UpdateDateTime = DateTime.Now
																								}
																				);
																				Result = 0;
																}
												}
												catch { throw; }
												return Result;
								}
								public int Confirm_Imgi1(Imgi request)
								{
												int Result = -1;
												try
												{
																using (var db = DbConnectionFactory.OpenDbConnection())
																{
																				db.Insert(
																								new Imsl1
																								{
																												DocNo = request.GoodsIssueNoteNo,
																												Description = "VERIFIED",
																												StatusLogDateTime = DateTime.Now,
																												UserId = request.UserID,
																												StatusCode = "CMP",
																												UpdateBy = request.UserID,
																												UpdateDateTime = DateTime.Now
																								}
																				);
																				Result = 0;
																}
												}
												catch { throw; }
												return Result;
								}
    }
}
