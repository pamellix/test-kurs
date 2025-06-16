'use client';

import { useState } from 'react';
import { useTickets, useCreateTicket, useFlights } from '@/hooks/api';
import { TicketCreateRequest } from '@/types';

interface TicketFormData {
  passengerName: string;
  passengerPassport: string;
  seatNumber: string;
  price: number;
}

export const TicketsManagement = () => {
  const { data: tickets, isLoading, error } = useTickets();
  const { data: flights } = useFlights();
  const createTicketMutation = useCreateTicket();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<TicketFormData>({
    passengerName: '',
    passengerPassport: '',
    seatNumber: '',
    price: 0,
  });
  const [selectedFlight, setSelectedFlight] = useState<number | ''>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(selectedFlight, formData.passengerName, formData.passengerPassport, formData.seatNumber, formData.price);
    if (!selectedFlight || !formData.passengerName || !formData.passengerPassport || 
        !formData.seatNumber || !formData.price) {
      alert('Пожалуйста, заполните все обязательные поля: рейс, имя пассажира, паспорт, номер места и цена');
      return;
    }
    
    try {
      const ticketData: TicketCreateRequest = {
        passengerName: formData.passengerName,
        passengerPassport: formData.passengerPassport,
        seatNumber: formData.seatNumber,
        price: formData.price,
        flightId: Number(selectedFlight),
      };

      await createTicketMutation.mutateAsync(ticketData);
      resetForm();
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Ошибка при создании билета. Проверьте, что все поля заполнены корректно и выбранный рейс существует.');
    }
  };

  const resetForm = () => {
    setFormData({ 
      passengerName: '', 
      passengerPassport: '', 
      seatNumber: '', 
      price: 0 
    });
    setSelectedFlight('');
    setIsFormOpen(false);
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
            <p className="mt-1 text-sm text-red-700">Не удалось загрузить список билетов</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Билеты</h2>
          <p className="text-gray-600">Управление билетами</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
        >
          <span>➕</span>
          <span>Добавить билет</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(tickets) && tickets.map((ticket) => (
          <div key={ticket.ticketId} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Билет #{ticket.ticketId}</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="w-20 text-gray-500">Пассажир:</span>
                    <span className="font-medium">{ticket.passengerName}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-20 text-gray-500">Паспорт:</span>
                    <span>{ticket.passengerPassport}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-20 text-gray-500">Место:</span>
                    <span className="font-medium">{ticket.seatNumber}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-20 text-gray-500">Цена:</span>
                    <span className="font-medium text-green-600">${ticket.price}</span>
                  </div>
                  {ticket.flight && (
                    <>
                      <div className="pt-2 border-t border-gray-100">
                        <div className="text-xs text-gray-500 mb-1">Информация о рейсе:</div>
                        <div className="text-xs">
                          <div>Вылет: {formatDateTime(ticket.flight.departureTime)}</div>
                          <div>Прилет: {formatDateTime(ticket.flight.arrivalTime)}</div>
                          <div>Откуда: {ticket.flight.departureAirport?.name || 'Не указан'}</div>
                          <div>Куда: {ticket.flight.arrivalAirport?.name || 'Не указан'}</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="text-2xl">🎫</div>
            </div>
          </div>
        ))}
        
        {(!Array.isArray(tickets) || tickets.length === 0) && (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🎫</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Нет билетов</h3>
            <p className="text-gray-500 mb-4">Начните с добавления первого билета</p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Добавить билет
            </button>
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Добавить билет</h3>
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
                    Имя пассажира
                  </label>
                  <input
                    type="text"
                    name="passengerName"
                    value={formData.passengerName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Паспорт
                  </label>
                  <input
                    type="text"
                    name="passengerPassport"
                    value={formData.passengerPassport}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Номер места
                  </label>
                  <input
                    type="text"
                    name="seatNumber"
                    value={formData.seatNumber}
                    onChange={handleInputChange}
                    required
                    placeholder="Например: 12A"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Цена билета
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
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
                    disabled={createTicketMutation.isPending}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createTicketMutation.isPending ? 'Создание...' : 'Создать'}
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
