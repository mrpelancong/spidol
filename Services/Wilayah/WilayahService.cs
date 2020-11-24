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
    public class WilayahService : IWilayahService
    {
        private readonly IMapper _mapper;
        private readonly DataContext _context;
        public WilayahService(DataContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }
        
        public async Task<ServiceResponse<List<GetWilayahDto>>> GetWilayah(int id)
        {
            var response = new ServiceResponse<List<GetWilayahDto>>();
            var data = new List<Wilayah>();
            if (id == 0)
            {
                data = await _context.Tb_wilayah.ToListAsync();
            }
            else
            {
                data = await _context.Tb_wilayah.Where(c => c.Id == id).ToListAsync();
            }
            response.Data = (data.Select(c => _mapper.Map<GetWilayahDto>(c))).ToList();
            if (!data.Any())
            {
                response.Status = false;
                response.Message = "Wilayah tidak ditemukan";
                return response;
            }
            response.Message = "Data Wilayah";
            return response;
        }

        public async Task<ServiceResponse<GetWilayahDto>> AddWilayah(string nama_wilayah)
        {
            var response = new ServiceResponse<GetWilayahDto>();
            if (nama_wilayah == null)
            {
                response.Status = false;
                response.Message = "Masukkan Nama Wilayah";
                return response;
            }
            var data = new Wilayah();
            data.Nama_wilayah = nama_wilayah;
            data.Status_wilayah = "1";
            data.Sistem_created_time = DateTime.Now;
            data.Sistem_updated_time = Convert.ToDateTime("1900-01-01");
            try
            {
                await _context.Tb_wilayah.AddAsync(data);
                await _context.SaveChangesAsync();
                response.Data = _mapper.Map<GetWilayahDto>(data);
                response.Message = "Tambah Wilayah Berhasil";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Message = ex.Message;
            }
            return response;
        }

        public async Task<ServiceResponse<GetWilayahDto>> UpdateWilayah(int id, string nama_wilayah)
        {
            var response = new ServiceResponse<GetWilayahDto>();
            var data = await _context.Tb_wilayah.FirstOrDefaultAsync(c => c.Id == id);
            response.Data = _mapper.Map<GetWilayahDto>(data);
            if (data == null || nama_wilayah == null)
            {
                response.Status = false;
                response.Message = (data == null ? "Wilayah tidak ditemukan" : "Masukkan Nama Wilayah");
                return response;
            }
            data.Nama_wilayah = nama_wilayah;
            data.Sistem_updated_time = DateTime.Now;

            try
            {
                _context.Tb_wilayah.Update(data);
                await _context.SaveChangesAsync();
                response.Data = _mapper.Map<GetWilayahDto>(data);
                response.Message = "Update Wilayah Berhasil";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Message = ex.Message;
            }
            return response;
        }

        public async Task<ServiceResponse<GetWilayahDto>> DeleteWilayah(int id)
        {
            var response = new ServiceResponse<GetWilayahDto>();
            var data = await _context.Tb_wilayah.FirstOrDefaultAsync(c => c.Id == id);
            response.Data = _mapper.Map<GetWilayahDto>(data);
            if (data == null)
            {
                response.Status = false;
                response.Message = "Wilayah tidak ditemukan";
                return response;
            }

            try
            {
                _context.Tb_wilayah.Remove(data);
                await _context.SaveChangesAsync();
                response.Message = "Hapus Wilayah Berhasil";
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