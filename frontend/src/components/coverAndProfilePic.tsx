'use client'

import Image from 'next/image'
import { useState, useEffect, useCallback } from 'react'
import { FaCamera, FaEdit } from 'react-icons/fa'
import { api } from '@/_lib/api'
import { showToast } from '@/utils/toastService'
import Cookies from 'js-cookie'
import { getProfileImageUrl } from '@/utils/getProfileImage'

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


  console.log('userData: ', userData)
  



  // Initialize when userData changes
  useEffect(() => {
    if (!userData) return;
    
    setLocalUserData(userData);
    setProfilePic(getProfileImageUrl(userData.profileImage));
    // Handle cover image separately - use default cover if no cover image
    setCoverPhoto(userData.coverImage ? getProfileImageUrl(userData.coverImage) : '/default-cover.svg');
    setEditedName(userData.name);
    setEditedBio(userData.bio || '');
  }, [userData]);


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
      if (!file) {
        showToast('error', 'Please select a valid image file');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToast('error', 'Please select an image file');
        return;
      }

      // Validate file size (2MB limit - reduced from 5MB)
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        showToast('error', 'Image size must be less than 2MB');
        return;
      }

      setIsLoading(true)
      let previewUrl: string | null = null
      
      try {
        // Create preview URL for immediate display
        previewUrl = URL.createObjectURL(file);
        
        // Set preview immediately
        if (type === 'profilePic') {
          setProfilePic(previewUrl);
        } else {
          setCoverPhoto(previewUrl);
        }

        // Send to server
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
          
          // Clean up preview URL before setting new one
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
          }
          
          // Update with actual server URL
          if (type === 'profilePic') {
            setProfilePic(getProfileImageUrl(user.profileImage));
          } else {
            setCoverPhoto(user.coverImage ? getProfileImageUrl(user.coverImage) : '/default-cover.svg');
          }
          
          showToast(
            'success',
            `${
              type === 'profilePic' ? 'Profile picture' : 'Cover photo'
            } updated successfully`
          )
          onProfileUpdate?.()
        } else {
          // Revert to previous image on failure
          if (type === 'profilePic') {
            setProfilePic(getProfileImageUrl(localUserData.profileImage));
          } else {
            setCoverPhoto(localUserData.coverImage ? getProfileImageUrl(localUserData.coverImage) : '/default-cover.svg');
          }
          showToast('error', `Failed to upload ${type}`)
        }
        
      } catch (err) {
        console.error(err)
        // Revert to previous image on error
        if (type === 'profilePic') {
          setProfilePic(getProfileImageUrl(localUserData.profileImage));
        } else {
          setCoverPhoto(localUserData.coverImage ? getProfileImageUrl(localUserData.coverImage) : '/default-cover.svg');
        }
        showToast('error', `An error occurred while uploading ${type}`)
      } finally {
        // Always clean up preview URL
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        setIsLoading(false)
      }
    },
    [onProfileUpdate, localUserData]
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
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-xl overflow-hidden transform hover:-translate-y-1 transition-all duration-300 border border-gray-200 dark:border-gray-700">
      {/* Cover Photo - Reduced Height */}
      <div className="relative h-40 sm:h-48 md:h-52 overflow-hidden group">
        <Image
          src={coverPhoto || '/default-cover.svg'}
          alt={`${localUserData.name}'s cover photo`}
          width={1200}
          height={280}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          priority={false}
          onError={() => setCoverPhoto('/default-cover.svg')}
        />
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 dark:to-black/40" />
        
        {isUserProfile && (
          <div className="absolute top-3 right-3 z-10">
            <label
              htmlFor="coverPhotoInput"
              className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm text-blue-600 dark:text-blue-400 px-3 py-2 rounded-lg shadow-lg hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all duration-200 flex items-center gap-2 transform hover:scale-105 cursor-pointer text-sm font-medium"
            >
              <FaCamera className="h-3 w-3" />
              Cover
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

      {/* Profile Picture - Reduced Size */}
      <div className="relative flex justify-center -mt-16 sm:-mt-18">
        <div className="relative group">
          <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-xl bg-white dark:bg-gray-800 transform transition-transform duration-300 group-hover:scale-105">
            <Image
              src={profilePic || '/default-avatar.svg'}
              alt={`${localUserData.name}'s profile picture`}
              width={128}
              height={128}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              priority={true}
              onError={() => setProfilePic('/default-avatar.svg')}
            />
          </div>
          {isUserProfile && (
            <>
              <label
                htmlFor="profilePicInput"
                className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-110 flex items-center justify-center cursor-pointer border-2 border-gray-200 dark:border-gray-600"
              >
                <FaCamera className="text-blue-600 dark:text-blue-400 h-3 w-3" />
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

      {/* User Info - Improved Spacing */}
      <div className="p-4 pt-6 text-center">
        {isEditing ? (
          <div className="space-y-4 max-w-lg mx-auto">
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              disabled={isLoading}
              maxLength={50}
              className="w-full px-4 py-3 text-xl font-bold border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200"
              placeholder="Enter your name"
            />
            <textarea
              value={editedBio}
              onChange={(e) => setEditedBio(e.target.value)}
              disabled={isLoading}
              maxLength={500}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200"
              placeholder="Write something about yourself..."
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
              {editedBio.length}/500
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={handleSaveProfile}
                disabled={isLoading}
                className={`px-5 py-2 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105 ${
                  isLoading
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 shadow-md hover:shadow-lg'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={isLoading}
                className="px-5 py-2 rounded-lg font-medium text-sm border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all duration-200 transform hover:scale-105"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 leading-tight">
              {localUserData.name}
            </h2>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 mb-3">
              {localUserData.role === 'TEACHER' ? '👨‍🏫 Teacher' : '👨‍🎓 Student'}
            </div>
            {(localUserData.bio || isUserProfile) && (
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed px-2 sm:px-4 mb-4">
                {localUserData.bio ||
                  (isUserProfile
                    ? '✨ Add a bio to tell people more about yourself...'
                    : 'No bio available')}
              </p>
            )}
            {isUserProfile && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-all duration-200 transform hover:scale-105 font-medium text-sm bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40"
              >
                <FaEdit className="h-3 w-3" />
                Edit Profile
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
