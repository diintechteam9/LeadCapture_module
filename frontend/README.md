# Chrome Extension Frontend

A modern React dashboard for managing screenshots and extracted phone numbers from the Chrome extension backend.

## Features

- 📸 **Screenshot Upload** - Drag & drop interface for uploading screenshots
- 📱 **Phone Number Management** - View, filter, and manage extracted phone numbers
- 📊 **Analytics Dashboard** - Comprehensive statistics and charts
- 📈 **Data Export** - Export data to Excel and CSV formats
- 🎨 **Modern UI** - Built with Tailwind CSS and Lucide React icons

## Tech Stack

- **React 19** - Frontend framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Toast notifications
- **Lucide React** - Icon library
- **Recharts** - Chart library for analytics

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Backend server running on port 4000

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

4. **Preview Production Build**
   ```bash
   npm run preview
   ```

## Project Structure

```
frontend/src/
├── components/
│   ├── Dashboard.jsx          # Main dashboard component
│   ├── ScreenshotUpload.jsx   # Screenshot upload interface
│   ├── PhoneNumbersList.jsx   # Phone numbers management
│   ├── Statistics.jsx         # Analytics and charts
│   └── ExportData.jsx         # Data export functionality
├── services/
│   └── api.js                 # API service for backend communication
├── App.jsx                    # Main app component
├── main.jsx                   # App entry point
└── index.css                  # Global styles
```

## Components Overview

### Dashboard
- Main application interface with tabbed navigation
- Statistics cards showing key metrics
- Centralized state management

### ScreenshotUpload
- Drag & drop file upload interface
- File validation and preview
- Form fields for URL and title metadata

### PhoneNumbersList
- Paginated table of extracted phone numbers
- Advanced filtering and search capabilities
- Inline editing and deletion

### Statistics
- Interactive charts and graphs
- Country distribution analysis
- Confidence and validity metrics
- Daily extraction trends

### ExportData
- Excel and CSV export functionality
- Advanced filtering options
- Download management

## API Integration

The frontend communicates with the backend through the `api.js` service:

- **Screenshot API**: Upload, process, and manage screenshots
- **Phone Number API**: CRUD operations, statistics, and exports
- **Health Check**: API status monitoring

## Environment Configuration

The frontend is configured to connect to the backend at `http://localhost:4000/api`. Make sure your backend server is running before starting the frontend.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- Uses ESLint for code quality
- Follows React best practices
- Responsive design with Tailwind CSS
- Component-based architecture

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Follow the existing code style
2. Use meaningful component and variable names
3. Add proper error handling
4. Test all functionality before submitting

## License

MIT License