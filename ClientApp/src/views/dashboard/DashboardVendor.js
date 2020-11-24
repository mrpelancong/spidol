import React  from 'react'
import {
  CTabs, CTabPane, CTabContent,
  CNav, CNavItem, CNavLink,
  CInput, CLabel, CSelect, CTextarea, CButton, 
  CCard, CCardBody, CCardHeader,
  CCol, CRow,
  CForm, CFormGroup,
  CModal, CModalHeader, CModalBody, CModalFooter, CModalTitle
} from '@coreui/react'

import DalamMasaTenggang from './DalamMasaTenggang'
import Notif from '../../library/notif.library'
import AdminService from '../../services/admin/admin.service'

const $ = require('jquery')
$.DataTable = require('datatables.net-bs4')

class DashboardVendor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null, id_data: null, pendingMsg : null, successMsg : null, data_edit : null,
      itemStruktur : [], itemsData: [], itemsUpload : [], listBerkasPengajuan : [],
      isLoading : true, modalHapus: false, modalUpload: false, modalView: false, pendingNofif : false, successNotif : false,
    }
  }

  viewOption = () => {
    let url = "api/jenis/";
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
          this.setState({
            itemStruktur : result.data
          })
        },
        (error) => {
          Notif.errorNotif(error)
        }
      )
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

    let dataUser = JSON.parse(localStorage.getItem('detail_login'));
    let data; let submitData;
    if (this.state.id_data != null) {
      data = $("form")
        .find(":input")
        .serialize() + '&id=' + this.state.id_data;
      submitData =  AdminService.putData(3, data)

      this.setState({ id_data: null })
    } else {
      data = $("form").serialize() + '&vendorId=' + dataUser.vendor.id +'&tgl_pengajuan='+this.dateFn();
      submitData = AdminService.postData(3, data)

      $("form").find("input").val('');
      $("form").find("textarea").val('');
    }
    // ---------------
    submitData.then((result)=>{
        Notif.miniNotif('success', result.message)
        console.log(result);
        this.openUpload({
          id : result.data.id,
          perpanjangan : result.data.perpanjangan,
          jenis : result.data.jenis.nama_jenis
        })
        // -----------
        // this.loadData()
    }, (error) => {
      this.setState({ modal: false })
      Notif.errorNotif(error);
    })
    
  }

  //load data Vendor
  TBody = (items, dataUser) => {
    if (items) {
        const listPengajuan = items.map((data, index) =>{
          if (dataUser != null) {
            if (dataUser.vendor.id === data.vendor.id && parseInt(data.status_pengajuan) === 0){
              // let x = 1;
              let pengajuan; let status_pengajuan;
              if (parseInt(data.status_pengajuan) === 0) {
                pengajuan = 'Pengisian Berkas';
              } else if (parseInt(data.status_pengajuan) === 1) {
                pengajuan = 'Pengajuan Diproses';
              } else if (parseInt(data.status_pengajuan) === 2) {
                pengajuan = 'Pengajuan Disetujui';
              } else if (parseInt(data.status_pengajuan) === 3) {
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
              if (data.surat_permohonan != null && data.surat_pernyataan != null && data.file_ktp != null && data.file_biodata != null && data.file_foto != null && data.file_skck != null && data.file_surat_sehat != null && data.surat_bebas_narkoba != null && data.file_pendukung != null){
                OptionUpload = (
                  <button className="btn btn-sm btn-success btn-block text-white mr-2 disabled"> Berkas Telah Diupload </button>
                )
              } else {
                OptionUpload = (
                  <button className="btn btn-sm btn-warning btn-block text-white mr-2" onClick={() => this.openUpload({
                    id : data.id,
                    perpanjangan : data.perpanjangan,
                    jenis : data.jenis.nama_jenis
                  })}> Upload Berkas </button>
                )
              }

              return (
                <tr key={data.id}>
                  <td>{data.nama_lengkap} <br></br> {data.nik} <br></br> {status_pengajuan}</td>
                  <td>{data.jenis.nama_jenis}</td>
                  <td>{data.tgl_pengajuan}</td>
                  <td>{pengajuan}</td>
                  <td>
                    {OptionUpload}
                    <button className="btn btn-sm btn-success btn-block text-white mr-2" onClick={() => this.viewPengajuan(data.id)}> View Pengajuan </button>
                  </td>
                </tr>
              )
            }
          }
        })
      return (
        <tbody>
        {listPengajuan}
        </tbody>
      )
    } else {
      return (
        <tbody></tbody>
      )
    }
  }

  dataTable = () => {
    this.$el = $(this.el)
    this.$el.DataTable().destroy()
    // --------------------------
    this.$el.DataTable()
  }
  
  loadData = (id_data = "") => {
    AdminService.getData(3, id_data).then((result)=>{
      if (id_data == "") {
        if (result.status) {
          this.setState({
            itemsData: result.data,
            isLoading : false,
          });
          // --- selesaikan proses 
          this.selesaikanUpload(result.data);
          this.dataTable()
        } else {
          this.setState({
            itemsData: [],
          });
        }
      } else {
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
            this.setState({ modalView: false, id_data: null })
            setTimeout(function () {
              Notif.errorNotif('Data Tidak Ditemukan!')
            }, 500)
          }, 1500)
        }
      }
    }, (error) => {
      console.log(error)
            Notif.errorNotif(error);
        })
  }

  selesaikanUpload = (data) => {
    if (data) {
      data.map((data, i) => {
        if (data.status_pengajuan === "0") {
          if (data.surat_permohonan !== null && data.surat_pernyataan !== null && data.file_ktp !== null && data.file_biodata !== null && data.file_foto !== null && data.file_skck !== null && data.file_surat_sehat !== null && data.file_pendukung !== null) {
            AdminService.postData(4, new URLSearchParams({
              id : data.id
            })).then((result)=>{
              if (result.status) {
                this.setState({
                  pendingNofif : false,
                  successNotif : true,
                  pendingMsg : null,
                  successMsg : result.message,
               })
               Notif.miniNotif('success', result.message)
              } else {
                this.setState({
                   pendingNofif : true,
                   successNotif : false,
                   pendingMsg : result.message,
                   successMsg : null,
                })
              }
            }, (error)=>{
              Notif.errorNotif(error)
            })
          }
        }
      })
    }
  }

  formUpload = () => {
    AdminService.getData(5).then((result)=>{
      if (result.status) {
        this.setState({itemsUpload:result.data});
      } else {
        this.setState({itemsUpload:[]});
      }
    }, (error) => {
      Notif.errorNotif(error)
    })
  }

  openUpload = (dataPengaju = null) => {
    this.setState({
      modalUpload : true,
      dataPengaju : dataPengaju,
      id_data : dataPengaju.id
    })
    console.log('OPEN UPLOAD ACTION ', dataPengaju)
  }
  // --- ACTION UPLOAD 
  handleUpload (props) {
    const file = props.target.files[0];
    const jenis = props.target.name;
    const  idPengaju = props.target.id;

    let formData = new FormData();
    formData.append('file', file);
    formData.append('id', idPengaju);
    // ---------------------------
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
  berkasUpload = (dataPengaju) => {
    if (dataPengaju) {
      const berkasPengajuan = this.state.itemsUpload.map((data, i) =>{
        if (data.jenis.toLowerCase() === 'surat bebas narkoba') {
          if (dataPengaju.jenis.toLowerCase() === 'driver' || dataPengaju.jenis.toLowerCase() === 'amt 1' || dataPengaju.jenis.toLowerCase() === 'amt 2') {
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
  componentDidMount() {
    // -----------------
    this.loadData()
    this.formUpload()
    this.viewOption()
    // -------------------
    this.timerID = setInterval(
      () => this.loadData(),
      5000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  render() {
    const { itemStruktur, itemsData, modalView, modalUpload, itemsUpload, listBerkasPengajuan, pendingMsg, pendingNofif, successMsg, successNotif, isLoading } = this.state;
    let dataUser = JSON.parse(localStorage.getItem('detail_login'));

    let optionStuktur = itemStruktur.map((data) =>{
      //  && data.nama_jenis.toLowerCase() !== 'vendor'
      if (data.nama_jenis.toLowerCase() !== 'pegawai pertamina' && data.nama_jenis.toLowerCase() !== 'pimpinan pertamina') {
        return (
          <option key={data.id} value={data.id}>{data.nama_jenis}</option>
        )
      }
    })
    function notifProses () {
      if (pendingNofif) {
        return (
          <>
          <div className="alert alert-warning p-1 pl-2"><span className="font-weight-bold">INFORMASI !</span> : Pengajuan Anda Sedang Pending, pengajuan akan otomatis setiap 5 detik jika masih pending. </div>
          <div className="alert alert-danger  p-1 pl-2"><span className="font-weight-bold">INFORMASI !</span> : <i>System Message</i> {pendingMsg} </div>
          </>
        )
      } else if (successNotif) {
        return (
          <>
          <div className="alert alert-success  p-1 pl-2"><span className="font-weight-bold">INFORMASI !</span><i>Pengajuan Berhasil : </i> {successMsg} </div>
          </>
        )
      }
    }

    return (
      <>
        <CRow>
          <CCol lg={12}>
            {notifProses()}
          </CCol>
          <CCol lg={4}>
            <CCard>
              <CCardHeader>
                <strong>Buat Pengajuan</strong>
              </CCardHeader>
              <CCardBody>
                <CForm onSubmit={this.handleSubmit}>
                    <CFormGroup row className="my-0">
                      <CCol xs="6">
                        <CFormGroup>
                          <CLabel htmlFor="pemilik_kendaraan">Jenis Pekerjaan</CLabel>
                          <CSelect name="jenisId" defaultValue={(this.state.data_edit ? this.state.data_edit.jenisId : "")}>
                            {optionStuktur}
                          </CSelect>
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
                    </CFormGroup>
                    <CFormGroup>
                      <CLabel htmlFor="nik">NIK</CLabel>
                      <CInput id="nik" type="text" name="nik" placeholder="Nomor Induk Kependudukan" defaultValue={(this.state.data_edit ? this.state.data_edit.nik : "")} />
                    </CFormGroup>
                    <CFormGroup row className="my-0">
                      <CCol xs="6">
                        <CFormGroup>
                          <CLabel htmlFor="nama_lengkap">Nama Lengkap</CLabel>
                          <CInput id="nama_lengkap" type="text" name="nama_lengkap" placeholder="Nama Lengkap" defaultValue={(this.state.data_edit ? this.state.data_edit.nama_lengkap : "")} />
                        </CFormGroup>
                      </CCol>
                      <CCol xs="6" className="pl-0">
                        <CFormGroup>
                          <CLabel htmlFor="no_telp">Jabatan</CLabel>
                          <CInput id="no_telp" type="text" name="no_telp" placeholder="Jabatan" defaultValue={(this.state.data_edit ? this.state.data_edit.no_telp : "")} />
                        </CFormGroup>
                      </CCol>
                      {/* <CCol xs="12" className="pl-0">
                        <CFormGroup>
                          <CLabel htmlFor="tgl_lahir">Tgl Lahir</CLabel>
                          <CInput id="tgl_lahir" type="date" name="tgl_lahir" defaultValue={(this.state.data_edit ? this.state.data_edit.tgl_lahir : "")} />
                        </CFormGroup>
                      </CCol> */}
                      <CCol xs="12" >
                        <CFormGroup>
                          <CLabel htmlFor="alamat">Alamat Domisili</CLabel>
                          <CTextarea id="alamat" name="alamat" defaultValue={(this.state.data_edit ? this.state.data_edit.alamat : "")}></CTextarea>
                        </CFormGroup>
                      </CCol>
                    </CFormGroup>
                    <CButton className="btn-block" color="primary" type="submit">Ajukan Data</CButton>{' '}
                </CForm>
              </CCardBody>
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
                          { isLoading ?
                              "Data Pengajuan Belum Ada"
                            :
                            <table width="100%" className="table table-striped table-bordered table-hover table-sm" ref={el => this.el = el}>
                              <thead>
                                <tr>
                                  <th>Nama Lengkap</th>
                                  <th>Pekerjaan</th>
                                  <th>Tanggal</th>
                                  <th>Status</th>
                                  <th>Aksi</th>
                                </tr>
                              </thead>
                              { this.TBody(itemsData, dataUser) }
                            </table>
                          }
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
          onClose={() => this.setState({ 
            modalUpload: false, 
          })}
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
            >Kirim Pengajuan</CButton>
          </CModalFooter>
        </CModal>
        {/* --------- Modal ---------- */}
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
                <CInput id="nik2" type="text" name="nik" placeholder="Nomor Induk Kependudukan" disabled />
              </CFormGroup>
              <CFormGroup row className="my-0">
                <CCol xs="6">
                  <CFormGroup>
                    <CLabel htmlFor="nama_lengkap">Nama Lengkap</CLabel>
                    <CInput id="nama_lengkap2" type="text" name="nama_lengkap" placeholder="Nama Lengkap" disabled />
                  </CFormGroup>
                </CCol>
                <CCol xs="6" className="pl-0">
                  <CFormGroup>
                    <CLabel htmlFor="no_telp">Nomor Telp</CLabel>
                    <CInput id="no_telp2" type="text" name="no_telp" placeholder="Nomor Telp" disabled />
                  </CFormGroup>
                </CCol>
                <CCol xs="12" >
                  <CFormGroup>
                    <CLabel htmlFor="tgl_lahir">Tanggal Lahir</CLabel>
                    <CInput id="tgl_lahir2" type="text" name="tgl_lahir" disabled />
                    {/* <CTextarea id="alamat2" name="alamat" disabled></CTextarea> */}
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
                    {listBerkasPengajuan.map((data, i) =>
                      {
                        let actDownload;
                        if (data.link_file != null ){
                          actDownload = (
                            <a href={data.link_file} target="_blank" rel="noopener noreferrer">Download File</a>
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
                onClick={() => this.setState({ modalView: false })}
              >Close View</CButton>
            </CModalFooter>
          </CForm>
        </CModal>
      </>
    );
  }

}

export default DashboardVendor
