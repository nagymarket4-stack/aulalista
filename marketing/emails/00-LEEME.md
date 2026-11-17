# Secuencia de bienvenida (7 emails)

Se activa cuando alguien deja su email en la landing (`/api/lead`) o descarga el pack de Canarias. Objetivo: que la persona genere su primer documento gratis y, si le ahorra tiempo, que pase a Fundador o a Pro.

| N.º | Fichero | Día | Objetivo | Acción principal |
| --- | --- | --- | --- | --- |
| 1 | `01-bienvenida-pack.md` | 0 | Entregar el pack y presentar AulaLista | Descargar el pack |
| 2 | `02-primera-sa.md` | 1 | Activar: primer documento gratis | Generar una SA |
| 3 | `03-marcas-verificar.md` | 3 | Confianza: cómo revisar lo que genera | Revisar una SA con el decreto |
| 4 | `04-dua-en-un-minuto.md` | 5 | Activar una segunda herramienta | Generar una adaptación DUA |
| 5 | `05-rubricas-canarias.md` | 8 | Activar la tercera herramienta | Generar una rúbrica |
| 6 | `06-por-que-fundador.md` | 11 | Convertir a Fundador | Reservar plaza |
| 7 | `07-que-plan-te-conviene.md` | 14 | Cerrar la secuencia: elegir plan sin presión | Elegir plan o seguir gratis |

## Reglas de la secuencia

- Tono de docente a docente, tuteo, frases cortas. Español de España.
- Sin falsas urgencias: no hay cuentas atrás, ni «últimas horas», ni descuentos que caducan si no caducan de verdad. Las plazas de Fundador están limitadas a 80 porque así figura en la landing; si ese límite cambia, cámbialo aquí también. No se da un número de plazas restantes salvo que salga de un dato real y actualizado.
- Sin testimonios ni cifras de uso inventadas. Cuando haya testimonios reales (con permiso por escrito), se añaden en los emails 6 y 7.
- Nunca se promete que un documento esté «validado» ni «aprobado» por inspección ni por la Consejería. Se dice lo que es: un borrador profesional con los criterios del decreto que el docente revisa.
- Quien ya ha comprado Fundador o Pro sale de la secuencia de venta (emails 6 y 7) y recibe solo los de uso.
- Si alguien no ha generado ningún documento al llegar al email 4, se le puede reenviar el 2 con otro asunto (ver variante en el propio email 2).
- Pie de todos los emails: identificación del responsable, motivo por el que recibe el email y enlace de baja en un clic (lo define el agente de legal y cumplimiento).

## Variables

- `{{nombre}}`: si no lo tenemos, el saludo es «Hola:».
- `{{comunidad}}`: comunidad elegida en el formulario. Los ejemplos están escritos para Canarias; para Andalucía y Madrid hay que cambiar el párrafo de ejemplo y el decreto.
- `[FIRMA]`: nombre de la persona que firma y una línea real sobre quién es («maestra de Primaria en Tenerife», por ejemplo). Solo datos verdaderos.
