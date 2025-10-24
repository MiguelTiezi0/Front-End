import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAlerta } from "../../../hooks/Alerta/useAlerta";
import "./Produto.css";
import { linkPro } from "./linkPro";
import { linkCat } from "../Categoria/linkCat";
import { linkFor } from "../Fornecedor/linkFor";

export function EditarProduto() {
  document.title = "Editar Produto";
  const { id } = useParams();
  const navigate = useNavigate();
  const alerta = useAlerta();

  const [Id, setId] = useState("");
  const [descricao, setDescricao] = useState("");
  const [fornecedorId, setFornecedorId] = useState("");
  const [fornecedores, setFornecedores] = useState([]);
  const [mostrarInputFornecedor, setMostrarInputFornecedor] = useState(false);
  const [novoFornecedor, setNovoFornecedor] = useState({
    nome: "",
    cnpj: "",
    numTelefone: "",
  });

  const [preçoCusto, setPreçoCusto] = useState("");
  const [preçoVenda, setPreçoVenda] = useState("");
  const [tamanho, setTamanho] = useState("");
  const [cor, setCor] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [outraCategoria, setOutraCategoria] = useState("");
  const [mostrarInputOutra, setMostrarInputOutra] = useState(false);

  const [dataCadastro, setDataCadastro] = useState("");
  const [idCompra, setIdCompra] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resFor, resCat] = await Promise.all([
          fetch(linkFor),
          fetch(linkCat),
        ]);
        if (!resFor.ok || !resCat.ok)
          throw new Error("Erro ao carregar fornecedores/categorias");
        const [fornecedoresData, categoriasData] = await Promise.all([
          resFor.json(),
          resCat.json(),
        ]);
        setFornecedores(fornecedoresData);
        setCategorias(categoriasData);

        const resProd = await fetch(`${linkPro}/${id}`);
        if (!resProd.ok) throw new Error("Erro ao carregar produto");
        const prod = await resProd.json();

        setId(prod.id ?? "");
        setDescricao(prod.descricao ?? "");
        setPreçoCusto(prod["preçoCusto"] ?? "");
        setPreçoVenda(prod["preçoVenda"] ?? "");
        setTamanho(prod.tamanho ?? "");
        setCor(prod.cor ?? "");
        setQuantidade(prod.quantidade ?? "");
        setDataCadastro(prod.dataCadastro ?? "");
        setIdCompra(prod.idCompra ?? 0);

        // fornecedor: produto.armazena idFornecedor (string). se existir fornecedor com esse nome, seleciona, senão abre novo fornecedor com nome preenchido
        const fornecedorEncontrado = fornecedoresData.find(
          (f) => f.nome === prod.idFornecedor
        );
        if (fornecedorEncontrado) {
          setFornecedorId(fornecedorEncontrado.id);
          setMostrarInputFornecedor(false);
          setNovoFornecedor({ nome: "", cnpj: "", numTelefone: "" });
        } else {
          setMostrarInputFornecedor(true);
          setNovoFornecedor((prev) => ({
            ...prev,
            nome: prod.idFornecedor ?? "",
          }));
          setFornecedorId("");
        }

        // categoria: se categoriaId existe na lista, seleciona; senão mostra input "Outra"
        const existeCategoria = categoriasData.some(
          (c) => Number(c.id) === Number(prod.categoriaId)
        );
        if (existeCategoria) {
          setCategoriaId(prod.categoriaId ?? "");
          setMostrarInputOutra(false);
          setOutraCategoria("");
        } else {
          setMostrarInputOutra(true);
          setOutraCategoria("");
          setCategoriaId("");
        }
      } catch (err) {
        console.error(err);
        alert("Erro ao carregar dados do produto / fornecedores / categorias");
      }
    };

    fetchData();
  }, [id]);

  const handleFornecedorChange = (e) => {
    const value = e.target.value;
    if (value === "novo") {
      setMostrarInputFornecedor(true);
      setFornecedorId("");
    } else {
      setMostrarInputFornecedor(false);
      setFornecedorId(value ? parseInt(value) : "");
      setNovoFornecedor({ nome: "", cnpj: "", numTelefone: "" });
    }
  };

  const handleCategoriaChange = (e) => {
    const value = e.target.value;
    if (value === "outra") {
      setMostrarInputOutra(true);
      setCategoriaId("");
    } else {
      setMostrarInputOutra(false);
      setCategoriaId(value ? parseInt(value) : "");
      setOutraCategoria("");
    }
  };

  const handleNovoFornecedorChange = (e) => {
    const { name, value } = e.target;
    setNovoFornecedor((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let categoriaParaUsar = categoriaId;
    let fornecedorParaUsar = "";

    // cria categoria se necessário
    if (mostrarInputOutra) {
      if (!outraCategoria.trim()) {
        alert("Digite a nova categoria");
        return;
      }
      try {
        const res = await fetch(linkCat, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ descricao: outraCategoria }),
        });
        if (!res.ok) throw new Error("Erro ao cadastrar categoria");
        const novaCat = await res.json();
        categoriaParaUsar = novaCat.id;
        setCategorias((prev) => [...prev, novaCat]);
      } catch (err) {
        console.error(err);
        alert("Erro ao cadastrar categoria");
        return;
      }
    }

    // cria fornecedor se necessário
    if (mostrarInputFornecedor) {
      if (!novoFornecedor.nome.trim()) {
        alert("Preencha o nome do fornecedor");
        return;
      }
      try {
        const res = await fetch(linkFor, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: novoFornecedor.nome,
            cnpj: novoFornecedor.cnpj,
            numTelefone: novoFornecedor.numTelefone,
          }),
        });
        if (!res.ok) throw new Error("Erro ao cadastrar fornecedor");
        const novoFor = await res.json();
        fornecedorParaUsar = novoFor.nome;
        setFornecedores((prev) => [...prev, novoFor]);
      } catch (err) {
        console.error(err);
        alert("Erro ao cadastrar fornecedor");
        return;
      }
    } else {
      // selecionou fornecedor existente -> passar nome para idFornecedor
      if (fornecedorId) {
        const f = fornecedores.find(
          (x) => Number(x.id) === Number(fornecedorId)
        );
        fornecedorParaUsar = f ? f.nome : "";
      } else {
        fornecedorParaUsar = "";
      }
    }

    const body = {
      id: Number(Id),
      descricao,
      idFornecedor: fornecedorParaUsar,
      cor,
      tamanho,
      quantidade: parseInt(quantidade) || 0,
      preçoCusto: parseFloat(preçoCusto) || 0,
      preçoVenda: parseFloat(preçoVenda) || 0,
      ativo: (parseInt(quantidade) || 0) > 0,
      categoriaId: categoriaParaUsar ? parseInt(categoriaParaUsar) : null,
      dataCadastro: dataCadastro || new Date().toISOString(),
      idCompra: idCompra ?? 0,
    };

    try {
      const res = await fetch(`${linkPro}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Erro ao atualizar produto");
      alerta("Produto atualizado com sucesso!", "success");
      navigate("/Produto/ListagemProduto");
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar o produto");
    }
  };

  return (
    <div className="centro">
      <div className="CadastroProduto">
        <h1>Editar Produto</h1>
        <form className="formCadastroProduto" onSubmit={handleSubmit}>
          <input
            type="text"
            name="Id"
            id="Id"
            readOnly
            value={Id}
            placeholder="Id"
            className="inputCadastroProduto inputId"
          />
          <input
            type="text"
            required
            placeholder="Descrição"
            className="inputCadastroProduto"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />

          {!mostrarInputFornecedor ? (
            <select
              className="selectCadastroProduto"
              value={fornecedorId}
              onChange={handleFornecedorChange}
            >
              <option value="">Selecione um fornecedor</option>
              {fornecedores.map((fornecedor) => (
                <option key={fornecedor.id} value={fornecedor.id}>
                  {fornecedor.nome}
                </option>
              ))}
              <option value="novo">Novo fornecedor</option>
            </select>
          ) : (
            <div
              style={{
                display: "flex",
                gap: "16px",
                alignItems: "flex-start",
                marginBottom: "12px",
              }}
            >
              <input
                type="text"
                name="nome"
                required
                placeholder="Nome do fornecedor"
                className="inputCadastroProduto"
                value={novoFornecedor.nome}
                onChange={handleNovoFornecedorChange}
              />
              <input
                type="text"
                name="cnpj"
                required
                placeholder="CNPJ"
                className="inputCadastroProduto"
                value={novoFornecedor.cnpj}
                onChange={handleNovoFornecedorChange}
              />
              <input
                type="text"
                name="numTelefone"
                required
                placeholder="Telefone"
                className="inputCadastroProduto"
                value={novoFornecedor.numTelefone}
                onChange={handleNovoFornecedorChange}
              />
            </div>
          )}

          <input
            type="text"
            required
            placeholder="Preço Custo"
            className="inputCadastroProduto"
            value={preçoCusto}
            onChange={(e) => setPreçoCusto(e.target.value)}
          />
          <input
            type="text"
            required
            placeholder="Preço Venda"
            className="inputCadastroProduto"
            value={preçoVenda}
            onChange={(e) => setPreçoVenda(e.target.value)}
          />
          <input
            type="text"
            required
            placeholder="Tamanho"
            className="inputCadastroProduto"
            value={tamanho}
            onChange={(e) => setTamanho(e.target.value)}
          />
          <input
            type="text"
            required
            placeholder="Cor"
            className="inputCadastroProduto"
            value={cor}
            onChange={(e) => setCor(e.target.value)}
          />
          <input
            type="text"
            required
            placeholder="Quantidade"
            className="inputCadastroProduto"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
          />

          {!mostrarInputOutra ? (
            <select
              className="selectCadastroProduto"
              value={categoriaId}
              onChange={handleCategoriaChange}
            >
              <option value="">Selecione uma categoria</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.descricao}
                </option>
              ))}
              <option value="outra">Outra</option>
            </select>
          ) : (
            <input
              type="text"
              required
              placeholder="Digite a nova categoria"
              className="inputCadastroProduto"
              value={outraCategoria}
              onChange={(e) => setOutraCategoria(e.target.value)}
            />
          )}

          <div className="buttonsGroupProduto">
            <button type="button" className="btnProduto btnVoltarProduto">
              <Link to="/" className="linkCadastro">
                Voltar
              </Link>
            </button>
            <button type="submit" className="btnProduto btnSalvarProduto">
              Salvar
            </button>
            <button
              type="button"
              className="btnProduto btnEtiquetaProduto"
              onClick={() => alert("Gerar etiqueta")}
            >
              Etiqueta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
