# Fiscalidad: autónomo en Canarias que vende suscripciones digitales (AulaLista)

> **Aviso.** Esto no es asesoramiento fiscal ni jurídico. Es una guía para llevar preparada la reunión con el gestor, con lo que se ha podido verificar en fuentes oficiales a 17/11/2026. **(pendiente de verificar)** indica lo que no se ha confirmado en la fuente oficial o lo que procede de fuentes secundarias (despachos, prensa). No factures hasta confirmarlo con un profesional.

## 1. Idea clave

Canarias forma parte de España y de la UE, pero **está fuera del ámbito territorial del IVA**. Allí se aplica el **IGIC**, que hoy está en el texto refundido de las disposiciones legales del REF, aprobado por el **Decreto Legislativo 1/2025, de 13 de octubre**, según la Agencia Tributaria Canaria (ATC). La DGT lo resume así (consulta V2338-10, citada por una fuente secundaria): las islas, «aun formando parte del territorio aduanero comunitario, están excluidas de la aplicación de la Ley del IVA».

Consecuencia: **para el IVA, un autónomo establecido en Canarias se trata como un empresario de fuera del territorio de aplicación del impuesto**, también frente a los consumidores de la Península (pendiente de verificar con el gestor o con una consulta a la DGT).

Además, los **servicios prestados por vía electrónica a consumidores finales** (B2C) se gravan **donde reside el consumidor**. Por eso el impuesto cambia según dónde esté cada cliente.

> **Cuidado con los números de artículo de la Ley 20/1991.** La ATC ya cita el texto refundido de 2025 (por ejemplo, arts. 89 a 91 para la franquicia). No uses en facturas ni en textos la numeración antigua sin comprobarla.

## 2. ¿Qué impuesto se aplica según el cliente?

AulaLista vende a consumidores (docentes) suscripciones a un servicio en línea automatizado, lo que con toda probabilidad es un «servicio prestado por vía electrónica» (pendiente de verificar la calificación con el gestor).

| Dónde está el cliente | Impuesto | Quién lo declara y cómo | Estado |
| --- | --- | --- | --- |
| **Canarias** (consumidor) | IGIC. Según una fuente secundaria (Macrosuma), se aplica el tipo general del 7 % a los servicios electrónicos | Tú, ante la ATC (autoliquidaciones del IGIC) **o** exento si te acoges a la franquicia del pequeño empresario (REPEP, ver 3) | Tipo: (pendiente de verificar en el TR vigente) |
| **Península y Baleares** (consumidor) | IVA español, en principio al 21 % (tipo general: pendiente de verificar) | Tú como sujeto pasivo. ¿Mediante el **régimen exterior de la Unión** (ventanilla única, modelos 035 y 369) o mediante alta ordinaria en IVA? | **(pendiente de verificar): punto clave para el gestor** |
| **Ceuta y Melilla** (consumidor) | Tampoco son territorio IVA (IPSI) | — | (pendiente de verificar). Probablemente es residual y puede bloquearse en el pago hasta aclararlo |
| **Otro Estado de la UE** (consumidor) | IVA del país del consumidor **desde el primer euro**. Según una fuente secundaria (AAA Plus Consulting), el umbral de 10.000 € es solo para quien está establecido en un Estado miembro, y no se aplica desde Canarias | Régimen exterior de la Unión: modelo 035 (alta) y modelo 369 trimestral, con un único pago en España | Umbral: (pendiente de verificar) |
| **Fuera de la UE** (consumidor) | En general, no sujeto a IVA ni a IGIC; puede haber impuestos locales del país (Reino Unido, Suiza, Noruega…) | — | (pendiente de verificar). Valora bloquear esos países al principio |
| **Empresas o centros privados** (B2B) | Reglas distintas: suele aplicarse la inversión del sujeto pasivo | — | (pendiente de verificar). De momento AulaLista no vende B2B |

### 2.1. Régimen exterior de la Unión (lo verificado)

Según el Manual práctico de IVA 2026 de la AEAT:

- Pueden acogerse «los empresarios o profesionales no establecidos en la Comunidad» que presten servicios a personas que no sean empresarios ni profesionales establecidas en la Comunidad.
- Se aplica a «todas las prestaciones de servicios que deban entenderse realizadas en la Comunidad».
- **Modelo 035:** declaración de inicio, modificación o cese.
- **Modelo 369:** autoliquidación **trimestral**, que se presenta aunque no haya operaciones, «durante el mes siguiente al del período», e ingreso en el mismo plazo.
- Conservación de los registros: 10 años.
- El apartado de devoluciones cita expresamente a los «empresarios o profesionales establecidos en las Islas Canarias, Ceuta o Melilla»: sus cuotas soportadas en otros Estados miembros se piden por el art. 117 bis de la Ley del IVA, y las soportadas en el territorio de aplicación del impuesto, por el art. 119. Esto sugiere que el régimen contempla a empresarios canarios, pero **no confirma de forma expresa que las ventas a consumidores de la Península se declaren en el 369 con España como Estado de identificación** (pendiente de verificar).

### 2.2. Prueba de dónde está el cliente

Para aplicar el impuesto correcto hay que acreditar dónde reside cada consumidor. La norma europea admite indicios como el país de facturación, la IP o el país del banco o de la tarjeta (requisitos concretos y número de indicios exigidos: pendiente de verificar). Stripe recoge el país de facturación y el de la tarjeta. **Activa la recogida de la dirección de facturación en Checkout** y guarda la prueba.

### 2.3. Cómo cobrar el impuesto correcto con Stripe

- **Opción A, precio único con impuestos incluidos.** Por ejemplo, 9 € al mes «IVA/IGIC incluido». Tú absorbes la diferencia según el país y declaras la base resultante. Es sencillo para el cliente, pero tu margen varía.
- **Opción B, Stripe Tax.** Calcula el impuesto por ubicación. Que pueda gestionar el caso de un vendedor en Canarias, con IGIC y con el régimen exterior, está (pendiente de verificar).
- **Opción C, *merchant of record*** (Lemon Squeezy, Paddle…). El intermediario vende al consumidor y asume el IVA de cada país. Tú le facturas a él (B2B). Simplifica mucho, pero cobra más comisión. Cómo se grava tu servicio al intermediario en el IGIC o el IVA está (pendiente de verificar). El README ya lo menciona como alternativa.

## 3. IGIC: régimen especial del pequeño empresario o profesional (REPEP, «franquicia»)

Verificado en la web de la ATC (página actualizada el 21/09/2026):

- **Requisitos:** persona física establecida en Canarias con un volumen de operaciones del año anterior **no superior a 50.000 €** (sin IGIC). Para 2025 el límite era de 30.000 €. El nuevo límite se aplica según el art. 90.2 del TR del REF, «desde el 1 de enero de 2026».
  - Prensa: el Gobierno anunció en marzo de 2026 la subida a 50.000 € con efectos desde el 1 de julio de 2026. El instrumento exacto y la fecha están (pendiente de verificar): parece el Decreto ley 3/2026.
- **Qué cuenta para el límite:** el volumen incluye **todas** las entregas y servicios, también los no sujetos al IGIC o localizados fuera de Canarias. **Tus ventas a la Península y a la UE cuentan para los 50.000 €.**
- **Cómo acogerse:** modelo 400 (declaración censal), opción «Inclusión».
  - Si empiezas la actividad: en la declaración de inicio, **antes de empezar**.
  - Si ya estás de alta: en enero.
  - Hubo una ventana extraordinaria del 1 al 31 de julio de 2026.
- **Obligaciones:**
  - Facturas sin IGIC, con la mención **«Exención franquicia fiscal»**.
  - Modelo 425, declaración informativa anual, en enero.
  - **No** presentes los modelos trimestrales 420/421: presentar el primero en plazo equivale a renunciar al régimen.
  - Sigues obligado a facturar, llevar libros y conservar copias.
- **Límite del régimen:** no deduces el IGIC soportado. **No resuelve el IVA de las ventas fuera de Canarias.**
- Normativa citada por la ATC: TR del REF (Decreto Legislativo 1/2025), arts. 89 a 91; Decreto 268/2011, arts. 47 septies a 47 decies.

## 4. Alta y obligaciones periódicas

| Trámite | Dónde | Notas | Estado |
| --- | --- | --- | --- |
| Alta censal (IRPF, epígrafe de IAE) | AEAT, **modelo 036** | El **037 está suprimido** desde el 3/2/2025 (Orden HAC/1526/2024). Se presenta **antes de empezar** la actividad. El epígrafe de IAE se decide con el gestor | Verificado (AEAT). Epígrafe: (pendiente) |
| Régimen exterior de la Unión, si procede | AEAT, modelo 035 y después el 369 trimestral | Ver 2.1 | (pendiente de verificar) |
| Alta en el IGIC y opción REPEP | ATC, modelo 400 | Antes de empezar, si quieres la franquicia | Verificado (ATC) |
| IAE | — | Las personas físicas suelen estar exentas del pago, aunque deben darse de alta censal | (pendiente de verificar) |
| IRPF | AEAT | Rendimientos de actividades económicas (estimación directa, normal o simplificada). Pagos fraccionados trimestrales (modelo 130), salvo excepciones. Se suman a tus rendimientos del trabajo como docente en la renta anual | (pendiente de verificar con el gestor) |
| Seguridad Social | TGSS (Import@ss) | Alta en el RETA: ver 5 | — |
| Compatibilidad | Consejería de Educación | **Antes** de todo lo anterior: ver `compatibilidad-docente.md` | — |

**Facturación:**

- Como vendes a consumidores, en principio vale una factura simplificada, aunque el cliente puede pedir la completa (Reglamento de facturación y Decreto 268/2011 para el IGIC: pendiente de verificar los requisitos concretos).
- Stripe puede emitir facturas o recibos, pero **comprueba que cumplan los requisitos españoles y canarios**: numeración, NIF, mención de la exención o del tipo, etc.
- **VERI\*FACTU:** el Real Decreto-ley 15/2025 (BOE de 03/12/2025) retrasa la obligación de adaptar los sistemas de facturación al **1 de julio de 2027** para los contribuyentes que no tributan por el Impuesto sobre Sociedades (autónomos incluidos), según la circular de un colegio profesional que lo cita. Si se aplica a facturas emitidas por plataformas como Stripe, y su convalidación, está (pendiente de verificar).

## 5. Seguridad Social: tarifa plana y «cuota cero» en Canarias (2026)

- **Pluriactividad.** Como docente interino cotizas en otro régimen; lo habitual es el Régimen General (pendiente de verificar en tu caso). Si te das de alta en el RETA, estarás en pluriactividad. La LGSS (art. 313, en la redacción del RDL 13/2022) prevé el **reintegro del 50 % del exceso** de cotización por contingencias comunes sobre el importe que fije la Ley de Presupuestos, con el tope del 50 % de lo ingresado en el RETA por esas contingencias. La TGSS lo abona en un máximo de 4 meses desde la regularización anual.
- **Alta en el RETA.** Desde 2023 se cotiza según los rendimientos netos reales (RDL 13/2022). ¿Hay obligación de alta aunque los ingresos sean bajos? El criterio de «habitualidad» está (pendiente de verificar con el gestor).
- **Tarifa plana («cuota reducida por inicio de actividad», art. 38 ter de la Ley 20/2007):**
  - El RDL 13/2022 fijó 80 €/mes para 2023-2025 y dispuso que, «a partir del año 2026», la cuantía la fije la Ley de Presupuestos Generales del Estado de cada ejercicio (verificado en el preámbulo del texto consolidado del BOE).
  - Para 2026, fuentes secundarias siguen hablando de 80 €/mes durante 12 meses, prorrogables otros 12 si los rendimientos netos no superan el SMI. **Cuantía y norma de 2026: (pendiente de verificar)**.
  - Compatibilidad de la tarifa plana con la pluriactividad: (pendiente de verificar).
- **«Cuota cero» del Gobierno de Canarias** (procedimiento SICAC 10808, convocatoria de 2026):
  - Subvenciona las cuotas reducidas o bonificadas pagadas a la TGSS, incluida la cuota reducida del art. 38 ter (primeros 12 meses y prórroga).
  - Requisitos: alta en el RETA al solicitar, y actividad y domicilio fiscal en Canarias. Régimen *de minimis*.
  - **Plazo de 2026: del 9/3/2026 al 15/10/2026, ya cerrado.** Resolución de 12/02/2026 (extracto en el BOC 2026/045). Bases: Orden de 18/03/2024, modificada. Resuelve la Dirección General de Autónomos.
  - La ficha **no dice si admite la pluriactividad** (pendiente de verificar). Convocatoria de 2027: (pendiente).
- **Ayuda por incapacidad temporal para autónomos (Canarias, SICAC 10901):** excluye expresamente la pluriactividad. No te serviría mientras seas docente.

## 6. Qué preguntar al gestor (lista para la reunión)

1. ¿Mis ventas a consumidores de la **Península** tributan por IVA español con el **régimen exterior de la Unión** (035/369, España como Estado de identificación), o tengo que darme de alta en el IVA en régimen general? ¿Hay alguna consulta de la DGT para un caso idéntico (prestador canario de servicios electrónicos B2C)?
2. ¿Califica AulaLista como «servicio prestado por vía electrónica»?
3. ¿Me conviene el **REPEP** (franquicia del IGIC hasta 50.000 €), sabiendo que las ventas fuera de Canarias cuentan para el límite? ¿Cómo se coordina con el régimen exterior del IVA?
4. ¿Qué tipo de IGIC se aplica si no me acojo al REPEP? ¿Y qué tipo de IVA a consumidores de la Península?
5. ¿Qué hago con los clientes de **Ceuta y Melilla** y de fuera de la UE (Reino Unido, Suiza)? ¿Bloqueo esos países?
6. ¿Precio único con impuestos incluidos, Stripe Tax o *merchant of record*? Coste y riesgo de cada opción.
7. ¿Qué pruebas de ubicación del cliente debo guardar y durante cuánto tiempo?
8. ¿Factura simplificada o completa? ¿Valen los recibos de Stripe? ¿Cómo afecta VERI\*FACTU desde julio de 2027?
9. ¿Epígrafe de IAE? ¿Estimación directa simplificada? ¿Tengo que presentar el modelo 130?
10. **Seguridad Social:** ¿obligación de alta en el RETA con ingresos bajos y en pluriactividad? ¿Cuánto es la tarifa plana en 2026 y es compatible con la pluriactividad? ¿Reintegro del 50 %? ¿Puedo pedir la «cuota cero» de Canarias en 2027?
11. ¿El pago de la plaza de Fundador (49 €, «Pro de por vida») se imputa entero al cobrarlo o se periodifica?
12. Plazos de conservación de facturas y registros que debo poner en la política de privacidad.
13. **Orden de los trámites:** compatibilidad, después alta en Hacienda, ATC y TGSS, y solo entonces el primer cobro.

## 7. Fuentes consultadas (17/11/2026)

- AEAT, Manual práctico de IVA 2026: [régimen exterior de la Unión](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/manual-iva-2026/capitulo-06-regimenes-especiales-iva/reg-espec-ventas-distancia-entreg-servic/regimen-exterior-union.html).
- AEAT: [modelo 036 y supresión del 037](https://sede.agenciatributaria.gob.es/Sede/ayuda/calendario-contribuyente/calendario-contribuyente-2026/informacion-sobre-presentacion-modelos-no-periodicos/modelo-036.html).
- DGT V1722/2024 (servicios electrónicos de un prestador establecido en el TAI; no trata Canarias): [copia](https://www.fiscal-impuestos.com/sites/fiscal-impuestos.com/files/NFC089413.pdf).
- ATC: [régimen especial del pequeño empresario o profesional (REPEP)](https://www3.gobiernodecanarias.org/tributos/atc/w/regimen-especial-peque%C3%B1o-empresario-o-profesional-repep?ida=116355332&prnt=).
- Sede del Gobierno de Canarias: [cuota cero, 2026](https://sede.gobiernodecanarias.org/sede/procedimientos_servicios/tramites/10808) y [ayuda por IT para autónomos](https://sede.gobiernodecanarias.org/sede/procedimientos_servicios/tramites/10901).
- RDL 13/2022, texto consolidado: [BOE](https://boe.es/buscar/pdf/2022/BOE-A-2022-12482-consolidado.pdf).
- Fuentes secundarias (no oficiales): [AAA Plus Consulting](https://aaaplusconsulting.com/es/blog/facturar-clientes-ue-desde-canarias-igic-iva), [Macrosuma](https://www.macrosuma.es/post/el-igic-en-los-servicios-electr%C3%B3nicos), [RTVC sobre el límite de 50.000 €](https://rtvc.es/canarias-exime-del-igic-a-autonomos-con-menos-de-50-000-euros-18-marzo-2026/), [circular sobre VERI\*FACTU](https://arquitectosgrancanaria.es/medios/documents/circulares/251204-01.pdf) y [Merca2 sobre la tarifa plana](https://www.merca2.es/2026/06/06/prorroga-tarifa-plana-autonomos-requisitos-2391531/).
