export type EstadoPedido = 'recibido' | 'confirmado' | 'en_preparacion' | 'listo'

export interface Cliente {
  id: string
  nombre: string
  telefono: string
  correo: string
  creado_en: string
}

export interface Ramo {
  id: string
  tamano: string
  flores: string
  follaje: string
  extras: string
  creado_en: string
}

export interface Personalizacion {
  id: string
  pedido_id: string
  ocasion: string
  colores: string
  envoltura: string
  dedicatoria: string
  creado_en: string
}

export interface DetallePedido {
  id: string
  pedido_id: string
  preferencias: string
  observaciones: string
  instrucciones_armado: string
  creado_en: string
}

export interface Pedido {
  id: string
  numero: number
  cliente_id: string
  ramo_id: string
  estado: EstadoPedido
  creado_en: string
  cliente?: Cliente
  ramo?: Ramo
  personalizacion?: Personalizacion
  detalle_pedido?: DetallePedido
}
