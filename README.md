# Sistema de Gerenciamento de Brigadistas — ABBA PAI CHURCH

Aplicativo mobile proposto para centralizar o gerenciamento de
brigadistas voluntários, disponibilidades, escalas e eventos da ABBA PAI
CHURCH.

## Sobre o projeto

Atualmente, a gestão das escalas depende de planilhas, exigindo esforço
para montar, atualizar e conferir as informações. Esse processo também
dificulta o acompanhamento da disponibilidade, das certificações e da
participação dos voluntários.

A proposta é desenvolver um aplicativo mobile que reúna essas
informações em um só lugar e ajude a tornar a organização das escalas
mais prática e eficiente.

## Objetivos

- Centralizar as informações dos brigadistas.
- Permitir que os brigadistas informem sua disponibilidade.
- Gerenciar certificações e status dos brigadistas.
- Cadastrar e gerenciar eventos.
- Apoiar a montagem das escalas e o acompanhamento da participação.
- Facilitar a organização e a distribuição das escalas.

## Perfis de usuário

### Brigadista

- Informar disponibilidade.
- Manter o perfil atualizado.
- Consultar escalas e detalhes dos eventos.
- Acompanhar notificações e informações relacionadas à participação.

### Administrador

- Cadastrar e gerenciar brigadistas.
- Gerenciar certificações.
- Criar e administrar eventos.
- Montar escalas e acompanhar a participação dos voluntários.

## Protótipo

O protótipo das interfaces foi desenvolvido no **Figma**, contemplando
fluxos para a área do brigadista e para a área administrativa.
https://www.figma.com/design/hShkBKAdYY2uSikXEQWHcn/Brigada-App-%25E2%2580%2594-Prot%25C3%25B3tipo-Autom%25C3%25A1tico?node-id=5-2&p=f&t=b0otqXUNH5qSYvmm-0

## Como rodar

```bash
npm install
npx expo start
```

Depois é só ler o QR code com o app **Expo Go** no celular, ou apertar `a`
no terminal para abrir no emulador do Android Studio.

## Estrutura

- `src/view/` — telas, organizadas por papel de usuário:
  - `App.js` — carrega as fontes, a splash screen e decide qual área mostrar
  - `login/` — tela de login (hoje sem autenticação real: "Entrar" leva à área do brigadista, "Entrar com biometria" é um atalho provisório para a área do administrador)
  - `brigadista/` — área do brigadista (`BrigadistaNavigator.js`, abas Início/Agenda/Escalas/Perfil)
    - `agenda/` — fluxo de resposta a eventos (ver evento → confirmar presença → pedido enviado), com seu próprio navigator interno
  - `admin/` — área do administrador (ainda placeholder)
- `src/components/` — componentes reutilizáveis (botão, campo, card, selo de status, card de evento, calendário do mês, barra de abas, etc.)
- `src/theme/` — cores, fontes, espaçamentos e raios tirados do Figma
- `src/utils/` — funções auxiliares (ex.: formatação de datas em português, grade do calendário)
- `docs/meu-app-firebase/` — cópia arquivada de um protótipo anterior (TypeScript + Firebase + Expo Router), guardada só como referência; não faz parte do app

## Tecnologias

Já em uso:

- **JavaScript**, **React Native** e **Expo**
- **React Navigation** (abas + stack) para a navegação
- **@expo-google-fonts/inter** para a fonte do app
- Design system próprio (`src/components` + `src/theme`), sem biblioteca de UI externa
- **Node.js / npm / npx**, **Git e GitHub**, **Expo Go** para desenvolvimento e testes

Planejadas, ainda não integradas:

- **Expo SQLite** e/ou **AsyncStorage** — persistência local
- Autenticação real (hoje o login é só visual, sem backend)

> O app ainda roda inteiramente com dados de exemplo (mock) nas telas — nada é
> persistido ou enviado para um servidor.

## Equipe

- Calebe Arlan Souza da Silva
- Gustavo Gonçalves dos Santos
- Fernando de Souza Tomasi
- Isadora Barriquel Fernandes

## Cliente

**ABBA PAI CHURCH**

