import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Eye, Pencil, Trash2, Copy, Plus } from "lucide-react";
import { linkPro } from "./linkPro";
import { linkCat } from "../Categoria/linkCat";
import { linkFor } from "../Fornecedor/linkFor";
import { useAlerta } from "../../../hooks/Alerta/useAlerta";
import { useRequireAuth } from "../../../hooks/RequireAuth/useRequireAuth.jsx";

export function ListagemProduto() {
  useRequireAuth("Funcionario");
  document.title = "Listagem de Produtos";
  const navigate = useNavigate();
  const alerta = useAlerta();

  const [pesquisa, setPesquisa] = useState("");
  const [tipoPesquisa, setTipoPesquisa] = useState("descricao");
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [produtosRes, categoriasRes, fornecedoresRes] = await Promise.all([
          fetch(linkPro),
          fetch(linkCat),
          fetch(linkFor),
        ]);
        const produtosData = produtosRes.ok ? await produtosRes.json() : [];
        const categoriasData = categoriasRes.ok ? await categoriasRes.json() : [];
        const fornecedoresData = fornecedoresRes.ok ? await fornecedoresRes.json() : [];

        setProdutos(Array.isArray(produtosData) ? produtosData : []);
        setCategorias(Array.isArray(categoriasData) ? categoriasData : []);
        setFornecedores(Array.isArray(fornecedoresData) ? fornecedoresData : []);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        alerta("Não foi possível carregar os produtos.", "error");
      } finally {
        setCarregando(false);
      }
    };
    fetchData();
  }, [alerta]);

  const produtosFiltrados = useMemo(() => {
    const filtro = pesquisa.toLowerCase().trim();
    if (!filtro) return produtos;

    return produtos.filter((produto) => {
      switch (tipoPesquisa) {
        case "id":
          return String(produto.id).includes(filtro);
        case "descricao":
          return (produto.descricao || "").toLowerCase().includes(filtro);
        case "categoria": {
          const categoria = categorias.find((cat) => cat.id === produto.categoriaId);
          return (categoria?.descricao || "").toLowerCase().includes(filtro);
        }
        case "fornecedor": {
          const fornecedor = fornecedores.find((f) => f.id === produto.idFornecedor);
          return (fornecedor?.nome || "").toLowerCase().includes(filtro);
        }
        default:
          return true;
      }
    });
  }, [pesquisa, produtos, tipoPesquisa, categorias, fornecedores]);

  const handleDelete = async (produto) => {
    if (!window.confirm(`Excluir o produto "${produto.descricao}"? Essa ação não pode ser desfeita.`)) return;
    try {
      const response = await fetch(`${linkPro}/${produto.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Erro ao deletar o produto");
      setProdutos((prev) => prev.filter((p) => p.id !== produto.id));
      alerta("Produto excluído com sucesso!", "success");
    } catch (error) {
      console.error(error);
      alerta("Não foi possível excluir este produto.", "error");
    }
  };

  return (
    <div className="pdv-page">
      <div className="pdv-header">
        <div>
          <h1 className="pdv-title">Produtos</h1>
          <p className="pdv-subtitle">Catálogo, estoque e preços da loja.</p>
        </div>
        <Link to="/Produto/CadastroProduto" className="pdv-btn pdv-btn--primary">
          <Plus size={16} /> Novo produto
        </Link>
      </div>

      <div className="pdv-toolbar">
        <div className="pdv-toolbar-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Buscar produto…"
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
          />
        </div>
        <select className="pdv-toolbar-select" value={tipoPesquisa} onChange={(e) => setTipoPesquisa(e.target.value)}>
          <option value="descricao">Buscar por descrição</option>
          <option value="id">Buscar por ID</option>
          <option value="categoria">Buscar por categoria</option>
          <option value="fornecedor">Buscar por fornecedor</option>
        </select>
      </div>

      <div className="pdv-card">
        <div className="pdv-table-scroll">
          <table className="pdv-table">
            <thead>
              <tr>
                <th>Id</th>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Fornecedor</th>
                <th>Estoque</th>
                <th>Preço</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {produtosFiltrados.map((produto) => {
                const categoria = categorias.find((c) => c.id === produto.categoriaId);
                const fornecedor = fornecedores.find((f) => f.id === produto.idFornecedor);
                const semEstoque = Number(produto.quantidade) <= 0;
                return (
                  <tr key={produto.id}>
                    <td>{produto.id}</td>
                    <td>{produto.descricao}</td>
                    <td>{categoria ? categoria.descricao : "—"}</td>
                    <td>{fornecedor ? fornecedor.nome : "—"}</td>
                    <td>
                      {semEstoque ? (
                        <span className="pdv-pill pdv-pill--danger">Sem estoque</span>
                      ) : (
                        produto.quantidade
                      )}
                    </td>
                    <td>
                      {Number(produto.precoVenda || 0).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>
                    <td>
                      <div className="pdv-table-actions">
                        <button type="button" className="pdv-icon-btn" title="Ver detalhes" onClick={() => navigate(`/Produto/DetalhesProduto/${produto.id}`)}>
                          <Eye size={16} />
                        </button>
                        <button type="button" className="pdv-icon-btn" title="Editar produto" onClick={() => navigate(`/Produto/EditarProduto/${produto.id}`)}>
                          <Pencil size={16} />
                        </button>
                        <button type="button" className="pdv-icon-btn" title="Clonar produto" onClick={() => navigate("/Produto/CadastroProduto", { state: { produto } })}>
                          <Copy size={16} />
                        </button>
                        <button type="button" className="pdv-icon-btn pdv-icon-btn--danger" title="Excluir produto" onClick={() => handleDelete(produto)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!carregando && produtosFiltrados.length === 0 && (
            <p className="pdv-empty">
              {produtos.length === 0 ? "Nenhum produto cadastrado ainda." : "Nenhum produto encontrado para essa busca."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
