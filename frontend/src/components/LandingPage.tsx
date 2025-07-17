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
      <header className="relative overflow-hidden py-20 lg:py-32 px-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/40 to-purple-100/40 dark:from-indigo-950/50 dark:to-purple-950/50 animate-gradient"></div>
        
        {/* Floating elements for visual appeal */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/20 dark:bg-indigo-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-32 right-16 w-40 h-40 bg-purple-200/20 dark:bg-purple-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-indigo-200/30 dark:bg-indigo-400/10 rounded-full blur-lg animate-bounce"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-indigo-900/50 text-blue-700 dark:text-indigo-300 rounded-full text-sm font-medium mb-4 backdrop-blur-sm border border-blue-200 dark:border-indigo-700">
                🌟 Trusted by 15,000+ students worldwide
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-indigo-400 dark:via-blue-400 dark:to-purple-400 text-transparent bg-clip-text animate-gradient leading-tight">
                Find Your Perfect Tutor Today
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed font-light max-w-2xl">
                Connect with experienced tutors for one-on-one learning sessions. 
                Get personalized attention and achieve your academic goals with expert guidance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <button className="group px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-indigo-500 dark:via-blue-500 dark:to-purple-600 text-white rounded-2xl font-semibold text-lg transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl relative overflow-hidden">
                  <span className="relative z-10">Find a Tutor</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                <button className="px-8 py-4 border-2 border-blue-600 dark:border-indigo-400 text-blue-600 dark:text-indigo-300 rounded-2xl font-semibold text-lg hover:bg-blue-50 dark:hover:bg-indigo-950/30 transition-all duration-300 backdrop-blur-sm hover:border-purple-500 dark:hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-300">
                  Become a Tutor
                </button>
              </div>
              <div className="flex items-center justify-center lg:justify-start space-x-8 pt-8">
                <div className="text-center group">
                  <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-indigo-400 dark:to-blue-400 text-transparent bg-clip-text group-hover:scale-110 transition-transform duration-300">5000+</div>
                  <div className="text-gray-600 dark:text-gray-300 font-medium">Qualified Tutors</div>
                </div>
                <div className="w-px h-12 bg-gray-300 dark:bg-gray-600"></div>
                <div className="text-center group">
                  <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 text-transparent bg-clip-text group-hover:scale-110 transition-transform duration-300">15K+</div>
                  <div className="text-gray-600 dark:text-gray-300 font-medium">Happy Students</div>
                </div>
                <div className="w-px h-12 bg-gray-300 dark:bg-gray-600"></div>
                <div className="text-center group">
                  <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 text-transparent bg-clip-text group-hover:scale-110 transition-transform duration-300">98%</div>
                  <div className="text-gray-600 dark:text-gray-300 font-medium">Success Rate</div>
                </div>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-purple-400/30 dark:from-indigo-600/20 dark:to-purple-600/20 rounded-3xl transform rotate-6 group-hover:rotate-3 transition-transform duration-500"></div>
              <div className="absolute inset-0 bg-gradient-to-l from-indigo-400/20 to-cyan-400/20 dark:from-indigo-500/10 dark:to-cyan-500/10 rounded-3xl transform -rotate-3 group-hover:rotate-0 transition-transform duration-700"></div>
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

      <main className="max-w-7xl mx-auto px-4 py-16 bg-gradient-to-b from-transparent via-slate-50/50 to-transparent dark:via-gray-900/50">
        {/* Features Grid */}
        <section className="mb-32 relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-24 bg-gradient-to-b from-blue-500 to-transparent dark:from-indigo-400"></div>
          <h2 className="text-4xl lg:text-5xl font-bold text-center mb-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-indigo-400 dark:via-blue-400 dark:to-purple-400 text-transparent bg-clip-text">
            Why Choose Our Platform?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <FaHandshake className="text-5xl text-blue-500 dark:text-blue-400" />,
                title: "Perfect Match",
                description: "Find tutors that match your learning style, subject needs, and schedule",
                color: "blue"
              },
              {
                icon: <FaShieldAlt className="text-5xl text-purple-500 dark:text-purple-400" />,
                title: "Verified Tutors",
                description: "All tutors are thoroughly vetted for qualifications and teaching experience",
                color: "purple"
              },
              {
                icon: <FaVideo className="text-5xl text-green-500 dark:text-green-400" />,
                title: "Online Sessions",
                description: "Connect with tutors virtually through our secure video platform",
                color: "green"
              },
              {
                icon: <FaClock className="text-5xl text-red-500 dark:text-red-400" />,
                title: "Flexible Timing",
                description: "Schedule sessions at your convenience, any day of the week",
                color: "red"
              },
              {
                icon: <FaUsers className="text-5xl text-yellow-500 dark:text-yellow-400" />,
                title: "1-on-1 Attention",
                description: "Get undivided attention and personalized learning support",
                color: "yellow"
              },
              {
                icon: <FaCheckCircle className="text-5xl text-indigo-500 dark:text-indigo-400" />,
                title: "Track Progress",
                description: "Monitor your improvement with detailed session feedback",
                color: "indigo"
              }
            ].map((feature, index) => (
              <div key={index} className="group bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-indigo-600 relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br from-${feature.color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                <div className="flex flex-col items-center text-center space-y-6 relative z-10">
                  <div className="group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-indigo-400 transition-colors duration-300">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mb-32 relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-24 bg-gradient-to-b from-purple-500 to-transparent dark:from-purple-400"></div>
          <h2 className="text-4xl lg:text-5xl font-bold text-center mb-20 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 dark:from-purple-400 dark:via-indigo-400 dark:to-blue-400 text-transparent bg-clip-text">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection lines */}
            <div className="hidden md:block absolute top-1/2 left-1/3 w-1/3 h-0.5 bg-gradient-to-r from-blue-300 to-purple-300 dark:from-blue-600 dark:to-purple-600 transform -translate-y-1/2"></div>
            <div className="hidden md:block absolute top-1/2 right-1/3 w-1/3 h-0.5 bg-gradient-to-r from-purple-300 to-green-300 dark:from-purple-600 dark:to-green-600 transform -translate-y-1/2"></div>
            
            <div className="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600 relative z-10">
              <div className="text-4xl text-blue-600 dark:text-blue-400 mb-8 flex justify-center group-hover:scale-110 transition-transform duration-300">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300 font-bold text-2xl">
                  1
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">Search Tutors</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                Browse profiles of qualified tutors in your subject area and read their reviews
              </p>
            </div>
            <div className="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-200/50 dark:border-gray-700/50 hover:border-purple-300 dark:hover:border-purple-600 relative z-10">
              <div className="text-4xl text-purple-600 dark:text-purple-400 mb-8 flex justify-center group-hover:scale-110 transition-transform duration-300">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300 font-bold text-2xl">
                  2
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">Book a Session</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                Schedule a session at your preferred time and connect through our platform
              </p>
            </div>
            <div className="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-200/50 dark:border-gray-700/50 hover:border-green-300 dark:hover:border-green-600 relative z-10">
              <div className="text-4xl text-green-600 dark:text-green-400 mb-8 flex justify-center group-hover:scale-110 transition-transform duration-300">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300 font-bold text-2xl">
                  3
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">Start Learning</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                Enjoy personalized tutoring sessions and track your progress
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="mb-32 relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-24 bg-gradient-to-b from-green-500 to-transparent dark:from-green-400"></div>
          <h2 className="text-4xl lg:text-5xl font-bold text-center mb-20 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 dark:from-green-400 dark:via-blue-400 dark:to-purple-400 text-transparent bg-clip-text">
            Student Success Stories
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah K.",
                subject: "Math",
                tutor: "John D.",
                text: "My tutor helped me understand complex math concepts through clear explanations and practice problems. My grades improved significantly!",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                name: "James R.",
                subject: "Physics",
                tutor: "Maria S.",
                text: "The one-on-one sessions were exactly what I needed. My tutor's teaching style made difficult physics concepts easy to understand.",
                gradient: "from-purple-500 to-pink-500"
              },
              {
                name: "Emma L.",
                subject: "English",
                tutor: "David W.",
                text: "Regular sessions with my tutor helped me improve my essay writing and analytical skills. Now I feel confident in my abilities!",
                gradient: "from-green-500 to-emerald-500"
              }
            ].map((testimonial, index) => (
              <div key={index} className="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-200/50 dark:border-gray-700/50 hover:border-yellow-300 dark:hover:border-yellow-600 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-200/20 to-orange-200/20 dark:from-yellow-500/10 dark:to-orange-500/10 rounded-full blur-xl transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <div className="flex text-yellow-400 dark:text-yellow-300 mb-6 group-hover:text-yellow-500 transition-colors duration-300">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className="transform group-hover:scale-110 transition-transform duration-300" style={{transitionDelay: `${i * 100}ms`}} />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 italic mb-8 leading-relaxed text-lg">&ldquo;{testimonial.text}&rdquo;</p>
                  <div className="flex items-center space-x-4">
                    <div className={`w-14 h-14 bg-gradient-to-r ${testimonial.gradient} dark:from-indigo-500 dark:to-purple-700 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300 group-hover:scale-110`}>
                      {testimonial.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-100 text-lg">{testimonial.name}</p>
                      <p className="text-gray-600 dark:text-gray-300 font-medium">Student of {testimonial.tutor} - {testimonial.subject}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden rounded-3xl group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-indigo-500 dark:via-blue-500 dark:to-purple-700"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
          
          {/* Floating elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-16 right-20 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full blur-lg animate-bounce"></div>
          
          <div className="relative p-12 md:p-20 text-center text-white z-10">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 group-hover:scale-105 transition-transform duration-500">
              Ready to Start Learning?
            </h2>
            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed font-light opacity-90">
              Find your perfect tutor today and take the first step towards academic success.
              Our tutors are ready to help you achieve your goals!
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button className="group/btn px-10 py-5 bg-white text-blue-600 dark:bg-gray-900 dark:text-indigo-300 rounded-2xl font-bold text-xl hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl relative overflow-hidden">
                <span className="relative z-10 flex items-center justify-center">
                  Find a Tutor Now 
                  <FaArrowRight className="inline-block ml-3 group-hover/btn:translate-x-2 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover/btn:opacity-10 transition-opacity duration-300"></div>
              </button>
              <button className="px-10 py-5 border-2 border-white dark:border-indigo-400 text-white dark:text-indigo-300 rounded-2xl font-bold text-xl hover:bg-white/20 dark:hover:bg-indigo-900/50 transition-all duration-300 backdrop-blur-sm hover:border-yellow-300 dark:hover:border-yellow-400 hover:text-yellow-100 dark:hover:text-yellow-300">
                View All Subjects
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Enhanced custom styles */}
      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 400% 400%;
          animation: gradient 8s ease infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
          }
          50% { 
            box-shadow: 0 0 40px rgba(59, 130, 246, 0.8), 0 0 60px rgba(147, 51, 234, 0.4);
          }
        }
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        
        .glass-effect {
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .dark .glass-effect {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .text-shadow {
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .dark .text-shadow {
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </>
  )
}