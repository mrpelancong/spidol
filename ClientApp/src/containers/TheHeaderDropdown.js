import React from 'react'
import { Link, Redirect, Switch } from 'react-router-dom'
import {
  CBadge,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CImg
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

class TheHeaderDropdown extends React.Component {
  constructor(props) {
    super(props);
    this.state ={
      isLogout: false,
    }
  }

  logOut = (event) => {
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
        this.setState({isLogout : true});
      }
    })

    Swal.fire({
      title: 'Apakah Anda yakin keluar?',
      text: "Pastikan data anda telah tersimpan. Jaga Password anda.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Keluar Aplikasi',
    }).then((result) => {
      if (result.value) {
        Toast.fire({
          icon: 'info',
          title: 'Menghapus Data Login'
        })
      }
    })


  }
  render(){
    if (this.state.isLogout) {
      localStorage.clear();
      console.log('LOGOUT>> CLEAR STORAGE');
      console.log(localStorage);

      return(
        <Switch>
          <Redirect to="/login" />
        </Switch>
      )
    } else {
      return (
        <CDropdown
          inNav
          className="c-header-nav-items mx-2"
          direction="down"
        >
          <CDropdownToggle className="c-header-nav-link" caret={false}>
            <div className="c-avatar">
              <CImg
                src={'avatars/user-ava.webp'}
                className="c-avatar-img"
                alt="admin@bootstrapmaster.com"
              />
            </div>
          </CDropdownToggle>
          <CDropdownMenu className="pt-0" placement="bottom-end">
            <CDropdownItem
              header
              tag="div"
              color="light"
              className="text-center"
            >
              <strong>Settings</strong>
            </CDropdownItem>
            <CDropdownItem>
              <CIcon name="cil-user" className="mfe-2" />Profile
            </CDropdownItem>
            <CDropdownItem divider />
            <CDropdownItem onClick={this.logOut}>
              <CIcon name="cil-lock-locked" className="mfe-2"/>
              Keluar Aplikasi
            </CDropdownItem>
          </CDropdownMenu>
        </CDropdown>
      )
    }
  }
}

export default TheHeaderDropdown
