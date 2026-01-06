/**
 * ================================================================
 * DATABASE SEEDER
 * ================================================================
 *
 * Seeds the database with sample data for development and testing.
 * Creates admin user, sample users, blogs, and comments.
 *
 * @author Daily Blogs Team
 * @version 1.0.0
 *
 * Usage: npm run seed
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Models
const User = require("../models/User");
const Blog = require("../models/Blog");
const Comment = require("../models/Comment");

// ============================================
// SAMPLE DATA
// ============================================

const users = [
  {
    name: "Admin User",
    email: "admin@dailyblogs.com",
    password: "Admin123",
    role: "admin",
    bio: "Administrator of Daily Blogs platform. Managing content and users.",
    isActive: true,
  },
  {
    name: "John Doe",
    email: "john@example.com",
    password: "John123",
    role: "user",
    bio: "Full-stack developer passionate about React and Node.js.",
    isActive: true,
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    password: "Jane123",
    role: "user",
    bio: "UI/UX designer with a love for clean, accessible interfaces.",
    isActive: true,
  },
  {
    name: "Mike Wilson",
    email: "mike@example.com",
    password: "Mike123",
    role: "moderator",
    bio: "Content moderator and tech enthusiast.",
    isActive: true,
  },
];

const blogTemplates = [
  {
    title: "Getting Started with React: A Beginner's Guide",
    description:
      "Learn the fundamentals of React.js, including components, props, state, and hooks. Perfect for developers new to React.",
    content: `
# Getting Started with React

React is a powerful JavaScript library for building user interfaces. In this guide, we'll cover the essential concepts you need to know to get started.

## What is React?

React is a declarative, efficient, and flexible JavaScript library for building user interfaces. It lets you compose complex UIs from small and isolated pieces of code called "components".

## Why Choose React?

1. **Component-Based**: Build encapsulated components that manage their own state
2. **Declarative**: React makes it painless to create interactive UIs
3. **Learn Once, Write Anywhere**: Develop new features without rewriting existing code

## Your First Component

\`\`\`jsx
function Welcome({ name }) {
    return <h1>Hello, {name}!</h1>;
}
\`\`\`

## Understanding Props and State

Props are read-only inputs to components, while state is managed within the component and can change over time.

## Hooks: The Modern Way

React Hooks let you use state and other React features without writing a class:

\`\`\`jsx
import { useState } from 'react';

function Counter() {
    const [count, setCount] = useState(0);
    
    return (
        <button onClick={() => setCount(count + 1)}>
            Count: {count}
        </button>
    );
}
\`\`\`

## Conclusion

React is an excellent choice for modern web development. Start with these basics and gradually explore more advanced concepts!
        `,
    category: "React",
    tags: ["react", "javascript", "frontend", "tutorial"],
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
    status: "published",
    isFeatured: true,
  },
  {
    title: "Building RESTful APIs with Node.js and Express",
    description:
      "A comprehensive tutorial on creating robust REST APIs using Node.js and Express. Includes authentication, validation, and best practices.",
    content: `
# Building RESTful APIs with Node.js and Express

Learn how to build professional-grade REST APIs with Node.js and Express.js.

## Setting Up Your Project

First, initialize your project and install dependencies:

\`\`\`bash
npm init -y
npm install express mongoose dotenv
\`\`\`

## Creating Your Express Server

\`\`\`javascript
const express = require('express');
const app = express();

app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy' });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
\`\`\`

## RESTful Route Design

Follow these conventions:
- GET /api/resources - List all
- GET /api/resources/:id - Get one
- POST /api/resources - Create
- PUT /api/resources/:id - Update
- DELETE /api/resources/:id - Delete

## Error Handling

Implement centralized error handling for clean, consistent responses.

## Best Practices

1. Use proper HTTP status codes
2. Validate all inputs
3. Implement rate limiting
4. Use HTTPS in production
5. Document your API

Happy coding!
        `,
    category: "Development",
    tags: ["nodejs", "express", "api", "backend"],
    image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800",
    status: "published",
    isFeatured: true,
  },
  {
    title: "CSS Grid vs Flexbox: When to Use Which",
    description:
      "Understand the differences between CSS Grid and Flexbox, and learn when to use each layout method for optimal results.",
    content: `
# CSS Grid vs Flexbox

Both CSS Grid and Flexbox are powerful layout tools, but they serve different purposes.

## Flexbox: One-Dimensional Layout

Flexbox is designed for one-dimensional layouts - either rows OR columns.

\`\`\`css
.container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
\`\`\`

Best for:
- Navigation menus
- Card layouts in a row
- Centering content
- Footer layouts

## CSS Grid: Two-Dimensional Layout

Grid is designed for two-dimensional layouts - rows AND columns simultaneously.

\`\`\`css
.container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
}
\`\`\`

Best for:
- Page layouts
- Complex dashboard designs
- Image galleries
- Form layouts

## Using Them Together

The best approach is often to use both:
- Grid for the overall page structure
- Flexbox for component-level alignment

## Conclusion

Choose Flexbox for simpler, one-direction layouts. Choose Grid for complex, two-dimensional designs.
        `,
    category: "Design",
    tags: ["css", "flexbox", "grid", "layout"],
    image: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800",
    status: "published",
    isFeatured: false,
  },
  {
    title: "JavaScript Best Practices for 2024",
    description:
      "Stay up-to-date with modern JavaScript best practices. Learn about clean code, performance optimization, and maintainable patterns.",
    content: `
# JavaScript Best Practices for 2024

Keep your JavaScript code clean, efficient, and maintainable with these best practices.

## Use Modern Syntax

### Destructuring
\`\`\`javascript
const { name, email } = user;
const [first, ...rest] = items;
\`\`\`

### Optional Chaining
\`\`\`javascript
const city = user?.address?.city ?? 'Unknown';
\`\`\`

### Nullish Coalescing
\`\`\`javascript
const value = input ?? defaultValue;
\`\`\`

## Async/Await Best Practices

\`\`\`javascript
async function fetchData() {
    try {
        const response = await fetch('/api/data');
        return await response.json();
    } catch (error) {
        console.error('Fetch failed:', error);
        throw error;
    }
}
\`\`\`

## Error Handling

Always handle errors gracefully and provide meaningful messages.

## Performance Tips

1. Debounce expensive operations
2. Use Web Workers for heavy computation
3. Lazy load modules when possible
4. Memoize expensive calculations

## Code Organization

- Keep functions small and focused
- Use meaningful variable names
- Add comments for complex logic
- Write unit tests

Follow these practices to write better JavaScript!
        `,
    category: "JavaScript",
    tags: ["javascript", "best-practices", "clean-code"],
    image: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800",
    status: "published",
    isFeatured: true,
  },
  {
    title: "Web Accessibility: Making Your Sites Inclusive",
    description:
      "Learn how to create accessible websites that everyone can use. Covers ARIA, semantic HTML, keyboard navigation, and testing.",
    content: `
# Web Accessibility: Making Your Sites Inclusive

Accessibility isn't optional—it's essential for creating truly inclusive web experiences.

## Why Accessibility Matters

- 15% of the world's population has some form of disability
- Accessible sites have better SEO
- It's often a legal requirement
- It improves UX for everyone

## Semantic HTML

Use proper HTML elements:

\`\`\`html
<nav aria-label="Main navigation">
    <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
    </ul>
</nav>

<main>
    <article>
        <h1>Article Title</h1>
        <p>Content here...</p>
    </article>
</main>
\`\`\`

## ARIA Attributes

Use ARIA when HTML isn't enough:

\`\`\`html
<button 
    aria-expanded="false" 
    aria-controls="menu"
>
    Toggle Menu
</button>
\`\`\`

## Keyboard Navigation

- All interactive elements must be keyboard accessible
- Use visible focus indicators
- Logical tab order

## Color and Contrast

- Minimum 4.5:1 contrast ratio for text
- Don't rely solely on color to convey information

## Testing Your Site

1. Use screen readers (VoiceOver, NVDA)
2. Navigate with keyboard only
3. Use automated tools (axe, Lighthouse)
4. Test with real users

Make the web accessible for everyone!
        `,
    category: "Accessibility",
    tags: ["accessibility", "a11y", "html", "aria"],
    image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800",
    status: "published",
    isFeatured: false,
  },
  {
    title: "MongoDB Aggregation Pipeline: A Complete Guide",
    description:
      "Master MongoDB aggregation pipelines with practical examples. Learn stages like $match, $group, $lookup, and more.",
    content: `
# MongoDB Aggregation Pipeline

The aggregation pipeline is MongoDB's powerful framework for data transformation and analysis.

## What is Aggregation?

Aggregation operations process data records and return computed results. The pipeline consists of stages that transform documents.

## Common Stages

### $match - Filter Documents
\`\`\`javascript
{ $match: { status: 'published' } }
\`\`\`

### $group - Group and Aggregate
\`\`\`javascript
{
    $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgViews: { $avg: '$views' }
    }
}
\`\`\`

### $sort - Order Results
\`\`\`javascript
{ $sort: { createdAt: -1 } }
\`\`\`

### $lookup - Join Collections
\`\`\`javascript
{
    $lookup: {
        from: 'users',
        localField: 'authorId',
        foreignField: '_id',
        as: 'author'
    }
}
\`\`\`

## Full Pipeline Example

\`\`\`javascript
db.blogs.aggregate([
    { $match: { status: 'published' } },
    { $group: { 
        _id: '$category', 
        totalBlogs: { $sum: 1 } 
    }},
    { $sort: { totalBlogs: -1 } },
    { $limit: 5 }
]);
\`\`\`

## Performance Tips

1. Use $match early to reduce documents
2. Create indexes on filtered fields
3. Use $project to limit fields
4. Consider allowDiskUse for large datasets

Master aggregation for powerful data analysis!
        `,
    category: "Tutorial",
    tags: ["mongodb", "database", "aggregation", "nosql"],
    image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800",
    status: "published",
    isFeatured: false,
  },
];

const commentTemplates = [
  "Great article! This really helped me understand the concept better.",
  "Thanks for sharing! I've been looking for a clear explanation like this.",
  "Very well written. Could you cover more advanced topics in a follow-up post?",
  "This is exactly what I needed for my project. Much appreciated!",
  "Excellent tutorial! The code examples are really helpful.",
  "I learned something new today. Thanks for the detailed explanation!",
  "Clear and concise. Perfect for beginners like me.",
  "Would love to see more content like this!",
];

// ============================================
// SEED FUNCTIONS
// ============================================

/**
 * Clear all existing data
 */
const clearDatabase = async () => {
  console.log("🗑️  Clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    Blog.deleteMany({}),
    Comment.deleteMany({}),
  ]);
  console.log("✅ Database cleared\n");
};

/**
 * Seed users
 */
const seedUsers = async () => {
  console.log("👤 Seeding users...");
  const createdUsers = await User.create(users);
  console.log(`✅ Created ${createdUsers.length} users\n`);
  return createdUsers;
};

/**
 * Seed blogs
 */
const seedBlogs = async (createdUsers) => {
  console.log("📝 Seeding blogs...");

  const blogs = blogTemplates.map((blog, index) => ({
    ...blog,
    author: createdUsers[index % createdUsers.length]._id,
    publishedAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000), // Different dates
    viewCount: Math.floor(Math.random() * 1000),
    likeCount: Math.floor(Math.random() * 100),
  }));

  const createdBlogs = await Blog.create(blogs);
  console.log(`✅ Created ${createdBlogs.length} blogs\n`);
  return createdBlogs;
};

/**
 * Seed comments
 */
const seedComments = async (createdUsers, createdBlogs) => {
  console.log("💬 Seeding comments...");

  const comments = [];

  // Add 2-4 comments per blog
  for (const blog of createdBlogs) {
    const numComments = Math.floor(Math.random() * 3) + 2;

    for (let i = 0; i < numComments; i++) {
      const randomUser =
        createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const randomComment =
        commentTemplates[Math.floor(Math.random() * commentTemplates.length)];

      comments.push({
        text: randomComment,
        blog: blog._id,
        author: randomUser._id,
        createdAt: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
        ),
      });
    }
  }

  const createdComments = await Comment.create(comments);
  console.log(`✅ Created ${createdComments.length} comments\n`);
  return createdComments;
};

// ============================================
// MAIN SEED FUNCTION
// ============================================

const seed = async () => {
  try {
    console.log("\n========================================");
    console.log("🌱 Starting Database Seed");
    console.log("========================================\n");

    // Connect to MongoDB
    console.log("📦 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Clear existing data
    await clearDatabase();

    // Seed data
    const createdUsers = await seedUsers();
    const createdBlogs = await seedBlogs(createdUsers);
    await seedComments(createdUsers, createdBlogs);

    // Summary
    console.log("========================================");
    console.log("✅ Database seeded successfully!");
    console.log("========================================\n");
    console.log("📋 Summary:");
    console.log(`   - Users: ${createdUsers.length}`);
    console.log(`   - Blogs: ${createdBlogs.length}`);
    console.log("\n🔐 Admin Credentials:");
    console.log("   Email: admin@dailyblogs.com");
    console.log("   Password: Admin123\n");

    // Disconnect
    await mongoose.disconnect();
    console.log("📦 Disconnected from MongoDB\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Seed failed:");
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

// Run seeder
seed();
