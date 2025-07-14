'use client'

import Image from 'next/image'
import { useState, useEffect, useCallback } from 'react'
import { FaCamera, FaEdit } from 'react-icons/fa'
import { api } from '@/_lib/api'
import { showToast } from '@/utils/toastService'
import Cookies from 'js-cookie'

interface UserData {
  id: string
  name: string
  email: string
  role: string
  profileImage: string
  coverImage: string
  bio: string
  createdAt: string
  updatedAt: string
  gender: string
  phone: string
  location: string
  grade: string
  education: string[]
}

interface ProfileProps {
  userData: UserData
  isUserProfile: boolean
  onProfileUpdate?: () => void
}

interface ApiResponse {
  message: string;
  user: UserData;
}

export default function ProfileCard({
  userData,
  isUserProfile,
  onProfileUpdate,
}: ProfileProps) {
  const [profilePic, setProfilePic] = useState<string>('')
  const [coverPhoto, setCoverPhoto] = useState<string>('')
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editedName, setEditedName] = useState(userData.name)
  const [editedBio, setEditedBio] = useState(userData.bio || '')
  const [localUserData, setLocalUserData] = useState(userData)

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL_IMAGE

  console.log('userData: ', userData)
  

  // Create formatted image URL
  const getImageUrl = useCallback((imagePath: string | null, defaultImage: string) => {
    if (!apiBaseUrl) return '';
    
    // If image path is provided and starts with http, use it directly
    if (imagePath && imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Otherwise construct URL from API base and image path or default
    const path = imagePath || defaultImage;
    return `${apiBaseUrl}${path}`;
  }, [apiBaseUrl]);


  // Initialize when userData changes
  useEffect(() => {
    if (!userData) return;
    
    setLocalUserData(userData);
    setProfilePic(getImageUrl(userData.profileImage, 'avatar.jpg'));
    setCoverPhoto(getImageUrl(userData.coverImage, 'coverPhoto.jpg'));
    setEditedName(userData.name);
    setEditedBio(userData.bio || '');
  }, [userData, getImageUrl]);


  // Handle file selection and immediately upload
  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'profilePic' | 'coverPhoto'
  ) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    handleImageUpload(files[0], type)
  }

  // Upload preview + API call
  const handleImageUpload = useCallback(
    async (file: File, type: 'profilePic' | 'coverPhoto') => {
      setIsLoading(true)
      try {
        // preview locally
        const reader = new FileReader()
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            if (type === 'profilePic') {
              setProfilePic(reader.result);
            } else {
              setCoverPhoto(reader.result);
            }
          }
        }
        reader.readAsDataURL(file)

        // send to server
        const formData = new FormData()
        formData.append(type, file)

        const endpoint =
          type === 'profilePic'
            ? '/profile/update-image'
            : '/profile/update-cover'

        const response = await api.post<ApiResponse>(endpoint, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        if (response.status === 200) {
          // Update the cookie with the new user data
          const { user } = response.data
          Cookies.set('user', JSON.stringify(user))
          setLocalUserData(user)
          
          showToast(
            'success',
            `${
              type === 'profilePic' ? 'Profile picture' : 'Cover photo'
            } updated successfully`
          )
          onProfileUpdate?.()
        } else {
          showToast('error', `Failed to upload ${type}`)
        }
      } catch (err) {
        console.error(err)
        showToast('error', `An error occurred while uploading ${type}`)
      } finally {
        setIsLoading(false)
      }
    },
    [onProfileUpdate]
  )

  const handleSaveProfile = async () => {
    if (editedName.trim() === '' || editedName.trim().length < 3) {
      showToast('error', 'Name must be at least 3 characters long')
      return
    }

    setIsLoading(true)
    try {
      const res = await api.post<ApiResponse>('/profile/update-profile', {
        name: editedName.trim(),
        bio: editedBio.trim(),
      })

      if (res.status === 200) {
        // Update the cookie with the new user data
        const { user } = res.data
        Cookies.set('user', JSON.stringify(user))
        
        // Update local state immediately
        setLocalUserData(user)
        
        showToast('success', 'Profile updated successfully')
        setIsEditing(false)
        onProfileUpdate?.()
      } else {
        showToast('error', 'Failed to update profile information')
      }
    } catch (err) {
      console.error(err)
      showToast('error', 'An error occurred while updating profile information')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditedName(localUserData.name)
    setEditedBio(localUserData.bio || '')
    setIsEditing(false)
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md hover:shadow-xl overflow-hidden transform hover:-translate-y-1 transition-all">
      {/* Cover Photo */}
      <div className="relative h-64 sm:h-72 md:h-80 overflow-hidden group">
        <Image
          src={coverPhoto}
          alt={`${localUserData.name}'s cover photo`}
          width={1200}
          height={400}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          priority
        />
        {isUserProfile && (
          <div className="absolute top-4 right-4 z-10">
            <label
              htmlFor="coverPhotoInput"
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-blue-600 dark:text-blue-400 px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600 hover:text-white dark:hover:bg-blue-700 transition-all flex items-center gap-2 transform hover:scale-105"
            >
              <FaCamera className="h-4 w-4" />
              Change Cover
            </label>
            <input
              id="coverPhotoInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e, 'coverPhoto')}
              disabled={isLoading}
            />
          </div>
        )}
      </div>

      {/* Profile Picture */}
      <div className="relative flex justify-center -mt-24 sm:-mt-28">
        <div className="relative group">
          <div className="h-40 w-40 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl bg-white dark:bg-gray-700 transform transition-transform duration-500 group-hover:scale-105">
            <Image
              src={profilePic}
              alt={`${localUserData.name}'s profile picture`}
              width={160}
              height={160}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              priority
            />
          </div>
          {isUserProfile && (
            <>
              <label
                htmlFor="profilePicInput"
                className="absolute bottom-1 right-1 bg-white dark:bg-gray-700 p-3 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-transform transform hover:scale-110 flex items-center justify-center"
              >
                <FaCamera className="text-blue-600 dark:text-blue-400 h-5 w-5" />
              </label>
              <input
                id="profilePicInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e, 'profilePic')}
                disabled={isLoading}
              />
            </>
          )}
        </div>
      </div>

      {/* User Info */}
      <div className="p-6 text-center">
        {isEditing ? (
          <div className="space-y-4 max-w-lg mx-auto">
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              disabled={isLoading}
              maxLength={50}
              className="w-full px-4 py-3 text-2xl font-bold border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            />
            <textarea
              value={editedBio}
              onChange={(e) => setEditedBio(e.target.value)}
              disabled={isLoading}
              maxLength={500}
              rows={4}
              className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 resize-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              placeholder="Write something about yourself..."
            />
            <div className="text-xs text-gray-400 dark:text-gray-400 text-right">
              {editedBio.length}/500
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleSaveProfile}
                disabled={isLoading}
                className={`px-6 py-2 rounded-lg font-medium transition-transform transform hover:scale-105 ${
                  isLoading
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
                }`}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={isLoading}
                className="px-6 py-2 rounded-lg font-medium border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3">
              {localUserData.name}
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed px-4 sm:px-8 lg:px-16">
              {localUserData.bio ||
                (isUserProfile
                  ? 'Add a bio to tell people more about yourself...'
                  : '')}
            </p>
            {isUserProfile && (
              <button
                onClick={() => setIsEditing(true)}
                className="mt-6 inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-transform transform hover:scale-105 font-medium"
              >
                <FaEdit className="h-4 w-4" />
                Edit Profile
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
