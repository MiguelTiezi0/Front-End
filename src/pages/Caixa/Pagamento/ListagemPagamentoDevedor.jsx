import React, { useEffect, useState } from "react";
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
  const [pagamentoCliente, setPagamentoCliente] = useState("");
  const [pagamentoClienteId, setPagamentoClienteId] = useState("");
  const [pagamentoValor, setPagamentoValor] = useState("");
  const [pagamentoForma, setPagamentoForma] = useState("Dinheiro");
  const [parcelasEmCarteira, setParcelasEmCarteira] = useState([]);
  const [dataPagamento] = useState(new Date().toISOString().slice(0, 16));
  const [vendaSelecionadaId, setVendaSelecionadaId] = useState("");

  const formasPagamento = [
    "Dinheiro",
    "Débito",
    "Pix",
    "Crédito",
    "Crediário",
    "Consignação",
  ];

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

  const handleOpenModal = (clienteId) => {
  setPagamentoClienteId(clienteId);
  setVendaSelecionadaId(""); // Resetar a venda selecionada ao abrir o modal
  setModalPagamento(true);

  // Selecionar automaticamente a primeira venda em aberto do cliente
  const vendasEmAberto = parcelasEmCarteira.filter(
    (p) => p.clienteId === clienteId && p.status !== "Paga"
  );

  if (vendasEmAberto.length > 0) {
    // Encontrar a parcela mais próxima do vencimento
    const parcelaMaisProxima = vendasEmAberto.reduce((maisProxima, atual) => {
      const diasMaisProxima = getDiasParaVencimento(maisProxima.vencimento);
      const diasAtual = getDiasParaVencimento(atual.vencimento);
      return (diasAtual < diasMaisProxima) ? atual : maisProxima;
    });

    setVendaSelecionadaId(parcelaMaisProxima.idVenda);
  }
};


  const handlePagamento = async () => {
    if (
      !pagamentoClienteId ||
      !pagamentoValor ||
      isNaN(Number(pagamentoValor)) ||
      !vendaSelecionadaId // Verifica se uma venda foi selecionada
    ) {
      alert("Selecione o cliente, informe o valor e escolha uma venda.");
      console.log("Dados do pagamento:", pagamentoClienteId, pagamentoValor, vendaSelecionadaId);
      return;
    }

    const valorTotalPagamento = Number(pagamentoValor);
    let valorRestanteParaDistribuir = valorTotalPagamento;

    // 1. Registrar o Pagamento na API de Pagamentos
    const pagamentoBody = {
      FuncionarioId: 1,
      ClienteId: Number(pagamentoClienteId),
      VendaId: vendaSelecionadaId, // Envia o VendaId selecionado
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
        const errorData = await resPagamento.json();
        console.error("Erro ao registrar pagamento:", errorData);
        alert(
          `Erro ao registrar pagamento! Detalhes: ${
            errorData.message || resPagamento.statusText
          }`
        );
        return;
      }

      // 2. Distribuir o pagamento nas vendas em aberto do cliente
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

        const resVenda = await fetch(`${linkVen}/${venda.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...venda,
            totalPago: novoTotalPagoVenda,
          }),
        });

        if (!resVenda.ok) {
          console.error(
            `Erro ao atualizar venda ${venda.id}:`,
            await resVenda.json()
          );
        }

        valorRestanteParaDistribuir -= valorParaPagarNestaVenda;
      }

      // 3. Atualizar os totais do cliente
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

      const resCliente = await fetch(`${linkCli}/${pagamentoClienteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clienteAtualizado),
      });

      if (!resCliente.ok) {
        const errorData = await resCliente.json();
        console.error("Erro ao atualizar cliente:", errorData);
        alert(
          `Erro ao atualizar cliente! Detalhes: ${
            errorData.message || resCliente.statusText
          }`
        );
      }

      alert("Pagamento registrado e distribuído com sucesso!");
      setModalPagamento(false);
      setPagamentoCliente("");
      setPagamentoClienteId("");
      setPagamentoValor("");
      setPagamentoForma("Dinheiro");
      fetchData();
    } catch (error) {
      console.error("Erro inesperado no processo de pagamento:", error);
      alert("Ocorreu um erro inesperado ao processar o pagamento.");
    }
  };

  // Filtro dinâmico de clientes
  const clientesFiltrados = clientes.filter((c) =>
    c.nome.toLowerCase().includes(clienteBusca.toLowerCase())
  );

  // Filtro de parcelas
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
            <input
              type="text"
              value={clienteBusca}
              onChange={(e) => {
                setClienteBusca(e.target.value);
                setClienteSelecionado("");
              }}
              onBlur={() => {
                const encontrado = clientes.find(
                  (c) => c.nome.toLowerCase() === clienteBusca.toLowerCase()
                );
                if (encontrado) {
                  setClienteSelecionado(encontrado.id);
                }
              }}
              placeholder="Buscar cliente..."
              style={{ width: 180 }}
            />

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
          <button
            style={{
              background: "#2ecc40",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              padding: "8px 24px",
              cursor: "pointer",
              fontWeight: "bold",
              height: 40,
            }}
            onClick={() => handleOpenModal(clienteSelecionado)} // Passa o cliente selecionado ao abrir o modal
          >
            Pagar
          </button>
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
                </tr>
              </thead>
              <tbody>
                {parcelasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center" }}>
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
                  <td>
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
        <div className="modalPagamentoDevedor">
          <div className="modalPagamentoBox">
            <button
              className="modalFechar"
              onClick={() => setModalPagamento(false)}
              title="Fechar"
            >
              ×
            </button>

            <h2 className="modalTitulo">Pagamento de Vendas</h2>

            <form
              className="modalFormulario"
              onSubmit={(e) => {
                e.preventDefault();
                handlePagamento();
              }}
            >
              <div className="modalCampo">
                <label>Cliente:</label>
                <select
                  className="modalInput"
                  required
                  value={pagamentoClienteId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setPagamentoClienteId(id);
                    const nome =
                      clientes.find((c) => String(c.id) === id)?.nome || "";
                    setPagamentoCliente(nome);
                    // Selecionar automaticamente a primeira venda em aberto do cliente
                    const vendasEmAberto = parcelasEmCarteira.filter(
                      (p) => p.clienteId === id && p.status !== "Paga"
                    );

                    if (vendasEmAberto.length > 0) {
                      setVendaSelecionadaId(vendasEmAberto[0].idVenda);
                    }
                  }}
                >
                  <option value="">Selecione o cliente</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modalCampo">
                <label>Forma de pagamento:</label>
                <select
                  className="modalInput"
                  required
                  value={pagamentoForma}
                  onChange={(e) => setPagamentoForma(e.target.value)}
                >
                  <option value="">Selecione a forma</option>
                  {formasPagamento.map((fp) => (
                    <option key={fp} value={fp}>
                      {fp}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modalCampo">
                <label>Parcelamento:</label>
                <select className="modalInput" value={1} disabled>
                  <option value={1}>1x</option>
                </select>
              </div>

              <div className="modalCampo">
                <label>Valor a pagar:</label>
                <input
                  type="number"
                  required
                  className="modalInput"
                  placeholder="Valor"
                  value={pagamentoValor}
                  onChange={(e) => setPagamentoValor(e.target.value)}
                  min={1}
                  step="0.01"
                  disabled={!pagamentoClienteId}
                />
              </div>

              <div className="modalCampo">
                <label>Data:</label>
                <input
                  className="modalInput"
                  type="datetime-local"
                  value={dataPagamento}
                  disabled
                />
              </div>

              <div className="modalBotoes">
                <button className="btnPagar" type="submit">
                  Pagar
                </button>
                <button
                  className="btnCancelar"
                  type="button"
                  onClick={() => setModalPagamento(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
