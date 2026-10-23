import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Eye, Pencil, Trash2, Plus } from "lucide-react";
import { linkFor } from "./linkFor";
import { useRequireAuth } from "../../../hooks/RequireAuth/useRequireAuth.jsx";

export function ListagemFornecedor() {
  useRequireAuth("Funcionario");
  document.title = "Listagem de Fornecedores";
  const [pesquisa, setPesquisa] = useState("");
  const [fornecedores, setFornecedores] = useState([]);
  const [fornecedoresFiltrados, setFornecedoresFiltrados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFornecedores = async () => {
      try {
        const response = await fetch(linkFor);
        if (!response.ok) throw new Error("Erro ao buscar fornecedores");
        const data = await response.json();
        setFornecedores(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        alert("Não foi possível carregar a lista de fornecedores.");
      } finally {
        setCarregando(false);
      }
    };
    fetchFornecedores();
  }, []);

  useEffect(() => {
    const filtro = pesquisa.toLowerCase().trim();
    if (!filtro) {
      setFornecedoresFiltrados(fornecedores);
      return;
    }
    setFornecedoresFiltrados(
      fornecedores.filter(
        (f) =>
          (f.nome || "").toLowerCase().includes(filtro) ||
          (f.cnpj || "").toLowerCase().includes(filtro)
      )
    );
  }, [pesquisa, fornecedores]);

  const handleDelete = async (fornecedor) => {
    const confirmDelete = window.confirm(`Excluir o fornecedor "${fornecedor.nome}"? Essa ação não pode ser desfeita.`);
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${linkFor}/${fornecedor.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Erro ao deletar o fornecedor");
      setFornecedores((prev) => prev.filter((f) => f.id !== fornecedor.id));
    } catch (error) {
      console.error(error);
      alert("Não foi possível excluir este fornecedor.");
    }
  };

  return (
    <div className="pdv-page">
      <div className="pdv-header">
        <div>
          <h1 className="pdv-title">Fornecedores</h1>
          <p className="pdv-subtitle">Parceiros e fabricantes que abastecem a loja.</p>
        </div>
        <Link to="/Fornecedor/CadastroFornecedor" className="pdv-btn pdv-btn--primary">
          <Plus size={16} /> Novo fornecedor
        </Link>
      </div>

      <div className="pdv-toolbar">
        <div className="pdv-toolbar-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Buscar por nome ou CNPJ…"
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
                <th>Nome</th>
                <th>CNPJ</th>
                <th>Telefone</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {fornecedoresFiltrados.map((fornecedor) => (
                <tr key={fornecedor.id}>
                  <td>{fornecedor.id}</td>
                  <td>{fornecedor.nome}</td>
                  <td>{fornecedor.cnpj}</td>
                  <td>{fornecedor.numTelefone || "—"}</td>
                  <td>
                    <div className="pdv-table-actions">
                      <button
                        type="button"
                        className="pdv-icon-btn"
                        title="Ver detalhes"
                        onClick={() => navigate(`/Fornecedor/DetalhesFornecedor/${fornecedor.id}`)}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        className="pdv-icon-btn"
                        title="Editar fornecedor"
                        onClick={() => navigate(`/Fornecedor/EditarFornecedor/${fornecedor.id}`)}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="pdv-icon-btn pdv-icon-btn--danger"
                        title="Excluir fornecedor"
                        onClick={() => handleDelete(fornecedor)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!carregando && fornecedoresFiltrados.length === 0 && (
            <p className="pdv-empty">
              {fornecedores.length === 0
                ? "Nenhum fornecedor cadastrado ainda."
                : "Nenhum fornecedor encontrado para essa busca."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
