using System.Threading.Tasks;
using idcard.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace idcard.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class JenisController : ControllerBase
    {
        private readonly IJenisService _jenisService;
        public JenisController(IJenisService jenisService)
        {
            _jenisService = jenisService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllJenis()
        {
            return Ok(await _jenisService.GetAllJenis());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetJenisById(int id)
        {
            return Ok(await _jenisService.GetJenisById(id));
        }

        [HttpPost]
        public async Task<IActionResult> AddJenis([FromForm] string nama_jenis)
        {
            return Ok(await _jenisService.AddJenis(nama_jenis));
        }

        [HttpPut]
        public async Task<IActionResult> UpdateJenis([FromForm] int id, [FromForm] string nama_jenis)
        {
            return Ok(await _jenisService.UpdateJenis(id, nama_jenis));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteJenis(int id)
        {
            return Ok(await _jenisService.DeleteJenis(id));
        }
    }
}