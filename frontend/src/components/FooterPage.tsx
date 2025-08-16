'use client'
import { 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedin,
  FaArrowRight,
  FaGraduationCap,
  FaBook,
  FaUserGraduate,
  FaChalkboardTeacher
} from 'react-icons/fa'

export function FooterPage() {
  const socialLinks = [
    { icon: <FaFacebook size={20} />, href: '#', label: 'Facebook' },
    { icon: <FaTwitter size={20} />, href: '#', label: 'Twitter' },
    { icon: <FaInstagram size={20} />, href: '#', label: 'Instagram' },
    { icon: <FaLinkedin size={20} />, href: '#', label: 'LinkedIn' }
  ]

  const quickLinks = [
    { icon: <FaUserGraduate />, text: 'Find Your Perfect Tutor', href: '/find-tutor' },
    { icon: <FaChalkboardTeacher />, text: 'Join as a Tutor', href: '/become-tutor' },
    { icon: <FaBook />, text: 'Learning Resources', href: '/resources' },
    { icon: <FaGraduationCap />, text: 'Student Success Stories', href: '/success-stories' }
  ]

  return (
    <footer className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-950 text-gray-800 dark:text-gray-200 shadow-xl border-t border-gray-100 dark:border-gray-800 py-16 overflow-hidden backdrop-blur-xl">
      <div className="before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:bottom-0 before:bg-[url('/assets/dots-pattern.svg')] before:bg-repeat before:opacity-5 before:pointer-events-none relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {/* Brand Section */}
          <div className="space-y-6 relative">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg transform rotate-3 transition-transform duration-300 hover:rotate-6">
                <FaGraduationCap className="text-3xl text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 text-transparent bg-clip-text">
                MyTutor
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-xs">
              Empowering education through personalized connections. Discover how our platform matches passionate learners with expert tutors for transformative learning experiences.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="bg-white dark:bg-slate-800 p-2.5 rounded-full hover:bg-blue-50 dark:hover:bg-indigo-900 hover:text-blue-600 dark:hover:text-blue-400 text-gray-600 dark:text-gray-400 shadow-md hover:shadow-xl transform hover:scale-110 transition-all duration-300 ease-in-out"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-800 pb-2">Explore</h3>
            <ul className="space-y-4">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="group flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-all duration-300 ease-in-out"
                  >
                    <span className="mr-3 text-blue-600 dark:text-blue-400 group-hover:text-blue-500 dark:group-hover:text-blue-300 transition-colors duration-300 p-1.5 bg-blue-50 dark:bg-slate-800 rounded-md group-hover:bg-blue-100 dark:group-hover:bg-slate-700">
                      {link.icon}
                    </span>
                    {link.text}
                    <FaArrowRight className="ml-2 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-2 transition-all duration-300 text-xs" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-800 pb-2">Get in Touch</h3>
            <ul className="space-y-4">
              <li className="group flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-all duration-300 ease-in-out">
                <FaPhone className="mr-3 text-blue-600 dark:text-blue-400 group-hover:text-blue-500 dark:group-hover:text-blue-300 transition-colors duration-300 p-1.5 bg-blue-50 dark:bg-slate-800 rounded-md group-hover:bg-blue-100 dark:group-hover:bg-slate-700" />
                <span className="group-hover:translate-x-1 transition-transform duration-300">
                  (+88) 01999-123456
                </span>
              </li>
              <li className="group flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-all duration-300 ease-in-out">
                <FaEnvelope className="mr-3 text-blue-600 dark:text-blue-400 group-hover:text-blue-500 dark:group-hover:text-blue-300 transition-colors duration-300 p-1.5 bg-blue-50 dark:bg-slate-800 rounded-md group-hover:bg-blue-100 dark:group-hover:bg-slate-700" />
                <span className="group-hover:translate-x-1 transition-transform duration-300">
                  hello@mytutor.com
                </span>
              </li>
              <li className="group flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-all duration-300 ease-in-out">
                <FaMapMarkerAlt className="mr-3 text-blue-600 dark:text-blue-400 group-hover:text-blue-500 dark:group-hover:text-blue-300 transition-colors duration-300 p-1.5 bg-blue-50 dark:bg-slate-800 rounded-md group-hover:bg-blue-100 dark:group-hover:bg-slate-700" />
                <span className="group-hover:translate-x-1 transition-transform duration-300">
                  22, Narinda, Dhaka
                </span>
              </li>
            </ul>
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
              <a href="/contact" className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-md text-sm transition-all duration-300 font-medium">
                Contact Support
                <FaArrowRight className="ml-2 text-xs" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} MyTutor. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-6">
              <a href="/privacy" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors duration-300">
                Privacy Policy
              </a>
              <a href="/terms" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors duration-300">
                Terms of Service
              </a>
              <a href="/cookies" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors duration-300">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
