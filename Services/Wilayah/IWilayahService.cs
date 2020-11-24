using System.Collections.Generic;
using System.Threading.Tasks;
using idcard.Dtos;
using idcard.Models;

namespace idcard.Services
{
    public interface IWilayahService
    {
        Task<ServiceResponse<List<GetWilayahDto>>> GetWilayah(int id);
        Task<ServiceResponse<GetWilayahDto>> AddWilayah(string nama_wilayah);
        Task<ServiceResponse<GetWilayahDto>> UpdateWilayah(int id, string nama_wilayah);
        Task<ServiceResponse<GetWilayahDto>> DeleteWilayah(int id);
    }
}