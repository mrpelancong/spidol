import React from 'react'
import {
    CCol, CRow, CButton, CModal,
    CModalBody,
    CFormGroup,
    CLabel,
    CInput,
    CForm,
    CModalFooter,
    CModalHeader,
    CSelect,
    CTextarea,
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
            //console.log('Cek Open');
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
            error: null, id_data: null,
            itemsData: [], itemStruktur: [], itemWilayah : [],
            modalHapus: false, modalCRUD: false, modalEdit: false, isLoading : true
        }
    }

    TBody = (props) => {
        if (props) {
            let dataVendor = props.map((data, index) =>{
                if (data.nama_vendor.toLowerCase() != 'default pertamina') {
                    return (
                        <tr key={data.id}>
                            <td>{index + 1}</td>
                            <td>
                                {data.nama_vendor} 
                            </td>
                            <td>{(data.user.wilayah) ? data.user.wilayah.nama_wilayah : "Wilayah Tidak Ditemukan"}</td>
                            <td>{data.alamat_vendor}</td>
                            <td>{data.penanggung_jawab} <br /> {data.no_telp} </td>
                            <td>
                                <center>
                                    <a className="btn btn-sm btn-success text-white btn-block mr-2" onClick={()=>this.handleEdit(data.id)}> Edit Data </a>
                                    <a className="btn btn-sm btn-danger text-white btn-block mr-2" onClick={()=>this.setState({modalHapus:true, id_data:data.id})}> Hapus Data </a>
                                </center>
                            </td>
                        </tr>
                    )
                }
            })
            return (
                <tbody>
                    {dataVendor}
                </tbody>
            );
        }
    }

    loadData = (id_data = null) => {
        //console.log('Load Data');
        let url;
        if (id_data == null) {
            url = "api/user/vendor/";
        } else {
            url = "api/user/vendor/" + id_data;
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
                                $("textarea[name='" + keys[i] + "']").val(value[i]);
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
                    this.setState({
                        isLoading : false
                    })
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
            titleModal: 'Tambah Data',
            id_data: null
        });
        $("form").find("input").val('');
        $("form").find("select").val('');
        $("form").find("textarea").val('');
    }

    handleEdit = (id) => {
        //console.log(id);
        this.setState({
            modalEdit: true,
            id_data: id,
            titleModal: 'Edit Data'
        });
        this.loadData(id);
    }

    handleSubmit = (event) => {
        event.preventDefault();
        let data;
        let option;
        let API_URL;
        let headerOption = {
            'Accept': 'application/json',
            'Content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'Authorization': "Bearer " + localStorage.token
        }
        if (this.state.id_data != null) {
            API_URL = "api/user/vendor";
            data = $(".edit")
                .find(":input")
                .serialize() + '&id=' + this.state.id_data;

            option = {
                method: 'PUT',
                headers: headerOption,
                body: data
            }

            this.setState({ modalCRUD: false, id_data: null })
        } else {
            API_URL = "api/user/";
            data = $(".tambah").serialize()+ '&strukturId=14&jenis=vendor';
            option = {
                method: 'POST',
                headers: headerOption,
                body: data 
            }
            $("form").find("input").val('');
            $("form").find("select").val('');
            $("form").find("textarea").val('');
        }
        fetch(API_URL, option)
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({ modal: false })
                    swalNotif(result.status, result.message)
                    this.loadData()
                },
                (error) => {
                    // console.log(error);
                    this.setState({ modal: false })
                    Swal.fire({
                        title: 'ERROR ! SYSTEM AMBYAR',
                        text: error,
                        timer: 10000
                    })
                }
            )
    }

    handlePassword = (e) => {
        //console.log(e);
    }
    viewOptionWilayah = (data =null) => {
        if (data) {
          let optionStruk = data.map((data) => {
            if (data.id != 1) {
                return(
                    <option key={data.id} value={data.id}>{data.nama_wilayah}</option>
                  )
            }
          })
          
          return(
            <CSelect name="wilayahId" >
              {optionStruk}
            </CSelect>
          );
        } else {
          return(
            <CSelect>
              <option>Data Tidak Ditemukan</option>
            </CSelect>
          );
        }
    }

    OptionWilayah = () => {
    let url = "api/wilayah/";
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
            itemWilayah : result.data
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

    componentDidMount() {
        this.loadData()
        this.OptionWilayah()
    }

    render() {
        const { modalHapus, titleModal, itemsData, modalCRUD, modalEdit } = this.state;

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
                    fetch('api/user/vendor/' + this.state.id_data, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': "Bearer " + localStorage.token
                        },
                    })
                        .then(res => res.json())
                        .then(
                            (result) => {
                                //console.log(result);
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
                            <th width="10px">No</th>
                            <th>Vendor</th>
                            <th>Lokasi Kerja</th>
                            <th>Alamat Vendor</th>
                            <th>Penanggung Jawab</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    {this.state.isLoading ?
                        <tbody>
                            <tr>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                        </tbody>
                        :
                        this.TBody(itemsData)
                    }
                </table>
                <CModal
                    show={modalCRUD}
                    onClose={() => this.setState({ modalCRUD: false })}
                >
                    <CModalHeader closeButton>
                        <CModalTitle>{titleModal}</CModalTitle>
                    </CModalHeader>
                    <CForm className="tambah" onSubmit={this.handleSubmit}>
                        <CModalBody>
                            <CFormGroup row className="my-0">
                                <CCol xs="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="nama_lengkap">Nama Lengkap</CLabel>
                                        <CInput id="nama_lengkap" type="text" name="nama_lengkap" placeholder="Nama Lengkap" />
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="6" className="pl-0">
                                    <CFormGroup>
                                        <CLabel htmlFor="wilayahId">Wilayah</CLabel>
                                        {this.viewOptionWilayah(this.state.itemWilayah)}
                                    </CFormGroup>
                                </CCol>
                            </CFormGroup>
                            <CFormGroup row className="my-0">
                                <CCol xs="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="username">Username</CLabel>
                                        <CInput id="username" type="text" name="username" placeholder="Username" />
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="6" className="pl-0">
                                    <CFormGroup>
                                        <CLabel htmlFor="password">Password</CLabel>
                                        <CInput id="password" type="text" name="password" placeholder="Password" />
                                    </CFormGroup>
                                </CCol>
                            </CFormGroup>
                            <CFormGroup row className="my-0">
                                <CCol xs="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="nama_vendor">Nama Vendor</CLabel>
                                        <CInput id="nama_vendor" type="text" name="nama_vendor" placeholder="Nama Vendor" />
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="6" className="pl-0">
                                    <CFormGroup>
                                        <CLabel htmlFor="no_telp">Nomor telp.</CLabel>
                                        <CInput id="no_telp" type="text" name="no_telp" placeholder="Nomor telp." />
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12">
                                    <CFormGroup>
                                        <CLabel htmlFor="alamat_vendor">Alamat Vendor</CLabel>
                                        <CTextarea name="alamat_vendor"></CTextarea>
                                    </CFormGroup>
                                </CCol>
                            </CFormGroup>
                            <CFormGroup row className="my-0">
                                <CCol xs="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="penanggung_jawab">Penanung Jawab</CLabel>
                                        <CInput id="penanggung_jawab" type="text" name="penanggung_jawab" placeholder="Penanggung Jawab" />
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="6" className="pl-0">
                                    <CFormGroup>
                                        <CLabel htmlFor="no_telp_pj">Nomor telp. PJ</CLabel>
                                        <CInput id="no_telp_pj" type="text" name="no_telp_pj" placeholder="Nomor telp. PJ" />
                                    </CFormGroup>
                                </CCol>
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
                <CModal
                    show={modalEdit}
                    onClose={() => this.setState({ modalEdit: false })}
                >
                    <CModalHeader closeButton>
                        <CModalTitle>{titleModal}</CModalTitle>
                    </CModalHeader>
                    <CForm className="edit" onSubmit={this.handleSubmit}>
                        <CModalBody>
                            <CFormGroup row className="my-0">
                                <CCol xs="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="nama_vendor">Nama Vendor</CLabel>
                                        <CInput id="nama_vendor" type="text" name="nama_vendor" placeholder="Nama Vendor" />
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="6" className="pl-0">
                                    <CFormGroup>
                                        <CLabel htmlFor="no_telp">Nomor telp.</CLabel>
                                        <CInput id="no_telp" type="text" name="no_telp" placeholder="Nomor telp." />
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12">
                                    <CFormGroup>
                                        <CLabel htmlFor="alamat_vendor">Alamat Vendor</CLabel>
                                        <CTextarea name="alamat_vendor"></CTextarea>
                                    </CFormGroup>
                                </CCol>
                            </CFormGroup>
                            <CFormGroup row className="my-0">
                                <CCol xs="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="penanggung_jawab">Penanung Jawab</CLabel>
                                        <CInput id="penanggung_jawab" type="text" name="penanggung_jawab" placeholder="Penanggung Jawab" />
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="6" className="pl-0">
                                    <CFormGroup>
                                        <CLabel htmlFor="no_telp_pj">Nomor telp. PJ</CLabel>
                                        <CInput id="no_telp_pj" type="text" name="no_telp_pj" placeholder="Nomor telp. PJ" />
                                    </CFormGroup>
                                </CCol>
                            </CFormGroup>
                        </CModalBody>
                        <CModalFooter>
                            <CButton
                                color="secondary"
                                onClick={() => this.setState({ modalEdit: false })}
                            >Cancel</CButton>
                            <CButton color="primary" type="submit">Update data</CButton>{' '}

                        </CModalFooter>
                    </CForm>
                </CModal>
            </>
        )
    }
}
