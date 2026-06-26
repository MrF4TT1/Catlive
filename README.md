# 🐾 CatAlive

Il tuo **cinema personale**: una piattaforma web privata per archiviare, organizzare e
fare streaming della tua libreria di film e serie TV. Stile moderno (tipo Netflix),
ma completamente self-hosted e dedicato ai *tuoi* contenuti.

## Funzionalità

- 🔐 **Autenticazione sicura** — login con password (hash bcrypt) e sessione via cookie httpOnly + JWT.
- 👤 **Singolo amministratore** — niente registrazione pubblica: accedi solo tu (`ADMIN_USERNAME`/`ADMIN_PASSWORD`).
- 📁 **Librerie** — da cartelle locali (self-host) **oppure** caricando i file dall'area admin (cloud).
- ⬆️ **Upload** dei video direttamente dall'interfaccia (con barra di avanzamento).
- 🎬 **Catalogazione automatica** — riconosce film e serie TV (stagioni/episodi) dai nomi dei file.
- 🔎 **Ricerca** · ▶️ **Streaming** con *HTTP Range* · ⏯️ **Continua a guardare**.

## Stack & modalità

- **Backend**: Node.js + Express (ESM). **Frontend**: React + Vite + Tailwind.
- **Database** (adattivo):
  - **Postgres/Neon** se è impostata `DATABASE_URL` (persistente, consigliato in cloud);
  - altrimenti **file locale** `data/db.json` (sviluppo/self-host).
- **Storage video** (adattivo):
  - **Cloudflare R2** se sono impostate le variabili `R2_*` (persistente, 10 GB gratis);
  - altrimenti **disco locale** `data/uploads` (sviluppo/self-host).

➡️ Per pubblicarla online come istanza privata persistente, vedi **[DEPLOY.md](DEPLOY.md)**.

## Avvio rapido

```bash
# 1. Installa le dipendenze
npm install

# 2. (Opzionale ma consigliato) crea il file .env
cp .env.example .env   # poi imposta un JWT_SECRET robusto

# 3. Sviluppo (API su :4000, UI su :5173 con hot-reload)
npm run dev
```

Apri **http://localhost:5173** e completa la configurazione iniziale (crea l'account admin).

### Produzione

```bash
npm run build      # compila la UI in /dist
npm start          # Express serve API + UI su http://localhost:4000
```

## Come aggiungere i tuoi contenuti

1. Accedi e scegli un profilo.
2. Vai su **Librerie** → inserisci nome e **percorso della cartella sul server**
   (es. `D:\Film` o `D:\Serie`).
3. CatAlive scansiona e cataloga automaticamente. Usa **Ri-scansiona** dopo aver
   aggiunto nuovi file.

I nomi dei file vengono interpretati per ricavare titolo/anno e, per le serie,
stagione/episodio (pattern come `S01E02` o `1x02`).

## Note importanti

- **Formati video**: il browser riproduce nativamente **MP4 (H.264/AAC)** e **WebM**.
  File `.mkv`, `.avi`, ecc. potrebbero non partire senza *transcodifica* (prevista come
  evoluzione futura, es. con FFmpeg).
- **Privacy/contenuti**: usa la piattaforma solo con contenuti che possiedi o che hai
  il diritto di archiviare e riprodurre.
- **Sicurezza**: imposta un `JWT_SECRET` forte e, se esponi il server su Internet,
  mettilo dietro **HTTPS** (e imposta `secure: true` sul cookie in `server/routes/auth.js`).

## Struttura

```
CatAlive/
├─ server/            # API Express
│  ├─ index.js        # entrypoint
│  ├─ store.js        # persistenza JSON
│  ├─ auth.js         # password, JWT, middleware
│  ├─ scanner.js      # scansione cartelle + parsing nomi
│  └─ routes/         # auth, profiles, libraries, media, stream, progress
├─ client/src/        # app React (pagine + componenti)
├─ index.html         # entry Vite
└─ data/db.json       # dati (creato al primo avvio)
```

## Roadmap (idee per il futuro)

- Transcodifica on-the-fly con FFmpeg (compatibilità .mkv/.avi).
- Metadati e poster da TMDb.
- Sottotitoli, audio multitraccia.
- Download offline e watch party.
