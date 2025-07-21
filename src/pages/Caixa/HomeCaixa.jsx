import React from "react";
import { HeaderCaixa } from '../../components/Caixa/HeaderCaixa/HeaderCaixa.jsx';

export function HomeCaixa() {
  document.title = "Home";
  return (
    <div className="Home">
      <HeaderCaixa />
      <h1 className="">Sistema de Gestão MiguelTiera</h1>
      <p>Bem-vindo ao sistema de gestão!</p>
      <p>Selecione uma opção no menu para começar.</p>

    </div>
    
  );
}
