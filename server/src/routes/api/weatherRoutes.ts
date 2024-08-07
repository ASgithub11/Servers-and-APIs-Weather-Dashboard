import { Router, type Request, type Response } from 'express';
const router = Router();

// import HistoryService from '../../service/historyService.js';
import HistoryService from '../../service/historyService.js';

// import WeatherService from '../../service/weatherService.js';
import WeatherService from '../../service/weatherService.js';

const historyService = new HistoryService();
const weatherService = new WeatherService();

// TODO: POST Request with city name to retrieve weather data
router.post('/', async (req: Request, res: Response) => {
  // TODO: GET weather data from city name
  const city = req.body.city;

  if (!city) {
    return res.status(400).json({ message: 'City name is required' });
  }
  try {
    const locationData = await weatherService.fetchLocationData(city);
    const weatherData = await weatherService.fetchWeatherData(locationData);
    const currentWeather = weatherService.parseCurrentWeather(weatherData);
    const forecastWeather = weatherService.buildForecastWeather(currentWeather, weatherData.list);

  // TODO: save city to search history
  const savedCity = await historyService.saveCity(city);

  return res.status(200).json({ currentWeather, forecastWeather, savedCity });
  } catch (error) {
  console.error(error);
  return res.status(500).json({ message: 'Unable to fetch weather data' });
  }
});

// TODO: GET search history
router.get('/history', async (req: Request, res: Response) => {
  try {
    const history = await historyService.getHistory();
    return res.status(200).json(history);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to fetch search history' });
  }
});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req: Request, res: Response) => {
  const cityId = req.params.id;

  if (!cityId) {
    return res.status(400).json({ message: 'City ID is required' });
  }
  try {
    const deletedCity = await historyService.deleteCity(cityId);
    if (deletedCity) {
      return res.status(200).json({message: 'City deleted from search history'});
    } else {
      return res.status(404).json({message: 'City ${cityId} not found in search history'});
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({message: 'Unable to delete city from search history'});
  }
});

export default router;
