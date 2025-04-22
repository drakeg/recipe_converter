# Healthy Recipe Converter

A web application that helps users convert traditional recipes into healthier versions by suggesting ingredient substitutions. The app includes features for saving recipes, generating grocery lists, and meal planning.

## Features

- **Recipe Conversion**: Automatically converts traditional recipes into healthier versions
- **User Authentication**: Secure login and signup functionality
- **Premium Features** (for paid subscribers):
  - Save converted recipes
  - Generate grocery lists with smart ingredient parsing
  - Meal planning (coming soon)

## Tech Stack

### Backend
- Django
- Django REST Framework
- SQLite (development) / PostgreSQL (production)
- JWT Authentication

### Frontend
- React
- React Router
- React Bootstrap
- Context API for state management

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm or yarn

### Backend Setup

1. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run migrations:
```bash
python manage.py migrate
```

4. Start the development server:
```bash
python manage.py runserver
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/users/token/` - Get JWT tokens
- `POST /api/users/token/refresh/` - Refresh JWT token
- `POST /api/users/signup/` - Create new user account

### Recipes
- `GET /api/recipes/recipes/` - List all recipes
- `POST /api/recipes/recipes/` - Create new recipe
- `GET /api/recipes/saved-recipes/` - List user's saved recipes
- `POST /api/recipes/saved-recipes/` - Save a recipe
- `DELETE /api/recipes/saved-recipes/{id}/` - Delete saved recipe

### Grocery Lists
- `GET /api/recipes/grocery-lists/` - List user's grocery lists
- `POST /api/recipes/grocery-lists/` - Create new grocery list
- `GET /api/recipes/grocery-lists/{id}/` - Get specific grocery list
- `DELETE /api/recipes/grocery-lists/{id}/` - Delete grocery list
- `POST /api/recipes/grocery-lists/{id}/items/` - Add item to grocery list
- `PATCH /api/recipes/grocery-items/{id}/` - Update grocery item
- `DELETE /api/recipes/grocery-items/{id}/` - Delete grocery item

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
