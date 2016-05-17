using System;
using System.IO;
using System.Web;
using System.Net;
using System.Linq;
using System.Text;
using System.Collections.Generic;
using ServiceStack;
using ServiceStack.Common.Web;
using ServiceStack.ServiceHost;
using ServiceStack.ServiceInterface;
using WebApi.ServiceModel;
using WebApi.ServiceModel.Wms;
using WebApi.ServiceModel.Utils;
using WebApi.ServiceInterface.Wms;
using File = System.IO.File;
using System.Reflection;

namespace WebApi.ServiceInterface
{
    public class ApiServices : Service
    {        
        public Auth auth { get; set; }
								#region WMS
								public ServiceModel.Wms.Wms_Login_Logic wms_Login_Logic { get; set; }
								public object Any(ServiceModel.Wms.Wms_Login request)
								{
												CommonResponse ecr = new CommonResponse();
												ecr.initial();
												try
												{
																ServiceInterface.Wms.LoginService ls = new ServiceInterface.Wms.LoginService();
																ls.initial(auth, request, wms_Login_Logic, ecr, this.Request.Headers.GetValues("Signature"), this.Request.RawUrl);
												}
												catch (Exception ex) { cr(ecr, ex); }
												return ecr;
								}
								public ServiceModel.Wms.Impa_Logic wms_Impa_Logic { get; set; }
								public object Any(ServiceModel.Wms.Impa request)
								{
												CommonResponse ecr = new CommonResponse();
												ecr.initial();
												try
												{
																ServiceInterface.Wms.TableService ls = new ServiceInterface.Wms.TableService();
																ls.TS_Impa(auth, request, wms_Impa_Logic, ecr, this.Request.Headers.GetValues("Signature"), this.Request.RawUrl);
												}
												catch (Exception ex) { cr(ecr, ex); }
												return ecr;
								}
								public ServiceModel.Wms.Imgr_Logic wms_Imgr_Logic { get; set; }
								public object Any(ServiceModel.Wms.Imgr request)
								{
												CommonResponse ecr = new CommonResponse();
												ecr.initial();
												try
												{
																ServiceInterface.Wms.TableService ts = new ServiceInterface.Wms.TableService();
																ts.TS_Imgr(auth, request, wms_Imgr_Logic, ecr, this.Request.Headers.GetValues("Signature"), this.Request.RawUrl);
												}
												catch (Exception ex) { cr(ecr, ex); }
												return ecr;
								}
								public ServiceModel.Wms.Impr_Logic wms_Impr_Logic { get; set; }
								public object Any(ServiceModel.Wms.Impr request)
								{
												CommonResponse ecr = new CommonResponse();
												ecr.initial();
												try
												{
																ServiceInterface.Wms.TableService ls = new ServiceInterface.Wms.TableService();
																ls.TS_Impr(auth, request, wms_Impr_Logic, ecr, this.Request.Headers.GetValues("Signature"), this.Request.RawUrl);
												}
												catch (Exception ex) { cr(ecr, ex); }
												return ecr;
								}
								public ServiceModel.Wms.Whwh_Logic wms_Whwh_Logic { get; set; }
								public object Any(ServiceModel.Wms.Whwh request)
								{
												CommonResponse ecr = new CommonResponse();
												ecr.initial();
												try
												{
																ServiceInterface.Wms.TableService ts = new ServiceInterface.Wms.TableService();
																ts.TS_Whwh(auth, request, wms_Whwh_Logic, ecr, this.Request.Headers.GetValues("Signature"), this.Request.RawUrl);
												}
												catch (Exception ex) { cr(ecr, ex); }
												return ecr;
								}								
								public ServiceModel.Wms.Imgi_Logic wms_Imgi_Logic { get; set; }
								public object Any(ServiceModel.Wms.Imgi request)
								{
												CommonResponse ecr = new CommonResponse();
												ecr.initial();
												try
												{
																ServiceInterface.Wms.TableService ts = new ServiceInterface.Wms.TableService();
																ts.TS_Imgi(auth, request, wms_Imgi_Logic, ecr, this.Request.Headers.GetValues("Signature"), this.Request.RawUrl);
												}
												catch (Exception ex) { cr(ecr, ex); }
												return ecr;
								}								
								public ServiceModel.Wms.Imsn_Logic wms_Imsn_Logic { get; set; }
								public object Any(ServiceModel.Wms.Imsn request)
								{
												CommonResponse ecr = new CommonResponse();
												ecr.initial();
												try
												{
																ServiceInterface.Wms.TableService ls = new ServiceInterface.Wms.TableService();
																ls.TS_Imsn(auth, request, wms_Imsn_Logic, ecr, this.Request.Headers.GetValues("Signature"), this.Request.RawUrl);
												}
												catch (Exception ex) { cr(ecr, ex); }
												return ecr;
								}
								public ServiceModel.Wms.Rcbp_Logic wms_Rcbp_Logic { get; set; }
								public object Any(ServiceModel.Wms.Rcbp request)
								{
												CommonResponse ecr = new CommonResponse();
												ecr.initial();
												try
												{
																ServiceInterface.Wms.TableService ts = new ServiceInterface.Wms.TableService();
																ts.TS_Rcbp(auth, request, wms_Rcbp_Logic, ecr, this.Request.Headers.GetValues("Signature"), this.Request.RawUrl);
												}
												catch (Exception ex) { cr(ecr, ex); }
												return ecr;
								}
								public ServiceModel.Wms.Imit_Logic wms_Imit_Logic { get; set; }
								public object Any(ServiceModel.Wms.Imit request)
								{
												CommonResponse ecr = new CommonResponse();
												ecr.initial();
												try
												{
																ServiceInterface.Wms.TableService ls = new ServiceInterface.Wms.TableService();
																ls.TS_Imit(auth, request, wms_Imit_Logic, ecr, this.Request.Headers.GetValues("Signature"), this.Request.RawUrl);
												}
												catch (Exception ex) { cr(ecr, ex); }
												return ecr;
								}
								#endregion
								private CommonResponse cr(CommonResponse ecr, Exception ex)
        {
            ecr.meta.code = 599;
            ecr.meta.message = "The server handle exceptions, the operation fails.";
            ecr.meta.errors.code = ex.GetHashCode();
            ecr.meta.errors.field = ex.HelpLink;
            ecr.meta.errors.message = ex.Message.ToString();
            return ecr;
        }
    }
}
