import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { Header } from './components/Header/Header.jsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { Home } from './pages/Home';

import { CadastroProduto } from './pages/Produto/CadastroProduto';
import { ListagemProduto } from './pages/Produto/ListagemProduto.jsx';
import { DeletarProduto } from './pages/Produto/DeletarProduto.jsx';
import { EditarProduto } from './pages/Produto/EditarProduto.jsx';
import { DetalhesProduto } from './pages/Produto/DetalhesProduto.jsx';

import { CadastroCategoria } from './pages/Categoria/CadastroCategoria';
import { ListagemCategoria } from './pages/Categoria/ListagemCategoria.jsx';
import { DeletarCategoria } from './pages/Categoria/DeletarCategoria.jsx';
import { EditarCategoria } from './pages/Categoria/EditarCategoria.jsx';

import { CadastroCliente } from './pages/Cliente/CadastroCliente.jsx';
import { ListagemCliente } from './pages/Cliente/ListagemCliente.jsx';
import { DeletarCliente } from './pages/Cliente/DeletarCliente.jsx';
import { EditarCliente } from './pages/Cliente/EditarCliente.jsx';
import { DetalhesCliente } from './pages/Cliente/DetalhesCliente.jsx';

import { CadastroFuncionario } from './pages/Funcionario/CadastroFuncionario.jsx';
import { ListagemFuncionario } from './pages/Funcionario/ListagemFuncionario.jsx';
import { DeletarFuncionario } from './pages/Funcionario/DeletarFuncionario.jsx';
import { EditarFuncionario } from './pages/Funcionario/EditarFuncionario.jsx';
import { DetalhesFuncionario } from './pages/Funcionario/DetalhesFuncionario.jsx';


import { CadastroVenda } from './pages/Venda/CadastroVenda.jsx';
import { ListagemVenda } from './pages/Venda/ListagemVenda.jsx';
import { DeletarVenda } from './pages/Venda/DeletarVenda.jsx';
import { EditarVenda } from './pages/Venda/EditarVenda.jsx';
import { DetalhesVenda } from './pages/Venda/DetalhesVenda.jsx';

import { CadastroPagamento } from './pages/Pagamento/CadastroPagamento.jsx';
import { ListagemPagamento } from './pages/Pagamento/ListagemPagamento.jsx';
import { DeletarPagamento } from './pages/Pagamento/DeletarPagamento.jsx';
import { EditarPagamento } from './pages/Pagamento/EditarPagamento.jsx';
import { DetalhesPagamento } from './pages/Pagamento/DetalhesPagamento.jsx';


import { AlertProvider } from './hooks/Alerta/useAlerta.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
  <AlertProvider>
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />

        {/* Produto */}
        <Route path="/Produto/CadastroProduto" element={<CadastroProduto />} />
        <Route path="/Produto/ListagemProduto" element={<ListagemProduto />} />
        <Route path="/Produto/DeletarProduto" element={<DeletarProduto />} />
        <Route path="/Produto/EditarProduto/:id" element={<EditarProduto />} />
        <Route path="/Produto/DetalhesProduto/:id" element={<DetalhesProduto />} />

        {/* Categoria */}
        <Route path="/Categoria/CadastroCategoria" element={<CadastroCategoria />} />
        <Route path="/Categoria/ListagemCategoria" element={<ListagemCategoria />} />
        <Route path="/Categoria/DeletarCategoria" element={<DeletarCategoria />} />
        <Route path="/Categoria/EditarCategoria/:id" element={<EditarCategoria />} />

        {/* Cliente */}
        <Route path="/Cliente/CadastroCliente" element={<CadastroCliente />} />
        <Route path="/Cliente/ListagemCliente" element={<ListagemCliente />} />
        <Route path="/Cliente/DeletarCliente" element={<DeletarCliente />} />
        <Route path="/Cliente/EditarCliente/:id" element={<EditarCliente />} />
        <Route path="/Cliente/DetalhesCliente/:id" element={<DetalhesCliente />} />
  

        {/* Funcionario */}
        <Route path="/Funcionario/CadastroFuncionario" element={<CadastroFuncionario />} />
        <Route path="/Funcionario/ListagemFuncionario" element={<ListagemFuncionario />} />
        <Route path="/Funcionario/DeletarFuncionario" element={<DeletarFuncionario />} />
        <Route path="/Funcionario/EditarFuncionario/:id" element={<EditarFuncionario />} />
        <Route path="/Funcionario/DetalhesFuncionario/:id" element={<DetalhesFuncionario />} />

        {/* Venda */}
        <Route path="/Venda/CadastroVenda" element={<CadastroVenda />} />
        <Route path="/Venda/ListagemVenda" element={<ListagemVenda />} />
        <Route path="/Venda/DeletarVenda" element={<DeletarVenda />} />
        <Route path="/Venda/EditarVenda/:id" element={<EditarVenda />} />
        <Route path="/Venda/DetalhesVenda/:id" element={<DetalhesVenda />} />

        {/* Pagamento */}
        <Route path="/Pagamento/Pagamento" element={<CadastroPagamento />} />
        <Route path="/Pagamento/ListagemPagamento" element={<ListagemPagamento />} />
        <Route path="/Pagamento/DeletarPagamento" element={<DeletarPagamento />} />
        <Route path="/Pagamento/EditarPagamento/:id" element={<EditarPagamento />} />
        <Route path="/Pagamento/DetalhesPagamento/:id" element={<DetalhesPagamento />} />

      </Routes>



      {/* <footer className="footer">
        <p>&copy; 2025 Sistema de Gestão MiguelTiera. Todos os direitos reservados.</p>
      </footer> */}
    </BrowserRouter>
  </AlertProvider>
  </React.StrictMode>
  
);
