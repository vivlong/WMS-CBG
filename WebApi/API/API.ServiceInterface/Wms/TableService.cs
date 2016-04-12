using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WebApi.ServiceModel;
using WebApi.ServiceModel.Wms;

namespace WebApi.ServiceInterface.Wms
{
    public class TableService
    {
								public void TS_Rcbp(Auth auth, Rcbp request, Rcbp_Logic rcbp_Logic, CommonResponse ecr, string[] token, string uri)
								{
												if (auth.AuthResult(token, uri))
												{
																if (uri.IndexOf("/wms/rcbp1") > 0)
																{
																				ecr.data.results = rcbp_Logic.Get_Rcbp1_List(request);
																}
																ecr.meta.code = 200;
																ecr.meta.message = "OK";
												}
												else
												{
																ecr.meta.code = 401;
																ecr.meta.message = "Unauthorized";
												}
								}
        public void TS_Imgr(Auth auth, Imgr request, Imgr_Logic imgr_Logic, CommonResponse ecr, string[] token, string uri)
        {
            if (auth.AuthResult(token, uri))
            {
																if (uri.IndexOf("/wms/imgr1/confirm") > 0)
																{
																				ecr.data.results = imgr_Logic.Confirm_Imgr1(request);
																}
																else if (uri.IndexOf("/wms/imgr1") > 0)
																{
																				ecr.data.results = imgr_Logic.Get_Imgr1_List(request);
																}
																else if (uri.IndexOf("/wms/imgr2/putaway/update") > 0)
																{
																				ecr.data.results = imgr_Logic.Update_Imgr2_StoreNo(request);
																}
																else if (uri.IndexOf("/wms/imgr2/putaway") > 0)
																{
																				ecr.data.results = imgr_Logic.Get_Imgr2_Putaway_List(request);
																}
																else if (uri.IndexOf("/wms/imgr2/transfer") > 0)
																{
																				ecr.data.results = imgr_Logic.Get_Imgr2_Transfer_List(request);
																}
																else if (uri.IndexOf("/wms/imgr2") > 0)
																{
																				ecr.data.results = imgr_Logic.Get_Imgr2_List(request);
																}
                ecr.meta.code = 200;
                ecr.meta.message = "OK";                
            }
            else
            {
                ecr.meta.code = 401;
                ecr.meta.message = "Unauthorized";
            }
        }
        public void TS_Impr(Auth auth, Impr request, Impr_Logic impr_Logic, CommonResponse ecr, string[] token, string uri)
        {
            if (auth.AuthResult(token, uri))
            {
																if (uri.IndexOf("/wms/impr1") > 0)
																{
																				ecr.data.results = impr_Logic.Get_Impr1_List(request);
																}
																ecr.meta.code = 200;
																ecr.meta.message = "OK";
            }
            else
            {
                ecr.meta.code = 401;
                ecr.meta.message = "Unauthorized";
            }
        }
								public void TS_Whwh(Auth auth, Whwh request, Whwh_Logic whwh_Logic, CommonResponse ecr, string[] token, string uri)
								{
												if (auth.AuthResult(token, uri))
												{
																if (uri.IndexOf("/wms/whwh2") > 0)
																{
																				ecr.data.results = whwh_Logic.Get_Whwh2_List(request);
																}
																ecr.meta.code = 200;
																ecr.meta.message = "OK";
												}
												else
												{
																ecr.meta.code = 401;
																ecr.meta.message = "Unauthorized";
												}
								}
        public void TS_Imgi(Auth auth, Imgi request, Imgi_Logic imgi_Logic, CommonResponse ecr, string[] token, string uri)
        {
            if (auth.AuthResult(token, uri))
            {
																if (uri.IndexOf("/wms/imgi1") > 0)
																{
																				ecr.data.results = imgi_Logic.Get_Imgi1_List(request);
																}
																else if (uri.IndexOf("/wms/imgi2") > 0)
																{
																				ecr.data.results = imgi_Logic.Get_Imgi2_List(request);
																}
                ecr.meta.code = 200;
                ecr.meta.message = "OK";
            }
            else
            {
                ecr.meta.code = 401;
                ecr.meta.message = "Unauthorized";
            }
        }
        public void TS_Imsn(Auth auth, Imsn request, Imsn_Logic imsn_Logic, CommonResponse ecr, string[] token, string uri)
        {
            if (auth.AuthResult(token, uri))
            {
																if (uri.IndexOf("/wms/imsn1/create") > 0)
																{
																				ecr.data.results = imsn_Logic.Insert_Imsn1(request);
																}
																else if (uri.IndexOf("/wms/imsn1") > 0)
																{
																				ecr.data.results = imsn_Logic.Get_Imsn1_List(request);
																}
																ecr.meta.code = 200;
																ecr.meta.message = "OK";
            }
            else
            {
                ecr.meta.code = 401;
                ecr.meta.message = "Unauthorized";
            }
        }
								public void TS_Imit(Auth auth, Imit request, Imit_Logic imit_Logic, CommonResponse ecr, string[] token, string uri)
								{
												if (auth.AuthResult(token, uri))
												{
																if (uri.IndexOf("/wms/imit1/confirm") > 0)
																{
																				ecr.data.results = imit_Logic.Confirm_Imit1(request);
																}
																ecr.meta.code = 200;
																ecr.meta.message = "OK";
												}
												else
												{
																ecr.meta.code = 401;
																ecr.meta.message = "Unauthorized";
												}
								}
    }
}
