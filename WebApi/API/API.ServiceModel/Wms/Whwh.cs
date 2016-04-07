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
				[Route("/wms/whwh2", "Get")]				//whwh2?WarehouseCode= & StagingAreaFlag=
    public class Whwh : IReturn<CommonResponse>
    {
								public string WarehouseCode { get; set; }
								public string StagingAreaFlag { get; set; }
    }
				public class Whwh_Logic
    {        
        public IDbConnectionFactory DbConnectionFactory { get; set; }
								public List<Whwh2> Get_Whwh2_List(Whwh request)
        {
            List<Whwh2> Result = null;
												string strSQL = "";
            try
            {
																using (var db = DbConnectionFactory.OpenDbConnection("WMS"))
                {
																				if (string.IsNullOrEmpty(request.StagingAreaFlag))
																				{
																								strSQL = "Select * From Whwh2 Where WarehouseCode='" + request.WarehouseCode + "'";
																				}
																				else
																				{
																								strSQL = "Select * From Whwh2 Where WarehouseCode='" + request.WarehouseCode + "' And IsNull(StagingAreaFlag,'')='" + request.StagingAreaFlag + "'";
																				}
																				Result = db.Select<Whwh2>(strSQL);
                }
            }
            catch { throw; }
            return Result;
        }
    }
}
