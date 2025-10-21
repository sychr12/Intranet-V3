# Etapa 1: construir a aplicação
FROM node:20 AS builder

# Define o diretório de trabalho
WORKDIR /app

# Copia apenas os arquivos de dependência primeiro (para aproveitar cache do Docker)
COPY package.json package-lock.json* ./

# Instala as dependências
RUN npm install

# Copia o restante do código da aplicação
COPY . .

# Compila o projeto Next.js
RUN npm run build

# Etapa 2: rodar a aplicação
FROM node:20-alpine

WORKDIR /app

# Copia apenas o que é necessário da etapa anterior
COPY --from=builder /app ./

ENV NODE_ENV=production
ENV PORT=3000

# Expõe a porta 3000 para o container
EXPOSE 3000

# Comando padrão de inicialização
CMD ["npm", "start"]
