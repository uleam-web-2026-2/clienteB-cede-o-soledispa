<script lang="ts">
  import { onMount } from 'svelte'
  import Formulario from './Formulario.svelte'
  import logo from './assets/Roses Lolas logo.jpeg'
  import { supabase, supabaseConfigured } from './lib/supabase'
  import type { Pedido } from './tipos'

  let orders: Pedido[] = []
  let selectedOrder: Pedido | null = null
  let loading = true
  let errorMessage = ''
  let authMessage = ''
  let email = ''
  let password = ''
  let sessionEmail = ''
  let submittingAuth = false

  async function loadOrders() {
    loading = true
    errorMessage = ''
    const { data, error } = await supabase
      .from('pedidos')
      .select('*, cliente:clientes(*), ramo:ramos(*), personalizacion:personalizaciones(*), detalle_pedido:detalles_pedido(*)')
      .order('creado_en', { ascending: false })

    if (error) {
      errorMessage = `No se pudieron cargar los pedidos: ${error.message}`
      orders = []
    } else {
      orders = (data || []) as Pedido[]
    }
    loading = false
  }

  async function showOrder(order: Pedido) {
    selectedOrder = order
  }

  async function signIn() {
    submittingAuth = true
    authMessage = ''
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      authMessage = `No se pudo iniciar sesión: ${error.message}`
    } else {
      sessionEmail = data.user?.email || email
      authMessage = 'Sesión iniciada correctamente.'
    }
    submittingAuth = false
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      authMessage = `No se pudo cerrar sesión: ${error.message}`
      return
    }
    sessionEmail = ''
    authMessage = 'Sesión cerrada.'
  }

  async function addOrder(order: {
    cliente: Omit<NonNullable<Pedido['cliente']>, 'id' | 'creado_en'>
    ramo: Omit<NonNullable<Pedido['ramo']>, 'id' | 'creado_en'>
    personalizacion: Omit<NonNullable<Pedido['personalizacion']>, 'id' | 'pedido_id' | 'creado_en'>
    detalle_pedido: Omit<NonNullable<Pedido['detalle_pedido']>, 'id' | 'pedido_id' | 'creado_en'>
  }) {
    if (!sessionEmail) {
      throw new Error('Debes iniciar sesión para crear un pedido.')
    }

    const { data: cliente, error: clienteError } = await supabase.from('clientes').insert(order.cliente).select('id').single()
    if (clienteError) throw clienteError
    const { data: ramo, error: ramoError } = await supabase.from('ramos').insert(order.ramo).select('id').single()
    if (ramoError) throw ramoError
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .insert({ cliente_id: cliente.id, ramo_id: ramo.id, estado: 'recibido' })
      .select('id')
      .single()
    if (pedidoError) throw pedidoError

    const { error: personalizationError } = await supabase
      .from('personalizaciones')
      .insert({ ...order.personalizacion, pedido_id: pedido.id })
    if (personalizationError) throw personalizationError
    const { error: detailError } = await supabase
      .from('detalles_pedido')
      .insert({ ...order.detalle_pedido, pedido_id: pedido.id })
    if (detailError) throw detailError

    await loadOrders()
  }

  onMount(async () => {
    if (!supabaseConfigured) {
      loading = false
      errorMessage = 'Configura VITE_SUPABASE_ANON_KEY en un archivo .env para conectar Supabase.'
      return
    }
    const { data } = await supabase.auth.getSession()
    sessionEmail = data.session?.user.email || ''
    await loadOrders()
  })
</script>

<header class="site-header">
  <a class="brand" href="#pedidos">
    <img src={logo} alt="" />
    <strong>Roses Lolas</strong>
  </a>
  <nav aria-label="Navegación principal">
    <ul>
      <li><a href="#pedidos">Pedidos</a></li>
      <li><a href="#nuevo-pedido">Nuevo pedido</a></li>
      <li><a href="#sesion">Sesión</a></li>
    </ul>
  </nav>
</header>

<main>
  <div class="page-heading">
    <div>
      <p class="eyebrow">Panel de trabajo</p>
      <h1>Pedidos por preparar</h1>
    </div>
    <p>Listado conectado a Supabase con acceso al detalle de cada pedido.</p>
  </div>

  <section id="pedidos" aria-labelledby="titulo-hoy" data-glow class="spotlight-card">
    <h2 id="titulo-hoy">Pedidos registrados</h2>
    {#if loading}<p class="state-note">Cargando datos desde Supabase...</p>{/if}
    {#if errorMessage}<p class="error-message" role="alert">{errorMessage}</p>{/if}
    {#if !loading && !errorMessage && orders.length === 0}<p class="state-note">No hay pedidos registrados todavía.</p>{/if}
    {#if orders.length > 0}
      <div class="tabla-scroll">
        <table>
          <caption>Pedidos cargados desde la tabla pedidos</caption>
          <thead><tr><th>N.º</th><th>Ramo personalizado</th><th>Estado</th><th>Acción</th></tr></thead>
          <tbody>
            {#each orders as order}
              <tr>
                <th scope="row">{order.numero}</th>
                <td>{order.ramo?.tamano} · {order.ramo?.flores}<br /><small>{order.personalizacion?.ocasion} · {order.personalizacion?.colores}</small></td>
                <td><span class="status-badge">{order.estado}</span></td>
                <td><button class="link-button" type="button" on:click={() => showOrder(order)}>Ver detalle</button></td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </section>

  {#if selectedOrder}
    <section class="detail-card spotlight-card" aria-labelledby="detalle-titulo">
      <div class="section-heading">
        <div><p class="eyebrow">Registro seleccionado</p><h2 id="detalle-titulo">Detalle del pedido #{selectedOrder.numero}</h2></div>
        <button class="secondary-button" type="button" on:click={() => selectedOrder = null}>Cerrar detalle</button>
      </div>
      <div class="detail-grid">
        <p><strong>Cliente:</strong> {selectedOrder.cliente?.nombre} · {selectedOrder.cliente?.correo}</p>
        <p><strong>Ramo:</strong> {selectedOrder.ramo?.tamano}, {selectedOrder.ramo?.flores}, {selectedOrder.ramo?.follaje}</p>
        <p><strong>Personalización:</strong> {selectedOrder.personalizacion?.ocasion}; colores {selectedOrder.personalizacion?.colores}; {selectedOrder.personalizacion?.envoltura}</p>
        <p><strong>Dedicatoria:</strong> {selectedOrder.personalizacion?.dedicatoria || 'Sin dedicatoria'}</p>
        <p><strong>Detalles:</strong> {selectedOrder.detalle_pedido?.preferencias}</p>
        <p><strong>Observaciones:</strong> {selectedOrder.detalle_pedido?.observaciones}</p>
      </div>
    </section>
  {/if}

  <section id="sesion" class="auth-section spotlight-card" aria-labelledby="titulo-sesion">
    <div class="section-heading"><div><p class="eyebrow">Acceso</p><h2 id="titulo-sesion">Sesión de usuario</h2></div>{#if sessionEmail}<button class="secondary-button" type="button" on:click={signOut}>Cerrar sesión</button>{/if}</div>
    {#if sessionEmail}
      <p class="state-note">Sesión iniciada como <strong>{sessionEmail}</strong></p>
    {:else}
      <form class="auth-form" on:submit|preventDefault={signIn}>
        <label for="correo-sesion">Correo de prueba</label><input id="correo-sesion" type="email" bind:value={email} required />
        <label for="clave-sesion">Contraseña</label><input id="clave-sesion" type="password" bind:value={password} required />
        <button type="submit" disabled={submittingAuth}>{submittingAuth ? 'Ingresando...' : 'Iniciar sesión'}</button>
      </form>
    {/if}
    {#if authMessage}<p class="success-message" role="status">{authMessage}</p>{/if}
  </section>

  <Formulario {sessionEmail} onCreate={addOrder} />
</main>

<footer><p><strong>Roses Lolas</strong> · Datos administrados con Supabase</p></footer>
