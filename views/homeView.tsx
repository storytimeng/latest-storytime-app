import React from 'react'
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular, Magnetik_Light, Magnetik_SemiBold } from '@/lib/font'

const HomeView = () => {
  return (
    <div className='w-full min-h-screen bg-gradient-to-b from-slate-50 to-slate-100'>
      {/* Hero Section */}
      <div className='w-full h-screen flex flex-col items-center justify-center px-6 space-y-8'>
        <h1 className={`text-6xl md:text-8xl font-bold text-red-700 ${Magnetik_Bold.className}`}>
          Welcome to Storytime
        </h1>
        <p className={`text-2xl md:text-3xl text-blue-700 max-w-3xl ${Magnetik_Medium.className}`}>
          Discover Amazing Stories
        </p>
        <p className={`text-lg text-gray-600 max-w-2xl ${Magnetik_Regular.className}`}>
          Immerse yourself in a world of captivating narratives and imaginative tales
        </p>
      </div>

      {/* Features Section */}
      <div className='w-full py-16 px-6 bg-white'>
        <div className='max-w-7xl mx-auto'>
          <h2 className={`text-4xl md:text-5xl font-bold text-center mb-12 text-gray-800 ${Magnetik_SemiBold.className}`}>
            Why Choose Us
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='p-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl shadow-lg hover:shadow-xl transition-shadow'>
              <h3 className={`text-2xl font-bold text-purple-800 mb-4 ${Magnetik_Bold.className}`}>
                Stories for Everyone
              </h3>
              <p className={`text-gray-700 ${Magnetik_Regular.className}`}>
                A diverse collection of stories that appeal to readers of all ages and interests.
              </p>
            </div>
            <div className='p-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl shadow-lg hover:shadow-xl transition-shadow'>
              <h3 className={`text-2xl font-bold text-blue-800 mb-4 ${Magnetik_Bold.className}`}>
                Easy to Read
              </h3>
              <p className={`text-gray-700 ${Magnetik_Regular.className}`}>
                Beautiful, clean interface designed for the best reading experience.
              </p>
            </div>
            <div className='p-8 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl shadow-lg hover:shadow-xl transition-shadow'>
              <h3 className={`text-2xl font-bold text-green-800 mb-4 ${Magnetik_Bold.className}`}>
                Always Updated
              </h3>
              <p className={`text-gray-700 ${Magnetik_Regular.className}`}>
                New stories added regularly to keep your reading experience fresh and exciting.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className='w-full py-16 px-6 bg-gradient-to-r from-indigo-600 to-purple-600'>
        <div className='max-w-7xl mx-auto'>
          <h2 className={`text-4xl md:text-5xl font-bold text-center mb-12 text-white ${Magnetik_Bold.className}`}>
            Our Impact
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
            <div className='text-center'>
              <p className={`text-5xl font-bold text-white mb-2 ${Magnetik_Bold.className}`}>10K+</p>
              <p className={`text-xl text-indigo-100 ${Magnetik_Regular.className}`}>Stories</p>
            </div>
            <div className='text-center'>
              <p className={`text-5xl font-bold text-white mb-2 ${Magnetik_Bold.className}`}>50K+</p>
              <p className={`text-xl text-indigo-100 ${Magnetik_Regular.className}`}>Readers</p>
            </div>
            <div className='text-center'>
              <p className={`text-5xl font-bold text-white mb-2 ${Magnetik_Bold.className}`}>100+</p>
              <p className={`text-xl text-indigo-100 ${Magnetik_Regular.className}`}>Authors</p>
            </div>
            <div className='text-center'>
              <p className={`text-5xl font-bold text-white mb-2 ${Magnetik_Bold.className}`}>4.9</p>
              <p className={`text-xl text-indigo-100 ${Magnetik_Regular.className}`}>Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className='w-full py-20 px-6 bg-slate-50'>
        <div className='max-w-4xl mx-auto text-center'>
          <h2 className={`text-4xl md:text-6xl font-bold mb-6 text-gray-900 ${Magnetik_Bold.className}`}>
            Start Reading Today
          </h2>
          <p className={`text-xl text-gray-600 mb-8 ${Magnetik_Medium.className}`}>
            Join thousands of readers and explore our collection of amazing stories
          </p>
          <button className={`px-10 py-4 bg-gradient-to-r from-red-600 to-blue-600 text-white rounded-full text-lg font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 ${Magnetik_SemiBold.className}`}>
            Get Started
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className='w-full py-8 px-6 bg-gray-900 text-center'>
        <p className={`text-gray-400 ${Magnetik_Light.className}`}>
          © 2025 Storytime. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default HomeView