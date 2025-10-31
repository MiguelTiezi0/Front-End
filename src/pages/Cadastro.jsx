import React, { useState } from "react";
import "./Pages.css";

import olhosAbertos from "../assets/icons/olhosAbertos.svg";
import olhosFechados from "../assets/icons/olhoFechado.svg";
import { useRequireAuth } from "../hooks/RequireAuth/useRequireAuth.jsx";

export function Cadastro() {
  useRequireAuth("Cliente"); 
  document.title = "Cadastro";
  const [mostrarSenha, setMostrarSenha] = useState(false);

  function toggleSenha() {
    setMostrarSenha(!mostrarSenha);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    // Ajustar nomes para bater com o modelo do backend
    const payload = {
      Usuario: data.Usuario,
      Senha: data.Senha,
      CPF: data.CPF,
      Nome: data.NomeC,
      Endereço: data.Endereco,
      Telefone: data.NumeroTelefone,
      Email: data.Email,
      Sexo: data.Sexo,
      DataDeNascimento: data.DataNascimento,
      // Sempre cliente
      NivelAcesso: 3 
    };

    console.table(payload);

    try {
      const response = await fetch("http://localhost:7172/api/Cliente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Erro ao cadastrar usuário");
      }

      alert("Cadastro realizado com sucesso!");
      window.location.href = "/login";
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro no cadastro. Tente novamente.");
    }
  }

  return (
    <div className="Page">
      <header className="headerNav">
        <nav>
          <ul>
            <li><a href="/inicio">Início</a></li>
            <li><a href="/contato">Contato</a></li>
            <li><a href="/login">Login</a></li>
            <li><a href="/cadastro" className="active">Cadastro</a></li>
          </ul>
        </nav>
      </header>
      <main>
        <div className="cadastroContainer">
          <h1>Cadastro</h1>
          <form className="cadastroForm" onSubmit={handleSubmit}>
            <input type="text" name="Usuario" placeholder="Usuário" className="cadastroInput" />
            
            <div className="inputWrapperCadastro">
              <input
                type={mostrarSenha ? "text" : "password"}
                name="Senha"
                className="cadastroInput"
                placeholder="Digite sua senha"
              />
              <button
                type="button"
                className="togglePasswordCadastro"
                onClick={toggleSenha}
              >
                <img
                  src={mostrarSenha ? olhosAbertos : olhosFechados}
                  alt="Olho"
                />
              </button>
            </div>

            <input type="text" name="CPF" placeholder="CPF" className="cadastroInput" />
            <input type="text" name="NomeC" placeholder="Nome Completo" className="cadastroInput" />
            <input type="text" name="Endereco" placeholder="Endereço" className="cadastroInput" />
            <input type="text" name="NumeroTelefone" placeholder="Número de Telefone" className="cadastroInput" />
            <input type="email" name="Email" placeholder="E-mail" className="cadastroInput" />
            <input type="text" name="Sexo" placeholder="Sexo" className="cadastroInput" />
            <input type="date" name="DataNascimento" placeholder="Data de Nascimento" className="cadastroInput" />

            <div className="cadastroButtons">
              <button type="submit" className="cadastroBtn">
                Iniciar sessão
              </button>
              <a href="/login" className="cadastroLink">Já possui uma conta? Login</a>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
