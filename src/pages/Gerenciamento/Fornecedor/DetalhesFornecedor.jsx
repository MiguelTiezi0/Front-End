import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import lixo from "../../../assets/icons/lixo.svg";
import olhoFechado from "../../../assets/icons/olhoFechado.svg";
import edit from "../../../assets/icons/edit.svg";
import "./Fornecedor.css";
import { linkFor } from "./linkFor";

export function DetalhesFornecedor() {
  const { id } = useParams();
  const [fornecedor, setFornecedor] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFornecedorDetalhes = async () => {
      try {
        const response = await fetch(`${linkFor}/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar detalhes do fornecedor");
        }

        const data = await response.json();
        setFornecedor(data);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar os detalhes do fornecedor");
      }
    };

    fetchFornecedorDetalhes();
  }, [id]);

  if (!fornecedor) {
    return <p>Carregando detalhes do fornecedor...</p>;
  }

  const handleVoltar = () => {
    navigate("/Fornecedor/ListagemFornecedor");
  };

  const handleEditar = () => {
    navigate(`/Fornecedor/EditarFornecedor/${id}`);
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Tem certeza que deseja deletar este fornecedor?"
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${linkFor}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar o fornecedor");
      }

      alert("Fornecedor deletado com sucesso!");
      navigate("/Fornecedor/ListagemFornecedor");
    } catch (error) {
      console.error(error);
      alert("Erro ao deletar o fornecedor");
    }
  };

  return (
    <div className="centroDetalhesFornecedor">
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
            onClick={() => navigate(`/Fornecedor/DetalhesFornecedor/${id}`)}
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
      <div className="contentDetalhesFornecedor">
        <div className="DetalhesFornecedor">
          <h1>Detalhes do Fornecedor: {fornecedor.nome}</h1>
          <div className="divDetalhesFornecedor">
            <input
              type="text"
              disabled
              placeholder="ID"
              className="inputDetalhesFornecedor"
              value={`ID: ${fornecedor.id}`}
            />
            <input
              type="text"
              disabled
              placeholder="Nome"
              className="inputDetalhesFornecedor"
              value={`Nome: ${fornecedor.nome}`}
            />
            <input
              type="text"
              disabled
              placeholder="CNPJ"
              className="inputDetalhesFornecedor"
              value={`CNPJ: ${fornecedor.cnpj}`}
            />
            <input
              type="text"
              disabled
              placeholder="Telefone"
              className="inputDetalhesFornecedor"
              value={`Telefone: ${fornecedor.numTelefone}`}
            />
          </div>
          <div className="buttonsGroupDetalhesFornecedor">
            <button
              type="button"
              className="btnDetalhesFornecedor btnVoltarFornecedor"
              onClick={handleVoltar}
            >
              <Link to="/Fornecedor/ListagemFornecedor" className="linkCadastro">
                Voltar
              </Link>
            </button>
            <button
              type="button"
              className="btnDetalhesFornecedor btnEditarFornecedor"
              onClick={handleEditar}
            >
              <Link
                to={`/Fornecedor/EditarFornecedor/${fornecedor.id}`}
                className="linkCadastro"
              >
                Editar
              </Link>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}