'use client';

import { useState, useRef } from 'react';
import { useAirlines, useCreateAirline, useUpdateAirline, useDeleteAirline } from '@/hooks/api';
import { useTableState } from '@/hooks/useTableState';
import { TableControls } from './common/TableControls';
import { Airline } from '@/types';

export default function AirlinesManagement() {
  const { data: airlines, isLoading, error } = useAirlines();
  const createMutation = useCreateAirline();
  const updateMutation = useUpdateAirline();
  const deleteMutation = useDeleteAirline();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAirline, setEditingAirline] = useState<Airline | null>(null);

  const formRefs = {
    name: useRef<HTMLInputElement>(null),
    country: useRef<HTMLInputElement>(null),
    contactEmail: useRef<HTMLInputElement>(null),
    contactPhone: useRef<HTMLInputElement>(null),
  };

  const tableState = useTableState({
    data: (airlines || []) as unknown as Record<string, unknown>[],
    searchFields: ['name', 'country', 'contactEmail', 'contactPhone'],
    defaultSort: 'name',
    defaultItemsPerPage: 12,
  });

  const resetForm = () => {
    Object.values(formRefs).forEach(ref => {
      if (ref.current) ref.current.value = '';
    });
    setEditingAirline(null);
    setIsFormOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const name = formRefs.name.current?.value?.trim();
    const country = formRefs.country.current?.value?.trim();
    const contactEmail = formRefs.contactEmail.current?.value?.trim();
    const contactPhone = formRefs.contactPhone.current?.value?.trim();

    if (!name || !country || !contactEmail) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    try {
      const payload = { name, country, contactEmail, contactPhone: contactPhone || '' };
      
      if (editingAirline?.airlineId) {
        await updateMutation.mutateAsync({ id: editingAirline.airlineId, airline: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving airline:', error);
      alert('Ошибка при сохранении. Проверьте, что все поля заполнены корректно.');
    }
  };

  const handleEdit = (airline: Airline) => {
    setEditingAirline(airline);
    setTimeout(() => {
      if (formRefs.name.current) formRefs.name.current.value = airline.name;
      if (formRefs.country.current) formRefs.country.current.value = airline.country;
      if (formRefs.contactEmail.current) formRefs.contactEmail.current.value = airline.contactEmail || '';
      if (formRefs.contactPhone.current) formRefs.contactPhone.current.value = airline.contactPhone || '';
    }, 0);
    setIsFormOpen(true);
  };

  const handleDelete = async (airlineId: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту авиакомпанию?')) {
      try {
        await deleteMutation.mutateAsync(airlineId);
      } catch (error) {
        console.error('Error deleting airline:', error);
      }
    }
  };

  if (isLoading) return <div className="text-center py-8">Загрузка...</div>;
  if (error) return <div className="text-center py-8 text-red-600">Ошибка загрузки авиакомпаний</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Управление авиакомпаниями</h1>
          <p className="text-gray-600">Добавляйте, редактируйте и удаляйте авиакомпании</p>
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
        searchPlaceholder="Поиск авиакомпаний..."
        onSearchChange={tableState.setSearchTerm}
        sortOptions={[
          { value: 'name', label: 'По названию' },
          { value: 'country', label: 'По стране' },
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
        {tableState.paginatedData.map((airlineData, index) => {
          const airline = airlineData as unknown as Airline;
          return (
            <div key={airline.airlineId || index} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{airline.name}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="w-20 text-gray-500">Страна:</span>
                      <span>{airline.country}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-20 text-gray-500">Email:</span>
                      <span>{airline.contactEmail || 'Не указано'}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-20 text-gray-500">Телефон:</span>
                      <span>{airline.contactPhone || 'Не указано'}</span>
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
                    onClick={() => airline.airlineId && handleDelete(airline.airlineId)}
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
                  {editingAirline ? 'Редактировать авиакомпанию' : 'Добавить авиакомпанию'}
                </h3>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">❌</button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
                  <input
                    type="text"
                    ref={formRefs.name}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Страна</label>
                  <input
                    type="text"
                    ref={formRefs.country}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    ref={formRefs.contactEmail}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                  <input
                    type="tel"
                    ref={formRefs.contactPhone}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {(createMutation.isPending || updateMutation.isPending) 
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
} 