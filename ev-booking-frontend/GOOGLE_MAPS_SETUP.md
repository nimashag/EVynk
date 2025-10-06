# Google Maps Setup Instructions

## 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API (optional, for enhanced features)
4. Create credentials (API Key)
5. Restrict the API key to your domain for security

## 2. Configure Environment Variables

Create a `.env` file in the `ev-booking-frontend` directory with:

```
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

## 3. API Key Restrictions (Recommended)

For security, restrict your API key:

1. **Application restrictions**: HTTP referrers
2. **Website restrictions**: Add your domain (e.g., `localhost:5173/*`, `yourdomain.com/*`)
3. **API restrictions**: Select only the APIs you need:
   - Maps JavaScript API
   - Geocoding API

## 4. Features Enabled

- **Location Picker**: Interactive map for selecting charging station locations
- **Sri Lanka Bounds**: Map is restricted to Sri Lanka only
- **Reverse Geocoding**: Automatically gets address from coordinates
- **Station Map**: Shows all charging stations on the admin dashboard
- **Drag & Drop**: Markers can be dragged to adjust location

## 5. Usage

The location picker will:
- Show only Sri Lanka on the map
- Allow clicking to select locations
- Provide address information automatically
- Support dragging markers for fine-tuning

## 6. Troubleshooting

If maps don't load:
1. Check your API key is correct
2. Verify the APIs are enabled
3. Check browser console for errors
4. Ensure your domain is in the API key restrictions
