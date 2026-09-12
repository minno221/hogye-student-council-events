import { prisma } from "@/lib/prisma";

// 매 요청마다 최신 데이터를 보여주기 위해 캐시 사용 안 함
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const events = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container">
      <h1>학생회 행사</h1>
      <p style={{ color: "#666", marginTop: -8 }}>
        행사를 클릭하면 지원 폼(네이버폼)으로 이동합니다.
      </p>

      {events.length === 0 && <p>등록된 행사가 없습니다.</p>}

      {events.map((event) => (
        <a
          key={event.id}
          className="event-card"
          href={event.naverFormUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className={`badge ${event.isActive ? "active" : "closed"}`}>
            {event.isActive ? "진행중" : "마감"}
          </span>
          <div className="event-title">{event.title}</div>
          <div className="event-desc">{event.description}</div>
        </a>
      ))}
    </div>
  );
}
