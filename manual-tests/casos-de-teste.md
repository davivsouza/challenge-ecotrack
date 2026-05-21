# Casos de Teste Manuais - EcoTrack

## Objetivo

Validar manualmente os principais fluxos do MVP EcoTrack: login, cadastro, busca de produto e navegação pelo histórico/catálogo.

# Observação
Teste foi realizado na Web para facilitar a gravação,mas o aplicativo é para ser executado em dispositivos móveis.

## Casos de teste

| ID | Funcionalidade | Dados de entrada | Resultado esperado | Status |
|---|---|---|---|---|
| CT01 | Login | Email: `demo@ecotrack.com`<br>Senha: `123456` | Login realizado com sucesso e usuário redirecionado para a tela principal com abas. | Sucesso |
| CT02 | Login | Email vazio ou senha vazia | Alerta `Campos obrigatórios` exibido, informando que todos os campos devem ser preenchidos. | Sucesso |
| CT03 | Cadastro | Nome: `Usuario Teste`<br>Email: `novo@teste.com`<br>Senha: `123456` | Conta criada com sucesso e usuário redirecionado para a tela principal com abas. | Sucesso |
| CT04 | Busca manual de produto | Código de barras: `7891000100103` | Produto localizado, histórico registrado quando possível e navegação para a tela de detalhes do produto. | Sucesso |
