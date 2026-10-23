import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Eye, Pencil, Trash2, Plus } from "lucide-react";
import { linkVen } from "./linkVen";
import { linkFun } from "../../Gerenciamento/Funcionario/linkFun";
import { linkCli } from "../../Gerenciamento/Cliente/linkCli";
import { useRequireAuth } from "../../../hooks/RequireAuth/useRequireAuth.jsx";

function statusVenda(venda) {
  const total = Number(venda.valorTotal || 0);
  const pago = Number(venda.totalPago || 0);
  if (total > 0 && pago >= total) return { label: "Paga", className: "pdv-pill--success" };
  if (pago > 0) return { label: "Parcial", className: "pdv-pill--warning" };
  return { label: "Em aberto", className: "pdv-pill--danger" };
}

export function ListagemVenda() {
  useRequireAuth("Funcionario");
  document.title = "Listagem de Vendas";
  const [pesquisa, setPesquisa] = useState("");
  const [tipoPesquisa, setTipoPesquisa] = useState("id");
  const [vendas, setVendas] = useState([]);
  const [vendasFiltradas, setVendasFiltradas] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [resVendas, resFuncs, resClientes] = await Promise.all([
          fetch(linkVen),
          fetch(linkFun),
          fetch(linkCli),
        ]);
        const vendasData = await resVendas.json();
        const funcsData = await resFuncs.json();
        const clientesData = await resClientes.json();

        setVendas(Array.isArray(vendasData) ? vendasData : []);
        setFuncionarios(Array.isArray(funcsData) ? funcsData : []);
        setClientes(Array.isArray(clientesData) ? clientesData : []);
      } catch (error) {
        console.error(error);
        alert("Não foi possível carregar as vendas.");
      } finally {
        setCarregando(false);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    let filtradas = vendas;

    if (pesquisa) {
      const termo = pesquisa.toLowerCase();
      filtradas = filtradas.filter((venda) => {
        const cliente = clientes.find((c) => c.id === venda.clienteId);
        const funcionario = funcionarios.find((f) => f.id === venda.funcionarioId);
        if (tipoPesquisa === "id") return venda.id.toString().includes(termo);
        if (tipoPesquisa === "funcionario") return funcionario && funcionario.nome.toLowerCase().includes(termo);
        if (tipoPesquisa === "cliente") return cliente && cliente.nome.toLowerCase().includes(termo);
        if (tipoPesquisa === "formaPagamento") {
          return (Array.isArray(venda.formaDePagamento) ? venda.formaDePagamento.join(", ") : venda.formaDePagamento || "")
            .toLowerCase()
            .includes(termo);
        }
        return (
          venda.id.toString().includes(termo) ||
          (cliente && cliente.nome.toLowerCase().includes(termo)) ||
          (funcionario && funcionario.nome.toLowerCase().includes(termo))
        );
      });
    }

    if (dataInicio && dataFim) {
      const dataIni = new Date(`${dataInicio}T00:00:00`);
      const dataFinal = new Date(`${dataFim}T23:59:59`);
      filtradas = filtradas.filter((venda) => {
        if (!venda.dataVenda) return false;
        const dataVenda = new Date(venda.dataVenda);
        return dataVenda >= dataIni && dataVenda <= dataFinal;
      });
    }

    filtradas = filtradas.slice().sort((a, b) => new Date(b.dataVenda) - new Date(a.dataVenda));
    setVendasFiltradas(filtradas);
  }, [pesquisa, tipoPesquisa, vendas, clientes, funcionarios, dataInicio, dataFim]);

  const handleDelete = async (venda) => {
    const confirmDelete = window.confirm(`Excluir a venda #${venda.id}? Os itens voltam ao estoque.`);
    if (!confirmDelete) return;

    try {
      const vendaRes = await fetch(`${linkVen}/${venda.id}`);
      if (vendaRes.ok) {
        const vendaAtual = await vendaRes.json();
        const formaDinheiro =
          vendaAtual.formaDePagamento === "Dinheiro" ||
          (Array.isArray(vendaAtual.formaDePagamento) && vendaAtual.formaDePagamento.includes("Dinheiro"));
        const valorPago = Number(vendaAtual.totalPago ?? 0);
        if (formaDinheiro && valorPago > 0) {
          await fetch("http://localhost:7172/api/Caixa/saida", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              valor: valorPago,
              descricao: `Estorno venda deletada ID ${vendaAtual.id}`,
              tipo: "Saída",
            }),
          });
        }
      }

      const response = await fetch(`${linkVen}/${venda.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Erro ao deletar a venda");

      setVendas((prev) => prev.filter((v) => v.id !== venda.id));
    } catch (error) {
      console.error(error);
      alert("Não foi possível excluir esta venda.");
    }
  };

  return (
    <div className="pdv-page">
      <div className="pdv-header">
        <div>
          <h1 className="pdv-title">Vendas</h1>
          <p className="pdv-subtitle">Histórico de vendas realizadas na loja.</p>
        </div>
        <Link to="/Venda/CadastroVenda" className="pdv-btn pdv-btn--primary">
          <Plus size={16} /> Nova venda
        </Link>
      </div>

      <div className="pdv-toolbar">
        <div className="pdv-toolbar-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Buscar venda…"
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
          />
        </div>
        <select className="pdv-toolbar-select" value={tipoPesquisa} onChange={(e) => setTipoPesquisa(e.target.value)}>
          <option value="id">Buscar por ID</option>
          <option value="funcionario">Buscar por funcionário</option>
          <option value="cliente">Buscar por cliente</option>
          <option value="formaPagamento">Buscar por forma de pagamento</option>
        </select>
        <div className="pdv-toolbar-dates">
          <span>De</span>
          <input type="date" value={dataInicio} max={dataFim || undefined} onChange={(e) => setDataInicio(e.target.value)} />
          <span>até</span>
          <input type="date" value={dataFim} min={dataInicio || undefined} onChange={(e) => setDataFim(e.target.value)} />
        </div>
      </div>

      <div className="pdv-card">
        <div className="pdv-table-scroll">
          <table className="pdv-table">
            <thead>
              <tr>
                <th>Venda</th>
                <th>Funcionário</th>
                <th>Cliente</th>
                <th>Itens</th>
                <th>Total</th>
                <th>Pagamento</th>
                <th>Parcelas</th>
                <th>Data</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {vendasFiltradas.map((venda) => {
                const status = statusVenda(venda);
                return (
                  <tr key={venda.id}>
                    <td>#{venda.id}</td>
                    <td>{funcionarios.find((f) => f.id === venda.funcionarioId)?.nome || "—"}</td>
                    <td>
                      {venda.clienteId === 0 || venda.clienteId === "0" || venda.clienteId === null
                        ? "Anônimo"
                        : clientes.find((c) => c.id === venda.clienteId)?.nome || "—"}
                    </td>
                    <td>{venda.totalDeItens}</td>
                    <td>{Number(venda.valorTotal || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                    <td>{Array.isArray(venda.formaDePagamento) ? venda.formaDePagamento.join(", ") : venda.formaDePagamento}</td>
                    <td>{venda.totalDeVezes || 1}x</td>
                    <td>{venda.dataVenda ? new Date(venda.dataVenda).toLocaleDateString("pt-BR") : "—"}</td>
                    <td><span className={`pdv-pill ${status.className}`}>{status.label}</span></td>
                    <td>
                      <div className="pdv-table-actions">
                        <button type="button" className="pdv-icon-btn" title="Ver detalhes" onClick={() => navigate(`/Venda/DetalhesVenda/${venda.id}`)}>
                          <Eye size={16} />
                        </button>
                        <button type="button" className="pdv-icon-btn" title="Editar venda" onClick={() => navigate(`/Venda/EditarVenda/${venda.id}`)}>
                          <Pencil size={16} />
                        </button>
                        <button type="button" className="pdv-icon-btn pdv-icon-btn--danger" title="Excluir venda" onClick={() => handleDelete(venda)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!carregando && vendasFiltradas.length === 0 && (
            <p className="pdv-empty">
              {vendas.length === 0 ? "Nenhuma venda registrada ainda." : "Nenhuma venda encontrada para esse filtro."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
