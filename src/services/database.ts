import { ComplexQueryResult } from '@/types';

export const executeQuery = async (queryType: string): Promise<ComplexQueryResult[]> => {
  try {
    const response = await fetch('/api/sql-queries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ queryType }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to execute query');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export const complexQueries = {
  getFlightsWithAircraftInfo: () => executeQuery('flights'),

  getCrewWithFlightInfo: () => executeQuery('crew'),

  getAirlineAircraftStats: () => executeQuery('airlines'),

  getAirportLoadDetails: () => executeQuery('airports'),

  getTicketDetailsWithPassengers: () => executeQuery('tickets'),
};
