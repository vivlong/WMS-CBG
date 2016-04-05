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
    //[Route("/wms/action/list/imgi1/{CustomerCode}", "Get")]
    //[Route("/wms/action/list/imgi1/gin/", "Get")]
				//[Route("/wms/action/list/imgi1/gin/{GoodsIssueNoteNo}", "Get")]
				[Route("/wms/imgi2", "Get")]				//imgi2?GoodsIssueNoteNo=
				//[Route("/wms/action/list/imgi2/{GoodsIssueNoteNo}", "Get")]
    public class Imgi : IReturn<CommonResponse>
    {
        public string CustomerCode { get; set; }
        public string GoodsIssueNoteNo { get; set; }
    }
				public class Imgi2_Response
				{
								public int RowNum { get; set; }
								public int TrxNo { get; set; }
								public int LineItemNo { get; set; }
								public string StoreNo { get; set; }
								public int ProductTrxNo { get; set; }
								public string ProductCode { get; set; }
								public string ProductDescription { get; set; }
								public string DimensionFlag { get; set; }
								public int PackingQty { get; set; }
								public int WholeQty { get; set; }
								public int LooseQty { get; set; }
								public string SerialNoFlag { get; set; }
								public string SerialNo { get; set; }
								public string UserDefine01 { get; set; }
				}
    public class Imgi_Logic
    {
        public IDbConnectionFactory DbConnectionFactory { get; set; }
        public List<Imgi1> Get_Imgi1_List(Imgi request)
        {
            List<Imgi1> Result = null;
            try
            {
																using (var db = DbConnectionFactory.OpenDbConnection("WMS"))
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
                            i => i.CustomerCode != null && i.CustomerCode != "" && i.StatusCode != null && i.StatusCode != "DEL" && i.StatusCode!="EXE" && i.StatusCode!="CMP" && i.GoodsIssueNoteNo.StartsWith(request.GoodsIssueNoteNo)
                        ).OrderByDescending(i => i.IssueDateTime).ToList<Imgi1>();
                    }                  
                }
            }
            catch { throw; }
            return Result;
        }
								public List<Imgi2_Response> Get_Imgi2_List(Imgi request)
								{
												List<Imgi2_Response> Result = null;
												try
												{
																using (var db = DbConnectionFactory.OpenDbConnection("WMS"))
																{
																				Result = db.Select<Imgi2_Response>(
																								"Select RowNum = ROW_NUMBER() OVER (ORDER BY Imgi2.StoreNo ASC), Imgi2.* From Imgi2 " +
																								"Left Join Imgi1 On Imgi2.TrxNo=Imgi1.TrxNo " +
																								"Left join Impr1 On Imgi2.ProductTrxNo=Impr1.TrxNo " +
																								"Where Imgi1.GoodsIssueNoteNo={0}",
																								request.GoodsIssueNoteNo
																				);
																}
												}
												catch { throw; }
												return Result;
								}
    }
}
