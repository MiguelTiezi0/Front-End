import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import lixo from "../../assets/icons/lixo.svg";
import olhosAbertos from "../../assets/icons/olhosAbertos.svg";
import clonar from "../../assets/icons/clonar.svg";
import edit from "../../assets/icons/edit.svg";
import "./Venda.css";
import { linkVen } from "./linkItensVenda";
import { linkCat } from "../Categoria/linkCat";

export function DetalhesVenda() {
  const { id } = useParams();
  const [Venda, setVenda] = useState(null);
  const [categoriaDescricao, setCategoriaDescricao] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVendaDetalhes = async () => {
      try {
        const response = await fetch(`${linkVen}/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar detalhes do Venda");
        }

        const data = await response.json();
        setVenda(data);

        // Buscar a descrição da categoria
        if (data.categoriaId) {
          const categoriaResp = await fetch(`${linkCat}/${data.categoriaId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
          if (categoriaResp.ok) {
            const categoriaData = await categoriaResp.json();
            setCategoriaDescricao(categoriaData.descricao);
          } else {
            setCategoriaDescricao("N/A");
          }
        } else {
          setCategoriaDescricao("N/A");
        }
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar os detalhes do Venda");
      }
    };

    fetchVendaDetalhes();
  }, [id]);

  if (!Venda) {
    return <p>Carregando detalhes do Venda...</p>;
  }

  const formatarData = (dataISO) => {
    const data = new Date(dataISO);
    return data.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const dataCadastroLocal = formatarData(Venda.dataCadastro);

  const handleDelete = async () => {
    if (Venda.quantidade <= 0) {
      alert("O Venda já está inutilizado.");
      return;
    }

    try {
      const novaQuantidade = Venda.quantidade - 1;
      const response = await fetch(`${linkVen}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...Venda, quantidade: novaQuantidade }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar a quantidade do Venda");
      }

      alert("Quantidade do Venda atualizada com sucesso!");

      setVenda((prevVenda) => ({
        ...prevVenda,
        quantidade: novaQuantidade,
      }));
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar a quantidade do Venda");
    }
    navigate(`/Venda/ListagemVenda`);
  };

  const handleDetalhar = () => {
    navigate(`/Venda/ListagemVenda`);
  };

  const handleEditar = () => {
    navigate(`/Venda/EditarVenda/${id}`);
  };

  const handleClonar = () => {
    navigate("/Venda/CadastroVenda", { state: { Venda } });
  };
  const handleVoltar = () => {
    navigate("/Venda/ListagemVenda");
  };
  return (
    <div className="centroDetalhesVenda">
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
            onClick={handleDetalhar}
          >
            <img src={olhosAbertos} className="top-nav-img" alt="OlhoFechado" />
          </button>

          <button
            type="button"
            className="top-nav-button editar"
            onClick={handleEditar}
          >
            <img src={edit} className="top-nav-img" alt="Editar" />
          </button>

          <button
            type="button"
            className="top-nav-button clonar"
            onClick={handleClonar}
          >
            <img src={clonar} className="top-nav-img" alt="Clonar" />
          </button>
        </div>
    
      </div>
    <div className="DetalhesVenda">
          <h1>Detalhes do Venda: {Venda.descricao}</h1>
      <div className="divDetalhesVenda">

        <input
          type="text"
          disabled
          placeholder="ID"
          className="inputDetalhesVenda inputIdDetalhesVenda"
          value={`ID: ${Venda.id}`}
        />
        <input
          type="text"
          disabled
          placeholder="Descrição"
          className="inputDetalhesVenda"
          value={`Descrição: ${Venda.descricao}`}
        />
        <input
          type="text"
          disabled
          placeholder="Fornecedor/Marca"
          className="inputDetalhesVenda"
          value={`Fornecedor/Marca: ${Venda.fornecedorMarca}`}
        />
        <input
          type="text"
          disabled
          placeholder="Tamanho"
          className="inputDetalhesVenda"
          value={`Tamanho: ${Venda.tamanho}`}
        />
        <input
          type="text"
          disabled
          placeholder="Preço Custo"
          className="inputDetalhesVenda"
          value={`Preço de Custo: ${Venda.preçoCusto}`}
        />
        <input
          type="text"
          disabled
          placeholder="Preço Venda"
          className="inputDetalhesVenda"
          value={`Preço de Venda: ${Venda.preçoVenda}`}
        />

        <input
          type="text"
          disabled
          placeholder="Cor"
          className="inputDetalhesVenda"
          value={`Cor: ${Venda.cor}`}
        />
        <input
          type="text"
          disabled
          placeholder="Quantidade"
          className="inputDetalhesVenda"
          value={`Quantidade: ${Venda.quantidade}`}
        />
        <input
          type="text"
          disabled
          placeholder="Data Cadastro"
          className="inputDetalhesVenda"
          value={`Data Cadastro: ${dataCadastroLocal}`}
        />
        <input
          type="text"
          disabled
          placeholder="Categoria"
          className="inputDetalhesVenda"
          value={`Categoria: ${categoriaDescricao}`}
        />
      </div>
      <div className="buttonsGroupDetalhes">
        <button
          type="button"
          className="btnDetalhesVenda btnVoltarVenda"
          onClick={handleVoltar}
        >
          <Link to="/Venda/ListagemVenda" className="linkCadastro">
            Voltar
          </Link>
        </button>
        <button type="submit" className="btnDetalhesVenda btnEditarVenda">
          <Link
            to={`/Venda/EditarVenda/${Venda.id}`}
            className="linkCadastro"
          >
            Editar
          </Link>
        </button>
      </div>
    </div>
    </div>
  );
}