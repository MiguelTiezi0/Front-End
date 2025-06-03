import React from 'react';
import {Nav} from '../Nav/Nav.jsx';
import './Header.css';
import LogoHelloPeople from '../../assets/images/LogoHelloPeople.svg';
export const Header = () => {
  return (
    <header className="Header">
        <div className="divLogo">
            <img src={LogoHelloPeople} alt="logo" className='Header-logo' />
        </div>
        <Nav />
    </header>   
  );
}
