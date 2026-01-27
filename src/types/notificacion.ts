export interface Notificacion {
    id: string;
    tipo: 'order' | 'waiter' | 'payment' | 'review' | 'kitchen';
    mensaje: string;
    mesaId: string;
    leido: boolean;
    timestamp: Date;
}
