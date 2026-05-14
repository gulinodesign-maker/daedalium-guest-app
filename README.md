# Daedalium Guest App

Webapp/PWA statica pronta per GitHub Pages, creata come nuova versione commerciale di Daedalium Cultural Resort.

## Cosa include

- Interfaccia mobile-first stile app
- PWA installabile (`manifest.json` + `service-worker.js`)
- Home orientata alla conversione
- Prenotazione diretta verso booking engine ufficiale
- Concierge IA lato frontend basato su FAQ, camere e itinerari
- Sezioni: Camere, Hall, Terrazza, Piscina, Colazione, Destinazioni, Offerte, Contatti
- Form lead che genera richiesta WhatsApp/email precompilata
- Dati separati in `/data/*.json`
- Asset placeholder originali, da sostituire con foto ufficiali Daedalium

## Configurazione rapida

Apri `config.js` e sostituisci:

```js
whatsappNumber: '390000000000'
email: 'info@daedalium.it'
bookingUrl: 'https://daedalium-1.amenitiz.io/'
aiEndpoint: ''
```

Per WhatsApp usa formato internazionale senza `+`, per esempio `393331234567`.

## GitHub Pages

1. Crea un repository, per esempio `daedalium-guest-app`.
2. Carica tutti i file della cartella.
3. Vai su **Settings → Pages**.
4. Source: **Deploy from a branch**.
5. Branch: `main`, folder `/root`.
6. Salva e apri l’URL generato da GitHub.

## IA generativa reale

Questa versione non espone chiavi API nel frontend. Per collegare OpenAI:

1. Crea una Function su Vercel, Netlify o Firebase.
2. La function riceve `{ question, context }`.
3. La function chiama OpenAI lato server.
4. Inserisci l’URL pubblico in `config.js` dentro `aiEndpoint`.

Mai inserire una API key OpenAI direttamente in `app.js` o `config.js` se il repository è pubblico.

## Foto ufficiali

Sostituisci i file in `assets/photos/` mantenendo gli stessi nomi:

- `hero.jpg`
- `pool.jpg`
- `terrace.jpg`
- `breakfast.jpg`
- `hall.jpg`
- `rooms.jpg`
- `puntabianca.jpg`
- `valledeitempli.jpg`
- `scaladeiturchi.jpg`

## Note

Il progetto è stato creato da zero. L’allegato fornito è stato usato solo come riferimento di gusto per capire lo stile webapp/PWA, non come base da copiare.
