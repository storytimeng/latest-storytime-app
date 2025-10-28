import React from 'react'
import { Magnetik_Bold } from '@/lib/font'

const HomeView = () => {
  return (
    <div className='w-full h-full text-center items-center justify-center'>
        <h1 className={`text-4xl font-bold text-red-700 ${Magnetik_Bold.className}`}>Welcome to the Home Page</h1>
        <p className={`text-lg text-blue-700 ${Magnetik_Bold.className}`}>This is the home page of the website</p>
        
    </div>
  )
}

export default HomeView