'use client';

import { useState } from 'react';
import { useAirlines, useCreateAirline, useUpdateAirline, useDeleteAirline } from '@/hooks/api';
import { Airline } from '@/types';

interface AirlineFormData {
  name: string;
  country: string;
  contactEmail: string;
  contactPhone: string;
}

export const AirlinesManagement = () => {
  const { data: airlines, isLoading, error } = useAirlines();
  const createAirlineMutation = useCreateAirline();
  const updateAirlineMutation = useUpdateAirline();
  const deleteAirlineMutation = useDeleteAirline();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAirline, setEditingAirline] = useState<Airline | null>(null);
  const [formData, setFormData] = useState<AirlineFormData>({
    name: '',
    country: '',
    contactEmail: '',
    contactPhone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAirline && editingAirline.airlineId) {
        await updateAirlineMutation.mutateAsync({ 
          id: editingAirline.airlineId, 
          airline: formData 
        });
      } else {
        await createAirlineMutation.mutateAsync(formData);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving airline:', error);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', country: '', contactEmail: '', contactPhone: '' });
    setEditingAirline(null);
    setIsFormOpen(false);
  };

  const handleEdit = (airline: Airline) => {
    setEditingAirline(airline);
    setFormData({
      name: airline.name,
      country: airline.country,
      contactEmail: airline.contactEmail,
      contactPhone: airline.contactPhone,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number | undefined) => {
    if (!id) return;
    if (window.confirm('Вы уверены, что хотите удалить эту авиакомпанию?')) {
      try {
        await deleteAirlineMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting airline:', error);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
            <p className="mt-1 text-sm text-red-700">Не удалось загрузить список авиакомпаний</p>
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
          <h2 className="text-2xl font-bold text-gray-900">Авиакомпании</h2>
          <p className="text-gray-600">Управление авиакомпаниями</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
        >
          <span>➕</span>
          <span>Добавить авиакомпанию</span>
        </button>
      </div>

      {/* Airlines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(airlines) && airlines.map((airline) => (
          <div key={airline.airlineId} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{airline.name}</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="w-16 text-gray-500">Страна:</span>
                    <span>{airline.country}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-16 text-gray-500">Email:</span>
                    <span className="truncate">{airline.contactEmail}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-16 text-gray-500">Телефон:</span>
                    <span>{airline.contactPhone}</span>
                  </div>
                </div>
              </div>
              <div className="text-2xl">✈️</div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleEdit(airline)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Редактировать
                </button>
                <button 
                  onClick={() => handleDelete(airline.airlineId)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {/* Empty state */}
        {(!Array.isArray(airlines) || airlines.length === 0) && (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">✈️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Нет авиакомпаний</h3>
            <p className="text-gray-500 mb-4">Начните с добавления первой авиакомпании</p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Добавить авиакомпанию
            </button>
          </div>
        )}
      </div>

      {/* Add Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingAirline ? 'Редактировать авиакомпанию' : 'Добавить авиакомпанию'}
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
                    Email
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={createAirlineMutation.isPending || updateAirlineMutation.isPending}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {(createAirlineMutation.isPending || updateAirlineMutation.isPending) 
                      ? 'Сохранение...' 
                      : editingAirline ? 'Обновить' : 'Создать'}
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