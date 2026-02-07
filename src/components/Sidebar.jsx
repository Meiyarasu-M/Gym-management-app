import { User, LayoutDashboard, CreditCard, Settings, Home } from 'lucide-react';

const Sidebar = () => {
    
    const menuItems = [

        { name: 'Home', icon: <Home size={20} />, path: '/' },
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
        { name: 'Members', icon: <User size={20} />, path: '/members' },
        { name: 'Payments', icon: <CreditCard size={20} />, path: '/payments' },
        { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
        
    ];

    return (
        <div className="h-screen w-64 bg-slate-900 text-white p-5 fixed left-0 top-0">
            <h1 className="text-2xl fornt-bold mb-10 text-blue-500 tracking-tight">OLD SCHOOL GYM</h1>
            <nav>
                <ul>
                    {menuItems.map((item) => (
                        <li
                            key={item.name}
                            className="flex item-center gap-3 p-3 hopver:bg-slate-800 rounded-lg cursor-pointer mb-2 trasition-colors">
                            
                            {item.icon}
                            <span className="font-medium">{item.name}</span>
                            </li>
                    ) )}
                </ul>
            </nav>
        </div>
        
    )

}

export default Sidebar;