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
				[Route("/wms/imgr1", "Get")]												//imgr1?GoodsReceiptNoteNo= & CustomerCode= & StatusCode=
				[Route("/wms/imgr1/confirm", "Get")]				//confirm?TrxNo= &UserID=
				[Route("/wms/imgr2", "Get")]												//imgr2?GoodsReceiptNoteNo=
				[Route("/wms/imgr2/putaway", "Get")]				//putaway?GoodsReceiptNoteNo=
				[Route("/wms/imgr2/putaway/update", "Get")]				//update?StoreNo= & TrxNo= & LineItemNo=
    public class Imgr : IReturn<CommonResponse>
    {
        public string CustomerCode { get; set; }
								public string GoodsReceiptNoteNo { get; set; }
								public string StatusCode { get; set; }
								public string TrxNo { get; set; }
								public string UserID { get; set; }
								public string StoreNo { get; set; }
								public string LineItemNo { get; set; }
    }
    public class Imgr_Logic
    {        
        public IDbConnectionFactory DbConnectionFactory { get; set; }
        public List<Imgr1> Get_Imgr1_List(Imgr request)
        {
            List<Imgr1> Result = null;
            try
            {
																using (var db = DbConnectionFactory.OpenDbConnection("WMS"))
                {
                    if (!string.IsNullOrEmpty(request.CustomerCode))
                    {                       
																								if (string.IsNullOrEmpty(request.StatusCode))
																								{
																												Result = db.SelectParam<Imgr1>(
																																i => i.CustomerCode != null && i.CustomerCode != "" && i.GoodsReceiptNoteNo != null && i.GoodsReceiptNoteNo != "" && i.StatusCode != null && i.StatusCode != "DEL" && i.StatusCode != "EXE" && i.StatusCode != "CMP" && i.CustomerCode == request.CustomerCode
																												).OrderByDescending(i => i.ReceiptDate).ToList<Imgr1>();
																								}
																								else
																								{
																												Result = db.SelectParam<Imgr1>(
																																i => i.CustomerCode != null && i.CustomerCode != "" && i.GoodsReceiptNoteNo != null && i.GoodsReceiptNoteNo != "" && i.StatusCode == request.StatusCode && i.CustomerCode == request.CustomerCode
																												).OrderByDescending(i => i.ReceiptDate).ToList<Imgr1>();
																								}
                    }
                    else if (!string.IsNullOrEmpty(request.GoodsReceiptNoteNo))
                    {
																								if (string.IsNullOrEmpty(request.StatusCode))
																								{
																												Result = db.SelectParam<Imgr1>(
																																	i => i.CustomerCode != null && i.CustomerCode != "" && i.GoodsReceiptNoteNo != null && i.GoodsReceiptNoteNo != "" && i.StatusCode != null && i.StatusCode != "DEL" && i.StatusCode != "EXE" && i.StatusCode != "CMP" && i.GoodsReceiptNoteNo.StartsWith(request.GoodsReceiptNoteNo)
																												);
																								}
																								else
																								{
																												Result = db.SelectParam<Imgr1>(
																																	i => i.CustomerCode != null && i.CustomerCode != "" && i.GoodsReceiptNoteNo != null && i.GoodsReceiptNoteNo != "" && i.StatusCode == request.StatusCode && i.GoodsReceiptNoteNo.StartsWith(request.GoodsReceiptNoteNo)
																												);
																								}
                    }                  
                }
            }
            catch { throw; }
            return Result;
        }
								public List<Imgr2> Get_Imgr2_List(Imgr request)
								{
												List<Imgr2> Result = null;
												try
												{
																using (var db = DbConnectionFactory.OpenDbConnection("WMS"))
																{
																				Result = db.Select<Imgr2>(
																								"Select Imgr2.* From Imgr2 " +
																								"Left Join Imgr1 On Imgr2.TrxNo = Imgr1.TrxNo " +
																								"Where Imgr1.GoodsReceiptNoteNo='" + request.GoodsReceiptNoteNo + "'"
																				);
																}
												}
												catch { throw; }
												return Result;
								}
								public List<Imgr2_Putaway> Get_Imgr2_Putaway_List(Imgr request)
								{
												List<Imgr2_Putaway> Result = null;
												try
												{
																using (var db = DbConnectionFactory.OpenDbConnection("WMS"))
																{
																				List<Impa1> impa1 = db.Select<Impa1>("Select * from Impa1");
																				string[] strBarCodeFormats = impa1[0].BarCodeField.Split('-');
																				string strBarCodeFiled = "";
																				for(int i=0;i<strBarCodeFormats.Length;i++){
																								strBarCodeFiled = strBarCodeFiled + "Convert(varchar(10),Imgr2." + strBarCodeFormats[i] + ") + '-' +";
																				}
																				strBarCodeFiled = strBarCodeFiled.Remove(strBarCodeFiled.LastIndexOf(')')+1);
																				Result = db.Select<Imgr2_Putaway>(
																								"Select Imgr2.*, " +
																								"(" + strBarCodeFiled + ") AS BarCode," +
																								"(Select StagingAreaFlag From Whwh2 Where WarehouseCode=Imgr2.WarehouseCode And StoreNo=Imgr2.StoreNo) AS StagingAreaFlag " +
																								"From Imgr2 " +
																								"Left Join Imgr1 On Imgr2.TrxNo = Imgr1.TrxNo " +
																								"Where Imgr1.GoodsReceiptNoteNo='" + request.GoodsReceiptNoteNo + "'"
																				);
																}
												}
												catch { throw; }
												return Result;
								}
								public int Confirm_Imgr1(Imgr request)
								{
												int Result = -1;
												try
												{
																using (var db = DbConnectionFactory.OpenDbConnection("WMS"))
																{
																				Result = db.SqlScalar<int>("EXEC spi_Imgr_Confirm @TrxNo,@UpdateBy", new { TrxNo = int.Parse(request.TrxNo), UpdateBy = request.UserID });
																				//List<int> results = db.SqlList<int>("EXEC spi_Imgr_Confirm @TrxNo @UpdateBy", new { TrxNo = request.TrxNo, UpdateBy = request.UserID });
																				//using (var cmd = db.SqlProc("spi_Imgr_Confirm", new { TrxNo = request.TrxNo, UpdateBy = request.UserID }))
																				//{
																				//    Result = cmd.ConvertTo<int>();
																				//}
																}
												}
												catch { throw; }
												return Result;
								}
								public int Update_Imgr2_StoreNo(Imgr request)
								{
												int Result = -1;
												try
												{
																using (var db = DbConnectionFactory.OpenDbConnection("WMS"))
																{
																				Result = db.Update<Imgr2>(
																								new
																								{
																												StoreNo = request.StoreNo
																								},
																								p => p.TrxNo == int.Parse(request.TrxNo) && p.LineItemNo == int.Parse(request.LineItemNo)
																				);
																}
												}
												catch { throw; }
												return Result;
								}
				}
}
