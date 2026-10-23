import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Eye, Pencil, Trash2, Plus } from "lucide-react";
import { linkCli } from "./linkCli";
import { useRequireAuth } from "../../../hooks/RequireAuth/useRequireAuth.jsx";

export function ListagemCliente() {
  useRequireAuth("Funcionario");
  document.title = "Listagem de Clientes";
  const [pesquisa, setPesquisa] = useState("");
  const [tipoPesquisa, setTipoPesquisa] = useState("nome");
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await fetch(linkCli);
        if (!response.ok) throw new Error("Erro ao buscar clientes");
        const data = await response.json();
        setClientes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        alert("Não foi possível carregar a lista de clientes.");
      } finally {
        setCarregando(false);
      }
    };
    fetchClientes();
  }, []);

  useEffect(() => {
    const filtro = pesquisa.toLowerCase().trim();
    if (!filtro) {
      setClientesFiltrados(clientes);
      return;
    }
    const filtrados = clientes.filter((cliente) => {
      if (tipoPesquisa === "id") return String(cliente.id).includes(filtro);
      if (tipoPesquisa === "nome") return (cliente.nome || "").toLowerCase().includes(filtro);
      if (tipoPesquisa === "cpf") return String(cliente.cpf || "").toLowerCase().includes(filtro);
      if (tipoPesquisa === "telefone") return String(cliente.telefone || "").toLowerCase().includes(filtro);
      return true;
    });
    setClientesFiltrados(filtrados);
  }, [pesquisa, clientes, tipoPesquisa]);

  const handleDelete = async (cliente) => {
    const confirmDelete = window.confirm(`Excluir o cliente "${cliente.nome}"? Essa ação não pode ser desfeita.`);
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${linkCli}/${cliente.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Erro ao deletar o cliente");
      setClientes((prev) => prev.filter((c) => c.id !== cliente.id));
    } catch (error) {
      console.error(error);
      alert("Não foi possível excluir este cliente.");
    }
  };

  return (
    <div className="pdv-page">
      <div className="pdv-header">
        <div>
          <h1 className="pdv-title">Clientes</h1>
          <p className="pdv-subtitle">Consulte, edite e gerencie os clientes cadastrados na loja.</p>
        </div>
        <Link to="/Cliente/CadastroCliente" className="pdv-btn pdv-btn--primary">
          <Plus size={16} /> Novo cliente
        </Link>
      </div>

      <div className="pdv-toolbar">
        <div className="pdv-toolbar-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Buscar cliente…"
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
          />
        </div>
        <select
          className="pdv-toolbar-select"
          value={tipoPesquisa}
          onChange={(e) => setTipoPesquisa(e.target.value)}
        >
          <option value="nome">Buscar por nome</option>
          <option value="id">Buscar por ID</option>
          <option value="cpf">Buscar por CPF</option>
          <option value="telefone">Buscar por telefone</option>
        </select>
      </div>

      <div className="pdv-card">
        <div className="pdv-table-scroll">
          <table className="pdv-table">
            <thead>
              <tr>
                <th>Id</th>
                <th>Nome</th>
                <th>CPF</th>
                <th>Telefone</th>
                <th>Limite de crédito</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map((cliente) => (
                <tr key={cliente.id}>
                  <td>{cliente.id}</td>
                  <td>{cliente.nome}</td>
                  <td>{cliente.cpf}</td>
                  <td>{cliente.telefone}</td>
                  <td>
                    {Number(cliente.limiteDeCredito || 0).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td>
                    <div className="pdv-table-actions">
                      <button
                        type="button"
                        className="pdv-icon-btn"
                        title="Ver detalhes"
                        onClick={() => navigate(`/Cliente/DetalhesCliente/${cliente.id}`)}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        className="pdv-icon-btn"
                        title="Editar cliente"
                        onClick={() => navigate(`/Cliente/EditarCliente/${cliente.id}`)}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="pdv-icon-btn pdv-icon-btn--danger"
                        title="Excluir cliente"
                        onClick={() => handleDelete(cliente)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!carregando && clientesFiltrados.length === 0 && (
            <p className="pdv-empty">
              {clientes.length === 0
                ? "Nenhum cliente cadastrado ainda."
                : "Nenhum cliente encontrado para essa busca."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
