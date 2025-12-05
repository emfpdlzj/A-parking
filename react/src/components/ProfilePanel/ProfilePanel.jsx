import React from 'react'
import basicProfile from '../../assets/icons/basic_profile.jpeg'
import profileIcon from '../../assets/icons/profile.png'
import ProfileImageUploader from './ProfileImageUploader.jsx'
import { BUILDINGS, getBuildingName } from '../../constants/buildings.js'

function ProfilePanel({
                          profile,
                          isEditing,
                          editProfile,
                          onStartEdit,
                          onChangeField,
                          onSave,
                          onCancel,
                          onChangeImage,
                          onClearImage,
                      }) {
    return (
        <div className="bg-white rounded-2xl shadow-md p-3 sm:p-4">
            {/* 상단 타이틀 */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <img
                        src={profileIcon}
                        alt="프로필 아이콘"
                        className="w-6 h-6 object-contain"
                    />
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-800">
                        내 정보
                    </h3>
                </div>

                {!isEditing && (
                    <button
                        type="button"
                        onClick={onStartEdit}
                        className="text-[10px] sm:text-[11px] px-2 py-1 rounded-md bg-[#f3f4f6] text-slate-600 hover:bg-[#e5e7eb] transition"
                    >
                        수정
                    </button>
                )}
            </div>

            {isEditing ? (
                // 편집 모드
                <div className="space-y-2 text-xs sm:text-sm text-slate-700">
                    {/* 프로필 사진 업로드 */}
                    <ProfileImageUploader
                        imageSrc={editProfile.profileImage}
                        name={editProfile.name}
                        onChangeImage={onChangeImage}
                        onClearImage={onClearImage}
                    />

                    {/* 이름 */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-4">
                        <span className="whitespace-nowrap text-xs sm:text-sm">
                            이름
                        </span>
                        <input
                            type="text"
                            value={editProfile.name}
                            onChange={(e) =>
                                onChangeField('name', e.target.value)
                            }
                            className="flex-1 border border-slate-300 rounded-md px-2 py-1 text-xs sm:text-sm"
                        />
                    </div>

                    {/* 학번 */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-4">
                        <span className="whitespace-nowrap text-xs sm:text-sm">
                            학번
                        </span>
                        <input
                            type="text"
                            value={editProfile.studentId}
                            onChange={(e) =>
                                onChangeField('studentId', e.target.value)
                            }
                            className="flex-1 border border-slate-300 rounded-md px-2 py-1 text-xs sm:text-sm"
                            placeholder="202012345"
                        />
                    </div>

                    {/* 즐겨찾는 건물 */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-4">
                        <span className="whitespace-nowrap text-xs sm:text-sm">
                            즐겨찾는 건물
                        </span>
                        <select
                            value={editProfile.favoriteBuilding}
                            onChange={(e) =>
                                onChangeField(
                                    'favoriteBuilding',
                                    e.target.value,
                                )
                            }
                            className="flex-1 border border-slate-300 rounded-md px-2 py-1 text-xs sm:text-sm bg-white"
                        >
                            {BUILDINGS.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 차량 번호 - DB 값이라 수정 불가 */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-4">
                        <span className="whitespace-nowrap text-xs sm:text-sm">
                            차량 번호
                        </span>
                        <input
                            type="text"
                            value={editProfile.carNumber}
                            readOnly
                            disabled
                            className="flex-1 border border-slate-200 bg-[#f9fafb] text-slate-500 rounded-md px-2 py-1 text-xs sm:text-sm"
                        />
                    </div>

                    {/* 버튼 */}
                    <div className="mt-3 flex gap-2 justify-end">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-3 py-1.5 text-[11px] sm:text-xs rounded-md border border-slate-300 text-slate-600 hover:bg-[#f9fafb] transition"
                        >
                            취소
                        </button>
                        <button
                            type="button"
                            onClick={onSave}
                            className="px-3 py-1.5 text-[11px] sm:text-xs rounded-md bg-[#174ea6] text-white hover:bg-[#1450c8] transition"
                        >
                            저장
                        </button>
                    </div>
                </div>
            ) : (
                // 보기 모드
                <div className="space-y-1 text-xs sm:text-sm text-slate-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full bg-[#e5e7eb] overflow-hidden flex items-center justify-center text-[11px] text-slate-500">
                            <img
                                src={profile.profileImage || basicProfile}
                                alt={profile.name || '기본 프로필'}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="text-xs sm:text-sm">
                            <div className="font-semibold text-slate-800">
                                {profile.name}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between gap-2">
                        <span>이름</span>
                        <span className="truncate">{profile.name}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                        <span>학번</span>
                        <span className="truncate">{profile.studentId}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                        <span>차량 번호</span>
                        <span className="truncate">{profile.carNumber}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                        <span>즐겨찾는 건물</span>
                        <span className="truncate">
                            {getBuildingName(profile.favoriteBuilding)}
                        </span>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProfilePanel