# RGPD y LSSI: checklist de AulaLista

> **Aviso.** Esto no es asesoramiento jurídico. Es una lista de trabajo basada en el código actual (`produccion/src/worker.js`, `shared/engine.web.js`, `shared/landing.html`) a 17/11/2026. Revísala con un profesional. **(pendiente de verificar)** indica lo no confirmado en la fuente oficial o en el contrato del proveedor.
>
> Textos públicos relacionados: `produccion/public/legal/privacidad.html` y `cookies.html`. Si cambias la política de privacidad, sube `PRIVACY_VERSION` en el worker (hoy, `2026-11`).

## 1. Registro de actividades de tratamiento (art. 30 RGPD)

La excepción del art. 30.5 para organizaciones de menos de 250 personas no se aplica cuando el tratamiento no es ocasional. Leads y licencias se tratan de forma continua: **haz el registro**. Basta un documento interno (este) con los campos del art. 30.1, mantenido al día.

Responsable: [TITULAR], NIF [NIF], [DOMICILIO], [EMAIL]. DPD: no designado (art. 37 RGPD y art. 34 LOPDGDD; confirmar).

| # | Tratamiento | Interesados | Datos (claves de KV / sistema) | Finalidad | Base jurídica | Destinatarios / encargados | Transferencias | Conservación | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| T1 | **Lista de acceso anticipado** | Docentes y opositores que se apuntan | `lead:<email>` → email, comunidad, rol, fundador, origen (solo dominio o utm), fecha, consentimiento (fecha), privacidad (versión). Copia en MailerLite (email, comunidad, rol) | Avisar del lanzamiento y comunicaciones comerciales | Consentimiento (art. 6.1.a RGPD; art. 21 LSSI) | Cloudflare (KV), MailerLite | EE. UU. (Cloudflare: DPF + SCC; MailerLite: SCC) | Hasta la baja o [PLAZO] de inactividad. Prueba del consentimiento: plazo de prescripción | Hecho en código (W17). **Falta:** borrado por inactividad y baja sincronizada con MailerLite |
| T2 | **Clientes y licencias** | Compradores | `lic:<key>` → key, active, email, plan, subscription, payment_intent, creada, baja, motivo. Índices `sess:`, `sub:`, `pi:`, `email:`. En Stripe: datos de pago y facturación | Cobro, activación y baja de licencias, soporte, obligaciones fiscales | Contrato (6.1.b) y obligación legal (6.1.c) | Cloudflare, Stripe, gestoría [NOMBRE] | Stripe: UE (SPEL, Irlanda) con posibles transferencias a EE. UU. (pendiente de verificar el mecanismo) | Relación + plazos fiscales y mercantiles (confirmar con el gestor) | Hecho. **Falta:** definir el bloqueo tras la baja |
| T3 | **Cupo gratuito y límites** | Usuarios de la app | `u:<HMAC(IP)>:<AAAA-MM>` (contador, TTL 40 días), `p:<licencia>:<día>` (TTL 48 h). Seudónimo con `IP_SALT`; IPv6 agrupada por /64 | Aplicar los límites y prevenir abusos | Interés legítimo (6.1.f). **Hacer y guardar la ponderación** (ver 2) | Cloudflare | EE. UU. (DPF + SCC) | 40 días / 48 h (automático) | Hecho (W10). **Falta:** `wrangler secret put IP_SALT` en producción |
| T4 | **Generación de documentos** | Usuarios de la app | Campos del formulario (tema, contexto, producto…) enviados a la API. **No se guardan en KV ni en logs** | Prestar el servicio | Contrato o servicio solicitado (6.1.b) | Anthropic (encargado), Cloudflare (tránsito) | EE. UU. (Anthropic: SCC según su DPA) | AulaLista: no conserva. Anthropic: según sus condiciones (pendiente de verificar) | Hecho. Aviso «no escribas datos del alumnado» y detector en la app |
| T5 | **Seguridad y registros** | Visitantes | IP, user-agent, petición (Cloudflare); `console.error` sin contenido de usuario (errores de Anthropic truncados a 500 caracteres) | Seguridad de la red y depuración | Interés legítimo (6.1.f; considerando 49) | Cloudflare | EE. UU. | Según Cloudflare (pendiente de verificar) | Revisar que nunca se registren prompts ni emails |
| T6 | **Solicitudes de derechos y soporte** | Cualquier interesado | Email y contenido de la solicitud | Responder y acreditar la respuesta | Obligación legal (6.1.c) e interés legítimo | Proveedor de correo [CUÁL] | (según proveedor) | Plazo de prescripción | Falta un procedimiento (ver 5) |
| T7 | **Navegador del usuario** | Usuarios | `al-license`, `al-docs`, `al-prefs` en localStorage | Funcionamiento | Técnico y exento (art. 22.2 LSSI) | Ninguno: no salen del dispositivo, salvo la licencia | — | Hasta que el usuario borre | No es un tratamiento del responsable salvo la licencia. Informado en `cookies.html` |
| T8 | **Fuentes y librerías de terceros** | Visitantes | IP enviada a Google Fonts y a jsDelivr al cargar la página | Tipografía y exportación a Word | Interés legítimo débil: **mejor eliminar** | Google, jsDelivr | EE. UU. | — | **Pendiente F11/F2: autoalojar** fuentes y docx. Entonces desaparece este tratamiento |

## 2. Bases jurídicas: comprobaciones

- [ ] **T1, consentimiento válido** (arts. 4.11 y 7 RGPD): libre, específico, informado e inequívoco, y demostrable (art. 7.1). Hoy:
  - Se exige `rgpd === true` y se guardan la fecha y la versión.
  - **Problema:** la casilla de `shared/landing.html` mezcla «Acepto recibir emails» con «y la política de privacidad». **Recomendado:** una casilla solo para recibir emails, no premarcada, y un texto informativo aparte («Lee la política de privacidad») sin «aceptar». Su enlace apunta a `#privacidad` y debería apuntar a `/legal/privacidad.html`. Está fuera del pie: lo corrige el coordinador.
- [ ] **T1, LSSI art. 21:** las comunicaciones comerciales por email requieren autorización previa. Cada email debe identificarse como comercial, identificar al remitente e incluir una baja sencilla y gratuita. MailerLite lo hace si está bien configurado.
- [ ] **T1 a T2, reserva de Fundador:** el lead se guarda antes del pago. Si no paga, sigue siendo un lead con consentimiento. Correcto, siempre que la casilla de emails se marcara.
- [ ] **T3, ponderación del interés legítimo** (art. 6.1.f). Documenta en media página:
  - Interés: evitar abusos y mantener el plan gratuito.
  - Necesidad: no hay alternativa menos intrusiva sin cuentas de usuario.
  - Equilibrio: seudónimo HMAC, sin IP en claro, TTL de 40 días y sin otros usos.
  - Conclusión, más derecho de oposición informado.
- [ ] **T4:** si el usuario mete datos de alumnado pese al aviso, el docente actúa como responsable respecto a esos datos y AulaLista podría ser su encargado de facto. Por eso:
  - Mantén el aviso, el detector heurístico y la cláusula de las Condiciones (apartado 10).
  - **No guardes** las entradas en el servidor.
  - Revisa si Anthropic conserva las entradas y durante cuánto tiempo (pendiente de verificar en sus condiciones comerciales y su política de retención).

## 3. Encargados del tratamiento (art. 28) y transferencias internacionales (cap. V)

| Proveedor | Rol | Contrato (DPA) | Transferencia | Acciones |
| --- | --- | --- | --- | --- |
| **Cloudflare, Inc.** (EE. UU.) | Encargado: hosting, Workers, KV, red | Customer DPA. El DPA «forms part of the Main Agreement», con el Self-Serve Subscription Agreement como uno de los acuerdos principales. Parte firmante: Cloudflare, Inc. | Cloudflare declara cumplir el **EU-U.S. Data Privacy Framework**. Si decae, se aplican las **SCC** (módulo 2 o 3, cláusula 6.4) | [ ] Guardar PDF/fecha de la versión del DPA aceptada. [ ] Verificar la certificación en dataprivacyframework.gov. [ ] Conservación de logs |
| **Stripe** (Stripe Payments Europe, Ltd., Irlanda, como entidad contratante; STC y grupo) | Encargado para el cobro; **responsable independiente** para fraude y obligaciones regulatorias | DPA en stripe.com/legal/dpa. Si forma parte del Services Agreement está (pendiente de verificar) | (pendiente de verificar): DPF y/o SCC, según su Privacy Center | [ ] Aceptar el DPA en el Dashboard si lo pide. [ ] Enlazar la política de Stripe en `privacidad.html` |
| **Anthropic** | Encargado: modelo de IA | Data Processing Addendum: «is incorporated into and forms part of the Anthropic Commercial Terms… that references this DPA». Importador: «the Anthropic entity that executed the Agreement» | **SCC** (Decisión 2021/914, módulos 2 y 3), ley irlandesa. El DPA no menciona el DPF | [ ] Identificar la entidad contratante (¿Anthropic PBC o Anthropic Ireland?). [ ] Retención de las entradas de la API y uso para entrenamiento según las condiciones comerciales (pendiente de verificar). [ ] Guardar la versión |
| **MailerLite** | Encargado: email marketing | DPA que complementa los Terms of Use, efectivo al aceptarlos | Almacenamiento en la UE (Google Cloud en Alemania o Países Bajos). Su DPA cita como importador a **MailerLite, Inc. (San Francisco)** con **SCC**; autoridad de control: Lituania | [ ] Activar el doble opt-in. [ ] Configurar el remitente y la baja. [ ] Guardar la versión del DPA |
| **Google Fonts / jsDelivr** | Terceros que reciben la IP | Ninguno | EE. UU. | [ ] **Eliminar** autoalojando (F11, F2) |
| **Gestoría** [NOMBRE] | Encargado si trata datos de clientes | Contrato de encargo (art. 28.3) | — | [ ] Firmar |

Para cada encargado:

- [ ] Tener un contrato con el contenido del art. 28.3.
- [ ] Conocer la lista de subencargados y cómo se avisan los cambios.
- [ ] Saber dónde están los datos.
- [ ] Tener el mecanismo de transferencia identificado e informado en la política (art. 13.1.f).

## 4. Doble opt-in

- **No lo exige el RGPD**, pero es la forma práctica de **demostrar** el consentimiento (art. 7.1) y de evitar altas de terceros. Ahora mismo, cualquiera puede apuntar un email ajeno vía `/api/lead`.
- Hoy el worker hace `POST https://connect.mailerlite.com/api/subscribers` con email y campos. Comprueba (pendiente de verificar en la documentación de la API de MailerLite):
  1. Si la API respeta el doble opt-in del grupo o si hay que enviar el suscriptor como `unconfirmed` para disparar el email de confirmación.
  2. Que no se envíe ningún email comercial antes de confirmar.
  3. Si MailerLite guarda la fecha y la IP de la confirmación: es la prueba que conviene conservar.
- Mientras no esté activo, **no envíes campañas a leads sin confirmar**. La exportación `/api/admin/leads` incluye todos.
- La prueba del consentimiento que guarda KV (`consentimiento`, `privacidad`) se queda; añadir `confirmado: <fecha>` mediante un webhook de MailerLite es una mejora opcional.

## 5. Derechos de los interesados (arts. 12 a 22)

Procedimiento mínimo (documentarlo y probarlo una vez):

1. **Canal:** [EMAIL], indicado en la política. Responder en **un mes** (art. 12.3), prorrogable dos meses más en casos complejos, avisando.
2. **Identidad:** responder al mismo email que consta. Si hay dudas razonables, pedir información adicional (art. 12.6), nunca el DNI por sistema.
3. **Acceso o portabilidad (arts. 15 y 20):**
   - `GET` en KV de `lead:<email>`.
   - La licencia se encuentra por `email:<email>` → `lic:<key>`.
   - Más el export de MailerLite y los datos de Stripe (Dashboard).
   - Entregar en JSON o CSV.
4. **Supresión (art. 17):**
   - Borrar `lead:<email>` y el suscriptor en MailerLite.
   - Para clientes: desactivar o borrar `lic:<key>`, `email:<email>`, `sess:`, `sub:` y `pi:` **salvo lo que deba conservarse bloqueado** por obligaciones fiscales (facturas en Stripe o en la gestoría).
   - Contadores `u:` y `p:`: caducan solos (no son reidentificables sin la sal).
5. **Oposición (art. 21):** a T3, explicar que sin el contador no hay plan gratuito. A comunicaciones comerciales: baja inmediata.
6. **Registro de solicitudes:** fecha, tipo, respuesta y fecha de respuesta. Es la prueba de cumplimiento.
7. **Mejora técnica (opcional):** un endpoint de administración `DELETE /api/admin/lead?email=` con el mismo token de admin, para no tocar KV a mano.

## 6. Violaciones de seguridad (arts. 33 y 34)

- **Notificar a la AEPD** en un máximo de **72 horas** desde que se tenga constancia, salvo que sea improbable que constituya un riesgo para los derechos y libertades (art. 33.1). Hacerlo por la sede electrónica de la AEPD. La AEPD ofrece herramientas de ayuda para valorar brechas: nombre y URL vigentes (pendiente de verificar).
- **Comunicar a los afectados** sin dilación indebida si el riesgo es alto (art. 34).
- **Documentar todas las brechas**, también las no notificadas (art. 33.5): hechos, efectos y medidas.

Escenarios propios de AulaLista y su respuesta:

| Escenario | Datos expuestos | Primeras medidas |
| --- | --- | --- |
| Filtración del `ADMIN_TOKEN` | Todos los leads (export CSV) | Rotar el token (`wrangler secret put ADMIN_TOKEN`) y revisar los accesos en los logs de Cloudflare. Valorar el riesgo: emails y rol profesional, riesgo de phishing. Notificar si procede |
| Acceso a la cuenta de Cloudflare | KV completo: leads, licencias y emails de clientes | 2FA obligatorio en Cloudflare, Stripe, Anthropic y MailerLite. Rotar todos los secretos |
| Filtración de `IP_SALT` | Permite reidentificar las IP de los contadores por fuerza bruta | Rotar la sal (los contadores se reinician) |
| Filtración de `LICENSE_SECRET` / `STRIPE_WEBHOOK_SECRET` | Permite derivar claves de licencia de sesiones conocidas | Rotar con un plan de migración de las licencias (ver el informe de QA) |
| Clave de API de Anthropic | Sin datos personales; riesgo de coste | Rotar y poner un límite de gasto |
| Brecha en un proveedor | Según el proveedor | El encargado debe avisarte (art. 33.2); valorar y notificar tú |

## 7. Otras obligaciones

- [ ] **Información en dos capas** (art. 11 LOPDGDD): la primera capa está en el pie de la landing (responsable, finalidad, base, destinatarios, derechos y enlace) y la segunda en `/legal/privacidad.html`. Añade una primera capa también junto al botón de pago y en la app si recoges datos ahí.
- [ ] **Datos del alumnado:** nunca pedirlos ni almacenarlos (regla del CLAUDE.md). Mantener el aviso en la app y el detector heurístico (`app.template.html`).
- [ ] **Seguridad (art. 32):** ver el checklist de `docs/qa/informe-seguridad.md`. 2FA en todas las cuentas y secretos solo con `wrangler secret put`.
- [ ] **EIPD (art. 35):** con el tratamiento actual (sin datos sensibles ni perfiles, y con contadores seudonimizados) no parece necesaria (pendiente de confirmar con las listas de la AEPD). Revisarlo si se añaden cuentas, historial en el servidor o analítica.
- [ ] **Cookies:** solo almacenamiento técnico; no hace falta banner (ver `cookies.html`). Si se añade analítica de terceros, hace falta banner con aceptar y rechazar al mismo nivel.
- [ ] **Reglamento de IA (UE) 2024/1689:** las obligaciones de transparencia del art. 50 (informar de que el contenido está generado por IA y, para proveedores, el marcado legible por máquina) tienen una fecha de aplicación y un alcance para un integrador como AulaLista que están (pendiente de verificar). Hoy la landing y las Condiciones ya dicen que los documentos se generan con IA.
- [ ] **Versionado:** cada cambio en `privacidad.html` implica subir `PRIVACY_VERSION`. Si el cambio afecta a la finalidad de T1, pide de nuevo el consentimiento.

## 8. Fuentes consultadas (17/11/2026)

- [Anthropic, Data Processing Addendum](https://www.anthropic.com/legal/data-processing-addendum).
- [Cloudflare, Customer DPA](https://www.cloudflare.com/cloudflare-customer-dpa/).
- [MailerLite, Data Processing Agreement](https://mailerlite.com/legal/data-processing-agreement).
- [Stripe, Privacy Center](https://stripe.com/es/legal/privacy-center).
- LSSI, art. 10 (texto reproducido por [Supercontable](https://www.supercontable.com/informacion/ley_gestion/Art.10._Ley_34-2002-_Servicios_de_la_sociedad_de_.html); verifica en el BOE).
- [Guía de cookies (actualización de 2024, UC3M)](https://www.uc3m.es/uc3m/media/uc3m/doc/archivo/doc_guia-de-cookies.-actualizada-2024/guia-de-cookies.-actualizada-2024.pdf). Es orientativa; la referencia es la guía de la AEPD.
- Consumo: [folleto del derecho de desistimiento, julio de 2026 (CEC)](https://portal-cec.consumo.gob.es/sites/default/files/documentos/FOLLETO_DERECHO_DESISTIMIENTO_JULIO_2026.pdf), [OCU sobre la Directiva 2023/2673](https://www.ocu.org/organizacion/prensa/notas-de-prensa/2026/normabotondesistimiento190626), [TRLGDCU consolidado (CIDOC Consumo)](https://cidoc.consumo.gob.es/sites/default/files/Legis_DOC/8D90F3326C7206E_BOE-A-2007-20555-consolidado.pdf), [cierre de la plataforma ODR (CEC)](https://portal-cec.consumo.gob.es/es/comunicacion/noticias/2025/la-plataforma-europea-para-la-resolucion-de-litigios-en-linea-dejara-de) y [contenidos y servicios digitales (Ayuntamiento de Madrid)](https://www.madrid.es/UnidadesDescentralizadas/Consumo/Publicaciones/TemasInter%C3%A9s/Servicios/Contenidos%20y%20Servicios%20Digitales.pdf).
- [Hojas de reclamaciones en Canarias, Decreto 90/2023 (sede)](https://sede.gobiernodecanarias.org/sede/tramites/6488).
