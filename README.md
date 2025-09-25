# Repertório Fácil

Um aplicativo web moderno para músicos, bandas e artistas organizarem, visualizarem e compartilharem seus repertórios de forma intuitiva e eficiente.

## 🎵 Visão Geral

O **Repertório Fácil** foi criado para resolver uma dor comum entre músicos: a dificuldade de organizar e acessar repertórios durante ensaios e apresentações ao vivo. Com uma interface limpa e funcionalidades pensadas especificamente para o contexto musical, o aplicativo oferece:

- **Organização Inteligente**: Crie e gerencie múltiplos repertórios
- **Modo Ao Vivo**: Interface otimizada para uso durante apresentações
- **Autoscroll**: Rolagem automática com velocidade ajustável
- **Sincronização em Nuvem**: Acesse seus repertórios de qualquer dispositivo
- **Interface Responsiva**: Funciona perfeitamente em desktop, tablet e mobile

## 🚀 Funcionalidades

### 📋 Gerenciamento de Repertórios
- Criar, editar e excluir repertórios
- Adicionar descrições e organizações personalizadas
- Visualização em cards com informações resumidas

### 🎼 Gerenciamento de Músicas
- Adicionar músicas com título, artista e tonalidade
- Campo dedicado para acordes e letras
- Observações especiais para cada música
- Reordenação por drag-and-drop (planejado)

### 🎤 Modo Ao Vivo
- Interface minimalista e de alta legibilidade
- Navegação simples entre músicas (anterior/próxima)
- Autoscroll com controle de velocidade
- Atalhos de teclado para operação rápida
- Informações da música sempre visíveis

### 🔐 Autenticação e Segurança
- Sistema de login/registro seguro
- Dados sincronizados na nuvem
- Cada usuário acessa apenas seus próprios repertórios

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18 com Vite
- **UI Components**: shadcn/ui + Tailwind CSS
- **Ícones**: Lucide React
- **Backend**: Firebase (Firestore + Auth)
- **Hospedagem**: Vercel
- **Linguagem**: JavaScript (JSX)

## 📦 Instalação e Execução

### Pré-requisitos
- Node.js 18+ 
- pnpm (recomendado) ou npm

### Passos para rodar localmente

1. **Clone o repositório:**
   ```bash
   git clone <URL-DO-REPOSITORIO>
   cd repertorio-facil
   ```

2. **Instale as dependências:**
   ```bash
   pnpm install
   ```

3. **Configure o Firebase:**
   - Crie um projeto no [Firebase Console](https://console.firebase.google.com)
   - Ative Authentication (Email/Password)
   - Ative Firestore Database
   - Copie as configurações e atualize `src/lib/firebase.js`

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   pnpm run dev
   ```

5. **Acesse o aplicativo:**
   Abra [http://localhost:5173](http://localhost:5173) no seu navegador

## 🏗️ Estrutura do Projeto

```
src/
├── components/           # Componentes React
│   ├── ui/              # Componentes de UI (shadcn/ui)
│   ├── Dashboard.jsx    # Tela principal com lista de repertórios
│   ├── LoginScreen.jsx  # Tela de login/registro
│   ├── RepertorioManager.jsx  # Gerenciamento de músicas
│   └── LiveMode.jsx     # Modo apresentação ao vivo
├── hooks/               # Hooks customizados
│   └── useAuth.js       # Hook de autenticação
├── lib/                 # Utilitários e configurações
│   └── firebase.js      # Configuração do Firebase
├── App.jsx              # Componente principal
└── main.jsx             # Ponto de entrada
```

## 🎯 Roadmap

### Versão Atual (MVP)
- ✅ Autenticação de usuários
- ✅ CRUD de repertórios
- ✅ CRUD de músicas
- ✅ Modo ao vivo com autoscroll
- ✅ Interface responsiva

### Próximas Versões
- 🔄 Drag-and-drop para reordenar músicas
- 🎵 Biblioteca central de músicas
- 🎼 Transposição automática de acordes
- 📱 Aplicativo mobile nativo
- 👥 Colaboração em tempo real (Modo Banda)
- 📄 Importação/exportação de PDF e TXT
- 🎸 Diagramas de acordes visuais

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🎵 Para Músicos

Este aplicativo foi criado por músicos, para músicos. Se você tem sugestões, encontrou bugs ou quer compartilhar como está usando o Repertório Fácil, ficaremos felizes em ouvir!

---

**Desenvolvido com ❤️ para a comunidade musical**
