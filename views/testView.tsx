import React from 'react'
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular, Magnetik_SemiBold, Magnetik_Light } from '@/lib/font'
import { Button } from '@/components/ui/button'
import { CheckCircle, Sparkles, BookOpen, Star, ArrowRight } from 'lucide-react'

const TestView = () => {
  return (
    <div className='w-full min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50'>
      {/* Hero Section */}
      <div className='relative overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10'></div>
        <div className='relative max-w-7xl mx-auto px-6 py-20'>
          <div className='text-center'>
            <div className='inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full mb-6'>
              <Sparkles className='w-5 h-5 text-purple-600' />
              <span className={`text-sm text-purple-600 ${Magnetik_SemiBold.className}`}>
                Testing & Development
              </span>
            </div>
            <h1 className={`text-6xl md:text-8xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 ${Magnetik_Bold.className}`}>
              Test View
            </h1>
            <p className={`text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-8 ${Magnetik_Medium.className}`}>
              A beautiful testing page showcasing modern design patterns and components
            </p>
            <div className='flex flex-wrap justify-center gap-4'>
              <Button variant="primary" className={Magnetik_Medium.className}>
                Get Started
              </Button>
              <Button variant="secondary" className={Magnetik_Medium.className}>
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className='max-w-7xl mx-auto px-6 py-20'>
        <div className='text-center mb-12'>
          <h2 className={`text-4xl md:text-5xl font-bold text-gray-800 mb-4 ${Magnetik_Bold.className}`}>
            Key Features
          </h2>
          <p className={`text-lg text-gray-600 ${Magnetik_Regular.className}`}>
            Explore the amazing features we've built
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {/* Feature 1 */}
          <div className='bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-2'>
            <div className='w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6'>
              <Sparkles className='w-8 h-8 text-purple-600' />
            </div>
            <h3 className={`text-2xl font-bold text-gray-800 mb-3 ${Magnetik_Bold.className}`}>
              Modern Design
            </h3>
            <p className={`text-gray-600 mb-4 ${Magnetik_Regular.className}`}>
              Beautifully crafted with modern design principles and best practices.
            </p>
            <a href="#" className={`text-purple-600 hover:text-purple-700 flex items-center gap-2 ${Magnetik_Medium.className}`}>
              Learn more <ArrowRight className='w-4 h-4' />
            </a>
          </div>

          {/* Feature 2 */}
          <div className='bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-2'>
            <div className='w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6'>
              <BookOpen className='w-8 h-8 text-blue-600' />
            </div>
            <h3 className={`text-2xl font-bold text-gray-800 mb-3 ${Magnetik_Bold.className}`}>
              User Friendly
            </h3>
            <p className={`text-gray-600 mb-4 ${Magnetik_Regular.className}`}>
              Intuitive interface designed with user experience in mind.
            </p>
            <a href="#" className={`text-blue-600 hover:text-blue-700 flex items-center gap-2 ${Magnetik_Medium.className}`}>
              Learn more <ArrowRight className='w-4 h-4' />
            </a>
          </div>

          {/* Feature 3 */}
          <div className='bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-2'>
            <div className='w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6'>
              <Star className='w-8 h-8 text-indigo-600' />
            </div>
            <h3 className={`text-2xl font-bold text-gray-800 mb-3 ${Magnetik_Bold.className}`}>
              High Quality
            </h3>
            <p className={`text-gray-600 mb-4 ${Magnetik_Regular.className}`}>
              Premium quality code and design that stands the test of time.
            </p>
            <a href="#" className={`text-indigo-600 hover:text-indigo-700 flex items-center gap-2 ${Magnetik_Medium.className}`}>
              Learn more <ArrowRight className='w-4 h-4' />
            </a>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className='bg-gradient-to-r from-purple-600 to-blue-600 py-16'>
        <div className='max-w-7xl mx-auto px-6'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
            <div className='text-center'>
              <div className={`text-5xl font-bold text-white mb-2 ${Magnetik_Bold.className}`}>
                100%
              </div>
              <div className={`text-xl text-purple-100 ${Magnetik_Regular.className}`}>
                Satisfaction
              </div>
            </div>
            <div className='text-center'>
              <div className={`text-5xl font-bold text-white mb-2 ${Magnetik_Bold.className}`}>
                50K+
              </div>
              <div className={`text-xl text-purple-100 ${Magnetik_Regular.className}`}>
                Users
              </div>
            </div>
            <div className='text-center'>
              <div className={`text-5xl font-bold text-white mb-2 ${Magnetik_Bold.className}`}>
                1000+
              </div>
              <div className={`text-xl text-purple-100 ${Magnetik_Regular.className}`}>
                Projects
              </div>
            </div>
            <div className='text-center'>
              <div className={`text-5xl font-bold text-white mb-2 ${Magnetik_Bold.className}`}>
                24/7
              </div>
              <div className={`text-xl text-purple-100 ${Magnetik_Regular.className}`}>
                Support
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className='max-w-7xl mx-auto px-6 py-20'>
        <div className='bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 text-center'>
          <CheckCircle className='w-16 h-16 text-white mx-auto mb-6' />
          <h2 className={`text-4xl md:text-5xl font-bold text-white mb-4 ${Magnetik_Bold.className}`}>
            Ready to Get Started?
          </h2>
          <p className={`text-xl text-purple-100 mb-8 max-w-2xl mx-auto ${Magnetik_Regular.className}`}>
            Join thousands of users who are already using our amazing platform
          </p>
          <Button 
            variant="large" 
            className={`bg-white text-purple-600 hover:bg-purple-50 ${Magnetik_SemiBold.className}`}
          >
            Start Free Trial
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className='bg-gray-900 py-12'>
        <div className='max-w-7xl mx-auto px-6 text-center'>
          <p className={`text-gray-400 ${Magnetik_Light.className}`}>
            © 2025 Storytime. All rights reserved. | Test View Page
          </p>
        </div>
      </div>
    </div>
  )
}

export default TestView