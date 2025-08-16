'use client'
import { api } from '@/_lib/api'
import { showToast } from '@/utils/toastService'
import React, { useState } from 'react'
import {
  FaBookReader,
  FaEdit,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaTrashAlt,
  FaBrain,
  FaPlus
} from 'react-icons/fa'

type AboutData = {
  education: string[]
  email: string
  phone: string
  location: string
  skills?: string[]
  role?: string
}

const IconWrapper = ({ children, bgColor, textColor }: { children: React.ReactNode, bgColor: string, textColor: string }) => (
  <div className={`${bgColor} dark:bg-opacity-20 p-3 rounded-full transition-transform hover:scale-105`}>
    <span className={textColor}>{children}</span>
  </div>
)

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <p className='text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2'>{children}</p>
)

const InputField = ({ 
  value, 
  onChange, 
  placeholder, 
  icon: Icon, 
  iconColor 
}: { 
  value: string, 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, 
  placeholder: string,
  icon: React.ElementType,
  iconColor: string
}) => (
  <div className='mt-4'>
    <div className='font-semibold text-gray-800 dark:text-gray-200 mb-2 capitalize flex items-center'>
      <Icon className={`mr-2 ${iconColor} dark:${iconColor.replace('text-', 'text-').replace('-600', '-400')}`} />
      {placeholder}
    </div>
    <input
      type='text'
      className='input input-bordered w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700/50 rounded-lg transition-all duration-200'
      value={value}
      onChange={onChange}
      placeholder={`Enter your ${placeholder.toLowerCase()}`}
    />
  </div>
)

export default function AboutComponent({ userData, isUserProfile }: { userData: AboutData, isUserProfile: boolean }) {
  const [aboutData, setAboutData] = useState<AboutData>(userData)
  const [editData, setEditData] = useState({ 
    ...aboutData,
    skills: aboutData.skills || []
  })

  const isTeacher = aboutData.role === 'TEACHER'

  const handleSave = async () => {
    try {
      await api.post('/profile/update-profile', editData)
      setAboutData(editData)
      showToast('success', 'Profile updated successfully')
      const modal = document.getElementById('about_edit_modal') as HTMLDialogElement
      if (modal) modal.close()
    } catch (e) {
      showToast('error', 'Something went wrong')
      console.error(e)
    }
  }

  const handleAddItem = (field: 'education' | 'skills') => {
    setEditData({
      ...editData,
      [field]: [...(editData[field] || []), '']
    })
  }

  const handleRemoveItem = (field: 'education' | 'skills', index: number) => {
    const updatedItems = editData[field]!.filter((_, i) => i !== index)
    setEditData({ ...editData, [field]: updatedItems })
  }

  return (
    <div className='flex flex-col w-full md:w-5/6 lg:w-4/6 mx-auto h-full shadow-lg rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl bg-white dark:bg-gray-800'>
      <div className='container pb-8'>
        <div className='flex justify-between items-center px-6 py-4 bg-gradient-to-r from-blue-100 to-white dark:from-blue-900/30 dark:to-gray-900'>
          <h2 className='text-gray-800 dark:text-gray-200 text-2xl font-bold flex items-center'>
            About
          </h2>

          {isUserProfile && (
            <button
              className='text-blue-500 dark:text-blue-400 rounded-full p-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-200 hover:scale-105'
              onClick={() => {
                const modal = document.getElementById('about_edit_modal') as HTMLDialogElement
                if (modal) modal.showModal()
              }}
            >
              <div className='flex flex-col items-center text-gray-700 dark:text-gray-300'>
                <FaEdit className="text-xl" />
                <p className='text-xs mt-1'>Edit</p>
              </div>
            </button>
          )}
        </div>
        
        <hr className='border-gray-200 dark:border-gray-700' />
        
        <div className='px-8 py-6'>
          <div className='space-y-8'>
            <div className='flex items-start gap-4'>
              <IconWrapper bgColor="bg-blue-100" textColor="text-blue-600">
                <FaBookReader className='h-6 w-6' />
              </IconWrapper>
              <div className='flex-1'>
                <SectionTitle>Education</SectionTitle>
                {aboutData.education?.length > 0 ? (
                  aboutData.education.map((edu, index) => (
                    <p key={index} className='text-gray-700 dark:text-gray-300 mb-2 pl-2 border-l-2 border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors duration-200'>
                      {edu}
                    </p>
                  ))
                ) : (
                  <p className='text-gray-400 dark:text-gray-500 italic'>No education information provided</p>
                )}
              </div>
            </div>
            
            <div className='flex flex-col gap-6'>
              <div className='flex items-center gap-4'>
                <IconWrapper bgColor="bg-green-100" textColor="text-green-600">
                  <FaEnvelope className='h-5 w-5' />
                </IconWrapper>
                <div>
                  <SectionTitle>Email</SectionTitle>
                  <p className='text-gray-700 dark:text-gray-300'>{aboutData.email || 'Not provided'}</p>
                </div>
              </div>
              
              <div className='flex items-center gap-4'>
                <IconWrapper bgColor="bg-purple-100" textColor="text-purple-600">
                  <FaPhoneAlt className='h-5 w-5' />
                </IconWrapper>
                <div>
                  <SectionTitle>Phone</SectionTitle>
                  <p className='text-gray-700 dark:text-gray-300'>{aboutData.phone || 'Not provided'}</p>
                </div>
              </div>
              
              <div className='flex items-center gap-4'>
                <IconWrapper bgColor="bg-amber-100" textColor="text-amber-600">
                  <FaMapMarkerAlt className='h-5 w-5' />
                </IconWrapper>
                <div>
                  <SectionTitle>Location</SectionTitle>
                  <p className='text-gray-700 dark:text-gray-300'>{aboutData.location || 'Not provided'}</p>
                </div>
              </div>
            </div>
            
            {isTeacher && (
              <div className='flex items-start gap-4'>
                <IconWrapper bgColor="bg-indigo-100" textColor="text-indigo-600">
                  <FaBrain className='h-6 w-6' />
                </IconWrapper>
                <div className='flex-1'>
                  <SectionTitle>Skills</SectionTitle>
                  <div className='flex flex-wrap gap-2'>
                    {aboutData.skills && aboutData.skills.length > 0 ? (
                      aboutData.skills.map((skill, index) => (
                        <span 
                          key={index} 
                          className='bg-indigo-50 text-indigo-700 dark:bg-indigo-200 dark:text-indigo-900 px-3 py-1 rounded-full text-sm hover:bg-indigo-100 dark:hover:bg-indigo-300 transition-colors duration-200'
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className='text-gray-400 dark:text-gray-500 italic'>No skills listed</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <dialog id='about_edit_modal' className='modal'>
        <div className='modal-box relative p-6 max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700'>
          <form method='dialog'>
            <button className='btn btn-sm btn-circle absolute right-4 top-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 border-none transition-all duration-200'>
              ✕
            </button>
          </form>
          <h3 className='font-bold text-2xl text-center text-gray-900 dark:text-gray-100 mb-6'>
            Edit Profile
          </h3>
          <hr className='my-4 border-gray-200 dark:border-gray-700' />

          <div className='space-y-6'>
            <div className='flex flex-col'>
              <div className='font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center'>
                <FaBookReader className="mr-2 text-blue-600 dark:text-blue-400" />
                Education
              </div>
              {editData.education?.map((edu, index) => (
                <div
                  key={index}
                  className='flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-3 border border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm transition-all duration-200'
                >
                  <input
                    type='text'
                    className='input input-bordered flex-grow bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700/50 rounded-lg transition-all duration-200'
                    value={edu}
                    onChange={e => {
                      const updatedEdu = [...editData.education]
                      updatedEdu[index] = e.target.value
                      setEditData({ ...editData, education: updatedEdu })
                    }}
                    placeholder="Enter education detail"
                  />
                  <button
                    type="button"
                    className='btn btn-sm btn-ghost text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 rounded-lg'
                    onClick={() => handleRemoveItem('education', index)}
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className='btn btn-outline border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-400 dark:hover:border-blue-500 mt-2 transition-all duration-200 rounded-lg'
                onClick={() => handleAddItem('education')}
              >
                <FaPlus className="mr-2" /> Add Education
              </button>
            </div>

            {['email', 'phone', 'location'].map(field => (
              <InputField
                key={field}
                value={(editData[field as keyof AboutData] as string) || ''}
                onChange={e => setEditData({ ...editData, [field]: e.target.value })}
                placeholder={field}
                icon={field === 'email' ? FaEnvelope : field === 'phone' ? FaPhoneAlt : FaMapMarkerAlt}
                iconColor={field === 'email' ? 'text-green-600' : field === 'phone' ? 'text-purple-600' : 'text-amber-600'}
              />
            ))}

            {isTeacher && (
              <div className='flex flex-col'>
                <div className='font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center'>
                  <FaBrain className="mr-2 text-indigo-600 dark:text-indigo-400" />
                  Skills
                </div>
                {editData.skills?.map((skill, index) => (
                  <div
                    key={index}
                    className='flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-3 border border-gray-200 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-sm transition-all duration-200'
                  >
                    <input
                      type='text'
                      className='input input-bordered flex-grow bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-700/50 rounded-lg transition-all duration-200'
                      value={skill}
                      onChange={e => {
                        const updatedSkills = [...editData.skills!]
                        updatedSkills[index] = e.target.value
                        setEditData({ ...editData, skills: updatedSkills })
                      }}
                      placeholder="Enter skill"
                    />
                    <button
                      type="button"
                      className='btn btn-sm btn-ghost text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 rounded-lg'
                      onClick={() => handleRemoveItem('skills', index)}
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className='btn btn-outline border-indigo-300 dark:border-indigo-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-400 dark:hover:border-indigo-500 mt-2 transition-all duration-200 rounded-lg'
                  onClick={() => handleAddItem('skills')}
                >
                  <FaPlus className="mr-2" /> Add Skill
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className='btn btn-primary w-full mt-8 py-3 text-white font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-700 dark:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 border-none rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]'
            onClick={handleSave}
          >
            Save Changes
          </button>
        </div>
      </dialog>
    </div>
  )
}