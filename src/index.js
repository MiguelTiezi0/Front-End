import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { Home } from './pages/Home';
import { Inicio } from './pages/Inicio';
import { Cadastro } from './pages/Cadastro';
import { Login } from './pages/Login';
import { Contato } from './pages/Contato';


import { HomeGerenciamento } from './pages/Gerenciamento/HomeGerenciamento';
import { HomeCaixa } from './pages/Caixa/HomeCaixa';



import { CadastroProduto } from './pages/Gerenciamento/Produto/CadastroProduto';
import { ListagemProduto } from './pages/Gerenciamento/Produto/ListagemProduto.jsx';
import { DeletarProduto } from './pages/Gerenciamento/Produto/DeletarProduto.jsx';
import { EditarProduto } from './pages/Gerenciamento/Produto/EditarProduto.jsx';
import { DetalhesProduto } from './pages/Gerenciamento/Produto/DetalhesProduto.jsx';

import { CadastroCategoria } from './pages/Gerenciamento/Categoria/CadastroCategoria';
import { ListagemCategoria } from './pages/Gerenciamento/Categoria/ListagemCategoria.jsx';
import { DeletarCategoria } from './pages/Gerenciamento/Categoria/DeletarCategoria.jsx';
import { EditarCategoria } from './pages/Gerenciamento/Categoria/EditarCategoria.jsx';

import { CadastroCliente } from './pages/Gerenciamento/Cliente/CadastroCliente.jsx';
import { ListagemCliente } from './pages/Gerenciamento/Cliente/ListagemCliente.jsx';
import { DeletarCliente } from './pages/Gerenciamento/Cliente/DeletarCliente.jsx';
import { EditarCliente } from './pages/Gerenciamento/Cliente/EditarCliente.jsx';
import { DetalhesCliente } from './pages/Gerenciamento/Cliente/DetalhesCliente.jsx';

import { CadastroFuncionario } from './pages/Gerenciamento/Funcionario/CadastroFuncionario.jsx';
import { ListagemFuncionario } from './pages/Gerenciamento/Funcionario/ListagemFuncionario.jsx';
import { DeletarFuncionario } from './pages/Gerenciamento/Funcionario/DeletarFuncionario.jsx';
import { EditarFuncionario } from './pages/Gerenciamento/Funcionario/EditarFuncionario.jsx';
import { DetalhesFuncionario } from './pages/Gerenciamento/Funcionario/DetalhesFuncionario.jsx';


import { CadastroVenda } from './pages/Caixa/Venda/CadastroVenda.jsx';
import { ListagemVenda } from './pages/Caixa/Venda/ListagemVenda.jsx';
import { DeletarVenda } from './pages/Caixa/Venda/DeletarVenda.jsx';
import { EditarVenda } from './pages/Caixa/Venda/EditarVenda.jsx';
import { DetalhesVenda } from './pages/Caixa/Venda/DetalhesVenda.jsx';

import { CadastroPagamento } from './pages/Caixa/Pagamento/CadastroPagamento.jsx';
import { ListagemPagamento } from './pages/Caixa/Pagamento/ListagemPagamento.jsx';
import { ListagemPagamentoDevedor } from './pages/Caixa/Pagamento/ListagemPagamentoDevedor.jsx';
import { DeletarPagamento } from './pages/Caixa/Pagamento/DeletarPagamento.jsx';
import { EditarPagamento } from './pages/Caixa/Pagamento/EditarPagamento.jsx';
import { DetalhesPagamento } from './pages/Caixa/Pagamento/DetalhesPagamento.jsx';


import { AlertProvider } from './hooks/Alerta/useAlerta.jsx';
import { GerenciamentoLayout } from './pages/Gerenciamento/GerenciamentoLayout.jsx';
import { CaixaLayout } from './pages/Caixa/CaixaLayout.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AlertProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/login" element={<Login />} />
          <Route path="/contato" element={<Contato />} />

          {/* Home Pages */}
          <Route path="/Gerenciamento/HomeGerenciamento" element={<HomeGerenciamento />} />
          <Route path="/Caixa/HomeCaixa" element={<HomeCaixa />} />

          {/* Gerenciamento Layout */}
          <Route element={<GerenciamentoLayout />}>
            <Route path="/Produto/CadastroProduto" element={<CadastroProduto />} />
            <Route path="/Produto/ListagemProduto" element={<ListagemProduto />} />
            <Route path="/Produto/DeletarProduto" element={<DeletarProduto />} />
            <Route path="/Produto/EditarProduto/:id" element={<EditarProduto />} />
            <Route path="/Produto/DetalhesProduto/:id" element={<DetalhesProduto />} />

            <Route path="/Categoria/CadastroCategoria" element={<CadastroCategoria />} />
            <Route path="/Categoria/ListagemCategoria" element={<ListagemCategoria />} />
            <Route path="/Categoria/DeletarCategoria" element={<DeletarCategoria />} />
            <Route path="/Categoria/EditarCategoria/:id" element={<EditarCategoria />} />

            <Route path="/Cliente/CadastroCliente" element={<CadastroCliente />} />
            <Route path="/Cliente/ListagemCliente" element={<ListagemCliente />} />
            <Route path="/Cliente/DeletarCliente" element={<DeletarCliente />} />
            <Route path="/Cliente/EditarCliente/:id" element={<EditarCliente />} />
            <Route path="/Cliente/DetalhesCliente/:id" element={<DetalhesCliente />} />

            <Route path="/Funcionario/CadastroFuncionario" element={<CadastroFuncionario />} />
            <Route path="/Funcionario/ListagemFuncionario" element={<ListagemFuncionario />} />
            <Route path="/Funcionario/DeletarFuncionario" element={<DeletarFuncionario />} />
            <Route path="/Funcionario/EditarFuncionario/:id" element={<EditarFuncionario />} />
            <Route path="/Funcionario/DetalhesFuncionario/:id" element={<DetalhesFuncionario />} />
          </Route>

          {/* Caixa Layout */}
          <Route element={<CaixaLayout />}>
            <Route path="/Venda/CadastroVenda" element={<CadastroVenda />} />
            <Route path="/Venda/ListagemVenda" element={<ListagemVenda />} />
            <Route path="/Venda/DeletarVenda" element={<DeletarVenda />} />
            <Route path="/Venda/EditarVenda/:id" element={<EditarVenda />} />
            <Route path="/Venda/DetalhesVenda/:id" element={<DetalhesVenda />} />

            <Route path="/Pagamento/CadastroPagamento" element={<CadastroPagamento />} />
            <Route path="/Pagamento/ListagemPagamento" element={<ListagemPagamento />} />
            <Route path="/Pagamento/ListagemPagamentoDevedor" element={<ListagemPagamentoDevedor />} />
            <Route path="/Pagamento/DeletarPagamento" element={<DeletarPagamento />} />
            <Route path="/Pagamento/EditarPagamento/:id" element={<EditarPagamento />} />
            <Route path="/Pagamento/DetalhesPagamento/:id" element={<DetalhesPagamento />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AlertProvider>
  </React.StrictMode>
);
