declare global {
  interface Window {
    Kakao: {
      init: (key: string) => void
      isInitialized: () => boolean
      Share: {
        sendDefault: (params: object) => void
        sendScrap: (params: object) => void
      }
    }
  }
}

export function initKakao() {
  if (typeof window === 'undefined' || !window.Kakao) return
  if (window.Kakao.isInitialized()) return
  window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY!)
}

export function shareInviteLink(nickname: string, userCode: string) {
  if (typeof window === 'undefined' || !window.Kakao?.isInitialized()) return
  const link = `${window.location.origin}/invite/${userCode}`
  window.Kakao.Share.sendScrap({
    requestUrl: link,
    templateArgs: { nickname },
  })
}
