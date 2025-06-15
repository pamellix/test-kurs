'use client';

import { useState } from 'react';
import { useAirports, useCreateAirport, useUpdateAirport, useDeleteAirport } from '@/hooks/api';
import { Airport } from '@/types';

interface AirportFormData {
  name: string;
  city: string;
  country: string;
  serviceCost: number;
  parkingCost: number;
}

export const AirportsManagement = () => {
  const { data: airports, isLoading, error } = useAirports();
  const createAirportMutation = useCreateAirport();
  const updateAirportMutation = useUpdateAirport();
  const deleteAirportMutation = useDeleteAirport();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAirport, setEditingAirport] = useState<Airport | null>(null);
  const [formData, setFormData] = useState<AirportFormData>({
    name: '',
    city: '',
    country: '',
    serviceCost: 0,
    parkingCost: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAirport && editingAirport.airportId) {
        await updateAirportMutation.mutateAsync({ 
          id: editingAirport.airportId, 
          airport: formData 
        });
      } else {
        await createAirportMutation.mutateAsync(formData);
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving airport:', error);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', city: '', country: '', serviceCost: 0, parkingCost: 0 });
    setEditingAirport(null);
    setIsFormOpen(false);
  };

  const handleEdit = (airport: Airport) => {
    setEditingAirport(airport);
    setFormData({
      name: airport.name,
      city: airport.city,
      country: airport.country,
      serviceCost: airport.serviceCost,
      parkingCost: airport.parkingCost,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number | undefined) => {
    if (!id) return;
    if (window.confirm('Вы уверены, что хотите удалить этот аэропорт?')) {
      try {
        await deleteAirportMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting airport:', error);
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
            <p className="mt-1 text-sm text-red-700">Не удалось загрузить список аэропортов</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Аэропорты</h2>
          <p className="text-gray-600">Управление аэропортами</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
        >
          <span>➕</span>
          <span>Добавить аэропорт</span>
        </button>
      </div>

      {/* Airports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(airports) && airports.map((airport) => (
          <div key={airport.airportId} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{airport.name}</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="w-20 text-gray-500">Город:</span>
                    <span>{airport.city}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-20 text-gray-500">Страна:</span>
                    <span>{airport.country}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-20 text-gray-500">Сервис:</span>
                    <span>${airport.serviceCost}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-20 text-gray-500">Парковка:</span>
                    <span>${airport.parkingCost}</span>
                  </div>
                </div>
              </div>
              <div className="text-2xl">🏢</div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleEdit(airport)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Редактировать
                </button>
                <button 
                  onClick={() => handleDelete(airport.airportId)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingAirport ? 'Редактировать аэропорт' : 'Добавить аэропорт'}
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
                    Название
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Город
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Страна
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Стоимость сервиса
                  </label>
                  <input
                    type="number"
                    name="serviceCost"
                    value={formData.serviceCost}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Стоимость парковки
                  </label>
                  <input
                    type="number"
                    name="parkingCost"
                    value={formData.parkingCost}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={createAirportMutation.isPending || updateAirportMutation.isPending}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {(createAirportMutation.isPending || updateAirportMutation.isPending) 
                      ? 'Сохранение...' 
                      : editingAirport ? 'Обновить' : 'Создать'}
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