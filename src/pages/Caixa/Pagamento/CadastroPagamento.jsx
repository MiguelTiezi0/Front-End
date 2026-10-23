import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { linkPag } from "./linkPag";
import { linkFun } from "../../Gerenciamento/Funcionario/linkFun";
import { linkCli } from "../../Gerenciamento/Cliente/linkCli";
import { linkVen } from "../Venda/linkVen";
import { apiFetch } from "../../../utils/apiFetch";
import { useRequireAuth } from "../../../hooks/RequireAuth/useRequireAuth.jsx";

const FORMAS_PAGAMENTO = ["Dinheiro", "Débito", "Pix", "Crédito", "Crediário", "Consignação"];

export function CadastroPagamento() {
  useRequireAuth("Funcionario");
  document.title = "Novo Pagamento";
  const navigate = useNavigate();

  const [funcionarios, setFuncionarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [vendasEmAberto, setVendasEmAberto] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [pagamento, setPagamento] = useState({
    funcionarioId: "",
    clienteId: "",
    formaDePagamento: "",
    totalPago: "",
    totalDeVezes: 1,
    dataPagamento: new Date().toISOString().slice(0, 16),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [funcs, clis, vens] = await Promise.all([
          fetch(linkFun).then((r) => r.json()),
          fetch(linkCli).then((r) => r.json()),
          fetch(linkVen).then((r) => r.json()),
        ]);
        setFuncionarios(Array.isArray(funcs) ? funcs : []);
        setClientes(Array.isArray(clis) ? clis : []);
        setVendas(Array.isArray(vens) ? vens : []);
      } catch (error) {
        console.error(error);
        alert("Não foi possível carregar funcionários, clientes ou vendas.");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!pagamento.clienteId) {
      setVendasEmAberto([]);
      return;
    }
    const vendasDoCliente = vendas.filter((v) => String(v.clienteId) === String(pagamento.clienteId));
    setVendasEmAberto(vendasDoCliente.filter((v) => Number(v.totalPago || 0) < Number(v.valorTotal || 0)));
  }, [pagamento.clienteId, vendas]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPagamento((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);

    try {
      const pagamentoBody = {
        funcionarioId: Number(pagamento.funcionarioId),
        clienteId: Number(pagamento.clienteId),
        vendaId: vendasEmAberto.length > 0 ? vendasEmAberto[0].id : null,
        totalPago: Number(pagamento.totalPago),
        desconto: 0,
        formaDePagamento: [pagamento.formaDePagamento],
        totalDeVezes: Number(pagamento.totalDeVezes),
        dataPagamento: new Date(pagamento.dataPagamento).toISOString(),
      };

      const res = await fetch(linkPag, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pagamentoBody),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || "Erro ao registrar pagamento.");
      }

      // Distribui o valor pago entre as vendas em aberto do cliente (mais antigas primeiro),
      // usado pela tela de parcelas em carteira para saber o quanto já foi quitado de cada venda.
      let restante = Number(pagamento.totalPago);
      const ordenadas = [...vendasEmAberto].sort(
        (a, b) => new Date(a.dataVenda || 0) - new Date(b.dataVenda || 0)
      );
      for (const venda of ordenadas) {
        if (restante <= 0) break;
        const total = Number(venda.valorTotal || 0);
        const pago = Number(venda.totalPago || 0);
        const devido = total - pago;
        const valorParaPagar = Math.min(restante, devido);
        const novoTotalPago = pago + valorParaPagar;

        await fetch(`${linkVen}/${venda.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...venda, totalPago: novoTotalPago }),
        });
        restante -= valorParaPagar;
      }

      // Recalcula os totais do cliente a partir das vendas/pagamentos reais no servidor.
      await apiFetch(`/api/cliente/${pagamento.clienteId}/recalcular-totais`, { method: "PATCH" });

      if (pagamento.formaDePagamento === "Dinheiro") {
        await apiFetch("/api/caixa/entrada", {
          method: "POST",
          body: JSON.stringify({
            valor: Number(pagamento.totalPago),
            descricao: `Pagamento recebido do cliente ${pagamento.clienteId}`,
            tipo: "Entrada",
          }),
        });
      }

      navigate("/Pagamento/ListagemPagamento");
    } catch (error) {
      alert(error.message || "Erro inesperado ao cadastrar pagamento.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="pdv-page">
      <div className="pdv-header">
        <div>
          <h1 className="pdv-title">Novo pagamento</h1>
          <p className="pdv-subtitle">Registre um pagamento recebido de um cliente.</p>
        </div>
      </div>

      <form className="pdv-form-card" onSubmit={handleSubmit}>
        <div className="pdv-form-grid">
          <div>
            <label className="hp-lb">Funcionário *</label>
            <select className="hp-inp" name="funcionarioId" required value={pagamento.funcionarioId} onChange={handleChange}>
              <option value="">Selecione…</option>
              {funcionarios.map((f) => (
                <option key={f.id} value={f.id}>{f.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="hp-lb">Cliente *</label>
            <select className="hp-inp" name="clienteId" required value={pagamento.clienteId} onChange={handleChange}>
              <option value="">Selecione…</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
            {pagamento.clienteId && (
              <p className="pdv-hint">{vendasEmAberto.length} venda(s) em aberto para este cliente.</p>
            )}
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
            <input className="hp-inp" type="number" name="totalPago" required min={0} step="0.01" placeholder="0,00" value={pagamento.totalPago} onChange={handleChange} />
          </div>
          <div>
            <label className="hp-lb">Data do pagamento *</label>
            <input className="hp-inp" type="datetime-local" name="dataPagamento" required value={pagamento.dataPagamento} onChange={handleChange} />
          </div>
        </div>

        <div className="pdv-form-actions">
          <Link to="/Pagamento/ListagemPagamento" className="pdv-btn pdv-btn--ghost">Cancelar</Link>
          <button className="pdv-btn pdv-btn--primary" type="submit" disabled={salvando}>
            {salvando ? "Salvando…" : "Registrar pagamento"}
          </button>
        </div>
      </form>
    </div>
  );
}
