using System.Collections.Generic;
using System.Threading.Tasks;
using idcard.Dtos;
using idcard.Models;

namespace idcard.Services
{
    public interface IAksesService
    {
        Task<ServiceResponse<List<GetAksesDto>>> GetAllAkses();
        Task<ServiceResponse<GetAksesDto>> GetAksesById(int id);
        Task<ServiceResponse<GetAksesDto>> AddAkses(string akses_name);
        Task<ServiceResponse<GetAksesDto>> UpdateAkses(int id, string akses_name, string akses_status);
        Task<ServiceResponse<GetAksesDto>> DeleteAkses(int id);
        Task<bool> CheckAksesExists(string name);

        Task<ServiceResponse<GetStrukturDto>> AddStruktur(string nama_struktur, int aksesId);
        Task<ServiceResponse<List<GetStrukturDto>>> GetAllStruktur(string by, int aksesId);
        Task<ServiceResponse<GetStrukturDto>> GetStrukturById(int id);
        Task<ServiceResponse<GetStrukturDto>> DeleteStruktur(int id);
        Task<ServiceResponse<GetStrukturDto>> UpdateStruktur(int id, string nama_struktur);
        Task<ServiceResponse<List<GetStrukturDto>>> UpdateAllStruktur(List<UpdateStruktur> req);


    }
}