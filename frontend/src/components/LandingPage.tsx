'use client'
import Image from 'next/image'
import {
  FaStar,
  FaArrowRight,
  FaShieldAlt,
  FaClock,
  FaUsers,
  FaCheckCircle,
  FaHandshake,
  FaVideo
} from 'react-icons/fa'

export const LandingPage = () => {
  return (
    <>
      <header className="relative overflow-hidden py-20 lg:py-32 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/30 to-purple-100/30 animate-gradient"></div>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 text-center lg:text-left">
              <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text animate-gradient">
                Find Your Perfect Tutor Today
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Connect with experienced tutors for one-on-one learning sessions. 
                Get personalized attention and achieve your academic goals with expert guidance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                  Find a Tutor
                </button>
                <button className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all duration-300">
                  Become a Tutor
                </button>
              </div>
              <div className="flex items-center justify-center lg:justify-start space-x-8 pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">5000+</div>
                  <div className="text-gray-600">Qualified Tutors</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">15K+</div>
                  <div className="text-gray-600">Happy Students</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">98%</div>
                  <div className="text-gray-600">Success Rate</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-3xl transform rotate-6"></div>
              <Image
                src="/hero-image.svg"
                alt="Online tutoring session"
                width={600}
                height={500}
                className="relative rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-500"
                priority
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-16">
        {/* Features Grid */}
        <section className="mb-32">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Why Choose Our Platform?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <FaHandshake className="text-5xl text-blue-500" />,
                title: "Perfect Match",
                description: "Find tutors that match your learning style, subject needs, and schedule"
              },
              {
                icon: <FaShieldAlt className="text-5xl text-purple-500" />,
                title: "Verified Tutors",
                description: "All tutors are thoroughly vetted for qualifications and teaching experience"
              },
              {
                icon: <FaVideo className="text-5xl text-green-500" />,
                title: "Online Sessions",
                description: "Connect with tutors virtually through our secure video platform"
              },
              {
                icon: <FaClock className="text-5xl text-red-500" />,
                title: "Flexible Timing",
                description: "Schedule sessions at your convenience, any day of the week"
              },
              {
                icon: <FaUsers className="text-5xl text-yellow-500" />,
                title: "1-on-1 Attention",
                description: "Get undivided attention and personalized learning support"
              },
              {
                icon: <FaCheckCircle className="text-5xl text-indigo-500" />,
                title: "Track Progress",
                description: "Monitor your improvement with detailed session feedback"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="flex flex-col items-center text-center space-y-4">
                  {feature.icon}
                  <h3 className="text-xl font-bold text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mb-32">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-4xl text-blue-600 mb-6 flex justify-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  1
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-4">Search Tutors</h3>
              <p className="text-gray-600 text-center">
                Browse profiles of qualified tutors in your subject area and read their reviews
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-4xl text-purple-600 mb-6 flex justify-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  2
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-4">Book a Session</h3>
              <p className="text-gray-600 text-center">
                Schedule a session at your preferred time and connect through our platform
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-4xl text-green-600 mb-6 flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  3
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-4">Start Learning</h3>
              <p className="text-gray-600 text-center">
                Enjoy personalized tutoring sessions and track your progress
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="mb-32">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Student Success Stories
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah K.",
                subject: "Math",
                tutor: "John D.",
                text: "My tutor helped me understand complex math concepts through clear explanations and practice problems. My grades improved significantly!"
              },
              {
                name: "James R.",
                subject: "Physics",
                tutor: "Maria S.",
                text: "The one-on-one sessions were exactly what I needed. My tutor's teaching style made difficult physics concepts easy to understand."
              },
              {
                name: "Emma L.",
                subject: "English",
                tutor: "David W.",
                text: "Regular sessions with my tutor helped me improve my essay writing and analytical skills. Now I feel confident in my abilities!"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>
                <p className="text-gray-600 italic mb-6">{testimonial.text}</p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{testimonial.name}</p>
                    <p className="text-gray-600">Student of {testimonial.tutor} - {testimonial.subject}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></div>
          <div className="relative p-12 md:p-20 text-center text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Start Learning?
            </h2>
            <p className="text-xl mb-12 max-w-2xl mx-auto">
              Find your perfect tutor today and take the first step towards academic success.
              Our tutors are ready to help you achieve your goals!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-105">
                Find a Tutor Now <FaArrowRight className="inline-block ml-2" />
              </button>
              <button className="px-8 py-4 border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all duration-300">
                View All Subjects
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Add custom styles */}
      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }
      `}</style>
    </>
  )
} 