using System.Collections.Generic;
using System.Threading.Tasks;
using idcard.Dtos;
using idcard.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace idcard.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class StrukturController : ControllerBase
    {
        private readonly IAksesService _aksesService;
        public StrukturController(IAksesService aksesService)
        {
            _aksesService = aksesService;
        }

        [HttpPost]
        public async Task<IActionResult> AddStruktur([FromForm] string nama_struktur, [FromForm] int aksesId)
        {
            return Ok(await _aksesService.AddStruktur(nama_struktur, aksesId));
        }

        [HttpGet("by/{by}/{aksesId?}")]
        public async Task<IActionResult> GetAllStruktur(string by, int aksesId)
        {
            return Ok(await _aksesService.GetAllStruktur(by, aksesId));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetStrukturById(int id)
        {
            return Ok(await _aksesService.GetStrukturById(id));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStruktur(int id)
        {
            return Ok(await _aksesService.DeleteStruktur(id));
        }

        [HttpPut]
        public async Task<IActionResult> UpdateStruktur([FromForm] int id, [FromForm] string nama_struktur)
        {
            return Ok(await _aksesService.UpdateStruktur(id, nama_struktur));
        }

        [HttpPut("all")]
        public async Task<IActionResult> UpdateAllStruktur([FromForm] List<UpdateStruktur> req)
        {
            return Ok(await _aksesService.UpdateAllStruktur(req));
        }
    }
}