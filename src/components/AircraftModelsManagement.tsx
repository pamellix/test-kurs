'use client';

import { useState } from 'react';
import { useAircraftModels, useCreateAircraftModel, useAircraftClasses } from '@/hooks/api';
import { AircraftModelCreateRequest } from '@/types';

interface AircraftModelFormData {
  name: string;
  manufacturer: string;
  crewSize: number;
  passengerCapacity: number;
  operationalCost: number;
  fuelConsumption: number;
}

export const AircraftModelsManagement = () => {
  const { data: aircraftModels, isLoading, error } = useAircraftModels();
  const { data: aircraftClasses } = useAircraftClasses();
  const createAircraftModelMutation = useCreateAircraftModel();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<AircraftModelFormData>({
    name: '',
    manufacturer: '',
    crewSize: 0,
    passengerCapacity: 0,
    operationalCost: 0,
    fuelConsumption: 0,
  });
  const [selectedClass, setSelectedClass] = useState<number | ''>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !formData.name || !formData.manufacturer || 
        !formData.crewSize || !formData.passengerCapacity || 
        !formData.operationalCost || !formData.fuelConsumption) {
      alert('Пожалуйста, заполните все обязательные поля: класс, название, производитель, размер экипажа, вместимость, стоимость эксплуатации и расход топлива');
      return;
    }

    try {
      const modelData: AircraftModelCreateRequest = {
        name: formData.name,
        manufacturer: formData.manufacturer,
        crewSize: formData.crewSize,
        passengerCapacity: formData.passengerCapacity,
        operationalCost: formData.operationalCost,
        fuelConsumption: formData.fuelConsumption,
        classId: Number(selectedClass),
      };

      await createAircraftModelMutation.mutateAsync(modelData);
      resetForm();
    } catch (error) {
      console.error('Error creating aircraft model:', error);
      alert('Ошибка при создании модели самолета. Проверьте, что все поля заполнены корректно и выбранный класс существует.');
    }
  };

  const resetForm = () => {
    setFormData({ 
      name: '', 
      manufacturer: '', 
      crewSize: 0, 
      passengerCapacity: 0, 
      operationalCost: 0, 
      fuelConsumption: 0 
    });
    setSelectedClass('');
    setIsFormOpen(false);
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
            <p className="mt-1 text-sm text-red-700">Не удалось загрузить список моделей самолетов</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Модели самолетов</h2>
          <p className="text-gray-600">Управление моделями самолетов</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
        >
          <span>➕</span>
          <span>Добавить модель</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(aircraftModels) && aircraftModels.map((model) => (
          <div key={model.modelId} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{model.name}</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="w-24 text-gray-500">Производитель:</span>
                    <span>{model.manufacturer}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24 text-gray-500">Класс:</span>
                    <span>{model.aircraftClass?.name || 'Не указан'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24 text-gray-500">Экипаж:</span>
                    <span>{model.crewSize} чел.</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24 text-gray-500">Пассажиры:</span>
                    <span>{model.passengerCapacity} чел.</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24 text-gray-500">Расход топлива:</span>
                    <span>{model.fuelConsumption} л/час</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24 text-gray-500">Эксплуатация:</span>
                    <span>${model.operationalCost}/час</span>
                  </div>
                </div>
              </div>
              <div className="text-2xl">🛩️</div>
            </div>
          </div>
        ))}
        
        {(!Array.isArray(aircraftModels) || aircraftModels.length === 0) && (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🛩️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Нет моделей самолетов</h3>
            <p className="text-gray-500 mb-4">Начните с добавления первой модели</p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Добавить модель
            </button>
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Добавить модель самолета</h3>
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
                    Название модели
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
                    Производитель
                  </label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Класс самолета
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Выберите класс</option>
                    {Array.isArray(aircraftClasses) && aircraftClasses.map((cls) => (
                      <option key={cls.classId} value={cls.classId}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Размер экипажа
                  </label>
                  <input
                    type="number"
                    name="crewSize"
                    value={formData.crewSize}
                    onChange={handleInputChange}
                    min="1"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Пассажировместимость
                  </label>
                  <input
                    type="number"
                    name="passengerCapacity"
                    value={formData.passengerCapacity}
                    onChange={handleInputChange}
                    min="1"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Операционные расходы ($/час)
                  </label>
                  <input
                    type="number"
                    name="operationalCost"
                    value={formData.operationalCost}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Расход топлива (л/час)
                  </label>
                  <input
                    type="number"
                    name="fuelConsumption"
                    value={formData.fuelConsumption}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={createAircraftModelMutation.isPending}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createAircraftModelMutation.isPending ? 'Создание...' : 'Создать'}
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
