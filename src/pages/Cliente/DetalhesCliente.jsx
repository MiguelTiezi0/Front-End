import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import lixo from "../../assets/icons/lixo.svg";
import olhoFechado from "../../assets/icons/olhoFechado.svg";
import edit from "../../assets/icons/edit.svg";
import "./Cliente.css";
import { linkCli } from "./linkCli";
import { linkVen } from "../Venda/linkVen";

export function DetalhesCliente() {
  const { id } = useParams();
  const [cliente, setCliente] = useState(null);
  const [vendas, setVendas] = useState([]);
  const [totalGasto, setTotalGasto] = useState(0);
  const [totalPago, setTotalPago] = useState(0);
  const [totalDevido, setTotalDevido] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClienteDetalhes = async () => {
      try {
        const response = await fetch(`${linkCli}/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar detalhes do cliente");
        }

        const data = await response.json();
        setCliente(data);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar os detalhes do cliente");
      }
    };

    const fetchVendasCliente = async () => {
      try {
        const response = await fetch(linkVen, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar vendas do cliente");
        }

        const data = await response.json();
        const vendasDoCliente = data.filter(
          (v) => Number(v.clienteId ?? v.ClienteId) === Number(id)
        );
        setVendas(vendasDoCliente);
        setTotalGasto(
          vendasDoCliente.reduce(
            (acc, v) => acc + Number(v.valorTotal ?? v.ValorTotal),
            0
          )
        );
        setTotalPago(
          vendasDoCliente.reduce(
            (acc, v) => acc + Number(v.valorPago ?? v.ValorPago),
            0
          )
        );
        setTotalDevido(
          vendasDoCliente.reduce(
            (acc, v) => acc + Number(v.valorDevido ?? v.ValorDevido),
            0
          )
        );
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar as vendas do cliente");
      }
    };

    fetchClienteDetalhes();
    fetchVendasCliente();
  }, [id]);

  if (!cliente) {
    return <p>Carregando detalhes do cliente...</p>;
  }

  const formatarData = (dataISO) => {
    if (!dataISO) return "";
    const data = new Date(dataISO);
    return data.toLocaleDateString("pt-BR");
  };

  const handleVoltar = () => {
    navigate("/Cliente/ListagemCliente");
  };

  const handleEditar = () => {
    navigate(`/Cliente/EditarCliente/${id}`);
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Tem certeza que deseja deletar este cliente?"
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${linkCli}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar o cliente");
      }

      alert("Cliente deletado com sucesso!");
      navigate("/Cliente/ListagemCliente");
    } catch (error) {
      console.error(error);
      alert("Erro ao deletar o cliente");
    }
  };

  const vendasDoCliente = vendas.filter(
    (v) => Number(v.clienteId ?? v.ClienteId) === Number(cliente.id)
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

  const pago = Number(cliente.totalPago ?? 0);
  const devido = Number(cliente.totalDevido ?? 0);
  const gasto = Number(cliente.totalGasto ?? 0);

  function getRowColor(venda) {
    const total = Number(venda.valorTotal ?? venda.ValorTotal ?? 0);
    const pago = Number(venda.totalPago ?? venda.TotalPago ?? 0);

    if (pago === total && total > 0) return "#ccffcc"; // Verde: totalmente paga
    if (pago < total && pago > 0) return "#fff7b2"; // Amarelo: parcialmente paga
    if (pago < total && pago === 0) return "#ffcccc"; // Vermelho: não paga

    return ""; // Sem cor se não se encaixar em nenhum caso
  }

  return (
    <div className="centroDetalhesCliente">
      <div className="top-nav">
        <div className="top-nav-buttons">
          <button
            type="button"
            className="top-nav-button lixo"
            onClick={handleDelete}
          >
            <img src={lixo} className="top-nav-img" alt="Lixo" />
          </button>
          <button
            type="button"
            className="top-nav-button olhoFechado"
            onClick={() => navigate(`/Cliente/DetalhesCliente/${id}`)}
          >
            <img src={olhoFechado} className="top-nav-img" alt="Detalhar" />
          </button>
          <button
            type="button"
            className="top-nav-button editar"
            onClick={handleEditar}
          >
            <img src={edit} className="top-nav-img" alt="Editar" />
          </button>
        </div>
      </div>
      <div className="contentDetalhesCliente">
        <div className="DetalhesCliente">
          <h1>Detalhes do Cliente: {cliente.nome}</h1>

          <div className="divDetalhesCliente">
            <input
              type="text"
              disabled
              placeholder="ID"
              className="inputDetalhesCliente inputIdDetalhesCliente"
              value={`ID: ${cliente.id}`}
            />
            <input
              type="text"
              disabled
              placeholder="Nome"
              className="inputDetalhesCliente"
              value={`Nome: ${cliente.nome}`}
            />
            <input
              type="text"
              disabled
              placeholder="CPF"
              className="inputDetalhesCliente"
              value={`CPF: ${cliente.cpf}`}
            />
            <input
              type="text"
              disabled
              placeholder="Endereço"
              className="inputDetalhesCliente"
              value={`Endereço: ${cliente.endereço}`}
            />
            <input
              type="text"
              disabled
              placeholder="Número"
              className="inputDetalhesCliente"
              value={`Número: ${cliente.número}`}
            />
            <input
              type="text"
              disabled
              placeholder="Telefone"
              className="inputDetalhesCliente"
              value={`Telefone: ${cliente.telefone}`}
            />
            <input
              type="text"
              disabled
              placeholder="Bairro"
              className="inputDetalhesCliente"
              value={`Bairro: ${cliente.bairro}`}
            />
            <input
              type="text"
              disabled
              placeholder="Data de Nascimento"
              className="inputDetalhesCliente"
              value={`Data de Nascimento: ${formatarData(
                cliente.dataNascimento
              )}`}
            />
            <input
              type="text"
              disabled
              placeholder="Limite de Crédito"
              className="inputDetalhesCliente"
              value={`Limite de Crédito: ${
                typeof cliente.limiteDeCrédito === "number"
                  ? cliente.limiteDeCrédito.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })
                  : ""
              }`}
            />
          </div>
          <div className="buttonsGroupDetalhesCliente">
            <button
              type="button"
              className="btnDetalhesCliente btnVoltarCliente"
              onClick={handleVoltar}
            >
              <Link to="/Cliente/ListagemCliente" className="linkCadastro">
                Voltar
              </Link>
            </button>
            <button
              type="button"
              className="btnDetalhesCliente btnEditarCliente"
              onClick={handleEditar}
            >
              <Link
                to={`/Cliente/EditarCliente/${cliente.id}`}
                className="linkCadastro"
              >
                Editar
              </Link>
            </button>
          </div>
        </div>
        <div className="VendasCliente">
          <h2>Compras do Cliente</h2>
          <table className="detalhesClienteTabela">
            <thead>
              <tr>
                <th>ID Venda</th>
                <th>Total</th>
                <th>Data</th>
                <th>Detalhar Venda</th>
              </tr>
            </thead>
            <tbody>
              {vendas.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center" }}>
                    Nenhuma venda encontrada
                  </td>
                </tr>
              ) : (
                <>
                  {vendas.map((v) => (
                    <tr key={v.id} style={{ background: getRowColor(v) }}>
                      <td>{v.id}</td>
                      <td>
                        R$ {Number(v.valorTotal ?? v.ValorTotal).toFixed(2)}
                      </td>
                      <td>{(v.dataVenda ?? v.DataVenda)?.slice(0, 10)}</td>
                      <td>
                        <button className="btnDetalharVendaCliente">
                          <Link
                            to={`/Venda/DetalhesVenda/${v.id}`}
                            className="btnDetalharVendaClienteLink"
                          >
                            Detalhar venda
                          </Link>
                        </button>
                      </td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
            <td></td>
            <tfoot className="detalhesClienteTotal">
              <tr>
                <th>Total Gasto</th>
                <th>Total Pago</th>
                <th>Total Devido</th>
                <th>Pagar</th>
              </tr>
              <tr>
                <td>
                  Total Gasto:{" "}
                  <strong>
                    R$ {Number(cliente.totalGasto ?? 0).toFixed(2)}
                  </strong>
                </td>
                <td>
                  Total Pago:{" "}
                  <strong>
                    R$ {Number(cliente.totalPago ?? 0).toFixed(2)}
                  </strong>
                </td>
                <td>
                  Total Devido:{" "}
                  <strong>
                    R$ {Number(cliente.totalDevido ?? 0).toFixed(2)}
                  </strong>
                </td>
                <td>
                  <button className="PagarDetalhesCliente">
                    <Link className="PagarDetalhesClienteLink">Pagar</Link>
                  </button>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
