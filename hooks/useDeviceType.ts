'use client'

import { useState, useEffect } from 'react'

export function useDeviceType() {
  const [isPC, setIsPC] = useState(true)

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = window.navigator.userAgent.toLowerCase()
      const mobile = /iphone|ipad|ipod|android|blackberry|windows phone/g.test(userAgent)
      setIsPC(!mobile)
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  return isPC
}

