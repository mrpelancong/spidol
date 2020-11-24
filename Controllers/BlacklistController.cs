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
    public class BlacklistController : ControllerBase
    {
        private readonly IBlacklistService _service;
        private readonly IHttpContextAccessor _httpContext;
        public BlacklistController(IBlacklistService service, IHttpContextAccessor httpContext)
        {
            _httpContext = httpContext;
            _service = service;
        }

        private int GetUserId() => int.Parse(_httpContext.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier));

        [HttpGet("{id?}")]
        public async Task<IActionResult> GetAllPengajuan(int id)
        {
            var resId = new ServiceResponse<GetBlacklistAllDto>();
            var data = await _service.GetPengajuanBl(id, GetUserId());
            if (id != 0)
            {
                resId.Message = data.Message;
                resId.Status = data.Status;
                if (data.Data.Any())
                {
                    resId.Data = data.Data[0];
                }
                return Ok(resId);
            }
            return Ok(data);
        }

        [HttpGet("search/{s}")]
        public async Task<IActionResult> GetPengajuanSearch(string s)
        {
            return Ok(await _service.GetPengajuanSearch(s));
        }

        [HttpPost]
        public async Task<IActionResult> AddBlacklist([FromForm] int pengajuanId, [FromForm] string keterangan)
        {
            return Ok(await _service.AddBlacklist(pengajuanId, keterangan));
        }

        [HttpPut]
        public async Task<IActionResult> NonAktifBL([FromForm] int id)
        {
            return Ok(await _service.NonAktifBlacklist(id));
        }

    }
}