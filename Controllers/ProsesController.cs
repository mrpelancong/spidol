using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using idcard.Dtos;
using idcard.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace idcard.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ProsesController : ControllerBase
    {
        private readonly IProsesService _service;
        private readonly IHttpContextAccessor _httpContext;
        private readonly IMapper _mapper;
        public ProsesController(IProsesService service, IMapper mapper, IHttpContextAccessor httpContext)
        {
            _mapper = mapper;
            _httpContext = httpContext;
            _service = service;
        }
        private int GetUserId() => int.Parse(_httpContext.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier));

        [HttpGet("admin/{id?}")]
        public async Task<IActionResult> ListAdmin(int id)
        {
            var data = await _service.ListAdmin(id);
            if (data.Data != null)
            {
                data.Data = GetPengajuanLink(data.Data);
            }
            return Ok(data);
        }
        [HttpGet("{id?}")]
        public async Task<IActionResult> GetListPengajuan(int id)
        {
            var data = await _service.ListProses(GetUserId(), id);
            if (data.Data != null)
            {
                foreach (var item in data.Data)
                {
                    if (item.Pengajuan != null)
                    {
                        item.Pengajuan = GetPengajuanLinkById(item.Pengajuan);
                    }
                }
            }
            return Ok(data);
        }

        [HttpPost]
        public async Task<IActionResult> ProsesAcc([FromForm] int id, [FromForm] string status, [FromForm] string catatan)
        {
            // var userId = GetUserId();
            // return Ok(new { id, status, userId });
            return Ok(await _service.ProsesAcc(id, status, catatan, GetUserId()));
        }

        [HttpPost("send")]
        public async Task<IActionResult> ProsesAdmin([FromForm] int id)
        {
            return Ok(await _service.ProsesSend(id, GetUserId()));
        }

        [HttpPost("nomor")]
        public async Task<IActionResult> AddNumber([FromForm] int pengajuanId, [FromForm] int nomor_idcard, [FromForm] DateTime tanggal_kadaluarsa, [FromForm] string status, [FromForm] string catatan)
        {
            // return Ok(new { pengajuanId, nomor_idcard, tanggal_kadaluarsa });
            return Ok(await _service.AddNumber(pengajuanId, nomor_idcard, tanggal_kadaluarsa, status, catatan, GetUserId()));
        }

        [HttpPut("nomor")]
        public async Task<IActionResult> AddNumberPut([FromForm] int pengajuanId, [FromForm] int nomor_idcard, [FromForm] DateTime tanggal_kadaluarsa, [FromForm] string status, [FromForm] string catatan)
        {
            // return Ok(new { pengajuanId, nomor_idcard, tanggal_kadaluarsa });
            return Ok(await _service.AddNumber(pengajuanId, nomor_idcard, tanggal_kadaluarsa, status, catatan, GetUserId()));
        }

        [HttpGet("expired")]
        public async Task<IActionResult> GetExpired()
        {
            return Ok(await _service.GetExpired(GetUserId()));
        }

        // [HttpPost("admin")]
        // public async Task<IActionResult> ProsesAdmin([FromForm] int id, [FromForm] string status)
        // {
        //     return Ok(await _service.ProsesAdmin(id, status, GetUserId()));
        // }

        [HttpGet("history")]
        public async Task<IActionResult> GetHistory()
        {
            return Ok(await _service.ListProsesHistory(GetUserId()));
        }

        [HttpGet("tes")]
        public IActionResult Tes()
        {
            int n = 0;
            var no = 21;
            var nomor = int.Parse(RandomString());
            while (nomor == no)
            {
                n++;
                nomor = int.Parse(RandomString());
            }

            return Ok(new { n, no, nomor });
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
        private string RandomString()
        {
            var chars = "12";
            var stringChars = new char[2];
            var random = new Random();

            for (int i = 0; i < stringChars.Length; i++)
            {
                stringChars[i] = chars[random.Next(chars.Length)];
            }

            var finalString = new String(stringChars);
            return finalString;
        }
    }
}