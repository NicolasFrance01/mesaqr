import { Sidebar } from '@/components/dashboard/Sidebar';
import { NotificationsPanel } from '@/components/dashboard/NotificationsPanel';
import { LayoutDashboard, UtensilsCrossed, ClipboardList, LogOut, ChefHat } from 'lucide-react';
import { ThemeToggle } from '@/components/dashboard/ThemeToggle';

const menuItems = [
    { icon: LayoutDashboard, label: 'Resumen', href: '/dashboard' },
    { icon: UtensilsCrossed, label: 'Mesas', href: '/dashboard/mesas' },
    { icon: ClipboardList, label: 'Pedidos', href: '/dashboard/pedidos' },
    { icon: ChefHat, label: 'Cocina', href: '/dashboard/cocina' },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-white dark:bg-neutral-900 transition-colors duration-300">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8 flex flex-col justify-between relative" style={{ zoom: 0.8 }}>
                <div className="absolute top-4 right-8 z-50">
                    <ThemeToggle />
                </div>
                <div className="mx-auto max-w-7xl w-full">
                    <NotificationsPanel />
                    {children}
                </div>
                <footer className="mt-12 w-full border-t border-slate-200 py-6 text-center text-xs text-slate-400 dark:border-neutral-800">
                    <p>© Nicolas France 2026 — Sistema de gestión de mesas y pagos</p>
                    <p className="mt-1 font-mono opacity-50">Versión 1.0.0</p>
                </footer>
            </main>
        </div>
    );
}
