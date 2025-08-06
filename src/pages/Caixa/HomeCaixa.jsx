import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HeaderCaixa } from "../../components/Caixa/HeaderCaixa/HeaderCaixa.jsx";

import { linkVen } from "./Venda/linkVen.jsx";
import { linkFun } from "../Gerenciamento/Funcionario/linkFun";
import { linkCli } from "../Gerenciamento/Cliente/linkCli";
import { linkPro } from "../Gerenciamento/Produto/linkPro";
import { linkVenItens } from "./ItensVenda/linkVenItens";
import { linkPag } from "./Pagamento/linkPag";

import "./Venda/Venda.css";
export function HomeCaixa() {
  document.title = "Home";

  const navigate = useNavigate();
  const { id } = useParams();

  const [funcionarios, setFuncionarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [itens, setItens] = useState([]);
  const [qtdParcelas, setQtdParcelas] = useState(1);
  const [formaDePagamento, setFormaDePagamento] = useState("");
  const [descontoTipo, setDescontoTipo] = useState("");
  const [descontoValor, setDescontoValor] = useState("");
  const [totalPago, setTotalPago] = useState(""); // string para mostrar placeholder
  const [item, setItem] = useState({
    produtoId: "",
    valorDoItem: "",
    quantidade: "", // string para mostrar placeholder
  });

  const [venda, setVenda] = useState({
    funcionarioId: "",
    clienteId: "",
    totalDeItens: 0,
    valorTotal: 0,
    totalPago: 0,
    formaDePagamento: [],
    totalDeVezes: 1,
    dataVenda: new Date().toISOString().slice(0, 16),
  });

  useEffect(() => {
    fetch(linkFun)
      .then((r) => r.json())
      .then(setFuncionarios);
    fetch(linkCli)
      .then((r) => r.json())
      .then(setClientes);
    fetch(linkPro)
      .then((r) => r.json())
      .then(setProdutos);
  }, []);

  useEffect(() => {
    setVenda((v) => ({
      ...v,
      totalDeItens: itens.reduce((acc, i) => acc + Number(i.quantidade), 0),
    }));
  }, [itens]);

  useEffect(() => {
    if (!id) return;
    fetch(`${linkVen}/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setVenda(data);
        setItens(data.itens || []);
        setQtdParcelas(data.totalDeVezes || 1);
      });
  }, [id]);

  const handleProdutoChange = (e) => {
    const produtoId = Number(e.target.value);
    const produtoSelecionado = produtos.find((p) => p.id === produtoId);
    setItem({
      produtoId: e.target.value,
      valorDoItem: produtoSelecionado?.["preçoVenda"] || "",
      quantidade: "",
    });
  };

  const handleAddItem = () => {
    const produtoId = Number(item.produtoId);
    const quantidadeNum = Number(item.quantidade);
    if (!produtoId || !item.valorDoItem || !quantidadeNum) {
      alert("Selecione um produto, quantidade e valor válidos.");
      return;
    }

    const produto = produtos.find((p) => p.id === produtoId);
    if (!produto) return alert("Produto inválido.");

    if (quantidadeNum > produto.quantidade) {
      alert("Quantidade maior que o estoque!");
      return;
    }

    setItens([
      ...itens,
      {
        ...item,
        produtoId,
        quantidade: quantidadeNum,
        tempId: Date.now() + Math.random(),
      },
    ]);
    setItem({ produtoId: "", valorDoItem: "", quantidade: "" });
  };

  const handleRemoveItem = (tempId) => {
    setItens(itens.filter((i) => i.tempId !== tempId));
  };

  const handleCancelOne = (tempId) => {
    setItens((prev) =>
      prev
        .map((i) =>
          i.tempId === tempId
            ? { ...i, quantidade: i.quantidade > 1 ? i.quantidade - 1 : 1 }
            : i
        )
        .filter((i) => i.quantidade > 0)
    );
  };

  const handleFormaPagamento = (e) => {
    const value = e.target.value;
    setFormaDePagamento(value);
    setDescontoTipo("");
    setDescontoValor("");
    setVenda((v) => ({ ...v, formaDePagamento: [value] }));

    // Só mostra parcelas para Crédito e Débito
    const parcelasDiv = document.getElementById("QtdParcelas");
    if (value === "Crédito" || value === "Débito" || value === "Crediário") {
      parcelasDiv.style.display = "flex";
    } else {
      parcelasDiv.style.display = "none";
      setQtdParcelas(1);
    }
  };

  // Cálculo do valor com desconto aplicado
  useEffect(() => {
    const valorProdutos = itens.reduce(
      (acc, i) => acc + Number(i.valorDoItem) * Number(i.quantidade),
      0
    );

    let desconto = 0;
    const valor = Number(descontoValor);

    if (descontoTipo === "porcentagem" && !isNaN(valor)) {
      desconto = valorProdutos * (valor / 100);
    } else if (descontoTipo === "decimal" && !isNaN(valor)) {
      desconto = valor;
    }

    const final = Math.max(0, valorProdutos - desconto);

    setVenda((v) => ({
      ...v,
      valorTotal: final,
      totalDeItens: itens.reduce((acc, i) => acc + Number(i.quantidade), 0),
    }));
  }, [itens, descontoTipo, descontoValor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!venda.funcionarioId || !venda.clienteId || itens.length === 0) {
      alert(
        "Preencha todos os campos obrigatórios e adicione pelo menos um item."
      );
      return;
    }

    const clienteSelecionado = clientes.find(
      (c) => String(c.id) === String(venda.clienteId)
    );

    // Verificação de limite de crédito
    const valorRestante = Number(venda.valorTotal) - Number(totalPago || 0);
    if (
      clienteSelecionado &&
      clienteSelecionado.limiteDeCrédito !== undefined &&
      valorRestante > Number(clienteSelecionado.limiteDeCrédito)
    ) {
      alert(
        `O valor restante da venda (R$ ${valorRestante.toFixed(
          2
        )}) excede o limite de crédito do cliente (R$ ${Number(
          clienteSelecionado.limiteDeCrédito
        ).toFixed(2)}).`
      );
      return;
    }

    const isCartao =
      venda.formaDePagamento.includes("Crédito") ||
      venda.formaDePagamento.includes("Débito");
    const totalDeVezes = isCartao ? qtdParcelas : 1;

    // Permite inserir valor, mas alerta se for menor que o total
    const totalPagoNumber = Number(totalPago);

    if (
      (venda.clienteId === "0" || venda.clienteId === 0) &&
      totalPagoNumber < venda.valorTotal
    ) {
      alert("Cliente anônimo deve pagar o valor total da venda!");
      return;
    }

    const valorProdutos = itens.reduce(
      (acc, i) => acc + Number(i.valorDoItem) * Number(i.quantidade),
      0
    );

    const valor = Number(descontoValor);
    let desconto = 0;

    if (descontoTipo === "porcentagem" && !isNaN(valor)) {
      desconto = valorProdutos * (valor / 100);
    } else if (descontoTipo === "decimal" && !isNaN(valor)) {
      desconto = valor;
    }

    const valorFinal = valorProdutos - desconto;

    const vendaBody = {
      funcionarioId: Number(venda.funcionarioId),
      clienteId: Number(venda.clienteId),
      totalDeItens: venda.totalDeItens,
      valorTotal: venda.valorTotal,
      totalPago: totalPagoNumber,
      formaDePagamento: venda.formaDePagamento,
      totalDeVezes: totalDeVezes,
      dataVenda: new Date(venda.dataVenda).toISOString(),
      desconto: desconto,
      formaDeDesconto: descontoTipo ? [descontoTipo] : [], // <-- Adicionado aqui
    };

    const resVenda = await fetch(linkVen, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vendaBody),
    });

    if (!resVenda.ok) {
      alert("Erro ao salvar venda");
      return;
    }

    const vendaSalva = await resVenda.json();

    // Cria o pagamento automaticamente se totalPago > 0
    if (totalPagoNumber > 0) {
      const pagamentoBody = {
        FuncionarioId: Number(venda.funcionarioId),
        ClienteId: Number(venda.clienteId),
        VendaId: vendaSalva.id,
        TotalPago: totalPagoNumber,
        Desconto: desconto,
        FormaDePagamento: Array.isArray(venda.formaDePagamento)
          ? venda.formaDePagamento
          : [venda.formaDePagamento],
        ToTalDeVezes: totalDeVezes,
        DataPagamento: new Date().toISOString(),
      };

      await fetch(linkPag, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pagamentoBody),
      });
    }

    for (const i of itens) {
      await fetch(linkVenItens, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendaId: vendaSalva.id,
          produtoId: Number(i.produtoId),
          valorDoItem: Number(i.valorDoItem),
          quantidade: Number(i.quantidade),
        }),
      });

      const produto = produtos.find((p) => p.id === Number(i.produtoId));
      if (produto) {
        await fetch(`${linkPro}/${produto.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...produto,
            quantidade: produto.quantidade - i.quantidade,
          }),
        });
      }
    }

    // Após registrar venda e pagamento
    const vendasDoCliente = await fetch(linkVen)
      .then((r) => r.json())
      .then((vs) =>
        vs.filter(
          (v) => Number(v.clienteId ?? v.ClienteId) === Number(venda.clienteId)
        )
      );
    const totalPagoCliente = vendasDoCliente.reduce(
      (acc, v) => acc + Number(v.totalPago ?? v.TotalPago ?? 0),
      0
    );
    const totalDevidoCliente = vendasDoCliente.reduce(
      (acc, v) =>
        acc +
        (Number(v.valorTotal ?? v.ValorTotal ?? 0) -
          Number(v.totalPago ?? v.TotalPago ?? 0)),
      0
    );
    const totalGastoCliente = vendasDoCliente.reduce(
      (acc, v) => acc + Number(v.valorTotal ?? v.ValorTotal ?? 0),
      0
    );

    await fetch(`${linkCli}/${venda.clienteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        totalPago: totalPagoCliente,
        totalDevido: totalDevidoCliente,
        totalGasto: totalGastoCliente,
      }),
    });

    alert("Venda cadastrada com sucesso!");
    navigate("../Venda/ListagemVenda");
    setItens([]);
    setQtdParcelas(1);
    setVenda({
      funcionarioId: "",
      clienteId: "",
      totalDeItens: 0,
      valorTotal: 0,
      totalPago: 0,
      formaDePagamento: [],
      totalDeVezes: 1,
      dataVenda: new Date().toISOString().slice(0, 16),
    });
    setTotalPago("");
    fetch(linkPro)
      .then((r) => r.json())
      .then(setProdutos);
  };

  // Sincroniza totalPago se cliente for anônimo:
  useEffect(() => {
    if (venda.clienteId === "0" || venda.clienteId === 0) {
      setTotalPago(venda.valorTotal);
    }
  }, [venda.clienteId, venda.valorTotal]);

  const formasPagamento = [
    "Dinheiro",
    "Débito",
    "Pix",
    "Crédito",
    "Crediário",
    "Consignação",
  ];

  // Adicione este helper para buscar o cliente selecionado:
  const clienteSelecionado = clientes.find(
    (c) => String(c.id) === String(venda.clienteId)
  );

  return (
    <div className="HomeCaixa">
      <HeaderCaixa />
    <div className="AppHomeCaixa">


      <div className="CentroOp">
        <div className="Opcoes">
          <button
            className="OpcoesBtn"
          >
            Opções
          </button>
          <button
            className="OpcoesBtn"
          >
            Rec. Clientes
          </button>
          <button
            className="OpcoesBtn"
          >
            Abrir Gaveta
          </button>
          <button
            className="OpcoesBtn"
          >
            Nova venda
          </button>
          <button
            className="OpcoesBtn"
          >
            Pendentes
          </button>
          <button
            className="OpcoesBtn"
          >
            Localizar
          </button>
          <button
            className="OpcoesBtn"
          >
            Reimpressão
          </button>
          <button
            className="OpcoesBtn"
          >
            Troca
          </button>
          <button
            className="OpcoesBtn"
          >
            Troca
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}
