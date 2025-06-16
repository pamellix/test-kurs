'use client';

import { useState, useRef } from 'react';
import { useCrewMembers, useCreateCrewMember, useUpdateCrewMember, useDeleteCrewMember } from '@/hooks/api';
import { useAirlines } from '@/hooks/api';
import { useTableState } from '@/hooks/useTableState';
import { TableControls } from './common/TableControls';
import { CrewMember } from '@/types';

export default function CrewMembersManagement() {
  const { data: crewMembers, isLoading, error } = useCrewMembers();
  const { data: airlines } = useAirlines();
  const createMutation = useCreateCrewMember();
  const updateMutation = useUpdateCrewMember();
  const deleteMutation = useDeleteCrewMember();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCrewMember, setEditingCrewMember] = useState<CrewMember | null>(null);

  const formRefs = {
    firstName: useRef<HTMLInputElement>(null),
    lastName: useRef<HTMLInputElement>(null),
    qualification: useRef<HTMLInputElement>(null),
    salary: useRef<HTMLInputElement>(null),
    hireDate: useRef<HTMLInputElement>(null),
    airline: useRef<HTMLSelectElement>(null),
  };

  const tableState = useTableState({
    data: (crewMembers || []) as unknown as Record<string, unknown>[],
    searchFields: ['firstName', 'lastName', 'qualification', 'airline.name'],
    defaultSort: 'firstName',
    defaultItemsPerPage: 12,
  });

  const resetForm = () => {
    Object.values(formRefs).forEach(ref => {
      if (ref.current) ref.current.value = '';
    });
    setEditingCrewMember(null);
    setIsFormOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const firstName = formRefs.firstName.current?.value?.trim();
    const lastName = formRefs.lastName.current?.value?.trim();
    const qualification = formRefs.qualification.current?.value?.trim();
    const salary = formRefs.salary.current?.value;
    const hireDate = formRefs.hireDate.current?.value;
    const airlineId = formRefs.airline.current?.value;

    if (!firstName || !lastName || !qualification || !salary || !hireDate || !airlineId) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    try {
      const payload = {
        firstName,
        lastName,
        qualification,
        salary: parseFloat(salary),
        hireDate,
        airline: { airlineId: parseInt(airlineId) }
      };
      
      if (editingCrewMember?.crewId) {
        await updateMutation.mutateAsync({ id: editingCrewMember.crewId, crewMember: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving crew member:', error);
      alert('Ошибка при сохранении. Проверьте, что все поля заполнены корректно.');
    }
  };

  const handleEdit = (crewMember: CrewMember) => {
    setEditingCrewMember(crewMember);
    setTimeout(() => {
      if (formRefs.firstName.current) formRefs.firstName.current.value = crewMember.firstName;
      if (formRefs.lastName.current) formRefs.lastName.current.value = crewMember.lastName;
      if (formRefs.qualification.current) formRefs.qualification.current.value = crewMember.qualification || '';
      if (formRefs.salary.current) formRefs.salary.current.value = crewMember.salary?.toString() || '';
      if (formRefs.hireDate.current) formRefs.hireDate.current.value = crewMember.hireDate ? crewMember.hireDate.split('T')[0] : '';
      if (formRefs.airline.current) formRefs.airline.current.value = crewMember.airline?.airlineId?.toString() || '';
    }, 0);
    setIsFormOpen(true);
  };

  const handleDelete = async (crewId: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этого члена экипажа?')) {
      try {
        await deleteMutation.mutateAsync(crewId);
      } catch (error) {
        console.error('Error deleting crew member:', error);
      }
    }
  };

  if (isLoading) return <div className="text-center py-8">Загрузка...</div>;
  if (error) return <div className="text-center py-8 text-red-600">Ошибка загрузки членов экипажа</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Управление экипажем</h1>
          <p className="text-gray-600">Добавляйте, редактируйте и удаляйте членов экипажа</p>
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
        searchPlaceholder="Поиск членов экипажа..."
        onSearchChange={tableState.setSearchTerm}
        sortOptions={[
          { value: 'firstName', label: 'По имени' },
          { value: 'lastName', label: 'По фамилии' },
          { value: 'salary', label: 'По зарплате' },
          { value: 'hireDate', label: 'По дате найма' },
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
        {tableState.paginatedData.map((crewMemberData, index) => {
          const crewMember = crewMemberData as unknown as CrewMember;
          return (
            <div key={crewMember.crewId || index} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {crewMember.firstName} {crewMember.lastName}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="w-20 text-gray-500">Должность:</span>
                      <span>{crewMember.qualification}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-20 text-gray-500">Зарплата:</span>
                      <span className="font-medium text-green-600">
                        ${crewMember.salary?.toLocaleString() || 'Не указано'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-20 text-gray-500">Дата найма:</span>
                      <span>{crewMember.hireDate || 'Не указано'}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-20 text-gray-500">Авиакомпания:</span>
                      <span>{crewMember.airline?.name || 'Не указано'}</span>
                    </div>
                  </div>
                </div>
                <div className="text-2xl">👨‍✈️</div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEdit(crewMember)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Редактировать
                  </button>
                  <button 
                    onClick={() => crewMember.crewId && handleDelete(crewMember.crewId)}
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
                  {editingCrewMember ? 'Редактировать члена экипажа' : 'Добавить члена экипажа'}
                </h3>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">❌</button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                  <input
                    type="text"
                    ref={formRefs.firstName}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Фамилия</label>
                  <input
                    type="text"
                    ref={formRefs.lastName}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Должность</label>
                  <input
                    type="text"
                    ref={formRefs.qualification}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Зарплата</label>
                  <input
                    type="number"
                    ref={formRefs.salary}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Дата найма</label>
                  <input
                    type="date"
                    ref={formRefs.hireDate}
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
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {(createMutation.isPending || updateMutation.isPending) 
                      ? 'Сохранение...' 
                      : editingCrewMember ? 'Обновить' : 'Создать'}
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