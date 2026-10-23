import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Pencil } from "lucide-react";
import { linkPag } from "./linkPag";
import { linkFun } from "../../Gerenciamento/Funcionario/linkFun";
import { linkCli } from "../../Gerenciamento/Cliente/linkCli";
import { linkVen } from "../Venda/linkVen";
import { useRequireAuth } from "../../../hooks/RequireAuth/useRequireAuth.jsx";

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function DetalhesPagamento() {
  useRequireAuth("Funcionario");
  const { id } = useParams();
  const navigate = useNavigate();

  const [pagamento, setPagamento] = useState(null);
  const [funcionario, setFuncionario] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [venda, setVenda] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      try {
        const data = await fetch(`${linkPag}/${id}`).then((r) => r.json());
        setPagamento(data);

        const [f, c, v] = await Promise.all([
          data.funcionarioId ? fetch(`${linkFun}/${data.funcionarioId}`).then((r) => (r.ok ? r.json() : null)) : null,
          data.clienteId ? fetch(`${linkCli}/${data.clienteId}`).then((r) => (r.ok ? r.json() : null)) : null,
          data.vendaId ? fetch(`${linkVen}/${data.vendaId}`).then((r) => (r.ok ? r.json() : null)) : null,
        ]);
        setFuncionario(f);
        setCliente(c);
        setVenda(v);
      } catch (error) {
        console.error(error);
        alert("Não foi possível carregar os detalhes do pagamento.");
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, [id]);

  if (carregando || !pagamento) {
    return <p className="pdv-empty">Carregando detalhes do pagamento…</p>;
  }

  return (
    <div className="pdv-page">
      <div className="pdv-header">
        <div>
          <Link to="/Pagamento/ListagemPagamento" className="pdv-btn pdv-btn--ghost pdv-btn--sm" style={{ marginBottom: 10 }}>
            <ArrowLeft size={14} /> Voltar para pagamentos
          </Link>
          <h1 className="pdv-title">Pagamento #{pagamento.id}</h1>
        </div>
        <button type="button" className="pdv-btn pdv-btn--primary" onClick={() => navigate(`/Pagamento/EditarPagamento/${pagamento.id}`)}>
          <Pencil size={16} /> Editar
        </button>
      </div>

      <div className="pdv-card" style={{ padding: 22 }}>
        <dl className="pdv-detail-grid">
          <div className="pdv-detail-item"><dt>Funcionário</dt><dd>{funcionario?.nome || "—"}</dd></div>
          <div className="pdv-detail-item"><dt>Cliente</dt><dd>{cliente?.nome || "Anônimo"}</dd></div>
          <div className="pdv-detail-item"><dt>Venda associada</dt><dd>{venda ? `#${venda.id}` : "—"}</dd></div>
          <div className="pdv-detail-item"><dt>Forma de pagamento</dt><dd>{Array.isArray(pagamento.formaDePagamento) ? pagamento.formaDePagamento.join(", ") : pagamento.formaDePagamento || "—"}</dd></div>
          <div className="pdv-detail-item"><dt>Total pago</dt><dd>{formatarMoeda(pagamento.totalPago)}</dd></div>
          <div className="pdv-detail-item"><dt>Total de vezes</dt><dd>{pagamento.totalDeVezes || 1}x</dd></div>
          <div className="pdv-detail-item"><dt>Data do pagamento</dt><dd>{pagamento.dataPagamento ? new Date(pagamento.dataPagamento).toLocaleString("pt-BR") : "—"}</dd></div>
        </dl>
      </div>
    </div>
  );
}
