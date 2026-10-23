import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { linkFun } from "./linkFun";
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

function formatarTelefone(valor) {
  return valor
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/g, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1");
}

export function CadastroFuncionario() {
  useRequireAuth("Funcionario");
  document.title = "Cadastro de Funcionários";
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [endereco, setEndereco] = useState("");
  const [dataContratacao, setDataContratacao] = useState("");
  const [telefone, setTelefone] = useState("");
  const [salario, setSalario] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [nivelAcesso, setNivelAcesso] = useState("FUNCIONARIO");
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarCPF(cpf)) {
      alert("CPF inválido. Confira os números digitados.");
      return;
    }

    const funcionario = {
      nome,
      cpf,
      endereco,
      dataContratacao: dataContratacao ? `${dataContratacao}T00:00:00` : null,
      telefone,
      salario: salario ? parseFloat(salario) : 0,
      dataNascimento: dataNascimento ? `${dataNascimento}T00:00:00` : null,
      ativo,
      usuario,
      senha,
      nivelAcesso,
    };

    setSalvando(true);
    try {
      const response = await fetch(linkFun, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(funcionario),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message || "Erro ao cadastrar o funcionário.");
      }
      navigate("/Funcionario/ListagemFuncionario");
    } catch (error) {
      alert(error.message || "Erro ao cadastrar o funcionário.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="pdv-page">
      <div className="pdv-header">
        <div>
          <h1 className="pdv-title">Novo funcionário</h1>
          <p className="pdv-subtitle">Preencha os dados para cadastrar um membro da equipe.</p>
        </div>
      </div>

      <form className="pdv-form-card" onSubmit={handleSubmit}>
        <div className="pdv-form-grid">
          <div className="pdv-form-col-full">
            <label className="hp-lb">Nome completo *</label>
            <input
              type="text"
              className="hp-inp"
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
              maxLength={15}
              value={telefone}
              onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
            />
          </div>

          <div className="pdv-form-col-full">
            <label className="hp-lb">Endereço</label>
            <input
              type="text"
              className="hp-inp"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
            />
          </div>

          <div>
            <label className="hp-lb">Data de contratação</label>
            <input
              type="date"
              className="hp-inp"
              value={dataContratacao}
              onChange={(e) => setDataContratacao(e.target.value)}
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
            <label className="hp-lb">Salário</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="hp-inp"
              placeholder="0,00"
              value={salario}
              onChange={(e) => setSalario(e.target.value)}
            />
          </div>
          <div>
            <label className="hp-lb">Nível de acesso *</label>
            <select
              className="hp-inp"
              value={nivelAcesso}
              onChange={(e) => setNivelAcesso(e.target.value)}
            >
              <option value="FUNCIONARIO">Funcionário</option>
              <option value="GERENTE">Gerente</option>
              <option value="ADMINISTRADOR">Administrador</option>
            </select>
          </div>

          <div>
            <label className="hp-lb">Usuário de acesso *</label>
            <input
              type="text"
              className="hp-inp"
              required
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
            />
          </div>
          <div>
            <label className="hp-lb">Senha *</label>
            <input
              type="password"
              className="hp-inp"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          <div className="pdv-form-col-full" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              id="funcionario-ativo"
              checked={ativo}
              onChange={(e) => setAtivo(e.target.checked)}
            />
            <label htmlFor="funcionario-ativo" className="hp-lb" style={{ margin: 0 }}>
              Funcionário ativo (pode fazer login)
            </label>
          </div>
        </div>

        <div className="pdv-form-actions">
          <Link to="/Funcionario/ListagemFuncionario" className="pdv-btn pdv-btn--ghost">Cancelar</Link>
          <button type="submit" className="pdv-btn pdv-btn--primary" disabled={salvando}>
            {salvando ? "Salvando…" : "Salvar funcionário"}
          </button>
        </div>
      </form>
    </div>
  );
}
