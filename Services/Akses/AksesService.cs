using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using idcard.Data;
using idcard.Dtos;
using idcard.Models;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace idcard.Services
{
    public class AksesService : IAksesService
    {
        public string ip;
        private readonly IMapper _mapper;
        private readonly DataContext _context;
        private readonly IActionContextAccessor _accessor;
        public AksesService(DataContext context, IMapper mapper, IActionContextAccessor accessor)
        {
            _accessor = accessor;
            _context = context;
            _mapper = mapper;
            ip = _accessor.ActionContext.HttpContext.Connection.RemoteIpAddress.ToString();
        }

        public async Task<ServiceResponse<GetAksesDto>> GetAksesById(int id)
        {
            ServiceResponse<GetAksesDto> response = new ServiceResponse<GetAksesDto>();
            var data = await _context.Tb_akses.FirstOrDefaultAsync(c => c.Id == id);
            if (data == null)
            {
                response.Status = false;
                response.Message = "Akses Tidak ditemukan";
                return response;
            }
            response.Data = _mapper.Map<GetAksesDto>(data);
            response.Message = "Data Akses";
            return response;
        }

        public async Task<ServiceResponse<List<GetAksesDto>>> GetAllAkses()
        {
            ServiceResponse<List<GetAksesDto>> response = new ServiceResponse<List<GetAksesDto>>();
            var data = await _context.Tb_akses.ToListAsync();
            if (!data.Any())
            {
                response.Status = false;
                response.Message = "Akses Tidak ditemukan / Kosong";
                return response;
            }
            response.Data = (data.Select(c => _mapper.Map<GetAksesDto>(c))).ToList();
            response.Message = "List Data Akses";
            return response;
        }

        public async Task<ServiceResponse<GetAksesDto>> AddAkses(string akses_name)
        {
            ServiceResponse<GetAksesDto> response = new ServiceResponse<GetAksesDto>();
            if (akses_name == null || await CheckAksesExists(akses_name))
            {
                response.Status = false;
                response.Message = (akses_name == null ? "Harap masukan nama akses" : "Akses Sudah Ada");
                return response;
            }
            Akses data = new Akses();
            data.Akses_name = akses_name;
            data.Akses_status = "1";
            data.Sistem_created_time = DateTime.Now;
            data.Sistem_updated_time = Convert.ToDateTime("1900-01-01");
            data.Sistem_ip_create = ip;
            try
            {
                await _context.Tb_akses.AddAsync(data);
                await _context.SaveChangesAsync();
                response.Data = _mapper.Map<GetAksesDto>(data);
                response.Message = "Tambah Akses Berhasil";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Message = ex.Message;
            }
            return response;
        }

        public async Task<ServiceResponse<GetAksesDto>> UpdateAkses(int id, string akses_name, string akses_status)
        {
            ServiceResponse<GetAksesDto> response = new ServiceResponse<GetAksesDto>();
            if (id == 0 || akses_name == null || akses_status == null)
            {
                response.Status = false;
                response.Message = "Inputan Tidak lengkap";
                return response;
            }
            var data = await _context.Tb_akses.FirstOrDefaultAsync(c => c.Id == id);
            if (data == null)
            {
                response.Status = false;
                response.Message = "Data Akses tidak ditemukan";
                return response;
            }
            data.Akses_name = akses_name;
            data.Akses_status = akses_status;
            data.Sistem_updated_time = DateTime.Now;
            data.Sistem_ip_create = ip;
            try
            {
                _context.Tb_akses.Update(data);
                await _context.SaveChangesAsync();
                response.Data = _mapper.Map<GetAksesDto>(data);
                response.Message = "Akses Berhasil Diperbarui";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Message = ex.Message;
                return response;
            }
            return response;
        }

        public async Task<ServiceResponse<GetAksesDto>> DeleteAkses(int id)
        {
            ServiceResponse<GetAksesDto> response = new ServiceResponse<GetAksesDto>();
            var data = await _context.Tb_akses.FirstOrDefaultAsync(c => c.Id == id);
            if (data == null || id == 0)
            {
                response.Status = false;
                response.Message = (id == 0 ? "Masukan id akses" : "Data Akses tidak ditemukan");
                return response;
            }
            try
            {
                _context.Tb_akses.Remove(data);
                await _context.SaveChangesAsync();
                response.Data = _mapper.Map<GetAksesDto>(data);
                response.Message = "Akses Berhasil Dihapus";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Message = ex.Message;
                return response;
            }
            return response;
        }

        public async Task<bool> CheckAksesExists(string name)
        {
            var akses = await _context.Tb_akses.FirstOrDefaultAsync(c => c.Akses_name.ToLower() == name.ToLower());
            if (akses == null)
            {
                return false;
            }
            return true;
        }

        public async Task<ServiceResponse<GetStrukturDto>> AddStruktur(string nama_struktur, int aksesId)
        {
            ServiceResponse<GetStrukturDto> response = new ServiceResponse<GetStrukturDto>();
            var akses = await _context.Tb_akses.FirstOrDefaultAsync(c => c.Id == aksesId);
            if (akses == null || nama_struktur == null || aksesId == 0)
            {
                response.Status = false;
                response.Message = (aksesId == 0 || nama_struktur == null ? "Inputan tidak Lengkap" : "Data Akses tidak ditemukan");
                return response;
            }
            var check = await _context.Tb_struktur.Where(c => c.Akses == akses).OrderByDescending(c => c.urutan).FirstOrDefaultAsync();

            Struktur data = new Struktur();
            data.nama_struktur = nama_struktur;
            data.Akses = akses;
            data.urutan = (check == null ? 1 : check.urutan + 1);
            data.Sistem_created_time = DateTime.Now;
            data.Sistem_updated_time = Convert.ToDateTime("1900-01-01");
            try
            {
                await _context.Tb_struktur.AddAsync(data);
                await _context.SaveChangesAsync();
                response.Data = _mapper.Map<GetStrukturDto>(data);
                response.Message = "Data Struktur";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Message = ex.Message;
                return response;
            }
            return response;
        }

        public async Task<ServiceResponse<List<GetStrukturDto>>> GetAllStruktur(string by, int aksesId)
        {
            ServiceResponse<List<GetStrukturDto>> response = new ServiceResponse<List<GetStrukturDto>>();
            List<Struktur> data = new List<Struktur>();
            by = by.ToLower();
            if (by == "all")
            {
                data = await _context.Tb_struktur.Include(c => c.Akses).ToListAsync();
                response.Message = "Data Seluruh Struktur";
            }
            else if (by == "akses")
            {
                var akses = await _context.Tb_akses.FirstOrDefaultAsync(c => c.Id == aksesId);
                data = await _context.Tb_struktur.Where(c => c.Akses == akses).ToListAsync();
                response.Message = "Data Struktur Berdasarkan Akses";
            }
            else
            {
                response.Status = false;
                response.Message = "Jenis Salah";
                return response;
            }
            if (!data.Any())
            {
                response.Status = false;
                response.Message = "Data Struktur tidak ditemukan";
                return response;
            }
            response.Data = (data.Select(c => _mapper.Map<GetStrukturDto>(c))).ToList();
            return response;
        }

        public async Task<ServiceResponse<GetStrukturDto>> GetStrukturById(int id)
        {
            ServiceResponse<GetStrukturDto> response = new ServiceResponse<GetStrukturDto>();
            var data = await _context.Tb_struktur.Include(c => c.Akses).FirstOrDefaultAsync(c => c.Id == id);
            if (data == null || id == 0)
            {
                response.Status = false;
                response.Message = (id == 0 ? "Masukan id Struktur" : "Data Struktur tidak ditemukan");
                return response;
            }
            response.Data = _mapper.Map<GetStrukturDto>(data);
            response.Message = "Data Struktur";
            return response;
        }

        public async Task<ServiceResponse<GetStrukturDto>> DeleteStruktur(int id)
        {
            ServiceResponse<GetStrukturDto> response = new ServiceResponse<GetStrukturDto>();
            var data = await _context.Tb_struktur.Include(c => c.Akses).FirstOrDefaultAsync(c => c.Id == id);
            if (data == null || id == 0)
            {
                response.Status = false;
                response.Message = (id == 0 ? "Masukan id Struktur" : "Data Struktur tidak ditemukan");
                return response;
            }
            try
            {
                var cek = await _context.Tb_struktur.Where(c => c.urutan > data.urutan && c.Akses == data.Akses).ToListAsync();
                foreach (var item in cek)
                {
                    item.urutan = item.urutan - 1;
                    _context.Tb_struktur.Update(item);
                    await _context.SaveChangesAsync();
                }
                _context.Tb_struktur.Remove(data);
                await _context.SaveChangesAsync();
                response.Data = _mapper.Map<GetStrukturDto>(data);
                response.Message = "Struktur berhasil dihapus";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Message = ex.Message;
                return response;
            }
            return response;
        }

        public async Task<ServiceResponse<GetStrukturDto>> UpdateStruktur(int id, string nama_struktur)
        {
            ServiceResponse<GetStrukturDto> response = new ServiceResponse<GetStrukturDto>();
            var data = await _context.Tb_struktur.Include(c => c.Akses).FirstOrDefaultAsync(c => c.Id == id);
            if (data == null || id == 0)
            {
                response.Status = false;
                response.Message = (id == 0 ? "Masukan id Struktur" : "Data Struktur tidak ditemukan");
                return response;
            }
            data.nama_struktur = nama_struktur;
            data.Sistem_updated_time = Convert.ToDateTime("1900-01-01");
            try
            {
                _context.Tb_struktur.Update(data);
                await _context.SaveChangesAsync();
                response.Data = _mapper.Map<GetStrukturDto>(data);
                response.Message = "Struktur berhasil dihapus";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Message = ex.Message;
                return response;
            }
            return response;
        }
        public async Task<ServiceResponse<List<GetStrukturDto>>> UpdateAllStruktur(List<UpdateStruktur> req)
        {
            ServiceResponse<List<GetStrukturDto>> response = new ServiceResponse<List<GetStrukturDto>>();
            if (!req.Any())
            {
                response.Status = false;
                response.Message = "Tidak Ada Data Struktur yang dikirim";
                return response;
            }

            foreach (var item in req)
            {
                var data = await _context.Tb_struktur.Include(c => c.Akses).FirstOrDefaultAsync(c => c.Id == item.Id);
                if (data != null)
                {
                    data.nama_struktur = item.nama_struktur;
                    data.urutan = item.urutan;
                    data.Sistem_updated_time = Convert.ToDateTime("1900-01-01");
                    _context.Tb_struktur.Update(data);
                    await _context.SaveChangesAsync();
                }
            }
            response.Message = "Berhasil Update Struktur";
            return response;
        }
    }
}