# EcoTrack - Aplicativo de Consumo Sustentável 🌱

O **EcoTrack** é uma plataforma mobile que empodera consumidores a fazer escolhas de compra mais saudáveis e sustentáveis, centralizando informações de impacto ambiental e nutricional dos produtos em um único aplicativo.

## 📱 Funcionalidades

- **Escaneamento de Produtos**: Escaneie códigos de barras para obter informações detalhadas
- **Análise Nutricional**: Visualize dados nutricionais completos dos produtos
- **Impacto Ambiental**: Consulte pegada de carbono, uso de água e tipo de embalagem
- **Scores de Sustentabilidade**: Avaliações de saúde e sustentabilidade (0-100)
- **Histórico de Consumo**: Armazene e visualize produtos escaneados anteriormente
- **Alternativas Sustentáveis**: Sugestões de produtos mais ecológicos
- **Exploração de Produtos**: Navegue por produtos disponíveis na base de dados

## 🛠️ Tecnologias Utilizadas

- **React Native** com **Expo Router** para navegação
- **TypeScript** para tipagem estática
- **AsyncStorage** para persistência de dados local
- **Expo Camera** para funcionalidade de escaneamento
- **React Navigation** para navegação entre telas

## 📦 Instalação e Configuração

### Pré-requisitos

- Node.js (versão 18 ou superior)
- pnpm (gerenciador de pacotes)
- Expo CLI
- Dispositivo móvel com Expo Go ou emulador

### Passos para Instalação

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd challenge-ecotrack
   ```

2. **Instale as dependências**
   ```bash
   pnpm install
   ```

3. **Inicie o servidor de desenvolvimento**
   ```bash
   pnpm start
   ```

4. **Execute no dispositivo**
   - **Android**: `pnpm android`
   - **iOS**: `pnpm ios`
   - **Web**: `pnpm web`

## 🚀 Como Usar

### Credenciais de Teste
- **Email**: `usuario@ecotrack.com`
- **Senha**: `123456`

### Códigos de Barras de Teste
- `7891234567890` - Açaí Bowl Orgânico
- `7891234567891` - Smoothie de Frutas Vermelhas
- `7891234567892` - Granola Artesanal
- `7891234567893` - Refrigerante Zero Açúcar
- `7891234567894` - Água de Coco Natural
- `7891234567895` - Suco de Laranja Integral

### Fluxo de Uso

1. **Login**: Faça login com as credenciais de teste
2. **Escanear**: Use a tela principal para escanear produtos ou digite códigos manualmente
3. **Detalhes**: Visualize informações completas do produto
4. **Histórico**: Acesse produtos escaneados anteriormente
5. **Explorar**: Navegue por produtos disponíveis na base de dados

## 📁 Estrutura do Projeto

```
challenge-ecotrack/
├── app/                    # Telas do aplicativo (Expo Router)
│   ├── (tabs)/            # Navegação por abas
│   │   ├── index.tsx      # Tela de escaneamento
│   │   ├── history.tsx    # Tela de histórico
│   │   └── explore.tsx    # Tela de exploração
│   ├── login.tsx          # Tela de login
│   ├── product/           # Detalhes do produto
│   │   └── [id].tsx       # Tela dinâmica de produto
│   └── _layout.tsx        # Layout principal
├── components/            # Componentes reutilizáveis
├── data/                  # Dados mockados
│   └── mockProducts.ts    # Produtos de exemplo
├── types/                 # Definições de tipos TypeScript
│   └── index.ts           # Interfaces e tipos
├── assets/                # Recursos estáticos
└── constants/             # Constantes do aplicativo
```

## 🎨 Design e UX

- **Interface Limpa**: Design moderno e intuitivo
- **Cores Sustentáveis**: Paleta de cores inspirada na natureza
- **Feedback Visual**: Indicadores de carregamento e estados
- **Navegação Intuitiva**: Fluxo de usuário otimizado
- **Responsividade**: Adaptado para diferentes tamanhos de tela

## 📊 Dados dos Produtos

Cada produto contém:

### Informações Nutricionais
- Calorias, proteínas, carboidratos, gorduras
- Açúcar, sódio, fibras

### Impacto Ambiental
- Pegada de carbono (kg CO₂)
- Uso de água (litros)
- Tipo de embalagem
- Score de sustentabilidade

### Avaliações
- Score de saúde (0-100)
- Score de sustentabilidade (0-100)
- Alternativas sugeridas

## 🔧 Scripts Disponíveis

```bash
# Iniciar servidor de desenvolvimento
pnpm start

# Executar no Android
pnpm android

# Executar no iOS
pnpm ios

# Executar na web
pnpm web

# Verificar linting
pnpm lint

# Resetar projeto (cuidado!)
pnpm reset-project
```

## 📱 Compatibilidade

- **Android**: 6.0+ (API level 23+)
- **iOS**: 11.0+
- **Web**: Navegadores modernos

## 🚧 Funcionalidades Futuras

- [ ] Integração com API real de produtos
- [ ] Escaneamento real de códigos de barras
- [ ] Sistema de usuários e perfis
- [ ] Relatórios de consumo personalizados
- [ ] Gamificação e conquistas
- [ ] Compartilhamento social
- [ ] Notificações push
- [ ] Modo offline

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Equipe

Desenvolvido como parte do desafio de desenvolvimento mobile com foco em sustentabilidade e consumo consciente.

---

**EcoTrack** - Fazendo escolhas sustentáveis mais fáceis! 🌍✨