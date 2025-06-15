import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  airlinesAPI,
  aircraftAPI,
  aircraftModelsAPI,
  aircraftClassesAPI,
  airportsAPI,
  flightsAPI,
  crewMembersAPI,
  crewAssignmentsAPI,
  ticketsAPI
} from '@/services/api';
import { complexQueries } from '@/services/database';
import {
  Airline,
  AircraftClass,
  Airport,
  AircraftCreateRequest,
  FlightCreateRequest,
  CrewMemberCreateRequest,
  AircraftModelCreateRequest,
  CrewAssignmentCreateRequest,
  TicketCreateRequest
} from '@/types';

// Airlines hooks
export const useAirlines = () => {
  return useQuery({
    queryKey: ['airlines'],
    queryFn: async () => {
      const response = await airlinesAPI.getAll();
      return response.data;
    },
  });
};

export const useCreateAirline = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (airline: Airline) => airlinesAPI.create(airline),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airlines'] });
    },
  });
};

export const useUpdateAirline = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, airline }: { id: number; airline: Airline }) => 
      airlinesAPI.update(id, airline),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airlines'] });
    },
  });
};

export const useDeleteAirline = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => airlinesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airlines'] });
    },
  });
};

// Aircraft hooks
export const useAircraft = () => {
  return useQuery({
    queryKey: ['aircraft'],
    queryFn: async () => {
      const response = await aircraftAPI.getAll();
      return response.data;
    },
  });
};

export const useCreateAircraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (aircraft: AircraftCreateRequest) => aircraftAPI.create(aircraft),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aircraft'] });
    },
  });
};

export const useUpdateAircraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, aircraft }: { id: number; aircraft: AircraftCreateRequest }) => 
      aircraftAPI.update(id, aircraft),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aircraft'] });
    },
  });
};

export const useDeleteAircraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => aircraftAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aircraft'] });
    },
  });
};

export const useAircraftModels = () => {
  return useQuery({
    queryKey: ['aircraftModels'],
    queryFn: async () => {
      const response = await aircraftModelsAPI.getAll();
      return response.data;
    },
  });
};

export const useCreateAircraftModel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (model: AircraftModelCreateRequest) => aircraftModelsAPI.create(model),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aircraftModels'] });
    },
  });
};

export const useAircraftClasses = () => {
  return useQuery({
    queryKey: ['aircraftClasses'],
    queryFn: async () => {
      const response = await aircraftClassesAPI.getAll();
      return response.data;
    },
  });
};

export const useCreateAircraftClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (aircraftClass: AircraftClass) => aircraftClassesAPI.create(aircraftClass),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aircraftClasses'] });
    },
  });
};

export const useAirports = () => {
  return useQuery({
    queryKey: ['airports'],
    queryFn: async () => {
      const response = await airportsAPI.getAll();
      return response.data;
    },
  });
};

export const useCreateAirport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (airport: Airport) => airportsAPI.create(airport),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airports'] });
    },
  });
};

export const useUpdateAirport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, airport }: { id: number; airport: Airport }) => 
      airportsAPI.update(id, airport),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airports'] });
    },
  });
};

export const useDeleteAirport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => airportsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airports'] });
    },
  });
};

// Flights hooks
export const useFlights = () => {
  return useQuery({
    queryKey: ['flights'],
    queryFn: async () => {
      const response = await flightsAPI.getAll();
      return response.data;
    },
  });
};

export const useCreateFlight = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (flight: FlightCreateRequest) => flightsAPI.create(flight),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flights'] });
    },
  });
};

export const useUpdateFlight = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, flight }: { id: number; flight: FlightCreateRequest }) => 
      flightsAPI.update(id, flight),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flights'] });
    },
  });
};

export const useDeleteFlight = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => flightsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flights'] });
    },
  });
};

// Crew Members hooks
export const useCrewMembers = () => {
  return useQuery({
    queryKey: ['crewMembers'],
    queryFn: async () => {
      const response = await crewMembersAPI.getAll();
      return response.data;
    },
  });
};

export const useCreateCrewMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (crewMember: CrewMemberCreateRequest) => crewMembersAPI.create(crewMember),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crewMembers'] });
    },
  });
};

export const useUpdateCrewMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, crewMember }: { id: number; crewMember: CrewMemberCreateRequest }) => 
      crewMembersAPI.update(id, crewMember),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crewMembers'] });
    },
  });
};

export const useDeleteCrewMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => crewMembersAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crewMembers'] });
    },
  });
};

// Crew Assignments hooks
export const useCrewAssignments = () => {
  return useQuery({
    queryKey: ['crewAssignments'],
    queryFn: async () => {
      const response = await crewAssignmentsAPI.getAll();
      return response.data;
    },
  });
};

export const useCreateCrewAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assignment: CrewAssignmentCreateRequest) => crewAssignmentsAPI.create(assignment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crewAssignments'] });
    },
  });
};

export const useUpdateCrewAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, assignment }: { id: number; assignment: CrewAssignmentCreateRequest }) => 
      crewAssignmentsAPI.update(id, assignment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crewAssignments'] });
    },
  });
};

export const useDeleteCrewAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => crewAssignmentsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crewAssignments'] });
    },
  });
};

export const useTickets = () => {
  return useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      const response = await ticketsAPI.getAll();
      return response.data;
    },
  });
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ticket: TicketCreateRequest) => ticketsAPI.create(ticket),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
};

// Complex queries hooks
export const useFlightsWithAircraftInfo = () => {
  return useQuery({
    queryKey: ['complexQuery', 'flightsWithAircraftInfo'],
    queryFn: () => complexQueries.getFlightsWithAircraftInfo(),
  });
};

export const useCrewWithFlightInfo = () => {
  return useQuery({
    queryKey: ['complexQuery', 'crewWithFlightInfo'],
    queryFn: () => complexQueries.getCrewWithFlightInfo(),
  });
};

export const useAirlineAircraftStats = () => {
  return useQuery({
    queryKey: ['complexQuery', 'airlineAircraftStats'],
    queryFn: () => complexQueries.getAirlineAircraftStats(),
  });
};

export const useAirportLoadDetails = () => {
  return useQuery({
    queryKey: ['complexQuery', 'airportLoadDetails'],
    queryFn: () => complexQueries.getAirportLoadDetails(),
  });
};

export const useTicketDetailsWithPassengers = () => {
  return useQuery({
    queryKey: ['complexQuery', 'ticketDetailsWithPassengers'],
    queryFn: () => complexQueries.getTicketDetailsWithPassengers(),
  });
};
