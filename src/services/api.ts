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
  create: (aircraft: AircraftCreateRequest) => {
    const payload = {
      registrationNumber: aircraft.registrationNumber,
      manufactureDate: aircraft.manufactureDate,
      airline: aircraft.airlineId ? { airlineId: aircraft.airlineId } : null,
      model: aircraft.modelId ? { modelId: aircraft.modelId } : null,
    };
    return api.post<Aircraft>('/aircrafts', payload);
  },
  update: (id: number, aircraft: AircraftCreateRequest) => {
    const payload = {
      registrationNumber: aircraft.registrationNumber,
      manufactureDate: aircraft.manufactureDate,
      airline: aircraft.airlineId ? { airlineId: aircraft.airlineId } : null,
      model: aircraft.modelId ? { modelId: aircraft.modelId } : null,
    };
    return api.patch<Aircraft>(`/aircrafts/${id}`, payload);
  },
  delete: (id: number) => api.delete(`/aircrafts/${id}`),
};

export const aircraftModelsAPI = {
  getAll: () => api.get<AircraftModel[]>('/aircraft-models'),
  create: (model: AircraftModelCreateRequest) => {
    const payload = {
      name: model.name,
      manufacturer: model.manufacturer,
      crewSize: model.crewSize,
      passengerCapacity: model.passengerCapacity,
      operationalCost: model.operationalCost,
      fuelConsumption: model.fuelConsumption,
      aircraftClass: model.classId ? { classId: model.classId } : null,
    };
    return api.post<AircraftModel>('/aircraft-models', payload);
  },
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
  create: (flight: FlightCreateRequest) => {
    const payload = {
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      flightHours: flight.flightHours,
      ticketPrice: flight.ticketPrice,
      aircraft: flight.aircraftId ? { aircraftId: flight.aircraftId } : null,
      departureAirport: flight.departureAirportId ? { airportId: flight.departureAirportId } : null,
      arrivalAirport: flight.arrivalAirportId ? { airportId: flight.arrivalAirportId } : null,
    };
    return api.post<Flight>('/flights', payload);
  },
  update: (id: number, flight: FlightCreateRequest) => {
    const payload = {
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      flightHours: flight.flightHours,
      ticketPrice: flight.ticketPrice,
      aircraft: flight.aircraftId ? { aircraftId: flight.aircraftId } : null,
      departureAirport: flight.departureAirportId ? { airportId: flight.departureAirportId } : null,
      arrivalAirport: flight.arrivalAirportId ? { airportId: flight.arrivalAirportId } : null,
    };
    return api.patch<Flight>(`/flights/${id}`, payload);
  },
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
  create: (crewMember: CrewMemberCreateRequest) => {
    const payload = {
      firstName: crewMember.firstName,
      lastName: crewMember.lastName,
      salary: crewMember.salary,
      hireDate: crewMember.hireDate,
      qualification: crewMember.qualification,
      airline: crewMember.airlineId ? { airlineId: crewMember.airlineId } : null,
    };
    return api.post<CrewMember>('/crew-members', payload);
  },
  update: (id: number, crewMember: CrewMemberCreateRequest) => {
    const payload = {
      firstName: crewMember.firstName,
      lastName: crewMember.lastName,
      salary: crewMember.salary,
      hireDate: crewMember.hireDate,
      qualification: crewMember.qualification,
      airline: crewMember.airlineId ? { airlineId: crewMember.airlineId } : null,
    };
    return api.patch<CrewMember>(`/crew-members/${id}`, payload);
  },
  delete: (id: number) => api.delete(`/crew-members/${id}`),
  searchByAircraftClass: (className: string) => 
    api.get<CrewMember[]>(`/crew-members/search?className=${className}`),
  getByAirline: (airlineId: number) => 
    api.get<CrewMember[]>(`/crew-members/airline/${airlineId}`),
};

export const crewAssignmentsAPI = {
  getAll: () => api.get<CrewAssignment[]>('/crew-assignments'),
  getById: (id: number) => api.get<CrewAssignment>(`/crew-assignments/${id}`),
  create: (assignment: CrewAssignmentCreateRequest) => {
    const payload = {
      role: assignment.role,
      crewMember: { crewId: assignment.crewMemberId },
      flight: { flightId: assignment.flightId },
    };
    return api.post<CrewAssignment>('/crew-assignments', payload);
  },
  update: (id: number, assignment: CrewAssignmentCreateRequest) => {
    const payload = {
      role: assignment.role,
      crewMember: { crewId: assignment.crewMemberId },
      flight: { flightId: assignment.flightId },
    };
    return api.patch<CrewAssignment>(`/crew-assignments/${id}`, payload);
  },
  delete: (id: number) => api.delete(`/crew-assignments/${id}`),
  getByFlightId: (flightId: number) => api.get<CrewAssignment[]>(`/crew-assignments/flight/${flightId}`),
  getByCrewMemberId: (crewMemberId: number) => api.get<CrewAssignment[]>(`/crew-assignments/crew-member/${crewMemberId}`),
};

export const ticketsAPI = {
  getAll: () => api.get<Ticket[]>('/tickets'),
  create: (ticket: TicketCreateRequest) => {
    const payload = {
      passengerName: ticket.passengerName,
      passengerPassport: ticket.passengerPassport,
      seatNumber: ticket.seatNumber,
      price: ticket.price,
      flight: { flightId: ticket.flightId },
    };
    return api.post<Ticket>('/tickets', payload);
  },
  searchByAirportAndPrice: (airportName: string, price: number) => 
    api.get<Ticket[]>(`/tickets/search?airportName=${airportName}&price=${price}`),
};

export default api;
