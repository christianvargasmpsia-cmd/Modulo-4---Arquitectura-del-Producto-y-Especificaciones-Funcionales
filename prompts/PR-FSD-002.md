# PR-FSD-002 — Contrato Funcional IA para Publicación y Gestión de Productos y Servicios

## 0. Metadatos

| Campo        | Valor                                                                     |
| ------------ | ------------------------------------------------------------------------- |
| Documento    | PR-FSD-002                                                                |
| Nombre       | Contrato Funcional IA para Publicación y Gestión de Productos y Servicios |
| Versión      | v2.0                                                                      |
| Fecha        | 21/06/2026                                                                |
| Estado       | Aprobado                                                                  |
| Proyecto     | UMSS Market                                                               |
| Relación BRD | BRD v4                                                                    |
| Relación PRD | PRD v3                                                                    |
| Relación FSD | FSD-UC-002                                                                |

---

## 1. Objetivo

Formalizar un contrato funcional IA para validar publicaciones realizadas por emprendedores universitarios dentro del marketplace UMSS Market.

El contrato tiene como objetivo verificar la consistencia funcional de publicaciones de tipo PRODUCTO y SERVICIO antes de que sean visibles para compradores.

---

## 2. Contexto funcional

Relacionado con:

* UC-002 Publicación y Gestión de Productos y Servicios.
* Gestión de catálogo.
* Gestión de emprendimientos universitarios.
* Gestión de disponibilidad y comercialización.

### Documentos relacionados

* BRD_v4
* PRD_v3
* FSD_v3

---

## 3. Entrada esperada

El contrato IA debe recibir información estructurada asociada a una nueva publicación.

```json
{
  "tipo": "PRODUCTO",
  "nombre": "Brownie Artesanal",
  "descripcion": "Brownie elaborado de forma artesanal",
  "precio": 12.50,
  "stock": 20,
  "modalidad_cobro": null,
  "puntos_entrega_ids": [
    "PE-001",
    "PE-002"
  ]
}
```

---

## 4. Salida esperada

```json
{
  "validacion_publicacion": true,
  "errores": [],
  "advertencias": [],
  "estado": "PUBLICABLE"
}
```

---

## 5. Reglas operacionales

### Para PRODUCTO

* nombre obligatorio
* descripción obligatoria
* precio mayor a 0
* stock obligatorio
* stock mínimo igual a 1
* al menos un punto de entrega

### Para SERVICIO

* nombre obligatorio
* descripción obligatoria
* precio mayor a 0
* modalidad de cobro obligatoria
* al menos un punto de encuentro o coordinación

### Reglas generales

* La publicación debe pertenecer a una tienda activa.
* No se permiten nombres vacíos.
* No se permiten precios negativos.
* La publicación debe ser consistente antes de ser publicada.

---

## 6. Restricciones

El contrato IA:

* No publica directamente la información.
* No modifica registros persistentes.
* No ejecuta operaciones sobre base de datos.
* No reemplaza validaciones implementadas en backend.
* Solo genera recomendaciones y validaciones funcionales.

---

## 7. Riesgos asociados

| Riesgo                             | Mitigación             |
| ---------------------------------- | ---------------------- |
| Información incompleta             | Validación estructural |
| Precio inválido                    | Regla funcional        |
| Stock inconsistente                | Validación de negocio  |
| Servicio sin modalidad de cobro    | Validación obligatoria |
| Publicación sin punto de encuentro | Rechazo automático     |

---

## 8. Trazabilidad documental

| Documento | Relación                  |
| --------- | ------------------------- |
| BRD_v4    | Marketplace universitario |
| PRD_v3    | Gestión de publicaciones  |
| FSD_v3    | UC-002                    |

---

## 9. Integración AI-SDLC

Este contrato forma parte del flujo AI-assisted utilizado para validar publicaciones antes de su activación dentro del marketplace.

Permite mejorar:

* Calidad de datos.
* Consistencia funcional.
* Cumplimiento de reglas de negocio.
* Trazabilidad documental.

---

## 10. Registro de cambios

| Versión | Fecha      | Cambio                                                                                                                                                                                      |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.0    | 24/05/2026 | Creación inicial para validación de productos.                                                                                                                                              |
| v2.0    | 21/06/2026 | Evolución hacia modelo unificado PUBLICACION para soportar productos y servicios. Incorporación de modalidad de cobro, validaciones diferenciadas y alineación con BRD v4, PRD v3 y FSD v3. |

```
```
