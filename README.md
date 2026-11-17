# AulaLista: sistema completo

Generador de situaciones de aprendizaje, rúbricas y adaptaciones DUA alineadas con el currículo LOMLOE de cada comunidad autónoma. "AulaLista" es un nombre provisional: antes de comprar el dominio, comprueba que está libre (dominio y marca en la OEPM).

## Qué hay en cada carpeta

| Ruta | Qué es | Para qué |
| --- | --- | --- |
| `dist/prototipo.html` | Prototipo publicado en claude.ai | Usarlo ya: crear contenido para la lista, el lead magnet y las demos |
| `produccion/public/index.html` | Landing de preventa | Captar emails y vender plazas de Fundador |
| `produccion/public/app.html` | La app para clientes | El producto que se vende |
| `produccion/src/worker.js` | Backend (Cloudflare Worker) | IA, cupo gratuito, licencias Pro, leads y webhook de Stripe |
| `produccion/src/prompts.mjs` | Datos curriculares y prompts | El "foso": aquí se mejora la calidad |
| `shared/` | Código fuente común | Se edita aquí y se ejecuta `python3 build.py` |

## Arquitectura

```
Docente ──► aulalista.es (Cloudflare: landing + app estáticas)
              │
              ├─ /api/generate ──► API de Anthropic (stream)   [3 gratis/mes por IP · ilimitado con licencia]
              ├─ /api/lead     ──► KV (+ MailerLite opcional)
              ├─ /api/license  ◄── vuelta de Stripe Checkout (?session_id=)
              └─ /api/stripe-webhook ◄── Stripe (alta y baja de licencias)
```

No hay servidor, base de datos que mantener ni proceso de build. El coste fijo es 0 € hasta superar el plan gratuito de Cloudflare (100.000 peticiones/día). Solo pagas la API de IA por uso.

## Puesta en marcha (unos 60–90 minutos)

1. **Cuentas** (todas gratuitas): Cloudflare, Stripe, Anthropic Console (con 5–10 € de saldo), MailerLite (opcional).
2. **Instalar y entrar**: `cd produccion && npm install && npx wrangler login`
3. **KV**: `npx wrangler kv namespace create KV` y pega el id en `wrangler.toml`.
4. **Secretos**:
   ```
   npx wrangler secret put ANTHROPIC_API_KEY
   npx wrangler secret put STRIPE_SECRET_KEY
   npx wrangler secret put STRIPE_WEBHOOK_SECRET
   npx wrangler secret put ADMIN_TOKEN        # una contraseña larga inventada por ti
   ```
5. **Stripe**:
   - Crea dos productos: **Fundador** (49 €, pago único) y **Pro** (9 €/mes y 69 €/año, suscripción).
   - Crea un *Payment Link* para cada uno. En "Después del pago" elige *Redirigir* a `https://TU-DOMINIO/app.html?session_id={CHECKOUT_SESSION_ID}`.
   - Pega el enlace de Fundador en `STRIPE_FOUNDER_LINK` (en `wrangler.toml`).
   - Webhook: `https://TU-DOMINIO/api/stripe-webhook` con los eventos `checkout.session.completed` y `customer.subscription.deleted`. Copia su secreto en `STRIPE_WEBHOOK_SECRET`.
6. **Publicar**: `npm run deploy` y conecta tu dominio en Cloudflare (Workers → Settings → Domains).
7. **Probar en modo test de Stripe** (tarjeta 4242 4242 4242 4242): compra Fundador, vuelve a `app.html` y comprueba que la etiqueta pasa a "Pro".
8. **Exportar leads**: `https://TU-DOMINIO/api/admin/leads?token=TU_ADMIN_TOKEN` descarga un CSV.

## Antes de cobrar el primer euro (no es opcional)

- [ ] **Compatibilidad**: consulta a la Consejería o a un sindicato sobre la Ley 53/1984 (interinos incluidos).
- [ ] **Fiscalidad canaria**: IGIC frente a IVA en ventas a la Península y la UE, con un gestor. Stripe no lo resuelve por sí solo; Lemon Squeezy (merchant of record) sí.
- [ ] **Textos legales**: aviso legal, política de privacidad y condiciones. Rellena `[TU NOMBRE O SOCIEDAD]` en el pie de la landing.
- [ ] **Verificar los decretos**: en `shared/prompts.js` solo Canarias, Castilla-La Mancha y C. Valenciana tienen el decreto citado y verificado. El resto usa una referencia genérica a propósito. Añade cada decreto (`decreto:` y `verificado: true`) cuando lo compruebes.
- [ ] **Revisión docente**: genera 10 situaciones de aprendizaje de Canarias con el prototipo y revísalas tú. Corrige el prompt donde falle.

## Siguientes mejoras (por impacto)

1. **RAG curricular**: cargar los criterios literales de cada decreto (empezando por Canarias) en `prompts.js`, por área y ciclo, e inyectar solo los del área elegida. Elimina casi todas las marcas VERIFICAR. Es el mayor salto de calidad.
2. **SEO programático**: un script que genere una página por comunidad × curso × área × tema con un ejemplo y un CTA a la app.
3. **Cuentas con email** (enlace mágico) para sincronizar la biblioteca entre dispositivos. Hoy el historial vive en el navegador.
4. **Módulo Opositor** (septiembre de 2027): programación didáctica y supuestos prácticos con corrección.
