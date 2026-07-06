"use client";

/**
 * 상세 페이지의 「학급 세트에 담기」 — localStorage 카트에 넣고
 * /studio/class 로 이어 준다 (교사 동선: 카탈로그 구경 → 담기 → 세트).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { CLASS_MAX_ITEMS } from "@/lib/studio-class-shared.mjs";

const CART_KEY = "studio_class_cart";

interface Row {
  skey: string;
  qty: number;
}

function readCart(): Row[] {
  try {
    const v = JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export default function StudioClassAdd({ skey }: { skey: string }) {
  const [inCart, setInCart] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const cart = readCart();
    setInCart(cart.some((r) => r.skey === skey));
    setCount(cart.length);
  }, [skey]);

  function add() {
    const cart = readCart();
    if (!cart.some((r) => r.skey === skey)) {
      if (cart.length >= CLASS_MAX_ITEMS) return;
      cart.push({ skey, qty: 1 });
      try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
      } catch {}
    }
    setInCart(true);
    setCount(cart.length);
  }

  if (inCart) {
    return (
      <Link
        href="/studio/class"
        data-track={`studio_class_view:${skey}`}
        className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        ✓ 담김 — 학급 세트 보기 ({count}종)
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={add}
      data-track={`studio_class_add:${skey}`}
      className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
    >
      학급 세트에 담기
    </button>
  );
}
