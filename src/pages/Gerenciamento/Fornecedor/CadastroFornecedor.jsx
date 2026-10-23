import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { linkFor } from "./linkFor";
import { useRequireAuth } from "../../../hooks/RequireAuth/useRequireAuth.jsx";

export function CadastroFornecedor() {
  useRequireAuth("Funcionario");
  document.title = "Cadastro de Fornecedor";
  const location = useLocation();
  const fornecedorClonado = location.state?.fornecedor || null;
  const navigate = useNavigate();

  const [nome, setNome] = useState(fornecedorClonado?.nome || "");
  const [cnpj, setCnpj] = useState(fornecedorClonado?.cnpj || "");
  const [numTelefone, setNumTelefone] = useState(fornecedorClonado?.numTelefone || "");
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      const response = await fetch(linkFor, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, cnpj, numTelefone }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message || "Erro ao cadastrar o fornecedor.");
      }
      navigate("/Fornecedor/ListagemFornecedor");
    } catch (error) {
      alert(error.message || "Falha ao salvar o fornecedor.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="pdv-page">
      <div className="pdv-header">
        <div>
          <h1 className="pdv-title">Novo fornecedor</h1>
          <p className="pdv-subtitle">Cadastre um parceiro ou fabricante para vincular aos produtos.</p>
        </div>
      </div>

      <form className="pdv-form-card" onSubmit={handleSubmit}>
        <div className="pdv-form-grid">
          <div className="pdv-form-col-full">
            <label className="hp-lb">Nome *</label>
            <input
              type="text"
              className="hp-inp"
              placeholder="Nome do fornecedor"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          <div>
            <label className="hp-lb">CNPJ *</label>
            <input
              type="text"
              className="hp-inp"
              placeholder="00.000.000/0000-00"
              required
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
            />
          </div>
          <div>
            <label className="hp-lb">Telefone</label>
            <input
              type="text"
              className="hp-inp"
              placeholder="(00) 00000-0000"
              value={numTelefone}
              onChange={(e) => setNumTelefone(e.target.value)}
            />
          </div>
        </div>

        <div className="pdv-form-actions">
          <Link to="/Fornecedor/ListagemFornecedor" className="pdv-btn pdv-btn--ghost">Cancelar</Link>
          <button type="submit" className="pdv-btn pdv-btn--primary" disabled={salvando}>
            {salvando ? "Salvando…" : "Salvar fornecedor"}
          </button>
        </div>
      </form>
    </div>
  );
}
