# GuiMaps Admin

Painel de administração para o sistema GuiMaps.

## Tecnologias

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- Axios
- Zustand

## Instalação

```bash
npm install
```

## Configuração

Copie o arquivo `.env.example` para `.env` e configure as variáveis de ambiente:

```bash
cp env.example .env
```

Edite o arquivo `.env` e configure:

```
VITE_API_URL=http://localhost:8000
```

## Desenvolvimento

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Autenticação

O sistema requer autenticação com email e senha. Apenas usuários com a role `admin` podem acessar o painel.

## Estrutura do Projeto

```
src/
├── app/              # Configuração da aplicação
│   ├── layout/      # Layouts
│   ├── providers.tsx
│   └── router.tsx
├── features/         # Features da aplicação
│   ├── auth/        # Autenticação
│   └── dashboard/   # Dashboard
└── shared/          # Componentes e utilitários compartilhados
    ├── components/  # Componentes reutilizáveis
    ├── contexts/    # Contextos React
    ├── lib/         # Bibliotecas e utilitários
    └── config/      # Configurações
```

