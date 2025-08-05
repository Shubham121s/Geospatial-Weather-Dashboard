// Mock weather data generator since we can't use external APIs in this environment
export async function fetchWeatherData(
  latitude: number,
  longitude: number,
  startDate: Date,
  endDate: Date
) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const hours = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
  const baseTemp = 15 + latitude / 10 + longitude / 20; // Base temperature based on coordinates

  const hourly = {
    time: [] as string[],
    temperature_2m: [] as number[],
    relative_humidity_2m: [] as number[],
    precipitation: [] as number[],
    wind_speed_10m: [] as number[],
  };

  for (let i = 0; i < hours; i++) {
    const time = new Date(startDate.getTime() + i * 60 * 60 * 1000);
    const hourOfDay = time.getHours();
    const dayOfYear = Math.floor(
      (time.getTime() - new Date(time.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Temperature variations
    const dailyVariation = Math.sin(((hourOfDay - 6) * Math.PI) / 12) * 8; // Diurnal cycle
    const seasonalVariation = Math.sin(((dayOfYear - 80) * 2 * Math.PI) / 365) * 15; // Yearly cycle
    const randomVariation = (Math.random() - 0.5) * 4; // Random noise

    const temperature = baseTemp + dailyVariation + seasonalVariation + randomVariation;

    hourly.time.push(time.toISOString());
    hourly.temperature_2m.push(Math.round(temperature * 10) / 10);
    hourly.relative_humidity_2m.push(Math.round((50 + Math.random() * 40) * 10) / 10);
    hourly.precipitation.push(
      Math.round((Math.random() < 0.1 ? Math.random() * 5 : 0) * 10) / 10
    );
    hourly.wind_speed_10m.push(Math.round((5 + Math.random() * 15) * 10) / 10);
  }

  return { hourly };
}
