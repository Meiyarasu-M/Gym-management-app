import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';

// Placeholder Components
const HomeView = () => <h1 className="text-3xl font-bold">Welcome to Iron Gym Management</h1>;
const DashboardView = () => <h1 className="text-3xl font-bold">System Overview</h1>;
const MembersView = () => <h1 className="text-3xl font-bold">Member Directory</h1>;

function App() {
  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-10 bg-slate-50 min-h-screen">
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/dashboard" element={<DashboardView />} />
            <Route path="/members" element={<MembersView />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;