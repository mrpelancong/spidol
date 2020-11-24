import api_store from '../API'
import authHeader from '../auth.header'

class AdminService {
    // ----- get data api{int}, id{int}
    getData(api, id=""){
        if (api !== null) {
            return fetch(api_store[api]+id, {
                method  : 'GET',
                headers : authHeader.getHeader(),
            }).then(res => res.json())
        } else {
            return console.log('API Tidak Ditentukan')
        }
    }
    // ----- get data api{int}, data{urlParams}
    postData(api, data, id=""){
        return fetch(api_store[api]+id, {
            method  : 'POST',
            headers : authHeader.postHeader(),
            body    : data
        }).then(res => res.json())
    }
    // ---- upload 
    uploadData(api, data, id=""){
        return fetch(api, {
            method  : 'POST',
            headers : authHeader.uploadHeader(),
            body    : data
        }).then(res => res.json())
    }
    // ----- get data api{int}, data{urlParams}, id{int || null}
    putData(api,  data, id=""){
        return fetch(api_store[api]+id, {
            method  : 'PUT',
            headers : authHeader.putHeader(),
            body    : data
        }).then(res => res.json())
    }
    // ----- get data api{int}, id{int}
    deleteData(api, id){
        return fetch(api_store[api]+id, {
            method  : 'DELETE',
            headers : authHeader.deleteHeader(),
        }).then(res => res.json())
    }
}

export default new AdminService()