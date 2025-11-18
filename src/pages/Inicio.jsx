import React from "react";
import './Pages.css';

export function Inicio() {
  document.title = "Início";

  return (
    <div className="inicioContainer">
      <header className="headerNav">
        <nav>
          <ul>
            <li><a href="/inicio" className="active">Início</a></li>
            <li><a href="/contato">Contato</a></li>
            <li><a href="/login">Login</a></li>
            <li><a href="/cadastro">Cadastro</a></li>
          </ul>
        </nav>
      </header>
      <div className="inicio-hero">
      <h1 style={{ fontFamily: "'Brush Script MT', cursive", fontSize: 48, margin: 0, color: "#f9d465" }}>Hello People</h1>
      <p style={{ margin: 0, color: "#d9d9d9", maxWidth: 720 }}>
        Moda casual e streetwear com atitude. Peças selecionadas, qualidade e conforto para o seu dia a dia.
      </p>
      </div>
  
    </div>
  );
}
