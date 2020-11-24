import React from 'react'
import {Redirect, Switch } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CInput,
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import Swal from 'sweetalert2'

class Login extends React.Component{

  constructor(props) {
    super(props);
    this.state = {
      isLogin: false,
      username: '',
      password: '',
     };
  }
  
  mySubmitHandler = (event) => {
    event.preventDefault();

    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      onOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      },
      onClose: (toast) => {
        this.setState({isLogin : localStorage.isLogin});
      }
    })

    const API_URL ="api/auth/login";
    // ------------------
    fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers:{
        'Accept' : 'application/json',
        'Content-type' : 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body:new URLSearchParams( {
        username: this.state.username,
        password: (this.state.password === '' ? this.state.username : this.state.password),
      }),
    })
      .then(res => res.json())
      .then(
        (result) => {
          //console.log(result);
          if (result.status) {
            localStorage.setItem('token', result.data.token);
            localStorage.setItem('id_user', result.data.id);
            localStorage.setItem('detail_login', JSON.stringify(result.data));
            localStorage.setItem('isLogin', true);
            // -------------
            Toast.fire({
              icon: (result.status) ? 'success' : 'error',
              title: result.message
            })
          } else {
            
            Swal.fire({
              title: 'Enter your password',
              input: 'password',
              inputPlaceholder: 'Enter your password',
              inputAttributes: {
                autocapitalize: 'off'
              },
              showCancelButton: true,
              confirmButtonText: 'Login',
              showLoaderOnConfirm: true,
              preConfirm: (login) => {
                return fetch(API_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers:{
                      'Accept' : 'application/json',
                      'Content-type' : 'application/x-www-form-urlencoded;charset=UTF-8',
                    },
                    body:new URLSearchParams( {
                      username: this.state.username,
                      password: login,
                    }),
                  })
                  .then(response => {
                    if (!response.ok) {
                      throw new Error(response.statusText)
                    }
                    return response.json()
                  })
                  .catch(error => {
                    Swal.showValidationMessage(
                      `Request failed: ${error}`
                    )
                  })
              },
              allowOutsideClick: () => !Swal.isLoading()
            }).then((result) => {
              if (result.isConfirmed) { 
                //console.log('CEK LOGIN >>');
                //console.log(result);
                // -----------------------------------------------------------------
                let dataRes = result.value;
                if (dataRes.status) {
                  localStorage.setItem('token', dataRes.data.token);
                  localStorage.setItem('id_user', dataRes.data.id);
                  localStorage.setItem('detail_login', JSON.stringify(dataRes.data));
                  localStorage.setItem('isLogin', true);
                }
  
                Toast.fire({
                  icon: (dataRes.status) ? 'success' : 'error',
                  title: dataRes.message
                })
              }
            })
          }
          
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
  usernameHandler = (event) => {
    this.setState({username: event.target.value});
  }
  passwordHandler = (event) => {
    this.setState({password: event.target.value});
  }

  render (){
    let dataUser = JSON.parse(localStorage.getItem('detail_login'));
    let nextLogin;
    if (dataUser != null){
      if (dataUser.akses_name.toLowerCase() === 'admin'){
        nextLogin = <Redirect from="/login" to="/dashboard" />;
      } else if (dataUser.akses_name.toLowerCase() === 'vendor'){
        nextLogin = <Redirect from="/login" to="/dashboard_vendor" />;
      } else if (dataUser.akses_name.toLowerCase() === 'pegawai' || dataUser.akses_name.toLowerCase() === 'pegawai pertamina'){
        nextLogin = <Redirect from="/login" to="/dashboard_pegawai" />;
      } else {
        nextLogin = <Redirect from="/login" to="/dashboard_pimpinan" />;
      }
    }

    if (localStorage.isLogin) {
      return(
        <Switch>
          {nextLogin}
        </Switch>
      )
    } else {
      return (
          <div className="c-app c-default-layout flex-row align-items-center">
            <CContainer>
              <CRow className="justify-content-center">
                <CCol md="8">
                  <CCardGroup>
                    <CCard className="p-4">
                      <CCardBody>
                        <CForm  onSubmit={this.mySubmitHandler}>
                          <h1 className="font-weight-bold">SPIDOL</h1>
                          <p className="text-muted font-italic">
                            Surat Pengajuan idcard online
                          </p>
                          <CInputGroup className="mb-3">
                            <CInputGroupPrepend>
                              <CInputGroupText>
                                <CIcon name="cil-user" />
                              </CInputGroupText>
                            </CInputGroupPrepend>
                            <CInput type="text" name="username" placeholder="Username" onChange={this.usernameHandler} />
                          </CInputGroup>
                          {/* <CInputGroup className="mb-4">
                            <CInputGroupPrepend>
                              <CInputGroupText>
                                <CIcon name="cil-lock-locked" />
                              </CInputGroupText>
                            </CInputGroupPrepend>
                            <CInput type="password" name="password" placeholder="Password" onChange={this.passwordHandler} />
                          </CInputGroup> */}
                          <CRow>
                            <CCol xs="12">
                              <CButton color="primary" className="px-4 btn-block" type="submit"><CIcon name="cil-lock-locked" /> Lanjutkan </CButton>
                            </CCol>
                          </CRow>
                        </CForm >
                      </CCardBody>
                    </CCard>
                    <CCard className="text-white bg-primary py-5 d-md-down-none" style={{ width: '44%' }}>
                      <CCardBody className="text-center">
                        <div>
                          <h2>
                          </h2>
                          <p>
                          SPIDOL Apps Pertamina Regional SUMBAGSEL Aplikasi Pengajuan dan Pembaharuan IdCard Karyawan
                          </p>
                          <p className="text-muted text-ceneter">SPIDOL - © Copyright PT Pertamina(Persero) 2020. All Rights Reserved.</p>
                        </div>
                      </CCardBody>
                    </CCard>
                  </CCardGroup>
                </CCol>
              </CRow>
            </CContainer>
          </div>
      )
    }

  }
}

export default Login
