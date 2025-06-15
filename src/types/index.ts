export interface Airline {
  airlineId?: number;
  name: string;
  country: string;
  contactEmail: string;
  contactPhone: string;
  aircraft?: Aircraft[];
  crewMembers?: CrewMember[];
}

export interface Aircraft {
  aircraftId?: number;
  model?: AircraftModel;
  airline?: Airline;
  registrationNumber: string;
  manufactureDate: string;
  flights?: Flight[];
}

export interface AircraftModel {
  modelId?: number;
  aircraftClass?: AircraftClass;
  name: string;
  manufacturer: string;
  crewSize: number;
  passengerCapacity: number;
  operationalCost: number;
  fuelConsumption: number;
  aircraft?: Aircraft[];
}

export interface AircraftClass {
  classId?: number;
  name: string;
  range: number;
  runwayLength: number;
  models?: AircraftModel[];
}

export interface Airport {
  airportId?: number;
  name: string;
  city: string;
  country: string;
  serviceCost: number;
  parkingCost: number;
  departures?: Flight[];
  arrivals?: Flight[];
}

export interface Flight {
  flightId?: number;
  aircraft?: Aircraft;
  departureAirport?: Airport;
  arrivalAirport?: Airport;
  departureTime: string;
  arrivalTime: string;
  flightHours: number;
  ticketPrice: number;
  tickets?: Ticket[];
  crewAssignments?: CrewAssignment[];
}

export interface CrewMember {
  crewId?: number;
  airline?: Airline;
  firstName: string;
  lastName: string;
  salary: number;
  hireDate: string;
  qualification?: string;
  assignments?: CrewAssignment[];
}

export interface CrewAssignment {
  assignmentId?: number;
  crewMemberId?: number;
  flightId?: number;
  crewMember?: CrewMember;
  flight?: Flight;
  role: string;
}

export interface Ticket {
  ticketId?: number;
  flight?: Flight;
  passengerName: string;
  passengerPassport: string;
  seatNumber: string;
  price: number;
}

export interface ComplexQueryResult {
  [key: string]: unknown;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

export interface AircraftCreateRequest {
  aircraftId?: number;
  registrationNumber: string;
  manufactureDate: string;
  airlineId?: number;
  modelId?: number;
}

export interface FlightCreateRequest {
  flightId?: number;
  aircraftId?: number;
  departureAirportId?: number;
  arrivalAirportId?: number;
  departureTime: string;
  arrivalTime: string;
  flightHours: number;
  ticketPrice: number;
}

export interface CrewMemberCreateRequest {
  crewId?: number;
  airlineId?: number;
  firstName: string;
  lastName: string;
  salary: number;
  hireDate: string;
  qualification?: string;
}

export interface AircraftModelCreateRequest {
  modelId?: number;
  classId?: number;
  name: string;
  manufacturer: string;
  crewSize: number;
  passengerCapacity: number;
  operationalCost: number;
  fuelConsumption: number;
}

export interface CrewAssignmentCreateRequest {
  assignmentId?: number;
  crewMemberId: number;
  flightId: number;
  role: string;
}

export interface TicketCreateRequest {
  ticketId?: number;
  flightId: number;
  passengerName: string;
  passengerPassport: string;
  seatNumber: string;
  price: number;
}
