import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import lixo from "../../../assets/icons/lixo.svg";
import olhosAbertos from "../../../assets/icons/olhosAbertos.svg";
import clonar from "../../../assets/icons/clonar.svg";
import edit from "../../../assets/icons/edit.svg";
import "./Produto.css";
import { linkPro } from "./linkPro";
import { linkCat } from "../Categoria/linkCat";

export function DetalhesProduto() {
  const { id } = useParams();
  const [produto, setProduto] = useState(null);
  const [categoriaDescricao, setCategoriaDescricao] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProdutoDetalhes = async () => {
      try {
        const response = await fetch(`${linkPro}/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar detalhes do produto");
        }

        const data = await response.json();
        setProduto(data);

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
        alert("Erro ao carregar os detalhes do produto");
      }
    };

    fetchProdutoDetalhes();
  }, [id]);

  if (!produto) {
    return <p>Carregando detalhes do produto...</p>;
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

  const dataCadastroLocal = formatarData(produto.dataCadastro);

  const handleDelete = async () => {
    if (produto.quantidade <= 0) {
      alert("O produto já está inutilizado.");
      return;
    }

    try {
      const novaQuantidade = produto.quantidade - 1;
      const response = await fetch(`${linkPro}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...produto, quantidade: novaQuantidade }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar a quantidade do produto");
      }

      alert("Quantidade do produto atualizada com sucesso!");

      setProduto((prevProduto) => ({
        ...prevProduto,
        quantidade: novaQuantidade,
      }));
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar a quantidade do produto");
    }
    navigate(`/Produto/ListagemProduto`);
  };

  const handleDetalhar = () => {
    navigate(`/Produto/ListagemProduto`);
  };

  const handleEditar = () => {
    navigate(`/Produto/EditarProduto/${id}`);
  };

  const handleClonar = () => {
    navigate("/Produto/CadastroProduto", { state: { produto } });
  };
  const handleVoltar = () => {
    navigate("/Produto/ListagemProduto");
  };
  return (
    <div className="centroDetalhesProduto">
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
    <div className="DetalhesProduto">
          <h1>Detalhes do Produto: {produto.descricao}</h1>
      <div className="divDetalhesProduto">

        <input
          type="text"
          disabled
          placeholder="ID"
          className="inputDetalhesProduto inputIdDetalhesProduto"
          value={`ID: ${produto.id}`}
        />
        <input
          type="text"
          disabled
          placeholder="Descrição"
          className="inputDetalhesProduto"
          value={`Descrição: ${produto.descricao}`}
        />
        <input
          type="text"
          disabled
          placeholder="Fornecedor/Marca"
          className="inputDetalhesProduto"
          value={`Fornecedor/Marca: ${produto.idFornecedor}`}
        />
        <input
          type="text"
          disabled
          placeholder="Tamanho"
          className="inputDetalhesProduto"
          value={`Tamanho: ${produto.tamanho}`}
        />
        <input
          type="text"
          disabled
          placeholder="Preço Custo"
          className="inputDetalhesProduto"
          value={`Preço de Custo: ${produto.preçoCusto}`}
        />
        <input
          type="text"
          disabled
          placeholder="Preço Venda"
          className="inputDetalhesProduto"
          value={`Preço de Venda: ${produto.preçoVenda}`}
        />

        <input
          type="text"
          disabled
          placeholder="Cor"
          className="inputDetalhesProduto"
          value={`Cor: ${produto.cor}`}
        />
        <input
          type="text"
          disabled
          placeholder="Quantidade"
          className="inputDetalhesProduto"
          value={`Quantidade: ${produto.quantidade}`}
        />
        <input
          type="text"
          disabled
          placeholder="Data Cadastro"
          className="inputDetalhesProduto"
          value={`Data Cadastro: ${dataCadastroLocal}`}
        />
        <input
          type="text"
          disabled
          placeholder="Categoria"
          className="inputDetalhesProduto"
          value={`Categoria: ${categoriaDescricao}`}
        />
      </div>
      <div className="buttonsGroupDetalhes">
        <button
          type="button"
          className="btnDetalhesProduto btnVoltarProduto"
          onClick={handleVoltar}
        >
          <Link to="/Produto/ListagemProduto" className="linkCadastro">
            Voltar
          </Link>
        </button>
        <button type="submit" className="btnDetalhesProduto btnEditarProduto">
          <Link
            to={`/Produto/EditarProduto/${produto.id}`}
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