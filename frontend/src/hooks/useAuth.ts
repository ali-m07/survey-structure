import {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import {apiClient, SURVEY_API} from '../services/api';
export function useAuth() {
 const [user,setUser] = useState<any>(null); const [loading,setLoading] = useState(true); const router=useRouter();
 const checkAuth = async () => {if (!localStorage.getItem('token')) {setLoading(false);return;} try {setUser(await apiClient.get(`${SURVEY_API}/auth/me/`));} catch {localStorage.removeItem('token');setUser(null);} finally {setLoading(false);}};
 useEffect(()=>{checkAuth();},[]);
 const login=async(username:string,password:string)=>{try {const data=await apiClient.post<any>(`${SURVEY_API}/auth/login/`,{username,password}); localStorage.setItem('token',data.token); const tenant=data.tenants?.[0]; if(tenant) localStorage.setItem('tenant',String(typeof tenant==='string'?tenant:tenant.tenant_id || tenant.id)); setUser(data.user); return {success:true};} catch(error) {return {success:false,error:String(error)};}};
 const logout=async()=>{try {await apiClient.post(`${SURVEY_API}/auth/logout/`,{});} finally {localStorage.removeItem('token');localStorage.removeItem('tenant');setUser(null);router.push('/login');}};
 return {user,loading,authenticated:!!user,login,logout,checkAuth};
}
