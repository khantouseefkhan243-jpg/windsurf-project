#!/usr/bin/env tsx

import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { join } from 'path'

const MONGODB_PORT = 27017
const REPLICA_SET_NAME = 'rs0'

async function initReplicaSet() {
  console.log('🔧 Initializing MongoDB replica set for Prisma...')

  try {
    // Check if MongoDB is running
    console.log('📡 Checking MongoDB connection...')
    execSync(`mongosh --eval "db.adminCommand('ping')" --port ${MONGODB_PORT}`, { stdio: 'pipe' })
    console.log('✅ MongoDB is running')
  } catch (error) {
    console.error('❌ MongoDB is not running. Please start MongoDB first.')
    console.log('💡 You can start MongoDB with: mongod --replSet rs0 --port 27017')
    process.exit(1)
  }

  try {
    // Check if replica set is already initialized
    console.log('🔍 Checking replica set status...')
    const status = execSync(`mongosh --eval "rs.status()" --port ${MONGODB_PORT}`, { 
      stdio: 'pipe',
      encoding: 'utf8'
    })
    
    if (status.includes('ok: 1')) {
      console.log('✅ Replica set is already initialized')
      return
    }
  } catch (error) {
    console.log('⚠️ Replica set not initialized, proceeding with initialization...')
  }

  try {
    // Initialize replica set
    console.log('🚀 Initializing replica set...')
    const initCommand = `
      rs.initiate({
        _id: "${REPLICA_SET_NAME}",
        members: [
          { _id: 0, host: "localhost:${MONGODB_PORT}" }
        ]
      })
    `
    
    execSync(`mongosh --eval "${initCommand}" --port ${MONGODB_PORT}`, { stdio: 'inherit' })
    
    console.log('⏳ Waiting for replica set to become primary...')
    
    // Wait for replica set to initialize
    let attempts = 0
    const maxAttempts = 30
    
    while (attempts < maxAttempts) {
      try {
        const status = execSync(`mongosh --eval "rs.isMaster().ismaster" --port ${MONGODB_PORT}`, { 
          stdio: 'pipe',
          encoding: 'utf8'
        })
        
        if (status.includes('true')) {
          console.log('✅ Replica set is now primary and ready!')
          console.log('🎉 MongoDB replica set initialization completed successfully!')
          console.log('\n📝 Next steps:')
          console.log('1. Update your .env.local with: DATABASE_URL="mongodb://localhost:27017/hospital?replicaSet=rs0"')
          console.log('2. Run: npm run db:push')
          console.log('3. Run: npm run db:seed')
          return
        }
      } catch (error) {
        // Still waiting...
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      attempts++
      process.stdout.write('.')
    }
    
    console.log('\n❌ Timeout waiting for replica set to become primary')
    process.exit(1)
    
  } catch (error) {
    console.error('❌ Failed to initialize replica set:', error)
    console.log('\n🔧 Manual initialization steps:')
    console.log('1. Connect to MongoDB: mongosh --port 27017')
    console.log('2. Run: rs.initiate({ _id: "rs0", members: [{ _id: 0, host: "localhost:27017" }] })')
    console.log('3. Wait for the replica set to initialize')
    process.exit(1)
  }
}

// Alternative Docker approach
async function initWithDocker() {
  console.log('🐳 Initializing MongoDB replica set with Docker...')
  
  const dockerComposePath = join(__dirname, '..', 'docker-compose.yml')
  
  if (!existsSync(dockerComposePath)) {
    console.error('❌ docker-compose.yml not found')
    process.exit(1)
  }
  
  try {
    console.log('🚀 Starting MongoDB with Docker Compose...')
    execSync('docker-compose up -d', { stdio: 'inherit', cwd: join(__dirname, '..') })
    
    console.log('⏳ Waiting for MongoDB to start...')
    await new Promise(resolve => setTimeout(resolve, 10000))
    
    console.log('🔧 Initializing replica set...')
    execSync('docker-compose exec mongodb mongosh --eval "rs.initiate({ _id: \\"rs0\\", members: [{ _id: 0, host: \\"localhost:27017\\" }] })"', { 
      stdio: 'inherit',
      cwd: join(__dirname, '..')
    })
    
    console.log('⏳ Waiting for replica set to initialize...')
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    console.log('✅ Docker MongoDB replica set is ready!')
    console.log('📝 Your DATABASE_URL should be: "mongodb://localhost:27017/hospital?replicaSet=rs0"')
    
  } catch (error) {
    console.error('❌ Failed to initialize with Docker:', error)
    process.exit(1)
  }
}

// Main execution
const command = process.argv[2]

if (command === 'docker') {
  initWithDocker()
} else {
  initReplicaSet()
}
