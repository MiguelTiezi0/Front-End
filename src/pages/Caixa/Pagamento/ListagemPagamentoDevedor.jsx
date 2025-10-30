import React, { useEffect, useState, useMemo } from "react";
import { linkPag } from "./linkPag";
import { linkCli } from "../../Gerenciamento/Cliente/linkCli";
import { linkVen } from "../Venda/linkVen";
import "./Pagamento.css";

function getDiasParaVencimento(vencimento) {
  if (!vencimento) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataVenc = new Date(vencimento);
  dataVenc.setHours(0, 0, 0, 0);
  return Math.ceil((dataVenc - hoje) / (1000 * 60 * 60 * 24));
}

export function ListagemPagamentoDevedor() {
  const [clientes, setClientes] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [clienteBusca, setClienteBusca] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [modalPagamento, setModalPagamento] = useState(false);
  const [pagamentoClienteId, setPagamentoClienteId] = useState("");
  const [pagamentoValor, setPagamentoValor] = useState("");
  const [pagamentoForma, setPagamentoForma] = useState("Dinheiro");
  const [parcelasEmCarteira, setParcelasEmCarteira] = useState([]);
  const [dataPagamento, setDataPagamento] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [vendaSelecionadaId, setVendaSelecionadaId] = useState("");
  const [parcelaSelecionada, setParcelaSelecionada] = useState(null);

  const formasPagamento = ["Dinheiro", "Débito", "Pix", "Crédito"];

  // Carrega clientes, vendas e monta as parcelas
  const fetchData = async () => {
    try {
      const [clientesData, vendasData] = await Promise.all([
        fetch(linkCli).then((r) => r.json()),
        fetch(linkVen).then((r) => r.json()),
      ]);
      setClientes(clientesData);
      setVendas(vendasData);

      const vendasNorm = vendasData.map((v) => {
        const forma = Array.isArray(v.formaDePagamento)
          ? v.formaDePagamento[0] ?? ""
          : v.formaDePagamento ?? v.FormaDePagamento ?? "";

        return {
          ...v,
          formaDePagamento: forma,
          clienteId: v.clienteId ?? v.ClienteId,
          totalDeVezes: Number(v.totalDeVezes ?? v.TotalDeVezes ?? 1),
          valorTotal: Number(v.valorTotal ?? v.ValorTotal ?? 0),
          totalPago: Number(v.totalPago ?? v.TotalPago ?? 0),
          dataVenda: v.dataVenda ?? v.DataVenda ?? v.data ?? v.Data,
          id: v.id,
        };
      });

      const parcelas = [];
      vendasNorm
        .filter((v) => {
          const forma = String(v.formaDePagamento).toLowerCase();
          return forma.includes("carteira") || forma.includes("crediário");
        })
        .forEach((v) => {
          const parcelasCount = v.totalDeVezes || 1;
          const valorParcela = v.valorTotal / parcelasCount;
          const dataVenda = new Date(v.dataVenda);
          let totalPagoRestante = v.totalPago;

          const clienteNome =
            clientesData.find((c) => String(c.id) === String(v.clienteId))
              ?.nome || "Desconhecido";

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
            if (Math.abs(valorPago - valorParcela) < 0.01) {
              status = "Paga";
            } else if (valorPago > 0) {
              status = "Parcial";
            }

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
      alert("Erro ao carregar dados. Tente novamente.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Autocomplete: lista de sugestões baseada no clienteBusca
  const clientesFiltrados = useMemo(() => {
    const q = clienteBusca.trim().toLowerCase();
    if (!q) return [];
    return clientes
      .filter((c) => String(c.nome).toLowerCase().includes(q))
      .slice(0, 10); // limite de sugestões
  }, [clienteBusca, clientes]);

  // Abre modal de pagamento
  const handleOpenModalParcela = (parcela) => {
    setPagamentoClienteId(parcela.clienteId);
    setVendaSelecionadaId(parcela.idVenda);
    setParcelaSelecionada(parcela);
    setPagamentoValor("");
    setPagamentoForma("Dinheiro");
    setDataPagamento(new Date().toISOString().slice(0, 16));
    setModalPagamento(true);
  };

  // Pagar (sem alterações)
  const handlePagamento = async () => {
    if (
      !pagamentoClienteId ||
      !pagamentoValor ||
      isNaN(Number(pagamentoValor)) ||
      !vendaSelecionadaId
    ) {
      alert("Selecione o cliente, informe o valor e escolha uma venda.");
      return;
    }

    const valorTotalPagamento = Number(pagamentoValor);
    let valorRestanteParaDistribuir = valorTotalPagamento;

    const pagamentoBody = {
      FuncionarioId: 1,
      ClienteId: Number(pagamentoClienteId),
      VendaId: vendaSelecionadaId,
      TotalPago: valorTotalPagamento,
      Desconto: 0,
      FormaDePagamento: [pagamentoForma],
      ToTalDeVezes: 1,
      DataPagamento: new Date(dataPagamento).toISOString(),
    };

    try {
      const resPagamento = await fetch(linkPag, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pagamentoBody),
      });

      if (!resPagamento.ok) {
        const errorData = await resPagamento.json().catch(() => ({}));
        console.error("Erro ao registrar pagamento:", errorData);
        alert(
          `Erro ao registrar pagamento! Detalhes: ${
            errorData.message || resPagamento.statusText
          }`
        );
        return;
      }

      const vendasDoClienteAtualizadas = await fetch(linkVen)
        .then((r) => r.json())
        .then((vs) =>
          vs.filter(
            (v) =>
              Number(v.clienteId ?? v.ClienteId) === Number(pagamentoClienteId)
          )
        );

      const vendasEmAbertoDoCliente = vendasDoClienteAtualizadas
        .filter(
          (v) =>
            Number(v.totalPago ?? v.TotalPago ?? 0) <
            Number(v.valorTotal ?? v.ValorTotal ?? 0)
        )
        .sort(
          (a, b) =>
            new Date(a.dataVenda ?? a.DataVenda) -
            new Date(b.dataVenda ?? b.DataVenda)
        );

      for (const venda of vendasEmAbertoDoCliente) {
        if (valorRestanteParaDistribuir <= 0) break;

        const totalVenda = Number(venda.valorTotal ?? venda.ValorTotal ?? 0);
        const pagoVenda = Number(venda.totalPago ?? venda.TotalPago ?? 0);
        const devidoVenda = totalVenda - pagoVenda;

        const valorParaPagarNestaVenda = Math.min(
          valorRestanteParaDistribuir,
          devidoVenda
        );

        const novoTotalPagoVenda = pagoVenda + valorParaPagarNestaVenda;

        await fetch(`${linkVen}/${venda.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...venda,
            totalPago: novoTotalPagoVenda,
          }),
        });

        valorRestanteParaDistribuir -= valorParaPagarNestaVenda;
      }

      const vendasDoClienteFinal = await fetch(linkVen)
        .then((r) => r.json())
        .then((vs) =>
          vs.filter(
            (v) =>
              Number(v.clienteId ?? v.ClienteId) === Number(pagamentoClienteId)
          )
        );

      const totalPagoCliente = vendasDoClienteFinal.reduce(
        (acc, v) => acc + Number(v.totalPago ?? v.TotalPago ?? 0),
        0
      );
      const totalDevidoCliente = vendasDoClienteFinal.reduce(
        (acc, v) =>
          acc +
          (Number(v.valorTotal ?? v.ValorTotal ?? 0) -
            Number(v.totalPago ?? v.TotalPago ?? 0)),
        0
      );
      const totalGastoCliente = vendasDoClienteFinal.reduce(
        (acc, v) => acc + Number(v.valorTotal ?? v.ValorTotal ?? 0),
        0
      );

      const clienteAtual = await fetch(`${linkCli}/${pagamentoClienteId}`).then(
        (r) => r.json()
      );

      const clienteAtualizado = {
        ...clienteAtual,
        totalPago: totalPagoCliente,
        totalDevido: totalDevidoCliente,
        totalGasto: totalGastoCliente,
      };

      await fetch(`${linkCli}/${pagamentoClienteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clienteAtualizado),
      });

      if (pagamentoForma === "Dinheiro" && valorTotalPagamento > 0) {
        await fetch("http://localhost:7172/api/Caixa/entrada", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            valor: valorTotalPagamento,
            descricao: `Pagamento recebido do cliente ${pagamentoClienteId}`,
            tipo: "Entrada",
          }),
        });
      }

      alert("Pagamento registrado e distribuído com sucesso!");
      setModalPagamento(false);
      setPagamentoClienteId("");
      setPagamentoValor("");
      setPagamentoForma("Dinheiro");
      setParcelaSelecionada(null);
      fetchData();
    } catch (error) {
      console.error("Erro inesperado no processo de pagamento:", error);
      alert("Ocorreu um erro inesperado ao processar o pagamento.");
    }
  };

  // Filtragem de parcelas considerando clienteSelecionado
  const parcelasFiltradas = parcelasEmCarteira
    .filter((p) => {
      if (
        clienteSelecionado &&
        String(p.clienteId) !== String(clienteSelecionado)
      )
        return false;
      if (filtroStatus === "todos") return true;
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

  const totalBruto = parcelasFiltradas.reduce(
    (acc, p) => acc + p.valorParcela,
    0
  );
  const totalPago = parcelasFiltradas.reduce((acc, p) => acc + p.valorPago, 0);
  const totalAPagar = totalBruto - totalPago;

  const getParcelaRowClass = (parcela) => {
    if (parcela.status === "Paga") return "linhaPaga";
    const dias = getDiasParaVencimento(parcela.vencimento);
    if (dias < 0) return "linhaVencida";
    if (dias <= 3) return "linhaVencendo";
    return "";
  };

  // Seleciona um cliente quando clicado na sugestão
  const handleSelectCliente = (cli) => {
    setClienteSelecionado(cli.id);
    setClienteBusca(cli.nome);
  };

  const handleClearCliente = () => {
    setClienteSelecionado("");
    setClienteBusca("");
  };

  return (
    <div className="centroListagemPagamentoDevedor">
      <div className="ListagemPagamentoDevedor">
        <div
          className="NavPagamentosDevedor"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
          }}
        >
          <div
            className="filtrosPagamentoDevedor"
            style={{ position: "relative" }}
          >
            <label>Cliente:</label>
            <div style={{ position: "relative", width: 260 }}>
              <input
                type="text"
                value={clienteBusca}
                className="inputFiltroCliente"
                onChange={(e) => {
                  setClienteBusca(e.target.value);
                  // se o usuário está digitando, limpa seleção anterior
                  setClienteSelecionado("");
                }}
                placeholder="Buscar cliente..."
                style={{ width: "100%", boxSizing: "border-box" }}
                autoComplete="off"
              />
              {clienteSelecionado ? (
                <button
                  onClick={handleClearCliente}
                  title="Limpar seleção"
                  style={{
                    position: "absolute",
                    right: 6,
                    top: 6,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "#c0392b",
                    fontWeight: "bold",
                  }}
                >
                  ✕
                </button>
              ) : null}

              {/* Sugestões */}
              {clienteBusca &&
                !clienteSelecionado &&
                clientesFiltrados.length > 0 && (
                  <ul
                    style={{
                      position: "absolute",
                      top: "38px",
                      left: 0,
                      right: 0,
                      maxHeight: 200,
                      overflowY: "auto",
                      background: "#fff",
                      border: "1px solid #ddd",
                      borderRadius: 4,
                      padding: 0,
                      margin: 4,
                      zIndex: 999,
                      listStyle: "none",
                    }}
                  >
                    {clientesFiltrados.map((c) => (
                      <li
                        key={c.id}
                        onMouseDown={() => handleSelectCliente(c)} // onMouseDown evita conflito com blur
                        style={{
                          padding: "8px 10px",
                          cursor: "pointer",
                          borderBottom: "1px solid #f0f0f0",
                        }}
                      >
                        <div style={{ fontWeight: 600 }}>{c.nome}</div>
                        <div style={{ fontSize: 12, color: "#666" }}>
                          CPF: {c.cpf ?? "—"} • ID: {c.id}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

              {/* Nenhuma sugestão */}
              {clienteBusca &&
                !clienteSelecionado &&
                clientesFiltrados.length === 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "38px",
                      left: 0,
                      right: 0,
                      background: "#fff",
                      border: "1px solid #ddd",
                      borderRadius: 4,
                      padding: "8px 10px",
                      zIndex: 999,
                    }}
                  >
                    Nenhum cliente encontrado
                  </div>
                )}
            </div>

            <label>Status:</label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="pagas">Pagas</option>
              <option value="naopagas">Não pagas</option>
            </select>
          </div>
        </div>
        <div className="tabelaCarteiraContainer">
          <h2>Parcelas em Carteira a Receber</h2>
          <div className="tabelaPagamentoDevedor">
            <table className="tabelaCarteira">
              <thead>
                <tr>
                  <th>ID Venda</th>
                  <th>Cliente</th>
                  <th>Parcela</th>
                  <th>Vencimento</th>
                  <th>Valor Parcela</th>
                  <th>Valor Pago</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {parcelasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center" }}>
                      Nenhuma parcela encontrada
                    </td>
                  </tr>
                ) : (
                  parcelasFiltradas.map((p) => (
                    <tr
                      key={`${p.idVenda}-${p.parcela}`}
                      className={getParcelaRowClass(p)}
                    >
                      <td>{p.idVenda}</td>
                      <td>{p.cliente}</td>
                      <td>
                        {p.parcela} / {p.totalParcelas}
                      </td>
                      <td>
                        {new Date(p.vencimento).toLocaleDateString("pt-BR")}
                      </td>
                      <td>R$ {p.valorParcela.toFixed(2)}</td>
                      <td>R$ {p.valorPago.toFixed(2)}</td>
                      <td>{p.status}</td>
                      <td>
                        {p.status !== "Paga" && (
                          <button
                            className="btnPagarParcela"
                            style={{
                              background: "#2ecc40",
                              color: "#fff",
                              border: "none",
                              borderRadius: 4,
                              padding: "4px 12px",
                              cursor: "pointer",
                              fontWeight: "bold",
                            }}
                            onClick={() => handleOpenModalParcela(p)}
                          >
                            Pagar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4}>Totais:</td>
                  <td>
                    <strong>R$ {totalBruto.toFixed(2)}</strong>
                  </td>
                  <td>
                    <strong>R$ {totalPago.toFixed(2)}</strong>
                  </td>
                  <td colSpan={2}>
                    <strong>À Receber: R$ {totalAPagar.toFixed(2)}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de pagamento */}
      {modalPagamento && (
        <div
          className="modalPagamentoDevedor"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            className="modalPagamentoBox"
            style={{
              background: "#f8f8f8",
              borderRadius: 8,
              padding: 32,
              minWidth: 340,
              boxShadow: "0 0 16px #0004",
              position: "relative",
            }}
          >
            <button
              className="modalFechar"
              onClick={() => setModalPagamento(false)}
              title="Fechar"
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                background: "transparent",
                border: "none",
                fontSize: 18,
                cursor: "pointer",
              }}
            >
              ✕
            </button>
            <h2>Registrar Pagamento</h2>
            {parcelaSelecionada && (
              <p>
                Venda {parcelaSelecionada.idVenda} - Parcela{" "}
                {parcelaSelecionada.parcela}/{parcelaSelecionada.totalParcelas}
              </p>
            )}
            <div>
              <label>Valor:</label>
              <input
                type="number"
                value={pagamentoValor}
                onChange={(e) => setPagamentoValor(e.target.value)}
              />
            </div>
            <div>
              <label>Forma de Pagamento:</label>
              <select
                value={pagamentoForma}
                onChange={(e) => setPagamentoForma(e.target.value)}
              >
                {formasPagamento.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Data:</label>
              <input
                type="datetime-local"
                value={dataPagamento}
                onChange={(e) => setDataPagamento(e.target.value)}
              />
            </div>
            <button
              className="btnPagar"
              style={{ marginTop: 16 }}
              onClick={handlePagamento}
            >
              Confirmar Pagamento
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
