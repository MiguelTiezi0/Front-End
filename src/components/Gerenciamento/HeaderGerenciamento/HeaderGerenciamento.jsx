import React from 'react';
import {NavGerenciamento} from '../NavGerenciamento/NavGerenciamento.jsx';
import './HeaderGerenciamento.css';
import LogoHelloPeople from '../../../assets/images/LogoHelloPeople.svg';
export const HeaderGerenciamento = () => {
  return (
    <header className="Header">
        <div className="divLogo">
            {/* <img src={LogoHelloPeople} alt="logo" className='Header-logo' /> */}
            <h1>Hello People</h1>
        </div>
        <NavGerenciamento />
    </header>   
  );
}
