using System.Threading.Tasks;
using idcard.Data;
using Microsoft.AspNetCore.Mvc;

namespace idcard.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthRepository _authRepository;
        public AuthController(IAuthRepository authRepository)
        {
            _authRepository = authRepository;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromForm] string username, [FromForm] string password)
        {
            return Ok(await _authRepository.Login(username, password));
        }

        // [HttpPost("register")]
        // public async Task<IActionResult> Register([FromForm] string username, [FromForm] string password, [FromForm] string nama, [FromForm] int aksesId)
        // {
        //     return Ok(await _authRepository.Register(username, password, nama, aksesId));
        // }
    }
}