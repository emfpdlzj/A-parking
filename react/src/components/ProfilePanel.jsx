import React from 'react'

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
        <div className="bg-white rounded-2xl shadow-md p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-800">
                    내 정보
                </h3>
                {!isEditing && (
                    <button
                        type="button"
                        onClick={onStartEdit}
                        className="text-[11px] px-2 py-1 rounded-md bg-[#f3f4f6] text-slate-600 hover:bg-[#e5e7eb] transition"
                    >
                        수정
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="space-y-2 text-sm text-slate-700">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 rounded-full bg-[#e5e7eb] overflow-hidden flex items-center justify-center text-[11px] text-slate-500">
                            {editProfile.profileImage ? (
                                <img
                                    src={editProfile.profileImage}
                                    alt={editProfile.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span>사진</span>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="text-[11px] text-slate-500">
                                프로필 사진
                            </span>
                            <div className="flex items-center gap-2">
                                <label className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-[#f3f4f6] text-xs text-slate-700 cursor-pointer hover:bg-[#e5e7eb]">
                                    이미지 선택
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                            onChangeImage(
                                                e.target.files?.[0],
                                            )
                                        }
                                        className="hidden"
                                    />
                                </label>

                                {editProfile.profileImage && (
                                    <button
                                        type="button"
                                        onClick={onClearImage}
                                        className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-[#f3f4f6] text-xs text-slate-700 cursor-pointer hover:bg-[#e5e7eb]"
                                    >
                                        사진 삭제
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center gap-4">
                        <span className="whitespace-nowrap">이름</span>
                        <input
                            type="text"
                            value={editProfile.name}
                            onChange={(e) =>
                                onChangeField('name', e.target.value)
                            }
                            className="flex-1 border border-slate-300 rounded-md px-2 py-1 text-sm"
                        />
                    </div>
                    <div className="flex justify-between items-center gap-4">
                        <span className="whitespace-nowrap">학번</span>
                        <input
                            type="text"
                            value={editProfile.studentId}
                            onChange={(e) =>
                                onChangeField('studentId', e.target.value)
                            }
                            className="flex-1 border border-slate-300 rounded-md px-2 py-1 text-sm"
                        />
                    </div>
                    <div className="flex justify-between items-center gap-4">
                        <span className="whitespace-nowrap">
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
                            className="flex-1 border border-slate-300 rounded-md px-2 py-1 text-sm bg-white"
                        >
                            {[
                                { id: 'paldal', name: '팔달관' },
                                { id: 'library', name: '도서관' },
                                { id: 'yulgok', name: '율곡관' },
                                { id: 'yeonam', name: '연암관' },
                            ].map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                        <span className="whitespace-nowrap">차량 번호</span>
                        <input
                            type="text"
                            value={editProfile.carNumber}
                            disabled
                            className="flex-1 border border-slate-200 bg-[#f9fafb] text-slate-500 rounded-md px-2 py-1 text-sm cursor-not-allowed"
                        />
                    </div>

                    <div className="mt-3 flex gap-2 justify-end">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-3 py-1.5 text-xs rounded-md border border-slate-300 text-slate-600 hover:bg-[#f9fafb] transition"
                        >
                            취소
                        </button>
                        <button
                            type="button"
                            onClick={onSave}
                            className="px-3 py-1.5 text-xs rounded-md bg-[#174ea6] text-white hover:bg-[#1450c8] transition"
                        >
                            저장
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-1 text-sm text-slate-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full bg-[#e5e7eb] overflow-hidden flex items-center justify-center text-[11px] text-slate-500">
                            {profile.profileImage ? (
                                <img
                                    src={profile.profileImage}
                                    alt={profile.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span>사진</span>
                            )}
                        </div>
                        <div className="text-sm">
                            <div className="font-semibold text-slate-800">
                                {profile.name}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <span>이름</span>
                        <span>{profile.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>학번</span>
                        <span>{profile.studentId}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>차량 번호</span>
                        <span>{profile.carNumber}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>즐겨찾는 건물</span>
                        <span>{profile.favoriteBuilding}</span>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProfilePanel