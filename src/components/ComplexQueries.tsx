'use client';

import { useState } from 'react';
import { 
  useFlightsWithAircraftInfo, 
  useCrewWithFlightInfo, 
  useAirlineAircraftStats, 
  useAirportLoadDetails, 
  useTicketDetailsWithPassengers 
} from '@/hooks/api';
import { QueryModal } from './QueryModal';

interface ComplexQueryResult {
  [key: string]: unknown;
  airline_id?: number;
  airline_name?: string;
  airport_id?: number;
  airport_name?: string;
  city?: string;
}

export type QueryType = 'flights' | 'crew' | 'airlines' | 'airports' | 'tickets';

interface FilterState {
  startDate: string;
  endDate: string;
  airlineId: string;
  airportId: string;
}

export const ComplexQueries = () => {
  const [activeQuery, setActiveQuery] = useState<QueryType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    startDate: '',
    endDate: '',
    airlineId: '',
    airportId: '',
  });

  const flightsQuery = useFlightsWithAircraftInfo({
    startDate: filters.startDate,
    endDate: filters.endDate,
  });
  const crewQuery = useCrewWithFlightInfo({
    airlineId: filters.airlineId ? Number(filters.airlineId) : undefined,
  });
  const airlinesQuery = useAirlineAircraftStats();
  const airportsQuery = useAirportLoadDetails({
    airportId: filters.airportId ? Number(filters.airportId) : undefined,
  });
  const ticketsQuery = useTicketDetailsWithPassengers();

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const queries = [
    {
      id: 'flights' as QueryType,
      title: 'Рейсы с информацией о самолетах',
      description: 'Детальная информация о рейсах с данными о самолетах и авиакомпаниях',
      icon: '🛫',
      hook: flightsQuery,
      color: 'bg-blue-500',
      filters: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Дата начала
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Дата окончания
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      ),
    },
    {
      id: 'crew' as QueryType,
      title: 'Экипажи и рейсы',
      description: 'Информация об экипажах с привязкой к рейсам и самолетам',
      icon: '👨‍✈️',
      hook: crewQuery,
      color: 'bg-green-500',
      filters: (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Авиакомпания
          </label>
          <select
            name="airlineId"
            value={filters.airlineId}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Все авиакомпании</option>
            {airlinesQuery.data?.map((airline: ComplexQueryResult) => (
              <option 
                key={airline.airline_id} 
                value={airline.airline_id}
              >
                {airline.airline_name}
              </option>
            ))}
          </select>
        </div>
      ),
    },
    {
      id: 'airlines' as QueryType,
      title: 'Статистика авиакомпаний',
      description: 'Статистика по авиакомпаниям: количество самолетов, рейсов, средняя цена билетов',
      icon: '✈️',
      hook: airlinesQuery,
      color: 'bg-purple-500',
    },
    {
      id: 'airports' as QueryType,
      title: 'Загруженность аэропортов',
      description: 'Детальная информация о загруженности аэропортов и обслуживаемых авиакомпаниях',
      icon: '🏢',
      hook: airportsQuery,
      color: 'bg-orange-500',
      filters: (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Аэропорт
          </label>
          <select
            name="airportId"
            value={filters.airportId}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Все аэропорты</option>
            {airportsQuery.data?.map((airport: ComplexQueryResult) => (
              <option 
                key={airport.airport_id} 
                value={airport.airport_id}
              >
                {airport.airport_name} ({airport.city})
              </option>
            ))}
          </select>
        </div>
      ),
    },
    {
      id: 'tickets' as QueryType,
      title: 'Билеты и пассажиры',
      description: 'Информация о билетах и пассажирах с деталями рейсов',
      icon: '🎫',
      hook: ticketsQuery,
      color: 'bg-red-500',
    },
  ];

  const executeQuery = (queryType: QueryType) => {
    setActiveQuery(queryType);
    if (queryType === 'flights' || queryType === 'crew' || queryType === 'airports') {
      setIsModalOpen(true);
    } else {
      const query = queries.find(q => q.id === queryType);
      if (query) {
        query.hook.refetch();
      }
    }
  };

  const handleModalSubmit = (params: Record<string, string>) => {
    setFilters(prev => ({ ...prev, ...params }));
    const query = queries.find(q => q.id === activeQuery);
    if (query) {
      query.hook.refetch();
    }
  };

  const renderQueryResults = () => {
    if (!activeQuery) return null;

    const currentQuery = queries.find(q => q.id === activeQuery);
    if (!currentQuery) return null;

    const { data, isLoading, error } = currentQuery.hook;

    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="text-red-400">❌</div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Ошибка выполнения запроса</h3>
              <p className="mt-1 text-sm text-red-700">Не удалось выполнить SQL запрос</p>
            </div>
          </div>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">📊</div>
          <p className="text-gray-500">Нет данных для отображения</p>
        </div>
      );
    }

    const columns = Object.keys(data[0]);

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <span className="text-2xl mr-2">{currentQuery.icon}</span>
            {currentQuery.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{currentQuery.description}</p>
          <p className="text-xs text-gray-500 mt-1">Найдено записей: {data.length}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th 
                    key={column} 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.slice(0, 50).map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCellValue(row[column])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {data.length > 50 && (
            <div className="px-6 py-3 bg-gray-50 text-center text-sm text-gray-500">
              Показано первые 50 записей из {data.length}
            </div>
          )}
        </div>
      </div>
    );
  };

  const formatCellValue = (value: unknown): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'number') return value.toLocaleString();
    if (typeof value === 'string' && value.includes('T')) {
      // Попытка форматирования даты
      try {
        return new Date(value).toLocaleString();
      } catch {
        return value;
      }
    }
    return String(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Сложные SQL Запросы</h2>
        <p className="text-gray-600">Выполнение комплексных запросов с INNER JOIN к базе данных</p>
      </div>

      {/* Query Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {queries.map((query) => (
          <button
            key={query.id}
            onClick={() => executeQuery(query.id)}
            className={`${query.color} hover:opacity-90 text-white p-6 rounded-lg shadow-md transition-all transform hover:scale-105 text-left`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">{query.icon}</span>
              <div className="text-xs bg-white/20 px-2 py-1 rounded">
                SQL
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">{query.title}</h3>
            <p className="text-sm opacity-90">{query.description}</p>
            <div className="mt-4 flex items-center text-sm">
              <span>▶️</span>
              <span className="ml-2">Выполнить запрос</span>
            </div>
          </button>
        ))}
      </div>

      {/* Query Results */}
      <div className="mt-8">
        {renderQueryResults()}
      </div>

      {/* SQL Query Info */}
      {activeQuery && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-3">ℹ️ Информация о запросе</h4>
          <div className="text-sm text-gray-700 space-y-2">
            <p><strong>Тип:</strong> SELECT с INNER JOIN</p>
            <p><strong>Таблицы:</strong> {getQueryTables(activeQuery)}</p>
            <p><strong>Описание:</strong> {queries.find(q => q.id === activeQuery)?.description}</p>
          </div>
        </div>
      )}

      {/* Modal */}
      {activeQuery && (
        <QueryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
          queryType={activeQuery}
        />
      )}
    </div>
  );

  function getQueryTables(queryType: QueryType): string {
    switch (queryType) {
      case 'flights':
        return 'flight, aircraft, aircraft_model, airlines, airport';
      case 'crew':
        return 'crew_member, crew_assignment, flight, aircraft, airlines, airport';
      case 'airlines':
        return 'airlines, aircraft, aircraft_model, flight';
      case 'airports':
        return 'airport, flight, aircraft';
      case 'tickets':
        return 'ticket, flight, aircraft, aircraft_model, airlines, airport';
      default:
        return '';
    }
  }
};