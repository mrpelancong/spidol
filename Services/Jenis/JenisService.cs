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
    public class JenisService : IJenisService
    {
        private string ip;
        private readonly DataContext _context;
        private readonly IMapper _mapper;
        private readonly IActionContextAccessor _accessor;
        public JenisService(DataContext context, IMapper mapper, IActionContextAccessor accessor)
        {
            _accessor = accessor;
            _mapper = mapper;
            _context = context;
            ip = _accessor.ActionContext.HttpContext.Connection.RemoteIpAddress.ToString();
        }

        public async Task<ServiceResponse<GetJenisDto>> AddJenis(string nama_jenis)
        {
            ServiceResponse<GetJenisDto> response = new ServiceResponse<GetJenisDto>();
            var data = new Jenis();
            var akses = new Akses();
            if (nama_jenis == null || await JenisExists(nama_jenis))
            {
                response.Status = false;
                response.Message = (nama_jenis == null ? "Inputan tidak boleh kosong" : "Nama Jenis/Akses Sudah Ada");
                return response;
            }
            akses.Akses_name = nama_jenis;
            akses.Akses_status = "1";
            akses.Sistem_created_time = DateTime.Now;
            akses.Sistem_updated_time = Convert.ToDateTime("1900-01-01");
            akses.Sistem_ip_create = ip;
            try
            {
                var cek_akses = await _context.Tb_akses.FirstOrDefaultAsync(x => x.Akses_name.ToLower() == nama_jenis.ToLower());
                if (cek_akses == null)
                {
                    await _context.Tb_akses.AddAsync(akses);
                    await _context.SaveChangesAsync();
                    data.Akses = akses;
                }
                else
                {
                    data.Akses = cek_akses;
                }
                data.nama_jenis = nama_jenis;
                data.Sistem_created_time = DateTime.Now;
                data.Sistem_updated_time = Convert.ToDateTime("1900-01-01");
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Message = ex.Message;
                return response;
            }

            try
            {
                await _context.Tb_jenis_pekerjaan.AddAsync(data);
                await _context.SaveChangesAsync();
                response.Data = _mapper.Map<GetJenisDto>(data);
                response.Message = "Berhasil Tambah Data Jenis";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Message = ex.Message;
            }
            return response;
        }

        public async Task<ServiceResponse<List<GetJenisDto>>> GetAllJenis()
        {
            ServiceResponse<List<GetJenisDto>> response = new ServiceResponse<List<GetJenisDto>>();
            var data = await _context.Tb_jenis_pekerjaan.Include(c => c.Akses).ToListAsync();
            if (!data.Any())
            {
                response.Status = false;
                response.Message = "Data Jenis tidak ditemukan / Kosong";
                return response;
            }
            response.Data = (data.Select(c => _mapper.Map<GetJenisDto>(c))).ToList();
            response.Message = "List Jenis";
            return response;
        }

        public async Task<ServiceResponse<GetJenisDto>> GetJenisById(int id)
        {
            ServiceResponse<GetJenisDto> response = new ServiceResponse<GetJenisDto>();
            var data = await _context.Tb_jenis_pekerjaan.Include(c => c.Akses).FirstOrDefaultAsync(c => c.Id == id);
            if (data == null)
            {
                response.Status = false;
                response.Message = "Data Jenis tidak ditemukan";
                return response;
            }
            response.Data = _mapper.Map<GetJenisDto>(data);
            response.Message = "Data Jenis";
            return response;
        }

        public async Task<ServiceResponse<GetJenisDto>> DeleteJenis(int id)
        {
            ServiceResponse<GetJenisDto> response = new ServiceResponse<GetJenisDto>();
            var data = await _context.Tb_jenis_pekerjaan.FirstOrDefaultAsync(c => c.Id == id);
            if (data == null)
            {
                response.Status = false;
                response.Message = "Data Jenis Tidak Ditemukan";
                return response;
            }
            try
            {
                var pengajuan = await _context.Tb_pengajuan.Where(c => c.Jenis == data).ToListAsync();
                foreach (var item in pengajuan)
                {
                    var proses = await _context.Tb_proses.Where(c => c.Pengajuan == item).ToListAsync();
                    foreach (var items in proses)
                    {
                        _context.Tb_proses.Remove(items);
                        await _context.SaveChangesAsync();
                    }
                    _context.Tb_pengajuan.Remove(item);
                    await _context.SaveChangesAsync();
                }
                _context.Tb_jenis_pekerjaan.Remove(data);
                await _context.SaveChangesAsync();
                response.Data = _mapper.Map<GetJenisDto>(data);
                response.Message = "Data Jenis Berhasil Dihapus";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Message = ex.Message;
            }
            return response;
        }

        public async Task<ServiceResponse<GetJenisDto>> UpdateJenis(int id, string nama_jenis)
        {
            ServiceResponse<GetJenisDto> response = new ServiceResponse<GetJenisDto>();
            var data = await _context.Tb_jenis_pekerjaan.Include(c => c.Akses).FirstOrDefaultAsync(c => c.Id == id);
            if (id == 0 || nama_jenis == null || data == null || await JenisExists(nama_jenis))
            {
                var nul = (id == 0 || nama_jenis == null ? "Inputan tidak boleh kosong"
                            : data == null ? "User Id tidak cocok" : "Nama Jenis / Akses Sudah Ada");
                response.Status = false;
                response.Message = nul;
                return response;
            }

            var akses = data.Akses;
            akses.Akses_name = nama_jenis;
            akses.Sistem_updated_time = DateTime.Now;
            data.nama_jenis = nama_jenis;
            data.Sistem_updated_time = DateTime.Now;
            data.Akses = akses;
            try
            {
                _context.Tb_akses.Update(akses);
                await _context.SaveChangesAsync();
                _context.Tb_jenis_pekerjaan.Update(data);
                await _context.SaveChangesAsync();
                response.Data = _mapper.Map<GetJenisDto>(data);
                response.Message = "Data Jenis Berhasil Diperbarui";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Message = ex.Message;
            }
            return response;
        }

        public async Task<bool> JenisExists(string nama_jenis)
        {
            var cek = await _context.Tb_jenis_pekerjaan.FirstOrDefaultAsync(c => c.nama_jenis == nama_jenis);
            if (cek == null) return false;

            return true;
        }

        public async Task<bool> AksesExists(string nama)
        {
            return await _context.Tb_akses.AnyAsync(x => x.Akses_name.ToLower() == nama.ToLower());
        }
    }
}