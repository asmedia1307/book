# CLAUDE.md - AI Assistant Guide for Book Repository

## Repository Overview

This is a book/documentation repository. The project is currently in its initial setup phase.

**Repository Name:** `asmedia1307/book`
**Primary Purpose:** Documentation, book content, or educational material
**Current State:** Initial setup - repository structure to be established

---

## Project Structure

As this repository develops, it should follow a clear organizational structure:

```
/book
├── CLAUDE.md           # This file - AI assistant guide
├── README.md           # Project overview and getting started
├── chapters/           # Main content organized by chapters
│   ├── 01-introduction/
│   ├── 02-chapter-name/
│   └── ...
├── assets/             # Images, diagrams, and media files
│   ├── images/
│   ├── diagrams/
│   └── resources/
├── code/               # Code examples and samples
│   ├── examples/
│   └── snippets/
├── drafts/             # Work-in-progress content
├── references/         # Bibliography, links, and citations
└── build/              # Generated output (gitignored)
```

### Key Directories

- **chapters/**: Main book content, organized numerically or by topic
- **assets/**: All media files (images, diagrams, PDFs)
- **code/**: Executable code examples that accompany the book
- **drafts/**: Work-in-progress chapters and experimental content
- **references/**: Research materials, bibliography, external resources

---

## File Naming Conventions

### Chapters and Content
- Use lowercase with hyphens: `01-introduction.md`, `02-getting-started.md`
- Prefix with numbers for ordered content: `01-`, `02-`, `03-`
- Use descriptive names that reflect the content

### Assets
- Images: `chapter-name-description.png` or `fig-01-diagram-name.png`
- Keep filenames descriptive and searchable
- Use lowercase with hyphens

### Code Examples
- Language-appropriate naming: `example_01.py`, `HelloWorld.java`
- Include context in filename: `chapter-02-data-structures.py`

---

## Writing Standards

### Markdown Format
- Use **Markdown** for all content files (`.md` extension)
- Follow CommonMark specification with GitHub Flavored Markdown extensions
- Use consistent heading hierarchy (don't skip levels)

### Heading Structure
```markdown
# Chapter Title (H1 - once per file)

## Section Title (H2)

### Subsection (H3)

#### Detail Level (H4)
```

### Content Guidelines
1. **Clarity**: Write clearly and concisely
2. **Consistency**: Maintain consistent terminology throughout
3. **Examples**: Include practical examples where appropriate
4. **Code Blocks**: Use syntax highlighting with language specifiers
5. **Links**: Use relative links for internal references

### Code Block Style
```markdown
\```python
def example_function():
    """Always include docstrings."""
    return "Use proper syntax highlighting"
\```
```

---

## Git Workflow

### Branch Strategy
- **Main branch**: Production-ready content
- **Feature branches**: Use `claude/` prefix for AI assistant work
- **Branch naming**: `claude/feature-description-sessionid`

### Commit Messages
Follow conventional commit format:
```
type: Brief description (50 chars or less)

More detailed explanation if needed (wrap at 72 chars).

- Bullet points for multiple changes
- Reference issues with #issue-number
```

**Types:**
- `feat`: New chapter or major content addition
- `fix`: Corrections, typos, or content fixes
- `docs`: Documentation updates (README, CLAUDE.md)
- `refactor`: Reorganization without content changes
- `style`: Formatting, markdown cleanup
- `chore`: Build process, tooling updates

### Commit Best Practices
1. **Atomic commits**: One logical change per commit
2. **Clear messages**: Explain what and why, not just what
3. **Review before commit**: Check for typos, formatting issues
4. **Don't commit**: Build artifacts, temporary files, `.DS_Store`

---

## Development Workflow

### Starting New Work
1. Ensure you're on the correct branch (check branch requirements)
2. Pull latest changes: `git fetch origin <branch>`
3. Verify current state: `git status`
4. Plan your work using TodoWrite tool

### Adding New Content
1. **Research**: Review existing content for consistency
2. **Draft**: Create content in appropriate location
3. **Review**: Check formatting, links, and code examples
4. **Commit**: Use clear commit messages
5. **Push**: Push to designated branch

### Editing Existing Content
1. **Read first**: Always read the full file before editing
2. **Preserve style**: Match existing tone and formatting
3. **Track changes**: Use git to show what was modified
4. **Test links**: Verify all internal and external links work
5. **Check examples**: Ensure code examples are correct and runnable

---

## AI Assistant Guidelines

### General Principles
1. **Read before writing**: Always read existing files before modification
2. **Maintain consistency**: Match existing style, tone, and conventions
3. **Ask when uncertain**: Use AskUserQuestion for clarification
4. **Track your work**: Use TodoWrite to manage complex tasks
5. **Be thorough**: Check for broken links, formatting issues, typos

### Content Creation
- **Research existing content** to avoid duplication
- **Match the author's voice** and writing style
- **Use appropriate technical depth** for the intended audience
- **Include practical examples** that readers can understand
- **Cite sources** when referencing external material

### Code Examples
- **Test before committing**: Ensure code examples work
- **Use best practices**: Follow language-specific conventions
- **Comment thoroughly**: Explain complex logic
- **Keep it simple**: Examples should be educational, not production-ready
- **Match book context**: Examples should relate to surrounding content

### Editing Guidelines
- **Preserve meaning**: Don't change the author's intent
- **Fix errors**: Correct typos, grammar, and technical inaccuracies
- **Improve clarity**: Simplify complex sentences when appropriate
- **Maintain flow**: Ensure smooth transitions between sections
- **Update cross-references**: Keep internal links accurate

### File Operations
- **Use Read tool** to examine files before editing
- **Use Edit tool** for modifications to existing files
- **Use Write tool** only for new files
- **Use Glob/Grep** to search for content and patterns
- **Avoid bash commands** for file operations

### Git Operations
- **Commit regularly**: Don't batch unrelated changes
- **Push when done**: Push to the designated branch
- **Follow branch rules**: Never push to main without permission
- **Use retry logic**: Retry push/fetch with exponential backoff if needed
- **Write clear messages**: Future readers should understand your changes

### Error Handling
- **Check git status** before and after operations
- **Verify file paths** exist before reading/writing
- **Handle missing files** gracefully
- **Report issues** clearly to the user
- **Suggest fixes** when problems arise

---

## Build and Publishing

### Prerequisites
(To be defined as project develops)
- Build tools (e.g., pandoc, mdBook, Jekyll)
- Dependencies for code examples
- Image processing tools if needed

### Build Process
(To be defined - examples below)

```bash
# Example build commands
make build          # Build the book
make serve          # Preview locally
make clean          # Clean build artifacts
```

### Output Formats
- HTML (web version)
- PDF (print version)
- EPUB (e-book version)
- Other formats as needed

---

## Quality Checklist

Before committing changes, verify:

- [ ] All markdown is properly formatted
- [ ] Headings follow consistent hierarchy
- [ ] Code blocks have language specifiers
- [ ] Internal links use relative paths and work correctly
- [ ] External links are valid and accessible
- [ ] Images are properly referenced and exist
- [ ] Code examples are syntactically correct
- [ ] Spelling and grammar are correct
- [ ] Content matches the book's style and tone
- [ ] Git commit message is clear and descriptive
- [ ] Changes are pushed to the correct branch

---

## Common Tasks

### Adding a New Chapter
1. Create chapter directory: `mkdir -p chapters/XX-chapter-name`
2. Create main content file: `chapters/XX-chapter-name/index.md`
3. Add to table of contents (if applicable)
4. Add any associated assets to `assets/images/chapterXX/`
5. Update navigation/links as needed

### Adding Code Examples
1. Place in `code/examples/chapterXX/`
2. Include comments and documentation
3. Reference from chapter content
4. Test that examples run correctly
5. Include any necessary setup instructions

### Fixing Typos or Errors
1. Read the full section for context
2. Make minimal, focused changes
3. Commit with type `fix:` and clear description
4. Push immediately (no need to batch typo fixes)

### Reorganizing Content
1. Plan the reorganization (use TodoWrite)
2. Update all internal links
3. Update table of contents
4. Verify no broken links remain
5. Commit with type `refactor:` and detailed explanation

---

## Tools and Resources

### Recommended Tools
- **Markdown Editor**: VSCode with Markdown extensions
- **Git Client**: Command line or GUI client
- **Spell Checker**: Integrated or standalone
- **Link Checker**: Tool to verify all links

### Useful Commands
```bash
# Search for content
grep -r "search term" chapters/

# Find broken links (if using markdown-link-check)
find . -name "*.md" -exec markdown-link-check {} \;

# Word count
wc -w chapters/**/*.md

# Git operations
git status                          # Check current state
git log --oneline -10               # Recent commits
git diff                            # See changes
git add -p                          # Stage changes interactively
```

---

## FAQ for AI Assistants

**Q: Should I create a table of contents?**
A: Check if one exists first. If creating one, place it in README.md or a dedicated TOC.md file.

**Q: How technical should the content be?**
A: Match the existing content's technical level. When in doubt, ask the user.

**Q: Should I add images or diagrams?**
A: Only if explicitly requested or clearly necessary. Always ask first.

**Q: Can I reorganize the chapter structure?**
A: Only with explicit permission. Suggest reorganization but don't implement without approval.

**Q: Should I fix code examples in different languages?**
A: Yes, if they're incorrect. Maintain the same language unless asked to change.

**Q: How do I handle conflicting information between chapters?**
A: Point it out to the user and ask for clarification before making changes.

**Q: Should I add references or citations?**
A: Yes, when referencing external sources. Use a consistent citation format.

**Q: Can I use AI-generation disclaimers in commits?**
A: No, just write clear commit messages describing the changes made.

---

## Project Status

**Current Phase:** Initial Setup
**Last Updated:** 2026-01-21
**Active Branch:** `claude/claude-md-mkohu6ltqdp03vr6-u5Z6m`

### To Be Established
- [ ] README.md with project overview
- [ ] Chapter structure and organization
- [ ] Build system and tooling
- [ ] .gitignore file for build artifacts
- [ ] Sample chapter template
- [ ] Code example standards

---

## Contact and Support

For questions about this guide or the repository structure:
1. Check existing issues in the repository
2. Review recent commits for context
3. Ask the user for clarification when needed

---

## Version History

- **v1.0** (2026-01-21): Initial CLAUDE.md creation for empty repository
  - Established directory structure guidelines
  - Defined markdown and writing standards
  - Documented git workflow and conventions
  - Created comprehensive AI assistant guidelines

---

## Notes

This guide will evolve as the project develops. Keep it updated with:
- New tools and build processes
- Established conventions and patterns
- Lessons learned during development
- Frequently encountered issues and solutions

Remember: **This guide exists to maintain consistency and quality. When in doubt, ask the user rather than making assumptions.**
