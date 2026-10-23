import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Eye, Pencil, Trash2, Plus } from "lucide-react";
import { linkCompra } from "./linkCompra";
import { linkFun } from "../../Gerenciamento/Funcionario/linkFun";
import { useRequireAuth } from "../../../hooks/RequireAuth/useRequireAuth.jsx";

export function ListagemCompra() {
  useRequireAuth("Funcionario");
  document.title = "Listagem de Compras";
  const [pesquisa, setPesquisa] = useState("");
  const [tipoPesquisa, setTipoPesquisa] = useState("descricao");
  const [compras, setCompras] = useState([]);
  const [comprasFiltradas, setComprasFiltradas] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [resCompras, resFuncs] = await Promise.all([fetch(linkCompra), fetch(linkFun)]);
        const comprasData = await resCompras.json();
        const funcsData = await resFuncs.json();
        setCompras(Array.isArray(comprasData) ? comprasData : []);
        setFuncionarios(Array.isArray(funcsData) ? funcsData : []);
      } catch (error) {
        console.error(error);
        alert("Não foi possível carregar as compras.");
      } finally {
        setCarregando(false);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    let filtradas = compras;

    if (pesquisa) {
      const termo = pesquisa.toLowerCase();
      filtradas = filtradas.filter((compra) => {
        const funcionario = funcionarios.find((f) => f.id === compra.funcionarioId);
        if (tipoPesquisa === "id") return String(compra.id).includes(termo);
        if (tipoPesquisa === "funcionario") return (funcionario?.nome || "").toLowerCase().includes(termo);
        if (tipoPesquisa === "descricao") return (compra.descricao || "").toLowerCase().includes(termo);
        return true;
      });
    }

    if (dataInicio && dataFim) {
      const dataIni = new Date(`${dataInicio}T00:00:00`);
      const dataFinal = new Date(`${dataFim}T23:59:59`);
      filtradas = filtradas.filter((compra) => {
        if (!compra.dataCompra) return false;
        const d = new Date(compra.dataCompra);
        return d >= dataIni && d <= dataFinal;
      });
    }

    filtradas = filtradas.slice().sort((a, b) => new Date(b.dataCompra) - new Date(a.dataCompra));
    setComprasFiltradas(filtradas);
  }, [pesquisa, tipoPesquisa, compras, funcionarios, dataInicio, dataFim]);

  const handleDelete = async (compra) => {
    const confirmDelete = window.confirm(`Excluir a compra "${compra.descricao}"? Essa ação não pode ser desfeita.`);
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${linkCompra}/${compra.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Erro ao deletar a compra");
      setCompras((prev) => prev.filter((c) => c.id !== compra.id));
    } catch (error) {
      console.error(error);
      alert("Não foi possível excluir esta compra.");
    }
  };

  return (
    <div className="pdv-page">
      <div className="pdv-header">
        <div>
          <h1 className="pdv-title">Compras</h1>
          <p className="pdv-subtitle">Histórico de compras feitas junto a fornecedores.</p>
        </div>
        <Link to="/Compra/CadastroCompra" className="pdv-btn pdv-btn--primary">
          <Plus size={16} /> Nova compra
        </Link>
      </div>

      <div className="pdv-toolbar">
        <div className="pdv-toolbar-search">
          <Search size={16} />
          <input type="text" placeholder="Buscar compra…" value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} />
        </div>
        <select className="pdv-toolbar-select" value={tipoPesquisa} onChange={(e) => setTipoPesquisa(e.target.value)}>
          <option value="descricao">Buscar por descrição</option>
          <option value="id">Buscar por ID</option>
          <option value="funcionario">Buscar por funcionário</option>
        </select>
        <div className="pdv-toolbar-dates">
          <label>De</label>
          <input type="date" value={dataInicio} max={dataFim || undefined} onChange={(e) => setDataInicio(e.target.value)} />
          <label>até</label>
          <input type="date" value={dataFim} min={dataInicio || undefined} onChange={(e) => setDataFim(e.target.value)} />
        </div>
      </div>

      <div className="pdv-card">
        <div className="pdv-table-scroll">
          <table className="pdv-table">
            <thead>
              <tr>
                <th>Id</th>
                <th>Funcionário</th>
                <th>Descrição</th>
                <th>Qtd produtos</th>
                <th>Valor total</th>
                <th>Data</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {comprasFiltradas.map((compra) => (
                <tr key={compra.id}>
                  <td>#{compra.id}</td>
                  <td>{funcionarios.find((f) => f.id === compra.funcionarioId)?.nome || "—"}</td>
                  <td>{compra.descricao}</td>
                  <td>{compra.quantidadeDeProduto}</td>
                  <td>{Number(compra.valorDaCompra || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                  <td>{compra.dataCompra ? new Date(compra.dataCompra).toLocaleDateString("pt-BR") : "—"}</td>
                  <td>
                    <div className="pdv-table-actions">
                      <button type="button" className="pdv-icon-btn" title="Ver detalhes" onClick={() => navigate(`/Compra/DetalhesCompra/${compra.id}`)}>
                        <Eye size={16} />
                      </button>
                      <button type="button" className="pdv-icon-btn" title="Editar compra" onClick={() => navigate(`/Compra/EditarCompra/${compra.id}`)}>
                        <Pencil size={16} />
                      </button>
                      <button type="button" className="pdv-icon-btn pdv-icon-btn--danger" title="Excluir compra" onClick={() => handleDelete(compra)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!carregando && comprasFiltradas.length === 0 && (
            <p className="pdv-empty">
              {compras.length === 0 ? "Nenhuma compra registrada ainda." : "Nenhuma compra encontrada para essa busca."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
