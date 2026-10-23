import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Pencil } from "lucide-react";
import { linkFun } from "./linkFun";
import { linkVen } from "../../Caixa/Venda/linkVen";
import { useRequireAuth } from "../../../hooks/RequireAuth/useRequireAuth.jsx";

function formatarData(dataISO) {
  if (!dataISO) return "—";
  return new Date(dataISO).toLocaleDateString("pt-BR");
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function DetalhesFuncionario() {
  useRequireAuth("Funcionario");
  const { id } = useParams();
  const navigate = useNavigate();
  const [funcionario, setFuncionario] = useState(null);
  const [vendas, setVendas] = useState([]);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  useEffect(() => {
    const carregar = async () => {
      try {
        const response = await fetch(`${linkFun}/${id}`);
        if (!response.ok) throw new Error("Erro ao buscar detalhes do funcionário");
        setFuncionario(await response.json());

        const vendasResp = await fetch(linkVen);
        if (vendasResp.ok) {
          const todasVendas = await vendasResp.json();
          setVendas(
            Array.isArray(todasVendas)
              ? todasVendas.filter((v) => Number(v.funcionarioId) === Number(id))
              : []
          );
        }
      } catch (error) {
        console.error(error);
        alert("Não foi possível carregar os detalhes do funcionário.");
      }
    };
    carregar();
  }, [id]);

  if (!funcionario) {
    return <p className="pdv-empty">Carregando detalhes do funcionário…</p>;
  }

  const vendasFiltradas = vendas
    .slice()
    .sort((a, b) => new Date(b.dataVenda) - new Date(a.dataVenda))
    .filter((v) => {
      if (!dataInicio || !dataFim) return true;
      const dataVenda = new Date(v.dataVenda);
      return dataVenda >= new Date(`${dataInicio}T00:00:00`) && dataVenda <= new Date(`${dataFim}T23:59:59`);
    });

  const totalVendasFiltradas = vendasFiltradas.reduce((acc, v) => acc + Number(v.valorTotal || 0), 0);

  return (
    <div className="pdv-page">
      <div className="pdv-header">
        <div>
          <Link to="/Funcionario/ListagemFuncionario" className="pdv-btn pdv-btn--ghost pdv-btn--sm" style={{ marginBottom: 10 }}>
            <ArrowLeft size={14} /> Voltar para funcionários
          </Link>
          <h1 className="pdv-title">{funcionario.nome}</h1>
          <p className="pdv-subtitle">Funcionário #{funcionario.id} · {funcionario.nivelAcesso}</p>
        </div>
        <button type="button" className="pdv-btn pdv-btn--primary" onClick={() => navigate(`/Funcionario/EditarFuncionario/${id}`)}>
          <Pencil size={16} /> Editar funcionário
        </button>
      </div>

      <div className="pdv-card" style={{ padding: 22 }}>
        <dl className="pdv-detail-grid">
          <div className="pdv-detail-item"><dt>CPF</dt><dd>{funcionario.cpf || "—"}</dd></div>
          <div className="pdv-detail-item"><dt>Telefone</dt><dd>{funcionario.telefone || "—"}</dd></div>
          <div className="pdv-detail-item"><dt>Endereço</dt><dd>{funcionario.endereco || "—"}</dd></div>
          <div className="pdv-detail-item"><dt>Data de nascimento</dt><dd>{formatarData(funcionario.dataNascimento)}</dd></div>
          <div className="pdv-detail-item"><dt>Data de contratação</dt><dd>{formatarData(funcionario.dataContratacao)}</dd></div>
          <div className="pdv-detail-item"><dt>Salário</dt><dd>{formatarMoeda(funcionario.salario)}</dd></div>
          <div className="pdv-detail-item"><dt>Usuário</dt><dd>{funcionario.usuario || "—"}</dd></div>
          <div className="pdv-detail-item">
            <dt>Status</dt>
            <dd>
              <span className={`pdv-pill ${funcionario.ativo ? "pdv-pill--success" : "pdv-pill--neutral"}`}>
                {funcionario.ativo ? "Ativo" : "Inativo"}
              </span>
            </dd>
          </div>
        </dl>
      </div>

      <div>
        <h2 className="pdv-section-title">Vendas realizadas</h2>
        <div className="pdv-toolbar" style={{ marginBottom: 12 }}>
          <div className="pdv-toolbar-dates">
            <label>De</label>
            <input type="date" value={dataInicio} max={dataFim || undefined} onChange={(e) => setDataInicio(e.target.value)} />
            <label>até</label>
            <input type="date" value={dataFim} min={dataInicio || undefined} onChange={(e) => setDataFim(e.target.value)} />
          </div>
        </div>
        <div className="pdv-card">
          <div className="pdv-table-scroll">
            <table className="pdv-table">
              <thead>
                <tr>
                  <th>Venda</th>
                  <th>Data</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {vendasFiltradas.map((v) => (
                  <tr key={v.id}>
                    <td>#{v.id}</td>
                    <td>{formatarData(v.dataVenda)}</td>
                    <td>{formatarMoeda(v.valorTotal)}</td>
                    <td>
                      <Link to={`/Venda/DetalhesVenda/${v.id}`} className="pdv-btn pdv-btn--ghost pdv-btn--sm">
                        Ver venda
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan={2}>{dataInicio && dataFim ? "Total filtrado" : "Total geral"}</th>
                  <th colSpan={2}>{formatarMoeda(totalVendasFiltradas)}</th>
                </tr>
              </tfoot>
            </table>
            {vendasFiltradas.length === 0 && <p className="pdv-empty">Nenhuma venda encontrada.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
