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
				[Route("/wms/impr1", "Get")]				//impr1?BarCode=
    //[Route("/wms/action/list/impr1/{BarCode}", "Get")]
    public class Impr : IReturn<CommonResponse>
    {
        public string BarCode { get; set; }
    }
    public class Impr_Logic
    {        
        public IDbConnectionFactory DbConnectionFactory { get; set; }
        public Impr1 Get_Impr1_List(Impr request)
        {
            Impr1 Result = null;
            try
            {
																using (var db = DbConnectionFactory.OpenDbConnection())
                {
																				Result = null;//db.QuerySingle<Impr1>(strSql);
                }
            }
            catch { throw; }
            return Result;
        }
    }
}
