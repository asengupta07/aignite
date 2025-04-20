# IntersectAI

A modern web application with a Next.js frontend and Python backend, designed to provide AI-powered solutions.

## Project Structure

The project is divided into two main parts:

### Frontend (`/client`)
- Built with Next.js 14
- Uses TypeScript for type safety
- Styled with Tailwind CSS
- Modern component architecture
- Key directories:
  - `/app` - Next.js app router pages and layouts
  - `/components` - Reusable UI components
  - `/lib` - Utility functions and configurations
  - `/types` - TypeScript type definitions
  - `/utils` - Helper functions
  - `/public` - Static assets

### Backend (`/backend`)
- Python-based backend
- RESTful API architecture
- Key directories:
  - `/agents` - AI agent implementations
  - `/models` - Data models and schemas
  - `/utils` - Utility functions

## Prerequisites

- Node.js (v18 or higher)
- Python (v3.8 or higher)
- pnpm (for frontend package management)
- pip (for Python package management)

## Setup Instructions

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create a `.env.local` file with the necessary environment variables (see `.env.local.example`)

4. Start the development server:
   ```bash
   pnpm dev
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file with the necessary environment variables

5. Start the backend server:
   ```bash
   python app.py
   ```

## Development

- Frontend runs on `http://localhost:3000`
- Backend runs on `http://localhost:5000`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[Add your license information here]

## Contact

[Add your contact information here]
