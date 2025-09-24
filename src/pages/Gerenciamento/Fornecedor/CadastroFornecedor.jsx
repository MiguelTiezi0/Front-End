import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Fornecedor.css";
import { linkFor } from "./linkFor";

export function CadastroFornecedor() {
  document.title = "Cadastro de Fornecedor";
  const location = useLocation();
  const fornecedorClonado = location.state?.fornecedor || null;

  const navigate = useNavigate();

  const [id, setId] = useState("");
  const [nome, setNome] = useState(fornecedorClonado?.nome || "");
  const [cnpj, setCnpj] = useState(fornecedorClonado?.cnpj || "");
  const [numTelefone, setNumTelefone] = useState(fornecedorClonado?.numTelefone || "");

  useEffect(() => {
    const fetchFornecedores = async () => {
      try {
        const response = await fetch(linkFor, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar fornecedores");
        }

        const fornecedores = await response.json();
        const maiorId = fornecedores.reduce((max, fornecedor) => Math.max(max, fornecedor.id), 0);
        setId(maiorId + 1);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar os fornecedores");
      }
    };

    fetchFornecedores();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fornecedor = {
      id: Number(id),
      nome,
      cnpj: cnpj,
      numTelefone,
    };

    try {
      const response = await fetch(linkFor, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fornecedor),
      });

      if (!response.ok) {
        throw new Error("Erro ao cadastrar o fornecedor");
      }

      // Atualiza o próximo ID
      const responseFornecedores = await fetch(linkFor, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!responseFornecedores.ok) {
        throw new Error("Erro ao buscar fornecedores para calcular o próximo ID");
      }

      const fornecedores = await responseFornecedores.json();
      const maiorId = fornecedores.reduce((max, fornecedor) => Math.max(max, fornecedor.id), 0);
      setId(maiorId + 1);
      navigate("/Fornecedor/ListagemFornecedor");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="centro">
      <div className="CadastroCategoria">
        <h1>Cadastro de Fornecedor</h1>
        <form className="formCadastroCategoria" onSubmit={handleSubmit}>
          <input
            type="text"
            name="id"
            id="id"
            readOnly
            value={id}
            placeholder="Id"
            className="inputCadastroCategoria"
          />
          <input
            type="text"
            required
            placeholder="Nome"
            className="inputCadastroCategoria"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <input
            type="text"
            required
            placeholder="CNPJ"
            className="inputCadastroCategoria"
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
          />
          <input
            type="text"
            required
            placeholder="Telefone"
            className="inputCadastroCategoria"
            value={numTelefone}
            onChange={(e) => setNumTelefone(e.target.value)}
          />
          <div className="buttonsGroupCategoria">
            <button type="button" className="btnCategoria btnVoltarCategoria">
              <Link to="/" className="linkCadastro">
                Voltar
              </Link>
            </button>
            <button type="submit" className="btnCategoria btnSalvarCategoria">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}