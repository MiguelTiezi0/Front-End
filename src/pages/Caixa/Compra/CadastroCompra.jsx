import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { linkFun } from "../../Gerenciamento/Funcionario/linkFun";
import { linkPro } from "../../Gerenciamento/Produto/linkPro";
import { linkCompra } from "./linkCompra";
import { Link_Itens_Compra } from "../Itens_Compra/link_Itens_Compra";
import "./Compra.css";

/* Helpers de formatação */
function formatDateToInput(date) {
  const d = new Date(date);
  return d.toISOString().slice(0, 16);
}
function formatDateToBR(dateString) {
  const d = new Date(dateString);
  return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}
function currency(v) {
  return Number(v || 0).toFixed(2);
}

/* Componente */
export function CadastroCompra() {
  const navigate = useNavigate();

  const [funcionarios, setFuncionarios] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [itens, setItens] = useState([]);
  const [compra, setCompra] = useState({
    funcionarioId: "",
    descricao: "",
    quantidadeDeProduto: 0,
    quantidadeAtual: 0,
    valorDaCompra: 0,
    dataCompra: formatDateToInput(new Date()),
    itens_Compra: 0,
  });

  const [item, setItem] = useState({ produtoId: "", quantidade: "", valorUnitario: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(linkFun).then((r) => r.json()).then(setFuncionarios).catch(console.error);
    fetch(linkPro).then((r) => r.json()).then(setProdutos).catch(console.error);
  }, []);

  /* Totais atualizados automaticamente quando itens mudam */
  useEffect(() => {
    const quantidadeDeProduto = itens.reduce((acc, i) => acc + Number(i.quantidade), 0);
    const valorDaCompra = itens.reduce((acc, i) => acc + Number(i.valorUnitario) * Number(i.quantidade), 0);
    setCompra((c) => ({
      ...c,
      quantidadeDeProduto,
      valorDaCompra,
      itens_Compra: itens.length,
      quantidadeAtual: quantidadeDeProduto,
    }));
  }, [itens]);

  /* Produto selecionado completo */
  const produtoSelecionado = useMemo(() => {
    const id = Number(item.produtoId);
    return produtos.find((p) => p.id === id) ?? null;
  }, [item.produtoId, produtos]);

  /* Quantidade já adicionada desse produto na lista atual (compra em construção) */
  const quantidadeJaAdicionada = useMemo(() => {
    const pid = Number(item.produtoId);
    if (!pid) return 0;
    return itens
      .filter((it) => Number(it.produtoId) === pid)
      .reduce((acc, it) => acc + Number(it.quantidade), 0);
  }, [item.produtoId, itens]);

  /* Estoque disponível considerando itens já adicionados */
  const estoqueDisponivel = produtoSelecionado
    ? Math.max(0, Number(produtoSelecionado.quantidade || 0) - quantidadeJaAdicionada)
    : 0;

  /* Validação antes de permitir adicionar item */
  const canAddItem = useMemo(() => {
    const produtoIdNum = Number(item.produtoId);
    const quantidadeNum = Number(item.quantidade);
    const valorUnit = Number(item.valorUnitario);
    if (!produtoIdNum) return false;
    if (!produtoSelecionado) return false;
    if (!quantidadeNum || quantidadeNum <= 0 || isNaN(quantidadeNum)) return false;
    if (isNaN(valorUnit) || valorUnit <= 0) return false;
    if (quantidadeNum > estoqueDisponivel) return false;
    return true;
  }, [item, produtoSelecionado, estoqueDisponivel]);

  const handleProdutoChange = (e) => {
    const produtoId = Number(e.target.value) || "";
    const produto = produtos.find((p) => p.id === produtoId);
    setItem({
      produtoId: produtoId || "",
      valorUnitario: produto?.preçoCusto != null ? Number(produto.preçoCusto) : "",
      quantidade: "",
    });
  };

  const handleAddItem = () => {
    const produtoId = Number(item.produtoId);
    const quantidadeNum = Number(item.quantidade);
    const valorUnitarioNum = Number(item.valorUnitario);

    // Validações básicas e conversões
    if (!produtoId || isNaN(quantidadeNum) || quantidadeNum <= 0 || isNaN(valorUnitarioNum) || valorUnitarioNum <= 0) {
      alert("Selecione produto, quantidade e valor válidos.");
      return;
    }

    const produto = produtos.find((p) => p.id === produtoId);
    if (!produto) {
      alert("Produto selecionado não existe.");
      return;
    }

    // Quantidade já adicionada na compra atual para esse produto
    const quantidadeAdicionada = itens
      .filter((it) => Number(it.produtoId) === produtoId)
      .reduce((acc, it) => acc + Number(it.quantidade), 0);

    const disponivelRestante = Math.max(0, Number(produto.quantidade || 0) - quantidadeAdicionada);

    // Validação crítica: não permitir exceder estoque disponível
    if (quantidadeNum > disponivelRestante) {
      alert(`Não é possível adicionar ${quantidadeNum} unidades. Estoque disponível: ${disponivelRestante}`);
      return;
    }

    // Não permitir adicionar se não houver estoque
    if (disponivelRestante <= 0) {
      alert("Este produto não possui estoque disponível.");
      return;
    }

    const newItem = {
      produtoId,
      quantidade: quantidadeNum,
      valorUnitario: valorUnitarioNum,
      subtotal: Number(valorUnitarioNum) * Number(quantidadeNum),
      tempId: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    };

    setItens((prev) => [...prev, newItem]);
    setItem({ produtoId: "", quantidade: "", valorUnitario: "" });
  };

  const handleRemoveItem = (tempId) => {
    setItens((prev) => prev.filter((i) => i.tempId !== tempId));
  };

  /* Verifica estoque final antes de salvar (proteção extra) */
  const validarEstoqueAntesSalvar = () => {
    // Agrupa quantidades por produto na compra
    const requiredByProduct = itens.reduce((acc, it) => {
      const pid = Number(it.produtoId);
      acc[pid] = (acc[pid] || 0) + Number(it.quantidade);
      return acc;
    }, {});

    for (const pidStr of Object.keys(requiredByProduct)) {
      const pid = Number(pidStr);
      const produto = produtos.find((p) => p.id === pid);
      if (!produto) {
        return { ok: false, mensagem: `Produto ${pid} não encontrado.` };
      }
      const requerido = requiredByProduct[pid];
      const disponivel = Number(produto.quantidade || 0);
      if (requerido > disponivel) {
        return {
          ok: false,
          mensagem: `Quantidade do produto "${produto.descricao}" excede estoque. Disponível: ${disponivel}, solicitado: ${requerido}`,
        };
      }
    }
    return { ok: true };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!compra.funcionarioId || !compra.descricao || itens.length === 0) {
      alert("Preencha todos os campos obrigatórios e adicione pelo menos um item.");
      return;
    }

    // Validação final antes de enviar
    const validar = validarEstoqueAntesSalvar();
    if (!validar.ok) {
      alert(validar.mensagem);
      return;
    }

    setSaving(true);
    try {
      const quantidadeDeProduto = itens.reduce((acc, i) => acc + Number(i.quantidade), 0);
      const valorDaCompra = itens.reduce((acc, i) => acc + Number(i.valorUnitario) * Number(i.quantidade), 0);

      const compraBody = {
        funcionarioId: Number(compra.funcionarioId),
        descricao: compra.descricao,
        quantidadeDeProduto,
        quantidadeAtual: quantidadeDeProduto,
        valorDaCompra,
        dataCompra: formatDateToBR(compra.dataCompra),
        itens_Compra: itens.length,
      };

      const resCompra = await fetch(linkCompra, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(compraBody),
      });

      if (!resCompra.ok) {
        const txt = await resCompra.text().catch(() => "");
        throw new Error(`Erro ao salvar compra. ${txt}`);
      }

      const compraSalva = await resCompra.json();
      const compraId = compraSalva.id;

      // 1) Enviar itens
      const itensPromises = itens.map((it) =>
        fetch(Link_Itens_Compra, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            compraId,
            produtoId: Number(it.produtoId),
            quantidade: Number(it.quantidade),
            valorUnitario: Number(it.valorUnitario),
            subtotal: Number(it.subtotal),
          }),
        })
      );

      const itensResponses = await Promise.all(itensPromises);
      for (const r of itensResponses) {
        if (!r.ok) {
          const txt = await r.text().catch(() => "");
          throw new Error(`Erro ao salvar item da compra: ${txt}`);
        }
      }

      // 2) Atualizar estoque agrupando por produto (uma única PUT por produto)
      const totalsByProduct = itens.reduce((acc, it) => {
        const pid = Number(it.produtoId);
        acc[pid] = (acc[pid] || 0) + Number(it.quantidade);
        return acc;
      }, {});

      const updatePromises = Object.entries(totalsByProduct).map(async ([pidStr, addedQty]) => {
        const pid = Number(pidStr);
        // Buscar estado atual do produto antes de atualizar
        const produtoResp = await fetch(`${linkPro}/${pid}`);
        if (!produtoResp.ok) {
          console.warn(`Não foi possível buscar produto ${pid} para atualizar estoque.`);
          return;
        }
        const produtoAtual = await produtoResp.json();
        const novaQuantidade = Number(produtoAtual.quantidade || 0) + Number(addedQty);

        const updateProdResp = await fetch(`${linkPro}/${pid}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...produtoAtual,
            quantidade: novaQuantidade,
            ativo: novaQuantidade > 0,
          }),
        });

        if (!updateProdResp.ok) {
          console.warn(`Falha ao atualizar estoque do produto ${pid}.`);
        }
      });

      await Promise.all(updatePromises);

      alert("Compra cadastrada com sucesso!");
      navigate("../Compra/ListagemCompra");
    } catch (error) {
      console.error("Erro ao salvar compra:", error);
      alert(`Falha ao salvar compra: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="centroCadastroCompra">
      <h1 className="cadastroCompraTitulo">Cadastrar Compra</h1>
      <div className="cadastroCompraTela">
        <form className="cadastroCompraForm" onSubmit={handleSubmit}>
          <div className="dividirInputCompra">
            <select
              className="cadastroCompraInput"
              required
              value={compra.funcionarioId}
              onChange={(e) => setCompra((c) => ({ ...c, funcionarioId: e.target.value }))}
            >
              <option value="">Funcionário</option>
              {funcionarios.map((f) => (
                <option key={f.id} value={f.id}>{f.nome}</option>
              ))}
            </select>
          </div>

          <div className="dividirInputCompra">
            <input
              className="cadastroCompraInput"
              type="text"
              required
              placeholder="Descrição da compra"
              value={compra.descricao}
              onChange={(e) => setCompra((c) => ({ ...c, descricao: e.target.value }))}
            />
          </div>

          <div className="dividirInputCompra">
            <input
              className="cadastroCompraInput"
              type="datetime-local"
              required
              value={compra.dataCompra}
              onChange={(e) => setCompra((c) => ({ ...c, dataCompra: e.target.value }))}
            />
          </div>

          <div className="dividirInputCompra">
            <select
              className="cadastroCompraInput"
              value={item.produtoId}
              onChange={handleProdutoChange}
            >
              <option value="">Produto</option>
              {produtos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.descricao} (Estoque: {p.quantidade})
                </option>
              ))}
            </select>
          </div>

          {produtoSelecionado && (
            <div style={{ marginBottom: 8, fontWeight: "bold", color: "black" }}>
              Preço de custo: R$ {currency(item.valorUnitario || produtoSelecionado.preçoCusto)}
              <span style={{ marginLeft: 12, fontWeight: 600, color: "#444" }}>
                Estoque disponível: {estoqueDisponivel}
              </span>
            </div>
          )}

          <div className="dividirInputCompra">
            <input
              className="cadastroCompraInput"
              type="number"
              min={1}
              max={estoqueDisponivel || undefined}
              placeholder="Quantidade"
              value={item.quantidade}
              onChange={(e) => setItem((i) => ({ ...i, quantidade: e.target.value }))}
            />
          </div>

          <div className="btnGroupCompra">
            <div className="cadastroCompraBtnDiv">
              <button
                type="button"
                className="cadastroCompraBtn"
                onClick={handleAddItem}
                disabled={!canAddItem}
                title={!canAddItem ? "Selecione produto/quantidade válida e verifique estoque" : "Adicionar produto"}
              >
                Adicionar Produto
              </button>
            </div>

            <div className="cadastroCompraDivFinalizar dividirInputCompra">
              <button
                className="cadastroCompraBtnFinalizar"
                type="submit"
                disabled={itens.length === 0 || !compra.funcionarioId || !compra.descricao || saving}
              >
                {saving ? "Salvando..." : "Finalizar Compra"}
              </button>
            </div>
          </div>
        </form>

        <div className="cadastroCompraTabelaWrapper">
          <table className="cadastroCompraTabela">
            <thead>
              <tr>
                <th>ID</th>
                <th>Produto</th>
                <th>Quantidade</th>
                <th>Preço de Custo</th>
                <th>Subtotal</th>
                <th>Remover</th>
              </tr>
            </thead>
            <tbody>
              {itens.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center" }}>Nenhum item</td>
                </tr>
              ) : (
                itens.map((i) => (
                  <tr key={i.tempId}>
                    <td>{i.produtoId}</td>
                    <td>{produtos.find((p) => p.id === Number(i.produtoId))?.descricao || "N/A"}</td>
                    <td>{i.quantidade}</td>
                    <td>R$ {currency(i.valorUnitario)}</td>
                    <td>R$ {currency(i.subtotal)}</td>
                    <td>
                      <button
                        type="button"
                        className="cadastroCompraBtn"
                        style={{ background: "var(--red)", color: "#fff" }}
                        onClick={() => handleRemoveItem(i.tempId)}
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="cadastroCompraValorTotalTabela" style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <span>Total: R$ {currency(compra.valorDaCompra)}</span>
            <span>Qtd Produtos: {compra.quantidadeDeProduto}</span>
          </div>
        </div>
      </div>
    </div>
  );
}