import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Pages.css";

import olhosAbertos from "../assets/icons/olhosAbertos.svg";
import olhosFechados from "../assets/icons/olhoFechado.svg";
import { useRequireAuth } from "../hooks/RequireAuth/useRequireAuth.jsx";

export function Login() {
  useRequireAuth("Cliente"); 
  document.title = "Login";
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const navigate = useNavigate();

  function toggleSenha() {
    setMostrarSenha(!mostrarSenha);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("http://localhost:7172/api/Auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        alert("Usuário ou senha inválidos!");
        return;
      }

      const result = await response.json();

      // Salva usuário logado no localStorage com lastActivity
      const now = new Date().getTime();
      const expiration = 10 * 1000; // 24h
      localStorage.setItem(
        "user",
        JSON.stringify({ ...result, expiration, lastActivity: now })
      );

      // Redireciona conforme o nível de acesso
      if (result.nivelAcesso === "Cliente") {
        navigate("/inicio");
      } else {
        navigate("/home");
      }
    } catch (error) {
      console.error("Erro ao tentar logar:", error);
      alert("Erro no servidor. Tente novamente mais tarde.");
    }
  }

  // --- Controle de inatividade ---
  useEffect(() => {
    function updateLastActivity() {
      const userData = localStorage.getItem("user");
      if (!userData) return;
      const user = JSON.parse(userData);
      user.lastActivity = new Date().getTime();
      localStorage.setItem("user", JSON.stringify(user));
    }

    // Captura eventos de atividade
    window.addEventListener("mousemove", updateLastActivity);
    window.addEventListener("keydown", updateLastActivity);
    window.addEventListener("scroll", updateLastActivity);

    // Verifica inatividade a cada minuto
    const interval = setInterval(() => {
      const userData = localStorage.getItem("user");
      if (!userData) return;

      const user = JSON.parse(userData);
      const now = new Date().getTime();
      const thirtyMinutes =  60 * 1000;

      if (now - user.lastActivity > thirtyMinutes) {
        localStorage.removeItem("user");
        alert("Você foi desconectado por inatividade.");
        navigate("/login");
      }
    }, 60 * 1000);

    // Cleanup ao desmontar componente
    return () => {
      window.removeEventListener("mousemove", updateLastActivity);
      window.removeEventListener("keydown", updateLastActivity);
      window.removeEventListener("scroll", updateLastActivity);
      clearInterval(interval);
    };
  }, [navigate]);

  return (
    <div className="Page">
      <header className="headerNav">
        <nav>
          <ul>
            <li>
              <a href="/inicio">Início</a>
            </li>
            <li>
              <a href="/contato">Contato</a>
            </li>
            <li>
              <a href="/login" className="active">
                Login
              </a>
            </li>
            <li>
              <a href="/cadastro">Cadastro</a>
            </li>
          </ul>
        </nav>
      </header>
      <main>
        <div className="loginContainer">
          <h1>Login</h1>
          <form className="loginForm" onSubmit={handleSubmit}>
            <input
              type="text"
              name="Usuario"
              placeholder="Usuário"
              className="loginInput"
              required
            />
            <div className="inputWrapper">
              <input
                type={mostrarSenha ? "text" : "password"}
                name="Senha"
                className="loginInput"
                placeholder="Digite sua senha"
                required
              />
              <button
                type="button"
                className="togglePassword"
                onClick={toggleSenha}
              >
                <img
                  src={mostrarSenha ? olhosAbertos : olhosFechados}
                  alt="Olho"
                />
              </button>
            </div>

            <div className="loginButtons">
              <button type="submit" className="loginBtn">
                Iniciar sessão
              </button>
              <a href="/cadastro" className="loginLink">
                Não possui uma conta ainda? Cadastre-se
              </a>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
