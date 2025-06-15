import axios from 'axios';
import { 
  Airline, 
  Aircraft, 
  AircraftModel, 
  AircraftClass, 
  Airport, 
  Flight, 
  CrewMember, 
  CrewAssignment, 
  Ticket,
  ComplexQueryResult,
  AircraftCreateRequest,
  FlightCreateRequest,
  CrewMemberCreateRequest,
  AircraftModelCreateRequest,
  CrewAssignmentCreateRequest,
  TicketCreateRequest
} from '@/types';

const API_BASE_URL = '/api/proxy';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const airlinesAPI = {
  getAll: () => api.get<Airline[]>('/airlines'),
  getById: (id: number) => api.get<Airline>(`/airlines/${id}`),
  create: (airline: Airline) => api.post<Airline>('/airlines', airline),
  update: (id: number, airline: Airline) => api.patch<Airline>(`/airlines/${id}`, airline),
  delete: (id: number) => api.delete(`/airlines/${id}`),
  search: (country: string, capacity: number) => 
    api.get<Airline[]>(`/airlines/search?country=${country}&capacity=${capacity}`),
};

export const aircraftAPI = {
  getAll: () => api.get<Aircraft[]>('/aircrafts'),
  getById: (id: number) => api.get<Aircraft>(`/aircrafts/${id}`),
  create: (aircraft: AircraftCreateRequest) => api.post<Aircraft>('/aircrafts', aircraft),
  update: (id: number, aircraft: AircraftCreateRequest) => api.patch<Aircraft>(`/aircrafts/${id}`, aircraft),
  delete: (id: number) => api.delete(`/aircrafts/${id}`),
};

export const aircraftModelsAPI = {
  getAll: () => api.get<AircraftModel[]>('/aircraft-models'),
  create: (model: AircraftModelCreateRequest) => api.post<AircraftModel>('/aircraft-models', model),
};

export const aircraftClassesAPI = {
  getAll: () => api.get<AircraftClass[]>('/aircraft-classes'),
  create: (aircraftClass: AircraftClass) => api.post<AircraftClass>('/aircraft-classes', aircraftClass),
};

export const airportsAPI = {
  getAll: () => api.get<Airport[]>('/airports'),
  getById: (id: number) => api.get<Airport>(`/airports/${id}`),
  create: (airport: Airport) => api.post<Airport>('/airports', airport),
  update: (id: number, airport: Airport) => api.patch<Airport>(`/airports/${id}`, airport),
  delete: (id: number) => api.delete(`/airports/${id}`),
  search: (city?: string, country?: string) => {
    const params = new URLSearchParams();
    if (city) params.append('city', city);
    if (country) params.append('country', country);
    return api.get<Airport[]>(`/airports/search?${params.toString()}`);
  },
};

export const flightsAPI = {
  getAll: () => api.get<Flight[]>('/flights'),
  getById: (id: number) => api.get<Flight>(`/flights/${id}`),
  create: (flight: FlightCreateRequest) => api.post<Flight>('/flights', flight),
  update: (id: number, flight: FlightCreateRequest) => api.patch<Flight>(`/flights/${id}`, flight),
  delete: (id: number) => api.delete(`/flights/${id}`),
  search: (departureAirport?: string, arrivalAirport?: string, departureDate?: string) => {
    const params = new URLSearchParams();
    if (departureAirport) params.append('departureAirport', departureAirport);
    if (arrivalAirport) params.append('arrivalAirport', arrivalAirport);
    if (departureDate) params.append('departureDate', departureDate);
    return api.get<Flight[]>(`/flights/search?${params.toString()}`);
  },
  getDelayedFlights: () => api.get<ComplexQueryResult[]>('/flights/delayed'),
  getAirportsFlightCounts: (startDate: string, endDate: string) => 
    api.get<ComplexQueryResult[]>(`/flights/airports?startDate=${startDate}&endDate=${endDate}`),
};

export const crewMembersAPI = {
  getAll: () => api.get<CrewMember[]>('/crew-members'),
  getById: (id: number) => api.get<CrewMember>(`/crew-members/${id}`),
  create: (crewMember: CrewMemberCreateRequest) => api.post<CrewMember>('/crew-members', crewMember),
  update: (id: number, crewMember: CrewMemberCreateRequest) => api.patch<CrewMember>(`/crew-members/${id}`, crewMember),
  delete: (id: number) => api.delete(`/crew-members/${id}`),
  searchByAircraftClass: (className: string) => 
    api.get<CrewMember[]>(`/crew-members/search?className=${className}`),
  getByAirline: (airlineId: number) => 
    api.get<CrewMember[]>(`/crew-members/airline/${airlineId}`),
};

export const crewAssignmentsAPI = {
  getAll: () => api.get<CrewAssignment[]>('/crew-assignments'),
  getById: (id: number) => api.get<CrewAssignment>(`/crew-assignments/${id}`),
  create: (assignment: CrewAssignmentCreateRequest) => api.post<CrewAssignment>('/crew-assignments', assignment),
  update: (id: number, assignment: CrewAssignmentCreateRequest) => api.patch<CrewAssignment>(`/crew-assignments/${id}`, assignment),
  delete: (id: number) => api.delete(`/crew-assignments/${id}`),
  getByFlightId: (flightId: number) => api.get<CrewAssignment[]>(`/crew-assignments/flight/${flightId}`),
  getByCrewMemberId: (crewMemberId: number) => api.get<CrewAssignment[]>(`/crew-assignments/crew-member/${crewMemberId}`),
};

export const ticketsAPI = {
  getAll: () => api.get<Ticket[]>('/tickets'),
  create: (ticket: TicketCreateRequest) => api.post<Ticket>('/tickets', ticket),
  searchByAirportAndPrice: (airportName: string, price: number) => 
    api.get<Ticket[]>(`/tickets/search?airportName=${airportName}&price=${price}`),
};

export default api;
