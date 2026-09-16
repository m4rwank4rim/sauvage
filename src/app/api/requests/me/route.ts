import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { dbStore } from "../../../../lib/db/store";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const allRequests = await dbStore.getAllRequests();
    
    // Filter requests that belong to this user (either by exact userId or discord tag fallback)
    const userRequests = allRequests.filter(
      (r) => r.userId === userId || (session.user?.name && r.discordTag.includes(session.user.name))
    );

    return NextResponse.json({ success: true, data: userRequests });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Failed to fetch requests" }, { status: 500 });
  }
}
