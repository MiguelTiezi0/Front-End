import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { linkPag } from "./linkPag";
import { linkFun } from "../../Gerenciamento/Funcionario/linkFun";
import { linkCli } from "../../Gerenciamento/Cliente/linkCli";
import { linkVen } from "../Venda/linkVen";
import { apiFetch } from "../../../utils/apiFetch";
import { useRequireAuth } from "../../../hooks/RequireAuth/useRequireAuth.jsx";

const FORMAS_PAGAMENTO = ["Dinheiro", "Débito", "Pix", "Crédito", "Crediário", "Consignação"];

export function EditarPagamento() {
  useRequireAuth("Funcionario");
  document.title = "Editar Pagamento";
  const { id } = useParams();
  const navigate = useNavigate();

  const [funcionarios, setFuncionarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [pagamento, setPagamento] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [totalDevidoCliente, setTotalDevidoCliente] = useState(0);
  const [valorPagoOriginal, setValorPagoOriginal] = useState(0);

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const [funcs, clis, pagamentoData] = await Promise.all([
          fetch(linkFun).then((r) => r.json()),
          fetch(linkCli).then((r) => r.json()),
          fetch(`${linkPag}/${id}`).then((r) => r.json()),
        ]);
        setFuncionarios(Array.isArray(funcs) ? funcs : []);
        setClientes(Array.isArray(clis) ? clis : []);

        const valorAntes = Number(pagamentoData.totalPago || 0);
        setValorPagoOriginal(valorAntes);

        if (pagamentoData.clienteId) {
          const clienteAtual = await fetch(`${linkCli}/${pagamentoData.clienteId}`).then((r) => r.json());
          setTotalDevidoCliente(Number(clienteAtual.totalDevido || 0));
        }

        setPagamento({
          funcionarioId: pagamentoData.funcionarioId ?? "",
          clienteId: pagamentoData.clienteId ?? "",
          vendaId: pagamentoData.vendaId ?? null,
          formaDePagamento: Array.isArray(pagamentoData.formaDePagamento)
            ? pagamentoData.formaDePagamento[0] || ""
            : pagamentoData.formaDePagamento || "",
          totalPago: valorAntes,
          totalDeVezes: pagamentoData.totalDeVezes ?? 1,
          dataPagamento: pagamentoData.dataPagamento ? pagamentoData.dataPagamento.slice(0, 16) : new Date().toISOString().slice(0, 16),
        });
      } catch (error) {
        console.error(error);
        alert("Não foi possível carregar os dados do pagamento.");
      }
    };
    fetchDados();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPagamento((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);

    try {
      const novoTotalPago = Number(pagamento.totalPago || 0);
      const delta = novoTotalPago - valorPagoOriginal; // > 0: pagamento a mais, < 0: estorno

      // Ajusta o caixa somente para pagamentos em dinheiro.
      if (pagamento.formaDePagamento === "Dinheiro" && delta !== 0) {
        await apiFetch("/api/caixa/entrada", {
          method: "POST",
          body: JSON.stringify({
            valor: Math.abs(delta),
            descricao: `Ajuste do pagamento #${id}`,
            tipo: delta > 0 ? "Entrada" : "Saída",
          }),
        });
      }

      // Redistribui o delta entre as vendas do cliente (mantém a tela de parcelas em carteira coerente).
      if (delta !== 0 && pagamento.clienteId) {
        const vendasCliente = await fetch(linkVen)
          .then((r) => r.json())
          .then((vs) => (Array.isArray(vs) ? vs.filter((v) => Number(v.clienteId) === Number(pagamento.clienteId)) : []));

        if (delta < 0) {
          let aEstornar = -delta;
          const desc = [...vendasCliente].sort((a, b) => new Date(b.dataVenda || 0) - new Date(a.dataVenda || 0));
          for (const venda of desc) {
            if (aEstornar <= 0) break;
            const pago = Number(venda.totalPago || 0);
            const valorEstornar = Math.min(pago, aEstornar);
            await fetch(`${linkVen}/${venda.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...venda, totalPago: pago - valorEstornar }),
            });
            aEstornar -= valorEstornar;
          }
        } else {
          let restante = delta;
          const abertas = vendasCliente
            .filter((v) => Number(v.totalPago || 0) < Number(v.valorTotal || 0))
            .sort((a, b) => new Date(a.dataVenda || 0) - new Date(b.dataVenda || 0));
          for (const venda of abertas) {
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
        }
      }

      const pagamentoBody = {
        funcionarioId: Number(pagamento.funcionarioId),
        clienteId: Number(pagamento.clienteId),
        vendaId: pagamento.vendaId,
        totalPago: novoTotalPago,
        desconto: 0,
        formaDePagamento: [pagamento.formaDePagamento],
        totalDeVezes: Number(pagamento.totalDeVezes),
        dataPagamento: new Date(pagamento.dataPagamento).toISOString(),
      };

      const res = await fetch(`${linkPag}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pagamentoBody),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || "Erro ao atualizar pagamento.");
      }

      if (pagamento.clienteId) {
        await apiFetch(`/api/cliente/${pagamento.clienteId}/recalcular-totais`, { method: "PATCH" });
      }

      navigate("/Pagamento/ListagemPagamento");
    } catch (error) {
      alert(error.message || "Erro inesperado ao editar pagamento.");
    } finally {
      setSalvando(false);
    }
  };

  if (!pagamento) {
    return <p className="pdv-empty">Carregando dados do pagamento…</p>;
  }

  return (
    <div className="pdv-page">
      <div className="pdv-header">
        <div>
          <Link to="/Pagamento/ListagemPagamento" className="pdv-btn pdv-btn--ghost pdv-btn--sm" style={{ marginBottom: 10 }}>
            <ArrowLeft size={14} /> Voltar para pagamentos
          </Link>
          <h1 className="pdv-title">Editar pagamento #{id}</h1>
        </div>
      </div>

      <form className="pdv-form-card" onSubmit={handleSubmit}>
        <div className="pdv-form-grid">
          <div>
            <label className="hp-lb">Funcionário *</label>
            <select className="hp-inp" name="funcionarioId" required value={pagamento.funcionarioId} onChange={handleChange}>
              <option value="">Selecione…</option>
              {funcionarios.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="hp-lb">Cliente *</label>
            <select className="hp-inp" name="clienteId" required value={pagamento.clienteId} onChange={handleChange}>
              <option value="">Selecione…</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>

          <div className="pdv-form-col-full">
            <p className="pdv-hint">Total devido do cliente (antes desta edição): {totalDevidoCliente.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
          </div>

          <div>
            <label className="hp-lb">Forma de pagamento *</label>
            <select className="hp-inp" name="formaDePagamento" required value={pagamento.formaDePagamento} onChange={handleChange}>
              <option value="">Selecione…</option>
              {FORMAS_PAGAMENTO.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="hp-lb">Total de vezes *</label>
            <input className="hp-inp" type="number" name="totalDeVezes" required min={1} value={pagamento.totalDeVezes} onChange={handleChange} />
          </div>

          <div>
            <label className="hp-lb">Valor pago *</label>
            <input className="hp-inp" type="number" name="totalPago" required min={0} step="0.01" value={pagamento.totalPago} onChange={handleChange} />
          </div>
          <div>
            <label className="hp-lb">Data do pagamento *</label>
            <input className="hp-inp" type="datetime-local" name="dataPagamento" required value={pagamento.dataPagamento} onChange={handleChange} />
          </div>
        </div>

        <div className="pdv-form-actions">
          <Link to="/Pagamento/ListagemPagamento" className="pdv-btn pdv-btn--ghost">Cancelar</Link>
          <button className="pdv-btn pdv-btn--primary" type="submit" disabled={salvando}>
            {salvando ? "Salvando…" : "Salvar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
