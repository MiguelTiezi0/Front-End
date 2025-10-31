import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAlerta } from "../../../hooks/Alerta/useAlerta";
import "./Produto.css";
import { linkPro } from "./linkPro";
import { linkCat } from "../Categoria/linkCat";
import { linkFor } from "../Fornecedor/linkFor";
import { useRequireAuth } from "../../../hooks/RequireAuth/useRequireAuth.jsx";
export function EditarProduto() {
  useRequireAuth("Funcionario");
  document.title = "Editar Produto";

  const { id } = useParams();
  const navigate = useNavigate();
  const alerta = useAlerta();

  const [idState, setIdState] = useState("");
  const [descricao, setDescricao] = useState("");
  const [fornecedorId, setFornecedorId] = useState("");
  const [fornecedores, setFornecedores] = useState([]);
  const [mostrarInputFornecedor, setMostrarInputFornecedor] = useState(false);
  const [novoFornecedor, setNovoFornecedor] = useState({
    nome: "",
    cnpj: "",
    numTelefone: "",
  });

  const [precoCusto, setPrecoCusto] = useState("");
  const [precoVenda, setPrecoVenda] = useState("");
  const [tamanho, setTamanho] = useState("");
  const [cor, setCor] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [outraCategoria, setOutraCategoria] = useState("");
  const [mostrarInputOutra, setMostrarInputOutra] = useState(false);
  const [dataCadastro, setDataCadastro] = useState("");
  const [idCompra, setIdCompra] = useState(0);
  const [ativo, setAtivo] = useState(true);

  // 🔹 Buscar produto, categorias e fornecedores
  useEffect(() => {
    const fetchProduto = async () => {
      try {
        const response = await fetch(`${linkPro}/${id}`);
        if (!response.ok) throw new Error("Erro ao buscar produto");
        const data = await response.json();

        setIdState(data.id ?? data.Id ?? "");
        setDescricao(data.descricao ?? data.Descricao ?? "");
        setPrecoCusto(
          data["preçoCusto"] ?? data.PreçoCusto ?? data.precoCusto ?? ""
        );
        setPrecoVenda(
          data["preçoVenda"] ?? data.PreçoVenda ?? data.precoVenda ?? ""
        );
        setTamanho(data.tamanho ?? data.Tamanho ?? "");
        setCor(data.cor ?? data.Cor ?? "");
        setQuantidade(String(data.quantidade ?? data.Quantidade ?? ""));
        setCategoriaId(data.categoriaId ?? data.CategoriaId ?? "");
        setDataCadastro(data.dataCadastro ?? data.DataCadastro ?? "");
        setIdCompra(data.idCompra ?? data.IdCompra ?? 0);
        setFornecedorId(data.idFornecedor ?? data.IdFornecedor ?? "");
        setAtivo(data.ativo ?? data.Ativo ?? true);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar o produto");
      }
    };

    const fetchCategorias = async () => {
      try {
        const response = await fetch(linkCat);
        if (!response.ok) throw new Error("Erro ao buscar categorias");
        const data = await response.json();
        setCategorias(data);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar categorias");
      }
    };

    const fetchFornecedores = async () => {
      try {
        const response = await fetch(linkFor);
        if (!response.ok) throw new Error("Erro ao buscar fornecedores");
        const data = await response.json();
        setFornecedores(data);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar fornecedores");
      }
    };

    fetchProduto();
    fetchCategorias();
    fetchFornecedores();
  }, [id]);

  // 🔹 Handlers de seleção
  const handleCategoriaChange = (e) => {
    const value = e.target.value;
    if (value === "outra") {
      setMostrarInputOutra(true);
      setCategoriaId("");
    } else {
      setMostrarInputOutra(false);
      setCategoriaId(parseInt(value));
      setOutraCategoria("");
    }
  };

  const handleFornecedorChange = (e) => {
    const value = e.target.value;
    if (value === "novo") {
      setMostrarInputFornecedor(true);
      setFornecedorId("");
    } else {
      setMostrarInputFornecedor(false);
      setFornecedorId(value); // Atualiza diretamente o fornecedorId
      setNovoFornecedor({ nome: "", cnpj: "", numTelefone: "" });
    }
  };

  // 🔹 Submeter edição (PUT) — montar payload com as chaves que o backend espera
  const handleSubmit = async (e) => {
    e.preventDefault();

    let categoriaParaUsar = categoriaId ? Number(categoriaId) : 0;
    let fornecedorParaUsar = fornecedorId ? Number(fornecedorId) : 0;

    // criar nova categoria se necessário
    if (mostrarInputOutra && outraCategoria.trim() !== "") {
      try {
        const responseCategoria = await fetch(linkCat, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ descricao: outraCategoria }),
        });
        if (!responseCategoria.ok)
          throw new Error("Erro ao cadastrar nova categoria");
        const novaCategoria = await responseCategoria.json();
        categoriaParaUsar = novaCategoria.id;
      } catch (error) {
        console.error(error);
        alert("Erro ao cadastrar a nova categoria");
        return;
      }
    }

    // Se criou novo fornecedor
    if (
      mostrarInputFornecedor &&
      novoFornecedor.nome.trim() !== "" &&
      novoFornecedor.cnpj.trim() !== "" &&
      novoFornecedor.numTelefone.trim() !== ""
    ) {
      try {
        const responseFornecedor = await fetch(linkFor, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(novoFornecedor),
        });
        if (!responseFornecedor.ok)
          throw new Error("Erro ao cadastrar novo fornecedor");
        const novoFornec = await responseFornecedor.json();
        fornecedorParaUsar = novoFornec.id;
      } catch (error) {
        console.error(error);
        alert("Erro ao cadastrar novo fornecedor");
        return;
      }
    }

    const payload = {
      id: Number(idState) || Number(id),
      descricao: descricao || "",
      cor: cor || "",
      tamanho: tamanho || "",
      quantidade: parseInt(quantidade, 10) || 0,
      preçoCusto: parseFloat(precoCusto) || 0,
      preçoVenda: parseFloat(precoVenda) || 0,
      ativo: ativo,
      categoriaId: Number(categoriaParaUsar) || 0,
      dataCadastro: dataCadastro || new Date().toISOString(),
      idCompra: Number(idCompra) || 0,
      idFornecedor: Number(fornecedorParaUsar) || 0, // Garante que o fornecedorId seja enviado corretamente
    };

    try {
      console.log("PUT produto payload:", payload);
      const response = await fetch(`${linkPro}/${payload.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => null);
        console.error("PUT erro:", response.status, text);
        throw new Error("Erro ao atualizar produto");
      }

      // navegar e forçar reload da listagem para refletir alteração
      alerta("Produto atualizado com sucesso!", "success");
      navigate("/Produto/ListagemProduto");
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar o produto");
    }
  };

  return (
    <div className="centro">
      <div className="CadastroProduto">
        <h1>Editar Produto</h1>
        <form className="formCadastroProduto" onSubmit={handleSubmit}>
          <input
            readOnly
            value={idState}
            className="inputCadastroProduto inputId"
          />
          <input
            required
            placeholder="Descrição"
            className="inputCadastroProduto"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />

          {/* Fornecedor */}
          {!mostrarInputFornecedor ? (
            <select
              className="selectCadastroProduto"
              value={fornecedorId}
              onChange={handleFornecedorChange}
            >
              <option value="">Selecione um fornecedor</option>
              {fornecedores.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
              ))}
              <option value="novo">Novo fornecedor</option>
            </select>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <input
                name="nome"
                required
                placeholder="Nome fornecedor"
                className="inputCadastroProduto"
                value={novoFornecedor.nome}
                onChange={(e) =>
                  setNovoFornecedor((prev) => ({
                    ...prev,
                    nome: e.target.value,
                  }))
                }
              />
              <input
                name="cnpj"
                placeholder="CNPJ"
                className="inputCadastroProduto"
                value={novoFornecedor.cnpj}
                onChange={(e) =>
                  setNovoFornecedor((prev) => ({
                    ...prev,
                    cnpj: e.target.value,
                  }))
                }
              />
              <input
                name="telefone"
                placeholder="Telefone"
                className="inputCadastroProduto"
                value={novoFornecedor.numTelefone}
                onChange={(e) =>
                  setNovoFornecedor((prev) => ({
                    ...prev,
                    numTelefone: e.target.value,
                  }))
                }
              />
            </div>
          )}

          <input
            placeholder="Preço Custo"
            className="inputCadastroProduto"
            value={precoCusto}
            onChange={(e) => setPrecoCusto(e.target.value)}
          />
          <input
            placeholder="Preço Venda"
            className="inputCadastroProduto"
            value={precoVenda}
            onChange={(e) => setPrecoVenda(e.target.value)}
          />
          <input
            placeholder="Tamanho"
            className="inputCadastroProduto"
            value={tamanho}
            onChange={(e) => setTamanho(e.target.value)}
          />
          <input
            placeholder="Cor"
            className="inputCadastroProduto"
            value={cor}
            onChange={(e) => setCor(e.target.value)}
          />
          <input
            placeholder="Quantidade"
            className="inputCadastroProduto"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
          />

          {/* Categoria */}
          {!mostrarInputOutra ? (
            <select
              className="selectCadastroProduto"
              value={categoriaId}
              onChange={handleCategoriaChange}
            >
              <option value="">Selecione uma categoria</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.descricao}
                </option>
              ))}
              <option value="outra">Outra</option>
            </select>
          ) : (
            <input
              placeholder="Nova categoria"
              className="inputCadastroProduto"
              value={outraCategoria}
              onChange={(e) => setOutraCategoria(e.target.value)}
            />
          )}

          <div className="buttonsGroupProduto">
            <button type="button" className="btnProduto btnVoltarProduto">
              <Link to="/Produto/ListagemProduto" className="linkCadastro">
                Voltar
              </Link>
            </button>
            <button type="submit" className="btnProduto btnSalvarProduto">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
