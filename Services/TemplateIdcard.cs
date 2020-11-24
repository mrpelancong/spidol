using System;
using System.IO;
using System.Text;
using idcard.Dtos;

namespace idcard.Services
{
    public static class TemplateIdcard
    {
        public static string _pathDirectory = Directory.GetCurrentDirectory();

        public static string GetHtmlString(string file, GetPengajuanDto data, string linkPath, string jenis)
        {
            var sb = new StringBuilder();
            string path = linkPath + "file/" + data.Id + "/" + data.File_foto;
            sb.Append(@"<html><head></head><body class='depan'>");
            if (jenis == "l")
            {
                sb.AppendFormat(@"
                    <div class='atas'>
                        <table cellpadding='1px'>
                            <tr><td><strong>{0}</strong></td></tr>
                            <tr><td>{1}</td></tr>
                        </table>
                    </div>
                    <div class='tengah'>
                        <table cellpadding='4px'>
                            <tr>
                                <td style='width: 30%;height: 130px;'>
                                    <img src='{2}' alt='' height='100%' width='auto'>
                                </td>
                                <td style='width: 70%;height: 130px;'></td>
                            </tr>
                        </table>
                    </div>
                    <div class='bawah'>
                        <table cellpadding='4px'>
                            <tr>
                                <td rowspan='2' style='width: 65%;color: white;font-size: 16px;font-weight: bold;'>{3}</td>
                                <td style='width: 7%;;height: 23px;'></td>
                                <td rowspan='2' style='width: 28%;color: red;font-size: 12px'>{4}</td>
                            </tr>
                            <tr>
                                <td style='height: 23px;'></td>
                            </tr>
                        </table>
                    </div>
                    <div class='row1'>
                        <table cellpadding='2px'>
                            <tr>
                                <td style='width: 30%;'>Nomor</td>
                                <td style='width: 5%;'>:</td>
                                <td style='width: 65%;'>{5}</td>
                            </tr>
                        </table>
                    </div>
                    <div class='row2'>
                        <table cellpadding='2px'>
                            <tr>
                                <td>Sr. Spv. Geosecurity</td>
                            </tr>
                        </table>
                    </div>
                    <div class='row3'>
                        <table cellpadding='2px'>
                            <tr>
                                <td>Kartu ini milik PT. PERTAMINA (PERSERO), jika hilang atau menemukan harap dikembalikan kepada PT. PERTAMINA (PERSERO) di Jl. A. Yani No. 1247 Palembang. Telp. 0711-513311 Ext: 5110/5145</td>
                            </tr>
                        </table>
                    </div>
                ", data.Nama_lengkap, data.Vendor.Nama_vendor, path, GetTanggal(data.IdCard.Masa_berlaku), data.No_telp, data.IdCard.Nomor_idcard);
            }
            else
            {
                sb.AppendFormat(@"
                    <div class='atas'>
                        <table cellpadding='1px'>
                            <tr><td>{0}</td></tr>
                            <tr><td><strong>{1}</strong></td></tr>
                            <tr><td>{2}</td></tr>
                        </table>
                    </div>
                    <div class='tengah'>
                        <table cellpadding='4px'>
                            <tr>
                                <td style='width: 42%;height: 130px;'>
                                    <img src='{3}' alt='' height='100%' width='auto'>
                                </td>
                                <td style='width: 58%;height: 130px;'></td>
                            </tr>
                        </table>
                    </div>
                ", data.IdCard.Nomor_idcard, data.Nama_lengkap, GetTgl(data.IdCard.Masa_berlaku), path);
            }
            sb.Append(@"</body></html>");

            // var pathFile = Path.Combine(_pathDirectory, "Pages", file);
            // var fileContent = System.IO.File.ReadAllText(pathFile);
            // return fileContent;
            return sb.ToString();

        }

        public static string GetTanggal(string tgl)
        {
            DateTime date = Convert.ToDateTime(tgl);
            return date.ToString("dd MMMM yyyy"); ;
        }

        public static string GetTgl(string tgl)
        {
            DateTime date = Convert.ToDateTime(tgl);
            return date.ToString("MM/yy"); ;
        }
    }
}