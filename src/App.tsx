import { Clock } from './components/ui/Clock';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Village Free School Admin Portal</h1>

        <div className="mb-6">
          <p className="text-gray-600 mb-2">
            Welcome to the Village Free School Admin Portal. This is a simple React application.
          </p>
          <p className="text-gray-600">Current time:</p>
          <Clock />
        </div>

        <div className="text-sm text-gray-500">Built with React, TypeScript, and TailwindCSS</div>
      </div>
    </div>
  );
}

export default App;
