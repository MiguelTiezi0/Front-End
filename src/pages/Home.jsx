import React, { useEffect } from "react";

import "./Pages.css";

import { HeaderGeral } from "../components/Geral/HeaderGeral/HeaderGeral.jsx";
import { useRequireAuth } from "../hooks/RequireAuth/useRequireAuth.jsx";


export function Home() {
  document.title = "Home";

    useRequireAuth("Funcionario"); 
    
  return(

    <div className="homeContainer">
      <HeaderGeral />
      <div className="homeContent">
        <h1>Sistema de Gestão MiguelTiera</h1>
        <p>Bem-vindo ao sistema de gestão!</p>
        <p>Selecione uma opção acima para começar.</p>
      </div>
    </div>
  );
}
