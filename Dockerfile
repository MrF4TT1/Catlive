# Immagine alternativa (per Fly.io, Railway, o qualsiasi host con Docker).
FROM node:18-alpine

WORKDIR /app

# Dipendenze
COPY package*.json ./
RUN npm install

# Codice + build della SPA
COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV DEMO_MODE=true
# IMPORTANTE: in produzione JWT_SECRET è OBBLIGATORIO (l'app si rifiuta di partire senza).
# Passalo a runtime, es:  docker run -e JWT_SECRET="<stringa-lunga-e-casuale>" ...
# (su Fly.io/Railway impostalo come secret/variabile d'ambiente del servizio).
# La porta effettiva viene letta da process.env.PORT (impostata dall'host).
EXPOSE 4000

CMD ["npm", "start"]
