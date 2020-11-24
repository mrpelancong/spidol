using System.Collections.Generic;
using System.Threading.Tasks;
using idcard.Dtos;
using idcard.Models;

namespace idcard.Services
{
    public interface IBlacklistService
    {
        Task<ServiceResponse<List<GetBlacklistAllDto>>> GetPengajuanBl(int id, int userId);
        Task<ServiceResponse<List<GetBlacklistAllDto>>> GetPengajuanSearch(string search);
        Task<ServiceResponse<GetBlacklistDto>> AddBlacklist(int pengajuanId, string keterangan);
        Task<ServiceResponse<GetBlacklistDto>> NonAktifBlacklist(int id);
    }
}