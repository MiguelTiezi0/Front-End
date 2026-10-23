import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Pencil, Trash2, Plus } from "lucide-react";
import { linkCat } from "./linkCat";
import { linkPro } from "../Produto/linkPro";
import { useRequireAuth } from "../../../hooks/RequireAuth/useRequireAuth.jsx";

export function ListagemCategoria() {
  useRequireAuth("Funcionario");
  document.title = "Listagem de Categorias";
  const [pesquisa, setPesquisa] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [categoriasFiltradas, setCategoriasFiltradas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await fetch(linkCat);
        if (!response.ok) throw new Error("Erro ao buscar categorias");
        const data = await response.json();
        setCategorias(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        alert("Não foi possível carregar a lista de categorias.");
      } finally {
        setCarregando(false);
      }
    };
    fetchCategorias();
  }, []);

  useEffect(() => {
    const filtro = pesquisa.toLowerCase().trim();
    if (!filtro) {
      setCategoriasFiltradas(categorias);
      return;
    }
    setCategoriasFiltradas(
      categorias.filter((c) => (c.descricao || "").toLowerCase().includes(filtro))
    );
  }, [pesquisa, categorias]);

  const handleDelete = async (categoria) => {
    try {
      const responseProdutos = await fetch(linkPro);
      if (!responseProdutos.ok) throw new Error("Erro ao buscar produtos");
      const produtos = await responseProdutos.json();
      const existeProduto = Array.isArray(produtos) && produtos.some((p) => p.categoriaId === categoria.id);
      if (existeProduto) {
        alert("Não é possível excluir esta categoria: existem produtos cadastrados nela.");
        return;
      }
    } catch (error) {
      console.error(error);
      alert("Não foi possível verificar os produtos desta categoria.");
      return;
    }

    const confirmDelete = window.confirm(`Excluir a categoria "${categoria.descricao}"?`);
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${linkCat}/${categoria.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Erro ao deletar a categoria");
      setCategorias((prev) => prev.filter((c) => c.id !== categoria.id));
    } catch (error) {
      console.error(error);
      alert("Não foi possível excluir esta categoria.");
    }
  };

  return (
    <div className="pdv-page">
      <div className="pdv-header">
        <div>
          <h1 className="pdv-title">Categorias</h1>
          <p className="pdv-subtitle">Organize o catálogo de produtos por categoria.</p>
        </div>
        <Link to="/Categoria/CadastroCategoria" className="pdv-btn pdv-btn--primary">
          <Plus size={16} /> Nova categoria
        </Link>
      </div>

      <div className="pdv-toolbar">
        <div className="pdv-toolbar-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Buscar categoria…"
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
          />
        </div>
      </div>

      <div className="pdv-card">
        <div className="pdv-table-scroll">
          <table className="pdv-table">
            <thead>
              <tr>
                <th>Id</th>
                <th>Descrição</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {categoriasFiltradas.map((categoria) => (
                <tr key={categoria.id}>
                  <td>{categoria.id}</td>
                  <td>{categoria.descricao}</td>
                  <td>
                    <div className="pdv-table-actions">
                      <button
                        type="button"
                        className="pdv-icon-btn"
                        title="Editar categoria"
                        onClick={() => navigate(`/Categoria/EditarCategoria/${categoria.id}`)}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="pdv-icon-btn pdv-icon-btn--danger"
                        title="Excluir categoria"
                        onClick={() => handleDelete(categoria)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!carregando && categoriasFiltradas.length === 0 && (
            <p className="pdv-empty">
              {categorias.length === 0
                ? "Nenhuma categoria cadastrada ainda."
                : "Nenhuma categoria encontrada para essa busca."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
