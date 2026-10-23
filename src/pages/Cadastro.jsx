import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { apiFetch } from '../utils/apiFetch';
import './Cadastro.css';

export function Cadastro() {
  document.title = 'Cadastro — Hello People';
  const [showPwd, setShowPwd] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());

    const payload = {
      usuario: data.usuario,
      senha: data.senha,
      cpf: data.cpf,
      nome: data.nome,
      endereco: data.endereco,
      telefone: data.telefone,
      dataNascimento: data.dataNascimento ? `${data.dataNascimento}T00:00:00` : null,
      nivelAcesso: 'CLIENTE',
    };

    try {
      const res = await apiFetch('/api/cliente', { method: 'POST', body: JSON.stringify(payload) });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || 'Erro no cadastro. Tente novamente.');
      }
      alert('Cadastro realizado com sucesso!');
      window.location.href = '/login';
    } catch (err) {
      alert(err.message || 'Erro no cadastro. Tente novamente.');
    }
  }

  return (
    <div className="cadastro-page">
      {/* Header */}
      <div className="cadastro-header-bar">
        <div className="cadastro-header-inner">
          <Link to="/inicio" className="cadastro-brand">Hello People</Link>
          <p className="cadastro-header-login">
            Já tem conta? <Link to="/login">Entrar</Link>
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="cadastro-body">
        <h1 className="cadastro-title">Criar sua conta</h1>
        <p className="cadastro-sub">Preencha seus dados para começar a comprar na Hello People</p>

        <div className="cadastro-card">
          <form onSubmit={handleSubmit}>
            <div className="cadastro-grid">
              <div>
                <label className="hp-lb">Usuário *</label>
                <input className="hp-inp" name="usuario" placeholder="seu.usuario" required />
              </div>
              <div>
                <label className="hp-lb">Senha *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="hp-inp"
                    type={showPwd ? 'text' : 'password'}
                    name="senha"
                    placeholder="••••••••"
                    style={{ paddingRight: 44 }}
                    required
                  />
                  <button type="button" className="cadastro-pwd-toggle" onClick={() => setShowPwd(v => !v)}>
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="col-full">
                <label className="hp-lb">Nome completo *</label>
                <input className="hp-inp" name="nome" placeholder="Seu nome completo" required />
              </div>

              <div>
                <label className="hp-lb">CPF *</label>
                <input className="hp-inp" name="cpf" placeholder="000.000.000-00" required />
              </div>
              <div>
                <label className="hp-lb">Telefone</label>
                <input className="hp-inp" name="telefone" placeholder="(00) 00000-0000" />
              </div>

              <div className="col-full">
                <label className="hp-lb">E-mail *</label>
                <input className="hp-inp" type="email" name="email" placeholder="voce@email.com" required />
              </div>
              <div className="col-full">
                <label className="hp-lb">Endereço</label>
                <input className="hp-inp" name="endereco" placeholder="Rua, número, bairro, cidade" />
              </div>

              <div>
                <label className="hp-lb">Sexo</label>
                <select className="hp-inp" name="sexo">
                  <option value="">Selecione…</option>
                  <option>Feminino</option>
                  <option>Masculino</option>
                  <option>Prefiro não informar</option>
                </select>
              </div>
              <div>
                <label className="hp-lb">Data de nascimento</label>
                <input className="hp-inp" type="date" name="dataNascimento" />
              </div>
            </div>

            <div className="cadastro-actions">
              <Link to="/inicio" className="cadastro-btn--cancel">Cancelar</Link>
              <button type="submit" className="cadastro-btn--submit">Criar conta</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
