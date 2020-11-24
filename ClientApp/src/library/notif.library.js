// make your own notif
// fkv costume notif by sweetalert2 - https://sweetalert2.github.io/#icons
import Swal from 'sweetalert2'

class Notif {
    // error, success, info, warning, question
    miniNotif(icon = 'info', msg= 'No Message From Action'){
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 5000,
            timerProgressBar: true,
            onOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            },
        })
        // return notif
        return (
            Toast.fire({
                icon: (icon) ? 'success' : 'error',
                title: msg
            })
        )
    }

    errorNotif(error){
        // return notif
        return Swal.fire({
            title: 'ERROR ! SYSTEM AMBYAR',
            text: error,
            timer: 10000
        })
    }

    confirmNotif(title = 'Yakin Ingin Hapus Data?', text = 'Data tidak dapat dikembalikan.'){
        // return notif
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: 'btn btn-success',
                cancelButton: 'btn btn-danger'
            },
            buttonsStyling: false
        })

        return swalWithBootstrapButtons.fire({
            title: title,
            text: text,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
        })
    }
}

const miniNotif = new Notif().miniNotif
const errorNotif = new Notif().errorNotif
export const MiniNotif = miniNotif
export const ErrorNotif = errorNotif

// -------------
export default new Notif()