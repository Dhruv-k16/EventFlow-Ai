// src/lib/weatherService.ts
// Open-Meteo weather forecast — free, no API key required.

export interface WeatherForecast {
  location:             string;
  date:                 string;
  precipitationProbPct: number;
  windspeedMax:         number;
  weatherCode:          number;
  condition:            string;
  riskLevel:            'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  riskScore:            number;
  isOutdoorRisk:        boolean;
  geocoded:             boolean;
}

function describeCode(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code <= 3)  return 'Partly cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 67) return 'Rain / Drizzle';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Rain showers';
  if (code <= 86) return 'Snow showers';
  if (code <= 99) return 'Thunderstorm';
  return 'Unknown';
}

function calcScore(precip: number, wind: number, code: number): number {
  // v2: continuous wind scaling
  let s = (precip / 100) * 50;
  s += Math.min(25, wind / 4);
  if (code >= 95)      s += 25;
  else if (code >= 80) s += 15;
  else if (code >= 51) s += 10;
  else if (code >= 45) s += 5;
  else if (code >= 1)  s += 2;
  return Math.min(100, Math.round(s));
}

function toLevel(score: number): 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' {
  if (score >= 70) return 'EXTREME';
  if (score >= 45) return 'HIGH';
  if (score >= 20) return 'MODERATE';
  return 'LOW';
}

async function geocode(location: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const city = encodeURIComponent(location.split(',')[0].trim());
    const res  = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`);
    if (!res.ok) return null;
    const data = await res.json() as { results?: { latitude: number; longitude: number }[] };
    if (!data.results?.length) return null;
    return { lat: data.results[0].latitude, lon: data.results[0].longitude };
  } catch { return null; }
}

export async function getWeatherForecast(
  location: string | null | undefined,
  eventDate: Date
): Promise<WeatherForecast> {
  const dateStr = eventDate.toISOString().split('T')[0];
  const loc     = location ?? 'Unknown';
  const fallback: WeatherForecast = {
    location: loc, date: dateStr,
    precipitationProbPct: 0, windspeedMax: 0, weatherCode: 0,
    condition: 'Unknown (no location)', riskLevel: 'LOW', riskScore: 0,
    isOutdoorRisk: false, geocoded: false,
  };

  if (!location) return fallback;
  const coords = await geocode(location);
  if (!coords)   return fallback;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=precipitation_probability_max,windspeed_10m_max,weathercode&timezone=auto&start_date=${dateStr}&end_date=${dateStr}`;
    const res  = await fetch(url);
    if (!res.ok) return { ...fallback, geocoded: true };
    const data = await res.json() as {
      daily?: { precipitation_probability_max: number[]; windspeed_10m_max: number[]; weathercode: number[] };
    };
    if (!data.daily?.weathercode?.length) return { ...fallback, geocoded: true };
    const precip = data.daily.precipitation_probability_max[0] ?? 0;
    const wind   = data.daily.windspeed_10m_max[0]             ?? 0;
    const code   = data.daily.weathercode[0]                   ?? 0;
    const score  = calcScore(precip, wind, code);
    return {
      location: loc, date: dateStr,
      precipitationProbPct: precip,
      windspeedMax: Math.round(wind * 10) / 10,
      weatherCode: code, condition: describeCode(code),
      riskLevel: toLevel(score), riskScore: score,
      isOutdoorRisk: score >= 20, geocoded: true,
    };
  } catch { return { ...fallback, geocoded: true }; }
}
