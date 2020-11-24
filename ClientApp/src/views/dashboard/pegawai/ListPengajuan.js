import React from 'react'
import Swal from 'sweetalert2'
import {
  CRow, CCol,
  CTabs, CTabPane, CTabContent,
  CNav, CNavItem, CNavLink,
  CCard, CCardHeader,CCardFooter, CCardBody,
  CModal, CModalHeader, CModalFooter, CModalTitle, CModalBody,
  CForm, CFormGroup, CLabel, CSelect, CInput, CTextarea, CButton,
} from '@coreui/react'
import DalamMasaTenggang from '../DalamMasaTenggang'
import Notif from '../../../library/notif.library'
import AdminService from '../../../services/admin/admin.service'

const $ = require('jquery')
$.DataTable = require('datatables.net-bs4')

export class ListPengajuan extends  React.Component {
  constructor(props) {
    super(props);
    this.state = {
      itemStruktur : [], itemsData: [], itemsUpload : [], listBerkasPengajuan : [],
      nama_lengkap : null, nik : null, id_data: null, vendorId : null, alamat : null, pendingMsg : null, data_edit : null,
      modalUpload: false, modalView: false, uploadSelesai: false, pending : false, expiredStatus : false,
    }
  }

  dataOption = () => {
    AdminService.getData(1).then((result) => {
      this.setState({
        itemStruktur : result.data
      })
    }, (error) =>{
      Notif.errorNotif(error)
    })
  }
  viewOptionStruktur = (data =null) => {
    if (data) {
      let optionJenis = data.map((data) => {
        return(
          <option key={data.id} value={data.id}>{data.nama_jenis}</option>
        )
      })
      
      let optionChose = data.map((data) => {
        if (data.nama_jenis.toLowerCase() == 'pimpinan pertamina') {
          return data.id
        }
      })
      // console.log(optionChose.filter(Boolean).toString());
      return(
        <CSelect name="jenisId" value={optionChose.filter(Boolean).toString()} readOnly hidden>
          {optionJenis}
        </CSelect>
      );
    } else {
      return(
        <CSelect hidden>
          <option>Data Tidak Ditemukan</option>
        </CSelect>
      );
    }
  }

  dataOptionVendor = () => {
    AdminService.getData(8).then((result)=>{
      let idVendor = result.data.map((data) => {
        if (data.nama_vendor.toLowerCase() == 'pertamina lock') {
          return data.id
        }
      })
      
      this.setState({
        vendorId : idVendor.filter(Boolean).toString()
      })
    }, (error)=>{
      Notif.errorNotif(error)
    })
  }

  dateFn = () => {
    var tmp_d = new Date();
    var d = tmp_d.getDate();
    var m = tmp_d.getMonth();
    var y = tmp_d.getFullYear();
    
    return y+'-'+m+'-'+d;
  }
  handleSubmit = (props) => {
    props.preventDefault();

    let data; let submitData;
    if (this.state.id_data != null) { //edit data
      data = $("form")
        .find(":input")
        .serialize() + '&id=' + this.state.id_data;
      submitData = AdminService.putData(3, data)
      this.setState({ id_data: null })
    } else {
      let vendorId = this.state.vendorId;
      let alamat = this.state.alamat;
      data = $("form").serialize() + '&vendorId='+vendorId+'&alamat='+alamat+'&tgl_pengajuan='+this.dateFn();
      submitData = AdminService.postData(3, data)

      $("form").find("input").val('');
      $("form").find("textarea").val('');
    }
    submitData.then((result)=>{
      Notif.miniNotif('success', result.message)
      this.loadData()
    }, (error)=>{
      Notif.errorNotif(error)
    })
  }
  //Load Data Form API
  dataTable = () => {
    // console.log('SETTING DATATABLE >>');
    this.$el = $(this.el)
    this.$el.DataTable().destroy();
    // let groupColumn = 1;
    this.$el.DataTable()
  }

  TBody = (props) => {
    // console.log('CEK DATA PENGAJUAN >>')
    // console.log(props)
    if (props) {
      const listPengajuan = props.map((data, index) =>
      {
        let x = 1;
            let pengajuan; let status_pengajuan;
            // let lastAction;
            if (data.status_pengajuan == 0) {
              pengajuan = 'Pengajuan Baru';
            } else if (data.status_pengajuan == 1) {
              pengajuan = 'Pengajuan Diproses';
            } else if (data.status_pengajuan == 2) {
              pengajuan = 'Pengajuan Disetujui';
            } else if (data.status_pengajuan == 3) {
              pengajuan = 'Pengajuan Ditolak';
            } else {
              pengajuan = 'Loading data ...';
            }
            if (data.perpanjangan) {
              status_pengajuan = (
                <span className="badge badge-info">Perpanjangan</span>
              )
            } else {
              status_pengajuan = (
                <span className="badge badge-success">Pengajuan Baru</span>
              )
            }
            //cek file pengajuan
            let OptionUpload;
            if (data.file_foto != null && data.file_pendukung != null){
              OptionUpload = (
                <a className="btn btn-sm btn-success btn-block text-white mr-2 disabled"> Berkas Telah Diupload </a>
              )
            } else {
              OptionUpload = (
                <a className="btn btn-sm btn-warning btn-block text-white mr-2" onClick={() => this.openUpload({
                  id : data.id,
                  perpanjangan : data.perpanjangan,
                  jenis : data.jenis.nama_jenis
                })}> Upload Berkas </a>
              )
            }

            return (
              <tr key={data.id}>
                <td>{data.nama_lengkap} <br></br> {data.nik} <br></br> {status_pengajuan}</td>
                {/* <td>{data.jenis.nama_jenis}</td> */}
                <td>{data.tgl_pengajuan}</td>
                <td>{pengajuan}</td>
                <td>
                  {OptionUpload}
                  <a className="btn btn-sm btn-success btn-block text-white mr-2" onClick={() => this.viewPengajuan(data.id)}> View Pengajuan </a>
                </td>
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

  loadData = (id_data = "") => {
    AdminService.getData(3, id_data).then((result)=>{
      if (id_data === "") {
        this.setState({
          itemsData: result.data,
        });
        this.selesaikanUpload(result.data);
        this.dataTable();
      } else {
        if (result.status) {
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
              Notif.errorNotif('Data Tidak Ditemukan');
            }, 500)
          }, 1500)
        }
      }
    }, (error) => {
        Notif.errorNotif(error);
    })
  }
  // -- 
  selesaikanUpload = (data) => {
      if (data != null) {
        data.map((data, i) => {
          if (data.status_pengajuan === "0") {
            if (data.file_foto != null && data.file_pendukung != null) {
              AdminService.postData(4, new URLSearchParams({
                id : data.id
              })).then((result)=>{
                if (result.status) {
                  this.setState({
                   pending : false
                 })
                 Notif.miniNotif('success', result.message);
               } else {
                 this.setState({
                   pending : true,
                   pendingMsg : result.message
                 })
               }
              }, (error) =>{
                  Notif.errorNotif(error)
              })
            }
          }
        })
      }
  }

  formUpload = () => {
    AdminService.getData(10).then((result)=>{
      console.log(result);
      if (result.status) {
        this.setState({itemsUpload:result.data});
      } else {
        this.setState({itemsUpload:[]});
      }
    },(error)=>{
      Notif.errorNotif(error);
    })
  }

  openUpload = (dataPengaju = null) => {
    this.setState({
      modalUpload : true,
      dataPengaju : dataPengaju,
      id_data : dataPengaju.id,
    })
    console.log('OPEN UPLOAD ACTION ', dataPengaju)
  }

  handleUpload (props) {
    const file = props.target.files[0];
    const jenis = props.target.name;
    const  idPengaju = props.target.id;
    let formData = new FormData();
    formData.append('file', file);
    formData.append('id', idPengaju);

    console.log('Data Upload', formData)
    AdminService.uploadData(jenis, formData).then((result)=>{
      if (result.status) {
        Notif.miniNotif('success', jenis+' - '+result.message)
      } else {
        Notif.errorNotif(result.message); 
      }
    }, (error) => {
      Notif.errorNotif(error)
    })
  }

  handleSelesaiUpload = () => {
    this.setState({modalUpload:false});
    this.loadData()
    setTimeout(function (){
      Notif.miniNotif('success', 'Upload Berhasil Di Record!')
    }, 500)
  }
  viewPengajuan = (id) => {
    // console.log(id);
    this.setState({
      modalView: true,
      id_data: id,
    });
    this.loadData(id);
  }
  update(value){
    return () => {
       this.setState({
         data_edit: {
           jenisId : value.idCard.id,
           nama_lengkap : value.nama_lengkap,
           nik : value.nik,
           no_telp : value.no_telp,
           alamat : value.alamat
         }
       });
    }
  }
  expired(value){
    this.setState({
      expiredStatus : value
    })
  }
  componentDidMount() {
    // -------------------------
    let dataUser = JSON.parse(localStorage.getItem('detail_login'));
    // console.log(dataUser);
    this.setState({
        nama_lengkap : dataUser.nama_lengkap,
        nik: dataUser.nik,
        alamat: dataUser.alamat,
    })

    this.loadData();
    this.dataOption();
    this.formUpload();
    this.dataOptionVendor();
    // ----- load data setiap 2 detik
    this.timerID = setInterval(
      () => this.loadData(),
      5000
    );
    // this.handleSubmit();
  }

  berkasUpload = (dataPengaju) => {
    // console.log(this.state.itemsUpload);
    if (dataPengaju) {
      const berkasPengajuan = this.state.itemsUpload.map((data, i) =>{
        if (data.jenis == 'SURAT MUTASI JABATAN') {
          if (dataPengaju.perpanjangan) {
            return false
          } else {
            return (
              <CFormGroup key={data.id}>
                <CLabel htmlFor={data.jenis}>{data.jenis}</CLabel>
                <CInput id={this.state.id_data} type="file" name={data.link} linkupload={data.link} onChange={this.handleUpload} />
              </CFormGroup>
            )
          }
        } else {
          return (
            <CFormGroup key={data.id}>
              <CLabel htmlFor={data.jenis}>{data.jenis}</CLabel>
              <CInput id={this.state.id_data} type="file" name={data.link} linkupload={data.link} onChange={this.handleUpload} />
            </CFormGroup>
          )
        }
      })
         // -- return Function
         return berkasPengajuan
    }
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }


  render() {
    const { itemStruktur, itemsData, modalView, modalUpload, itemsUpload, listBerkasPengajuan, pendingMsg, pending, expiredStatus } = this.state;
    let dataUser = JSON.parse(localStorage.getItem('detail_login'));

    function cekNik () {
      if (dataUser.nik === null) {
        return (
          <CInput id="nik" type="text" name="nik" placeholder="Nomor Pekerja"/>
        )
      } else {
        return (
          <CInput id="nik" type="text" name="nik" placeholder="Nomor Pekerja" value={dataUser.nik} readOnly/>
        )
      }
    }
    
    function pendingNotif () {
      if (pending) {
        return (
          <>
          <div className="alert alert-warning p-1 pl-2"><span className="font-weight-bold">INFORMASI !</span> : Pengajuan Anda Sedang Pending, pengajuan akan otomatis setiap 5 detik jika masih pending. </div>
          <div className="alert alert-danger  p-1 pl-2"><span className="font-weight-bold">INFORMASI !</span> : <i>System Message</i> {pendingMsg} </div>
          </>
        )
      }
    }
    return(
      <>
        <CRow>
          <CCol lg={12}>
              {pendingNotif()}
              {expiredStatus ? 
                  <div className="alert alert-danger  p-1 pl-2"><span className="font-weight-bold">INFORMASI !</span> : ID CARD anda sedang dalam masa expired Mohon untuk pengajuan kembali </div>
                :
                null
              }
          </CCol>
          <CCol lg={4}>
            <CCard>
              <CCardHeader>
                <strong>Buat Pengajuan</strong>
              </CCardHeader>
              <CCardBody>
                <CForm onSubmit={this.handleSubmit}>
                {this.viewOptionStruktur(itemStruktur)}
                  <CFormGroup row className="my-0">
                    <CCol xs="6">
                      <CFormGroup>
                      <CLabel htmlFor="nik">NOPEK</CLabel>
                    <CInput id="nik" type="text" name="nik" placeholder="Nomor Pekerja" value={dataUser.nik} readOnly/>
                      </CFormGroup>
                    </CCol>
                    <CCol xs="6">
                      <CFormGroup>
                        <CLabel htmlFor="perpanjangan">Status Pengajuan</CLabel>
                        <CSelect name="perpanjangan" defaultValue={(this.state.data_edit ? this.state.data_edit.perpanjangan : "")}>
                          <option value="0">Baru</option>
                          <option value="1">Perpanjangan</option>
                        </CSelect>
                      </CFormGroup>
                    </CCol>
                    <CCol xs="12">
                      <CFormGroup>
                        <CLabel htmlFor="nama_lengkap">Nama Lengkap</CLabel>
                        <CInput id="nama_lengkap" type="text" name="nama_lengkap" placeholder="Nama Lengkap" value={dataUser.nama_lengkap} readOnly/>
                      </CFormGroup>
                    </CCol>
                    <CCol xs="12">
                      <CFormGroup>
                        <CLabel htmlFor="tgl_lahir">Tanggal Lahir</CLabel>
                        <CInput id="tgl_lahir" type="date" name="tgl_lahir" />
                        <CInput id="no_telp" type="text" name="no_telp" defaultValue="082200000822" hidden />
                      </CFormGroup>
                    </CCol>
                  </CFormGroup>
                  <CButton className="btn-block" color="primary" type="submit">Proses Data</CButton>{' '}
                </CForm>
              </CCardBody>
              <CCardFooter>
                <small>Siapkan Berkas Pelengkap Untuk Diupload</small>
              </CCardFooter>
            </CCard>
          </CCol>
          <CCol lg={8}>
            <CCard>
              <CCardHeader className="font-weight-bold font-italic">
                Surat Pengajuan Id Card Online
              </CCardHeader>
              <CCardBody>
                <CTabs>
                  <CNav variant="tabs">
                    <CNavItem>
                      <CNavLink>
                        Pengajuan Baru
                      </CNavLink>
                    </CNavItem>
                    <CNavItem>
                      <CNavLink>
                        Dalam Masa Tenggang
                      </CNavLink>
                    </CNavItem>
                  </CNav>
                  <CTabContent className="mt-2">
                    <CTabPane>
                      <CCard>
                        <CCardHeader>
                          <strong>Data Pengajuan Baru</strong>
                        </CCardHeader>
                        <CCardBody>
                          <CButton onClick={() => this.loadData()} className="btn btn-primary mb-2">Refresh data</CButton>
                        <table width="100%" className="table table-striped table-bordered table-hover table-sm" ref={el => this.el = el}>
                          <thead>
                          <tr>
                            <th>Nama Lengkap</th>
                            {/* <th>Pekerjaan</th> */}
                            <th>Tanggal Pengajuan</th>
                            <th>Status</th>
                            <th>Aksi</th>
                          </tr>
                          </thead>
                          {this.TBody(itemsData)}
                        </table>
                        </CCardBody>
                      </CCard>
                    </CTabPane>
                    <CTabPane>
                      <DalamMasaTenggang data={this.update.bind(this)} expiredStatus={this.expired.bind(this)}/>
                    </CTabPane>
                  </CTabContent>
                </CTabs>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
        <CModal
          show={modalUpload}
          onClose={() => this.setState({ modalUpload: false })}
        >
          <CModalHeader closeButton>
            <CModalTitle>Upload Berkas Pendukung</CModalTitle>
          </CModalHeader>
          <CModalBody>
          {this.berkasUpload(this.state.dataPengaju)}
          </CModalBody>
          <CModalFooter>
            <CButton
              color="secondary"
              onClick={() => this.setState({ modalUpload: false })}
            >Cancel</CButton>
            <CButton
              color="success"
              onClick={() => this.handleSelesaiUpload()}
            >Buat Pengajuan</CButton>
          </CModalFooter>
        </CModal>
        <CModal
          show={modalView}
          onClose={() => this.setState({ modalView: false })} >
          <CModalHeader closeButton>
            <CModalTitle>View Pengajuan Berkas</CModalTitle>
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
                  <table width="100%" className="table table-striped table-bordered table-hover table-sm">
                    <thead>
                    <tr>
                      <th>Nama Berkas</th>
                      <th>Aksi</th>
                    </tr>
                    </thead>
                    <tbody>
                    {listBerkasPengajuan.map((data, i) =>
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
                onClick={() => this.setState({ modalView: false })}
              >Close View</CButton>
            </CModalFooter>
          </CForm>
        </CModal>
        </>
    )
  }
}
