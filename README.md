# AI Book Generator

A professional web application for generating technical books using Claude Sonnet 4 AI.

## Features

- **Project Management**: Create and manage multiple book projects
- **Two-Stage Generation**: Generate outline first, then full chapter content
- **Human-like Writing**: AI configured to write naturally without clichés
- **Research Integration**: Web search functionality for topic research
- **Content Editor**: In-app editor with live word and character count
- **Version Control**: Track chapter revisions
- **Export**: Download chapters as UTF-8 text files
- **Secure Authentication**: Login system for user access

## Technology Stack

- **Frontend**: React 18, Tailwind CSS, Lucide Icons
- **Backend**: PHP 8.2, Apache
- **Database**: MySQL 8
- **AI**: Claude Sonnet 4 API (Anthropic)
- **Infrastructure**: Docker

## Prerequisites

- Docker and Docker Compose
- MySQL 8 container (or external MySQL server)
- Claude API key from Anthropic

## Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd book
```

### 2. Database Setup

Import the database schema:

```bash
# Access your MySQL container
docker exec -it <mysql-container-name> mysql -u book -p

# In MySQL prompt:
CREATE DATABASE IF NOT EXISTS book CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE book;
SOURCE /path/to/html/database/schema.sql;
```

Or import directly:

```bash
docker exec -i <mysql-container-name> mysql -u book -p book < html/database/schema.sql
```

### 3. Configure API Key

Edit `html/api/config.php` and add your Claude API key:

```php
define('CLAUDE_API_KEY', 'your-api-key-here');
```

**Security Note**: Never commit `config.php` to git. It's already in `.gitignore`.

### 4. Start Docker Container

Your docker-compose.yml should look like this:

```yaml
services:
  book:
    image: php:8.2-apache
    container_name: book
    restart: always
    volumes:
      - ./html:/var/www/html
    expose:
      - "80"
    environment:
      DB_HOST: mysql
      DB_NAME: book
      DB_USER: book
      DB_PASS: "your_password_here"
    networks:
      - asmmysql
      - webproxy
    command: >
      bash -c "
      docker-php-ext-install pdo pdo_mysql &&
      apache2-foreground
      "

networks:
  asmmysql:
    external: true
  webproxy:
    external: true
```

Start the container:

```bash
docker-compose up -d
```

### 5. Access Application

- **Local**: http://localhost
- **Production**: https://book.asteffen.de/

## Default Login

- **Username**: `admin`
- **Password**: `future!`

**Important**: Change the admin password in production!

## Usage

### Creating a Project

1. Click "New Project"
2. Enter:
   - Project title
   - Field/topic (e.g., "Software Development")
   - Target audience (e.g., "Intermediate Developers")
   - Writing tone (professional, casual, academic, conversational)
3. Click "Create Project"

### Adding Chapters

1. Select your project
2. Go to "Chapters" tab
3. Click "Add Chapter"
4. Enter:
   - Chapter title
   - Topic description
   - Order number
   - Target word count
5. Click "Create Chapter"

### Generating Content

1. **Generate Outline**:
   - Expand the chapter
   - Click "Generate Outline"
   - Review the generated outline

2. **Generate Content**:
   - After outline is ready
   - Click "Generate Content"
   - Wait for AI to write the chapter (may take 1-2 minutes)
   - Review the generated content

3. **Edit and Revise**:
   - Edit content directly in the textarea
   - Use "Revise" feature for AI-assisted improvements
   - Click "Save" to persist changes

4. **Export**:
   - Click "Export" to download as .txt file
   - Click "Copy" to copy to clipboard

### Research

1. Go to "Research" tab
2. Click "New Research"
3. Enter research topic
4. Click "Research" (uses web search)
5. Save results for reference

## Project Structure

```
/book
├── CLAUDE.md                # AI assistant guide
├── README.md                # This file
├── .gitignore               # Git ignore rules
├── html/                    # Web root (mapped to Docker)
│   ├── index.html          # Entry point
│   ├── api/                # PHP backend
│   │   ├── config.php      # Configuration (not in git)
│   │   ├── auth.php        # Authentication
│   │   ├── storage.php     # Data persistence
│   │   └── proxy.php       # Claude API proxy
│   ├── js/                 # JavaScript
│   │   └── app.js          # React application
│   └── database/           # SQL schemas
│       └── schema.sql      # Database initialization
```

## API Endpoints

### Authentication

**POST /api/auth.php**

Login:
```json
{
  "action": "login",
  "username": "admin",
  "password": "future!"
}
```

Logout:
```json
{
  "action": "logout"
}
```

### Storage

**POST /api/storage.php**

Get all data:
```json
{
  "action": "get"
}
```

Save project:
```json
{
  "action": "saveProject",
  "project": {
    "title": "My Book",
    "field": "Technology",
    "audience": "Professionals",
    "tone": "professional"
  }
}
```

Save chapter:
```json
{
  "action": "saveChapter",
  "chapter": {
    "project_id": 1,
    "title": "Introduction",
    "topic": "Overview of the topic",
    "order_num": 1,
    "word_target": 2000
  }
}
```

### Claude API Proxy

**POST /api/proxy.php**

All Claude API requests are proxied through this endpoint to hide the API key.

## Configuration

### Database

Database credentials are configured via environment variables in `docker-compose.yml`:

```yaml
environment:
  DB_HOST: mysql
  DB_NAME: book
  DB_USER: book
  DB_PASS: "your_password_here"
```

### Claude API

Claude API key must be set in `html/api/config.php`:

```php
define('CLAUDE_API_KEY', 'your-api-key-here');
```

Get your API key from: https://console.anthropic.com/

### Session

Session lifetime is set to 24 hours by default. Modify in `config.php`:

```php
define('SESSION_LIFETIME', 86400); // seconds
```

## Development

### Local Development

1. Make code changes in `html/` directory
2. Refresh browser (no build step required)
3. Check browser console for errors
4. View Docker logs: `docker logs book -f`

### Debugging

**PHP Errors:**
```bash
docker logs book -f
```

**Database:**
```bash
docker exec -it <mysql-container> mysql -u book -p book
```

**API Testing:**
```bash
# Test authentication
curl -X POST http://localhost/api/auth.php \
  -H "Content-Type: application/json" \
  -d '{"action":"login","username":"admin","password":"future!"}'
```

## Troubleshooting

### Database Connection Failed

- Check MySQL container is running: `docker ps`
- Verify credentials in `docker-compose.yml`
- Test connection: `docker exec -it book php -r "new PDO(...)"`

### Claude API Errors

- Verify API key is set correctly in `config.php`
- Check API key is valid at https://console.anthropic.com/
- Review rate limits and usage

### Login Not Working

- Check database has users table with admin user
- Verify password hash matches in database
- Check session configuration

### Content Not Saving

- Check browser console for errors
- Verify storage API endpoints are accessible
- Check database permissions

## Security

### Important Security Measures

1. **Never commit `config.php`** - contains sensitive credentials
2. **Use HTTPS in production** - protect data in transit
3. **Change default password** - admin/future! is for initial setup only
4. **Sanitize inputs** - already implemented in backend
5. **Use prepared statements** - already implemented for SQL
6. **Keep API key secure** - never expose in frontend

### Recommended Production Settings

1. Set `DEBUG_MODE` to `false` in `config.php`
2. Disable error display in PHP
3. Use environment variables for credentials
4. Enable HTTPS only
5. Implement rate limiting for API endpoints

## Backup

### Database Backup

```bash
docker exec <mysql-container> mysqldump -u book -p book > backup.sql
```

### Restore Database

```bash
docker exec -i <mysql-container> mysql -u book -p book < backup.sql
```

## License

This project is proprietary software. All rights reserved.

## Support

For issues or questions:

1. Check CLAUDE.md for development guidelines
2. Review browser console and server logs
3. Verify API credentials and database connection

## Changelog

### Version 1.0 (2026-01-21)

- Initial release
- Project and chapter management
- Two-stage AI generation (outline + content)
- Research functionality with web search
- Content editor with revision support
- Export to text files
- Authentication system
- MySQL persistent storage

## Credits

- Built with Claude Sonnet 4 (Anthropic)
- React, Tailwind CSS, Lucide Icons
- PHP, MySQL, Docker
