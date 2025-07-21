import React from 'react';
import {NavCaixa} from '../NavCaixa/NavCaixa.jsx';
import './HeaderCaixa.css';
import LogoHelloPeople from '../../../assets/images/LogoHelloPeople.svg';
export const HeaderCaixa = () => {
  return (
    <header className="Header">
        <div className="divLogo">
            <img src={LogoHelloPeople} alt="logo" className='Header-logo' />
        </div>
        <NavCaixa />
    </header>   
  );
}
