import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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

export function EditarCliente() {
  useRequireAuth("Funcionario");
  document.title = "Editar Cliente";
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        const response = await fetch(`${linkCli}/${id}`);
        if (!response.ok) throw new Error("Erro ao buscar os dados do cliente");
        const data = await response.json();
        setCliente(data);
      } catch (error) {
        console.error(error);
        alert("Não foi possível carregar os dados do cliente.");
      }
    };
    fetchCliente();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCliente((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarCPF(cliente.cpf)) {
      alert("CPF inválido. Confira os números digitados.");
      return;
    }

    setSalvando(true);
    try {
      const response = await fetch(`${linkCli}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...cliente,
          limiteDeCredito: parseFloat(cliente.limiteDeCredito) || 0,
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message || "Erro ao atualizar o cliente.");
      }
      navigate("/Cliente/ListagemCliente");
    } catch (error) {
      alert(error.message || "Erro ao atualizar o cliente.");
    } finally {
      setSalvando(false);
    }
  };

  if (!cliente) {
    return <p className="pdv-empty">Carregando dados do cliente…</p>;
  }

  return (
    <div className="pdv-page">
      <div className="pdv-header">
        <div>
          <Link to="/Cliente/ListagemCliente" className="pdv-btn pdv-btn--ghost pdv-btn--sm" style={{ marginBottom: 10 }}>
            <ArrowLeft size={14} /> Voltar para clientes
          </Link>
          <h1 className="pdv-title">Editar cliente: {cliente.nome}</h1>
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
              value={cliente.nome || ""}
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
              value={cliente.cpf || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="hp-lb">Telefone</label>
            <input
              type="text"
              name="telefone"
              className="hp-inp"
              value={cliente.telefone || ""}
              onChange={handleChange}
            />
          </div>

          <div className="pdv-form-col-full">
            <label className="hp-lb">Endereço</label>
            <input
              type="text"
              name="endereco"
              className="hp-inp"
              value={cliente.endereco || ""}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="hp-lb">Data de nascimento</label>
            <input
              type="date"
              name="dataNascimento"
              className="hp-inp"
              value={cliente.dataNascimento ? cliente.dataNascimento.substring(0, 10) : ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="hp-lb">Limite de crédito</label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="limiteDeCredito"
              className="hp-inp"
              value={cliente.limiteDeCredito ?? ""}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="hp-lb">Usuário de acesso *</label>
            <input
              type="text"
              name="usuario"
              required
              className="hp-inp"
              value={cliente.usuario || ""}
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
              value={cliente.senha || ""}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="pdv-form-actions">
          <Link to="/Cliente/ListagemCliente" className="pdv-btn pdv-btn--ghost">Cancelar</Link>
          <button type="submit" className="pdv-btn pdv-btn--primary" disabled={salvando}>
            {salvando ? "Salvando…" : "Salvar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
