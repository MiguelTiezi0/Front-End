import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAlerta } from "../../../hooks/Alerta/useAlerta";

import { linkVen } from "./linkVen";
import { linkFun } from "../../Gerenciamento/Funcionario/linkFun";
import { linkCli } from "../../Gerenciamento/Cliente/linkCli";
import { linkVenItens } from "../ItensVenda/linkVenItens";
import { linkPro } from "../../Gerenciamento/Produto/linkPro";
import { linkPag } from "../Pagamento/linkPag";
import { apiFetch } from "../../../utils/apiFetch";
import { useRequireAuth } from "../../../hooks/RequireAuth/useRequireAuth.jsx";

// Funções auxiliares para estoque
const atualizarEstoque = async (produtoId, quantidade, operacao = 'subtrair') => {
  try {
    const response = await fetch(`${linkPro}/${produtoId}`);
    if (!response.ok) throw new Error(`Erro ao buscar produto ${produtoId}`);
    const produto = await response.json();

    const novaQuantidade = operacao === 'subtrair'
      ? produto.quantidade - quantidade
      : produto.quantidade + quantidade;

    if (novaQuantidade < 0) {
      throw new Error(`Quantidade insuficiente para o produto ${produto.descricao}`);
    }

    const updateResponse = await fetch(`${linkPro}/${produtoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...produto,
        quantidade: novaQuantidade,
        ativo: novaQuantidade > 0
      })
    });

    if (!updateResponse.ok) throw new Error(`Erro ao atualizar estoque do produto ${produtoId}`);
    return true;

  } catch (error) {
    console.error('Erro ao atualizar estoque:', error);
    throw error;
  }
};

const sincronizarItensVenda = async (itensOriginais, itensEditados, id) => {
  const alteracoes = [];

  try {
    for (const itemOriginal of itensOriginais) {
      const itemEditado = itensEditados.find(i => i.id === itemOriginal.id);

      if (!itemEditado) {
        await atualizarEstoque(
          itemOriginal.produtoId ?? itemOriginal.ProdutoId,
          itemOriginal.quantidade,
          'somar'
        );
        await fetch(`${linkVenItens}/${itemOriginal.id}`, { method: 'DELETE' });
        alteracoes.push({ tipo: 'removido', item: itemOriginal });
      }
    }

    for (const itemEditado of itensEditados) {
      if (itemEditado.id > 0) {
        const itemOriginal = itensOriginais.find(i => i.id === itemEditado.id);
        if (itemOriginal) {
          const diferenca = itemEditado.quantidade - itemOriginal.quantidade;

          if (diferenca !== 0) {
            await atualizarEstoque(
              itemEditado.produtoId,
              Math.abs(diferenca),
              diferenca < 0 ? 'somar' : 'subtrair'
            );
          }

          await fetch(`${linkVenItens}/${itemEditado.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(itemEditado)
          });
          alteracoes.push({ tipo: 'atualizado', item: itemEditado });
        }
      }
    }

    for (const itemNovo of itensEditados.filter(i => i.id < 0)) {
      await atualizarEstoque(itemNovo.produtoId, itemNovo.quantidade, 'subtrair');

      const response = await fetch(linkVenItens, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          VendaId: Number(id),
          ProdutoId: Number(itemNovo.produtoId),
          ValorDoItem: Number(itemNovo.valorDoItem),
          quantidade: Number(itemNovo.quantidade)
        })
      });

      if (!response.ok) throw new Error('Erro ao adicionar novo item');
      alteracoes.push({ tipo: 'adicionado', item: itemNovo });
    }

    return alteracoes;

  } catch (error) {
    console.error('Erro na sincronização, tentando reverter:', error);
    for (const alteracao of alteracoes) {
      try {
        if (alteracao.tipo === 'removido') {
          await atualizarEstoque(alteracao.item.produtoId, alteracao.item.quantidade, 'subtrair');
        } else if (alteracao.tipo === 'adicionado') {
          await atualizarEstoque(alteracao.item.produtoId, alteracao.item.quantidade, 'somar');
        }
      } catch (rollbackError) {
        console.error('Erro ao reverter alterações:', rollbackError);
      }
    }
    throw error;
  }
};

export function EditarVenda() {
  useRequireAuth("Funcionario");
  const { id } = useParams();
  const navigate = useNavigate();
  document.title = "Editar Venda";

  const [venda, setVenda] = useState({
    funcionarioId: "",
    clienteId: "",
    totalDeItens: 0,
    valorTotal: 0,
    formaDePagamento: [],
    dataVenda: "",
  });
  const [funcionarios, setFuncionarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [novoItem, setNovoItem] = useState({ produtoId: "", valorDoItem: "", quantidade: 1 });
  const [itensOriginais, setItensOriginais] = useState([]);
  const [itensEditados, setItensEditados] = useState([]);
  const [qtdParcelas, setQtdParcelas] = useState(1);
  const [totalPago, setTotalPago] = useState(0);

  const [descontoTipo, setDescontoTipo] = useState("");
  const [descontoValor, setDescontoValor] = useState("");

  const [valorPagoAntes, setValorPagoAntes] = useState(0);
  const [valorRestanteOriginal, setValorRestanteOriginal] = useState(0);

  const alerta = useAlerta();

  useEffect(() => {
    fetch(`${linkVen}/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setVenda({
          funcionarioId: data.funcionarioId,
          clienteId: data.clienteId,
          totalDeItens: data.totalDeItens,
          valorTotal: data.valorTotal,
          formaDePagamento: data.formaDePagamento || [],
          dataVenda: data.dataVenda ? data.dataVenda.slice(0, 16) : "",
        });
        setQtdParcelas(data.totalDeVezes || 1);
        setTotalPago(data.totalPago || 0);
        if (data.desconto) {
          setDescontoValor(data.desconto);
        }
      });
    fetch(linkFun).then((r) => r.json()).then((d) => setFuncionarios(Array.isArray(d) ? d : []));
    fetch(linkCli).then((r) => r.json()).then((d) => setClientes(Array.isArray(d) ? d : []));
    fetch(linkVenItens)
      .then((r) => r.json())
      .then((data) => {
        const lista = Array.isArray(data) ? data : [];
        const itensDaVenda = lista.filter((i) => Number(i.vendaId ?? i.VendaId) === Number(id));
        setItensOriginais(itensDaVenda);
        setItensEditados(itensDaVenda.map((item) => ({ ...item })));
      });
    fetch(linkPro).then((r) => r.json()).then((d) => setProdutos(Array.isArray(d) ? d : []));

    fetch(linkPag)
      .then((r) => r.json())
      .then((pagamentos) => {
        const lista = Array.isArray(pagamentos) ? pagamentos : [];
        const pagamento = lista.find((p) => Number(p.vendaId ?? p.VendaId) === Number(id));
        const valorPago = pagamento ? Number(pagamento.TotalPago ?? pagamento.totalPago ?? 0) : 0;
        setValorPagoAntes(valorPago);
      });
  }, [id]);

  useEffect(() => {
    const valorProdutos = itensEditados.reduce((acc, i) => acc + Number(i.valorDoItem) * Number(i.quantidade), 0);
    let desconto = 0;
    const valor = Number(descontoValor);
    if (descontoTipo === "porcentagem" && !isNaN(valor)) {
      desconto = valorProdutos * (valor / 100);
    } else if (descontoTipo === "decimal" && !isNaN(valor)) {
      desconto = valor;
    }
    setVenda((v) => ({
      ...v,
      valorTotal: Math.max(0, valorProdutos - desconto),
      totalDeItens: itensEditados.reduce((acc, i) => acc + Number(i.quantidade), 0),
    }));
  }, [itensEditados, descontoTipo, descontoValor]);

  useEffect(() => {
    setValorRestanteOriginal(Number(venda.valorTotal) - Number(valorPagoAntes));
  }, [venda.valorTotal, valorPagoAntes]);

  useEffect(() => {
    if (venda.clienteId === "0" || venda.clienteId === 0) {
      setTotalPago(venda.valorTotal);
    }
  }, [venda.clienteId, venda.valorTotal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVenda((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormaPagamentoChange = (e) => {
    setVenda((prev) => ({ ...prev, formaDePagamento: [e.target.value] }));
  };

  const handleCancelarItem = (itemId) => {
    setItensEditados((prev) =>
      prev
        .map((item) => (item.id === itemId ? { ...item, quantidade: item.quantidade - 1 } : item))
        .filter((item) => item.quantidade > 0)
    );
  };

  const handleAdicionarItem = () => {
    if (!novoItem.produtoId || !novoItem.valorDoItem || !novoItem.quantidade) {
      alert("Selecione um produto, quantidade e valor válidos.");
      return;
    }
    const tempId = Math.min(0, ...itensEditados.map((i) => i.id || 0)) - 1;
    setItensEditados([
      ...itensEditados,
      {
        id: tempId,
        vendaId: Number(id),
        produtoId: Number(novoItem.produtoId),
        valorDoItem: Number(novoItem.valorDoItem),
        quantidade: Number(novoItem.quantidade),
      },
    ]);
    setNovoItem({ produtoId: "", valorDoItem: "", quantidade: 1 });
  };

  const handleNovoItemChange = (e) => {
    const { name, value } = e.target;
    setNovoItem((i) => ({
      ...i,
      [name]: name === "quantidade" ? Number(value) : value,
      valorDoItem: name === "produtoId" ? produtos.find((p) => p.id === Number(value))?.precoVenda || "" : i.valorDoItem,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if ((venda.clienteId === "0" || venda.clienteId === 0) && Number(totalPago) < Number(venda.valorTotal)) {
        throw new Error("Cliente anônimo deve pagar o valor total da venda!");
      }

      await sincronizarItensVenda(itensOriginais, itensEditados, id);

      const valorProdutos = itensEditados.reduce((acc, i) => acc + Number(i.valorDoItem) * Number(i.quantidade), 0);
      const valor = Number(descontoValor);
      let desconto = 0;
      if (descontoTipo === "porcentagem" && !isNaN(valor)) {
        desconto = valorProdutos * (valor / 100);
      } else if (descontoTipo === "decimal" && !isNaN(valor)) {
        desconto = valor;
      }

      const pagamentosRes = await fetch(linkPag);
      let pagamentos = [];
      if (pagamentosRes.ok) {
        pagamentos = await pagamentosRes.json();
        const pagamento = pagamentos.find((p) => Number(p.vendaId ?? p.VendaId) === Number(id));
        if (pagamento) {
          await fetch(`${linkPag}/${pagamento.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...pagamento,
              totalPago: Number(totalPago),
              totalDeVezes: Number(qtdParcelas),
              formaDePagamento: Array.isArray(venda.formaDePagamento) ? venda.formaDePagamento : [venda.formaDePagamento],
              dataPagamento: new Date().toISOString(),
            }),
          });
        }
      }

      const clienteRes = await fetch(`${linkCli}/${venda.clienteId}`);
      if (clienteRes.ok) {
        await apiFetch(`/api/cliente/${venda.clienteId}/recalcular-totais`, { method: "PATCH" });
      }

      const pagamentoAnterior = pagamentos.find((p) => Number(p.vendaId ?? p.VendaId) === Number(id));
      const valorPagoAntesLocal = pagamentoAnterior ? Number(pagamentoAnterior.TotalPago ?? pagamentoAnterior.totalPago ?? 0) : 0;

      if (venda.formaDePagamento.includes("Dinheiro")) {
        if (valorPagoAntesLocal > 0) {
          const caixaRes = await apiFetch("/api/caixa/entrada", {
            method: "POST",
            body: JSON.stringify({
              valor: valorPagoAntesLocal,
              descricao: `Estorno edição venda ${id}`,
              tipo: "Saída",
            }),
          });
          if (!caixaRes.ok) {
            alert("Erro ao estornar valor do caixa!");
            return;
          }
        }
        if (Number(totalPago) > 0) {
          const caixaRes = await apiFetch("/api/caixa/entrada", {
            method: "POST",
            body: JSON.stringify({
              valor: Number(totalPago),
              descricao: `Novo valor edição venda ${id}`,
              tipo: "Entrada",
            }),
          });
          if (!caixaRes.ok) {
            alert("Erro ao adicionar valor ao caixa!");
            return;
          }
        }
      }

      const vendaBody = {
        id: Number(id),
        funcionarioId: Number(venda.funcionarioId),
        clienteId: Number(venda.clienteId),
        totalDeItens: Number(venda.totalDeItens),
        valorTotal: Number(valorProdutos - desconto),
        totalPago: Number(totalPago),
        formaDePagamento: Array.isArray(venda.formaDePagamento) ? venda.formaDePagamento : [venda.formaDePagamento],
        totalDeVezes: Number(qtdParcelas),
        dataVenda: new Date(venda.dataVenda).toISOString(),
        desconto: desconto,
        formaDeDesconto: descontoTipo ? [descontoTipo] : [],
      };

      const response = await fetch(`${linkVen}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vendaBody),
      });
      if (!response.ok) {
        alert("Erro ao atualizar a venda");
        return;
      }

      alerta("Venda atualizada com sucesso!", "success");
      navigate("/Venda/ListagemVenda");

    } catch (error) {
      console.error('Erro ao atualizar venda:', error);
      alerta(error.message || "Erro ao atualizar venda", "error");
    }
  };

  const formasPagamento = ["Dinheiro", "Débito", "Crédito", "Pix", "Crediário", "Consignação"];

  return (
    <div className="pdv-page">
      <div className="pdv-header">
        <div>
          <Link to="/Venda/ListagemVenda" className="pdv-btn pdv-btn--ghost pdv-btn--sm" style={{ marginBottom: 10 }}>
            <ArrowLeft size={14} /> Voltar para vendas
          </Link>
          <h1 className="pdv-title">Editar venda #{id}</h1>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
        <form className="pdv-form-card" onSubmit={handleSubmit}>
          <div className="pdv-form-grid">
            <div>
              <label className="hp-lb">Data da venda *</label>
              <input type="datetime-local" name="dataVenda" required className="hp-inp" value={venda.dataVenda} onChange={handleChange} />
            </div>
            <div>
              <label className="hp-lb">Cliente *</label>
              <select name="clienteId" required className="hp-inp" value={venda.clienteId} onChange={handleChange}>
                <option value="">Selecione um cliente</option>
                <option value="0">Cliente Anônimo</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="hp-lb">CPF do cliente</label>
              <input
                readOnly
                className="hp-inp"
                value={
                  venda.clienteId === "0" || venda.clienteId === 0
                    ? ""
                    : clientes.find((c) => c.id === Number(venda.clienteId))?.cpf || ""
                }
              />
            </div>
            <div>
              <label className="hp-lb">Funcionário *</label>
              <select name="funcionarioId" required className="hp-inp" value={venda.funcionarioId} onChange={handleChange}>
                <option value="">Selecione um funcionário</option>
                {funcionarios.map((f) => (
                  <option key={f.id} value={f.id}>{f.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="hp-lb">Forma de pagamento *</label>
              <select required className="hp-inp" value={venda.formaDePagamento[0] || ""} onChange={handleFormaPagamentoChange}>
                <option value="">Selecione</option>
                {formasPagamento.map((fp) => (
                  <option key={fp} value={fp}>{fp}</option>
                ))}
              </select>
            </div>
            {(venda.formaDePagamento.includes("Débito") || venda.formaDePagamento.includes("Crediário") || venda.formaDePagamento.includes("Crédito")) && (
              <div>
                <label className="hp-lb">Parcelas</label>
                <select className="hp-inp" value={qtdParcelas} onChange={(e) => setQtdParcelas(Number(e.target.value))}>
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}x</option>
                  ))}
                </select>
              </div>
            )}

            {(venda.formaDePagamento.includes("Pix") || venda.formaDePagamento.includes("Dinheiro")) && (
              <div className="pdv-form-col-full">
                <label className="hp-lb">Desconto</label>
                {!descontoTipo && (
                  <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5 }}>
                      <input type="checkbox" checked={descontoTipo === "porcentagem"} onChange={() => setDescontoTipo("porcentagem")} disabled={descontoTipo === "decimal"} />
                      Porcentagem
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5 }}>
                      <input type="checkbox" checked={descontoTipo === "decimal"} onChange={() => setDescontoTipo("decimal")} disabled={descontoTipo === "porcentagem"} />
                      Reais
                    </label>
                  </div>
                )}
                {descontoTipo && (
                  <input
                    className="hp-inp"
                    type="number"
                    min={0}
                    max={descontoTipo === "porcentagem" ? 100 : venda.valorTotal || 0}
                    value={descontoValor}
                    onChange={(e) => setDescontoValor(e.target.value)}
                    placeholder={descontoTipo === "porcentagem" ? "Desconto em %" : "Desconto em reais"}
                  />
                )}
              </div>
            )}

            <div>
              <label className="hp-lb">Total pago</label>
              <input
                type="number"
                className="hp-inp"
                value={totalPago === 0 ? "" : totalPago}
                onChange={(e) => setTotalPago(e.target.value)}
                placeholder={`R$ ${venda.valorTotal.toFixed(2)}`}
                min={0}
                max={venda.valorTotal}
              />
            </div>
            <div>
              <label className="hp-lb">Valor restante</label>
              <input className="hp-inp" disabled style={{ fontWeight: 700 }} value={`R$ ${valorRestanteOriginal.toFixed(2)}`} />
            </div>

            <div className="pdv-form-col-full" style={{ borderTop: "1px solid var(--border-default)", paddingTop: 16, marginTop: 4 }}>
              <label className="hp-lb">Adicionar produto</label>
              <div style={{ display: "flex", gap: 10 }}>
                <select name="produtoId" className="hp-inp" value={novoItem.produtoId} onChange={handleNovoItemChange}>
                  <option value="">Produto</option>
                  {produtos.map((p) => (
                    <option key={p.id} value={p.id}>{p.descricao} (Estoque: {p.quantidade})</option>
                  ))}
                </select>
                <input
                  name="quantidade"
                  type="number"
                  min={1}
                  className="hp-inp"
                  value={novoItem.quantidade === 0 ? "" : novoItem.quantidade}
                  onChange={handleNovoItemChange}
                  placeholder={novoItem.produtoId ? `Qtd (máx ${produtos.find((p) => p.id === Number(novoItem.produtoId))?.quantidade || 1})` : "Quantidade"}
                  style={{ maxWidth: 160 }}
                />
                <button type="button" className="pdv-btn pdv-btn--ghost" onClick={handleAdicionarItem} style={{ flexShrink: 0 }}>
                  Adicionar
                </button>
              </div>
            </div>
          </div>

          <div className="pdv-form-actions">
            <Link to="/Venda/ListagemVenda" className="pdv-btn pdv-btn--ghost">Cancelar</Link>
            <button type="submit" className="pdv-btn pdv-btn--primary">Salvar alterações</button>
          </div>
        </form>

        <div className="pdv-card">
          <div className="pdv-table-scroll">
            <table className="pdv-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Qtd</th>
                  <th>Valor uni.</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {itensEditados.length === 0 ? (
                  <tr><td colSpan={4}><p className="pdv-empty">Nenhum item.</p></td></tr>
                ) : (
                  itensEditados.map((item) => {
                    const produto = produtos.find((p) => p.id === Number(item.produtoId ?? item.ProdutoId));
                    return (
                      <tr key={item.id}>
                        <td>{produto ? produto.descricao : "Produto removido"}</td>
                        <td>{item.quantidade}</td>
                        <td>R$ {Number(item.valorDoItem).toFixed(2)}</td>
                        <td>
                          <button
                            type="button"
                            className="pdv-btn pdv-btn--ghost pdv-btn--sm"
                            disabled={item.quantidade < 1}
                            onClick={() => handleCancelarItem(item.id)}
                          >
                            Cancelar 1
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "14px 16px", borderTop: "1px solid var(--border-default)", fontSize: 14 }}>
            Valor total: <strong>R$ {venda.valorTotal.toFixed(2)}</strong>
            {descontoTipo && descontoValor && (
              <span style={{ marginLeft: 16, color: "var(--success-fg)" }}>
                (Desconto: {descontoTipo === "porcentagem" ? `${descontoValor}%` : `R$ ${Number(descontoValor).toFixed(2)}`})
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
