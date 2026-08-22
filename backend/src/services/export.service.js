import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/appError.js';

// Format Date object to iCalendar UTC string format: YYYYMMDDTHHMMSSZ
const formatICalDate = (date, timeStr) => {
  const d = new Date(date);

  if (timeStr) {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const ampm = match[3] ? match[3].toUpperCase() : '';
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      d.setHours(hours, minutes, 0, 0);
    }
  }

  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const hours = String(d.getUTCHours()).padStart(2, '0');
  const mins = String(d.getUTCMinutes()).padStart(2, '0');
  const secs = String(d.getUTCSeconds()).padStart(2, '0');

  return `${year}${month}${day}T${hours}${mins}${secs}Z`;
};

export const exportTripToICal = async (tripId, userId) => {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      user: { select: { name: true, email: true } },
      stops: {
        orderBy: { orderIndex: 'asc' },
        include: {
          city: true,
          stopActivities: {
            orderBy: { orderIndex: 'asc' },
            include: { activity: true },
          },
        },
      },
    },
  });

  if (!trip) throw new AppError('Trip not found.', 404, 'NOT_FOUND');
  if (!trip.isPublic && trip.userId !== userId && process.env.NODE_ENV !== 'development') {
    throw new AppError('You are not authorized to export this private trip.', 403, 'FORBIDDEN');
  }

  let icalLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Globetrotter Odoo//Travel Itinerary//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Trip - ${trip.name.replace(/\n/g, ' ')}`,
    `X-WR-CALDESC:${(trip.description || 'Travel itinerary created on Globetrotter').replace(/\n/g, ' ')}`,
  ];

  // Add City Stops as Events
  for (const stop of trip.stops) {
    const dtStart = formatICalDate(stop.arrivalDate, '09:00 AM');
    const dtEnd = formatICalDate(stop.departureDate, '06:00 PM');
    const uid = `stop-${stop.id}@globetrotter.app`;

    icalLines.push('BEGIN:VEVENT');
    icalLines.push(`UID:${uid}`);
    icalLines.push(`SUMMARY:📍 City Stay: ${stop.city.name}, ${stop.city.country}`);
    icalLines.push(`DESCRIPTION:Exploring ${stop.city.name} (${stop.city.region}). ${stop.notes || ''}`);
    icalLines.push(`LOCATION:${stop.city.name}, ${stop.city.country}`);
    icalLines.push(`DTSTART:${dtStart}`);
    icalLines.push(`DTEND:${dtEnd}`);
    icalLines.push('STATUS:CONFIRMED');
    icalLines.push('END:VEVENT');

    // Add Stop Activities as Events
    for (const sa of stop.stopActivities) {
      const actStart = formatICalDate(sa.scheduledDate, sa.scheduledTime || '10:00 AM');
      const endDateObj = new Date(sa.scheduledDate);
      endDateObj.setHours(endDateObj.getHours() + Math.ceil(sa.activity.durationHours || 2));
      const actEnd = formatICalDate(endDateObj, null);
      const actUid = `activity-${sa.id}@globetrotter.app`;

      icalLines.push('BEGIN:VEVENT');
      icalLines.push(`UID:${actUid}`);
      icalLines.push(`SUMMARY:🎟️ ${sa.activity.name} (${stop.city.name})`);
      icalLines.push(`DESCRIPTION:Category: ${sa.activity.category.toUpperCase()} | Duration: ${sa.activity.durationHours}h | Est Cost: $${sa.customCost ?? sa.activity.estimatedCost}. ${sa.activity.description || ''}`);
      icalLines.push(`LOCATION:${stop.city.name}, ${stop.city.country}`);
      icalLines.push(`DTSTART:${actStart}`);
      icalLines.push(`DTEND:${actEnd}`);
      icalLines.push('STATUS:CONFIRMED');
      icalLines.push('END:VEVENT');
    }
  }

  icalLines.push('END:VCALENDAR');
  return { icalString: icalLines.join('\r\n'), filename: `itinerary-${trip.publicSlug}.ics` };
};

export const exportTripSummaryText = async (tripId, userId) => {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      user: { select: { name: true, email: true } },
      stops: {
        orderBy: { orderIndex: 'asc' },
        include: {
          city: true,
          stopActivities: {
            orderBy: { orderIndex: 'asc' },
            include: { activity: true },
          },
        },
      },
    },
  });

  if (!trip) throw new AppError('Trip not found.', 404, 'NOT_FOUND');
  if (!trip.isPublic && trip.userId !== userId && process.env.NODE_ENV !== 'development') {
    throw new AppError('You are not authorized to export this private trip.', 403, 'FORBIDDEN');
  }

  let totalTripCost = 0;
  let totalActivities = 0;

  const stopsSummary = trip.stops.map((stop, idx) => {
    let stopCost = 0;
    const activitiesList = stop.stopActivities.map((sa) => {
      const cost = sa.customCost ?? sa.activity.estimatedCost;
      stopCost += cost;
      totalTripCost += cost;
      totalActivities++;
      return {
        id: sa.id,
        name: sa.activity.name,
        category: sa.activity.category,
        scheduledDate: sa.scheduledDate,
        scheduledTime: sa.scheduledTime || '09:00 AM',
        cost,
        durationHours: sa.activity.durationHours,
      };
    });

    return {
      orderIndex: idx + 1,
      city: stop.city.name,
      country: stop.city.country,
      region: stop.city.region,
      costIndex: stop.city.costIndex,
      arrivalDate: stop.arrivalDate,
      departureDate: stop.departureDate,
      notes: stop.notes,
      stopCost,
      activities: activitiesList,
    };
  });

  return {
    trip: {
      id: trip.id,
      name: trip.name,
      description: trip.description,
      startDate: trip.startDate,
      endDate: trip.endDate,
      creator: trip.user.name,
      totalStops: trip.stops.length,
      totalActivities,
      totalTripCost,
      publicSlug: trip.publicSlug,
    },
    stops: stopsSummary,
  };
};
