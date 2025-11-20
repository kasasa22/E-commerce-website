import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const email = process.argv[2] || 'admin@example.com'
const password = process.argv[3] || 'Admin123!'
const name = process.argv[4] || 'Super Admin'

async function seedSuperadmin() {
  try {
    console.log('Creating superadmin user...')
    console.log(`Email: ${email}`)
    console.log(`Name: ${name}`)

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role: 'superadmin'
      }
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('User already exists. Updating role to superadmin...')
        
        const { data: existingUser } = await supabase.auth.admin.listUsers()
        const user = existingUser.users.find(u => u.email === email)
        
        if (!user) {
          console.error('Could not find existing user')
          process.exit(1)
        }

        const { error: updateError } = await supabase
          .from('users')
          .update({ role: 'superadmin' })
          .eq('id', user.id)

        if (updateError) {
          console.error('Error updating user role:', updateError.message)
          process.exit(1)
        }

        console.log('✓ User role updated to superadmin successfully!')
        console.log(`User ID: ${user.id}`)
        return
      }
      throw authError
    }

    if (!authData.user) {
      throw new Error('User creation failed - no user data returned')
    }

    const { error: profileError } = await supabase
      .from('users')
      .update({ role: 'superadmin' })
      .eq('id', authData.user.id)

    if (profileError) {
      console.error('Error updating user role:', profileError.message)
      process.exit(1)
    }

    console.log('✓ Superadmin user created successfully!')
    console.log(`User ID: ${authData.user.id}`)
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)
    console.log('\nYou can now login with these credentials.')
  } catch (error) {
    console.error('Error creating superadmin:', error.message)
    process.exit(1)
  }
}

seedSuperadmin()

