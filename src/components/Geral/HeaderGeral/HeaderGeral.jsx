import React from 'react';
import {NavGeral} from '../NavGeral/NavGeral.jsx';
import './HeaderGeral.css';
import LogoHelloPeople from '../../../assets/images/LogoHelloPeople.svg';
export const HeaderGeral = () => {
  return (
    <header className="Header">
        <div className="divLogo">
            {/* <img src={LogoHelloPeople} alt="logo" className='Header-logo' /> */}
            <h1>Hello People</h1>
        </div>
        <NavGeral />
    </header>   
  );
}
