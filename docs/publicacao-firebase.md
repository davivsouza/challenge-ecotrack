# Publicacao no Firebase App Distribution

Este projeto esta configurado para gerar um APK Android pelo EAS Build e publicar no Firebase App Distribution.

## Pre-requisitos

- EAS CLI instalado e autenticado.
- Firebase CLI instalado e autenticado.
- App Android criado no Firebase App Distribution.

## Variaveis obrigatorias

Crie um arquivo `.env.prod` local ou exporte no terminal:

```bash
export EXPO_PUBLIC_API_URL="https://sua-api"
export FIREBASE_ANDROID_APP_ID="1:216419585132:android:1b05db9318ffd574d75c49"
export FIREBASE_TESTERS="professor@instituicao.edu.br"
```

O `FIREBASE_ANDROID_APP_ID` e o `mobilesdk_app_id` do `google-services.json`.

O `EXPO_PUBLIC_APP_COMMIT` deve ser preenchido no build publicado para a tela Sobre o app mostrar o commit de referencia.

## Build Android para avaliacao

```bash
pnpm build:android:firebase
```

Baixe o APK gerado pelo EAS para `dist/challenge-ecotrack.apk`.

Se quiser gerar o arquivo direto localmente no caminho esperado pelo Firebase:

```bash
pnpm build:android:firebase:local
```

Antes de rodar, faca login nas CLIs:

```bash
eas login
firebase login
```

## Publicar no Firebase App Distribution

```bash
pnpm firebase:distribute:android
```

Antes da avaliacao, confirme no console do Firebase que o email institucional do professor esta como tester e que a versao publicada corresponde ao commit mostrado em Perfil > Sobre o app.
