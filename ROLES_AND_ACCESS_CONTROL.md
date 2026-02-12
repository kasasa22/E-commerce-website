# User Roles and Access Control Documentation

## Overview

This document describes the role-based access control (RBAC) system implemented in the JB Phonetec Hub e-commerce application.

---

## Roles Defined

The system has **3 user roles** defined in the database schema:

| Role | Level | Description |
|------|-------|-------------|
| **superadmin** | Highest | Full system access, can manage all users and data |
| **admin** | Middle | Administrative privileges, same as superadmin |
| **seller** | Lowest | Limited access for sales operations only |

### Role Definition Location

**Database Schema:** `supabase-schema.sql`
```sql
role TEXT NOT NULL CHECK (role IN ('superadmin', 'admin', 'seller'))
```

---

## Role Hierarchy

Defined in `src/stores/userStore.js`:

```javascript
const isSuperadmin = computed(() => userRole.value === 'superadmin')
const isAdmin = computed(() => userRole.value === 'admin' || isSuperadmin.value)
const isSeller = computed(() => userRole.value === 'seller' || isAdmin.value)
```

**Hierarchy Flow:**
```
superadmin → has all permissions
    ↓
admin → inherits superadmin permissions (isAdmin = admin OR superadmin)
    ↓
seller → most restricted access
```

---

## Access Control Matrix

### Feature Access by Role

| Feature | Superadmin | Admin | Seller |
|---------|:----------:|:-----:|:------:|
| **Dashboard** | ✅ | ✅ | ✅ |
| **View Products** | ✅ Full | ✅ Full | ⚠️ Limited* |
| **Create Products** | ✅ | ✅ | ❌ |
| **Edit Products** | ✅ | ✅ | ❌ |
| **Delete Products** | ✅ | ✅ | ❌ |
| **Create Sales** | ✅ | ✅ | ✅ |
| **View Sales** | ✅ Full | ✅ Full | ⚠️ No profit column |
| **Edit Sales** | ✅ | ✅ | ❌ |
| **Delete Sales** | ✅ | ✅ | ❌ |
| **Daily Reports** | ✅ | ✅ | ❌ |
| **Monthly Reports** | ✅ | ✅ | ❌ |
| **Yearly Reports** | ✅ | ✅ | ❌ |
| **Bank Deposits Report** | ✅ | ✅ | ❌ |
| **Finance (Debtors/Creditors)** | ✅ | ✅ | ❌ |
| **User Management** | ✅ | ✅ | ❌ |
| **Create Sellers** | ✅ | ✅ | ❌ |
| **Expenses** | ✅ | ✅ | ✅ |
| **Banking** | ✅ | ✅ | ✅ |

*\*Sellers cannot see product quantity, buying price, or cost information*

---

## Dashboard Widgets by Role

| Dashboard Widget | Superadmin | Admin | Seller |
|-----------------|:----------:|:-----:|:------:|
| Today's Sales | ✅ | ✅ | ✅ |
| Total Products | ✅ | ✅ | ❌ |
| Low Stock Items | ✅ | ✅ | ❌ |
| Cash Flow Summary | ✅ | ✅ | ❌ |
| Profit Summary | ✅ | ✅ | ❌ |

---

## Frontend Protection

### Route Guards

Routes are protected using `meta.roles` in `src/router/index.js`:

```javascript
{
  path: '/products/create',
  name: 'products-create',
  component: () => import('../pages/products/create.vue'),
  meta: { roles: ['admin', 'superadmin'] }
},
{
  path: '/reports/daily',
  name: 'reports-daily',
  component: () => import('../pages/reports/DailyReportPage.vue'),
  meta: { roles: ['admin', 'superadmin'] }
}
```

**Router Guard Implementation:**
```javascript
router.beforeEach(async (to, from, next) => {
  // Check if route has role restrictions
  if (to.meta.roles && !to.meta.roles.includes(userStore.userRole)) {
    return next({ name: 'dashboard' })  // Redirect unauthorized users
  }
})
```

### Routes by Access Level

#### All Authenticated Users
- `/` - Dashboard
- `/products` - Products list (view only for sellers)
- `/sales` - Sales list
- `/sales/create` - Create new sale
- `/expenses` - Expenses management
- `/banking` - Banking transactions

#### Admin & Superadmin Only
- `/products/create` - Create product
- `/reports/daily` - Daily reports
- `/reports/monthly` - Monthly reports
- `/reports/yearly` - Yearly reports
- `/reports/bank-deposits` - Bank deposits report
- `/users` - User management
- `/finance` - Finance management (debtors/creditors)
- `/finance/:type/:id` - Finance detail view

### UI Visibility

Navigation items are conditionally rendered in `src/layouts/DefaultLayout.vue`:

```vue
<!-- Reports section - Admin only -->
<div v-if="userStore.isAdmin" class="pt-4">
  <p class="text-xs font-semibold text-gray-500">Reports</p>
  <!-- Report links -->
</div>

<!-- Finance link - Admin only -->
<router-link v-if="userStore.isAdmin" :to="{ name: 'finance' }">
  Finance
</router-link>

<!-- Users link - Admin only -->
<router-link v-if="userStore.isAdmin" :to="{ name: 'users' }">
  Users
</router-link>
```

---

## Backend Protection (Supabase RLS)

Row Level Security policies enforce access control at the database level.

### Users Table Policies

| Policy | Applies To | Permission |
|--------|-----------|------------|
| View own profile | All users | SELECT own record |
| View all users | Superadmin | SELECT all records |
| Update all users | Superadmin | UPDATE all records |

```sql
-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Superadmins can view all users
CREATE POLICY "Superadmins can view all users"
  ON public.users FOR SELECT
  USING (public.get_user_role(auth.uid()) = 'superadmin');
```

### Products Table Policies

| Policy | Applies To | Permission |
|--------|-----------|------------|
| View products | All authenticated | SELECT |
| Create products | Admin, Superadmin | INSERT |
| Update products | Admin, Superadmin | UPDATE |
| Delete products | Admin, Superadmin | DELETE |

```sql
-- Anyone authenticated can view products
CREATE POLICY "Anyone authenticated can view products"
  ON public.products FOR SELECT
  USING (auth.role() = 'authenticated');

-- Admins and Superadmins can create products
CREATE POLICY "Admins and Superadmins can create products"
  ON public.products FOR INSERT
  WITH CHECK (
    public.get_user_role(auth.uid()) IN ('admin', 'superadmin')
  );
```

### Sales Table Policies

| Policy | Applies To | Permission |
|--------|-----------|------------|
| View sales | All authenticated | SELECT |
| Create sales | Seller, Admin, Superadmin | INSERT |
| Update sales | Admin, Superadmin | UPDATE |
| Delete sales | Admin, Superadmin | DELETE |

```sql
-- Sellers, Admins, and Superadmins can create sales
CREATE POLICY "Sellers, Admins, and Superadmins can create sales"
  ON public.sales FOR INSERT
  WITH CHECK (
    public.get_user_role(auth.uid()) IN ('seller', 'admin', 'superadmin')
  );
```

---

## What Each Role CANNOT Access

### Seller Restrictions

| Restricted Feature | Protection Method | Location |
|-------------------|-------------------|----------|
| Product inventory (quantity) | UI hidden | `src/pages/products/index.vue` |
| Product costs (buying price) | UI hidden | `src/pages/products/index.vue` |
| Create/Edit/Delete products | RLS + Route guard | `supabase-schema.sql`, `router/index.js` |
| Edit/Delete sales | RLS policy | `supabase-schema.sql` |
| All reports | Route guard | `router/index.js` |
| Finance management | Route guard | `router/index.js` |
| User management | Route guard | `router/index.js` |
| Profit information in sales | UI hidden | `src/pages/sales/index.vue` |
| Dashboard financial widgets | UI hidden | `src/pages/dashboard/index.vue` |

### Admin Restrictions

| Restricted Feature | Notes |
|-------------------|-------|
| None | Admins currently have the same access as superadmin |

---

## Security Layers (Defense in Depth)

The application implements multiple security layers:

```
┌─────────────────────────────────────────────┐
│  Layer 1: Frontend Route Guards             │
│  - Prevents navigation to restricted routes │
│  - Location: src/router/index.js            │
├─────────────────────────────────────────────┤
│  Layer 2: Frontend UI Hiding                │
│  - Removes buttons/links from UI            │
│  - Location: Vue components (v-if)          │
├─────────────────────────────────────────────┤
│  Layer 3: Function-level Checks             │
│  - Validates role before operations         │
│  - Location: src/stores/userStore.js        │
├─────────────────────────────────────────────┤
│  Layer 4: Backend RLS Policies              │
│  - Database-level enforcement               │
│  - Cannot be bypassed from frontend         │
│  - Location: supabase-schema.sql            │
└─────────────────────────────────────────────┘
```

---

## User Creation and Default Role

### Default Role Assignment

New users default to **seller** role via database trigger:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'seller')  -- Default: seller
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Creating New Sellers

Only admins and superadmins can create new sellers:

```javascript
async function createSeller(sellerData) {
  const userRole = user.value?.role
  if (userRole !== 'admin' && userRole !== 'superadmin') {
    throw new Error('Only admins and superadmins can create sellers')
  }
  // ... create seller logic
}
```

---

## Role Badges (UI Display)

Roles are displayed with color-coded badges in the Users page:

| Role | Badge Color |
|------|-------------|
| superadmin | Purple (`bg-purple-100 text-purple-800`) |
| admin | Blue (`bg-blue-100 text-blue-800`) |
| seller | Green (`bg-green-100 text-green-800`) |

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `supabase-schema.sql` | Database schema and RLS policies |
| `src/stores/userStore.js` | Role computed properties and auth logic |
| `src/router/index.js` | Route definitions and guards |
| `src/layouts/DefaultLayout.vue` | Navigation visibility |
| `src/pages/dashboard/index.vue` | Dashboard widget visibility |
| `src/pages/products/index.vue` | Product page role restrictions |
| `src/pages/sales/index.vue` | Sales page role restrictions |
| `src/pages/users/index.vue` | User management (admin only) |

---

## Summary

- **3 roles**: superadmin, admin, seller
- **Sellers** can only create sales and manage expenses/banking
- **Admins/Superadmins** have full access to all features
- **Protection** is enforced at both frontend (routes, UI) and backend (RLS)
- **Default role** for new users is "seller"
