import React  from "react";

export function Home() {
  document.title = "Home";
  return (
    <div className="Home">
      <h1 className="">Sistema de Gestão MiguelTiera</h1>
      <p>Bem-vindo ao sistema de gestão!</p>
      <p>Selecione uma opção no menu para começar.</p>
    </div>
  );
}