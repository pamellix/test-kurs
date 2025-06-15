'use client';

import { useState } from 'react';
import { AirlinesManagement } from '@/components/AirlinesManagement';
import { AircraftManagement } from '@/components/AircraftManagement';
import { AircraftModelsManagement } from '@/components/AircraftModelsManagement';
import { AirportsManagement } from '@/components/AirportsManagement';
import { FlightsManagement } from '@/components/FlightsManagement';
import { CrewMembersManagement } from '@/components/CrewMembersManagement';
import { CrewAssignmentsManagement } from '@/components/CrewAssignmentsManagement';
import { TicketsManagement } from '@/components/TicketsManagement';
import { ComplexQueries } from '@/components/ComplexQueries';

type TabType = 'airlines' | 'aircraft' | 'models' | 'airports' | 'flights' | 'crew' | 'assignments' | 'tickets' | 'queries';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('airlines');

  const tabs = [
    { id: 'airlines' as TabType, label: 'Авиакомпании', icon: '✈️' },
    { id: 'aircraft' as TabType, label: 'Самолеты', icon: '🛩️' },
    { id: 'models' as TabType, label: 'Модели', icon: '🏭' },
    { id: 'airports' as TabType, label: 'Аэропорты', icon: '🏢' },
    { id: 'flights' as TabType, label: 'Рейсы', icon: '🛫' },
    { id: 'crew' as TabType, label: 'Экипаж', icon: '👨‍✈️' },
    { id: 'assignments' as TabType, label: 'Назначения', icon: '📋' },
    { id: 'tickets' as TabType, label: 'Билеты', icon: '🎫' },
    { id: 'queries' as TabType, label: 'SQL Запросы', icon: '📊' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'airlines':
        return <AirlinesManagement />;
      case 'aircraft':
        return <AircraftManagement />;
      case 'models':
        return <AircraftModelsManagement />;
      case 'airports':
        return <AirportsManagement />;
      case 'flights':
        return <FlightsManagement />;
      case 'crew':
        return <CrewMembersManagement />;
      case 'assignments':
        return <CrewAssignmentsManagement />;
      case 'tickets':
        return <TicketsManagement />;
      case 'queries':
        return <ComplexQueries />;
      default:
        return <AirlinesManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="text-3xl">✈️</div>
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-gray-900">Air Manager</h1>
                <p className="text-sm text-gray-500">Система управления авиакомпанией</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                API: <span className="text-green-600 font-mono">localhost:8080</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {renderContent()}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              © 2025 Air Manager. Система управления авиакомпанией.
            </div>
            <div className="text-sm text-gray-500">
              Backend: Java Spring Boot | Frontend: Next.js + TypeScript
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
