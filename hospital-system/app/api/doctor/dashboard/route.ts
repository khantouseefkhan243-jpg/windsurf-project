import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const doctorId = session.user.doctor?.id
    if (!doctorId) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get today's appointments
    const todayAppointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        date: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        queue: true
      },
      orderBy: [
        { time: 'asc' }
      ]
    })

    // Get current queue
    const currentQueue = await prisma.queue.findMany({
      where: {
        doctorId,
        status: {
          in: ['WAITING', 'IN_CONSULTATION']
        }
      },
      include: {
        appointment: {
          include: {
            patient: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: [
        { status: 'asc' },
        { position: 'asc' },
        { joinedAt: 'asc' }
      ]
    })

    // Get statistics
    const [
      totalPatients,
      totalAppointments,
      completedAppointments,
      upcomingAppointments
    ] = await Promise.all([
      prisma.appointment.count({
        where: { doctorId }
      }),
      prisma.appointment.count({
        where: { doctorId }
      }),
      prisma.appointment.count({
        where: {
          doctorId,
          status: 'COMPLETED'
        }
      }),
      prisma.appointment.count({
        where: {
          doctorId,
          date: {
            gte: today
          },
          status: {
            in: ['SCHEDULED', 'CONFIRMED']
          }
        }
      })
    ])

    // Calculate queue statistics
    const waitingCount = currentQueue.filter(q => q.status === 'WAITING').length
    const inConsultationCount = currentQueue.filter(q => q.status === 'IN_CONSULTATION').length

    // Calculate estimated wait time for next patient
    let estimatedWaitTime = 0
    if (waitingCount > 0) {
      const nextPatient = currentQueue.find(q => q.status === 'WAITING')
      if (nextPatient) {
        // Base estimate on position (15 minutes per consultation)
        estimatedWaitTime = waitingCount * 15
      }
    }

    // Get recent medical records
    const recentRecords = await prisma.medicalRecord.findMany({
      where: {
        doctorId
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    const dashboard = {
      doctor: {
        id: doctorId,
        name: session.user.name,
        specialization: session.user.doctor?.specialization
      },
      statistics: {
        totalPatients,
        totalAppointments,
        completedAppointments,
        upcomingAppointments,
        waitingCount,
        inConsultationCount,
        estimatedWaitTime
      },
      todayAppointments,
      currentQueue,
      recentRecords
    }

    return NextResponse.json(dashboard)
  } catch (error) {
    console.error('Error fetching doctor dashboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
