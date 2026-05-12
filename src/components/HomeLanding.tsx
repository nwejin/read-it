'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AladinBook } from '@/types';
import { BookOpen, Users, Star, Search } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  { icon: Search, text: '책을 검색해서 나만의 서재에 등록하세요' },
  { icon: BookOpen, text: '읽은 책, 읽는 중, 읽고 싶은 책을 한눈에 관리해요' },
  { icon: Star, text: '별점과 메모로 나만의 독서 기록을 남겨요' },
  { icon: Users, text: '친구를 추가해서 친구의 책장을 구경해요' },
];

function BookColumn({ books, direction, speed }: { books: AladinBook[]; direction: 'up' | 'down'; speed: number }) {
  const colRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = colRef.current;
    if (!el) return;

    const totalHeight = el.scrollHeight / 2;
    const yStart = direction === 'up' ? 0 : -totalHeight;
    const yEnd = direction === 'up' ? -totalHeight : 0;

    gsap.fromTo(
      el,
      { y: yStart },
      {
        y: yEnd,
        duration: speed,
        ease: 'none',
        repeat: -1,
      }
    );
  }, [direction, speed]);

  const doubled = [...books, ...books];

  return (
    <div className="flex flex-col gap-2 overflow-hidden" style={{ height: '100vh' }}>
      <div ref={colRef} className="flex flex-col gap-2">
        {doubled.map((book, i) => (
          <div key={`${book.isbn13}-${i}`} className="relative w-24 h-34 shrink-0 rounded-lg overflow-hidden bg-[#222]">
            {book.cover && <Image src={book.cover} alt={book.title} fill sizes="96px" className="object-cover" />}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomeLanding({ books }: { books: AladinBook[] }) {
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const items = featuresRef.current?.querySelectorAll('.feature-item');
    if (!items) return;

    items.forEach((item) => {
      gsap.fromTo(
        item,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
          },
        }
      );
    });

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  const col1 = books.filter((_, i) => i % 3 === 0);
  const col2 = books.filter((_, i) => i % 3 === 1);
  const col3 = books.filter((_, i) => i % 3 === 2);

  const fill = (arr: AladinBook[]) => (arr.length < 3 ? [...books].slice(0, 4) : arr);

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      {/* 섹션 1 — 풀스크린 애니메이션 */}
      <section className="relative h-screen overflow-hidden flex items-center justify-center">
        {/* 책 표지 배경 */}
        <div className="absolute inset-0 flex gap-2 px-2 justify-center opacity-60">
          <BookColumn books={fill(col1)} direction="up" speed={18} />
          <BookColumn books={fill(col2)} direction="down" speed={22} />
          <BookColumn books={fill(col3)} direction="up" speed={15} />
        </div>

        {/* 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a] backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-[#0a0a0a]/40" />

        {/* 중앙 콘텐츠 */}
        <div className="relative z-10 flex flex-col items-center text-center px-8">
          <h1 className="text-5xl font-bold text-white tracking-tight mb-3">읽었나?</h1>
          <p className="text-lg font-medium text-white/80 mb-10 leading-relaxed">나만의 서재</p>
          <Link
            href="/login"
            className="px-8 py-4 bg-white text-[#111] text-base font-semibold rounded-2xl active:opacity-80">
            시작하기
          </Link>
        </div>

        {/* 아래 스크롤 유도 */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <div className="flex flex-col items-center gap-1 text-white/30 text-xs animate-bounce">
            <span>스크롤</span>
            <span>↓</span>
          </div>
        </div>
      </section>

      {/* 섹션 2 — 기능 소개 */}
      <section ref={featuresRef} className="px-8 py-10 flex flex-col gap-10 max-w-lg mx-auto">
        <h2 className="text-2xl font-bold text-white text-center mb-2">이런 기능이 있어요</h2>
        {FEATURES.map(({ icon: Icon, text }) => (
          <div key={text} className="feature-item flex items-start gap-2 sm:gap-5">
            <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <p className="text-white/70 text-sm sm:text-lg leading-relaxed pt-2.5">{text}</p>
          </div>
        ))}

        <Link
          href="/login"
          className="mt-4 w-full py-4 bg-white text-[#111] text-base font-semibold rounded-2xl text-center active:opacity-80">
          지금 시작하기
        </Link>
      </section>
    </div>
  );
}
