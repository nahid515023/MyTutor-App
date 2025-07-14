'use client'
import { api } from '@/_lib/api'
import { showToast } from '@/utils/toastService'
import { useState } from 'react'
import { classLevels, subjectOptions } from '@/lib/subjectAndClass'

const CreatePost = () => {
  // State hooks for controlled inputs
  const [formData, setFormData] = useState({
    medium: '',
    selectedClass: '',
    subject: '',
    customSubject: '', // New field for custom subject when "Other" is selected
    fees: '',
    description: '',
    preferableStartTime: '',
    preferableEndTime: '',
    duration: '', // New field for session duration
    preferableDate: '' // New field for location
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handle all input changes in one function
  interface FormData {
    medium: string
    selectedClass: string
    subject: string
    customSubject: string
    fees: string
    description: string
    preferableStartTime: string
    preferableEndTime: string
    duration: string
    preferableDate: string
  }

  interface ChangeEvent {
    target: {
      name: string
      value: string
    }
  }

  const handleChange = (e: ChangeEvent) => {
    const { name, value } = e.target
    setFormData((prev: FormData) => ({
      ...prev,
      [name]: value
    }))
  }

  // Calculate end time based on start time and duration
  const calculateEndTime = (startTime: string, duration: string) => {
    if (!startTime || !duration) return ''

    const [hours, minutes] = startTime.split(':').map(Number)
    const durationMinutes = parseInt(duration)

    // Calculate total minutes
    const totalMinutes = hours * 60 + minutes + durationMinutes

    // Convert back to hours and minutes
    const newHours = Math.floor(totalMinutes / 60) % 24
    const newMinutes = totalMinutes % 60

    // Format as HH:MM
    return `${newHours.toString().padStart(2, '0')}:${newMinutes
      .toString()
      .padStart(2, '0')}`
  }

  // Update end time when start time or duration changes
  const handleTimeOrDurationChange = (e: ChangeEvent) => {
    const { name, value } = e.target

    setFormData((prev: FormData) => {
      const updatedData = { ...prev, [name]: value }

      // If either start time or duration changed, recalculate end time
      if (
        (name === 'preferableStartTime' || name === 'duration') &&
        updatedData.preferableStartTime &&
        updatedData.duration
      ) {
        updatedData.preferableEndTime = calculateEndTime(
          updatedData.preferableStartTime,
          updatedData.duration
        )
      }

      return updatedData
    })
  }

  const handleSubmit = async () => {
    // Form validation check
    const {
      medium,
      selectedClass,
      subject,
      customSubject,
      fees,
      description,
      preferableStartTime,
      preferableEndTime,
      duration,
      preferableDate
    } = formData

    // Determine the final subject value
    const finalSubject = subject === 'Other' ? customSubject : subject

    if (
      !medium ||
      !selectedClass ||
      !finalSubject ||
      !fees ||
      !description ||
      !preferableStartTime ||
      !preferableEndTime ||
      !duration ||
      !preferableDate
    ) {
      showToast('error', 'Please fill out all fields before submitting!')
      return
    }

    setIsSubmitting(true)

    try {
      await api.post('/posts', {
        medium,
        selectedClass,
        subject: finalSubject,
        fees,
        description,
        preferableTime: `${preferableStartTime} - ${preferableEndTime}`,
        duration,
        preferableDate
      })
      // Reset the form
      setFormData({
        medium: '',
        selectedClass: '',
        subject: '',
        customSubject: '',
        fees: '',
        description: '',
        preferableStartTime: '',
        preferableEndTime: '',
        duration: '',
        preferableDate: ''
      })
      showToast('success', 'Post Created Successfully!')
    } catch (err) {
      showToast('error', 'Failed to create post. Please try again!')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }



  return (
    <div className='min-h-screen'>

      <div className='relative py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-4xl mx-auto'>

          {/* Main Form Card */}
          <div className='bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 dark:border-gray-700/30 overflow-hidden'>
            {/* Progress Bar */}
            <div className='h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500'></div>
            
            <div className='p-8 md:p-12'>
              <div className='space-y-10'>
                {/* Medium Selection */}
                <div className='space-y-6'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg'>
                      <span className='text-white font-bold text-sm'>1</span>
                    </div>
                    <h2 className='text-2xl font-bold text-gray-800 dark:text-gray-100'>
                      Educational Medium
                    </h2>
                    <span className='text-red-500 text-xl'>*</span>
                  </div>
                  
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    {['Bangla version', 'English version', 'English medium'].map(
                      option => (
                        <label
                          key={option}
                          className='relative cursor-pointer group'
                        >
                          <input
                            type='radio'
                            name='medium'
                            value={option}
                            onChange={handleChange}
                            checked={formData.medium === option}
                            className='sr-only'
                          />
                          <div
                            className={`relative p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 hover:shadow-xl ${
                              formData.medium === option
                                ? 'bg-gradient-to-br from-blue-500 to-purple-600 border-transparent text-white shadow-2xl shadow-blue-500/30'
                                : 'bg-white/70 dark:bg-gray-700/70 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-white dark:hover:bg-gray-700'
                            }`}
                          >
                            <div className='flex items-center justify-center text-center'>
                              <span className='font-semibold text-lg'>
                                {option}
                              </span>
                            </div>
                            {formData.medium === option && (
                              <div className='absolute -top-3 -right-3 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center shadow-lg animate-pulse'>
                                <svg
                                  className='w-5 h-5 text-white'
                                  fill='none'
                                  stroke='currentColor'
                                  viewBox='0 0 24 24'
                                >
                                  <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth='3'
                                    d='M5 13l4 4L19 7'
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                        </label>
                      )
                    )}
                  </div>
                </div>

              {/* Class and Subject Row */}
              <div className='space-y-6'>
                <div className='flex items-center space-x-3'>
                  <div className='w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg'>
                    <span className='text-white font-bold text-sm'>2</span>
                  </div>
                  <h2 className='text-2xl font-bold text-gray-800 dark:text-gray-100'>
                    Academic Details
                  </h2>
                  <span className='text-red-500 text-xl'>*</span>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                  {/* Class Selection */}
                  <div className='space-y-4'>
                    <label className='text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center'>
                      <svg className='w-5 h-5 mr-2 text-green-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6'/>
                      </svg>
                      Class Level
                    </label>
                    <div className='relative group'>
                      <select
                        id='selectedClass'
                        name='selectedClass'
                        className='w-full bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 rounded-2xl p-5 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all text-gray-800 dark:text-gray-200 appearance-none cursor-pointer hover:bg-white dark:hover:bg-gray-700 text-lg shadow-lg group-hover:shadow-xl'
                        value={formData.selectedClass}
                        onChange={handleChange}
                        required
                      >
                        <option disabled value=''>
                          Choose your class level
                        </option>
                        {classLevels.map((classLevel) => (
                          <option key={classLevel} value={classLevel}>
                            {classLevel}
                          </option>
                        ))}
                      </select>
                      <div className='absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none'>
                        <svg
                          className='w-6 h-6 text-gray-400 group-hover:text-green-500 transition-colors'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            d='M19 9l-7 7-7-7'
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Subject Selection */}
                  <div className='space-y-4'>
                    <label className='text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center'>
                      <svg className='w-5 h-5 mr-2 text-purple-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'/>
                      </svg>
                      Subject
                    </label>
                    <div className='space-y-4'>
                      <div className='relative group'>
                        <select
                          id='subject'
                          name='subject'
                          className='w-full bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 rounded-2xl p-5 focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-gray-800 dark:text-gray-200 appearance-none cursor-pointer hover:bg-white dark:hover:bg-gray-700 text-lg shadow-lg group-hover:shadow-xl'
                          value={formData.subject}
                          onChange={handleChange}
                          required
                        >
                          <option disabled value=''>
                            Select your subject
                          </option>
                          {[...subjectOptions, 'Other'].map(subject => (
                            <option key={subject} value={subject}>
                              {subject}
                            </option>
                          ))}
                        </select>
                        <div className='absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none'>
                          <svg
                            className='w-6 h-6 text-gray-400 group-hover:text-purple-500 transition-colors'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth='2'
                              d='M19 9l-7 7-7-7'
                            />
                          </svg>
                        </div>
                      </div>
                      {formData.subject === 'Other' && (
                        <div className='animate-fadeIn'>
                          <input
                            type='text'
                            name='customSubject'
                            className='w-full bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 rounded-2xl p-5 focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 text-lg shadow-lg'
                            placeholder='Enter your custom subject'
                            value={formData.customSubject}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fees and Date Row */}
              <div className='space-y-6'>
                <div className='flex items-center space-x-3'>
                  <div className='w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg'>
                    <span className='text-white font-bold text-sm'>3</span>
                  </div>
                  <h2 className='text-2xl font-bold text-gray-800 dark:text-gray-100'>
                    Pricing & Schedule
                  </h2>
                  <span className='text-red-500 text-xl'>*</span>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                  {/* Fees Input */}
                  <div className='space-y-4'>
                    <label className='text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center'>
                      <svg className='w-5 h-5 mr-2 text-yellow-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'/>
                      </svg>
                      Fees per Session
                    </label>
                    <div className='relative group'>
                      <div className='absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none z-10'>
                        <span className='text-gray-600 dark:text-gray-400 text-2xl font-bold'>
                          ৳
                        </span>
                      </div>
                      <input
                        type='number'
                        id='fees'
                        name='fees'
                        className='w-full bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 rounded-2xl py-5 pl-16 pr-16 focus:outline-none focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 text-lg shadow-lg group-hover:shadow-xl'
                        placeholder='Enter amount'
                        value={formData.fees}
                        onChange={handleChange}
                        required
                      />
                      <div className='absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none'>
                        <span className='text-sm text-gray-400 font-medium bg-gray-100 dark:bg-gray-600 px-3 py-1 rounded-lg'>BDT</span>
                      </div>
                    </div>
                  </div>

                  {/* Preferable Date Input */}
                  <div className='space-y-4'>
                    <label className='text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center'>
                      <svg className='w-5 h-5 mr-2 text-pink-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'/>
                      </svg>
                      Preferred Date
                    </label>
                    <div className='relative group'>
                      <input
                        type='date'
                        id='preferableDate'
                        name='preferableDate'
                        className='w-full bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 rounded-2xl p-5 focus:outline-none focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 text-lg shadow-lg group-hover:shadow-xl'
                        value={formData.preferableDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Time Section */}
              <div className='space-y-6'>
                <div className='flex items-center space-x-3'>
                  <div className='w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg'>
                    <span className='text-white font-bold text-sm'>4</span>
                  </div>
                  <h2 className='text-2xl font-bold text-gray-800 dark:text-gray-100'>
                    Session Timing
                  </h2>
                  <span className='text-red-500 text-xl'>*</span>
                </div>

                <div className='bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800/50 dark:to-gray-700/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-600'>
                  <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                    <div className='space-y-3'>
                      <label className='text-base font-semibold text-gray-700 dark:text-gray-300 flex items-center'>
                        <svg className='w-4 h-4 mr-2 text-indigo-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'/>
                        </svg>
                        Start Time
                      </label>
                      <div className='relative'>
                        <input
                          type='time'
                          id='preferableStartTime'
                          name='preferableStartTime'
                          className='w-full bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-4 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-800 dark:text-gray-200 text-lg shadow-md hover:shadow-lg'
                          value={formData.preferableStartTime}
                          onChange={handleTimeOrDurationChange}
                          required
                        />
                      </div>
                    </div>

                    <div className='space-y-3'>
                      <label className='text-base font-semibold text-gray-700 dark:text-gray-300 flex items-center'>
                        <svg className='w-4 h-4 mr-2 text-purple-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'/>
                        </svg>
                        Duration
                      </label>
                      <div className='relative'>
                        <select
                          id='duration'
                          name='duration'
                          className='w-full bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-4 focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-gray-800 dark:text-gray-200 appearance-none cursor-pointer text-lg shadow-md hover:shadow-lg'
                          value={formData.duration}
                          onChange={handleTimeOrDurationChange}
                          required
                        >
                          <option value='' disabled>
                            Select duration
                          </option>
                          {[30, 45, 60, 90, 120, 150].map(minutes => (
                            <option key={minutes} value={minutes}>
                              {minutes} minutes
                            </option>
                          ))}
                        </select>
                        <div className='absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none'>
                          <svg
                            className='w-5 h-5 text-gray-400'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth='2'
                              d='M19 9l-7 7-7-7'
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className='space-y-3'>
                      <label className='text-base font-semibold text-gray-700 dark:text-gray-300 flex items-center'>
                        <svg className='w-4 h-4 mr-2 text-green-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'/>
                        </svg>
                        End Time
                      </label>
                      <div className='relative'>
                        <input
                          type='time'
                          id='preferableEndTime'
                          name='preferableEndTime'
                          className='w-full bg-gray-100 dark:bg-gray-600 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-4 text-gray-500 dark:text-gray-400 cursor-not-allowed text-lg shadow-md'
                          value={formData.preferableEndTime}
                          readOnly
                          required
                        />
                        <div className='absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none'>
                          <svg
                            className='w-5 h-5 text-gray-400'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth='2'
                              d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className='mt-6 p-4 bg-blue-100/80 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-700'>
                    <p className='text-sm text-blue-700 dark:text-blue-300 flex items-center'>
                      <svg
                        className='w-5 h-5 mr-3 flex-shrink-0'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='2'
                          d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                        />
                      </svg>
                      End time is automatically calculated based on your start time and session duration
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className='space-y-6'>
                <div className='flex items-center space-x-3'>
                  <div className='w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg'>
                    <span className='text-white font-bold text-sm'>5</span>
                  </div>
                  <h2 className='text-2xl font-bold text-gray-800 dark:text-gray-100'>
                    Additional Details
                  </h2>
                  <span className='text-red-500 text-xl'>*</span>
                </div>

                <div className='space-y-4'>
                  <label className='text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center'>
                    <svg className='w-5 h-5 mr-2 text-red-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'/>
                    </svg>
                    Description & Requirements
                  </label>
                  <div className='relative'>
                    <textarea
                      id='description'
                      name='description'
                      className='w-full bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 rounded-2xl p-6 focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all h-40 text-gray-800 dark:text-gray-200 resize-none hover:bg-white dark:hover:bg-gray-700 text-lg shadow-lg leading-relaxed'
                      placeholder='Describe your tutoring requirements in detail... 

• What specific topics do you need help with?
• What is your current skill level?
• Do you prefer any particular teaching style?
• Any special requirements or preferences?'
                      value={formData.description}
                      onChange={handleChange}
                      maxLength={500}
                      required
                    />
                    <div className='absolute bottom-4 right-4'>
                      <span className={`text-sm px-3 py-1 rounded-full ${
                        formData.description.length > 400 
                          ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-400'
                      }`}>
                        {formData.description.length}/500
                      </span>
                    </div>
                  </div>
                  
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='p-4 bg-green-100/80 dark:bg-green-900/30 rounded-xl border border-green-200 dark:border-green-700'>
                      <div className='flex items-start space-x-3'>
                        <div className='flex-shrink-0'>
                          <svg className='w-5 h-5 text-green-600 dark:text-green-400 mt-0.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'/>
                          </svg>
                        </div>
                        <div>
                          <p className='text-sm font-medium text-green-700 dark:text-green-300 mb-1'>💡 Pro Tip</p>
                          <p className='text-sm text-green-700 dark:text-green-300'>Be specific about your learning goals to attract the perfect tutor for your needs.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className='p-4 bg-blue-100/80 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-700'>
                      <div className='flex items-start space-x-3'>
                        <div className='flex-shrink-0'>
                          <svg className='w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'/>
                          </svg>
                        </div>
                        <div>
                          <p className='text-sm font-medium text-blue-700 dark:text-blue-300 mb-1'>ℹ️ Remember</p>
                          <p className='text-sm text-blue-700 dark:text-blue-300'>Include any materials or resources you already have access to.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className='pt-8'>
                <button
                  className={`w-full relative overflow-hidden py-6 px-8 rounded-2xl font-bold text-white text-xl transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-blue-300/50 shadow-2xl
                    ${
                      isSubmitting
                        ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed scale-95'
                        : 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 hover:scale-105 hover:shadow-3xl active:scale-100 shadow-blue-500/30'
                    }`}
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className='flex items-center justify-center'>
                      <svg
                        className='animate-spin -ml-1 mr-4 h-7 w-7 text-white'
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                      >
                        <circle
                          className='opacity-25'
                          cx='12'
                          cy='12'
                          r='10'
                          stroke='currentColor'
                          strokeWidth='4'
                        />
                        <path
                          className='opacity-75'
                          fill='currentColor'
                          d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
                        />
                      </svg>
                      Creating Your Post...
                    </span>
                  ) : (
                    <span className='flex items-center justify-center'>
                      <svg
                        className='w-6 h-6 mr-3'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='2'
                          d='M12 4v16m8-8H4'
                        />
                      </svg>
                      Create Your Tuition Post
                    </span>
                  )}

                  {/* Animated background effect */}
                  <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000'></div>
                </button>
              </div>
            </div>
          </div>
        </div>

          {/* Footer Note */}
          <div className='text-center mt-8'>
            <div className='inline-flex items-center justify-center space-x-2 px-6 py-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl border border-gray-200/60 dark:border-gray-600/60'>
              <svg className='w-4 h-4 text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'/>
              </svg>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                By creating a post, you agree to our 
                <span className='text-blue-600 dark:text-blue-400 font-medium'> terms of service</span> and 
                <span className='text-blue-600 dark:text-blue-400 font-medium'> privacy policy</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreatePost
