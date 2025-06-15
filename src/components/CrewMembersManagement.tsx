'use client';

import { useState } from 'react';
import { useCrewMembers, useCreateCrewMember, useUpdateCrewMember, useDeleteCrewMember, useAirlines } from '@/hooks/api';
import { CrewMember, CrewMemberCreateRequest } from '@/types';

interface CrewMemberFormData {
  firstName: string;
  lastName: string;
  salary: number;
  hireDate: string;
  qualification: string;
}

export const CrewMembersManagement = () => {
  const { data: crewMembers, isLoading, error } = useCrewMembers();
  const { data: airlines } = useAirlines();
  const createCrewMemberMutation = useCreateCrewMember();
  const updateCrewMemberMutation = useUpdateCrewMember();
  const deleteCrewMemberMutation = useDeleteCrewMember();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCrewMember, setEditingCrewMember] = useState<CrewMember | null>(null);
  const [formData, setFormData] = useState<CrewMemberFormData>({
    firstName: '',
    lastName: '',
    salary: 0,
    hireDate: '',
    qualification: '',
  });
  const [selectedAirline, setSelectedAirline] = useState<number | ''>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const crewMemberData: CrewMemberCreateRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        salary: formData.salary,
        hireDate: formData.hireDate,
        qualification: formData.qualification,
        airlineId: selectedAirline ? Number(selectedAirline) : undefined,
      };

      if (editingCrewMember && editingCrewMember.crewId) {
        await updateCrewMemberMutation.mutateAsync({ 
          id: editingCrewMember.crewId, 
          crewMember: crewMemberData 
        });
      } else {
        await createCrewMemberMutation.mutateAsync(crewMemberData);
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving crew member:', error);
    }
  };

  const resetForm = () => {
    setFormData({ firstName: '', lastName: '', salary: 0, hireDate: '', qualification: '' });
    setSelectedAirline('');
    setEditingCrewMember(null);
    setIsFormOpen(false);
  };

  const handleEdit = (crewMember: CrewMember) => {
    setEditingCrewMember(crewMember);
    setFormData({
      firstName: crewMember.firstName,
      lastName: crewMember.lastName,
      salary: crewMember.salary,
      hireDate: crewMember.hireDate,
      qualification: crewMember.qualification || '',
    });
    setSelectedAirline(crewMember.airline?.airlineId || '');
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number | undefined) => {
    if (!id) return;
    if (window.confirm('Вы уверены, что хотите удалить этого члена экипажа?')) {
      try {
        await deleteCrewMemberMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting crew member:', error);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'number' ? Number(value) : value 
    }));
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
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
            <p className="mt-1 text-sm text-red-700">Не удалось загрузить список членов экипажа</p>
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
          <h2 className="text-2xl font-bold text-gray-900">Экипаж</h2>
          <p className="text-gray-600">Управление членами экипажа</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
        >
          <span>➕</span>
          <span>Добавить члена экипажа</span>
        </button>
      </div>

      {/* Crew Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(crewMembers) && crewMembers.map((crewMember) => (
          <div key={crewMember.crewId} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {crewMember.firstName} {crewMember.lastName}
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="w-20 text-gray-500">Авиакомпания:</span>
                    <span>{crewMember.airline?.name || 'Не указана'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-20 text-gray-500">Зарплата:</span>
                    <span className="text-green-600 font-medium">${crewMember.salary.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-20 text-gray-500">Принят:</span>
                    <span>{formatDate(crewMember.hireDate)}</span>
                  </div>
                  {crewMember.qualification && (
                    <div>
                      <span className="text-gray-500">Квалификация:</span>
                      <div className="text-sm mt-1 p-2 bg-gray-50 rounded">{crewMember.qualification}</div>
                    </div>
                  )}
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
                  onClick={() => handleDelete(crewMember.crewId)}
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
                  {editingCrewMember ? 'Редактировать члена экипажа' : 'Добавить члена экипажа'}
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
                    Имя
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Фамилия
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Зарплата
                  </label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Дата найма
                  </label>
                  <input
                    type="date"
                    name="hireDate"
                    value={formData.hireDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Квалификация
                  </label>
                  <textarea
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Описание квалификации и опыта..."
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
                    disabled={createCrewMemberMutation.isPending || updateCrewMemberMutation.isPending}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {(createCrewMemberMutation.isPending || updateCrewMemberMutation.isPending) 
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
};