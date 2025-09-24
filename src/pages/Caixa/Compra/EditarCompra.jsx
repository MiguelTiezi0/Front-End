import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { linkFun } from "../../Gerenciamento/Funcionario/linkFun";
import { linkPro } from "../../Gerenciamento/Produto/linkPro";
import { linkCompra } from "./linkCompra";
import { Link_Itens_Compra } from "../Itens_Compra/link_Itens_Compra";
import "./Compra.css";

export function EditarCompra() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [funcionarios, setFuncionarios] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [itens, setItens] = useState([]);
  const [compra, setCompra] = useState(null);
  const [item, setItem] = useState({
    produtoId: "",
    quantidade: "",
    preçoCusto: "",
  });

  // carregar dados
  useEffect(() => {
    // funcionários
    fetch(linkFun).then((r) => r.json()).then(setFuncionarios);

    // produtos
    fetch(linkPro).then((r) => r.json()).then(setProdutos);

    // compra
    fetch(`${linkCompra}/${id}`)
      .then((r) => r.json())
      .then((dados) => {
        setCompra({
          ...dados,
          dataCompra: dados.dataCompra
            ? new Date(dados.dataCompra).toISOString().slice(0, 16)
            : new Date().toISOString().slice(0, 16),
        });
      });
  }, [id]);

  // carregar itens só depois que os produtos existirem
  useEffect(() => {
    if (produtos.length === 0) return;

    fetch(`${Link_Itens_Compra}`)
      .then((r) => r.json())
      .then((dadosItens) => {
        const apenasDaCompra = dadosItens.filter(
          (i) => i.compraId === Number(id)
        );

        const itensComPreco = apenasDaCompra.map((i) => {
          const produto = produtos.find((p) => p.id === i.produtoId);
          return {
            ...i,
            preçoCusto: produto?.preçoCusto || i.valorUnitario,
            tempId: Date.now() + Math.random(),
          };
        });

        setItens(itensComPreco);
      });
  }, [id, produtos]);

  // recalcular totais sempre que mudar itens
  useEffect(() => {
    if (compra) {
      setCompra((c) => ({
        ...c,
        quantidadeDeProduto: itens.reduce(
          (acc, i) => acc + Number(i.quantidade),
          0
        ),
        valorDaCompra: itens.reduce(
          (acc, i) => acc + Number(i.preçoCusto) * Number(i.quantidade),
          0
        ),
        itens_Compra: itens.length,
      }));
    }
  }, [itens]);

  const handleProdutoChange = (e) => {
    const produtoId = Number(e.target.value);
    const produtoSelecionado = produtos.find((p) => p.id === produtoId);

    setItem({
      produtoId,
      preçoCusto: produtoSelecionado?.preçoCusto
        ? Number(produtoSelecionado.preçoCusto)
        : 0,
      quantidade: "",
    });
  };

  const handleAddItem = () => {
    const produtoId = Number(item.produtoId);
    const quantidadeNum = Number(item.quantidade);

    if (!produtoId || !item.preçoCusto || !quantidadeNum) {
      alert("Selecione um produto, quantidade e valor válidos.");
      return;
    }

    setItens([
      ...itens,
      {
        ...item,
        produtoId,
        quantidade: quantidadeNum,
        preçoCusto: Number(item.preçoCusto),
        tempId: Date.now() + Math.random(),
      },
    ]);

    setItem({ produtoId: "", preçoCusto: "", quantidade: "" });
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

    const quantidadeDeProduto = itens.reduce(
      (acc, i) => acc + Number(i.quantidade),
      0
    );
    const valorDaCompra = itens.reduce(
      (acc, i) => acc + Number(i.preçoCusto) * Number(i.quantidade),
      0
    );

    // atualizar compra
    const compraBody = {
      funcionarioId: Number(compra.funcionarioId),
      descricao: compra.descricao,
      quantidadeDeProduto,
      quantidadeAtual: quantidadeDeProduto,
      valorDaCompra,
      dataCompra: new Date(compra.dataCompra).toISOString(),
      itens_Compra: itens.length,
    };

    await fetch(`${linkCompra}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(compraBody),
    });

    // apagar itens antigos
    await fetch(`${Link_Itens_Compra}/deleteByCompra/${id}`, {
      method: "DELETE",
    });

    // salvar novos itens
    for (const i of itens) {
      await fetch(Link_Itens_Compra, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          compraId: Number(id),
          produtoId: Number(i.produtoId),
          quantidade: Number(i.quantidade),
          valorUnitario: Number(i.preçoCusto),
          subtotal: Number(i.preçoCusto) * Number(i.quantidade),
        }),
      });
    }

    alert("Compra atualizada com sucesso!");
    navigate("../Compra/ListagemCompra");
  };

  if (!compra) return <div>Carregando...</div>;

  return (
    <div className="centroCadastroCompra">
      <div className="cadastroCompraTela">
        <h1 className="cadastroCompraTitulo">Editar Compra</h1>

        <form className="cadastroCompraForm" onSubmit={handleSubmit}>
          <div className="dividirInputCompra">
            <select
              className="cadastroCompraInput"
              required
              value={compra.funcionarioId}
              onChange={(e) =>
                setCompra((c) => ({ ...c, funcionarioId: e.target.value }))
              }
            >
              <option value="">Funcionário</option>
              {funcionarios.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
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
              onChange={(e) =>
                setCompra((c) => ({ ...c, descricao: e.target.value }))
              }
            />
          </div>

          <div className="dividirInputCompra">
            <input
              className="cadastroCompraInput"
              type="datetime-local"
              required
              value={compra.dataCompra}
              onChange={(e) =>
                setCompra((c) => ({ ...c, dataCompra: e.target.value }))
              }
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
            <div style={{ marginBottom: 8, fontWeight: "bold" }}>
              Preço de custo: R$ {Number(item.preçoCusto || 0).toFixed(2)}
            </div>
          )}

          <div className="dividirInputCompra">
            <input
              className="cadastroCompraInput"
              type="number"
              min={1}
              placeholder="Quantidade"
              value={item.quantidade}
              onChange={(e) =>
                setItem((i) => ({ ...i, quantidade: e.target.value }))
              }
            />
          </div>

          <div className="cadastroCompraBtnDiv">
            <button
              type="button"
              className="cadastroCompraBtn"
              onClick={handleAddItem}
            >
              Adicionar Produto
            </button>
          </div>

          <div className="cadastroCompraDivFinalizar dividirInputCompra">
            <button
              className="cadastroCompraBtnFinalizar"
              type="submit"
              disabled={
                itens.length === 0 || !compra.funcionarioId || !compra.descricao
              }
            >
              Salvar Alterações
            </button>
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
                  <td colSpan={5} style={{ textAlign: "center" }}>
                    Nenhum item
                  </td>
                </tr>
              ) : (
                itens.map((i) => (
                  <tr key={i.tempId}>
                    <td>{i.produtoId}</td>
                    <td>
                      {
                        produtos.find((p) => p.id === Number(i.produtoId))
                          ?.descricao
                      }
                    </td>
                    <td>{i.quantidade}</td>
                    <td>R$ {Number(i.preçoCusto).toFixed(2)}</td>
                    <td>
                      <button
                        onClick={() => handleRemoveItem(i.tempId)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "red",
                          cursor: "pointer",
                        }}
                        title="Remover produto"
                      >
                        X
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="cadastroCompraValorTotalTabela">
            Valor total:{" "}
            <strong>R$ {compra.valorDaCompra?.toFixed(2)}</strong>
            <span style={{ marginLeft: 16 }}>
              Quantidade total:{" "}
              <strong>{compra.quantidadeDeProduto}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
