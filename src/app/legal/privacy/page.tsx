import type { Metadata } from "next";
import { SITE_NAME, COMPANY } from "@/lib/site";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: `${SITE_NAME}의 개인정보처리방침입니다.`,
  alternates: { canonical: "/legal/privacy" },
  robots: { index: true, follow: true },
};

/**
 * 개인정보처리방침 기본 템플릿.
 * 실제 운영 전 법무 검토 필요. 사업자번호/주소/책임자 정보 채워 넣어야 함.
 */
export default function PrivacyPage() {
  const today = new Date().toISOString().split("T")[0];

  return (
    <article className="max-w-3xl mx-auto px-4 py-16 prose prose-slate">
      <h1>개인정보처리방침</h1>
      <p className="text-sm text-slate-500">최종 개정일: {today}</p>

      <p>
        {SITE_NAME}(이하 &ldquo;회사&rdquo;)는 정보주체의 자유와 권리 보호를 위해
        「개인정보 보호법」 및 관계 법령이 정한 바를 준수하여, 적법하게
        개인정보를 처리하고 안전하게 관리하고 있습니다.
      </p>

      <h2>제1조 (수집하는 개인정보 항목 및 수집 방법)</h2>
      <p>회사는 제작 문의, 서비스 이용 신청 시 다음의 개인정보를 수집합니다.</p>
      <ul>
        <li>필수항목: 이름, 이메일, 회사명, 연락처</li>
        <li>선택항목: 직책, 문의 내용, 첨부 파일</li>
        <li>자동 수집: 접속 IP, 쿠키, 서비스 이용 기록, 기기 정보</li>
      </ul>

      <h2>제2조 (개인정보의 처리 목적)</h2>
      <ul>
        <li>제작 문의 응답 및 서비스 계약 체결·이행</li>
        <li>고객 상담 및 민원 처리</li>
        <li>서비스 개선을 위한 통계 분석</li>
      </ul>

      <h2>제3조 (개인정보의 보유 및 이용 기간)</h2>
      <p>
        회사는 법령에 따른 보존 의무가 있는 경우를 제외하고, 수집·이용 목적이
        달성된 후 지체 없이 파기합니다. 단, 다음의 정보는 명시한 기간 동안
        보존합니다.
      </p>
      <ul>
        <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
        <li>대금결제 및 재화 공급에 관한 기록: 5년</li>
        <li>소비자 불만 또는 분쟁처리에 관한 기록: 3년</li>
      </ul>

      <h2>제4조 (개인정보의 제3자 제공)</h2>
      <p>
        회사는 정보주체의 별도 동의가 있거나 법령에 특별한 규정이 있는 경우를
        제외하고는 개인정보를 외부에 제공하지 않습니다.
      </p>

      <h2>제5조 (정보주체의 권리·의무)</h2>
      <p>
        정보주체는 언제든지 등록되어 있는 자신의 개인정보를 조회·정정·삭제 및
        처리 정지를 요청할 수 있습니다.
      </p>

      <h2>제6조 (개인정보 보호책임자)</h2>
      <ul>
        <li>책임자: (담당자명 — 운영자 입력 예정)</li>
        <li>이메일: {COMPANY.email}</li>
        {COMPANY.phone && <li>연락처: {COMPANY.phone}</li>}
      </ul>

      <h2>제7조 (개정에 관한 사항)</h2>
      <p>
        본 개인정보처리방침은 법령·정책 또는 보안기술의 변경에 따라 내용의
        추가·삭제 및 수정이 있을 시 시행 7일 전부터 본 페이지를 통해 공지합니다.
      </p>
    </article>
  );
}
