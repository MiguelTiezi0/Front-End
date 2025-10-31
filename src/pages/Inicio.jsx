import './Pages.css';
import React from "react";

import { useRequireAuth } from "../hooks/RequireAuth/useRequireAuth.jsx";

export function Inicio() {
  document.title = "Início";
  useRequireAuth("Cliente"); 


  return (
    <div className="inicioContainer">
        <header className="headerNav">
        <nav>
          <ul>
            <li>
              <a href="/inicio" className="active">Início</a>
            </li>
            <li>
              <a href="/contato">Contato</a>
            </li>
            <li>
              <a href="/login" >
                Login
              </a>
            </li>
            <li>
              <a href="/cadastro">Cadastro</a>
            </li>
          </ul>
        </nav>
      </header>
      <h1>Início</h1>
      <p>Bem-vindo à página inicial!</p>
      <p>Selecione uma opção acima para começar.</p>
    </div>
  );
}