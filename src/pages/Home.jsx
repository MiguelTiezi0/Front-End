import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Package, Wallet, ShoppingCart, Truck, CreditCard, BarChart3, ArrowUpRight, Plus } from 'lucide-react';
import { useRequireAuth } from '../hooks/RequireAuth/useRequireAuth.jsx';
import './Home.css';

const MODULES = [
  { title: 'Gerenciamento', desc: 'Produtos, categorias e fornecedores', icon: Package,      tint: '#FCF3D6', color: '#C99700', to: '/Gerenciamento/HomeGerenciamento' },
  { title: 'Caixa',         desc: 'Abrir, fechar e movimentar o caixa', icon: Wallet,       tint: '#E6F3EC', color: '#2F8F5B', to: '/Caixa/HomeCaixa' },
  { title: 'Vendas',        desc: 'Registrar e consultar vendas',        icon: ShoppingCart, tint: '#FCF3D6', color: '#C99700', to: '/Venda/ListagemVenda' },
  { title: 'Compras',       desc: 'Reposição e entrada de estoque',      icon: Truck,        tint: '#F0ECE3', color: '#57534C', to: '/Compra/ListagemCompra' },
  { title: 'Pagamentos',    desc: 'Recebimentos e crediário',            icon: CreditCard,   tint: '#E6F3EC', color: '#2F8F5B', to: '/Pagamento/ListagemPagamento' },
  { title: 'Relatórios',    desc: 'Indicadores e exportações',           icon: BarChart3,    tint: '#F0ECE3', color: '#57534C', to: '/Relatorio' },
];

function getUserName() {
  try {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    const nome = u.nome || u.usuario || '';
    return nome.split(' ')[0] || 'Funcionário';
  } catch { return 'Funcionário'; }
}

export function Home() {
  document.title = 'Início — Hello People PDV';
  useRequireAuth('Funcionario');
  const firstName = useMemo(getUserName, []);

  return (
    <div className="home-page">
      {/* Welcome banner */}
      <div className="home-banner">
        <div className="home-banner-text">
          <div className="home-banner-label">PAINEL DO FUNCIONÁRIO</div>
          <h1 className="home-banner-title">Boa tarde, {firstName} 👋</h1>
          <p className="home-banner-sub">
            Tudo pronto para operar a loja. Comece registrando uma venda ou cadastrando um novo produto.
          </p>
          <div className="home-banner-actions">
            <Link to="/Venda/CadastroVenda" className="home-btn--yellow">
              <ShoppingCart size={18} /> Nova venda
            </Link>
            <Link to="/Produto/CadastroProduto" className="home-btn--outline">
              <Plus size={18} /> Novo produto
            </Link>
          </div>
        </div>
        <div className="home-kpis">
          <div className="home-kpi">
            <div className="home-kpi-label">Vendas hoje</div>
            <div className="home-kpi-value">—</div>
          </div>
          <div className="home-kpi">
            <div className="home-kpi-label">Pedidos</div>
            <div className="home-kpi-value">—</div>
          </div>
        </div>
      </div>

      {/* Modules grid */}
      <h2 className="home-section-title">Módulos</h2>
      <div className="home-modules">
        {MODULES.map(({ title, desc, icon: Icon, tint, color, to }) => (
          <Link key={title} to={to} className="home-module-card">
            <div className="home-module-icon" style={{ background: tint }}>
              <Icon size={23} color={color} />
            </div>
            <div className="home-module-row">
              <span className="home-module-title">{title}</span>
              <ArrowUpRight size={17} color="#c4bdb0" />
            </div>
            <div className="home-module-desc">{desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
