import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let queueItems

    if (session.user.role === 'PATIENT') {
      // Get patient's current queue position
      queueItems = await prisma.queue.findMany({
        where: {
          patientId: session.user.patient?.id,
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
        },
        orderBy: {
          joinedAt: 'asc'
        }
      })
    } else if (session.user.role === 'DOCTOR') {
      // Get doctor's current queue
      queueItems = await prisma.queue.findMany({
        where: {
          doctorId: session.user.doctor?.id,
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
          { status: 'asc' }, // WAITING before IN_CONSULTATION
          { position: 'asc' },
          { joinedAt: 'asc' }
        ]
      })
    } else {
      return NextResponse.json({ error: 'Invalid role for queue access' }, { status: 403 })
    }

    // Calculate estimated wait times for waiting patients
    const queueWithEstimates = await Promise.all(
      queueItems.map(async (queueItem: any) => {
        if (queueItem.status === 'IN_CONSULTATION') {
          return {
            ...queueItem,
            estimatedWaitMinutes: 0
          }
        }

        // Calculate wait time based on position and average consultation time
        const waitingAhead = await prisma.queue.count({
          where: {
            doctorId: queueItem.doctorId,
            status: 'WAITING',
            position: {
              lt: queueItem.position || 0
            }
          }
        })

        // Average 15 minutes per consultation
        const estimatedWaitMinutes = waitingAhead * 15

        return {
          ...queueItem,
          estimatedWaitMinutes
        }
      })
    )

    return NextResponse.json(queueWithEstimates)
  } catch (error) {
    console.error('Error fetching queue:', error)
    return NextResponse.json(
      { error: 'Failed to fetch queue' },
      { status: 500 }
    )
  }
}
