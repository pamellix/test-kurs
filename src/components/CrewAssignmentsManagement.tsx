'use client';

import { useState } from 'react';
import { useCrewAssignments, useCreateCrewAssignment, useUpdateCrewAssignment, useDeleteCrewAssignment, useCrewMembers, useFlights } from '@/hooks/api';
import { CrewAssignment, CrewAssignmentCreateRequest } from '@/types';

interface CrewAssignmentFormData {
  role: string;
}

export const CrewAssignmentsManagement = () => {
  const { data: crewAssignments, isLoading, error } = useCrewAssignments();
  const { data: crewMembers } = useCrewMembers();
  const { data: flights } = useFlights();
  const createCrewAssignmentMutation = useCreateCrewAssignment();
  const updateCrewAssignmentMutation = useUpdateCrewAssignment();
  const deleteCrewAssignmentMutation = useDeleteCrewAssignment();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<CrewAssignment | null>(null);
  const [formData, setFormData] = useState<CrewAssignmentFormData>({
    role: '',
  });
  const [selectedCrewMember, setSelectedCrewMember] = useState<number | ''>('');
  const [selectedFlight, setSelectedFlight] = useState<number | ''>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCrewMember || !selectedFlight) {
      alert('Пожалуйста, выберите члена экипажа и рейс');
      return;
    }
    
    try {
      const assignmentData: CrewAssignmentCreateRequest = {
        crewMemberId: Number(selectedCrewMember),
        flightId: Number(selectedFlight),
        role: formData.role,
      };

      if (editingAssignment && editingAssignment.assignmentId) {
        await updateCrewAssignmentMutation.mutateAsync({ 
          id: editingAssignment.assignmentId, 
          assignment: assignmentData 
        });
      } else {
        await createCrewAssignmentMutation.mutateAsync(assignmentData);
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving crew assignment:', error);
    }
  };

  const resetForm = () => {
    setFormData({ role: '' });
    setSelectedCrewMember('');
    setSelectedFlight('');
    setEditingAssignment(null);
    setIsFormOpen(false);
  };

  const handleEdit = (assignment: CrewAssignment) => {
    setEditingAssignment(assignment);
    setFormData({
      role: assignment.role,
    });
    setSelectedCrewMember(assignment.crewMemberId || '');
    setSelectedFlight(assignment.flightId || '');
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number | undefined) => {
    if (!id) return;
    if (window.confirm('Вы уверены, что хотите удалить это назначение?')) {
      try {
        await deleteCrewAssignmentMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting crew assignment:', error);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
            <p className="mt-1 text-sm text-red-700">Не удалось загрузить список назначений экипажа</p>
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
          <h2 className="text-2xl font-bold text-gray-900">Назначения экипажа</h2>
          <p className="text-gray-600">Управление назначениями экипажа на рейсы</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
        >
          <span>➕</span>
          <span>Добавить назначение</span>
        </button>
      </div>

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(crewAssignments) && crewAssignments.map((assignment) => (
          <div key={assignment.assignmentId} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Назначение #{assignment.assignmentId}
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="w-20 text-gray-500">Роль:</span>
                    <span className="font-medium text-blue-600">{assignment.role}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-20 text-gray-500">Член экипажа:</span>
                    <span>{assignment.crewMember ? `${assignment.crewMember.firstName} ${assignment.crewMember.lastName}` : 'Не указан'}</span>
                  </div>
                  {assignment.flight && (
                    <div className="pt-2 border-t border-gray-100">
                      <div className="text-xs text-gray-500 mb-1">Информация о рейсе:</div>
                      <div className="text-xs">
                        <div>Рейс #{assignment.flight.flightId}</div>
                        <div>Вылет: {formatDateTime(assignment.flight.departureTime)}</div>
                        <div>Откуда: {assignment.flight.departureAirport?.name || 'Не указан'}</div>
                        <div>Куда: {assignment.flight.arrivalAirport?.name || 'Не указан'}</div>
                        <div>Самолет: {assignment.flight.aircraft?.registrationNumber || 'Не указан'}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-2xl">👨‍✈️</div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleEdit(assignment)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Редактировать
                </button>
                <button 
                  onClick={() => handleDelete(assignment.assignmentId)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {/* Empty state */}
        {(!Array.isArray(crewAssignments) || crewAssignments.length === 0) && (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👨‍✈️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Нет назначений экипажа</h3>
            <p className="text-gray-500 mb-4">Начните с добавления первого назначения</p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Добавить назначение
            </button>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingAssignment ? 'Редактировать назначение' : 'Добавить назначение'}
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
                    Член экипажа
                  </label>
                  <select
                    value={selectedCrewMember}
                    onChange={(e) => setSelectedCrewMember(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Выберите члена экипажа</option>
                    {Array.isArray(crewMembers) && crewMembers.map((member) => (
                      <option key={member.crewId} value={member.crewId}>
                        {member.firstName} {member.lastName} ({member.qualification || 'Без квалификации'})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Рейс
                  </label>
                  <select
                    value={selectedFlight}
                    onChange={(e) => setSelectedFlight(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Выберите рейс</option>
                    {Array.isArray(flights) && flights.map((flight) => (
                      <option key={flight.flightId} value={flight.flightId}>
                        Рейс #{flight.flightId} - {flight.departureAirport?.name} → {flight.arrivalAirport?.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Роль в экипаже
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Выберите роль</option>
                    <option value="Капитан">Капитан</option>
                    <option value="Второй пилот">Второй пилот</option>
                    <option value="Бортинженер">Бортинженер</option>
                    <option value="Старший бортпроводник">Старший бортпроводник</option>
                    <option value="Бортпроводник">Бортпроводник</option>
                    <option value="Штурман">Штурман</option>
                    <option value="Радист">Радист</option>
                  </select>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={createCrewAssignmentMutation.isPending || updateCrewAssignmentMutation.isPending}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {(createCrewAssignmentMutation.isPending || updateCrewAssignmentMutation.isPending) 
                      ? 'Сохранение...' 
                      : editingAssignment ? 'Обновить' : 'Создать'}
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
