# EcoTrack 🌱

Aplicativo mobile em React Native/Expo para ajudar consumidores a comparar produtos por saúde e sustentabilidade, com autenticação real, navegação por rotas, integração HTTP ponta a ponta e persistência de dados do usuário.

## Problema escolhido

Consumidores geralmente não conseguem avaliar rapidamente se um produto industrializado é uma boa escolha do ponto de vista nutricional e ambiental. As informações ficam espalhadas em rótulos, bases externas e critérios difíceis de comparar no momento da compra.

## Solução proposta

O **EcoTrack** centraliza esse fluxo em um app mobile com:

- login e sessão persistida;
- busca de produtos por código de barras;
- catálogo pesquisável;
- detalhes completos de nutrição e impacto ambiental;
- histórico de consultas com CRUD;
- favoritos com CRUD;
- notificação local ao concluir um escaneamento;
- tela “Sobre o app” com versão e hash de commit.

> Observação: para esta entrega, a integração principal foi consolidada em um backend próprio em **Node.js + Express + TypeScript**, mantendo também o uso de fonte externa de produtos via **Open Food Facts** quando necessário.

## Tecnologias utilizadas

### Mobile
- Expo
- React Native
- Expo Router
- TanStack Query
- Axios
- AsyncStorage
- Expo Notifications
- TypeScript

### Backend
- Node.js
- Express
- TypeScript
- Zod
- JSON Web Token (JWT)

## Estrutura do projeto

```text
app/                rotas e telas do Expo Router
hooks/              hooks de consulta/mutação com TanStack Query
providers/          providers globais, incluindo autenticação
services/           camada de acesso à API
backend/            API Node/Express/TypeScript usada pelo app
config/             configuração centralizada
lib/                utilitários globais (ex.: QueryClient)
```

## Requisitos atendidos da Sprint 3

- **Navegação real por rotas** com Expo Router.
- **6+ telas distintas**: login, escanear, catálogo, histórico, favoritos, perfil, sobre, detalhe do produto.
- **Integração HTTP real** com backend próprio.
- **TanStack Query** para leitura e mutação.
- **Autenticação real** com login, cadastro, rotas protegidas e persistência de sessão.
- **CRUD completo em duas funcionalidades**:
  - histórico: create, read, update, delete;
  - favoritos: create, read, update, delete.
- **Estados de carregamento e sincronização automática** após mutações.
- **Tema automático** via `userInterfaceStyle: automatic` no Expo e uso do tema do React Navigation.

## Requisitos atendidos da Sprint 4

- Continuidade do fluxo principal do app.
- Tela **Sobre o app** com identificação da versão/commit.
- **Notificação local** ao salvar um produto escaneado no histórico.
- Arquitetura mais organizada, separando UI, hooks, providers e serviços.

## Como executar

### 1) Instalar dependências do app

```bash
npm install
```

### 2) Instalar dependências do backend

```bash
npm run backend:install
```

### 3) Subir o backend

```bash
npm run backend:dev
```

O backend sobe por padrão em `http://localhost:3333`.

### 4) Configurar variáveis do app

Crie um arquivo `.env` na raiz com:

```env
EXPO_PUBLIC_API_URL=http://127.0.0.1:3333
EXPO_PUBLIC_APP_COMMIT=dev-build
```

> Em dispositivo físico, substitua `127.0.0.1` pelo IP da máquina na rede local.

### 5) Executar o app

```bash
npm start
```

Atalhos úteis:

```bash
npm run android
npm run ios
npm run web
```

## Credenciais de teste

```text
Email: demo@ecotrack.com
Senha: 123456
```

## Fluxo recomendado para demonstração em vídeo

1. Fazer login com a conta demo.
2. Ir para **Escanear** e consultar um código de barras.
3. Mostrar a notificação local após salvar o item.
4. Abrir o detalhe do produto.
5. Adicionar o produto aos favoritos.
6. Ir para **Histórico** e editar/remover uma anotação.
7. Ir para **Favoritos** e editar/remover uma observação.
8. Abrir **Perfil > Sobre o app** e mostrar a versão/hash.

## Endpoints principais do backend

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `GET /products`
- `GET /products/:id`
- `GET /products/barcode/:barcode`
- `GET /history`
- `POST /history`
- `PATCH /history/:id`
- `DELETE /history/:id`
- `GET /favorites`
- `POST /favorites`
- `PATCH /favorites/:id`
- `DELETE /favorites/:id`

## Observação sobre publicação

Para publicação final, configure `EXPO_PUBLIC_APP_COMMIT` com o hash real do commit enviado ao professor e use esse mesmo commit como referência da build distribuída.
