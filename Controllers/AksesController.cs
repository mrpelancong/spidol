using System.Threading.Tasks;
using idcard.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace idcard.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AksesController : ControllerBase
    {
        private readonly IAksesService _aksesService;
        public AksesController(IAksesService aksesService)
        {
            _aksesService = aksesService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAkses()
        {
            return Ok(await _aksesService.GetAllAkses());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAksesById(int id)
        {
            return Ok(await _aksesService.GetAksesById(id));
        }

        [HttpPost]
        public async Task<IActionResult> AddAkses([FromForm] string akses_name)
        {
            return Ok(await _aksesService.AddAkses(akses_name));
        }

        [HttpPut]
        public async Task<IActionResult> UpdateAkses([FromForm] int id, [FromForm] string akses_name, [FromForm] string akses_status)
        {
            return Ok(await _aksesService.UpdateAkses(id, akses_name, akses_status));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAkses(int id)
        {
            return Ok(await _aksesService.DeleteAkses(id));
        }

    }
}