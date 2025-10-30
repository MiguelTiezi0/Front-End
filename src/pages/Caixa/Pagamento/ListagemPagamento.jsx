import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { linkPag } from "./linkPag";
import { linkFun } from "../../Gerenciamento/Funcionario/linkFun";
import { linkCli } from "../../Gerenciamento/Cliente/linkCli";
import { linkVen } from "../Venda/linkVen";
import "./Pagamento.css";
import lupa from "../../../assets/icons/lupa.svg";
import lixo from "../../../assets/icons/lixo.svg";
import edit from "../../../assets/icons/edit.svg";
import olho from "../../../assets/icons/olhoFechado.svg";
import { useAlerta } from "../../../hooks/Alerta/useAlerta";

export function ListagemPagamento() {
  const navigate = useNavigate();
  const [pagamentos, setPagamentos] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState(null);
  const [pesquisa, setPesquisa] = useState("");
  const [inputVisivel, setInputVisivel] = useState(false);
  const [btnVisivel, setbtnVisivel] = useState(true);
  const [tipoPesquisa, setTipoPesquisa] = useState("id"); // NOVO
  const [dataInicio, setDataInicio] = useState(""); // NOVO
  const [dataFim, setDataFim] = useState(""); // NOVO
  const alerta = useAlerta();

  useEffect(() => {
    fetch(linkPag)
      .then((r) => r.json())
      .then(setPagamentos);
    fetch(linkFun)
      .then((r) => r.json())
      .then(setFuncionarios);
    fetch(linkCli)
      .then((r) => r.json())
      .then(setClientes);
    fetch(linkVen)
      .then((r) => r.json())
      .then(setVendas);
  }, []);

  const getFuncionarioNome = (id) =>
    funcionarios.find((f) => f.id === Number(id))?.nome || "";

  const getClienteNome = (id) =>
    clientes.find((c) => c.id === Number(id))?.nome || "";

  const getVendaInfo = (id) => {
    const v = vendas.find((v) => v.id === Number(id));
    if (!v) return "";
    return `ID: ${v.id} `;
  };

  const handleDetalhes = () => {
    if (!pagamentoSelecionado) {
      alert("Selecione um pagamento para ver detalhes.");
      return;
    }
    navigate(`/Pagamento/DetalhesPagamento/${pagamentoSelecionado}`);
  };

  const handleEditar = () => {
    if (!pagamentoSelecionado) {
      alert("Selecione um pagamento para editar.");
      return;
    }
    navigate(`/Pagamento/EditarPagamento/${pagamentoSelecionado}`);
  };

  const handleNovo = () => {
    navigate("/Pagamento/CadastroPagamento");
  };

  const pagamentosFiltrados = pagamentos
    .filter((p) => {
      const cliente = getClienteNome(p.clienteId ?? p.ClienteId);
      const funcionario = getFuncionarioNome(
        p.funcionarioId ?? p.FuncionarioId
      );
      if (pesquisa) {
        if (tipoPesquisa === "id") {
          return p.id.toString().includes(pesquisa);
        }
        if (tipoPesquisa === "funcionario") {
          return funcionario.toLowerCase().includes(pesquisa.toLowerCase());
        }
        if (tipoPesquisa === "cliente") {
          return cliente.toLowerCase().includes(pesquisa.toLowerCase());
        }
        if (tipoPesquisa === "formaPagamento") {
          return (p.formaDePagamento ?? p.FormaDePagamento ?? "")
            .toLowerCase()
            .includes(pesquisa.toLowerCase());
        }
        if (tipoPesquisa === "dataPagamento") {
          const data = p.dataPagamento ?? p.DataPagamento;
          return (
            data &&
            new Date(data).toLocaleDateString("pt-BR").includes(pesquisa)
          );
        }
        return (
          p.id.toString().includes(pesquisa) ||
          cliente.toLowerCase().includes(pesquisa.toLowerCase()) ||
          funcionario.toLowerCase().includes(pesquisa.toLowerCase())
        );
      }
      return true;
    })
    .filter((p) => {
      if (dataInicio && dataFim) {
        const dataIni = new Date(dataInicio);
        const dataFinal = new Date(dataFim);
        const dataPag = new Date(p.dataPagamento ?? p.DataPagamento);
        dataPag.setHours(0, 0, 0, 0);
        dataIni.setHours(0, 0, 0, 0);
        dataFinal.setHours(0, 0, 0, 0);
        return dataPag >= dataIni && dataPag <= dataFinal;
      }
      return true;
    })
    .slice()
    .sort(
      (a, b) =>
        new Date(b.dataPagamento ?? b.DataPagamento) -
        new Date(a.dataPagamento ?? a.DataPagamento)
    );

  function handleClickPesquisa() {
    setInputVisivel(!inputVisivel);
    setbtnVisivel(!btnVisivel);
    setPesquisa("");
    setTimeout(() => {
      const input = document.querySelector(".inputPesquisar");
      if (input) input.focus();
    }, 0);
  }

  /**
   * Atualiza a dívida do cliente após deletar um pagamento
   * Soma o valor do pagamento deletado à dívida atual
   */
const atualizarDividaCliente = async (pagamento) => {
  try {
    if (!pagamento.clienteId || pagamento.clienteId === 0 || pagamento.clienteId === "0") {
      return true; // Ignora clientes anônimos
    }

    // Buscar cliente
    const clienteResponse = await fetch(`${linkCli}/${pagamento.clienteId}`);
    if (!clienteResponse.ok) throw new Error("Erro ao buscar dados do cliente");
    const cliente = await clienteResponse.json();

    // Calcular nova dívida
    const valorPagamento = Number(pagamento.totalPago ?? pagamento.TotalPago ?? 0);
    const dividaAtual = Number(cliente.totalDevido ?? 0);
    const novaDivida = dividaAtual + valorPagamento;

    // Atualizar cliente mantendo todos os campos obrigatórios
    const clienteAtualizado = {
      id: cliente.id,
      nome: cliente.nome,
      cpf: cliente.cpf,
      endereço: cliente.endereço,
      telefone: cliente.telefone,
      dataNascimento: cliente.dataNascimento,
      limiteDeCrédito: cliente.limiteDeCrédito,
      totalGasto: cliente.totalGasto,
      totalPago: cliente.totalPago,
      totalDevido: novaDivida,
      usuario: cliente.usuario,
      senha: cliente.senha,
      nivelAcesso: cliente.nivelAcesso
    };
    console.log("Cliente atualizado:", clienteAtualizado);

    const updateResponse = await fetch(`${linkCli}/${pagamento.clienteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clienteAtualizado),
    });

    if (!updateResponse.ok) throw new Error("Erro ao atualizar dívida do cliente");

    console.log("Dívida atualizada:", {
      cliente: cliente.nome,
      dividaAntiga: dividaAtual,
      valorEstornado: valorPagamento,
      novaDivida,
    });

    return true;
  } catch (error) {
    console.error("Erro ao atualizar dívida:", error);
    throw error;
  }
};



  /**
   * Registra estorno no caixa para pagamentos em dinheiro
   */
  const registrarEstornoCaixa = async (pagamento) => {
    try {
      // Verificar se pagamento foi em dinheiro
      const formaDinheiro =
        pagamento.formaDePagamento === "Dinheiro" ||
        (Array.isArray(pagamento.formaDePagamento) &&
          pagamento.formaDePagamento.includes("Dinheiro"));

      const valorPago = Number(pagamento.totalPago ?? pagamento.TotalPago ?? 0);

      // Só registra estorno se for dinheiro e valor > 0
      if (!formaDinheiro || valorPago <= 0) {
        return true;
      }

      const response = await fetch("http://localhost:7172/api/Caixa/saida", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          valor: valorPago,
          descricao: `Estorno do pagamento #${pagamento.id} - Cliente: ${pagamento.clienteId}`,
          tipo: "Saída",
        }),
      });

      if (!response.ok) throw new Error("Erro ao registrar estorno no caixa");

      console.log("Estorno registrado:", {
        pagamentoId: pagamento.id,
        valor: valorPago,
      });

      return true;
    } catch (error) {
      console.error("Erro no estorno:", error);
      throw new Error(`Erro ao registrar estorno: ${error.message}`);
    }
  };

  /**
   * Deleta o pagamento do banco de dados
   */
  const deletarPagamento = async (pagamentoId) => {
    try {
      const response = await fetch(`${linkPag}/${pagamentoId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Erro ao deletar pagamento");
      return true;
    } catch (error) {
      console.error("Erro ao deletar:", error);
      throw new Error(`Erro ao deletar pagamento: ${error.message}`);
    }
  };

  /**
   * Handler principal para deletar pagamento
   * Executa todas as operações necessárias em sequência
   */
  const handleDelete = async () => {
    if (!pagamentoSelecionado) {
      alerta("Selecione um pagamento para deletar", "warning");
      return;
    }

    if (
      !window.confirm(
        "Tem certeza que deseja deletar este pagamento? Esta ação é irreversível."
      )
    ) {
      return;
    }

    try {
      // 1. Buscar dados completos do pagamento
      const pagamentoResponse = await fetch(
        `${linkPag}/${pagamentoSelecionado}`
      );
      if (!pagamentoResponse.ok)
        throw new Error("Erro ao buscar dados do pagamento");
      const pagamento = await pagamentoResponse.json();

      // 2. Atualizar dívida do cliente
      await atualizarDividaCliente(pagamento);

      // 3. Registrar estorno no caixa (se aplicável)
      await registrarEstornoCaixa(pagamento);

      // 4. Deletar o pagamento
      await deletarPagamento(pagamentoSelecionado);

      // 5. Atualizar estado local
      setPagamentos((prev) =>
        prev.filter((p) => p.id !== pagamentoSelecionado)
      );
      setPagamentoSelecionado(null);

      alerta("Pagamento deletado e dívida atualizada com sucesso!", "success");
    } catch (error) {
      console.error("Erro na operação:", error);
      alerta(
        `Falha ao processar exclusão: ${error.message}
         Por favor, verifique os logs e tente novamente.`,
        "error"
      );
    }
  };

  return (
    <div className="centroListagemPagamento">
      <div className="top-nav-pagamento">
        <div className="top-nav-buttons">
          {/* Lupa: pesquisar */}
          {btnVisivel && (
            <button
              type="button"
              className="top-nav-button lupa"
              onClick={handleClickPesquisa}
            >
              <img src={lupa} className="top-nav-img" alt="Pesquisar" />
            </button>
          )}

          {/* SELECT DE TIPO DE PESQUISA */}
          <select
            className="inputTipoPesquisa"
            style={{
              display: inputVisivel ? "inline-block" : "none",
              marginRight: 8,
            }}
            value={tipoPesquisa}
            onChange={(e) => setTipoPesquisa(e.target.value)}
          >
            <option value="id">Id</option>
            <option value="funcionario">Funcionário</option>
            <option value="cliente">Cliente</option>
            <option value="formaPagamento">Forma Pagamento</option>
            <option value="dataPagamento">Data Pagamento</option>
          </select>

          <input
            type="text"
            className={`inputPesquisar ${inputVisivel ? "visivel" : ""}`}
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
          />

          {/* Olho: detalhes */}
          <button
            type="button"
            className="top-nav-button olhoFechado"
            onClick={handleDetalhes}
          >
            <img src={olho} className="top-nav-img" alt="Detalhes" />
          </button>

          {/* Lixo: deletar */}
          <button
            type="button"
            className="top-nav-button lixo"
            onClick={handleDelete}
          >
            <img src={lixo} className="top-nav-img" alt="Lixo" />
          </button>

          {/* Editar */}
          <button
            type="button"
            className="top-nav-button editar"
            onClick={handleEditar}
          >
            <img src={edit} className="top-nav-img" alt="Editar" />
          </button>
        </div>
      </div>

      {/* CAMPOS DE DATA */}

      <div className="ListagemPagamento">
        <h1 className="tituloListagemPagamento">Relatorio de Pagamentos</h1>
        <div className="filtrosPagamento">
          <label>Data Inicial:</label>
          <input
            type="date"
            value={dataInicio}
            max={dataFim || undefined}
            onChange={(e) => setDataInicio(e.target.value)}
          />
          <label>Data Final:</label>
          <input
            type="date"
            value={dataFim}
            min={dataInicio || undefined}
            onChange={(e) => setDataFim(e.target.value)}
          />
        </div>

        <div className="scrollPagamento">
          <table className="tablePagamento">
            <thead>
              <tr>
                <th>ID</th>
                <th>Funcionário</th>
                <th>Cliente</th>
                <th>Venda</th>
                <th>Forma de Pagamento</th>
                <th>Total Pago</th>
                <th>Total de Vezes</th>
                <th>Data Pagamento</th>
              </tr>
            </thead>
            <tbody>
              {pagamentosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center" }}>
                    Nenhum pagamento registrado.
                  </td>
                </tr>
              ) : (
                pagamentosFiltrados.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setPagamentoSelecionado(p.id)}
                    className={
                      pagamentoSelecionado === p.id
                        ? "linhaSelecionadaPagamento"
                        : ""
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <td>{p.id}</td>
                    <td>
                      {getFuncionarioNome(p.funcionarioId ?? p.FuncionarioId)}
                    </td>
                    <td>
                      {p.clienteId === 0 ||
                      p.clienteId === "0" ||
                      p.clienteId === null
                        ? "Anônimo"
                        : clientes.find((c) => c.id === p.clienteId)?.nome ||
                          p.clienteId}
                    </td>
                    <td>{getVendaInfo(p.vendaId ?? p.VendaId)}</td>
                    <td>{p.formaDePagamento ?? p.FormaDePagamento}</td>
                    <td>R$ {Number(p.totalPago ?? p.TotalPago).toFixed(2)}</td>
                    <td>{p.toTalDeVezes ?? p.ToTalDeVezes}</td>
                    <td>
                      {(() => {
                        const data = p.dataPagamento ?? p.DataPagamento;
                        if (!data) return "";
                        const d = new Date(data);
                        return d.toLocaleDateString("pt-BR");
                      })()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
