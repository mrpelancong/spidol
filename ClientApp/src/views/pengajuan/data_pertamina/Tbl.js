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
import Notif from '../../../library/notif.library'
import AdminService from '../../../services/admin/admin.service'

const $ = require('jquery')
$.DataTable = require('datatables.net-bs4')


export class Tbl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null, id_data: null, data_pegawai : null, data_edit : null,
            itemsData: [], itemsUpload : [], listBerkasPengajuan : [],
            modalHapus: false, modalCRUD: false, modalNomorPegawai : false, modalTolak : false, idCardExpired : false, isLoading : true
        }
    }

    TBody = (props) => {
      console.log('data pengajuan pertamina', props)
        if (props) {
            const listPengajuan = props.map((data, index) => {
                      //cek file pengajuan
                      if (data.vendor.nama_vendor.toLowerCase() == 'default pertamina' || data.vendor.nama_vendor.toLowerCase() == 'pertamina lock') {
                        let OptionUpload;
                        let statusPengajuan;
                        let statusID;
                        if (data.status_pengajuan == 0) {
                            statusPengajuan = 'Pengajuan Baru';
                            statusID = (
                              <span className="badge badge-warning">Proses</span>
                            )
                        } else if(data.status_pengajuan == 1) {
                          statusPengajuan = 'Proses Acc';
                          if (data.proses) {
                            if (data.idCard === null) {
                              statusID = (
                                <>
                                <button className="btn btn-primary btn-block btn-sm" onClick={() => this.setState({
                                  modalNomorPegawai : true,
                                  data_pegawai : {
                                    pengajuanId : data.id,
                                    nikPegaawai : data.nik,
                                    namaPegawai : data.nama_lengkap
                                  }
                                  })}>Input Nomor Pekerja - NOPEK</button>
                                <button className="btn btn-danger btn-block btn-sm" onClick={() => this.setState({
                                    modalTolak : true,
                                    data_pegawai : {
                                      pengajuanId : data.id,
                                      nikPegaawai : data.nik,
                                      namaPegawai : data.nama_lengkap
                                    }
                                    })}>Tolak Pengajuan</button>
                                </>
                              )
                            } else {
                              statusID = (
                                <button className="btn btn-primary btn-sm" onClick={() =>  this.setState({
                                  modalNomorPegawai : true,
                                  id_data : data.idCard.id,
                                  idCardExpired : data.idCard.expired,
                                  data_pegawai : {
                                    namaPegawai : data.nama_lengkap
                                  },
                                  data_edit : {
                                    nomor_idcard : data.idCard.nomor_idcard,
                                    tanggal_kadaluarsa : data.idCard.masa_berlaku
                                  }
                                })}> ID Card Number : {data.idCard.nomor_idcard} </button>
                              )
                              if (data.idCard.expired) {
                                statusPengajuan = (
                                  <span className="text-danger font-weight-bold font-italic">Dalam Masa Tenggang Expired</span>
                                );
                              } else {
                                statusPengajuan = (
                                  <span className="text-success font-weight-bold font-italic">ID Card Telah Diberikan</span>
                                );
                              }
                            }
                          } else {
                            statusID = (
                              <span className="badge badge-warning">Proses</span>
                            )
                          }
                        } else if(data.status_pengajuan == 2){
                          statusPengajuan = 'Pengajuan Disetujui';
                          if (data.idCard === null) {
                            statusID = (
                              <button className="btn btn-primary btn-sm" onClick={() => this.setState({
                                modalNomorPegawai : true,
                                data_pegawai : {
                                  pengajuanId : data.id,
                                  nikPegaawai : data.nik,
                                  namaPegawai : data.nama_lengkap
                                }
                                })}>Input Nomor Pekerja - NOPEK</button>
                            )
                          } else {
                            statusID = (
                              <>
                              <button className="btn btn-primary btn-sm btn-block mb-2" onClick={() =>  this.setState({
                                modalNomorPegawai : true,
                                id_data : data.idCard.id,
                                idCardExpired : data.idCard.expired,
                                data_pegawai : {
                                  namaPegawai : data.nama_lengkap
                                },
                                data_edit : {
                                  nomor_idcard : data.idCard.nomor_idcard,
                                  tanggal_kadaluarsa : data.idCard.masa_berlaku
                                }
                              })}> ID Card Number : {data.idCard.nomor_idcard} </button>
                              <a className="btn btn-sm btn-success btn-block" href={'/pdf/'+data.id} > Cetak ID Card</a>
                              </>
                            )
                            if (data.idCard.expired) {
                              statusPengajuan = (
                                <span className="text-danger font-weight-bold font-italic">Dalam Masa Tenggang Expired</span>
                              );
                            } else {
                              statusPengajuan = (
                                <span className="text-success font-weight-bold font-italic">ID Card Telah Diberikan</span>
                              );
                            }
                          }
                        } else {
                          statusPengajuan = 'Pengajuan Ditolak';
                          statusID = (
                            <span className="badge badge-danger">DITOLAK</span>
                          )
                        }


                        if (data.file_foto != null && data.file_pendukung != null){
                          OptionUpload = (
                          <a className="btn btn-sm btn-success btn-block text-white mr-2" onClick={() => this.viewPengajuan(data.id)}> View Berkas </a>
                          )
                        } else {
                          OptionUpload = (
                          <a className="btn btn-sm btn-warning btn-block text-white mr-2 disabled"> Berkas Belum Selesai </a>
                          )
                        }
                          return(
                          <tr key={data.id}>
                            <td>{data.nik} <br></br> {data.tgl_pengajuan}</td>
                            <td>{data.vendor.nama_vendor}</td>
                            <td>{data.nama_lengkap}</td>
                            <td>{(data.jenis.nama_jenis.toLowerCase() === 'pimpinan pertamina' ? 'Pegawai Pertamina' : data.jenis.nama_jenis)}</td>
                            <td>{statusPengajuan}</td>
                            <td>
                              {statusID}
                            </td>
                            <td>
                              {OptionUpload}
                            </td>
                          </tr>
                        )
                      }
                    }
            );
          return (
            <tbody>
            {listPengajuan}
            </tbody>
          )
        }
    }
    dataTable = () => {
      //console.log('SETTING DATATABLE >>');
      this.$el = $(this.el)
      let groupColumn = 1;
      this.$el.DataTable().destroy();
      this.$el.DataTable({
        "columnDefs": [
          { "visible": false, "targets": groupColumn }
        ],
        "order": [[ groupColumn, 'asc' ]],
        "displayLength": 25,
        "drawCallback": function ( settings ) {
          var api = this.api();
          var rows = api.rows( {page:'current'} ).nodes();
          var last=null;

          api.column(groupColumn, {page:'current'} ).data().each( function ( group, i ) {
            if ( last !== group ) {
              $(rows).eq( i ).before(
                '<tr class="group"><td class="font-weight-bold font-italic" colspan="6">'+group+'</td></tr>'
              );

              last = group;
            }
          } );
        }
      })
    }
    loadData = (id_data = "") => {
        AdminService.getData(3, id_data).then((result)=> {
            this.setState({
              isLoading : false
            })
            if (id_data == "") {
                this.setState({
                    itemsData: result.data,
                });
                this.dataTable()
            } else {
              this.setState({itemsUpload: result.data});
                if (result.status) {
                    //send data to Form
                    let keys = Object.keys(result.data);
                    let value = Object.values(result.data);
                    let arrBerkas = [];
                    let berkasReq = ["surat_permohonan", "surat_pernyataan", "file_ktp", "file_biodata", "file_foto", "file_skck", "file_surat_sehat", "surat_bebas_narkoba", "file_pendukung"];
                    for (let i = keys.length - 1; i >= 0; i--) {
                        $("input[name='" + keys[i] + "']").val(value[i]);
                        $("select[name='" + keys[i] + "']").val(value[i]);
                        $("textarea[name='" + keys[i] + "']").val(value[i]);

                        //costume pengolahan data
                        if (berkasReq.includes(keys[i]) === true) {
                          let objectBerkas = {
                            "id" : i,
                            "nama_file" : keys[i],
                            "link_file" : value[i]
                          };

                          arrBerkas.push(objectBerkas);
                        }
                      }
                    this.setState({listBerkasPengajuan: arrBerkas});
                } else {
                    setTimeout(function () {
                        this.setState({ modalCRUD: false, id_data: null })
                        setTimeout(function () {
                            Notif.errorNotif('ata Tidak Ditemukan')
                        }, 500)
                    }, 1500)
                }
            }
        }, (error) =>{
          Notif.errorNotif(error)
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

    viewPengajuan = (id) => {
        //console.log(id);
        this.setState({
            modalCRUD: true,
            id_data: id,
            titleModal: 'View Pengajuan'
        });
        this.loadData(id);
    }
    handleSubmit = (event) => {
        event.preventDefault();
        let classForm = $(event.target).attr('class');
        let status = (classForm == 'tolak' ? "0" : "1" );
        let data; let submitData;
        
        if (this.state.id_data !== null) {
            data = $("."+classForm)
                .find(":input")
                .serialize() + '&pengajuanId=' + this.state.id_data + '&status=' + status;
              submitData = AdminService.putData(7, data)
        } else {
            data = $("."+classForm).serialize()+ '&pengajuanId=' + this.state.data_pegawai.pengajuanId + '&status=' + status;
            console.log('DATA PROSES NOMOR ',data);
            submitData = AdminService.postData(7, data);
            // ----------------
        }
        submitData.then((result)=>{
          if (result.status) {
            this.setState({ 
              id_data : null,
              data_pegawai : null, 
              modalNomorPegawai : false,
            })
            Notif.miniNotif('success', result.message)
            this.loadData()
          } else {
            Notif.errorNotif(result.message);
          }
        }, (error) => {
          this.setState({ 
            modalNomorPegawai: false,
            modalTolak : false, 
          })
          Notif.errorNotif(error);
        })
    }
    componentDidMount() {
        this.loadData()
    }

    render() {
        const { modalTolak, titleModal, itemsData, modalCRUD, modalNomorPegawai, data_edit, idCardExpired } = this.state;

        return (
            <>
              {this.state.isLoading ?
                  "Loading..."
                  :
                    <table width="100%" className="table table-striped table-bordered table-hover table-sm" ref={el => this.el = el}>
                        <thead>
                            <tr>
                                <th width="15px">No</th>
                                <th>Nama Vendor</th>
                                <th>Nama Lengkap</th>
                                <th>Jenis Pekerjaan</th>
                                <th>Status</th>
                                <th>No ID</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        {this.TBody(itemsData)}
                    </table>
                    }
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
                              <CLabel htmlFor="tgl_lahir">Tanggal Lahir</CLabel>
                              <CInput id="tgl_lahir" type="text" name="tgl_lahir" disabled />
                              {/* <CTextarea id="tgl_lahir" name="tgl_lahir" disabled></CTextarea> */}
                            </CFormGroup>
                          </CCol>
                          <CCol xs="12" >
                            <table width="100%" className="table table-striped table-bordered table-hover table-sm">
                              <thead>
                              <tr>
                                <th>Nama Berkas</th>
                                <th>Aksi</th>
                              </tr>
                              </thead>
                              <tbody>
                              {this.state.listBerkasPengajuan.map((data, i) =>
                                {
                                  let actDownload;
                                  if (data.nama_file == 'surat_pernyataan' || data.nama_file == 'file_foto' || data.nama_file == 'file_pendukung') { 
                                    if (data.link_file != null ){
                                      actDownload = (
                                        <a href={data.link_file} target="_blank">Download File</a>
                                      )
                                    } else {
                                      actDownload = "File Tidak Ada";
                                    }
                                    return (
                                      <tr key={data.id}>
                                        <td>{data.nama_file}</td>
                                        <td>
                                          {actDownload}
                                        </td>
                                      </tr>
                                    )
                                  }
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
                <CModal
                    show={modalNomorPegawai}
                    onClose={() => this.setState({ modalNomorPegawai: false })}
                >
                    <CModalHeader closeButton>
                              <CModalTitle>{(this.state.data_pegawai ? this.state.data_pegawai.namaPegawai : null )}</CModalTitle>
                    </CModalHeader>
                    <CForm onSubmit={this.handleSubmit} className="setujui">
                      <CModalBody>
                        <CFormGroup row className="my-0">
                          <CCol xs="6">
                            <CFormGroup>
                              <CLabel htmlFor="nomor_idcard">Input Nomor IdCard</CLabel>
                              {/* <input defaultValue="1" name="status" hidden/> */}
                              <CInput id="nomor_idcard" type="text" name="nomor_idcard" defaultValue={(this.state.data_edit ? this.state.data_edit.nomor_idcard : "")} placeholder="Nomor IdCard" />
                            </CFormGroup>
                          </CCol>
                          {( data_edit ? 
                            <CCol xs="6" className="pl-0">
                              <CFormGroup>
                                <CLabel htmlFor="masa_berlaku">Tanggal Kadaluarsa</CLabel>
                                {( idCardExpired ? 
                                    <CInput id="masa_berlaku" type="date" defaultValue={(data_edit ? data_edit.tanggal_kadaluarsa : "")} name="tanggal_kadaluarsa" disabled />
                                  :
                                  <CInput id="masa_berlaku" type="date" defaultValue={(data_edit ? data_edit.tanggal_kadaluarsa : "")} name="tanggal_kadaluarsa" />
                                )}
                              </CFormGroup>
                            </CCol>
                            : false)}
                          <CCol xs="12">
                            <CFormGroup>
                              {( idCardExpired ? 
                                  <div className="alert alert-warning">Dalam Masa Tenggang Expired pada tanggal <span className="font-weight-bold">{data_edit.tanggal_kadaluarsa}</span></div>
                                :
                                  ""
                              )}
                            </CFormGroup>
                          </CCol>
                          <CCol xs="12">
                            <CFormGroup>
                              <div className="alert alert-danger">
                                Akan Kadaluarsa pada tanggal dan bulan lahir anda tahun depan.
                              </div>
                            </CFormGroup>
                          </CCol>
                        </CFormGroup>
                      </CModalBody>
                        <CModalFooter>
                            <CButton
                                color="secondary"
                                onClick={() => this.setState({ modalCRUD: false })}
                            >Cancel</CButton>
                            {( idCardExpired ? 
                                  <CButton color="primary" type="submit" disabled>Simpan data</CButton>
                                :
                                  <CButton color="primary" type="submit">Simpan data</CButton>
                              )}
                        </CModalFooter>
                    </CForm>
                </CModal>
                <CModal
                    show={modalTolak}
                    onClose={() => this.setState({ modalTolak: false })}
                >
                    <CModalHeader closeButton>
                              <CModalTitle>Tolak Pengajuan {(this.state.data_pegawai ? this.state.data_pegawai.namaPegawai : null )}</CModalTitle>
                    </CModalHeader>
                    <CForm className="tolak" onSubmit={this.handleSubmit}>
                      <CModalBody>
                        <CFormGroup row className="my-0">
                          <CCol xs="12">
                            <CFormGroup>
                              <CLabel htmlFor="nomor_idcard">Catatan Tolak</CLabel>
                              {/* <input defaultValue="0" name="status" hidden/> */}
                              <textarea className="form-control" name="catatan" defaultValue={(this.state.data_edit ? this.state.data_edit.nomor_idcard : "")}></textarea>
                            </CFormGroup>
                          </CCol>
                        </CFormGroup>
                      </CModalBody>
                        <CModalFooter>
                            <CButton
                                color="secondary"
                                onClick={() => this.setState({ modalTolak: false })}
                            >Cancel</CButton>
                            <CButton color="primary" type="submit">Simpan data</CButton>
                        </CModalFooter>
                    </CForm>
                </CModal>
            </>
        )
    }
}
