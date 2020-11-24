import AdminService from '../admin/admin.service'
import Notif from '../../library/notif.library'

class OptionData {

    optionJenis(){
        const dataOption = []
        AdminService.getData(0).then((res)=>{
            if(res.data.length > 0){
                let data_tmp;
                console.log(res)
                res.data.map((val)=>{
                    data_tmp = {
                        id : val.id,
                        label : val.nama_jenis
                    }
                    dataOption.push(data_tmp)
                })
                return dataOption;
            } else {
                dataOption = [
                    {
                        id : null,
                        label : "Data Tidak Ditemukan"
                    }
                ]
                return dataOption;
            }
        }, (Error)=>{
            dataOption = [
                {
                    id : null,
                    label : "Data Tidak Ditemukan"
                }
            ]
            return dataOption;
        })

    }
}

export default new OptionData()