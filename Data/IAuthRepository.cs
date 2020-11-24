using System.Threading.Tasks;
using idcard.Dtos;
using idcard.Models;

namespace idcard.Data
{
    public interface IAuthRepository
    {
        Task<ServiceResponse<string>> Register(string username, string password, string nama, int struktur);
        Task<ServiceResponse<GetLoginDto>> Login(string username, string password);
        Task<bool> UserExists(string username);
        Task<ServiceResponse<string>> ChangePassword(string username, string password);

    }
}