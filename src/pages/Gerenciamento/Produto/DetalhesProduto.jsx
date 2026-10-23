import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Pencil, Copy, Trash2 } from "lucide-react";
import { linkPro } from "./linkPro";
import { linkCat } from "../Categoria/linkCat";
import { linkFor } from "../Fornecedor/linkFor";
import { useAlerta } from "../../../hooks/Alerta/useAlerta";
import { useRequireAuth } from "../../../hooks/RequireAuth/useRequireAuth.jsx";

function formatarData(dataISO) {
  if (!dataISO) return "—";
  return new Date(dataISO).toLocaleString("pt-BR");
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function DetalhesProduto() {
  useRequireAuth("Funcionario");
  const { id } = useParams();
  const navigate = useNavigate();
  const alerta = useAlerta();
  const [produto, setProduto] = useState(null);
  const [categoriaDescricao, setCategoriaDescricao] = useState("—");
  const [fornecedorNome, setFornecedorNome] = useState("—");

  useEffect(() => {
    const fetchDetalhes = async () => {
      try {
        const response = await fetch(`${linkPro}/${id}`);
        if (!response.ok) throw new Error("Erro ao buscar detalhes do produto");
        const data = await response.json();
        setProduto(data);

        if (data.categoriaId) {
          const resp = await fetch(`${linkCat}/${data.categoriaId}`);
          if (resp.ok) setCategoriaDescricao((await resp.json()).descricao);
        }
        if (data.idFornecedor) {
          const resp = await fetch(`${linkFor}/${data.idFornecedor}`);
          if (resp.ok) setFornecedorNome((await resp.json()).nome);
        }
      } catch (error) {
        console.error(error);
        alerta("Não foi possível carregar os detalhes do produto.", "error");
      }
    };
    fetchDetalhes();
  }, [id, alerta]);

  if (!produto) {
    return <p className="pdv-empty">Carregando detalhes do produto…</p>;
  }

  const handleDelete = async () => {
    if (!window.confirm(`Excluir o produto "${produto.descricao}"? Essa ação não pode ser desfeita.`)) return;
    try {
      const response = await fetch(`${linkPro}/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      alerta("Produto excluído com sucesso!", "success");
      navigate("/Produto/ListagemProduto");
    } catch (error) {
      console.error(error);
      alerta("Não foi possível excluir este produto.", "error");
    }
  };

  return (
    <div className="pdv-page">
      <div className="pdv-header">
        <div>
          <Link to="/Produto/ListagemProduto" className="pdv-btn pdv-btn--ghost pdv-btn--sm" style={{ marginBottom: 10 }}>
            <ArrowLeft size={14} /> Voltar para produtos
          </Link>
          <h1 className="pdv-title">{produto.descricao}</h1>
          <p className="pdv-subtitle">Produto #{produto.id}</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className="pdv-btn pdv-btn--ghost" onClick={() => navigate("/Produto/CadastroProduto", { state: { produto } })}>
            <Copy size={16} /> Clonar
          </button>
          <button type="button" className="pdv-btn pdv-btn--danger" onClick={handleDelete}>
            <Trash2 size={16} /> Excluir
          </button>
          <button type="button" className="pdv-btn pdv-btn--primary" onClick={() => navigate(`/Produto/EditarProduto/${id}`)}>
            <Pencil size={16} /> Editar
          </button>
        </div>
      </div>

      <div className="pdv-card" style={{ padding: 22 }}>
        <dl className="pdv-detail-grid">
          <div className="pdv-detail-item"><dt>Categoria</dt><dd>{categoriaDescricao}</dd></div>
          <div className="pdv-detail-item"><dt>Fornecedor</dt><dd>{fornecedorNome}</dd></div>
          <div className="pdv-detail-item"><dt>Cor</dt><dd>{produto.cor || "—"}</dd></div>
          <div className="pdv-detail-item"><dt>Tamanho</dt><dd>{produto.tamanho || "—"}</dd></div>
          <div className="pdv-detail-item"><dt>Preço de custo</dt><dd>{formatarMoeda(produto.precoCusto)}</dd></div>
          <div className="pdv-detail-item"><dt>Preço de venda</dt><dd>{formatarMoeda(produto.precoVenda)}</dd></div>
          <div className="pdv-detail-item"><dt>Quantidade em estoque</dt><dd>{produto.quantidade}</dd></div>
          <div className="pdv-detail-item"><dt>Cadastrado em</dt><dd>{formatarData(produto.dataCadastro)}</dd></div>
        </dl>
      </div>
    </div>
  );
}
