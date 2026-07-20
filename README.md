# Chapadonia — Servidor Tibia 15.25

Este é o site oficial do servidor de Tibia **Chapadonia** (protocolo 15.25), construído com um frontend moderno em React, TypeScript, Tailwind CSS e Framer Motion, e um backend Express integrado que se comunica com o banco de dados do servidor.

## Tecnologias Utilizadas

- **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS 4, Lucide React (Ícones), Motion/Framer Motion (Animações).
- **Backend**: Express, Node.js, Banco de dados SQLite/MySQL simulado.
- **Design**: Dark Glassmorphism, otimizado para imersão com o visual do Tibia moderno.

## Como Executar o Projeto

### Pré-requisitos

- Node.js (v18+)
- npm ou bun

### Desenvolvimento

Para rodar o servidor full-stack (Express + Vite de desenvolvimento) na porta `3000`:

```bash
npm run dev
```

Abra seu navegador em [http://localhost:3000](http://localhost:3000) para ver o site.

### Compilação e Produção

Para compilar o frontend e o servidor para produção:

```bash
npm run build
```

Isso gerará os arquivos estáticos na pasta `dist/` e o backend compilado em CJS em `dist/server.cjs`.

Para rodar o servidor em produção:

```bash
npm run start
```
