using System.IO;
using System.Threading.Tasks;
using AutoMapper;
using DinkToPdf;
using DinkToPdf.Contracts;
using idcard.Data;
using idcard.Dtos;
using idcard.Models;
using idcard.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace idcard.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class PdfController : ControllerBase
    {
        private readonly IConverter _converter;
        private readonly IMapper _mapper;
        private readonly DataContext _context;
        public PdfController(IConverter converter, DataContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
            _converter = converter;
        }
        public static string _pathCss = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "css");
        private string _pathRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");

        private ServiceResponse<string> GetResponse(bool status, string msg)
        {
            ServiceResponse<string> response = new ServiceResponse<string>();
            response.Status = status;
            response.Message = msg;
            return response;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> CreatePdf(int id)
        {
            ServiceResponse<string> response = new ServiceResponse<string>();
            string linkPath = GetBaseUrl();

            var data = await _context.Tb_pengajuan.Include(c => c.Vendor).Include(c => c.Jenis)
                                .FirstOrDefaultAsync(c => c.Id == id);
            var cek = (GetJenis(data.Jenis.nama_jenis).Split(" "));
            // return Ok(new { cek, _pathCss, _pathRoot, linkPath });

            if (data == null) return Ok(GetResponse(false, "Data Pengajauan tdk ditemukan"));

            var idcard = await _context.Tb_idcard.FirstOrDefaultAsync(c => c.Pengajuan == data);
            if (idcard == null) return Ok(GetResponse(false, "Data Pengajauan belum memiliki Nomor Id Card"));


            var mapData = _mapper.Map<GetPengajuanDto>(data);
            mapData.IdCard = _mapper.Map<GetIdCardDto>(idcard);
            string height = "90 mm";
            string width = "60 mm";
            string file_name = "template.html";
            var globalSettings = new GlobalSettings
            {
                ColorMode = ColorMode.Color,
                Orientation = (cek[1] == "l" ? Orientation.Landscape : Orientation.Portrait),
                PaperSize = new PechkinPaperSize(width, height),
                Margins = new MarginSettings() { Top = 1, Bottom = 1, Left = 1, Right = 1 },
                DocumentTitle = "title",
            };

            var objectSettings = new ObjectSettings
            {
                PagesCount = true,
                HtmlContent = TemplateIdcard.GetHtmlString(file_name, mapData, linkPath, cek[1]),
                WebSettings = { DefaultEncoding = "utf-8", UserStyleSheet = Path.Combine(_pathCss, cek[0]) },
                HeaderSettings = { FontName = "Arial", FontSize = 9 },
                FooterSettings = { FontName = "Arial", FontSize = 9 }
            };
            var pdf = new HtmlToPdfDocument
            {
                GlobalSettings = globalSettings,
                Objects = { objectSettings }
            };
            // return Ok(new { cek, _pathCss, _pathRoot, linkPath });
            var file = _converter.Convert(pdf);
            return File(file, "application/pdf");
        }

        private string GetBaseUrl()
        {
            var baseUrl = $"{this.Request.Scheme}://{this.Request.Host.Value.ToString()}{this.Request.PathBase.Value.ToString()}";
            return baseUrl + "/";
        }

        private string GetJenis(string jenis)
        {
            string ret = jenis;
            ret = jenis;
            if (jenis.ToLower() == "tkjp")
            {
                ret = "style_tkjp.css l";
            }
            else if (jenis.ToLower() == "vendor")
            {
                ret = "style_vendor.css l";
            }
            else if (jenis.ToLower() == "pimpinan pertamina")
            {
                ret = "style_pegawai.css p";
            }
            else
            {
                ret = "style_amt.css l";
            }
            return ret;
        }

    }
}