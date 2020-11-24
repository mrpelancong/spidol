import React from 'react'
import {
    CButton, CModal,
    CModalBody,
    CFormGroup,
    CLabel,
    CInput,
    CForm,
    CModalFooter,
    CModalHeader,
    CSelect,
    CModalTitle
} from '@coreui/react'
import Swal from 'sweetalert2'
const $ = require('jquery')
$.DataTable = require('datatables.net-bs4')

function swalNotif(icon = "error", message = "No Message") {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        onOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
            ////console.log('Cek Open');
        },
        onClose: (toast) => {
            //console.log('Cek Close');
        }
    })

    return (
        Toast.fire({
            icon: (icon) ? 'success' : 'error',
            title: message
        })
    )
}

export class Tbl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            itemsData: [],
            modalHapus: false,
            modalCRUD: false,
            id_data: null,
            itemOptionAkses: []
        }
    }

    TBody = (props) => {
        let dataSturktur = props.map((data, index) => {
            if (data.nama_struktur != 'Vendor' && data.nama_struktur != 'Pegawai Pertamina' && data.nama_struktur != 'Admin' && data.nama_struktur != 'SuperAdmin' ) {
                return (
                    <tr key={data.id}>
                        <td>{data.akses.akses_name}</td>
                        <td>{data.nama_struktur}</td>
                        <td>{data.urutan}</td>
                        <td>
                            <center>
                                <a className="btn btn-sm btn-success btn-block text-white mr-2" onClick={()=>this.handleEdit(data.id)}> Edit Struktur </a>
                                <a className="btn btn-sm btn-danger btn-block text-white mr-2" onClick={()=>this.setState({modalHapus:true, id_data:data.id})}> Hapus Struktur </a>
                            </center>
                        </td>
                    </tr>
                )
            }
        })
        if (props) {
            return (
                <tbody>
                    {dataSturktur}
                </tbody>
            );
        }
    }

    loadData = (id_data = null) => {
        //console.log('Load Data');
        let url;
        if (id_data == null) {
            url = "api/struktur/by/all";
        } else {
            url = "api/struktur/" + id_data;
        }
        fetch(url, {
            method: 'GET',
            headers: {
                'Content-type': 'application/json',
                'Authorization': "Bearer " + localStorage.token
            },
        })
            .then(res => res.json())
            .then(
                (result) => {
                    //console.log(result);
                    if (id_data == null) {
                        this.setState({
                            itemsData: result.data,
                        });
                        this.$el = $(this.el)
                        this.$el.DataTable()
                    } else {
                        if (result.status) {
                            var keys = Object.keys(result.data);
                            var value = Object.values(result.data);
                            for (var i = keys.length - 1; i >= 0; i--) {
                                $("input[name='" + keys[i] + "']").val(value[i]);
                                $("select[name='" + keys[i] + "']").val(value[i]);
                            }
                        } else {
                            setTimeout(function () {
                                this.setState({ modalCRUD: false, id_data: null })
                                setTimeout(function () {
                                    swalNotif('error', 'Data Tidak Ditemukan');
                                }, 500)
                            }, 1500)
                        }
                    }
                },
                (error) => {
                    this.setState({
                        error
                    });
                }
            )
    }
    handleTambah = () => {
        this.setState({
            modalCRUD: true,
            titleModal: 'Tambah Data'
        });
        $("form").find("input").val('');
        $("form").find("select").val('');
    }

    handleEdit = (id) => {
        //console.log(id);
        this.setState({
            modalCRUD: true,
            id_data: id,
            titleModal: 'Edit Data'
        });
        this.loadData(id);
    }

    handleSubmit = (event) => {
        event.preventDefault();
        let data;
        let option;
        let headerOption = {
            'Accept': 'application/json',
            'Content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'Authorization': "Bearer " + localStorage.token
        }
        if (this.state.id_data != null) {
            data = $("form")
                .find(":input")
                .serialize() + '&id=' + this.state.id_data;

            option = {
                method: 'PUT',
                headers: headerOption,
                body: data
            }

            this.setState({ modalCRUD: false, id_data: null })
        } else {
            data = $("form").serialize();
            option = {
                method: 'POST',
                headers: headerOption,
                body: data
            }
            $("form").find("input").val('');
            $("form").find("select").val('');
        }
        const API_URL = "api/struktur/";
        fetch(API_URL, option)
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({ modal: false })
                    swalNotif(result.status, result.message)
                    this.loadData()
                },
                (error) => {
                    //console.log(error);
                    this.setState({ modal: false })
                    swalNotif(false, 'SISTEM ERROR ! : ' + error)
                }
            )
    }

    componentDidMount() {
        this.loadData()
        this.OptionAkses()
    }

    viewOptionAkses = (data =null) => {
        if (data) {
            return(
                <CSelect name="aksesId">
                    {data.map((data) =>
                        <option key={data.id} value={data.id}>{data.akses_name}</option>
                    )}
                </CSelect>
            );
        } else {
            return(
                <CSelect value="" name="aksesId">
                    <option value="" selected disabled>Data Tidak Ditemukan</option>
                </CSelect>
            );
        }
    }
    OptionAkses = () => {
        let url = "api/akses/";
        fetch(url, {
            method: 'GET',
            headers: {
                'Content-type': 'application/json',
                'Authorization': "Bearer " + localStorage.token
            },
        })
            .then(res => res.json())
            .then(
                (result) => {
                    //console.log('result '+result.status)
                    this.setState({
                        itemOptionAkses : result.data
                    })
                },
                (error) => {
                    Swal.fire({
                        title: 'ERROR ! SYSTEM AMBYAR',
                        text: error,
                        timer: 10000
                    })
                }
            )
    }

    render() {
        const { modalHapus, titleModal, itemsData, modalCRUD } = this.state;

        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: 'btn btn-success',
                cancelButton: 'btn btn-danger'
            },
            buttonsStyling: false
        })
        if (modalHapus) {
            swalWithBootstrapButtons.fire({
                title: 'Yakin Ingin Hapus Data?',
                text: "Data tidak dapat dikembalikan.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Ya, Hapus!',
                cancelButtonText: 'Tidak !',
                reverseButtons: true,
                onClose: (toast) => {
                    this.setState({ modalHapus: false })
                }
            }).then((result) => {
                if (result.value) {
                    fetch('api/struktur/' + this.state.id_data, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': "Bearer " + localStorage.token
                        },
                    })
                        .then(res => res.json())
                        .then(
                            (result) => {
                                ////console.log(result);
                                swalNotif(result.status, result.message)
                                this.loadData();
                            },
                            (error) => {
                                Swal.fire({
                                    title: 'ERROR ! SYSTEM AMBYAR',
                                    text: error,
                                    timer: 10000
                                })
                            }
                        )
                    this.setState({ modalHapus: false, id_data: null })
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    // jika delete
                    swalNotif(true, 'Data Anda Masih Aman')
                    this.setState({ modalHapus: false, id_data: null })
                }
            })
        }
        return (
            <>
                <CButton
                    color="primary"
                    onClick={() => this.handleTambah()}
                >Tambah Data</CButton>
                <hr></hr>
                <table width="100%" className="table table-striped table-bordered table-hover table-sm" ref={el => this.el = el}>
                    <thead>
                        <tr>
                            <th>Akses</th>
                            <th>Struktur/Jabatan</th>
                            <th>Tingkatan Struktur/Jabatan</th>
                            <th width="100px">Aksi</th>
                        </tr>
                    </thead>
                    {this.TBody(itemsData)}
                </table>
                <CModal
                    show={modalCRUD}
                    onClose={() => this.setState({ modalCRUD: false })}
                >
                    <CModalHeader closeButton>
                        <CModalTitle>{titleModal}</CModalTitle>
                    </CModalHeader>
                    <CForm onSubmit={this.handleSubmit}>
                        <CModalBody>
                            <CFormGroup>
                                <CLabel htmlFor="nama_struktur">Nama Stuktur</CLabel>
                                <CInput id="nama_struktur" type="text" name="nama_struktur" placeholder="Nama Struktur" />
                            </CFormGroup>
                            <CFormGroup>
                                <CLabel htmlFor="nama_struktur">Akses Struktur</CLabel>
                                {this.viewOptionAkses(this.state.itemOptionAkses)}
                            </CFormGroup>
                        </CModalBody>
                        <CModalFooter>
                            <CButton
                                color="secondary"
                                onClick={() => this.setState({ modalCRUD: false })}
                            >Cancel</CButton>
                            <CButton color="primary" type="submit">Simpan data</CButton>{' '}

                        </CModalFooter>
                    </CForm>
                </CModal>
            </>
        )
    }
}
