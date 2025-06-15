import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';


const pool = new Pool({
  host: '195.58.37.85',
  port: 5432,
  database: 'air_manager',
  user: 'admin',
  password: 'root',
});

export async function POST(request: NextRequest) {
  try {
    const { queryType } = await request.json();

    let query = '';
    
    switch (queryType) {
      case 'flights':
        query = `
          SELECT 
            f.flight_id,
            f.departure_time,
            f.arrival_time,
            f.ticket_price,
            a.registration_number,
            am.name as aircraft_model,
            am.manufacturer,
            al.name as airline_name,
            al.country as airline_country,
            dep.name as departure_airport,
            dep.city as departure_city,
            arr.name as arrival_airport,
            arr.city as arrival_city
          FROM flight f
          INNER JOIN aircraft a ON f.aircraft_id = a.aircraft_id
          INNER JOIN aircraft_model am ON a.model_id = am.model_id
          INNER JOIN airlines al ON a.airline_id = al.airline_id
          INNER JOIN airport dep ON f.departure_airport = dep.airport_id
          INNER JOIN airport arr ON f.arrival_airport = arr.airport_id
          ORDER BY f.departure_time DESC
        `;
        break;
        
      case 'crew':
        query = `
          SELECT 
            cm.first_name,
            cm.last_name,
            cm.qualification,
            ca.role,
            f.flight_id,
            f.departure_time,
            f.arrival_time,
            a.registration_number,
            al.name as airline_name,
            dep.city as departure_city,
            arr.city as arrival_city
          FROM crew_member cm
          INNER JOIN crew_assigment ca ON cm.crew_id = ca.crew_member_id
          INNER JOIN flight f ON ca.flight_id = f.flight_id
          INNER JOIN aircraft a ON f.aircraft_id = a.aircraft_id
          INNER JOIN airlines al ON cm.airline_id = al.airline_id
          INNER JOIN airport dep ON f.departure_airport = dep.airport_id
          INNER JOIN airport arr ON f.arrival_airport = arr.airport_id
          ORDER BY f.departure_time DESC
        `;
        break;
        
      case 'airlines':
        query = `
          SELECT 
            al.name as airline_name,
            al.country,
            COUNT(DISTINCT a.aircraft_id) as total_aircraft,
            COUNT(DISTINCT f.flight_id) as total_flights,
            AVG(f.ticket_price) as avg_ticket_price,
            SUM(am.passenger_capacity) as total_passenger_capacity
          FROM airlines al
          INNER JOIN aircraft a ON al.airline_id = a.airline_id
          INNER JOIN aircraft_model am ON a.model_id = am.model_id
          LEFT JOIN flight f ON a.aircraft_id = f.aircraft_id
          GROUP BY al.airline_id, al.name, al.country
          ORDER BY total_flights DESC
        `;
        break;
        
      case 'airports':
        query = `
          SELECT 
            ap.name as airport_name,
            ap.city,
            ap.country,
            COUNT(DISTINCT dep_flights.flight_id) as departures_count,
            COUNT(DISTINCT arr_flights.flight_id) as arrivals_count,
            COUNT(DISTINCT dep_flights.flight_id) + COUNT(DISTINCT arr_flights.flight_id) as total_flights,
            AVG(dep_flights.ticket_price) as avg_departure_price,
            COUNT(DISTINCT a.airline_id) as airlines_served
          FROM airport ap
          LEFT JOIN flight dep_flights ON ap.airport_id = dep_flights.departure_airport
          LEFT JOIN flight arr_flights ON ap.airport_id = arr_flights.arrival_airport
          LEFT JOIN aircraft a ON (dep_flights.aircraft_id = a.aircraft_id OR arr_flights.aircraft_id = a.aircraft_id)
          GROUP BY ap.airport_id, ap.name, ap.city, ap.country
          ORDER BY total_flights DESC
        `;
        break;
        
      case 'tickets':
        query = `
          SELECT 
            t.ticket_id,
            t.passenger_name,
            t.passenger_passport,
            t.seat_number,
            t.price,
            f.flight_id,
            f.departure_time,
            f.arrival_time,
            dep.name as departure_airport,
            dep.city as departure_city,
            arr.name as arrival_airport,
            arr.city as arrival_city,
            a.registration_number,
            am.name as aircraft_model,
            al.name as airline_name
          FROM ticket t
          INNER JOIN flight f ON t.flight_id = f.flight_id
          INNER JOIN aircraft a ON f.aircraft_id = a.aircraft_id
          INNER JOIN aircraft_model am ON a.model_id = am.model_id
          INNER JOIN airlines al ON a.airline_id = al.airline_id
          INNER JOIN airport dep ON f.departure_airport = dep.airport_id
          INNER JOIN airport arr ON f.arrival_airport = arr.airport_id
          ORDER BY f.departure_time DESC
        `;
        break;
        
      default:
        return NextResponse.json({ error: 'Invalid query type' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(query);
    client.release();

    return NextResponse.json({ data: result.rows });
  } catch (error) {
    console.error('Database query error:', error);
    return NextResponse.json(
      { error: 'Database query failed' },
      { status: 500 }
    );
  }
}
