# Intensivo IA

Base de wiki/documentação em `Next.js + TypeScript + App Router + Tailwind CSS`, pronta para versionar no GitHub e publicar na Vercel.

O projeto foi estruturado para começar simples, com conteúdo estático em Markdown, mas já preparado para evoluir depois para:

- busca interna
- categorias mais ricas
- índice lateral por página
- progresso de leitura
- favoritos e notas
- persistência em banco
- autenticação, se necessário

## Arquitetura

### Escolha de conteúdo

O conteúdo da wiki fica em `content/wiki/*.md`.

Essa escolha foi feita porque Markdown:

- é fácil de editar
- funciona bem com Git
- mantém conteúdo desacoplado da UI
- facilita futura indexação para busca
- permite migrar depois para MDX ou banco sem refatorar a aplicação inteira

### Estrutura principal

```text
src/
  app/
    page.tsx
    wiki/
      layout.tsx
      page.tsx
      [slug]/page.tsx
  components/
  lib/
content/
  wiki/
scripts/
  migrate_html_wiki.py
wiki/
  ... legado HTML original
```

### Rotas

- `/` home da aplicação
- `/wiki` índice da documentação
- `/wiki/[slug]` página individual da wiki

## Como rodar localmente

### 1. Instalar dependências

```bash
npm install
```

### 2. Rodar em desenvolvimento

```bash
npm run dev
```

Abra `http://localhost:3000`.

### 3. Validar antes de publicar

```bash
npm run lint
npm run typecheck
npm run build
```

## Como subir no GitHub

Se o repositório ainda não estiver conectado ao seu remoto:

```bash
git init
git add .
git commit -m "Create Next.js wiki base"
git branch -M main
git remote add origin <URL_DO_REPOSITORIO>
git push -u origin main
```

Se o remoto já existir, basta:

```bash
git add .
git commit -m "Create Next.js wiki base"
git push
```

## Como publicar na Vercel

### Opção 1. Pelo painel da Vercel

1. Suba o projeto no GitHub.
2. Entre em [vercel.com](https://vercel.com/).
3. Importe o repositório.
4. A Vercel detectará `Next.js` automaticamente.
5. Clique em deploy.

### Opção 2. Pela CLI da Vercel

```bash
npm i -g vercel
vercel
```

Para produção:

```bash
vercel --prod
```

## Como adicionar novas páginas da wiki

Crie um novo arquivo em `content/wiki/` com frontmatter e corpo em Markdown.

Exemplo:

```md
---
title: "Módulo 13.1"
description: "Novo tema da wiki"
order: 42
category: "Módulo 13"
lead: "Resumo opcional da página"
---

## Objetivo

Texto da página.

## Tópicos

- item 1
- item 2
```

Regras práticas:

- `slug` da rota vem do nome do arquivo
- `order` controla a ordem geral e a navegação anterior/próxima
- `category` agrupa a navegação lateral
- `lead` é opcional

Exemplo de rota:

- `content/wiki/modulo-13-1.md` vira `/wiki/modulo-13-1`

## Migração do HTML legado

O HTML antigo foi preservado em `wiki/`.

O script `scripts/migrate_html_wiki.py` converte `wiki/pages/*.html` para `content/wiki/*.md`.

Se você atualizar o material legado e quiser regenerar os Markdown:

```bash
npm run content:sync
```

## Como evoluir depois

### Busca interna

Hoje a base já centraliza leitura de conteúdo em `src/lib/wiki.ts`. Isso facilita:

- gerar índice client-side
- criar endpoint de busca
- integrar Algolia, Fuse.js, FlexSearch ou busca em banco

### Banco de dados

Quando quiser sair de arquivos Markdown para banco:

1. mantenha a UI
2. troque a origem dos dados hoje concentrada em `src/lib/wiki.ts`
3. preserve o mesmo formato de retorno para não refatorar componentes

### Progresso, favoritos e notas

A evolução natural é:

1. começar com `localStorage`
2. mover para API/DB depois
3. manter IDs de página via `slug`

## Stack

- Next.js
- React
- TypeScript
- App Router
- Tailwind CSS

## Observações

- O projeto está pronto para deploy na Vercel sem dependências pesadas.
- O conteúdo foi desacoplado da interface.
- A navegação é automática com base nos arquivos da pasta `content/wiki`.
