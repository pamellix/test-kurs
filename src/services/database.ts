import { ComplexQueryResult } from '@/types';

interface QueryParams {
  startDate?: string;
  endDate?: string;
  airlineId?: number;
  airportId?: number;
}

const executeQuery = async (queryType: string, params: QueryParams = {}): Promise<ComplexQueryResult[]> => {
  try {
    const response = await fetch('/api/sql-queries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queryType, ...params }),
    });
    
    if (!response.ok) throw new Error('Failed to execute query');
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export const complexQueries = {
  flights: (params?: { startDate?: string; endDate?: string }) => 
    executeQuery('flights', params),
  crew: (params?: { airlineId?: number }) => 
    executeQuery('crew', params),
  airlines: () => 
    executeQuery('airlines'),
  airports: (params?: { airportId?: number }) => 
    executeQuery('airports', params),
  tickets: () => 
    executeQuery('tickets'),
};
