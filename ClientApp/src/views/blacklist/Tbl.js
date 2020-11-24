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
        //console.log(props)
        this.state = {
            error: null, id_data: null,
            itemsData: [],
            modalHapus: false, modalCRUD: false, request : this.props.request,
        }
    }

    TBody = (props) => {
        //console.log('Data Blacklist >>');
        //console.log(props);
        // ----------------s
        if (props) {
        const dataBlacklist = props.map((data, index) =>{
            let status;
            let action;
            if (data.blacklist) {
                status = (
                    <span className="badge badge-danger">Black List</span>
                )
                action = (
                    <a className="btn btn-sm btn-success text-white mr-2" onClick={() => this.handleSetuju(data.id, 1)}> Aktifkan </a>
                )
            } else {
                status = (
                    <span className="badge badge-success" >Aktif</span>
                )
                action = (
                    <a className="btn btn-sm btn-success text-white mr-2" onClick={() => this.handleSetuju(data.id, 0)}> Non Aktifkan </a>
                )
            }
            if (this.state.request) {
                if (data.blacklist) {
                    return (
                        <tr key={data.id}>
                            <td>{index + 1}</td>
                            <td>{data.nama_lengkap}</td>
                            <td>{data.nik}</td>
                            <td>{data.alamat}</td>
                            <td>{data.no_telp}</td>
                            <td>{status}</td>
                            <td>{data.keterangan_bl}</td>
                            <td>
                                <center>
                                    {action}
                                </center>
                            </td>
                        </tr>
                    )
                }
            } else {
                return (
                    <tr key={data.id}>
                        <td>{index + 1}</td>
                        <td>{data.nama_lengkap}</td>
                        <td>{data.nik}</td>
                        <td>{data.alamat}</td>
                        <td>{data.no_telp}</td>
                        <td>{status}</td>
                        <td>{data.keterangan_bl}</td>
                        <td>
                            <center>
                                {action}
                            </center>
                        </td>
                    </tr>
                )
            }
        })            
        
        return (
                <tbody>
                    {dataBlacklist}
                </tbody>
            );
        }
    }

    loadData = (id_data = null) => {
        //console.log('Load Data');
        let url;
        if (id_data == null) {
            url = "api/blacklist/";
        } else {
            url = "api/blacklist/" + id_data;
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
        const API_URL = "api/validasi/";
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

    // ---
    async handleSetuju(id=null, status=null)  {
        // 0 = Blacklist
        // 1 = Open Black List
        let Method;
        let Title;
        let Body;
        if (status === 0) {
            Method = 'POST';
            Title = 'Black List Akun ini ?';
        } else {
            Method = 'PUT';
            Title = 'Buka Akun ini ?';
        }
        // this.setState({modalCRUD:false})
        // ambil catatan blacklist
        const { value: text } = await Swal.fire({
            input: 'textarea',
            title: Title,
            inputPlaceholder: 'Type your message here...',
            inputAttributes: {
              'aria-label': 'Type your message here'
            },
            showCancelButton: true
          })
        
        // setting swal
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: 'btn btn-success',
                cancelButton: 'btn btn-danger'
            },
            buttonsStyling: false
        })

        // open swal
        swalWithBootstrapButtons.fire({
            title: Title,
            text: text,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
        }).then((result) => {
            if (status === 0) {
                Body = new URLSearchParams({
                    pengajuanId: id,
                    keterangan: text
                })
            } else {
                Body = new URLSearchParams({
                    id: id,
                })
            }
            if (result.value) {
                fetch('api/blacklist/', {
                    method: Method,
                    headers: {
                        'Authorization': "Bearer " + localStorage.token
                    },
                    body: Body
                })
                    .then(res => res.json())
                    .then(
                        (result) => {
                            //console.log(result);
                            swalNotif(result.status, result.message)
                            this.loadData();
                        },
                        (error) => {
                            //console.log(error);
                        }
                    )
                this.setState({ modalHapus: false, id_data: null })
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                swalNotif(true, 'Jangan Sampai Salah Black List Ya,')
            }
            this.setState({id_data: null});
        })

    }

    componentDidMount() {
        this.loadData()
    }

    render() {
        const { titleModal, itemsData, modalCRUD } = this.state;

        return (
            <>
                <table width="100%" className="table table-striped table-bordered table-hover table-sm" ref={el => this.el = el}>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama Lengkap</th>
                            <th>NOPEK</th>
                            <th>Alamat</th>
                            <th>No Hp</th>
                            <th>Status</th>
                            <th>Catatan</th>
                            <th>Aksi</th>
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
                                <CLabel htmlFor="pemilik_kendaraan">Pemilik kendaraan</CLabel>
                                <CInput id="pemilik_kendaraan" type="text" name="pemilik_kendaraan" placeholder="Pemilik kendaraan" />
                            </CFormGroup>
                            <CFormGroup>
                                <CLabel htmlFor="plat_kendaraan">Plat Kendaraan</CLabel>
                                <CInput id="plat_kendaraan" type="text" name="plat_kendaraan" placeholder="Plat Kendaraan" />
                            </CFormGroup>
                            <CFormGroup row className="my-0">
                                <CCol xs="4">
                                    <CFormGroup>
                                        <CLabel htmlFor="nomor_stnk">STNK</CLabel>
                                        <CInput id="nomor_stnk" type="text" name="nomor_stnk" placeholder="STNK" />
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="4" className="pl-0">
                                    <CFormGroup>
                                        <CLabel htmlFor="masa_stnk">Masa STNK</CLabel>
                                        <CInput id="masa_stnk" type="date" name="masa_stnk" placeholder="Masa STNK" />
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="4" className="pl-0">
                                    <CFormGroup>
                                        <CLabel htmlFor="tbbm">TBBM</CLabel>
                                        <CInput id="tbbm" type="text" name="tbbm" placeholder="TBBM" />
                                    </CFormGroup>
                                </CCol>
                            </CFormGroup>
                            <CFormGroup row className="my-0">
                                <CCol xs="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="jenis_kendaraan">Jenis Kendaraan</CLabel>
                                        <CInput id="jenis_kendaraan" type="text" name="jenis_kendaraan" placeholder="Jenis Kendaraan" />
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="6" className="pl-0">
                                    <CFormGroup>
                                        <CLabel htmlFor="merk_kendaraan">Merk Kendaraan</CLabel>
                                        <CInput type="text" name="merk_kendaraan" id="merk_kendaraan" placeholder="Merk Kendaraan" />
                                    </CFormGroup>
                                </CCol>
                            </CFormGroup>
                            <CFormGroup row className="my-0">
                                <CCol xs="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="warna_kendaraan">Warna</CLabel>
                                        <CInput type="text" name="warna_kendaraan" id="warna_kendaraan" placeholder="Warna" />
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="6" className="pl-0">
                                    <CFormGroup>
                                        <CLabel htmlFor="km_odo">KM ODO</CLabel>
                                        <CInput type="text" name="km_odo" id="km_odo" placeholder="KM ODO" />
                                    </CFormGroup>
                                </CCol>
                            </CFormGroup>
                            <CFormGroup row className="my-0">
                                <CCol xs="4">
                                    <CFormGroup>
                                        <CLabel htmlFor="kir_berlaku_sampai">KIR Sampai</CLabel>
                                        <CInput id="kir_berlaku_sampai" type="date" name="kir_berlaku_sampai" placeholder="STNK" />
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="4" className="pl-0">
                                    <CFormGroup>
                                        <CLabel htmlFor="tera_berlaku_sampai">TERA Sampai</CLabel>
                                        <CInput id="tera_berlaku_sampai" type="date" name="tera_berlaku_sampai" placeholder="STNK" />
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="4" className="pl-0">
                                    <CFormGroup>
                                        <CLabel htmlFor="tbbm">Tanggal Masuk</CLabel>
                                        <CInput id="tanggal_kendaraan_masuk" type="date" name="tanggal_kendaraan_masuk" placeholder="Tanggal Masuk" />
                                    </CFormGroup>
                                </CCol>
                            </CFormGroup>
                            <CFormGroup row className="my-0">
                                <CCol xs="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="axle_head">Axle Head</CLabel>
                                        <CSelect name="axle_head" id="axle_head">
                                            <option value="4x2">4x2</option>
                                            <option value="6x2">6x2</option>
                                            <option value="6x4">6x4</option>
                                        </CSelect>

                                    </CFormGroup>
                                </CCol>
                                <CCol xs="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="axle_tempel">Axel tempel</CLabel>
                                        <CSelect name="axle_tempel" id="axle_tempel">
                                            <option value="2 axle">2 axle</option>
                                            <option value="3 axle">3 axle</option>
                                        </CSelect>
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
            </>
        )
    }
}
