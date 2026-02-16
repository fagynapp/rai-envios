import React, { useState, useEffect, useMemo } from 'react';

interface PhoneEntry {
  id?: number; // Opcional, usado para contatos do usuário
  name: string;
  number: string;
  subject?: string; // Assunto para organização
  isHighlight?: boolean;
  isUserContact?: boolean; // Flag para identificar contatos manuais
}

interface PhoneCategory {
  title: string;
  items: PhoneEntry[];
}

// Dados estáticos (Oficiais)
const PHONE_DIRECTORY: PhoneCategory[] = [
  {
    title: '1º CRPM (CAPITAL/CPC)',
    items: [
      { name: 'Supervisão', number: '62 9 9975-1306', isHighlight: true },
      { name: '6º BPM', number: '62 9 9611-3702' },
      { name: '7º BPM', number: '62 9 9939-4284' },
      { name: '9º BPM', number: '62 9 9631-4047' },
      { name: '13º BPM', number: '62 9 9637-1963' },
      { name: '30º BPM', number: '62 9 9968-4564' },
      { name: '31º BPM', number: '62 9 9968-5694' },
      { name: '38º BPM', number: '62 9 9611-3622' },
      { name: '42º BPM', number: '62 9 9631-4275' },
    ]
  },
  {
    title: '2º CRPM (APARECIDA DE GOIÂNIA)',
    items: [
      { name: 'Supervisão', number: '62 9 9923-8981', isHighlight: true },
      { name: '8º BPM', number: '62 9 9974-9587' },
      { name: '39º BPM', number: '62 9 9974-1913' },
      { name: '41º BPM', number: '62 9 9968-4589' },
      { name: '45º BPM', number: '62 9 9631-4352' },
      { name: '27º BPM', number: '62 9 9631-4358' },
      { name: 'CPE - 2º CRPM', number: '62 9 9972-3257', isHighlight: true },
    ]
  },
  {
    title: '3º CRPM (ANÁPOLIS)',
    items: [
      { name: '4º BPM', number: '62 9 9628-9623' },
      { name: '28º BPM', number: '62 9 9628-9656' },
      { name: '37º BPM', number: '62 9 9613-6383' },
      { name: 'CPE - 3º CRPM', number: '62 9 9910-6782', isHighlight: true },
    ]
  },
  {
    title: '16º CRPM (TRINDADE/REGIÃO)',
    items: [
      { name: '22º BPM', number: '62 9 9631-4335' },
      { name: '25º BPM', number: '64 9 9973-4751' },
      { name: '40º BPM', number: '62 9 9679-0426' },
      { name: '49º BPM', number: '62 9 9964-0695' },
      { name: 'CPE - 16º CRPM', number: '62 9 9805-4678', isHighlight: true },
    ]
  },
  {
    title: 'CME - COMANDO DE MISSÕES ESPECIAIS',
    items: [
      { name: 'CHOQUE', number: '62 9 9638-1641' },
      { name: 'RPMON (Cavalaria)', number: '62 9 9628-9702' },
      { name: 'BOPE', number: '62 9 9614-4031' },
      { name: 'BEPE', number: '62 9 9930-3694' },
    ]
  },
  {
    title: 'COC - COMANDO DE OPERAÇÕES DE CERRADO',
    items: [
      { name: 'BPM RURAL', number: '62 9 9964-5895' },
      { name: 'BPAMB (Ambiental)', number: '62 9 9611-2182' },
      { name: 'COD', number: '62 9 9247-1441' },
    ]
  },
  {
    title: 'ESPECIALIZADAS E OUTROS (CAPITAL)',
    items: [
      { name: 'CPC 2 / CPI', number: '62 9 9601-8790' },
      { name: 'Batalhão Mª da Penha', number: '62 9 9930-9778' },
      { name: 'BPM Terminal', number: '62 9 9612-3615' },
      { name: 'ROTAM', number: '62 9 9838-7803' },
      { name: 'GIRO', number: '62 9 9701-4886' },
      { name: 'CPTran (Trânsito)', number: '62 9 9628-3479' },
    ]
  }
];

const UserTelefones = () => {
  // A categoria padrão aberta agora pode ser 'MEUS CONTATOS'
  const [openCategory, setOpenCategory] = useState<string | null>('MEUS CONTATOS');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para favoritos
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('phone_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Estado para MEUS CONTATOS
  const [myContacts, setMyContacts] = useState<PhoneEntry[]>(() => {
    const saved = localStorage.getItem('my_contacts');
    return saved ? JSON.parse(saved) : [];
  });

  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', number: '', subject: '' });

  // Persistência
  useEffect(() => {
    localStorage.setItem('phone_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('my_contacts', JSON.stringify(myContacts));
  }, [myContacts]);

  const toggleAccordion = (title: string) => {
    if (openCategory === title) {
      setOpenCategory(null);
    } else {
      setOpenCategory(title);
    }
  };

  const toggleFavorite = (e: React.MouseEvent, number: string) => {
    e.stopPropagation();
    if (favorites.includes(number)) {
      setFavorites(prev => prev.filter(n => n !== number));
    } else {
      setFavorites(prev => [...prev, number]);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  // Funções de Gerenciamento de Contatos
  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name || !newContact.number) {
        alert("Nome e Número são obrigatórios.");
        return;
    }

    const contact: PhoneEntry = {
        id: Date.now(),
        name: newContact.name,
        number: newContact.number,
        subject: newContact.subject || 'Geral',
        isUserContact: true,
        isHighlight: false
    };

    setMyContacts(prev => [...prev, contact]);
    setNewContact({ name: '', number: '', subject: '' });
    setIsModalOpen(false);
    // Abre a categoria de contatos para ver o novo item
    setOpenCategory('MEUS CONTATOS'); 
  };

  const handleDeleteContact = (e: React.MouseEvent, id?: number) => {
      e.stopPropagation();
      if (!id) return;
      if (window.confirm("Deseja excluir este contato pessoal?")) {
          setMyContacts(prev => prev.filter(c => c.id !== id));
          // Remove dos favoritos também se estiver lá
          const contact = myContacts.find(c => c.id === id);
          if (contact && favorites.includes(contact.number)) {
              setFavorites(prev => prev.filter(n => n !== contact.number));
          }
      }
  };

  // Construção da lista completa
  const directoryWithExtras = useMemo(() => {
    // 1. MEUS CONTATOS (Ordenados por Assunto e Nome)
    const sortedMyContacts = [...myContacts].sort((a, b) => {
        const subjectCompare = (a.subject || '').localeCompare(b.subject || '');
        if (subjectCompare !== 0) return subjectCompare;
        return a.name.localeCompare(b.name);
    });

    const myContactsCategory: PhoneCategory = {
        title: 'MEUS CONTATOS',
        items: sortedMyContacts
    };

    // 2. FAVORITOS (Agrega de estáticos e meus contatos)
    const favoriteItems: PhoneEntry[] = [];
    
    // Favoritos dos estáticos
    PHONE_DIRECTORY.forEach(cat => {
      cat.items.forEach(item => {
        if (favorites.includes(item.number)) {
          favoriteItems.push({ ...item, isHighlight: true });
        }
      });
    });
    
    // Favoritos dos meus contatos
    myContacts.forEach(item => {
        if (favorites.includes(item.number)) {
            favoriteItems.push({ ...item, isHighlight: true });
        }
    });

    const favCategory: PhoneCategory = {
      title: 'FAVORITOS',
      items: favoriteItems
    };

    // Ordem Final: MEUS CONTATOS -> FAVORITOS -> DIRETÓRIO OFICIAL
    return [myContactsCategory, favCategory, ...PHONE_DIRECTORY];
  }, [favorites, myContacts]);

  // Filtragem
  const filteredDirectory = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const cleanTerm = term.replace(/\D/g, ''); 
    
    return directoryWithExtras.map(category => {
      // Regras de exibição de categorias vazias
      if (category.title === 'FAVORITOS' && category.items.length === 0) return null;
      if (category.title === 'MEUS CONTATOS' && category.items.length === 0 && !term) return category; // Mostra mesmo vazio se não tiver busca, para incentivar uso
      
      if (!term) return category;

      // Filtra itens
      const filteredItems = category.items.filter(item => {
        const matchesName = item.name.toLowerCase().includes(term);
        const matchesSubject = item.subject?.toLowerCase().includes(term);
        const matchesNumber = cleanTerm.length > 0 && item.number.replace(/\D/g, '').includes(cleanTerm);
        
        return matchesName || matchesNumber || matchesSubject;
      });

      if (filteredItems.length > 0 || category.title.toLowerCase().includes(term)) {
        return {
          ...category,
          items: filteredItems.length > 0 ? filteredItems : category.items
        };
      }
      return null;
    }).filter(Boolean) as PhoneCategory[];
  }, [directoryWithExtras, searchTerm]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Cabeçalho */}
      <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-1">Lista Telefônica</h1>
          <p className="text-blue-100 text-sm opacity-90">Contatos Operacionais e Administrativos</p>
        </div>
        <span className="material-icons-round absolute -right-4 -bottom-8 text-[120px] opacity-10">perm_phone_msg</span>
      </div>

      {/* Barra de Busca e Botão Novo Contato */}
      <div className="flex gap-3 sticky top-0 z-20 items-center">
        <div className="bg-white p-3 md:p-4 rounded-xl border border-slate-200 shadow-sm flex-1 relative transition-all">
            <span className="material-icons-round absolute left-6 md:left-7 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input 
                type="text"
                placeholder="Buscar por nome, assunto ou número..."
                className="w-full pl-10 pr-8 md:pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
                <button 
                onClick={clearSearch}
                className="absolute right-5 md:right-7 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 hover:bg-slate-100 p-1 rounded-full transition-colors flex items-center justify-center"
                title="Limpar busca"
                >
                <span className="material-icons-round text-lg">close</span>
                </button>
            )}
        </div>
        {/* PADRONIZAÇÃO DO BOTÃO + */}
        <button 
            onClick={() => setIsModalOpen(true)}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center shadow-sm transition-colors shrink-0"
            title="Novo Contato"
        >
            <span className="material-icons-round text-2xl">add</span>
        </button>
      </div>

      {/* Lista de Acordeões */}
      <div className="space-y-4">
        {filteredDirectory.length > 0 ? (
          filteredDirectory.map((category) => {
            const isFavoritesCat = category.title === 'FAVORITOS';
            const isMyContactsCat = category.title === 'MEUS CONTATOS';
            const isActive = openCategory === category.title;
            const isOpen = isActive || searchTerm.length > 0;
            
            // Definição de estilos baseados no tipo da categoria
            let icon = 'category';
            let iconBg = isOpen ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600';
            let borderColor = 'border-slate-200';
            let titleColor = 'text-slate-800';

            if (isFavoritesCat) {
                icon = 'star';
                iconBg = isOpen ? 'bg-yellow-500 text-white' : 'bg-yellow-100 text-yellow-600';
                borderColor = 'border-yellow-200 shadow-sm';
                titleColor = 'text-yellow-700';
            } else if (isMyContactsCat) {
                icon = 'perm_contact_calendar';
                iconBg = isOpen ? 'bg-green-600 text-white' : 'bg-green-100 text-green-600';
                borderColor = 'border-green-200 shadow-sm';
                titleColor = 'text-green-700';
            }

            return (
              <div key={category.title} className={`bg-white border rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md ${borderColor}`}>
                
                {/* Botão do Acordeão */}
                <button 
                  onClick={() => toggleAccordion(category.title)}
                  className={`w-full flex items-center justify-between p-5 text-left transition-colors ${isOpen ? 'bg-slate-50' : 'bg-white hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
                      <span className="material-icons-round">{icon}</span>
                    </div>
                    <div>
                        <span className={`font-bold text-sm md:text-base uppercase block ${titleColor}`}>{category.title}</span>
                        {isMyContactsCat && <span className="text-[10px] text-slate-400 font-normal uppercase">Organizado por assunto</span>}
                    </div>
                  </div>
                  <span className={`material-icons-round text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>

                {/* Conteúdo do Acordeão */}
                <div 
                  className={`transition-[max-height] duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[3000px]' : 'max-h-0'}`}
                >
                  <div className="p-2 border-t border-slate-100">
                    {category.items.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {category.items.map((phone, pIndex) => {
                            const isFav = favorites.includes(phone.number);
                            return (
                            <div 
                                key={`${category.title}-${pIndex}`} 
                                className={`flex items-center justify-between p-3 rounded-lg border group ${phone.isHighlight || isFavoritesCat ? 'bg-blue-50 border-blue-100' : 'bg-white border-slate-100 hover:border-slate-200'}`}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                {/* Botão Favoritar */}
                                <button 
                                    onClick={(e) => toggleFavorite(e, phone.number)}
                                    className="hover:bg-slate-200 p-1 rounded-full transition-colors focus:outline-none shrink-0"
                                    title={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                                >
                                    <span className={`material-icons-round text-lg ${isFav ? 'text-yellow-500' : 'text-slate-300 group-hover:text-slate-400'}`}>
                                    {isFav ? 'star' : 'star_border'}
                                    </span>
                                </button>

                                <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className={`text-xs font-bold uppercase truncate ${phone.isHighlight || isFavoritesCat ? 'text-blue-800' : 'text-slate-700'}`}>{phone.name}</p>
                                        {/* Badge de Assunto */}
                                        {phone.subject && (
                                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[9px] font-bold uppercase border border-slate-200 shrink-0">
                                                {phone.subject}
                                            </span>
                                        )}
                                    </div>
                                    {phone.isUserContact && <span className="text-[9px] text-green-600 font-medium">Pessoal</span>}
                                </div>
                                </div>
                                
                                <div className="flex items-center gap-3 shrink-0 ml-2">
                                    <a 
                                    href={`tel:${phone.number.replace(/\D/g,'')}`} 
                                    className={`text-sm font-mono font-bold flex items-center gap-1 hover:underline ${phone.isHighlight || isFavoritesCat ? 'text-blue-700' : 'text-slate-600'}`}
                                    >
                                    {phone.number}
                                    <span className="material-icons-round text-[10px] opacity-50">open_in_new</span>
                                    </a>
                                    
                                    {/* Botão de Excluir (Apenas para Meus Contatos) */}
                                    {phone.isUserContact && !isFavoritesCat && (
                                        <button 
                                            onClick={(e) => handleDeleteContact(e, phone.id)}
                                            className="text-slate-300 hover:text-red-500 p-1 rounded-full transition-colors"
                                            title="Excluir Contato"
                                        >
                                            <span className="material-icons-round text-base">delete</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                            );
                        })}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-400">
                             <span className="material-icons-round text-3xl mb-1 text-slate-300">person_add_disabled</span>
                             <p className="text-xs">Sua lista de contatos está vazia.</p>
                             <button onClick={() => setIsModalOpen(true)} className="mt-2 text-xs text-blue-600 hover:underline font-bold">Adicionar Agora</button>
                        </div>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-slate-400">
            <span className="material-icons-round text-4xl mb-2">phonelink_erase</span>
            <p>Nenhum contato encontrado.</p>
          </div>
        )}
      </div>

      {/* Modal de Cadastro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-[fadeIn_0.2s_ease-out]">
                <div className="bg-blue-600 p-5 flex justify-between items-center text-white">
                    <div className="flex items-center gap-3">
                        <span className="material-icons-round text-2xl">contact_phone</span>
                        <div>
                        <h3 className="font-bold text-lg">Novo Contato</h3>
                        <p className="text-[10px] opacity-80 uppercase tracking-wider">Adicionar à lista pessoal</p>
                        </div>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-1 rounded transition-colors"><span className="material-icons-round">close</span></button>
                </div>
                
                <form onSubmit={handleSaveContact} className="p-6 space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nome / Local</label>
                        <input 
                            value={newContact.name}
                            onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-600 outline-none"
                            placeholder="Ex: Borracharia do Zé, Delegacia..."
                            autoFocus
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Assunto (Para organização)</label>
                        <input 
                            value={newContact.subject}
                            onChange={(e) => setNewContact({...newContact, subject: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-blue-600 outline-none"
                            placeholder="Ex: Emergência, Alimentação, Mecânica..."
                            list="subject-suggestions"
                        />
                        <datalist id="subject-suggestions">
                            <option value="Emergência" />
                            <option value="Alimentação" />
                            <option value="Manutenção" />
                            <option value="Saúde" />
                            <option value="Outros" />
                        </datalist>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Número</label>
                        <input 
                            value={newContact.number}
                            onChange={(e) => setNewContact({...newContact, number: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-mono font-bold text-slate-800 focus:ring-2 focus:ring-blue-600 outline-none"
                            placeholder="(62) 9 0000-0000"
                            required
                        />
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 mt-2">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
                        <button type="submit" className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-200 transition-colors">Salvar Contato</button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default UserTelefones;