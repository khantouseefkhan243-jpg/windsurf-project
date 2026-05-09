import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { doctorId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { doctorId } = params

    // Verify access rights
    if (session.user.role !== 'DOCTOR' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (session.user.role === 'DOCTOR' && session.user.doctor?.id !== doctorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const queueItems = await prisma.queue.findMany({
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
        { status: 'asc' }, // WAITING before IN_CONSULTATION
        { position: 'asc' },
        { joinedAt: 'asc' }
      ]
    })

    // Calculate estimated wait times and update positions
    const queueWithEstimates = await Promise.all(
      queueItems.map(async (queueItem: any, index: number) => {
        let estimatedWaitMinutes = 0

        if (queueItem.status === 'WAITING') {
          // Count patients ahead in queue
          const waitingAhead = queueItems.filter(
            (item: any, idx: number) => 
              item.status === 'WAITING' && 
              idx < index
          ).length

          // Average 15 minutes per consultation
          // If there's someone in consultation, add remaining time
          const inConsultation = queueItems.find((item: any) => item.status === 'IN_CONSULTATION')
          if (inConsultation) {
            // Estimate remaining time based on how long they've been in consultation
            const consultationDuration = inConsultation.startedAt 
              ? Date.now() - new Date(inConsultation.startedAt).getTime()
              : 0
            const remainingConsultationTime = Math.max(0, 15 * 60 * 1000 - consultationDuration) // 15 minutes total
            estimatedWaitMinutes = Math.ceil(remainingConsultationTime / (60 * 1000)) + (waitingAhead * 15)
          } else {
            estimatedWaitMinutes = waitingAhead * 15
          }
        }

        // Update position in database
        await prisma.queue.update({
          where: { id: queueItem.id },
          data: { position: index + 1 }
        })

        return {
          ...queueItem,
          position: index + 1,
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

export async function POST(
  request: NextRequest,
  { params }: { params: { doctorId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { doctorId } = params
    const body = await request.json()
    const { appointmentId, action } = body

    // Verify access rights
    if (session.user.role !== 'DOCTOR' || session.user.doctor?.id !== doctorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const queueItem = await prisma.queue.findFirst({
      where: { appointmentId },
      include: { appointment: true }
    })

    if (!queueItem) {
      return NextResponse.json({ error: 'Queue item not found' }, { status: 404 })
    }

    let updatedQueue

    switch (action) {
      case 'start_consultation':
        updatedQueue = await prisma.queue.update({
          where: { id: queueItem.id },
          data: {
            status: 'IN_CONSULTATION',
            startedAt: new Date()
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
          }
        })
        break

      case 'complete_consultation':
        updatedQueue = await prisma.queue.update({
          where: { id: queueItem.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date()
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
          }
        })

        // Update appointment status
        await prisma.appointment.update({
          where: { id: appointmentId },
          data: {
            status: 'COMPLETED',
            actualEndTime: new Date()
          }
        })
        break

      case 'cancel':
        updatedQueue = await prisma.queue.update({
          where: { id: queueItem.id },
          data: {
            status: 'CANCELLED'
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
          }
        })

        // Update appointment status
        await prisma.appointment.update({
          where: { id: appointmentId },
          data: {
            status: 'CANCELLED'
          }
        })
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json(updatedQueue)
  } catch (error) {
    console.error('Error updating queue:', error)
    return NextResponse.json(
      { error: 'Failed to update queue' },
      { status: 500 }
    )
  }
}
