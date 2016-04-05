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
				[Route("/wms/imgr1", "Get")]				//imgr1?GoodsReceiptNoteNo= & CustomerCode=
				[Route("/wms/imgr1/confirm", "Post")]
				[Route("/wms/imgr2", "Get")]				//imgr2?GoodsReceiptNoteNo=
    public class Imgr : IReturn<CommonResponse>
    {
        public string CustomerCode { get; set; }
        public string GoodsReceiptNoteNo { get; set; }
								public int TrxNo { get; set; }
								public string UserID { get; set; }
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
                        Result = db.SelectParam<Imgr1>(
                            i => i.CustomerCode != null && i.CustomerCode != "" && i.GoodsReceiptNoteNo != null && i.GoodsReceiptNoteNo != "" && i.StatusCode != null && i.StatusCode != "DEL" && i.StatusCode != "EXE" && i.StatusCode != "CMP" && i.CustomerCode == request.CustomerCode
                        ).OrderByDescending(i => i.ReceiptDate).ToList<Imgr1>();
                    }
                    else if (!string.IsNullOrEmpty(request.GoodsReceiptNoteNo))
                    {
                        Result = db.SelectParam<Imgr1>(
                             i => i.CustomerCode != null && i.CustomerCode != "" && i.GoodsReceiptNoteNo != null && i.GoodsReceiptNoteNo != "" && i.StatusCode != null && i.StatusCode != "DEL" && i.StatusCode != "EXE" && i.StatusCode != "CMP" && i.GoodsReceiptNoteNo.StartsWith(request.GoodsReceiptNoteNo)
                        );
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
																								"Where Imgr1.GoodsReceiptNoteNo={0}",
																								request.GoodsReceiptNoteNo
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
																				Result = db.SqlScalar<int>("EXEC spi_Imgr_Confirm @TrxNo,@UpdateBy", new { TrxNo = request.TrxNo, UpdateBy = request.UserID });
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
				}
}
