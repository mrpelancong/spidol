import React from 'react'
import {
  TheContent,
  TheSidebar,
  TheFooter,
  TheHeader
} from './index'

import {admin, Pegawai, vendor, Pimpinan} from './_nav'
import {Redirect, Switch} from "react-router-dom";


const backLogin = () => {
  localStorage.clear();
  return(
    <Switch>
      <Redirect to="/login" />
    </Switch>
  )
}

//console.log('Data Akses > ');
// console.log(dataUser);


const TheLayout = () => {
  let dataUser = JSON.parse(localStorage.getItem('detail_login'));
  let navigation;
  
  if (dataUser !=null){
    if (dataUser.akses_name.toLowerCase() == 'admin'){
      navigation = admin.items;
    } else if (dataUser.akses_name.toLowerCase() == 'vendor'){
      navigation = vendor.items;
    } else if (dataUser.akses_name.toLowerCase() == 'pegawai' || dataUser.akses_name.toLowerCase() == 'pegawai pertamina'){
      navigation = Pegawai.items;
    } else {
      navigation = Pimpinan.items;
    }
  } else {
    navigation = [];
    backLogin();
  }
  // //console.log('Data APP >> ');
  return (
    <div className="c-app c-default-layout">
      <TheSidebar nav={navigation} />
      <div className="c-wrapper">
        <TheHeader/>
        <div className="c-body">
          <TheContent/>
        </div>
        <TheFooter/>
      </div>
    </div>
  )
}

export default TheLayout
