import React from "react";
import { HeaderGerenciamento } from '../../components/Gerenciamento/HeaderGerenciamento/HeaderGerenciamento.jsx';
      

export function HomeGerenciamento() {
  document.title = "Home";
  return (
    <div className="Home">
      <HeaderGerenciamento />
      <h1 className="">Sistema de Gestão MiguelTiera</h1>
      <p>Bem-vindo ao sistema de gestão!</p>
      <p>Selecione uma opção no menu para começar.</p>

    </div>
    
  );
}
