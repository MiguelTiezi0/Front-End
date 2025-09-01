import './Pages.css';
import React from "react";

export function Contato() {
  document.title = "Contato";

  return (
    <div className="contatoContainer">
        <header className="headerNav">
        <nav>
          <ul>
            <li>
              <a href="/inicio">Início</a>
            </li>
            <li>
              <a href="/contato" className="active">Contato</a>
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
      <h1>Contato</h1>
      <p>Bem-vindo à página de contato!</p>
      <p>Entre em contato conosco para mais informações.</p>
    </div>
  );
}