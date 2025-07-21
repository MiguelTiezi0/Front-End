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
  const [clienteSelecionado, setClienteSelecionado] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  useEffect(() => {
    Promise.all([
      fetch(linkCli).then((r) => r.json()),
      fetch(linkVen).then((r) => r.json()),
    ]).then(([clientes, vendas]) => {
      setClientes(clientes);
      setVendas(vendas);
    });
  }, []);

  const vendasNorm = vendas.map((v) => {
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

  const parcelasEmCarteira = [];

  vendasNorm
    .filter((v) => {
      const forma = String(v.formaDePagamento).toLowerCase();
      return forma.includes("carteira") || forma.includes("crediário");
    })
    .filter((v) => {
      if (
        clienteSelecionado &&
        String(v.clienteId) !== String(clienteSelecionado)
      ) {
        return false;
      }
      return true;
    })
    .forEach((v) => {
      const parcelas = v.totalDeVezes || 1;
      const valorParcela = v.valorTotal / parcelas;
      const dataVenda = new Date(v.dataVenda);
      let totalPagoRestante = v.totalPago;

      const clienteNome =
        clientes.find((c) => String(c.id) === String(v.clienteId))?.nome ||
        "Desconhecido";

      for (let i = 0; i < parcelas; i++) {
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

        parcelasEmCarteira.push({
          idVenda: v.id,
          cliente: clienteNome,
          vencimento,
          parcela: i + 1,
          totalParcelas: parcelas,
          valorParcela,
          valorPago,
          status,
        });
      }
    });

  // ✅ Ordenar: vencidas, vencendo até 3 dias, em aberto, pagas no final
  const parcelasFiltradas = parcelasEmCarteira
    .filter((p) => {
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

      // dentro do mesmo grupo, ordenar por data de vencimento
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
        <div className="filtrosPagamentoDevedor">
          <label>Cliente:</label>
          <select
            value={clienteSelecionado}
            onChange={(e) => setClienteSelecionado(e.target.value)}
          >
            <option value="">Todos</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>

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
    </div>
  );
}
