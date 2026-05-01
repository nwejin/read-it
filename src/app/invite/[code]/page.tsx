'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import gsap from 'gsap';
import { Link2Off } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types';

type PageState = 'loading' | 'not_found' | 'self' | 'already' | 'unauthenticated' | 'ready' | 'success' | 'error';

export default function InvitePage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const [state, setState] = useState<PageState>('loading');
  const [inviter, setInviter] = useState<Profile | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const [pending, setPending] = useState(false);
  const toastRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const [
        {
          data: { user },
        },
        { data: profile },
      ] = await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from('profiles')
          .select('id, nickname, user_code, avatar_url, created_at')
          .eq('user_code', code?.toUpperCase() ?? '')
          .maybeSingle(),
      ]);

      if (!user) {
        setState('unauthenticated');
        if (profile) setInviter(profile);
        return;
      }

      if (!profile) {
        setState('not_found');
        return;
      }

      setInviter(profile);

      if (profile.id === user.id) {
        setState('self');
        return;
      }

      const { data: existing } = await supabase
        .from('friendships')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', profile.id)
        .maybeSingle();

      setState(existing ? 'already' : 'ready');
    }

    init();
  }, [code]);

  function showToast(msg: string) {
    setToastMsg(msg);
    if (toastRef.current) {
      gsap.fromTo(toastRef.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });
    }
  }

  async function handleAccept() {
    if (!inviter || pending) return;
    setPending(true);
    try {
      const res = await fetch('/api/friends/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviterCode: code }),
      });
      const json = await res.json();
      if (res.ok) {
        setState('success');
        showToast(`${inviter.nickname}님과 친구가 됐어요!`);
        setTimeout(() => router.push('/friends'), 2000);
      } else if (json.error === 'ALREADY_FRIENDS') {
        setState('already');
      } else if (json.error === 'UNAUTHORIZED') {
        setState('unauthenticated');
      } else {
        setState('error');
      }
    } catch {
      setState('error');
    } finally {
      setPending(false);
    }
  }

  function handleLoginRedirect() {
    router.push(`/login?redirect=/invite/${code}`);
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm">
        {/* 로고 */}

        {state === 'loading' && (
          <div className="flex justify-center">
            <span className="w-6 h-6 border-2 border-[#ddd] border-t-[#111] rounded-full animate-spin" />
          </div>
        )}

        {state === 'not_found' && (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Link2Off size={48} strokeWidth={1.5} className="text-[#111]" />
            </div>
            <p className="text-2xl font-bold text-[#111] mb-2">유효하지 않은 초대 링크예요</p>
            <p className="text-base text-[#888]">링크가 올바른지 확인해보세요</p>
          </div>
        )}

        {state === 'unauthenticated' && !inviter && (
          <div className="text-center p-6">
            <p className="text-xl font-bold text-[#111] mb-2">로그인이 필요해요</p>
            <p className="text-sm text-[#888] mb-6">로그인하고 친구 초대를 수락해보세요</p>
            <button
              onClick={handleLoginRedirect}
              className="w-full py-4 bg-[#111] text-white text-base font-semibold rounded-xl active:scale-95 transition-transform">
              로그인하고 친구 추가
            </button>
          </div>
        )}

        {(state === 'unauthenticated' ||
          state === 'ready' ||
          state === 'already' ||
          state === 'self' ||
          state === 'success' ||
          state === 'error') &&
          inviter && (
            <div className="p-6 ">
              {/* 초대자 정보 */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative w-20 h-20 rounded-full bg-[#111] overflow-hidden flex items-center justify-center mb-4">
                  {inviter.avatar_url ? (
                    <Image src={inviter.avatar_url} alt={inviter.nickname} fill className="object-cover" sizes="80px" />
                  ) : (
                    <span className="text-white text-2xl font-bold">{inviter.nickname.slice(0, 1).toUpperCase()}</span>
                  )}
                </div>
                <p className="text-xl font-bold text-[#111]">{inviter.nickname}</p>
                <p className="text-sm text-[#aaa] mt-1">님이 친구를 신청했어요</p>
              </div>

              {state === 'unauthenticated' && (
                <>
                  <p className="text-center text-sm text-[#888] mb-5">로그인하고 친구를 수락해보세요</p>
                  <button
                    onClick={handleLoginRedirect}
                    className="w-full py-4 bg-[#111] text-white text-base font-semibold rounded-xl active:scale-95 transition-transform">
                    로그인하고 친구 추가
                  </button>
                </>
              )}

              {state === 'ready' && (
                <button
                  onClick={handleAccept}
                  disabled={pending}
                  className="w-full py-4 bg-[#111] text-white text-base font-semibold rounded-xl active:scale-95 transition-transform disabled:opacity-40">
                  {pending ? '추가 중...' : '친구 추가'}
                </button>
              )}

              {state === 'already' && (
                <div className="text-center py-3">
                  <p className="text-base font-semibold text-[#111] mb-1">이미 친구예요 👋</p>
                  <button
                    onClick={() => router.push('/friends')}
                    className="mt-4 text-sm text-[#aaa] underline underline-offset-2">
                    친구 목록 보기
                  </button>
                </div>
              )}

              {state === 'self' && (
                <div className="text-center py-3">
                  <p className="text-sm text-[#888]">내 초대 링크예요</p>
                </div>
              )}

              {state === 'success' && (
                <div className="text-center py-3">
                  <p className="text-base font-semibold text-[#111]">친구 추가 완료! 🎉</p>
                  <p className="text-sm text-[#aaa] mt-1">잠시 후 친구 목록으로 이동해요</p>
                </div>
              )}

              {state === 'error' && (
                <>
                  <p className="text-center text-sm text-red-500 mb-4">오류가 발생했어요. 다시 시도해주세요.</p>
                  <button
                    onClick={handleAccept}
                    disabled={pending}
                    className="w-full py-4 bg-[#111] text-white text-base font-semibold rounded-xl active:scale-95 transition-transform disabled:opacity-40">
                    다시 시도
                  </button>
                </>
              )}
            </div>
          )}
      </div>

      {/* 토스트 */}
      {toastMsg && (
        <div
          ref={toastRef}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-[#111] text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-lg z-50 whitespace-nowrap">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
