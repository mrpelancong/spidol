using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using idcard.Data;
using idcard.Dtos;
using idcard.Models;
using Microsoft.EntityFrameworkCore;

namespace idcard.Services
{
    public class BlacklistService : IBlacklistService
    {
        private readonly IMapper _mapper;
        private readonly DataContext _context;
        public BlacklistService(DataContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<ServiceResponse<List<GetBlacklistAllDto>>> GetPengajuanBl(int id, int userId)
        {
            ServiceResponse<List<GetBlacklistAllDto>> response = new ServiceResponse<List<GetBlacklistAllDto>>();
            var user = await _context.Tb_user.Include(c => c.Wilayah).Include(c => c.Struktur).ThenInclude(c => c.Akses)
                                .FirstOrDefaultAsync(c => c.Id == userId);
            var data = new List<Pengajuan>();
            if (id > 0)
            {
                data = await _context.Tb_pengajuan.Include(c => c.Vendor).ThenInclude(c => c.User).ThenInclude(c => c.Wilayah)
                                    .Where(c => c.Id == id && c.Vendor.User.Wilayah == user.Wilayah).ToListAsync();
                if (user.Struktur.Akses.Akses_name.ToLower() == "admin")
                {
                    data = await _context.Tb_pengajuan.Include(c => c.Vendor).ThenInclude(c => c.User)
                                    .Where(c => c.Id == id).ToListAsync();
                }
            }
            else
            {
                data = await _context.Tb_pengajuan.Include(c => c.Vendor).ThenInclude(c => c.User).ThenInclude(c => c.Wilayah).Where(c => c.Vendor.User.Wilayah == user.Wilayah).ToListAsync();
                if (user.Struktur.Akses.Akses_name.ToLower() == "admin")
                {
                    data = await _context.Tb_pengajuan.Include(c => c.Vendor).ThenInclude(c => c.User)
                                    .ToListAsync();
                }
            }
            var map = (data.Select(c => _mapper.Map<GetBlacklistAllDto>(c))).ToList();
            var n = 0;
            foreach (var item in map)
            {
                var bl = await _context.Tb_blacklist.Where(c => c.Pengajuan == data[n] && c.Status_blacklist == "1").FirstOrDefaultAsync();
                if (bl != null)
                {
                    item.Blacklist = true;
                    item.Keterangan_bl = bl.Keterangan_blacklist;
                }
                n++;
            }
            if (!data.Any())
            {
                response.Status = false;
                response.Message = "Data Pengajuan tidak ditemukan";
                return response;
            }
            response.Data = map;
            response.Message = "List Data Pengajuan";
            return response;
        }

        public async Task<ServiceResponse<List<GetBlacklistAllDto>>> GetPengajuanSearch(string search)
        {
            ServiceResponse<List<GetBlacklistAllDto>> response = new ServiceResponse<List<GetBlacklistAllDto>>();
            var data = await _context.Tb_pengajuan.Where(c => c.Nama_lengkap.Contains(search)).ToListAsync();
            var map = (data.Select(c => _mapper.Map<GetBlacklistAllDto>(c))).ToList();
            var n = 0;
            foreach (var item in map)
            {
                var bl = await _context.Tb_blacklist.Where(c => c.Pengajuan == data[n] && c.Status_blacklist == "1").FirstOrDefaultAsync();
                if (bl != null)
                {
                    item.Blacklist = true;
                    item.Keterangan_bl = bl.Keterangan_blacklist;
                }
                n++;
            }
            if (!data.Any())
            {
                response.Status = false;
                response.Message = "Data Pengajuan tidak ditemukan";
                return response;
            }
            response.Data = (map.Select(c => _mapper.Map<GetBlacklistAllDto>(c))).ToList();
            response.Message = "List Data Pengajuan";
            return response;
        }

        public async Task<ServiceResponse<GetBlacklistDto>> AddBlacklist(int pengajuanId, string keterangan)
        {
            ServiceResponse<GetBlacklistDto> response = new ServiceResponse<GetBlacklistDto>();
            Blacklist data = new Blacklist();
            var pengajuan = await _context.Tb_pengajuan.FirstOrDefaultAsync(c => c.Id == pengajuanId);
            if (pengajuan == null)
            {
                response.Status = false;
                response.Message = "Data Pengajuan tidak ditemukan";
                return response;
            }
            var cek = await _context.Tb_blacklist.Where(c => c.Nik == pengajuan.Nik && c.Status_blacklist == "1")
                                .FirstOrDefaultAsync();

            data.Nik = pengajuan.Nik;
            data.Keterangan_blacklist = keterangan;
            data.Pengajuan = pengajuan;
            data.Status_blacklist = "1";
            data.Tgl_blacklist = DateTime.Now;
            data.Sistem_created_time = DateTime.Now;
            data.Sistem_updated_time = Convert.ToDateTime("1900-01-01");
            try
            {
                if (cek == null)
                {
                    await _context.Tb_blacklist.AddAsync(data);
                }
                else
                {
                    cek.Status_blacklist = "0";
                    _context.Tb_blacklist.Update(cek);
                }
                await _context.SaveChangesAsync();
                response.Data = _mapper.Map<GetBlacklistDto>(data);
                response.Message = (cek == null ? "Proses Blacklist Berhasil" : "Proses Buka Blacklist Berhasil");
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Message = ex.Message;
            }
            return response;
        }

        public async Task<ServiceResponse<GetBlacklistDto>> NonAktifBlacklist(int id)
        {
            ServiceResponse<GetBlacklistDto> response = new ServiceResponse<GetBlacklistDto>();
            var pengajuan = await _context.Tb_pengajuan.FirstOrDefaultAsync(c => c.Id == id);
            var data = await _context.Tb_blacklist.Include(c => c.Pengajuan)
                                .FirstOrDefaultAsync(c => c.Pengajuan == pengajuan && c.Status_blacklist == "1");
            if (data == null)
            {
                response.Status = false;
                response.Message = "Data Pengajuan yang di blacklist tidak ditemukan";
                return response;
            }
            data.Status_blacklist = "0";
            data.Sistem_updated_time = DateTime.Now;
            try
            {
                _context.Tb_blacklist.Update(data);
                await _context.SaveChangesAsync();
                response.Data = _mapper.Map<GetBlacklistDto>(data);
                response.Message = "Proses Blacklist Berhasil";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Message = ex.Message;
            }
            return response;
        }
    }
}