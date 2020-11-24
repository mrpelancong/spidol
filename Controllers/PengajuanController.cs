using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using idcard.Dtos;
using idcard.Models;
using idcard.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace idcard.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PengajuanController : ControllerBase
    {
        private readonly IPengajuanService _service;
        private readonly IHttpContextAccessor _httpContext;
        public PengajuanController(IPengajuanService service, IHttpContextAccessor httpContext)
        {
            _httpContext = httpContext;
            _service = service;
        }

        private string _pathRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "file");
        private int GetUserId() => int.Parse(_httpContext.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier));

        [HttpGet]
        public async Task<IActionResult> GetAllPengajuan()
        {
            var data = await _service.GetAllPengajuan(GetUserId());
            if (data.Data != null)
            {
                data.Data = GetPengajuanLink(data.Data);
            }
            return Ok(data);
        }

        [HttpGet("vendor/{vendorId}")]
        public async Task<IActionResult> GetAllPengajuanByVendor(int vendorId)
        {
            var data = await _service.GetPengajuanByVendor(vendorId);
            if (data.Data != null)
            {
                data.Data = GetPengajuanLink(data.Data);
            }
            return Ok(data);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAllPengajuan(int id)
        {
            var data = await _service.GetPengajuanById(id);
            if (data.Data != null)
            {
                data.Data = GetPengajuanLinkById(data.Data);
            }
            return Ok(data);
        }

        [HttpGet("status/{status}")]
        public async Task<IActionResult> GetAllPengajuan(string status)
        {
            var data = await _service.GetPengajuanByStatus(status);
            if (data.Data != null)
            {
                data.Data = GetPengajuanLink(data.Data);
            }
            return Ok(data);
        }

        [HttpGet("link/{jenis?}")]
        public IActionResult GetLinkUpload(string jenis)
        {
            return Ok(_service.GetLinkUpload(jenis));
        }

        [HttpPost]
        public async Task<IActionResult> AddDataPengajuan([FromForm] AddDataPengajuanDto req)
        {
            return Ok(await _service.AddDataPengajuan(req));
        }

        [HttpPost("file/{jenis}")]
        public async Task<IActionResult> AddFilePengajuan([FromForm] int id, [FromForm] IFormFile file, string jenis)
        {
            return Ok(await _service.AddFilePengajuanAdd(id, file, jenis));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePengajuan(int id)
        {
            return Ok(await _service.DeletePengajuan(id));
        }

        [AllowAnonymous]
        [HttpGet("download/{file}/{id}")]
        public async Task<IActionResult> DownloadFile(string file, int id)
        {
            ServiceResponse<string> response = new ServiceResponse<string>();
            var data = await _service.DownloadFile(file, id);
            if (!data.Status)
            {
                response.Status = false;
                response.Message = data.Message;
                return Ok(response);
            }
            var fileName = data.Data.FileName;
            var pathRoot = data.Data.PathRoot;
            var path = Path.Combine(pathRoot, fileName);
            var memory = new MemoryStream();
            try
            {
                using (var stream = new FileStream(path, FileMode.Open))
                {
                    await stream.CopyToAsync(memory);
                }
                memory.Position = 0;
                var ext = Path.GetExtension(path).ToLowerInvariant();
                return File(memory, GetMimeTypes()[ext], Path.GetFileName(path));
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Message = ex.Message;
                return Ok(response);
            }
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadTes([FromForm] IFormFile file, [FromForm] string type, [FromForm] string nama, [FromForm] int id)
        {
            var excep = new ArrayList();
            var data = await _service.Upload(file, type);
            return Ok(data);
        }

        private bool Checked(string type, string ext)
        {
            string cek;
            var gambar = new string[] { ".png", ".jpg", ".jpeg" };
            var file = new string[] { ".pdf" };
            if (type.ToLower() == "gambar")
            {
                cek = Array.Find(gambar, c => c == ext);
                return (cek == null ? false : true);
            }
            else if (type.ToLower() == "pdf")
            {
                cek = Array.Find(file, c => c == ext);
                return (cek == null ? false : true);
            }
            else
            {
                return false;
            }
        }

        private Dictionary<string, string> GetMimeTypes()
        {
            return new Dictionary<string, string>
            {
                {".png", "image/png"},
                {".jpeg", "image/jpeg"},
                {".jpg", "image/jpeg"},
                {".pdf", "application/pdf"}
            };
        }
        private List<GetPengajuanDto> GetPengajuanLink(List<GetPengajuanDto> data)
        {
            foreach (var item in data)
            {
                item.Surat_permohonan = (item.Surat_permohonan == null ? null : GetBaseUrl() + item.Id + "/" + item.Surat_permohonan);
                item.Surat_pernyataan = (item.Surat_pernyataan == null ? null : GetBaseUrl() + item.Id + "/" + item.Surat_pernyataan);
                item.File_ktp = (item.File_ktp == null ? null : GetBaseUrl() + item.Id + "/" + item.File_ktp);
                item.File_biodata = (item.File_biodata == null ? null : GetBaseUrl() + item.Id + "/" + item.File_biodata);
                item.File_foto = (item.File_foto == null ? null : GetBaseUrl() + item.Id + "/" + item.File_foto);
                item.File_skck = (item.File_skck == null ? null : GetBaseUrl() + item.Id + "/" + item.File_skck);
                item.File_surat_sehat = (item.File_surat_sehat == null ? null : GetBaseUrl() + item.Id + "/" + item.File_surat_sehat);
                item.Surat_bebas_narkoba = (item.Surat_bebas_narkoba == null ? null : GetBaseUrl() + item.Id + "/" + item.Surat_bebas_narkoba);
                item.File_pendukung = (item.File_pendukung == null ? null : GetBaseUrl() + item.Id + "/" + item.File_pendukung);
            }
            return data;
        }

        private GetPengajuanDto GetPengajuanLinkById(GetPengajuanDto data)
        {
            if (data == null) return data;
            data.Surat_permohonan = (data.Surat_permohonan == null ? null : GetBaseUrl() + data.Id + "/" + data.Surat_permohonan);
            data.Surat_pernyataan = (data.Surat_pernyataan == null ? null : GetBaseUrl() + data.Id + "/" + data.Surat_pernyataan);
            data.File_ktp = (data.File_ktp == null ? null : GetBaseUrl() + data.Id + "/" + data.File_ktp);
            data.File_biodata = (data.File_biodata == null ? null : GetBaseUrl() + data.Id + "/" + data.File_biodata);
            data.File_foto = (data.File_foto == null ? null : GetBaseUrl() + data.Id + "/" + data.File_foto);
            data.File_skck = (data.File_skck == null ? null : GetBaseUrl() + data.Id + "/" + data.File_skck);
            data.File_surat_sehat = (data.File_surat_sehat == null ? null : GetBaseUrl() + data.Id + "/" + data.File_surat_sehat);
            data.Surat_bebas_narkoba = (data.Surat_bebas_narkoba == null ? null : GetBaseUrl() + data.Id + "/" + data.Surat_bebas_narkoba);
            data.File_pendukung = (data.File_pendukung == null ? null : GetBaseUrl() + data.Id + "/" + data.File_pendukung);

            return data;
        }

        private string GetBaseUrl()
        {
            var baseUrl = $"{this.Request.Scheme}://{this.Request.Host.Value.ToString()}{this.Request.PathBase.Value.ToString()}";
            return baseUrl + "/file/";
        }
        // public List<GetPengajuanDto> GetPengajuanLink(List<GetPengajuanDto> data)
        // {
        //     var baseUrl = $"{this.Request.Scheme}://{this.Request.Host.Value.ToString()}{this.Request.PathBase.Value.ToString()}";
        //     baseUrl = baseUrl + "/api/pengajuan/download/";
        //     foreach (var item in data)
        //     {
        //         item.Surat_permohonan = (item.Surat_permohonan == null ? null : baseUrl + "Surat_permohonan/" + item.Id);
        //         item.Surat_pernyataan = (item.Surat_pernyataan == null ? null : baseUrl + "Surat_pernyataan/" + item.Id);
        //         item.File_ktp = (item.File_ktp == null ? null : baseUrl + "File_ktp/" + item.Id);
        //         item.File_biodata = (item.File_biodata == null ? null : baseUrl + "File_biodata/" + item.Id);
        //         item.File_foto = (item.File_foto == null ? null : baseUrl + "File_foto/" + item.Id);
        //         item.File_skck = (item.File_skck == null ? null : baseUrl + "File_skck/" + item.Id);
        //         item.File_surat_sehat = (item.File_surat_sehat == null ? null : baseUrl + "File_surat_sehat/" + item.Id);
        //         item.Surat_bebas_narkoba = (item.Surat_bebas_narkoba == null ? null : baseUrl + "Surat_bebas_narkoba/" + item.Id);
        //         item.File_pendukung = (item.File_pendukung == null ? null : baseUrl + "File_pendukung/" + item.Id);
        //     }
        //     return data;
        // }

        // public GetPengajuanDto GetPengajuanLinkById(GetPengajuanDto data)
        // {
        //     if (data == null) return data;
        //     var baseUrl = $"{this.Request.Scheme}://{this.Request.Host.Value.ToString()}{this.Request.PathBase.Value.ToString()}";
        //     baseUrl = baseUrl + "/api/pengajuan/download/";
        //     data.Surat_permohonan = (data.Surat_permohonan == null ? null : baseUrl + "Surat_permohonan/" + data.Id);
        //     data.Surat_pernyataan = (data.Surat_pernyataan == null ? null : baseUrl + "Surat_pernyataan/" + data.Id);
        //     data.File_ktp = (data.File_ktp == null ? null : baseUrl + "File_ktp/" + data.Id);
        //     data.File_biodata = (data.File_biodata == null ? null : baseUrl + "File_biodata/" + data.Id);
        //     data.File_foto = (data.File_foto == null ? null : baseUrl + "File_foto/" + data.Id);
        //     data.File_skck = (data.File_skck == null ? null : baseUrl + "File_skck/" + data.Id);
        //     data.File_surat_sehat = (data.File_surat_sehat == null ? null : baseUrl + "File_surat_sehat/" + data.Id);
        //     data.Surat_bebas_narkoba = (data.Surat_bebas_narkoba == null ? null : baseUrl + "Surat_bebas_narkoba/" + data.Id);
        //     data.File_pendukung = (data.File_pendukung == null ? null : baseUrl + "File_pendukung/" + data.Id);

        //     return data;
        // }
    }
}