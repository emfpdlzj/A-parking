import api from './axiosInstance'

export async function loginApi(id, password) {
  const res = await api.post('/api/auth/login',{
    username : id,
    password : password
  })
  return res.data //로그인 응답 데이터 받아옴
}
