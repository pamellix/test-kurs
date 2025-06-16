'use client';

import { useState, useRef } from 'react';
import { useAircraft, useCreateAircraft, useUpdateAircraft, useDeleteAircraft } from '@/hooks/api';
import { useAirlines, useAircraftModels } from '@/hooks/api';
import { useTableState } from '@/hooks/useTableState';
import { TableControls } from './common/TableControls';
import { Aircraft } from '@/types';

export default function AircraftManagement() {
  const { data: aircraft, isLoading, error } = useAircraft();
  const { data: airlines } = useAirlines();
  const { data: aircraftModels } = useAircraftModels();
  const createMutation = useCreateAircraft();
  const updateMutation = useUpdateAircraft();
  const deleteMutation = useDeleteAircraft();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAircraft, setEditingAircraft] = useState<Aircraft | null>(null);

  const formRefs = {
    registrationNumber: useRef<HTMLInputElement>(null),
    manufactureDate: useRef<HTMLInputElement>(null),
    airline: useRef<HTMLSelectElement>(null),
    model: useRef<HTMLSelectElement>(null),
  };

  const tableState = useTableState({
    data: (aircraft || []) as unknown as Record<string, unknown>[],
    searchFields: ['registrationNumber', 'model.name', 'airline.name'],
    defaultSort: 'registrationNumber',
    defaultItemsPerPage: 12,
  });

  const resetForm = () => {
    Object.values(formRefs).forEach(ref => {
      if (ref.current) ref.current.value = '';
    });
    setEditingAircraft(null);
    setIsFormOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const registrationNumber = formRefs.registrationNumber.current?.value?.trim();
    const manufactureDate = formRefs.manufactureDate.current?.value;
    const airlineId = formRefs.airline.current?.value;
    const modelId = formRefs.model.current?.value;

    if (!registrationNumber || !manufactureDate || !airlineId || !modelId) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    try {
      const payload = {
        registrationNumber,
        manufactureDate,
        airline: { airlineId: parseInt(airlineId) },
        model: { modelId: parseInt(modelId) }
      };
      
      if (editingAircraft?.aircraftId) {
        await updateMutation.mutateAsync({ id: editingAircraft.aircraftId, aircraft: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving aircraft:', error);
      alert('Ошибка при сохранении. Проверьте, что все поля заполнены корректно.');
    }
  };

  const handleEdit = (aircraft: Aircraft) => {
    setEditingAircraft(aircraft);
    setTimeout(() => {
      if (formRefs.registrationNumber.current) formRefs.registrationNumber.current.value = aircraft.registrationNumber;
      if (formRefs.manufactureDate.current) formRefs.manufactureDate.current.value = aircraft.manufactureDate ? aircraft.manufactureDate.split('T')[0] : '';
      if (formRefs.airline.current) formRefs.airline.current.value = aircraft.airline?.airlineId?.toString() || '';
      if (formRefs.model.current) formRefs.model.current.value = aircraft.model?.modelId?.toString() || '';
    }, 0);
    setIsFormOpen(true);
  };

  const handleDelete = async (aircraftId: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот самолет?')) {
      try {
        await deleteMutation.mutateAsync(aircraftId);
      } catch (error) {
        console.error('Error deleting aircraft:', error);
      }
    }
  };

  if (isLoading) return <div className="text-center py-8">Загрузка...</div>;
  if (error) return <div className="text-center py-8 text-red-600">Ошибка загрузки самолетов</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Управление самолетами</h1>
          <p className="text-gray-600">Добавляйте, редактируйте и удаляйте самолеты</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
        >
          <span>+</span>
          <span>Добавить</span>
        </button>
      </div>

      <TableControls
        searchPlaceholder="Поиск самолетов..."
        onSearchChange={tableState.setSearchTerm}
        sortOptions={[
          { value: 'registrationNumber', label: 'По номеру' },
          { value: 'manufactureDate', label: 'По дате производства' },
        ]}
        onSortChange={tableState.setSortBy}
        currentPage={tableState.currentPage}
        totalPages={tableState.totalPages}
        onPageChange={tableState.setCurrentPage}
        itemsPerPage={tableState.itemsPerPage}
        totalItems={tableState.paginatedData.length}
        onItemsPerPageChange={tableState.setItemsPerPage}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tableState.paginatedData.map((aircraftData, index) => {
          const aircraftItem = aircraftData as unknown as Aircraft;
          return (
            <div key={aircraftItem.aircraftId || index} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{aircraftItem.registrationNumber}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="w-20 text-gray-500">Модель:</span>
                      <span>{aircraftItem.model?.name || 'Не указано'}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-20 text-gray-500">Авиакомпания:</span>
                      <span>{aircraftItem.airline?.name || 'Не указано'}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-20 text-gray-500">Дата производства:</span>
                      <span>{aircraftItem.manufactureDate ? new Date(aircraftItem.manufactureDate).toLocaleDateString() : 'Не указано'}</span>
                    </div>
                  </div>
                </div>
                <div className="text-2xl">✈️</div>
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
                    onClick={() => aircraftItem.aircraftId && handleDelete(aircraftItem.aircraftId)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        
        {tableState.paginatedData.length === 0 && tableState.searchTerm && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">Ничего не найдено по запросу &quot;{tableState.searchTerm}&quot;</p>
          </div>
        )}
        
        {tableState.paginatedData.length === 0 && !tableState.searchTerm && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">Пока нет данных</p>
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingAircraft ? 'Редактировать самолет' : 'Добавить самолет'}
                </h3>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">❌</button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Регистрационный номер</label>
                  <input
                    type="text"
                    ref={formRefs.registrationNumber}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Дата производства</label>
                  <input
                    type="date"
                    ref={formRefs.manufactureDate}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Авиакомпания</label>
                  <select
                    ref={formRefs.airline}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Выберите авиакомпанию</option>
                    {airlines?.map((airline) => (
                      <option key={airline.airlineId} value={airline.airlineId}>
                        {airline.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Модель</label>
                  <select
                    ref={formRefs.model}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Выберите модель</option>
                    {aircraftModels?.map((model) => (
                      <option key={model.modelId} value={model.modelId}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {(createMutation.isPending || updateMutation.isPending) 
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
}