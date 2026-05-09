import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'PATIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const patientId = session.user.patient?.id
    if (!patientId) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get upcoming appointments
    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        patientId,
        date: {
          gte: today
        },
        status: {
          in: ['SCHEDULED', 'CONFIRMED']
        }
      },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        },
        department: true,
        queue: true
      },
      orderBy: [
        { date: 'asc' },
        { time: 'asc' }
      ],
      take: 5
    })

    // Get past appointments
    const pastAppointments = await prisma.appointment.findMany({
      where: {
        patientId,
        date: {
          lt: today
        }
      },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        },
        department: true
      },
      orderBy: [
        { date: 'desc' },
        { time: 'desc' }
      ],
      take: 5
    })

    // Get current queue status
    const currentQueue = await prisma.queue.findFirst({
      where: {
        patientId,
        status: {
          in: ['WAITING', 'IN_CONSULTATION']
        }
      },
      include: {
        appointment: {
          include: {
            doctor: {
              include: {
                user: {
                  select: {
                    name: true
                  }
                }
              }
            },
            department: true
          }
        }
      }
    })

    // Get medical records
    const medicalRecords = await prisma.medicalRecord.findMany({
      where: {
        patientId
      },
      include: {
        doctor: {
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

    // Get statistics
    const [
      totalAppointments,
      completedAppointments,
      upcomingCount
    ] = await Promise.all([
      prisma.appointment.count({
        where: { patientId }
      }),
      prisma.appointment.count({
        where: {
          patientId,
          status: 'COMPLETED'
        }
      }),
      prisma.appointment.count({
        where: {
          patientId,
          date: {
            gte: today
          },
          status: {
            in: ['SCHEDULED', 'CONFIRMED']
          }
        }
      })
    ])

    // Calculate estimated wait time if in queue
    let estimatedWaitTime = 0
    if (currentQueue && currentQueue.status === 'WAITING') {
      // Get all patients waiting for the same doctor
      const doctorQueue = await prisma.queue.findMany({
        where: {
          doctorId: currentQueue.doctorId,
          status: 'WAITING'
        },
        orderBy: [
          { position: 'asc' },
          { joinedAt: 'asc' }
        ]
      })

      const patientPosition = doctorQueue.findIndex((q: any) => q.patientId === patientId)
      if (patientPosition !== -1) {
        // 15 minutes per consultation
        estimatedWaitTime = patientPosition * 15
      }
    }

    const dashboard = {
      patient: {
        id: patientId,
        name: session.user.name,
        email: session.user.email
      },
      statistics: {
        totalAppointments,
        completedAppointments,
        upcomingCount
      },
      upcomingAppointments,
      pastAppointments,
      currentQueue: currentQueue ? {
        ...currentQueue,
        estimatedWaitTime
      } : null,
      medicalRecords
    }

    return NextResponse.json(dashboard)
  } catch (error) {
    console.error('Error fetching patient dashboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
