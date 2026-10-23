import React from 'react';
import { Link } from 'react-router-dom';
import { Shirt, Factory, Users, IdCard, Tags } from 'lucide-react';
import { useRequireAuth } from '../../hooks/RequireAuth/useRequireAuth.jsx';
import './HomeGerenciamento.css';

const CARDS = [
  {
    title: 'Produtos', desc: 'Catálogo, estoque e preços',
    icon: Shirt, tint: '#FCF3D6', color: '#C99700',
    novo: '/Produto/CadastroProduto', lista: '/Produto/ListagemProduto',
  },
  {
    title: 'Fornecedores', desc: 'Parceiros e fabricantes',
    icon: Factory, tint: '#F0ECE3', color: '#57534C',
    novo: '/Fornecedor/CadastroFornecedor', lista: '/Fornecedor/ListagemFornecedor',
  },
  {
    title: 'Clientes', desc: 'Base de clientes e crédito',
    icon: Users, tint: '#E6F3EC', color: '#2F8F5B',
    novo: '/Cliente/CadastroCliente', lista: '/Cliente/ListagemCliente',
  },
  {
    title: 'Funcionários', desc: 'Equipe e níveis de acesso',
    icon: IdCard, tint: '#FCF3D6', color: '#C99700',
    novo: '/Funcionario/CadastroFuncionario', lista: '/Funcionario/ListagemFuncionario',
  },
  {
    title: 'Categorias', desc: 'Organização do catálogo',
    icon: Tags, tint: '#F0ECE3', color: '#57534C',
    novo: '/Categoria/CadastroCategoria', lista: '/Categoria/ListagemCategoria',
  },
];

export function HomeGerenciamento() {
  document.title = 'Gerenciamento — Hello People';
  useRequireAuth('Funcionario');

  return (
    <div className="hger-page">
      <p className="hger-sub">Cadastre e organize tudo que move a loja.</p>
      <div className="hger-grid">
        {CARDS.map(({ title, desc, icon: Icon, tint, color, novo, lista }) => (
          <div key={title} className="hger-card">
            <div className="hger-icon" style={{ background: tint }}>
              <Icon size={23} color={color} />
            </div>
            <div className="hger-card-title">{title}</div>
            <div className="hger-card-desc">{desc}</div>
            <div className="hger-card-actions">
              <Link to={novo} className="hger-btn--dark">Novo</Link>
              <Link to={lista} className="hger-btn--outline">Ver lista</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
