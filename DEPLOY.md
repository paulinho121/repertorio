# Guia de Deploy - Repertório Fácil

Este guia explica como fazer o deploy do aplicativo **Repertório Fácil** na Vercel e configurar o Firebase.

## 🚀 Deploy na Vercel

### 1. Preparar o Repositório

Primeiro, envie o código para o GitHub:

```bash
# Se ainda não criou o repositório no GitHub, crie um novo repositório
# Depois execute os comandos abaixo:

git remote add origin https://github.com/SEU-USUARIO/repertorio-facil.git
git branch -M main
git push -u origin main
```

### 2. Deploy na Vercel

1. **Acesse [vercel.com](https://vercel.com)** e faça login com sua conta GitHub
2. **Clique em "New Project"**
3. **Importe o repositório** `repertorio-facil` do GitHub
4. **Configure o projeto:**
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (padrão)
   - **Build Command:** `pnpm run build` (padrão)
   - **Output Directory:** `dist` (padrão)
5. **Clique em "Deploy"**

A Vercel irá automaticamente:
- Instalar as dependências
- Executar o build
- Fazer o deploy
- Fornecer uma URL pública

## 🔥 Configuração do Firebase

### 1. Criar Projeto Firebase

1. **Acesse [console.firebase.google.com](https://console.firebase.google.com)**
2. **Clique em "Criar um projeto"**
3. **Nome do projeto:** `repertorio-facil` (ou outro nome de sua escolha)
4. **Desabilite o Google Analytics** (opcional para este projeto)
5. **Clique em "Criar projeto"**

### 2. Configurar Authentication

1. **No console do Firebase, vá em "Authentication"**
2. **Clique em "Começar"**
3. **Na aba "Sign-in method":**
   - Clique em "Email/senha"
   - **Ative** "Email/senha"
   - **Salve**

### 3. Configurar Firestore Database

1. **No console do Firebase, vá em "Firestore Database"**
2. **Clique em "Criar banco de dados"**
3. **Escolha "Iniciar no modo de teste"** (para desenvolvimento)
4. **Selecione uma localização** (ex: `southamerica-east1` para Brasil)
5. **Clique em "Concluído"**

### 4. Obter Configurações do Firebase

1. **No console do Firebase, vá em "Configurações do projeto"** (ícone de engrenagem)
2. **Role para baixo até "Seus aplicativos"**
3. **Clique no ícone da web `</>`**
4. **Nome do app:** `Repertório Fácil`
5. **Marque** "Também configure o Firebase Hosting"
6. **Clique em "Registrar app"**
7. **Copie as configurações** que aparecem

### 5. Atualizar Configurações no Código

1. **Edite o arquivo `src/lib/firebase.js`**
2. **Substitua as configurações demo** pelas configurações reais do seu projeto:

```javascript
const firebaseConfig = {
  apiKey: "sua-api-key-aqui",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### 6. Configurar Variáveis de Ambiente (Opcional)

Para maior segurança, você pode usar variáveis de ambiente:

1. **Crie um arquivo `.env.local`** na raiz do projeto:
```env
VITE_FIREBASE_API_KEY=sua-api-key-aqui
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

2. **Atualize `src/lib/firebase.js`** para usar as variáveis:
```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

3. **Configure as variáveis na Vercel:**
   - Vá no dashboard da Vercel
   - Clique no seu projeto
   - Vá em "Settings" > "Environment Variables"
   - Adicione cada variável (sem o prefixo `VITE_`)

## 🔒 Configurar Regras de Segurança do Firestore

1. **No console do Firebase, vá em "Firestore Database"**
2. **Clique na aba "Regras"**
3. **Substitua as regras** pelo seguinte código:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários podem ler e escrever apenas seus próprios dados
    match /usuarios/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Repertórios: usuários podem ler e escrever apenas seus próprios repertórios
    match /repertorios/{repertorioId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.ownerId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.ownerId;
      
      // Músicas dentro de repertórios
      match /musicas/{musicaId} {
        allow read, write: if request.auth != null && request.auth.uid == get(/databases/$(database)/documents/repertorios/$(repertorioId)).data.ownerId;
      }
    }
  }
}
```

4. **Clique em "Publicar"**

## ✅ Verificação Final

Após o deploy:

1. **Acesse a URL fornecida pela Vercel**
2. **Teste o registro de um novo usuário**
3. **Teste a criação de um repertório**
4. **Teste a adição de músicas**
5. **Teste o modo ao vivo**

## 🔄 Atualizações Futuras

Para atualizações futuras:

1. **Faça as alterações no código**
2. **Commit e push para o GitHub:**
```bash
git add .
git commit -m "Descrição da atualização"
git push
```
3. **A Vercel fará o deploy automaticamente**

## 🆘 Solução de Problemas

### Erro de CORS
Se encontrar erros de CORS, verifique se o domínio da Vercel está autorizado no Firebase:
- Console Firebase > Authentication > Settings > Authorized domains

### Erro de Firestore
Se as operações do Firestore falharem:
- Verifique se as regras de segurança estão corretas
- Verifique se o usuário está autenticado
- Verifique se o `projectId` está correto

### Build Falha na Vercel
Se o build falhar:
- Verifique se todas as dependências estão no `package.json`
- Verifique se não há erros de sintaxe no código
- Verifique os logs de build na Vercel

---

**🎵 Seu aplicativo Repertório Fácil está pronto para uso!**
