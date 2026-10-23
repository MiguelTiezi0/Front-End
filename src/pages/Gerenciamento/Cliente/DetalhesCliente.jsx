import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Pencil } from "lucide-react";
import { linkCli } from "./linkCli";
import { linkVen } from "../../Caixa/Venda/linkVen";
import { useRequireAuth } from "../../../hooks/RequireAuth/useRequireAuth.jsx";

function formatarData(dataISO) {
  if (!dataISO) return "—";
  return new Date(dataISO).toLocaleDateString("pt-BR");
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function statusVenda(venda) {
  const total = Number(venda.valorTotal || 0);
  const pago = Number(venda.totalPago || 0);
  if (total > 0 && pago >= total) return { label: "Paga", className: "pdv-pill--success" };
  if (pago > 0) return { label: "Parcial", className: "pdv-pill--warning" };
  return { label: "Em aberto", className: "pdv-pill--danger" };
}

export function DetalhesCliente() {
  useRequireAuth("Funcionario");
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null);
  const [vendas, setVendas] = useState([]);

  useEffect(() => {
    const carregar = async () => {
      try {
        // Mantém os totais do cliente em dia com as vendas registradas.
        const recalculo = await fetch(`${linkCli}/${id}/recalcular-totais`, { method: "PATCH" });
        const clienteAtualizado = recalculo.ok ? await recalculo.json() : null;

        const clienteResp = clienteAtualizado
          ? clienteAtualizado
          : await (await fetch(`${linkCli}/${id}`)).json();
        setCliente(clienteResp);

        const vendasResp = await fetch(linkVen);
        if (vendasResp.ok) {
          const todasVendas = await vendasResp.json();
          setVendas(
            Array.isArray(todasVendas)
              ? todasVendas.filter((v) => Number(v.clienteId) === Number(id))
              : []
          );
        }
      } catch (error) {
        console.error(error);
        alert("Não foi possível carregar os detalhes do cliente.");
      }
    };
    carregar();
  }, [id]);

  if (!cliente) {
    return <p className="pdv-empty">Carregando detalhes do cliente…</p>;
  }

  return (
    <div className="pdv-page">
      <div className="pdv-header">
        <div>
          <Link to="/Cliente/ListagemCliente" className="pdv-btn pdv-btn--ghost pdv-btn--sm" style={{ marginBottom: 10 }}>
            <ArrowLeft size={14} /> Voltar para clientes
          </Link>
          <h1 className="pdv-title">{cliente.nome}</h1>
          <p className="pdv-subtitle">Cliente #{cliente.id}</p>
        </div>
        <button type="button" className="pdv-btn pdv-btn--primary" onClick={() => navigate(`/Cliente/EditarCliente/${id}`)}>
          <Pencil size={16} /> Editar cliente
        </button>
      </div>

      <div className="pdv-card" style={{ padding: 22 }}>
        <dl className="pdv-detail-grid">
          <div className="pdv-detail-item"><dt>CPF</dt><dd>{cliente.cpf || "—"}</dd></div>
          <div className="pdv-detail-item"><dt>Telefone</dt><dd>{cliente.telefone || "—"}</dd></div>
          <div className="pdv-detail-item"><dt>Endereço</dt><dd>{cliente.endereco || "—"}</dd></div>
          <div className="pdv-detail-item"><dt>Data de nascimento</dt><dd>{formatarData(cliente.dataNascimento)}</dd></div>
          <div className="pdv-detail-item"><dt>Usuário</dt><dd>{cliente.usuario || "—"}</dd></div>
          <div className="pdv-detail-item"><dt>Limite de crédito</dt><dd>{formatarMoeda(cliente.limiteDeCredito)}</dd></div>
        </dl>
      </div>

      <div className="pdv-stat-row">
        <dl className="pdv-stat"><dt>Total gasto</dt><dd>{formatarMoeda(cliente.totalGasto)}</dd></dl>
        <dl className="pdv-stat"><dt>Total pago</dt><dd>{formatarMoeda(cliente.totalPago)}</dd></dl>
        <dl className="pdv-stat"><dt>Total devido</dt><dd>{formatarMoeda(cliente.totalDevido)}</dd></dl>
      </div>

      <div>
        <h2 className="pdv-section-title">Compras do cliente</h2>
        <div className="pdv-card">
          <div className="pdv-table-scroll">
            <table className="pdv-table">
              <thead>
                <tr>
                  <th>Venda</th>
                  <th>Data</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {vendas
                  .slice()
                  .sort((a, b) => new Date(b.dataVenda) - new Date(a.dataVenda))
                  .map((v) => {
                    const status = statusVenda(v);
                    return (
                      <tr key={v.id}>
                        <td>#{v.id}</td>
                        <td>{formatarData(v.dataVenda)}</td>
                        <td>{formatarMoeda(v.valorTotal)}</td>
                        <td><span className={`pdv-pill ${status.className}`}>{status.label}</span></td>
                        <td>
                          <Link to={`/Venda/DetalhesVenda/${v.id}`} className="pdv-btn pdv-btn--ghost pdv-btn--sm">
                            Ver venda
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            {vendas.length === 0 && <p className="pdv-empty">Este cliente ainda não tem compras registradas.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
