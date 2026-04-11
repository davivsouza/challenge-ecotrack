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

> Observação: o app está integrado ao backend **Java (Spring Boot)** do projeto, incluindo autenticação JWT, produtos, histórico e favoritos.

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
- Java
- Spring Boot
- Spring Security (JWT)
- Spring Data JPA
- Oracle Database
- JSON Web Token (JWT)

## Estrutura do projeto

```text
app/                rotas e telas do Expo Router
hooks/              hooks de consulta/mutação com TanStack Query
providers/          providers globais, incluindo autenticação
services/           camada de acesso à API
config/             configuração centralizada
lib/                utilitários globais (ex.: QueryClient)
```

## Requisitos atendidos da Sprint 3

- **Navegação real por rotas** com Expo Router.
- **6+ telas distintas**: login, escanear, catálogo, histórico, favoritos, perfil, sobre, detalhe do produto.
- **Integração HTTP real** com backend Java.
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

### 2) Subir backend Java

```bash
cd ../ecotrack-oracle-api-full
mvn spring-boot:run
```

O backend Java sobe por padrão em `http://localhost:8080`.

### 3) Configurar variáveis do app

Crie um arquivo `.env` na raiz com:

```env
EXPO_PUBLIC_API_URL=http://127.0.0.1:8080
EXPO_PUBLIC_APP_COMMIT=dev-build
```

> Em dispositivo físico, substitua `127.0.0.1` pelo IP da máquina na rede local.

### 4) Executar o app

```bash
npm start
```

Atalhos úteis:

```bash
npm run android
npm run ios
npm run web
```


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

