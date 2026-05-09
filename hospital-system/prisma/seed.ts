import { PrismaClient, UserRole, AppointmentStatus, QueueStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data
  await prisma.queue.deleteMany()
  await prisma.medicalRecord.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.doctorSchedule.deleteMany()
  await prisma.doctor.deleteMany()
  await prisma.staff.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.department.deleteMany()
  await prisma.user.deleteMany()

  console.log('🧹 Cleared existing data')

  // Create departments
  const departments = await Promise.all([
    prisma.department.create({
      data: {
        name: 'General Medicine',
        description: 'General medical consultations and primary care'
      }
    }),
    prisma.department.create({
      data: {
        name: 'Cardiology',
        description: 'Heart and cardiovascular system specialist'
      }
    }),
    prisma.department.create({
      data: {
        name: 'Pediatrics',
        description: 'Medical care for infants, children, and adolescents'
      }
    }),
    prisma.department.create({
      data: {
        name: 'Emergency',
        description: 'Emergency medical services and urgent care'
      }
    })
  ])

  console.log('🏥 Created departments:', departments.map(d => d.name))

  // Create users for all roles
  const hashedPassword = await bcrypt.hash('password123', 12)

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@hospital.com',
      password: hashedPassword,
      name: 'Hospital Administrator',
      role: UserRole.ADMIN
    }
  })

  const doctorUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'dr.smith@hospital.com',
        password: hashedPassword,
        name: 'Dr. John Smith',
        role: UserRole.DOCTOR
      }
    }),
    prisma.user.create({
      data: {
        email: 'dr.jones@hospital.com',
        password: hashedPassword,
        name: 'Dr. Sarah Jones',
        role: UserRole.DOCTOR
      }
    })
  ])

  const nurseUser = await prisma.user.create({
    data: {
      email: 'nurse.wilson@hospital.com',
      password: hashedPassword,
      name: 'Nurse Emily Wilson',
      role: UserRole.NURSE
    }
  })

  const receptionistUser = await prisma.user.create({
    data: {
      email: 'reception@hospital.com',
      password: hashedPassword,
      name: 'Receptionist Mary Brown',
      role: UserRole.RECEPTIONIST
    }
  })

  const pharmacistUser = await prisma.user.create({
    data: {
      email: 'pharmacy@hospital.com',
      password: hashedPassword,
      name: 'Pharmacist David Lee',
      role: UserRole.PHARMACIST
    }
  })

  const labTechUser = await prisma.user.create({
    data: {
      email: 'lab@hospital.com',
      password: hashedPassword,
      name: 'Lab Technician Alex Chen',
      role: UserRole.LAB_TECHNICIAN
    }
  })

  // Create patients
  const patientUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'patient1@email.com',
        password: hashedPassword,
        name: 'Alice Johnson',
        role: UserRole.PATIENT
      }
    }),
    prisma.user.create({
      data: {
        email: 'patient2@email.com',
        password: hashedPassword,
        name: 'Bob Williams',
        role: UserRole.PATIENT
      }
    }),
    prisma.user.create({
      data: {
        email: 'patient3@email.com',
        password: hashedPassword,
        name: 'Carol Davis',
        role: UserRole.PATIENT
      }
    }),
    prisma.user.create({
      data: {
        email: 'patient4@email.com',
        password: hashedPassword,
        name: 'Daniel Miller',
        role: UserRole.PATIENT
      }
    }),
    prisma.user.create({
      data: {
        email: 'patient5@email.com',
        password: hashedPassword,
        name: 'Emma Garcia',
        role: UserRole.PATIENT
      }
    }),
    prisma.user.create({
      data: {
        email: 'patient6@email.com',
        password: hashedPassword,
        name: 'Frank Martinez',
        role: UserRole.PATIENT
      }
    }),
    prisma.user.create({
      data: {
        email: 'patient7@email.com',
        password: hashedPassword,
        name: 'Grace Anderson',
        role: UserRole.PATIENT
      }
    }),
    prisma.user.create({
      data: {
        email: 'patient8@email.com',
        password: hashedPassword,
        name: 'Henry Taylor',
        role: UserRole.PATIENT
      }
    }),
    prisma.user.create({
      data: {
        email: 'patient9@email.com',
        password: hashedPassword,
        name: 'Isabella Thomas',
        role: UserRole.PATIENT
      }
    }),
    prisma.user.create({
      data: {
        email: 'patient10@email.com',
        password: hashedPassword,
        name: 'Jack Moore',
        role: UserRole.PATIENT
      }
    }),
    prisma.user.create({
      data: {
        email: 'patient11@email.com',
        password: hashedPassword,
        name: 'Karen Jackson',
        role: UserRole.PATIENT
      }
    }),
    prisma.user.create({
      data: {
        email: 'patient12@email.com',
        password: hashedPassword,
        name: 'Liam White',
        role: UserRole.PATIENT
      }
    }),
    prisma.user.create({
      data: {
        email: 'patient13@email.com',
        password: hashedPassword,
        name: 'Mia Harris',
        role: UserRole.PATIENT
      }
    }),
    prisma.user.create({
      data: {
        email: 'patient14@email.com',
        password: hashedPassword,
        name: 'Noah Martin',
        role: UserRole.PATIENT
      }
    })
  ])

  console.log('👥 Created users')

  // Create staff profiles
  await Promise.all([
    prisma.staff.create({
      data: {
        userId: nurseUser.id,
        employeeId: 'NURSE001',
        department: 'General Medicine',
        position: 'Registered Nurse',
        hireDate: new Date('2022-01-15'),
        salary: 65000
      }
    }),
    prisma.staff.create({
      data: {
        userId: receptionistUser.id,
        employeeId: 'REC001',
        department: 'Front Desk',
        position: 'Receptionist',
        hireDate: new Date('2021-06-10'),
        salary: 45000
      }
    }),
    prisma.staff.create({
      data: {
        userId: pharmacistUser.id,
        employeeId: 'PHARM001',
        department: 'Pharmacy',
        position: 'Pharmacist',
        hireDate: new Date('2020-03-20'),
        salary: 75000
      }
    }),
    prisma.staff.create({
      data: {
        userId: labTechUser.id,
        employeeId: 'LAB001',
        department: 'Laboratory',
        position: 'Lab Technician',
        hireDate: new Date('2021-09-05'),
        salary: 55000
      }
    })
  ])

  // Create patient profiles
  const patients = await Promise.all(patientUsers.map((user, index) =>
    prisma.patient.create({
      data: {
        userId: user.id,
        dateOfBirth: new Date(1980 + index * 2, index % 12, (index % 28) + 1),
        gender: index % 2 === 0 ? 'Female' : 'Male',
        phone: `+1-555-${1000 + index}-${1000 + index * 10}`,
        address: `${100 + index} Main St, City ${index}, State ${index}`,
        bloodType: ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'][index % 8],
        allergies: index % 3 === 0 ? 'Penicillin' : index % 3 === 1 ? 'Peanuts' : 'None',
        emergencyContact: `Emergency Contact ${index + 1} - +1-555-${2000 + index}-${2000 + index * 10}`
      }
    })
  ))

  // Create doctor profiles
  const doctors = await Promise.all([
    prisma.doctor.create({
      data: {
        userId: doctorUsers[0].id,
        licenseNo: 'DOC001',
        specialization: 'General Medicine',
        experience: 15,
        education: 'MD from Harvard Medical School',
        bio: 'Experienced general practitioner with expertise in preventive care',
        consultationFee: 150,
        departmentId: departments[0].id
      }
    }),
    prisma.doctor.create({
      data: {
        userId: doctorUsers[1].id,
        licenseNo: 'DOC002',
        specialization: 'Cardiology',
        experience: 12,
        education: 'MD from Johns Hopkins University',
        bio: 'Cardiologist specializing in heart disease prevention and treatment',
        consultationFee: 250,
        departmentId: departments[1].id
      }
    })
  ])

  console.log('👨‍⚕️ Created doctors and 👩‍⚕️ patients')

  // Create doctor schedules
  await Promise.all([
    // Dr. Smith schedule
    ...[1, 2, 3, 4, 5].map(day => 
      prisma.doctorSchedule.create({
        data: {
          doctorId: doctors[0].id,
          dayOfWeek: day, // Monday-Friday
          startTime: '09:00',
          endTime: '17:00',
          maxPatients: 20
        }
      })
    ),
    // Dr. Jones schedule
    ...[1, 3, 5].map(day => 
      prisma.doctorSchedule.create({
        data: {
          doctorId: doctors[1].id,
          dayOfWeek: day, // Monday, Wednesday, Friday
          startTime: '08:00',
          endTime: '16:00',
          maxPatients: 15
        }
      })
    )
  ])

  // Create historical appointments
  const historicalDates = []
  for (let i = 30; i > 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    if (date.getDay() !== 0 && date.getDay() !== 6) { // Weekdays only
      historicalDates.push(new Date(date))
    }
  }

  const historicalAppointments = []
  for (let i = 0; i < Math.min(50, historicalDates.length * 2); i++) {
    const date = historicalDates[i % historicalDates.length]
    const hour = 9 + (i % 8) // 9 AM to 4 PM
    const time = `${hour.toString().padStart(2, '0')}:00`
    
    historicalAppointments.push({
      patientId: patients[i % patients.length].id,
      doctorId: doctors[i % doctors.length].id,
      departmentId: doctors[i % doctors.length].departmentId,
      date,
      time,
      status: i % 10 === 0 ? AppointmentStatus.CANCELLED : AppointmentStatus.COMPLETED,
      symptoms: `Historical symptoms ${i + 1}`,
      notes: `Historical notes ${i + 1}`,
      actualStartTime: new Date(date.getTime() + hour * 60 * 60 * 1000),
      actualEndTime: new Date(date.getTime() + (hour + 1) * 60 * 60 * 1000)
    })
  }

  await prisma.appointment.createMany({
    data: historicalAppointments
  })

  // Create today's queue smoke-test setup
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Today's appointments for queue testing
  const todayAppointments = [
    // Dr. Smith's queue (7 patients)
    {
      patientId: patients[0].id,
      doctorId: doctors[0].id,
      departmentId: departments[0].id,
      date: today,
      time: '09:00',
      status: AppointmentStatus.SCHEDULED,
      symptoms: 'Routine checkup',
      tokenCode: 'AA1001'
    },
    {
      patientId: patients[1].id,
      doctorId: doctors[0].id,
      departmentId: departments[0].id,
      date: today,
      time: '09:30',
      status: AppointmentStatus.SCHEDULED,
      symptoms: 'Headache and fatigue',
      tokenCode: 'AA1002'
    },
    {
      patientId: patients[2].id,
      doctorId: doctors[0].id,
      departmentId: departments[0].id,
      date: today,
      time: '10:00',
      status: AppointmentStatus.SCHEDULED,
      symptoms: 'Chest pain',
      tokenCode: 'AA1003'
    },
    {
      patientId: patients[3].id,
      doctorId: doctors[0].id,
      departmentId: departments[0].id,
      date: today,
      time: '10:30',
      status: AppointmentStatus.SCHEDULED,
      symptoms: 'Fever and cough',
      tokenCode: 'AA1004'
    },
    {
      patientId: patients[4].id,
      doctorId: doctors[0].id,
      departmentId: departments[0].id,
      date: today,
      time: '11:00',
      status: AppointmentStatus.SCHEDULED,
      symptoms: 'Stomach pain',
      tokenCode: 'AA1005'
    },
    {
      patientId: patients[5].id,
      doctorId: doctors[0].id,
      departmentId: departments[0].id,
      date: today,
      time: '11:30',
      status: AppointmentStatus.SCHEDULED,
      symptoms: 'Back pain',
      tokenCode: 'AA1006'
    },
    {
      patientId: patients[6].id,
      doctorId: doctors[0].id,
      departmentId: departments[0].id,
      date: today,
      time: '14:00',
      status: AppointmentStatus.SCHEDULED,
      symptoms: 'Skin rash',
      tokenCode: 'AA1007'
    },

    // Dr. Jones' queue (7 patients)
    {
      patientId: patients[7].id,
      doctorId: doctors[1].id,
      departmentId: departments[1].id,
      date: today,
      time: '09:00',
      status: AppointmentStatus.SCHEDULED,
      symptoms: 'Heart palpitations',
      tokenCode: 'BB2001'
    },
    {
      patientId: patients[8].id,
      doctorId: doctors[1].id,
      departmentId: departments[1].id,
      date: today,
      time: '09:30',
      status: AppointmentStatus.SCHEDULED,
      symptoms: 'High blood pressure',
      tokenCode: 'BB2002'
    },
    {
      patientId: patients[9].id,
      doctorId: doctors[1].id,
      departmentId: departments[1].id,
      date: today,
      time: '10:00',
      status: AppointmentStatus.SCHEDULED,
      symptoms: 'Shortness of breath',
      tokenCode: 'BB2003'
    },
    {
      patientId: patients[10].id,
      doctorId: doctors[1].id,
      departmentId: departments[1].id,
      date: today,
      time: '10:30',
      status: AppointmentStatus.SCHEDULED,
      symptoms: 'Chest discomfort',
      tokenCode: 'BB2004'
    },
    {
      patientId: patients[11].id,
      doctorId: doctors[1].id,
      departmentId: departments[1].id,
      date: today,
      time: '11:00',
      status: AppointmentStatus.SCHEDULED,
      symptoms: 'Dizziness',
      tokenCode: 'BB2005'
    },
    {
      patientId: patients[12].id,
      doctorId: doctors[1].id,
      departmentId: departments[1].id,
      date: today,
      time: '11:30',
      status: AppointmentStatus.SCHEDULED,
      symptoms: 'Irregular heartbeat',
      tokenCode: 'BB2006'
    },
    {
      patientId: patients[13].id,
      doctorId: doctors[1].id,
      departmentId: departments[1].id,
      date: today,
      time: '14:00',
      status: AppointmentStatus.SCHEDULED,
      symptoms: 'Cardiac evaluation',
      tokenCode: 'BB2007'
    }
  ]

  const createdAppointments = await prisma.appointment.createMany({
    data: todayAppointments
  })

  // Get the created appointments to create queue entries
  const allTodayAppointments = await prisma.appointment.findMany({
    where: {
      date: today
    }
  })

  // Create queue entries for today's appointments
  const queueEntries = allTodayAppointments.map((appointment, index) => {
    // First patient for each doctor is IN_CONSULTATION, others are WAITING
    const isDrSmith = appointment.doctorId === doctors[0].id
    const isFirstForDoctor = 
      (isDrSmith && index === 0) || 
      (!isDrSmith && index === 7)

    return {
      appointmentId: appointment.id,
      doctorId: appointment.doctorId,
      patientId: appointment.patientId,
      status: isFirstForDoctor ? QueueStatus.IN_CONSULTATION : QueueStatus.WAITING,
      position: Math.floor(index / 7) === 0 ? index + 1 : (index % 7) + 1,
      joinedAt: new Date(Date.now() - (index * 10 * 60 * 1000)), // Staggered join times
      startedAt: isFirstForDoctor ? new Date(Date.now() - 5 * 60 * 1000) : undefined // First patient started 5 minutes ago
    }
  })

  await prisma.queue.createMany({
    data: queueEntries
  })

  // Create some medical records
  const medicalRecords = []
  for (let i = 0; i < 20; i++) {
    medicalRecords.push({
      patientId: patients[i % patients.length].id,
      doctorId: doctors[i % doctors.length].id,
      diagnosis: `Diagnosis ${i + 1}: Common condition`,
      treatment: `Treatment ${i + 1}: Prescribed medication and rest`,
      prescription: `Prescription ${i + 1}: Medication X, 2x daily`,
      notes: `Follow up in ${i + 1} weeks if symptoms persist`,
      followUpDate: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000)
    })
  }

  await prisma.medicalRecord.createMany({
    data: medicalRecords
  })

  console.log('📊 Created appointments, queues, and medical records')

  // Print credential summary
  console.log('\n🔐 === DEMO CREDENTIALS ===')
  console.log('\n👨‍💼 ADMIN')
  console.log('Email: admin@hospital.com')
  console.log('Password: password123')
  
  console.log('\n👨‍⚕️ DOCTORS')
  console.log('Dr. John Smith - dr.smith@hospital.com')
  console.log('Dr. Sarah Jones - dr.jones@hospital.com')
  console.log('Password: password123 (for all)')
  
  console.log('\n👩‍⚕️ NURSE')
  console.log('Nurse Emily Wilson - nurse.wilson@hospital.com')
  console.log('Password: password123')
  
  console.log('\n🏥 RECEPTIONIST')
  console.log('Receptionist Mary Brown - reception@hospital.com')
  console.log('Password: password123')
  
  console.log('\n💊 PHARMACIST')
  console.log('Pharmacist David Lee - pharmacy@hospital.com')
  console.log('Password: password123')
  
  console.log('\n🔬 LAB TECHNICIAN')
  console.log('Lab Technician Alex Chen - lab@hospital.com')
  console.log('Password: password123')
  
  console.log('\n👥 PATIENTS (Sample)')
  console.log('Alice Johnson - patient1@email.com')
  console.log('Bob Williams - patient2@email.com')
  console.log('Carol Davis - patient3@email.com')
  console.log('Password: password123 (for all)')
  
  console.log('\n🚑 QUEUE SMOKE TEST SETUP')
  console.log('Dr. Smith: 7 patients (1 IN_CONSULTATION, 6 WAITING)')
  console.log('Dr. Jones: 7 patients (1 IN_CONSULTATION, 6 WAITING)')
  console.log('Token codes: AA1001-AA1007 (Dr. Smith), BB2001-BB2007 (Dr. Jones)')
  
  console.log('\n✅ Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
