# 🚀 Mettere CatAlive online (demo pubblica, gratis)

Questa guida pubblica CatAlive su un **dominio pubblico** (es. `catalive.onrender.com`)
che gira **24/7 senza usare il tuo dispositivo**. La parte tecnica è già pronta:
serve solo collegare il codice a un host.

> **Modalità demo**: online l'app parte con `DEMO_MODE=true`, che precarica
> l'utente **`demo` / `demo`** e un catalogo di esempio con **film a licenza libera**
> (Blender Foundation / Creative Commons). Così la demo è subito navigabile e
> **legale** da esporre in pubblico — niente film protetti da copyright.

---

## Opzione A — Render (consigliata, gratis)

### 1. Metti il codice su GitHub
Il repository è già inizializzato in locale. Ti serve un account su https://github.com.

```bash
# crea un repo vuoto su GitHub chiamato "catalive", poi:
cd C:\Users\zahar\Desktop\CatAlive
git remote add origin https://github.com/<TUO-UTENTE>/catalive.git
git branch -M main
git push -u origin main
```

> Se hai la GitHub CLI (`gh`) posso farlo io: basta che tu sia loggato con `gh auth login`.

### 2. Deploy su Render
1. Vai su https://dashboard.render.com → **New** → **Blueprint**.
2. Collega il tuo account GitHub e scegli il repo `catalive`.
3. Render legge il file [`render.yaml`](render.yaml) e configura tutto da solo
   (build, avvio, `JWT_SECRET` generato in automatico, demo attiva).
4. Conferma. Dopo qualche minuto avrai un URL tipo `https://catalive.onrender.com`.

Apri il sito → **Entra nella demo** (o `demo` / `demo`). Fatto. ✅

### Note sul piano gratuito Render
- L'istanza **va in pausa dopo ~15 min di inattività** e si riattiva alla prima
  visita (primo caricamento lento, ~30-60s). Normale per il piano free.
- Il disco è **effimero**: i dati si azzerano ad ogni riavvio, ma il catalogo demo
  **si ricarica da solo** all'avvio. (I progressi di visione dei visitatori non
  vengono conservati tra un riavvio e l'altro.)

---

## Opzione B — Alternative

- **Fly.io** o **Railway**: usa il [`Dockerfile`](Dockerfile) incluso. Ricordati di
  impostare le variabili `NODE_ENV=production`, `DEMO_MODE=true` e un `JWT_SECRET`
  robusto. Su Fly: `fly launch` (rileva il Dockerfile) → `fly deploy`.

---

## Dominio personalizzato (facoltativo)
Vuoi `tuonome.com` invece di `*.onrender.com`? Compra un dominio (~€10/anno) e su
Render: **Settings → Custom Domains** → aggiungi il dominio e imposta il record DNS
indicato. HTTPS viene gestito automaticamente.

---

## E i miei film veri?
Questa è una **demo** con contenuti di esempio. Per trasmettere la **tua** libreria
servono i file da qualche parte raggiungibile dal server:
- **In cloud** (storage a pagamento, i film vanno caricati), oppure
- **Da un dispositivo a casa** (un mini-server tipo Raspberry Pi/NAS, oppure il tuo
  PC con Cloudflare Tunnel).

Quando vuoi passare dalla demo all'uso reale, dimmelo e configuriamo la strada
giusta in base a dove tieni i film.
