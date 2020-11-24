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
    CModalTitle,
    CCard, CCardBody, CCardHeader,
} from '@coreui/react'
import Notif from '../../library/notif.library'
import AdminService from '../../services/admin/admin.service'

const $ = require('jquery')
$.DataTable = require('datatables.net-bs4')

export class History extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null, id_data: null, data_pegawai: null, data_edit : null, 
            itemsData: [], itemsUpload : [], listBerkasPengajuan : [],
            modalTolak : false, modalHapus: false, modalCRUD: false, modalNomorPegawai: false, idCardExpired : false, isLoading : true
        }
    }

    TBody = (props) => {
    //   console.log('DATA HISTORY >> ', props);
        if (props) {
            const listPengajuan = props.map((data, index) => {
              return(
                <tr key={data.id}>
                    <td>{data.pengajuan.tgl_pengajuan}</td>
                    <td>{data.pengajuan.nama_lengkap} <br></br> {data.pengajuan.nik}</td>
                    <td>{data.pengajuan.vendor.nama_vendor}</td>
                    <td>{data.tanggal_proses}</td>
                    <td>{data.posisi}</td>
                </tr>
              )      
            });
          return (
            <tbody>
            {listPengajuan}
            </tbody>
          )
        }
    }
    dataTable = () => {
      this.$el = $(this.el)
      this.$el.DataTable().destroy();
      this.$el.DataTable()
    }
    loadData = (id_data = "") => {
      AdminService.getData(9, id_data).then((result)=> {
          this.setState({
            isLoading : false
          })
          if (result.status) {
            this.setState({
                itemsData: result.data,
            });
            this.dataTable()
          } else {
            Notif.errorNotif('DATA TIDAK DITEMUKAN')
          }
      }, (error) =>{
        Notif.errorNotif(error)
      })
  }
    

    viewPengajuan = (id) => {
        //console.log(id);
        this.setState({
            modalCRUD: true,
            id_data: id,
            titleModal: 'View Pengajuan'
        });
        this.loadData(id);
    }

    // ----------------- //
    componentDidMount() {
        this.loadData()
    }

    render() {
        const { modalTolak, titleModal, itemsData, modalCRUD, modalNomorPegawai, data_edit, idCardExpired } = this.state;
       
        return (
            <>
                <CRow>
                    <CCol lg={12}>
                        <CCard>
                            <CCardHeader>
                                <strong>History Pengajuan</strong>
                            </CCardHeader>
                            <CCardBody>
                            {this.state.isLoading ?
                                "Loading..."
                                :
                                <table width="100%" className="table table-striped table-bordered table-hover table-sm" ref={el => this.el = el}>
                                    <thead>
                                        <tr>
                                            <th>Tgl Pengajuan</th>
                                            <th>Nama Lengkap</th>
                                            <th>Nama Vendor</th>
                                            <th>Terakhir Update</th>
                                            <th>Posisi Pengajuan</th>
                                        </tr>
                                    </thead>
                                    { 
                                    this.TBody(itemsData)
                                    }
                                </table>
                            }
                            </CCardBody>
                        </CCard>
                    </CCol>
                </CRow>
                {/* -- -- */}
                <CModal
                    show={modalCRUD}
                    onClose={() => this.setState({ modalCRUD: false })}
                >
                    <CModalHeader closeButton>
                        <CModalTitle>{titleModal}</CModalTitle>
                    </CModalHeader>
                    <CForm >
                      <CModalBody>
                        <CFormGroup>
                          <CLabel htmlFor="nik">NIK</CLabel>
                          <CInput id="nik" type="text" name="nik" placeholder="Nomor Induk Kependudukan" disabled />
                        </CFormGroup>
                        <CFormGroup row className="my-0">
                          <CCol xs="6">
                            <CFormGroup>
                              <CLabel htmlFor="nama_lengkap">Nama Lengkap</CLabel>
                              <CInput id="nama_lengkap" type="text" name="nama_lengkap" placeholder="Nama Lengkap" disabled />
                            </CFormGroup>
                          </CCol>
                          <CCol xs="6" className="pl-0">
                            <CFormGroup>
                              <CLabel htmlFor="no_telp">Nomor Telp</CLabel>
                              <CInput id="no_telp" type="text" name="no_telp" placeholder="Nomor Telp" disabled />
                            </CFormGroup>
                          </CCol>
                          <CCol xs="12" >
                            <CFormGroup>
                              <CLabel htmlFor="alamat">Alamat Lengkap</CLabel>
                              <CTextarea id="alamat" name="alamat" disabled></CTextarea>
                            </CFormGroup>
                          </CCol>
                          <CCol xs="12" >
                            <table width="100%" className="table table-striped table-bordered table-hover table-sm">
                              <thead>
                              <tr>
                                <th width="15px">No</th>
                                <th>Nama Berkas</th>
                                <th>Aksi</th>
                              </tr>
                              </thead>
                              <tbody>
                              {this.state.listBerkasPengajuan.map((data, i) =>
                                {
                                  let actDownload;
                                  if (data.link_file != null ){
                                    actDownload = (
                                      <a href={data.link_file} target="_blank">Download File</a>
                                    )
                                  } else {
                                    actDownload = "File Tidak Ada";
                                  }
                                  return (
                                    <tr key={data.id}>
                                      <td>{i+1}</td>
                                      <td>{data.nama_file}</td>
                                      <td>
                                        {actDownload}
                                      </td>
                                    </tr>
                                  )
                                }
                              )}
                              </tbody>
                            </table>
                          </CCol>
                        </CFormGroup>
                      </CModalBody>
                        <CModalFooter>
                            <CButton
                                color="secondary"
                                onClick={() => this.setState({ modalCRUD: false })}
                            >Close View</CButton>
                        </CModalFooter>
                    </CForm>
                </CModal>
                {/* Modal Penambahan Input Nomor Pekerja - NOPEK */}
               </>
        )
    }
}

export default History