import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, ArrowLeft } from 'lucide-react';
import { API_BASE } from '../utils/apiFetch';
import './Login.css';

function toTitleCase(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function Login() {
  document.title = 'Login — Hello People';
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        alert(body?.message || 'Usuário ou senha inválidos!');
        console.log(data)
        return;
      }

      const result = await res.json();
      const nivelAcesso = toTitleCase(result.nivelAcesso || result.NivelAcesso);
      const now = new Date().getTime();

      localStorage.setItem('user', JSON.stringify({
        ...result,
        nivelAcesso,
        token: result.token || result.Token,
        expiration: 8 * 60 * 60 * 1000,
        lastActivity: now,
      }));

      navigate(nivelAcesso === 'Cliente' ? '/inicio' : '/home');
    } catch {
      alert('Erro no servidor. Tente novamente mais tarde.');
    }
  }

  function handleGoogle() {
    window.location.href = `${API_BASE}/oauth2/authorization/google`;
  }

  return (
    <div className="login-page">
      {/* Left panel */}
      <div className="login-left">
        <span className="login-brand">Hello People</span>
        <div className="login-left-body">
          <h1 className="login-left-title">Bem-vindo<br />de volta.</h1>
          <p className="login-left-sub">
            Acesse o painel da loja para gerenciar produtos, vendas e o caixa em um só lugar.
          </p>
        </div>
        <div className="login-left-badge">
          <ShieldCheck size={16} />
          Ambiente seguro · acesso restrito
        </div>
      </div>

      {/* Right panel */}
      <div className="login-right">
        <div className="login-card">
          <Link to="/inicio" className="login-back">
            <ArrowLeft size={16} /> Voltar ao início
          </Link>
          <h2 className="login-card-title">Iniciar sessão</h2>
          <p className="login-card-sub">Entre com seu usuário e senha</p>

          <form onSubmit={handleSubmit}>
            <label className="hp-lb">Usuário</label>
            <input className="hp-inp" name="usuario" placeholder="seu.usuario" style={{ marginBottom: 18 }} required />

            <label className="hp-lb">Senha</label>
            <div className="login-pwd-wrap">
              <input
                className="hp-inp"
                type={showPwd ? 'text' : 'password'}
                name="senha"
                placeholder="••••••••"
                style={{ paddingRight: 44 }}
                required
              />
              <button type="button" className="login-pwd-toggle" onClick={() => setShowPwd(v => !v)}>
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="login-forgot">
              <span>Esqueci a senha</span>
            </div>

            <button type="submit" className="login-btn--primary">Iniciar sessão</button>
          </form>

          <div className="login-divider"><span>ou</span></div>

          <button type="button" className="login-btn--google" onClick={handleGoogle}>
            <span className="google-g">G</span> Continuar com Google
          </button>

          <p className="login-signup">
            Não tem conta?{' '}
            <Link to="/cadastro">Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
