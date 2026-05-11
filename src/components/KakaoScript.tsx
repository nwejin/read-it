'use client'

import Script from 'next/script'
import { initKakao } from '@/lib/kakao'

export default function KakaoScript() {
  return (
    <Script
      src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
      strategy="afterInteractive"
      onLoad={initKakao}
    />
  )
}
