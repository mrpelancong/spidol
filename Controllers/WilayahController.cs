using System.Linq;
using System.Threading.Tasks;
using idcard.Dtos;
using idcard.Models;
using idcard.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace idcard.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class WilayahController : ControllerBase
    {
        private readonly IWilayahService _service;
        public WilayahController(IWilayahService service)
        {
            _service = service;
        }

        [HttpGet("{id?}")]
        public async Task<IActionResult> GetWilayah(int id)
        {
            var resId = new ServiceResponse<GetWilayahDto>();
            var data = await _service.GetWilayah(id);
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

        [HttpPost]
        public async Task<IActionResult> AddWilayah([FromForm] string nama_wilayah)
        {
            return Ok(await _service.AddWilayah(nama_wilayah));
        }

        [HttpPut]
        public async Task<IActionResult> UpdateWilayah([FromForm] int id, [FromForm] string nama_wilayah)
        {
            return Ok(await _service.UpdateWilayah(id, nama_wilayah));
        }
        
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWilayah(int id)
        {
            return Ok(await _service.DeleteWilayah(id));
        }
    }
}