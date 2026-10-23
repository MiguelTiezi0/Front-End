import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Pencil } from "lucide-react";
import { linkCompra } from "./linkCompra";
import { Link_Itens_Compra } from "../Itens_Compra/link_Itens_Compra";
import { linkFun } from "../../Gerenciamento/Funcionario/linkFun";
import { linkPro } from "../../Gerenciamento/Produto/linkPro";
import { useRequireAuth } from "../../../hooks/RequireAuth/useRequireAuth.jsx";

function currency(v) {
  return Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function DetalhesCompra() {
  useRequireAuth("Funcionario");
  document.title = "Detalhes da Compra";
  const { id } = useParams();
  const navigate = useNavigate();
  const [compra, setCompra] = useState(null);
  const [funcionario, setFuncionario] = useState(null);
  const [itens, setItens] = useState([]);
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    fetch(`${linkCompra}/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setCompra(data);
        if (data.funcionarioId) {
          fetch(`${linkFun}/${data.funcionarioId}`).then((r) => r.json()).then(setFuncionario).catch(() => {});
        }
      });

    fetch(`${Link_Itens_Compra}/compra/${id}`)
      .then((r) => r.json())
      .then((data) => setItens(Array.isArray(data) ? data : []));

    fetch(linkPro).then((r) => r.json()).then((d) => setProdutos(Array.isArray(d) ? d : []));
  }, [id]);

  if (!compra) return <p className="pdv-empty">Carregando detalhes da compra…</p>;

  return (
    <div className="pdv-page">
      <div className="pdv-header">
        <div>
          <Link to="/Compra/ListagemCompra" className="pdv-btn pdv-btn--ghost pdv-btn--sm" style={{ marginBottom: 10 }}>
            <ArrowLeft size={14} /> Voltar para compras
          </Link>
          <h1 className="pdv-title">{compra.descricao}</h1>
          <p className="pdv-subtitle">Compra #{compra.id}</p>
        </div>
        <button type="button" className="pdv-btn pdv-btn--primary" onClick={() => navigate(`/Compra/EditarCompra/${compra.id}`)}>
          <Pencil size={16} /> Editar compra
        </button>
      </div>

      <div className="pdv-card" style={{ padding: 22 }}>
        <dl className="pdv-detail-grid">
          <div className="pdv-detail-item"><dt>Funcionário</dt><dd>{funcionario?.nome || compra.funcionarioId || "—"}</dd></div>
          <div className="pdv-detail-item"><dt>Data</dt><dd>{compra.dataCompra ? new Date(compra.dataCompra).toLocaleString("pt-BR") : "—"}</dd></div>
        </dl>
      </div>

      <div className="pdv-stat-row">
        <dl className="pdv-stat"><dt>Qtd. de produtos</dt><dd>{compra.quantidadeDeProduto}</dd></dl>
        <dl className="pdv-stat"><dt>Valor total</dt><dd>{currency(compra.valorDaCompra)}</dd></dl>
      </div>

      <div>
        <h2 className="pdv-section-title">Itens da compra</h2>
        <div className="pdv-card">
          <div className="pdv-table-scroll">
            <table className="pdv-table">
              <thead>
                <tr><th>Produto</th><th>Qtd</th><th>Valor unitário</th><th>Subtotal</th></tr>
              </thead>
              <tbody>
                {itens.map((item) => {
                  const produto = produtos.find((p) => p.id === item.produtoId);
                  return (
                    <tr key={item.id}>
                      <td>{produto ? produto.descricao : item.produtoId}</td>
                      <td>{item.quantidade}</td>
                      <td>{currency(item.valorUnitario)}</td>
                      <td>{currency(item.subtotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {itens.length === 0 && <p className="pdv-empty">Nenhum item registrado nesta compra.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
