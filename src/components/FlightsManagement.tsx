'use client';

import { useState } from 'react';
import { useFlights, useCreateFlight, useUpdateFlight, useDeleteFlight, useAircraft, useAirports } from '@/hooks/api';
import { Flight, FlightCreateRequest } from '@/types';

interface FlightFormData {
  departureTime: string;
  arrivalTime: string;
  flightHours: number;
  ticketPrice: number;
}

export const FlightsManagement = () => {
  const { data: flights, isLoading, error } = useFlights();
  const { data: aircraft } = useAircraft();
  const { data: airports } = useAirports();
  const createFlightMutation = useCreateFlight();
  const updateFlightMutation = useUpdateFlight();
  const deleteFlightMutation = useDeleteFlight();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);
  const [formData, setFormData] = useState<FlightFormData>({
    departureTime: '',
    arrivalTime: '',
    flightHours: 0,
    ticketPrice: 0,
  });
  const [selectedAircraft, setSelectedAircraft] = useState<number | ''>('');
  const [selectedDepartureAirport, setSelectedDepartureAirport] = useState<number | ''>('');
  const [selectedArrivalAirport, setSelectedArrivalAirport] = useState<number | ''>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAircraft || !selectedDepartureAirport || !selectedArrivalAirport || 
        !formData.departureTime || !formData.arrivalTime || !formData.flightHours || !formData.ticketPrice) {
      alert('Пожалуйста, заполните все обязательные поля: самолет, аэропорты вылета и прилета, время вылета и прилета, длительность полета и цена билета');
      return;
    }

    try {
      const flightData: FlightCreateRequest = {
        departureTime: formData.departureTime,
        arrivalTime: formData.arrivalTime,
        flightHours: formData.flightHours,
        ticketPrice: formData.ticketPrice,
        aircraftId: Number(selectedAircraft),
        departureAirportId: Number(selectedDepartureAirport),
        arrivalAirportId: Number(selectedArrivalAirport),
      };

      if (editingFlight && editingFlight.flightId) {
        await updateFlightMutation.mutateAsync({ 
          id: editingFlight.flightId, 
          flight: flightData 
        });
      } else {
        await createFlightMutation.mutateAsync(flightData);
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving flight:', error);
      alert('Ошибка при сохранении рейса. Проверьте, что все поля заполнены корректно и выбранные самолет и аэропорты существуют.');
    }
  };

  const resetForm = () => {
    setFormData({ departureTime: '', arrivalTime: '', flightHours: 0, ticketPrice: 0 });
    setSelectedAircraft('');
    setSelectedDepartureAirport('');
    setSelectedArrivalAirport('');
    setEditingFlight(null);
    setIsFormOpen(false);
  };

  const handleEdit = (flight: Flight) => {
    setEditingFlight(flight);
    setFormData({
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      flightHours: flight.flightHours,
      ticketPrice: flight.ticketPrice,
    });
    setSelectedAircraft(flight.aircraft?.aircraftId || '');
    setSelectedDepartureAirport(flight.departureAirport?.airportId || '');
    setSelectedArrivalAirport(flight.arrivalAirport?.airportId || '');
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number | undefined) => {
    if (!id) return;
    if (window.confirm('Вы уверены, что хотите удалить этот рейс?')) {
      try {
        await deleteFlightMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting flight:', error);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'number' ? Number(value) : value 
    }));
  };

  const formatDateTime = (dateTime: string) => {
    try {
      return new Date(dateTime).toLocaleString();
    } catch {
      return dateTime;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="text-red-400">❌</div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Ошибка загрузки</h3>
            <p className="mt-1 text-sm text-red-700">Не удалось загрузить список рейсов</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Рейсы</h2>
          <p className="text-gray-600">Управление рейсами</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
        >
          <span>➕</span>
          <span>Добавить рейс</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.isArray(flights) && flights.map((flight) => (
          <div key={flight.flightId} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Рейс #{flight.flightId}
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>
                    <span className="text-gray-500">Вылет:</span>
                    <div className="font-medium">{formatDateTime(flight.departureTime)}</div>
                    <div className="text-xs">{flight.departureAirport?.name || 'Не указан'}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Прилет:</span>
                    <div className="font-medium">{formatDateTime(flight.arrivalTime)}</div>
                    <div className="text-xs">{flight.arrivalAirport?.name || 'Не указан'}</div>
                  </div>
                  <div className="flex justify-between">
                    <span>
                      <span className="text-gray-500">Время полета:</span>
                      <div className="font-medium">{flight.flightHours}ч</div>
                    </span>
                    <span>
                      <span className="text-gray-500">Цена билета:</span>
                      <div className="font-medium text-green-600">${flight.ticketPrice}</div>
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-2xl">🛫</div>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <div className="text-xs text-gray-500 mb-2">
                Самолет: {flight.aircraft?.registrationNumber || 'Не назначен'}
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleEdit(flight)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Редактировать
                </button>
                <button 
                  onClick={() => handleDelete(flight.flightId)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingFlight ? 'Редактировать рейс' : 'Добавить рейс'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ❌
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Время вылета
                  </label>
                  <input
                    type="datetime-local"
                    name="departureTime"
                    value={formData.departureTime}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Время прилета
                  </label>
                  <input
                    type="datetime-local"
                    name="arrivalTime"
                    value={formData.arrivalTime}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Время полета (часы)
                  </label>
                  <input
                    type="number"
                    name="flightHours"
                    value={formData.flightHours}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Цена билета
                  </label>
                  <input
                    type="number"
                    name="ticketPrice"
                    value={formData.ticketPrice}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Самолет
                  </label>
                  <select
                    value={selectedAircraft}
                    onChange={(e) => setSelectedAircraft(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Выберите самолет</option>
                    {Array.isArray(aircraft) && aircraft.map((aircraftItem) => (
                      <option key={aircraftItem.aircraftId} value={aircraftItem.aircraftId}>
                        {aircraftItem.registrationNumber} ({aircraftItem.model?.name})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Аэропорт вылета
                  </label>
                  <select
                    value={selectedDepartureAirport}
                    onChange={(e) => setSelectedDepartureAirport(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Выберите аэропорт</option>
                    {Array.isArray(airports) && airports.map((airport) => (
                      <option key={airport.airportId} value={airport.airportId}>
                        {airport.name} ({airport.city})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Аэропорт прилета
                  </label>
                  <select
                    value={selectedArrivalAirport}
                    onChange={(e) => setSelectedArrivalAirport(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Выберите аэропорт</option>
                    {Array.isArray(airports) && airports.map((airport) => (
                      <option key={airport.airportId} value={airport.airportId}>
                        {airport.name} ({airport.city})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={createFlightMutation.isPending || updateFlightMutation.isPending}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {(createFlightMutation.isPending || updateFlightMutation.isPending) 
                      ? 'Сохранение...' 
                      : editingFlight ? 'Обновить' : 'Создать'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md"
                  >
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};