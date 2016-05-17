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
				[Route("/wms/impa1", "Get")]
    public class Impa : IReturn<CommonResponse>
    {
    }
				public class Impa_Logic
    {        
        public IDbConnectionFactory DbConnectionFactory { get; set; }
								public List<Impa1> Get_Impa1_List(Impa request)
        {
												List<Impa1> Result = null;
            try
            {
																using (var db = DbConnectionFactory.OpenDbConnection())
																{
																				string strSQL = "Select IsNUll(BarCodeField,'') AS BarCodeField, IsNull(AppHideStoreNoFlag,'') AS AppHideStoreNoFlag from Impa1";
																				Result = db.Select<Impa1>(strSQL);
                }
            }
            catch { throw; }
            return Result;
        }
    }
}
