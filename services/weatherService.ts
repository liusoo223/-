import type { WeatherApiResponse } from '../types';

// This is a mock function simulating a tool call based on the provided spec.
const mockGetWeather = async (lat: number, lon: number): Promise<WeatherApiResponse> => {
    console.log(`Fetching weather for lat: ${lat}, lon: ${lon}`);
    // In a real app, this would be an API call.
    // We'll return a sample rainy day to match the user's request.
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
    return {
        temp_c: 15.0,
        precip_mm: 5.0, // This ensures the weather maps to '비' (Rain)
        wind_mps: 4.0,
        condition: "rain"
    };
};

export const mapApiResponseToWeather = (apiResponse: WeatherApiResponse): string => {
    const { temp_c, precip_mm, wind_mps, condition } = apiResponse;

    if (condition === 'snow' || (precip_mm > 0 && temp_c <= 0)) {
        return '눈';
    }
    if (precip_mm > 0) {
        return '비';
    }
    if (temp_c <= 5) {
        return '추움';
    }
    if (temp_c >= 27) {
        return '더움';
    }
    // A reasonable threshold for "strong wind" might be ~8 m/s
    if (wind_mps > 8 && temp_c > 5 && temp_c < 18) {
        return '바람';
    }
    return '맑음';
};


export const getAutomaticWeather = async (coords: GeolocationCoordinates): Promise<string> => {
    const apiResponse = await mockGetWeather(coords.latitude, coords.longitude);
    return mapApiResponseToWeather(apiResponse);
};