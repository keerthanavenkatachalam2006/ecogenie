const axios = require('axios');

// @desc    Get current weather
// @route   GET /api/weather
// @access  Private
const getWeather = async (req, res, next) => {
  try {
    const location = req.query.location || req.user.preferences?.location || 'New York';
    const apiKey = process.env.WEATHER_API_KEY;

    if (!apiKey || apiKey === 'your_openweathermap_api_key') {
      // Return mock weather data when API key is not configured
      return res.json({
        success: true,
        weather: getMockWeather(location),
        source: 'mock',
      });
    }

    const response = await axios.get(
      `${process.env.WEATHER_API_URL}/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`,
      { timeout: 5000 }
    );

    const data = response.data;
    res.json({
      success: true,
      weather: {
        location: data.name,
        country: data.sys.country,
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        windSpeed: data.wind.speed,
        visibility: data.visibility / 1000,
        pressure: data.main.pressure,
        condition: data.weather[0].main,
        sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString(),
        sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString(),
      },
      source: 'live',
    });
  } catch (error) {
    // Fallback to mock data on API error
    const location = req.query.location || 'New York';
    res.json({
      success: true,
      weather: getMockWeather(location),
      source: 'mock',
    });
  }
};

const getMockWeather = (location) => {
  const conditions = ['Clear', 'Clouds', 'Rain', 'Drizzle'];
  const condition = conditions[Math.floor(Math.random() * conditions.length)];
  const temp = Math.round(18 + Math.random() * 20);

  return {
    location,
    country: 'US',
    temperature: temp,
    feelsLike: temp - 2,
    humidity: Math.round(40 + Math.random() * 40),
    description: condition.toLowerCase(),
    icon: condition === 'Clear' ? '01d' : condition === 'Clouds' ? '03d' : '10d',
    windSpeed: parseFloat((2 + Math.random() * 8).toFixed(1)),
    visibility: parseFloat((8 + Math.random() * 4).toFixed(1)),
    pressure: Math.round(1010 + Math.random() * 20),
    condition,
    sunrise: '06:15 AM',
    sunset: '07:45 PM',
  };
};

module.exports = { getWeather };
