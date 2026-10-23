import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, Eye, Pencil, Trash2, Plus } from "lucide-react";
import { linkPag } from "./linkPag";
import { linkFun } from "../../Gerenciamento/Funcionario/linkFun";
import { linkCli } from "../../Gerenciamento/Cliente/linkCli";
import { linkVen } from "../Venda/linkVen";
import { apiFetch } from "../../../utils/apiFetch";
import { useAlerta } from "../../../hooks/Alerta/useAlerta";
import { useRequireAuth } from "../../../hooks/RequireAuth/useRequireAuth.jsx";

export function ListagemPagamento() {
  useRequireAuth("Funcionario");
  document.title = "Listagem de Pagamentos";
  const navigate = useNavigate();
  const alerta = useAlerta();

  const [pagamentos, setPagamentos] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [pesquisa, setPesquisa] = useState("");
  const [tipoPesquisa, setTipoPesquisa] = useState("cliente");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  useEffect(() => {
    const carregar = async () => {
      try {
        const [pags, funcs, clis, vens] = await Promise.all([
          fetch(linkPag).then((r) => r.json()),
          fetch(linkFun).then((r) => r.json()),
          fetch(linkCli).then((r) => r.json()),
          fetch(linkVen).then((r) => r.json()),
        ]);
        setPagamentos(Array.isArray(pags) ? pags : []);
        setFuncionarios(Array.isArray(funcs) ? funcs : []);
        setClientes(Array.isArray(clis) ? clis : []);
        setVendas(Array.isArray(vens) ? vens : []);
      } catch (error) {
        console.error(error);
        alerta?.("Erro ao carregar os pagamentos.", "erro");
      }
    };
    carregar();
  }, [alerta]);

  const getFuncionarioNome = (id) => funcionarios.find((f) => f.id === Number(id))?.nome || "—";
  const getClienteNome = (id) => {
    if (!id || id === 0 || id === "0") return "Anônimo";
    return clientes.find((c) => c.id === Number(id))?.nome || "—";
  };
  const getVendaLabel = (id) => (id ? `#${id}` : "—");

  const pagamentosFiltrados = pagamentos
    .filter((p) => {
      if (!pesquisa) return true;
      const cliente = getClienteNome(p.clienteId).toLowerCase();
      const funcionario = getFuncionarioNome(p.funcionarioId).toLowerCase();
      const termo = pesquisa.toLowerCase();
      if (tipoPesquisa === "id") return String(p.id).includes(termo);
      if (tipoPesquisa === "funcionario") return funcionario.includes(termo);
      if (tipoPesquisa === "cliente") return cliente.includes(termo);
      if (tipoPesquisa === "formaPagamento") {
        const forma = Array.isArray(p.formaDePagamento) ? p.formaDePagamento.join(", ") : p.formaDePagamento || "";
        return forma.toLowerCase().includes(termo);
      }
      return cliente.includes(termo) || funcionario.includes(termo);
    })
    .filter((p) => {
      if (!dataInicio || !dataFim || !p.dataPagamento) return true;
      const dataPag = new Date(p.dataPagamento);
      dataPag.setHours(0, 0, 0, 0);
      const ini = new Date(dataInicio);
      const fim = new Date(dataFim);
      ini.setHours(0, 0, 0, 0);
      fim.setHours(0, 0, 0, 0);
      return dataPag >= ini && dataPag <= fim;
    })
    .slice()
    .sort((a, b) => new Date(b.dataPagamento || 0) - new Date(a.dataPagamento || 0));

  const handleDelete = async (pagamento) => {
    if (!window.confirm(`Excluir o pagamento #${pagamento.id}? Essa ação não pode ser desfeita.`)) return;

    try {
      const formaDinheiro =
        pagamento.formaDePagamento === "Dinheiro" ||
        (Array.isArray(pagamento.formaDePagamento) && pagamento.formaDePagamento.includes("Dinheiro"));
      const valorPago = Number(pagamento.totalPago || 0);

      if (formaDinheiro && valorPago > 0) {
        await apiFetch("/api/caixa/entrada", {
          method: "POST",
          body: JSON.stringify({
            valor: valorPago,
            descricao: `Estorno do pagamento #${pagamento.id}`,
            tipo: "Saída",
          }),
        });
      }

      const response = await fetch(`${linkPag}/${pagamento.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Erro ao deletar pagamento");

      if (pagamento.clienteId) {
        await apiFetch(`/api/cliente/${pagamento.clienteId}/recalcular-totais`, { method: "PATCH" });
      }

      setPagamentos((prev) => prev.filter((p) => p.id !== pagamento.id));
      alerta?.("Pagamento excluído e dívida do cliente atualizada.", "sucesso");
    } catch (error) {
      console.error(error);
      alerta?.("Não foi possível excluir este pagamento.", "erro");
    }
  };

  return (
    <div className="pdv-page">
      <div className="pdv-header">
        <div>
          <h1 className="pdv-title">Pagamentos</h1>
          <p className="pdv-subtitle">Histórico de pagamentos recebidos dos clientes.</p>
        </div>
        <Link to="/Pagamento/CadastroPagamento" className="pdv-btn pdv-btn--primary">
          <Plus size={16} /> Novo pagamento
        </Link>
      </div>

      <div className="pdv-toolbar">
        <div className="pdv-toolbar-search">
          <Search size={16} />
          <input type="text" placeholder="Buscar pagamento…" value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} />
        </div>
        <select className="pdv-toolbar-select" value={tipoPesquisa} onChange={(e) => setTipoPesquisa(e.target.value)}>
          <option value="cliente">Buscar por cliente</option>
          <option value="id">Buscar por ID</option>
          <option value="funcionario">Buscar por funcionário</option>
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
                <th>Id</th>
                <th>Funcionário</th>
                <th>Cliente</th>
                <th>Venda</th>
                <th>Forma</th>
                <th>Total pago</th>
                <th>Vezes</th>
                <th>Data</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pagamentosFiltrados.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{getFuncionarioNome(p.funcionarioId)}</td>
                  <td>{getClienteNome(p.clienteId)}</td>
                  <td>{getVendaLabel(p.vendaId)}</td>
                  <td>{Array.isArray(p.formaDePagamento) ? p.formaDePagamento.join(", ") : p.formaDePagamento}</td>
                  <td>{Number(p.totalPago || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                  <td>{p.totalDeVezes || 1}x</td>
                  <td>{p.dataPagamento ? new Date(p.dataPagamento).toLocaleDateString("pt-BR") : "—"}</td>
                  <td>
                    <div className="pdv-table-actions">
                      <button type="button" className="pdv-icon-btn" title="Ver detalhes" onClick={() => navigate(`/Pagamento/DetalhesPagamento/${p.id}`)}>
                        <Eye size={16} />
                      </button>
                      <button type="button" className="pdv-icon-btn" title="Editar pagamento" onClick={() => navigate(`/Pagamento/EditarPagamento/${p.id}`)}>
                        <Pencil size={16} />
                      </button>
                      <button type="button" className="pdv-icon-btn pdv-icon-btn--danger" title="Excluir pagamento" onClick={() => handleDelete(p)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pagamentosFiltrados.length === 0 && (
            <p className="pdv-empty">
              {pagamentos.length === 0 ? "Nenhum pagamento registrado ainda." : "Nenhum pagamento encontrado para essa busca."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
