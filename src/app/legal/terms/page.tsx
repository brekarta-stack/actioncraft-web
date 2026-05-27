import type { Metadata } from "next";
import { SITE_NAME, COMPANY } from "@/lib/site";

export const metadata: Metadata = {
  title: "이용약관",
  description: `${SITE_NAME}의 서비스 이용약관입니다.`,
  alternates: { canonical: "/legal/terms" },
  robots: { index: true, follow: true },
};

/**
 * 이용약관 기본 템플릿. 실제 서비스 출시 전 법무 검토 필요.
 */
export default function TermsPage() {
  const today = new Date().toISOString().split("T")[0];

  return (
    <article className="max-w-3xl mx-auto px-4 py-16 prose prose-slate">
      <h1>이용약관</h1>
      <p className="text-sm text-slate-500">최종 개정일: {today}</p>

      <h2>제1조 (목적)</h2>
      <p>
        본 약관은 {SITE_NAME}(이하 &ldquo;회사&rdquo;)이 제공하는 페이퍼토이·교구
        주문 제작 및 관련 서비스(이하 &ldquo;서비스&rdquo;)의 이용에 관한 회사와
        이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
      </p>

      <h2>제2조 (용어의 정의)</h2>
      <ul>
        <li>&ldquo;서비스&rdquo;: 회사가 제공하는 모든 페이퍼토이·교구 주문 제작 및 부수 서비스</li>
        <li>&ldquo;이용자&rdquo;: 회사 웹사이트에 접속하여 서비스를 이용하는 자</li>
        <li>&ldquo;견적&rdquo;: 이용자가 입력한 정보를 기반으로 회사가 산정한 추정 단가</li>
      </ul>

      <h2>제3조 (약관의 효력 및 변경)</h2>
      <p>
        본 약관은 웹사이트에 게시함으로써 효력이 발생합니다. 회사는 관계법령을
        위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.
      </p>

      <h2>제4조 (서비스의 제공)</h2>
      <p>회사는 다음과 같은 서비스를 제공합니다.</p>
      <ul>
        <li>페이퍼 모델 엔지니어링 (Action Paper Toy) 주문 제작</li>
        <li>STEAM 교육 키트 개발 및 공급</li>
        <li>기관·기업 캐릭터 굿즈 주문 제작</li>
        <li>BI/CI 편집 디자인</li>
        <li>기타 회사가 정하는 부수 서비스</li>
      </ul>

      <h2>제5조 (견적 및 계약)</h2>
      <p>
        웹사이트에서 제공되는 자동 견적은 추정치이며, 정식 계약은 회사와
        이용자가 별도 합의한 견적서·발주서·계약서에 따라 체결됩니다.
      </p>

      <h2>제6조 (지적재산권)</h2>
      <p>
        회사가 보유한 자기구조 설계 특허 및 디자인의 모든 권리는 회사에
        귀속됩니다. 이용자가 제공한 디자인의 권리는 별도 계약에 따릅니다.
      </p>

      <h2>제7조 (이용자의 의무)</h2>
      <p>이용자는 다음 행위를 하여서는 안 됩니다.</p>
      <ul>
        <li>허위 정보의 등록</li>
        <li>회사의 운영을 방해하는 행위</li>
        <li>타인의 지적재산권을 침해하는 디자인의 제출</li>
      </ul>

      <h2>제8조 (책임 제한)</h2>
      <p>
        회사는 천재지변, 비상사태, 기술적 결함 등 회사가 통제할 수 없는 사유로
        서비스를 제공할 수 없는 경우 책임이 면제됩니다.
      </p>

      <h2>제9조 (분쟁 해결)</h2>
      <p>
        본 약관에 명시되지 않은 사항은 관계 법령 및 상관례에 따릅니다. 회사와
        이용자 간 분쟁은 민사소송법상 관할 법원을 따릅니다.
      </p>

      <h2>제10조 (연락처)</h2>
      <ul>
        <li>이메일: {COMPANY.email}</li>
        {COMPANY.phone && <li>연락처: {COMPANY.phone}</li>}
      </ul>
    </article>
  );
}
