# 🚀 CatAlive online — istanza privata (solo tu)

Questa guida mette CatAlive sul tuo dominio Render come **istanza privata**: accedi
**solo tu** (admin), carichi i tuoi episodi e li guardi da qualsiasi dispositivo.
Tutto **persistente** e a costo **€0** (entro i limiti dei piani gratuiti).

**Architettura:**
- **Render** (gratis) → esegue l'app sul tuo dominio.
- **Neon** (Postgres gratis) → database persistente (account, librerie, stato di visione).
- **Cloudflare R2** (10 GB gratis, senza costi di traffico) → i tuoi file video.

> ⚠️ I tuoi episodi sono sul tuo PC: per vederli "dal dominio Render" vanno **caricati**
> dall'area admin (finiscono su R2). Il server in cloud non vede le cartelle del tuo PC.

---

## 1) Database — Neon (5 minuti)
1. Crea un account gratuito su **https://neon.tech** → **New Project**.
2. A progetto creato, copia la **Connection string** (formato
   `postgres://utente:password@ep-xxx.neon.tech/neondb?sslmode=require`).
   → la userai come `DATABASE_URL`.

## 2) Archiviazione video — Cloudflare R2 (10 minuti)
1. Crea un account su **https://dash.cloudflare.com** → menu **R2**.
2. **Create bucket** (es. `catalive`). → è il tuo `R2_BUCKET`.
3. In **R2 → Manage R2 API Tokens → Create API Token** (permesso *Object Read & Write*).
   Copia **Access Key ID** e **Secret Access Key**.
4. Il tuo **Account ID** è nell'URL della dashboard / nella pagina R2.
   → ti servono: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`.

## 3) Codice su GitHub
Il repo è già inizializzato in locale. Carica la nuova versione:
```bash
cd C:\Users\zahar\Desktop\CatAlive
git push        # (se il remoto ha già un commit diverso, vedi nota in fondo)
```

## 4) Deploy su Render
1. **https://dashboard.render.com** → **New → Blueprint** → scegli il repo.
2. Render legge `render.yaml`. Ti chiederà di inserire le variabili segrete
   (`sync: false`). Incolla:
   | Variabile | Valore |
   |---|---|
   | `ADMIN_USERNAME` | il tuo username (es. `mrf4tt1`) |
   | `ADMIN_PASSWORD` | una password forte |
   | `DATABASE_URL` | la connection string di Neon |
   | `R2_ACCOUNT_ID` | dall'account Cloudflare |
   | `R2_ACCESS_KEY_ID` | dal token R2 |
   | `R2_SECRET_ACCESS_KEY` | dal token R2 |
   | `R2_BUCKET` | nome del bucket (es. `catalive`) |
3. Conferma. Dopo qualche minuto avrai `https://<nome>.onrender.com`.
4. Accedi con il tuo `ADMIN_USERNAME` / `ADMIN_PASSWORD`. Vai su **Librerie**,
   crea una libreria e **carica i tuoi episodi**. Li vedi solo tu. ✅

---

## Note importanti
- **Solo tu accedi**: non c'è registrazione pubblica. L'unico account è il tuo (admin),
  creato dalle variabili `ADMIN_*`.
- **Persistenza**: con Neon + R2 i dati e i video restano anche dopo i riavvii.
  (Senza `DATABASE_URL`/`R2_*` l'app usa file e disco locali, che su Render free sono
  effimeri — quindi in cloud imposta sempre Neon + R2.)
- **Piano free Render**: l'istanza va in pausa dopo ~15 min di inattività e si riattiva
  alla prima visita (primo caricamento ~30-60s).
- **Dimensione upload**: il caricamento passa dal server. File molto grandi possono
  superare i tempi del piano free; per ora carica file di dimensioni ragionevoli.
  (Evoluzione possibile: upload diretto del browser verso R2.)
- **Formati**: il browser riproduce nativamente **MP4 (H.264/AAC)** e **WebM**.
  `.mkv`/`.avi` potrebbero non partire senza transcodifica.

## Nota: remoto GitHub con commit diverso
Se `git push` segnala che il remoto ha già un commit non presente in locale
(`! [rejected]`), hai due opzioni:
- **Tieni questa versione** (consigliato, è quella reale e aggiornata):
  `git push --force-with-lease`
- **Unisci**: `git pull --no-rebase origin main` poi risolvi e `git push`.
