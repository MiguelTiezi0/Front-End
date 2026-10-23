import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { linkCat } from "./linkCat";
import { useRequireAuth } from "../../../hooks/RequireAuth/useRequireAuth.jsx";

export function CadastroCategoria() {
  useRequireAuth("Funcionario");
  document.title = "Cadastro de Categorias";
  const location = useLocation();
  const categoriaClonada = location.state?.categoria || null;
  const navigate = useNavigate();

  const [descricao, setDescricao] = useState(categoriaClonada?.descricao || "");
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      const response = await fetch(linkCat, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descricao }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message || "Erro ao cadastrar a categoria.");
      }
      navigate("/Categoria/ListagemCategoria");
    } catch (error) {
      alert(error.message || "Erro ao cadastrar a categoria.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="pdv-page">
      <div className="pdv-header">
        <div>
          <h1 className="pdv-title">Nova categoria</h1>
          <p className="pdv-subtitle">Categorias ajudam a organizar o catálogo de produtos.</p>
        </div>
      </div>

      <form className="pdv-form-card" onSubmit={handleSubmit}>
        <div className="pdv-form-grid">
          <div className="pdv-form-col-full">
            <label className="hp-lb">Descrição *</label>
            <input
              type="text"
              className="hp-inp"
              placeholder="Ex: Camisetas, Calçados, Acessórios…"
              required
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>
        </div>

        <div className="pdv-form-actions">
          <Link to="/Categoria/ListagemCategoria" className="pdv-btn pdv-btn--ghost">Cancelar</Link>
          <button type="submit" className="pdv-btn pdv-btn--primary" disabled={salvando}>
            {salvando ? "Salvando…" : "Salvar categoria"}
          </button>
        </div>
      </form>
    </div>
  );
}
