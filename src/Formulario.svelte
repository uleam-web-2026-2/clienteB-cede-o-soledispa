<script lang="ts">
  import type { Pedido } from './tipos'

  export let sessionEmail = ''
  export let onCreate: (order: {
    cliente: Omit<NonNullable<Pedido['cliente']>, 'id' | 'creado_en'>
    ramo: Omit<NonNullable<Pedido['ramo']>, 'id' | 'creado_en'>
    personalizacion: Omit<NonNullable<Pedido['personalizacion']>, 'id' | 'pedido_id' | 'creado_en'>
    detalle_pedido: Omit<NonNullable<Pedido['detalle_pedido']>, 'id' | 'pedido_id' | 'creado_en'>
  }) => Promise<void>

  let formData = {
    nombre: '',
    correo: '',
    telefono: '',
    tamano: '',
    flores: '',
    follaje: '',
    extras: '',
    ocasion: '',
    colores: '',
    envoltura: '',
    dedicatoria: '',
    preferencias: '',
    observaciones: '',
  }
  let submitted = false
  let submitError = ''
  $: hasNombre = Boolean(formData.nombre.trim())
  $: hasCorreo = Boolean(formData.correo.trim() && formData.correo.includes('@'))
  $: hasTamano = Boolean(formData.tamano)
  $: hasFlores = Boolean(formData.flores.trim())
  $: hasOccasion = Boolean(formData.ocasion)
  $: hasColors = Boolean(formData.colores.trim())
  $: hasWrapping = Boolean(formData.envoltura)
  $: hasPreferences = Boolean(formData.preferencias.trim())

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    submitted = false
    submitError = ''
    if (!hasNombre || !hasCorreo || !hasTamano || !hasFlores || !hasOccasion || !hasColors || !hasWrapping || !hasPreferences) return

    try {
      await onCreate({
        cliente: { nombre: formData.nombre.trim(), correo: formData.correo.trim(), telefono: formData.telefono.trim() },
        ramo: { tamano: formData.tamano, flores: formData.flores.trim(), follaje: formData.follaje.trim(), extras: formData.extras.trim() },
        personalizacion: { ocasion: formData.ocasion, colores: formData.colores.trim(), envoltura: formData.envoltura, dedicatoria: formData.dedicatoria.trim() },
        detalle_pedido: { preferencias: formData.preferencias.trim(), observaciones: formData.observaciones.trim(), instrucciones_armado: formData.extras.trim() },
      })
      submitted = true
    } catch (error) {
      submitError = error instanceof Error ? error.message : 'No se pudo crear el pedido.'
    }
  }
</script>

<section id="nuevo-pedido" class="form-section spotlight-card" data-glow aria-labelledby="titulo-formulario">
  <div class="section-heading"><div><p class="eyebrow">Cliente comprador</p><h2 id="titulo-formulario">Nuevo pedido</h2></div><p class="state-note">Estado inicial: <strong>recibido</strong></p></div>
  {#if !sessionEmail}<p class="state-note">Inicia sesión para guardar el pedido en Supabase.</p>{/if}
  <form on:submit={handleSubmit} novalidate>
    <div class="form-grid">
      <div class="form-field"><label for="nombre">Nombre del cliente</label><input id="nombre" bind:value={formData.nombre} required aria-invalid={!hasNombre} />{#if !hasNombre}<p class="error-message">Escribe el nombre.</p>{/if}</div>
      <div class="form-field"><label for="correo">Correo</label><input id="correo" type="email" bind:value={formData.correo} required aria-invalid={!hasCorreo} />{#if !hasCorreo}<p class="error-message">Escribe un correo válido.</p>{/if}</div>
      <div class="form-field"><label for="telefono">Teléfono (opcional)</label><input id="telefono" bind:value={formData.telefono} /></div>
      <div class="form-field"><label for="tamano">Tamaño del ramo</label><select id="tamano" bind:value={formData.tamano} required aria-invalid={!hasTamano}><option value="" disabled>Selecciona un tamaño</option><option>Pequeño</option><option>Mediano</option><option>Grande</option></select>{#if !hasTamano}<p class="error-message">Selecciona el tamaño.</p>{/if}</div>
      <div class="form-field"><label for="flores">Flores</label><input id="flores" bind:value={formData.flores} placeholder="Rosas rojas" required aria-invalid={!hasFlores} />{#if !hasFlores}<p class="error-message">Escribe las flores.</p>{/if}</div>
      <div class="form-field"><label for="follaje">Follaje</label><input id="follaje" bind:value={formData.follaje} placeholder="Eucalipto" /></div>
      <div class="form-field"><label for="ocasion">Ocasión</label><select id="ocasion" bind:value={formData.ocasion} required aria-invalid={!hasOccasion}><option value="" disabled>Selecciona una ocasión</option><option>Cumpleaños</option><option>Aniversario</option><option>Felicitación</option><option>Condolencias</option><option>Otra ocasión</option></select>{#if !hasOccasion}<p class="error-message">Selecciona la ocasión.</p>{/if}</div>
      <div class="form-field"><label for="colores">Colores preferidos</label><input id="colores" bind:value={formData.colores} placeholder="Rosado y blanco" required aria-invalid={!hasColors} />{#if !hasColors}<p class="error-message">Escribe los colores.</p>{/if}</div>
      <div class="form-field"><label for="envoltura">Envoltura</label><select id="envoltura" bind:value={formData.envoltura} required aria-invalid={!hasWrapping}><option value="" disabled>Selecciona una envoltura</option><option>Papel kraft</option><option>Papel decorativo</option><option>Canasta</option><option>Sin envoltura especial</option></select>{#if !hasWrapping}<p class="error-message">Selecciona la envoltura.</p>{/if}</div>
      <div class="form-field"><label for="dedicatoria">Dedicatoria (opcional)</label><input id="dedicatoria" bind:value={formData.dedicatoria} /></div>
      <div class="form-field form-field-wide"><label for="preferencias">Detalles del pedido</label><textarea id="preferencias" bind:value={formData.preferencias} rows="3" placeholder="Preferencias o flores que deben evitarse" required aria-invalid={!hasPreferences}></textarea>{#if !hasPreferences}<p class="error-message">Describe los detalles.</p>{/if}</div>
      <div class="form-field form-field-wide"><label for="observaciones">Observaciones (opcional)</label><textarea id="observaciones" bind:value={formData.observaciones} rows="2"></textarea></div>
      <div class="form-field form-field-wide"><label for="extras">Extras e instrucciones de armado</label><input id="extras" bind:value={formData.extras} placeholder="Tarjeta pequeña, lazo..." /></div>
    </div>
    <button type="submit" disabled={!sessionEmail}>Crear pedido</button>
    {#if submitted}<p class="success-message" role="status">Pedido creado y guardado en Supabase.</p>{/if}
    {#if submitError}<p class="error-message" role="alert">{submitError}</p>{/if}
  </form>
</section>
