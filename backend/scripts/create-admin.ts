import { PrismaClient } from '@prisma/client'
import { hashSync } from 'bcrypt'
import readline from 'readline'

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer)
    })
  })
}

async function createAdmin() {
  try {
    console.log('🔧 myTutor Admin Setup')
    console.log('======================')
    
    // Check if any admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (existingAdmin) {
      console.log('❌ An admin user already exists!')
      console.log(`Admin: ${existingAdmin.name} (${existingAdmin.email})`)
      process.exit(1)
    }

    // Get admin details
    const name = await askQuestion('Enter admin full name: ')
    const email = await askQuestion('Enter admin email: ')
    const password = await askQuestion('Enter admin password (min 8 chars): ')

    // Validate input
    if (!name || !email || !password) {
      console.log('❌ All fields are required!')
      process.exit(1)
    }

    if (password.length < 8) {
      console.log('❌ Password must be at least 8 characters long!')
      process.exit(1)
    }

    // Check if email already exists
    const existingUser = await prisma.user.findFirst({
      where: { email }
    })

    if (existingUser) {
      console.log('❌ A user with this email already exists!')
      process.exit(1)
    }

    // Hash password
    const hashedPassword = hashSync(password, 12)

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN',
        verified: true,
        status: 'active'
      }
    })

    console.log('✅ Admin user created successfully!')
    console.log(`Admin ID: ${admin.id}`)
    console.log(`Name: ${admin.name}`)
    console.log(`Email: ${admin.email}`)
    console.log(`Role: ${admin.role}`)
    console.log('')
    console.log('🎉 You can now login to the admin panel at /admin/login')
    
  } catch (error) {
    console.error('❌ Error creating admin:', error)
    process.exit(1)
  } finally {
    rl.close()
    await prisma.$disconnect()
  }
}

// Run the script
createAdmin()
