import React from 'react';
import {NavCaixa} from '../NavCaixa/NavCaixa.jsx';
import './HeaderCaixa.css';
import LogoHelloPeople from '../../../assets/images/LogoHelloPeople.svg';
import LogoHelloPeople2 from '../../../assets/images/Hello People.svg';

export const HeaderCaixa = () => {
  return (
    <header className="Header">
        <div className="divLogo">
            {/* <img src={LogoHelloPeople2} alt="logo" className='Header-logo' /> */}
            <h1>Hello People</h1>
        </div>
        <NavCaixa />
    </header>   
  );
}
