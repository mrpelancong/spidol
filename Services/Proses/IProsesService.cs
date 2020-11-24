using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using idcard.Dtos;
using idcard.Models;

namespace idcard.Services
{
    public interface IProsesService
    {
        Task<ServiceResponse<List<GetPengajuanDto>>> ListAdmin(int id);
        Task<ServiceResponse<GetProsesDto>> ProsesSend(int id, int userId);
        Task<ServiceResponse<List<GetProsesDto>>> ListProses(int userId, int id);
        Task<ServiceResponse<List<GetProsesDto>>> ListProsesHistory(int userId);
        Task<ServiceResponse<GetProsesDto>> ProsesAcc(int id, string status, string catatan, int userId);
        Task<ServiceResponse<string>> AddNumber(int id, int nomor, DateTime masa, string status, string catatan, int userId);

        Task<ServiceResponse<List<GetPengajuanDto>>> GetExpired(int userId);

        Task<int> GetNomor();
        Task<bool> NomorExists(int nomor);
    }
}