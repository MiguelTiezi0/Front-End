import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./Fornecedor.css";
import { linkFor } from "./linkFor";

export function EditarFornecedor() {
  document.title = "Editar Fornecedor";
  const { id } = useParams();
  const navigate = useNavigate();
  const [fornecedor, setFornecedor] = useState({
    id: "",
    nome: "",
    cnpj: "",
    numTelefone: "",
  });

  useEffect(() => {
    const fetchFornecedor = async () => {
      try {
        const response = await fetch(`${linkFor}/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar os dados do fornecedor");
        }

        const data = await response.json();
        setFornecedor(data);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar os dados do fornecedor");
      }
    };

    fetchFornecedor();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFornecedor((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${linkFor}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: Number(fornecedor.id),
          nome: fornecedor.nome,
          cnpj: fornecedor.cnpj,
          numTelefone: fornecedor.numTelefone,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar o fornecedor");
      }

      alert("Fornecedor atualizado com sucesso!");
      navigate("/Fornecedor/ListagemFornecedor");
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar o fornecedor");
    }
  };

  return (
    <div className="EditarCategoria">
      <h1>Editar Fornecedor</h1>
      <form className="divEditarCategoria" onSubmit={handleSubmit}>
        <input
          type="text"
          name="id"
          id="id"
          readOnly
          value={fornecedor.id || ""}
          placeholder="Id"
          className="inputEditarCategoria"
        />
        <input
          type="text"
          name="nome"
          required
          placeholder="Nome"
          className="inputEditarCategoria"
          value={fornecedor.nome}
          onChange={handleChange}
        />
        <input
          type="text"
          name="cnpj"
          required
          placeholder="CNPJ"
          className="inputEditarCategoria"
          value={fornecedor.cnpj}
          onChange={handleChange}
        />
        <input
          type="text"
          name="numTelefone"
          required
          placeholder="Telefone"
          className="inputEditarCategoria"
          value={fornecedor.numTelefone}
          onChange={handleChange}
        />
        <div className="buttonsGroupEditarCategoria">
          <button type="button" className="btnCategoria btnVoltarCategoria">
            <Link to="/Fornecedor/ListagemFornecedor" className="linkCadastro">
              Voltar
            </Link>
          </button>
          <button type="submit" className="btnCategoria btnSalvarCategoria">
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}