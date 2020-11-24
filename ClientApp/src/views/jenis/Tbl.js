import React from 'react'
import {
    CButton, 
    CModal, CModalTitle,  CModalBody, CModalFooter, CModalHeader,
    CFormGroup, CLabel, CInput, CForm,
} from '@coreui/react'

import Notif from '../../library/notif.library'


const $     = require('jquery')
$.DataTable = require('datatables.net-bs4')

export class Tbl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null, id_data: null,
            itemsData: [],
            modalCRUD: false,
        }
    }

    TBody = (props) => {
        if (props) {
            let dataJenis = props.map((data, index) =>{
                if (data.nama_jenis.toLowerCase() != 'pegawai pertamina' && data.nama_jenis.toLowerCase() != 'pimpinan pertamina') {
                    return (
                        <tr key={data.id}>
                            {/* <td>{index + 1}</td> */}
                            <td>{data.nama_jenis}</td>
                            <td>{data.akses.akses_name}</td>
                            {/* <td>
                                <center>
                                    <a className="btn btn-sm btn-success text-white mr-2" onClick={() => this.handleEdit(data.id)}> Edit Jenis </a>
                                </center>
                            </td> */}
                        </tr>
                    )   
                }
            })
            return (
                <tbody>
                    {dataJenis}
                </tbody>
            );
        }
    }

    loadData = (id_data = "") => {
        this.props.getData(1, id_data).then((result) => {
            if (id_data === "") {
                this.setState({
                    itemsData: result.data,
                });
                this.$el = $(this.el)
                this.$el.DataTable()
            } else {
                if (result.status) {
                    var keys = Object.keys(result.data);
                    var value = Object.values(result.data);
                    // kirim hasil get berdasrkan id ke view
                    for (var i = keys.length - 1; i >= 0; i--) {
                        $("input[name='" + keys[i] + "']").val(value[i]);
                        $("select[name='" + keys[i] + "']").val(value[i]);
                    }
                } else {
                    setTimeout(function () {
                        this.setState({ modalCRUD: false, id_data: null })
                        setTimeout(function () {
                            Notif.miniNotif('error', 'Data Tidak Ditemukan');
                        }, 500)
                    }, 1500)
                }
            }
        }, (error) => {
            Notif.errorNotif(error);
        })
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
        let data       = $("form").serialize() + (this.state.id_data !== null ? '&id='+this.state.id_data : "") 
        const submitEv = (this.state.id_data === null ? this.props.postData : this.props.putData)
        
        submitEv(1, data).then((result) => {
            Notif.miniNotif('success', result.message)
            this.loadData()
        }, (error) => {
            Notif.errorNotif(error)
            this.setState({ modalCRUD: false })
        })
    }

    componentDidMount() {
        this.loadData()
    }

    render() {
        const { titleModal, itemsData, modalCRUD } = this.state;
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
                            {/* <th>No</th> */}
                            <th>Jenis Pekerjaan</th>
                            <th>Akses</th>
                            {/* <th>Aksi</th> */}
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
                                <CLabel htmlFor="nama_jenis">Jenis Pekerjaan</CLabel>
                                <CInput id="nama_jenis" type="text" name="nama_jenis" placeholder="Jenis Pekerjaan" />
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
