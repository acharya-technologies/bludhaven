import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const secret = process.env.REVENUE_UNLOCK_CODE

  if (!secret) {
    return NextResponse.json(
      { error: "Unlock code not configured" },
      { status: 500 }
    )
  }

  const { code } = await request.json()

  if (code === secret) {
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Invalid code" }, { status: 401 })
}


