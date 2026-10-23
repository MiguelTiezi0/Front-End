import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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

export function EditarFuncionario() {
  useRequireAuth("Funcionario");
  document.title = "Editar Funcionário";
  const { id } = useParams();
  const navigate = useNavigate();
  const [funcionario, setFuncionario] = useState(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const fetchFuncionario = async () => {
      try {
        const response = await fetch(`${linkFun}/${id}`);
        if (!response.ok) throw new Error("Erro ao buscar os dados do funcionário");
        const data = await response.json();
        setFuncionario(data);
      } catch (error) {
        console.error(error);
        alert("Não foi possível carregar os dados do funcionário.");
      }
    };
    fetchFuncionario();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "telefone") {
      setFuncionario((prev) => ({ ...prev, telefone: formatarTelefone(value) }));
      return;
    }
    setFuncionario((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarCPF(funcionario.cpf)) {
      alert("CPF inválido. Confira os números digitados.");
      return;
    }

    setSalvando(true);
    try {
      const response = await fetch(`${linkFun}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...funcionario,
          salario: parseFloat(funcionario.salario) || 0,
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message || "Erro ao atualizar o funcionário.");
      }
      navigate("/Funcionario/ListagemFuncionario");
    } catch (error) {
      alert(error.message || "Erro ao atualizar o funcionário.");
    } finally {
      setSalvando(false);
    }
  };

  if (!funcionario) {
    return <p className="pdv-empty">Carregando dados do funcionário…</p>;
  }

  return (
    <div className="pdv-page">
      <div className="pdv-header">
        <div>
          <Link to="/Funcionario/ListagemFuncionario" className="pdv-btn pdv-btn--ghost pdv-btn--sm" style={{ marginBottom: 10 }}>
            <ArrowLeft size={14} /> Voltar para funcionários
          </Link>
          <h1 className="pdv-title">Editar funcionário: {funcionario.nome}</h1>
        </div>
      </div>

      <form className="pdv-form-card" onSubmit={handleSubmit}>
        <div className="pdv-form-grid">
          <div className="pdv-form-col-full">
            <label className="hp-lb">Nome completo *</label>
            <input
              type="text"
              name="nome"
              required
              className="hp-inp"
              value={funcionario.nome || ""}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="hp-lb">CPF *</label>
            <input
              type="text"
              name="cpf"
              required
              className="hp-inp"
              value={funcionario.cpf || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="hp-lb">Telefone</label>
            <input
              type="text"
              name="telefone"
              className="hp-inp"
              value={funcionario.telefone || ""}
              onChange={handleChange}
            />
          </div>

          <div className="pdv-form-col-full">
            <label className="hp-lb">Endereço</label>
            <input
              type="text"
              name="endereco"
              className="hp-inp"
              value={funcionario.endereco || ""}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="hp-lb">Data de contratação</label>
            <input
              type="date"
              name="dataContratacao"
              className="hp-inp"
              value={funcionario.dataContratacao ? funcionario.dataContratacao.substring(0, 10) : ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="hp-lb">Data de nascimento</label>
            <input
              type="date"
              name="dataNascimento"
              className="hp-inp"
              value={funcionario.dataNascimento ? funcionario.dataNascimento.substring(0, 10) : ""}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="hp-lb">Salário</label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="salario"
              className="hp-inp"
              value={funcionario.salario ?? ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="hp-lb">Nível de acesso *</label>
            <select
              name="nivelAcesso"
              className="hp-inp"
              value={funcionario.nivelAcesso || "FUNCIONARIO"}
              onChange={handleChange}
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
              name="usuario"
              required
              className="hp-inp"
              value={funcionario.usuario || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="hp-lb">Nova senha</label>
            <input
              type="password"
              name="senha"
              placeholder="Deixe em branco para manter a atual"
              className="hp-inp"
              value={funcionario.senha || ""}
              onChange={handleChange}
            />
          </div>

          <div className="pdv-form-col-full" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              id="funcionario-ativo-edit"
              name="ativo"
              checked={!!funcionario.ativo}
              onChange={handleChange}
            />
            <label htmlFor="funcionario-ativo-edit" className="hp-lb" style={{ margin: 0 }}>
              Funcionário ativo (pode fazer login)
            </label>
          </div>
        </div>

        <div className="pdv-form-actions">
          <Link to="/Funcionario/ListagemFuncionario" className="pdv-btn pdv-btn--ghost">Cancelar</Link>
          <button type="submit" className="pdv-btn pdv-btn--primary" disabled={salvando}>
            {salvando ? "Salvando…" : "Salvar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
