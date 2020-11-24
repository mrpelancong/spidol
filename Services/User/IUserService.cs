using System.Collections.Generic;
using System.Threading.Tasks;
using idcard.Dtos;
using idcard.Models;

namespace idcard.Services
{
    public interface IUserService
    {
        Task<ServiceResponse<GetLoginDto>> AddUser(AddUserDto req);
        Task<bool> UserExists(string username);
        Task<bool> UseStructExists(int strukturId, int wilayahId);
        Task<ServiceResponse<List<GetAkunDto>>> GetPegawai(int id);
        Task<ServiceResponse<List<GetVendorDto>>> GetAllVendor();
        Task<ServiceResponse<List<GetAkunDto>>> GetAllUser(int id);
        Task<ServiceResponse<GetVendorDto>> GetVendorById(int id);
        Task<ServiceResponse<GetVendorDto>> UpdateVendor(UpdateVendorDto req);
        Task<ServiceResponse<GetVendorDto>> DeleteVendor(int id);
        Task<ServiceResponse<GetAkunDto>> DeleteAkun(int id);
    }
}