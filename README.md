# E-commerce Inventory & Sales Management System

A comprehensive e-commerce inventory and sales management system built with Vue 3, Vite, Tailwind CSS, and Supabase.

## Features

- **Product Management**: Add, edit, and track products with buying/selling prices
- **Sales Management**: Record sales with automatic profit/loss calculation
- **Reports**: Generate daily, monthly, and yearly reports with printable tables
- **Role-Based Access**: Three user roles (Superadmin, Admin, Seller) with different permissions
- **Inventory Tracking**: Automatic stock updates and low-stock alerts
- **Environment Configuration**: Project name and settings configurable via `.env`

## Tech Stack

- **Frontend**: Vue 3 + Vite
- **Routing**: Vue Router 4 (folder-based routing)
- **State Management**: Pinia
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_APP_NAME="My E-commerce System"
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
VITE_SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
VITE_DEFAULT_CURRENCY="UGX"
```

**Note**: You can find your Supabase credentials in your Supabase project settings under API.

### 3. Set Up Supabase Database

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the SQL script from `supabase-schema.sql` to create all necessary tables, policies, and functions

### 4. Create Initial Users

After running the schema, you can create users through Supabase Auth:

1. Go to Authentication > Users in your Supabase dashboard
2. Create a new user
3. Update the user's role in the `users` table:

```sql
UPDATE public.users 
SET role = 'superadmin' 
WHERE email = 'your-email@example.com';
```

Available roles: `superadmin`, `admin`, `seller`

### 5. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## User Roles & Permissions

| Role       | Permissions                                                                    |
| ---------- | ------------------------------------------------------------------------------ |
| Superadmin | Full access: create/manage users, manage products/sales, view all reports      |
| Admin      | Manage products, sales, and reports. Cannot create superadmin accounts         |
| Seller     | Enter new products and sales only. Cannot edit once entered. Limited reports. |

## Project Structure

```
src/
 ├─ assets/
 ├─ components/
 │   ├─ ProductForm.vue
 │   ├─ SalesForm.vue
 │   └─ Table.vue
 ├─ layouts/
 │   └─ DefaultLayout.vue
 ├─ pages/
 │   ├─ login/
 │   │   └─ index.vue
 │   ├─ dashboard/
 │   │   └─ index.vue
 │   ├─ products/
 │   │   ├─ index.vue
 │   │   └─ create.vue
 │   ├─ sales/
 │   │   ├─ index.vue
 │   │   └─ create.vue
 │   └─ reports/
 │       ├─ daily.vue
 │       ├─ monthly.vue
 │       └─ yearly.vue
 ├─ stores/
 │   ├─ productStore.js
 │   ├─ salesStore.js
 │   └─ userStore.js
 ├─ router/
 │   └─ index.js
 └─ main.js
```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Key Features Implementation

- **Folder-based Routing**: All routes are organized in the `pages/` directory
- **Role Guards**: Routes are protected based on user roles
- **Automatic Calculations**: Profit/loss calculated automatically from product buying price and sale price
- **Inventory Updates**: Stock automatically decreases when sales are recorded
- **Low Stock Alerts**: Products with quantity ≤ 10 are flagged on the dashboard
- **Printable Reports**: Reports can be printed directly from the browser

## Environment Variables

- `VITE_APP_NAME`: Display name for the application (shown in UI)
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous/public key
- `VITE_SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (optional, for admin tasks)
- `VITE_DEFAULT_CURRENCY`: Default currency code (e.g., "UGX", "USD")

## License

See LICENSE file for details.
