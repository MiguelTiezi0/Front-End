import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { linkCat } from "./linkCat";
import { useRequireAuth } from "../../../hooks/RequireAuth/useRequireAuth.jsx";

export function EditarCategoria() {
  useRequireAuth("Funcionario");
  document.title = "Editar Categoria";
  const { id } = useParams();
  const navigate = useNavigate();
  const [categoria, setCategoria] = useState(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const fetchCategoria = async () => {
      try {
        const response = await fetch(`${linkCat}/${id}`);
        if (!response.ok) throw new Error("Erro ao buscar os dados da categoria");
        setCategoria(await response.json());
      } catch (error) {
        console.error(error);
        alert("Não foi possível carregar os dados da categoria.");
      }
    };
    fetchCategoria();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      const response = await fetch(`${linkCat}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descricao: categoria.descricao }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message || "Erro ao atualizar a categoria.");
      }
      navigate("/Categoria/ListagemCategoria");
    } catch (error) {
      alert(error.message || "Erro ao atualizar a categoria.");
    } finally {
      setSalvando(false);
    }
  };

  if (!categoria) {
    return <p className="pdv-empty">Carregando dados da categoria…</p>;
  }

  return (
    <div className="pdv-page">
      <div className="pdv-header">
        <div>
          <Link to="/Categoria/ListagemCategoria" className="pdv-btn pdv-btn--ghost pdv-btn--sm" style={{ marginBottom: 10 }}>
            <ArrowLeft size={14} /> Voltar para categorias
          </Link>
          <h1 className="pdv-title">Editar categoria</h1>
        </div>
      </div>

      <form className="pdv-form-card" onSubmit={handleSubmit}>
        <div className="pdv-form-grid">
          <div className="pdv-form-col-full">
            <label className="hp-lb">Descrição *</label>
            <input
              type="text"
              required
              className="hp-inp"
              value={categoria.descricao || ""}
              onChange={(e) => setCategoria({ ...categoria, descricao: e.target.value })}
            />
          </div>
        </div>

        <div className="pdv-form-actions">
          <Link to="/Categoria/ListagemCategoria" className="pdv-btn pdv-btn--ghost">Cancelar</Link>
          <button type="submit" className="pdv-btn pdv-btn--primary" disabled={salvando}>
            {salvando ? "Salvando…" : "Salvar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
