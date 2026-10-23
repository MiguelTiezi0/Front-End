import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/crud.css';
import './utils/apiFetch';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { AppLayout } from './components/AppLayout/AppLayout';
import { AlertProvider } from './hooks/Alerta/useAlerta.jsx';
import { OAuth2Callback } from './pages/OAuth2Callback.jsx';

// Public pages
import { Inicio }   from './pages/Inicio';
import { Login }    from './pages/Login';
import { Cadastro } from './pages/Cadastro';
import { Contato }  from './pages/Contato';

// Internal pages
import { Home }                from './pages/Home';
import { HomeGerenciamento }   from './pages/Gerenciamento/HomeGerenciamento';
import { HomeCaixa }           from './pages/Caixa/HomeCaixa';
import Relatorio               from './pages/Relatorio';

import { CadastroProduto }   from './pages/Gerenciamento/Produto/CadastroProduto';
import { ListagemProduto }   from './pages/Gerenciamento/Produto/ListagemProduto.jsx';
import { EditarProduto }     from './pages/Gerenciamento/Produto/EditarProduto.jsx';
import { DetalhesProduto }   from './pages/Gerenciamento/Produto/DetalhesProduto.jsx';

import { CadastroCategoria }   from './pages/Gerenciamento/Categoria/CadastroCategoria';
import { ListagemCategoria }   from './pages/Gerenciamento/Categoria/ListagemCategoria.jsx';
import { EditarCategoria }     from './pages/Gerenciamento/Categoria/EditarCategoria.jsx';

import { CadastroCliente }   from './pages/Gerenciamento/Cliente/CadastroCliente.jsx';
import { ListagemCliente }   from './pages/Gerenciamento/Cliente/ListagemCliente.jsx';
import { EditarCliente }     from './pages/Gerenciamento/Cliente/EditarCliente.jsx';
import { DetalhesCliente }   from './pages/Gerenciamento/Cliente/DetalhesCliente.jsx';

import { CadastroFuncionario }   from './pages/Gerenciamento/Funcionario/CadastroFuncionario.jsx';
import { ListagemFuncionario }   from './pages/Gerenciamento/Funcionario/ListagemFuncionario.jsx';
import { EditarFuncionario }     from './pages/Gerenciamento/Funcionario/EditarFuncionario.jsx';
import { DetalhesFuncionario }   from './pages/Gerenciamento/Funcionario/DetalhesFuncionario.jsx';

import { CadastroFornecedor }   from './pages/Gerenciamento/Fornecedor/CadastroFornecedor.jsx';
import { ListagemFornecedor }   from './pages/Gerenciamento/Fornecedor/ListagemFornecedor.jsx';
import { EditarFornecedor }     from './pages/Gerenciamento/Fornecedor/EditarFornecedor.jsx';
import { DetalhesFornecedor }   from './pages/Gerenciamento/Fornecedor/DetalhesFornecedor.jsx';

import { CadastroVenda }   from './pages/Caixa/Venda/CadastroVenda.jsx';
import { ListagemVenda }   from './pages/Caixa/Venda/ListagemVenda.jsx';
import { EditarVenda }     from './pages/Caixa/Venda/EditarVenda.jsx';
import { DetalhesVenda }   from './pages/Caixa/Venda/DetalhesVenda.jsx';

import { CadastroCompra }   from './pages/Caixa/Compra/CadastroCompra.jsx';
import { ListagemCompra }   from './pages/Caixa/Compra/ListagemCompra.jsx';
import { EditarCompra }     from './pages/Caixa/Compra/EditarCompra.jsx';
import { DetalhesCompra }   from './pages/Caixa/Compra/DetalhesCompra.jsx';

import { CadastroPagamento }          from './pages/Caixa/Pagamento/CadastroPagamento.jsx';
import { ListagemPagamento }          from './pages/Caixa/Pagamento/ListagemPagamento.jsx';
import { ListagemPagamentoDevedor }   from './pages/Caixa/Pagamento/ListagemPagamentoDevedor.jsx';
import { EditarPagamento }            from './pages/Caixa/Pagamento/EditarPagamento.jsx';
import { DetalhesPagamento }          from './pages/Caixa/Pagamento/DetalhesPagamento.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AlertProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/inicio"           element={<Inicio />} />
          <Route path="/login"            element={<Login />} />
          <Route path="/cadastro"         element={<Cadastro />} />
          <Route path="/contato"          element={<Contato />} />
          <Route path="/oauth2/callback"  element={<OAuth2Callback />} />

          {/* Internal routes — all wrapped in the unified AppLayout */}
          <Route element={<AppLayout />}>
            <Route path="/"    element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/Gerenciamento/HomeGerenciamento" element={<HomeGerenciamento />} />
            <Route path="/Caixa/HomeCaixa"                 element={<HomeCaixa />} />
            <Route path="/Relatorio"                       element={<Relatorio />} />

            <Route path="/Produto/CadastroProduto"          element={<CadastroProduto />} />
            <Route path="/Produto/ListagemProduto"          element={<ListagemProduto />} />
            <Route path="/Produto/EditarProduto/:id"        element={<EditarProduto />} />
            <Route path="/Produto/DetalhesProduto/:id"      element={<DetalhesProduto />} />

            <Route path="/Categoria/CadastroCategoria"      element={<CadastroCategoria />} />
            <Route path="/Categoria/ListagemCategoria"      element={<ListagemCategoria />} />
            <Route path="/Categoria/EditarCategoria/:id"    element={<EditarCategoria />} />

            <Route path="/Cliente/CadastroCliente"          element={<CadastroCliente />} />
            <Route path="/Cliente/ListagemCliente"          element={<ListagemCliente />} />
            <Route path="/Cliente/EditarCliente/:id"        element={<EditarCliente />} />
            <Route path="/Cliente/DetalhesCliente/:id"      element={<DetalhesCliente />} />

            <Route path="/Funcionario/CadastroFuncionario"      element={<CadastroFuncionario />} />
            <Route path="/Funcionario/ListagemFuncionario"      element={<ListagemFuncionario />} />
            <Route path="/Funcionario/EditarFuncionario/:id"    element={<EditarFuncionario />} />
            <Route path="/Funcionario/DetalhesFuncionario/:id"  element={<DetalhesFuncionario />} />

            <Route path="/Fornecedor/CadastroFornecedor"        element={<CadastroFornecedor />} />
            <Route path="/Fornecedor/ListagemFornecedor"        element={<ListagemFornecedor />} />
            <Route path="/Fornecedor/EditarFornecedor/:id"      element={<EditarFornecedor />} />
            <Route path="/Fornecedor/DetalhesFornecedor/:id"    element={<DetalhesFornecedor />} />

            <Route path="/Venda/CadastroVenda"              element={<CadastroVenda />} />
            <Route path="/Venda/ListagemVenda"              element={<ListagemVenda />} />
            <Route path="/Venda/EditarVenda/:id"            element={<EditarVenda />} />
            <Route path="/Venda/DetalhesVenda/:id"          element={<DetalhesVenda />} />

            <Route path="/Compra/CadastroCompra"            element={<CadastroCompra />} />
            <Route path="/Compra/ListagemCompra"            element={<ListagemCompra />} />
            <Route path="/Compra/EditarCompra/:id"          element={<EditarCompra />} />
            <Route path="/Compra/DetalhesCompra/:id"        element={<DetalhesCompra />} />

            <Route path="/Pagamento/CadastroPagamento"          element={<CadastroPagamento />} />
            <Route path="/Pagamento/ListagemPagamento"          element={<ListagemPagamento />} />
            <Route path="/Pagamento/ListagemPagamentoDevedor"   element={<ListagemPagamentoDevedor />} />
            <Route path="/Pagamento/EditarPagamento/:id"        element={<EditarPagamento />} />
            <Route path="/Pagamento/DetalhesPagamento/:id"      element={<DetalhesPagamento />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AlertProvider>
  </React.StrictMode>
);
