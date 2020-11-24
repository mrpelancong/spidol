using System.Threading.Tasks;
using idcard.Data;
using idcard.Dtos;
using idcard.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace idcard.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _service;
        private readonly IAuthRepository _auth;
        public UserController(IUserService service, IAuthRepository auth)
        {
            _auth = auth;
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> AddUser([FromForm] AddUserDto req)
        {
            return Ok(await _service.AddUser(req));
        }

        [HttpPut("password")]
        public async Task<IActionResult> ChangePassword([FromForm] string username, [FromForm] string password)
        {
            return Ok(await _auth.ChangePassword(username, password));
        }

        [HttpGet("{id?}")]
        public async Task<IActionResult> GetAllVendor(int id)
        {
            return Ok(await _service.GetAllUser(id));
        }
        [HttpGet("vendor")]
        public async Task<IActionResult> GetAllVendor()
        {
            return Ok(await _service.GetAllVendor());
        }

        [HttpGet("vendor/{id}")]
        public async Task<IActionResult> GetVendorById(int id)
        {
            return Ok(await _service.GetVendorById(id));
        }

        [HttpGet("pegawai/{id?}")]
        public async Task<IActionResult> GetPegawai(int id)
        {
            return Ok(await _service.GetPegawai(id));
        }

        [HttpPut("vendor")]
        public async Task<IActionResult> UpdateVendor([FromForm] UpdateVendorDto req)
        {
            return Ok(await _service.UpdateVendor(req));
        }

        [HttpDelete("vendor/{id}")]
        public async Task<IActionResult> DeleteVendor(int id)
        {
            return Ok(await _service.DeleteVendor(id));
        }

        [HttpDelete("akun/{id}")]
        public async Task<IActionResult> DeleteAkun(int id)
        {
            return Ok(await _service.DeleteAkun(id));
        }

    }
}