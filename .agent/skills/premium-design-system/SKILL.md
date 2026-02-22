# Sistema de Design Premium (RAI Envios)

Este skill documenta o padrão visual "Premium" para as interfaces administrativas e de usuário do sistema RAI Envios. O objetivo é manter a consistência estética através do uso de cards brancos, tipografia refinada e uma paleta de cores baseada em `slate`.

## 🎨 Paleta de Cores e Fundo
- **Fundo da Página**: `bg-slate-50`
- **Contêineres/Cards**: `bg-white`
- **Bordas**: `border-slate-200` (sutil) ou `border-slate-100` (internas)
- **Sombras**: `shadow-sm` ou `shadow-lg` (para elementos flutuantes)

## 📐 Estrutura de Layout
Sempre use o contêiner `max-w-7xl` para centralizar o conteúdo e garantir que a página não fique excessivamente larga em monitores grandes.

```tsx
<div className="min-h-screen bg-slate-50 font-sans py-8 px-4">
  <div className="max-w-7xl mx-auto space-y-6">
    {/* Conteúdo aqui */}
  </div>
</div>
```

## 🏗️ Componentes Padrão

### 1. Header Premium
O cabeçalho deve ser um card branco com título e descrição.

```tsx
<div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200 gap-4">
  <div>
    <h1 className="text-2xl font-bold text-slate-800">Nome da Página</h1>
    <p className="text-slate-500 text-sm mt-1">Breve descrição da funcionalidade.</p>
  </div>
  {/* Ações do Header (opcional) */}
</div>
```

### 2. Seletores Estilo "Pills" (Tabs)
Para alternar estados ou seções, use o wrapper cinza com botões brancos para o estado ativo.

```tsx
<div className="flex items-center bg-slate-100 p-1.5 rounded-xl w-fit">
  <button className={`px-6 py-2 rounded-lg text-xs font-black uppercase transition-all ${
    active ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:text-slate-800'
  }`}>
    Opção 1
  </button>
</div>
```

### 3. Cards de Conteúdo
Cards internos devem seguir a mesma lógica de bordas e arredondamento profundo (`rounded-2xl`).

```tsx
<div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
  <h2 className="text-lg font-bold text-slate-800 uppercase flex items-center gap-2 mb-4">
    <span className="material-icons-round text-blue-600">icon_name</span>
    Título do Card
  </h2>
  {/* Conteúdo */}
</div>
```

### 4. Inputs Premium
Inputs e Selects devem ter um fundo levemente cinza (`bg-slate-50`) e foco com brilho suave.

```tsx
<div className="flex flex-col gap-1.5">
  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Label</span>
  <input 
    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium bg-slate-50 text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-50 outline-none transition-all"
  />
</div>
```

## ✨ Animações
Sempre adicione uma animação de entrada suave para uma sensação de modernidade:
`className="animate-in fade-in slide-in-from-bottom-4 duration-500"`

## 📌 Ícones
Use sempre a família `material-icons-round` para um visual mais arredondado e amigável.
