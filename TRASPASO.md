# Traspaso: la web a la cuenta de Pol

Se le pasa una copia del repositorio a su cuenta de GitHub, y la publica su
Cloudflare con su dominio. El de meowrhino se queda como está, de copia
nuestra en `meowrhino.github.io/polroig/` (sin indexar). Desde el traspaso son
dos repositorios separados: los cambios, en el suyo.

Todo viaja dentro del repositorio: el código, los JSON, las fotos y cómo se
publica (`wrangler.jsonc`). En su copia la Action solo comprueba el build y,
si falla, abre un issue que le llega por correo; no publica en GitHub Pages
(eso lleva `if: github.repository_owner == 'meowrhino'`). Quien publica es
Cloudflare: el build, al no estar en GitHub, va a la raíz con el `url` de
`site.json`.

Tiempo: unos 20 minutos, más lo que tarden los DNS.

## Antes

- [ ] `main` está al día y sin cambios a medias (`git status` limpio).
- [ ] Pol tiene cuenta de GitHub. Su usuario: `<su-usuario>`.
- [ ] Pol tiene cuenta de Cloudflare, y el dominio (`polroigvalldosera.com`, el de su correo) a mano.

## 1. Su copia

- [ ] En su cuenta, **New repository** → `polroig`, público y vacío (sin README ni licencia).
- [ ] La copia va **sin historial** (la nuestra lleva pruebas y diseños que ya no son). Desde esta carpeta:
      ```bash
      rm -rf /tmp/polroig && mkdir /tmp/polroig && git archive HEAD | tar -x -C /tmp/polroig
      cd /tmp/polroig && rm CLAUDE.md TRASPASO.md
      git init -b main && git add -A && git commit -m "La web de Pol"
      git push https://github.com/<su-usuario>/polroig.git main
      ```
      (si pide permiso, que nos añada antes como colaboradores, paso 3). Nada de `push --mirror`.
- [ ] En su copia no van `CLAUDE.md` ni `TRASPASO.md` (son nuestros; se quedan en el repo de
      meowrhino). `GUIA.md` y `README.md` sí.

## 2. Cloudflare

- [ ] En su Cloudflare: **Workers & Pages → Create → Import a repository** → `<su-usuario>/polroig`.
      Lo demás lo lee de `wrangler.jsonc` (instala sharp con `npm install`, build `node build/build.mjs`, sale `dist/`).
- [ ] **Ojo, Workers Builds publicando una web de la receta en vivo es nuevo** (tatara va por
      SFTP; oriol se entrega el mismo día). Mirar el primer build entero antes de seguir. Si falla
      por la versión de Node (Workers Builds no lee `engines` de `package.json`): **Settings → Build
      → Variables** → `NODE_VERSION` = `22`, y *Retry*. Si aun así no arranca, el respaldo es GitHub
      Pages en **su** cuenta: en su repo, Settings → Pages → Source *GitHub Actions*, y en
      `.github/workflows/deploy.yml` quitar los `if: github.repository_owner == 'meowrhino'`. El
      dominio se apunta entonces a Pages (Settings → Pages → Custom domain) en vez de a Cloudflare.
- [ ] **Settings → Domains & Routes → Add → Custom domain**: su dominio (y `www`, si lo quiere).
- [ ] En **su** repo, `data/site.json` → `"url": "https://polroigvalldosera.com"`. Commit y push
      a su repo (no al de meowrhino). Con eso deja de llevar `noindex`.

## 3. Que nos deje entrar

- [ ] GitHub, en su repo: Settings → Collaborators → `meowrhino`, con **Write** (no hace falta admin).
- [ ] Cloudflare: Manage account → Members → nos invita. Ahí se ve el error entero de un build que falla.

## 4. Comprobar en su dominio

- [ ] La portada, `/bio/`, un proyecto (`/eliza/`) y los mismos en `/ca/`.
- [ ] `view-source:`: `canonical` y `og:url` con su dominio, y **sin** `<meta name="robots" content="noindex">`.
- [ ] `/robots.txt` dice `Allow` y `/sitemap.xml` tiene las direcciones de su dominio.
- [ ] Compartir un proyecto por WhatsApp: sale su foto (la og).
- [ ] En `/bio/`, la firma `web: meowrhino.studio` con su enlace.

## 5. Search Console, con su cuenta de Google

- [ ] Dar de alta el dominio (el registro TXT, en el DNS de Cloudflare) y enviar `sitemap.xml`.

## 6. Pol en su ordenador

Con él delante, siguiendo [GUIA.md](GUIA.md) ("La primera vegada"):

- [ ] Clona **su** repositorio, no el de meowrhino, en una carpeta **fuera de Google Drive** (ni iCloud ni Dropbox).
      El repo ya lleva `.vscode/settings.json`: *Sincronitza* pone sus commits encima de los nuestros sin preguntar.
- [ ] Live Server: **Go Live** y ve la vista previa.
- [ ] Un cambio pequeño (una coma en la bio), Confirma → Sincronitza, y la boleta verde en GitHub.
- [ ] El aviso: quitar una coma a propósito, subirlo, y que le llegue el correo de GitHub
      "La web no se ha publicado". Ponerla, subirlo, y que el issue se cierre solo. Si el correo
      no llega: en GitHub, Settings → Notifications, que tenga el correo marcado en *Watching*.

## 7. Al acabar

- [ ] Fila de polroig en `JAMstack/inventario.md` con las dos direcciones (github.io y su dominio).
- [ ] La copia de meowrhino sigue en github.io con `noindex`: no compite en Google. Si molesta,
      Settings → Pages → **Unpublish site** (el repo se queda).
