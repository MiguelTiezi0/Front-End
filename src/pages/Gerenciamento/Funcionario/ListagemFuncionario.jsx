import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Eye, Pencil, Trash2, Plus } from "lucide-react";
import { linkFun } from "./linkFun";
import { useRequireAuth } from "../../../hooks/RequireAuth/useRequireAuth.jsx";

export function ListagemFuncionario() {
  useRequireAuth("Funcionario");
  document.title = "Listagem de Funcionários";
  const [pesquisa, setPesquisa] = useState("");
  const [funcionarios, setFuncionarios] = useState([]);
  const [funcionariosFiltrados, setFuncionariosFiltrados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFuncionarios = async () => {
      try {
        const response = await fetch(linkFun);
        if (!response.ok) throw new Error("Erro ao buscar funcionários");
        const data = await response.json();
        setFuncionarios(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        alert("Não foi possível carregar a lista de funcionários.");
      } finally {
        setCarregando(false);
      }
    };
    fetchFuncionarios();
  }, []);

  useEffect(() => {
    const filtro = pesquisa.toLowerCase().trim();
    if (!filtro) {
      setFuncionariosFiltrados(funcionarios);
      return;
    }
    setFuncionariosFiltrados(
      funcionarios.filter((f) => (f.nome || "").toLowerCase().includes(filtro))
    );
  }, [pesquisa, funcionarios]);

  const handleDelete = async (funcionario) => {
    const confirmDelete = window.confirm(`Excluir o funcionário "${funcionario.nome}"? Essa ação não pode ser desfeita.`);
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${linkFun}/${funcionario.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Erro ao deletar o funcionário");
      setFuncionarios((prev) => prev.filter((f) => f.id !== funcionario.id));
    } catch (error) {
      console.error(error);
      alert("Não foi possível excluir este funcionário.");
    }
  };

  return (
    <div className="pdv-page">
      <div className="pdv-header">
        <div>
          <h1 className="pdv-title">Funcionários</h1>
          <p className="pdv-subtitle">Equipe da loja e níveis de acesso ao sistema.</p>
        </div>
        <Link to="/Funcionario/CadastroFuncionario" className="pdv-btn pdv-btn--primary">
          <Plus size={16} /> Novo funcionário
        </Link>
      </div>

      <div className="pdv-toolbar">
        <div className="pdv-toolbar-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Buscar funcionário por nome…"
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
                <th>CPF</th>
                <th>Telefone</th>
                <th>Contratação</th>
                <th>Salário</th>
                <th>Nível</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {funcionariosFiltrados.map((funcionario) => (
                <tr key={funcionario.id}>
                  <td>{funcionario.id}</td>
                  <td>{funcionario.nome}</td>
                  <td>{funcionario.cpf}</td>
                  <td>{funcionario.telefone}</td>
                  <td>
                    {funcionario.dataContratacao
                      ? new Date(funcionario.dataContratacao).toLocaleDateString("pt-BR")
                      : "—"}
                  </td>
                  <td>
                    {typeof funcionario.salario === "number"
                      ? funcionario.salario.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                      : "—"}
                  </td>
                  <td>{funcionario.nivelAcesso || "—"}</td>
                  <td>
                    <span className={`pdv-pill ${funcionario.ativo ? "pdv-pill--success" : "pdv-pill--neutral"}`}>
                      {funcionario.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td>
                    <div className="pdv-table-actions">
                      <button
                        type="button"
                        className="pdv-icon-btn"
                        title="Ver detalhes"
                        onClick={() => navigate(`/Funcionario/DetalhesFuncionario/${funcionario.id}`)}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        className="pdv-icon-btn"
                        title="Editar funcionário"
                        onClick={() => navigate(`/Funcionario/EditarFuncionario/${funcionario.id}`)}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="pdv-icon-btn pdv-icon-btn--danger"
                        title="Excluir funcionário"
                        onClick={() => handleDelete(funcionario)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!carregando && funcionariosFiltrados.length === 0 && (
            <p className="pdv-empty">
              {funcionarios.length === 0
                ? "Nenhum funcionário cadastrado ainda."
                : "Nenhum funcionário encontrado para essa busca."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
