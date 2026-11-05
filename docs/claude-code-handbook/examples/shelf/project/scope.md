# Shelf — project scope

## Problem
I read in bursts and lose track of what I own, what I am reading, and what I thought of finished books.
Notes apps are too loose; big book sites are too heavy and do not expose an API I can script.

## Solution
A small reading-list **API** (with a tiny web page on top) that tracks books through
`to-read → reading → done`, lets me rate finished books, and can be used from scripts, email, and AI tools.

## Features (first brain-dump — unfiltered)
- Add, view, edit and delete books
- Status tracking and ratings for finished books
- Search by title/author, filter by status, sort
- Pagination for long lists
- Statistics (counts, pages read, average rating)
- Multiple users, each with a private shelf; an admin who can see everything
- Add a book by sending an email
- AI: guess the genre; summarise my notes
- Reading reminders
- Import from CSV
- Share a shelf publicly
- Mobile app
- Recommendations

## Open questions (before we clarify)
- What exactly is a "user"? Do people sign themselves up?
- What are the valid statuses, and can a rating exist on an unfinished book?
- How should errors look to a script calling the API?
