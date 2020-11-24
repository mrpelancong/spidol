
class authHeader {
    getHeader(){
        return {
            'Content-type': 'application/json',
            'Authorization': "Bearer " + localStorage.token
        }
    }

    postHeader(){
        return {
            'Accept': 'application/json',
            'Content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'Authorization': "Bearer " + localStorage.token
        }
    }

    uploadHeader(){
        return {
            'Authorization': "Bearer " + localStorage.token
        }
    }

    putHeader(){
        return {
            'Accept': 'application/json',
            'Content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'Authorization': "Bearer " + localStorage.token
        }
    }

    deleteHeader(){
        return {
            'Authorization': "Bearer " + localStorage.token
        }
    }
}

export default new authHeader()