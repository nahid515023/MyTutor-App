import Cookies from '../../node_modules/@types/js-cookie'
import { useEffect } from 'react'
export const CheckAuth = () => {
  useEffect(() => {
    if (!Cookies.get('token')) {
      window.location.href = '/signin'
    }
  }, [])
}
