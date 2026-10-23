import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Pencil } from "lucide-react";
import { linkVen } from "./linkVen";
import { linkFun } from "../../Gerenciamento/Funcionario/linkFun";
import { linkCli } from "../../Gerenciamento/Cliente/linkCli";
import { linkVenItens } from "../ItensVenda/linkVenItens";
import { linkPro } from "../../Gerenciamento/Produto/linkPro";
import { useRequireAuth } from "../../../hooks/RequireAuth/useRequireAuth.jsx";

function statusVenda(venda) {
  const total = Number(venda.valorTotal || 0);
  const pago = Number(venda.totalPago || 0);
  if (total > 0 && pago >= total) return { label: "Paga", className: "pdv-pill--success" };
  if (pago > 0) return { label: "Parcial", className: "pdv-pill--warning" };
  return { label: "Em aberto", className: "pdv-pill--danger" };
}

export function DetalhesVenda() {
  useRequireAuth("Funcionario");
  const { id } = useParams();
  const [venda, setVenda] = useState(null);
  const [funcionario, setFuncionario] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [itens, setItens] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${linkVen}/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setVenda(data);
        fetch(`${linkFun}/${data.funcionarioId}`).then((r) => r.json()).then(setFuncionario);
        if (data.clienteId && Number(data.clienteId) !== 0) {
          fetch(`${linkCli}/${data.clienteId}`).then((r) => r.json()).then(setCliente);
        } else {
          setCliente({ nome: "Anônimo", cpf: null });
        }
      });
    fetch(linkVenItens)
      .then((r) => r.json())
      .then((data) => {
        const lista = Array.isArray(data) ? data : [];
        setItens(lista.filter((i) => Number(i.vendaId ?? i.VendaId) === Number(id)));
      });
    fetch(linkPro).then((r) => r.json()).then((d) => setProdutos(Array.isArray(d) ? d : []));
  }, [id]);

  if (!venda || !funcionario || !cliente) return <p className="pdv-empty">Carregando detalhes da venda…</p>;

  const status = statusVenda(venda);
  const restante = Number(venda.valorTotal) - Number(venda.totalPago);

  return (
    <div className="pdv-page">
      <div className="pdv-header">
        <div>
          <Link to="/Venda/ListagemVenda" className="pdv-btn pdv-btn--ghost pdv-btn--sm" style={{ marginBottom: 10 }}>
            <ArrowLeft size={14} /> Voltar para vendas
          </Link>
          <h1 className="pdv-title">Venda #{venda.id}</h1>
          <p className="pdv-subtitle">
            {new Date(venda.dataVenda).toLocaleString("pt-BR")} · <span className={`pdv-pill ${status.className}`}>{status.label}</span>
          </p>
        </div>
        <button type="button" className="pdv-btn pdv-btn--primary" onClick={() => navigate(`/Venda/EditarVenda/${id}`)}>
          <Pencil size={16} /> Editar venda
        </button>
      </div>

      <div className="pdv-card" style={{ padding: 22 }}>
        <dl className="pdv-detail-grid">
          <div className="pdv-detail-item"><dt>Funcionário</dt><dd>{funcionario.nome}</dd></div>
          <div className="pdv-detail-item"><dt>Cliente</dt><dd>{cliente.nome}</dd></div>
          <div className="pdv-detail-item"><dt>CPF do cliente</dt><dd>{cliente.cpf || "Não informado"}</dd></div>
          <div className="pdv-detail-item"><dt>Forma de pagamento</dt><dd>{Array.isArray(venda.formaDePagamento) ? venda.formaDePagamento.join(", ") : venda.formaDePagamento}</dd></div>
          <div className="pdv-detail-item"><dt>Parcelas</dt><dd>{Number(venda.totalDeVezes)}x</dd></div>
          <div className="pdv-detail-item"><dt>Desconto</dt><dd>R$ {Number(venda.desconto ?? 0).toFixed(2)}</dd></div>
        </dl>
      </div>

      <div className="pdv-stat-row">
        <dl className="pdv-stat"><dt>Valor total</dt><dd>R$ {Number(venda.valorTotal).toFixed(2)}</dd></dl>
        <dl className="pdv-stat"><dt>Total pago</dt><dd>R$ {Number(venda.totalPago).toFixed(2)}</dd></dl>
        <dl className="pdv-stat"><dt>Restante</dt><dd>R$ {restante.toFixed(2)}</dd></dl>
      </div>

      <div>
        <h2 className="pdv-section-title">Itens da venda</h2>
        <div className="pdv-card">
          <div className="pdv-table-scroll">
            <table className="pdv-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Quantidade</th>
                  <th>Valor unitário</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {itens.map((item) => {
                  const produto = produtos.find((p) => p.id === Number(item.produtoId ?? item.ProdutoId));
                  const valorUni = Number(item.valorDoItem ?? item.ValorDoItem);
                  return (
                    <tr key={item.id}>
                      <td>{produto ? produto.descricao : (item.produtoId ?? item.ProdutoId)}</td>
                      <td>{item.quantidade}</td>
                      <td>R$ {valorUni.toFixed(2)}</td>
                      <td>R$ {(valorUni * item.quantidade).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {itens.length === 0 && <p className="pdv-empty">Nenhum item encontrado para esta venda.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
