import React, { useEffect, useMemo, useState } from "react";
import "./Relatorio.css";
import { linkVen } from "./Caixa/Venda/linkVen";
import { linkCli } from "./Gerenciamento/Cliente/linkCli";
import { linkPro } from "./Gerenciamento/Produto/linkPro";


import { HeaderGeral } from "../components/Geral/HeaderGeral/HeaderGeral.jsx";
import { useRequireAuth } from "../hooks/RequireAuth/useRequireAuth.jsx";
function formatBR(n) {
  return Number(n || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
function formatInteger(n) {
  return Number(n || 0).toLocaleString("pt-BR");
}

export default function Relatorio() {
  useRequireAuth("Funcionario");
  const [vendas, setVendas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [clienteFilter, setClienteFilter] = useState("");
  const [reorderThreshold, setReorderThreshold] = useState(5);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError("");
      try {
        const [rV, rC, rP] = await Promise.all([
          fetch(linkVen).then((r) => r.json()),
          fetch(linkCli).then((r) => r.json()),
          fetch(linkPro).then((r) => r.json()),
        ]);
        setVendas(Array.isArray(rV) ? rV : []);
        setClientes(Array.isArray(rC) ? rC : []);
        setProdutos(Array.isArray(rP) ? rP : []);
      } catch (err) {
        console.error("Erro ao carregar dados do relatório:", err);
        setError("Erro ao carregar dados. Verifique os endpoints e o backend.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const vendasFiltradas = useMemo(() => {
    const start = dataInicio ? new Date(dataInicio) : null;
    const end = dataFim ? new Date(dataFim) : null;
    return vendas.filter((v) => {
      const dataVenda = new Date(
        v.dataVenda ?? v.DataVenda ?? v.data ?? v.Data ?? null
      );
      if (!dataVenda || isNaN(dataVenda)) return false;
      if (start && dataVenda < start) return false;
      if (end) {
        const endDay = new Date(end);
        endDay.setHours(23, 59, 59, 999);
        if (dataVenda > endDay) return false;
      }
      if (clienteFilter) {
        const clienteNome = String(
          clientes.find((c) => String(c.id) === String(v.clienteId))?.nome ?? ""
        ).toLowerCase();
        if (!clienteNome.includes(clienteFilter.toLowerCase())) return false;
      }
      return true;
    });
  }, [vendas, dataInicio, dataFim, clienteFilter, clientes]);

  const totalVendas = useMemo(
    () =>
      vendasFiltradas.reduce(
        (acc, v) => acc + Number(v.valorTotal ?? v.ValorTotal ?? 0),
        0
      ),
    [vendasFiltradas]
  );

  const totalPedidos = vendasFiltradas.length;
  const avgTicket = totalPedidos ? totalVendas / totalPedidos : 0;

  const topClientes = useMemo(() => {
    const map = {};
    vendasFiltradas.forEach((v) => {
      const cid = String(v.clienteId ?? v.ClienteId ?? "0");
      const val = Number(v.valorTotal ?? v.ValorTotal ?? 0);
      map[cid] = (map[cid] || 0) + val;
    });
    const arr = Object.entries(map).map(([cid, total]) => {
      const cli = clientes.find((c) => String(c.id) === cid) ?? {
        id: cid,
        nome: `#${cid}`,
      };
      const orders = vendasFiltradas.filter(
        (v) => String(v.clienteId ?? v.ClienteId ?? "") === cid
      ).length;
      return {
        clienteId: cid,
        nome: cli.nome || cli.nomeFantasia || `#${cid}`,
        total,
        orders,
      };
    });
    const salesTotal = arr.reduce((a, b) => a + b.total, 0) || 1;
    return arr
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
      .map((c) => ({ ...c, percent: (c.total / salesTotal) * 100 }));
  }, [vendasFiltradas, clientes]);

  const produtosCriticos = useMemo(() => {
    return [...produtos]
      .map((p) => ({
        id: p.id,
        descricao: p.descricao || p.nome || "",
        quantidade: Number(p.quantidade ?? p.Quantidade ?? 0),
      }))
      .sort((a, b) => a.quantidade - b.quantidade);
  }, [produtos]);

  const exportCSV = (rows, filename = "relatorio.csv") => {
    if (!rows || rows.length === 0) {
      alert("Nada para exportar.");
      return;
    }
    const keys = Object.keys(rows[0]);
    const fixedCsv = [keys.join(",")]
      .concat(
        rows.map((r) =>
          keys
            .map((k) => {
              const v = r[k] ?? "";
              return `"${String(v).replace(/"/g, '""')}"`;
            })
            .join(",")
        )
      )
      .join("\r\n");

    const blob = new Blob([fixedCsv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading)
    return <div className="rel-loading">Carregando relatórios...</div>;
  if (error) return <div className="rel-error">{error}</div>;

  return (
    <div >
      <HeaderGeral />
      <div className="rel-container">
      <header className="rel-header">
        <div className="rel-header-left">
          <h2 className="rel-title">Painel de Relatórios</h2>
       
        </div>

        <div className="rel-filters">
          <div className="rel-filter-row">
            <label className="rel-label">Data início</label>
            <input
              className="rel-input rel-input-date"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>

          <div className="rel-filter-row">
            <label className="rel-label">Data fim</label>
            <input
              className="rel-input rel-input-date"
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </div>

          <div className="rel-filter-row">
            <label className="rel-label">Buscar cliente</label>
            <input
              className="rel-input"
              type="text"
              placeholder="Nome do cliente"
              value={clienteFilter}
              onChange={(e) => setClienteFilter(e.target.value)}
            />
          </div>

          <div className="rel-filter-row">
            <label className="rel-label">Reorder threshold</label>
            <input
              className="rel-input rel-input-small"
              type="number"
              min={0}
              value={reorderThreshold}
              onChange={(e) => setReorderThreshold(Number(e.target.value || 0))}
            />
          </div>

          <div className="rel-actions-top">
            <button
              className="rel-btn"
              onClick={() => {
                setDataInicio("");
                setDataFim("");
                setClienteFilter("");
              }}
            >
              Limpar filtros
            </button>
            <button
              className="rel-btn rel-btn-export"
              onClick={() =>
                exportCSV(
                  vendasFiltradas.map((v) => ({
                    id: v.id,
                    data: v.dataVenda ?? v.DataVenda,
                    valor: v.valorTotal ?? v.ValorTotal,
                  })),
                  "vendas_filtradas.csv"
                )
              }
            >
              Exportar vendas
            </button>
          </div>
        </div>
      </header>

      <section className="rel-kpis">
        <div className="kpi">
          <div className="kpi-label">Total (R$)</div>
          <div className="kpi-value">R$ {formatBR(totalVendas)}</div>
          <div className="kpi-help">Soma das vendas no período</div>
        </div>

        <div className="kpi">
          <div className="kpi-label">Pedidos</div>
          <div className="kpi-value">{formatInteger(totalPedidos)}</div>
          <div className="kpi-help">Número de pedidos no período</div>
        </div>

        <div className="kpi">
          <div className="kpi-label">Ticket médio</div>
          <div className="kpi-value">R$ {formatBR(avgTicket)}</div>
          <div className="kpi-help">Total / Pedidos</div>
        </div>

        <div className="kpi">
          <div className="kpi-label">Clientes distintos</div>
          <div className="kpi-value">
            {formatInteger(
              new Set(
                vendasFiltradas.map((v) =>
                  String(v.clienteId ?? v.ClienteId ?? 0)
                )
              ).size
            )}
          </div>
          <div className="kpi-help">Clientes que compraram</div>
        </div>
      </section>

      <section className="rel-section">
        <h3 className="rel-section-title">Top clientes</h3>
        <div className="rel-table-wrap">
          <table className="rel-table rel-table-top">
            <thead>
              <tr>
                <th>Cliente</th>
                <th className="rel-col-orders">Pedidos</th>
                <th className="rel-col-valor">Total (R$)</th>
                <th className="rel-col-percent">%</th>
              </tr>
            </thead>
            <tbody>
              {topClientes.length === 0 && (
                <tr>
                  <td colSpan={4} className="rel-empty">
                    Nenhum cliente
                  </td>
                </tr>
              )}
              {topClientes.map((c) => (
                <tr key={c.clienteId}>
                  <td>{c.nome}</td>
                  <td className="rel-col-orders">{c.orders}</td>
                  <td className="rel-col-valor">R$ {formatBR(c.total)}</td>
                  <td className="rel-col-percent">{c.percent.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rel-actions">
          <button
            className="rel-btn rel-btn-export"
            onClick={() => exportCSV(topClientes, "top_clientes.csv")}
          >
            Exportar CSV
          </button>
        </div>
      </section>

      <section className="rel-section">
        <h3 className="rel-section-title">Produtos (ordenado por estoque)</h3>
        <div className="rel-table-wrap">
          <table className="rel-table rel-table-prod">
            <thead>
              <tr>
                <th>ID</th>
                <th>Produto</th>
                <th className="rel-col-estoque">Estoque</th>
                <th className="rel-col-action">Ação</th>
              </tr>
            </thead>
            <tbody>
              {produtosCriticos.map((p) => {
                const low = p.quantidade <= reorderThreshold;
                return (
                  <tr key={p.id} className={low ? "row-low-stock" : ""}>
                    <td>{p.id}</td>
                    <td>{p.descricao}</td>
                    <td className="rel-col-estoque">
                      <span
                        className={`badge ${low ? "badge-low" : "badge-ok"}`}
                      >
                        {p.quantidade}
                      </span>
                    </td>
                    <td className="rel-col-action">
                      {low ? (
                        <button
                          className="rel-btn rel-btn-small"
                          title="Repor estoque"
                        >
                          Repor
                        </button>
                      ) : (
                        <button
                          className="rel-btn rel-btn-ghost"
                          title="Ver detalhes"
                        >
                          Ver
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {produtosCriticos.length === 0 && (
                <tr>
                  <td colSpan={4} className="rel-empty">
                    Nenhum produto
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="rel-actions">
          <button
            className="rel-btn rel-btn-export"
            onClick={() => exportCSV(produtosCriticos, "produtos_estoque.csv")}
          >
            Exportar CSV
          </button>
        </div>
      </section>
    </div>
    </div>
  );
}
