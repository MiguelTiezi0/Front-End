import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { linkFor } from "./linkFor";
import { useRequireAuth } from "../../../hooks/RequireAuth/useRequireAuth.jsx";

export function DetalhesFornecedor() {
  useRequireAuth("Funcionario");
  const { id } = useParams();
  const [fornecedor, setFornecedor] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFornecedorDetalhes = async () => {
      try {
        const response = await fetch(`${linkFor}/${id}`);
        if (!response.ok) throw new Error("Erro ao buscar detalhes do fornecedor");
        setFornecedor(await response.json());
      } catch (error) {
        console.error(error);
        alert("Não foi possível carregar os detalhes do fornecedor.");
      }
    };
    fetchFornecedorDetalhes();
  }, [id]);

  if (!fornecedor) {
    return <p className="pdv-empty">Carregando detalhes do fornecedor…</p>;
  }

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Tem certeza que deseja excluir este fornecedor?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${linkFor}/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Erro ao deletar o fornecedor");
      navigate("/Fornecedor/ListagemFornecedor");
    } catch (error) {
      console.error(error);
      alert("Não foi possível excluir este fornecedor.");
    }
  };

  return (
    <div className="pdv-page">
      <div className="pdv-header">
        <div>
          <Link to="/Fornecedor/ListagemFornecedor" className="pdv-btn pdv-btn--ghost pdv-btn--sm" style={{ marginBottom: 10 }}>
            <ArrowLeft size={14} /> Voltar para fornecedores
          </Link>
          <h1 className="pdv-title">{fornecedor.nome}</h1>
          <p className="pdv-subtitle">Fornecedor #{fornecedor.id}</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className="pdv-btn pdv-btn--danger" onClick={handleDelete}>
            <Trash2 size={16} /> Excluir
          </button>
          <button type="button" className="pdv-btn pdv-btn--primary" onClick={() => navigate(`/Fornecedor/EditarFornecedor/${id}`)}>
            <Pencil size={16} /> Editar
          </button>
        </div>
      </div>

      <div className="pdv-card" style={{ padding: 22 }}>
        <dl className="pdv-detail-grid">
          <div className="pdv-detail-item"><dt>CNPJ</dt><dd>{fornecedor.cnpj}</dd></div>
          <div className="pdv-detail-item"><dt>Telefone</dt><dd>{fornecedor.numTelefone || "—"}</dd></div>
        </dl>
      </div>
    </div>
  );
}
