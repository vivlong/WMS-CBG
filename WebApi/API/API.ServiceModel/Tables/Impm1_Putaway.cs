using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace WebApi.ServiceModel.Tables
{
				public class Impm1_Putaway
    {
								public int TrxNo { get; set; }
								public string BatchNo { get; set; }
								public int BatchLineItemNo { get; set; }
								public int ProductTrxNo { get; set; }
								public string StoreNo { get; set; }
								public string StagingAreaFlag { get; set; }
								public string SerialNo { get; set; }
								public string ProductCode { get; set; }
								public string ProductDescription { get; set; }
								public int ScanQty { get; set; }
    }
}
