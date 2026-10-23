import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { linkFor } from "./linkFor";
import { useRequireAuth } from "../../../hooks/RequireAuth/useRequireAuth.jsx";

export function EditarFornecedor() {
  useRequireAuth("Funcionario");
  document.title = "Editar Fornecedor";
  const { id } = useParams();
  const navigate = useNavigate();
  const [fornecedor, setFornecedor] = useState(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const fetchFornecedor = async () => {
      try {
        const response = await fetch(`${linkFor}/${id}`);
        if (!response.ok) throw new Error("Erro ao buscar os dados do fornecedor");
        setFornecedor(await response.json());
      } catch (error) {
        console.error(error);
        alert("Não foi possível carregar os dados do fornecedor.");
      }
    };
    fetchFornecedor();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFornecedor((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      const response = await fetch(`${linkFor}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: fornecedor.nome,
          cnpj: fornecedor.cnpj,
          numTelefone: fornecedor.numTelefone,
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message || "Erro ao atualizar o fornecedor.");
      }
      navigate("/Fornecedor/ListagemFornecedor");
    } catch (error) {
      alert(error.message || "Erro ao atualizar o fornecedor.");
    } finally {
      setSalvando(false);
    }
  };

  if (!fornecedor) {
    return <p className="pdv-empty">Carregando dados do fornecedor…</p>;
  }

  return (
    <div className="pdv-page">
      <div className="pdv-header">
        <div>
          <Link to="/Fornecedor/ListagemFornecedor" className="pdv-btn pdv-btn--ghost pdv-btn--sm" style={{ marginBottom: 10 }}>
            <ArrowLeft size={14} /> Voltar para fornecedores
          </Link>
          <h1 className="pdv-title">Editar fornecedor: {fornecedor.nome}</h1>
        </div>
      </div>

      <form className="pdv-form-card" onSubmit={handleSubmit}>
        <div className="pdv-form-grid">
          <div className="pdv-form-col-full">
            <label className="hp-lb">Nome *</label>
            <input
              type="text"
              name="nome"
              required
              className="hp-inp"
              value={fornecedor.nome || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="hp-lb">CNPJ *</label>
            <input
              type="text"
              name="cnpj"
              required
              className="hp-inp"
              value={fornecedor.cnpj || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="hp-lb">Telefone</label>
            <input
              type="text"
              name="numTelefone"
              className="hp-inp"
              value={fornecedor.numTelefone || ""}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="pdv-form-actions">
          <Link to="/Fornecedor/ListagemFornecedor" className="pdv-btn pdv-btn--ghost">Cancelar</Link>
          <button type="submit" className="pdv-btn pdv-btn--primary" disabled={salvando}>
            {salvando ? "Salvando…" : "Salvar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
