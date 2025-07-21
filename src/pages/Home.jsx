import React from "react";
import "./Home.css";

import { HeaderGeral } from "../components/Geral/HeaderGeral/HeaderGeral.jsx";

export function Home() {
  document.title = "Home";

  return (
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