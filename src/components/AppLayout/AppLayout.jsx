import React, { useMemo } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Shirt, Users, IdCard, Factory, Tags,
  Wallet, ShoppingCart, Truck, CreditCard, BarChart3,
  Search, Bell, Plus, LogOut,
} from 'lucide-react';
import './AppLayout.css';

const PAGE_META = {
  '/home': ['Início', 'Painel do funcionário'],
  '/': ['Início', 'Painel do funcionário'],
  '/Gerenciamento/HomeGerenciamento': ['Gerenciamento', 'Gestão · Hello People'],
  '/Caixa/HomeCaixa': ['Caixa', 'Operações · Caixa'],
  '/Produto/CadastroProduto': ['Novo produto', 'Gerenciamento · Produtos · Cadastro'],
  '/Produto/ListagemProduto': ['Produtos', 'Gerenciamento · Produtos'],
  '/Cliente/CadastroCliente': ['Novo cliente', 'Gerenciamento · Clientes · Cadastro'],
  '/Cliente/ListagemCliente': ['Clientes', 'Gerenciamento · Clientes'],
  '/Funcionario/CadastroFuncionario': ['Novo funcionário', 'Gerenciamento · Funcionários · Cadastro'],
  '/Funcionario/ListagemFuncionario': ['Funcionários', 'Gerenciamento · Funcionários'],
  '/Fornecedor/CadastroFornecedor': ['Novo fornecedor', 'Gerenciamento · Fornecedores · Cadastro'],
  '/Fornecedor/ListagemFornecedor': ['Fornecedores', 'Gerenciamento · Fornecedores'],
  '/Categoria/CadastroCategoria': ['Nova categoria', 'Gerenciamento · Categorias · Cadastro'],
  '/Categoria/ListagemCategoria': ['Categorias', 'Gerenciamento · Categorias'],
  '/Venda/CadastroVenda': ['Nova venda', 'Caixa · Vendas · Cadastro'],
  '/Venda/ListagemVenda': ['Vendas', 'Caixa · Vendas'],
  '/Compra/CadastroCompra': ['Nova compra', 'Caixa · Compras · Cadastro'],
  '/Compra/ListagemCompra': ['Compras', 'Caixa · Compras'],
  '/Pagamento/CadastroPagamento': ['Novo pagamento', 'Caixa · Pagamentos · Cadastro'],
  '/Pagamento/ListagemPagamento': ['Pagamentos', 'Caixa · Pagamentos'],
  '/Pagamento/ListagemPagamentoDevedor': ['Devedores', 'Caixa · Pagamentos · Devedores'],
  '/Relatorio': ['Relatórios', 'Análise · Relatórios'],
};

function getPageMeta(pathname) {
  if (PAGE_META[pathname]) return PAGE_META[pathname];
  const base = '/' + pathname.split('/').slice(1, 3).join('/');
  return PAGE_META[base] || [pathname.split('/').pop() || 'Sistema', 'Hello People PDV'];
}

const NAV_GROUPS = [
  {
    title: '',
    items: [
      { label: 'Início', icon: LayoutDashboard, paths: ['/home', '/'], to: '/home' },
    ],
  },
  {
    title: 'GERENCIAMENTO',
    items: [
      { label: 'Produtos', icon: Shirt, paths: ['/Produto'], to: '/Produto/ListagemProduto' },
      { label: 'Clientes', icon: Users, paths: ['/Cliente'], to: '/Cliente/ListagemCliente' },
      { label: 'Funcionários', icon: IdCard, paths: ['/Funcionario'], to: '/Funcionario/ListagemFuncionario' },
      { label: 'Fornecedores', icon: Factory, paths: ['/Fornecedor'], to: '/Fornecedor/ListagemFornecedor' },
      { label: 'Categorias', icon: Tags, paths: ['/Categoria'], to: '/Categoria/ListagemCategoria' },
    ],
  },
  {
    title: 'CAIXA',
    items: [
      { label: 'Home Caixa', icon: Wallet, paths: ['/Caixa'], to: '/Caixa/HomeCaixa' },
      { label: 'Vendas', icon: ShoppingCart, paths: ['/Venda'], to: '/Venda/ListagemVenda' },
      { label: 'Compras', icon: Truck, paths: ['/Compra'], to: '/Compra/ListagemCompra' },
      { label: 'Pagamentos', icon: CreditCard, paths: ['/Pagamento'], to: '/Pagamento/ListagemPagamento' },
    ],
  },
  {
    title: 'ANÁLISE',
    items: [
      { label: 'Relatórios', icon: BarChart3, paths: ['/Relatorio'], to: '/Relatorio' },
    ],
  },
];

function isActive(paths, pathname) {
  return paths.some(p => {
    if (p === '/home' || p === '/') return pathname === '/home' || pathname === '/';
    return pathname.startsWith(p);
  });
}

function getUserInfo() {
  try {
    const raw = localStorage.getItem('user');
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function getInitials(nome) {
  if (!nome) return 'U';
  const parts = nome.trim().split(' ');
  return parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0][0];
}

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [title, crumb] = useMemo(() => getPageMeta(location.pathname), [location.pathname]);
  const user = useMemo(() => getUserInfo(), []);

  function handleLogout() {
    localStorage.removeItem('user');
    navigate('/login');
  }

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-logo">Hello People</span>
          <span className="sidebar-tag">SISTEMA PDV</span>
        </div>

        <nav className="sidebar-nav">
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi} className="nav-group">
              {group.title && <div className="nav-group-title">{group.title}</div>}
              {group.items.map((item) => {
                const active = isActive(item.paths, location.pathname);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    className={`nav-item ${active ? 'nav-item--active' : ''}`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-avatar">
            {getInitials(user?.nome || user?.usuario || 'U').toUpperCase()}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.nome || user?.usuario || 'Funcionário'}</div>
            <div className="sidebar-user-role">{user?.nivelAcesso || 'Funcionario'}</div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout} title="Sair">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="app-main">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <div className="topbar-title">{title}</div>
            <div className="topbar-crumb">{crumb}</div>
          </div>
          <div className="topbar-right">
            <div className="topbar-search">
              <Search size={16} color="#b4aea2" />
              <input placeholder="Buscar no sistema…" />
            </div>
            <Link to="/Venda/CadastroVenda" className="topbar-new-sale">
              <Plus size={16} />
              Nova venda
            </Link>
            <button className="topbar-bell">
              <Bell size={18} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="app-content">
          <div className="app-content-inner">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
