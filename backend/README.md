# Chrome Extension Backend API

A comprehensive backend API for a Chrome extension that captures screenshots, extracts phone numbers using OCR, and exports data to Excel format.

## Features

- 📸 **Screenshot Upload & Management**
- 🔍 **Phone Number Extraction** using advanced regex patterns
- 📊 **Data Analytics & Statistics**
- 📈 **Excel/CSV Export** functionality
- 🔒 **Security & Rate Limiting**
- 📝 **Comprehensive Logging**

## API Endpoints

### Screenshots
- `POST /api/screenshots/upload` - Upload screenshot
- `POST /api/screenshots/:id/process` - Process screenshot for phone extraction
- `GET /api/screenshots` - Get all screenshots (with pagination)
- `GET /api/screenshots/:id` - Get single screenshot
- `GET /api/screenshots/stats` - Get screenshot statistics
- `DELETE /api/screenshots/:id` - Delete screenshot

### Phone Numbers
- `GET /api/phone-numbers` - Get all phone numbers (with filters)
- `GET /api/phone-numbers/:id` - Get single phone number
- `PUT /api/phone-numbers/:id` - Update phone number
- `DELETE /api/phone-numbers/:id` - Delete phone number
- `GET /api/phone-numbers/stats` - Get phone number statistics
- `GET /api/phone-numbers/export/excel` - Export to Excel
- `GET /api/phone-numbers/export/csv` - Export to CSV

### Health Check
- `GET /api/health` - API health status

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB connection string
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Start Production Server**
   ```bash
   npm start
   ```

## Database Models

### Screenshot Model
- File metadata (filename, path, size, mime type)
- Source URL and page title
- Processing status
- Associated phone numbers
- Timestamps

### PhoneNumber Model
- Extracted phone number data
- Confidence scores
- Position information
- Context and validation status
- Country code detection

## Phone Number Extraction

The system uses multiple regex patterns to detect phone numbers:
- US/Canada formats: `(XXX) XXX-XXXX`
- International formats: `+XX XXX XXX XXXX`
- Country-specific patterns for India, UK, China, Germany
- Context-aware confidence scoring

## Excel Export Features

- **Multiple Worksheets**: Main data, Summary, Country breakdown
- **Rich Formatting**: Column widths, data types
- **Statistics**: Validity rates, confidence scores
- **Filtering**: By date, country, validity status

## Security Features

- **Helmet.js**: Security headers
- **Rate Limiting**: 100 requests per 15 minutes
- **CORS**: Configurable origins
- **File Validation**: Image type and size limits
- **Error Handling**: Comprehensive error responses

## Development

### File Structure
```
backend/
├── config/
│   └── db.js              # Database connection
├── controllers/
│   ├── screenshotController.js
│   └── phoneNumberController.js
├── models/
│   ├── Screenshot.js
│   └── PhoneNumber.js
├── routers/
│   ├── screenshotRoutes.js
│   ├── phoneNumberRoutes.js
│   └── index.js
├── utils/
│   ├── phoneExtractor.js
│   └── excelGenerator.js
├── uploads/                # Screenshot storage
├── index.js               # Main server file
└── package.json
```

### API Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": { ... }  // For paginated endpoints
}
```

## Usage Examples

### Upload Screenshot
```bash
curl -X POST http://localhost:4000/api/screenshots/upload \
  -F "screenshot=@screenshot.png" \
  -F "url=https://example.com" \
  -F "title=Example Page"
```

### Process Screenshot
```bash
curl -X POST http://localhost:4000/api/screenshots/{id}/process \
  -H "Content-Type: application/json" \
  -d '{"extractedText": "Call us at (555) 123-4567"}'
```

### Export to Excel
```bash
curl -X GET "http://localhost:4000/api/phone-numbers/export/excel?isValid=true" \
  -o phone_numbers.xlsx
```

## Environment Variables

- `MONGO_URI`: MongoDB connection string
- `PORT`: Server port (default: 4000)
- `NODE_ENV`: Environment (development/production)
- `FRONTEND_URL`: Frontend URL for CORS

## Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **multer**: File upload handling
- **xlsx**: Excel file generation
- **sharp**: Image processing
- **helmet**: Security middleware
- **cors**: Cross-origin resource sharing
- **express-rate-limit**: Rate limiting
- **morgan**: HTTP request logger

## License

MIT License
