## Environment Variables

This project uses environment variables to store sensitive information like API keys. To set up your environment:

1. Create a `.env.local` file in the root directory
2. Add the following variables:

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

**Important:** Never commit your `.env.local` file to version control. It's already added to `.gitignore` to prevent accidental commits.

### Google Maps API Key

To obtain a Google Maps API key:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Create an API key in the Credentials section
5. Restrict the API key to your domains for security

For development, make sure to add `localhost` to the allowed domains. 