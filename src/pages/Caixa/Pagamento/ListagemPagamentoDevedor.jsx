import React, { useEffect, useState, useMemo } from "react";
import { X } from "lucide-react";
import { linkPag } from "./linkPag";
import { linkCli } from "../../Gerenciamento/Cliente/linkCli";
import { linkVen } from "../Venda/linkVen";
import { apiFetch } from "../../../utils/apiFetch";
import { useAlerta } from "../../../hooks/Alerta/useAlerta";
import { useRequireAuth } from "../../../hooks/RequireAuth/useRequireAuth.jsx";

const FORMAS_PAGAMENTO = ["Dinheiro", "Débito", "Pix", "Crédito"];

function getDiasParaVencimento(vencimento) {
  if (!vencimento) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataVenc = new Date(vencimento);
  dataVenc.setHours(0, 0, 0, 0);
  return Math.ceil((dataVenc - hoje) / (1000 * 60 * 60 * 24));
}

export function ListagemPagamentoDevedor() {
  useRequireAuth("Funcionario");
  document.title = "Devedores";
  const alerta = useAlerta();

  const [clientes, setClientes] = useState([]);
  const [clienteBusca, setClienteBusca] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [modalPagamento, setModalPagamento] = useState(false);
  const [pagamentoValor, setPagamentoValor] = useState("");
  const [pagamentoForma, setPagamentoForma] = useState("Dinheiro");
  const [parcelasEmCarteira, setParcelasEmCarteira] = useState([]);
  const [dataPagamento, setDataPagamento] = useState(new Date().toISOString().slice(0, 16));
  const [vendaSelecionadaId, setVendaSelecionadaId] = useState("");
  const [pagamentoClienteId, setPagamentoClienteId] = useState("");
  const [parcelaSelecionada, setParcelaSelecionada] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const fetchData = async () => {
    try {
      const [clientesData, vendasData] = await Promise.all([
        fetch(linkCli).then((r) => r.json()),
        fetch(linkVen).then((r) => r.json()),
      ]);
      const clientesArr = Array.isArray(clientesData) ? clientesData : [];
      const vendasArr = Array.isArray(vendasData) ? vendasData : [];
      setClientes(clientesArr);

      const vendasNorm = vendasArr.map((v) => ({
        ...v,
        formaDePagamento: Array.isArray(v.formaDePagamento) ? v.formaDePagamento[0] || "" : v.formaDePagamento || "",
        totalDeVezes: Number(v.totalDeVezes || 1),
        valorTotal: Number(v.valorTotal || 0),
        totalPago: Number(v.totalPago || 0),
      }));

      const parcelas = [];
      vendasNorm
        .filter((v) => {
          const forma = String(v.formaDePagamento).toLowerCase();
          return forma.includes("carteira") || forma.includes("crediário") || forma.includes("crediario");
        })
        .forEach((v) => {
          const parcelasCount = v.totalDeVezes || 1;
          const valorParcela = v.valorTotal / parcelasCount;
          const dataVenda = new Date(v.dataVenda);
          let totalPagoRestante = v.totalPago;
          const clienteNome = clientesArr.find((c) => String(c.id) === String(v.clienteId))?.nome || "Desconhecido";

          for (let i = 0; i < parcelasCount; i++) {
            const vencimento = new Date(dataVenda);
            vencimento.setMonth(vencimento.getMonth() + i);

            let valorPago = 0;
            if (totalPagoRestante >= valorParcela) {
              valorPago = valorParcela;
              totalPagoRestante -= valorParcela;
            } else if (totalPagoRestante > 0) {
              valorPago = totalPagoRestante;
              totalPagoRestante = 0;
            }

            let status = "Em aberto";
            if (Math.abs(valorPago - valorParcela) < 0.01) status = "Paga";
            else if (valorPago > 0) status = "Parcial";

            parcelas.push({
              idVenda: v.id,
              clienteId: v.clienteId,
              cliente: clienteNome,
              vencimento,
              parcela: i + 1,
              totalParcelas: parcelasCount,
              valorParcela,
              valorPago,
              status,
            });
          }
        });

      setParcelasEmCarteira(parcelas);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      alerta?.("Erro ao carregar as parcelas em carteira.", "erro");
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clientesFiltrados = useMemo(() => {
    const q = clienteBusca.trim().toLowerCase();
    if (!q) return [];
    return clientes.filter((c) => String(c.nome).toLowerCase().includes(q)).slice(0, 10);
  }, [clienteBusca, clientes]);

  const handleOpenModalParcela = (parcela) => {
    setPagamentoClienteId(parcela.clienteId);
    setVendaSelecionadaId(parcela.idVenda);
    setParcelaSelecionada(parcela);
    setPagamentoValor(String((parcela.valorParcela - parcela.valorPago).toFixed(2)));
    setPagamentoForma("Dinheiro");
    setDataPagamento(new Date().toISOString().slice(0, 16));
    setModalPagamento(true);
  };

  const handlePagamento = async () => {
    if (!pagamentoClienteId || !pagamentoValor || isNaN(Number(pagamentoValor)) || !vendaSelecionadaId) {
      alerta?.("Selecione o cliente, informe o valor e escolha uma venda.", "aviso");
      return;
    }

    setSalvando(true);
    const valorTotalPagamento = Number(pagamentoValor);

    try {
      const pagamentoBody = {
        funcionarioId: null,
        clienteId: Number(pagamentoClienteId),
        vendaId: Number(vendaSelecionadaId),
        totalPago: valorTotalPagamento,
        desconto: 0,
        formaDePagamento: [pagamentoForma],
        totalDeVezes: 1,
        dataPagamento: new Date(dataPagamento).toISOString(),
      };

      const resPagamento = await fetch(linkPag, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pagamentoBody),
      });
      if (!resPagamento.ok) {
        const errorData = await resPagamento.json().catch(() => ({}));
        throw new Error(errorData.message || "Erro ao registrar pagamento.");
      }

      // Distribui o valor pago entre as vendas em aberto do cliente, mais antigas primeiro.
      let restante = valorTotalPagamento;
      const vendasDoCliente = await fetch(linkVen)
        .then((r) => r.json())
        .then((vs) => (Array.isArray(vs) ? vs.filter((v) => Number(v.clienteId) === Number(pagamentoClienteId)) : []));

      const vendasEmAberto = vendasDoCliente
        .filter((v) => Number(v.totalPago || 0) < Number(v.valorTotal || 0))
        .sort((a, b) => new Date(a.dataVenda || 0) - new Date(b.dataVenda || 0));

      for (const venda of vendasEmAberto) {
        if (restante <= 0) break;
        const total = Number(venda.valorTotal || 0);
        const pago = Number(venda.totalPago || 0);
        const paraPagar = Math.min(restante, total - pago);
        await fetch(`${linkVen}/${venda.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...venda, totalPago: pago + paraPagar }),
        });
        restante -= paraPagar;
      }

      // Recalcula os totais do cliente a partir dos dados reais no servidor.
      await apiFetch(`/api/cliente/${pagamentoClienteId}/recalcular-totais`, { method: "PATCH" });

      if (pagamentoForma === "Dinheiro" && valorTotalPagamento > 0) {
        await apiFetch("/api/caixa/entrada", {
          method: "POST",
          body: JSON.stringify({
            valor: valorTotalPagamento,
            descricao: `Pagamento recebido do cliente ${pagamentoClienteId}`,
            tipo: "Entrada",
          }),
        });
      }

      alerta?.("Pagamento registrado e distribuído com sucesso!", "sucesso");
      setModalPagamento(false);
      setPagamentoValor("");
      setParcelaSelecionada(null);
      fetchData();
    } catch (error) {
      console.error("Erro no processo de pagamento:", error);
      alerta?.(error.message || "Ocorreu um erro ao processar o pagamento.", "erro");
    } finally {
      setSalvando(false);
    }
  };

  const parcelasFiltradas = parcelasEmCarteira
    .filter((p) => {
      if (clienteSelecionado && String(p.clienteId) !== String(clienteSelecionado)) return false;
      if (filtroStatus === "pagas") return p.status === "Paga";
      if (filtroStatus === "naopagas") return p.status !== "Paga";
      return true;
    })
    .sort((a, b) => {
      const order = (parcela) => {
        if (parcela.status === "Paga") return 3;
        const dias = getDiasParaVencimento(parcela.vencimento);
        if (dias < 0) return 0;
        if (dias <= 3) return 1;
        return 2;
      };
      const oA = order(a);
      const oB = order(b);
      if (oA !== oB) return oA - oB;
      return new Date(a.vencimento) - new Date(b.vencimento);
    });

  const totalBruto = parcelasFiltradas.reduce((acc, p) => acc + p.valorParcela, 0);
  const totalPagoParcelas = parcelasFiltradas.reduce((acc, p) => acc + p.valorPago, 0);
  const totalAPagar = totalBruto - totalPagoParcelas;

  const statusPill = (parcela) => {
    if (parcela.status === "Paga") return "pdv-pill--success";
    const dias = getDiasParaVencimento(parcela.vencimento);
    if (dias < 0) return "pdv-pill--danger";
    if (dias <= 3) return "pdv-pill--warning";
    return "pdv-pill--neutral";
  };

  const handleSelectCliente = (cli) => {
    setClienteSelecionado(cli.id);
    setClienteBusca(cli.nome);
  };

  const handleClearCliente = () => {
    setClienteSelecionado("");
    setClienteBusca("");
  };

  return (
    <div className="pdv-page">
      <div className="pdv-header">
        <div>
          <h1 className="pdv-title">Devedores</h1>
          <p className="pdv-subtitle">Parcelas em carteira (crediário) a receber dos clientes.</p>
        </div>
      </div>

      <div className="pdv-toolbar">
        <div className="pdv-toolbar-search" style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Buscar cliente…"
            value={clienteBusca}
            autoComplete="off"
            onChange={(e) => {
              setClienteBusca(e.target.value);
              setClienteSelecionado("");
            }}
          />
          {clienteSelecionado && (
            <button type="button" className="pdv-icon-btn" style={{ width: 26, height: 26 }} title="Limpar seleção" onClick={handleClearCliente}>
              <X size={14} />
            </button>
          )}
          {clienteBusca && !clienteSelecionado && clientesFiltrados.length > 0 && (
            <ul
              style={{
                position: "absolute", top: "100%", left: 0, right: 0, maxHeight: 220, overflowY: "auto",
                background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--r-input)",
                padding: 0, margin: "4px 0 0", zIndex: 20, listStyle: "none", boxShadow: "0 4px 12px rgba(0,0,0,.08)",
              }}
            >
              {clientesFiltrados.map((c) => (
                <li
                  key={c.id}
                  onMouseDown={() => handleSelectCliente(c)}
                  style={{ padding: "9px 13px", cursor: "pointer", borderBottom: "1px solid var(--border-row)" }}
                >
                  <div style={{ fontWeight: 600 }}>{c.nome}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>CPF: {c.cpf || "—"} · ID: {c.id}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <select className="pdv-toolbar-select" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
          <option value="todos">Todos os status</option>
          <option value="pagas">Pagas</option>
          <option value="naopagas">Não pagas</option>
        </select>
      </div>

      <div className="pdv-stat-row">
        <dl className="pdv-stat"><dt>Total das parcelas</dt><dd>{totalBruto.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</dd></dl>
        <dl className="pdv-stat"><dt>Total pago</dt><dd>{totalPagoParcelas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</dd></dl>
        <dl className="pdv-stat"><dt>A receber</dt><dd>{totalAPagar.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</dd></dl>
      </div>

      <div className="pdv-card">
        <div className="pdv-table-scroll">
          <table className="pdv-table">
            <thead>
              <tr>
                <th>Venda</th>
                <th>Cliente</th>
                <th>Parcela</th>
                <th>Vencimento</th>
                <th>Valor</th>
                <th>Pago</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {parcelasFiltradas.map((p) => (
                <tr key={`${p.idVenda}-${p.parcela}`}>
                  <td>#{p.idVenda}</td>
                  <td>{p.cliente}</td>
                  <td>{p.parcela}/{p.totalParcelas}</td>
                  <td>{new Date(p.vencimento).toLocaleDateString("pt-BR")}</td>
                  <td>{p.valorParcela.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                  <td>{p.valorPago.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                  <td><span className={`pdv-pill ${statusPill(p)}`}>{p.status}</span></td>
                  <td>
                    {p.status !== "Paga" && (
                      <button type="button" className="pdv-btn pdv-btn--primary pdv-btn--sm" onClick={() => handleOpenModalParcela(p)}>
                        Registrar pagamento
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {parcelasFiltradas.length === 0 && <p className="pdv-empty">Nenhuma parcela em carteira encontrada.</p>}
        </div>
      </div>

      {modalPagamento && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(20,18,12,.45)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999,
          }}
        >
          <div className="pdv-form-card" style={{ width: 380, position: "relative" }}>
            <button
              type="button"
              onClick={() => setModalPagamento(false)}
              title="Fechar"
              style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
            >
              <X size={18} />
            </button>
            <h2 className="pdv-section-title">Registrar pagamento</h2>
            {parcelaSelecionada && (
              <p className="pdv-hint" style={{ marginBottom: 16 }}>
                Venda #{parcelaSelecionada.idVenda} — parcela {parcelaSelecionada.parcela}/{parcelaSelecionada.totalParcelas}
              </p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="hp-lb">Valor</label>
                <input className="hp-inp" type="number" step="0.01" min="0" value={pagamentoValor} onChange={(e) => setPagamentoValor(e.target.value)} />
              </div>
              <div>
                <label className="hp-lb">Forma de pagamento</label>
                <select className="hp-inp" value={pagamentoForma} onChange={(e) => setPagamentoForma(e.target.value)}>
                  {FORMAS_PAGAMENTO.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="hp-lb">Data</label>
                <input className="hp-inp" type="datetime-local" value={dataPagamento} onChange={(e) => setDataPagamento(e.target.value)} />
              </div>
            </div>
            <div className="pdv-form-actions">
              <button type="button" className="pdv-btn pdv-btn--ghost" onClick={() => setModalPagamento(false)}>Cancelar</button>
              <button type="button" className="pdv-btn pdv-btn--primary" onClick={handlePagamento} disabled={salvando}>
                {salvando ? "Salvando…" : "Confirmar pagamento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
