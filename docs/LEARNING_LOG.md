# Database design
3 data tables: User, Gathering, Responses

  User
  ├─ id               (UUID, primary key)
  ├─ email            (string, unique)
  ├─ name             (string)
  ├─ created_at       (timestamp)
  └─ updated_at       (timestamp)

    Gathering
  ├─ id                   (UUID, primary key)
  ├─ organizer_id         (UUID, foreign key → User.id)
  ├─ title                (string)
  ├─ location             (string)
  ├─ time_options         (JSON array)
  ├─ rsvp_deadline        (timestamp)
  ├─ status               (enum: "collecting" | "completed" | "failed" | "cancelled")
  ├─ agent_output         (JSON, nullable)
  ├─ created_at           (timestamp)
  └─ updated_at           (timestamp)

    Response
  ├─ gathering_id       ← Join table part
  ├─ user_id            ← Join table part
  ├─ availability       ← Extra data
  ├─ budget_max         ← Extra data
  ├─ cuisine_prefs      ← Extra data
  └─ dietary_restrictions ← Extra data

  ## JSON for agent_output
   Pros:
  - ✅ Flexible schema (agent output structure can change)
  - ✅ Fewer tables (simpler joins)
  - ✅ Atomic operations (load everything in 1 query)
  - ✅ Fast for prototype

  Cons:
  - ❌ Can't query inside JSON easily ("find gatherings with Italian in recommendations")
  - ❌ No schema validation at database level (could store any JSON)
  - ❌ If JSON gets huge, slow to load

  ## Using timestamps instead of string for date time options
    Why Strings Are Dangerous

  Problems you identified:
  - ❌ "Sat 11 Oct" - Which year? 2025? 2026?
  - ❌ "10am-12pm" vs "10:00 AM" vs "10-12" - Parsing chaos
  - ❌ No timezone info - Is "10am" in Melbourne time? User's local time?
  - ❌ Can't validate: Database accepts "Blurgsday 99 Octember"
  - ❌ Can't query: "Find gatherings in the next 7 days" requires string parsing
  - ❌ Agent gets messy data: Has to interpret "Sat" vs "Saturday" vs "2025-10-11"

    Revised Approach: Structured Timestamps

  Gathering Time Options (Organizer Sets)

  Instead of:
  time_options: ["Sat 11 Oct 10am-12pm", "Sun 12 Oct 10am-12pm"]

  Use:
  time_options: [
    {
      "start": "2025-10-11T10:00:00+11:00",  // ISO 8601 with timezone
      "end": "2025-10-11T12:00:00+11:00",
      "label": "Sat 11 Oct 10am-12pm"         // Display only
    },
    {
      "start": "2025-10-12T10:00:00+11:00",
      "end": "2025-10-12T12:00:00+11:00",
      "label": "Sun 12 Oct 10am-12pm"
    }
  ]

  Why this structure:
  - ✅ start/end: Machine-readable timestamps with timezone
  - ✅ label: Human-readable for display (optional, can generate from timestamps)
  - ✅ Timezone included: +11:00 is Melbourne (AEDT)
  - ✅ Unambiguous: Year, month, day, hour, minute, timezone all explicit

  ## DB relationships
  - One-to-One, One-to-Many: eg one user can organise multiple gatherings
  - Cardinality: what happens when one key is deleted? 
  * DELETE RESTRICT //Can't delete user if they organise gathering
  * ON DELETE CASCADE // Delete gatherings if organiser is deleted
  * ON DELETE SET NULL: // If user is deleted the gathering is orphaned, set to organiser id = null

  ## Decide what is required 
  Nullable fields (What can be empty?
    Nullable Fields (What Can Be Empty?)

  User:
  - email - NOT NULL ✅ (required for identity)
  - name - NOT NULL ✅ (required for display)

  Gathering:
  - organizer_id - NOT NULL ✅ (must have owner)
  - title - NOT NULL ✅ (must have name)
  - location - NOT NULL ✅ (required for venue search)
  - timezone - NOT NULL ✅ (required for time interpretation)
  - time_options - NOT NULL ✅ (need at least one option)
  - rsvp_deadline - NOT NULL ✅ (when to trigger agent)
  - status - NOT NULL ✅ (always has state)
  - agent_output - NULLABLE ✅ (only after agent runs)

  Response:
  - gathering_id - NOT NULL ✅ (must belong to gathering)
  - user_id - NULLABLE ⚠️ (if user deleted, set null)
  - available_time_slot_indices - NOT NULL ✅ (must pick at least one? Question below)
  - budget_max - NULLABLE ✅ (flexible budget = null)
  - cuisine_preferences - NOT NULL ✅ (can be empty array [])
  - dietary_restrictions - NULLABLE ✅ (most people have none)
  - additional_notes - NULLABLE ✅ (optional)

  ## Prisma vs SQL vs JS schema
  Ways to store or retrieve data for applications:
  - Raw SQL: Write SQL queries directly as strings
  - Query builder: javascript functions that generate SQL
  - ORM (Object Relational Mapper): Map database tables to JavaScript/TypeScript objects eg Prisma, TypeORM, Sequelize
    | Feature           | Raw SQL | Knex (Query Builder) | Prisma (ORM)   | TypeORM (ORM) |
  |-------------------|---------|----------------------|----------------|---------------|
  | Type Safety       | ❌       | ❌                    | ✅✅✅            | ✅✅            |
  | Schema Management | Manual  | Manual               | Auto-generated | Decorators    |
  | Learning Curve    | High    | Medium               | Low            | Medium        |
  | Beginner Friendly | ❌       | ⚠️                   | ✅              | ⚠️            |
  | SQL Control       | Full    | Full                 | Limited        | Medium        |
  | Migrations        | Manual  | Manual               | Auto           | Semi-auto     |

Raw SQL
  Pros:
  - ✅ Full control (write any SQL you want)
  - ✅ Maximum performance (can optimize queries)

  Cons:
  - ❌ No type safety - gatherings[0].titel (typo) fails at runtime
  - ❌ SQL injection risk - User input in string interpolation
  - ❌ Manual schema management - You write CREATE TABLE statements by hand
  - ❌ Repetitive - Every query is from scratch
  - ❌ Database-specific - PostgreSQL SQL ≠ MySQL SQL

  Learning curve: High (need to know SQL well)

  Query Builder
    Pros:
  - ✅ Safer (auto-escapes values, prevents SQL injection)
  - ✅ Database-agnostic (mostly)
  - ✅ Composable (build queries programmatically)

  Cons:
  - ❌ Still no type safety - Typos fail at runtime
  - ❌ Still manual schema - Write migrations by hand
  - ❌ Need to know SQL concepts (joins, where clauses)

  Learning curve: Medium (easier than raw SQL, but still SQL-thinking)

  ORM
    Pros:
  - ✅ Type safety - TypeScript knows your database schema
  - ✅ Auto-completion - Editor suggests available fields
  - ✅ Schema-first - Define schema once, get DB + types + queries
  - ✅ Auto-migrations - Generates SQL migrations from schema changes
  - ✅ Relation handling - Joins happen automatically
  - ✅ Validation - Catches errors before hitting database

  Cons:
  - ❌ Less control (harder to write complex SQL)
  - ❌ Abstraction overhead (need to learn ORM's way)
  - ❌ Can generate inefficient queries (N+1 problem)

  Learning curve: Low to start, medium to master

  ## Prisma files
Prisma Schema Syntax Breakdown

  1. Configuration Blocks (Top of File)

  generator client {
    provider = "prisma-client-js"
  }
  What: Tells Prisma to generate a JavaScript/TypeScript clientWhy: This creates the prisma.user.create() API you'll use in codeWhen it runs: Every time
  you run npx prisma generate

  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }
  What: Database connection configprovider: Which database (PostgreSQL, MySQL, SQLite, etc.)url: Connection string from environment variable (keeps
  secrets out of code)Example .env file:
  DATABASE_URL="postgresql://user:password@localhost:5432/amica"

  ---
  2. Model Definitions (Tables)

  model User {
    // fields here
  }
  What: Defines a database tableResult: Creates users table (see @@map("users") at bottom)Generates: TypeScript type User + query methods prisma.user.*

  ---
  3. Field Types & Attributes

  id        String   @id @default(uuid())
  Breakdown:
  - id - Field name (becomes column name)
  - String - Data type (TEXT in PostgreSQL)
  - @id - Attribute: This is the primary key
  - @default(uuid()) - Attribute: Auto-generate UUID when creating record

  Common types:
  - String → TEXT / VARCHAR
  - Int → INTEGER
  - DateTime → TIMESTAMP
  - Json → JSONB (PostgreSQL)
  - Boolean → BOOLEAN

  email     String   @unique
  @unique - Creates unique constraint (no duplicate emails)

  agentOutput  Json?   @map("agent_output")
  ? - Nullable (can be null)@map("agent_output") - Database column is snake_case, Prisma field is camelCaseWhy: Follow PostgreSQL convention (snake_case)
   but use JavaScript convention (camelCase) in code

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  @default(now()) - Set to current timestamp on creation@updatedAt - Auto-update to current timestamp on every modification

  ---
  4. Relationships (Foreign Keys)

  model Gathering {
    organizerId  String  @map("organizer_id")
    
    // Relationship definition
    organizer User @relation("OrganizerRelation", fields: [organizerId], references: [id], onDelete: Restrict)
  }

  Breakdown:
  - organizer - Relation field name (not a database column, just for Prisma)
  - User - Type of related model
  - @relation("OrganizerRelation") - Name (needed when multiple relations to same model)
  - fields: [organizerId] - Foreign key column in THIS table
  - references: [id] - Points to id in User table
  - onDelete: Restrict - Can't delete User if they organized Gatherings

  The reverse side (User model):
  model User {
    organizedGatherings Gathering[] @relation("OrganizerRelation")
  }
  - Gathering[] - Array type (one user has many gatherings)
  - Must match the relation name

  Delete behaviors we used:
  - Restrict - Prevent deletion (User can't be deleted if they organized gatherings)
  - Cascade - Delete related records (Delete gathering → delete all responses)
  - SetNull - Set foreign key to null (Delete user → response.userId becomes null)

  ---
  5. Enums (Limited Set of Values)

  enum GatheringStatus {
    COLLECTING
    COMPLETED
    FAILED
    CANCELLED
  }

  model Gathering {
    status GatheringStatus @default(COLLECTING)
  }

  What: Creates PostgreSQL ENUM typeWhy: Database enforces only these 4 values allowedDefault: New gatherings start as COLLECTINGIn code: TypeScript
  knows exact values: status: "COLLECTING" | "COMPLETED" | "FAILED" | "CANCELLED"

  ---
  6. Compound Constraints

  model Response {
    gatheringId String
    userId      String?

    @@unique([gatheringId, userId], name: "one_response_per_user_per_gathering")
  }

  @@unique([...]) - Block-level attribute (applies to model, not single field)What: Creates composite unique constraint on BOTH fields togetherResult:
  Can't have two responses with same (gatheringId, userId) pairname: Optional, helps identify constraint in error messages

  ---
  7. Table Naming

  model User {
    // fields...

    @@map("users")
  }

  @@map("users") - Map model name to database table nameWithout it: Table would be called "User" (capitalized)With it: Table is called "users"
  (PostgreSQL convention: lowercase, plural)

  Field mapping:
  organizerId String @map("organizer_id")
  JavaScript: gathering.organizerIdDatabase: gatherings.organizer_id

  ---
  How This Schema Creates Your Database

  When you run migrations:

  npx prisma migrate dev --name initial_schema

  Prisma generates SQL like:

  CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
  );

  CREATE TYPE "GatheringStatus" AS ENUM ('COLLECTING', 'COMPLETED', 'FAILED', 'CANCELLED');

  CREATE TABLE gatherings (
    id TEXT PRIMARY KEY,
    organizer_id TEXT NOT NULL,
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    timezone TEXT NOT NULL,
    time_options JSONB NOT NULL,
    rsvp_deadline TIMESTAMP NOT NULL,
    status "GatheringStatus" DEFAULT 'COLLECTING',
    agent_output JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP,

    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE RESTRICT
  );

  CREATE TABLE responses (
    id TEXT PRIMARY KEY,
    gathering_id TEXT NOT NULL,
    user_id TEXT,
    available_time_slot_indices INTEGER[] NOT NULL,
    budget_max INTEGER,
    cuisine_preferences JSONB DEFAULT '[]',
    dietary_restrictions TEXT,
    additional_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP,

    FOREIGN KEY (gathering_id) REFERENCES gatherings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,

    UNIQUE (gathering_id, user_id)
  );

  You never write this SQL - Prisma does it for you!


  ## Database setup
  1. Start PostgreSQL service:
  brew services start postgresql@16
  This starts PostgreSQL as a background service that will keep running.

  2. Create the database:
  createdb amica_dev
  Creates a new database called "amica_dev" for the project.

  3. Set up your database connection URL:
  You'll need to create a .env file in the project root with:
  DATABASE_URL="postgresql://localhost:5432/amica_dev"
  This tells Prisma how to connect to your database.

  4. Generate Prisma Client and run migration:
  npx prisma migrate dev --name init
  This creates the database tables based on your schema and generates the Prisma client
  code.

  5. Open Prisma Studio:
  npx prisma studio
  This opens a GUI in your browser to view and edit your database.


  //Install PostgreSQL and Prisma CLI
  brew install postgresql@16
  //Install Prisma
  //--save-dev tells npm to install the package as a development dependency rather than a production dependency 
  npx prisma --save-dev

  // Add PostgreSQL PATH to ~/.zshrc using nano if needed 
  nano ~/.zshrc 
 //Add PostgreSQL to PATH >> Ctrl+O, Enter, Ctrl+X to exit nano
  export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
  //reload shell config
  source ~/.zshrc

  // Run first migration (Create actual db tables) -> create a new db called `amica_dev` for the project
  createdb amica_dev

  //Add .env for local DB: set up db connection URL
    You'll need to create a .env file in the project root with:
  DATABASE_URL="postgresql://localhost:5432/amica_dev"
  This tells Prisma how to connect to your database.
  Note that I needed to add username for the URL to work ATABASE_URL="postgresql://nhungnguuyen@localhost:5432/amica_dev"
  This is a local database running on your machine. PostgreSQL is running at
  localhost:5432 (port 5432). No cloud connection needed. This is perfect for
  development. Later, when you deploy to production, you'd use a cloud database (like
  Railway, Supabase, or AWS RDS) and just change the DATABASE_URL in your .env file.

  What is a Migration?

  A migration converts your Prisma schema (the schema.prisma file you wrote) into actual
  SQL commands that create database tables.

  Here's the flow:
  1. You write models in schema.prisma (like model User { ... })
  2. prisma migrate dev reads that schema
  3. Prisma generates SQL like CREATE TABLE "User" (id TEXT PRIMARY KEY, ...)
  4. That SQL runs against your PostgreSQL database to create the actual tables
  5. Prisma also generates TypeScript client code so you can query the database with
  type-safe methods

  Migration also means Prisma tracks changes over time. If you later modify your schema
  (add a field, new table, etc.), running prisma migrate dev again creates a new
  migration file that contains just the changes (like ALTER TABLE "User" ADD COLUMN 
  "phone" TEXT).

  // Generate Prisma Client and run Migration
  npx prisma migrate dev --nam init

  // Explore data in Prisma Studio
  npx prisma studio

  ## Installing packages
  Step 1: Install Backend Dependencies

  First, you need to install the packages. Run this command:

  npm install express cors dotenv

  What this does:
  - npm install - Downloads and adds packages to your project
  - express - Web framework for building APIs (handles HTTP requests/responses)
  - cors - Allows your API to accept requests from different domains (frontend on
  different port)
  - dotenv - Loads environment variables from .env file (like DATABASE_URL)

  These go into "dependencies" because you need them to run the app in production.

  ---
  Then install development tools:

  npm install --save-dev typescript @types/node @types/express @types/cors ts-node-dev

  What this does:
  - --save-dev - Installs as devDependencies (only needed during development, not in
  production)
  - typescript - Compiles TypeScript to JavaScript
  - @types/node - TypeScript type definitions for Node.js (autocomplete, error
  checking)
  - @types/express - TypeScript types for Express
  - @types/cors - TypeScript types for CORS
  - ts-node-dev - Runs TypeScript directly & auto-restarts server when files change
  (like nodemon but for TS)

  Step 2: Configure TypeScript

  Now let's create a TypeScript configuration file. Run this command:

  npx tsc --init

  What this does:
  - npx - Runs a package's command without globally installing it
  - tsc - TypeScript compiler
  - --init - Creates a tsconfig.json file with default settings

  This will create tsconfig.json with lots of commented-out options. We need to
  customize it for our backend project.

Understanding the Current Config

  Key settings already there:
  - "strict": true - Enables all strict type checking (catches bugs early!)
  - "module": "nodenext" - Modern Node.js module system
  - "target": "esnext" - Compile to latest JavaScript

  Problems for our backend:
  1. ❌ No rootDir - TypeScript doesn't know where source code is
  2. ❌ No outDir - Compiled JavaScript will be scattered everywhere
  3. ❌ "jsx": "react-jsx" - We're not using React! (backend only)
  4. ❌ "types": [] - This blocks Node.js types we need

  ---
  Changes You Need to Make

  Open tsconfig.json in your editor and make these changes:

  1. Uncomment and set file paths (around lines 5-6):
  "rootDir": "./src",
  "outDir": "./dist",
  - rootDir - Where your .ts source files live (we'll create src/ folder)
  - outDir - Where compiled .js files go (TypeScript creates dist/ automatically)

  2. Fix the types (line 12):
  "types": ["node"],
  - Tells TypeScript to include Node.js types (for process, __dirname, etc.)

  3. Remove React JSX (line 37):
  // Delete or comment out this line:
  // "jsx": "react-jsx",
  - We're not building a React app, so remove this

  4. Add module resolution (add this anywhere in compilerOptions):
  "esModuleInterop": true,
  "resolveJsonModule": true,
  - esModuleInterop - Makes importing CommonJS modules easier (import express from 
  'express' works)
  - resolveJsonModule - Lets you import JSON files (like import pkg from 
  './package.json')

