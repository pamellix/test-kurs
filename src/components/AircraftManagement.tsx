'use client';

import { useState } from 'react';
import { useAircraft, useCreateAircraft, useUpdateAircraft, useDeleteAircraft, useAirlines, useAircraftModels } from '@/hooks/api';
import { Aircraft, AircraftCreateRequest } from '@/types';

interface AircraftFormData {
  registrationNumber: string;
  manufactureDate: string;
  aircraftId?: number;
}

export const AircraftManagement = () => {
  const { data: aircraft, isLoading, error } = useAircraft();
  const { data: airlines } = useAirlines();
  const { data: aircraftModels } = useAircraftModels();
  const createAircraftMutation = useCreateAircraft();
  const updateAircraftMutation = useUpdateAircraft();
  const deleteAircraftMutation = useDeleteAircraft();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAircraft, setEditingAircraft] = useState<Aircraft | null>(null);
  const [formData, setFormData] = useState<AircraftFormData>({
    registrationNumber: '',
    manufactureDate: '',
  });
  const [selectedAirline, setSelectedAirline] = useState<number | ''>('');
  const [selectedModel, setSelectedModel] = useState<number | ''>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const aircraftData: AircraftCreateRequest = {
        registrationNumber: formData.registrationNumber,
        manufactureDate: formData.manufactureDate,
        airlineId: selectedAirline ? Number(selectedAirline) : undefined,
        modelId: selectedModel ? Number(selectedModel) : undefined,
      };

      if (editingAircraft && editingAircraft.aircraftId) {
        await updateAircraftMutation.mutateAsync({ 
          id: editingAircraft.aircraftId, 
          aircraft: aircraftData 
        });
      } else {
        await createAircraftMutation.mutateAsync(aircraftData);
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving aircraft:', error);
    }
  };

  const resetForm = () => {
    setFormData({ registrationNumber: '', manufactureDate: '' });
    setSelectedAirline('');
    setSelectedModel('');
    setEditingAircraft(null);
    setIsFormOpen(false);
  };

  const handleEdit = (aircraftItem: Aircraft) => {
    setEditingAircraft(aircraftItem);
    setFormData({
      registrationNumber: aircraftItem.registrationNumber,
      manufactureDate: aircraftItem.manufactureDate,
      aircraftId: aircraftItem.aircraftId,
    });
    setSelectedAirline(aircraftItem.airline?.airlineId || '');
    setSelectedModel(aircraftItem.model?.modelId || '');
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number | undefined) => {
    if (!id) return;
    if (window.confirm('Вы уверены, что хотите удалить этот самолет?')) {
      try {
        await deleteAircraftMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting aircraft:', error);
      }
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
            <p className="mt-1 text-sm text-red-700">Не удалось загрузить список самолетов</p>
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
          <h2 className="text-2xl font-bold text-gray-900">Самолеты</h2>
          <p className="text-gray-600">Управление флотом самолетов</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
        >
          <span>➕</span>
          <span>Добавить самолет</span>
        </button>
      </div>

      {/* Aircraft Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(aircraft) && aircraft.map((aircraftItem) => (
          <div key={aircraftItem.aircraftId} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{aircraftItem.registrationNumber}</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="w-20 text-gray-500">Модель:</span>
                    <span>{aircraftItem.model?.name || 'Не указана'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-20 text-gray-500">Авиакомпания:</span>
                    <span>{aircraftItem.airline?.name || 'Не указана'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-20 text-gray-500">Дата производства:</span>
                    <span>{new Date(aircraftItem.manufactureDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="text-2xl">🛩️</div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleEdit(aircraftItem)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Редактировать
                </button>
                <button 
                  onClick={() => handleDelete(aircraftItem.aircraftId)}
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
                  {editingAircraft ? 'Редактировать самолет' : 'Добавить самолет'}
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
                    Регистрационный номер
                  </label>
                  <input
                    type="text"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, registrationNumber: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Дата производства
                  </label>
                  <input
                    type="date"
                    value={formData.manufactureDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, manufactureDate: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Авиакомпания
                  </label>
                  <select
                    value={selectedAirline}
                    onChange={(e) => setSelectedAirline(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Выберите авиакомпанию</option>
                    {Array.isArray(airlines) && airlines.map((airline) => (
                      <option key={airline.airlineId} value={airline.airlineId}>
                        {airline.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Модель самолета
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Выберите модель</option>
                    {Array.isArray(aircraftModels) && aircraftModels.map((model) => (
                      <option key={model.modelId} value={model.modelId}>
                        {model.name} ({model.manufacturer})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={createAircraftMutation.isPending || updateAircraftMutation.isPending}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {(createAircraftMutation.isPending || updateAircraftMutation.isPending) 
                      ? 'Сохранение...' 
                      : editingAircraft ? 'Обновить' : 'Создать'}
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