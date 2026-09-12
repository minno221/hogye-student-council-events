import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE_NAME, getExpectedAdminToken } from "@/lib/auth";

async function isAdmin(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return false;
  const expected = await getExpectedAdminToken();
  return token === expected;
}

// 전체 행사 목록 조회 (일반 사용자 + 관리자 모두 사용)
export async function GET() {
  const events = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(events);
}

// 새 행사 등록 (관리자만 가능)
export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "관리자 인증이 필요합니다." }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, naverFormUrl, isActive, startDate, endDate, imageUrl } = body;

  if (!title || !naverFormUrl) {
    return NextResponse.json(
      { error: "제목과 네이버폼 링크는 필수입니다." },
      { status: 400 }
    );
  }

  const event = await prisma.event.create({
    data: {
      title,
      description: description || "",
      naverFormUrl,
      isActive: isActive ?? true,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      imageUrl: imageUrl || null,
    },
  });

  return NextResponse.json(event, { status: 201 });
}