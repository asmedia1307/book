# CLAUDE.md - AI Assistant Guide for AI Book Generator

## Repository Overview

This is an **AI-powered book generator web application** that creates professional technical books using Claude Sonnet 4 API.

**Repository Name:** `asmedia1307/book`
**Primary Purpose:** Web application for generating AI-written technical books
**Live URL:** https://book.asteffen.de/
**Stack:** React Frontend + PHP 8.2 Backend + MySQL + Docker

---

## Project Structure

```
/book
├── CLAUDE.md                # This file - AI assistant guide
├── README.md                # Project documentation
├── docker-compose.yml       # Docker configuration (external)
├── html/                    # Mapped to Docker /var/www/html
│   ├── index.html          # Entry point
│   ├── api/                # PHP Backend
│   │   ├── auth.php        # Authentication
│   │   ├── storage.php     # Data persistence API
│   │   ├── proxy.php       # Claude API proxy
│   │   └── config.php      # Database config
│   ├── js/                 # JavaScript
│   │   └── app.js          # React application
│   ├── css/                # Stylesheets
│   │   └── styles.css      # Custom styles
│   └── database/           # SQL schemas
│       └── schema.sql      # Database initialization
└── .gitignore              # Git ignore patterns
```

### Key Components

- **index.html**: Single-page application entry point
- **api/**: PHP backend for authentication, storage, and Claude API proxy
- **js/app.js**: React frontend with all book generation logic
- **database/**: MySQL schema for projects, chapters, and research sources

---

## Technology Stack

### Frontend
- **React 18**: Component-based UI (via CDN)
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library
- **Babel Standalone**: JSX transformation in browser

### Backend
- **PHP 8.2**: Server-side logic
- **Apache**: Web server
- **MySQL 8**: Database
- **PDO**: Database access layer

### External APIs
- **Claude Sonnet 4 API**: AI text generation
- **Web Search Tool**: Research functionality (web_search_20250305)

### Infrastructure
- **Docker**: Containerization
- **Docker Networks**: asmmysql, webproxy
- **HTTPS Proxy**: Production deployment

---

## Application Features

### Core Functionality
1. **Project Management**: Create and manage multiple book projects
2. **Chapter System**: Organize books into chapters with metadata
3. **Two-Stage Generation**:
   - Generate outline first (4-6 sections with subsections)
   - Generate full chapter content based on outline
4. **Research Integration**: Web search with source storage
5. **Content Editing**: In-app editor with live word/character count
6. **Version Control**: Track chapter revisions
7. **Export**: Download chapters as UTF-8 .txt files
8. **Authentication**: Secure login system (admin/future)

### AI Generation Requirements
- **Human-like writing**: No AI clichés or phrases
- **Variable section lengths**: 150-800 words per subsection
- **Diverse sentence structures**: Mix of short and long sentences
- **Practical examples**: 4-5 concrete examples per chapter
- **Context awareness**: Use previous chapters to avoid redundancy
- **Target compliance**: Minimum 85% of target word count
- **Stylistic variety**: Rhetorical questions, analogies, lists, prose

---

## Database Schema

### Tables

**users**
```sql
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- username (VARCHAR(50), UNIQUE)
- password_hash (VARCHAR(255))
- created_at (TIMESTAMP)
```

**projects**
```sql
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- user_id (INT, FOREIGN KEY)
- title (VARCHAR(255))
- field (VARCHAR(100))
- audience (VARCHAR(100))
- tone (VARCHAR(50))
- created_at (TIMESTAMP)
```

**chapters**
```sql
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- project_id (INT, FOREIGN KEY)
- title (VARCHAR(255))
- topic (TEXT)
- order_num (INT)
- word_target (INT)
- outline (TEXT)
- content (LONGTEXT)
- status (ENUM: draft, outline, written, edited)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

**sources**
```sql
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- project_id (INT, FOREIGN KEY)
- topic (VARCHAR(255))
- content (TEXT)
- url (VARCHAR(500))
- added_at (TIMESTAMP)
```

**chapter_versions**
```sql
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- chapter_id (INT, FOREIGN KEY)
- content (LONGTEXT)
- version_num (INT)
- created_at (TIMESTAMP)
```

---

## API Endpoints

### Authentication
**POST /api/auth.php**
```json
{
  "action": "login",
  "username": "admin",
  "password": "future!"
}
// Returns: { success: true, token: "..." }
```

### Storage API
**POST /api/storage.php**

**Get all data:**
```json
{ "action": "get" }
// Returns: { projects: [], chapters: [], sources: [] }
```

**Save project:**
```json
{
  "action": "saveProject",
  "project": { title, field, audience, tone }
}
```

**Save chapter:**
```json
{
  "action": "saveChapter",
  "chapter": { projectId, title, topic, order, wordTarget, outline, content, status }
}
```

**Delete project/chapter/source:**
```json
{
  "action": "deleteProject",
  "id": 123
}
```

### Claude API Proxy
**POST /api/proxy.php**
```json
{
  "model": "claude-sonnet-4-5-20250929",
  "max_tokens": 16000,
  "tools": [{ "type": "web_search_20250305", "name": "web_search" }],
  "messages": [...]
}
// Proxies to: https://api.anthropic.com/v1/messages
```

---

## Git Workflow

### Branch Strategy
- **Main branch**: Production deployments
- **Feature branches**: Use `claude/` prefix for AI assistant work
- **Branch naming**: `claude/feature-description-sessionid`

### Commit Messages
Follow conventional commit format:
```
type: Brief description (50 chars or less)

More detailed explanation if needed (wrap at 72 chars).
```

**Types:**
- `feat`: New features or functionality
- `fix`: Bug fixes
- `docs`: Documentation updates
- `refactor`: Code refactoring
- `style`: Code style/formatting
- `chore`: Build process, dependencies

### Commit Best Practices
1. **Atomic commits**: One logical change per commit
2. **Test before commit**: Verify functionality works
3. **No secrets**: Never commit API keys, passwords, or credentials
4. **Don't commit**: node_modules, vendor/, .env files

---

## Development Workflow

### Local Development Setup
1. **Docker is required** - application runs in containers
2. **Git clone** the repository
3. **Import database schema**: `html/database/schema.sql`
4. **Configure environment**: Update docker-compose.yml if needed
5. **Start containers**: `docker-compose up -d`
6. **Access app**: http://localhost (or configured port)

### Docker Commands
```bash
# Start containers
docker-compose up -d

# View logs
docker logs book -f

# Restart after code changes
docker restart book

# Access container shell
docker exec -it book bash

# Stop containers
docker-compose down
```

### Making Code Changes

**Frontend (React):**
1. Edit `html/js/app.js`
2. Refresh browser (Babel transforms JSX on-the-fly)
3. Check browser console for errors

**Backend (PHP):**
1. Edit files in `html/api/`
2. Changes take effect immediately (no restart needed)
3. Check Apache error logs: `docker logs book`

**Database:**
1. Connect via MySQL client
2. Or use `docker exec -it <mysql-container> mysql -u book -p`
3. Update `html/database/schema.sql` if schema changes

### Testing Workflow
1. **Manual testing**: Use browser DevTools
2. **API testing**: Use Postman or curl
3. **Database verification**: Check data persistence
4. **Authentication**: Test login/logout flows
5. **Claude API**: Verify generation with small test prompts

---

## AI Assistant Guidelines

### General Principles
1. **Read before writing**: Always read existing files before modification
2. **Maintain consistency**: Match existing code style and patterns
3. **Ask when uncertain**: Use AskUserQuestion for clarification
4. **Track your work**: Use TodoWrite to manage complex tasks
5. **Test thoroughly**: Verify all functionality works

### Code Standards

**React Components:**
- Use functional components with hooks (useState, useEffect)
- Keep components in single file for this project
- Use controlled inputs for all forms
- Implement proper event handling (preventDefault, stopPropagation)
- Add loading states for async operations

**PHP Backend:**
- Use PDO for database access (never mysqli)
- Always use prepared statements (SQL injection protection)
- Return JSON responses with proper headers
- Implement error handling with try-catch
- Validate all input data

**Security:**
- **NEVER commit API keys** in code
- Hash passwords with password_hash()
- Validate and sanitize all user input
- Use prepared statements for SQL
- Implement CSRF protection
- Set secure headers

**CSS/Styling:**
- Use Tailwind utility classes
- Keep custom CSS minimal
- Ensure responsive design
- Use consistent spacing and colors

### Feature Implementation

**When adding features:**
1. **Plan**: Break down into smaller tasks
2. **Backend first**: Create API endpoints
3. **Frontend**: Build UI components
4. **Integration**: Connect frontend to backend
5. **Test**: Verify all functionality
6. **Error handling**: Add try-catch and user feedback

**When fixing bugs:**
1. **Reproduce**: Understand the exact issue
2. **Locate**: Find the problematic code
3. **Fix**: Make minimal, targeted changes
4. **Test**: Verify fix works
5. **Regression test**: Ensure nothing else broke

### Database Operations
- Always use prepared statements
- Handle connection errors gracefully
- Use transactions for multi-step operations
- Index foreign keys for performance
- Regular backups in production

### API Integration
- **Claude API**: Use model `claude-sonnet-4-5-20250929`
- **Max tokens**: 16000 for chapters, 4000 for outlines
- **Tool use**: Enable web_search when needed
- **Error handling**: Catch API errors and show user-friendly messages
- **Rate limiting**: Implement delays if needed

### Git Operations
- **Commit regularly**: After each complete feature
- **Push when done**: Push to the designated branch
- **Follow branch rules**: Never push to main without permission
- **Use retry logic**: Retry push/fetch with exponential backoff if needed
- **Clear messages**: Describe what changed and why

### Error Handling
- **Backend**: Try-catch with JSON error responses
- **Frontend**: Try-catch with alert() or UI notifications
- **Database**: Handle connection and query errors
- **API**: Handle network failures and API errors
- **User feedback**: Always inform user what went wrong

---

## Deployment

### Production Deployment
The application auto-deploys from the repository to Docker container.

**Deployment Flow:**
1. Push to repository
2. Docker container pulls changes
3. Files sync to `/var/www/html`
4. Apache serves immediately (no build step)

**Production URL:** https://book.asteffen.de/

**Docker Configuration:**
- Image: php:8.2-apache
- Container: book
- Networks: asmmysql, webproxy
- Volumes: ./html -> /var/www/html
- Environment: DB credentials set

### Database Setup
1. Access MySQL container
2. Import `html/database/schema.sql`
3. Verify tables created
4. Create default admin user

### Environment Variables
```bash
DB_HOST=mysql
DB_NAME=book
DB_USER=book
DB_PASS=aLsTkXT0o]]9uKB@
```

**IMPORTANT**: Never commit real credentials to git!

---

## Quality Checklist

Before committing changes, verify:

**Functionality:**
- [ ] All buttons work (especially delete functions)
- [ ] Forms use controlled inputs (useState)
- [ ] API calls have error handling
- [ ] Loading states shown during async operations
- [ ] User feedback for all actions

**Security:**
- [ ] No API keys in code
- [ ] SQL uses prepared statements
- [ ] Input validation on backend
- [ ] XSS protection (escape output)
- [ ] Authentication checks work

**Code Quality:**
- [ ] Console has no errors
- [ ] Code is readable and commented
- [ ] Functions are small and focused
- [ ] No hardcoded values (use constants)
- [ ] Consistent naming conventions

**Testing:**
- [ ] Login/logout works
- [ ] CRUD operations for projects work
- [ ] CRUD operations for chapters work
- [ ] AI generation produces content
- [ ] Export downloads correct file
- [ ] Data persists after refresh

**Git:**
- [ ] Commit message is clear
- [ ] No sensitive data committed
- [ ] Changes pushed to correct branch

---

## Common Tasks

### Adding a New Feature
1. **Plan**: Create TodoWrite list with tasks
2. **Database**: Update schema if needed
3. **Backend**: Create/modify API endpoints
4. **Frontend**: Add UI components
5. **Test**: Verify all functionality
6. **Commit**: Clear commit message
7. **Push**: To designated branch

### Debugging Issues
```bash
# Check PHP errors
docker logs book -f

# Access MySQL
docker exec -it <mysql-container> mysql -u book -p

# View Apache config
docker exec -it book cat /etc/apache2/sites-enabled/000-default.conf

# Restart container
docker restart book
```

### Adding API Endpoints
1. Create new function in appropriate PHP file
2. Use PDO for database operations
3. Validate input data
4. Return JSON response
5. Update CLAUDE.md with endpoint documentation
6. Test with Postman or browser

### Modifying React Components
1. Edit `html/js/app.js`
2. Use browser DevTools to test
3. Check console for errors
4. Verify state updates correctly
5. Test all user interactions

### Database Changes
1. Update `html/database/schema.sql`
2. Create migration queries if needed
3. Test on local database first
4. Document changes in CLAUDE.md
5. Backup production database before applying

---

## Tools and Resources

### Development Tools
- **Browser DevTools**: Debugging, Network tab, Console
- **Docker Desktop**: Container management
- **MySQL Workbench**: Database management
- **Postman**: API testing
- **VSCode**: Code editor

### Useful Commands
```bash
# Docker
docker ps                           # List running containers
docker logs book -f                 # Follow container logs
docker exec -it book bash          # Access container shell

# Git
git status                          # Check current state
git log --oneline -10              # Recent commits
git diff                           # See changes

# Database
docker exec -it <mysql> mysql -u book -p book
SHOW TABLES;                        # List tables
DESCRIBE projects;                  # Show table structure
SELECT * FROM projects;             # View data
```

### API Testing Examples
```bash
# Test login
curl -X POST https://book.asteffen.de/api/auth.php \
  -H "Content-Type: application/json" \
  -d '{"action":"login","username":"admin","password":"future!"}'

# Test storage API
curl -X POST https://book.asteffen.de/api/storage.php \
  -H "Content-Type: application/json" \
  -d '{"action":"get"}'
```

---

## FAQ for AI Assistants

**Q: Where should I store the Claude API key?**
A: In a PHP config file NOT committed to git. Use environment variables or a config.php excluded in .gitignore.

**Q: How do I test the Claude API integration?**
A: Use a small prompt first (e.g., "Write 100 words about testing") to verify connectivity before generating full chapters.

**Q: What if the database schema needs to change?**
A: Update schema.sql, create migration SQL, test locally, then apply to production with backup.

**Q: How do I handle CORS errors?**
A: Backend should set proper CORS headers. For Claude API, use the PHP proxy.php endpoint.

**Q: Should I use localStorage or window.storage?**
A: Use the backend storage API (window.storage), NOT localStorage or sessionStorage.

**Q: How do I make delete buttons work?**
A: Use e.preventDefault() and e.stopPropagation(), add confirmation dialogs, and properly handle the API response.

**Q: What character encoding should I use?**
A: UTF-8 everywhere - database, PHP, HTML meta tags, file exports.

**Q: How do I debug "headers already sent" errors?**
A: Remove any output before header() calls, check for BOM in PHP files, ensure no whitespace before <?php.

---

## Project Status

**Current Phase:** Full Implementation
**Last Updated:** 2026-01-21
**Active Branch:** `claude/claude-md-mkohu6ltqdp03vr6-u5Z6m`
**Production URL:** https://book.asteffen.de/

### Implementation Checklist
- [ ] Database schema created (schema.sql)
- [ ] PHP backend APIs (auth, storage, proxy)
- [ ] React frontend application
- [ ] Authentication system (admin/future!)
- [ ] Project management CRUD
- [ ] Chapter management CRUD
- [ ] AI generation (outline + content)
- [ ] Research/web search integration
- [ ] Content editor with word count
- [ ] Export functionality (.txt)
- [ ] Version control for chapters
- [ ] README.md documentation
- [ ] .gitignore file
- [ ] Testing and verification

---

## Security Considerations

### Critical Security Rules
1. **Never commit secrets**: API keys, passwords, database credentials
2. **Use .gitignore**: Exclude config files with sensitive data
3. **Prepared statements only**: Prevent SQL injection
4. **Hash passwords**: Use password_hash() and password_verify()
5. **Validate input**: Sanitize all user input on backend
6. **HTTPS only**: Production must use SSL
7. **Session security**: Use secure session configuration
8. **CORS headers**: Configure properly for API access

### Recommended .gitignore Entries
```
# Secrets and config
api/config.php
.env

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Logs
*.log
error_log
```

---

## Performance Optimization

### Frontend
- Minimize re-renders: Use proper React hooks
- Debounce input: For search and auto-save
- Lazy load: Large content areas
- Cache API responses: When appropriate

### Backend
- Use indexes: On foreign keys and frequently queried fields
- Connection pooling: For database connections
- Cache: Consider Redis for frequently accessed data
- Optimize queries: Use EXPLAIN to analyze

### Database
- Index foreign keys
- Regular ANALYZE TABLE
- Monitor slow query log
- Use appropriate column types

---

## Troubleshooting

### Common Issues

**"Failed to fetch" errors:**
- Check API endpoint URL is correct
- Verify CORS headers are set
- Check Docker container is running
- Review browser Network tab

**Database connection errors:**
- Verify DB credentials in environment
- Check MySQL container is running
- Test connection from PHP: `docker exec -it book php -r "new PDO(...)"`

**Claude API errors:**
- Verify API key is set correctly
- Check token limits aren't exceeded
- Review request format matches API docs
- Check for rate limiting

**React not rendering:**
- Check browser console for errors
- Verify Babel is loading JSX correctly
- Check React/ReactDOM CDN links
- Validate component syntax

**File not found (404):**
- Check file paths are correct
- Verify .htaccess or Apache config
- Check file permissions in container

---

## Version History

- **v2.0** (2026-01-21): Complete rewrite for AI Book Generator application
  - Changed from book documentation to web application
  - Added React + PHP + MySQL stack documentation
  - Documented API endpoints and database schema
  - Added Docker deployment instructions
  - Included security and troubleshooting sections

- **v1.0** (2026-01-21): Initial CLAUDE.md creation
  - Basic repository structure guidelines

---

## Notes for AI Assistants

### Important Reminders
- **Read existing code**: Before modifying any file
- **Test thoroughly**: Every change should be tested
- **Security first**: Never compromise security for convenience
- **User feedback**: Always inform users of success/failure
- **Error handling**: Wrap async operations in try-catch
- **Documentation**: Update CLAUDE.md when adding features

### When Implementing Features
1. Start with database schema if needed
2. Build backend API endpoints
3. Create frontend UI
4. Connect frontend to backend
5. Add error handling
6. Test all user flows
7. Update documentation

### Code Review Checklist
- [ ] No console.log() in production code
- [ ] All user input is validated
- [ ] Error messages are user-friendly
- [ ] Loading states are implemented
- [ ] Responsive design works on mobile
- [ ] No hardcoded credentials
- [ ] SQL uses prepared statements
- [ ] API responses are properly handled

Remember: **This is a production application. Quality, security, and user experience are paramount.**
