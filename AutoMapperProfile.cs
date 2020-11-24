using System;
using AutoMapper;
using idcard.Dtos;
using idcard.Models;

namespace idcard
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<User, GetLoginDto>();
            CreateMap<User, GetUserDto>();
            CreateMap<Akses, GetAksesDto>().ForMember(c => c.Sistem_created_time,
                opt => opt.MapFrom(src => ((DateTime)src.Sistem_created_time).ToString("yyyy-MM-dd")));
            CreateMap<Struktur, GetStrukturDto>();

            CreateMap<Wilayah, GetWilayahDto>();

            CreateMap<Vendor, GetVendorDto>();

            CreateMap<Jenis, GetJenisDto>();

            CreateMap<Akun, GetAkunDto>();

            CreateMap<Idcard, GetIdCardDto>().ForMember(c => c.Tanggal,
                opt => opt.MapFrom(src => ((DateTime)src.Tanggal).ToString("yyyy-MM-dd")))
                .ForMember(c => c.Masa_berlaku, opt
                => opt.MapFrom(src => ((DateTime)src.Masa_berlaku).ToString("yyyy-MM-dd"))); ;

            CreateMap<Pengajuan, GetPengajuanDto>().ForMember(c => c.Tgl_pengajuan,
                opt => opt.MapFrom(src => ((DateTime)src.Tgl_pengajuan).ToString("yyyy-MM-dd")))
                .ForMember(c => c.Tgl_lahir,
                opt => opt.MapFrom(src => ((DateTime)src.Tgl_lahir).ToString("yyyy-MM-dd")));
            CreateMap<Pengajuan, GetPengajuanBLDto>().ForMember(c => c.Tgl_pengajuan,
                opt => opt.MapFrom(src => ((DateTime)src.Tgl_pengajuan).ToString("yyyy-MM-dd")));
            CreateMap<Pengajuan, GetBlacklistAllDto>().ForMember(c => c.Tgl_pengajuan,
                opt => opt.MapFrom(src => ((DateTime)src.Tgl_pengajuan).ToString("yyyy-MM-dd")));

            CreateMap<Blacklist, GetBlacklistDto>().ForMember(c => c.Tgl_blacklist,
                opt => opt.MapFrom(src => ((DateTime)src.Tgl_blacklist).ToString("yyyy-MM-dd")))
                .ForMember(c => c.Sistem_updated_time,
                opt => opt.MapFrom(src => ((DateTime)src.Sistem_updated_time).ToString("yyyy-MM-dd HH:mm:ss")));

            CreateMap<Proses, GetProsesDto>().ForMember(c => c.Tanggal_proses,
                opt => opt.MapFrom(src => ((DateTime)src.Tanggal_proses).ToString("yyyy-MM-dd")));
        }
    }
}