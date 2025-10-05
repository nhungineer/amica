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