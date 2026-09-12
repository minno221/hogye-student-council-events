import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE_NAME, getExpectedAdminToken } from "@/lib/auth";

async function isAdmin(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return false;
  const expected = await getExpectedAdminToken();
  return token === expected;
}

// 행사 수정 (관리자만 가능)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "관리자 인증이 필요합니다." }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, naverFormUrl, isActive, startDate, endDate, imageUrl } = body;

  const event = await prisma.event.update({
    where: { id: params.id },
    data: {
      title,
      description,
      naverFormUrl,
      isActive,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      imageUrl: imageUrl || null,
    },
  });

  return NextResponse.json(event);
}

// 행사 삭제 (관리자만 가능)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "관리자 인증이 필요합니다." }, { status: 401 });
  }

  await prisma.event.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}