# Contact Manager

A full-stack contact management application built with Node.js and Express, featuring a RESTful API for managing contacts with full CRUD functionality.

## Features

- **Create** new contacts with name, phone number, email, and tags
- **Read** all contacts or retrieve individual contacts by ID
- **Update** existing contact information
- **Delete** contacts from the database
- JSON file-based data persistence
- API documentation included
- Comprehensive test suite

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **body-parser** - Request body parsing middleware
- **fs** - File system operations for data persistence
- **json-beautify** - JSON formatting

### Frontend
- **jQuery** - DOM manipulation and AJAX requests
- **Handlebars.js** - Templating engine

### Testing
- **Mocha** - Test framework
- **Chai** - Assertion library
- **Chai-HTTP** - HTTP integration testing

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd contact_manager_node
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Running the Server

**Development mode:**
```bash
npm start
```

**Production mode:**
```bash
npm run server
```

The server will start on `http://localhost:3000` (or the port specified in the PORT environment variable).

### Running Tests

```bash
npm test
```

Tests run on port 4567 with a separate test database to avoid interfering with development data.

## API Endpoints

### Get All Contacts
```
GET /api/contacts
```
Returns an array of all contacts.

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "full_name": "John Doe",
    "phone_number": "1234567890",
    "email": "john@example.com",
    "tags": "friend,colleague"
  }
]
```

### Get Single Contact
```
GET /api/contacts/:id
```
Returns a specific contact by ID.

**Response:** `200 OK` or `404 Not Found`

### Create Contact
```
POST /api/contacts
```
Creates a new contact. Requires `full_name` in the request body.

**Request Body:**
```json
{
  "full_name": "Jane Smith",
  "phone_number": "0987654321",
  "email": "jane@example.com",
  "tags": "friend"
}
```

**Response:** `201 Created` or `400 Bad Request`

### Update Contact
```
PUT /api/contacts/:id
```
Updates an existing contact. Preserves fields not included in the request.

**Request Body:**
```json
{
  "full_name": "Jane Doe",
  "email": "jane.doe@example.com"
}
```

**Response:** `201 Created` or `400 Bad Request`

### Delete Contact
```
DELETE /api/contacts/:id
```
Deletes a contact by ID.

**Response:** `204 No Content` or `400 Bad Request`

## Project Structure

```
contact_manager_node/
├── contacts.js              # Main server file with API routes
├── package.json             # Project dependencies and scripts
├── lib/
│   ├── contact_manager.js   # Contact data management logic
│   └── helpers.js           # Helper functions for request parsing
├── data/
│   ├── contacts.json        # Development contact data
│   └── contacts_test.json   # Test contact data
├── test/
│   └── contacts_test.js     # API endpoint tests
└── public/
    ├── index.html           # Frontend interface
    ├── javascripts/
    │   ├── jquery.js
    │   └── handlebars.js
    └── doc/                 # API documentation
        └── index.html
```

## Contact Data Structure

Each contact contains the following fields:

- `id` (number) - Auto-generated unique identifier
- `full_name` (string) - **Required** - Contact's full name
- `phone_number` (string) - Contact's phone number
- `email` (string) - Contact's email address
- `tags` (string) - Comma-separated tags for categorization

## Development Notes

- The application uses JSON files for data persistence
- Separate data files are maintained for development and testing environments
- Environment is controlled via the `NODE_ENV` variable
- All IDs are auto-generated and sequential
- The server serves static files from the `public` directory

## API Documentation

Visit `/doc/index.html` when the server is running to view the complete API documentation.

## License

Private - For educational purposes.

## Author

NF
