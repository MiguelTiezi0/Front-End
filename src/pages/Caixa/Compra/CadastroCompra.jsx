import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { linkFun } from "../../Gerenciamento/Funcionario/linkFun";
import { linkPro } from "../../Gerenciamento/Produto/linkPro";
import { linkCompra } from "./linkCompra";
import { Link_Itens_Compra } from "../Itens_Compra/link_Itens_Compra";
import "./Compra.css";

// Função para formatar para o input (YYYY-MM-DDTHH:mm)
function formatDateToInput(date) {
  const d = new Date(date);
  return d.toISOString().slice(0, 16);
}

// Função para exibir/salvar em PT-BR (DD/MM/YYYY HH:mm)
function formatDateToBR(dateString) {
  const d = new Date(dateString);
  return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

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
    dataCompra: formatDateToInput(new Date()), // inicial no formato do input
    itens_Compra: 0,
  });
  const [item, setItem] = useState({ produtoId: "", quantidade: "", valorUnitario: "" });

  useEffect(() => {
    fetch(linkFun).then((r) => r.json()).then(setFuncionarios);
    fetch(linkPro).then((r) => r.json()).then(setProdutos);
  }, []);

  useEffect(() => {
    setCompra((c) => ({
      ...c,
      quantidadeDeProduto: itens.reduce((acc, i) => acc + Number(i.quantidade), 0),
      valorDaCompra: itens.reduce((acc, i) => acc + Number(i.valorUnitario) * Number(i.quantidade), 0),
      itens_Compra: itens.length,
    }));
  }, [itens]);

  const handleProdutoChange = (e) => {
    const produtoId = Number(e.target.value);
    const produtoSelecionado = produtos.find((p) => p.id === produtoId);
    setItem({
      produtoId,
      valorUnitario: produtoSelecionado?.preçoCusto ? Number(produtoSelecionado.preçoCusto) : 0,
      quantidade: "",
    });
  };

  const handleAddItem = () => {
    const produtoId = Number(item.produtoId);
    const quantidadeNum = Number(item.quantidade);
    if (!produtoId || !item.valorUnitario || !quantidadeNum) {
      alert("Selecione um produto, quantidade e valor válidos.");
      return;
    }
    setItens([
      ...itens,
      {
        ...item,
        produtoId,
        quantidade: quantidadeNum,
        valorUnitario: Number(item.valorUnitario),
        tempId: Date.now() + Math.random(),
      },
    ]);
    setItem({ produtoId: "", valorUnitario: "", quantidade: "" });
  };

  const handleRemoveItem = (tempId) => {
    setItens(itens.filter((i) => i.tempId !== tempId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!compra.funcionarioId || !compra.descricao || itens.length === 0) {
      alert("Preencha todos os campos obrigatórios e adicione pelo menos um item.");
      return;
    }

    const quantidadeDeProduto = itens.reduce((acc, i) => acc + Number(i.quantidade), 0);
    const valorDaCompra = itens.reduce((acc, i) => acc + Number(i.valorUnitario) * Number(i.quantidade), 0);

    const compraBody = {
      funcionarioId: Number(compra.funcionarioId),
      descricao: compra.descricao,
      quantidadeDeProduto,
      quantidadeAtual: quantidadeDeProduto,
      valorDaCompra,
      dataCompra: formatDateToBR(compra.dataCompra), // salva no formato PT-BR
      itens_Compra: itens.length,
    };

    const resCompra = await fetch(linkCompra, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(compraBody),
    });

    const compraSalva = await resCompra.json();
    const compraId = compraSalva.id;

    for (const i of itens) {
      await fetch(Link_Itens_Compra, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          compraId,
          produtoId: Number(i.produtoId),
          quantidade: Number(i.quantidade),
          valorUnitario: Number(i.valorUnitario),
          subtotal: Number(i.valorUnitario) * Number(i.quantidade),
        }),
      });
    }

    alert("Compra cadastrada com sucesso!");
    navigate("../Compra/ListagemCompra");
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

          {item.produtoId && (
            <div style={{ marginBottom: 8, fontWeight: "bold", color: "black" }}>
              Preço de custo: R$ {Number(item.valorUnitario || 0).toFixed(2)}
            </div>
          )}

          <div className="dividirInputCompra">
            <input
              className="cadastroCompraInput"
              type="number"
              min={1}
              placeholder="Quantidade"
              value={item.quantidade}
              onChange={(e) => setItem((i) => ({ ...i, quantidade: e.target.value }))}
            />
          </div>

          <div className="btnGroupCompra">
            <div className="cadastroCompraBtnDiv">
              <button type="button" className="cadastroCompraBtn" onClick={handleAddItem}>
                Adicionar Produto
              </button>
            </div>

            <div className="cadastroCompraDivFinalizar dividirInputCompra">
              <button
                className="cadastroCompraBtnFinalizar"
                type="submit"
                disabled={itens.length === 0 || !compra.funcionarioId || !compra.descricao}
              >
                Finalizar Compra
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
                <th>Remover</th>
              </tr>
            </thead>
            <tbody>
              {itens.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center" }}>Nenhum item</td>
                </tr>
              ) : (
                itens.map((i) => (
                  <tr key={i.tempId}>
                    <td>{i.produtoId}</td>
                    <td>{produtos.find((p) => p.id === Number(i.produtoId))?.descricao}</td>
                    <td>{i.quantidade}</td>
                    <td>R$ {Number(i.valorUnitario).toFixed(2)}</td>
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
          <div className="cadastroCompraValorTotalTabela">
            <span>Total: R$ {Number(compra.valorDaCompra).toFixed(2)}</span>
            <span>Qtd Produtos: {compra.quantidadeDeProduto}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
