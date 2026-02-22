# Auditoría Completa de Configuración (Persistencia y Rehidratación)

Fecha: 2026-02-20  
Proyecto: `gest-tools`  
Alcance: flujo completo **Vista/Composable/Store/API/Backend/DB** de la zona de configuración.

---

## 1. Objetivo

Verificar, para cada sección de configuración:

1. Si los cambios se guardan en base de datos.
2. Si al recargar sesión/vista se vuelven a aplicar correctamente.
3. Qué puntos fallan (con causa técnica y referencias de código).

---

## 2. Mapa de arquitectura revisado

### Frontend

- Vistas de configuración:
  - `client/src/views/ConfigModulesView.vue`
  - `client/src/views/ConfigBillingView.vue`
  - `client/src/views/ConfigAgendaView.vue`
  - `client/src/views/ConfigThemesView.vue`
  - `client/src/views/ConfigDashboardView.vue`
  - `client/src/views/ConfigNotificationsView.vue`
  - `client/src/views/ConfigIconsView.vue`
  - `client/src/views/ConfigLanguageView.vue`
  - `client/src/views/ConfigWizardView.vue` (vía `useConfigWizard`)
  - `client/src/views/SettingsView.vue`
- Store central de config:
  - `client/src/stores/gestorConfig.ts`
- Adaptador API:
  - `client/src/infrastructure/businessConfigApi.ts`
- Stores/composables dependientes:
  - `client/src/stores/layout.ts`
  - `client/src/stores/theme.ts`
  - `client/src/stores/agendaColors.ts`
  - `client/src/stores/schedulerSettings.ts`
  - `client/src/stores/moduleIcons.ts`
  - `client/src/composables/useBillingConfig.ts`

### Backend

- Endpoint principal de configuración:
  - `GET /api/businesses/:id/config`
  - `PUT /api/businesses/:id/config`
  - archivo: `server/src/routes/businesses.ts`
- Endpoint secundario:
  - `GET/PATCH /api/settings`
  - archivo: `server/src/routes/settings.ts`

### Persistencia

- Tabla principal: `GestorConfig`
- Campos de identidad de negocio: `Business`

---

## 3. Resumen ejecutivo

### Estado general

- El sistema **sí tiene un flujo real de guardado a DB** para la mayoría de opciones (por `PUT /api/businesses/:id/config`).
- Hay fallos importantes en consistencia:
  - algunos datos se guardan pero no se rehidratan correctamente;
  - algunos cambios aparentan guardarse aunque la API falle;
  - algunas vistas pueden resolver un negocio incorrecto si falta `businessId`;
  - idioma se guarda local, no en DB.

### Riesgo principal

El punto más grave es que el store central aplica cambios localmente antes de confirmar persistencia y además oculta errores (`setConfig`). Esto genera falsos positivos de guardado.

---

## 4. Hallazgos detallados (fallos)

## 4.1 Crítico: falso “guardado” cuando la API falla

**Dónde**  
- `client/src/stores/gestorConfig.ts:214`
- `client/src/stores/gestorConfig.ts:227`

**Qué ocurre**  
- `setConfig` ejecuta `applyConfigToRefs(config)` antes de persistir.
- Si la llamada API falla, el `catch` solo hace `console.error` y no relanza.

**Impacto**  
- La UI refleja los cambios como si estuvieran guardados.
- Al recargar, vuelven valores antiguos de DB.
- Afecta prácticamente toda configuración que pasa por `gestorConfigStore.setConfig`.

**Severidad**  
- Crítica.

---

## 4.2 Alto: `businessAddress` mal rehidratado

**Dónde**  
- `client/src/stores/gestorConfig.ts:98`

**Qué ocurre**  
- En `initialize`, `businessAddress` se carga desde `apiConfig.address`.
- El backend devuelve `businessAddress` como campo propio:
  - `server/src/routes/businesses.ts:305`.

**Impacto**  
- Dirección fiscal y dirección general se mezclan.
- El usuario puede guardar una cosa y ver otra tras recargar.

**Severidad**  
- Alta.

---

## 4.3 Alto: campos fiscales/población/canarias no rehidratados

**Dónde**  
- `client/src/stores/gestorConfig.ts:87` (bloque `applyConfigToRefs` en `initialize`)
- Backend sí los envía:
  - `server/src/routes/businesses.ts:304` (`taxId`)
  - `server/src/routes/businesses.ts:306` (`businessPopulation`)
  - `server/src/routes/businesses.ts:307` (`isCanarias`)

**Qué ocurre**  
- Esos campos se guardan (vía `setConfig`/`PUT config`) pero no se reasignan al store al hidratar.

**Impacto**  
- En vistas como `SettingsView` parecen “perderse” tras recarga.

**Severidad**  
- Alta.

---

## 4.4 Alto: idioma no persiste en DB

**Dónde**  
- `client/src/views/ConfigLanguageView.vue:62`
- `client/src/stores/locale.ts:13`
- `client/src/infrastructure/localeStorage.ts:3`

**Qué ocurre**  
- El idioma se guarda en `localStorage` (`gestor-locale`).
- No usa `businessConfigApi.updateConfig(... locale ...)`.

**Impacto**  
- No sincroniza entre dispositivos/navegadores.
- No queda ligado al negocio/usuario en backend.

**Severidad**  
- Alta (funcional de negocio, no de estabilidad).

---

## 4.5 Medio: fallback peligroso al “primer negocio”

**Dónde**  
- `client/src/composables/useBillingConfig.ts:20`
- `client/src/views/ConfigModulesView.vue:77`
- `client/src/views/ConfigBillingView.vue:104`
- `client/src/views/ConfigNotificationsView.vue:196`

**Qué ocurre**  
- Si falta `user.businessId`, varias vistas/composables hacen:
  - `GET /api/businesses`
  - usan el primer elemento.

**Impacto**  
- En entornos multiempresa puede guardar en negocio incorrecto.
- Tras resets/sesiones inconsistentes puede provocar confusión de estado.

**Severidad**  
- Media.

---

## 4.6 Medio: feedback de éxito incorrecto en Settings

**Dónde**  
- `client/src/views/SettingsView.vue:236`

**Qué ocurre**  
- `success` se marca `true` en `finally`, independientemente de error real.

**Impacto**  
- El usuario ve “guardado” aunque haya fallado la persistencia.

**Severidad**  
- Media.

---

## 5. Hallazgos de backend (observaciones)

## 5.1 Endpoint `/api/settings` está infrautilizado

**Dónde**  
- `server/src/routes/settings.ts`
- No hay uso relevante desde cliente para la mayoría de pantallas.

**Riesgo**  
- Duplicación de caminos de configuración (`/api/settings` vs `/api/businesses/:id/config`).
- Aumenta riesgo de divergencia de reglas.

**Severidad**  
- Baja/media (arquitectura).

---

## 5.2 Estado de `GET /api/businesses/:id/config` cuando falta config

**Dónde**  
- `server/src/routes/businesses.ts:292`

**Qué ocurre**  
- Si no hay `GestorConfig` devuelve 404.

**Observación**  
- Cliente en general lo maneja, pero para UX puede ser más robusto devolver objeto por defecto o crear config automáticamente.

**Severidad**  
- Baja.

---

## 6. Qué partes sí funcionan correctamente

- `ConfigModules` guarda en backend vía `businessConfigApi.updateConfig` y recarga flags.
- `ConfigBilling` guarda `defaultVatPercent` en backend.
- `ConfigNotifications` guarda `whatsappRemindersEnabled` y `whatsappPhoneNumberId`.
- `Layout`, `Dashboard`, `Theme`, `Agenda`, `ModuleIcons` usan el store central y llegan a backend (aunque afectados por el fallo crítico de silenciamiento de errores).
- Backend separa correctamente campos de identidad (`Business`) y operativos (`GestorConfig`) en:
  - `server/src/routes/businesses.ts:381`.

---

## 7. Matriz rápida por vista (guardar y aplicar)

| Vista | Guarda en DB | Reaplica tras recarga | Estado |
|---|---|---|---|
| Config Modules | Sí | Sí (con riesgo de negocio fallback) | Parcial |
| Config Billing | Sí | Sí (con riesgo de negocio fallback) | Parcial |
| Config Notifications | Sí | Sí (con riesgo de negocio fallback) | Parcial |
| Config Grid | Sí (vía store central) | Sí (si persistencia real) | Parcial por fallo crítico |
| Config Dashboard | Sí (vía store central) | Sí (si persistencia real) | Parcial por fallo crítico |
| Config Themes | Sí (vía store central) | Sí (si persistencia real) | Parcial por fallo crítico |
| Config Agenda | Sí (vía store central + agendaColorsApi) | Sí (si persistencia real) | Parcial por fallo crítico |
| Config Icons | Sí (vía store central) | Sí (si persistencia real) | Parcial por fallo crítico |
| Config Wizard | Sí | Parcial (campos no rehidratados) | Falla parcial |
| Settings | Sí | Parcial (campos no rehidratados + éxito falso) | Falla parcial |
| Config Language | No (solo localStorage) | Solo en navegador local | Falla de persistencia DB |

---

## 8. Prioridad de corrección recomendada

1. **Corregir `setConfig` para no ocultar errores** y no aplicar optimista sin rollback.
2. Arreglar rehidratación de `businessAddress`, `taxId`, `businessPopulation`, `isCanarias`.
3. Hacer `ConfigLanguage` persistente en DB (`locale`) además de i18n local.
4. Eliminar fallback a “primer negocio” y exigir `businessId` de sesión válido.
5. Corregir feedback de éxito en `SettingsView`.
6. Definir un único camino de configuración (idealmente `/api/businesses/:id/config`) y reducir duplicidad con `/api/settings`.

---

## 9. Checklist de verificación funcional (manual)

Para cada pantalla de configuración:

1. Cambiar valor A.
2. Guardar.
3. Confirmar en Network: `PUT /api/businesses/:id/config` con payload correcto.
4. Recargar página completa.
5. Confirmar en Network: `GET /api/businesses/:id/config`.
6. Validar que valor A reaparece en UI.
7. Cerrar sesión, volver a entrar y repetir validación.

---

## 10. Conclusión

La plataforma ya tiene una base sólida de persistencia, pero presenta inconsistencias de confiabilidad UX y rehidratación de algunos campos clave.  
El principal defecto actual es el manejo silencioso de errores en `gestorConfigStore.setConfig`, que puede hacer creer al usuario que guardó cuando realmente no se persistió.

