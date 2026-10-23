import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { linkCli } from "./linkCli";
import { useRequireAuth } from "../../../hooks/RequireAuth/useRequireAuth.jsx";

function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, "");
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  const calcularDV = (cpfArray, pesoInicial) => {
    let soma = cpfArray.reduce((acc, num, idx) => acc + num * (pesoInicial - idx), 0);
    let resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  const numeros = cpf.split("").map(Number);
  const dv1 = calcularDV(numeros.slice(0, 9), 10);
  const dv2 = calcularDV(numeros.slice(0, 10), 11);
  return dv1 === numeros[9] && dv2 === numeros[10];
}

function formatTelefoneInput(value) {
  return value
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/g, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1");
}

export function CadastroCliente() {
  useRequireAuth("Funcionario");
  document.title = "Cadastro de Clientes";
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [endereco, setEndereco] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [limiteDeCredito, setLimiteDeCredito] = useState("");
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarCPF(cpf)) {
      alert("CPF inválido. Confira os números digitados.");
      return;
    }

    const cliente = {
      nome,
      cpf,
      endereco,
      telefone,
      dataNascimento: dataNascimento ? `${dataNascimento}T00:00:00` : null,
      limiteDeCredito: limiteDeCredito ? parseFloat(limiteDeCredito) : 0,
      usuario,
      senha,
      nivelAcesso: "CLIENTE",
    };

    setSalvando(true);
    try {
      const response = await fetch(linkCli, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cliente),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message || "Erro ao cadastrar o cliente.");
      }
      navigate("/Cliente/ListagemCliente");
    } catch (error) {
      alert(error.message || "Erro ao cadastrar o cliente.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="pdv-page">
      <div className="pdv-header">
        <div>
          <h1 className="pdv-title">Novo cliente</h1>
          <p className="pdv-subtitle">Preencha os dados para cadastrar um cliente na loja.</p>
        </div>
      </div>

      <form className="pdv-form-card" onSubmit={handleSubmit}>
        <div className="pdv-form-grid">
          <div className="pdv-form-col-full">
            <label className="hp-lb">Nome completo *</label>
            <input
              type="text"
              className="hp-inp"
              placeholder="Nome do cliente"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div>
            <label className="hp-lb">CPF *</label>
            <input
              type="text"
              className="hp-inp"
              placeholder="000.000.000-00"
              required
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
            />
          </div>
          <div>
            <label className="hp-lb">Telefone</label>
            <input
              type="text"
              className="hp-inp"
              placeholder="(00) 00000-0000"
              value={telefone}
              maxLength={15}
              onChange={(e) => setTelefone(formatTelefoneInput(e.target.value))}
            />
          </div>

          <div className="pdv-form-col-full">
            <label className="hp-lb">Endereço</label>
            <input
              type="text"
              className="hp-inp"
              placeholder="Rua, número, bairro, cidade"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
            />
          </div>

          <div>
            <label className="hp-lb">Data de nascimento</label>
            <input
              type="date"
              className="hp-inp"
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
            />
          </div>
          <div>
            <label className="hp-lb">Limite de crédito</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="hp-inp"
              placeholder="0,00"
              value={limiteDeCredito}
              onChange={(e) => setLimiteDeCredito(e.target.value)}
            />
          </div>

          <div>
            <label className="hp-lb">Usuário de acesso *</label>
            <input
              type="text"
              className="hp-inp"
              placeholder="usuario.cliente"
              required
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
            />
            <p className="pdv-hint">O cliente vai usar isso para entrar no site.</p>
          </div>
          <div>
            <label className="hp-lb">Senha *</label>
            <input
              type="password"
              className="hp-inp"
              placeholder="••••••••"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>
        </div>

        <div className="pdv-form-actions">
          <Link to="/Cliente/ListagemCliente" className="pdv-btn pdv-btn--ghost">Cancelar</Link>
          <button type="submit" className="pdv-btn pdv-btn--primary" disabled={salvando}>
            {salvando ? "Salvando…" : "Salvar cliente"}
          </button>
        </div>
      </form>
    </div>
  );
}
