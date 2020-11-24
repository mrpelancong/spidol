using System.Collections.Generic;
using System.Threading.Tasks;
using idcard.Dtos;
using idcard.Models;

namespace idcard.Services
{
    public interface IJenisService
    {
        Task<ServiceResponse<List<GetJenisDto>>> GetAllJenis();
        Task<ServiceResponse<GetJenisDto>> GetJenisById(int id);
        Task<ServiceResponse<GetJenisDto>> AddJenis(string nama_jenis);
        Task<ServiceResponse<GetJenisDto>> DeleteJenis(int id);
        Task<ServiceResponse<GetJenisDto>> UpdateJenis(int id, string nama_jenis);
        Task<bool> JenisExists(string nama_jenis);
    }
}